from flask import Blueprint, request, jsonify
import jwt
import hashlib
from datetime import datetime, timedelta
from functools import wraps
import os

auth_bp = Blueprint('auth', __name__)

# 시크릿 키 (실제 환경에서는 환경변수 사용)
SECRET_KEY = os.getenv('SECRET_KEY', 'content-automation-studio-secret-key')

# 사용자 데이터 (시뮜레이션 - 실제로는 데이터베이스 사용)
USERS = {
    'admin': {
        'password_hash': hashlib.sha256('admin123'.encode()).hexdigest(),
        'credits': 1000,
        'role': 'admin',
        'created_at': '2024-01-01T00:00:00'
    },
    'user1': {
        'password_hash': hashlib.sha256('user123'.encode()).hexdigest(),
        'credits': 100,
        'role': 'user',
        'created_at': '2024-01-15T00:00:00'
    }
}

def token_required(f):
    """JWT 토큰 검사 데코레이터"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            # Bearer 토큰에서 토큰 추출
            if token.startswith('Bearer '):
                token = token[7:]

            # 토큰 디코딩
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = data['username']

            # 사용자 존재 확인
            if current_user not in USERS:
                return jsonify({'error': 'User not found'}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

def admin_required(f):
    """관리자 권한 검사 데코레이터"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            if token.startswith('Bearer '):
                token = token[7:]

            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = data['username']

            if current_user not in USERS:
                return jsonify({'error': 'User not found'}), 401

            # 관리자 권한 확인
            if USERS[current_user]['role'] != 'admin':
                return jsonify({'error': 'Admin access required'}), 403

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

@auth_bp.route('/login', methods=['POST'])
def login():
    """로그인"""
    data = request.get_json()

    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password are required'}), 400

    username = data['username']
    password = data['password']

    # 사용자 확인
    if username not in USERS:
        return jsonify({'error': 'Invalid credentials'}), 401

    # 비밀번호 확인
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    if USERS[username]['password_hash'] != password_hash:
        return jsonify({'error': 'Invalid credentials'}), 401

    # JWT 토큰 생성
    token = jwt.encode({
        'username': username,
        'role': USERS[username]['role'],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, SECRET_KEY, algorithm='HS256')

    return jsonify({
        'success': True,
        'token': token,
        'user': {
            'username': username,
            'role': USERS[username]['role'],
            'credits': USERS[username]['credits']
        }
    })

@auth_bp.route('/register', methods=['POST'])
def register():
    """회원가입"""
    data = request.get_json()

    required_fields = ['username', 'password', 'email']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Username, password, and email are required'}), 400

    username = data['username']
    password = data['password']
    email = data['email']

    # 사용자 중복 확인
    if username in USERS:
        return jsonify({'error': 'Username already exists'}), 400

    # 새 사용자 생성
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    USERS[username] = {
        'password_hash': password_hash,
        'credits': 100,  # 신규 사용자 초기 크레딧
        'role': 'user',
        'email': email,
        'created_at': datetime.now().isoformat()
    }

    # JWT 토큰 생성
    token = jwt.encode({
        'username': username,
        'role': 'user',
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, SECRET_KEY, algorithm='HS256')

    return jsonify({
        'success': True,
        'token': token,
        'user': {
            'username': username,
            'role': 'user',
            'credits': 100,
            'email': email
        },
        'message': 'Registration successful'
    })

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """사용자 프로필 조회"""
    user_data = USERS[current_user]

    return jsonify({
        'success': True,
        'user': {
            'username': current_user,
            'role': user_data['role'],
            'credits': user_data['credits'],
            'email': user_data.get('email', ''),
            'created_at': user_data['created_at']
        }
    })

@auth_bp.route('/credits', methods=['GET'])
@token_required
def get_credits(current_user):
    """크레딧 조회"""
    credits = USERS[current_user]['credits']

    return jsonify({
        'success': True,
        'credits': credits
    })

@auth_bp.route('/credits/use', methods=['POST'])
@token_required
def use_credits(current_user):
    """크레딧 사용"""
    data = request.get_json()

    if not data or 'amount' not in data:
        return jsonify({'error': 'Amount is required'}), 400

    amount = int(data['amount'])
    reason = data.get('reason', 'Content generation')

    if amount <= 0:
        return jsonify({'error': 'Amount must be positive'}), 400

    # 크레딧 확인
    if USERS[current_user]['credits'] < amount:
        return jsonify({'error': 'Insufficient credits'}), 400

    # 크레딧 차감
    USERS[current_user]['credits'] -= amount

    # 사용 기록 (시뮬레이션)
    usage_record = {
        'username': current_user,
        'amount': amount,
        'reason': reason,
        'timestamp': datetime.now().isoformat(),
        'remaining_credits': USERS[current_user]['credits']
    }

    return jsonify({
        'success': True,
        'credits_used': amount,
        'remaining_credits': USERS[current_user]['credits'],
        'reason': reason
    })

@auth_bp.route('/admin/users', methods=['GET'])
@admin_required
def get_users(current_user):
    """관리자: 전체 사용자 목록"""
    users_list = []

    for username, user_data in USERS.items():
        users_list.append({
            'username': username,
            'role': user_data['role'],
            'credits': user_data['credits'],
            'email': user_data.get('email', ''),
            'created_at': user_data['created_at']
        })

    return jsonify({
        'success': True,
        'users': users_list,
        'total_users': len(users_list)
    })

@auth_bp.route('/admin/users/<username>/credits', methods=['PUT'])
@admin_required
def update_user_credits(current_user, username):
    """관리자: 사용자 크레딧 업데이트"""
    data = request.get_json()

    if not data or 'credits' not in data:
        return jsonify({'error': 'Credits amount is required'}), 400

    new_credits = int(data['credits'])

    if username not in USERS:
        return jsonify({'error': 'User not found'}), 404

    old_credits = USERS[username]['credits']
    USERS[username]['credits'] = new_credits

    return jsonify({
        'success': True,
        'username': username,
        'old_credits': old_credits,
        'new_credits': new_credits,
        'updated_by': current_user
    })

@auth_bp.route('/verify', methods=['POST'])
def verify_token():
    """토큰 검증"""
    data = request.get_json()

    if not data or 'token' not in data:
        return jsonify({'error': 'Token is required'}), 400

    token = data['token']

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        username = decoded['username']

        if username not in USERS:
            return jsonify({'error': 'User not found'}), 401

        return jsonify({
            'success': True,
            'valid': True,
            'username': username,
            'role': USERS[username]['role']
        })

    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token is invalid'}), 401