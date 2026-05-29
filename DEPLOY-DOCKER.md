# Deploy Smartag-app com Docker (VPS)

Guia para publicar alterações na VPS usando Docker e o arquivo `.env` do servidor.

## Pré-requisitos

- Docker e Docker Compose instalados na VPS
- Arquivo `.env` na pasta do projeto com:
  - `EXTERNAL_DATABASE_URL` (PostgreSQL do host ou remoto)
  - `SESSION_SECRET`
  - `PORT=3002` (opcional)

Se o Postgres está no **host** da VPS e a URL usa `localhost`, o entrypoint do container reescreve automaticamente para `host.docker.internal`.

## Publicar alterações (obrigatório usar --build)

Na pasta do projeto (ex.: `/www/wwwroot/Smartag-app`):

```bash
cd /www/wwwroot/Smartag-app

# Atualizar código
git pull
# ou enviar arquivos via SFTP (src/, server/, docker/, package.json, etc.)

# Rebuild completo — sem --build a VPS continua com imagem antiga
docker compose down
docker compose up --build -d

# Remover container órfão de Postgres antigo (se existir)
docker compose up --build -d --remove-orphans
```

## Verificar se subiu corretamente

```bash
docker compose ps
docker compose logs app --tail 30
curl -s http://localhost:3002/api/health
```

Resposta esperada: `{"status":"ok",...}`

## Superadmin (primeira vez ou reset de senha)

```bash
docker compose --profile seed run --rm seed
```

## Validar funcionalidades no navegador

1. Acesse `http://SEU_IP:3002` ou seu domínio
2. **Ctrl+F5** (hard refresh) para limpar cache do frontend
3. No dashboard, cada URL deve mostrar o botão **Editar** (âmbar)
4. Editar → alterar **Identificador do link** → salvar
5. Testar `/redirect/novo-identificador`

## Desenvolvimento local com Postgres no Docker

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile local-db up --build -d
```

## Problemas comuns

| Sintoma | Causa | Solução |
|---------|--------|---------|
| Sem botão Editar | `dist` antigo na imagem | `docker compose up --build -d` |
| ERR_CONNECTION_REFUSED | Container não sobe | `docker compose logs app` |
| `exec entrypoint.sh: no such file` | CRLF no script (Windows) | Rebuild após pull (Dockerfile corrige com `sed`) |
| Erro de senha no banco | `.env` incorreto ou Postgres errado | Ajustar `EXTERNAL_DATABASE_URL` no `.env` |
| Invalid Date na lista | Build antigo | Rebuild + Ctrl+F5 |
| Login: AggregateError | App sem acesso ao Postgres (seed OK, app não) | Ver seção abaixo |

## Login falha com AggregateError (seed OK, site não loga)

O `npm run seed:superadmin` usa o `.env` **no host** e conecta ao Postgres.

O site (aaPanel ou Docker) precisa da **mesma** `EXTERNAL_DATABASE_URL`.

**aaPanel (Node sem Docker):**

1. Em **Environment** do projeto Node, defina `EXTERNAL_DATABASE_URL` e `SESSION_SECRET` (igual ao `.env`).
2. **Restart** do projeto na porta 3002.
3. Teste: `curl -s http://127.0.0.1:3002/api/health`

**Docker:**

```bash
cd /www/Smartag-app
cat .env   # conferir EXTERNAL_DATABASE_URL
docker compose up -d
docker compose logs app --tail 20
curl -s http://127.0.0.1:3002/api/auth/debug
```

Resposta esperada de `/api/auth/debug`: `"hasDatabaseUrl":true` e `"dbConnected":true`

### Porta 3002 já em uso (`address already in use`)

Dois processos não podem usar a mesma porta. Escolha **um** método:

```bash
ss -tlnp | grep 3002
# ou: fuser -v 3002/tcp
```

**Só Docker:** pare o projeto Node no aaPanel → `docker compose down` → `docker compose up --build -d`

**Só aaPanel:** `docker compose down` → reinicie o projeto Node na porta 3002 com `EXTERNAL_DATABASE_URL` no painel

## aaPanel sem Docker

Use [DEPLOY-AAPANEL.md](DEPLOY-AAPANEL.md): `npm install`, `npm run build`, reiniciar projeto Node na porta 3002.
