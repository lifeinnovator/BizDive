import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
