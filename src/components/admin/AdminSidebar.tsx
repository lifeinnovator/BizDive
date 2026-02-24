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
    ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
    { name: '대시보드', href: '/admin', icon: LayoutGrid },
    { name: '기업/그룹 관리', href: '/admin/groups', icon: Building },
    { name: '사업관리', href: '/admin/projects', icon: Briefcase },
    { name: '사용자 관리', href: '/admin/users', icon: Users2 },
    { name: '진단 로직 CMS', href: '/admin/cms', icon: Database },
    { name: '설정', href: '/admin/settings', icon: Settings },
]

interface SidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    userRole?: string;
}

export default function AdminSidebar({
    isCollapsed,
    toggleCollapse,
    userRole
}: SidebarProps) {
    const pathname = usePathname()

    const filteredNavItems = navItems.filter(item => {
        if (item.href === '/admin/cms' && userRole !== 'super_admin') return false
        return true
    })

    return (
        <aside
            className={`bg-slate-900 text-white h-screen fixed left-0 top-0 z-40 transition-all duration-300 border-r border-slate-800 ${isCollapsed ? 'w-16' : 'w-64'
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
                        className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-500"
                    >
                        {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-grow py-6 px-3 space-y-1">
                    {filteredNavItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
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
                    <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-2">
                        {!isCollapsed && <span>← 서비스 바로가기</span>}
                    </Link>
                </div>
            </div>
        </aside>
    )
}
