import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증이 필요 없는 경로
const publicPaths = ['/login', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로는 그대로 통과
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // API 요청도 통과
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 정적 파일 통과
  if (pathname.startsWith('/_next/') || pathname.startsWith('/static/')) {
    return NextResponse.next();
  }

  // 로그인 페이지로 리다이렉트
  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};