"""
다중 플랫폼 블로그 자동 발행 시스템
Tistory, Google Blogger 등 다양한 플랫폼 지원
"""

import requests
import json
import logging
import time
from typing import Dict, List, Optional, Union
from datetime import datetime
import base64

logger = logging.getLogger(__name__)

class BlogPublisher:
    """다중 플랫폼 블로그 발행 시스템"""

    def __init__(self):
        self.publishers = {
            'tistory': TistoryPublisher(),
            'blogger': BloggerPublisher(),
            'general': GeneralPublisher()
        }

    def publish(self, platform: str, blog_data: Dict, config: Dict) -> Dict:
        """
        블로그 발행

        Args:
            platform (str): 발행 플랫폼 (tistory, blogger, general)
            blog_data (Dict): 발행할 블로그 데이터
            config (Dict): 플랫폼 설정 정보

        Returns:
            Dict: 발행 결과
        """
        try:
            if platform not in self.publishers:
                raise ValueError(f"지원하지 않는 플랫폼: {platform}")

            publisher = self.publishers[platform]
            result = publisher.publish(blog_data, config)

            return {
                'success': True,
                'platform': platform,
                'post_url': result.get('post_url'),
                'post_id': result.get('post_id'),
                'message': result.get('message', '발행 성공'),
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"블로그 발행 실패: {str(e)}")
            return {
                'success': False,
                'platform': platform,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def get_supported_platforms(self) -> List[str]:
        """지원하는 플랫폼 목록 반환"""
        return list(self.publishers.keys())


class TistoryPublisher:
    """Tistory 블로그 발행 시스템"""

    def __init__(self):
        self.api_base = "https://www.tistory.com/apis"

    def publish(self, blog_data: Dict, config: Dict) -> Dict:
        """Tistory에 블로그 발행"""
        try:
            # 인증 토큰 발급
            access_token = self._get_access_token(config)

            # 블로그 목록 조회
            blogs = self._get_blogs(access_token)
            target_blog = self._find_target_blog(blogs, config.get('blog_name'))

            if not target_blog:
                raise Exception("대상 블로그를 찾을 수 없습니다.")

            # 카테고리 목록 조회
            categories = self._get_categories(access_token, target_blog['name'])
            target_category = self._find_target_category(categories, config.get('category'))

            # 발행 데이터 준비
            post_data = {
                'access_token': access_token,
                'blogName': target_blog['name'],
                'title': blog_data['title'],
                'content': blog_data['content'],
                'visibility': config.get('visibility', 3),  # 3: 공개
                'category': target_category.get('id', 0) if target_category else 0,
                'tags': blog_data.get('tags', ''),
                'acceptComment': config.get('accept_comment', 1),
                'acceptTrackback': config.get('accept_trackback', 1),
                'published': config.get('published', 1),  # 1: 즉시 발행
                'slogan': blog_data.get('slug', ''),
            }

            # 이미지 업로드
            if blog_data.get('image_url'):
                image_url = self._upload_image(access_token, target_blog['name'],
                                             blog_data['image_url'], blog_data['title'])
                if image_url:
                    # 콘텐츠에 이미지 추가
                    post_data['content'] = f'<img src="{image_url}" alt="{blog_data["title"]}" style="max-width:100%; height:auto;">\n\n{post_data["content"]}'

            # 포스트 발행
            response = requests.post(
                f"{self.api_base}/post/write.json",
                data=post_data,
                timeout=30
            )

            if response.status_code != 200:
                raise Exception(f"Tistory API 오류: {response.status_code}")

            result = response.json()

            if 'tistory' in result and 'url' in result['tistory']:
                return {
                    'post_url': result['tistory']['url'],
                    'post_id': result['tistory']['postId'],
                    'message': 'Tistory에 성공적으로 발행되었습니다.'
                }
            else:
                raise Exception("Tistory 발행 응답 오류")

        except Exception as e:
            logger.error(f"Tistory 발행 실패: {str(e)}")
            raise e

    def _get_access_token(self, config: Dict) -> str:
        """Tistory 액세스 토큰 발급"""
        client_id = config.get('client_id')
        client_secret = config.get('client_secret')
        redirect_uri = config.get('redirect_uri')
        auth_code = config.get('auth_code')

        if not all([client_id, client_secret, redirect_uri, auth_code]):
            raise Exception("Tistory 인증 정보가 부족합니다.")

        data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': redirect_uri,
            'code': auth_code,
            'grant_type': 'authorization_code'
        }

        response = requests.post(
            'https://www.tistory.com/oauth/access_token',
            data=data,
            timeout=30
        )

        if response.status_code != 200:
            raise Exception("Tistory 액세스 토큰 발급 실패")

        access_token = response.text.split('access_token=')[1]
        return access_token

    def _get_blogs(self, access_token: str) -> List[Dict]:
        """블로그 목록 조회"""
        response = requests.get(
            f"{self.api_base}/blog/list.json",
            params={
                'access_token': access_token,
                'output': 'json'
            },
            timeout=30
        )

        if response.status_code != 200:
            raise Exception("블로그 목록 조회 실패")

        result = response.json()
        return result.get('tistory', {}).get('item', {}).get('blogs', [])

    def _find_target_blog(self, blogs: List[Dict], blog_name: str) -> Optional[Dict]:
        """대상 블로그 찾기"""
        if not blog_name:
            return blogs[0] if blogs else None

        for blog in blogs:
            if blog.get('name') == blog_name or blog.get('title') == blog_name:
                return blog

        return blogs[0] if blogs else None

    def _get_categories(self, access_token: str, blog_name: str) -> List[Dict]:
        """카테고리 목록 조회"""
        response = requests.get(
            f"{self.api_base}/category/list.json",
            params={
                'access_token': access_token,
                'blogName': blog_name,
                'output': 'json'
            },
            timeout=30
        )

        if response.status_code != 200:
            raise Exception("카테고리 목록 조회 실패")

        result = response.json()
        return result.get('tistory', {}).get('item', {}).get('categories', [])

    def _find_target_category(self, categories: List[Dict], category_name: str) -> Optional[Dict]:
        """대상 카테고리 찾기"""
        if not category_name:
            return None

        for category in categories:
            if category.get('name') == category_name:
                return category

        return None

    def _upload_image(self, access_token: str, blog_name: str, image_url: str, title: str) -> Optional[str]:
        """이미지 업로드"""
        try:
            # 이미지 다운로드
            response = requests.get(image_url, timeout=30)
            if response.status_code != 200:
                return None

            image_data = response.content

            # 파일 준비
            files = {
                'uploadedfile': (f'{title}.jpg', image_data, 'image/jpeg')
            }

            data = {
                'access_token': access_token,
                'blogName': blog_name,
                'output': 'json'
            }

            # 이미지 업로드
            response = requests.post(
                f"{self.api_base}/post/attach.json",
                files=files,
                data=data,
                timeout=60
            )

            if response.status_code != 200:
                return None

            result = response.json()
            return result.get('tistory', {}).get('item', {}).get('url')

        except Exception as e:
            logger.error(f"이미지 업로드 실패: {str(e)}")
            return None


class BloggerPublisher:
    """Google Blogger 발행 시스템"""

    def __init__(self):
        self.api_base = "https://www.googleapis.com/blogger/v3"

    def publish(self, blog_data: Dict, config: Dict) -> Dict:
        """Google Blogger에 블로그 발행"""
        try:
            access_token = config.get('access_token')
            blog_id = config.get('blog_id')

            if not all([access_token, blog_id]):
                raise Exception("Blogger 인증 정보가 부족합니다.")

            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }

            # 포스트 데이터 준비
            post_data = {
                'title': blog_data['title'],
                'content': blog_data['content'],
                'labels': blog_data.get('tags', '').split(',') if blog_data.get('tags') else [],
                'status': config.get('status', 'LIVE')  # LIVE, DRAFT
            }

            # 이미지 추가
            if blog_data.get('image_url'):
                image_html = f'<img src="{blog_data["image_url"]}" alt="{blog_data["title"]}" style="max-width:100%; height:auto;">'
                post_data['content'] = f'{image_html}\n\n{post_data["content"]}'

            # 포스트 발행
            response = requests.post(
                f"{self.api_base}/blogs/{blog_id}/posts",
                headers=headers,
                json=post_data,
                timeout=30
            )

            if response.status_code != 200:
                raise Exception(f"Blogger API 오류: {response.status_code} - {response.text}")

            result = response.json()

            post_url = result.get('url')
            post_id = result.get('id')

            if not post_url or not post_id:
                raise Exception("Blogger 발행 응답 오류")

            return {
                'post_url': post_url,
                'post_id': post_id,
                'message': 'Google Blogger에 성공적으로 발행되었습니다.'
            }

        except Exception as e:
            logger.error(f"Blogger 발행 실패: {str(e)}")
            raise e

    def get_blogs(self, access_token: str) -> List[Dict]:
        """사용자의 블로그 목록 조회"""
        try:
            headers = {
                'Authorization': f'Bearer {access_token}'
            }

            response = requests.get(
                f"{self.api_base}/users/self/blogs",
                headers=headers,
                timeout=30
            )

            if response.status_code != 200:
                raise Exception(f"블로그 목록 조회 실패: {response.status_code}")

            result = response.json()
            return result.get('items', [])

        except Exception as e:
            logger.error(f"블로그 목록 조회 실패: {str(e)}")
            raise e


class GeneralPublisher:
    """일반 HTML 파일 출력 (테스트용)"""

    def publish(self, blog_data: Dict, config: Dict) -> Dict:
        """HTML 파일로 저장"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"blog_{blog_data['slug'] or 'post'}_{timestamp}.html"

            # HTML 템플릿 생성
            html_content = self._generate_html_template(blog_data)

            # 파일 저장
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(html_content)

            return {
                'post_url': f"file://{filename}",
                'post_id': timestamp,
                'message': f'HTML 파일로 저장되었습니다: {filename}'
            }

        except Exception as e:
            logger.error(f"HTML 저장 실패: {str(e)}")
            raise e

    def _generate_html_template(self, blog_data: Dict) -> str:
        """HTML 템플릿 생성"""
        html_template = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{blog_data['title']}</title>
    <style>
        body {{
            font-family: 'Malgun Gothic', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }}
        .container {{
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }}
        .meta {{
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
        }}
        .tags {{
            margin-top: 20px;
        }}
        .tag {{
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-right: 5px;
        }}
        img {{
            max-width: 100%;
            height: auto;
            border-radius: 8px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{blog_data['title']}</h1>

        <div class="meta">
            <strong>작성일:</strong> {datetime.now().strftime('%Y년 %m월 %d일')}<br>
            <strong>태그:</strong> {blog_data.get('tags', '')}
        </div>

        {f'<img src="{blog_data["image_url"]}" alt="{blog_data["title"]}" style="margin-bottom: 20px;">' if blog_data.get('image_url') else ''}

        <div class="content">
            {blog_data['content']}
        </div>

        <div class="tags">
            {"".join([f'<span class="tag">{tag.strip()}</span>' for tag in blog_data.get('tags', '').split(',') if tag.strip()])}
        </div>
    </div>
</body>
</html>"""

        return html_template


class BlogScheduler:
    """블로그 예약 발행 시스템"""

    def __init__(self, publisher: BlogPublisher):
        self.publisher = publisher
        self.scheduled_posts = []

    def schedule_post(self, platform: str, blog_data: Dict, config: Dict,
                     schedule_time: datetime) -> Dict:
        """블로그 예약 발행"""
        try:
            scheduled_post = {
                'id': f"scheduled_{int(time.time())}",
                'platform': platform,
                'blog_data': blog_data,
                'config': config,
                'schedule_time': schedule_time.isoformat(),
                'status': 'scheduled',
                'created_at': datetime.now().isoformat()
            }

            self.scheduled_posts.append(scheduled_post)

            return {
                'success': True,
                'schedule_id': scheduled_post['id'],
                'schedule_time': schedule_time.isoformat(),
                'message': f"{platform}에 {schedule_time.strftime('%Y-%m-%d %H:%M')} 예약 발행되었습니다."
            }

        except Exception as e:
            logger.error(f"예약 발행 실패: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def get_scheduled_posts(self) -> List[Dict]:
        """예약된 포스트 목록 조회"""
        return self.scheduled_posts

    def cancel_scheduled_post(self, schedule_id: str) -> Dict:
        """예약 발행 취소"""
        try:
            for i, post in enumerate(self.scheduled_posts):
                if post['id'] == schedule_id:
                    post['status'] = 'cancelled'
                    post['cancelled_at'] = datetime.now().isoformat()

                    return {
                        'success': True,
                        'message': '예약 발행이 취소되었습니다.'
                    }

            return {
                'success': False,
                'error': '예약된 포스트를 찾을 수 없습니다.'
            }

        except Exception as e:
            logger.error(f"예약 취소 실패: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }