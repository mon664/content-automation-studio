import webdavclient
import requests
from urllib.parse import urljoin
import os
import tempfile
import uuid
from datetime import datetime
from config import Config

class WebDAVManager:
    def __init__(self):
        self.webdav_url = Config.WEBDAV_URL
        self.username = Config.WEBDAV_USERNAME
        self.password = Config.WEBDAV_PASSWORD
        self.client = None

    def connect(self):
        """WebDAV 연결"""
        try:
            self.client = webdavclient.Client(
                url=self.webdav_url,
                username=self.username,
                password=self.password
            )
            print("✅ WebDAV 연결 성공")
            return True
        except Exception as e:
            print(f"❌ WebDAV 연결 실패: {e}")
            return False

    def upload_file(self, local_path, remote_path=None):
        """파일 업로드"""
        try:
            if not self.client:
                self.connect()

            if not remote_path:
                # 고유 파일명 생성
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                unique_id = str(uuid.uuid4())[:8]
                filename = os.path.basename(local_path)
                name, ext = os.path.splitext(filename)
                remote_filename = f"{timestamp}_{unique_id}_{name}{ext}"

                # 월별 폴더 구조
                folder_path = f"/uploads/{datetime.now().strftime('%Y/%m')}"
                remote_path = f"{folder_path}/{remote_filename}"

                # 폴더 생성
                self.create_folder(folder_path)

            self.client.upload_sync(local_path, remote_path)
            public_url = f"{self.webdav_url}{remote_path}"
            print(f"✅ 파일 업로드 성공: {public_url}")
            return {
                'success': True,
                'url': public_url,
                'remote_path': remote_path
            }
        except Exception as e:
            print(f"❌ 파일 업로드 실패: {e}")
            return {'success': False, 'error': str(e)}

    def download_file(self, remote_path, local_path):
        """파일 다운로드"""
        try:
            if not self.client:
                self.connect()

            self.client.download_sync(remote_path, local_path)
            print(f"✅ 파일 다운로드 성공: {local_path}")
            return True
        except Exception as e:
            print(f"❌ 파일 다운로드 실패: {e}")
            return False

    def list_files(self, path="/"):
        """파일 목록 조회"""
        try:
            if not self.client:
                self.connect()

            files = self.client.list(path)
            return files
        except Exception as e:
            print(f"❌ 파일 목록 조회 실패: {e}")
            return []

    def delete_file(self, remote_path):
        """파일 삭제"""
        try:
            if not self.client:
                self.connect()

            self.client.unlink(remote_path)
            print(f"✅ 파일 삭제 성공: {remote_path}")
            return True
        except Exception as e:
            print(f"❌ 파일 삭제 실패: {e}")
            return False

    def create_folder(self, folder_path):
        """폴더 생성"""
        try:
            if not self.client:
                self.connect()

            self.client.mkdir(folder_path)
            print(f"✅ 폴더 생성 성공: {folder_path}")
            return True
        except Exception as e:
            # 폴더가 이미 존재하면 성공으로 처리
            if "already exists" in str(e).lower():
                return True
            print(f"❌ 폴더 생성 실패: {e}")
            return False

    def get_file_info(self, remote_path):
        """파일 정보 조회"""
        try:
            if not self.client:
                self.connect()

            info = self.client.info(remote_path)
            return {
                'name': info.name,
                'size': info.size,
                'modified': info.modified,
                'is_directory': info.is_dir(),
                'path': info.path
            }
        except Exception as e:
            print(f"❌ 파일 정보 조회 실패: {e}")
            return None