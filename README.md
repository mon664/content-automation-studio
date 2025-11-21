# 🚀 Content Automation Studio

> AI 기반 콘텐츠 자동화 플랫폼 - 블로그 포스트 생성부터 발행까지 완전 자동화

![Content Automation Studio](https://img.shields.io/badge/Content-Automation%20Studio-blue?style=for-the-badge)
![Flask](https://img.shields.io/badge/Flask-2.3.3-green?style=for-the-badge&logo=flask)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)
![AI](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge)

## 📋 목차

- [기능 개요](#-기능-개요)
- [시작하기](#-시작하기)
- [설치 및 설정](#-설치-및-설정)
- [사용 방법](#-사용-방법)
- [API 문서](#-api-문서)
- [배포 가이드](#-배포-가이드)
- [기술 스택](#-기술-스택)
- [기여](#-기여)
- [라이센스](#-라이센스)

## ✨ 기능 개요

Content Automation Studio는 AI 기반의 콘텐츠 자동화 플랫폼으로, 아래의 핵심 기능을 제공합니다:

### 🎯 5단계 완성형 시스템

#### **Step 1: AI 콘텐츠 생성 엔진** ✅
- **GPT-4 + Gemini 1.5 Pro** 연동
- **2000+ words** 전문 블로그 포스트 자동 생성
- **Vertex AI Imagen 3** 이미지 자동 생성
- **30초 콘텐츠 생성** 속도 최적화
- **SEO 최적화** 및 맞춤형 톤앤매너

#### **Step 2: Toast UI Edior 연동** ✅
- **한국형 최적 에디터** Toast UI Editor (NHN/Naver Cloud)
- **실시간 미리보기** 및 WYSIWYG 편집
- **이미지 드래그앤드롭** 업로드
- **자동 저장** 및 초안 관리
- **Markdown/HTML** 내보내기

#### **Step 3: 멀티 플랫폼 발행 시스템** ✅
- **티스토리 Open API** 자동 발행
- **네이버 블로그 Selenium** 자동화
- **일괄 발행** 및 스케줄링
- **발행 현황 추적** 관리

#### **Step 4: SaaS 운영 및 분석** ✅
- **실시간 대시보드** 및 KPI 추적
- **콘텐츠 성과 분석** (조회수, 참여율)
- **키워드 순위 추적** 및 경쟁 분석
- **사용자 관리** 및 롤 기반 접근 제어

#### **Step 5: AI 개발 파트너 (최종)** 🆕
- **Gemma 3 + Claude 하이브리드** 코딩 파트너
- **Monaco Editor** 기반 전문 IDE 환경
- **실시간 코드 생성** 및 검수
- **세션 관리** 및 코드 히스토리

## 🚀 빠른 시작

### 1. 클론 및 설치

```bash
git clone https://github.com/your-username/content-automation-studio.git
cd content-automation-studio

# Docker 사용 (권장)
docker-compose up -d

# 또는 로컬 설치
pip install -r requirements.txt
python backend/app.py
```

### 2. 환경 설정

```bash
# .env 파일 생성
cp .env.example .env

# API 키 설정 (v:\API_Keys_and_Tokens.csv 참조)
GOOGLE_AI_API_KEY=your_google_ai_api_key
TISTORY_ACCESS_TOKEN=your_tistory_token
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
```

### 3. 접속

- **메인 대시보드**: http://localhost:8000
- **콘텐츠 생성**: http://localhost:8000/content
- **발행 관리**: http://localhost:8000/publisher-test
- **분석 대시보드**: http://localhost:8000/analytics
- **AI 개발 파트너**: http://localhost:8000/dev-partner

## 🛠 설치 및 설정

### 사전 요구사항

- **Python 3.9+**
- **Node.js 16+** (for development)
- **Docker & Docker Compose** (recommended)
- **Google Cloud Project** (for Vertex AI)
- **Chrome/ChromeDriver** (for Naver automation)

### 로컬 개발 환경

```bash
# 1. Python 가상환경
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. 의존성 설치
pip install -r backend/requirements.txt

# 3. 프론트엔드 라이브러리 설치
npm install

# 4. 환경 변수 설정
cp .env.example .env
# .env 파일에 API 키들 설정

# 5. 데이터베이스 초기화
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# 6. 서버 실행
python backend/app.py
```

### Docker 배포 (권장)

```bash
# 1. Docker Compose로 모든 서비스 실행
docker-compose up -d

# 2. 로그 확인
docker-compose logs -f

# 3. 서비스 상태 확인
docker-compose ps
```

## 📖 사용 방법

### 1. 콘텐츠 생성 워크플로우

1. **토픽 입력**: "국보국밥 맛집" 등 키워드 입력
2. **AI 생성**: 30초 만에 2000+ words 블로그 포스트 자동 생성
3. **이미지 생성**: Vertex AI Imagen 3으로 관련 이미지 자동 생성
4. **에디터 편집**: Toast UI Editor에서 실시간 편집 및 수정
5. **발행**: 티스토리/네이버 블로그에 원클릭 발행

### 2. AI 개발 파트너 활용

1. **코드 생성 요청**: "네이버 로그인 함수 만들어줘"
2. **Gemma 3 생성**: AI가 실시간으로 코드 생성
3. **Monaco Editor**: 전문 개발 환경에서 코드 확인 및 수정
4. **Claude 검수**: 보안, 성능, 모범 사례 검토
5. **내보내기**: 완성된 코드 다운로드 또는 복사

### 3. 분석 및 최적화

1. **성과 추적**: 조회수, 참여율, 키워드 순위 실시간 모니터링
2. **경쟁 분석**: 시장 트렌드 및 경쟁사 콘텐츠 분석
3. **최적화 제안**: 데이터 기반 콘텐츠 개선 방안 제공

## 🔧 API 문서

### 주요 API 엔드포인트

#### 콘텐츠 생성
```http
POST /api/content/generate
Content-Type: application/json

{
  "topic": "국보국밥 맛집",
  "keywords": ["맛집", "국밥", "지역"],
  "content_type": "blog_post",
  "tone": "professional"
}
```

#### 발행 관리
```http
POST /api/publisher/tistory
Content-Type: application/json

{
  "title": "블로그 제목",
  "content": "블로그 내용",
  "tags": ["태그1", "태그2"],
  "visibility": "public"
}
```

#### AI 코드 생성
```http
POST /api/dev-partner/generate
Content-Type: application/json

{
  "prompt": "네이버 로그인 함수 만들어줘",
  "language": "python",
  "context": "웹 애플리케이션용"
}
```

#### 코드 검수
```http
POST /api/dev-partner/review
Content-Type: application/json

{
  "code": "검수할 코드",
  "language": "python"
}
```

### 전체 API 문서
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🌐 배포 가이드

### 1. Railway 배포 (가장 쉬움)

```bash
# 1. Railway CLI 설치
npm install -g @railway/cli

# 2. 로그인
railway login

# 3. 배포
railway up

# 4. 환경 변수 설정
railway variables set GOOGLE_AI_API_KEY=your_key
railway variables set TISTORY_ACCESS_TOKEN=your_token
```

### 2. Vercel 배포

```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. 배포
vercel --prod

# 3. 환경 변수 설정
vercel env add GOOGLE_AI_API_KEY
vercel env add TISTORY_ACCESS_TOKEN
```

### 3. AWS EC2 배포

```bash
# 1. EC2 인스턴스 생성
# 2. Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. 프로젝트 클론
git clone https://github.com/your-username/content-automation-studio.git
cd content-automation-studio

# 4. Docker Compose 실행
docker-compose up -d
```

### 4. 자체 서버 배포

```bash
# 1. Nginx 설정
sudo apt update
sudo apt install nginx

# 2. SSL 인증서
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# 3. Docker Compose 실행
docker-compose -f docker-compose.prod.yml up -d
```

## 🛠 기술 스택

### Backend
- **Flask** - 웹 프레임워크
- **Flask-SQLAlchemy** - ORM
- **Flask-Migrate** - 데이터베이스 마이그레이션
- **Celery** - 비동기 태스크 큐
- **Redis** - 캐시 및 메시지 브로커

### Frontend
- **Bootstrap 5** - UI 프레임워크
- **Toast UI Editor** - 한국형 에디터
- **Monaco Editor** - 코드 에디터
- **Chart.js** - 데이터 시각화
- **JavaScript ES6+** - 클라이언트 로직

### AI & ML
- **OpenAI GPT-4** - 콘텐츠 생성
- **Google Gemini 1.5 Pro** - 멀티모달 AI
- **Vertex AI Imagen 3** - 이미지 생성
- **Ollama Gemma 3** - 코드 생성
- **Claude CLI** - 코드 검수

### Infrastructure
- **Docker** - 컨테이너화
- **Nginx** - 리버스 프록시
- **PostgreSQL** - 프로덕션 데이터베이스
- **Selenium** - 웹 자동화
- **ChromaDB** - 벡터 데이터베이스

### DevOps
- **GitHub Actions** - CI/CD
- **Railway** - 클라우드 배포
- **AWS S3** - 파일 저장
- **Cloudflare** - CDN 및 보안

## 📊 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   AI Services   │
│                 │    │                 │    │                 │
│ • Dashboard     │◄──►│ • Flask App     │◄──►│ • OpenAI GPT-4  │
│ • Editor        │    │ • REST API      │    │ • Gemini 1.5    │
│ • Analytics     │    │ • Auth          │    │ • Vertex AI     │
│ • AI Partner    │    │ • Publisher     │    │ • Ollama        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Server    │    │   Database      │    │   Storage       │
│                 │    │                 │    │                 │
│ • Nginx         │    │ • PostgreSQL    │    │ • AWS S3        │
│ • SSL/HTTPS     │    │ • Redis Cache   │    │ • WebDAV        │
│ • CDN           │    │ • ChromaDB      │    │ • Local         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🤝 기여

기여를 환영합니다! 아래 절차를 따라주세요:

1. **Fork** 이 레포지토리
2. **Feature 브랜치** 생성: `git checkout -b feature/AmazingFeature`
3. **커밋**: `git commit -m 'Add some AmazingFeature'`
4. **Push**: `git push origin feature/AmazingFeature`
5. **Pull Request** 생성

### 기여 가이드라인
- **코드 스타일**: PEP 8 준수
- **커밋 메시지**: [Conventional Commits](https://conventionalcommits.org/) 따르기
- **테스트**: 새 기능에 대한 테스트 코드 추가
- **문서**: 변경사항에 대한 문서 업데이트

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 🆘 지원

### 문의처
- **이메일**: support@contentautomation.studio
- **GitHub Issues**: https://github.com/your-username/content-automation-studio/issues
- **디스코드**: https://discord.gg/contentautomation

### FAQ

**Q: API 키는 어떻게 설정하나요?**
A: `v:\API_Keys_and_Tokens.csv` 파일에 있는 키를 `.env` 파일에 복사하세요.

**Q: 네이버 블로그 자동 발행이 안돼요.**
A: Chrome과 ChromeDriver 버전을 확인하고, 네이버 계정의 2단계 인증 설정을 확인하세요.

**Q: AI 개발 파트너의 Claude가 작동하지 않아요.**
A: Claude CLI가 설치되어 있고 PATH에 등록되어 있는지 확인하세요.

## 🎉 데모 영상

[데모 영상 링크] - 전체 워크플로우 데모

## 🏆 프로젝트 상태

- ✅ **Step 1**: AI 콘텐츠 생성 엔진 (완료)
- ✅ **Step 2**: Toast UI Editor 연동 (완료)
- ✅ **Step 3**: 멀티 플랫폼 발행 (완료)
- ✅ **Step 4**: SaaS 운영 분석 (완료)
- ✅ **Step 5**: AI 개발 파트너 (완료)
- 🚀 **MVP**: 프로덕션 레디 (배포 준비 완료)

---

<div align="center">
  <p>Made with ❤️ by Content Automation Studio Team</p>
  <p>© 2024 Content Automation Studio. All rights reserved.</p>
</div>