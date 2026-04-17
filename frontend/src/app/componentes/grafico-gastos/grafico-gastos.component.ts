import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables, Plugin } from 'chart.js';

import { Assinatura, COR_POR_CATEGORIA, getLogoUrl } from '../../modelos/assinatura.model';

Chart.register(...registerables);

const pluginCentro: Plugin<'doughnut'> = {
  id: 'pluginCentro',
  afterDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;

    const dataset = chart.data.datasets?.[0];
    if (!dataset) return;
    const total = (dataset.data as number[])
      .reduce((acc, v) => acc + (Number(v) || 0), 0);

    const selecionado = (chart as any)._categoriaAtiva as string | null;
    const labelTop = selecionado ? selecionado.toUpperCase() : 'MENSAL';

    let valorExibir = total;
    if (selecionado) {
      const idx = (chart.data.labels as string[]).indexOf(selecionado);
      if (idx >= 0) valorExibir = Number(dataset.data[idx]) || 0;
    }

    const formatado = valorExibir.toLocaleString('pt-BR', {
      style: 'currency', currency: 'BRL',
    });

    ctx.save();
    ctx.font = '600 10px Inter, sans-serif';
    ctx.fillStyle = selecionado ? '#22d3ee' : '#4a7a9b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelTop, cx, cy - 13);

    const grad = ctx.createLinearGradient(cx - 40, 0, cx + 40, 0);
    grad.addColorStop(0, selecionado ? '#22d3ee' : '#3b82f6');
    grad.addColorStop(1, selecionado ? '#67e8f9' : '#00d4ff');

    ctx.font = '800 15px Inter, sans-serif';
    ctx.fillStyle = grad;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(formatado, cx, cy + 7);
    ctx.restore();
  },
};

const PALETA: Record<string, [string, string]> = {
  Streaming: ['#a855f7', '#c084fc'],
  IA:        ['#00d4ff', '#67e8f9'],
  Educação:  ['#00e5a0', '#6ee7b7'],
  Software:  ['#f59e0b', '#fcd34d'],
  Jogos:     ['#ff4d6a', '#ff8fa3'],
  Saúde:     ['#f472b6', '#f9a8d4'],
  Finanças:  ['#14b8a6', '#5eead4'],
  Outros:    ['#4a7a9b', '#7ba8cc'],
};

@Component({
  selector:    'app-grafico-gastos',
  templateUrl: './grafico-gastos.component.html',
  styleUrls:   ['./grafico-gastos.component.css'],
})
export class GraficoGastosComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() gastosPorCategoria: { [categoria: string]: number } = {};
  @Input() assinaturas: Assinatura[] = [];

  @ViewChild('canvasGrafico') canvasRef!: ElementRef<HTMLCanvasElement>;

  private grafico: Chart<'doughnut'> | null = null;

  segmentoAtivo: string | null = null;

  get assinaturasDaCategoria(): Assinatura[] {
    if (!this.segmentoAtivo) return [];
    return this.assinaturas.filter(a => a.categoria === this.segmentoAtivo && a.ativo);
  }

  get percentualCategoria(): string {
    if (!this.segmentoAtivo) return '0';
    const total = Object.values(this.gastosPorCategoria).reduce((a, b) => a + b, 0);
    const val   = this.gastosPorCategoria[this.segmentoAtivo] || 0;
    return total > 0 ? ((val / total) * 100).toFixed(1) : '0';
  }

  ngAfterViewInit(): void {
    this.criarOuAtualizarGrafico();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gastosPorCategoria'] && !changes['gastosPorCategoria'].firstChange) {
      this.segmentoAtivo = null;
      this.criarOuAtualizarGrafico();
    }
  }

  ngOnDestroy(): void {
    this.destruirGrafico();
  }

  fecharDetalhe(): void {
    this.segmentoAtivo = null;
    this.atualizarOffsets();
  }

  valorMensal(a: Assinatura): number {
    const v = Number(a.valor) || 0;
    return a.ciclo_cobranca === 'Mensal' ? v : v / 12;
  }

  formatarMoeda(v: number): string {
    return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  logoUrl(nome: string): string { return getLogoUrl(nome); }
  logoErro(img: HTMLImageElement): void { img.style.display = 'none'; }

  corSegmento(cat: string): string {
    return PALETA[cat]?.[0] ?? COR_POR_CATEGORIA[cat] ?? '#4a7a9b';
  }

  private atualizarOffsets(): void {
    if (!this.grafico) return;
    const cats = this.grafico.data.labels as string[];
    (this.grafico.data.datasets[0] as any).offset =
      cats.map(c => c === this.segmentoAtivo ? 18 : 0);
    (this.grafico as any)._categoriaAtiva = this.segmentoAtivo;
    this.grafico.update('active');
  }

  private criarOuAtualizarGrafico(): void {
    if (!this.canvasRef) return;

    const categorias = Object.keys(this.gastosPorCategoria);
    const valores    = Object.values(this.gastosPorCategoria).map(v => Number(v) || 0);

    const coresFundo = categorias.map(c => (PALETA[c]?.[0] ?? COR_POR_CATEGORIA[c] ?? '#4a7a9b') + 'bb');
    const coresBorda = categorias.map(c =>  PALETA[c]?.[0] ?? COR_POR_CATEGORIA[c] ?? '#4a7a9b');
    const coresHover = categorias.map(c =>  PALETA[c]?.[1] ?? COR_POR_CATEGORIA[c] ?? '#7ba8cc');

    this.destruirGrafico();

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      plugins: [pluginCentro],
      data: {
        labels:   categorias,
        datasets: [{
          data:                 valores,
          backgroundColor:      coresFundo,
          borderColor:          coresBorda,
          hoverBackgroundColor: coresHover,
          borderWidth:          2,
          hoverBorderWidth:     3,
          hoverOffset:          6,
          borderAlign:          'inner',
          offset:               new Array(categorias.length).fill(0),
        } as any],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: true,
        cutout:              '68%',
        animation: {
          animateRotate: true,
          animateScale:  true,
          duration:      900,
          easing:        'easeInOutQuart',
        },
        onClick: (_evt, elements) => {
          if (elements.length === 0) {
            this.segmentoAtivo = null;
          } else {
            const idx = elements[0].index;
            const cat = categorias[idx];
            this.segmentoAtivo = this.segmentoAtivo === cat ? null : cat;
          }
          this.atualizarOffsets();
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color:         '#7ba8cc',
              font:          { family: 'Inter', size: 11, weight: 500 },
              padding:       20,
              usePointStyle: true,
              pointStyle:    'circle',
              generateLabels: (chart) => {
                const dados = chart.data;
                if (!dados.labels) return [];
                return (dados.labels as string[]).map((label, i) => {
                  const valor = Number(dados.datasets[0].data[i]) || 0;
                  const total = (dados.datasets[0].data as number[]).reduce((a, b) => a + (Number(b) || 0), 0);
                  const pct   = total > 0 ? ((valor / total) * 100).toFixed(0) : '0';
                  const fmt   = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                  return {
                    text:         `${label}  ${fmt}  (${pct}%)`,
                    fillStyle:    coresFundo[i],
                    strokeStyle:  coresBorda[i],
                    lineWidth:    2,
                    hidden:       false,
                    index:        i,
                    pointStyle:   'circle' as const,
                    fontColor:    '#7ba8cc',
                    datasetIndex: 0,
                  };
                });
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(7, 20, 45, 0.95)',
            borderColor:     'rgba(0, 212, 255, 0.25)',
            borderWidth:     1,
            titleColor:      '#e2f0ff',
            bodyColor:       '#7ba8cc',
            padding:         14,
            cornerRadius:    8,
            titleFont:       { family: 'Inter', size: 13, weight: 700 },
            bodyFont:        { family: 'Inter', size: 12 },
            callbacks: {
              label: (ctx) => {
                const valor = Number(ctx.parsed) || 0;
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + (Number(b) || 0), 0);
                const fmt   = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const pct   = total > 0 ? ((valor / total) * 100).toFixed(1) : '0.0';
                return `  ${fmt}  —  ${pct}%`;
              },
              afterLabel: () => '  Clique para ver detalhes',
            },
          },
        },
      },
    };

    this.grafico = new Chart(this.canvasRef.nativeElement, config);
    (this.grafico as any)._categoriaAtiva = null;
  }

  private destruirGrafico(): void {
    if (this.grafico) {
      this.grafico.destroy();
      this.grafico = null;
    }
  }

  get totalMensal(): string {
    const total = Object.values(this.gastosPorCategoria).reduce((a, b) => a + (Number(b) || 0), 0);
    return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  get temDados(): boolean {
    return Object.keys(this.gastosPorCategoria).length > 0;
  }

  get quantidadeCategorias(): number {
    return Object.keys(this.gastosPorCategoria).length;
  }
}
