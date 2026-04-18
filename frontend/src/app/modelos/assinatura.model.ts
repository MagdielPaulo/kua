export interface Assinatura {
  id?:             number;
  nome:            string;
  categoria:       string;
  valor:           number;
  ciclo_cobranca:  'Mensal' | 'Anual';
  data_renovacao?: number;
  is_trial:        boolean;
  data_fim_trial?: string;
  icone_url?:      string;
  ativo:           boolean;
  criado_em?:      string;
  atualizado_em?:  string;
}
