"""
관리자 패널 API 라우트
사용자 관리, 통계 데이터, 시스템 모니터링
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import logging
import random
import sys
import os

# utils 디렉토리를 Python path에 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

try:
    from utils.analytics_service import AnalyticsService
except ImportError:
    # Fallback if analytics service not available
    AnalyticsService = None
    print("Warning: AnalyticsService not available, using fallback functionality")

# Admin 블루프린트 생성
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# 로거 설정
logger = logging.getLogger(__name__)

@admin_bp.route('/stats', methods=['GET'])
def get_system_stats():
    """
    시스템 통계 정보 반환
    """
    try:
        # 임시 통계 데이터 (실제 구현 시 DB에서 가져오기)
        stats = {
            'total_users': 127,
            'active_users': 89,
            'total_content': 892,
            'total_images': 2341,
            'daily_generations': random.randint(20, 50),
            'storage_used': '2.4GB',
            'storage_total': '20GB',
            'avg_response_time': '1.2s',
            'system_uptime': '99.9%',
            'api_status': {
                'gemini': 'active',
                'vertex_ai': 'active',
                'webdav': 'active'
            },
            'last_updated': datetime.now().isoformat()
        }

        return jsonify({
            'success': True,
            'data': stats
        })

    except Exception as e:
        logger.error(f"Failed to get system stats: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch system statistics'
        }), 500

@admin_bp.route('/users', methods=['GET'])
def get_users():
    """
    사용자 목록 반환
    """
    try:
        # 쿼리 파라미터
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', 'all')  # active, inactive, all

        # 임시 사용자 데이터 (실제 구현 시 DB에서 가져오기)
        users = [
            {
                'id': 'user001',
                'name': '김민준',
                'email': 'kim@example.com',
                'join_date': '2024-01-15',
                'last_active': '2024-01-21',
                'content_count': 45,
                'image_count': 128,
                'status': 'active',
                'plan': 'pro'
            },
            {
                'id': 'user002',
                'name': '이서연',
                'email': 'lee@example.com',
                'join_date': '2024-01-18',
                'last_active': '2024-01-20',
                'content_count': 23,
                'image_count': 67,
                'status': 'active',
                'plan': 'basic'
            },
            {
                'id': 'user003',
                'name': '박준호',
                'email': 'park@example.com',
                'join_date': '2024-01-22',
                'last_active': '2024-01-19',
                'content_count': 67,
                'image_count': 234,
                'status': 'active',
                'plan': 'pro'
            },
            {
                'id': 'user004',
                'name': '정지우',
                'email': 'jung@example.com',
                'join_date': '2024-02-01',
                'last_active': '2024-01-10',
                'content_count': 12,
                'image_count': 34,
                'status': 'inactive',
                'plan': 'basic'
            },
            {
                'id': 'user005',
                'name': '최현우',
                'email': 'choi@example.com',
                'join_date': '2024-02-05',
                'last_active': '2024-01-21',
                'content_count': 89,
                'image_count': 456,
                'status': 'active',
                'plan': 'enterprise'
            }
        ]

        # 필터링
        if status != 'all':
            users = [u for u in users if u['status'] == status]

        # 페이지네이션
        total = len(users)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_users = users[start:end]

        return jsonify({
            'success': True,
            'data': {
                'users': paginated_users,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': total,
                    'pages': (total + per_page - 1) // per_page
                }
            }
        })

    except Exception as e:
        logger.error(f"Failed to get users: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch users'
        }), 500

@admin_bp.route('/content-analytics', methods=['GET'])
def get_content_analytics():
    """
    콘텐츠 분석 데이터 반환
    """
    try:
        period = request.args.get('period', '7d')  # 7d, 30d, 90d

        # 임시 분석 데이터
        analytics = {
            'daily_generation': {
                'labels': ['월', '화', '수', '목', '금', '토', '일'],
                'data': [12, 19, 23, 17, 29, 33, 21]
            },
            'topic_distribution': {
                'labels': ['음식', '여행', 'IT', '패션', '건강', '기타'],
                'data': [35, 25, 15, 12, 8, 5]
            },
            'content_types': {
                'blog': 456,
                'social': 234,
                'email': 123,
                'other': 79
            },
            'quality_metrics': {
                'avg_word_count': 2156,
                'avg_image_count': 2.3,
                'user_satisfaction': 4.7
            }
        }

        return jsonify({
            'success': True,
            'data': analytics,
            'period': period
        })

    except Exception as e:
        logger.error(f"Failed to get content analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch content analytics'
        }), 500

@admin_bp.route('/system-health', methods=['GET'])
def get_system_health():
    """
    시스템 상태 정보 반환
    """
    try:
        # 서비스 상태 확인
        health_checks = {
            'gemini_api': {
                'status': 'healthy',
                'response_time_ms': 120,
                'last_check': datetime.now().isoformat()
            },
            'vertex_ai': {
                'status': 'healthy',
                'response_time_ms': 890,
                'last_check': datetime.now().isoformat()
            },
            'webdav_storage': {
                'status': 'healthy',
                'response_time_ms': 230,
                'last_check': datetime.now().isoformat()
            },
            'database': {
                'status': 'healthy',
                'response_time_ms': 45,
                'last_check': datetime.now().isoformat()
            }
        }

        # 전체 상태 계산
        all_healthy = all(check['status'] == 'healthy' for check in health_checks.values())
        overall_status = 'healthy' if all_healthy else 'degraded'

        return jsonify({
            'success': True,
            'data': {
                'overall_status': overall_status,
                'uptime_percentage': 99.9,
                'checks': health_checks,
                'last_updated': datetime.now().isoformat()
            }
        })

    except Exception as e:
        logger.error(f"Failed to get system health: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch system health'
        }), 500

@admin_bp.route('/user/<string:user_id>', methods=['GET'])
def get_user_details(user_id):
    """
    특정 사용자 상세 정보 반환
    """
    try:
        # 임시 사용자 상세 정보
        user_details = {
            'id': user_id,
            'name': '김민준',
            'email': 'kim@example.com',
            'join_date': '2024-01-15',
            'last_active': '2024-01-21',
            'status': 'active',
            'plan': 'pro',
            'statistics': {
                'content_count': 45,
                'image_count': 128,
                'total_generation_time': '3.2h',
                'avg_generation_time': '4.3s'
            },
            'recent_activity': [
                {
                    'type': 'content_generation',
                    'topic': '국보국밥 맛집',
                    'timestamp': '2024-01-21T14:30:00Z',
                    'status': 'success'
                },
                {
                    'type': 'content_edit',
                    'topic': '국보국밥 맛집',
                    'timestamp': '2024-01-21T14:35:00Z',
                    'status': 'success'
                }
            ]
        }

        return jsonify({
            'success': True,
            'data': user_details
        })

    except Exception as e:
        logger.error(f"Failed to get user details: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch user details'
        }), 500

@admin_bp.route('/logs', methods=['GET'])
def get_system_logs():
    """
    시스템 로그 반환
    """
    try:
        level = request.args.get('level', 'info')  # info, warning, error
        limit = request.args.get('limit', 50, type=int)

        # 임시 로그 데이터
        logs = [
            {
                'timestamp': '2024-01-21T14:30:15Z',
                'level': 'info',
                'message': 'Content generation completed successfully',
                'user_id': 'user001',
                'metadata': {'topic': '국보국밥 맛집', 'duration': '4.2s'}
            },
            {
                'timestamp': '2024-01-21T14:25:32Z',
                'level': 'warning',
                'message': 'Image generation retry required',
                'user_id': 'user002',
                'metadata': {'retry_count': 1, 'reason': 'timeout'}
            },
            {
                'timestamp': '2024-01-21T14:20:45Z',
                'level': 'error',
                'message': 'API rate limit exceeded',
                'user_id': None,
                'metadata': {'service': 'vertex_ai', 'limit': 100}
            }
        ]

        # 필터링
        if level != 'all':
            logs = [log for log in logs if log['level'] == level]

        # 제한
        logs = logs[:limit]

        return jsonify({
            'success': True,
            'data': {
                'logs': logs,
                'total_count': len(logs)
            }
        })

    except Exception as e:
        logger.error(f"Failed to get system logs: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch system logs'
        }), 500