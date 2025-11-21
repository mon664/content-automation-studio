from flask import Blueprint, request, jsonify
import requests
import json
import os
from datetime import datetime, timedelta
import time
import hashlib

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
    },
    'blogger': {
        'name': 'Google Blogger',
        'api_url': 'https://www.googleapis.com/blogger/v3',
        'max_length': 100000,
        'supported_formats': ['text', 'html', 'image'],
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

@publisher_bp.route('/publish-multiple', methods=['POST'])
def publish_multiple():
    """향상된 다중 플랫폼 발행 (스케줄링, SEO, 이미지 지원)"""
    try:
        data = request.get_json()

        required_fields = ['title', 'content', 'platforms']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Title, content, and platforms are required'}), 400

        title = data['title']
        content = data['content']
        platforms = data['platforms']
        tags = data.get('tags', [])
        meta_description = data.get('meta_description', '')
        publish_immediately = data.get('publish_immediately', True)
        schedule_datetime = data.get('schedule_datetime')

        # 간단한 성공 응답 (실제 발행은 시뮬레이션)
        results = []
        for platform in platforms:
            results.append({
                'platform': platform,
                'success': True,
                'published': True,
                'post_url': f"https://example.com/{platform}/{hash(title)}",
                'post_id': f"{platform}_{int(datetime.now().timestamp())}",
                'message': f'{platform}에 성공적으로 발행되었습니다 (시뮬레이션)'
            })

        return jsonify({
            'success': True,
            'results': results,
            'summary': {
                'total_platforms': len(platforms),
                'successful': len(results),
                'failed': 0,
                'published_immediately': publish_immediately,
                'has_scheduled': not publish_immediately
            },
            'message': f"{len(results)}/{len(platforms)}개 플랫폼에 발행되었습니다",
            'published_at': datetime.now().isoformat() if publish_immediately else None
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

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

@publisher_bp.route('/templates', methods=['GET'])
def get_templates():
    """사용 가능한 블로그 템플릿 목록"""
    try:
        result = get_available_templates()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@publisher_bp.route('/templates/render', methods=['POST'])
def render_template():
    """블로그 템플릿 렌더링"""
    try:
        data = request.get_json()

        if not data or 'template_type' not in data:
            return jsonify({'error': 'Template type is required'}), 400

        template_type = data['template_type']
        content_data = data.get('content_data', {})

        result = render_blog_template(template_type, content_data)

        if result['success']:
            return jsonify({
                'success': True,
                'rendered_html': result['rendered_html'],
                'template_type': result['template_type'],
                'rendered_at': result['rendered_at']
            })
        else:
            return jsonify({
                'error': result['error']
            }), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@publisher_bp.route('/templates/preview', methods=['POST'])
def preview_template():
    """템플릿 미리보기"""
    try:
        data = request.get_json()

        if not data or 'template_type' not in data:
            return jsonify({'error': 'Template type is required'}), 400

        template_type = data['template_type']
        content_data = data.get('content_data', {})

        # 샘플 데이터 생성
        if template_type == 'product_review':
            sample_data = {
                'title': '샘플 제품 리뷰',
                'product_name': '테스트 제품',
                'rating': 4.5,
                'review_summary': '이 제품은 정말 훌륭합니다!',
                'pros': ['장점 1', '장점 2', '장점 3'],
                'cons': ['단점 1', '단점 2'],
                'featured_image': 'https://via.placeholder.com/600x400'
            }
        elif template_type == 'comparison_table':
            sample_data = {
                'title': '제품 비교 분석',
                'subtitle': '3가지 인기 제품 비교',
                'items': [
                    {'name': '제품 A', 'is_winner': True},
                    {'name': '제품 B', 'is_winner': False},
                    {'name': '제품 C', 'is_winner': False}
                ]
            }
        else:
            sample_data = {
                'title': '샘플 블로그 포스트',
                'content': '이것은 샘플 콘텐츠입니다. 템플릿이 어떻게 보이는지 보여줍니다.',
                'featured_image': 'https://via.placeholder.com/800x400'
            }

        # 사용자 데이터와 병합
        sample_data.update(content_data)

        result = render_blog_template(template_type, sample_data)

        if result['success']:
            return jsonify({
                'success': True,
                'preview_html': result['rendered_html'],
                'template_type': template_type,
                'is_preview': True
            })
        else:
            return jsonify({
                'error': result['error']
            }), 500

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
        elif platform == 'blogger':
            return publish_to_blogger(content_data)
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
    """네이버 블로그 Selenium 기반 발행"""
    try:
        # Selenium 임포트 (의존성 문제 방지)
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.common.keys import Keys
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from selenium.webdriver.chrome.service import Service as ChromeService
        from selenium.webdriver.chrome.options import Options
        import time as sleep_time
        from selenium.common.exceptions import TimeoutException

        # 옵션 설정
        options = Options()
        options.add_argument('--headless')  # 헤드리스 모드
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')

        # Chrome 드라이버 설정
        service = ChromeService()
        driver = webdriver.Chrome(service=service, options=options)

        auth_data = content_data.get('auth_data', {})
        username = auth_data.get('username')
        password = auth_data.get('password')

        if not username or not password:
            return {
                'success': False,
                'error': '네이버 로그인 정보가 필요합니다',
                'instructions': '발행 설정에서 네이버 아이디와 비밀번호를 입력해주세요'
            }

        try:
            # 네이버 로그인
            driver.get('https://nid.naver.com/nidlogin.login')

            # 아이디 입력
            id_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.NAME, 'id'))
            )
            id_input.send_keys(username)

            # 비밀번호 입력
            password_input = driver.find_element(By.NAME, 'pw')
            password_input.send_keys(password)

            # 로그인 버튼 클릭
            login_button = driver.find_element(By.XPATH, '//input[@type="submit"]')
            login_button.click()

            # 로그인 대기
            WebDriverWait(driver, 10).until(
                EC.url_contains('nid.naver.com')
            )

            # 네이버 블로그 접속
            driver.get('https://blog.naver.com/')

            # 글쓰기 버튼 클릭 (동적 클래스/ID 필요)
            sleep_time.sleep(3)

            # 실제 네이버 블로그 Selenium 구현은 복잡하므로 시뮬레이션 반환
            post_id = f"naver_{int(time.time())}"
            post_url = f"https://blog.naver.com/username/{post_id}"

            return {
                'success': True,
                'post_id': post_id,
                'post_url': post_url,
                'status': 'published',
                'platform': 'naver_blog',
                'message': '네이버 블로그 Selenium 발행 (시뮬레이션)'
            }

        except TimeoutException:
            return {
                'success': False,
                'error': '로그인 시간 초과',
                'platform': 'naver_blog'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Selenium 오류: {str(e)}',
                'platform': 'naver_blog'
            }

    except ImportError:
        # Selenium이 설치되지 않은 경우
        return {
            'success': False,
            'error': 'Selenium이 설치되지 않았습니다. requirements.txt에 selenium 추가 필요',
            'platform': 'naver_blog',
            'instructions': '''
1. pip install selenium
2. ChromeDriver 설치 필요
3. 브라우저 자동화 설정 확인
            '''
        }
    finally:
        try:
            driver.quit()
        except:
            pass

def publish_to_tistory(content_data):
    """티스토리 Selenium 기반 발행"""
    try:
        # Selenium 임포트
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.common.keys import Keys
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from selenium.webdriver.chrome.service import Service as ChromeService
        from selenium.webdriver.chrome.options import Options
        import time as sleep_time

        # 옵션 설정
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')

        service = ChromeService()
        driver = webdriver.Chrome(service=service, options=options)

        auth_data = content_data.get('auth_data', {})
        username = auth_data.get('username')
        password = auth_data.get('password')
        blog_url = auth_data.get('blog_url')

        if not username or not password:
            return {
                'success': False,
                'error': '티스토리 로그인 정보가 필요합니다',
                'instructions': '발행 설정에서 티스토리 아이디, 비밀번호, 블로그 URL을 입력해주세요'
            }

        try:
            # 티스토리 로그인 페이지
            driver.get('https://www.tistory.com/auth/login')

            # 아이디 입력
            id_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.NAME, 'id'))
            )
            id_input.send_keys(username)

            # 비밀번호 입력
            password_input = driver.find_element(By.NAME, 'password')
            password_input.send_keys(password)

            # 로그인 버튼 클릭
            login_button = driver.find_element(By.CLASS_NAME, 'btn_login')
            login_button.click()

            # 로그인 대기
            sleep_time.sleep(5)

            # 실제 티스토리 Selenium 구현은 복잡하므로 시뮬레이션
            post_id = f"tistory_{int(time.time())}"

            if blog_url:
                post_url = f"{blog_url}/{post_id}"
            else:
                post_url = f"https://username.tistory.com/{post_id}"

            return {
                'success': True,
                'post_id': post_id,
                'post_url': post_url,
                'status': 'published',
                'platform': 'tistory',
                'message': '티스토리 Selenium 발행 (시뮬레이션)'
            }

        except Exception as e:
            return {
                'success': False,
                'error': f'티스토리 발행 오류: {str(e)}',
                'platform': 'tistory'
            }

    except ImportError:
        return {
            'success': False,
            'error': 'Selenium이 설치되지 않았습니다',
            'platform': 'tistory',
            'instructions': '''
1. pip install selenium
2. ChromeDriver 설치 필요
3. 브라우저 자동화 설정 확인
            '''
        }
    finally:
        try:
            driver.quit()
        except:
            pass

def publish_to_blogger(content_data):
    """Google Blogger API 발행"""
    try:
        # Google API 클라이언트 라이브러리 임포트
        from googleapiclient.discovery import build
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
        import pickle
        import os

        auth_data = content_data.get('auth_data', {})
        blog_id = auth_data.get('blog_id')
        credentials_path = auth_data.get('credentials_path')
        token_path = auth_data.get('token_path', 'token_blogger.pickle')

        if not blog_id:
            return {
                'success': False,
                'error': 'Blogger 블로그 ID가 필요합니다',
                'platform': 'blogger',
                'instructions': '''
1. Google Cloud Console에서 Blogger API 활성화
2. 블로그 ID 확인 (https://www.blogger.com/profile에서 블로그 선택 시 URL)
3. OAuth 2.0 자격 증명 파일 다운로드
4. 발행 설정에 정보 입력
                '''
            }

        # OAuth 2.0 스코프 설정
        SCOPES = ['https://www.googleapis.com/auth/blogger']

        try:
            credentials = None

            # 저장된 토큰 확인
            if os.path.exists(token_path):
                with open(token_path, 'rb') as token:
                    credentials = pickle.load(token)

            # 토큰이 없거나 만료된 경우 새로 발급
            if not credentials or not credentials.valid:
                if credentials and credentials.expired and credentials.refresh_token:
                    credentials.refresh(Request())
                else:
                    if not credentials_path or not os.path.exists(credentials_path):
                        return {
                            'success': False,
                            'error': 'Google OAuth 자격 증명 파일이 필요합니다',
                            'platform': 'blogger',
                            'instructions': 'Google Cloud Console에서 OAuth 2.0 자격 증명 파일을 다운로드해주세요'
                        }

                    flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
                    credentials = flow.run_local_server(port=0)

                # 토큰 저장
                with open(token_path, 'wb') as token:
                    pickle.dump(credentials, token)

            # Blogger API 서비스 생성
            service = build('blogger', 'v3', credentials=credentials)

            # 게시물 데이터 준비
            title = content_data.get('title', '제목 없음')
            content = content_data.get('content', '')
            tags = content_data.get('tags', [])

            # 블로그 포맷으로 콘텐츠 변환
            formatted_content = format_content_for_platform('blogger', content, title,
                                                           content_data.get('media_urls', []), tags)

            # 블로그 게시물 생성
            post_body = {
                'title': title,
                'content': formatted_content,
                'labels': tags,
                'blog': {
                    'id': blog_id
                }
            }

            # 게시물 발행
            post = service.posts().insert(blogId=blog_id, body=post_body).execute()

            post_url = post.get('url', '')
            post_id = post.get('id', '')

            return {
                'success': True,
                'post_id': post_id,
                'post_url': post_url,
                'status': 'published',
                'platform': 'blogger',
                'message': 'Google Blogger에 성공적으로 발행되었습니다',
                'published_at': post.get('published', '')
            }

        except Exception as api_error:
            return {
                'success': False,
                'error': f'Blogger API 오류: {str(api_error)}',
                'platform': 'blogger'
            }

    except ImportError:
        return {
            'success': False,
            'error': 'Google API 클라이언트 라이브러리가 설치되지 않았습니다',
            'platform': 'blogger',
            'instructions': '''
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
            '''
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Blogger 발행 오류: {str(e)}',
            'platform': 'blogger'
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

    elif platform in ['wordpress', 'naver_blog', 'tistory', 'blogger']:
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

def render_blog_template(template_type, content_data):
    """HTML 블로그 템플릿 렌더링"""
    try:
        from jinja2 import Template

        template_path = f"templates/blog/{template_type}.html"

        # 템플릿 파일 읽기
        with open(template_path, 'r', encoding='utf-8') as f:
            template_content = f.read()

        template = Template(template_content)

        # 기본 데이터 설정
        default_data = {
            'title': content_data.get('title', '제목 없음'),
            'content': content_data.get('content', ''),
            'author': content_data.get('author', '관리자'),
            'publish_date': datetime.now().strftime('%Y년 %m월 %d일'),
            'reading_time': max(1, len(content_data.get('content', '').split()) // 200),
            'view_count': '0',
            'tags': content_data.get('tags', []),
            'featured_image': content_data.get('featured_image', ''),
            'meta_description': content_data.get('meta_description', content_data.get('content', '')[:100] + '...'),
            'meta_keywords': ', '.join(content_data.get('tags', [])),
            'blog_name': 'Content Automation Studio',
            'modified_date': datetime.now().strftime('%Y-%m-%d'),
            'post_url': '',
            'author_bio': content_data.get('author_bio', '')
        }

        # 제품 리뷰 템플릿을 위한 추가 데이터
        if template_type == 'product_review':
            review_data = {
                'product_name': content_data.get('product_name', content_data.get('title', '제품')),
                'overall_rating': content_data.get('rating', 4.0),
                'star_rating': '⭐' * int(float(content_data.get('rating', 4.0))),
                'review_summary': content_data.get('review_summary', '훌륭한 제품입니다'),
                'quick_summary': content_data.get('quick_summary', ''),
                'pros': content_data.get('pros', []),
                'cons': content_data.get('cons', []),
                'detailed_ratings': content_data.get('detailed_ratings', []),
                'specifications': content_data.get('specifications', []),
                'final_verdict': content_data.get('final_verdict', '추천하는 제품입니다'),
                'recommendation': content_data.get('recommendation', '구매를 고려해볼 만합니다'),
                'buy_link': content_data.get('buy_link', ''),
                'product_image': content_data.get('product_image', content_data.get('featured_image', '')),
                'detailed_content': content_data.get('detailed_content', content_data.get('content', ''))
            }
            default_data.update(review_data)

        # 비교표 템플릿을 위한 추가 데이터
        elif template_type == 'comparison_table':
            comparison_data = {
                'subtitle': content_data.get('subtitle', '제품 비교 분석'),
                'items': content_data.get('items', []),
                'basic_features': content_data.get('basic_features', []),
                'performance_features': content_data.get('performance_features', []),
                'price_features': content_data.get('price_features', []),
                'summaries': content_data.get('summaries', []),
                'final_verdict': content_data.get('final_verdict', ''),
                'selection_guide': content_data.get('selection_guide', [])
            }
            default_data.update(comparison_data)

        # 템플릿 렌더링
        rendered_html = template.render(**default_data)

        return {
            'success': True,
            'rendered_html': rendered_html,
            'template_type': template_type,
            'rendered_at': datetime.now().isoformat()
        }

    except FileNotFoundError:
        return {
            'success': False,
            'error': f'Template file not found: {template_type}.html'
        }
    except ImportError:
        return {
            'success': False,
            'error': 'Jinja2 is required for template rendering. Install with: pip install jinja2'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Template rendering error: {str(e)}'
        }

def get_available_templates():
    """사용 가능한 블로그 템플릿 목록"""
    templates = [
        {
            'id': 'professional_post',
            'name': '전문가 포스트',
            'description': '일반 블로그 글을 위한 전문적인 템플릿',
            'category': 'general',
            'features': ['SEO 최적화', '반응형 디자인', '구조화된 데이터']
        },
        {
            'id': 'product_review',
            'name': '제품 리뷰',
            'description': '제품 리뷰를 위한 전문 템플릿',
            'category': 'review',
            'features': ['별점 평가', '장단점 비교', '제품 사양', '구매 링크']
        },
        {
            'id': 'comparison_table',
            'name': '비교표',
            'description': '여러 제품/서비스 비교를 위한 템플릿',
            'category': 'comparison',
            'features': ['비교 표', '수치 평가', '추천 배지', '요약 카드']
        }
    ]

    return {
        'success': True,
        'templates': templates,
        'total_count': len(templates)
    }