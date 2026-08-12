"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="bg-white py-16 sm:py-24 px-6 md:px-12 border-t border-slate-200">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                <div className="flex flex-col items-start gap-4 max-w-sm">
                    <Link href="/" className="mb-2">
                        <Image
                            src="/BizDive_Logo_Confirm.png"
                            alt="BizDive"
                            width={165}
                            height={44}
                            className="h-9 sm:h-11 w-auto"
                        />
                    </Link>
                    <p className="text-[14px] text-slate-500 font-medium leading-relaxed break-keep">
                        비즈다이브는 기업의 현재 상태를 진단하고 전문가 지원과 다음 성장 행동을 연결합니다. 기관에는 신청부터 성과보고까지 이어지는 사업 운영 환경을 제공합니다.
                    </p>
                    <div className="flex flex-col gap-1 mt-2">
                        <p className="text-[13px] text-slate-400">
                             문의: <a href="mailto:admin@bizdive.kr" className="text-indigo-600 hover:underline">admin@bizdive.kr</a>
                        </p>
                        <p className="text-[12px] text-slate-400 mt-2 font-medium tracking-wide">
                            © 2026 Cube Inspiration Group., Co., Ltd. All rights reserved.
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 sm:gap-16">
                    <div className="flex flex-col gap-4">
                        <h4 className="text-slate-900 font-bold text-sm">서비스</h4>
                        <div className="flex flex-col gap-3 text-[13px] text-slate-500 font-medium">
                            <Link href="/onboarding" className="hover:text-indigo-600 transition-colors">무료 진단</Link>
                            <Link href="/about" className="hover:text-indigo-600 transition-colors">서비스 소개</Link>
                            <Link href="/consultation/apply" className="hover:text-indigo-600 transition-colors">전문가 상담</Link>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        <h4 className="text-slate-900 font-bold text-sm">법적 고지</h4>
                        <div className="flex flex-col gap-3 text-[13px] text-slate-500 font-medium">
                            <Link href="/terms" className="hover:text-indigo-600 transition-colors">이용약관</Link>
                            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">개인정보처리방침</Link>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="text-slate-900 font-bold text-sm">기관·사업 운영</h4>
                        <div className="flex flex-col gap-3 text-[13px] text-slate-500 font-medium">
                            <a href="https://admin.bizdive.kr" className="hover:text-indigo-600 transition-colors">운영 솔루션 소개</a>
                            <a href="mailto:admin@bizdive.kr?subject=BizDive 기관 도입 문의" className="hover:text-indigo-600 transition-colors">기관 도입 문의</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
