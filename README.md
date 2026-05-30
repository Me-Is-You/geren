# Siiiweb

全栈个人网站项目，包含 Vue3 + Pinia 前端、Spring Cloud 微服务后端、Gateway + Nacos、MySQL + Redis + RabbitMQ、JWT 管理后台、Docker / Kubernetes 部署与 Postman / JMeter / Selenium 测试体系。

## 目录结构

```text
frontend/              Vue3 + Pinia + Element Plus 前端
backend/               Spring Boot 2.x + Spring Cloud 微服务
  gateway-service/     统一网关、CORS、JWT 校验
  user-service/        管理员登录、JWT、Redis Token、关于我
  article-service/     文章 CRUD、阅读量、Redis 缓存、RabbitMQ 消息
  project-service/     项目管理
  comment-service/     留言提交、审核、回复、删除
  statistics-service/  访问量与统计接口
infra/                 Docker Compose、Nginx、MySQL 初始化
k8s/                   Kubernetes Namespace、ConfigMap、Deployment、Service、Ingress
tests/                 Postman、JMeter、Selenium
docs/                  API、部署、测试文档
```






## 稳定运行版本规划

已规划所有稳定运行版本、推荐环境、镜像版本、端口映射、发布路线和回滚策略：

```bash
docs/VERSION_PLAN.md
```

检查稳定版本锁定：

```bash
npm run version:check
```

## Docker 优先部署与端口映射

本项目部署逻辑是：**先自动下载 / 安装 Docker，再通过 Docker Compose 将所有服务映射到宿主机端口。**

完整端口映射说明见：

```bash
docs/DOCKER_PORTS.md
```

核心映射：

```text
frontend            1010:80
gateway-service     1011:1011
user-service        1012:1012
article-service     1013:1013
project-service     1014:1014
comment-service     1015:1015
statistics-service  1016:1016
MySQL               3306:3306
Redis               6379:6379
RabbitMQ            5672:5672 / 15672:15672
Nacos               8848:8848 / 9848:9848
```

## Linux / Windows / macOS 自动部署运行

项目已提供跨平台自动部署脚本，会自动检查环境、自动修复下载，并使用 Docker Compose 启动完整服务。

### Linux / macOS

```bash
cd Siiiweb
chmod +x scripts/deploy.sh scripts/env-check.sh scripts/stop.sh
./scripts/env-check.sh
./scripts/deploy.sh
```

### Windows PowerShell

建议使用 PowerShell 运行：

```powershell
cd Siiiweb
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\env-check.ps1
.\scripts\deploy.ps1
```

### 自动检查和修复内容

- Linux：自动安装基础工具和 Docker Engine / Docker Compose 插件
- macOS：自动检测 Homebrew；没有 Homebrew 时尝试安装；没有 Docker Desktop 时尝试 `brew install --cask docker`
- Windows：自动检测 Docker Desktop；没有时尝试使用 `winget` 或 Chocolatey 安装
- 自动启动 / 等待 Docker Desktop 或 Docker 服务
- 自动检查项目关键文件
- 自动检查端口占用
- 自动停止旧 Siiiweb 容器释放端口
- 自动预下载 MySQL、Redis、RabbitMQ、Nacos、Node、Maven、JDK、Nginx 镜像
- 自动构建并启动完整前端、后端和中间件服务

### 访问地址

```text
前端网站:   http://localhost:1010
Gateway:    http://localhost:1011/api
Nacos:      http://localhost:8848/nacos
RabbitMQ:   http://localhost:15672
```

### 停止服务

Linux / macOS：

```bash
./scripts/stop.sh
```

Windows：

```powershell
.\scripts\stop.ps1
```

## 快速启动

### 1. 启动中间件

```bash
./scripts/dev-up.sh
```

会启动 MySQL、Redis、RabbitMQ、Nacos。

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问：`http://localhost:1010`

### 3. 构建前端

```bash
cd frontend
npm run build
```

### 4. 构建后端

```bash
cd backend
mvn -DskipTests package
```

### 5. 后端服务启动顺序

1. Nacos / MySQL / Redis / RabbitMQ
2. `gateway-service`
3. `user-service`
4. `article-service`
5. `project-service`
6. `comment-service`
7. `statistics-service`

## 已实现模块

- Vue3 + Pinia 前端重构
- 三主题动态切换：暗夜黑 / 科技蓝 / 清新绿
- 文章列表、分类、搜索、详情模板
- 项目作品展示
- 留言互动
- 受保护站主简历入口
- JWT 管理后台前端原型
- Spring Cloud 微服务后端骨架与核心接口
- Gateway 路由、跨域、JWT 校验
- Nacos 服务注册发现配置
- MySQL JPA 数据模型
- Redis Token / 阅读量 / 访问量缓存
- RabbitMQ 文章发布异步消息
- Docker Compose 本地中间件
- Kubernetes 部署清单
- Postman 接口测试集合
- JMeter 500 并发压测脚本
- Selenium 关键流程自动化脚本

## 文档

- `docs/API.md`
- `docs/DEPLOYMENT.md`
- `docs/TEST_PLAN.md`

## 安全说明

当前仓库提供完整开发蓝图和可运行前端。真实生产环境中，简历、联系方式和 PDF 文件必须由后端鉴权后返回，不能直接放在静态资源目录中。
