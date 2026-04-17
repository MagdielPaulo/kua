-- ============================================================
-- Migração inicial do Kua
-- Cria as tabelas necessárias para o gerenciamento de assinaturas
-- Execute este script no PostgreSQL antes de iniciar o servidor
-- ============================================================

-- Cria o banco de dados (execute separadamente se necessário)
-- CREATE DATABASE kua;

-- Remove a tabela caso já exista (útil em desenvolvimento)
DROP TABLE IF EXISTS assinaturas;

-- ============================================================
-- Tabela principal de assinaturas
-- ============================================================
CREATE TABLE assinaturas (
  id              SERIAL PRIMARY KEY,
  nome            VARCHAR(100) NOT NULL,         -- Nome do serviço (ex: "Netflix")
  categoria       VARCHAR(60)  NOT NULL,         -- Categoria do serviço
  valor           DECIMAL(10, 2) NOT NULL        -- Valor da cobrança
                  CHECK (valor >= 0),
  ciclo_cobranca  VARCHAR(10) NOT NULL           -- Frequência: 'Mensal' ou 'Anual'
                  CHECK (ciclo_cobranca IN ('Mensal', 'Anual')),
  data_renovacao  INTEGER                        -- Dia do mês da renovação (1 a 31)
                  CHECK (data_renovacao >= 1 AND data_renovacao <= 31),
  is_trial        BOOLEAN DEFAULT FALSE,         -- Indica se é um teste gratuito
  data_fim_trial  DATE,                          -- Data de encerramento do trial
  icone_url       VARCHAR(255),                  -- URL opcional para ícone do serviço
  ativo           BOOLEAN DEFAULT TRUE,          -- Assinatura ativa ou cancelada/arquivada
  criado_em       TIMESTAMP DEFAULT NOW(),       -- Data/hora do cadastro
  atualizado_em   TIMESTAMP DEFAULT NOW()        -- Data/hora da última alteração
);

-- Índices para acelerar as consultas mais comuns
CREATE INDEX idx_assinaturas_categoria  ON assinaturas(categoria);
CREATE INDEX idx_assinaturas_ativo      ON assinaturas(ativo);
CREATE INDEX idx_assinaturas_is_trial   ON assinaturas(is_trial);

-- ============================================================
-- Dados de exemplo para demonstração
-- ============================================================
INSERT INTO assinaturas (nome, categoria, valor, ciclo_cobranca, data_renovacao, is_trial, ativo)
VALUES
  ('Netflix',           'Streaming',               39.90,  'Mensal', 15, false, true),
  ('Spotify',           'Streaming',               21.90,  'Mensal', 10, false, true),
  ('Amazon Prime',      'Streaming',               14.90,  'Mensal', 22, false, true),
  ('ChatGPT Plus',      'Inteligência Artificial', 105.00, 'Mensal',  5, false, true),
  ('Midjourney',        'Inteligência Artificial',  52.00, 'Mensal', 18, true,  true),
  ('GitHub Copilot',    'Softwares/Ferramentas',    52.00, 'Mensal', 20, true,  true),
  ('Duolingo Super',    'Educação e Idiomas',       25.90, 'Mensal',  8, false, true),
  ('Google One',        'Softwares/Ferramentas',    34.99, 'Mensal',  3, false, true);

-- Atualiza as datas de fim de trial para simular alertas reais
UPDATE assinaturas
SET data_fim_trial = CURRENT_DATE + INTERVAL '2 days'
WHERE nome = 'Midjourney';

UPDATE assinaturas
SET data_fim_trial = CURRENT_DATE + INTERVAL '5 days'
WHERE nome = 'GitHub Copilot';

COMMIT;
