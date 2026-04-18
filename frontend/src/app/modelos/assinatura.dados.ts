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

export const COR_POR_CATEGORIA: Record<string, string> = {
  'Streaming':               '#8b5cf6',
  'Inteligência Artificial': '#3b82f6',
  'Educação e Idiomas':      '#10b981',
  'Softwares/Ferramentas':   '#f59e0b',
  'Jogos':                   '#ef4444',
  'Saúde e Bem-estar':       '#ec4899',
  'Finanças':                '#14b8a6',
  'Outros':                  '#6b7280',
};

export interface SugestaoServico {
  nome:      string;
  categoria: string;
}

export const SUGESTOES_SERVICOS: SugestaoServico[] = [
  { nome: 'Netflix',               categoria: 'Streaming'               },
  { nome: 'Spotify',               categoria: 'Streaming'               },
  { nome: 'Amazon Prime',          categoria: 'Streaming'               },
  { nome: 'Max',                   categoria: 'Streaming'               },
  { nome: 'Disney+',               categoria: 'Streaming'               },
  { nome: 'Apple TV+',             categoria: 'Streaming'               },
  { nome: 'Paramount+',            categoria: 'Streaming'               },
  { nome: 'Crunchyroll',           categoria: 'Streaming'               },
  { nome: 'Deezer',                categoria: 'Streaming'               },
  { nome: 'YouTube Premium',       categoria: 'Streaming'               },
  { nome: 'ChatGPT Plus',          categoria: 'Inteligência Artificial'  },
  { nome: 'Claude Pro',            categoria: 'Inteligência Artificial'  },
  { nome: 'Midjourney',            categoria: 'Inteligência Artificial'  },
  { nome: 'Perplexity Pro',        categoria: 'Inteligência Artificial'  },
  { nome: 'GitHub Copilot',        categoria: 'Softwares/Ferramentas'    },
  { nome: 'Adobe Creative Cloud',  categoria: 'Softwares/Ferramentas'    },
  { nome: 'Notion',                categoria: 'Softwares/Ferramentas'    },
  { nome: 'Google One',            categoria: 'Softwares/Ferramentas'    },
  { nome: 'Microsoft 365',         categoria: 'Softwares/Ferramentas'    },
  { nome: 'Dropbox',               categoria: 'Softwares/Ferramentas'    },
  { nome: 'Figma',                 categoria: 'Softwares/Ferramentas'    },
  { nome: 'Canva Pro',             categoria: 'Softwares/Ferramentas'    },
  { nome: '1Password',             categoria: 'Softwares/Ferramentas'    },
  { nome: 'Duolingo Super',        categoria: 'Educação e Idiomas'       },
  { nome: 'Alura',                 categoria: 'Educação e Idiomas'       },
  { nome: 'Coursera',              categoria: 'Educação e Idiomas'       },
  { nome: 'Udemy',                 categoria: 'Educação e Idiomas'       },
  { nome: 'Rocketseat',            categoria: 'Educação e Idiomas'       },
  { nome: 'Xbox Game Pass',        categoria: 'Jogos'                    },
  { nome: 'PlayStation Plus',      categoria: 'Jogos'                    },
  { nome: 'Nintendo Switch Online', categoria: 'Jogos'                   },
  { nome: 'EA Play',               categoria: 'Jogos'                    },
  { nome: 'Gympass',               categoria: 'Saúde e Bem-estar'        },
  { nome: 'Headspace',             categoria: 'Saúde e Bem-estar'        },
  { nome: 'Calm',                  categoria: 'Saúde e Bem-estar'        },
];

// Simple Icons CDN slugs (primary logo source — SVGs with brand colors)
const SIMPLE_ICONS: Record<string, string> = {
  'Netflix':               'netflix',
  'Spotify':               'spotify',
  'Amazon Prime':          'amazonprime',
  'Max':                   'hbomax',
  'Disney+':               'disneyplus',
  'Apple TV+':             'appletv',
  'Paramount+':            'paramount',
  'Crunchyroll':           'crunchyroll',
  'Deezer':                'deezer',
  'YouTube Premium':       'youtube',
  'ChatGPT Plus':          'openai',
  'Claude Pro':            'anthropic',
  'Midjourney':            'midjourney',
  'Perplexity Pro':        'perplexity',
  'GitHub Copilot':        'github',
  'Adobe Creative Cloud':  'adobe',
  'Notion':                'notion',
  'Google One':            'google',
  'Microsoft 365':         'microsoft',
  'Dropbox':               'dropbox',
  'Figma':                 'figma',
  'Canva Pro':             'canva',
  '1Password':             '1password',
  'Duolingo Super':        'duolingo',
  'Alura':                 'alura',
  'Coursera':              'coursera',
  'Udemy':                 'udemy',
  'Rocketseat':            'rocketseat',
  'Xbox Game Pass':        'xbox',
  'PlayStation Plus':      'playstation',
  'Nintendo Switch Online': 'nintendo',
  'EA Play':               'ea',
  'Gympass':               'gympass',
  'Headspace':             'headspace',
  'Calm':                  'calm',
};

// Clearbit fallback (PNG logos with background)
const DOMINIOS: Record<string, string> = {
  'Netflix': 'netflix.com', 'Spotify': 'spotify.com', 'Amazon Prime': 'amazon.com',
  'Max': 'max.com', 'Disney+': 'disneyplus.com', 'Apple TV+': 'apple.com',
  'Paramount+': 'paramountplus.com', 'Crunchyroll': 'crunchyroll.com',
  'Deezer': 'deezer.com', 'YouTube Premium': 'youtube.com',
  'ChatGPT Plus': 'openai.com', 'Claude Pro': 'anthropic.com',
  'Midjourney': 'midjourney.com', 'GitHub Copilot': 'github.com',
  'Perplexity Pro': 'perplexity.ai', 'Adobe Creative Cloud': 'adobe.com',
  'Notion': 'notion.so', 'Google One': 'google.com',
  'Microsoft 365': 'microsoft.com', 'Dropbox': 'dropbox.com',
  'Figma': 'figma.com', 'Canva Pro': 'canva.com',
  '1Password': '1password.com', 'Duolingo Super': 'duolingo.com',
  'Alura': 'alura.com.br', 'Coursera': 'coursera.org',
  'Udemy': 'udemy.com', 'Rocketseat': 'rocketseat.com.br',
  'Xbox Game Pass': 'xbox.com', 'PlayStation Plus': 'playstation.com',
  'Nintendo Switch Online': 'nintendo.com', 'EA Play': 'ea.com',
  'Gympass': 'gympass.com', 'Headspace': 'headspace.com', 'Calm': 'calm.com',
};

// Gradient pairs for letter avatar fallback
const AVATAR_GRADIENTS: [string, string][] = [
  ['#22d3ee', '#3b82f6'],
  ['#a855f7', '#6366f1'],
  ['#10b981', '#06b6d4'],
  ['#f59e0b', '#ef4444'],
  ['#f472b6', '#a855f7'],
  ['#14b8a6', '#22d3ee'],
  ['#818cf8', '#c084fc'],
  ['#fb923c', '#f43f5e'],
];

export function getLogoUrl(nome: string): string {
  const slug = SIMPLE_ICONS[nome];
  if (slug) return `https://cdn.simpleicons.org/${slug}`;
  const dominio = DOMINIOS[nome];
  return dominio ? `https://logo.clearbit.com/${dominio}` : '';
}

export function getAvatarGradient(nome: string): [string, string] {
  const idx = ((nome || '?').charCodeAt(0) + (nome || '').length) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}
