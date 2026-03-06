'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutGrid,
    Users2,
    Building,
    Database,
    Settings,
    Briefcase,
    X,
    Menu,
    ChevronLeft,
    MessageSquare
} from 'lucide-react'

// Ops routes
const navItems = [
    { name: '운영 총괄 대시보드', href: '/ops', icon: LayoutGrid },
    { name: '기관/그룹 개설 관리', href: '/ops/groups', icon: Building },
    { name: '전체 사업 통합 관리', href: '/ops/projects', icon: Briefcase },
    { name: '전문가 매칭/상담 관리', href: '/ops/consultations', icon: MessageSquare },
    { name: '플랫폼 사용자 관리', href: '/ops/users', icon: Users2 },
    { name: '진단 로직 CMS', href: '/ops/cms', icon: Database },
    { name: '시스템 설정', href: '/ops/settings', icon: Settings },
]

interface SidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    userRole?: string;
}

export default function SuperAdminSidebar({
    isCollapsed,
    toggleCollapse,
    userRole
}: SidebarProps) {
    const pathname = usePathname()

    // Safety check - though middleware should handle this
    if (userRole !== 'super_admin') return null;

    return (
        <aside
            className={`bg-indigo-950 text-white h-screen fixed left-0 top-0 z-40 transition-all duration-300 border-r border-indigo-900 shadow-xl ${isCollapsed ? '-translate-x-full md:translate-x-0 w-64 md:w-16' : 'translate-x-0 w-64'
                }`}
        >
            <div className="flex flex-col h-full">
                {/* Logo Section */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-indigo-900/50 bg-indigo-950/50">
                    {!isCollapsed && (
                        <span className="text-lg font-bold tracking-tight text-indigo-50 flex items-center gap-2">
                            BizDive
                            <span className="bg-indigo-600 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">OPS</span>
                        </span>
                    )}
                    <button
                        onClick={toggleCollapse}
                        className="p-1.5 rounded-lg hover:bg-indigo-900 transition-colors text-indigo-300 hidden md:block"
                    >
                        {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
                    </button>
                    {!isCollapsed && (
                        <button
                            onClick={toggleCollapse}
                            className="p-1.5 rounded-lg hover:bg-indigo-900 transition-colors text-indigo-300 md:hidden"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-grow py-6 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/ops' && pathname.startsWith(item.href))
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                                    : 'text-indigo-200 hover:bg-indigo-900 hover:text-white'
                                    }`}
                            >
                                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'group-hover:text-indigo-100'} />
                                {!isCollapsed && <span className="text-[13px] tracking-tight whitespace-nowrap">{item.name}</span>}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-indigo-900 bg-indigo-950">
                    <Link href="/" className="text-xs text-indigo-300 hover:text-white flex items-center gap-2 transition-colors">
                        {!isCollapsed && <span>← 홈 (사용자 화면) 바로가기</span>}
                    </Link>
                </div>
            </div>
        </aside>
    )
}
