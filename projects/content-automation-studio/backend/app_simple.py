from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# 기본 설정
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
    return jsonify({
        'status': 'running',
        'service': 'Content Automation Studio',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'message': '✅ AI 기반 콘텐츠 자동 생성 플랫폼이 정상적으로 실행 중입니다!'
    })

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'flask': True,
            'api_keys': {
                'google_project_id': bool(os.getenv('GOOGLE_PROJECT_ID')),
                'gemini_api': bool(os.getenv('GEMINI_API_KEY')),
                'vertex_ai': bool(os.getenv('VERTEX_AI_API_KEY')),
                'webdav': bool(os.getenv('WEBDAV_URL'))
            }
        }
    })

# 테스트용 콘텐츠 생성 엔드포인트
@app.route('/api/test/content', methods=['POST'])
def test_content():
    data = request.get_json() or {}
    topic = data.get('topic', 'AI 기술')

    return jsonify({
        'success': True,
        'topic': topic,
        'content': f'"{topic}"에 대한 테스트 콘텐츠입니다. 실제 배포 시 Gemini API가 연결됩니다.',
        'timestamp': datetime.now().isoformat()
    })

# 테스트용 파일 업로드 엔드포인트
@app.route('/api/test/upload', methods=['POST'])
def test_upload():
    return jsonify({
        'success': True,
        'message': '파일 업로드 테스트 성공! 실제 배포 시 WebDAV에 저장됩니다.',
        'webdav_url': os.getenv('WEBDAV_URL'),
        'timestamp': datetime.now().isoformat()
    })

# 모든 요청에 대한 CORS 헤더 추가
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Content Automation Studio starting on port {port}")
    print(f"📊 Health check: http://localhost:{port}/api/health")
    app.run(debug=False, host='0.0.0.0', port=port)