/**
 * Modelos de dados TypeScript para o Ralo Tracker
 * Define as interfaces e constantes usadas em toda a aplicação
 */

// ─────────────────────────────────────────────────────────────
// Interface principal que reflete a estrutura do banco de dados
// ─────────────────────────────────────────────────────────────
export interface Assinatura {
  id?:             number;
  nome:            string;
  categoria:       string;
  valor:           number;
  ciclo_cobranca:  'Mensal' | 'Anual';
  data_renovacao?: number;      // Dia do mês (1-31)
  is_trial:        boolean;
  data_fim_trial?: string;      // Formato ISO: 'YYYY-MM-DD'
  icone_url?:      string;
  ativo:           boolean;
  criado_em?:      string;
  atualizado_em?:  string;
}

// ─────────────────────────────────────────────────────────────
// Lista de categorias suportadas pelo sistema
// ─────────────────────────────────────────────────────────────
export const CATEGORIAS: string[] = [
  'Streaming',
  'Inteligência Artificial',
  'Educação e Idiomas',
  'Softwares/Ferramentas',
  'Jogos',
  'Saúde e Bem-estar',
  'Finanças',
  'Outros',
];

// ─────────────────────────────────────────────────────────────
// Banco de sugestões de serviços com categoria pré-definida
// Usado para auto-completar o formulário ao digitar o nome
// ─────────────────────────────────────────────────────────────
export const SUGESTOES_SERVICOS: { nome: string; categoria: string; icone: string }[] = [
  // Streaming
  { nome: 'Netflix',           categoria: 'Streaming',               icone: '🎬' },
  { nome: 'Spotify',           categoria: 'Streaming',               icone: '🎵' },
  { nome: 'Amazon Prime',      categoria: 'Streaming',               icone: '📦' },
  { nome: 'Max',               categoria: 'Streaming',               icone: '📺' },
  { nome: 'Disney+',           categoria: 'Streaming',               icone: '🏰' },
  { nome: 'Apple TV+',         categoria: 'Streaming',               icone: '🍎' },
  { nome: 'Paramount+',        categoria: 'Streaming',               icone: '⭐' },
  { nome: 'Crunchyroll',       categoria: 'Streaming',               icone: '🎌' },
  { nome: 'Deezer',            categoria: 'Streaming',               icone: '🎶' },
  { nome: 'YouTube Premium',   categoria: 'Streaming',               icone: '▶️'  },

  // Inteligência Artificial
  { nome: 'ChatGPT Plus',      categoria: 'Inteligência Artificial', icone: '🤖' },
  { nome: 'Claude Pro',        categoria: 'Inteligência Artificial', icone: '🧠' },
  { nome: 'Midjourney',        categoria: 'Inteligência Artificial', icone: '🎨' },
  { nome: 'GitHub Copilot',    categoria: 'Softwares/Ferramentas',   icone: '👨‍💻' },
  { nome: 'Perplexity Pro',    categoria: 'Inteligência Artificial', icone: '🔍' },

  // Softwares/Ferramentas
  { nome: 'Adobe Creative Cloud', categoria: 'Softwares/Ferramentas', icone: '🎨' },
  { nome: 'Notion',            categoria: 'Softwares/Ferramentas',   icone: '📝' },
  { nome: 'Google One',        categoria: 'Softwares/Ferramentas',   icone: '☁️' },
  { nome: 'Microsoft 365',     categoria: 'Softwares/Ferramentas',   icone: '📊' },
  { nome: 'Dropbox',           categoria: 'Softwares/Ferramentas',   icone: '📁' },
  { nome: 'Figma',             categoria: 'Softwares/Ferramentas',   icone: '🖌️' },
  { nome: 'Canva Pro',         categoria: 'Softwares/Ferramentas',   icone: '✏️' },
  { nome: 'LastPass',          categoria: 'Softwares/Ferramentas',   icone: '🔐' },
  { nome: '1Password',         categoria: 'Softwares/Ferramentas',   icone: '🔑' },

  // Educação e Idiomas
  { nome: 'Duolingo Super',    categoria: 'Educação e Idiomas',      icone: '🦜' },
  { nome: 'Alura',             categoria: 'Educação e Idiomas',      icone: '📚' },
  { nome: 'QConcursos',        categoria: 'Educação e Idiomas',      icone: '📋' },
  { nome: 'Estratégia Concursos', categoria: 'Educação e Idiomas',   icone: '🎯' },
  { nome: 'Coursera',          categoria: 'Educação e Idiomas',      icone: '🎓' },
  { nome: 'Udemy',             categoria: 'Educação e Idiomas',      icone: '💡' },
  { nome: 'Rocketseat',        categoria: 'Educação e Idiomas',      icone: '🚀' },
  { nome: 'Babbel',            categoria: 'Educação e Idiomas',      icone: '🌍' },

  // Jogos
  { nome: 'Xbox Game Pass',    categoria: 'Jogos',                   icone: '🎮' },
  { nome: 'PlayStation Plus',  categoria: 'Jogos',                   icone: '🕹️' },
  { nome: 'Nintendo Switch Online', categoria: 'Jogos',              icone: '🎲' },
  { nome: 'EA Play',           categoria: 'Jogos',                   icone: '⚽' },

  // Saúde
  { nome: 'Gympass',           categoria: 'Saúde e Bem-estar',       icone: '💪' },
  { nome: 'Headspace',         categoria: 'Saúde e Bem-estar',       icone: '🧘' },
  { nome: 'Calm',              categoria: 'Saúde e Bem-estar',       icone: '😌' },
];

// ─────────────────────────────────────────────────────────────
// Mapa de cores CSS por categoria (para cards e gráfico)
// ─────────────────────────────────────────────────────────────
export const COR_POR_CATEGORIA: { [categoria: string]: string } = {
  'Streaming':               '#8b5cf6',
  'Inteligência Artificial': '#3b82f6',
  'Educação e Idiomas':      '#10b981',
  'Softwares/Ferramentas':   '#f59e0b',
  'Jogos':                   '#ef4444',
  'Saúde e Bem-estar':       '#ec4899',
  'Finanças':                '#14b8a6',
  'Outros':                  '#6b7280',
};
