# Siiiweb API 概要

所有接口经 Gateway 暴露，统一前缀 `/api`。

## 公开接口
- `GET /api/articles?keyword=` 文章列表
- `GET /api/articles/{id}` 文章详情并增加阅读量
- `GET /api/projects` 项目列表
- `POST /api/comments` 提交留言，默认待审核
- `GET /api/about` 关于我

## 认证接口
- `POST /api/admin/login` 管理员登录，返回 JWT
- `POST /api/admin/refresh` 刷新 JWT

## 管理接口（需 JWT）
- `POST /api/admin/articles` 发布文章，并通过 RabbitMQ 发送索引更新消息
- `PUT /api/admin/articles/{id}` 编辑文章
- `DELETE /api/admin/articles/{id}` 删除文章
- `POST /api/admin/projects` 新增项目
- `GET /api/admin/comments` 待审核留言
- `PUT /api/admin/comments/{id}/approve` 审核通过 / 回复
- `DELETE /api/admin/comments/{id}` 删除留言
