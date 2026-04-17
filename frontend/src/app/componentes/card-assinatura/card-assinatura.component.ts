/**
 * Componente Card de Assinatura
 * Exibe as informações resumidas de uma assinatura em formato de card.
 * Recebe os dados via @Input e emite um evento @Output ao ser clicado.
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Assinatura, COR_POR_CATEGORIA } from '../../modelos/assinatura.model';

@Component({
  selector:    'app-card-assinatura',
  templateUrl: './card-assinatura.component.html',
  styleUrls:   ['./card-assinatura.component.css'],
})
export class CardAssinaturaComponent {

  /** Dados da assinatura a ser exibida */
  @Input() assinatura!: Assinatura;

  /** Dias até o próximo vencimento (opcional, calculado pelo pai) */
  @Input() diasParaRenovacao?: number;

  /** Evento emitido quando o usuário clica no card */
  @Output() clicado = new EventEmitter<void>();

  // Chama o evento ao clicar no card
  aoClicar(): void {
    this.clicado.emit();
  }

  /** Retorna a cor CSS correspondente à categoria da assinatura */
  get corCategoria(): string {
    return COR_POR_CATEGORIA[this.assinatura.categoria] || '#6b7280';
  }

  /** Calcula o valor mensal equivalente (para assinaturas anuais) */
  get valorMensalEquivalente(): number {
    const v = Number(this.assinatura.valor) || 0;
    return this.assinatura.ciclo_cobranca === 'Anual' ? v / 12 : v;
  }

  /** Verifica se o trial expira em breve (≤ 3 dias) */
  get trialExpirando(): boolean {
    if (!this.assinatura.is_trial || !this.assinatura.data_fim_trial) return false;
    const hoje    = new Date();
    const dataFim = new Date(this.assinatura.data_fim_trial);
    hoje.setHours(0, 0, 0, 0);
    dataFim.setHours(0, 0, 0, 0);
    const dias = Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return dias >= 0 && dias <= 3;
  }

  /** Dias restantes até o fim do trial */
  get diasRestantesTrial(): number {
    if (!this.assinatura.data_fim_trial) return 0;
    const hoje    = new Date();
    const dataFim = new Date(this.assinatura.data_fim_trial);
    hoje.setHours(0, 0, 0, 0);
    dataFim.setHours(0, 0, 0, 0);
    return Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  }

  /** Formata um número como moeda brasileira */
  formatarMoeda(valor: number): string {
    return (Number(valor) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  /** Formata uma data ISO em formato legível (dd/mm/aaaa) */
  formatarData(dataIso: string): string {
    const data = new Date(dataIso + 'T12:00:00'); // Evita problema de fuso horário
    return data.toLocaleDateString('pt-BR');
  }
}
