import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-server';

export async function POST(request: Request) {
  try {
    const { email, userName, newPassword } = await request.json();

    if (!email || !userName || !newPassword) {
      return NextResponse.json({ error: '필수 입력 항목이 누락되었습니다.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: '비밀번호는 최소 6자리 이상이어야 합니다.' }, { status: 400 });
    }

    if (!adminDb || !adminAuth) {
      return NextResponse.json({ error: '서버 백엔드가 올바르게 초기화되지 않았습니다.' }, { status: 500 });
    }

    // 1. Find profile in Firestore by email
    const profilesRef = adminDb.collection('profiles');
    const snapshot = await profilesRef
      .where('email', '==', email.trim())
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ 
        error: '일치하는 가입 정보가 없습니다. 이메일을 다시 확인해 주세요.' 
      }, { status: 404 });
    }

    // 2. Match userName/companyName/userTitle in memory
    let matchedDoc = null;
    const input = userName.trim().toLowerCase();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const pName = (data.user_name || '').trim().toLowerCase();
      const pCompany = (data.company_name || '').trim().toLowerCase();
      const pTitle = (data.user_title || '').trim().toLowerCase();

      if (pName === input || pCompany === input || pTitle === input) {
        matchedDoc = doc;
        break;
      }
    }

    if (!matchedDoc) {
      return NextResponse.json({ 
        error: '이메일은 일치하나 이름 또는 기업명 정보가 일치하지 않습니다.' 
      }, { status: 404 });
    }

    const uid = matchedDoc.id;

    // 3. Update password in Firebase Auth using Admin SDK
    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: error.message || '비밀번호 재설정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
