from flask import Blueprint, request, jsonify
import requests
import json
import os
from datetime import datetime, timedelta
import time

publisher_bp = Blueprint('publisher', __name__)

# 플랫폼별 설정
PLATFORM_CONFIGS = {
    'naver_blog': {
        'name': '네이버 블로그',
        'api_url': 'https://blog.naver.com/api/post',
        'max_length': 10000,
        'supported_formats': ['text', 'html', 'image'],
        'requires_auth': True
    },
    'tistory': {
        'name': '티스토리',
        'api_url': 'https://www.tistory.com/apis/post/write',
        'max_length': 50000,
        'supported_formats': ['text', 'html', 'image'],
        'requires_auth': True
    },
    'wordpress': {
        'name': '워드프레스',
        'api_url': None,  # 사용자 지정 필요
        'max_length': 50000,
        'supported_formats': ['text', 'html', 'image'],
        'requires_auth': True
    },
    'instagram': {
        'name': '인스타그램',
        'api_url': 'https://graph.instagram.com',
        'max_length': 2200,
        'supported_formats': ['image', 'video', 'story'],
        'requires_auth': True
    },
    'facebook': {
        'name': '페이스북',
        'api_url': 'https://graph.facebook.com',
        'max_length': 63206,
        'supported_formats': ['text', 'image', 'video', 'link'],
        'requires_auth': True
    },
    'twitter': {
        'name': '트위터/X',
        'api_url': 'https://api.twitter.com/2',
        'max_length': 280,
        'supported_formats': ['text', 'image'],
        'requires_auth': True
    },
    'linkedin': {
        'name': '링크드인',
        'api_url': 'https://api.linkedin.com/v2',
        'max_length': 3000,
        'supported_formats': ['text', 'image', 'article'],
        'requires_auth': True
    },
    'youtube': {
        'name': '유튜브',
        'api_url': 'https://www.googleapis.com/youtube/v3',
        'max_length': 5000,  # description 길이
        'supported_formats': ['video', 'playlist'],
        'requires_auth': True
    }
}

# 발행 기록 저장 (메모리 - 실제로는 데이터베이스 사용)
PUBLISHING_HISTORY = []
SCHEDULED_POSTS = []

@publisher_bp.route('/platforms', methods=['GET'])
def get_platforms():
    """지원되는 플랫폼 목록"""
    platforms = []

    for key, config in PLATFORM_CONFIGS.items():
        platforms.append({
            'id': key,
            'name': config['name'],
            'max_length': config['max_length'],
            'supported_formats': config['supported_formats'],
            'requires_auth': config['requires_auth']
        })

    return jsonify({
        'success': True,
        'platforms': platforms,
        'total_count': len(platforms)
    })

@publisher_bp.route('/publish', methods=['POST'])
def publish_content():
    """콘텐츠 발행"""
    data = request.get_json()

    required_fields = ['platform', 'content']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Platform and content are required'}), 400

    platform = data['platform']
    content = data['content']
    title = data.get('title', '')
    media_urls = data.get('media_urls', [])
    hashtags = data.get('hashtags', [])
    tags = data.get('tags', [])
    schedule_time = data.get('schedule_time')  # ISO 형식

    if platform not in PLATFORM_CONFIGS:
        return jsonify({'error': f'Unsupported platform: {platform}'}), 400

    try:
        # 예약 발행 처리
        if schedule_time:
            schedule_time_dt = datetime.fromisoformat(schedule_time.replace('Z', '+00:00'))
            if schedule_time_dt > datetime.now():
                scheduled_post = {
                    'id': len(SCHEDULED_POSTS) + 1,
                    'platform': platform,
                    'content': content,
                    'title': title,
                    'media_urls': media_urls,
                    'hashtags': hashtags,
                    'tags': tags,
                    'schedule_time': schedule_time,
                    'status': 'scheduled',
                    'created_at': datetime.now().isoformat()
                }
                SCHEDULED_POSTS.append(scheduled_post)

                return jsonify({
                    'success': True,
                    'message': f'Content scheduled for {platform}',
                    'scheduled_id': scheduled_post['id'],
                    'schedule_time': schedule_time
                })

        # 즉시 발행
        result = publish_to_platform(platform, {
            'content': content,
            'title': title,
            'media_urls': media_urls,
            'hashtags': hashtags,
            'tags': tags
        })

        if result['success']:
            # 발행 기록 저장
            history_entry = {
                'id': len(PUBLISHING_HISTORY) + 1,
                'platform': platform,
                'title': title,
                'content': content[:200] + '...' if len(content) > 200 else content,
                'post_url': result.get('post_url'),
                'post_id': result.get('post_id'),
                'status': result.get('status', 'published'),
                'hashtags': hashtags,
                'tags': tags,
                'published_at': datetime.now().isoformat()
            }
            PUBLISHING_HISTORY.append(history_entry)

            return jsonify({
                'success': True,
                'platform': platform,
                'post_url': result.get('post_url'),
                'post_id': result.get('post_id'),
                'message': f"Successfully published to {PLATFORM_CONFIGS[platform]['name']}",
                'published_at': history_entry['published_at']
            })
        else:
            return jsonify({
                'error': result.get('error', 'Publishing failed')
            }), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@publisher_bp.route('/publish/batch', methods=['POST'])
def publish_batch():
    """다중 플랫폼 동시 발행"""
    data = request.get_json()

    if not data or 'platforms' not in data or 'content' not in data:
        return jsonify({'error': 'Platforms and content are required'}), 400

    platforms = data['platforms']
    content = data['content']
    title = data.get('title', '')
    media_urls = data.get('media_urls', [])
    hashtags = data.get('hashtags', [])
    tags = data.get('tags', [])

    results = []

    for platform in platforms:
        if platform not in PLATFORM_CONFIGS:
            results.append({
                'platform': platform,
                'success': False,
                'error': 'Unsupported platform'
            })
            continue

        try:
            result = publish_to_platform(platform, {
                'content': content,
                'title': title,
                'media_urls': media_urls,
                'hashtags': hashtags,
                'tags': tags
            })

            if result['success']:
                # 발행 기록 저장
                history_entry = {
                    'id': len(PUBLISHING_HISTORY) + 1,
                    'platform': platform,
                    'title': title,
                    'content': content[:200] + '...' if len(content) > 200 else content,
                    'post_url': result.get('post_url'),
                    'post_id': result.get('post_id'),
                    'status': 'published',
                    'published_at': datetime.now().isoformat()
                }
                PUBLISHING_HISTORY.append(history_entry)

                results.append({
                    'platform': platform,
                    'success': True,
                    'post_url': result.get('post_url'),
                    'post_id': result.get('post_id')
                })
            else:
                results.append({
                    'platform': platform,
                    'success': False,
                    'error': result.get('error', 'Publishing failed')
                })

        except Exception as e:
            results.append({
                'platform': platform,
                'success': False,
                'error': str(e)
            })

    success_count = sum(1 for r in results if r['success'])

    return jsonify({
        'success': True,
        'results': results,
        'summary': {
            'total_platforms': len(platforms),
            'successful': success_count,
            'failed': len(platforms) - success_count
        },
        'message': f'Published to {success_count}/{len(platforms)} platforms'
    })

@publisher_bp.route('/preview', methods=['POST'])
def preview_content():
    """플랫폼별 콘텐츠 미리보기"""
    data = request.get_json()

    if not data or 'platform' not in data or 'content' not in data:
        return jsonify({'error': 'Platform and content are required'}), 400

    platform = data['platform']
    content = data['content']
    title = data.get('title', '')
    media_urls = data.get('media_urls', [])
    hashtags = data.get('hashtags', [])

    if platform not in PLATFORM_CONFIGS:
        return jsonify({'error': f'Unsupported platform: {platform}'}), 400

    try:
        preview = format_content_for_platform(platform, content, title, media_urls, hashtags)

        return jsonify({
            'success': True,
            'platform': platform,
            'preview': preview,
            'platform_info': PLATFORM_CONFIGS[platform]
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@publisher_bp.route('/history', methods=['GET'])
def get_publishing_history():
    """발행 기록 조회"""
    platform = request.args.get('platform')
    limit = int(request.args.get('limit', 20))
    offset = int(request.args.get('offset', 0))

    try:
        # 필터링
        filtered_history = PUBLISHING_HISTORY
        if platform:
            filtered_history = [h for h in PUBLISHING_HISTORY if h['platform'] == platform]

        # 페이징
        total_count = len(filtered_history)
        paginated_history = filtered_history[offset:offset + limit]

        return jsonify({
            'success': True,
            'history': paginated_history,
            'pagination': {
                'total': total_count,
                'limit': limit,
                'offset': offset,
                'has_more': offset + limit < total_count
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@publisher_bp.route('/scheduled', methods=['GET'])
def get_scheduled_posts():
    """예약 발행 목록 조회"""
    try:
        return jsonify({
            'success': True,
            'scheduled_posts': SCHEDULED_POSTS,
            'total_count': len(SCHEDULED_POSTS)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@publisher_bp.route('/scheduled/<int:scheduled_id>', methods=['DELETE'])
def cancel_scheduled_post(scheduled_id):
    """예약 발행 취소"""
    try:
        global SCHEDULED_POSTS
        SCHEDULED_POSTS = [post for post in SCHEDULED_POSTS if post['id'] != scheduled_id]

        return jsonify({
            'success': True,
            'message': f'Scheduled post {scheduled_id} cancelled'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@publisher_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """발행 분석 데이터"""
    try:
        # 플랫폼별 통계
        platform_stats = {}
        for platform in PLATFORM_CONFIGS.keys():
            platform_posts = [h for h in PUBLISHING_HISTORY if h['platform'] == platform]
            platform_stats[platform] = {
                'total_posts': len(platform_posts),
                'latest_post': platform_posts[-1]['published_at'] if platform_posts else None
            }

        # 시간별 통계
        daily_stats = {}
        for history in PUBLISHING_HISTORY:
            date = history['published_at'][:10]
            if date not in daily_stats:
                daily_stats[date] = 0
            daily_stats[date] += 1

        return jsonify({
            'success': True,
            'analytics': {
                'total_posts': len(PUBLISHING_HISTORY),
                'platform_stats': platform_stats,
                'daily_stats': daily_stats,
                'scheduled_posts': len(SCHEDULED_POSTS)
            },
            'generated_at': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def publish_to_platform(platform, content_data):
    """플랫폼별 실제 발행 로직"""
    try:
        if platform == 'instagram':
            return publish_to_instagram(content_data)
        elif platform == 'facebook':
            return publish_to_facebook(content_data)
        elif platform == 'twitter':
            return publish_to_twitter(content_data)
        elif platform == 'linkedin':
            return publish_to_linkedin(content_data)
        elif platform == 'wordpress':
            return publish_to_wordpress(content_data)
        elif platform == 'naver_blog':
            return publish_to_naver_blog(content_data)
        elif platform == 'tistory':
            return publish_to_tistory(content_data)
        else:
            return {'success': False, 'error': f'Publishing to {platform} not implemented'}

    except Exception as e:
        return {'success': False, 'error': str(e)}

def publish_to_instagram(content_data):
    """인스타그램 발행 (시뮬레이션)"""
    # 실제로는 Instagram Graph API 사용
    post_id = f"ig_{int(time.time())}_{hash(content_data['content']) % 10000}"
    post_url = f"https://instagram.com/p/{post_id}"

    return {
        'success': True,
        'post_id': post_id,
        'post_url': post_url,
        'status': 'published'
    }

def publish_to_facebook(content_data):
    """페이스북 발행 (시뮬레이션)"""
    # 실제로는 Facebook Graph API 사용
    post_id = f"fb_{int(time.time())}_{hash(content_data['content']) % 10000}"
    post_url = f"https://facebook.com/{post_id}"

    return {
        'success': True,
        'post_id': post_id,
        'post_url': post_url,
        'status': 'published'
    }

def publish_to_twitter(content_data):
    """트위터 발행 (시뮬레이션)"""
    # 실제로는 Twitter API v2 사용
    post_id = f"{int(time.time())}_{hash(content_data['content']) % 10000}"
    post_url = f"https://twitter.com/user/status/{post_id}"

    return {
        'success': True,
        'post_id': post_id,
        'post_url': post_url,
        'status': 'published'
    }

def publish_to_linkedin(content_data):
    """링크드인 발행 (시뮬레이션)"""
    # 실제로는 LinkedIn API 사용
    post_id = f"li_{int(time.time())}_{hash(content_data['content']) % 10000}"
    post_url = f"https://linkedin.com/posts/{post_id}"

    return {
        'success': True,
        'post_id': post_id,
        'post_url': post_url,
        'status': 'published'
    }

def publish_to_wordpress(content_data):
    """워드프레스 발행 (시뮬레이션)"""
    # 실제로는 WordPress REST API 사용
    post_id = f"wp_{int(time.time())}"
    post_url = f"https://example.com/{post_id}"

    return {
        'success': True,
        'post_id': post_id,
        'post_url': post_url,
        'status': 'published'
    }

def publish_to_naver_blog(content_data):
    """네이버 블로그 발행 (시뮬레이션)"""
    # 실제로는 네이버 블로그 API 사용
    post_id = f"naver_{int(time.time())}"
    post_url = f"https://blog.naver.com/username/{post_id}"

    return {
        'success': True,
        'post_id': post_id,
        'post_url': post_url,
        'status': 'published'
    }

def publish_to_tistory(content_data):
    """티스토리 발행 (시뮬레이션)"""
    # 실제로는 티스토리 API 사용
    post_id = f"tistory_{int(time.time())}"
    post_url = f"https://username.tistory.com/{post_id}"

    return {
        'success': True,
        'post_id': post_id,
        'post_url': post_url,
        'status': 'published'
    }

def format_content_for_platform(platform, content, title, media_urls, hashtags):
    """플랫폼별 콘텐츠 포매팅"""
    config = PLATFORM_CONFIGS[platform]

    if platform in ['instagram', 'facebook', 'twitter']:
        # 소셜 미디어 포맷
        formatted = f"{title}\n\n{content}" if title else content

        # 해시태그 추가
        if hashtags:
            hashtag_str = ' '.join([f'#{tag}' for tag in hashtags])
            formatted += f"\n\n{hashtag_str}"

        # 길이 제한 적용
        if len(formatted) > config['max_length']:
            formatted = formatted[:config['max_length']-3] + '...'

        return formatted

    elif platform in ['wordpress', 'naver_blog', 'tistory']:
        # 블로그 포맷 (HTML)
        formatted = f"<h1>{title}</h1>\n\n{content}"

        # 이미지 추가
        if media_urls:
            for img_url in media_urls:
                formatted += f'\n\n<img src="{img_url}" alt="{title}" style="max-width: 100%; height: auto;">'

        # 태그 추가
        if hashtags:
            tag_html = ', '.join(hashtags)
            formatted += f'\n\n<p>태그: {tag_html}</p>'

        return formatted

    elif platform == 'linkedin':
        # 링크드인 포맷 (전문적)
        formatted = f"{title}\n\n{content}"

        if hashtags:
            hashtag_str = ' '.join([f'#{tag}' for tag in hashtags[:3]])  # 최대 3개
            formatted += f"\n\n{hashtag_str}"

        return formatted

    else:
        return content