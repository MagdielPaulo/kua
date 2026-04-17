#  Ralo Tracker

Gerencie, visualize e controle seus gastos com assinaturas recorrentes e free trials. Nunca mais deixe dinheiro escorrer pelo ralo.

## Funcionalidades

- **CRUD completo** de assinaturas (criar, ler, editar, cancelar)
- **Dashboard financeiro** com custo mensal e projeção anual
- **Gráfico de pizza** de gastos por categoria
- **Alertas de Trial** — destacados em vermelho quando expiram em ≤ 3 dias
- **Sugestão automática de categoria** ao digitar o nome do serviço
- **Próximas faturas** — lista dos vencimentos nos próximos 15 dias
- **Dark mode** por padrão, com foco em clareza de dados financeiros

---

## Stack

| Camada        | Tecnologia                        |
|---------------|-----------------------------------|
| Frontend      | Angular 16 + TypeScript + CSS     |
| Gráficos      | Chart.js 4                        |
| Backend       | Node.js + Express                 |
| Banco de Dados| PostgreSQL                        |
| API           | REST (JSON)                       |

---

## Estrutura do Projeto

```
ralo-tracker/
├── backend/
│   ├── config/
│   │   └── banco.js                  # Conexão PostgreSQL (Pool)
│   ├── controllers/
│   │   └── assinaturasController.js  # Lógica CRUD
│   ├── routes/
│   │   └── assinaturas.js            # Rotas da API
│   ├── migrations/
│   │   └── criar_tabelas.sql         # Schema do banco
│   ├── server.js                     # Entrada do servidor Express
│   ├── .env.example                  # Variáveis de ambiente (exemplo)
│   └── package.json
│
└── frontend/
    └── src/
        └── app/
            ├── modelos/
            │   └── assinatura.model.ts       # Interface + constantes
            ├── servicos/
            │   └── assinatura.service.ts     # Chamadas HTTP à API
            ├── paginas/
            │   ├── dashboard/                # Tela principal
            │   ├── nova-assinatura/          # Formulário de cadastro
            │   └── detalhes-assinatura/      # Edição e cancelamento
            └── componentes/
                ├── card-assinatura/          # Card reutilizável
                └── grafico-gastos/           # Gráfico Chart.js
```

---

## Instalação e Execução

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Angular CLI: `npm install -g @angular/cli`

---

### 1. Banco de Dados

```bash
# Crie o banco de dados no PostgreSQL
psql -U postgres -c "CREATE DATABASE ralo_tracker;"

# Execute a migração (cria tabela e insere dados de exemplo)
psql -U postgres -d ralo_tracker -f backend/migrations/criar_tabelas.sql
```

---

### 2. Backend

```bash
cd backend

# Instala as dependências
npm install

# Cria o arquivo de variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do PostgreSQL

# Inicia o servidor (modo desenvolvimento com hot-reload)
npm run dev

# Ou em produção
npm start
```

O servidor estará disponível em `http://localhost:3000`.

Para verificar: `GET http://localhost:3000/api/saude`

---

### 3. Frontend

```bash
cd frontend

# Instala as dependências
npm install

# Inicia o servidor de desenvolvimento
npm start
```

A aplicação abrirá em `http://localhost:4200`.

---

## Endpoints da API

| Método | Endpoint                   | Descrição                          |
|--------|----------------------------|------------------------------------|
| GET    | `/api/assinaturas`         | Lista todas as assinaturas         |
| GET    | `/api/assinaturas/:id`     | Busca uma assinatura por ID        |
| POST   | `/api/assinaturas`         | Cria uma nova assinatura           |
| PUT    | `/api/assinaturas/:id`     | Atualiza uma assinatura existente  |
| DELETE | `/api/assinaturas/:id`     | Remove uma assinatura              |
| GET    | `/api/saude`               | Verifica saúde do servidor         |

### Exemplo de Payload (POST/PUT)

```json
{
  "nome":            "Netflix",
  "categoria":       "Streaming",
  "valor":           39.90,
  "ciclo_cobranca":  "Mensal",
  "data_renovacao":  15,
  "is_trial":        false,
  "data_fim_trial":  null,
  "ativo":           true
}
```

---

## Categorias Suportadas

| Categoria                 | Exemplos de serviços                              |
|---------------------------|---------------------------------------------------|
| Streaming                 | Netflix, Spotify, Amazon Prime, Max, Disney+      |
| Inteligência Artificial   | ChatGPT Plus, Midjourney, Claude Pro              |
| Educação e Idiomas        | Duolingo Super, Alura, QConcursos, Rocketseat     |
| Softwares/Ferramentas     | Adobe CC, Notion, Google One, GitHub Copilot      |
| Jogos                     | Xbox Game Pass, PlayStation Plus, EA Play         |
| Saúde e Bem-estar         | Gympass, Headspace, Calm                          |
| Finanças                  | Serviços financeiros e de investimento            |
| Outros                    | Qualquer serviço não categorizado acima           |

---

## Deploy na AWS (Sugestão)

### Frontend → Amazon S3 + CloudFront
```bash
# Build de produção
cd frontend
ng build --configuration production

# Envie a pasta dist/ para um bucket S3 com hospedagem estática
aws s3 sync dist/ralo-tracker-frontend/ s3://seu-bucket-ralo-tracker
```

### Backend → AWS Elastic Beanstalk
1. Configure a variável `NODE_ENV=production` no Elastic Beanstalk
2. Configure as variáveis `DB_*` apontando para uma instância RDS PostgreSQL
3. Faça o deploy do diretório `backend/` via EB CLI ou console AWS

---

## Variáveis de Ambiente (Backend)

| Variável       | Padrão       | Descrição                    |
|----------------|--------------|------------------------------|
| `PORTA`        | `3000`       | Porta do servidor Express    |
| `DB_HOST`      | `localhost`  | Host do PostgreSQL           |
| `DB_PORT`      | `5432`       | Porta do PostgreSQL          |
| `DB_NOME`      | `ralo_tracker`| Nome do banco de dados      |
| `DB_USUARIO`   | `postgres`   | Usuário do banco             |
| `DB_SENHA`     | *(vazio)*    | Senha do banco               |
