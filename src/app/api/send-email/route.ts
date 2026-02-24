import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
// In a real production environment, this should be a valid API key
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_dev_only');

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { to, companyName, projectName, projectRound, magicLink } = body;

        // Validate required fields
        if (!to || !companyName || !projectName || !magicLink) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const roundText = projectRound ? `${projectRound}차 ` : '';
        const subject = `[진단안내] ${projectName} ${roundText}진단에 참여해 주세요.`;

        // HTML Email Template
        const htmlContent = `
      <div style="font-family: 'Pretendard', sans-serif; max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h1 style="color: #1e293b; font-size: 24px; font-weight: bold; margin-bottom: 24px; text-align: center;">
          ${projectName} ${roundText}진단 안내
        </h1>
        
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          안녕하세요, <strong>${companyName}</strong> 담당자님.<br/><br/>
          본 사업의 원활한 진행 및 맞춤형 멘토링 제공을 위해 ${roundText}진단을 실시하고 있습니다. 
          아직 진단을 완료하지 않으신 것으로 확인되어 안내 메일을 드립니다.
        </p>
        
        <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 32px; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin-bottom: 16px;">
            아래 버튼을 클릭하시면 <strong>${companyName} 전용 진단 페이지</strong>로 즉시 이동합니다.<br/>
            (별도의 로그인 없이 바로 진행 가능합니다)
          </p>
          
          <a href="${magicLink}" 
             style="display: inline-block; background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; transition: background-color 0.2s;">
            진단 시작하기
          </a>
        </div>
        
        <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          본 메일은 발신 전용이며, 문의사항은 주관기관 담당자에게 연락 바랍니다.<br/>
          &copy; ${new Date().getFullYear()} BizDive. All rights reserved.
        </p>
      </div>
    `;

        // Attempt to send email via Resend
        // Note: If using a dummy key or unverified domain in dev, 
        // it's normal for this to fail or only send to the verified email.
        // For demonstration, we simulate success if no valid API key is present.
        let data;
        if (process.env.RESEND_API_KEY) {
            const response = await resend.emails.send({
                from: 'BizDive Admin <admin@bizdive.kr>', // Replace with your verified domain
                to: [to],
                subject: subject,
                html: htmlContent,
            });
            data = response.data;
            if (response.error) {
                throw response.error;
            }
        } else {
            console.log('--- DEVELOPMENT MODE E-MAIL SIMULATION ---');
            console.log('To:', to);
            console.log('Subject:', subject);
            console.log('Magic Link:', magicLink);
            data = { id: 'simulated_email_id_' + Date.now() };
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Email sending failed:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}
