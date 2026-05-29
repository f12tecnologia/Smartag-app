#!/bin/sh
set -e

# Dentro do container, localhost aponta para o próprio container.
# Se o Postgres está no host da VPS (como no .env com localhost), usa host.docker.internal.
if [ -n "$EXTERNAL_DATABASE_URL" ]; then
  case "$EXTERNAL_DATABASE_URL" in
    *localhost*|*127.0.0.1*)
      export EXTERNAL_DATABASE_URL=$(printf '%s' "$EXTERNAL_DATABASE_URL" | sed 's/localhost/host.docker.internal/g; s/127.0.0.1/host.docker.internal/g')
      ;;
  esac
fi

exec "$@"
