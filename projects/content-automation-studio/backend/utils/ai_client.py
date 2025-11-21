import google.generativeai as genai
import json
import requests
from google.cloud import aiplatform
from config import Config

class AIClient:
    def __init__(self):
        # Gemini API 설정
        genai.configure(api_key=Config.GEMINI_API_KEY)
        self.gemini_model = genai.GenerativeModel('gemini-pro')

        # Vertex AI 설정
        self.project_id = Config.GOOGLE_PROJECT_ID
        self.location = Config.GOOGLE_LOCATION
        self.client_options = {"api_endpoint": f"{self.location}-aiplatform.googleapis.com"}

    def test_connection(self):
        """Google AI 연결 테스트"""
        try:
            # Gemini API 테스트
            response = self.gemini_model.generate_content("Hello")
            return response.text is not None
        except Exception as e:
            print(f"Google AI 연결 실패: {e}")
            return False

    def generate_text(self, prompt, max_length=1000):
        """텍스트 생성 (Gemini)"""
        try:
            response = self.gemini_model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=max_length,
                    temperature=0.7,
                )
            )
            return {
                'success': True,
                'text': response.text,
                'model': 'gemini-pro'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def generate_blog_post(self, topic, keywords=None):
        """블로그 글 생성"""
        base_prompt = f"""
        다음 주제에 대한 전문적이고 흥미로운 블로그 글을 작성해주세요:

        주제: {topic}
        """

        if keywords:
            base_prompt += f"\n키워드: {', '.join(keywords)}"

        base_prompt += """

        요구사항:
        1. SEO에 최적화된 제목
        2. 서론, 본론, 결론 구조
        3. 독자의 참여를 유도하는 질문 포함
        4. 관련 키워드 자연스럽게 포함
        5. 1000-1500자 분량

        형식:
        제목: [매력적인 제목]

        내용:
        [본문 내용]
        """

        return self.generate_text(base_prompt, max_length=2000)

    def generate_image_prompt(self, content):
        """이미지 생성 프롬프트 생성"""
        prompt = f"""
        다음 블로그 내용에 어울리는 전문적인 이미지를 생성하기 위한 프롬프트를 영어로 작성해주세요:

        내용: {content[:500]}...

        요구사항:
        1. 구체적이고 시각적인 묘사
        2. 전문적인 사진 스타일 지정
        3. 적절한 조명과 구도
        4. 브랜드에 어울리는 톤
        5. 50단어 이내로 간결하게

        형식:
        A professional photograph of [주요 대상], [스타일], [조명], [배경], [구도]
        """

        result = self.generate_text(prompt, max_length=300)
        if result['success']:
            return result['text'].strip()
        else:
            return "A professional photograph related to the topic, clean and modern style"

    def generate_tts_script(self, content):
        """TTS용 스크립트 생성"""
        prompt = f"""
        다음 블로그 내용을 영상 narration용으로 자연스럽게 읽을 수 있는 스크립트로 변환해주세요:

        내용: {content}

        요구사항:
        1. 구어체로 자연스럽게 변환
        2. 문장 길이를 적절히 조절 (10-15초 분량)
        3. 쉼표와 마침표를 명확히 표시
        4. 전문적인 아나운서 톤
        5. 300-400자 분량

        형식:
        [자연스러운 구어체 스크립트]
        """

        return self.generate_text(prompt, max_length=500)