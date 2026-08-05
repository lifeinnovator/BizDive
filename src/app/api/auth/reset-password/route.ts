import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: '이메일을 입력해 주세요.' }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Firebase 이메일 설정이 누락되었습니다.' }, { status: 500 })
    }

    try {
      const firebaseResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestType: 'PASSWORD_RESET', email: email.trim() }),
          cache: 'no-store',
        },
      )

      if (!firebaseResponse.ok) {
        const firebaseError = await firebaseResponse.json().catch(() => null) as {
          error?: { message?: string }
        } | null
        const code = firebaseError?.error?.message
        if (code !== 'EMAIL_NOT_FOUND') {
          console.error('Firebase password reset request failed:', code ?? firebaseResponse.status)
        }
      }
    } catch (error) {
      console.error('Firebase password reset request failed:', error instanceof Error ? error.message : 'unknown')
    }

    return NextResponse.json({
      success: true,
      message: '가입된 계정이라면 비밀번호 재설정 이메일이 발송됩니다.',
    })
  } catch {
    return NextResponse.json({ error: '비밀번호 재설정 요청을 처리하지 못했습니다.' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
