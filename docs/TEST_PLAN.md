# 测试体系

## Postman 接口测试
导入 `tests/postman/Siiiweb.postman_collection.json`，覆盖公开接口、登录、发布文章等流程。

## JMeter 性能测试
使用 `tests/jmeter/article-api.jmx` 对文章列表接口进行 500 并发阶梯压测。

## Selenium 自动化测试
```bash
cd tests/selenium
npm install
SIIIWEB_URL=http://localhost:1010 npm test
```
覆盖：首页 → 文章 → 留言 → 后台入口。

## 禅道流程
需求、任务、Bug 分别录入禅道，Bug 关联需求和测试用例，修复后回归验证。
