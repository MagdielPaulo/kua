import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Assinatura } from '../modelos/assinatura.model';
import { SUGESTOES_SERVICOS, SugestaoServico } from '../modelos/assinatura.dados';

@Injectable({ providedIn: 'root' })
export class AssinaturaFormService {

  readonly diasDoMes = Array.from({ length: 31 }, (_, i) => i + 1);

  criarFormulario(fb: FormBuilder, dados?: Assinatura): FormGroup {
    return fb.group({
      nome:           [dados?.nome           ?? '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      categoria:      [dados?.categoria      ?? '', Validators.required],
      valor:          [dados?.valor          ?? null, [Validators.required, Validators.min(0.01), Validators.max(99_999.99)]],
      ciclo_cobranca: [dados?.ciclo_cobranca ?? 'Mensal', Validators.required],
      data_renovacao: [dados?.data_renovacao ?? null],
      is_trial:       [dados?.is_trial       ?? false],
      data_fim_trial: [dados?.data_fim_trial ? dados.data_fim_trial.split('T')[0] : null],
      ativo:          [dados?.ativo          ?? true],
    });
  }

  // Ativa/desativa a validação de data_fim_trial conforme is_trial muda.
  // Retorna a Subscription para que o componente possa cancelá-la no ngOnDestroy.
  configurarValidacaoTrial(form: FormGroup): Subscription {
    return form.get('is_trial')!.valueChanges.subscribe((ehTrial: boolean) => {
      const campo = form.get('data_fim_trial')!;
      if (ehTrial) {
        campo.setValidators([Validators.required]);
      } else {
        campo.clearValidators();
        campo.setValue(null);
      }
      campo.updateValueAndValidity();
    });
  }

  filtrarSugestoes(termo: string): SugestaoServico[] {
    if (termo.length < 2) return [];
    return SUGESTOES_SERVICOS
      .filter(s => s.nome.toLowerCase().includes(termo.toLowerCase()))
      .slice(0, 6);
  }

  campoInvalido(form: FormGroup, campo: string): boolean {
    const c = form.get(campo);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  mensagemErroCampo(form: FormGroup, campo: string): string {
    const erros = form.get(campo)?.errors;
    if (!erros) return '';
    if (erros['required'])   return 'Este campo é obrigatório.';
    if (erros['minlength'])  return `Mínimo de ${erros['minlength'].requiredLength} caracteres.`;
    if (erros['maxlength'])  return `Máximo de ${erros['maxlength'].requiredLength} caracteres.`;
    if (erros['min'])        return 'O valor deve ser maior que zero.';
    return 'Campo inválido.';
  }
}
