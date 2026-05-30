import { defineStore } from 'pinia'
import { articleApi, projectApi, commentApi } from '../api/modules'

const demoArticles = [
  { id: 1, title: '从本地电脑到 Linux 服务器：个人服务部署实践', category: 'DevOps', tags: ['Linux', 'Nginx', 'Docker'], summary: '记录 Cloudflare Tunnel、Nginx、Docker Compose 与 Shell 半自动化更新流程。', content: '## 部署链路\nCloudflare Tunnel → Nginx → Docker Compose → 应用服务。' },
  { id: 2, title: 'Vue3 + ECharts 实现心理健康数据可视化', category: 'Frontend', tags: ['Vue3', 'ECharts', 'Postman'], summary: '梳理 7+ 图表交互、组件拆分、数据映射与接口联调经验。', content: '## 可视化\n雷达图、折线图、仪表盘与统计卡片。' },
  { id: 3, title: 'Spring Cloud 个人网站微服务拆分设计', category: 'Microservice', tags: ['Gateway', 'Nacos', 'Redis', 'RabbitMQ'], summary: '设计用户、文章、项目、评论、统计等服务的微服务架构。', content: '## 架构\nGateway 统一入口，Nacos 注册发现，Redis 缓存，RabbitMQ 异步解耦。' },
]

const demoProjects = [
  { id: 1, name: '大学生心理健康智能评估平台', stack: ['Vue.js', 'ECharts', 'Flask', 'PyTorch', 'Postman'], description: '陕西省职业技能大赛人工智能赛道项目，负责前端可视化与 20+ 接口联调。' },
  { id: 2, name: '个人服务器与内网穿透部署', stack: ['Linux', 'Cloudflare Tunnel', 'Nginx', 'Docker Compose', 'Shell'], description: '将个人电脑改造为 Linux 服务器，完成反向代理、容器编排与半自动化部署。' },
  { id: 3, name: '新大陆校企合作课题项目', stack: ['Spring Cloud', 'MySQL', 'Redis', 'RabbitMQ', 'K8s', 'Vue3'], description: 'JavaWeb + Spring 微服务实践，覆盖开发、部署、接口测试、性能测试与缺陷管理。' },
]

export const useContentStore = defineStore('content', {
  state: () => ({ articles: demoArticles, projects: demoProjects, comments: [] }),
  actions: {
    async loadArticles(params = {}) {
      try { this.articles = (await articleApi.list(params)).records || [] } catch { this.articles = demoArticles }
    },
    async loadProjects() {
      try { this.projects = await projectApi.list() } catch { this.projects = demoProjects }
    },
    async submitComment(payload) {
      try { await commentApi.create(payload) } catch {}
      this.comments.unshift({ ...payload, status: '待审核', time: new Date().toLocaleString('zh-CN') })
    },
  },
})
