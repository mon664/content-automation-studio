"""
AutoBlog 스타일 블로그 자동 발행 API
Content Automation Studio에서 OpenAI Assistant와 다중 플랫폼 발행 통합
"""

from flask import Blueprint, request, jsonify
import logging
import sys
import os
import json
from datetime import datetime, timedelta

# utils 디렉토리를 Python path에 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

try:
    from utils.openai_assistant import GeminiBlogAssistant, FallbackBlogGenerator
    from utils.blog_publisher import BlogPublisher, BlogScheduler
    from utils.vertex_ai import image_generator
    from utils.webdav import webdav_manager
except ImportError as e:
    print(f"Warning: Import error in autoblog.py: {e}")
    GeminiBlogAssistant = None
    FallbackBlogGenerator = None
    BlogPublisher = None
    BlogScheduler = None
    image_generator = None
    webdav_manager = None

# AutoBlog 블루프린트 생성
autoblog_bp = Blueprint('autoblog', __name__, url_prefix='/api/autoblog')

# 로거 설정
logger = logging.getLogger(__name__)

# 글로벌 인스턴스
blog_publisher = BlogPublisher() if BlogPublisher else None
blog_scheduler = BlogScheduler(blog_publisher) if blog_publisher else None

@autoblog_bp.route('/generate-blog', methods=['POST'])
def generate_blog():
    """AI 블로그 콘텐츠 생성"""
    try:
        data = request.get_json()

        keyword = data.get('keyword', '').strip()
        platform = data.get('platform', 'general')
        style = data.get('style', 'professional')
        openai_key = data.get('openai_key')
        assistant_id = data.get('assistant_id')
        generate_image = data.get('generate_image', True)

        if not keyword:
            return jsonify({
                'success': False,
                'error': '키워드를 입력해주세요.'
            }), 400

        # OpenAI Assistant로 블로그 생성
        if openai_key and OpenAIBlogAssistant:
            try:
                assistant = OpenAIBlogAssistant(openai_key, assistant_id)
                blog_data = assistant.generate_blog_post(keyword, platform, style)

                # Vertex AI로 이미지 생성 (옵션)
                if generate_image and image_generator and webdav_manager:
                    try:
                        image_prompt = f"Professional blog header image about {keyword}"
                        image_data = image_generator.generate_image(
                            image_prompt,
                            style="professional",
                            aspect_ratio="16:9"
                        )
                        if image_data:
                            filename = f"blog_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
                            image_url = webdav_manager.upload_image_from_data(image_data, filename)
                            blog_data['image_url'] = image_url
                    except Exception as img_e:
                        logger.warning(f"이미지 생성 실패: {str(img_e)}")

                return jsonify({
                    'success': True,
                    'blog_data': blog_data,
                    'message': f"'{keyword}' 주제의 블로그 콘텐츠가 생성되었습니다.',
                    'timestamp': datetime.now().isoformat()
                })

            except Exception as e:
                logger.error(f"OpenAI Assistant 블로그 생성 실패: {str(e)}")
                # Fallback 시도
                pass

        # Fallback 블로그 생성
        if FallbackBlogGenerator:
            fallback_generator = FallbackBlogGenerator()
            blog_data = fallback_generator.generate_blog_post(keyword, platform, style)

            return jsonify({
                'success': True,
                'blog_data': blog_data,
                'message': f"'{keyword}' 주제의 블로그 콘텐츠가 생성되었습니다 (Fallback 모드).",
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'error': '블로그 생성 서비스를 사용할 수 없습니다.'
            }), 503

    except Exception as e:
        logger.error(f"블로그 생성 실패: {str(e)}")
        return jsonify({
            'success': False,
            'error': '블로그 생성에 실패했습니다.'
        }), 500

@autoblog_bp.route('/publish', methods=['POST'])
def publish_blog():
    """블로그 발행"""
    try:
        data = request.get_json()

        platform = data.get('platform', 'general')
        blog_data = data.get('blog_data', {})
        config = data.get('config', {})

        if not blog_data or not blog_data.get('title'):
            return jsonify({
                'success': False,
                'error': '발행할 블로그 데이터가 필요합니다.'
            }), 400

        if not blog_publisher:
            return jsonify({
                'success': False,
                'error': '블로그 발행 서비스를 사용할 수 없습니다.'
            }), 503

        result = blog_publisher.publish(platform, blog_data, config)

        return jsonify(result)

    except Exception as e:
        logger.error(f"블로그 발행 실패: {str(e)}")
        return jsonify({
            'success': False,
            'error': '블로그 발행에 실패했습니다.'
        }), 500

@autoblog_bp.route('/schedule-publish', methods=['POST'])
def schedule_publish():
    """블로그 예약 발행"""
    try:
        data = request.get_json()

        platform = data.get('platform', 'general')
        blog_data = data.get('blog_data', {})
        config = data.get('config', {})
        schedule_hours = int(data.get('schedule_hours', 1))

        if not blog_data:
            return jsonify({
                'success': False,
                'error': '예약 발행할 블로그 데이터가 필요합니다.'
            }), 400

        if not blog_scheduler:
            return jsonify({
                'success': False,
                'error': '예약 발행 서비스를 사용할 수 없습니다.'
            }), 503

        # 예약 시간 계산
        schedule_time = datetime.now() + timedelta(hours=schedule_hours)

        result = blog_scheduler.schedule_post(platform, blog_data, config, schedule_time)

        return jsonify(result)

    except Exception as e:
        logger.error(f"예약 발행 실패: {str(e)}")
        return jsonify({
            'success': False,
            'error': '예약 발행에 실패했습니다.'
        }), 500

@autoblog_bp.route('/scheduled-posts', methods=['GET'])
def get_scheduled_posts():
    """예약된 포스트 목록 조회"""
    try:
        if not blog_scheduler:
            return jsonify({
                'success': False,
                'error': '예약 발행 서비스를 사용할 수 없습니다.'
            }), 503

        scheduled_posts = blog_scheduler.get_scheduled_posts()

        return jsonify({
            'success': True,
            'scheduled_posts': scheduled_posts,
            'count': len(scheduled_posts)
        })

    except Exception as e:
        logger.error(f"예약 포스트 목록 조회 실패: {str(e)}")
        return jsonify({
            'success': False,
            'error': '예약 포스트 목록 조회에 실패했습니다.'
        }), 500

@autoblog_bp.route('/cancel-schedule', methods=['POST'])
def cancel_schedule():
    """예약 발행 취소"""
    try:
        data = request.get_json()
        schedule_id = data.get('schedule_id')

        if not schedule_id:
            return jsonify({
                'success': False,
                'error': '예약 ID가 필요합니다.'
            }), 400

        if not blog_scheduler:
            return jsonify({
                'success': False,
                'error': '예약 발행 서비스를 사용할 수 없습니다.'
            }), 503

        result = blog_scheduler.cancel_scheduled_post(schedule_id)

        return jsonify(result)

    except Exception as e:
        logger.error(f"예약 취소 실패: {str(e)}")
        return jsonify({
            'success': False,
            'error': '예약 취소에 실패했습니다.'
        }), 500

@autoblog_bp.route('/product-guide', methods=['POST'])
def generate_product_guide():
    """상품 구매 가이드 생성"""
    try:
        data = request.get_json()
        product = data.get('product', '').strip()
        openai_key = data.get('openai_key')

        if not product:
            return jsonify({
                'success': False,
                'error': '상품명을 입력해주세요.'
            }), 400

        if not openai_key or not OpenAIBlogAssistant:
            return jsonify({
                'success': False,
                'error': 'OpenAI API 키가 필요합니다.'
            }), 400

        assistant = OpenAIBlogAssistant(openai_key)
        guide = assistant.generate_product_guide(product)

        return jsonify({
            'success': True,
            'product': product,
            'guide': guide,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"상품 가이드 생성 실패: {str(e)}")
        return jsonify({
            'success': False,
            'error': '상품 가이드 생성에 실패했습니다.'
        }), 500

@autoblog_bp.route('/post-description', methods=['POST'])
def generate_post_description():
    """포스팅 소개 구문 생성"""
    try:
        data = request.get_json()
        product = data.get('product', '').strip()
        openai_key = data.get('openai_key')

        if not product:
            return jsonify({
                'success': False,
                'error': '상품명을 입력해주세요.'
            }), 400

        if not openai_key or not OpenAIBlogAssistant:
            return jsonify({
                'success': False,
                'error': 'OpenAI API 키가 필요합니다.'
            }), 400

        assistant = OpenAIBlogAssistant(openai_key)
        description = assistant.generate_post_description(product)

        return jsonify({
            'success': True,
            'product': product,
            'description': description,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"소개 구문 생성 실패: {str(e)}")
        return jsonify({
            'success': False,
            'error': '소개 구문 생성에 실패했습니다.'
        }), 500

@autoblog_bp.route('/post-title', methods=['POST'])
def generate_post_title():
    """포스팅 제목 생성"""
    try:
        data = request.get_json()
        product = data.get('product', '').strip()
        item_count = int(data.get('item_count', 5))
        openai_key = data.get('openai_key')

        if not product:
            return jsonify({
                'success': False,
                'error': '상품명을 입력해주세요.'
            }), 400

        if not openai_key or not OpenAIBlogAssistant:
            return jsonify({
                'success': False,
                'error': 'OpenAI API 키가 필요합니다.'
            }), 400

        assistant = OpenAIBlogAssistant(openai_key)
        title = assistant.generate_post_title(product, item_count)

        return jsonify({
            'success': True,
            'product': product,
            'item_count': item_count,
            'title': title,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"제목 생성 실패: {str(e)}")
        return jsonify({
            'success': False,
            'error': '제목 생성에 실패했습니다.'
        }), 500

@autoblog_bp.route('/summarize-review', methods=['POST'])
def summarize_review():
    """리뷰 요약"""
    try:
        data = request.get_json()
        review_content = data.get('review_content', '').strip()
        openai_key = data.get('openai_key')

        if not review_content:
            return jsonify({
                'success': False,
                'error': '리뷰 내용을 입력해주세요.'
            }), 400

        if not openai_key or not OpenAIBlogAssistant:
            return jsonify({
                'success': False,
                'error': 'OpenAI API 키가 필요합니다.'
            }), 400

        assistant = OpenAIBlogAssistant(openai_key)
        summary = assistant.summarize_review(review_content)

        return jsonify({
            'success': True,
            'summary': summary,
            'original_length': len(review_content),
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"리뷰 요약 실패: {str(e)}")
        return jsonify({
            'success': False,
            'error': '리뷰 요약에 실패했습니다.'
        }), 500

@autoblog_bp.route('/batch-generate', methods=['POST'])
def batch_generate_blogs():
    """여러 키워드에 대한 블로그 일괄 생성"""
    try:
        data = request.get_json()
        keywords = data.get('keywords', [])
        platform = data.get('platform', 'general')
        style = data.get('style', 'professional')
        openai_key = data.get('openai_key')
        assistant_id = data.get('assistant_id')
        generate_image = data.get('generate_image', False)  # 배치에서는 기본 이미지 생성 비활성화

        if not keywords:
            return jsonify({
                'success': False,
                'error': '키워드 목록이 필요합니다.'
            }), 400

        results = []
        for keyword in keywords:
            try:
                keyword = keyword.strip()
                if not keyword:
                    continue

                # 개별 블로그 생성
                if openai_key and OpenAIBlogAssistant:
                    assistant = OpenAIBlogAssistant(openai_key, assistant_id)
                    blog_data = assistant.generate_blog_post(keyword, platform, style)

                    # 이미지 생성 (선택적)
                    if generate_image and image_generator and webdav_manager:
                        try:
                            image_prompt = f"Professional blog header about {keyword}"
                            image_data = image_generator.generate_image(image_prompt)
                            if image_data:
                                filename = f"batch_{keyword.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
                                image_url = webdav_manager.upload_image_from_data(image_data, filename)
                                blog_data['image_url'] = image_url
                        except:
                            pass  # 이미지 생성 실패 시 무시

                    results.append({
                        'keyword': keyword,
                        'success': True,
                        'blog_data': blog_data
                    })
                else:
                    # Fallback
                    if FallbackBlogGenerator:
                        fallback_generator = FallbackBlogGenerator()
                        blog_data = fallback_generator.generate_blog_post(keyword, platform, style)
                        results.append({
                            'keyword': keyword,
                            'success': True,
                            'blog_data': blog_data,
                            'fallback': True
                        })

            except Exception as e:
                logger.error(f"배치 블로그 생성 실패 ({keyword}): {str(e)}")
                results.append({
                    'keyword': keyword,
                    'success': False,
                    'error': str(e)
                })

        return jsonify({
            'success': True,
            'results': results,
            'summary': {
                'total': len(keywords),
                'successful': len([r for r in results if r['success']]),
                'failed': len([r for r in results if not r['success']]),
                'platform': platform,
                'style': style
            },
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"배치 블로그 생성 실패: {str(e)}")
        return jsonify({
            'success': False,
            'error': '일괄 블로그 생성에 실패했습니다.'
        }), 500

@autoblog_bp.route('/platforms', methods=['GET'])
def get_supported_platforms():
    """지원하는 발행 플랫폼 목록 조회"""
    try:
        if blog_publisher:
            platforms = blog_publisher.get_supported_platforms()
        else:
            platforms = ['general']  # Fallback

        return jsonify({
            'success': True,
            'platforms': platforms,
            'count': len(platforms)
        })

    except Exception as e:
        logger.error(f"플랫폼 목록 조회 실패: {str(e)}")
        return jsonify({
            'success': False,
            'error': '플랫폼 목록 조회에 실패했습니다.'
        }), 500