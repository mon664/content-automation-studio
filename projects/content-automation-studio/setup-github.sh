#!/bin/bash

# GitHub 저장소 생성 및 푸시 스크립트

echo "🚀 Content Automation Studio GitHub Setup"
echo "=========================================="

REPO_NAME="content-automation-studio"
DESCRIPTION="AI 기반 콘텐츠 자동 생성 및 발행 플랫폼"
GITHUB_USERNAME="your-username"  # 여기에 실제 GitHub 사용자명 입력

# 1. GitHub 저장소 생성 (GitHub CLI 사용)
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI 감지됨 - 저장소 생성 중..."
    gh repo create $REPO_NAME --public --description "$DESCRIPTION" --clone=false
else
    echo "❌ GitHub CLI 설치 필요"
    echo "수동으로 GitHub에서 저장소를 생성하세요:"
    echo "https://github.com/new"
    echo ""
    echo "저장소 정보:"
    echo "- 이름: $REPO_NAME"
    echo "- 설명: $DESCRIPTION"
    echo "- 공개 여부: Public"
fi

# 2. 원격 저장소 추가
echo "📡 원격 저장소 추가 중..."
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# 3. 코드 푸시
echo "📤 코드 푸시 중..."
git branch -M main
git push -u origin main

echo "✅ GitHub 저장소 설정 완료!"
echo "🔗 저장소 URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"

# 4. 다음 단계 안내
echo ""
echo "🎯 다음 단계:"
echo "1. Railway에 접속: https://railway.com"
echo "2. New Project 클릭"
echo "3. 'Deploy from GitHub repo' 선택"
echo "4. $REPO_NAME 저장소 선택"
echo "5. 환경 변수 설정 (.env.example 참조)"
echo "6. 배포 시작"