#!/bin/sh

echo "🚀 Starting Complete Content Automation Studio..."
echo "📊 Environment:"
echo "PORT: $PORT"
echo "PWD: $PWD"
echo "HOME: $HOME"

# Railway의 PORT 변수가 없으면 기본값 설정
if [ -z "$PORT" ]; then
    export PORT=5000
    echo "🔧 PORT not set, using default: 5000"
else
    echo "✅ PORT set to: $PORT"
fi

# 모든 환경변수 출력
echo "📋 All Railway Environment Variables:"
env | grep RAILWAY || echo "No RAILWAY variables found"

echo "🌐 Starting Complete Content Automation Studio..."
echo "🎯 Features: Trends Analysis, AI Content, Video Production, Storage, Publishing"

echo "🐍 Testing Python import..."
python -c "print('Python works')"

echo "📦 Testing Flask import..."
python -c "import flask; print(f'Flask version: {flask.__version__}')"

echo "🚀 Starting Flask app..."
python app.py 2>&1 | tee /tmp/startup.log