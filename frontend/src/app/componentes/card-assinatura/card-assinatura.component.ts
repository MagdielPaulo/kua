import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Assinatura }                              from '../../modelos/assinatura.model';
import { COR_POR_CATEGORIA, getLogoUrl, getAvatarGradient } from '../../modelos/assinatura.dados';
import { formatarMoeda, formatarData, calcularDiasRestantes, formatarPrazo } from '../../utilitarios/assinatura.utils';

@Component({
  selector:    'app-card-assinatura',
  templateUrl: './card-assinatura.component.html',
  styleUrls:   ['./card-assinatura.component.css'],
})
export class CardAssinaturaComponent {

  @Input() assinatura!: Assinatura;
  @Input() diasParaRenovacao?: number;
  @Output() clicado = new EventEmitter<void>();

  aoClicar(): void { this.clicado.emit(); }

  get corCategoria(): string {
    return COR_POR_CATEGORIA[this.assinatura.categoria] ?? '#6b7280';
  }

  get logoUrl(): string {
    return this.assinatura.icone_url || getLogoUrl(this.assinatura.nome);
  }

  get avatarGradient(): [string, string] {
    return getAvatarGradient(this.assinatura.nome);
  }

  get valorMensalEquivalente(): number {
    const v = Number(this.assinatura.valor) || 0;
    return this.assinatura.ciclo_cobranca === 'Anual' ? v / 12 : v;
  }

  get diasRestantesTrial(): number {
    return this.assinatura.data_fim_trial
      ? calcularDiasRestantes(this.assinatura.data_fim_trial)
      : 0;
  }

  get trialExpirando(): boolean {
    const dias = this.diasRestantesTrial;
    return this.assinatura.is_trial && dias >= 0 && dias <= 3;
  }

  get labelRenovacao(): string {
    return this.diasParaRenovacao !== undefined
      ? formatarPrazo(this.diasParaRenovacao)
      : '';
  }

  logoErro(img: HTMLImageElement): void {
    img.style.display = 'none';
    const fallback = img.parentElement?.querySelector<HTMLElement>('.logo-avatar');
    if (fallback) fallback.style.display = 'flex';
  }

  formatarMoeda = formatarMoeda;
  formatarData  = formatarData;
}
