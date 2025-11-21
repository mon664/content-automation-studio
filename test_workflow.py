"""
Content Automation Studio 워크플로우 테스트
Step 3C: 전체 워크플로우 엔드투엔드 테스트
"""

import requests
import json
import time
import os
from datetime import datetime

class WorkflowTester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []

    def log_test(self, test_name, success, details=""):
        """테스트 결과 기록"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")

    def test_system_health(self):
        """시스템 상태 점검"""
        try:
            response = self.session.get(f"{self.base_url}/api/health")
            success = response.status_code == 200
            data = response.json() if success else None
            self.log_test(
                "System Health Check",
                success,
                f"Status: {response.status_code}" + (f", Services: {data.get('services', {})}" if data else "")
            )
            return success
        except Exception as e:
            self.log_test("System Health Check", False, str(e))
            return False

    def test_api_endpoints(self):
        """API 엔드포인트 테스트"""
        endpoints = [
            "/api",
            "/api/health",
            "/api/content/generate-blog",
            "/api/editor/upload-image",
            "/api/admin/stats",
            "/api/analytics/overview"
        ]

        for endpoint in endpoints:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}")
                # POST 엔드포인트는 OPTIONS로 테스트
                if endpoint in ["/api/content/generate-blog", "/api/editor/upload-image"]:
                    response = self.session.options(f"{self.base_url}{endpoint}")

                success = response.status_code in [200, 405]  # 405 = Method not allowed (정상)
                self.log_test(
                    f"API Endpoint: {endpoint}",
                    success,
                    f"Status: {response.status_code}"
                )
            except Exception as e:
                self.log_test(f"API Endpoint: {endpoint}", False, str(e))

    def test_content_generation(self):
        """콘텐츠 생성 테스트"""
        test_topic = "국보국밥 맛집"

        payload = {
            "topic": test_topic,
            "keywords": ["맛집", "국보국밥", "서울빵"],
            "tone": "professional",
            "length": "long",
            "target_audience": "general"
        }

        try:
            start_time = time.time()
            response = self.session.post(
                f"{self.base_url}/api/content/generate-blog",
                json=payload,
                timeout=60
            )
            generation_time = time.time() - start_time

            if response.status_code == 200:
                data = response.json()
                success = data.get('success', False)

                if success:
                    content = data.get('content', '')
                    word_count = len(content.split())
                    image_count = data.get('image_count', 0)

                    # 30초 목표 확인
                    within_time_limit = generation_time <= 35  # 약간의 여유

                    self.log_test(
                        "Content Generation",
                        success and within_time_limit,
                        f"Words: {word_count}, Images: {image_count}, Time: {generation_time:.1f}s"
                    )
                    return data
                else:
                    self.log_test(
                        "Content Generation",
                        False,
                        f"API returned failure: {data.get('error', 'Unknown error')}"
                    )
            else:
                self.log_test(
                    "Content Generation",
                    False,
                    f"HTTP {response.status_code}: {response.text}"
                )
        except Exception as e:
            self.log_test("Content Generation", False, str(e))

        return None

    def test_admin_panel(self):
        """관리자 패널 테스트"""
        admin_endpoints = [
            "/api/admin/stats",
            "/api/admin/users",
            "/api/admin/content-analytics",
            "/api/admin/system-health"
        ]

        for endpoint in admin_endpoints:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}")
                success = response.status_code == 200

                if success:
                    data = response.json()
                    success = data.get('success', False)

                self.log_test(
                    f"Admin API: {endpoint}",
                    success,
                    f"Status: {response.status_code}"
                )
            except Exception as e:
                self.log_test(f"Admin API: {endpoint}", False, str(e))

    def test_file_upload(self):
        """파일 업로드 기능 테스트"""
        try:
            # 테스트용 이미지 파일 생성 (1x1 PNG)
            import io
            from PIL import Image

            # 테스트 이미지 생성
            img = Image.new('RGB', (100, 100), color='red')
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='PNG')
            img_bytes.seek(0)

            files = {'image': ('test.png', img_bytes, 'image/png')}

            response = self.session.post(
                f"{self.base_url}/api/editor/upload-image",
                files=files,
                timeout=30
            )

            success = response.status_code == 200
            if success:
                data = response.json()
                success = data.get('success', False)
                url = data.get('url', '') if success else ''
                self.log_test(
                    "File Upload",
                    success,
                    f"Uploaded: {url[:50]}..." if len(url) > 50 else url
                )
            else:
                self.log_test(
                    "File Upload",
                    False,
                    f"HTTP {response.status_code}: {response.text}"
                )
        except Exception as e:
            self.log_test("File Upload", False, str(e))

    def test_page_accessibility(self):
        """페이지 접근성 테스트"""
        pages = [
            "/",
            "/content",
            "/admin",
            "/analytics",
            "/trends",
            "/video",
            "/storage"
        ]

        for page in pages:
            try:
                response = self.session.get(f"{self.base_url}{page}")
                success = response.status_code == 200
                self.log_test(
                    f"Page Access: {page}",
                    success,
                    f"Status: {response.status_code}"
                )
            except Exception as e:
                self.log_test(f"Page Access: {page}", False, str(e))

    def run_full_workflow_test(self):
        """전체 워크플로우 테스트 실행"""
        print("🚀 Starting Content Automation Studio Workflow Test")
        print("=" * 60)

        # 1. 시스템 상태 점검
        print("\n📊 Step 1: System Health Check")
        health_ok = self.test_system_health()

        if not health_ok:
            print("❌ System health check failed. Stopping tests.")
            return self.generate_report()

        # 2. API 엔드포인트 테스트
        print("\n🔌 Step 2: API Endpoints Test")
        self.test_api_endpoints()

        # 3. 페이지 접근성 테스트
        print("\n🌐 Step 3: Page Accessibility Test")
        self.test_page_accessibility()

        # 4. 콘텐츠 생성 테스트 (핵심 기능)
        print("\n✍️ Step 4: Content Generation Test (Core Feature)")
        content_data = self.test_content_generation()

        # 5. 파일 업로드 테스트
        print("\n📁 Step 5: File Upload Test")
        self.test_file_upload()

        # 6. 관리자 패널 테스트
        print("\n⚙️ Step 6: Admin Panel Test")
        self.test_admin_panel()

        # 결과 보고서 생성
        return self.generate_report()

    def generate_report(self):
        """테스트 결과 보고서 생성"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0

        print("\n" + "=" * 60)
        print("📋 WORKFLOW TEST REPORT")
        print("=" * 60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {success_rate:.1f}%")
        print("=" * 60)

        # 실패한 테스트 상세 정보
        failed_tests_details = [r for r in self.test_results if not r['success']]
        if failed_tests_details:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests_details:
                print(f"  • {test['test']}: {test['details']}")

        # 성공한 핵심 기능 확인
        core_features = [
            "System Health Check",
            "Content Generation",
            "Admin Panel",
            "Page Access"
        ]

        core_success = [
            test['test'] for test in self.test_results
            if test['test'] in core_features and test['success']
        ]

        print("\n✅ CORE FEATURES WORKING:")
        for feature in core_success:
            print(f"  • {feature}")

        # 최종 평가
        if success_rate >= 80:
            print("\n🎉 OVERALL ASSESSMENT: EXCELLENT")
            print("The Content Automation Studio is ready for production!")
        elif success_rate >= 60:
            print("\n✅ OVERALL ASSESSMENT: GOOD")
            print("Most core features are working. Minor fixes needed.")
        else:
            print("\n⚠️ OVERALL ASSESSMENT: NEEDS WORK")
            print("Significant issues need to be addressed before production.")

        # 보고서 저장
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "success_rate": success_rate
            },
            "tests": self.test_results
        }

        with open("workflow_test_report.json", "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)

        print(f"\n📄 Detailed report saved to: workflow_test_report.json")
        return report_data

def main():
    """메인 실행 함수"""
    # 로컬 또는 배포된 환경 URL
    base_url = os.getenv("TEST_URL", "http://localhost:5000")

    print(f"Testing Content Automation Studio at: {base_url}")

    tester = WorkflowTester(base_url)
    report = tester.run_full_workflow_test()

    return report

if __name__ == "__main__":
    main()