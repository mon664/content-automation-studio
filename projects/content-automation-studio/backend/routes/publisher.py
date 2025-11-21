from flask import Blueprint, request, jsonify
from utils.webdav import WebDAVManager
import requests
import json
from datetime import datetime

publisher_bp = Blueprint('publisher', __name__)

# 플랫폼별 설정
PLATFORM_CONFIGS = {
    'naver_blog': {
        'name': '네이버 블로그',
        'api_url': 'https://blog.naver.com/api/post',
        'fields': ['title', 'content', 'tags', 'category'],
        'max_length': 10000
    },
    'tistory': {
        'name': '티스토리',
        'api_url': 'https://www.tistory.com/api/post/write',
        'fields': ['title', 'content', 'category', 'tags'],
        'max_length': 50000
    },
    'wordpress': {
        'name': '워드프레스',
        'api_url': None,  # 사용자가 직접 입력해야 함
        'fields': ['title', 'content', 'categories', 'tags', 'status'],
        'max_length': 50000
    },
    'instagram': {
        'name': '인스타그램',
        'api_url': 'https://graph.instagram.com',
        'fields': ['image_url', 'caption', 'hashtags'],
        'max_length': 2200
    },
    'facebook': {
        'name': '페이스북',
        'api_url': 'https://graph.facebook.com',
        'fields': ['message', 'link', 'picture'],
        'max_length': 63206
    }
}

@publisher_bp.route('/platforms', methods=['GET'])
def get_platforms():
    """지원되는 플랫폼 목록"""
    return jsonify({
        'success': True,
        'platforms': [
            {
                'id': key,
                'name': config['name'],
                'supported_fields': config['fields'],
                'max_length': config['max_length']
            }
            for key, config in PLATFORM_CONFIGS.items()
        ]
    })

@publisher_bp.route('/publish', methods=['POST'])
def publish_content():
    """콘텐츠 발행"""
    data = request.get_json()

    required_fields = ['platform', 'title', 'content']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Platform, title, and content are required'}), 400

    platform = data['platform']
    title = data['title']
    content = data['content']

    if platform not in PLATFORM_CONFIGS:
        return jsonify({'error': f'Unsupported platform: {platform}'}), 400

    try:
        # 콘텐츠 길이 확인
        max_length = PLATFORM_CONFIGS[platform]['max_length']
        if len(content) > max_length:
            content = content[:max_length-3] + '...'

        # 이미지 URL 처리
        image_url = data.get('image_url')
        if image_url:
            content = f'<img src="{image_url}" alt="{title}" style="max-width: 100%; height: auto;"/><br/><br/>' + content

        # 플랫폼별 발행
        if platform == 'wordpress':
            result = publish_to_wordpress(data)
        elif platform == 'naver_blog':
            result = publish_to_naver_blog(data)
        elif platform == 'tistory':
            result = publish_to_tistory(data)
        elif platform == 'instagram':
            result = publish_to_instagram(data)
        elif platform == 'facebook':
            result = publish_to_facebook(data)
        else:
            result = {'success': False, 'error': f'Publishing to {platform} not implemented'}

        if result.get('success'):
            # 발행 기록 저장
            save_publishing_history(platform, title, content, result)

            return jsonify({
                'success': True,
                'platform': platform,
                'post_url': result.get('post_url'),
                'post_id': result.get('post_id'),
                'message': f"{PLATFORM_CONFIGS[platform]['name']}에 성공적으로 발행되었습니다."
            })
        else:
            return jsonify({
                'error': result.get('error', 'Publishing failed')
            }), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@publisher_bp.route('/preview', methods=['POST'])
def preview_content():
    """콘텐츠 미리보기"""
    data = request.get_json()

    required_fields = ['platform', 'title', 'content']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Platform, title, and content are required'}), 400

    platform = data['platform']
    title = data['title']
    content = data['content']

    if platform not in PLATFORM_CONFIGS:
        return jsonify({'error': f'Unsupported platform: {platform}'}), 400

    try:
        # 플랫폼별 포맷팅
        formatted_content = format_content_for_platform(platform, title, content, data)

        return jsonify({
            'success': True,
            'platform': platform,
            'preview': formatted_content,
            'platform_info': PLATFORM_CONFIGS[platform]
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@publisher_bp.route('/history', methods=['GET'])
def get_publishing_history():
    """발행 기록 조회"""
    try:
        # 실제 구현에서는 데이터베이스에서 조회
        # 여기서는 시뮬레이션 데이터 반환
        history = [
            {
                'id': 1,
                'platform': 'naver_blog',
                'title': 'AI 기술 동향 분석',
                'content_preview': '최근 AI 기술의 발전...',
                'post_url': 'https://blog.naver.com/example/123',
                'published_at': '2024-01-15T10:30:00',
                'status': 'published'
            },
            {
                'id': 2,
                'platform': 'instagram',
                'title': '오늘의 영감',
                'content_preview': '새로운 아이디어...',
                'post_url': 'https://instagram.com/p/example',
                'published_at': '2024-01-14T15:20:00',
                'status': 'published'
            }
        ]

        return jsonify({
            'success': True,
            'history': history
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def format_content_for_platform(platform, title, content, data):
    """플랫폼별 콘텐츠 포맷팅"""
    tags = data.get('tags', [])
    hashtags = ' '.join([f'#{tag}' for tag in tags])

    if platform in ['instagram', 'facebook']:
        # 소셜 미디어 포맷
        formatted = f"{title}\n\n{content}"
        if hashtags:
            formatted += f"\n\n{hashtags}"
        return formatted
    else:
        # 블로그 포맷
        formatted = f"<h1>{title}</h1>\n\n{content}"
        if tags:
            tag_html = ', '.join(tags)
            formatted += f"\n\n<p>태그: {tag_html}</p>"
        return formatted

def publish_to_wordpress(data):
    """워드프레스 발행 (시뮬레이션)"""
    try:
        # 실제로는 WordPress REST API 사용
        # 여기서는 성공 시뮬레이션
        post_id = f"wp_{int(datetime.now().timestamp())}"
        post_url = f"https://example.com/post/{post_id}"

        return {
            'success': True,
            'post_id': post_id,
            'post_url': post_url
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def publish_to_naver_blog(data):
    """네이버 블로그 발행 (시뮬레이션)"""
    try:
        # 실제로는 네이버 블로그 API 사용
        post_id = f"naver_{int(datetime.now().timestamp())}"
        post_url = f"https://blog.naver.com/example/{post_id}"

        return {
            'success': True,
            'post_id': post_id,
            'post_url': post_url
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def publish_to_tistory(data):
    """티스토리 발행 (시뮬레이션)"""
    try:
        # 실제로는 티스토리 API 사용
        post_id = f"tistory_{int(datetime.now().timestamp())}"
        post_url = f"https://example.tistory.com/{post_id}"

        return {
            'success': True,
            'post_id': post_id,
            'post_url': post_url
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def publish_to_instagram(data):
    """인스타그램 발행 (시뮬레이션)"""
    try:
        # 실제로는 Instagram Graph API 사용
        media_id = f"ig_{int(datetime.now().timestamp())}"
        post_url = f"https://instagram.com/p/example/{media_id}"

        return {
            'success': True,
            'post_id': media_id,
            'post_url': post_url
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def publish_to_facebook(data):
    """페이스북 발행 (시뮬레이션)"""
    try:
        # 실제로는 Facebook Graph API 사용
        post_id = f"fb_{int(datetime.now().timestamp())}"
        post_url = f"https://facebook.com/{post_id}"

        return {
            'success': True,
            'post_id': post_id,
            'post_url': post_url
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def save_publishing_history(platform, title, content, result):
    """발행 기록 저장 (시뮬레이션)"""
    try:
        # 실제로는 데이터베이스에 저장
        history_data = {
            'platform': platform,
            'title': title,
            'content': content[:200] + '...' if len(content) > 200 else content,
            'post_url': result.get('post_url'),
            'post_id': result.get('post_id'),
            'published_at': datetime.now().isoformat(),
            'status': 'published'
        }
        print(f"Publishing history saved: {history_data}")
        return True
    except Exception as e:
        print(f"Failed to save publishing history: {e}")
        return False