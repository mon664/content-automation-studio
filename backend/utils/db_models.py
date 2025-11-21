"""
데이터베이스 모델 정의
사용자 정보, 콘텐츠, 성과 데이터 등을 저장
"""

import json
import sqlite3
import os
from datetime import datetime
from typing import Dict, List, Optional, Any

class DatabaseManager:
    """SQLite 데이터베이스 관리자"""

    def __init__(self, db_path: str = None):
        if db_path is None:
            db_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'content_automation.db')

        self.db_path = db_path
        self.ensure_database_exists()

    def ensure_database_exists(self):
        """데이터베이스 파일과 테이블 생성"""
        # 데이터 디렉토리 생성
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # 사용자 테이블
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    github_id TEXT UNIQUE NOT NULL,
                    username TEXT NOT NULL,
                    email TEXT UNIQUE,
                    avatar_url TEXT,
                    name TEXT,
                    webdav_config TEXT,  -- JSON 형식으로 저장
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    is_active BOOLEAN DEFAULT 1
                )
            ''')

            # 콘텐츠 테이블
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS contents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    topic TEXT NOT NULL,
                    content TEXT,
                    keywords TEXT,  -- JSON 배열
                    content_type TEXT DEFAULT 'blog',
                    word_count INTEGER DEFAULT 0,
                    image_count INTEGER DEFAULT 0,
                    generation_time REAL,  -- 소요 시간 (초)
                    status TEXT DEFAULT 'draft',  -- draft, published, archived
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')

            # 성과 데이터 테이블
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS analytics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    content_id INTEGER,
                    metric_type TEXT NOT NULL,  -- views, likes, shares, engagement
                    metric_value REAL DEFAULT 0,
                    date DATE,
                    metadata TEXT,  -- 추가 정보 (JSON)
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (content_id) REFERENCES contents (id)
                )
            ''')

            # 이미지 테이블
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS images (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    content_id INTEGER,
                    original_prompt TEXT,
                    filename TEXT,
                    file_url TEXT,
                    file_size INTEGER,
                    generation_time REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (content_id) REFERENCES contents (id)
                )
            ''')

            # 사용자 세션 테이블
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    session_token TEXT UNIQUE NOT NULL,
                    expires_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')

            # 인덱스 생성
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_github_id ON users (github_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_contents_user_id ON contents (user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics (user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics (date)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_images_user_id ON images (user_id)')

            conn.commit()

class User:
    """사용자 모델"""

    def __init__(self, github_id: str, username: str, email: str = None,
                 avatar_url: str = None, name: str = None, webdav_config: Dict = None):
        self.github_id = github_id
        self.username = username
        self.email = email
        self.avatar_url = avatar_url
        self.name = name or username
        self.webdav_config = webdav_config or {}

    def save_to_db(self, db: DatabaseManager) -> int:
        """데이터베이스에 사용자 저장"""
        with sqlite3.connect(db.db_path) as conn:
            cursor = conn.cursor()

            # 기존 사용자 확인
            cursor.execute('SELECT id FROM users WHERE github_id = ?', (self.github_id,))
            existing = cursor.fetchone()

            webdav_json = json.dumps(self.webdav_config) if self.webdav_config else None

            if existing:
                # 기존 사용자 정보 업데이트
                cursor.execute('''
                    UPDATE users
                    SET username = ?, email = ?, avatar_url = ?, name = ?,
                        webdav_config = ?, last_login = CURRENT_TIMESTAMP
                    WHERE github_id = ?
                ''', (self.username, self.email, self.avatar_url, self.name,
                      webdav_json, self.github_id))
                return existing[0]
            else:
                # 새 사용자 생성
                cursor.execute('''
                    INSERT INTO users (github_id, username, email, avatar_url, name, webdav_config)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (self.github_id, self.username, self.email, self.avatar_url,
                      self.name, webdav_json))
                return cursor.lastrowid

    @classmethod
    def get_by_github_id(cls, db: DatabaseManager, github_id: str) -> Optional['User']:
        """GitHub ID로 사용자 조회"""
        with sqlite3.connect(db.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT github_id, username, email, avatar_url, name, webdav_config
                FROM users WHERE github_id = ?
            ''', (github_id,))

            row = cursor.fetchone()
            if row:
                webdav_config = json.loads(row[5]) if row[5] else {}
                return cls(
                    github_id=row[0],
                    username=row[1],
                    email=row[2],
                    avatar_url=row[3],
                    name=row[4],
                    webdav_config=webdav_config
                )
        return None

    @classmethod
    def get_by_email(cls, db: DatabaseManager, email: str) -> Optional['User']:
        """이메일로 사용자 조회"""
        with sqlite3.connect(db.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT github_id, username, email, avatar_url, name, webdav_config
                FROM users WHERE email = ?
            ''', (email,))

            row = cursor.fetchone()
            if row:
                webdav_config = json.loads(row[5]) if row[5] else {}
                return cls(
                    github_id=row[0],
                    username=row[1],
                    email=row[2],
                    avatar_url=row[3],
                    name=row[4],
                    webdav_config=webdav_config
                )
        return None

class Content:
    """콘텐츠 모델"""

    def __init__(self, user_id: int, title: str, topic: str, content: str = None,
                 keywords: List[str] = None, content_type: str = 'blog'):
        self.user_id = user_id
        self.title = title
        self.topic = topic
        self.content = content
        self.keywords = keywords or []
        self.content_type = content_type
        self.word_count = len(content.split()) if content else 0
        self.image_count = 0
        self.generation_time = 0
        self.status = 'draft'

    def save_to_db(self, db: DatabaseManager) -> int:
        """데이터베이스에 콘텐츠 저장"""
        with sqlite3.connect(db.db_path) as conn:
            cursor = conn.cursor()

            keywords_json = json.dumps(self.keywords) if self.keywords else None

            cursor.execute('''
                INSERT INTO contents (
                    user_id, title, topic, content, keywords, content_type,
                    word_count, image_count, generation_time, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (self.user_id, self.title, self.topic, self.content,
                  keywords_json, self.content_type, self.word_count,
                  self.image_count, self.generation_time, self.status))

            return cursor.lastrowid

    @classmethod
    def get_user_contents(cls, db: DatabaseManager, user_id: int,
                         limit: int = 50, offset: int = 0) -> List['Content']:
        """사용자의 콘텐츠 목록 조회"""
        with sqlite3.connect(db.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT title, topic, content, keywords, content_type,
                       word_count, image_count, generation_time, status, created_at
                FROM contents
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            ''', (user_id, limit, offset))

            contents = []
            for row in cursor.fetchall():
                keywords = json.loads(row[3]) if row[3] else []
                content = cls(
                    user_id=user_id,
                    title=row[0],
                    topic=row[1],
                    content=row[2],
                    keywords=keywords,
                    content_type=row[4]
                )
                content.word_count = row[5]
                content.image_count = row[6]
                content.generation_time = row[7]
                content.status = row[8]
                contents.append(content)

            return contents

class AnalyticsData:
    """성과 데이터 모델"""

    def __init__(self, user_id: int, metric_type: str, metric_value: float,
                 content_id: int = None, date: str = None, metadata: Dict = None):
        self.user_id = user_id
        self.content_id = content_id
        self.metric_type = metric_type  # views, likes, shares, engagement
        self.metric_value = metric_value
        self.date = date or datetime.now().strftime('%Y-%m-%d')
        self.metadata = metadata or {}

    def save_to_db(self, db: DatabaseManager):
        """데이터베이스에 성과 데이터 저장"""
        with sqlite3.connect(db.db_path) as conn:
            cursor = conn.cursor()

            metadata_json = json.dumps(self.metadata) if self.metadata else None

            cursor.execute('''
                INSERT INTO analytics (
                    user_id, content_id, metric_type, metric_value, date, metadata
                ) VALUES (?, ?, ?, ?, ?, ?)
            ''', (self.user_id, self.content_id, self.metric_type,
                  self.metric_value, self.date, metadata_json))

    @classmethod
    def get_user_analytics(cls, db: DatabaseManager, user_id: int,
                          days: int = 30) -> List['AnalyticsData']:
        """사용자 성과 데이터 조회"""
        with sqlite3.connect(db.db_path) as conn:
            cursor = conn.cursor()

            cursor.execute('''
                SELECT metric_type, metric_value, content_id, date, metadata
                FROM analytics
                WHERE user_id = ? AND date >= date('now', '-{} days')
                ORDER BY date DESC
            '''.format(days), (user_id,))

            analytics = []
            for row in cursor.fetchall():
                metadata = json.loads(row[4]) if row[4] else {}
                data = cls(
                    user_id=user_id,
                    metric_type=row[0],
                    metric_value=row[1],
                    content_id=row[2],
                    date=row[3],
                    metadata=metadata
                )
                analytics.append(data)

            return analytics

class Image:
    """이미지 모델"""

    def __init__(self, user_id: int, original_prompt: str, filename: str,
                 file_url: str, content_id: int = None, file_size: int = None):
        self.user_id = user_id
        self.content_id = content_id
        self.original_prompt = original_prompt
        self.filename = filename
        self.file_url = file_url
        self.file_size = file_size
        self.generation_time = 0

    def save_to_db(self, db: DatabaseManager) -> int:
        """데이터베이스에 이미지 정보 저장"""
        with sqlite3.connect(db.db_path) as conn:
            cursor = conn.cursor()

            cursor.execute('''
                INSERT INTO images (
                    user_id, content_id, original_prompt, filename,
                    file_url, file_size, generation_time
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (self.user_id, self.content_id, self.original_prompt,
                  self.filename, self.file_url, self.file_size, self.generation_time))

            return cursor.lastrowid

# 전역 데이터베이스 인스턴스
db_manager = DatabaseManager()