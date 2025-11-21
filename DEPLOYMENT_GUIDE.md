# 🚀 Content Automation Studio 배포 가이드

> 완전한 AI 기반 콘텐츠 자동화 플랫폼 배포를 위한 단계별 가이드

## 📋 목차

- [사전 준비](#-사전-준비)
- [배포 옵션](#-배포-옵션)
- [Railway 배포 (권장)](#-railway-배포-권장)
- [AWS EC2 배포](#-aws-ec2-배포)
- [자체 서버 배포](#-자체-서버-배포)
- [Docker 배포](#-docker-배포)
- [환경 설정](#-환경-설정)
- [배포 후 작업](#-배포-후-작업)
- [문제 해결](#-문제-해결)

## ✅ 사전 준비

### 필수 API 키 준비

아래 파일에서 필요한 API 키들을 미리 준비하세요:
```
v:\API_Keys_and_Tokens.csv
```

#### 필요한 API 키 목록

1. **Google Cloud AI**
   - Google AI API Key
   - Google Cloud Project ID
   - Service Account Key JSON

2. **OpenAI**
   - OpenAI API Key (GPT-4 액세스)

3. **Anthropic**
   - Claude API Key

4. **티스토리**
   - Access Token
   - App Key
   - Blog Name

5. **네이버**
   - Client ID
   - Client Secret
   - Blog ID

6. **기타 (선택사항)**
   - AWS S3 (파일 저장용)
   - WebDAV credentials (대체 파일 저장용)

### 소프트웨어 요구사항

- **Git**
- **Docker & Docker Compose** (권장)
- **Python 3.9+** (로컬 개발용)
- **Node.js 16+** (개발 도구용)

## 🌐 배포 옵션

### 1. Railway (가장 쉬움) ⭐ 추천
- **장점**: 자동 스케일링, SSL 무료, 간단한 배포
- **단점**: 제어된 환경, 높은 비용 (대량 트래픽 시)
- **추천 대상**: 개인용, 소규모 팀, 프로토타입

### 2. AWS EC2
- **장점**: 완전한 제어, 다양한 설정 옵션, 합리적인 비용
- **단점**: 서버 관리 필요, SSL 설정 복잡
- **추천 대상**: 중규모 비즈니스, 커스텀 설정 필요 시

### 3. 자체 서버
- **장점**: 완전한 소유권, 최고의 성능, 비용 효율적
- **단점**: 높은 초기 설정, 보안 책임
- **추천 대상**: 대규모 기업, 보안 중요 데이터

### 4. Vercel (프론트엔드만)
- **장점**: 매우 빠른 배포, 전 세계 CDN
- **단점**: 백엔드 추가 설정 필요
- **추천 대상**: 프론트엔드 우선 배포

## 🚂 Railway 배포 (권장)

### 단계 1: Railway CLI 설치

```bash
# npm 설치
npm install -g @railway/cli

# 또는 yarn
yarn global add @railway/cli
```

### 단계 2: 로그인

```bash
railway login
# 브라우저에서 Railway 계정으로 로그인
```

### 단계 3: 프로젝트 준비

```bash
# 프로젝트 클론
git clone https://github.com/your-username/content-automation-studio.git
cd content-automation-studio

# railway 프로젝트 생성
railway init
```

### 단계 4: railway.json 설정

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python backend/app.py",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 단계 5: 환경 변수 설정

```bash
# API 키들 설정
railway variables set GOOGLE_AI_API_KEY=your_google_ai_api_key
railway variables set TISTORY_ACCESS_TOKEN=your_tistory_token
railway variables set NAVER_CLIENT_ID=your_naver_client_id
railway variables set NAVER_CLIENT_SECRET=your_naver_client_secret
railway variables set SECRET_KEY=your_secret_key
railway variables set FLASK_ENV=production
```

### 단계 6: 배포

```bash
# 배포 실행
railway up

# 배포 상태 확인
railway status

# 로그 확인
railway logs
```

### 단계 7: 커스텀 도메인 설정

```bash
# 도메인 추가
railway domains add yourdomain.com

# SSL 자동 설정됨
```

## ☁️ AWS EC2 배포

### 단계 1: EC2 인스턴스 생성

```bash
# Ubuntu 22.04 LTS 선택
# 인스턴스 타입: t3.medium (최소)
# 스토리지: 50GB SSD
# 보안 그룹: HTTP(80), HTTPS(443), SSH(22) 포트 개방
```

### 단계 2: 서버 접속 및 기본 설정

```bash
# SSH 접속
ssh -i your-key.pem ubuntu@your-server-ip

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y git curl wget nginx docker.io docker-compose

# Docker 시작
sudo systemctl start docker
sudo systemctl enable docker

# 사용자를 docker 그룹에 추가
sudo usermod -aG docker ubuntu
```

### 단계 3: 프로젝트 클론 및 설정

```bash
# 프로젝트 클론
git clone https://github.com/your-username/content-automation-studio.git
cd content-automation-studio

# 환경 변수 파일 생성
cp env.example .env
nano .env  # API 키들 설정
```

### 단계 4: Docker Compose로 배포

```bash
# 프로덕션 Docker Compose 실행
docker-compose -f docker-compose.prod.yml up -d

# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f app
```

### 단계 5: Nginx 설정

```bash
# Nginx 설정 파일
sudo nano /etc/nginx/sites-available/content-automation-studio

# 설정 내용
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 활성화
sudo ln -s /etc/nginx/sites-available/content-automation-studio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 단계 6: SSL 인증서 설치

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com

# 자동 갱신 설정
sudo crontab -e
# 다음 라인 추가: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🏠 자체 서버 배포

### 하드웨어 요구사항

- **CPU**: 4코어 이상
- **RAM**: 8GB 이상
- **Storage**: 100GB SSD 이상
- **Network**: 안정적인 인터넷 연결

### 단계별 설치

```bash
# 1. Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 2. Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. 방화벽 설정
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# 4. 프로젝트 배포
git clone https://github.com/your-username/content-automation-studio.git
cd content-automation-studio
cp env.example .env
# .env 파일에 API 키들 설정

# 5. 실행
docker-compose -f docker-compose.prod.yml up -d
```

## 🐳 Docker 배포

### 로컬에서 테스트

```bash
# 1. 환경 설정
cp env.example .env
# .env 파일에 필요한 API 키들 설정

# 2. 개발 환경 실행
docker-compose up -d

# 3. 프로덕션 환경 실행
docker-compose -f docker-compose.prod.yml up -d
```

### 컨테이너 관리

```bash
# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f app

# 컨테이너 재시작
docker-compose restart app

# 새로운 이미지로 업데이트
docker-compose pull
docker-compose up -d --force-recreate

# 데이터베이스 백업
docker exec content-automation-postgres pg_dump -U postgres content_automation > backup.sql
```

## ⚙️ 환경 설정

### 필수 환경 변수

```bash
# 기본 Flask 설정
SECRET_KEY=your-super-secret-key-here
FLASK_ENV=production

# 데이터베이스
DATABASE_URL=postgresql://username:password@localhost:5432/content_automation
REDIS_URL=redis://localhost:6379/0

# AI 서비스
GOOGLE_AI_API_KEY=your-google-ai-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# 발행 플랫폼
TISTORY_ACCESS_TOKEN=your-tistory-token
TISTORY_BLOG_NAME=your-blog-name
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
```

### 선택적 환경 변수

```bash
# 파일 저장
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name

# 모니터링
SENTRY_DSN=your-sentry-dsn
GA_TRACKING_ID=your-ga-tracking-id

# 이메일
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

## ✅ 배포 후 작업

### 1. 헬스 체크

```bash
# 기본 헬스 체크
curl https://yourdomain.com/health

# 예상 응답
{
  "status": "healthy",
  "service": "Content Automation Studio",
  "version": "1.0.0"
}
```

### 2. 기능 테스트

```bash
# AI 콘텐츠 생성 테스트
curl -X POST https://yourdomain.com/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "테스트", "keywords": ["AI"], "content_type": "blog_post"}'

# AI 개발 파트너 테스트
curl -X POST https://yourdomain.com/api/dev-partner/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello World in Python", "language": "python"}'
```

### 3. 모니터링 설정

```bash
# 프로메테우스 접속: http://yourdomain.com:9090
# 그라파나 접속: http://yourdomain.com:3000
# 키바나 접속: http://yourdomain.com:5601
```

### 4. 백업 설정

```bash
# 자동 백업 스크립트
crontab -e

# 매일 새벽 2시 데이터베이스 백업
0 2 * * * /usr/bin/docker exec content-automation-postgres pg_dump -U postgres content_automation | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz

# 매주 파일 백업
0 3 * * 0 tar -czf /backups/uploads-$(date +\%Y\%m\%d).tar.gz /app/uploads
```

## 🔧 문제 해결

### 일반적인 문제

#### 1. 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker-compose logs app

# 해결책: 환경 변수 확인
docker-compose config
```

#### 2. API 호출 실패

```bash
# API 키 확인
grep -E "(GOOGLE_AI_API_KEY|TISTORY_ACCESS_TOKEN)" .env

# 해결책: .env 파일에 올바른 API 키 설정
```

#### 3. 데이터베이스 연결 오류

```bash
# 데이터베이스 컨테이너 상태 확인
docker-compose ps postgres

# 해결책: 데이터베이스 재시작
docker-compose restart postgres
```

#### 4. 메모리 부족

```bash
# 메모리 사용량 확인
docker stats

# 해결책: 스왑 메모리 추가
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 성능 최적화

#### 1. Redis 캐시 설정

```bash
# redis.conf 설정
maxmemory 256mb
maxmemory-policy allkeys-lru
```

#### 2. Nginx 최적화

```nginx
# nginx.conf에 추가
worker_processes auto;
worker_connections 1024;

gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

#### 3. PostgreSQL 최적화

```sql
-- postgresql.conf 설정
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
```

### 보안 강화

#### 1. 방화벽 설정

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

#### 2. SSL 강화

```nginx
# nginx SSL 설정
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
```

#### 3. 정기 업데이트

```bash
# 자동 업데이트 설정
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 📞 지원

배포 중 문제가 발생하면 아래 채널을 통해 문의하세요:

- **GitHub Issues**: https://github.com/your-username/content-automation-studio/issues
- **이메일**: support@contentautomation.studio
- **디스코드**: https://discord.gg/contentautomation

---

<div align="center">
  <p>🎉 축하합니다! Content Automation Studio 배포가 완료되었습니다!</p>
  <p>이제 AI 기반 콘텐츠 자동화의 모든 기능을 활용해 보세요.</p>
</div>