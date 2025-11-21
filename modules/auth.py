from flask import Blueprint, request, jsonify, redirect, url_for, session, flash
from authlib.integrations.flask_client import OAuth
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
import os
import logging

# 로거 설정
logger = logging.getLogger(__name__)

# Auth 블루프린트 생성
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# OAuth 설정
oauth = OAuth()

# LoginManager 설정
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message = '로그인이 필요합니다.'

class User(UserMixin):
    """GitHub OAuth 사용자 모델"""

    def __init__(self, user_data):
        self.id = str(user_data['id'])
        self.username = user_data['login']
        self.name = user_data.get('name', user_data['login'])
        self.email = user_data.get('email', '')
        self.avatar_url = user_data.get('avatar_url', '')
        self.bio = user_data.get('bio', '')
        self.location = user_data.get('location', '')
        self.company = user_data.get('company', '')
        self.blog = user_data.get('blog', '')
        self.public_repos = user_data.get('public_repos', 0)
        self.followers = user_data.get('followers', 0)
        self.following = user_data.get('following', 0)
        self.created_at = user_data.get('created_at', '')

    def to_dict(self):
        """사용자 정보를 딕셔너리로 변환"""
        return {
            'id': self.id,
            'username': self.username,
            'name': self.name,
            'email': self.email,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'location': self.location,
            'company': self.company,
            'blog': self.blog,
            'public_repos': self.public_repos,
            'followers': self.followers,
            'following': self.following,
            'created_at': self.created_at
        }

# 사용자 로더 (세션에서 사용자 정보 복원)
@login_manager.user_loader
def load_user(user_id):
    """세션에서 사용자 정보 로드"""
    if 'user_data' in session and session['user_data']['id'] == int(user_id):
        return User(session['user_data'])
    return None

def init_oauth(app):
    """Flask 앱에 OAuth 초기화"""

    # GitHub OAuth 설정
    oauth.init_app(app)

    github = oauth.register(
        name='github',
        client_id=os.getenv('GITHUB_CLIENT_ID'),
        client_secret=os.getenv('GITHUB_CLIENT_SECRET'),
        access_token_url='https://github.com/login/oauth/access_token',
        authorize_url='https://github.com/login/oauth/authorize',
        api_base_url='https://api.github.com/',
        client_kwargs={'scope': 'user:email'},
        server_metadata_url='https://api.github.com/.well-known/openid-configuration'
    )

    # LoginManager 초기화
    login_manager.init_app(app)

    @auth_bp.route('/login')
    def login():
        """GitHub 로그인 시작"""
        redirect_uri = url_for('auth.authorize', _external=True)
        return github.authorize_redirect(redirect_uri)

    @auth_bp.route('/authorize')
    def authorize():
        """GitHub OAuth 콜백 처리"""
        try:
            token = github.authorize_access_token()

            # 사용자 정보 가져오기
            resp = github.get('user', token=token)
            user_data = resp.json()

            # 이메일 정보 가져오기 (private 이메일 포함)
            email_resp = github.get('user/emails', token=token)
            emails = email_resp.json()

            # 기본 이메일 설정
            primary_email = next((email['email'] for email in emails if email['primary']), '')
            if primary_email:
                user_data['email'] = primary_email

            # 세션에 사용자 정보 저장
            session['user_data'] = user_data
            session['access_token'] = token

            # User 객체 생성 및 로그인
            user = User(user_data)
            login_user(user)

            logger.info(f"User logged in: {user.username}")

            # 로그인 후 메인 페이지로 리디렉션
            return redirect(url_for('index'))

        except Exception as e:
            logger.error(f"GitHub OAuth authorization failed: {str(e)}")
            flash('로그인에 실패했습니다. 다시 시도해주세요.', 'error')
            return redirect(url_for('index'))

    @auth_bp.route('/logout')
    @login_required
    def logout():
        """로그아웃 처리"""
        username = current_user.username
        logout_user()

        # 세션 데이터 정리
        session.clear()

        logger.info(f"User logged out: {username}")
        flash('성공적으로 로그아웃되었습니다.', 'success')

        return redirect(url_for('index'))

    @auth_bp.route('/user')
    @login_required
    def get_user():
        """현재 로그인된 사용자 정보 반환 (API)"""
        return jsonify({
            'status': 'success',
            'user': current_user.to_dict(),
            'is_authenticated': True
        })

    @auth_bp.route('/check')
    def check_auth():
        """인증 상태 확인"""
        if current_user.is_authenticated:
            return jsonify({
                'status': 'authenticated',
                'user': current_user.to_dict()
            })
        else:
            return jsonify({
                'status': 'not_authenticated',
                'user': None
            })

    return github

# 데코레이터: 로그인된 사용자만 접근 가능
def auth_required(f):
    """인증이 필요한 라우트용 데코레이터"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({
                'status': 'error',
                'message': '로그인이 필요합니다.',
                'login_url': url_for('auth.login')
            }), 401
        return f(*args, **kwargs)
    return decorated_function

# 에러 핸들러
@auth_bp.errorhandler(401)
def unauthorized(error):
    """인증되지 않은 접근 처리"""
    if request.is_json:
        return jsonify({
            'status': 'error',
            'message': '인증이 필요합니다.',
            'login_url': url_for('auth.login')
        }), 401
    return redirect(url_for('auth.login'))

@auth_bp.errorhandler(500)
def internal_error(error):
    """서버 내부 오류 처리"""
    logger.error(f"Auth internal error: {str(error)}")
    return jsonify({
        'status': 'error',
        'message': '서버 내부 오류가 발생했습니다.'
    }), 500