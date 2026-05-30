const fs = require('fs')
const required = [
  'frontend/package.json','.env.example','frontend/src/App.vue','frontend/src/stores/theme.js','frontend/src/stores/auth.js','frontend/src/api/http.js','frontend/vite.config.js',
  'backend/pom.xml','backend/gateway-service/src/main/resources/application.yml','backend/gateway-service/src/main/java/com/siiiweb/gateway/JwtGatewayFilter.java',
  'backend/user-service/src/main/java/com/siiiweb/user/controller/UserController.java','backend/article-service/src/main/java/com/siiiweb/article/controller/ArticleController.java',
  'backend/project-service/src/main/java/com/siiiweb/project/controller/ProjectController.java','backend/comment-service/src/main/java/com/siiiweb/comment/controller/CommentController.java',
  'infra/docker-compose.yml','infra/nginx/siiiweb.conf','k8s/namespace.yaml','k8s/services.yaml','tests/postman/Siiiweb.postman_collection.json','tests/jmeter/article-api.jmx','tests/selenium/siiiweb.e2e.js','docs/API.md','docs/DEPLOYMENT.md','docs/TEST_PLAN.md','docs/DOCKER_PORTS.md','docs/VERSION_PLAN.md','backend/Dockerfile','frontend/Dockerfile','frontend/nginx.conf','infra/docker-compose.full.yml','scripts/ubuntu-deploy.sh','scripts/ubuntu-stop.sh','scripts/ubuntu-env-check.sh','scripts/stop.ps1','scripts/env-check.ps1','scripts/deploy.ps1','scripts/stop.sh','scripts/env-check.sh','scripts/deploy.sh','scripts/version-check.js'
]
let failed=false
for (const file of required) { if (!fs.existsSync(file)) { console.error('✗ missing', file); failed=true } else console.log('✓', file) }
for (const svc of ['gateway-service','user-service','article-service','project-service','comment-service','statistics-service']) {
  const f = `backend/${svc}/Dockerfile`; if (!fs.existsSync(f)) { console.error('✗ missing', f); failed=true } else console.log('✓', f)
}
if (failed) process.exit(1)
console.log('\nSiiiweb full-stack scaffold check passed.')


const compose = fs.readFileSync('infra/docker-compose.full.yml', 'utf8')
const mappings = ['1010:80','1011:1011','1012:1012','1013:1013','1014:1014','1015:1015','1016:1016','3306:3306','6379:6379','5672:5672','15672:15672','8848:8848','9848:9848']
for (const mapping of mappings) {
  if (!compose.includes(`"${mapping}"`)) {
    console.error('✗ missing docker compose port mapping', mapping)
    process.exit(1)
  }
  console.log('✓ docker compose port mapping', mapping)
}
