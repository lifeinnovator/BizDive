import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envKeys = Object.keys(process.env);
  const firebaseKeys = envKeys.filter(k => k.includes('FIREBASE'));
  
  const debugInfo = firebaseKeys.reduce((acc: any, key) => {
    const value = process.env[key];
    acc[key] = {
      exists: !!value,
      length: value ? value.length : 0,
      prefix: value ? value.substring(0, 15) : ''
    };
    return acc;
  }, {});

  return NextResponse.json({
    status: 'OK',
    envKeys: debugInfo,
    nodeEnv: process.env.NODE_ENV
  });
}
