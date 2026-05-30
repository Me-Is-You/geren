#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
echo "==== Siiiweb 环境检查：$OS ===="
check_cmd(){ if command -v "$1" >/dev/null 2>&1; then echo "✓ $1: $($1 --version 2>/dev/null | head -n 1 || echo installed)"; else echo "✗ $1: 未安装"; fi; }
check_cmd docker
if command -v docker >/dev/null 2>&1; then docker compose version >/dev/null 2>&1 && echo "✓ docker compose: $(docker compose version)" || echo "✗ docker compose: 未安装"; fi
check_cmd curl
check_cmd node
check_cmd npm
for port in 1010 1011 1012 1013 1014 1015 1016 3306 6379 5672 15672 8848 9848; do
  used=0
  if command -v ss >/dev/null 2>&1 && ss -ltn | awk '{print $4}' | grep -Eq "(^|:)${port}$"; then used=1; fi
  if command -v lsof >/dev/null 2>&1 && lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then used=1; fi
  [ "$used" = 1 ] && echo "! 端口 $port 已被占用" || echo "✓ 端口 $port 可用"
done
echo "==== 检查完成 ===="
