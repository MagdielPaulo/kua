/**
 * Componente Dashboard — Tela Principal
 * Exibe o resumo financeiro, alertas de trial e lista de assinaturas.
 * Calcula os totais mensal e anual e prepara os dados para o gráfico.
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AssinaturaService }             from '../../servicos/assinatura.service';
import { Assinatura, COR_POR_CATEGORIA } from '../../modelos/assinatura.model';

@Component({
  selector:    'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls:   ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  // Expõe Object para uso no template HTML
  readonly Object = Object;

  // Estado da lista de assinaturas
  assinaturas:  Assinatura[] = [];
  carregando    = true;
  mensagemErro  = '';

  // Listas derivadas processadas após o carregamento
  trialsExpirandoLogo:   Assinatura[] = []; // Trials que expiram em ≤ 3 dias
  fatutasProximas15Dias: Assinatura[] = []; // Vencimentos nos próximos 15 dias

  // Dados formatados para o componente de gráfico
  gastosPorCategoria: { [categoria: string]: number } = {};

  constructor(
    private assinaturaService: AssinaturaService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  // ─────────────────────────────────────────────────────────
  // Carrega todas as assinaturas da API e processa os dados
  // ─────────────────────────────────────────────────────────
  carregarDados(): void {
    this.carregando   = true;
    this.mensagemErro = '';

    this.assinaturaService.listarTodas().subscribe({
      next: (dados: Assinatura[]) => {
        // Filtra apenas assinaturas ativas
        this.assinaturas = dados.filter(a => a.ativo);
        this.processarDadosDerivados();
        this.carregando = false;
      },
      error: (erro: Error) => {
        this.mensagemErro = erro.message;
        this.carregando   = false;
      },
    });
  }

  // ─────────────────────────────────────────────────────────
  // Processa listas e agregados a partir das assinaturas carregadas
  // ─────────────────────────────────────────────────────────
  private processarDadosDerivados(): void {

    // 1. Trials que expiram em ≤ 3 dias (ordenados pelo mais urgente)
    this.trialsExpirandoLogo = this.assinaturas
      .filter(a => {
        if (!a.is_trial || !a.data_fim_trial) return false;
        const dias = this.calcularDiasParaExpirar(a.data_fim_trial);
        return dias >= 0 && dias <= 3;
      })
      .sort((a, b) =>
        this.calcularDiasParaExpirar(a.data_fim_trial!) -
        this.calcularDiasParaExpirar(b.data_fim_trial!)
      );

    // 2. Faturas com vencimento nos próximos 15 dias
    this.fatutasProximas15Dias = this.assinaturas
      .filter(a => {
        if (!a.data_renovacao) return false;
        const dias = this.calcularDiasParaRenovacao(a.data_renovacao);
        return dias >= 0 && dias <= 15;
      })
      .sort((a, b) =>
        this.calcularDiasParaRenovacao(a.data_renovacao!) -
        this.calcularDiasParaRenovacao(b.data_renovacao!)
      );

    // 3. Agrupa o custo mensal por categoria (para o gráfico de pizza)
    this.gastosPorCategoria = {};
    this.assinaturas.forEach(a => {
      const v = Number(a.valor) || 0;
      const valorMensal = a.ciclo_cobranca === 'Mensal' ? v : v / 12;
      this.gastosPorCategoria[a.categoria] =
        (this.gastosPorCategoria[a.categoria] || 0) + valorMensal;
    });
  }

  // ─────────────────────────────────────────────────────────
  // Getters calculados para os totais financeiros
  // ─────────────────────────────────────────────────────────

  /** Soma do custo mensal de todas as assinaturas ativas */
  get custoMensalTotal(): number {
    return this.assinaturas.reduce((total, a) => {
      const v = Number(a.valor) || 0;
      return total + (a.ciclo_cobranca === 'Mensal' ? v : v / 12);
    }, 0);
  }

  /** Projeção do custo anual (mensais × 12 + anuais) */
  get custoAnualProjetado(): number {
    return this.assinaturas.reduce((total, a) => {
      const v = Number(a.valor) || 0;
      return total + (a.ciclo_cobranca === 'Mensal' ? v * 12 : v);
    }, 0);
  }

  /** Número de assinaturas que são free trials ativos */
  get quantidadeTrials(): number {
    return this.assinaturas.filter(a => a.is_trial).length;
  }

  // ─────────────────────────────────────────────────────────
  // Utilitários de cálculo de datas
  // ─────────────────────────────────────────────────────────

  /** Retorna quantos dias faltam para a data de expiração do trial */
  calcularDiasParaExpirar(dataFimTrial: string): number {
    const hoje    = new Date();
    const dataFim = new Date(dataFimTrial);
    hoje.setHours(0, 0, 0, 0);
    dataFim.setHours(0, 0, 0, 0);
    return Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  }

  /** Retorna quantos dias faltam para o próximo vencimento da assinatura */
  calcularDiasParaRenovacao(diaRenovacao: number): number {
    const hoje    = new Date();
    const diaAtual = hoje.getDate();
    const mes     = hoje.getMonth();
    const ano     = hoje.getFullYear();

    // Se o dia de renovação já passou neste mês, usa o mês seguinte
    let dataRenovacao = new Date(ano, mes, diaRenovacao);
    if (diaRenovacao < diaAtual) {
      dataRenovacao = new Date(ano, mes + 1, diaRenovacao);
    }

    hoje.setHours(0, 0, 0, 0);
    dataRenovacao.setHours(0, 0, 0, 0);
    return Math.ceil((dataRenovacao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  }

  // ─────────────────────────────────────────────────────────
  // Formatação e helpers de template
  // ─────────────────────────────────────────────────────────

  /** Formata um número como moeda brasileira (R$ 1.234,56) */
  formatarMoeda(valor: number): string {
    return (Number(valor) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  /** Retorna a cor CSS da categoria */
  corDaCategoria(categoria: string): string {
    return COR_POR_CATEGORIA[categoria] || '#6b7280';
  }

  /** Retorna classe CSS de urgência baseada nos dias restantes do trial */
  classeTrial(diasRestantes: number): string {
    if (diasRestantes === 0) return 'urgente';
    if (diasRestantes <= 1)  return 'critico';
    return 'aviso';
  }

  // ─────────────────────────────────────────────────────────
  // Navegação
  // ─────────────────────────────────────────────────────────

  navegarParaDetalhes(id: number | undefined): void {
    if (id !== undefined) this.router.navigate(['/assinatura', id]);
  }

  navegarParaNovaAssinatura(): void {
    this.router.navigate(['/nova-assinatura']);
  }
}
