import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('bizdive-session', '', {
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Logout API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
