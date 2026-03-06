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
import { Button } from '@/components/ui/button'

const navItems = [
    { name: '대시보드', href: '/admin', icon: LayoutGrid },
    { name: '기업/그룹 관리', href: '/admin/groups', icon: Building },
    { name: '사업관리', href: '/admin/projects', icon: Briefcase },
    { name: '상담/매칭 관리', href: '/admin/consultations', icon: MessageSquare },
    { name: '사용자 관리', href: '/admin/users', icon: Users2 },
    { name: '진단 로직 CMS', href: '/admin/cms', icon: Database },
    { name: '설정', href: '/admin/settings', icon: Settings },
]

interface SidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    userRole?: string;
    isDemo?: boolean;
}

export default function AdminSidebar({
    isCollapsed,
    toggleCollapse,
    userRole,
    isDemo = false
}: SidebarProps) {
    const pathname = usePathname()

    const filteredNavItems = navItems.filter(item => {
        if (item.href === '/admin/cms' && userRole !== 'super_admin') return false
        if (item.href === '/admin/consultations' && userRole !== 'super_admin') return false
        if (item.href === '/admin/users' && userRole !== 'super_admin') return false
        return true
    })

    return (
        <aside
            className={`bg-slate-900 text-white h-screen fixed left-0 top-0 z-40 transition-all duration-300 border-r border-slate-800 ${isCollapsed ? '-translate-x-full md:translate-x-0 w-64 md:w-16' : 'translate-x-0 w-64'
                }`}
        >
            <div className="flex flex-col h-full">
                {/* Logo Section */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/50">
                    {!isCollapsed && (
                        <span className="text-lg font-bold tracking-tight text-slate-100">
                            BizDive
                            <span className="text-indigo-400 ml-1.5 text-xs font-semibold uppercase tracking-widest opacity-80">Admin</span>
                        </span>
                    )}
                    <button
                        onClick={toggleCollapse}
                        className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-500 hidden md:block"
                    >
                        {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
                    </button>
                    {!isCollapsed && (
                        <button
                            onClick={toggleCollapse}
                            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-500 md:hidden"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-grow py-6 px-3 space-y-1">
                    {filteredNavItems.map((item) => {
                        const href = isDemo ? (item.href === '/admin' ? '/admin/demo' : item.href.replace('/admin/', '/admin/demo/')) : item.href
                        const isActive = pathname === href || (href !== '/admin' && href !== '/admin/demo' && pathname.startsWith(href))
                        return (
                            <Link
                                key={item.name}
                                href={href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-600/90 text-white'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                    }`}
                            >
                                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'group-hover:text-slate-200'} />
                                {!isCollapsed && <span className="text-[13px] font-medium tracking-tight whitespace-nowrap">{item.name}</span>}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800">
                    <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-2">
                        {!isCollapsed && <span>{isDemo ? '← 랜딩 페이지로 돌아가기' : '← 서비스 바로가기'}</span>}
                    </Link>
                </div>
            </div>
        </aside>
    )
}
