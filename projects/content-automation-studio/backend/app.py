from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

# 설정
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
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'services': {
            'webdav': check_webdav_connection(),
            'google_ai': check_google_ai_connection()
        }
    })

def check_webdav_connection():
    """WebDAV 연결 상태 확인"""
    try:
        from utils.webdav import WebDAVManager
        webdav = WebDAVManager()
        webdav.connect()
        return True
    except:
        return False

def check_google_ai_connection():
    """Google AI 연결 상태 확인"""
    try:
        from utils.ai_client import AIClient
        ai_client = AIClient()
        return ai_client.test_connection()
    except:
        return False

# API 라우트 임포트
from routes import content, video, trends, publisher, auth

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)