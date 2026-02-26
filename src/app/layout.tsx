import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "BizDive",
  description: "기업의 현재 상태를 7차원 입체 분석으로 진단하고 솔루션을 제안합니다.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "BizDive - 7D 기업경영 심층자가진단",
    description: "기업의 현재 상태를 7차원 입체 분석으로 진단하고 솔루션을 제안합니다.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
        <div className="fixed bottom-1 right-1 text-[10px] text-gray-300 pointer-events-none z-50">
          v2.1.0
        </div>
      </body>
    </html>
  );
}
