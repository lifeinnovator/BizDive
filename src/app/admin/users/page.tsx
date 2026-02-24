'use client'

import React, { useState } from 'react'
import {
    Search,
    Filter,
    Download,
    MoreHorizontal,
    ArrowUpDown,
    User,
    Building2,
    Mail,
    Calendar,
    ChevronRight,
    ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ScoreIndicator from '@/components/admin/ScoreIndicator'

const mockUsers = [
    { id: 'u1', name: '김민수 대표', email: 'kms@startup.com', company: '에이비씨 테크', group: '서울창업허브 2024', role: 'user', lastDiagnosis: '2024.02.23', lastScore: 82.4, status: 'Active' },
    { id: 'u2', name: '이영희 팀장', email: 'yh.lee@corp.io', company: '디브릿지 소프트', group: '글로벌 SaaS 8기', role: 'user', lastDiagnosis: '2024.02.20', lastScore: 45.2, status: 'Active' },
    { id: 'u3', name: '박준영 소장', email: 'jyp@lab.net', company: '미래 로보틱스', group: '서울창업허브 2024', role: 'user', lastDiagnosis: '2024.02.18', lastScore: 68.7, status: 'Inactive' },
    { id: 'u4', name: '최다은 본부장', email: 'de.choi@biz.com', company: '그린 에너지 솔루션', group: 'K-Startup 지원단', role: 'user', lastDiagnosis: '2024.02.15', lastScore: 91.0, status: 'Active' },
    { id: 'u5', name: '정우성 팀장', email: 'ws.jung@local.org', company: '로컬 커넥트', group: '경기센터 예비창업', role: 'user', lastDiagnosis: '2024.02.10', lastScore: 54.5, status: 'Active' },
]

import { createClient } from '@/lib/supabase'

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [userProfile, setUserProfile] = useState<any>(null)
    const [groups, setGroups] = useState<any[]>([])

    React.useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()

            // 1. Get current user profile
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            setUserProfile(profile)

            // 2. Fetch Groups (for select filter)
            let groupsQ = supabase.from('groups').select('*')
            if (profile?.role === 'group_admin') {
                groupsQ = groupsQ.eq('id', profile.group_id)
            }
            const { data: groupsData } = await groupsQ
            setGroups(groupsData || [])

            // 3. Fetch Users with RBAC
            let usersQ = supabase.from('profiles').select('*, groups(name)')

            if (profile?.role === 'group_admin' && profile.group_id) {
                usersQ = usersQ.eq('group_id', profile.group_id)
            }

            const { data: usersData } = await usersQ.order('created_at', { ascending: false })
            setUsers(usersData || [])
            setLoading(false)
        }
        fetchData()
    }, [])

    const handleRoleChange = async (targetUserId: string, newRole: string) => {
        const supabase = createClient()
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', targetUserId)

        if (error) {
            alert('권한 변경에 실패했습니다: ' + error.message)
        } else {
            setUsers(users.map(u => u.id === targetUserId ? { ...u, role: newRole } : u))
        }
    }

    const filteredUsers = users.filter(user =>
    (user.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">사용자 관리</h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">전체 가입 유저와 진단 현황을 통합 관리합니다.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 text-slate-600 border-slate-200 bg-white hover:bg-slate-50 rounded-xl h-11">
                        <Download size={18} />
                        전체 유저 내보내기
                    </Button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-4 flex flex-col lg:flex-row gap-4">
                    <div className="flex-grow flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="이름, 이메일, 회사명으로 검색..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <select className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                            <option value="">모든 그룹보기</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        <Button variant="outline" className="gap-2 font-bold text-slate-500 border-slate-200 h-11 rounded-xl">
                            <Filter size={16} />
                            상세 필터
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">사용자 정보</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">소속 정보</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">권한 설정</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">상태</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">데이터를 불러오는 중...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">검색 결과가 없습니다.</td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                                                {user.user_name?.[0] || user.email[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{user.user_name || '이름 없음'}</p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Mail size={10} />
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                                <Building2 size={14} className="text-slate-400" />
                                                {user.company_name || '회사 정보 없음'}
                                            </p>
                                            <p className="text-[11px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                                                {user.groups?.name || '소속 없음'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <select
                                            disabled={userProfile?.role !== 'super_admin'}
                                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                                            value={user.role || 'user'}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        >
                                            <option value="user">일반 사용자</option>
                                            <option value="group_admin">기관 운영자</option>
                                            <option value="super_admin">최고 운영자</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold">
                                            Active
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                                                <ExternalLink size={16} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                                                <MoreHorizontal size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && (
                    <div className="p-4 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-xs text-slate-400 font-medium">전체 {filteredUsers.length}명 검색됨</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled className="h-8 rounded-lg text-xs font-bold">이전</Button>
                            <Button variant="outline" size="sm" disabled className="h-8 rounded-lg text-xs font-bold">다음</Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}
