# Siiiweb 稳定运行版本规划

本文档用于统一规划 Siiiweb 在 Linux、Windows、macOS 与 Docker 环境中的稳定运行版本，避免因版本不一致导致部署失败。

## 1. 总体原则

- **生产部署优先使用 Docker Compose**：宿主机只需要 Docker / Docker Desktop，不要求安装 Node、Maven、JDK、MySQL、Redis、RabbitMQ、Nacos。
- **镜像版本固定**：所有基础镜像使用明确版本号，不使用 `latest`。
- **本地开发版本固定区间**：开发机如需本地运行前后端，应使用推荐版本。
- **端口固定**：统一使用 1010 - 1016 对外映射。
- **先跑通稳定版，再升级依赖**：升级前先建立备份和回滚方案。

---

## 2. 推荐稳定运行环境

### 2.1 操作系统稳定版本

| 平台 | 推荐版本 | 说明 |
|---|---|---|
| Ubuntu | Ubuntu 22.04 LTS / 24.04 LTS | 最推荐服务器环境 |
| Debian | Debian 12 | 可作为 Linux 服务器替代方案 |
| Windows | Windows 10 22H2 / Windows 11 23H2+ | 推荐使用 Docker Desktop + WSL2 |
| macOS Intel | macOS 13 Ventura / 14 Sonoma / 15 Sequoia | Docker Desktop 支持 |
| macOS Apple Silicon | macOS 13 Ventura / 14 Sonoma / 15 Sequoia | Docker Desktop 支持 |

### 2.2 宿主机必需组件

| 组件 | 稳定版本 | 说明 |
|---|---|---|
| Docker Engine | 24.x / 25.x / 26.x / 27.x | Linux 推荐 Docker 官方安装脚本 |
| Docker Compose Plugin | v2.20+ | 必须支持 `docker compose` 命令 |
| Docker Desktop | 4.28+ | Windows / macOS 推荐 |
| Git | 2.34+ | 用于拉取和管理项目 |
| PowerShell | 5.1+ / 7.x | Windows 自动部署脚本 |
| Bash | 4.x+ | Linux / macOS 自动部署脚本 |

> 生产部署模式下，Node、Maven、JDK 等会在 Docker 构建容器中使用，不要求宿主机安装。

---

## 3. Docker 镜像稳定版本

| 服务 | 镜像 | 当前锁定版本 | 用途 |
|---|---|---|---|
| 前端构建 | `node` | `20-alpine` | Vue3 前端构建 |
| 前端运行 | `nginx` | `1.25-alpine` | 静态资源服务 / 反向代理 |
| 后端构建 | `maven` | `3.9-eclipse-temurin-17` | Spring Cloud 微服务构建 |
| 后端运行 | `eclipse-temurin` | `17-jre-alpine` | Java 服务运行 |
| MySQL | `mysql` | `8.0` | 数据库 |
| Redis | `redis` | `6.2-alpine` | 缓存 / Token / 计数 |
| RabbitMQ | `rabbitmq` | `3.13-management` | 消息队列 + 管理台 |
| Nacos | `nacos/nacos-server` | `v2.3.2` | 服务注册与发现 |

---

## 4. 前端稳定版本

| 组件 | 稳定版本 | 说明 |
|---|---|---|
| Node.js | 20 LTS | Docker 构建使用 `node:20-alpine` |
| Vite | 6.x | 前端构建工具 |
| Vue | 3.5.x | 前端框架 |
| Pinia | 2.3.x | 状态管理 |
| Element Plus | 2.9.x | UI 组件库 |
| Axios | 1.7.x | HTTP 请求 |

前端端口：

```text
宿主机 1010 -> 容器 80
```

---

## 5. 后端稳定版本

| 组件 | 稳定版本 | 说明 |
|---|---|---|
| Java | 17 LTS | Spring Boot 2.7 推荐长期稳定版本 |
| Maven | 3.9.x | 构建工具 |
| Spring Boot | 2.7.18 | 稳定维护版本 |
| Spring Cloud | 2021.0.8 | 对应 Spring Boot 2.7.x |
| Spring Cloud Alibaba | 2021.0.5.0 | Nacos 适配 |
| JJWT | 0.11.5 | JWT 工具 |
| MySQL Connector | 8.x | 数据库驱动 |

后端端口：

| 服务 | 端口 |
|---|---:|
| gateway-service | 1011 |
| user-service | 1012 |
| article-service | 1013 |
| project-service | 1014 |
| comment-service | 1015 |
| statistics-service | 1016 |

---

## 6. 中间件稳定版本

| 中间件 | 稳定版本 | 端口 |
|---|---|---:|
| MySQL | 8.0 | 3306 |
| Redis | 6.2 | 6379 |
| RabbitMQ | 3.13-management | 5672 / 15672 |
| Nacos | 2.3.2 | 8848 / 9848 |

---

## 7. 端口映射稳定版

| 服务 | 宿主机端口 | 容器端口 |
|---|---:|---:|
| frontend | 1010 | 80 |
| gateway-service | 1011 | 1011 |
| user-service | 1012 | 1012 |
| article-service | 1013 | 1013 |
| project-service | 1014 | 1014 |
| comment-service | 1015 | 1015 |
| statistics-service | 1016 | 1016 |
| MySQL | 3306 | 3306 |
| Redis | 6379 | 6379 |
| RabbitMQ | 5672 / 15672 | 5672 / 15672 |
| Nacos | 8848 / 9848 | 8848 / 9848 |

---

## 8. 稳定发布版本规划

### v1.0.0-stable：全栈可部署基础版

目标：确保项目能在 Linux / Windows / macOS 通过 Docker 一键部署运行。

包含：

- Vue3 + Pinia 前端
- Spring Cloud 微服务骨架
- Gateway + Nacos
- MySQL + Redis + RabbitMQ
- JWT 管理后台基础链路
- Docker Compose 全量编排
- 跨平台自动部署脚本
- Postman / JMeter / Selenium 测试脚本

状态：当前规划目标版本。

### v1.1.0-stable：后台管理增强版

目标：完善后台管理真实 CRUD。

计划：

- 文章 Markdown 编辑器
- 项目封面上传
- 评论审核与回复页面
- 关于我配置管理
- 用户启用 / 禁用
- Swagger 接口文档

### v1.2.0-stable：安全增强版

目标：提升安全性与隐私保护。

计划：

- 简历数据后端鉴权返回
- PDF 简历后端鉴权下载
- JWT 黑名单 / Token 刷新
- BCrypt 密码强度策略
- Gateway 限流
- 参数校验与统一异常处理
- HTTPS 部署文档

### v1.3.0-stable：高可用部署版

目标：适配服务器和 K8s 生产环境。

计划：

- K8s 多副本部署
- Nginx HTTPS Ingress
- MySQL 数据持久化与备份
- Redis 持久化与可选哨兵
- Prometheus + Grafana 监控
- 日志收集方案

### v1.4.0-stable：搜索与性能优化版

目标：增强文章搜索和性能。

计划：

- Elasticsearch / OpenSearch 集成
- RabbitMQ 异步索引更新
- 热门文章缓存
- 前端按路由懒加载
- 静态资源 gzip / brotli
- JMeter 性能基线报告

---

## 9. 回滚策略

每次升级前：

```bash
docker compose -f infra/docker-compose.full.yml ps
docker compose -f infra/docker-compose.full.yml logs --tail=200 > logs-before-upgrade.txt
```

备份数据库：

```bash
docker exec siiiweb-mysql mysqldump -uroot -proot123456 siiiweb > siiiweb-backup.sql
```

回滚镜像：

```bash
docker compose -f infra/docker-compose.full.yml down
docker compose -f infra/docker-compose.full.yml up -d
```

---

## 10. 稳定性检查命令

部署前：

```bash
./scripts/env-check.sh
npm run check
```

部署：

```bash
./scripts/deploy.sh
```

部署后：

```bash
docker compose -f infra/docker-compose.full.yml ps
curl http://localhost:1010
curl http://localhost:1011/api/articles
```

Windows：

```powershell
.\scripts\env-check.ps1
.\scripts\deploy.ps1
docker compose -f infra/docker-compose.full.yml ps
```
