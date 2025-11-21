// Content Automation Studio JavaScript

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('Content Automation Studio v2.0.0');

    // API 상태 자동 새로고침
    setupAutoRefresh();

    // 현재 시간 표시
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // 애니메이션 효과 추가
    addAnimations();
});

// 자동 새로고침 설정 (5분마다)
function setupAutoRefresh() {
    const refreshInterval = 5 * 60 * 1000; // 5분

    setInterval(async () => {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            updateStatus(data);
        } catch (error) {
            console.error('Status refresh failed:', error);
        }
    }, refreshInterval);
}

// 현재 시간 업데이트
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    let timeElement = document.getElementById('current-time');
    if (!timeElement) {
        timeElement = document.createElement('div');
        timeElement.id = 'current-time';
        timeElement.style.cssText = `
            margin-top: 20px;
            padding: 10px;
            background: rgba(52, 152, 219, 0.1);
            border-radius: 10px;
            font-size: 0.9rem;
            color: #7f8c8d;
        `;
        document.querySelector('.service-status').appendChild(timeElement);
    }

    timeElement.textContent = `🕒 ${timeString}`;
}

// 상태 업데이트
function updateStatus(data) {
    const statusElement = document.querySelector('.status');
    if (statusElement && data.status) {
        statusElement.textContent = data.status;
        statusElement.className = `status ${data.status}`;

        // 상태에 따른 색상 변경
        if (data.status === 'healthy') {
            statusElement.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
        } else if (data.status === 'unhealthy') {
            statusElement.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
        }
    }
}

// 애니메션 효과 추가
function addAnimations() {
    // 기능 목록에 순차적으로 애니메이션 적용
    const features = document.querySelectorAll('.features li');
    features.forEach((feature, index) => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(20px)';

        setTimeout(() => {
            feature.style.transition = 'all 0.5s ease';
            feature.style.opacity = '1';
            feature.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // 컨테이너에 페이드인 효과
    const container = document.querySelector('.service-status');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'scale(0.9)';

        setTimeout(() => {
            container.style.transition = 'all 0.8s ease';
            container.style.opacity = '1';
            container.style.transform = 'scale(1)';
        }, 100);
    }
}

// API 테스트 함수
async function testAPI(endpoint) {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        console.log(`API Test (${endpoint}):`, data);
        return data;
    } catch (error) {
        console.error(`API Test Failed (${endpoint}):`, error);
        return null;
    }
}

// 툴팁 기능
function showTooltip(element, message) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.9rem;
        z-index: 1000;
        top: -40px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
    `;

    element.style.position = 'relative';
    element.appendChild(tooltip);

    setTimeout(() => {
        tooltip.remove();
    }, 3000);
}

// 키보드 단축키
document.addEventListener('keydown', function(e) {
    // R 키: 새로고침
    if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        window.location.reload();
    }

    // H 키: API 상태 확인
    if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        testAPI('/api/health');
    }
});

// 에러 핸들링
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

// 네트워크 상태 모니터링
window.addEventListener('online', function() {
    console.log('Network connection restored');
});

window.addEventListener('offline', function() {
    console.log('Network connection lost');
    showTooltip(document.body, '네트워크 연결이 끊겼습니다.');
});