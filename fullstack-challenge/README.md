# DynaPredict - Desafio Fullstack

Aplicacao de monitoramento de ativos com autenticacao, gestao de maquinas, pontos de monitoramento e sensores.

## Tecnologias

- **Frontend**: Next.js 16, React 19, TypeScript, Material UI 5, Redux Toolkit
- **Backend**: Nest.js, Prisma, PostgreSQL
- **Monorepo**: Nx
- **Testes**: Jest (unitarios), Cypress (e2e)

## Pre-requisitos

- Node.js 18+
- Docker (para PostgreSQL) ou PostgreSQL instalado
- npm

## Como executar

Existem tres cenarios de execucao:

---

### Cenario 1: Banco Supabase + API e Frontend locais

Use quando tiver um banco PostgreSQL no Supabase (ou similar) e quiser rodar API e frontend na sua maquina.

1. **Configurar variaveis de ambiente**

   Crie `api/.env` (use `api/.env.example` como referencia das variaveis):
   ```
   DATABASE_URL="postgresql://postgres:[SENHA]@[HOST]:5432/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:[SENHA]@[HOST]:5432/postgres"
   JWT_SECRET="dynapredict-secret"
   PORTA=3333
   ```
   (Substitua `[SENHA]` e `[HOST]` pelos dados do seu projeto Supabase.)

   Crie `web/.env.local` (opcional; use `web/.env.local.example` como base):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3333
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Migracoes e seed**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. **Iniciar API e frontend** (em dois terminais distintos)
   ```bash
   # Terminal 1
   npm run dev:api

   # Terminal 2
   npm run dev:web
   ```

   O frontend depende da API estar rodando para login e operacoes CRUD.

   Acesso: http://localhost:3000 (frontend) e http://localhost:3333 (API).

---

### Cenario 2: Banco no Docker + API e Frontend locais

Use quando quiser rodar o PostgreSQL em um container e o resto na maquina.

1. **Subir apenas o Postgres**
   ```bash
   docker-compose up -d postgres
   ```

2. **Configurar variaveis de ambiente**

   Crie `api/.env` (use `api/.env.example` como referencia):
   ```
   DATABASE_URL="postgresql://dynapredict:dynapredict@localhost:5432/dynapredict"
   DIRECT_URL="postgresql://dynapredict:dynapredict@localhost:5432/dynapredict"
   JWT_SECRET="dynapredict-secret"
   PORTA=3333
   ```

   Crie `web/.env.local` (opcional; use `web/.env.local.example` como base):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3333
   ```

3. **Instalar dependencias**
   ```bash
   npm install
   ```

4. **Migracoes e seed**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

5. **Iniciar API e frontend** (em dois terminais distintos)
   ```bash
   # Terminal 1
   npm run dev:api

   # Terminal 2
   npm run dev:web
   ```

   O frontend depende da API estar rodando para login e operacoes CRUD.

   Acesso: http://localhost:3000 e http://localhost:3333.

---

### Cenario 3: Tudo no Docker

Use quando quiser rodar banco, API e frontend em containers.

1. **Subir a stack inteira**
   ```bash
   docker-compose up -d --build
   ```

   O primeiro build pode demorar alguns minutos. Nas execucoes seguintes, `docker-compose up -d` e suficiente. A API executa `prisma migrate deploy` e `prisma db seed` automaticamente na inicializacao.

2. **Acesso**
   - Frontend: http://localhost:3000
   - API: http://localhost:3333

Para customizar a URL da API no build do frontend:
```bash
docker-compose build --build-arg NEXT_PUBLIC_API_URL=https://sua-api.com web
docker-compose up -d
```

### Credenciais de login

- Email: `admin@dynapredict.com`
- Senha: `senha123`

## Testes e2e (Cypress)

Para rodar os testes e2e, o frontend e a API devem estar rodando (cenarios 1, 2 ou 3).

1. **Inicie web e API** (em terminais separados):
   ```bash
   npm run dev:api
   npm run dev:web
   ```

2. **Execute os testes Cypress** (a partir do diretorio `web-e2e`):
   ```bash
   cd web-e2e
   npx cypress run --config baseUrl=http://localhost:3000
   ```

   Ou da raiz do projeto:
   ```bash
   npx cypress run --config-file web-e2e/cypress.config.ts --config baseUrl=http://localhost:3000
   ```

Para abrir o Cypress em modo interativo:
   ```bash
   cd web-e2e
   npx cypress open
   ```

## Scripts disponiveis

| Comando | Descricao |
|---------|-----------|
| `npm run dev:web` | Inicia frontend em modo desenvolvimento |
| `npm run dev:api` | Inicia API em modo desenvolvimento |
| `npm run build:web` | Build do frontend |
| `npm run build:api` | Build da API |
| `npm test` | Executa testes unitarios |
| `npm run e2e` | Executa testes e2e Cypress (requer web e API rodando) |
| `npm run prisma:generate` | Gera cliente Prisma |
| `npm run prisma:migrate` | Executa migracoes |
| `npm run prisma:seed` | Popula banco com usuario padrao |

## Premissas e decisoes

1. **Credenciais fixas**: Login unico com email/senha pre-definidos (seed)
2. **Sensor ID**: O identificador unico do sensor e informado pelo usuario e deve ser unico no sistema
3. **Minimo 2 pontos por maquina**: Regra de negocio validada na UX; nao ha bloqueio no backend
4. **Regra Pump + sensores**: Maquinas tipo Pump nao aceitam sensores TcAg ou TcAs, apenas HF+
5. **Modelo HF+**: No banco armazenado como HFPlus (enum Prisma nao aceita +)
6. **Pagina pontos**: 5 itens por pagina, ordenacao por todas as colunas
7. **Codigo em portugues**: Variaveis, funcoes e mensagens em PT-BR
8. **camelCase**: Padrao adotado em todo o codigo

## Estrutura do projeto

```
fullstack-challenge/
├── api/                 # Backend Nest.js
│   ├── prisma/          # Schema e seed
│   └── src/
│       ├── auth/
│       ├── maquinas/
│       ├── pontos-monitoramento/
│       └── prisma/
├── web/                 # Frontend Next.js
│   └── src/
│       ├── app/         # Rotas e paginas
│       ├── components/
│       ├── store/       # Redux
│       ├── services/
│       └── types/
└── web-e2e/             # Testes Cypress e2e
```