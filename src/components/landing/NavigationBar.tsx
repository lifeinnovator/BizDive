"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const NavigationBar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);

        const checkUser = async () => {
            const { createClient } = await import('@/lib/supabase');
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsLoggedIn(true);
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                if (profile) setUserRole(profile.role);
            }
        };
        checkUser();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/95 backdrop-blur-md border-slate-200 py-4 shadow-sm' : 'bg-transparent border-transparent py-6'}`}
        >
            <div className="container mx-auto px-2 md:px-4 flex justify-between items-center max-w-7xl">
                <Link href="/" className="flex items-center gap-2">
                    <img
                        src="/BizDive_Logo_Confirm.png"
                        alt="BizDive"
                        className="h-10 sm:h-12 w-auto"
                    />
                </Link>
                <div className="flex items-center gap-3 sm:gap-6">
                    {isLoggedIn ? (
                        <>
                            <Link href="/dashboard" className="inline-flex min-h-11 items-center text-[13px] sm:text-[15px] font-bold text-slate-500 hover:text-indigo-900 transition-colors">
                                나의 대시보드
                            </Link>
                            {userRole === 'super_admin' && (
                                <a href="https://admin.bizdive.kr/ops" className="inline-flex min-h-11 items-center text-[13px] sm:text-[15px] font-bold text-indigo-600 hover:text-indigo-900 transition-colors">
                                    운영 관리
                                </a>
                            )}
                            {userRole === 'group_admin' && (
                                <a href="https://bizdive.kr/admin/demo" className="inline-flex min-h-11 items-center text-[13px] sm:text-[15px] font-bold text-indigo-600 hover:text-indigo-900 transition-colors">
                                    지원기관 관리
                                </a>
                            )}
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="inline-flex min-h-11 items-center text-[13px] sm:text-[15px] font-bold text-slate-500 hover:text-indigo-900 transition-colors">
                                로그인
                            </Link>
                            <Link href="/onboarding" className="inline-flex min-h-11 items-center rounded-full bg-indigo-900 px-4 font-bold text-white text-[13px] shadow-md transition-all hover:bg-slate-900 sm:text-[15px]">
                                무료 진단 시작
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default NavigationBar;
