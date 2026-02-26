
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
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
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 0. Skip auth check for guest-accessible routes to reduce latency
    const pathname = request.nextUrl.pathname
    const isGuestRoute = pathname.startsWith('/diagnosis') || pathname.startsWith('/report/preview')

    let user = null
    if (!isGuestRoute) {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()
        user = supabaseUser
    }

    // 1. Protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role !== 'super_admin' && profile.role !== 'group_admin')) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // 2. Protect /dashboard and saved report routes (standard auth check)
    //    /diagnosis and /report/preview are accessible to guests

    if (pathname.startsWith('/dashboard') ||
        (pathname.startsWith('/report') && !pathname.startsWith('/report/preview'))) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public assets
         */
        '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
