from flask import Flask, request, jsonify, render_template, session, flash
from flask_cors import CORS
from flask_login import current_user
import os
from datetime import datetime, timedelta

app = Flask(__name__,
           static_folder='static',
           static_url_path='/static',
           template_folder='templates')
CORS(app)

# 세션 설정 (보안 강화)
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)  # 7일간 세션 유지

# 환경 변수 설정
os.environ.update({
    'GOOGLE_PROJECT_ID': 'content-automation-studio',
    'GOOGLE_LOCATION': 'us-central1',
    'GEMINI_API_KEY': 'AIzaSyBlxBK-1-vl-Uzy5Vys9tLPQynRhGk30UY',
    'VERTEX_AI_API_KEY': 'AQ.Ab8RN6LuBT_emr293bsy-BBxgLc9l9TOnYCz73uoc-uA1aBp4A',
    'WEBDAV_URL': 'https://rausu.infini-cloud.net/dav',
    'WEBDAV_USERNAME': 'hhtsta',
    'WEBDAV_PASSWORD': 'RXYf3uYhCbL9Ezwa',
    # GitHub OAuth 설정
    'GITHUB_CLIENT_ID': 'Iv23li5pLWW7i48nVhZt',  # GitHub OAuth App Client ID
    'GITHUB_CLIENT_SECRET': 'a1c3de3c2f5b4e6d8a9b7c6e5f4d3c2b1a0e9f8d7c6b5a4f3e2d1c0b9a8f7e6d5c',  # GitHub OAuth App Client Secret
    'SECRET_KEY': 'content-automation-studio-secret-key-hhtsta-6949689q'  # 세션 암호화 키
})

# 기본 라우트
@app.route('/')
def index():
    return render_template('index.html',
        version='2.0.0',
        status='running',
        timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        current_user=current_user,
        is_authenticated=current_user.is_authenticated if current_user else False
    )

# API 라우트 (기존 기능 유지)
@app.route('/api')
def api_info():
    return jsonify({
        'service': 'Content Automation Studio',
        'status': 'running',
        'version': '2.0.0',
        'features': [
            'Google Trends Analysis',
            'AI Content Generation (Gemini)',
            'Image Generation (Vertex AI)',
            'Video Creation (TTS + FFmpeg)',
            'WebDAV Storage (20GB)',
            'Blog Auto-Publishing (Tistory, Naver, Blogger)',
            'Advanced Content Scheduling (APScheduler)',
            'Professional HTML Blog Templates',
            'Performance Analytics Dashboard',
            'Rich Text WYSIWYG Editor',
            'Real-time Image Upload Integration'
        ],
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'services': {
            'google_trends': True,
            'gemini_api': True,
            'vertex_ai': True,
            'webdav_storage': True,
            'video_processing': True
        },
        'timestamp': datetime.now().isoformat()
    })

# 모듈 임포트
from modules import trends, content, video, publisher, storage, scheduler, auth

# Analytics 백엔드 임포트
from backend.routes import analytics, editor

# GitHub OAuth 초기화
github_oauth = auth.init_oauth(app)

# 블루프린트 등록
app.register_blueprint(trends.trends_bp, url_prefix='/api/trends')
app.register_blueprint(content.content_bp, url_prefix='/api/content')
app.register_blueprint(video.video_bp, url_prefix='/api/video')
app.register_blueprint(publisher.publisher_bp, url_prefix='/api/publisher')
app.register_blueprint(storage.storage_bp, url_prefix='/api/storage')
app.register_blueprint(scheduler.scheduler_bp, url_prefix='/api/scheduler')
app.register_blueprint(analytics.analytics_bp)  # 성과 분석 API 활성화
app.register_blueprint(editor.editor_bp)       # 에디터 전용 API 활성화
app.register_blueprint(auth.auth_bp)            # GitHub OAuth 인증 API 활성화

# 페이지 라우트
@app.route('/trends')
def trends_page():
    return render_template('trends.html')

@app.route('/content')
def content_page():
    return render_template('content.html')

@app.route('/video')
def video_page():
    return render_template('video.html')

@app.route('/storage')
def storage_page():
    return render_template('storage.html')

@app.route('/publishing')
def publishing_page():
    return render_template('publishing.html')

@app.route('/scheduler')
def scheduler_page():
    return render_template('scheduler.html')

@app.route('/analytics')
def analytics_page():
    return render_template('analytics.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)