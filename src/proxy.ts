import { NextRequest, NextResponse } from 'next/server';
import { isMaliciousBot } from '@/lib/security/botShield';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userAgent = req.headers.get('user-agent');

  // 1. Anti-Bot / Anti-Scraper Protection
  if (isMaliciousBot(userAgent)) {
    return new NextResponse('Access Denied: Malicious bot or unauthorized scraper detected.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // 2. Strict Zero-Bypass Admin Route Protection
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  if (isAdminRoute) {
    const sessionCookie = req.cookies.get('mahios_admin_session')?.value;
    let hasValidSession = false;

    if (sessionCookie) {
      try {
        const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));
        if (
          decoded &&
          (decoded.authenticated === true || decoded.role === 'authenticated_admin') &&
          typeof decoded.exp === 'number' &&
          decoded.exp > Date.now()
        ) {
          hasValidSession = true;
        }
      } catch {
        hasValidSession = false;
      }
    }

    // Strictly redirect unauthenticated requests to /admin/login
    if (!hasValidSession) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Enterprise Security Headers
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
  ],
};
