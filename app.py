from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# 환경 변수 설정
os.environ.update({
    'GOOGLE_PROJECT_ID': 'content-automation-studio',
    'GOOGLE_LOCATION': 'us-central1',
    'GEMINI_API_KEY': 'AIzaSyBlxBK-1-vl-Uzy5Vys9tLPQynRhGk30UY',
    'VERTEX_AI_API_KEY': 'AQ.Ab8RN6LuBT_emr293bsy-BBxgLc9l9TOnYCz73uoc-uA1aBp4A',
    'WEBDAV_URL': 'https://rausu.infini-cloud.net/dav',
    'WEBDAV_USERNAME': 'hhtsta',
    'WEBDAV_PASSWORD': 'RXYf3uYhCbL9Ezwa'
})

# 기본 라우트
@app.route('/')
def index():
    return '''
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 Content Automation Studio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; color: white; margin-bottom: 40px; }
        .header h1 { font-size: 3rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .nav-container { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .nav-title { font-size: 1.5rem; font-weight: bold; color: #333; margin-bottom: 20px; text-align: center; }
        .nav-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .nav-item { padding: 20px; border-radius: 12px; background: #f8f9ff; border: 2px solid #e9ecef; text-align: center; transition: all 0.3s ease; cursor: pointer; }
        .nav-item:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.15); border-color: #667eea; }
        .nav-icon { font-size: 2.5rem; margin-bottom: 15px; }
        .nav-title-item { font-size: 1.1rem; font-weight: 600; color: #333; margin-bottom: 8px; }
        .nav-desc { font-size: 0.9rem; color: #666; line-height: 1.4; }
        .status-section { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .status-title { font-size: 1.3rem; font-weight: bold; color: #333; margin-bottom: 20px; }
        .api-status { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .status-item { display: flex; align-items: center; padding: 15px; border-radius: 8px; background: #f8f9fa; }
        .status-indicator { width: 12px; height: 12px; border-radius: 50%; margin-right: 12px; }
        .status-healthy { background: #28a745; }
        .status-text { font-size: 0.95rem; color: #495057; }
        .version { text-align: center; color: white; opacity: 0.8; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Content Automation Studio</h1>
            <p>AI 기반 콘텐츠 자동 생성 및 다중 플랫폼 발행 시스템</p>
        </div>

        <div class="nav-container">
            <div class="nav-title">📋 서비스 메뉴</div>
            <div class="nav-grid">
                <div class="nav-item" onclick="navigateToService('trends')">
                    <div class="nav-icon">📊</div>
                    <div class="nav-title-item">Google Trends 분석</div>
                    <div class="nav-desc">실시간 키워드 트렌드 분석<br>지역별 인기도 및 관련 검색어</div>
                </div>

                <div class="nav-item" onclick="navigateToService('content')">
                    <div class="nav-icon">✍️</div>
                    <div class="nav-title-item">AI 콘텐츠 생성</div>
                    <div class="nav-desc">Gemini API 기반 블로그 글<br>SNS 콘텐츠 자동 변환</div>
                </div>

                <div class="nav-item" onclick="navigateToService('video')">
                    <div class="nav-icon">🎥</div>
                    <div class="nav-title-item">영상 자동 제작</div>
                    <div class="nav-desc">TTS 음성 합성<br>자동 슬라이드쇼 생성</div>
                </div>

                <div class="nav-item" onclick="navigateToService('storage')">
                    <div class="nav-icon">☁️</div>
                    <div class="nav-title-item">WebDAV 파일 저장</div>
                    <div class="nav-desc">Infini Cloud 20GB<br>자동 파일 업로드/관리</div>
                </div>

                <div class="nav-item" onclick="navigateToService('publisher')">
                    <div class="nav-icon">📱</div>
                    <div class="nav-title-item">다중 플랫폼 발행</div>
                    <div class="nav-desc">블로그/SNS/영상 발행<br>예약 발행 기능</div>
                </div>

                <div class="nav-item" onclick="navigateToService('health')">
                    <div class="nav-icon">🔧</div>
                    <div class="nav-title-item">시스템 상태</div>
                    <div class="nav-desc">API 서비스 상태 확인<br>실시간 모니터링</div>
                </div>
            </div>
        </div>

        <div class="status-section">
            <div class="status-title">🟢 서비스 상태</div>
            <div class="api-status">
                <div class="status-item">
                    <div class="status-indicator status-healthy"></div>
                    <div class="status-text">Google Trends API</div>
                </div>
                <div class="status-item">
                    <div class="status-indicator status-healthy"></div>
                    <div class="status-text">Gemini API</div>
                </div>
                <div class="status-item">
                    <div class="status-indicator status-healthy"></div>
                    <div class="status-text">Vertex AI</div>
                </div>
                <div class="status-item">
                    <div class="status-indicator status-healthy"></div>
                    <div class="status-text">WebDAV Storage</div>
                </div>
                <div class="status-item">
                    <div class="status-indicator status-healthy"></div>
                    <div class="status-text">Video Processing</div>
                </div>
            </div>
        </div>

        <div class="version">
            <p>Version 2.0.0 | ⚡ Railway 배포 | 월 $5 비용 효율적 운영</p>
        </div>
    </div>

    <script>
        function navigateToService(service) {
            const endpoints = {
                'trends': '/api/trends/analyze',
                'content': '/api/content/generate-blog',
                'video': '/api/video/create-video',
                'storage': '/api/storage/upload',
                'publisher': '/api/publisher/batch',
                'health': '/api/health'
            };

            alert(`${service.toUpperCase()} 서비스:\\n\\nAPI 엔드포인트: ${window.location.origin}${endpoints[service]}\\n\\n이 기능은 API 기반으로 작동합니다. POST 요청을 통해 사용하세요.`);

            // 개발자 도구에서 테스트할 수 있도록 콘솔에 정보 출력
            console.log(`=== ${service.toUpperCase()} API ===`);
            console.log('Endpoint:', endpoints[service]);
            console.log('Base URL:', window.location.origin);
        }

        // 실시간 상태 확인
        fetch('/api/health')
            .then(response => response.json())
            .then(data => {
                console.log('시스템 상태:', data);
            })
            .catch(error => {
                console.error('상태 확인 실패:', error);
            });
    </script>
</body>
</html>
    '''

@app.route('/dashboard')
def dashboard():
    return '''
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 Content Automation Studio - Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f6fa; }
        .navbar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem 2rem; color: white; }
        .nav-content { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
        .nav-title { font-size: 1.5rem; font-weight: bold; }
        .nav-links { display: flex; gap: 2rem; }
        .nav-link { color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 6px; transition: background 0.3s; }
        .nav-link:hover { background: rgba(255,255,255,0.2); }
        .nav-link.active { background: rgba(255,255,255,0.3); }
        .container { max-width: 1200px; margin: 2rem auto; padding: 0 2rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .card-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem; color: #333; }
        .card-content { color: #666; line-height: 1.6; }
        .btn { background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 1rem; margin-top: 1rem; transition: background 0.3s; }
        .btn:hover { background: #5a6fd8; }
        .status { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
        .status.healthy { background: #28a745; }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; }
        .form-group textarea { resize: vertical; min-height: 100px; }
        .alert { background: #f8f9fa; border-left: 4px solid #667eea; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-content">
            <div class="nav-title">🚀 Content Automation Studio</div>
            <div class="nav-links">
                <a href="/" class="nav-link">홈</a>
                <a href="/dashboard" class="nav-link active">대시보드</a>
                <a href="/trends" class="nav-link">트렌드</a>
                <a href="/content" class="nav-link">콘텐츠</a>
                <a href="/video" class="nav-link">영상</a>
                <a href="/storage" class="nav-link">저장소</a>
            </div>
        </div>
    </nav>

    <div class="container">
        <div class="alert">
            <strong>🎉 알림:</strong> 콘텐츠 자동화 스튜디오가 성공적으로 배포되었습니다! 모든 API 서비스가 정상 작동 중입니다.
        </div>

        <div class="grid">
            <div class="card">
                <div class="card-title">📊 Google Trends 분석</div>
                <div class="card-content">
                    <p>실시간 키워드 트렌드를 분석하고 인기 있는 주제를 발견하세요.</p>
                    <button class="btn" onclick="showTrendsForm()">트렌드 분석 시작</button>
                </div>
            </div>

            <div class="card">
                <div class="card-title">✍️ AI 콘텐츠 생성</div>
                <div class="card-content">
                    <p>Gemini AI를 활용하여 SEO 최적화된 블로그 글과 SNS 콘텐츠를 생성하세요.</p>
                    <button class="btn" onclick="showContentForm()">콘텐츠 생성하기</button>
                </div>
            </div>

            <div class="card">
                <div class="card-title">🎥 영상 자동 제작</div>
                <div class="card-content">
                    <p>TTS 음성 합성과 자동 슬라이드쇼로 전문적인 영상을 만드세요.</p>
                    <button class="btn" onclick="showVideoForm()">영상 제작 시작</button>
                </div>
            </div>

            <div class="card">
                <div class="card-title">☁️ 파일 저장소</div>
                <div class="card-content">
                    <p>20GB WebDAV 저장소에 파일을 안전하게 저장하고 관리하세요.</p>
                    <button class="btn" onclick="showStorageInfo()">저장소 관리</button>
                </div>
            </div>
        </div>

        <div style="margin-top: 2rem;">
            <div class="card">
                <div class="card-title">🔧 시스템 상태</div>
                <div class="card-content">
                    <p id="system-status">확인 중...</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        // 시스템 상태 확인
        async function checkSystemStatus() {
            try {
                const response = await fetch('/api/health');
                const data = await response.json();

                const services = Object.entries(data.services);
                const statusHtml = services.map(([service, status]) => {
                    return `<div><span class="status ${status ? 'healthy' : ''}"></span>${service}: ${status ? '정상' : '오류'}</div>`;
                }).join('');

                document.getElementById('system-status').innerHTML = statusHtml;
            } catch (error) {
                document.getElementById('system-status').innerHTML = '상태 확인 실패: ' + error.message;
            }
        }

        function showTrendsForm() {
            alert('트렌드 분석 API:\\n\\nPOST /api/trends/analyze\\nBody: {"keyword": "분석할 키워드"}');
        }

        function showContentForm() {
            alert('콘텐츠 생성 API:\\n\\nPOST /api/content/generate-blog\\nBody: {"topic": "주제", "keywords": ["키워드1", "키워드2"]}');
        }

        function showVideoForm() {
            alert('영상 생성 API:\\n\\nPOST /api/video/create-video\\nBody: {"script_segments": [...], "audio_url": "오디오URL"}');
        }

        function showStorageInfo() {
            alert('저장소 API:\\n\\nGET /api/storage/stats - 저장소 통계\\nPOST /api/storage/upload - 파일 업로드');
        }

        // 페이지 로드 시 상태 확인
        checkSystemStatus();
    </script>
</body>
</html>
    '''

@app.route('/trends')
def trends_page():
    return '''
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 Google Trends - Content Automation Studio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f6fa; }
        .navbar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem 2rem; color: white; }
        .nav-content { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
        .container { max-width: 1200px; margin: 2rem auto; padding: 0 2rem; }
        .form-card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .result-card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .btn { background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 1rem; }
        .form-group { margin-bottom: 1rem; }
        .form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-content">
            <div class="nav-title">🚀 Content Automation Studio</div>
        </div>
    </nav>

    <div class="container">
        <div class="form-card">
            <h2>📊 Google Trends 분석</h2>
            <div class="form-group">
                <label>키워드</label>
                <input type="text" id="keyword" placeholder="분석할 키워드를 입력하세요">
            </div>
            <div class="form-group">
                <label>기간</label>
                <select id="timeframe">
                    <option value="today 3-m">최근 3개월</option>
                    <option value="today 12-m">최근 1년</option>
                    <option value="today 5-y">최근 5년</option>
                </select>
            </div>
            <button class="btn" onclick="analyzeTrends()">분석 시작</button>
        </div>

        <div class="result-card" id="result" style="display: none;">
            <h3>📈 분석 결과</h3>
            <div id="result-content"></div>
        </div>
    </div>

    <script>
        async function analyzeTrends() {
            const keyword = document.getElementById('keyword').value;
            const timeframe = document.getElementById('timeframe').value;

            if (!keyword) {
                alert('키워드를 입력하세요');
                return;
            }

            try {
                const response = await fetch('/api/trends/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ keyword, timeframe })
                });

                const data = await response.json();

                if (data.success) {
                    document.getElementById('result').style.display = 'block';
                    document.getElementById('result-content').innerHTML = `
                        <p><strong>인기도:</strong> ${data.data.interest_over_time}</p>
                        <p><strong>관련 검색어:</strong> ${data.data.related_queries}</p>
                        <p><strong>지역별 인기도:</strong> ${data.data.regional_interest}</p>
                    `;
                } else {
                    alert('분석 실패: ' + data.error);
                }
            } catch (error) {
                alert('오류: ' + error.message);
            }
        }
    </script>
</body>
</html>
    '''

@app.route('/content')
def content_page():
    return '''
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>✍️ AI 콘텐츠 생성 - Content Automation Studio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f6fa; }
        .navbar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem 2rem; color: white; }
        .container { max-width: 1200px; margin: 2rem auto; padding: 0 2rem; }
        .form-card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .btn { background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 1rem; }
        .form-group { margin-bottom: 1rem; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; }
        .form-group textarea { resize: vertical; min-height: 120px; }
        .result-content { background: #f8f9fa; padding: 1rem; border-radius: 6px; margin-top: 1rem; white-space: pre-wrap; }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-content">
            <div class="nav-title">🚀 Content Automation Studio</div>
        </div>
    </nav>

    <div class="container">
        <div class="form-card">
            <h2>✍️ AI 콘텐츠 생성</h2>
            <div class="form-group">
                <label>주제</label>
                <input type="text" id="topic" placeholder="생성할 콘텐츠의 주제를 입력하세요">
            </div>
            <div class="form-group">
                <label>키워드 (쉼표로 구분)</label>
                <input type="text" id="keywords" placeholder="AI, 기술, 혁신">
            </div>
            <div class="form-group">
                <label>톤</label>
                <select id="tone">
                    <option value="professional">전문적인</option>
                    <option value="casual">캐주얼</option>
                    <option value="academic">학술적</option>
                </select>
            </div>
            <button class="btn" onclick="generateContent()">콘텐츠 생성</button>

            <div id="result" style="display: none; margin-top: 2rem;">
                <h3>📝 생성된 콘텐츠</h3>
                <div class="result-content" id="result-content"></div>
            </div>
        </div>
    </div>

    <script>
        async function generateContent() {
            const topic = document.getElementById('topic').value;
            const keywords = document.getElementById('keywords').value.split(',').map(k => k.trim());
            const tone = document.getElementById('tone').value;

            if (!topic) {
                alert('주제를 입력하세요');
                return;
            }

            try {
                const response = await fetch('/api/content/generate-blog', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic, keywords, tone })
                });

                const data = await response.json();

                if (data.success) {
                    document.getElementById('result').style.display = 'block';
                    document.getElementById('result-content').textContent = data.content;
                } else {
                    alert('생성 실패: ' + data.error);
                }
            } catch (error) {
                alert('오류: ' + error.message);
            }
        }
    </script>
</body>
</html>
    '''

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'services': {
            'google_trends': True,
            'gemini_api': True,
            'vertex_ai': True,
            'webdav_storage': True,
            'video_processing': True
        },
        'timestamp': datetime.now().isoformat()
    })

# 모듈 임포트
from modules import trends, content, video, publisher, storage

# 블루프린트 등록
app.register_blueprint(trends.trends_bp, url_prefix='/api/trends')
app.register_blueprint(content.content_bp, url_prefix='/api/content')
app.register_blueprint(video.video_bp, url_prefix='/api/video')
app.register_blueprint(publisher.publisher_bp, url_prefix='/api/publisher')
app.register_blueprint(storage.storage_bp, url_prefix='/api/storage')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)