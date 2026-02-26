
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

    // IMPORTANT: Do NOT add logic between createServerClient and supabase.auth.getUser()
    // Any code here could break the cookie refresh mechanism

    const pathname = request.nextUrl.pathname

    // Skip auth check for guest-accessible routes
    const isGuestRoute = pathname.startsWith('/diagnosis') || pathname.startsWith('/report/preview')

    if (isGuestRoute) {
        return supabaseResponse
    }

    // For all non-guest routes, refresh the session
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Protect /admin routes
    if (pathname.startsWith('/admin')) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role !== 'super_admin' && profile.role !== 'group_admin')) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    // 2. Protect /dashboard and saved report routes
    if (pathname.startsWith('/dashboard') ||
        (pathname.startsWith('/report') && !pathname.startsWith('/report/preview'))) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    // IMPORTANT: Always return supabaseResponse (not a plain NextResponse.next())
    // This ensures refreshed session cookies are forwarded to Server Components
    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
