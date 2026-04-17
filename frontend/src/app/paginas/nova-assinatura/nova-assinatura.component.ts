/**
 * Componente Nova Assinatura — Formulário de Cadastro
 * Permite ao usuário cadastrar uma nova assinatura ou free trial.
 * Implementa sugestão automática de categoria ao digitar o nome do serviço.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AssinaturaService } from '../../servicos/assinatura.service';
import {
  Assinatura,
  CATEGORIAS,
  SUGESTOES_SERVICOS,
} from '../../modelos/assinatura.model';

@Component({
  selector:    'app-nova-assinatura',
  templateUrl: './nova-assinatura.component.html',
  styleUrls:   ['./nova-assinatura.component.css'],
})
export class NovaAssinaturaComponent implements OnInit, OnDestroy {

  // Formulário reativo com validações
  formulario!: FormGroup;

  // Estado da interface
  salvando      = false;
  mensagemErro  = '';
  mensagemSucesso = '';

  // Listas para os selects e sugestões
  readonly categorias           = CATEGORIAS;
  sugestoesFiltradas: typeof SUGESTOES_SERVICOS = [];
  mostrarSugestoes              = false;

  // Dias do mês para o select de renovação
  readonly diasDoMes: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

  // Controle de memory leaks
  private subscricaoTrial?: Subscription;
  private timeoutSugestoes?: ReturnType<typeof setTimeout>;

  constructor(
    private fb: FormBuilder,
    private assinaturaService: AssinaturaService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  // ─────────────────────────────────────────────────────────
  // Inicializa o FormGroup com todos os campos e validações
  // ─────────────────────────────────────────────────────────
  private inicializarFormulario(): void {
    this.formulario = this.fb.group({
      nome:           ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      categoria:      ['', Validators.required],
      valor:          [null, [Validators.required, Validators.min(0.01), Validators.max(99999.99)]],
      ciclo_cobranca: ['Mensal', Validators.required],
      data_renovacao: [null],
      is_trial:       [false],
      data_fim_trial: [null],
      ativo:          [true],
    });

    // Observa mudanças em is_trial para tornar data_fim_trial obrigatória
    this.subscricaoTrial = this.formulario.get('is_trial')!.valueChanges.subscribe((ehTrial: boolean) => {
      const campoDataTrial = this.formulario.get('data_fim_trial');
      if (ehTrial) {
        campoDataTrial!.setValidators([Validators.required]);
      } else {
        campoDataTrial!.clearValidators();
        campoDataTrial!.setValue(null);
      }
      campoDataTrial!.updateValueAndValidity();
    });
  }

  // ─────────────────────────────────────────────────────────
  // Lógica de sugestão automática ao digitar o nome
  // ─────────────────────────────────────────────────────────

  /** Filtra sugestões de serviços conforme o usuário digita */
  aoDigitarNome(evento: Event): void {
    const termo = (evento.target as HTMLInputElement).value.toLowerCase().trim();

    if (termo.length < 2) {
      // Oculta sugestões se o texto for muito curto
      this.sugestoesFiltradas = [];
      this.mostrarSugestoes   = false;
      return;
    }

    // Filtra serviços que contêm o termo digitado
    this.sugestoesFiltradas = SUGESTOES_SERVICOS.filter(s =>
      s.nome.toLowerCase().includes(termo)
    ).slice(0, 6); // Limita a 6 sugestões para não poluir a tela

    this.mostrarSugestoes = this.sugestoesFiltradas.length > 0;
  }

  /** Seleciona uma sugestão e preenche automaticamente nome e categoria */
  selecionarSugestao(sugestao: typeof SUGESTOES_SERVICOS[0]): void {
    this.formulario.patchValue({
      nome:      sugestao.nome,
      categoria: sugestao.categoria,
    });
    this.mostrarSugestoes   = false;
    this.sugestoesFiltradas = [];
  }

  /** Fecha o dropdown de sugestões com um pequeno delay (para permitir o clique) */
  aoDesfocarNome(): void {
    clearTimeout(this.timeoutSugestoes);
    this.timeoutSugestoes = setTimeout(() => {
      this.mostrarSugestoes = false;
    }, 200);
  }

  ngOnDestroy(): void {
    this.subscricaoTrial?.unsubscribe();
    clearTimeout(this.timeoutSugestoes);
  }

  // ─────────────────────────────────────────────────────────
  // Getters de conveniência para o template
  // ─────────────────────────────────────────────────────────

  /** Retorna se o formulário está no estado "trial ativo" */
  get ehTrial(): boolean {
    return !!this.formulario.get('is_trial')!.value;
  }

  /** Verifica se um campo foi tocado e está inválido (para mostrar erros) */
  campoInvalido(nomeCampo: string): boolean {
    const campo = this.formulario.get(nomeCampo);
    return !!(campo && campo.invalid && (campo.dirty || campo.touched));
  }

  /** Retorna a mensagem de erro do campo */
  mensagemErroCampo(nomeCampo: string): string {
    const campo = this.formulario.get(nomeCampo);
    if (!campo || !campo.errors) return '';

    if (campo.errors['required'])   return 'Este campo é obrigatório.';
    if (campo.errors['minlength'])  return `Mínimo de ${campo.errors['minlength'].requiredLength} caracteres.`;
    if (campo.errors['maxlength'])  return `Máximo de ${campo.errors['maxlength'].requiredLength} caracteres.`;
    if (campo.errors['min'])        return 'O valor deve ser maior que zero.';

    return 'Campo inválido.';
  }

  // ─────────────────────────────────────────────────────────
  // Envio do formulário
  // ─────────────────────────────────────────────────────────
  aoSubmeter(): void {
    // Marca todos os campos como tocados para exibir erros
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) return;

    this.salvando     = true;
    this.mensagemErro = '';

    const novaAssinatura: Assinatura = {
      ...this.formulario.value,
      // Garante que data_fim_trial só é enviada se for trial
      data_fim_trial: this.ehTrial ? this.formulario.value.data_fim_trial : null,
    };

    this.assinaturaService.criar(novaAssinatura).subscribe({
      next: () => {
        this.salvando = false;
        // Navega para o dashboard após o sucesso
        this.router.navigate(['/dashboard']);
      },
      error: (erro: Error) => {
        this.mensagemErro = erro.message;
        this.salvando     = false;
      },
    });
  }

  // Cancela e volta para o dashboard
  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }
}
