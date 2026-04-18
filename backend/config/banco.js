/**
 * Configuração da conexão com o banco de dados PostgreSQL
 * Utiliza um Pool de conexões para melhor desempenho e reaproveitamento
 */
const { Pool } = require('pg');
require('dotenv').config();

// Cria o pool de conexões usando variáveis de ambiente
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NOME     || 'kua',
  user:     process.env.DB_USUARIO  || 'postgres',
  password: process.env.DB_SENHA    || '',
  max:                20,    // Número máximo de conexões simultâneas no pool
  idleTimeoutMillis:  30000, // Encerra conexões ociosas após 30 segundos
  connectionTimeoutMillis: 2000, // Timeout de 2 segundos para obter uma conexão
});

// Testa a conexão ao inicializar para detectar erros de configuração cedo
pool.connect((erro, cliente, liberarConexao) => {
  if (erro) {
    console.error('Erro ao conectar ao PostgreSQL:', erro.message);
    console.error('   Verifique as variáveis no arquivo .env');
  } else {
    console.log('Conexão com PostgreSQL estabelecida com sucesso!');
    liberarConexao(); // Devolve a conexão ao pool após o teste
  }
});

module.exports = pool;
