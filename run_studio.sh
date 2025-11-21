#!/bin/bash

# 🚀 Content Automation Studio - 로컬 실행기 (Linux/Mac)
# ⚠️ 이 프로젝트는 로컬 환경에서만 실행됩니다
# ⚠️ Railway 클라우드 배포가 중단되었습니다

echo ""
echo "██████╗ ███████╗██╗   ██╗██████╗ ███████╗████████╗"
echo "██╔══██╗██╔════╝██║   ██║██╔══██╗██╔════╝╚══██╔══╝"
echo "██████╔╝█████╗  ██║   ██║██████╔╝█████╗     ██║   "
echo "██╔══██╗██╔══╝  ██║   ██║██╔═══╝ ██╔══╝     ██║   "
echo "██║  ██║███████╗╚██████╔╝██║     ███████╗   ██║   "
echo "╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝     ╚══════╝   ╚═╝   "
echo ""
echo "🚀 Content Automation Studio - 로컬 실행기"
echo "⚠️  이 프로젝트는 로컬 환경에서만 실행됩니다"
echo "⚠️  Railway 클라우드 배포가 중단되었습니다"
echo ""
echo "💻 시스템: Linux/Mac 실행 환경"
echo "🎯 목표: 로컬 GPU 자원 활용 AI 콘텐츠 자동화"
echo ""

# 현재 디렉토리로 이동
cd "$(dirname "$0")"
echo "📍 현재 위치: $(pwd)"
echo ""

# 1단계: Ollama 서비스 상태 확인
echo "[1/4 단계] Ollama 서비스 확인 중..."
if pgrep -f "ollama serve" > /dev/null; then
    echo "✅ Ollama가 이미 실행 중입니다"
else
    echo "❌ Ollama가 실행되지 않았습니다"
    echo "🚀 Ollama 서비스 시작 중..."
    ollama serve &
    OLLAMA_PID=$!
    echo "⏳ Ollama 서비스가 시작될 때까지 10초 대기..."
    sleep 10

    if pgrep -f "ollama serve" > /dev/null; then
        echo "✅ Ollama 서비스 시작 성공!"
    else
        echo "⚠️  Ollama 서비스 시작에 실패했습니다"
        echo "💡 수동으로 실행해주세요: ollama serve"
        echo ""
        read -p "계속 진행하시겠습니까? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "🛑 실행을 중단합니다"
            exit 1
        fi
    fi
fi
echo ""

# 2단계: Python 환경 확인
echo "[2/4 단계] Python 환경 확인 중..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python이 설치되지 않았습니다"
    echo "💡 Python 3.9+를 설치해주세요: https://python.org/"
    exit 1
fi
echo "✅ Python 환경 확인 완료"

# 필수 라이브러리 확인
echo "📦 필수 라이브러리 확인 중..."
python3 -c "import flask" 2>/dev/null || {
    echo "❌ Flask가 설치되지 않았습니다"
    echo "📦 Flask 설치 중..."
    pip3 install flask
}

python3 -c "import requests" 2>/dev/null || {
    echo "❌ requests가 설치되지 않았습니다"
    echo "📦 requests 설치 중..."
    pip3 install requests
}

echo "✅ Python 환경 준비 완료"
echo ""

# 3단계: 서버 실행
echo "[3/4 단계] Content Automation Studio 서버 시작..."
echo "🚀 Flask 서버 실행 중..."
echo "🌐 서버 주소: http://localhost:5000"
echo "🔗 대시보드: http://localhost:5000"
echo "👨‍💻 AI 개발 파트너: http://localhost:5000/dev-partner"
echo ""
echo "⚠️  서버를 종료하려면 Ctrl+C를 누르세요"
echo "⚠️  이 터미널을 닫으면 서버가 중단됩니다"
echo ""

# 4단계: 브라우저 자동 열기 (별도 프로세스)
echo "[4/4 단계] 브라우저 실행..."
sleep 3
if command -v xdg-open > /dev/null; then
    xdg-open "http://localhost:5000" 2>/dev/null &
elif command -v open > /dev/null; then
    open "http://localhost:5000" 2>/dev/null &
else
    echo "💡 브라우저에서 수동으로 열어주세요: http://localhost:5000"
fi
echo "✅ 브라우저가 열렸습니다"
echo ""

# Flask 서버 실행 (백그라운드로 실행하여 브라우저 열릴 시간 확보)
python3 backend/app.py

# 서버 종료 메시지
echo ""
echo "🛑 Content Automation Studio 서버가 종료되었습니다"
echo "감사합니다!"