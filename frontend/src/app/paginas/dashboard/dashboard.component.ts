import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { AssinaturaService }             from '../../servicos/assinatura.service';
import { Assinatura } from '../../modelos/assinatura.model';
import { COR_POR_CATEGORIA } from '../../modelos/assinatura.dados';

@Component({
  selector:    'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls:   ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly Object = Object;

  assinaturas:  Assinatura[] = [];
  carregando    = true;
  mensagemErro  = '';

  trialsExpirandoLogo:   Assinatura[] = [];
  fatutasProximas15Dias: Assinatura[] = [];
  gastosPorCategoria: { [categoria: string]: number } = {};

  // Sparkline paths (decorativos, baseados em tendência sintética)
  sparklineMensalLine  = '';
  sparklineMensalArea  = '';
  sparklineAnualLine   = '';
  sparklineAnualArea   = '';
  sparklineAtivosLine  = '';
  sparklineAtivosArea  = '';

  // Area Chart overlay
  overlayAberto: 'mensal' | 'anual' | 'ativos' | null = null;
  areaChartLineMensal = '';
  areaChartAreaMensal = '';
  areaChartTicks: { label: string; x: number }[] = [];
  areaChartValorTicks: { label: string; y: number }[] = [];

  @ViewChild('canvas3d') private canvasRef?: ElementRef<HTMLCanvasElement>;

  private animFrameId  = 0;
  private mouseX       = 0;
  private mouseY       = 0;
  private orbAngle     = 0;

  constructor(
    private assinaturaService: AssinaturaService,
    private router: Router,
  ) {}

  ngOnInit(): void { this.carregarDados(); }

  ngAfterViewInit(): void { this.iniciarOrb(); }

  ngOnDestroy(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    this.mouseX = (e.clientX - cx) / cx;
    this.mouseY = (e.clientY - cy) / cy;
  }

  // ── Dados ──────────────────────────────────────────────────

  carregarDados(): void {
    this.carregando   = true;
    this.mensagemErro = '';

    this.assinaturaService.listarTodas().subscribe({
      next: (dados: Assinatura[]) => {
        this.assinaturas = dados.filter(a => a.ativo);
        this.processarDadosDerivados();
        this.gerarSparklines();
        this.carregando = false;
        setTimeout(() => this.iniciarOrb(), 80);
      },
      error: (erro: Error) => {
        this.mensagemErro = erro.message;
        this.carregando   = false;
      },
    });
  }

  private processarDadosDerivados(): void {
    this.trialsExpirandoLogo = this.assinaturas
      .filter(a => {
        if (!a.is_trial || !a.data_fim_trial) return false;
        const d = this.calcularDiasParaExpirar(a.data_fim_trial);
        return d >= 0 && d <= 3;
      })
      .sort((a, b) =>
        this.calcularDiasParaExpirar(a.data_fim_trial!) -
        this.calcularDiasParaExpirar(b.data_fim_trial!)
      );

    this.fatutasProximas15Dias = this.assinaturas
      .filter(a => {
        if (!a.data_renovacao) return false;
        const d = this.calcularDiasParaRenovacao(a.data_renovacao);
        return d >= 0 && d <= 15;
      })
      .sort((a, b) =>
        this.calcularDiasParaRenovacao(a.data_renovacao!) -
        this.calcularDiasParaRenovacao(b.data_renovacao!)
      );

    this.gastosPorCategoria = {};
    this.assinaturas.forEach(a => {
      const v = Number(a.valor) || 0;
      const mensal = a.ciclo_cobranca === 'Mensal' ? v : v / 12;
      this.gastosPorCategoria[a.categoria] =
        (this.gastosPorCategoria[a.categoria] || 0) + mensal;
    });
  }

  // ── Getters ────────────────────────────────────────────────

  get custoMensalTotal(): number {
    return this.assinaturas.reduce((t, a) => {
      const v = Number(a.valor) || 0;
      return t + (a.ciclo_cobranca === 'Mensal' ? v : v / 12);
    }, 0);
  }

  get custoAnualProjetado(): number {
    return this.assinaturas.reduce((t, a) => {
      const v = Number(a.valor) || 0;
      return t + (a.ciclo_cobranca === 'Mensal' ? v * 12 : v);
    }, 0);
  }

  get quantidadeTrials(): number {
    return this.assinaturas.filter(a => a.is_trial).length;
  }

  // ── Sparklines ─────────────────────────────────────────────

  private gerarSparklines(): void {
    const total = this.custoMensalTotal;
    // Tendência: últimos 8 pontos com variação sintética baseada no valor real
    const seed = (base: number, variacao: number[]) =>
      variacao.map(v => Math.max(0, base * v));

    const pontosM = seed(total, [.55,.62,.58,.70,.67,.78,.88,1]);
    const pontosA = seed(this.custoAnualProjetado, [.50,.58,.55,.65,.70,.75,.85,1]);
    const pontosC = [
      Math.max(1, this.assinaturas.length - 4),
      Math.max(1, this.assinaturas.length - 3),
      Math.max(1, this.assinaturas.length - 3),
      Math.max(1, this.assinaturas.length - 2),
      Math.max(1, this.assinaturas.length - 2),
      Math.max(1, this.assinaturas.length - 1),
      this.assinaturas.length,
      this.assinaturas.length,
    ];

    [this.sparklineMensalLine, this.sparklineMensalArea]  = this.calcSparkline(pontosM);
    [this.sparklineAnualLine,  this.sparklineAnualArea]   = this.calcSparkline(pontosA);
    [this.sparklineAtivosLine, this.sparklineAtivosArea]  = this.calcSparkline(pontosC);

    this.gerarAreaChart(pontosM);
  }

  private gerarAreaChart(pontos: number[]): void {
    const W = 560, H = 160;
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul'];
    const step  = W / (pontos.length - 1);
    const min   = Math.min(...pontos);
    const max   = Math.max(...pontos) || 1;
    const range = max - min;

    const coords = pontos.map((p, i) => ({
      x: i * step,
      y: H - ((p - min) / range) * (H - 16) - 8,
    }));

    const line = coords.map((p, i) => {
      if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      const prev = coords[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `C ${cx.toFixed(1)} ${prev.y.toFixed(1)}, ${cx.toFixed(1)} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }).join(' ');

    this.areaChartLineMensal = line;
    this.areaChartAreaMensal = `${line} L ${W} ${H} L 0 ${H} Z`;

    this.areaChartTicks = pontos.map((_, i) => ({
      label: meses[i] || `M${i+1}`,
      x: i * step,
    }));

    const valorTicks = 4;
    this.areaChartValorTicks = Array.from({ length: valorTicks }, (_, i) => {
      const v = min + (range / (valorTicks - 1)) * i;
      return { label: this.formatarMoeda(v), y: H - ((v - min) / range) * (H - 16) - 8 };
    });
  }

  abrirOverlay(tipo: 'mensal' | 'anual' | 'ativos'): void {
    this.overlayAberto = tipo;
  }

  fecharOverlay(): void {
    this.overlayAberto = null;
  }

  private calcSparkline(pts: number[], w = 120, h = 36): [string, string] {
    const min   = Math.min(...pts);
    const max   = Math.max(...pts);
    const range = max - min || 1;
    const step  = w / (pts.length - 1);
    const coords = pts.map((p, i) => ({
      x: i * step,
      y: h - ((p - min) / range) * (h - 6) - 3,
    }));

    const smooth = (p: {x:number,y:number}, i: number, arr: {x:number,y:number}[]) => {
      if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      const prev = arr[i - 1];
      const cx   = (prev.x + p.x) / 2;
      return `C ${cx.toFixed(1)} ${prev.y.toFixed(1)}, ${cx.toFixed(1)} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    };

    const line = coords.map(smooth).join(' ');
    const area = `${line} L ${w} ${h} L 0 ${h} Z`;
    return [line, area];
  }

  // ── Canvas 3D Orb ──────────────────────────────────────────

  private iniciarOrb(): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    if (!canvas) return;

    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const ctx    = canvas.getContext('2d')!;
    const W      = canvas.width;
    const H      = canvas.height;
    const cx     = W / 2;
    const cy     = H / 2;

    // Partículas do campo ao redor
    const particulas = Array.from({ length: 28 }, () => ({
      x: (Math.random() - .5) * W * .85 + cx,
      y: (Math.random() - .5) * H * .85 + cy,
      r: Math.random() * 1.4 + .3,
      a: Math.random() * Math.PI * 2,
      v: (Math.random() - .5) * .008,
    }));

    const render = () => {
      ctx.clearRect(0, 0, W, H);

      this.orbAngle += .008 + Math.abs(this.mouseX) * .006;
      const tilt = this.mouseY * .35;
      const lean = this.mouseX * .25;

      // --- Esfera central ---
      const grad = ctx.createRadialGradient(cx - 14, cy - 14, 2, cx, cy, 52);
      grad.addColorStop(0,   'rgba(103, 232, 249, .85)');
      grad.addColorStop(.4,  'rgba(34, 211, 238, .55)');
      grad.addColorStop(.75, 'rgba(8,  145, 178, .25)');
      grad.addColorStop(1,   'rgba(2,   6,  23, .0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 52, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Brilho interno
      const inner = ctx.createRadialGradient(cx - 10, cy - 10, 0, cx, cy, 30);
      inner.addColorStop(0,   'rgba(255,255,255,.55)');
      inner.addColorStop(.5,  'rgba(103,232,249,.20)');
      inner.addColorStop(1,   'rgba(103,232,249,.0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.fillStyle = inner;
      ctx.fill();

      // --- Anel orbital 1 ---
      this.desenharAnel(ctx, cx, cy, 82, this.orbAngle, tilt + .55, lean, '#22d3ee', .7);

      // --- Anel orbital 2 (contra-rotação) ---
      this.desenharAnel(ctx, cx, cy, 96, -this.orbAngle * .65, tilt - .3, lean + .4, '#818cf8', .5);

      // --- Partículas ---
      particulas.forEach(p => {
        p.a += p.v;
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(p.a + this.orbAngle * .3) * (p.x - cx) * .08 + (p.x - cx),
          cy + Math.sin(p.a + this.orbAngle * .3) * (p.y - cy) * .08 + (p.y - cy),
          p.r, 0, Math.PI * 2,
        );
        ctx.fillStyle = `rgba(34,211,238,${.15 + Math.abs(Math.sin(p.a)) * .25})`;
        ctx.fill();
      });

      this.animFrameId = requestAnimationFrame(render);
    };

    render();
  }

  private desenharAnel(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number,
    raio: number,
    angulo: number,
    tilt: number,
    lean: number,
    cor: string,
    opacidade: number,
  ): void {
    const pontos = 64;
    const escalaY = Math.abs(Math.cos(tilt)) * .42 + .12;
    const escalaX = Math.abs(Math.cos(lean)) * .92 + .08;

    ctx.beginPath();
    for (let i = 0; i <= pontos; i++) {
      const t = (i / pontos) * Math.PI * 2;
      const x = cx + Math.cos(t + angulo) * raio * escalaX;
      const y = cy + Math.sin(t + angulo) * raio * escalaY;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = cor;
    ctx.globalAlpha = opacidade;
    ctx.lineWidth   = 1.5;
    ctx.shadowColor = cor;
    ctx.shadowBlur  = 8;
    ctx.stroke();

    // Ponto brilhante no anel
    const px = cx + Math.cos(angulo) * raio * escalaX;
    const py = cy + Math.sin(angulo) * raio * escalaY;
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = opacidade * .9;
    ctx.shadowBlur  = 12;
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;
  }

  // ── Utilitários ────────────────────────────────────────────

  calcularDiasParaExpirar(dataFimTrial: string): number {
    const hoje = new Date(); const fim = new Date(dataFimTrial);
    hoje.setHours(0,0,0,0); fim.setHours(0,0,0,0);
    return Math.ceil((fim.getTime() - hoje.getTime()) / 86400000);
  }

  calcularDiasParaRenovacao(diaRenovacao: number): number {
    const hoje = new Date();
    const diaAtual = hoje.getDate();
    const mes = hoje.getMonth(), ano = hoje.getFullYear();
    let data = new Date(ano, mes, diaRenovacao);
    if (diaRenovacao < diaAtual) data = new Date(ano, mes + 1, diaRenovacao);
    hoje.setHours(0,0,0,0); data.setHours(0,0,0,0);
    return Math.ceil((data.getTime() - hoje.getTime()) / 86400000);
  }

  formatarMoeda(valor: number): string {
    return (Number(valor) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  corDaCategoria(categoria: string): string {
    return COR_POR_CATEGORIA[categoria] || '#6b7280';
  }

  classeTrial(dias: number): string {
    if (dias === 0) return 'urgente';
    if (dias <= 1)  return 'critico';
    return 'aviso';
  }

  navegarParaDetalhes(id: number | undefined): void {
    if (id !== undefined) this.router.navigate(['/assinatura', id]);
  }

  navegarParaNovaAssinatura(): void {
    this.router.navigate(['/nova-assinatura']);
  }
}
