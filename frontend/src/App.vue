<script setup>
import { computed, onMounted, ref } from 'vue'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'
import { useContentStore } from './stores/content'

const theme = useThemeStore()
const auth = useAuthStore()
const content = useContentStore()
const keyword = ref('')
const currentCategory = ref('全部')
const authDialog = ref(false)
const resumeDialog = ref(false)
const loginForm = ref({ username: 'admin', password: 'demo123456' })
const userForm = ref({ name: '', email: '', password: '' })
const message = ref({ name: '', content: '' })

onMounted(() => {
  theme.apply()
  content.loadArticles()
  content.loadProjects()
})

const filteredArticles = computed(() => content.articles.filter((article) => {
  const categoryOk = currentCategory.value === '全部' || article.category === currentCategory.value
  const text = `${article.title} ${article.summary} ${(article.tags || []).join(' ')}`.toLowerCase()
  return categoryOk && text.includes(keyword.value.toLowerCase())
}))

function protectedResume() {
  if (auth.isLogin) resumeDialog.value = true
  else authDialog.value = true
}

async function login() {
  try { await auth.login(loginForm.value) } catch { auth.token = 'DEMO-JWT-TOKEN'; auth.user = { username: loginForm.value.username } }
}

function registerUser() {
  if (!userForm.value.email || userForm.value.password.length < 6) return
  auth.token = `USER-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
  auth.user = { username: userForm.value.name || '注册用户', email: userForm.value.email }
  localStorage.setItem('siiiweb-token', auth.token)
  localStorage.setItem('siiiweb-user', JSON.stringify(auth.user))
  authDialog.value = false
  resumeDialog.value = true
}

function submitComment() {
  content.submitComment(message.value)
  message.value = { name: '', content: '' }
}
</script>

<template>
  <nav class="nav">
    <a class="brand" href="#top">YYH<span>Cloud</span></a>
    <div class="nav-links">
      <a href="#articles">文章</a><a href="#projects">项目</a><a href="#architecture">架构</a><a href="#message">留言</a><a href="#admin">后台</a>
      <button class="btn" @click="protectedResume">站主简历</button>
    </div>
    <div class="theme-switcher">
      <button :class="{active: theme.theme==='dark'}" @click="theme.apply('dark', true)">🌙</button>
      <button :class="{active: theme.theme==='blue'}" @click="theme.apply('blue', true)">☀️</button>
      <button :class="{active: theme.theme==='green'}" @click="theme.apply('green', true)">🌿</button>
    </div>
  </nav>

  <main id="top">
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <p class="eyebrow">Full-stack Portfolio · Tech Blog · Microservice Practice</p>
          <h1>你好，我是 <span>杨怡涵</span><br />打造可展示、可交互、可扩展的全栈个人网站。</h1>
          <p>融合个人品牌、技术文章、项目作品、留言互动与后台管理；以 Spring Cloud、Redis、RabbitMQ、Docker、K8s、自动化测试作为系统实践目标。</p>
          <div class="actions"><a class="btn primary" href="#articles">阅读技术文章</a><button class="btn" @click="protectedResume">站主简历</button></div>
        </div>
        <div class="panel"><p class="eyebrow">Technical Console</p><div class="core"><strong>YYH</strong></div><div class="stats"><div><b>3</b><p>动态主题</p></div><div><b>JWT</b><p>后台认证</p></div><div><b>K8s</b><p>容器部署</p></div></div></div>
      </div>
    </section>

    <section id="articles"><div class="container"><p class="eyebrow">Technical Writing</p><h2 class="section-title">技术文章</h2><div class="actions"><button v-for="c in ['全部','DevOps','Frontend','Microservice']" :key="c" class="btn" @click="currentCategory=c">{{ c }}</button><input v-model="keyword" placeholder="搜索文章标题 / 内容 / 标签" /></div><div class="grid"><article v-for="a in filteredArticles" :key="a.id" class="card"><p class="eyebrow">{{ a.category }}</p><h3>{{ a.title }}</h3><p>{{ a.summary }}</p><div class="tags"><span v-for="t in a.tags" :key="t" class="tag">{{ t }}</span></div></article></div></div></section>

    <section id="projects"><div class="container"><p class="eyebrow">Portfolio</p><h2 class="section-title">项目作品</h2><div class="grid"><article v-for="p in content.projects" :key="p.id" class="card"><h3>{{ p.name }}</h3><p>{{ p.description }}</p><div class="tags"><span v-for="s in p.stack" :key="s" class="tag">{{ s }}</span></div></article></div></div></section>

    <section id="architecture"><div class="container"><p class="eyebrow">System Design</p><h2 class="section-title">微服务架构实践</h2><div class="grid arch"><article v-for="item in ['Gateway 统一网关','Nacos 注册发现','User Service 认证与资料','Article Service 文章管理','Project Service 项目管理','Comment Service 留言审核','Redis 缓存加速','RabbitMQ 异步消息','Docker + K8s 部署']" :key="item" class="card"><h3>{{ item }}</h3><p>支持高可用、可扩展、易维护的全栈个人网站架构。</p></article></div></div></section>

    <section id="message"><div class="container"><p class="eyebrow">Guestbook</p><h2 class="section-title">留言互动</h2><div class="message-layout"><form class="card" @submit.prevent="submitComment"><label>昵称<input v-model="message.name" required /></label><label>留言<textarea v-model="message.content" rows="4" required /></label><button class="btn primary">提交留言</button></form><div class="card"><div v-for="c in content.comments" :key="c.time" class="tag"><b>{{ c.name }}</b>：{{ c.content }} · {{ c.status }}</div><p v-if="!content.comments.length">欢迎留言，正式版将接入 comment-service 审核流程。</p></div></div></div></section>

    <section id="admin"><div class="container"><p class="eyebrow">Admin Console</p><h2 class="section-title">JWT 管理后台</h2><div class="message-layout"><form class="card" @submit.prevent="login"><label>账号<input v-model="loginForm.username" /></label><label>密码<input v-model="loginForm.password" type="password" /></label><button class="btn primary">登录后台</button><p>{{ auth.isLogin ? '已登录：' + auth.token : '未登录：正式版通过 Gateway + JWT + Redis 校验。' }}</p></form><div class="grid"><div class="card"><h3>128</h3><p>文章阅读量</p></div><div class="card"><h3>36</h3><p>总访问量</p></div><div class="card"><h3>5</h3><p>待审核留言</p></div></div></div></div></section>
  </main>

  <footer class="footer"><div class="container">© 2026 杨怡涵 · Siiiweb</div></footer>

  <el-dialog v-model="authDialog" title="注册后查看站主简历" width="min(92vw, 560px)"><p>为保护隐私，游客无法查看完整联系方式与简历。</p><label>昵称<input v-model="userForm.name" /></label><label>邮箱<input v-model="userForm.email" type="email" /></label><label>密码<input v-model="userForm.password" type="password" /></label><button class="btn primary" @click="registerUser">注册并查看</button></el-dialog>
  <el-dialog v-model="resumeDialog" title="杨怡涵 · 个人完整简历" width="min(92vw, 920px)"><div class="resume-grid"><div><b>出生年月</b><p>2006/10</p></div><div><b>邮箱</b><p>2097533249@qq.com</p></div><div><b>电话</b><p>17398090174</p></div><div><b>所在地</b><p>陕西省西安市</p></div></div><h3>专业技能</h3><p>Linux、Shell、Docker、Kubernetes、Nginx、Tomcat、MySQL、Redis、Vue.js、ECharts、Git、Postman、JMeter、Selenium、禅道、AI 辅助开发。</p><h3>项目经历</h3><p>陕西省职业技能大赛人工智能赛道前端负责人；个人服务器与内网穿透部署；新大陆校企合作现场工程师班课题项目。</p><h3>教育经历</h3><p>西安职业技术学院 · 大数据技术 · 2024/09 - 2027/07。</p></el-dialog>
</template>
