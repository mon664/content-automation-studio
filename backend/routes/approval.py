"""
사용자 승인 관리 API
관리자가 사용자 가입을 승인/거절하는 기능
"""

from flask import Blueprint, jsonify, request, session
from flask_login import login_required, current_user
import logging
import sys
import os

# utils 디렉토리를 Python path에 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

try:
    from utils.db_models import User as DBUser, db_manager
except ImportError:
    print("Warning: DB models not available")
    DBUser = None
    db_manager = None

# Approval 블루프린트 생성
approval_bp = Blueprint('approval', __name__, url_prefix='/api/approval')

# 로거 설정
logger = logging.getLogger(__name__)

# 관리자 목록 (app.py와 동일하게 유지)
ADMIN_USERS = ['mon664']

def is_admin():
    """관리자인지 확인"""
    if not current_user.is_authenticated:
        return False
    return current_user.username in ADMIN_USERS

@approval_bp.route('/pending-users', methods=['GET'])
@login_required
def get_pending_users():
    """승인 대기 중인 사용자 목록"""
    if not is_admin():
        return jsonify({'error': '관리자 권한이 필요합니다'}), 403

    try:
        if DBUser and db_manager:
            pending_users = DBUser.get_pending_users(db_manager)

            users_data = []
            for user in pending_users:
                users_data.append({
                    'github_id': user.github_id,
                    'username': user.username,
                    'name': user.name,
                    'email': user.email,
                    'avatar_url': user.avatar_url,
                    'status': user.status
                })

            return jsonify({
                'success': True,
                'users': users_data,
                'count': len(users_data)
            })
        else:
            # Fallback
            return jsonify({
                'success': True,
                'users': [],
                'count': 0,
                'message': 'Database not available'
            })

    except Exception as e:
        logger.error(f"Failed to get pending users: {str(e)}")
        return jsonify({
            'success': False,
            'error': '승인 대기 사용자 목록을 가져오는데 실패했습니다'
        }), 500

@approval_bp.route('/approve-user', methods=['POST'])
@login_required
def approve_user():
    """사용자 승인"""
    if not is_admin():
        return jsonify({'error': '관리자 권한이 필요합니다'}), 403

    try:
        data = request.get_json()
        github_id = data.get('github_id')

        if not github_id:
            return jsonify({'error': 'GitHub ID가 필요합니다'}), 400

        if DBUser and db_manager:
            user = DBUser.get_by_github_id(db_manager, github_id)
            if user:
                user.approve_user(db_manager)

                logger.info(f"User approved: {user.username} ({github_id})")
                return jsonify({
                    'success': True,
                    'message': f'{user.name}({user.username})님을 승인했습니다.'
                })
            else:
                return jsonify({'error': '사용자를 찾을 수 없습니다'}), 404
        else:
            return jsonify({'error': 'Database not available'}), 500

    except Exception as e:
        logger.error(f"Failed to approve user: {str(e)}")
        return jsonify({
            'success': False,
            'error': '사용자 승인에 실패했습니다'
        }), 500

@approval_bp.route('/reject-user', methods=['POST'])
@login_required
def reject_user():
    """사용자 거절"""
    if not is_admin():
        return jsonify({'error': '관리자 권한이 필요합니다'}), 403

    try:
        data = request.get_json()
        github_id = data.get('github_id')
        reason = data.get('reason', '')

        if not github_id:
            return jsonify({'error': 'GitHub ID가 필요합니다'}), 400

        if DBUser and db_manager:
            user = DBUser.get_by_github_id(db_manager, github_id)
            if user:
                user.reject_user(db_manager)

                logger.info(f"User rejected: {user.username} ({github_id}) - Reason: {reason}")
                return jsonify({
                    'success': True,
                    'message': f'{user.name}({user.username})님을 거절했습니다.'
                })
            else:
                return jsonify({'error': '사용자를 찾을 수 없습니다'}), 404
        else:
            return jsonify({'error': 'Database not available'}), 500

    except Exception as e:
        logger.error(f"Failed to reject user: {str(e)}")
        return jsonify({
            'success': False,
            'error': '사용자 거절에 실패했습니다'
        }), 500

@approval_bp.route('/user-status', methods=['GET'])
def get_user_status():
    """현재 사용자의 승인 상태 확인"""
    if not current_user.is_authenticated:
        return jsonify({
            'authenticated': False,
            'status': 'not_logged_in'
        })

    try:
        if DBUser and db_manager:
            user = DBUser.get_by_github_id(db_manager, current_user.github_id)
            if user:
                return jsonify({
                    'authenticated': True,
                    'status': user.status,
                    'username': user.username,
                    'name': user.name,
                    'is_approved': user.is_approved()
                })
            else:
                return jsonify({
                    'authenticated': True,
                    'status': 'not_found'
                })
        else:
            return jsonify({
                'authenticated': True,
                'status': 'approved',  # Fallback: 데이터베이스 없으면 승인된 것으로 처리
                'is_approved': True
            })

    except Exception as e:
        logger.error(f"Failed to get user status: {str(e)}")
        return jsonify({
            'authenticated': True,
            'status': 'error',
            'error': '상태 확인에 실패했습니다'
        }), 500

@approval_bp.route('/stats', methods=['GET'])
@login_required
def get_approval_stats():
    """승인 통계"""
    if not is_admin():
        return jsonify({'error': '관리자 권한이 필요합니다'}), 403

    try:
        if DBUser and db_manager:
            # 임시 통계 (실제 구현 시 DB에서 계산)
            stats = {
                'pending': 0,
                'approved': 1,  # 관리자는 항상 approved
                'rejected': 0,
                'total': 1
            }

            # 실제 구현 시 DB 쿼리로 통계 계산
            # with sqlite3.connect(db_manager.db_path) as conn:
            #     cursor = conn.cursor()
            #     cursor.execute('SELECT status, COUNT(*) FROM users GROUP BY status')
            #     for status, count in cursor.fetchall():
            #         stats[status] = count

            return jsonify({
                'success': True,
                'stats': stats
            })
        else:
            return jsonify({
                'success': True,
                'stats': {
                    'pending': 0,
                    'approved': 1,
                    'rejected': 0,
                    'total': 1
                }
            })

    except Exception as e:
        logger.error(f"Failed to get approval stats: {str(e)}")
        return jsonify({
            'success': False,
            'error': '통계를 가져오는데 실패했습니다'
        }), 500