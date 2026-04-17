/**
 * Rotas do recurso Assinaturas
 * Cada rota mapeia um método HTTP e caminho para uma função do controller.
 * Base path: /api/assinaturas  (definido no server.js)
 */
const express    = require('express');
const roteador   = express.Router();
const controlador = require('../controllers/assinaturasController');

// GET    /api/assinaturas       → Lista todas as assinaturas
roteador.get('/',    controlador.listarTodas);

// GET    /api/assinaturas/:id   → Busca uma assinatura específica pelo ID
roteador.get('/:id', controlador.buscarPorId);

// POST   /api/assinaturas       → Cria uma nova assinatura
roteador.post('/',   controlador.criar);

// PUT    /api/assinaturas/:id   → Atualiza todos os dados de uma assinatura
roteador.put('/:id', controlador.atualizar);

// DELETE /api/assinaturas/:id   → Remove permanentemente uma assinatura
roteador.delete('/:id', controlador.deletar);

module.exports = roteador;
