from flask import Blueprint, jsonify, request
from datetime import datetime
import logging
from typing import Dict, Any, Optional
from ..utils.analytics_service import AnalyticsService

# Analytics 블루프린트 생성
analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

# 로거 설정
logger = logging.getLogger(__name__)

# Analytics 서비스 인스턴스
service = AnalyticsService()

def success_response(data: Any, message: str = "Success") -> Dict[str, Any]:
    """성공 응답 포맷"""
    return {
        "status": "success",
        "message": message,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }

def error_response(message: str, status_code: int = 400) -> tuple:
    """에러 응답 포맷"""
    return {
        "status": "error",
        "message": message,
        "timestamp": datetime.now().isoformat()
    }, status_code

@analytics_bp.route('/overview', methods=['GET'])
def overview():
    """대시보드 개요 데이터 조회 - 요구사항 맞춤 간단 버전"""
    return jsonify(service.get_overview())

@analytics_bp.route('/trend-correlation', methods=['GET'])
def correlation():
    """키워드 트렌드 상관관계 데이터 조회 - 요구사항 맞춤"""
    return jsonify(service.get_keyword_correlation())

@analytics_bp.route('/publishing-trend', methods=['GET'])
def trend():
    """발행량 트렌드 데이터 조회 - 요구사항 맞춤"""
    return jsonify(service.get_publishing_trend())

@analytics_bp.route('/overview-detailed', methods=['GET'])
def get_overview():
    """
    대시보드 개요 데이터 조회 (상세 버전)
    """
    try:
        overview_data = service.get_overview()

        logger.info(f"Overview data retrieved successfully")
        return success_response(overview_data, "대시보드 개요 데이터 조회 성공")

    except Exception as e:
        logger.error(f"Error retrieving overview data: {str(e)}")
        return error_response("대시보드 개요 데이터 조회 중 오류가 발생했습니다", 500)

@analytics_bp.route('/publishing-trends', methods=['GET'])
def get_publishing_trends():
    """
    플랫폼별 발행량 트렌드 데이터 조회
    """
    try:
        # 쿼리 파라미터
        days = request.args.get('days', 30, type=int)

        # 파라미터 검증
        if days < 1 or days > 365:
            return error_response("조회 기간은 1일에서 365일 사이여야 합니다", 400)

        trends_data = analytics_service.get_publishing_trends(days=days)

        logger.info(f"Publishing trends data retrieved for {days} days")
        return success_response(trends_data, f"{days}일간 발행량 트렌드 데이터 조회 성공")

    except Exception as e:
        logger.error(f"Error retrieving publishing trends: {str(e)}")
        return error_response("발행량 트렌드 데이터 조회 중 오류가 발생했습니다", 500)

@analytics_bp.route('/content-performance', methods=['GET'])
def get_content_performance():
    """
    콘텐츠별 성과 데이터 조회
    """
    try:
        # 쿼리 파라미터
        content_type = request.args.get('type', 'all')  # blog, social, video, all
        limit = request.args.get('limit', 50, type=int)

        # 파라미터 검증
        valid_types = ['all', 'blog', 'social', 'video']
        if content_type not in valid_types:
            return error_response("유효하지 않은 콘텐츠 타입입니다", 400)

        if limit < 1 or limit > 100:
            return error_response("조회 개수는 1에서 100 사이여야 합니다", 400)

        performance_data = analytics_service.get_content_performance(
            content_type=content_type,
            limit=limit
        )

        logger.info(f"Content performance data retrieved - Type: {content_type}, Limit: {limit}")
        return success_response(
            performance_data,
            f"콘텐츠 성과 데이터 조회 성공 (타입: {content_type}, 개수: {len(performance_data)})"
        )

    except Exception as e:
        logger.error(f"Error retrieving content performance: {str(e)}")
        return error_response("콘텐츠 성과 데이터 조회 중 오류가 발생했습니다", 500)

@analytics_bp.route('/keyword-performance', methods=['GET'])
def get_keyword_performance():
    """
    키워드별 성과 데이터 조회
    """
    try:
        # 쿼리 파라미터
        limit = request.args.get('limit', 20, type=int)

        # 파라미터 검증
        if limit < 1 or limit > 50:
            return error_response("조회 개수는 1에서 50 사이여야 합니다", 400)

        keyword_data = analytics_service.get_keyword_performance(limit=limit)

        logger.info(f"Keyword performance data retrieved for {len(keyword_data)} keywords")
        return success_response(
            keyword_data,
            f"키워드 성과 데이터 조회 성공 (개수: {len(keyword_data)})"
        )

    except Exception as e:
        logger.error(f"Error retrieving keyword performance: {str(e)}")
        return error_response("키워드 성과 데이터 조회 중 오류가 발생했습니다", 500)

@analytics_bp.route('/platform-comparison', methods=['GET'])
def get_platform_comparison():
    """
    플랫폼별 성과 비교 데이터 조회
    """
    try:
        platform_data = analytics_service.get_platform_comparison()

        logger.info(f"Platform comparison data retrieved for {len(platform_data)} platforms")
        return success_response(platform_data, "플랫폼별 성과 비교 데이터 조회 성공")

    except Exception as e:
        logger.error(f"Error retrieving platform comparison: {str(e)}")
        return error_response("플랫폼별 성과 비교 데이터 조회 중 오류가 발생했습니다", 500)

@analytics_bp.route('/time-analytics', methods=['GET'])
def get_time_analytics():
    """
    시간대별/요일별 분석 데이터 조회
    """
    try:
        # 쿼리 파라미터
        period = request.args.get('period', 'week')  # week, month

        # 파라미터 검증
        valid_periods = ['week', 'month']
        if period not in valid_periods:
            return error_response("유효하지 않은 분석 기간입니다", 400)

        time_data = analytics_service.get_time_based_analytics(period=period)

        logger.info(f"Time analytics data retrieved for period: {period}")
        return success_response(time_data, "시간대별 분석 데이터 조회 성공")

    except Exception as e:
        logger.error(f"Error retrieving time analytics: {str(e)}")
        return error_response("시간대별 분석 데이터 조회 중 오류가 발생했습니다", 500)

@analytics_bp.route('/roi-analysis', methods=['GET'])
def get_roi_analysis():
    """
    ROI 및 비용 효율성 분석 데이터 조회
    """
    try:
        roi_data = analytics_service.get_roi_analysis()

        logger.info("ROI analysis data retrieved successfully")
        return success_response(roi_data, "ROI 분석 데이터 조회 성공")

    except Exception as e:
        logger.error(f"Error retrieving ROI analysis: {str(e)}")
        return error_response("ROI 분석 데이터 조회 중 오류가 발생했습니다", 500)

@analytics_bp.route('/report', methods=['GET', 'POST'])
def generate_report():
    """
    분석 리포트 생성

    GET: 기본 월간 리포트 생성
    POST: 커스텀 리포트 생성
    """
    try:
        if request.method == 'GET':
            # 기본 월간 리포트
            report_data = analytics_service.generate_report(report_type="monthly")

            logger.info("Monthly report generated successfully")
            return success_response(report_data, "월간 분석 리포트 생성 성공")

        elif request.method == 'POST':
            # 커스텀 리포트
            data = request.get_json()

            if not data:
                return error_response("리포트 생성 파라미터가 필요합니다", 400)

            report_type = data.get('report_type', 'monthly')
            start_date = data.get('start_date')
            end_date = data.get('end_date')

            # 파라미터 검증
            valid_types = ['daily', 'weekly', 'monthly', 'custom']
            if report_type not in valid_types:
                return error_response("유효하지 않은 리포트 타입입니다", 400)

            if start_date:
                try:
                    datetime.strptime(start_date, '%Y-%m-%d')
                except ValueError:
                    return error_response("시작일 날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)", 400)

            if end_date:
                try:
                    datetime.strptime(end_date, '%Y-%m-%d')
                except ValueError:
                    return error_response("종료일 날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)", 400)

            report_data = analytics_service.generate_report(
                report_type=report_type,
                start_date=start_date,
                end_date=end_date
            )

            logger.info(f"Custom report generated - Type: {report_type}, Period: {start_date} ~ {end_date}")
            return success_response(report_data, "커스텀 분석 리포트 생성 성공")

    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        return error_response("리포트 생성 중 오류가 발생했습니다", 500)

@analytics_bp.route('/export', methods=['POST'])
def export_analytics():
    """
    분석 데이터 내보내기 (CSV, Excel 등)
    """
    try:
        data = request.get_json()

        if not data or 'data_type' not in data:
            return error_response("내보낼 데이터 타입이 필요합니다", 400)

        data_type = data['data_type']
        export_format = data.get('format', 'json')  # json, csv, excel

        # 파라미터 검증
        valid_types = ['overview', 'trends', 'content', 'keywords', 'platforms', 'roi']
        valid_formats = ['json', 'csv', 'excel']

        if data_type not in valid_types:
            return error_response("유효하지 않은 데이터 타입입니다", 400)

        if export_format not in valid_formats:
            return error_response("유효하지 않은 내보내기 형식입니다", 400)

        # 데이터 조회
        export_data = {}

        if data_type == 'overview':
            export_data = analytics_service.get_overview()
        elif data_type == 'trends':
            days = data.get('days', 30)
            export_data = analytics_service.get_publishing_trends(days=days)
        elif data_type == 'content':
            content_type = data.get('type', 'all')
            limit = data.get('limit', 50)
            export_data = analytics_service.get_content_performance(content_type, limit)
        elif data_type == 'keywords':
            limit = data.get('limit', 20)
            export_data = analytics_service.get_keyword_performance(limit)
        elif data_type == 'platforms':
            export_data = analytics_service.get_platform_comparison()
        elif data_type == 'roi':
            export_data = analytics_service.get_roi_analysis()

        # 내보내기 형식에 따른 처리
        if export_format == 'json':
            response_data = export_data
        elif export_format == 'csv':
            # CSV 형식 변환 (여기서는 기본 구조만 반환)
            response_data = {
                "message": "CSV 내보내기 기능은 개발 중입니다",
                "preview": export_data
            }
        elif export_format == 'excel':
            # Excel 형식 변환 (여기서는 기본 구조만 반환)
            response_data = {
                "message": "Excel 내보내기 기능은 개발 중입니다",
                "preview": export_data
            }

        logger.info(f"Analytics data exported - Type: {data_type}, Format: {export_format}")
        return success_response(
            response_data,
            f"분석 데이터 내보내기 성공 (타입: {data_type}, 형식: {export_format})"
        )

    except Exception as e:
        logger.error(f"Error exporting analytics: {str(e)}")
        return error_response("분석 데이터 내보내기 중 오류가 발생했습니다", 500)

@analytics_bp.route('/health', methods=['GET'])
def health_check():
    """
    Analytics API 헬스체크
    """
    try:
        health_status = {
            "status": "healthy",
            "service": "Analytics API",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
            "endpoints": [
                "/api/analytics/overview",
                "/api/analytics/publishing-trends",
                "/api/analytics/content-performance",
                "/api/analytics/keyword-performance",
                "/api/analytics/platform-comparison",
                "/api/analytics/time-analytics",
                "/api/analytics/roi-analysis",
                "/api/analytics/report",
                "/api/analytics/export"
            ]
        }

        return success_response(health_status, "Analytics API 정상 작동 중")

    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return error_response("Analytics API 헬스체크 실패", 500)

# 에러 핸들러
@analytics_bp.errorhandler(404)
def not_found(error):
    return error_response("요청한 엔드포인트를 찾을 수 없습니다", 404)

@analytics_bp.errorhandler(500)
def internal_error(error):
    return error_response("서버 내부 오류가 발생했습니다", 500)

@analytics_bp.errorhandler(429)
def ratelimit_handler(e):
    return error_response("요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요", 429)