// Analytics Dashboard JavaScript
class AnalyticsDashboard {
    constructor() {
        this.charts = {};
        this.currentFilters = {
            period: '30',
            contentType: 'all',
            platform: 'all'
        };

        this.init();
    }

    async init() {
        console.log('Analytics Dashboard initializing...');

        try {
            await this.loadOverviewData();
            await this.loadPublishingTrends();
            await this.loadContentPerformance();
            await this.loadPerformanceTable();
            await this.loadInsights();

            this.setupEventListeners();

            console.log('Analytics Dashboard initialized successfully');
        } catch (error) {
            console.error('Error initializing Analytics Dashboard:', error);
            this.showError('대시보드 초기화에 실패했습니다. 새로고침해주세요.');
        }
    }

    async loadOverviewData() {
        try {
            const response = await fetch('/api/analytics/overview');
            const data = await response.json();

            this.renderOverviewCards(data);
        } catch (error) {
            console.error('Error loading overview data:', error);
            this.showError('개요 데이터 로딩 실패');
        }
    }

    async loadPublishingTrends() {
        try {
            const response = await fetch('/api/analytics/publishing-trend');
            const data = await response.json();

            this.renderPublishingTrendsChart(data);
        } catch (error) {
            console.error('Error loading publishing trends:', error);
            this.showError('발행 트렌드 데이터 로딩 실패');
        }
    }

    async loadContentPerformance() {
        try {
            const response = await fetch('/api/analytics/trend-correlation');
            const data = await response.json();

            this.renderContentPerformanceChart(data);
        } catch (error) {
            console.error('Error loading content performance:', error);
            this.showError('콘텐츠 성과 데이터 로딩 실패');
        }
    }

    async loadPerformanceTable() {
        try {
            const response = await fetch('/api/analytics/content-performance?type=all&limit=50');
            const result = await response.json();

            this.renderPerformanceTable(result.data || []);
        } catch (error) {
            console.error('Error loading performance table:', error);
            this.showError('성과 테이블 데이터 로딩 실패');
        }
    }

    async loadInsights() {
        try {
            // 더미 인사이트 데이터 (실제로는 API에서 가져오기)
            const insights = [
                "인스타그램 콘텐츠의 평균 참여율이 다른 플랫폼보다 32% 높습니다",
                "'AI마케팅' 키워드 관련 콘텐츠가 전체 조회수의 25%를 차지합니다",
                "수요일 오후 2시 발행 콘텐츠가 평균보다 1.8배 높은 성과를 보입니다",
                "동영상 콘텐츠의 평균 체류시간은 텍스트의 3배 이상입니다",
                "주말 발행 콘텐츠보다 주중 발행 콘텐츠의 전환율이 45% 높습니다"
            ];

            this.renderInsights(insights);
        } catch (error) {
            console.error('Error loading insights:', error);
        }
    }

    renderOverviewCards(data) {
        const container = document.getElementById('overviewCards');

        const cards = [
            {
                title: '총 발행 콘텐츠',
                value: data.total_posts,
                icon: 'fa-file-alt',
                class: 'platforms',
                change: data.growth_rate
            },
            {
                title: '총 조회수',
                value: data.total_views.toLocaleString(),
                icon: 'fa-eye',
                class: 'views',
                change: '+15.3%'
            },
            {
                title: '평균 참여율',
                value: data.avg_engagement,
                icon: 'fa-heart',
                class: 'engagement',
                change: '+2.1%'
            },
            {
                title: '월간 성장률',
                value: data.growth_rate,
                icon: 'fa-chart-line',
                class: 'growth',
                change: data.growth_rate
            }
        ];

        container.innerHTML = cards.map(card => `
            <div class="overview-card ${card.class}">
                <div class="overview-icon">
                    <i class="fas ${card.icon}"></i>
                </div>
                <div class="overview-value">${card.value}</div>
                <div class="overview-label">${card.title}</div>
                <div class="overview-change positive">${card.change}</div>
            </div>
        `).join('');
    }

    renderPublishingTrendsChart(data) {
        const ctx = document.getElementById('publishingTrendsChart').getContext('2d');

        // 기존 차트가 있으면 파괴
        if (this.charts.publishingTrends) {
            this.charts.publishingTrends.destroy();
        }

        this.charts.publishingTrends = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '발행 건수'
                        }
                    }
                }
            }
        });
    }

    renderContentPerformanceChart(data) {
        const ctx = document.getElementById('contentPerformanceChart').getContext('2d');

        // 기존 차트가 있으면 파괴
        if (this.charts.contentPerformance) {
            this.charts.contentPerformance.destroy();
        }

        this.charts.contentPerformance = new Chart(ctx, {
            type: 'scatter',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const point = context.raw;
                                return `${point.keyword}: 트렌드 ${point.x}, 조회수 ${point.y}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: '키워드 트렌드 점수'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '실제 조회수'
                        }
                    }
                }
            }
        });
    }

    renderPerformanceTable(data) {
        const tbody = document.getElementById('performanceTableBody');

        tbody.innerHTML = data.map(item => {
            const performanceClass = item.performance_score >= 80 ? 'high' :
                                   item.performance_score >= 60 ? 'medium' : 'low';

            return `
                <tr>
                    <td class="content-title" title="${item.title}">${item.title}</td>
                    <td>
                        <span class="platform-badge ${item.platform}">
                            ${item.platform.toUpperCase()}
                        </span>
                    </td>
                    <td>${item.type.toUpperCase()}</td>
                    <td>${item.published_date}</td>
                    <td>${item.views.toLocaleString()}</td>
                    <td>${item.engagement_rate}%</td>
                    <td>
                        <span class="performance-score ${performanceClass}">
                            ${item.performance_score}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderInsights(insights) {
        const container = document.getElementById('insightsGrid');

        container.innerHTML = insights.map((insight, index) => `
            <div class="insight-item">
                <div class="insight-icon">
                    <i class="fas fa-lightbulb"></i>
                </div>
                <div class="insight-text">${insight}</div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Chart period buttons
        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                this.currentFilters.period = e.target.dataset.period;
                this.loadPublishingTrends();
            });
        });

        // Content type filter buttons
        document.querySelectorAll('[data-type]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-type]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                this.currentFilters.contentType = e.target.dataset.type;
                this.loadContentPerformance();
            });
        });

        // Table filters
        document.getElementById('contentSearch').addEventListener('input', (e) => {
            this.filterPerformanceTable(e.target.value);
        });

        document.getElementById('platformFilter').addEventListener('change', (e) => {
            this.currentFilters.platform = e.target.value;
            this.loadPerformanceTable();
        });

        document.getElementById('contentTypeFilter').addEventListener('change', (e) => {
            this.currentFilters.contentType = e.target.value;
            this.loadPerformanceTable();
        });
    }

    filterPerformanceTable(searchTerm) {
        const tbody = document.getElementById('performanceTableBody');
        const rows = tbody.getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            const title = row.querySelector('.content-title').textContent.toLowerCase();
            const visible = title.includes(searchTerm.toLowerCase());
            row.style.display = visible ? '' : 'none';
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }
}

// Sidebar toggle functionality
function setupSidebarToggle() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.app-sidebar');
    const mainContent = document.querySelector('.main-content');

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        mainContent.classList.toggle('sidebar-open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
                sidebar.classList.remove('open');
                mainContent.classList.remove('sidebar-open');
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('open');
            mainContent.classList.remove('sidebar-open');
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Analytics Dashboard
    window.analyticsDashboard = new AnalyticsDashboard();

    // Setup sidebar toggle
    setupSidebarToggle();

    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});