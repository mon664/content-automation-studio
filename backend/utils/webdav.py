"""
WebDAV 스토리지 관리자
이미지 및 파일 업로드를 위한 WebDAV 클라이언트
"""

import os
import requests
from datetime import datetime
from urllib.parse import urljoin
import mimetypes

class WebDAVManager:
    """WebDAV 파일 관리자"""

    def __init__(self):
        self.base_url = os.getenv('WEBDAV_URL', 'https://rausu.infini-cloud.net/dav')
        self.username = os.getenv('WEBDAV_USERNAME', 'hhtsta')
        self.password = os.getenv('WEBDAV_PASSWORD', 'RXYf3uYhCbL9Ezwa')
        self.auth = (self.username, self.password)

        # 이미지 저장을 위한 기본 폴더 구조
        self.base_folder = '/uploads/images'

    def upload_file(self, file_data, filename, folder_path=None):
        """
        WebDAV에 파일 업로드

        Args:
            file_data (bytes): 파일 데이터
            filename (str): 파일 이름
            folder_path (str): 추가 폴더 경로 (선택사항)

        Returns:
            str: 공개 URL
        """
        try:
            # 폴더 경로 구성
            if folder_path:
                upload_path = f"{self.base_folder}/{folder_path}/{filename}"
            else:
                # 날짜별 폴더 구성
                date_folder = datetime.now().strftime('%Y/%m')
                upload_path = f"{self.base_folder}/{date_folder}/{filename}"

            # WebDAV URL 구성
            upload_url = urljoin(self.base_url, upload_path.lstrip('/'))

            # MIME 타입 결정
            content_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
            headers = {
                'Content-Type': content_type
            }

            # 파일 업로드
            response = requests.put(
                upload_url,
                data=file_data,
                headers=headers,
                auth=self.auth,
                timeout=30
            )

            if response.status_code in [200, 201, 204]:
                # 공개 URL 반환 (WebDAV 설정에 따라 조정 필요)
                public_url = upload_url.replace('/dav/', '/')
                print(f"File uploaded successfully: {public_url}")
                return public_url
            else:
                print(f"Upload failed with status {response.status_code}: {response.text}")
                return None

        except Exception as e:
            print(f"Error uploading file {filename}: {str(e)}")
            return None

    def create_folder(self, folder_path):
        """
        WebDAV에 폴더 생성

        Args:
            folder_path (str): 생성할 폴더 경로

        Returns:
            bool: 성공 여부
        """
        try:
            folder_url = urljoin(self.base_url, folder_path.lstrip('/'))
            response = requests.request(
                'MKCOL',
                folder_url,
                auth=self.auth,
                timeout=10
            )

            return response.status_code in [200, 201, 204]

        except Exception as e:
            print(f"Error creating folder {folder_path}: {str(e)}")
            return False

    def ensure_folder_exists(self, folder_path):
        """
        폴더가 존재하는지 확인하고 없으면 생성

        Args:
            folder_path (str): 확인할 폴더 경로
        """
        try:
            # 날짜별 폴더 생성
            date_folder = datetime.now().strftime('%Y/%m')
            full_path = f"{self.base_folder}/{date_folder}"

            if folder_path:
                full_path = f"{full_path}/{folder_path}"

            # 폴더 생성 시도
            self.create_folder(full_path)

        except Exception as e:
            print(f"Error ensuring folder exists: {str(e)}")

    def upload_image_from_data(self, image_data, filename=None, folder="generated"):
        """
        이미지 데이터를 WebDAV에 업로드

        Args:
            image_data (bytes): 이미지 바이너리 데이터
            filename (str): 파일 이름 (선택사항)
            folder (str): 저장할 폴더 이름

        Returns:
            str: 공개 URL 또는 None
        """
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"generated_image_{timestamp}.png"

        # 폴더 존재 확인
        self.ensure_folder_exists(folder)

        # 파일 업로드
        return self.upload_file(image_data, filename, folder)

    def get_public_url(self, filename, folder=None):
        """
        파일의 공개 URL 생성

        Args:
            filename (str): 파일 이름
            folder (str): 폴더 경로 (선택사항)

        Returns:
            str: 공개 URL
        """
        if folder:
            path = f"{self.base_folder}/{folder}/{filename}"
        else:
            date_folder = datetime.now().strftime('%Y/%m')
            path = f"{self.base_folder}/{date_folder}/{filename}"

        # WebDAV URL을 공개 URL로 변환
        public_url = path.replace('/dav/', '/')
        return urljoin(self.base_url.replace('/dav', ''), public_url.lstrip('/'))

# 전역 WebDAV 매니저 인스턴스
webdav_manager = WebDAVManager()