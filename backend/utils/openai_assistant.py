"""
Gemini API 기반 블로그 자동 생성 시스템
AutoBlog 스타일의 전문 블로그 콘텐츠 생성
"""

import re
import time
import requests
from typing import Dict, List, Optional, Tuple
import logging
import os
import google.generativeai as genai

logger = logging.getLogger(__name__)

# Gemini API 설정
try:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv('GEMINI_API_KEY', 'AIzaSyBlxBK-1-vl-Uzy5Vys9tLPQynRhGk30UY'))
    model = genai.GenerativeModel('gemini-pro')
    GEMINI_AVAILABLE = True
    logger.info("Gemini API initialized successfully")
except ImportError as e:
    logger.warning(f"google.generativeai library not available: {e}")
    GEMINI_AVAILABLE = False
    model = None
except Exception as e:
    logger.error(f"Gemini API initialization failed: {e}")
    GEMINI_AVAILABLE = False
    model = None

class GeminiBlogAssistant:
    """Gemini API를 활용한 전문 블로그 생성 시스템"""

    def __init__(self):
        """Gemini Assistant 초기화"""
        if not GEMINI_AVAILABLE:
            logger.warning("Gemini not available, but allowing fallback mode")
            self.model = None
        else:
            self.model = model

    def generate_blog_post(self, keyword: str, platform: str = "general",
                          style: str = "professional") -> Dict[str, str]:
        """
        키워드 기반 블로그 포스트 생성

        Args:
            keyword (str): 블로그 주제 키워드
            platform (str): 플랫폼 (tistory, blogger, general)
            style (str): 스타일 (professional, casual, shopping)

        Returns:
            Dict: 생성된 블로그 데이터
        """
        try:
            if not GEMINI_AVAILABLE:
                logger.warning("Gemini not available, using fallback mode")
                # Fallback 블로그 생성기 사용
                fallback_generator = FallbackBlogGenerator()
                return fallback_generator.generate_blog_post(keyword, platform, style)

            response = self._get_gemini_response(keyword, platform, style)
            title, tags, slug, content = self._parse_response(response)

            return {
                "title": title,
                "tags": tags,
                "slug": slug,
                "content": content,
                "image_url": None,  # Vertex AI 별도 처리
                "platform": platform,
                "style": style,
                "keyword": keyword
            }

        except Exception as e:
            logger.error(f"블로그 생성 실패: {str(e)}")
            # Fallback 시도
            logger.warning("Trying fallback blog generation due to error")
            fallback_generator = FallbackBlogGenerator()
            return fallback_generator.generate_blog_post(keyword, platform, style)

    def _get_gemini_response(self, keyword: str, platform: str, style: str) -> str:
        """Gemini API로 콘텐츠 생성"""
        system_prompt = self._create_system_prompt(platform, style)
        user_prompt = f"주제: {keyword}\n\n위 주제로 전문적인 블로그 포스트를 작성해주세요."

        full_prompt = f"{system_prompt}\n\n{user_prompt}"

        response = self.model.generate_content(full_prompt)
        return response.text

    def _create_system_prompt(self, platform: str, style: str) -> str:
        """플랫폼과 스타일에 맞는 시스템 프롬프트 생성"""

        base_prompt = """
당신은 전문 블로그 작가입니다. 다음 형식에 맞춰 블로그 포스트를 작성해주세요:

제목: [눈길을 끄는 매력적인 제목]
태그: [콤마로 구분된 관련 태그들, 5-8개]
slug: [URL-friendly slug, 영문 소문자와 하이픈만 사용]
```html
[완성된 HTML 형식의 블로그 본문]
```

요구사항:
- 제목은 50자 이내로 검색 친화적으로 작성
- 태그는 실제 검색되는 키워드로 구성
- 본문은 1500-2000자 분량으로 상세하게 작성
- HTML 태그를 적절히 사용하여 가독성 확보
- 소개, 본문, 결론의 명확한 구조 유지
        """

        # 플랫폼별 특화
        if platform == "tistory":
            base_prompt += "\n- 티스토리에 최적화된 형식"
        elif platform == "blogger":
            base_prompt += "\n- Google Blogger에 최적화된 형식"
        elif platform == "shopping":
            base_prompt += "\n- 쇼핑몰 상품 소개에 특화"

        # 스타일별 특화
        if style == "professional":
            base_prompt += "\n- 전문적이고 신뢰도 있는 톤"
        elif style == "casual":
            base_prompt += "\n- 친근하고 대화하는 듯한 톤"
        elif style == "shopping":
            base_prompt += "\n- 구매를 유도하는 설득적인 톤"

        return base_prompt

    def _parse_response(self, response: str) -> Tuple[str, str, str, str]:
        """응답을 구조화된 데이터로 파싱"""
        try:
            # 제목 추출
            title_match = re.search(r'제목:\s*(.+?)(?=\n|\n태그:|$)', response, re.DOTALL)
            title = title_match.group(1).strip() if title_match else "제목 없음"

            # 태그 추출
            tags_match = re.search(r'태그:\s*(.+?)(?=\n|\nslug:|$)', response, re.DOTALL)
            tags = tags_match.group(1).strip() if tags_match else "태그 없음"

            # slug 추출
            slug_match = re.search(r'slug:\s*(.+?)(?=\n|\n```html|```|$)', response, re.DOTALL)
            slug = slug_match.group(1).strip() if slug_match else ""

            # HTML 콘텐츠 추출
            content_match = re.search(r'```html\s*\n?(.*?)\n?```', response, re.DOTALL)
            content = content_match.group(1).strip() if content_match else response

            return title, tags, slug, content

        except Exception as e:
            logger.error(f"응답 파싱 실패: {str(e)}")
            return "파싱 실패", "태그 없음", "", response

    def generate_product_guide(self, product: str) -> str:
        """상품 구매 가이드 생성"""
        try:
            prompt = f"""
당신은 전문적인 상품 리뷰어입니다.

다음 상품에 대한 전문적인 구매 가이드를 작성해주세요:
상품: {product}

요구사항:
- 어떤 기준으로 골라야 좋은지 설명
- 이모지를 적절히 활용
- 200자 내외의 리스트 형태
- HTML <ul><li> 형식으로 작성
- 제품 전문가의 관점에서 작성
- 코드블록 없이 바로 HTML 출력
"""

            response = self.model.generate_content(prompt)
            result = response.text
            # 코드블록 제거
            result = re.sub(r'```html|```', '', result).strip()

            return result

        except Exception as e:
            logger.error(f"상품 가이드 생성 실패: {str(e)}")
            return ""

    def generate_post_description(self, product: str) -> str:
        """블로그 소개 구문 생성"""
        try:
            prompt = f"""
당신은 전문 블로그 작가입니다.

다음 상품 키워드로 자연스러운 블로그 소개 멘트를 작성해주세요:
상품: {product}

요구사항:
- 쇼핑 전문 블로거 스타일
- 친근하면서도 분위기 있는 톤
- 이모지 적절히 활용
- 500자 내외의 자연스러운 문장
- 상품 기능 설명보다는 소개에 집중
- 오늘 소개할 상품, 관심도 유도
- HTML 코드블록 형태로 출력
"""

            response = self.model.generate_content(prompt)
            result = response.text
            result = re.sub(r'```html|```', '', result).strip()

            return result

        except Exception as e:
            logger.error(f"소개 구문 생성 실패: {str(e)}")
            return ""

    def generate_post_title(self, product: str, item_count: int = 5) -> str:
        """블로그 제목 생성"""
        try:
            prompt = f"""
당신은 전문 블로그 제목 작성가입니다.

다음 정보로 블로그 제목을 작성해주세요:
상품: {product}
상품수: TOP {item_count}

요구사항:
- 매번 새로운 스타일로 작성
- 현실적으로 사람들이 검색할 만한 문구
- 길지 않고 눈에 띄는 문구
- 예시: 트렌디한 상품명 탑5
- HTML 태그 없이 순수 제목만
- 설명 없이 제목만 출력
"""

            response = self.model.generate_content(prompt)
            result = response.text
            result = re.sub(r'```html|```', '', result).strip()

            return result

        except Exception as e:
            logger.error(f"제목 생성 실패: {str(e)}")
            return ""

    def summarize_review(self, review_content: str) -> str:
        """리뷰 요약"""
        try:
            prompt = f"""
당신은 전문적인 리뷰 분석가입니다.

다음 리뷰 내용에서 상품에 대한 중요한 정보만 추출하여 요약해주세요:
리뷰: {review_content}

요구사항:
- 상품에 대한 분석만 포함
- 개인적 정보(배송날짜, 구매의사 등) 제외
- 이모지 섞어서 200자 내로 작성
- HTML <ul><li> 리스트 형태
- 순수한 가공된 리스트만 출력
- 코드블록 없이 바로 HTML 출력
"""

            response = self.model.generate_content(prompt)
            result = response.text
            result = re.sub(r'```html|```', '', result).strip()

            return result

        except Exception as e:
            logger.error(f"리뷰 요약 실패: {str(e)}")
            return ""


# Fallback 클래스 (API 없을 때 사용)
class FallbackBlogGenerator:
    """API 없이 사용할 수 있는Fallback 블로그 생성기"""

    def generate_blog_post(self, keyword: str, platform: str = "general",
                          style: str = "professional") -> Dict[str, str]:
        """더미 블로그 데이터 생성"""

        title_templates = [
            f"{keyword}에 대한 모든 것",
            f"{keyword} 완벽 가이드",
            f"전문가가 알려주는 {keyword}",
            f"{keyword} 추천 TOP 5",
            f"{keyword} 궁금증 해결"
        ]

        title = title_templates[hash(keyword) % len(title_templates)]

        return {
            "title": title,
            "tags": f"{keyword},가이드,정보,추천,후기",
            "slug": keyword.lower().replace(' ', '-'),
            "content": f"""
<h2>{keyword} 소개</h2>
<p>오늘은 {keyword}에 대해 자세히 알아보겠습니다. 최근 많은 분들이 {keyword}에 관심을 보이고 있습니다.</p>

<h2>{keyword}의 특징</h2>
<p>{keyword}는 다음과 같은 특징을 가지고 있습니다:</p>
<ul>
    <li>전문성과 신뢰성</li>
    <li>사용자 친화적인 인터페이스</li>
    <li>합리적인 가격 정책</li>
    <li>뛰어난 품질</li>
</ul>

<h2>{keyword} 선택 방법</h2>
<p>좋은 {keyword}를 선택하기 위해서는 다음 사항들을 고려해야 합니다:</p>
<ul>
    <li>자신의 필요와 목표 명확히 하기</li>
    <li>비교 분석을 통한 최적 선택</li>
    <li>전문가나 사용자 후기 참고</li>
    <li>A/S와 지원 정책 확인</li>
</ul>

<h2>결론</h2>
<p>{keyword}는 올바르게 선택하고 사용한다면 분명 만족스러운 결과를 얻을 수 있을 것입니다. 오늘 소개해 드린 내용이 {keyword}를 선택하시는 데 도움이 되셨기를 바랍니다.</p>

<p>궁금한 점이 있으시면 언제든지 댓글로 남겨주세요. 감사합니다!</p>
            """,
            "image_url": None,
            "platform": platform,
            "style": style,
            "keyword": keyword,
            "fallback": True
        }