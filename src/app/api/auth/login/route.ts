import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-server';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ success: true });
    
    response.cookies.set('bizdive-session', sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
