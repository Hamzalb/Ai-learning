import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/'];
const ROLE_PATHS: Record<string, string> = {
  super_admin: '/super-admin',
  school: '/school',
  principal: '/principal',
  teacher: '/teacher',
  student: '/student'
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');

  const isPublic = PUBLIC_PATHS.some(p => pathname === p) || pathname.startsWith('/_next') || pathname.startsWith('/api');
  if (isPublic) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Decode JWT payload (no verify here — server validates; this is for redirect only)
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const role: string = payload.role || '';
    const allowedBase = ROLE_PATHS[role];

    // Legacy paths (dashboard, chat, etc.) allowed for student/teacher
    const isLegacyPath = ['/dashboard', '/chat', '/pdf', '/quiz', '/settings'].some(p => pathname.startsWith(p));
    if (isLegacyPath && (role === 'student' || role === 'teacher')) {
      return NextResponse.next();
    }

    // Role-based access: only allow own panel
    if (allowedBase && !pathname.startsWith(allowedBase)) {
      // Also allow legacy paths for backwards compat
      if (!isLegacyPath) {
        return NextResponse.redirect(new URL(`${allowedBase}/dashboard`, request.url));
      }
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)']
};
