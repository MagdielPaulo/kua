/**
 * Controller de Assinaturas
 * Lógica de negócio para operações CRUD de assinaturas.
 */
const pool = require('../config/banco');

// ── Helpers de validação ─────────────────────────────────────

/** Retorna true somente se o valor for um inteiro positivo */
const ehIdValido = (id) => {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
};

/** Valida e sanitiza os campos do body antes de persistir */
const validarCampos = ({ nome, categoria, valor, ciclo_cobranca, data_renovacao, data_fim_trial }) => {
  const erros = [];

  if (!nome || typeof nome !== 'string' || nome.trim().length < 2)
    erros.push('nome: mínimo de 2 caracteres.');
  if (nome && nome.trim().length > 100)
    erros.push('nome: máximo de 100 caracteres.');

  if (!categoria || typeof categoria !== 'string' || categoria.trim().length < 2)
    erros.push('categoria: campo obrigatório.');

  const valorNum = parseFloat(valor);
  if (isNaN(valorNum) || valorNum <= 0 || valorNum > 99999.99)
    erros.push('valor: deve ser um número entre 0,01 e 99.999,99.');

  if (!['Mensal', 'Anual'].includes(ciclo_cobranca))
    erros.push('ciclo_cobranca: deve ser "Mensal" ou "Anual".');

  if (data_renovacao !== undefined && data_renovacao !== null) {
    const dia = parseInt(data_renovacao, 10);
    if (isNaN(dia) || dia < 1 || dia > 31)
      erros.push('data_renovacao: deve ser um dia entre 1 e 31.');
  }

  if (data_fim_trial) {
    const d = new Date(data_fim_trial);
    if (isNaN(d.getTime()))
      erros.push('data_fim_trial: formato de data inválido (use YYYY-MM-DD).');
  }

  return erros;
};

// ─────────────────────────────────────────────────────────────
// GET /api/assinaturas
// ─────────────────────────────────────────────────────────────
const listarTodas = async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM assinaturas ORDER BY criado_em DESC'
    );
    res.json(resultado.rows);
  } catch (erro) {
    console.error('Erro ao listar assinaturas:', erro.message);
    res.status(500).json({ erro: 'Erro interno ao buscar assinaturas.' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/assinaturas/:id
// ─────────────────────────────────────────────────────────────
const buscarPorId = async (req, res) => {
  const { id } = req.params;

  if (!ehIdValido(id)) {
    return res.status(400).json({ erro: 'ID inválido. Deve ser um inteiro positivo.' });
  }

  try {
    const resultado = await pool.query(
      'SELECT * FROM assinaturas WHERE id = $1',
      [Number(id)]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Assinatura não encontrada.' });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro ao buscar assinatura por ID:', erro.message);
    res.status(500).json({ erro: 'Erro interno ao buscar assinatura.' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/assinaturas
// ─────────────────────────────────────────────────────────────
const criar = async (req, res) => {
  const {
    nome, categoria, valor, ciclo_cobranca,
    data_renovacao, is_trial, data_fim_trial, icone_url, ativo,
  } = req.body;

  const erros = validarCampos({ nome, categoria, valor, ciclo_cobranca, data_renovacao, data_fim_trial });
  if (erros.length > 0) {
    return res.status(400).json({ erro: erros.join(' ') });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO assinaturas
         (nome, categoria, valor, ciclo_cobranca, data_renovacao,
          is_trial, data_fim_trial, icone_url, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        nome.trim(),
        categoria.trim(),
        parseFloat(valor),
        ciclo_cobranca,
        data_renovacao  || null,
        is_trial        || false,
        data_fim_trial  || null,
        icone_url       || null,
        ativo !== undefined ? ativo : true,
      ]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro ao criar assinatura:', erro.message);
    res.status(500).json({ erro: 'Erro interno ao criar assinatura.' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/assinaturas/:id
// ─────────────────────────────────────────────────────────────
const atualizar = async (req, res) => {
  const { id } = req.params;
  const {
    nome, categoria, valor, ciclo_cobranca,
    data_renovacao, is_trial, data_fim_trial, icone_url, ativo,
  } = req.body;

  if (!ehIdValido(id)) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  const erros = validarCampos({ nome, categoria, valor, ciclo_cobranca, data_renovacao, data_fim_trial });
  if (erros.length > 0) {
    return res.status(400).json({ erro: erros.join(' ') });
  }

  try {
    const resultado = await pool.query(
      `UPDATE assinaturas
       SET nome           = $1,
           categoria      = $2,
           valor          = $3,
           ciclo_cobranca = $4,
           data_renovacao = $5,
           is_trial       = $6,
           data_fim_trial = $7,
           icone_url      = $8,
           ativo          = $9,
           atualizado_em  = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        nome.trim(),
        categoria.trim(),
        parseFloat(valor),
        ciclo_cobranca,
        data_renovacao  || null,
        is_trial        || false,
        data_fim_trial  || null,
        icone_url       || null,
        ativo !== undefined ? ativo : true,
        Number(id),
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Assinatura não encontrada.' });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro ao atualizar assinatura:', erro.message);
    res.status(500).json({ erro: 'Erro interno ao atualizar assinatura.' });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/assinaturas/:id
// ─────────────────────────────────────────────────────────────
const deletar = async (req, res) => {
  const { id } = req.params;

  if (!ehIdValido(id)) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  try {
    const resultado = await pool.query(
      'DELETE FROM assinaturas WHERE id = $1 RETURNING *',
      [Number(id)]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Assinatura não encontrada.' });
    }

    res.json({
      mensagem:    'Assinatura removida com sucesso.',
      assinatura:  resultado.rows[0],
    });
  } catch (erro) {
    console.error('Erro ao deletar assinatura:', erro.message);
    res.status(500).json({ erro: 'Erro interno ao deletar assinatura.' });
  }
};

module.exports = { listarTodas, buscarPorId, criar, atualizar, deletar };
