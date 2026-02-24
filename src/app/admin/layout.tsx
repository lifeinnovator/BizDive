'use client'

import React, { useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Bell, Search, User } from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [userProfile, setUserProfile] = useState<any>(null)
    const [groupName, setGroupName] = useState<string>('')

    React.useEffect(() => {
        const fetchProfile = async () => {
            const { createClient } = await import('@/lib/supabase')
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, group_id')
                    .eq('id', user.id)
                    .single()

                setUserProfile(profile)

                if (profile?.role === 'super_admin') {
                    setGroupName('BizDive')
                } else if (profile?.group_id) {
                    const { data: group } = await supabase
                        .from('groups')
                        .select('name')
                        .eq('id', profile.group_id)
                        .single()
                    setGroupName(group?.name || '소속 그룹 없음')
                }
            }
        }
        fetchProfile()
    }, [])

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                userRole={userProfile?.role}
            />

            <div
                className={`flex-grow flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'
                    }`}
            >
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="기업명, 유저명 검색..."
                            className="bg-transparent border-none outline-none text-sm w-64 placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-slate-200"></div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-800">
                                    {groupName || '로딩 중...'}
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    {userProfile?.role === 'super_admin' ? '최고 관리자' : '그룹 관리자'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200 shadow-sm">
                                <User size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-grow p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    )
}
