param(
  [switch]$SkipPull
)

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$ComposeFile = "infra/docker-compose.full.yml"
$RequiredPorts = @(1010,1011,1012,1013,1014,1015,1016,3306,6379,5672,15672,8848,9848)

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

function Test-Admin {
  $current = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($current)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-Command($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

function Ensure-WingetOrChoco {
  if (Test-Command winget) { return "winget" }
  if (Test-Command choco) { return "choco" }
  Write-Err "未检测到 winget 或 Chocolatey，无法自动安装 Docker Desktop。请先安装 winget，或手动安装 Docker Desktop。"
  exit 1
}

function Ensure-Docker {
  if ((Test-Command docker) -and ((docker compose version) 2>$null)) {
    try { docker info *> $null; Write-Info "Docker 已安装并运行。"; return } catch {}
  }

  Write-Warn "未检测到可用 Docker Desktop，尝试自动安装 / 修复。"
  $pm = Ensure-WingetOrChoco
  if ($pm -eq "winget") {
    Write-Info "使用 winget 安装 Docker Desktop..."
    winget install -e --id Docker.DockerDesktop --accept-source-agreements --accept-package-agreements
  } else {
    Write-Info "使用 Chocolatey 安装 Docker Desktop..."
    if (-not (Test-Admin)) { Write-Warn "Chocolatey 安装通常需要管理员权限，如失败请用管理员 PowerShell 重试。" }
    choco install docker-desktop -y
  }

  $dockerExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
  if (Test-Path $dockerExe) {
    Write-Info "启动 Docker Desktop..."
    Start-Process $dockerExe | Out-Null
  } else {
    Write-Warn "未找到 Docker Desktop.exe，请手动启动 Docker Desktop。"
  }

  Write-Info "等待 Docker Desktop 启动，最多等待 5 分钟..."
  for ($i = 0; $i -lt 150; $i++) {
    Start-Sleep -Seconds 2
    try {
      docker info *> $null
      if ($LASTEXITCODE -eq 0) { Write-Info "Docker 已就绪。"; return }
    } catch {}
  }

  Write-Err "Docker Desktop 未能自动启动。请手动打开 Docker Desktop，等待 Running 后重新运行本脚本。"
  exit 1
}

function Check-ProjectFiles {
  Write-Info "检查项目关键文件..."
  $files = @(
    "frontend/Dockerfile",
    "frontend/nginx.conf",
    "backend/Dockerfile",
    $ComposeFile,
    "infra/mysql-init.sql",
    "backend/pom.xml"
  )
  foreach ($file in $files) {
    if (-not (Test-Path $file)) { Write-Err "缺少文件：$file"; exit 1 }
  }
  if (Test-Command node) { node scripts/stack-check.js } else { Write-Warn "未安装 Node.js，跳过本地结构检查；Docker 构建会自动下载依赖。" }
}

function Check-AndFixPorts {
  Write-Info "检查端口占用..."
  $occupied = @()
  foreach ($port in $RequiredPorts) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) { $occupied += $port }
  }
  if ($occupied.Count -gt 0) {
    Write-Warn "检测到端口被占用：$($occupied -join ', ')"
    Write-Warn "尝试停止旧的 Siiiweb 容器释放端口..."
    docker compose -f $ComposeFile down --remove-orphans
    Start-Sleep -Seconds 2
  }
}

function Pull-BaseImages {
  if ($SkipPull) { return }
  Write-Info "预下载基础镜像..."
  $images = @(
    "mysql:8.0",
    "redis:6.2-alpine",
    "rabbitmq:3.13-management",
    "nacos/nacos-server:v2.3.2",
    "node:20-alpine",
    "nginx:1.25-alpine",
    "maven:3.9-eclipse-temurin-17",
    "eclipse-temurin:17-jre-alpine"
  )
  foreach ($image in $images) {
    try { docker pull $image } catch { Write-Warn "镜像下载失败，后续 build 会再次尝试：$image" }
  }
}

function Wait-Http($name, $url, $seconds = 180) {
  Write-Info "等待 $name 就绪：$url"
  for ($i = 0; $i -lt $seconds; $i++) {
    try {
      Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 | Out-Null
      Write-Info "$name 已就绪。"
      return
    } catch { Start-Sleep -Seconds 1 }
  }
  Write-Warn "$name 在 ${seconds}s 内未就绪，请稍后查看日志。"
}

Write-Info "Siiiweb Windows 自动部署开始。"
Ensure-Docker
Check-ProjectFiles
Check-AndFixPorts
Pull-BaseImages

Write-Info "构建并启动完整服务。首次执行会下载 Maven / npm 依赖，请耐心等待..."
docker compose -f $ComposeFile up -d --build

Write-Info "当前容器状态："
docker compose -f $ComposeFile ps

Wait-Http "前端网站" "http://localhost:1010" 180
Wait-Http "Nacos" "http://localhost:8848/nacos" 180
Wait-Http "RabbitMQ" "http://localhost:15672" 180

Write-Host ""
Write-Info "Siiiweb 部署完成。"
Write-Host "- 前端网站:   http://localhost:1010"
Write-Host "- Gateway API: http://localhost:1011/api"
Write-Host "- Nacos:       http://localhost:8848/nacos"
Write-Host "- RabbitMQ:    http://localhost:15672  用户名/密码: siiiweb / siiiweb123"
Write-Host "查看日志：docker compose -f $ComposeFile logs -f"
Write-Host "停止服务：./scripts/stop.ps1"
