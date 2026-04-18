const express    = require('express');
const roteador   = express.Router();
const controller = require('../controllers/assinaturasController');

roteador.get('/',       controller.listarTodas);
roteador.get('/:id',    controller.buscarPorId);
roteador.post('/',      controller.criar);
roteador.put('/:id',    controller.atualizar);
roteador.delete('/:id', controller.deletar);

module.exports = roteador;
