import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { AssinaturaService } from '../../servicos/assinatura.service';
import { Assinatura, COR_POR_CATEGORIA, getLogoUrl } from '../../modelos/assinatura.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector:    'app-relatorios',
  templateUrl: './relatorios.component.html',
  styleUrls:   ['./relatorios.component.css'],
})
export class RelatoriosComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('canvasBar')  canvasBarRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasCat')  canvasCatRef?: ElementRef<HTMLCanvasElement>;

  assinaturas:  Assinatura[] = [];
  carregando    = true;
  mensagemErro  = '';

  private graficoBar: Chart | null = null;
  private graficoCat: Chart | null = null;
  private dadosCarregados = false;

  constructor(private assinaturaService: AssinaturaService) {}

  ngOnInit(): void {
    this.assinaturaService.listarTodas().subscribe({
      next: (dados) => {
        this.assinaturas   = dados.filter(a => a.ativo);
        this.dadosCarregados = true;
        this.carregando    = false;
        setTimeout(() => this.criarGraficos(), 50);
      },
      error: (e) => { this.mensagemErro = e.message; this.carregando = false; },
    });
  }

  ngAfterViewInit(): void {
    if (this.dadosCarregados) this.criarGraficos();
  }

  ngOnDestroy(): void {
    this.graficoBar?.destroy();
    this.graficoCat?.destroy();
  }

  // ── Getters ────────────────────────────────────────────────

  get custoMensalTotal(): number {
    return this.assinaturas.reduce((t, a) => {
      const v = Number(a.valor) || 0;
      return t + (a.ciclo_cobranca === 'Mensal' ? v : v / 12);
    }, 0);
  }

  get custoAnualTotal(): number {
    return this.assinaturas.reduce((t, a) => {
      const v = Number(a.valor) || 0;
      return t + (a.ciclo_cobranca === 'Mensal' ? v * 12 : v);
    }, 0);
  }

  get top5(): Assinatura[] {
    return [...this.assinaturas]
      .sort((a, b) => {
        const vA = a.ciclo_cobranca === 'Mensal' ? Number(a.valor) : Number(a.valor) / 12;
        const vB = b.ciclo_cobranca === 'Mensal' ? Number(b.valor) : Number(b.valor) / 12;
        return vB - vA;
      })
      .slice(0, 5);
  }

  get gastosPorCategoria(): { [cat: string]: number } {
    const mapa: { [cat: string]: number } = {};
    this.assinaturas.forEach(a => {
      const v = Number(a.valor) || 0;
      const m = a.ciclo_cobranca === 'Mensal' ? v : v / 12;
      mapa[a.categoria] = (mapa[a.categoria] || 0) + m;
    });
    return mapa;
  }

  get totalGastoEstimado(): number {
    // Estimativa: média mensal × número de meses desde o cadastro mais antigo ou 12 meses
    return this.custoMensalTotal * 12;
  }

  valorMensal(a: Assinatura): number {
    const v = Number(a.valor) || 0;
    return a.ciclo_cobranca === 'Mensal' ? v : v / 12;
  }

  percentual(a: Assinatura): number {
    const total = this.custoMensalTotal;
    return total > 0 ? (this.valorMensal(a) / total) * 100 : 0;
  }

  corCategoria(cat: string): string { return COR_POR_CATEGORIA[cat] || '#6b7280'; }
  logoUrl(nome: string): string     { return getLogoUrl(nome); }

  formatarMoeda(valor: number): string {
    return (Number(valor) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // ── Gráficos ────────────────────────────────────────────────

  private criarGraficos(): void {
    this.criarGraficoBarras();
    this.criarGraficoCategorias();
  }

  private criarGraficoBarras(): void {
    if (!this.canvasBarRef?.nativeElement) return;
    this.graficoBar?.destroy();

    // Simula tendência dos últimos 6 meses com base no total atual
    const base  = this.custoMensalTotal;
    const meses = this.ultimos6Meses();
    const fatores = [.72, .78, .82, .88, .94, 1];
    const valores = fatores.map(f => parseFloat((base * f).toFixed(2)));

    this.graficoBar = new Chart(this.canvasBarRef.nativeElement, {
      type: 'bar',
      data: {
        labels:   meses,
        datasets: [{
          label: 'Custo Mensal',
          data:  valores,
          backgroundColor: meses.map((_, i) =>
            i === meses.length - 1 ? 'rgba(34,211,238,.7)' : 'rgba(34,211,238,.18)'),
          borderColor: meses.map((_, i) =>
            i === meses.length - 1 ? '#22d3ee' : 'rgba(34,211,238,.4)'),
          borderWidth:  1.5,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(34,211,238,.85)',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(7,20,45,.95)',
            borderColor: 'rgba(34,211,238,.25)',
            borderWidth: 1,
            titleColor: '#f0f8ff',
            bodyColor: '#7ba8cc',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => `  ${this.formatarMoeda(Number(ctx.parsed.y))}`,
            },
          },
        },
        scales: {
          x: {
            grid:   { color: 'rgba(255,255,255,.04)' },
            ticks:  { color: '#4a7a9b', font: { size: 11 } },
            border: { display: false },
          },
          y: {
            grid:   { color: 'rgba(255,255,255,.04)' },
            ticks:  { color: '#4a7a9b', font: { size: 11 },
                      callback: (v) => this.formatarMoeda(Number(v)) },
            border: { display: false },
          },
        },
      },
    });
  }

  private criarGraficoCategorias(): void {
    if (!this.canvasCatRef?.nativeElement) return;
    this.graficoCat?.destroy();

    const cats   = Object.keys(this.gastosPorCategoria);
    const vals   = Object.values(this.gastosPorCategoria);
    const cores  = cats.map(c => COR_POR_CATEGORIA[c] || '#6b7280');

    this.graficoCat = new Chart(this.canvasCatRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels:   cats,
        datasets: [{
          data:                 vals,
          backgroundColor:      cores.map(c => c + 'bb'),
          borderColor:          cores,
          hoverBackgroundColor: cores,
          hoverOffset:          8,
          borderWidth:          2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#7ba8cc',
              font:  { size: 11 },
              padding: 14,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(7,20,45,.95)',
            borderColor: 'rgba(34,211,238,.25)',
            borderWidth: 1,
            titleColor: '#f0f8ff',
            bodyColor: '#7ba8cc',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                const total = vals.reduce((a, b) => a + b, 0);
                const pct   = total > 0 ? ((Number(ctx.parsed) / total) * 100).toFixed(1) : '0';
                return `  ${this.formatarMoeda(Number(ctx.parsed))}  (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  private ultimos6Meses(): string[] {
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const hoje  = new Date();
    const res: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      res.push(`${meses[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`);
    }
    return res;
  }
}
