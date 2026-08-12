import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://bizdive.vercel.app'
  ),
  title: {
    default: "비즈다이브(BizDive) | 진단에서 다음 성장 행동까지",
    template: "%s | BizDive"
  },
  description: "비즈다이브는 7D 기업진단, 전문가 비교, 멘토링과 단계별 변화 관리를 통해 기업의 다음 성장 행동을 연결합니다.",
  keywords: ["경영진단", "스타트업지원", "성과관리", "비즈니스모델", "데이터기반성장", "SEO", "GEO", "창업컨설팅"],
  icons: {
    icon: [
      { url: '/favicon.png?v=2' },
    ],
    apple: [
      { url: '/favicon.png?v=2' },
    ],
  },
  openGraph: {
    title: "BizDive - 진단에서 다음 성장 행동까지",
    description: "현재 상태를 진단하고 전문가 의견, 멘토링과 단계별 변화로 다음 성장을 이어가세요.",
    type: "website",
    locale: "ko_KR",
    siteName: "비즈다이브",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "비즈다이브",
              "url": "https://bizdive.kr",
              "logo": "https://bizdive.kr/BizDive_Logo_Confirm.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "admin@bizdive.kr",
                "contactType": "customer service"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "BizDive",
              "operatingSystem": "All",
              "applicationCategory": "BusinessApplication",
              "description": "7D 기업진단과 전문가 비교, 멘토링 및 단계별 성장 관리를 연결하는 기업 지원 서비스입니다."
            })
          }}
        />
      </head>
      <body className="font-sans antialiased">

        {children}
        <Toaster position="top-center" richColors />
        <div className="fixed bottom-1 right-1 text-[10px] text-gray-300 pointer-events-none z-50">
          v2.1.2
        </div>
      </body>
    </html>
  );
}
