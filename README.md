# 🚀 Content Automation Studio

AI 기반 콘텐츠 자동 생성 및 다중 플랫폼 발행 시스템

## ✨ 주요 기능

### 📊 **Google Trends 분석**
- 키워드 트렌드 실시간 분석
- 지역별 인기도 및 관련 검색어
- 다중 키워드 비교 분석
- 실시간 인기 토픽 추천

### ✍️ **AI 콘텐츠 생성**
- Gemini API 기반 블로그 글 자동 생성
- SEO 최적화 제목 및 메타데이터
- 플랫폼별 SNS 콘텐츠 변환
- 이메일 뉴스레터 자동 생성
- 콘텐츠 최적화 및 개선 제안

### 🎥 **영상 자동 제작**
- AI 기반 스크립트 생성
- TTS (Text-to-Speech) 음성 합성
- 자동 슬라이드쇼 생성
- FFmpeg 영상 조합
- YouTube Shorts 형식 지원

### ☁️ **WebDAV 파일 저장**
- Infini Cloud 20GB 무료 저장소
- 자동 파일 업로드/다운로드
- 월별 폴더 자동 정리
- 파일 관리 및 통계 기능

### 📱 **다중 플랫폼 발행**
- 블로그: 네이버, 티스토리, 워드프레스
- SNS: 인스타그램, 페이스북, 트위터, 링크드인
- 영상: 유튜브
- 예약 발행 및 발행 기록 관리

## 🛠️ 기술 스택

- **Backend**: Python Flask
- **AI**: Google Gemini API + Vertex AI Studio
- **Storage**: Infini Cloud WebDAV (20GB 무료)
- **Trends**: Google Trends API (pytrends)
- **Video**: FFmpeg + gTTS + OpenCV
- **Deployment**: Railway

## 🚀 API 엔드포인트

### 기본
- `GET /` - 서비스 정보
- `GET /api/health` - 서비스 상태 확인

### 트렌드 분석 (`/api/trends`)
- `POST /analyze` - 키워드 트렌드 분석
- `GET /hot-topics` - 실시간 인기 토픽
- `POST /compare` - 키워드 비교 분석

### 콘텐츠 생성 (`/api/content`)
- `POST /generate-blog` - 블로그 글 생성
- `POST /generate-social` - SNS 콘텐츠 생성
- `POST /generate-email` - 이메일 뉴스레터 생성
- `POST /optimize` - 콘텐츠 최적화

### 영상 제작 (`/api/video`)
- `POST /generate-script` - 영상 스크립트 생성
- `POST /generate-audio` - TTS 음성 생성
- `POST /create-slideshow` - 슬라이드쇼 생성
- `POST /create-video` - 최종 영상 생성
- `POST /create-youtube-short` - YouTube Shorts 생성

### 파일 관리 (`/api/storage`)
- `POST /upload` - 파일 업로드
- `GET /list` - 파일 목록 조회
- `DELETE /delete` - 파일 삭제
- `GET /stats` - 저장소 통계

### 발행 시스템 (`/api/publisher`)
- `GET /platforms` - 지원 플랫폼 목록
- `POST /publish` - 단일 플랫폼 발행
- `POST /publish/batch` - 다중 플랫폼 동시 발행
- `POST /preview` - 콘텐츠 미리보기
- `GET /history` - 발행 기록

## 🔧 배포

### Railway 배포
```bash
# GitHub 리포지토리 복제
git clone https://github.com/mon664/content-automation-studio.git

# Railway에서 New Project → Deploy from GitHub repo
# 환경 변수 설정 후 배포
```

### 환경 변수
```
GOOGLE_PROJECT_ID=content-automation-studio
GEMINI_API_KEY=your-gemini-api-key
VERTEX_AI_API_KEY=your-vertex-ai-key
WEBDAV_URL=https://rausu.infini-cloud.net/dav
WEBDAV_USERNAME=hhtsta
WEBDAV_PASSWORD=RXYf3uYhCbL9Ezwa
```

## 📊 사용 예시

### 1. 키워드 트렌드 분석
```bash
curl -X POST http://your-app.railway.app/api/trends/analyze \
  -H "Content-Type: application/json" \
  -d '{"keyword": "AI 기술", "timeframe": "today 3-m"}'
```

### 2. 블로그 글 생성
```bash
curl -X POST http://your-app.railway.app/api/content/generate-blog \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI 기술 동향", "keywords": ["AI", "기술", "트렌드"], "tone": "professional"}'
```

### 3. 다중 플랫폼 발행
```bash
curl -X POST http://your-app.railway.app/api/publisher/batch \
  -H "Content-Type: application/json" \
  -d '{
    "platforms": ["instagram", "facebook", "twitter"],
    "content": "새로운 AI 기술이 등장했습니다!",
    "hashtags": ["AI", "기술", "혁신"]
  }'
```

## 💰 비용

- **Railway**: $5/월 (현재 플랜)
- **Google Cloud**: 무료 한도 내 사용
- **WebDAV**: 20GB 무료
- **총 월 비용**: $5

## 📋 라이선스

MIT License

## 🤖 생성 도구

Generated with [Claude Code](https://claude.com/claude-code)