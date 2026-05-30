#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

REQUIRED_PORTS=(1010 1011 1012 1013 1014 1015 1016 3306 6379 5672 15672 8848 9848)
COMPOSE_FILE="infra/docker-compose.full.yml"
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
DOCKER="docker"

log() { echo -e "\033[1;36m[INFO]\033[0m $*"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $*"; }
err() { echo -e "\033[1;31m[ERROR]\033[0m $*"; }

need_sudo() {
  if [ "${EUID:-$(id -u)}" -eq 0 ]; then echo ""; return; fi
  if command -v sudo >/dev/null 2>&1; then echo "sudo"; return; fi
  echo ""
}
SUDO="$(need_sudo)"
run_sudo() { if [ -n "$SUDO" ]; then $SUDO "$@"; else "$@"; fi; }

is_linux() { [ "$OS" = "linux" ]; }
is_macos() { [ "$OS" = "darwin" ]; }
is_debian_like() { [ -f /etc/debian_version ] || grep -qiE 'ubuntu|debian' /etc/os-release 2>/dev/null; }

ensure_linux_base_tools() {
  if ! is_linux; then return; fi
  if ! command -v curl >/dev/null 2>&1 || ! dpkg -s ca-certificates >/dev/null 2>&1 || ! dpkg -s gnupg >/dev/null 2>&1; then
    if is_debian_like; then
      log "Linux: 自动安装基础工具 curl / ca-certificates / gnupg..."
      run_sudo apt-get update
      run_sudo apt-get install -y ca-certificates curl gnupg lsb-release net-tools lsof
    else
      warn "当前 Linux 不是 Ubuntu/Debian，无法自动使用 apt 安装基础工具。请手动安装 curl、Docker、Docker Compose。"
    fi
  fi
}

ensure_macos_homebrew() {
  if ! is_macos; then return; fi
  if ! command -v brew >/dev/null 2>&1; then
    log "macOS: 未检测到 Homebrew，尝试自动安装..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    if [ -x /opt/homebrew/bin/brew ]; then eval "$(/opt/homebrew/bin/brew shellenv)"; fi
    if [ -x /usr/local/bin/brew ]; then eval "$(/usr/local/bin/brew shellenv)"; fi
  fi
}

ensure_docker_linux() {
  ensure_linux_base_tools
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then return; fi
  if is_debian_like; then
    log "Linux: 自动安装 / 修复 Docker Engine 与 Compose 插件..."
    curl -fsSL https://get.docker.com -o /tmp/siiiweb-get-docker.sh
    run_sudo sh /tmp/siiiweb-get-docker.sh
    rm -f /tmp/siiiweb-get-docker.sh
    if command -v systemctl >/dev/null 2>&1; then
      run_sudo systemctl enable docker || true
      run_sudo systemctl start docker || true
    fi
    if ! docker compose version >/dev/null 2>&1; then
      run_sudo apt-get update
      run_sudo apt-get install -y docker-compose-plugin
    fi
  else
    err "未检测到 Docker。当前 Linux 发行版暂不支持自动安装，请手动安装 Docker Engine 与 Compose 插件。"
    exit 1
  fi
}

ensure_docker_macos() {
  ensure_macos_homebrew
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1 && docker info >/dev/null 2>&1; then return; fi
  if ! command -v docker >/dev/null 2>&1; then
    log "macOS: 自动安装 Docker Desktop..."
    brew install --cask docker
  fi
  if ! docker info >/dev/null 2>&1; then
    log "macOS: 启动 Docker Desktop，请等待 Docker 完成启动..."
    open -a Docker || true
    for _ in $(seq 1 180); do
      if docker info >/dev/null 2>&1; then break; fi
      sleep 2
    done
  fi
  if ! docker info >/dev/null 2>&1; then
    err "Docker Desktop 未启动。请手动打开 Docker Desktop，等待状态为 Running 后重新运行脚本。"
    exit 1
  fi
}

ensure_docker() {
  if is_linux; then ensure_docker_linux; elif is_macos; then ensure_docker_macos; else err "当前脚本仅支持 Linux/macOS。Windows 请运行 scripts/deploy.ps1"; exit 1; fi
  if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
    err "Docker 或 Docker Compose 不可用。"
    exit 1
  fi
}

choose_docker_cmd() {
  if docker info >/dev/null 2>&1; then DOCKER="docker"; return; fi
  if is_linux && [ -n "$SUDO" ] && $SUDO docker info >/dev/null 2>&1; then
    DOCKER="$SUDO docker"
    warn "当前用户暂无 Docker 权限，本次将使用 sudo docker。"
    warn "如需免 sudo：sudo usermod -aG docker \$USER，然后重新登录。"
    return
  fi
  err "Docker 服务不可用，请启动 Docker。"
  exit 1
}

check_project_files() {
  log "检查项目关键文件..."
  local files=("frontend/Dockerfile" "frontend/nginx.conf" "backend/Dockerfile" "$COMPOSE_FILE" "infra/mysql-init.sql" "backend/pom.xml")
  for file in "${files[@]}"; do [ -f "$file" ] || { err "缺少文件：$file"; exit 1; }; done
  if command -v node >/dev/null 2>&1; then node scripts/stack-check.js; else warn "未安装 Node.js，跳过本地结构检查；Docker 构建会自动下载依赖。"; fi
}

port_is_used() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then ss -ltn | awk '{print $4}' | grep -Eq "(^|:)${port}$" && return 0; fi
  if command -v lsof >/dev/null 2>&1; then lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1 && return 0; fi
  return 1
}

check_and_fix_ports() {
  log "检查端口占用..."
  local occupied=()
  for port in "${REQUIRED_PORTS[@]}"; do if port_is_used "$port"; then occupied+=("$port"); fi; done
  if [ "${#occupied[@]}" -gt 0 ]; then
    warn "检测到端口被占用：${occupied[*]}"
    warn "尝试停止旧的 Siiiweb 容器释放端口..."
    $DOCKER compose -f "$COMPOSE_FILE" down --remove-orphans || true
    sleep 2
    local still=()
    for port in "${occupied[@]}"; do if port_is_used "$port"; then still+=("$port"); fi; done
    if [ "${#still[@]}" -gt 0 ]; then warn "以下端口仍被其他程序占用：${still[*]}。如启动失败，请手动释放端口。"; fi
  fi
}

pull_base_images() {
  log "预下载基础镜像..."
  local images=("mysql:8.0" "redis:6.2-alpine" "rabbitmq:3.13-management" "nacos/nacos-server:v2.3.2" "node:20-alpine" "nginx:1.25-alpine" "maven:3.9-eclipse-temurin-17" "eclipse-temurin:17-jre-alpine")
  for image in "${images[@]}"; do $DOCKER pull "$image" || warn "镜像下载失败，后续 build 会再次尝试：$image"; done
}

wait_http() {
  local name="$1" url="$2" seconds="${3:-120}"
  log "等待 $name 就绪：$url"
  for _ in $(seq 1 "$seconds"); do curl -fsS "$url" >/dev/null 2>&1 && { log "$name 已就绪。"; return 0; }; sleep 1; done
  warn "$name 在 ${seconds}s 内未就绪，请查看日志。"; return 1
}

main() {
  log "Siiiweb 跨平台自动部署开始：$OS"
  ensure_docker
  choose_docker_cmd
  check_project_files
  check_and_fix_ports
  pull_base_images
  log "构建并启动完整服务。首次执行会下载 Maven / npm 依赖，请耐心等待..."
  $DOCKER compose -f "$COMPOSE_FILE" up -d --build
  log "当前容器状态："
  $DOCKER compose -f "$COMPOSE_FILE" ps
  wait_http "前端网站" "http://localhost:1010" 180 || true
  wait_http "Nacos" "http://localhost:8848/nacos" 180 || true
  wait_http "RabbitMQ" "http://localhost:15672" 180 || true
  echo ""
  log "Siiiweb 部署完成。"
  echo "- 前端网站:   http://localhost:1010"
  echo "- Gateway API: http://localhost:1011/api"
  echo "- Nacos:       http://localhost:8848/nacos"
  echo "- RabbitMQ:    http://localhost:15672  用户名/密码: siiiweb / siiiweb123"
  echo "查看日志：$DOCKER compose -f $COMPOSE_FILE logs -f"
  echo "停止服务：./scripts/stop.sh"
}
main "$@"
