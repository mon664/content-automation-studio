from flask import Blueprint, request, jsonify
from datetime import datetime
import logging
import os
import sys
import tempfile
from werkzeug.utils import secure_filename

# utils 디렉토리를 Python path에 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

try:
    from utils.analytics_service import AnalyticsService
except ImportError:
    # Fallback if analytics service not available
    AnalyticsService = None
    print("Warning: AnalyticsService not available, using fallback functionality")

# Editor 블루프린트 생성
editor_bp = Blueprint('editor', __name__, url_prefix='/api/editor')

# 로거 설정
logger = logging.getLogger(__name__)

# WebDAV 설정 (환경 변수에서 가져오기)
WEBDAV_URL = os.environ.get('WEBDAV_URL', 'https://rausu.infini-cloud.net/dav')
WEBDAV_USERNAME = os.environ.get('WEBDAV_USERNAME', 'hhtsta')
WEBDAV_PASSWORD = os.environ.get('WEBDAV_PASSWORD', 'RXYf3uYhCbL9Ezwa')

# 허용된 파일 확장자
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}

def allowed_file(filename):
    """허용된 파일 확장자인지 확인"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_to_webdav(file, remote_path):
    """
    WebDAV에 파일 업로드 (간소화된 버전)
    실제 구현 시 requests-webdav 라이브러리 사용 권장
    """
    try:
        import requests
        from requests.auth import HTTPBasicAuth

        # 임시 파일로 저장
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name

        # WebDAV 업로드 (PUT 요청)
        with open(temp_file_path, 'rb') as f:
            response = requests.put(
                f"{WEBDAV_URL}{remote_path}",
                data=f.read(),
                auth=HTTPBasicAuth(WEBDAV_USERNAME, WEBDAV_PASSWORD)
            )

        # 임시 파일 삭제
        os.unlink(temp_file_path)

        if response.status_code in [200, 201, 204]:
            # 공용 URL 생성 (실제 환경에 맞게 수정 필요)
            public_url = f"{WEBDAV_URL}{remote_path}"
            return public_url
        else:
            logger.error(f"WebDAV upload failed: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        logger.error(f"WebDAV upload error: {str(e)}")
        return None

@editor_bp.route('/upload-image', methods=['POST'])
def upload_editor_image():
    """
    WYSIWYG 에디터에서 이미지 붙여넣기/드래그 시 호출
    WebDAV에 저장 후 이미지 URL 반환
    """
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file'}), 400

        file = request.files['image']

        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400

        # 안전한 파일명 생성
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m/%d')
        remote_path = f"/uploads/editor/{timestamp}/{filename}"

        # WebDAV 업로드
        public_url = upload_to_webdav(file, remote_path)

        if public_url:
            logger.info(f"Image uploaded successfully: {public_url}")
            return jsonify({
                'success': True,
                'url': public_url,
                'filename': filename,
                'path': remote_path
            })
        else:
            return jsonify({'error': 'Upload failed'}), 500

    except Exception as e:
        logger.error(f"Editor image upload error: {str(e)}")
        return jsonify({'error': 'Upload failed due to server error'}), 500

@editor_bp.route('/upload-file', methods=['POST'])
def upload_editor_file():
    """
    에디터에서 일반 파일 업로드 (PDF, DOC 등)
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # 안전한 파일명 생성
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m/%d')
        remote_path = f"/uploads/editor/files/{timestamp}/{filename}"

        # WebDAV 업로드
        public_url = upload_to_webdav(file, remote_path)

        if public_url:
            logger.info(f"File uploaded successfully: {public_url}")
            return jsonify({
                'success': True,
                'url': public_url,
                'filename': filename,
                'path': remote_path,
                'size': file.content_length
            })
        else:
            return jsonify({'error': 'Upload failed'}), 500

    except Exception as e:
        logger.error(f"Editor file upload error: {str(e)}")
        return jsonify({'error': 'Upload failed due to server error'}), 500

@editor_bp.route('/health', methods=['GET'])
def health_check():
    """Editor API 헬스체크"""
    return jsonify({
        'status': 'healthy',
        'service': 'Editor API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'endpoints': [
            '/api/editor/upload-image',
            '/api/editor/upload-file'
        ]
    })

# 에러 핸들러
@editor_bp.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large'}), 413

@editor_bp.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@editor_bp.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500