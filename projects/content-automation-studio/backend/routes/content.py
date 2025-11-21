from flask import Blueprint, request, jsonify
from utils.webdav import WebDAVManager
from utils.ai_client import AIClient
import tempfile
import os

content_bp = Blueprint('content', __name__)

@content_bp.route('/generate-blog', methods=['POST'])
def generate_blog():
    """블로그 글 생성 API"""
    data = request.get_json()

    if not data or 'topic' not in data:
        return jsonify({'error': 'Topic is required'}), 400

    topic = data['topic']
    keywords = data.get('keywords', [])

    try:
        # AI 클라이언트 초기화
        ai_client = AIClient()

        # 블로그 글 생성
        blog_result = ai_client.generate_blog_post(topic, keywords)

        if not blog_result['success']:
            return jsonify({'error': blog_result['error']}), 500

        blog_content = blog_result['text']

        # 이미지 프롬프트 생성
        image_prompt = ai_client.generate_image_prompt(blog_content)

        # 결과 반환
        return jsonify({
            'success': True,
            'blog_content': blog_content,
            'image_prompt': image_prompt,
            'topic': topic,
            'keywords': keywords
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@content_bp.route('/upload-file', methods=['POST'])
def upload_file():
    """파일 업로드 API"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # 임시 파일 저장
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            file.save(tmp_file.name)

            # WebDAV에 업로드
            webdav = WebDAVManager()
            upload_result = webdav.upload_file(tmp_file.name)

            # 임시 파일 삭제
            os.unlink(tmp_file.name)

            if upload_result['success']:
                return jsonify({
                    'success': True,
                    'url': upload_result['url'],
                    'remote_path': upload_result['remote_path'],
                    'filename': file.filename,
                    'size': os.path.getsize(tmp_file.name)
                })
            else:
                return jsonify({'error': upload_result['error']}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@content_bp.route('/files', methods=['GET'])
def list_files():
    """파일 목록 조회 API"""
    path = request.args.get('path', '/uploads')

    try:
        webdav = WebDAVManager()
        files = webdav.list_files(path)

        file_list = []
        for item in files:
            file_list.append({
                'name': getattr(item, 'name', 'Unknown'),
                'size': getattr(item, 'size', 0),
                'modified': getattr(item, 'modified', None),
                'is_directory': getattr(item, 'is_dir', lambda: False)(),
                'path': getattr(item, 'path', item.name if hasattr(item, 'name') else 'Unknown')
            })

        return jsonify({
            'success': True,
            'files': file_list,
            'current_path': path
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500