# Deploy Smartag-app no Ubuntu 24.04 com aaPanel

Guia para rodar a Smartag-app em produção no Ubuntu 24.04 usando o painel aaPanel.

## Atenção: onde configurar a aplicação

A tela **"Adicionar nós"** (Add nodes) serve para **adicionar outro painel aaPanel como nó** (URL do painel, Chave da API). **Não é aí que se configura a Smartag-app.**

Para a Smartag-app, use no menu lateral:

- **Node** (ou **Node version manager**) → **Add Node project** (adicionar projeto Node)

Naquele formulário preencha assim:

| Campo | Valor |
|-------|--------|
| **Path** | `/www/Smartag-app` (caminho da pasta do projeto) |
| **Name** | `Smartag-app` |
| **Run opt** | `node server/index.js` ou `npm start` |
| **Port** | `3002` |
| **Node version** | 18 ou 20 LTS |
| **Domain** | `smartag.dreamsparkshow.com.br` (ou seu domínio) |

Nas variáveis de ambiente do mesmo projeto Node, defina: `EXTERNAL_DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`, `PORT=3002`.

## Pré-requisitos

- Ubuntu 24.04 com aaPanel instalado
- PostgreSQL acessível (no próprio servidor ou remoto)
- Domínio ou subdomínio apontando para o IP do servidor (para SSL e proxy)

## Passo 1 – Código no servidor

- Clonar ou fazer upload do projeto para um diretório sob o aaPanel (ex.: `/www/wwwroot/Smartag-app` ou `/www/Smartag-app`)
- Garantir que a pasta contenha `package.json`, `server/`, `src/`, etc.

## Passo 2 – Node no aaPanel

- Em **Node** (ou **Node version manager**), instalar Node.js 18 ou 20 LTS
- **Add Node project**:
  - **Path**: diretório do projeto (ex.: `/www/Smartag-app`)
  - **Name**: `Smartag-app`
  - **Run opt**: `node server/index.js` (ou `npm start`)
  - **Port**: `3002` (ou o valor de `PORT` que for usado)
  - **Node version**: 18 ou 20
  - **Domain**: domínio desejado (ex.: `smartag.dreamsparkshow.com.br`)

## Passo 3 – Variáveis de ambiente

No projeto Node no aaPanel, em **Environment** (ou equivalente), definir:

- `EXTERNAL_DATABASE_URL`: connection string do PostgreSQL
- `SESSION_SECRET`: chave secreta para JWT
- `NODE_ENV`: `production`
- `PORT`: `3002` (ou a porta escolhida no passo 2)

## Passo 4 – Dependências e build

No terminal do aaPanel (ou SSH), na pasta do projeto:

```bash
npm install
npm run build
```

Garantir que a pasta `dist` seja criada.

## Passo 5 – Tabelas e usuário admin

- Se o banco ainda não tiver a tabela `users`, subir o app uma vez para o `initializeDatabase()` em `server/db.js` criar as tabelas, ou criar manualmente
- Rodar `node tools/seed-admin.js` para criar/atualizar os usuários admin (usando o mesmo `.env` ou variáveis do aaPanel)

## Passo 6 – Iniciar e mapear domínio

- No aaPanel: **Start** (ou **Restart**) no projeto Node
- Em **Domain Manager** / **Mapping**, vincular o domínio à porta configurada (ex.: 3002)
- Opcional: em **SSL**, ativar certificado para HTTPS

## Resolução de 502

- Verificar se o projeto está **Running** e se a porta no aaPanel é a mesma de `PORT`
- Consultar **Project log** do Node e **Error log** do nginx para erros de conexão (ex.: banco ou variáveis faltando)
