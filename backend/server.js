const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const rotasAssinaturas = require('./routes/assinaturas');

const app   = express();
const PORTA = process.env.PORTA || 3000;

// ─── Middlewares ────────────────────────────────────────────
// CORS restrito: aceita apenas a origem do frontend
const origemPermitida = process.env.CORS_ORIGIN || 'http://localhost:4200';
app.use(cors({
  origin:  origemPermitida,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Parsing JSON com limite de tamanho para prevenir DoS
app.use(express.json({ limit: '1mb' }));

// ─── Rotas da API ───────────────────────────────────────────
app.use('/api/assinaturas', rotasAssinaturas);

// Endpoint de verificação de saúde do servidor
app.get('/api/saude', (req, res) => {
  res.json({
    status:   'ok',
    mensagem: 'Servidor Kua funcionando!',
    versao:   '1.0.0',
    data:     new Date().toISOString(),
  });
});

// ─── Rota não encontrada (404) ───────────────────────────────
app.use((req, res) => {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.url}` });
});

// ─── Handler global de erros ────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Erro não tratado]', err);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
});

// ─── Inicialização ──────────────────────────────────────────
app.listen(PORTA, () => {
  console.log(`Kua Backend rodando na porta ${PORTA}`);
  console.log(`   Acesse: http://localhost:${PORTA}/api/saude`);
  console.log(`   CORS permitido para: ${origemPermitida}`);
});
