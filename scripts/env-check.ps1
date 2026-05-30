$ErrorActionPreference = "Continue"
Set-Location (Join-Path $PSScriptRoot "..")
Write-Host "==== Siiiweb Windows 环境检查 ====" -ForegroundColor Cyan

function Check-Command($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if ($cmd) { Write-Host "✓ $name: 已安装" -ForegroundColor Green } else { Write-Host "✗ $name: 未安装" -ForegroundColor Red }
}

Check-Command docker
Check-Command winget
Check-Command choco
Check-Command node
Check-Command npm

if (Get-Command docker -ErrorAction SilentlyContinue) {
  try { docker compose version; docker info | Out-Null; Write-Host "✓ Docker 正在运行" -ForegroundColor Green } catch { Write-Host "! Docker 已安装但未运行，请启动 Docker Desktop" -ForegroundColor Yellow }
}

foreach ($port in @(1010,1011,1012,1013,1014,1015,1016,3306,6379,5672,15672,8848,9848)) {
  $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if ($conn) { Write-Host "! 端口 $port 已被占用" -ForegroundColor Yellow } else { Write-Host "✓ 端口 $port 可用" -ForegroundColor Green }
}
Write-Host "==== 检查完成 ====" -ForegroundColor Cyan
