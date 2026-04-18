const pool = require('../config/banco');

const ehIdValido = (id) => {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
};

const validarCampos = ({ nome, categoria, valor, ciclo_cobranca, data_renovacao, data_fim_trial }) => {
  const erros = [];

  if (!nome?.trim() || nome.trim().length < 2)   erros.push('nome: mínimo de 2 caracteres.');
  if (nome?.trim().length > 100)                  erros.push('nome: máximo de 100 caracteres.');
  if (!categoria?.trim())                         erros.push('categoria: campo obrigatório.');

  const valorNum = parseFloat(valor);
  if (isNaN(valorNum) || valorNum <= 0 || valorNum > 99_999.99)
    erros.push('valor: deve ser entre 0,01 e 99.999,99.');

  if (!['Mensal', 'Anual'].includes(ciclo_cobranca))
    erros.push('ciclo_cobranca: deve ser "Mensal" ou "Anual".');

  if (data_renovacao != null) {
    const dia = parseInt(data_renovacao, 10);
    if (isNaN(dia) || dia < 1 || dia > 31) erros.push('data_renovacao: dia inválido (1–31).');
  }

  if (data_fim_trial && isNaN(new Date(data_fim_trial).getTime()))
    erros.push('data_fim_trial: formato inválido (use YYYY-MM-DD).');

  return erros;
};

const listarTodas = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM assinaturas ORDER BY criado_em DESC');
    res.json(rows);
  } catch (e) {
    console.error('listarTodas:', e.message);
    res.status(500).json({ erro: 'Erro ao buscar assinaturas.' });
  }
};

const buscarPorId = async (req, res) => {
  if (!ehIdValido(req.params.id))
    return res.status(400).json({ erro: 'ID inválido.' });

  try {
    const { rows } = await pool.query('SELECT * FROM assinaturas WHERE id = $1', [Number(req.params.id)]);
    if (!rows.length) return res.status(404).json({ erro: 'Assinatura não encontrada.' });
    res.json(rows[0]);
  } catch (e) {
    console.error('buscarPorId:', e.message);
    res.status(500).json({ erro: 'Erro ao buscar assinatura.' });
  }
};

const criar = async (req, res) => {
  const { nome, categoria, valor, ciclo_cobranca, data_renovacao, is_trial, data_fim_trial, icone_url, ativo } = req.body;
  const erros = validarCampos({ nome, categoria, valor, ciclo_cobranca, data_renovacao, data_fim_trial });
  if (erros.length) return res.status(400).json({ erro: erros.join(' ') });

  try {
    const { rows } = await pool.query(
      `INSERT INTO assinaturas (nome, categoria, valor, ciclo_cobranca, data_renovacao, is_trial, data_fim_trial, icone_url, ativo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [nome.trim(), categoria.trim(), parseFloat(valor), ciclo_cobranca,
       data_renovacao ?? null, is_trial ?? false, data_fim_trial ?? null,
       icone_url ?? null, ativo ?? true],
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error('criar:', e.message);
    res.status(500).json({ erro: 'Erro ao criar assinatura.' });
  }
};

const atualizar = async (req, res) => {
  if (!ehIdValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido.' });

  const { nome, categoria, valor, ciclo_cobranca, data_renovacao, is_trial, data_fim_trial, icone_url, ativo } = req.body;
  const erros = validarCampos({ nome, categoria, valor, ciclo_cobranca, data_renovacao, data_fim_trial });
  if (erros.length) return res.status(400).json({ erro: erros.join(' ') });

  try {
    const { rows } = await pool.query(
      `UPDATE assinaturas
       SET nome=$1, categoria=$2, valor=$3, ciclo_cobranca=$4, data_renovacao=$5,
           is_trial=$6, data_fim_trial=$7, icone_url=$8, ativo=$9, atualizado_em=NOW()
       WHERE id=$10 RETURNING *`,
      [nome.trim(), categoria.trim(), parseFloat(valor), ciclo_cobranca,
       data_renovacao ?? null, is_trial ?? false, data_fim_trial ?? null,
       icone_url ?? null, ativo ?? true, Number(req.params.id)],
    );
    if (!rows.length) return res.status(404).json({ erro: 'Assinatura não encontrada.' });
    res.json(rows[0]);
  } catch (e) {
    console.error('atualizar:', e.message);
    res.status(500).json({ erro: 'Erro ao atualizar assinatura.' });
  }
};

const deletar = async (req, res) => {
  if (!ehIdValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido.' });

  try {
    const { rows } = await pool.query(
      'DELETE FROM assinaturas WHERE id=$1 RETURNING *', [Number(req.params.id)],
    );
    if (!rows.length) return res.status(404).json({ erro: 'Assinatura não encontrada.' });
    res.json({ mensagem: 'Assinatura removida com sucesso.', assinatura: rows[0] });
  } catch (e) {
    console.error('deletar:', e.message);
    res.status(500).json({ erro: 'Erro ao deletar assinatura.' });
  }
};

module.exports = { listarTodas, buscarPorId, criar, atualizar, deletar };
