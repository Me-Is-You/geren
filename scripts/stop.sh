#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if docker info >/dev/null 2>&1; then
  docker compose -f infra/docker-compose.full.yml down
elif command -v sudo >/dev/null 2>&1 && sudo docker info >/dev/null 2>&1; then
  sudo docker compose -f infra/docker-compose.full.yml down
else
  echo "Docker 不可用，无法停止服务。"
  exit 1
fi
