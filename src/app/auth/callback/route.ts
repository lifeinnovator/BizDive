import { NextResponse } from 'next/server'

// OAuth code exchange belonged to the previous Supabase implementation.
// Firebase email/password authentication completes on the login page.
export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const rawNext = searchParams.get('next') || '/login'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/login'
  return NextResponse.redirect(`${origin}${next}`)
}
