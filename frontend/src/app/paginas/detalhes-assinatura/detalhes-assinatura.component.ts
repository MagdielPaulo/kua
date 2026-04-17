/**
 * Componente Detalhes da Assinatura
 * Exibe os dados completos de uma assinatura e permite:
 * - Editar qualquer campo (incluindo o valor em caso de reajuste)
 * - Cancelar/deletar a assinatura definitivamente
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AssinaturaService } from '../../servicos/assinatura.service';
import {
  Assinatura,
  CATEGORIAS,
  SUGESTOES_SERVICOS,
  COR_POR_CATEGORIA,
} from '../../modelos/assinatura.model';

@Component({
  selector:    'app-detalhes-assinatura',
  templateUrl: './detalhes-assinatura.component.html',
  styleUrls:   ['./detalhes-assinatura.component.css'],
})
export class DetalhesAssinaturaComponent implements OnInit, OnDestroy {

  // Dados da assinatura carregada
  assinatura: Assinatura | null = null;

  // Formulário reativo para a edição
  formulario!: FormGroup;

  // Estados da interface
  carregando       = true;
  modoEdicao       = false;
  salvando         = false;
  deletando        = false;
  confirmarDelete  = false; // Exibe a confirmação antes de deletar
  mensagemErro     = '';
  mensagemSucesso  = '';

  // Listas para os selects
  readonly categorias  = CATEGORIAS;
  readonly diasDoMes   = Array.from({ length: 31 }, (_, i) => i + 1);

  // Autocomplete de nome
  sugestoesFiltradas: typeof SUGESTOES_SERVICOS = [];
  mostrarSugestoes   = false;

  // Controle de memory leaks
  private subscricaoTrial?: Subscription;
  private timeoutSugestoes?: ReturnType<typeof setTimeout>;
  private timeoutSucesso?:   ReturnType<typeof setTimeout>;

  constructor(
    private route:             ActivatedRoute,
    private router:            Router,
    private fb:                FormBuilder,
    private assinaturaService: AssinaturaService,
  ) {}

  ngOnInit(): void {
    // Lê o ID da URL (ex: /assinatura/3) e carrega os dados
    const idParam = this.route.snapshot.paramMap.get('id');
    const id      = idParam ? parseInt(idParam, 10) : null;

    if (!id || isNaN(id)) {
      this.mensagemErro = 'ID de assinatura inválido.';
      this.carregando   = false;
      return;
    }

    this.carregarAssinatura(id);
  }

  // ─────────────────────────────────────────────────────────
  // Carrega a assinatura da API e inicializa o formulário
  // ─────────────────────────────────────────────────────────
  private carregarAssinatura(id: number): void {
    this.assinaturaService.buscarPorId(id).subscribe({
      next: (dados: Assinatura) => {
        this.assinatura = dados;
        this.inicializarFormulario(dados);
        this.carregando = false;
      },
      error: (erro: Error) => {
        this.mensagemErro = erro.message;
        this.carregando   = false;
      },
    });
  }

  // Inicializa o formulário com os dados existentes da assinatura
  private inicializarFormulario(dados: Assinatura): void {
    this.formulario = this.fb.group({
      nome:           [dados.nome,           [Validators.required, Validators.minLength(2)]],
      categoria:      [dados.categoria,      Validators.required],
      valor:          [dados.valor,          [Validators.required, Validators.min(0.01)]],
      ciclo_cobranca: [dados.ciclo_cobranca, Validators.required],
      data_renovacao: [dados.data_renovacao  || null],
      is_trial:       [dados.is_trial],
      // Formata a data para o formato aceito pelo input[type=date]: YYYY-MM-DD
      data_fim_trial: [dados.data_fim_trial
        ? dados.data_fim_trial.split('T')[0]
        : null],
      ativo:          [dados.ativo],
    });

    // Observa mudanças em is_trial para validações dinâmicas
    this.subscricaoTrial?.unsubscribe();
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
  // Autocomplete de nome
  // ─────────────────────────────────────────────────────────
  aoDigitarNome(evento: Event): void {
    const termo = (evento.target as HTMLInputElement).value.toLowerCase().trim();
    if (termo.length < 2) { this.mostrarSugestoes = false; return; }
    this.sugestoesFiltradas = SUGESTOES_SERVICOS
      .filter(s => s.nome.toLowerCase().includes(termo)).slice(0, 5);
    this.mostrarSugestoes = this.sugestoesFiltradas.length > 0;
  }

  selecionarSugestao(sugestao: typeof SUGESTOES_SERVICOS[0]): void {
    this.formulario.patchValue({ nome: sugestao.nome, categoria: sugestao.categoria });
    this.mostrarSugestoes = false;
  }

  aoDesfocarNome(): void {
    clearTimeout(this.timeoutSugestoes);
    this.timeoutSugestoes = setTimeout(() => { this.mostrarSugestoes = false; }, 200);
  }

  ngOnDestroy(): void {
    this.subscricaoTrial?.unsubscribe();
    clearTimeout(this.timeoutSugestoes);
    clearTimeout(this.timeoutSucesso);
  }

  // ─────────────────────────────────────────────────────────
  // Getters e helpers
  // ─────────────────────────────────────────────────────────

  get ehTrial(): boolean {
    return !!this.formulario?.get('is_trial')?.value;
  }

  get corCategoria(): string {
    const cat = this.assinatura?.categoria || '';
    return COR_POR_CATEGORIA[cat] || '#6b7280';
  }

  /** Dias restantes do trial (para o badge de alerta) */
  get diasRestantesTrial(): number {
    if (!this.assinatura?.data_fim_trial) return -1;
    const hoje    = new Date();
    const dataFim = new Date(this.assinatura.data_fim_trial);
    hoje.setHours(0, 0, 0, 0);
    dataFim.setHours(0, 0, 0, 0);
    return Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  }

  campoInvalido(nomeCampo: string): boolean {
    const campo = this.formulario?.get(nomeCampo);
    return !!(campo && campo.invalid && (campo.dirty || campo.touched));
  }

  mensagemErroCampo(nomeCampo: string): string {
    const campo = this.formulario?.get(nomeCampo);
    if (!campo || !campo.errors) return '';
    if (campo.errors['required'])  return 'Este campo é obrigatório.';
    if (campo.errors['minlength']) return `Mínimo de ${campo.errors['minlength'].requiredLength} caracteres.`;
    if (campo.errors['min'])       return 'O valor deve ser maior que zero.';
    return 'Campo inválido.';
  }

  formatarMoeda(valor: number): string {
    return (Number(valor) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarData(dataIso: string): string {
    const data = new Date(dataIso + 'T12:00:00');
    return data.toLocaleDateString('pt-BR');
  }

  // ─────────────────────────────────────────────────────────
  // Ações do formulário
  // ─────────────────────────────────────────────────────────

  /** Ativa o modo de edição e habilita o formulário */
  ativarEdicao(): void {
    this.modoEdicao    = true;
    this.mensagemErro  = '';
    this.mensagemSucesso = '';
  }

  /** Cancela a edição e restaura os dados originais */
  cancelarEdicao(): void {
    if (this.assinatura) {
      this.inicializarFormulario(this.assinatura);
    }
    this.modoEdicao   = false;
    this.mensagemErro = '';
  }

  /** Salva as alterações via PUT na API */
  salvarEdicao(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid || !this.assinatura?.id) return;

    this.salvando     = true;
    this.mensagemErro = '';

    const dadosAtualizados: Assinatura = {
      ...this.formulario.value,
      data_fim_trial: this.ehTrial ? this.formulario.value.data_fim_trial : null,
    };

    this.assinaturaService.atualizar(this.assinatura.id, dadosAtualizados).subscribe({
      next: (dadosNovos: Assinatura) => {
        this.assinatura     = dadosNovos;
        this.modoEdicao     = false;
        this.salvando       = false;
        this.mensagemSucesso = 'Assinatura atualizada com sucesso!';
        clearTimeout(this.timeoutSucesso);
        this.timeoutSucesso = setTimeout(() => { this.mensagemSucesso = ''; }, 3000);
      },
      error: (erro: Error) => {
        this.mensagemErro = erro.message;
        this.salvando     = false;
      },
    });
  }

  /** Cancela a assinatura (deleta permanentemente) */
  confirmarCancelamento(): void {
    if (!this.assinatura?.id) return;

    this.deletando      = true;
    this.mensagemErro   = '';
    this.confirmarDelete = false;

    this.assinaturaService.deletar(this.assinatura.id).subscribe({
      next: () => {
        // Redireciona para o dashboard após excluir
        this.router.navigate(['/dashboard']);
      },
      error: (erro: Error) => {
        this.mensagemErro = erro.message;
        this.deletando    = false;
      },
    });
  }

  voltarParaDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
