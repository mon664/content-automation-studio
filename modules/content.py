from flask import Blueprint, request, jsonify
import google.generativeai as genai
import json
import os
from datetime import datetime

content_bp = Blueprint('content', __name__)

# Gemini API 설정
genai.configure(api_key=os.getenv('GEMINI_API_KEY', 'AIzaSyBlxBK-1-vl-Uzy5Vys9tLPQynRhGk30UY'))
model = genai.GenerativeModel('gemini-pro')

@content_bp.route('/generate-blog', methods=['POST'])
def generate_blog():
    """AI 블로그 글 생성"""
    data = request.get_json()

    if not data or 'topic' not in data:
        return jsonify({'error': 'Topic is required'}), 400

    topic = data['topic']
    keywords = data.get('keywords', [])
    tone = data.get('tone', 'professional')  # professional, casual, formal
    length = data.get('length', 'medium')   # short, medium, long
    target_audience = data.get('target_audience', 'general')

    try:
        # 블로그 글 생성
        blog_content = generate_blog_content(topic, keywords, tone, length, target_audience)

        # 제목 추천
        title = generate_title(topic, tone)

        # 이미지 생성 프롬프트
        image_prompts = generate_image_prompts(topic, blog_content)

        # SEO 메타데이터
        seo_meta = generate_seo_metadata(topic, keywords, blog_content)

        return jsonify({
            'success': True,
            'title': title,
            'content': blog_content,
            'image_prompts': image_prompts,
            'seo_meta': seo_meta,
            'metadata': {
                'topic': topic,
                'keywords': keywords,
                'tone': tone,
                'length': length,
                'target_audience': target_audience,
                'word_count': len(blog_content.split()),
                'generated_at': datetime.now().isoformat()
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@content_bp.route('/generate-social', methods=['POST'])
def generate_social():
    """SNS 콘텐츠 생성"""
    data = request.get_json()

    if not data or 'content' not in data:
        return jsonify({'error': 'Content is required'}), 400

    content = data['content']
    platforms = data.get('platforms', ['instagram', 'facebook', 'twitter'])
    hashtags = data.get('hashtags', [])

    try:
        social_posts = {}

        for platform in platforms:
            social_posts[platform] = generate_social_post(content, platform, hashtags)

        return jsonify({
            'success': True,
            'original_content': content,
            'social_posts': social_posts,
            'platforms': platforms,
            'generated_at': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@content_bp.route('/generate-email', methods=['POST'])
def generate_email():
    """이메일 뉴스레터 생성"""
    data = request.get_json()

    if not data or 'topic' not in data:
        return jsonify({'error': 'Topic is required'}), 400

    topic = data['topic']
    recipient_type = data.get('recipient_type', 'subscribers')  # subscribers, customers, leads
    email_type = data.get('email_type', 'newsletter')  # newsletter, promotional, update

    try:
        subject = generate_email_subject(topic, email_type)
        email_content = generate_email_content(topic, recipient_type, email_type)

        return jsonify({
            'success': True,
            'subject': subject,
            'content': email_content,
            'metadata': {
                'topic': topic,
                'recipient_type': recipient_type,
                'email_type': email_type,
                'generated_at': datetime.now().isoformat()
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@content_bp.route('/optimize', methods=['POST'])
def optimize_content():
    """콘텐츠 최적화"""
    data = request.get_json()

    if not data or 'content' not in data:
        return jsonify({'error': 'Content is required'}), 400

    content = data['content']
    optimization_goal = data.get('goal', 'seo')  # seo, readability, engagement

    try:
        optimized_content = optimize_content_for_goal(content, optimization_goal)
        improvements = identify_improvements(content, optimized_content)

        return jsonify({
            'success': True,
            'original_content': content,
            'optimized_content': optimized_content,
            'optimization_goal': optimization_goal,
            'improvements': improvements,
            'generated_at': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_blog_content(topic, keywords, tone, length, target_audience):
    """블로그 글 생성"""

    # 길이 설정
    length_descriptions = {
        'short': '500-800자',
        'medium': '1000-1500자',
        'long': '2000-3000자'
    }

    # 톤 설정
    tone_descriptions = {
        'professional': '전문적이고 신뢰성 있는 톤',
        'casual': '친근하고 부드러운 톤',
        'formal': '격식적이고 공식적인 톤'
    }

    # 대상 설정
    audience_descriptions = {
        'general': '일반 대중',
        'beginners': '초보자',
        'experts': '전문가',
        'students': '학생'
    }

    keyword_str = ', '.join(keywords) if keywords else '해당 주제의 핵심 키워드'

    prompt = f"""
    다음 주제에 대한 고품질 블로그 글을 작성해주세요:

    주제: {topic}
    키워드: {keyword_str}
    길이: {length_descriptions.get(length, '1000-1500자')}
    톤: {tone_descriptions.get(tone, '전문적이고 신뢰성 있는 톤')}
    대상: {audience_descriptions.get(target_audience, '일반 대중')}

    요구사항:
    1. SEO에 최적화된 매력적인 제목 (3개 추천)
    2. 서론, 본론, 결론의 명확한 구조
    3. 독자의 참여를 유도하는 질문 포함
    4. 키워드를 자연스럽게 통합
    5. 실용적인 정보와 구체적인 예시
    6. 행동 촉구(CTA) 포함
    7. 전문성과 신뢰성 확보

    형식:
    [본문 내용]

    작성 시 유의사항:
    - 표절되지 않은 독창적인 콘텐츠
    - 최신 정보와 동향 반영
    - 독자의 문제 해결에 도움이 되는 내용
    - 가독성 좋은 문단 구성
    """

    response = model.generate_content(prompt)
    return response.text

def generate_title(topic, tone):
    """제목 생성"""
    tone_instructions = {
        'professional': '전문적이고 신뢰성 있는',
        'casual': '친근하고 흥미로운',
        'formal': '격식적이고 공식적인'
    }

    prompt = f"""
    '{topic}'에 대한 {tone_instructions.get(tone, '전문적인')} 블로그 제목 3개를 추천해주세요.

    요구사항:
    1. SEO에 최적화될 것 (키워드 포함)
    2. 독자의 관심을 끌 수 있을 것
    3. 내용을 정확히 반영할 것
    4. 60자 이내로 간결할 것

    형식:
    1. [제목1]
    2. [제목2]
    3. [제목3]
    """

    response = model.generate_content(prompt)
    return response.text

def generate_image_prompts(topic, content):
    """이미지 생성 프롬프트"""
    prompt = f"""
    다음 블로그 내용에 어울리는 전문적인 이미지 생성 프롬프트 3개를 작성해주세요:

    주제: {topic}
    내용 요약: {content[:300]}...

    요구사항:
    1. 상세하고 시각적인 묘사
    2. 전문적인 사진 스타일 지정
    3. 적절한 조명과 구도
    4. 브랜드에 어울리는 톤
    5. 50단어 이내로 간결하게
    6. DALL-E나 Midjourney용

    형식:
    프롬프트 1: [상세한 이미지 설명]
    프롬프트 2: [상세한 이미지 설명]
    프롬프트 3: [상세한 이미지 설명]
    """

    response = model.generate_content(prompt)
    return response.text

def generate_seo_metadata(topic, keywords, content):
    """SEO 메타데이터 생성"""
    prompt = f"""
    다음 콘텐츠에 대한 SEO 최적화 메타데이터를 생성해주세요:

    주제: {topic}
    키워드: {', '.join(keywords) if keywords else '해당 주제 키워드'}
    내용 요약: {content[:200]}...

    생성할 항목:
    1. Meta Description (160자 이내)
    2. Meta Keywords (10개 이내)
    3. Focus Keyword
    4. Schema.org 마크업 제안
    5. Open Graph 태그 제안

    형식: JSON 형태로 정리
    """

    response = model.generate_content(prompt)
    return response.text

def generate_social_post(content, platform, hashtags):
    """플랫폼별 SNS 포스트 생성"""

    platform_configs = {
        'instagram': {
            'limit': 2200,
            'style': '시각적이고 감성적인',
            'hashtags': True
        },
        'facebook': {
            'limit': 63206,
            'style': '대화형이고 정보성인',
            'hashtags': False
        },
        'twitter': {
            'limit': 280,
            'style': '간결하고 빠른',
            'hashtags': True
        },
        'linkedin': {
            'limit': 3000,
            'style': '전문적이고 비즈니스 지향적인',
            'hashtags': False
        }
    }

    config = platform_configs.get(platform, platform_configs['facebook'])
    hashtag_str = ' '.join([f'#{tag}' for tag in hashtags]) if hashtags and config['hashtags'] else ''

    prompt = f"""
    다음 내용을 {platform} 플랫폼에 맞게 변환해주세요:

    원본 내용: {content[:500]}...
    스타일: {config['style']}
    글자 수 제한: {config['limit']}자
    해시태그 사용: {'예' if config['hashtags'] else '아니오'}
    기존 해시태그: {hashtag_str}

    요구사항:
    1. 플랫폼 특성에 맞는 톤과 스타일
    2. 글자 수 제한 준수
    3. 참여를 유도하는 질문이나 문구
    4. 적절한 이모지 사용
    """

    response = model.generate_content(prompt)
    return response.text

def generate_email_subject(topic, email_type):
    """이메일 제목 생성"""
    type_modifiers = {
        'newsletter': '정보성 뉴스레터',
        'promotional': '프로모션/마케팅',
        'update': '업데이트/소식'
    }

    prompt = f"""
    '{topic}'에 대한 {type_modifiers.get(email_type, '이메일')} 제목 5개를 작성해주세요.

    요구사항:
    1. 개인화된 느낌을 줄 것
    2. 호기심을 자극할 것
    3. 이메일 내용을 예측할 수 있을 것
    4. 스팸 필터를 피할 것
    5. 50자 이내로 간결할 것

    형식:
    1. [제목1]
    2. [제목2]
    3. [제목3]
    4. [제목4]
    5. [제목5]
    """

    response = model.generate_content(prompt)
    return response.text

def generate_email_content(topic, recipient_type, email_type):
    """이메일 내용 생성"""
    recipient_descriptions = {
        'subscribers': '뉴스레터 구독자들',
        'customers': '기존 고객들',
        'leads': '잠재 고객들'
    }

    prompt = f"""
    '{topic}'에 대한 이메일 내용을 작성해주세요.

    대상: {recipient_descriptions.get(recipient_type, '일반 수신자')}
    종류: {email_type}

    구조:
    1. 개인화된 인사말
    2. 매력적인 도입부
    3. 핵심 내용 (2-3개 문단)
    4. 행동 촉구(CTA)
    5. 전문적인 마무리말

    요구사항:
    - 대상에 맞는 톤과 언어
    - 명확한 행동 촉구
    - 모바일 최적화
    - 개인화된 느낌
    """

    response = model.generate_content(prompt)
    return response.text

def optimize_content_for_goal(content, goal):
    """콘텐츠 최적화"""
    goal_descriptions = {
        'seo': '검색 엔진 최적화(SEO)',
        'readability': '가독성 향상',
        'engagement': '참여도 증대'
    }

    prompt = f"""
    다음 콘텐츠를 {goal_descriptions.get(goal, '일반적인')} 관점에서 최적화해주세요:

    원본 내용: {content}

    최적화 목표: {goal_descriptions.get(goal, '콘텐츠 개선')}

    요구사항:
    - 원본 의미는 유지하면서 최적화
    - 구체적인 개선 사항 반영
    - 전체적인 흐름 자연스럽게
    - 목표에 맞는 전문 용어 사용
    """

    response = model.generate_content(prompt)
    return response.text

def identify_improvements(original, optimized):
    """개선 사항 식별"""
    prompt = f"""
    다음 두 콘텐츠의 차이점을 분석하고 개선 사항을 알려주세요:

    원본: {original[:500]}...
    최적화: {optimized[:500]}...

    개선 사항을 구체적으로 설명해주세요.
    """

    response = model.generate_content(prompt)
    return response.text