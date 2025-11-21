from flask import Blueprint, request, jsonify
import json
from datetime import datetime, timedelta
import uuid
import threading
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.date import DateTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
import atexit
import os

scheduler_bp = Blueprint('scheduler', __name__)

# 로깅 설정
logging.basicConfig()
logging.getLogger('apscheduler').setLevel(logging.INFO)

# APScheduler 설정
jobstores = {
    'default': SQLAlchemyJobStore(url='sqlite:///jobs.sqlite')
}
executors = {
    'default': ThreadPoolExecutor(20)
}
job_defaults = {
    'coalesce': False,
    'max_instances': 3
}

# 백그라운드 스케줄러 초기화
scheduler = BackgroundScheduler(
    jobstores=jobstores,
    executors=executors,
    job_defaults=job_defaults,
    timezone='Asia/Seoul'
)

# 스케줄링된 작업 저장 (메모리)
SCHEDULED_CONTENT = []
SCHEDULING_HISTORY = []

def init_scheduler():
    """스케줄러 초기화"""
    try:
        scheduler.start()
        atexit.register(lambda: scheduler.shutdown())
        print("✅ APScheduler started successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to start APScheduler: {e}")
        return False

@scheduler_bp.route('/health', methods=['GET'])
def scheduler_health():
    """스케줄러 상태 확인"""
    try:
        jobs = scheduler.get_jobs()
        return jsonify({
            'success': True,
            'scheduler_running': scheduler.running,
            'total_jobs': len(jobs),
            'next_job_time': str(scheduler.get_jobs()[0].next_run_time) if jobs else None
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@scheduler_bp.route('/schedule', methods=['POST'])
def schedule_content():
    """콘텐츠 발행 스케줄링"""
    try:
        data = request.get_json()

        required_fields = ['title', 'content', 'platform', 'schedule_type']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # 스케줄 ID 생성
        schedule_id = str(uuid.uuid4())

        # 스케줄링 정보 설정
        schedule_info = {
            'id': schedule_id,
            'title': data['title'],
            'content': data['content'],
            'platform': data['platform'],
            'schedule_type': data['schedule_type'],
            'auth_data': data.get('auth_data', {}),
            'media_urls': data.get('media_urls', []),
            'hashtags': data.get('hashtags', []),
            'tags': data.get('tags', []),
            'status': 'scheduled',
            'created_at': datetime.now().isoformat(),
            'created_by': data.get('created_by', 'user')
        }

        # 트리거 설정
        trigger = None
        schedule_config = data.get('schedule_config', {})

        if data['schedule_type'] == 'once':
            # 1회 발행
            schedule_time = data.get('schedule_time')
            if not schedule_time:
                return jsonify({'error': 'schedule_time is required for one-time scheduling'}), 400

            schedule_time_dt = datetime.fromisoformat(schedule_time.replace('Z', '+00:00'))
            if schedule_time_dt <= datetime.now():
                return jsonify({'error': 'Schedule time must be in the future'}), 400

            trigger = DateTrigger(run_date=schedule_time_dt)
            schedule_info['schedule_time'] = schedule_time

        elif data['schedule_type'] == 'daily':
            # 매일 반복
            hour = schedule_config.get('hour', 9)
            minute = schedule_config.get('minute', 0)
            trigger = CronTrigger(hour=hour, minute=minute)
            schedule_info['schedule_config'] = schedule_config

        elif data['schedule_type'] == 'weekly':
            # 매주 반복
            day_of_week = schedule_config.get('day_of_week', 0)  # 0=월요일
            hour = schedule_config.get('hour', 9)
            minute = schedule_config.get('minute', 0)
            trigger = CronTrigger(day_of_week=day_of_week, hour=hour, minute=minute)
            schedule_info['schedule_config'] = schedule_config

        elif data['schedule_type'] == 'monthly':
            # 매월 반복
            day = schedule_config.get('day', 1)
            hour = schedule_config.get('hour', 9)
            minute = schedule_config.get('minute', 0)
            trigger = CronTrigger(day=day, hour=hour, minute=minute)
            schedule_info['schedule_config'] = schedule_config

        elif data['schedule_type'] == 'interval':
            # 간격 반복
            minutes = schedule_config.get('minutes', 60)
            trigger = IntervalTrigger(minutes=minutes)
            schedule_info['schedule_config'] = schedule_config

        else:
            return jsonify({'error': f'Unsupported schedule type: {data["schedule_type"]}'}), 400

        # 작업 추가
        scheduler.add_job(
            func=publish_scheduled_content,
            trigger=trigger,
            args=[schedule_info],
            id=schedule_id,
            name=f"Publish {data['title']} to {data['platform']}",
            replace_existing=True
        )

        # 스케줄링 목록에 추가
        SCHEDULED_CONTENT.append(schedule_info)

        return jsonify({
            'success': True,
            'schedule_id': schedule_id,
            'message': 'Content scheduled successfully',
            'schedule_info': schedule_info
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scheduler_bp.route('/scheduled', methods=['GET'])
def get_scheduled_content():
    """스케줄링된 콘텐츠 목록"""
    try:
        platform = request.args.get('platform')
        status = request.args.get('status', 'scheduled')
        limit = int(request.args.get('limit', 20))

        filtered_content = SCHEDULED_CONTENT

        if platform:
            filtered_content = [c for c in filtered_content if c['platform'] == platform]

        if status != 'all':
            filtered_content = [c for c in filtered_content if c['status'] == status]

        # 최신순 정렬
        filtered_content.sort(key=lambda x: x['created_at'], reverse=True)

        return jsonify({
            'success': True,
            'scheduled_content': filtered_content[:limit],
            'total_count': len(filtered_content),
            'filters': {
                'platform': platform,
                'status': status,
                'limit': limit
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scheduler_bp.route('/schedule/<schedule_id>', methods=['DELETE'])
def cancel_schedule(schedule_id):
    """스케줄 취소"""
    try:
        # 스케줄러에서 작업 제거
        scheduler.remove_job(schedule_id)

        # 스케줄링 목록에서 상태 업데이트
        for content in SCHEDULED_CONTENT:
            if content['id'] == schedule_id:
                content['status'] = 'cancelled'
                content['cancelled_at'] = datetime.now().isoformat()
                break

        return jsonify({
            'success': True,
            'message': f'Schedule {schedule_id} cancelled'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scheduler_bp.route('/schedule/<schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    """스케줄 업데이트"""
    try:
        data = request.get_json()

        # 기존 스케줄 찾기
        schedule_info = None
        for content in SCHEDULED_CONTENT:
            if content['id'] == schedule_id:
                schedule_info = content.copy()
                break

        if not schedule_info:
            return jsonify({'error': 'Schedule not found'}), 404

        # 기존 작업 제거
        scheduler.remove_job(schedule_id)

        # 업데이트된 정보 적용
        schedule_info.update(data)

        # 새 트리거 설정
        trigger = None
        schedule_config = data.get('schedule_config', {})

        if schedule_info['schedule_type'] == 'once':
            schedule_time = data.get('schedule_time', schedule_info.get('schedule_time'))
            schedule_time_dt = datetime.fromisoformat(schedule_time.replace('Z', '+00:00'))
            trigger = DateTrigger(run_date=schedule_time_dt)

        elif schedule_info['schedule_type'] == 'daily':
            hour = schedule_config.get('hour', 9)
            minute = schedule_config.get('minute', 0)
            trigger = CronTrigger(hour=hour, minute=minute)

        elif schedule_info['schedule_type'] == 'weekly':
            day_of_week = schedule_config.get('day_of_week', 0)
            hour = schedule_config.get('hour', 9)
            minute = schedule_config.get('minute', 0)
            trigger = CronTrigger(day_of_week=day_of_week, hour=hour, minute=minute)

        elif schedule_info['schedule_type'] == 'monthly':
            day = schedule_config.get('day', 1)
            hour = schedule_config.get('hour', 9)
            minute = schedule_config.get('minute', 0)
            trigger = CronTrigger(day=day, hour=hour, minute=minute)

        # 새 작업 추가
        scheduler.add_job(
            func=publish_scheduled_content,
            trigger=trigger,
            args=[schedule_info],
            id=schedule_id,
            name=f"Publish {schedule_info['title']} to {schedule_info['platform']}",
            replace_existing=True
        )

        # 스케줄링 목록 업데이트
        for i, content in enumerate(SCHEDULED_CONTENT):
            if content['id'] == schedule_id:
                SCHEDULED_CONTENT[i] = schedule_info
                break

        return jsonify({
            'success': True,
            'message': 'Schedule updated successfully',
            'schedule_info': schedule_info
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scheduler_bp.route('/history', methods=['GET'])
def get_scheduling_history():
    """스케줄링 실행 기록"""
    try:
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))

        # 최신순 정렬
        sorted_history = sorted(SCHEDULING_HISTORY, key=lambda x: x['executed_at'], reverse=True)

        paginated_history = sorted_history[offset:offset + limit]

        return jsonify({
            'success': True,
            'history': paginated_history,
            'total_count': len(sorted_history),
            'pagination': {
                'limit': limit,
                'offset': offset,
                'has_more': offset + limit < len(sorted_history)
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scheduler_bp.route('/jobs', methods=['GET'])
def get_active_jobs():
    """활성 스케줄 작업 목록"""
    try:
        jobs = scheduler.get_jobs()
        job_list = []

        for job in jobs:
            job_list.append({
                'id': job.id,
                'name': job.name,
                'next_run_time': str(job.next_run_time) if job.next_run_time else None,
                'trigger': str(job.trigger),
                'args': job.args
            })

        return jsonify({
            'success': True,
            'jobs': job_list,
            'total_jobs': len(job_list),
            'scheduler_running': scheduler.running
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def publish_scheduled_content(schedule_info):
    """스케줄링된 콘텐츠 발행 실행"""
    try:
        from modules.publisher import publish_to_platform

        print(f"🚀 Executing scheduled content: {schedule_info['title']}")

        # 콘텐츠 발행
        content_data = {
            'title': schedule_info['title'],
            'content': schedule_info['content'],
            'media_urls': schedule_info.get('media_urls', []),
            'hashtags': schedule_info.get('hashtags', []),
            'tags': schedule_info.get('tags', []),
            'auth_data': schedule_info.get('auth_data', {})
        }

        result = publish_to_platform(schedule_info['platform'], content_data)

        # 실행 기록 저장
        execution_record = {
            'schedule_id': schedule_info['id'],
            'title': schedule_info['title'],
            'platform': schedule_info['platform'],
            'result': result,
            'executed_at': datetime.now().isoformat(),
            'execution_type': 'scheduled'
        }

        SCHEDULING_HISTORY.append(execution_record)

        # 스케줄링 상태 업데이트
        for content in SCHEDULED_CONTENT:
            if content['id'] == schedule_info['id']:
                content['status'] = 'executed'
                content['last_executed'] = datetime.now().isoformat()
                content['execution_result'] = result

                # 1회성 스케줄이면 제거
                if schedule_info.get('schedule_type') == 'once':
                    content['status'] = 'completed'
                break

        if result['success']:
            print(f"✅ Successfully published: {schedule_info['title']}")
        else:
            print(f"❌ Failed to publish: {schedule_info['title']} - {result.get('error', 'Unknown error')}")

    except Exception as e:
        print(f"❌ Error executing scheduled content: {str(e)}")

        # 오류 기록 저장
        execution_record = {
            'schedule_id': schedule_info['id'],
            'title': schedule_info['title'],
            'platform': schedule_info['platform'],
            'result': {'success': False, 'error': str(e)},
            'executed_at': datetime.now().isoformat(),
            'execution_type': 'scheduled'
        }

        SCHEDULING_HISTORY.append(execution_record)

def get_schedule_statistics():
    """스케줄링 통계"""
    try:
        total_scheduled = len(SCHEDULED_CONTENT)
        active_schedules = len([c for c in SCHEDULED_CONTENT if c['status'] == 'scheduled'])
        completed_schedules = len([c for c in SCHEDULED_CONTENT if c['status'] == 'completed'])
        cancelled_schedules = len([c for c in SCHEDULED_CONTENT if c['status'] == 'cancelled'])

        # 플랫폼별 통계
        platform_stats = {}
        for content in SCHEDULED_CONTENT:
            platform = content['platform']
            if platform not in platform_stats:
                platform_stats[platform] = {'total': 0, 'active': 0, 'completed': 0}
            platform_stats[platform]['total'] += 1
            if content['status'] == 'scheduled':
                platform_stats[platform]['active'] += 1
            elif content['status'] == 'completed':
                platform_stats[platform]['completed'] += 1

        # 스케줄 타입별 통계
        schedule_type_stats = {}
        for content in SCHEDULED_CONTENT:
            schedule_type = content['schedule_type']
            if schedule_type not in schedule_type_stats:
                schedule_type_stats[schedule_type] = 0
            schedule_type_stats[schedule_type] += 1

        return {
            'total_scheduled': total_scheduled,
            'active_schedules': active_schedules,
            'completed_schedules': completed_schedules,
            'cancelled_schedules': cancelled_schedules,
            'platform_stats': platform_stats,
            'schedule_type_stats': schedule_type_stats,
            'total_executions': len(SCHEDULING_HISTORY),
            'successful_executions': len([h for h in SCHEDULING_HISTORY if h['result'].get('success', False)])
        }

    except Exception as e:
        print(f"Error getting schedule statistics: {str(e)}")
        return {}

# 스케줄러 초기화
init_scheduler()