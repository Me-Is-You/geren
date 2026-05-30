# Docker 优先部署与端口映射说明

Siiiweb 的部署策略是：**先自动下载 / 安装 Docker，再通过 Docker Compose 启动所有服务，并将容器端口映射到宿主机端口。**

## 一键部署入口

### Linux / macOS

```bash
cd Siiiweb
chmod +x scripts/deploy.sh scripts/stop.sh
./scripts/deploy.sh
```

### Windows PowerShell

```powershell
cd Siiiweb
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\deploy.ps1
```

## 执行顺序

部署脚本会按以下顺序执行：

1. 检查系统类型：Linux / macOS / Windows。
2. 检查 Docker 是否存在。
3. 如果没有 Docker：
   - Linux / Ubuntu / Debian：自动下载并安装 Docker Engine + Docker Compose 插件。
   - macOS：自动安装 Homebrew（如缺失），再安装 Docker Desktop。
   - Windows：自动使用 winget 或 Chocolatey 安装 Docker Desktop。
4. 启动 Docker 服务 / Docker Desktop。
5. 检查项目文件。
6. 检查端口占用。
7. 预下载基础镜像。
8. 使用 Docker Compose 构建并启动服务。
9. 将容器端口映射到宿主机端口。

## Docker 端口映射

| 服务 | 宿主机端口 | 容器端口 | 访问地址 |
|---|---:|---:|---|
| frontend | 1010 | 80 | http://localhost:1010 |
| gateway-service | 1011 | 1011 | http://localhost:1011/api |
| user-service | 1012 | 1012 | http://localhost:1012 |
| article-service | 1013 | 1013 | http://localhost:1013 |
| project-service | 1014 | 1014 | http://localhost:1014 |
| comment-service | 1015 | 1015 | http://localhost:1015 |
| statistics-service | 1016 | 1016 | http://localhost:1016 |
| MySQL | 3306 | 3306 | localhost:3306 |
| Redis | 6379 | 6379 | localhost:6379 |
| RabbitMQ AMQP | 5672 | 5672 | localhost:5672 |
| RabbitMQ 控制台 | 15672 | 15672 | http://localhost:15672 |
| Nacos HTTP | 8848 | 8848 | http://localhost:8848/nacos |
| Nacos gRPC | 9848 | 9848 | localhost:9848 |

## Docker Compose 文件

完整编排文件：

```bash
infra/docker-compose.full.yml
```

查看端口映射：

```bash
docker compose -f infra/docker-compose.full.yml ps
```

查看日志：

```bash
docker compose -f infra/docker-compose.full.yml logs -f
```

停止服务：

```bash
docker compose -f infra/docker-compose.full.yml down
```
