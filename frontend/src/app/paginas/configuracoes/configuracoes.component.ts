import { Component, OnInit } from '@angular/core';
import { ConfiguracaoService, Configuracao, Moeda, Tema } from '../../servicos/configuracao.service';
import { AssinaturaService } from '../../servicos/assinatura.service';
import { Assinatura } from '../../modelos/assinatura.model';

@Component({
  selector:    'app-configuracoes',
  templateUrl: './configuracoes.component.html',
  styleUrls:   ['./configuracoes.component.css'],
})
export class ConfiguracoesComponent implements OnInit {

  config!: Configuracao;
  salvo  = false;
  exporting = false;

  readonly moedas: { valor: Moeda; label: string; simbolo: string }[] = [
    { valor: 'BRL', label: 'Real Brasileiro', simbolo: 'R$' },
    { valor: 'USD', label: 'Dólar Americano', simbolo: '$'  },
    { valor: 'EUR', label: 'Euro',            simbolo: '€'  },
    { valor: 'GBP', label: 'Libra Esterlina', simbolo: '£'  },
  ];

  readonly intervalosAlerta = [1, 2, 3, 5, 7];

  constructor(
    private configuracaoService: ConfiguracaoService,
    private assinaturaService:   AssinaturaService,
  ) {}

  ngOnInit(): void {
    this.config = this.configuracaoService.get();
  }

  alterarTema(tema: Tema): void {
    this.config.tema = tema;
    this.configuracaoService.aplicarTema(tema);
  }

  salvar(): void {
    this.configuracaoService.salvar(this.config);
    this.configuracaoService.aplicarTema(this.config.tema);
    this.salvo = true;
    setTimeout(() => { this.salvo = false; }, 2500);
  }

  exportarJSON(): void {
    this.exporting = true;
    this.assinaturaService.listarTodas().subscribe({
      next: (dados: Assinatura[]) => {
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, 'kua-assinaturas.json');
        this.exporting = false;
      },
      error: () => { this.exporting = false; },
    });
  }

  exportarCSV(): void {
    this.exporting = true;
    this.assinaturaService.listarTodas().subscribe({
      next: (dados: Assinatura[]) => {
        const header = 'nome,categoria,valor,ciclo_cobranca,data_renovacao,is_trial,data_fim_trial,ativo';
        const linhas = dados.map(a =>
          `"${a.nome}","${a.categoria}",${a.valor},"${a.ciclo_cobranca}",${a.data_renovacao ?? ''},"${a.is_trial}","${a.data_fim_trial ?? ''}","${a.ativo}"`
        );
        const blob = new Blob([[header, ...linhas].join('\n')], { type: 'text/csv;charset=utf-8;' });
        this.downloadBlob(blob, 'kua-assinaturas.csv');
        this.exporting = false;
      },
      error: () => { this.exporting = false; },
    });
  }

  private downloadBlob(blob: Blob, nome: string): void {
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = nome;
    link.click();
    URL.revokeObjectURL(url);
  }
}
