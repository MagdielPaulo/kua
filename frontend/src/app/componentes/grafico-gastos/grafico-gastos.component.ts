/**
 * Componente Gráfico de Gastos
 * Gráfico de rosca futurista com gradientes, plugin de texto central e animações suaves.
 */
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

import { COR_POR_CATEGORIA } from '../../modelos/assinatura.model';

Chart.register(...registerables);

// ── Plugin: texto no centro da rosca ──────────────────────────
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

    const formatado = total.toLocaleString('pt-BR', {
      style: 'currency', currency: 'BRL',
    });

    ctx.save();

    // Label "MENSAL"
    ctx.font = '600 10px Inter, sans-serif';
    ctx.fillStyle = '#4a7a9b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MENSAL', cx, cy - 13);

    // Valor total com gradiente
    const grad = ctx.createLinearGradient(cx - 40, 0, cx + 40, 0);
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(1, '#00d4ff');

    ctx.font = '800 15px Inter, sans-serif';
    ctx.fillStyle = grad;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(formatado, cx, cy + 7);

    ctx.restore();
  },
};

// Paleta futurista: cada categoria tem cor base + versão clara para hover
const PALETA: Record<string, [string, string]> = {
  Streaming:  ['#a855f7', '#c084fc'],
  IA:         ['#00d4ff', '#67e8f9'],
  Educação:   ['#00e5a0', '#6ee7b7'],
  Software:   ['#f59e0b', '#fcd34d'],
  Jogos:      ['#ff4d6a', '#ff8fa3'],
  Saúde:      ['#f472b6', '#f9a8d4'],
  Finanças:   ['#14b8a6', '#5eead4'],
  Outros:     ['#4a7a9b', '#7ba8cc'],
};

@Component({
  selector:    'app-grafico-gastos',
  templateUrl: './grafico-gastos.component.html',
  styleUrls:   ['./grafico-gastos.component.css'],
})
export class GraficoGastosComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() gastosPorCategoria: { [categoria: string]: number } = {};

  @ViewChild('canvasGrafico') canvasRef!: ElementRef<HTMLCanvasElement>;

  private grafico: Chart<'doughnut'> | null = null;

  ngAfterViewInit(): void {
    this.criarOuAtualizarGrafico();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gastosPorCategoria'] && !changes['gastosPorCategoria'].firstChange) {
      this.criarOuAtualizarGrafico();
    }
  }

  ngOnDestroy(): void {
    this.destruirGrafico();
  }

  private criarOuAtualizarGrafico(): void {
    if (!this.canvasRef) return;

    const categorias = Object.keys(this.gastosPorCategoria);
    const valores    = Object.values(this.gastosPorCategoria).map(v => Number(v) || 0);

    const coresFundo  = categorias.map(c => (PALETA[c]?.[0] ?? COR_POR_CATEGORIA[c] ?? '#4a7a9b') + 'bb');
    const coresBorda  = categorias.map(c =>  PALETA[c]?.[0] ?? COR_POR_CATEGORIA[c] ?? '#4a7a9b');
    const coresHover  = categorias.map(c =>  PALETA[c]?.[1] ?? COR_POR_CATEGORIA[c] ?? '#7ba8cc');

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
          hoverOffset:          10,
          borderAlign:          'inner',
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: true,
        cutout:              '68%',
        animation: {
          animateRotate:  true,
          animateScale:   true,
          duration:       900,
          easing:         'easeInOutQuart',
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
            },
          },
        },
      },
    };

    this.grafico = new Chart(this.canvasRef.nativeElement, config);
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
