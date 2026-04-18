import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AssinaturaService }     from '../../servicos/assinatura.service';
import { AssinaturaFormService } from '../../servicos/assinatura-form.service';
import { Assinatura }            from '../../modelos/assinatura.model';
import { CATEGORIAS, SugestaoServico, COR_POR_CATEGORIA, getLogoUrl, getAvatarGradient } from '../../modelos/assinatura.dados';
import { formatarMoeda, formatarData, calcularDiasRestantes } from '../../utilitarios/assinatura.utils';

@Component({
  selector:    'app-detalhes-assinatura',
  templateUrl: './detalhes-assinatura.component.html',
  styleUrls:   ['./detalhes-assinatura.component.css'],
})
export class DetalhesAssinaturaComponent implements OnInit, OnDestroy {

  assinatura: Assinatura | null = null;
  formulario!: FormGroup;

  carregando      = true;
  modoEdicao      = false;
  salvando        = false;
  deletando       = false;
  confirmarDelete = false;
  mensagemErro    = '';
  mensagemSucesso = '';

  readonly categorias = CATEGORIAS;
  readonly diasDoMes  = this.formService.diasDoMes;

  readonly getLogoUrl        = getLogoUrl;
  readonly getAvatarGradient = getAvatarGradient;

  sugestoesFiltradas: SugestaoServico[] = [];
  mostrarSugestoes = false;

  private subscricaoTrial?: Subscription;
  private timeoutSugestoes?: ReturnType<typeof setTimeout>;
  private timeoutSucesso?:   ReturnType<typeof setTimeout>;

  constructor(
    private route:             ActivatedRoute,
    private router:            Router,
    private fb:                FormBuilder,
    private assinaturaService: AssinaturaService,
    private formService:       AssinaturaFormService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.mensagemErro = 'ID de assinatura inválido.';
      this.carregando   = false;
      return;
    }
    this.assinaturaService.buscarPorId(id).subscribe({
      next:  dados => { this.assinatura = dados; this.inicializarFormulario(dados); this.carregando = false; },
      error: erro  => { this.mensagemErro = erro.message; this.carregando = false; },
    });
  }

  ngOnDestroy(): void {
    this.subscricaoTrial?.unsubscribe();
    clearTimeout(this.timeoutSugestoes);
    clearTimeout(this.timeoutSucesso);
  }

  private inicializarFormulario(dados: Assinatura): void {
    this.subscricaoTrial?.unsubscribe();
    this.formulario      = this.formService.criarFormulario(this.fb, dados);
    this.subscricaoTrial = this.formService.configurarValidacaoTrial(this.formulario);
  }

  get ehTrial(): boolean { return !!this.formulario?.get('is_trial')?.value; }

  get corCategoria(): string {
    return COR_POR_CATEGORIA[this.assinatura?.categoria ?? ''] ?? '#6b7280';
  }

  get diasRestantesTrial(): number {
    return this.assinatura?.data_fim_trial
      ? calcularDiasRestantes(this.assinatura.data_fim_trial)
      : -1;
  }

  campoInvalido(campo: string): boolean {
    return this.formService.campoInvalido(this.formulario, campo);
  }

  mensagemErroCampo(campo: string): string {
    return this.formService.mensagemErroCampo(this.formulario, campo);
  }

  formatarMoeda = formatarMoeda;
  formatarData  = formatarData;

  aoDigitarNome(evento: Event): void {
    const termo = (evento.target as HTMLInputElement).value;
    this.sugestoesFiltradas = this.formService.filtrarSugestoes(termo);
    this.mostrarSugestoes   = this.sugestoesFiltradas.length > 0;
  }

  selecionarSugestao(sugestao: SugestaoServico): void {
    this.formulario.patchValue({ nome: sugestao.nome, categoria: sugestao.categoria });
    this.mostrarSugestoes = false;
  }

  selecionarDia(dia: number | null): void {
    this.formulario.patchValue({ data_renovacao: dia });
  }

  aoDesfocarNome(): void {
    clearTimeout(this.timeoutSugestoes);
    this.timeoutSugestoes = setTimeout(() => { this.mostrarSugestoes = false; }, 200);
  }

  ativarEdicao(): void {
    this.modoEdicao = true;
    this.mensagemErro = this.mensagemSucesso = '';
  }

  cancelarEdicao(): void {
    if (this.assinatura) this.inicializarFormulario(this.assinatura);
    this.modoEdicao = false;
    this.mensagemErro = '';
  }

  salvarEdicao(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid || !this.assinatura?.id) return;

    this.salvando     = true;
    this.mensagemErro = '';

    const dados: Assinatura = {
      ...this.formulario.value,
      data_fim_trial: this.ehTrial ? this.formulario.value.data_fim_trial : null,
    };

    this.assinaturaService.atualizar(this.assinatura.id, dados).subscribe({
      next: atualizado => {
        this.assinatura     = atualizado;
        this.modoEdicao     = false;
        this.salvando       = false;
        this.mensagemSucesso = 'Assinatura atualizada com sucesso!';
        this.timeoutSucesso = setTimeout(() => { this.mensagemSucesso = ''; }, 3000);
      },
      error: erro => { this.mensagemErro = erro.message; this.salvando = false; },
    });
  }

  confirmarCancelamento(): void {
    if (!this.assinatura?.id) return;
    this.deletando       = true;
    this.confirmarDelete = false;

    this.assinaturaService.deletar(this.assinatura.id).subscribe({
      next:  () => this.router.navigate(['/dashboard']),
      error: erro => { this.mensagemErro = erro.message; this.deletando = false; },
    });
  }

  voltarParaDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
