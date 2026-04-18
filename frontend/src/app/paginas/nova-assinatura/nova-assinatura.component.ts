import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AssinaturaService }     from '../../servicos/assinatura.service';
import { AssinaturaFormService } from '../../servicos/assinatura-form.service';
import { Assinatura }            from '../../modelos/assinatura.model';
import { CATEGORIAS, SugestaoServico, getLogoUrl, getAvatarGradient } from '../../modelos/assinatura.dados';

@Component({
  selector:    'app-nova-assinatura',
  templateUrl: './nova-assinatura.component.html',
  styleUrls:   ['./nova-assinatura.component.css'],
})
export class NovaAssinaturaComponent implements OnInit, OnDestroy {

  formulario!: FormGroup;
  salvando     = false;
  mensagemErro = '';

  readonly categorias = CATEGORIAS;
  readonly diasDoMes  = this.formService.diasDoMes;

  readonly getLogoUrl       = getLogoUrl;
  readonly getAvatarGradient = getAvatarGradient;

  sugestoesFiltradas: SugestaoServico[] = [];
  mostrarSugestoes = false;
  logoPreviewUrl   = '';

  private subscricaoTrial?: Subscription;
  private timeoutSugestoes?: ReturnType<typeof setTimeout>;

  constructor(
    private fb:             FormBuilder,
    private router:         Router,
    private assinaturaService: AssinaturaService,
    private formService:    AssinaturaFormService,
  ) {}

  ngOnInit(): void {
    this.formulario       = this.formService.criarFormulario(this.fb);
    this.subscricaoTrial  = this.formService.configurarValidacaoTrial(this.formulario);
  }

  ngOnDestroy(): void {
    this.subscricaoTrial?.unsubscribe();
    clearTimeout(this.timeoutSugestoes);
  }

  get ehTrial(): boolean {
    return !!this.formulario.get('is_trial')?.value;
  }

  campoInvalido(campo: string): boolean {
    return this.formService.campoInvalido(this.formulario, campo);
  }

  mensagemErroCampo(campo: string): string {
    return this.formService.mensagemErroCampo(this.formulario, campo);
  }

  aoDigitarNome(evento: Event): void {
    const termo = (evento.target as HTMLInputElement).value;
    this.sugestoesFiltradas = this.formService.filtrarSugestoes(termo);
    this.mostrarSugestoes   = this.sugestoesFiltradas.length > 0;
    this.logoPreviewUrl     = getLogoUrl(termo.trim());
  }

  selecionarSugestao(sugestao: SugestaoServico): void {
    this.formulario.patchValue({ nome: sugestao.nome, categoria: sugestao.categoria });
    this.logoPreviewUrl   = getLogoUrl(sugestao.nome);
    this.mostrarSugestoes = false;
    this.sugestoesFiltradas = [];
  }

  selecionarDia(dia: number | null): void {
    this.formulario.patchValue({ data_renovacao: dia });
  }

  aoDesfocarNome(): void {
    clearTimeout(this.timeoutSugestoes);
    this.timeoutSugestoes = setTimeout(() => { this.mostrarSugestoes = false; }, 200);
  }

  aoSubmeter(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;

    this.salvando     = true;
    this.mensagemErro = '';

    const novaAssinatura: Assinatura = {
      ...this.formulario.value,
      data_fim_trial: this.ehTrial ? this.formulario.value.data_fim_trial : null,
    };

    this.assinaturaService.criar(novaAssinatura).subscribe({
      next:  () => this.router.navigate(['/dashboard']),
      error: (erro: Error) => { this.mensagemErro = erro.message; this.salvando = false; },
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }
}
