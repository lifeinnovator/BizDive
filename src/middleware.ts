import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                name: 'bizdive-main-session',
            },
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const pathname = request.nextUrl.pathname

    // Skip auth check for guest-accessible routes
    const isGuestRoute = pathname.startsWith('/diagnosis') || pathname.startsWith('/report/preview')

    if (isGuestRoute) {
        return supabaseResponse
    }

    // Refresh the session
    const { data: { user } } = await supabase.auth.getUser()
    
    console.log(`Middleware [${pathname}]: User = ${user ? user.id : 'Anonymous'}`);

    // 1. Protect /dashboard and saved report routes
    if (pathname.startsWith('/dashboard') ||
        (pathname.startsWith('/report') && !pathname.startsWith('/report/preview'))) {
        if (!user) {
            console.log(`Middleware: Redirecting ${pathname} to /login (Not Logged In)`);
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
