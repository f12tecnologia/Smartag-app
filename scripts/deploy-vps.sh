#!/bin/sh
# Deploy na VPS: rebuild Docker com .env do servidor
# Uso: sh scripts/deploy-vps.sh

set -e
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Erro: arquivo .env não encontrado na raiz do projeto."
  exit 1
fi

echo ">> Parando containers..."
docker compose down

echo ">> Build e subida (pode levar alguns minutos)..."
docker compose up --build -d --remove-orphans

echo ">> Aguardando app..."
sleep 5

echo ">> Status:"
docker compose ps

echo ">> Health check:"
curl -s "http://localhost:${PORT:-3002}/api/health" || true
echo ""

echo ">> Últimos logs:"
docker compose logs app --tail 15

echo ""
echo "Deploy concluído. Abra o site e use Ctrl+F5 para ver o botão Editar e editar link curto."
