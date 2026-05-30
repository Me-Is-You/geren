const fs = require('fs')

const checks = [
  ['frontend/package.json', '"vue": "^3.5.13"'],
  ['frontend/package.json', '"pinia": "^2.3.1"'],
  ['frontend/package.json', '"vite": "^6.0.11"'],
  ['frontend/Dockerfile', 'node:20-alpine'],
  ['frontend/Dockerfile', 'nginx:1.25-alpine'],
  ['backend/pom.xml', '<java.version>17</java.version>'],
  ['backend/pom.xml', '<spring-boot.version>2.7.18</spring-boot.version>'],
  ['backend/pom.xml', '<spring-cloud.version>2021.0.8</spring-cloud.version>'],
  ['backend/pom.xml', '<spring-cloud-alibaba.version>2021.0.5.0</spring-cloud-alibaba.version>'],
  ['backend/Dockerfile', 'maven:3.9-eclipse-temurin-17'],
  ['backend/Dockerfile', 'eclipse-temurin:17-jre-alpine'],
  ['infra/docker-compose.full.yml', 'mysql:8.0'],
  ['infra/docker-compose.full.yml', 'redis:6.2-alpine'],
  ['infra/docker-compose.full.yml', 'rabbitmq:3.13-management'],
  ['infra/docker-compose.full.yml', 'nacos/nacos-server:v2.3.2'],
]

let failed = false
for (const [file, token] of checks) {
  if (!fs.existsSync(file)) {
    console.error(`✗ missing file: ${file}`)
    failed = true
    continue
  }
  const content = fs.readFileSync(file, 'utf8')
  if (!content.includes(token)) {
    console.error(`✗ ${file} missing stable token: ${token}`)
    failed = true
  } else {
    console.log(`✓ ${file}: ${token}`)
  }
}

if (failed) process.exit(1)
console.log('\nSiiiweb stable version check passed.')
