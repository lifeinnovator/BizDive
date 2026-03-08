import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const SMTP_HOSTNAME = Deno.env.get("SMTP_HOSTNAME") || "smtps.hiworks.com";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "465");
const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME"); // admin@bizdive.kr
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD"); // App Password
const NOTIFICATION_EMAIL = "life.innovator@gmail.com";

serve(async (req) => {
  try {
    const payload = await req.json();
    const { record } = payload;

    if (!record) {
      return new Response("No record found", { status: 400 });
    }

    const {
      company_name,
      contact_name,
      contact_phone,
      contact_email,
      topics,
      message,
    } = record;

    const client = new SmtpClient();

    await client.connectTLS({
      hostname: SMTP_HOSTNAME,
      port: SMTP_PORT,
      username: SMTP_USERNAME!,
      password: SMTP_PASSWORD!,
    });

    const topicLabels: Record<string, string> = {
      business_strategy: "비즈니스 모델 및 전략",
      funding: "투자 유치 및 자금 조달",
      marketing: "마케팅 및 영업",
      hr_org: "인사 및 조직 관리",
      product: "제품 개발 및 기술",
      other: "기타",
    };

    const formattedTopics = topics
      ? topics.map((t: string) => topicLabels[t] || t).join(", ")
      : "없음";

    await client.send({
      from: SMTP_USERNAME!,
      to: NOTIFICATION_EMAIL,
      subject: `[BizDive] 새로운 전문가 매칭 신청: ${company_name}`,
      content: `신규 상담 신청이 접수되었습니다.

[신청 정보]
- 기업명: ${company_name}
- 담당자: ${contact_name}
- 연락처: ${contact_phone}
- 이메일: ${contact_email}
- 신청분야: ${formattedTopics}

[상담 내용]
${message || "내용 없음"}

관리자 페이지에서 상세 내용을 확인해 주세요.
https://admin.bizdive.kr/ops/consultations`,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
