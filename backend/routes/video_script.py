"""
AutoVid 스타일 비디오 스크립트 생성 API
Content Automation Studio에서 자동 비디오 콘텐츠 제작용
"""

from flask import Blueprint, request, jsonify
import logging
import sys
import os
import json
from datetime import datetime

# utils 디렉토리를 Python path에 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

try:
    from utils.gemini_client import gemini_client
    from utils.autovid_prompts import generate_autovid_prompt, generate_blog_to_video_prompt, generate_youtube_seo_prompt
    from utils.vertex_ai import image_generator
    from utils.webdav import webdav_manager
except ImportError as e:
    print(f"Warning: Import error in video_script.py: {e}")
    gemini_client = None
    generate_autovid_prompt = None
    image_generator = None
    webdav_manager = None

# Video Script 블루프린트 생성
video_script_bp = Blueprint('video_script', __name__, url_prefix='/api/video-script')

# 로거 설정
logger = logging.getLogger(__name__)

@video_script_bp.route('/generate', methods=['POST'])
def generate_video_script():
    """AutoVid 스타일 비디오 스크립트 생성"""
    try:
        data = request.get_json()

        # 필수 파라미터 확인
        subject = data.get('subject', '').strip()
        request_number = int(data.get('requestNumber', 5))
        request_language = data.get('requestLanguage', 'ko-KR')
        include_opening = data.get('includeOpeningSegment', True)
        include_closing = data.get('includeClosingSegment', True)
        include_image_prompt = data.get('includeImageGenPrompt', True)
        auto_generate_images = data.get('autoGenerateImages', True)

        if not subject:
            return jsonify({
                'success': False,
                'error': '주제를 입력해주세요.'
            }), 400

        if request_number < 1 or request_number > 20:
            return jsonify({
                'success': False,
                'error': '요청 개수는 1에서 20 사이여야 합니다.'
            }), 400

        # Gemini API로 스크립트 생성
        if gemini_client and generate_autovid_prompt:
            prompt = generate_autovid_prompt(
                subject=subject,
                request_number=request_number,
                request_language=request_language,
                include_opening=include_opening,
                include_closing=include_closing,
                include_image_prompt=include_image_prompt
            )

            response = gemini_client.generate_content(prompt)
            script_data = json.loads(response.text)

            # 이미지 자동 생성
            if auto_generate_images and image_generator and include_image_prompt:
                script_data = generate_images_for_script(script_data)

            return jsonify({
                'success': True,
                'script': script_data,
                'timestamp': datetime.now().isoformat(),
                'metadata': {
                    'subject': subject,
                    'requestNumber': request_number,
                    'language': request_language,
                    'estimatedDuration': estimate_video_duration(script_data)
                }
            })
        else:
            # Fallback: 더미 데이터 생성
            script_data = generate_fallback_script(subject, request_number)
            return jsonify({
                'success': True,
                'script': script_data,
                'timestamp': datetime.now().isoformat(),
                'metadata': {
                    'subject': subject,
                    'requestNumber': request_number,
                    'language': request_language,
                    'estimatedDuration': f"{request_number * 45}초",
                    'fallback': True
                }
            })

    except Exception as e:
        logger.error(f"Video script generation failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': '스크립트 생성에 실패했습니다.'
        }), 500

@video_script_bp.route('/blog-to-video', methods=['POST'])
def convert_blog_to_video():
    """블로그 콘텐츠를 비디오 스크립트로 변환"""
    try:
        data = request.get_json()
        blog_content = data.get('blogContent', '').strip()
        target_length = data.get('targetVideoLength', '5분')

        if not blog_content:
            return jsonify({
                'success': False,
                'error': '블로그 콘텐츠를 입력해주세요.'
            }), 400

        # Gemini API로 변환
        if gemini_client and generate_blog_to_video_prompt:
            prompt = generate_blog_to_video_prompt(blog_content, target_length)
            response = gemini_client.generate_content(prompt)
            script_data = json.loads(response.text)

            return jsonify({
                'success': True,
                'script': script_data,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'error': '블로그-비디오 변환 기능을 사용할 수 없습니다.'
            }), 503

    except Exception as e:
        logger.error(f"Blog to video conversion failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': '블로그 콘텐츠 변환에 실패했습니다.'
        }), 500

@video_script_bp.route('/generate-seo', methods=['POST'])
def generate_youtube_seo():
    """YouTube SEO 최적화 데이터 생성"""
    try:
        data = request.get_json()
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()

        if not title:
            return jsonify({
                'success': False,
                'error': '제목을 입력해주세요.'
            }), 400

        # Gemini API로 SEO 데이터 생성
        if gemini_client and generate_youtube_seo_prompt:
            prompt = generate_youtube_seo_prompt(title, description)
            response = gemini_client.generate_content(prompt)
            seo_data = json.loads(response.text)

            return jsonify({
                'success': True,
                'seo': seo_data,
                'timestamp': datetime.now().isoformat()
            })
        else:
            # Fallback: 기본 SEO 데이터
            seo_data = generate_fallback_seo(title)
            return jsonify({
                'success': True,
                'seo': seo_data,
                'timestamp': datetime.now().isoformat(),
                'fallback': True
            })

    except Exception as e:
        logger.error(f"SEO generation failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'SEO 데이터 생성에 실패했습니다.'
        }), 500

@video_script_bp.route('/batch-generate', methods=['POST'])
def batch_generate_scripts():
    """여러 주제에 대한 비디오 스크립트 일괄 생성"""
    try:
        data = request.get_json()
        topics = data.get('topics', [])
        config = data.get('config', {})

        if not topics:
            return jsonify({
                'success': False,
                'error': '주제 목록을 입력해주세요.'
            }), 400

        results = []
        for topic in topics:
            try:
                # 개별 스크립트 생성
                script_request = {
                    'subject': topic,
                    'requestNumber': config.get('requestNumber', 5),
                    'requestLanguage': config.get('requestLanguage', 'ko-KR'),
                    'includeOpeningSegment': config.get('includeOpeningSegment', True),
                    'includeClosingSegment': config.get('includeClosingSegment', True),
                    'includeImageGenPrompt': config.get('includeImageGenPrompt', True),
                    'autoGenerateImages': config.get('autoGenerateImages', False)  # 배치에서는 이미지 생성 기본 비활성화
                }

                # 스크립트 생성 API 호출 (내부)
                if gemini_client and generate_autovid_prompt:
                    prompt = generate_autovid_prompt(**script_request)
                    response = gemini_client.generate_content(prompt)
                    script_data = json.loads(response.text)

                    results.append({
                        'topic': topic,
                        'success': True,
                        'script': script_data
                    })
                else:
                    # Fallback
                    fallback_script = generate_fallback_script(topic, script_request['requestNumber'])
                    results.append({
                        'topic': topic,
                        'success': True,
                        'script': fallback_script,
                        'fallback': True
                    })

            except Exception as e:
                logger.error(f"Batch script generation failed for topic '{topic}': {str(e)}")
                results.append({
                    'topic': topic,
                    'success': False,
                    'error': str(e)
                })

        return jsonify({
            'success': True,
            'results': results,
            'summary': {
                'total': len(topics),
                'successful': len([r for r in results if r['success']]),
                'failed': len([r for r in results if not r['success']])
            },
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Batch script generation failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': '일괄 스크립트 생성에 실패했습니다.'
        }), 500

# Helper functions
def generate_images_for_script(script_data):
    """스크립트의 이미지 프롬프트로 이미지 생성"""
    try:
        if not image_generator or not webdav_manager:
            return script_data

        # 오프닝 세그먼트 이미지 생성
        if 'openingSegment' in script_data and 'imageGenPrompt' in script_data['openingSegment']:
            prompt = script_data['openingSegment']['imageGenPrompt']
            image_data = image_generator.generate_image(prompt, style="cinematic")
            if image_data:
                filename = f"opening_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
                image_url = webdav_manager.upload_image_from_data(image_data, filename)
                script_data['openingSegment']['imageUrl'] = image_url

        # 메인 세그먼트 이미지 생성
        for i, snippet in enumerate(script_data.get('snippets', [])):
            if 'imageGenPrompt' in snippet:
                prompt = snippet['imageGenPrompt']
                image_data = image_generator.generate_image(prompt, style="realistic")
                if image_data:
                    filename = f"segment_{snippet['rank']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
                    image_url = webdav_manager.upload_image_from_data(image_data, filename)
                    snippet['imageUrl'] = image_url

        # 클로징 세그먼트 이미지 생성
        if 'closingSegment' in script_data and 'imageGenPrompt' in script_data['closingSegment']:
            prompt = script_data['closingSegment']['imageGenPrompt']
            image_data = image_generator.generate_image(prompt, style="inspirational")
            if image_data:
                filename = f"closing_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
                image_url = webdav_manager.upload_image_from_data(image_data, filename)
                script_data['closingSegment']['imageUrl'] = image_url

        return script_data

    except Exception as e:
        logger.error(f"Image generation for script failed: {str(e)}")
        return script_data

def estimate_video_duration(script_data):
    """스크립트 예상 재생 시간 계산"""
    try:
        total_sentences = 0

        # 오프닝 세그먼트
        if 'openingSegment' in script_data:
            total_sentences += len(script_data['openingSegment'].get('script', []))

        # 메인 세그먼트
        for snippet in script_data.get('snippets', []):
            total_sentences += len(snippet.get('script', []))

        # 클로징 세그먼트
        if 'closingSegment' in script_data:
            total_sentences += len(script_data['closingSegment'].get('script', []))

        # 평균 문장당 4초로 계산
        estimated_seconds = total_sentences * 4
        minutes = estimated_seconds // 60
        seconds = estimated_seconds % 60

        return f"{minutes}분 {seconds}초"

    except:
        return "예상 불가"

def generate_fallback_script(subject, request_number):
    """Fallback 스크립트 데이터 생성"""
    return {
        "title": f"{subject} TOP {request_number}",
        "openingSegment": {
            "videoSearchKeyword": [subject, "소개"],
            "script": [
                f"여러분, {subject}에 대해 얼마나 알고 계신가요?",
                f"오늘은 {subject}에 대한 흥미로운 정보들을 공유해 드립니다."
            ],
            "imageGenPrompt": f"professional {subject} introduction, cinematic lighting"
        },
        "snippets": [
            {
                "videoSearchKeyword": [subject, f"{i+1}위"],
                "segmentTitle": f"{i+1}위: {subject} 관련 정보",
                "rank": i + 1,
                "script": [
                    f"{i+1}번째로 흥미로운 사실은 다음과 같습니다.",
                    f"{subject}에 대한 놀라운 정보입니다.",
                    f"계속해서 주목 깊게 살펴보시기 바랍니다."
                ],
                "imageGenPrompt": f"{subject} {i+1}, professional photography"
            } for i in range(request_number)
        ],
        "closingSegment": {
            "videoSearchKeyword": [subject, "결론"],
            "script": [
                f"오늘 {subject}에 대해 알아보았습니다.",
                "구독과 좋아요 잊지 마세요!",
                "다음 영상에서 만나겠습니다."
            ],
            "imageGenPrompt": f"{subject} conclusion, inspirational ending"
        }
    }

def generate_fallback_seo(title):
    """Fallback SEO 데이터 생성"""
    return {
        "tags": [title, "유튜브", "정보", "교육", "콘텐츠"],
        "playlistIdeas": [f"{title} 관련 플레이리스트", "유익한 정보 모음"],
        "endScreenSuggestions": ["구독하기", "관련 영상"],
        "cardPlacements": [
            {"time": "0:30", "type": "link", "title": "관련 정보"},
            {"time": "2:00", "type": "poll", "question": "이것에 대해 어떻게 생각하세요?"}
        ],
        "thumbnailIdeas": [f"{title} 썸네일", "눈길을 끄는 이미지", "클릭 유도 디자인"]
    }