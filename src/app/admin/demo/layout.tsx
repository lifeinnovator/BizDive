'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutGrid, 
    Briefcase, 
    Users2, 
    Settings, 
    ChevronLeft, 
    Menu,
    LogOut,
    Bell,
    User,
    ChevronDown,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { name: '대시보드', href: '/admin/demo', icon: LayoutGrid },
    { name: '사업관리', href: '/admin/demo/projects', icon: Briefcase },
    { name: '사용자 관리', href: '/admin/demo/users', icon: Users2 },
    { name: '시스템 설정', href: '/admin/demo/settings', icon: Settings },
];

export default function AdminDemoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside
                className={`bg-white h-screen sticky top-0 z-40 transition-all duration-300 border-r border-slate-200 flex flex-col ${
                    isCollapsed ? 'w-20' : 'w-64'
                }`}
            >
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
                    {!isCollapsed && (
                        <Link href="/admin/demo" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                                <span className="text-white text-[10px] font-black tracking-tighter">BD</span>
                            </div>
                            <span className="text-sm font-bold tracking-tight text-slate-800">
                                BizDive
                                <span className="text-indigo-600 ml-1 text-[10px] font-bold uppercase tracking-widest">DEMO</span>
                            </span>
                        </Link>
                    )}
                    {isCollapsed && (
                         <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto">
                            <span className="text-white text-[10px] font-black tracking-tighter">BD</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors text-slate-400 absolute -right-3 top-20 bg-white border border-slate-200 shadow-sm z-50`}
                    >
                        {isCollapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                {/* Sidebar Nav */}
                <nav className="flex-grow py-6 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin/demo' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                }`}
                            >
                                <item.icon size={18} className={isActive ? 'text-indigo-600' : 'group-hover:text-slate-700'} />
                                {!isCollapsed && <span className="text-[13px] whitespace-nowrap">{item.name}</span>}
                                {isActive && !isCollapsed && (
                                    <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <Link 
                        href="/" 
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all group"
                    >
                        <LogOut size={16} />
                        {!isCollapsed && <span className="text-[12px] font-bold">데모 종료하기</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 md:px-8">
                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 max-w-md w-full">
                        <Search size={16} className="text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="기업명 혹은 프로젝트 검색..." 
                            className="bg-transparent border-none outline-none text-[13px] w-full placeholder:text-slate-400 text-slate-600 font-medium"
                            disabled
                        />
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-[13px] font-bold text-slate-800 leading-none">데모 사용자</p>
                                <p className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">주관기관 관리자</p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity outline-none">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                           <User size={20} className="text-slate-500 mt-1" />
                                        </div>
                                        <ChevronDown size={14} className="text-slate-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl border-slate-100 shadow-xl shadow-slate-200/50 p-1.5">
                                    <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">내 계정 정보</DropdownMenuLabel>
                                    <DropdownMenuItem className="rounded-lg py-2.5 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer">
                                        <User className="mr-3 h-4 w-4" />
                                        <span className="text-[13px] font-medium">프로필 설정</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-50 my-1" />
                                    <DropdownMenuItem className="rounded-lg py-2.5 focus:bg-rose-50 focus:text-rose-600 cursor-pointer text-rose-500">
                                        <LogOut className="mr-3 h-4 w-4" />
                                        <span className="text-[13px] font-bold">로그아웃</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-10">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
