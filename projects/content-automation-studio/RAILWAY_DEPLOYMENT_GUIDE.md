# Railway 배포 가이드

## 🚀 배포 단계

### 1. GitHub 저장소 생성

```bash
# GitHub CLI 설치 (선택사항)
winget install GitHub.cli

# 저장소 생성 및 푸시
gh repo create content-automation-studio --public --description "AI 기반 콘텐츠 자동 생성 및 발행 플랫폼"
git remote add origin https://github.com/your-username/content-automation-studio.git
git branch -M main
git push -u origin main
```

### 2. Railway 프로젝트 설정

1. **Railway 접속**: https://railway.com
2. **New Project** 클릭
3. **Deploy from GitHub repo** 선택
4. `content-automation-studio` 저장소 선택
5. **Add Environment Variables**:

```
# Google Cloud API Keys
GOOGLE_PROJECT_ID=content-automation-studio
GOOGLE_LOCATION=us-central1
GEMINI_API_KEY=AIzaSyBlxBK-1-vl-Uzy5Vys9tLPQynRhGk30UY
VERTEX_AI_API_KEY=AQ.Ab8RN6LuBT_emr293bsy-BBxgLc9l9TOnYCz73uoc-uA1aBp4A

# WebDAV Configuration
WEBDAV_URL=https://rausu.infini-cloud.net/dav
WEBDAV_USERNAME=hhtsta
WEBDAV_PASSWORD=RXYf3uYhCbL9Ezwa

# Flask Configuration
SECRET_KEY=your-unique-secret-key-here
DEBUG=False
```

### 3. 배포 확인

- **Health Check**: `https://your-app-name.railway.app/api/health`
- **API 문서**: `https://your-app-name.railway.app/`

## 📋 API 엔드포인트

### 인증
- `POST /login` - 로그인
- `POST /register` - 회원가입
- `GET /profile` - 프로필 조회
- `GET /credits` - 크레딧 조회

### 콘텐츠 생성
- `POST /content/generate-blog` - 블로그 글 생성
- `POST /content/upload-file` - 파일 업로드
- `GET /content/files` - 파일 목록

### 트렌드 분석
- `POST /trends/analyze` - 트렌드 분석
- `GET /trends/hot-topics` - 인기 토픽

### 영상 제작
- `POST /video/generate-script` - 스크립트 생성
- `POST /video/generate-slideshow` - 슬라이드쇼 생성
- `POST /video/create-video` - 영상 생성

### 발행 시스템
- `GET /publisher/platforms` - 지원 플랫폼
- `POST /publisher/publish` - 콘텐츠 발행
- `POST /publisher/preview` - 미리보기

## 🛠️ 기술 스택

- **Backend**: Python Flask + Gunicorn
- **AI**: Google Gemini API + Vertex AI Studio
- **Storage**: Infini Cloud WebDAV (20GB 무료)
- **Deployment**: Railway ($5/월 플랜)
- **Database**: Railway PostgreSQL (추가 가능)

## 💰 비용

- **Railway**: $5/월 (현재 플랜)
- **Google Cloud**: 무료 한도 내 사용
- **WebDAV**: 20GB 무료
- **총 월 비용**: $5

## 🔧 트러블슈팅

### 배포 실패 시
1. **환경 변수 확인**: 모든 필수 변수가 설정되었는지 확인
2. **requirements.txt 확인**: 모든 의존성이 포함되었는지 확인
3. **Health Check**: `/api/health` 엔드포인트 응답 확인

### API 오류 시
1. **Google Cloud API 키**: 유효성 및 권한 확인
2. **WebDAV 연결**: 접속 정보 확인
3. **로그 확인**: Railway 로그에서 에러 메시지 확인