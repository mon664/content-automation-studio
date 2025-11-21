"""
Vertex AI Imagen 3 이미지 생성 유틸리티
Google Cloud Vertex AI를 통한 고화질 이미지 생성
"""

import os
import requests
import json
import base64
from typing import Optional, List

class VertexAIImageGenerator:
    """Vertex AI Imagen 3 이미지 생성기"""

    def __init__(self):
        self.project_id = os.getenv('GOOGLE_PROJECT_ID', 'content-automation-studio')
        self.location = os.getenv('GOOGLE_LOCATION', 'us-central1')
        self.api_key = os.getenv('VERTEX_AI_API_KEY', 'AQ.Ab8RN6LuBT_emr293bsy-BBxgLc9l9TOnYCz73uoc-uA1aBp4A')

        # Vertex AI API 엔드포인트
        self.base_url = f"https://{self.location}-aiplatform.googleapis.com/v1"
        self.model_name = "imagen-3.0-generate-001"

    def generate_image(self, prompt: str, negative_prompt: Optional[str] = None,
                      aspect_ratio: str = "16:9", style: str = "photograph") -> Optional[bytes]:
        """
        Vertex AI Imagen 3로 이미지 생성

        Args:
            prompt (str): 이미지 생성 프롬프트
            negative_prompt (str): 부정적 프롬프트 (선택사항)
            aspect_ratio (str): 이미지 비율 (1:1, 16:9, 9:16, 4:3, 3:4)
            style (str): 이미지 스타일 (photograph, digital_art, oil_painting, etc.)

        Returns:
            bytes: 생성된 이미지 데이터 또는 None
        """
        try:
            # API 엔드포인트
            endpoint = f"{self.base_url}/projects/{self.project_id}/locations/{self.location}/publishers/google/models/{self.model_name}:predict"

            # 요청 헤더
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            # 요청 페이로드 구성
            payload = {
                "instances": [{
                    "prompt": f"""
Create a professional, high-quality {style} image with the following description:

{prompt}

Style requirements:
- Professional lighting and composition
- Natural, realistic colors
- High resolution, sharp details
- Suitable for blog content and professional use
- Clean background that complements the subject
- Avoid watermarks, text, or signatures
- Safe for work and appropriate for all audiences
""",
                    "aspectRatio": aspect_ratio,
                    "safetyFilterLevel": "block_some",
                    "personGeneration": "allow_adult"
                }],
                "parameters": {
                    "sampleCount": 1,
                    "seed": -1,  # 랜덤 시드
                    "addWatermark": False
                }
            }

            # 부정적 프롬프트 추가
            if negative_prompt:
                payload["instances"][0]["negativePrompt"] = negative_prompt

            print(f"Generating image with prompt: {prompt[:100]}...")

            # API 호출
            response = requests.post(
                endpoint,
                headers=headers,
                json=payload,
                timeout=60
            )

            if response.status_code == 200:
                result = response.json()

                # 생성된 이미지 데이터 추출
                if "predictions" in result and len(result["predictions"]) > 0:
                    prediction = result["predictions"][0]

                    # 이미지가 Base64로 인코딩되어 있는 경우
                    if "bytesBase64Encoded" in prediction:
                        image_data = base64.b64decode(prediction["bytesBase64Encoded"])
                        print(f"Successfully generated image ({len(image_data)} bytes)")
                        return image_data

                    # 이미지 URL이 제공되는 경우
                    elif "imageGcsUri" in prediction:
                        # GCS에서 이미지 다운로드
                        image_url = prediction["imageGcsUri"]
                        img_response = requests.get(image_url, timeout=30)
                        if img_response.status_code == 200:
                            print(f"Successfully downloaded image from GCS ({len(img_response.content)} bytes)")
                            return img_response.content

                print("No image data found in response")
                return None
            else:
                print(f"Image generation failed with status {response.status_code}: {response.text}")
                return None

        except Exception as e:
            print(f"Error generating image: {str(e)}")
            return None

    def generate_multiple_images(self, prompts: List[str],
                               aspect_ratio: str = "16:9",
                               style: str = "photograph") -> List[bytes]:
        """
        여러 개의 이미지 생성

        Args:
            prompts (List[str]): 이미지 생성 프롬프트 리스트
            aspect_ratio (str): 이미지 비율
            style (str): 이미지 스타일

        Returns:
            List[bytes]: 생성된 이미지 데이터 리스트
        """
        images = []

        for i, prompt in enumerate(prompts):
            print(f"Generating image {i+1}/{len(prompts)}")

            try:
                image_data = self.generate_image(prompt, aspect_ratio=aspect_ratio, style=style)
                if image_data:
                    images.append(image_data)
                else:
                    print(f"Failed to generate image for prompt: {prompt[:50]}...")

            except Exception as e:
                print(f"Error generating image {i+1}: {str(e)}")
                continue

        return images

    def enhance_prompt_for_blog(self, original_prompt: str) -> str:
        """
        블로그용 프롬프트 강화

        Args:
            original_prompt (str): 원본 프롬프트

        Returns:
            str: 강화된 프롬프트
        """
        enhanced_prompt = f"""
Professional blog content image: {original_prompt}

Requirements:
- High quality, professional photography style
- Natural lighting and composition
- Clean, uncluttered background
- Subject clearly visible and well-focused
- Suitable for professional blog posts
- Warm, inviting color palette
- No text, watermarks, or signatures
- Safe for all audiences
- Aspect ratio optimized for web content
"""

        return enhanced_prompt.strip()

# 전역 이미지 생성기 인스턴스
image_generator = VertexAIImageGenerator()