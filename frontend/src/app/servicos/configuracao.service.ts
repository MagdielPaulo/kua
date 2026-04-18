import { Injectable } from '@angular/core';

export type Moeda = 'BRL' | 'USD' | 'EUR' | 'GBP';
export type Tema  = 'dark' | 'light';

export interface Configuracao {
  moeda:             Moeda;
  tema:              Tema;
  alertasDias:       number;
  exportarFormato:   'json' | 'csv';
}

const PADRAO: Configuracao = {
  moeda:           'BRL',
  tema:            'dark',
  alertasDias:     3,
  exportarFormato: 'json',
};

@Injectable({ providedIn: 'root' })
export class ConfiguracaoService {
  private readonly CHAVE = 'kua_config';

  get(): Configuracao {
    try {
      const raw = localStorage.getItem(this.CHAVE);
      return raw ? { ...PADRAO, ...JSON.parse(raw) } : { ...PADRAO };
    } catch { return { ...PADRAO }; }
  }

  salvar(config: Partial<Configuracao>): void {
    const atual = this.get();
    localStorage.setItem(this.CHAVE, JSON.stringify({ ...atual, ...config }));
  }

  aplicarTema(tema: Tema): void {
    document.body.classList.toggle('tema-claro', tema === 'light');
  }

  get moeda(): Moeda   { return this.get().moeda; }
  get tema():  Tema    { return this.get().tema; }

  formatarMoeda(valor: number): string {
    const moeda = this.moeda;
    const locale = moeda === 'BRL' ? 'pt-BR' : 'en-US';
    return (Number(valor) || 0).toLocaleString(locale, { style: 'currency', currency: moeda });
  }
}
