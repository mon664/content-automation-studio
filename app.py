from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__,
           static_folder='static',
           static_url_path='/static',
           template_folder='templates')
CORS(app)

# 환경 변수 설정
os.environ.update({
    'GOOGLE_PROJECT_ID': 'content-automation-studio',
    'GOOGLE_LOCATION': 'us-central1',
    'GEMINI_API_KEY': 'AIzaSyBlxBK-1-vl-Uzy5Vys9tLPQynRhGk30UY',
    'VERTEX_AI_API_KEY': 'AQ.Ab8RN6LuBT_emr293bsy-BBxgLc9l9TOnYCz73uoc-uA1aBp4A',
    'WEBDAV_URL': 'https://rausu.infini-cloud.net/dav',
    'WEBDAV_USERNAME': 'hhtsta',
    'WEBDAV_PASSWORD': 'RXYf3uYhCbL9Ezwa'
})

# 기본 라우트
@app.route('/')
def index():
    return render_template('index.html',
        version='2.0.0',
        status='running',
        timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
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
            'Multi-Platform Publishing'
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
from modules import trends, content, video, publisher, storage

# 블루프린트 등록
app.register_blueprint(trends.trends_bp, url_prefix='/api/trends')
app.register_blueprint(content.content_bp, url_prefix='/api/content')
app.register_blueprint(video.video_bp, url_prefix='/api/video')
app.register_blueprint(publisher.publisher_bp, url_prefix='/api/publisher')
app.register_blueprint(storage.storage_bp, url_prefix='/api/storage')

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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)