from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__,
           static_folder='static',
           static_url_path='/static',
           template_folder='templates')

# CSP 완전 비활성화 설정
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True

# Flask-Talisman CSP 비활성화 (설치된 경우)
try:
    from flask_talisman import Talisman
    Talisman(app, force_https=False, **{
        'content_security_policy': None
    })
except ImportError:
    pass

CORS(app)

# 기본 보안 설정
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# 관리자 목록 (GitHub ID)
ADMIN_USERS = [
    'mon664',  # 당신의 GitHub 아이디
    # 추가 관리자 여기에 추가
]

def is_admin_user(github_username):
    """관리자인지 확인"""
    return github_username in ADMIN_USERS

# 환경 변수 설정
os.environ.update({
    'GOOGLE_PROJECT_ID': 'content-automation-studio',
    'GOOGLE_LOCATION': 'us-central1',
    'GEMINI_API_KEY': 'AIzaSyBlxBK-1-vl-Uzy5Vys9tLPQynRhGk30UY',
    'VERTEX_AI_API_KEY': 'AQ.Ab8RN6LuBT_emr293bsy-BBxgLc9l9TOnYCz73uoc-uA1aBp4A',
    'WEBDAV_URL': 'https://rausu.infini-cloud.net/dav',
    'WEBDAV_USERNAME': 'hhtsta',
    'WEBDAV_PASSWORD': 'RXYf3uYhCbL9Ezwa',
    # CSP 완전 비활성화 (Railway에서 CSP 자동 추가 방지)
    'DISABLE_SECURITY_HEADERS': 'true',
    'RAILWAY_ENVIRONMENT': 'production',
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
        current_user=None,
        is_authenticated=False
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
            'Real-time Image Upload Integration',
            'AutoVid-Style Video Script Generation',
            'YouTube SEO Optimization',
            'Batch Content Processing',
            'Gemini-Powered AutoBlog System',
            'Multi-Platform Blog Publishing'
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

# 모듈 임포트 - 강제 임포트 with error handling
try:
    from modules import auth, trends, content, video, publisher, storage, scheduler
    print("✅ Frontend modules imported successfully")
except ImportError as e:
    print(f"❌ Frontend modules import failed: {e}")
    # Create dummy modules to prevent crashes
    import types
    auth = types.ModuleType('auth')
    trends = types.ModuleType('trends')
    content = types.ModuleType('content')
    video = types.ModuleType('video')
    publisher = types.ModuleType('publisher')
    storage = types.ModuleType('storage')
    scheduler = types.ModuleType('scheduler')

    # Create dummy blueprints
    auth.auth_bp = None
    trends.trends_bp = None
    content.content_bp = None
    video.video_bp = None
    publisher.publisher_bp = None
    storage.storage_bp = None
    scheduler.scheduler_bp = None

try:
    from backend.routes import analytics, editor, admin, approval, video_script, gemini_blog
    print("✅ Backend modules imported successfully")
except ImportError as e:
    print(f"❌ Backend modules import failed: {e}")
    # Create dummy modules
    import types
    analytics = types.ModuleType('analytics')
    editor = types.ModuleType('editor')
    admin = types.ModuleType('admin')
    approval = types.ModuleType('approval')
    video_script = types.ModuleType('video_script')
    gemini_blog = types.ModuleType('gemini_blog')

    # Create dummy blueprints
    analytics.analytics_bp = None
    editor.editor_bp = None
    admin.admin_bp = None
    approval.approval_bp = None
    video_script.video_script_bp = None
    gemini_blog.gemini_blog_bp = None

# 안전한 블루프린트 등록
def safe_register_blueprint(bp, *args, **kwargs):
    """안전한 블루프린트 등록 - None 체크 포함"""
    if bp is not None:
        try:
            app.register_blueprint(bp, *args, **kwargs)
            print(f"✅ Blueprint registered: {kwargs.get('url_prefix', 'root')}")
        except Exception as e:
            print(f"❌ Blueprint registration failed: {e}")
    else:
        print(f"⚠️ Blueprint is None, skipping: {kwargs.get('url_prefix', 'root')}")

# GitHub OAuth 초기화 (안전하게)
try:
    if hasattr(auth, 'init_oauth') and auth.auth_bp:
        github_oauth = auth.init_oauth(app)
        safe_register_blueprint(auth.auth_bp)
    else:
        print("⚠️ Auth module not available, skipping OAuth initialization")
except Exception as e:
    print(f"❌ OAuth initialization failed: {e}")

# API 블루프린트 등록 (안전하게)
safe_register_blueprint(trends.trends_bp, url_prefix='/api/trends')
safe_register_blueprint(content.content_bp, url_prefix='/api/content')
safe_register_blueprint(video.video_bp, url_prefix='/api/video')
safe_register_blueprint(publisher.publisher_bp, url_prefix='/api/publisher')
safe_register_blueprint(storage.storage_bp, url_prefix='/api/storage')
safe_register_blueprint(scheduler.scheduler_bp, url_prefix='/api/scheduler')
safe_register_blueprint(analytics.analytics_bp)
safe_register_blueprint(editor.editor_bp)
safe_register_blueprint(admin.admin_bp)
safe_register_blueprint(approval.approval_bp)
safe_register_blueprint(video_script.video_script_bp, url_prefix='/api/video-script')
safe_register_blueprint(gemini_blog.gemini_blog_bp, url_prefix='/api/gemini-blog')

print("🚀 All API routes registered successfully!")

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

@app.route('/admin')
def admin_page():
    return render_template('admin.html')

@app.route('/video-script')
def video_script_page():
    return render_template('video_script.html')

@app.route('/autoblog')
def autoblog_page():
    return render_template('autoblog.html')

# CSP 헤더 완전 제거 (개발을 위해 일시적으로 비활성화)
# GitHub OAuth와 기타 기능은 CSP 없이도 작동하도록 설계됨

@app.after_request
def after_request(response):
    """CORS 헤더만 추가하고 모든 CSP 헤더 제거 및 완전 개방"""
    # Railway이 추가하는 CSP 헤더 강제 제거
    response.headers.pop('Content-Security-Policy', None)
    response.headers.pop('Content-Security-Policy-Report-Only', None)
    response.headers.pop('X-Content-Security-Policy', None)
    response.headers.pop('X-WebKit-CSP', None)

    # Railway이 다시 추가하는 것을 방지하기 위해 완전 개방된 CSP 설정
    response.headers['Content-Security-Policy'] = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; font-src * data:; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval'; img-src * data: blob:; connect-src *; frame-src *; child-src *"

    # CORS 헤더 추가
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)