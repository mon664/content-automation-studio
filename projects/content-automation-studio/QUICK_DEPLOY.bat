@echo off
echo 🚀 Content Automation Studio - Quick Deploy Script
echo ==================================================

echo.
echo 1️⃣ GitHub 저장소 생성 (브라우저에서)
echo    - 아래 링크 클릭:
echo    https://github.com/new
echo.
echo    - 저장소 정보 입력:
echo      Repository name: content-automation-studio
echo      Description: AI 기반 콘텐츠 자동 생성 및 발행 플랫폼
echo      Public: ✓ 선택
echo      Add a README file: 선택 안 함
echo.
echo    - "Create repository" 클릭
echo.

echo 2️⃣ 준비가 되면 아무 키나 눌러 계속...
pause > nul

echo.
echo 3️⃣ 코드 푸시 중...
cd /d "C:\projects\content-automation-studio"

rem 원격 저장소 주소 업데이트 (실제 사용자 이름으로 변경 필요)
git remote set-url origin https://github.com/YOUR_USERNAME/content-automation-studio.git

rem 메인 브랜치로 푸시
git push -u origin main

echo.
echo ✅ GitHub 푸시 완료!
echo.

echo 4️⃣ Railway 배포:
echo    - https://railway.com 접속
echo    - "New Project" → "Deploy from GitHub repo"
echo    - "content-automation-studio" 선택
echo    - 아래 환경 변수 입력:
echo      * GOOGLE_PROJECT_ID=content-automation-studio
echo      * GEMINI_API_KEY=AIzaSyBlxBK-1-vl-Uzy5Vys9tLPQynRhGk30UY
echo      * VERTEX_AI_API_KEY=AQ.Ab8RN6LuBT_emr293bsy-BBxgLc9l9TOnYCz73uoc-uA1aBp4A
echo      * WEBDAV_URL=https://rausu.infini-cloud.net/dav
echo      * WEBDAV_USERNAME=hhtsta
echo      * WEBDAV_PASSWORD=RXYf3uYhCbL9Ezwa
echo      * SECRET_KEY=content-studio-secret-key-2024
echo.

echo 5️⃣ 배포 자동 시작됨 - 약 3-5분 소요
echo.

echo 🎯 배포 완료 후 접속 URL: https://your-app-name.railway.app/api/health
echo.

pause