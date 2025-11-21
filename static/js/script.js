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

// GitHub 로그인 기능
function handleGitHubLogin() {
    window.location.href = '/auth/login';
}

function handleLogout() {
    if (confirm('정말 로그아웃하시겠습니까?')) {
        window.location.href = '/auth/logout';
    }
}

// 사용자 인증 상태 확인
async function checkAuthStatus() {
    try {
        const response = await fetch('/auth/status');
        const data = await response.json();

        if (data.authenticated && data.user) {
            showUserProfile(data.user);
            // 승인 상태 확인
            checkUserApprovalStatus();
        } else {
            showLoginButton();
        }
    } catch (error) {
        console.error('Auth status check failed:', error);
        showLoginButton();
    }
}

// 사용자 프로필 표시
function showUserProfile(user) {
    const loginBtn = document.getElementById('github-login-btn');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');

    if (loginBtn) loginBtn.style.display = 'none';
    if (userProfile) {
        userProfile.style.display = 'flex';
        if (userAvatar) userAvatar.src = user.avatar_url || '/static/img/default-avatar.png';
        if (userName) userName.textContent = user.name || user.username;
    }

    console.log(`User logged in: ${user.name || user.username}`);
}

// 사용자 승인 상태 확인
async function checkUserApprovalStatus() {
    try {
        const response = await fetch('/api/approval/user-status');
        const data = await response.json();

        if (data.authenticated && data.status === 'pending') {
            // 승인 대기 상태인 경우
            showPendingApprovalMessage();
        } else if (data.authenticated && !data.is_approved) {
            // 거절된 경우
            showRejectedMessage();
        }
    } catch (error) {
        console.error('Failed to check user approval status:', error);
    }
}

function showPendingApprovalMessage() {
    const userProfile = document.getElementById('user-profile');
    if (userProfile) {
        userProfile.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-clock" style="color: #ffc107;"></i>
                <span style="font-size: 14px;">승인 대기 중</span>
            </div>
        `;
    }

    // 알림 메시지 표시
    const existingAlert = document.querySelector('.approval-alert');
    if (!existingAlert) {
        const alert = document.createElement('div');
        alert.className = 'approval-alert';
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            font-size: 14px;
        `;
        alert.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #856404;">
                <i class="fas fa-clock"></i> 승인 대기 중
            </h4>
            <p style="margin: 0;">
                관리자의 승인을 기다리고 있습니다.<br>
                승인이 완료되면 서비스를 이용할 수 있습니다.
            </p>
        `;
        document.body.appendChild(alert);

        // 10초 후 자동 제거
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 10000);
    }
}

function showRejectedMessage() {
    const userProfile = document.getElementById('user-profile');
    if (userProfile) {
        userProfile.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-times-circle" style="color: #dc3545;"></i>
                <span style="font-size: 14px;">승인 거절</span>
            </div>
        `;
    }

    const existingAlert = document.querySelector('.approval-alert');
    if (!existingAlert) {
        const alert = document.createElement('div');
        alert.className = 'approval-alert';
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            font-size: 14px;
        `;
        alert.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #721c24;">
                <i class="fas fa-times-circle"></i> 승인 거절
            </h4>
            <p style="margin: 0;">
                귀하의 가입 신청이 거절되었습니다.<br>
                관리자에게 문의하세요.
            </p>
        `;
        document.body.appendChild(alert);
    }
}

// 로그인 버튼 표시
function showLoginButton() {
    const loginBtn = document.getElementById('github-login-btn');
    const userProfile = document.getElementById('user-profile');

    if (loginBtn) loginBtn.style.display = 'flex';
    if (userProfile) userProfile.style.display = 'none';
}

// 페이지 로드 시 인증 상태 확인
document.addEventListener('DOMContentLoaded', function() {
    // 기존 코드 유지...
    console.log('Content Automation Studio v2.0.0');

    // API 상태 자동 새로고침
    setupAutoRefresh();

    // 현재 시간 표시
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // 애니메이션 효과 추가
    addAnimations();

    // 인증 상태 확인
    checkAuthStatus();
});