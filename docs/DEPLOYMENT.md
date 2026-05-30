# 部署说明


## Docker 优先原则

部署脚本会先检查并下载 / 安装 Docker，然后所有服务都通过 Docker Compose 启动，不要求宿主机提前安装 Node、Maven、JDK、MySQL、Redis、RabbitMQ 或 Nacos。

端口映射详见：`docs/DOCKER_PORTS.md`。

## Linux / macOS 自动部署

```bash
cd Siiiweb
chmod +x scripts/deploy.sh scripts/env-check.sh scripts/stop.sh
./scripts/env-check.sh
./scripts/deploy.sh
```

## Windows PowerShell 自动部署

```powershell
cd Siiiweb
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\env-check.ps1
.\scripts\deploy.ps1
```

## 脚本自动处理

- Linux：自动安装 curl、ca-certificates、gnupg、Docker Engine、Docker Compose 插件
- macOS：自动安装 Homebrew（如缺失）和 Docker Desktop（如缺失），并启动 Docker Desktop
- Windows：自动使用 winget 或 Chocolatey 安装 Docker Desktop，并等待 Docker 启动
- 检查项目文件与端口占用
- 停止旧 Siiiweb 容器释放端口
- 预下载基础镜像
- 构建前端、后端微服务镜像
- 启动 MySQL、Redis、RabbitMQ、Nacos、Gateway、各业务服务与前端

## 访问地址

- 前端网站：`http://localhost:1010`
- Gateway API：`http://localhost:1011/api`
- Nacos：`http://localhost:8848/nacos`
- RabbitMQ 控制台：`http://localhost:15672`，账号 / 密码：`siiiweb / siiiweb123`

## 停止服务

Linux / macOS：

```bash
./scripts/stop.sh
```

Windows：

```powershell
.\scripts\stop.ps1
```

## 手动部署

### 启动中间件

```bash
./scripts/dev-up.sh
```

### 前端

```bash
cd frontend
npm install
npm run build
```

### 后端

```bash
cd backend
mvn -DskipTests package
```

### Docker Compose

```bash
docker compose -f infra/docker-compose.full.yml up -d --build
```

### Kubernetes

1. 为各微服务构建镜像并推送到镜像仓库。
2. 修改 `k8s/services.yaml` 中镜像名。
3. 执行：

```bash
./scripts/deploy-k8s.sh
```

## 云服务器端口放行

如果部署到云服务器，请放行：

```text
1010, 1011, 1012, 1013, 1014, 1015, 1016, 8848, 9848, 15672
```

仅访问网站时，最少放行 `1010`。
