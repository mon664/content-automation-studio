from datetime import datetime, timedelta
import random
import json
from typing import Dict, List, Any, Optional

class AnalyticsService:
    """성과 분석 서비스 - 콘텐츠 성과 데이터 집계 및 분석"""

    def __init__(self):
        self.platforms = ['naver', 'tistory', 'instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'wordpress', 'blogger']

    def get_overview(self) -> Dict[str, Any]:
        """대시보드 상단 요약 카드 데이터"""
        return {
            "total_posts": 128,
            "total_views": 15420,
            "avg_engagement": "4.2%",
            "growth_rate": "+12.5%",
            "platform_breakdown": {
                "naver": 45,
                "tistory": 30,
                "instagram": 53
            }
        }

    def get_publishing_trends(self, days: int = 30) -> List[Dict[str, Any]]:
        """
        플랫폼별 일별 발행량 트렌드 데이터

        Args:
            days: 조회할 일수

        Returns:
            날짜별 플랫폼 발행량 데이터 리스트
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        trends = []
        current_date = start_date

        while current_date <= end_date:
            # 주말에는 발행량 감소 시뮬레이션
            weekday_multiplier = 0.6 if current_date.weekday() >= 5 else 1.0

            daily_data = {
                "date": current_date.strftime("%Y-%m-%d"),
                "naver": int(random.randint(2, 5) * weekday_multiplier),
                "tistory": int(random.randint(1, 3) * weekday_multiplier),
                "instagram": int(random.randint(3, 8) * weekday_multiplier),
                "facebook": int(random.randint(1, 4) * weekday_multiplier),
                "youtube": int(random.randint(0, 2) * weekday_multiplier),
                "total": 0
            }

            # 총계 계산
            daily_data["total"] = sum([
                daily_data["naver"] + daily_data["tistory"] +
                daily_data["instagram"] + daily_data["facebook"] +
                daily_data["youtube"]
            ])

            trends.append(daily_data)
            current_date += timedelta(days=1)

        return trends

    def get_content_performance(self, content_type: str = "all", limit: int = 50) -> List[Dict[str, Any]]:
        """
        콘텐츠별 성과 데이터

        Args:
            content_type: 콘텐츠 타입 필터 (blog, social, video, all)
            limit: 반환할 데이터 수

        Returns:
            콘텐츠 성과 데이터 리스트
        """
        contents = []

        # 더미 콘텐츠 데이터 생성
        for i in range(limit):
            content = {
                "id": f"content_{i+1}",
                "title": f"최고의 AI 마케팅 전략 {i+1}: 2024년 트렌드 분석",
                "type": random.choice(["blog", "instagram", "youtube", "facebook"]),
                "platform": random.choice(self.platforms),
                "published_date": (datetime.now() - timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d"),
                "views": random.randint(100, 5000),
                "likes": random.randint(10, 500),
                "shares": random.randint(5, 100),
                "comments": random.randint(0, 50),
                "clicks": random.randint(20, 200),
                "engagement_rate": round(random.uniform(1.0, 8.5), 2),
                "keywords": [f"키워드{i+1}", "AI마케팅", "콘텐츠전략", "디지털마케팅"],
                "performance_score": random.randint(60, 100)
            }

            # 타입 필터 적용
            if content_type != "all":
                if content_type == "blog" and content["type"] not in ["blog"]:
                    continue
                elif content_type == "social" and content["type"] not in ["instagram", "facebook", "twitter"]:
                    continue
                elif content_type == "video" and content["type"] not in ["youtube"]:
                    continue

            contents.append(content)

        # 성과 점수순 정렬
        contents.sort(key=lambda x: x["performance_score"], reverse=True)
        return contents[:limit]

    def get_publishing_trend(self) -> Dict[str, Any]:
        """월별 발행량 추이 그래프 데이터 - 요구사항에 맞춤"""
        months = [(datetime.now() - timedelta(days=30*i)).strftime("%m월") for i in range(5, -1, -1)]
        return {
            "labels": months,
            "datasets": [
                {
                    "label": "발행 건수",
                    "data": [12, 19, 15, 25, 22, 30],  # DB에서 집계할 값
                    "borderColor": "#4F46E5",
                    "tension": 0.4
                }
            ]
        }

    def get_keyword_correlation(self) -> Dict[str, Any]:
        """키워드 트렌드 점수 vs 실제 조회수 상관관계 - 요구사항에 맞춤"""
        # Google Trends API 점수와 실제 콘텐츠 조회수 매핑
        return {
            "datasets": [{
                "label": "키워드 효율",
                "data": [
                    {"x": 80, "y": 1200, "keyword": "AI 글쓰기"},  # x: 트렌드 점수, y: 조회수
                    {"x": 65, "y": 800, "keyword": "부업 추천"},
                    {"x": 90, "y": 2500, "keyword": "Chat GPT"},
                    {"x": 40, "y": 300, "keyword": "맛집 리뷰"}
                ]
            }]
        }

    def get_keyword_performance(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        키워드별 성과 분석 데이터

        Args:
            limit: 반환할 키워드 수

        Returns:
            키워드 성과 데이터 리스트
        """
        keywords = []

        # 인기 마케팅 키워드 리스트
        popular_keywords = [
            "AI마케팅", "콘텐츠마케팅", "디지털마케팅", "소셜미디어마케팅",
            "인플루언서마케팅", "검색엔진최적화", "이메일마케팅", "영상마케팅",
            "퍼포먼스마케팅", "브랜드마케팅", "데이터분석", "마케팅오토메이션",
            "개인화마케팅", "모바일마케팅", "콘텐츠제작", "스토리텔링",
            "버즈마케팅", "바이럴마케팅", "커뮤니티마케팅", "마케팅전략"
        ]

        for i, keyword in enumerate(popular_keywords[:limit]):
            keyword_data = {
                "keyword": keyword,
                "total_contents": random.randint(5, 25),
                "total_views": random.randint(1000, 15000),
                "avg_engagement": round(random.uniform(2.0, 7.5), 2),
                "conversion_rate": round(random.uniform(1.0, 5.0), 2),
                "trend_score": random.randint(40, 100),
                "competition_level": random.choice(["낮음", "중간", "높음"]),
                "cpc_estimate": random.randint(50, 500),  # CPC 추정치 (원)
                "monthly_searches": random.randint(100, 10000),
                "performance_trend": random.choice(["상승", "유지", "하락"]),
                "top_platform": random.choice(["naver", "tistory", "instagram", "youtube"]),
                "content_performance": []
            }

            # 키워드 관련 콘텐츠 성과 추가
            for j in range(random.randint(1, 5)):
                keyword_data["content_performance"].append({
                    "content_id": f"content_{i}_{j}",
                    "title": f"{keyword} 활용 전략 {j+1}",
                    "platform": random.choice(self.platforms),
                    "views": random.randint(100, 2000),
                    "engagement": round(random.uniform(1.5, 6.0), 2)
                })

            keywords.append(keyword_data)

        # 전반적인 성과순 정렬
        keywords.sort(key=lambda x: x["trend_score"], reverse=True)
        return keywords

    def get_platform_comparison(self) -> Dict[str, Any]:
        """
        플랫폼별 성과 비교 분석

        Returns:
            플랫폼별 상세 비교 데이터
        """
        platforms_data = {}

        for platform in self.platforms:
            platform_info = {
                "total_posts": random.randint(20, 100),
                "total_views": random.randint(2000, 20000),
                "avg_engagement": round(random.uniform(2.0, 8.0), 2),
                "best_posting_time": f"{random.randint(9, 21)}:00",
                "top_keywords": [
                    f"키워드{platform}_{i}" for i in range(1, 4)
                ],
                "growth_rate": f"+{random.randint(5, 25)}%",
                "content_types": {
                    "blog": random.randint(5, 30),
                    "social": random.randint(10, 50),
                    "video": random.randint(0, 20)
                },
                "monthly_trend": []
            }

            # 월별 트렌드 데이터 (6개월)
            for month_offset in range(5, -1, -1):
                month_date = datetime.now().replace(day=1) - timedelta(days=month_offset * 30)
                platform_info["monthly_trend"].append({
                    "month": month_date.strftime("%Y-%m"),
                    "posts": random.randint(2, 15),
                    "views": random.randint(200, 2000),
                    "engagement": round(random.uniform(2.0, 8.0), 2)
                })

            platforms_data[platform] = platform_info

        return platforms_data

    def get_time_based_analytics(self, period: str = "week") -> Dict[str, Any]:
        """
        시간대별/요일별 분석 데이터

        Args:
            period: 분석 기간 (week, month)

        Returns:
            시간대별, 요일별 최적 발행 시간 분석 데이터
        """

        # 요일별 성과 데이터 (월요일=0)
        weekly_performance = []
        for day in range(7):
            day_names = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"]
            weekly_performance.append({
                "day": day_names[day],
                "day_index": day,
                "avg_views": random.randint(500, 2000),
                "avg_engagement": round(random.uniform(2.5, 6.5), 2),
                "best_time": f"{random.randint(9, 21)}:00",
                "post_count": random.randint(5, 25)
            })

        # 시간대별 성과 데이터
        hourly_performance = []
        for hour in range(24):
            hourly_performance.append({
                "hour": hour,
                "time_str": f"{hour:02d}:00",
                "avg_views": random.randint(100, 800),
                "avg_engagement": round(random.uniform(1.5, 7.5), 2),
                "optimal_for": random.choice(["blog", "social", "video", "all"]),
                "user_activity": random.randint(10, 100)  # 사용자 활동 지수
            })

        return {
            "weekly_performance": weekly_performance,
            "hourly_performance": hourly_performance,
            "best_posting_day": "수요일",
            "best_posting_time": "14:00",
            "recommendations": [
                "수요일, 목요일 오후 2시-4시가 콘텐츠 발행 최적 시간입니다",
                "인스타그램은 퇴근 시간대(오후 6-8시) 참여도가 높습니다",
                "블로그 콘텐츠는 오전 9-11시에 발행하는 것을 추천합니다"
            ]
        }

    def get_roi_analysis(self) -> Dict[str, Any]:
        """
        ROI 및 비용 효율성 분석

        Returns:
            투자 대비 수익성 분석 데이터
        """
        return {
            "total_investment": 2500000,  # 총 투자 비용 (원)
            "estimated_value": 8750000,   # 추정 가치 (원)
            "roi_percentage": 250,        # ROI (%)
            "cost_per_content": 19531,    # 콘텐츠당 제작 비용
            "value_per_content": 68359,   # 콘텐츠당 가치
            "break_even_point": "3.6개월",  # 손익분기점
            "monthly_savings": 1500000,   # 월별 절감 비용
            "time_savings": "월 40시간",   # 시간 절감
            "platform_roi": {
                "naver": {"investment": 800000, "value": 3200000, "roi": 300},
                "tistory": {"investment": 400000, "value": 1200000, "roi": 200},
                "instagram": {"investment": 600000, "value": 1800000, "roi": 200},
                "youtube": {"investment": 700000, "value": 2550000, "roi": 264}
            },
            "content_type_roi": {
                "blog_posts": {"cost": 15000, "value": 75000, "roi": 400},
                "social_media": {"cost": 8000, "value": 32000, "roi": 300},
                "video_content": {"cost": 45000, "value": 180000, "roi": 300}
            }
        }

    def generate_report(self, report_type: str = "monthly", start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, Any]:
        """
        분석 리포트 생성

        Args:
            report_type: 리포트 타입 (daily, weekly, monthly, custom)
            start_date: 시작일 (YYYY-MM-DD)
            end_date: 종료일 (YYYY-MM-DD)

        Returns:
            종합 분석 리포트 데이터
        """

        # 기간 설정
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")

        report = {
            "report_type": report_type,
            "period": f"{start_date} ~ {end_date}",
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "overview": self.get_overview(),
            "publishing_trends": self.get_publishing_trends(days=30),
            "content_performance": self.get_content_performance(limit=20),
            "keyword_performance": self.get_keyword_performance(limit=15),
            "platform_comparison": self.get_platform_comparison(),
            "time_analytics": self.get_time_based_analytics(),
            "roi_analysis": self.get_roi_analysis(),
            "insights": self._generate_insights(),
            "recommendations": self._generate_recommendations()
        }

        return report

    def _generate_insights(self) -> List[str]:
        """자동 생성되는 인사이트"""
        return [
            "인스타그램 콘텐츠의 평균 참여율이 다른 플랫폼보다 32% 높습니다",
            "'AI마케팅' 키워드 관련 콘텐츠가 전체 조회수의 25%를 차지합니다",
            "수요일 오후 2시 발행 콘텐츠가 평균보다 1.8배 높은 성과를 보입니다",
            "동영상 콘텐츠의 평균 체류시간은 텍스트의 3배 이상입니다",
            "주말 발행 콘텐츠보다 주중 발행 콘텐츠의 전환율이 45% 높습니다"
        ]

    def _generate_recommendations(self) -> List[str]:
        """자동 생성되는 권장사항"""
        return [
            "성과가 높은 'AI마케팅' 키워드를 중심으로 콘텐츠 시리즈를 기획하세요",
            "인스타그램 발행을 늘리고, 티스토리 발행을 오후 시간대로 조정하세요",
            "동영상 콘텐츠 제작 비중을 20%에서 35%로 늘릴 것을 권장합니다",
            "수요일, 목요일 오후 2-4시 발행을 최우선으로 고려하세요",
            "월간 콘텐츠 제작 수를 15% 늘리면 6개월 내 ROI가 50% 향상될 것으로 예상됩니다"
        ]