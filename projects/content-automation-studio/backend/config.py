import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Google Cloud 설정
    GOOGLE_PROJECT_ID = os.getenv('GOOGLE_PROJECT_ID', 'content-automation-studio')
    GOOGLE_LOCATION = os.getenv('GOOGLE_LOCATION', 'us-central1')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    VERTEX_AI_API_KEY = os.getenv('VERTEX_AI_API_KEY')

    # WebDAV 설정
    WEBDAV_URL = os.getenv('WEBDAV_URL', 'https://rausu.infini-cloud.net/dav')
    WEBDAV_USERNAME = os.getenv('WEBDAV_USERNAME', 'hhtsta')
    WEBDAV_PASSWORD = os.getenv('WEBDAV_PASSWORD', 'RXYf3uYhCbL9Ezwa')

    # Flask 설정
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

    # 파일 업로드 설정
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    UPLOAD_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.avi']

    # Railway 설정
    PORT = int(os.getenv('PORT', 5000))