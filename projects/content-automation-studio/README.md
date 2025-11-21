# Content Automation Studio

AI 기반 콘텐츠 자동 생성 및 발행 플랫폼

## 🚀 기능

- **자동 블로그 발행**: 네이버, 티스토리, 워드프레스 등 다중 플랫폼 지원
- **영상 자동 제작**: AI 이미지 생성 + TTS 음성 + FFmpeg 영상 조합
- **SNS 자동 발행**: 인스타그램, 페이스북, 트위터, 틱톡 연동
- **트렌드 분석**: Google Trends 데이터 기반 토픽 추천
- **다중 사용자**: 크레딧 시스템 및 승인 워크플로우

## 🛠️ 기술 스택

- **Backend**: Python Flask
- **AI**: Google Vertex AI (Imagen 3) + Gemini API
- **Storage**: Infini Cloud WebDAV (20GB 무료)
- **Hosting**: Railway ($5/월 플랜)
- **Video**: FFmpeg
- **Deployment**: GitHub → Railway 자동 배포

## 📁 프로젝트 구조

```
content-automation-studio/
├── backend/
│   ├── app.py                 # 메인 Flask 앱
│   ├── requirements.txt       # Python 의존성
│   ├── config.py             # 설정 파일
│   ├── models/               # 데이터 모델
│   ├── routes/               # API 라우트
│   │   ├── auth.py          # 인증
│   │   ├── content.py       # 콘텐츠 생성
│   │   ├── video.py         # 영상 제작
│   │   ├── trends.py        # 트렌드 분석
│   │   └── publisher.py     # SNS 발행
│   └── utils/               # 유틸리티
│       ├── webdav.py        # WebDAV 연동
│       ├── ai_client.py     # Google AI API
│       └── storage.py       # 파일 관리
├── frontend/                # Next.js 프론트엔드 (Vercel)
├── docs/                   # 문서
└── .github/                # GitHub Actions
```

## 🔧 API 키 설정

### Google Cloud
- Vertex AI Studio: Imagen 3 이미지 생성
- Gemini API: 텍스트 생성 및 분석

### WebDAV (Infini Cloud)
- URL: https://rausu.infini-cloud.net/dav
- Storage: 20GB 무료 제공

### 배포
- Railway: $5/월 플랜
- Vercel: 프론트엔드 호스팅

## 📋 개발 단계

1. **Phase 1**: 기본 인프라 구축 (WebDAV + Google AI)
2. **Phase 2**: 콘텐츠 생성 기능 (블로그 글 + 이미지)
3. **Phase 3**: 영상 제작 기능 (TTS + FFmpeg)
4. **Phase 4**: 플랫폼 연동 및 발행 기능
5. **Phase 5**: 사용자 관리 및 크레딧 시스템

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)