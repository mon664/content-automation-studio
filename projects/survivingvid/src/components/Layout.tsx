'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Download,
  BarChart3,
  Bot,
  Star,
  FileText,
  Globe,
  Type,
  Music,
  Settings,
  ShoppingBag,
  Menu,
  X,
  LogOut,
  CreditCard
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, userProfile, logout } = useAuth();

  // AutoVid 12개 메뉴와 동일한 순서 - 실제 파일 경로와 일치
  const menuItems = [
    {
      id: 'credits',
      title: '크레딧',
      icon: CreditCard,
      href: '/credits'
    },
    {
      id: 'download',
      title: '다운로드',
      icon: Download,
      href: '/download'
    },
    {
      id: 'manual',
      title: '수동영상생성',
      icon: BarChart3,
      href: '/manual'
    },
    {
      id: 'auto',
      title: '자동영상생성',
      icon: Bot,
      href: '/'
    },
    {
      id: 'best',
      title: '베스트시리즈',
      icon: Star,
      href: '/best'
    },
    {
      id: 'template',
      title: 'Template',
      icon: FileText,
      href: '/template-editor'
    },
    {
      id: 'youtube',
      title: '유튜브 탐색',
      icon: Globe,
      href: '/youtube-browser'
    },
    {
      id: 'fonts',
      title: 'Fonts Download',
      icon: Type,
      href: '/google-fonts'
    },
    {
      id: 'bgm',
      title: 'BGM',
      icon: Music,
      href: '/pixabay-bgm'
    },
    {
      id: 'profile',
      title: '프로필 설정',
      icon: Settings,
      href: '/profile'
    },
    {
      id: 'shop',
      title: 'Shop',
      icon: ShoppingBag,
      href: '/shop'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      href: '/settings'
    }
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  const handleMenuClick = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header p-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary">
              SurvivingVid
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            AI 영상 생성 플랫폼
          </p>
        </div>

        <nav className="nav-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="nav-item">
                <button
                  onClick={() => handleMenuClick(item.href)}
                  className={`nav-link w-full ${isActive(item.href) ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  <span>{item.title}</span>
                </button>
              </div>
            );
          })}
        </nav>

        {/* 사용자 정보 섹션 */}
        <div className="sidebar-footer absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <div className="text-sm font-medium">{user?.displayName || 'User'}</div>
                <div className="text-xs text-muted-foreground">
                  {userProfile?.subscription?.plan?.toUpperCase() || 'FREE'}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-gray-100 rounded"
              title="로그아웃"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              S-CRD: {userProfile?.credits?.free || 0}
            </span>
            <span className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              E-CRD: {userProfile?.credits?.paid || 0}
            </span>
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="main-content">
        {/* 상단바 */}
        <header className="topbar">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {menuItems.find(item => isActive(item.href))?.title || 'SurvivingVid'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* 크레딧 정보 (데스크톱) */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <span className="badge badge-primary flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  S-CRD: {userProfile?.credits?.free || 0}
                </span>
                <span className="badge badge-success flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  E-CRD: {userProfile?.credits?.paid || 0}
                </span>
              </div>

              {/* 사용자 프로필 (데스크톱) */}
              <div className="hidden md:flex items-center gap-3">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="text-sm">
                  <div className="font-medium">{user?.displayName || 'User'}</div>
                  <div className="text-muted-foreground">
                    {userProfile?.subscription?.plan?.toUpperCase() || 'FREE'}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="로그아웃"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="page-content">
          {children}
        </main>
      </div>

      {/* 오버레이 (모바일) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <style jsx>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background: white;
          border-right: 1px solid #e1e5e9;
          z-index: 50;
          transform: translateX(0);
          transition: transform 0.3s ease;
        }

        .sidebar-header {
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }

        .sidebar-footer {
          position: sticky;
          bottom: 0;
          background: white;
          z-index: 10;
        }

        .main-content {
          margin-left: 280px;
          min-height: 100vh;
          transition: margin-left 0.3s ease;
        }

        .topbar {
          position: sticky;
          top: 0;
          background: white;
          border-bottom: 1px solid #e1e5e9;
          z-index: 30;
        }

        .page-content {
          padding: 1.5rem;
          min-height: calc(100vh - 73px);
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          color: #6c757d;
          text-decoration: none;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
        }

        .nav-link:hover {
          background-color: #f8fafc;
          color: var(--tblr-primary);
        }

        .nav-link.active {
          background-color: rgba(32, 107, 196, 0.1);
          color: var(--tblr-primary);
          border-left-color: var(--tblr-primary);
        }

        .nav-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        /* 모바일 반응형 */
        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.active {
            transform: translateX(0);
          }

          .main-content {
            margin-left: 0;
          }
        }

        @media (max-width: 768px) {
          .page-content {
            padding: 1rem;
          }

          .topbar {
            padding: 0.75rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;