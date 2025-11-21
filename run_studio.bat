@echo off
chcp 65001 >nul
title 🚀 Content Automation Studio - 로컬 실행기

echo.
echo ██████╗ ███████╗██╗   ██╗██████╗ ███████╗████████╗
echo ██╔══██╗██╔════╝██║   ██║██╔══██╗██╔════╝╚══██╔══╝
echo ██████╔╝█████╗  ██║   ██║██████╔╝█████╗     ██║
echo ██╔══██╗██╔══╝  ██║   ██║██╔═══╝ ██╔══╝     ██║
echo ██║  ██║███████╗╚██████╔╝██║     ███████╗   ██║
echo ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝     ╚══════╝   ╚═╝
echo.
echo 🚀 Content Automation Studio - 로컬 실행기
echo ⚠️  이 프로젝트는 로컬 환경에서만 실행됩니다
echo ⚠️  Railway 클라우드 배포가 중단되었습니다
echo.
echo 💻 시스템: Windows 실행 환경
echo 🎯 목표: 로컬 GPU 자원 활용 AI 콘텐츠 자동화
echo.

REM 현재 디렉토리 확인 및 이동
cd /d "%~dp0"
echo 📍 현재 위치: %CD%
echo.

REM 1단계: Ollama 서비스 상태 확인
echo [1/4 단계] Ollama 서비스 확인 중...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I "ollama.exe" >NUL
if %ERRORLEVEL% == 0 (
    echo ✅ Ollama가 이미 실행 중입니다
) else (
    echo ❌ Ollama가 실행되지 않았습니다
    echo 🚀 Ollama 서비스 시작 중...
    start "Ollama Server" ollama serve
    echo ⏳ Ollama 서비스가 시작될 때까지 10초 대기...
    timeout /t 10 /nobreak >nul

    REM 다시 확인
    tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I "ollama.exe" >NUL
    if %ERRORLEVEL% == 0 (
        echo ✅ Ollama 서비스 시작 성공!
    ) else (
        echo ⚠️  Ollama 서비스 시작에 실패했습니다
        echo 💡 수동으로 실행해주세요: ollama serve
        echo.
        echo 계속 진행하시겠습니까? (y/n)
        set /p continue=선택:
        if /i not "%continue%"=="y" (
            echo 🛑 실행을 중단합니다
            pause
            exit /b 1
        )
    )
)
echo.

REM 2단계: Python 환경 확인
echo [2/4 단계] Python 환경 확인 중...
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Python이 설치되지 않았습니다
    echo 💡 Python 3.9+를 설치해주세요: https://python.org/
    pause
    exit /b 1
)
echo ✅ Python 환경 확인 완료

REM 필수 라이브러리 확인
echo 📦 필수 라이브러리 확인 중...
python -c "import flask" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Flask가 설치되지 않았습니다
    echo 📦 Flask 설치 중...
    pip install flask
)

python -c "import requests" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ requests가 설치되지 않았습니다
    echo 📦 requests 설치 중...
    pip install requests
)

echo ✅ Python 환경 준비 완료
echo.

REM 3단계: 서버 실행
echo [3/4 단계] Content Automation Studio 서버 시작...
echo 🚀 Flask 서버 실행 중...
echo 🌐 서버 주소: http://localhost:5000
echo 🔗 대시보드: http://localhost:5000
echo 👨‍💻 AI 개발 파트너: http://localhost:5000/dev-partner
echo.
echo ⚠️  서버를 종료하려면 Ctrl+C를 누르세요
echo ⚠️  이 창을 닫으면 서버가 중단됩니다
echo.

REM 4단계: 브라우저 자동 열기 (별도 프로세스)
echo [4/4 단계] 브라우저 실행...
timeout /t 3 /nobreak >nul
start "" "http://localhost:5000"
echo ✅ 브라우저가 열렸습니다
echo.

REM Flask 서버 실행
python backend/app.py

REM 서버 종료 메시지
echo.
echo 🛑 Content Automation Studio 서버가 종료되었습니다
echo 감사합니다!
echo.
pause