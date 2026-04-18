import { Component, OnInit } from '@angular/core';
import { AssinaturaService } from '../../servicos/assinatura.service';
import { Assinatura } from '../../modelos/assinatura.model';
import { COR_POR_CATEGORIA, getLogoUrl } from '../../modelos/assinatura.dados';
import { Router } from '@angular/router';

interface EventoCalendario {
  dia:         number;
  assinaturas: Assinatura[];
}

interface SemanaCalendario {
  dias: (number | null)[];
}

@Component({
  selector:    'app-pagamentos',
  templateUrl: './pagamentos.component.html',
  styleUrls:   ['./pagamentos.component.css'],
})
export class PagamentosComponent implements OnInit {

  assinaturas:  Assinatura[] = [];
  carregando    = true;
  mensagemErro  = '';

  mesAtual:  number;
  anoAtual:  number;
  hoje:      number;

  readonly MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  readonly DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  constructor(
    private assinaturaService: AssinaturaService,
    private router: Router,
  ) {
    const agora    = new Date();
    this.mesAtual  = agora.getMonth();
    this.anoAtual  = agora.getFullYear();
    this.hoje      = agora.getDate();
  }

  ngOnInit(): void {
    this.assinaturaService.listarTodas().subscribe({
      next: (dados) => {
        this.assinaturas = dados.filter(a => a.ativo);
        this.carregando  = false;
      },
      error: (erro) => { this.mensagemErro = erro.message; this.carregando = false; },
    });
  }

  // ── Calendário ─────────────────────────────────────────────

  get nomeMesAtual(): string {
    return `${this.MESES[this.mesAtual]} ${this.anoAtual}`;
  }

  get semanas(): SemanaCalendario[] {
    const primeiroDia = new Date(this.anoAtual, this.mesAtual, 1).getDay();
    const diasNoMes   = new Date(this.anoAtual, this.mesAtual + 1, 0).getDate();

    const celulas: (number | null)[] = [
      ...Array(primeiroDia).fill(null),
      ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
    ];

    const semanas: SemanaCalendario[] = [];
    for (let i = 0; i < celulas.length; i += 7) {
      semanas.push({ dias: celulas.slice(i, i + 7).concat(Array(7).fill(null)).slice(0, 7) });
    }
    return semanas;
  }

  assinaturasDoDia(dia: number | null): Assinatura[] {
    if (!dia) return [];
    return this.assinaturas.filter(a => a.data_renovacao === dia);
  }

  corDia(dia: number | null): string {
    if (!dia) return '';
    const lista = this.assinaturasDoDia(dia);
    if (!lista.length) return '';
    return COR_POR_CATEGORIA[lista[0].categoria] || '#22d3ee';
  }

  ehHoje(dia: number | null): boolean {
    return dia === this.hoje &&
           this.mesAtual === new Date().getMonth() &&
           this.anoAtual === new Date().getFullYear();
  }

  mesAnterior(): void {
    if (this.mesAtual === 0) { this.mesAtual = 11; this.anoAtual--; }
    else this.mesAtual--;
  }

  proximoMes(): void {
    if (this.mesAtual === 11) { this.mesAtual = 0; this.anoAtual++; }
    else this.mesAtual++;
  }

  // ── Timeline ────────────────────────────────────────────────

  get eventosMes(): EventoCalendario[] {
    const mapa: { [dia: number]: Assinatura[] } = {};
    this.assinaturas.forEach(a => {
      if (a.data_renovacao) {
        mapa[a.data_renovacao] = [...(mapa[a.data_renovacao] || []), a];
      }
    });
    return Object.entries(mapa)
      .map(([dia, lista]) => ({ dia: Number(dia), assinaturas: lista }))
      .sort((a, b) => {
        const dA = this.diasAteVencimento(a.dia);
        const dB = this.diasAteVencimento(b.dia);
        return dA - dB;
      })
      .filter(e => this.diasAteVencimento(e.dia) >= 0)
      .slice(0, 20);
  }

  diasAteVencimento(diaRenovacao: number): number {
    const hoje = new Date();
    const diaH = hoje.getDate(), mes = hoje.getMonth(), ano = hoje.getFullYear();
    let data   = new Date(ano, mes, diaRenovacao);
    if (diaRenovacao < diaH) data = new Date(ano, mes + 1, diaRenovacao);
    hoje.setHours(0,0,0,0); data.setHours(0,0,0,0);
    return Math.ceil((data.getTime() - hoje.getTime()) / 86400000);
  }

  totalDoDia(assinaturas: Assinatura[]): number {
    return assinaturas.reduce((t, a) => {
      const v = Number(a.valor) || 0;
      return t + (a.ciclo_cobranca === 'Mensal' ? v : v / 12);
    }, 0);
  }

  formatarMoeda(valor: number): string {
    return (Number(valor) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  corCategoria(cat: string): string { return COR_POR_CATEGORIA[cat] || '#6b7280'; }
  logoUrl(nome: string): string     { return getLogoUrl(nome); }

  irParaDetalhes(id?: number): void {
    if (id) this.router.navigate(['/assinatura', id]);
  }
}
