import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const pathname = request.nextUrl.pathname;

    // Skip auth check for guest-accessible routes
    const isGuestRoute = 
      pathname.startsWith('/diagnosis') || 
      pathname.startsWith('/report/preview') || 
      pathname.startsWith('/admin/demo') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/consultation/notify') || // Allow webhook notification
      pathname.startsWith('/_next');

    if (isGuestRoute) {
        return response;
    }

    // Check if Firebase session cookie exists
    const sessionCookie = request.cookies.get('bizdive-session')?.value;

    // Protect /dashboard and saved report routes
    if (pathname.startsWith('/dashboard') ||
        (pathname.startsWith('/report') && !pathname.startsWith('/report/preview'))) {
        if (!sessionCookie) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
