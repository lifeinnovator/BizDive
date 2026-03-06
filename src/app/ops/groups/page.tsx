'use client'

import React, { useState } from 'react'
import {
    Plus,
    Search,
    Users,
    History,
    TrendingUp,
    ExternalLink,
    MoreVertical,
    Calendar,
    Building2,
    Copy,
    ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const mockGroups = [
    {
        id: 'g1',
        name: '서울창업허브 2024 배치',
        description: '공공 기술 기반 스타트업 지원 프로그램',
        userCount: 24,
        recordCount: 48,
        avgScore: 72.5,
        status: 'active',
        createdAt: '2024.01.15'
    },
    {
        id: 'g2',
        name: '디브릿지 액셀러레이팅 8기',
        description: 'Global SaaS 스타트업 특화 육성 과정',
        userCount: 15,
        recordCount: 12,
        avgScore: 64.2,
        status: 'active',
        createdAt: '2024.02.10'
    },
    {
        id: 'g3',
        name: 'K-Startup 해외진출 지원단',
        description: '글로벌 경쟁력 진단 및 고도화 컨설팅',
        userCount: 52,
        recordCount: 104,
        avgScore: 81.6,
        status: 'completed',
        createdAt: '2023.11.20'
    },
    {
        id: 'g4',
        name: '경기창조경제혁신센터 예비창업',
        description: 'IDEA 검증 및 시장 적합성 테스트 그룹',
        userCount: 8,
        recordCount: 16,
        avgScore: 52.8,
        status: 'active',
        createdAt: '2024.02.22'
    }
]

import { createClient } from '@/lib/supabase'

export default function GroupsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [groups, setGroups] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [userProfile, setUserProfile] = useState<any>(null)

    React.useEffect(() => {
        const fetchGroups = async () => {
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

            // 2. Fetch Groups with RBAC
            let query = supabase.from('groups').select('*')

            if (profile?.role === 'group_admin' && profile.group_id) {
                query = query.eq('id', profile.group_id)
            }

            const { data, error } = await query.order('created_at', { ascending: false })
            if (data) {
                // Enrich groups with counts (In a real app, use a RPC or view)
                const enrichedGroups = await Promise.all(data.map(async (group) => {
                    const { count: userCount } = await supabase
                        .from('profiles')
                        .select('id', { count: 'exact', head: true })
                        .eq('group_id', group.id)

                    const { count: recordCount } = await supabase
                        .from('diagnosis_records')
                        .select('id', { count: 'exact', head: true })
                        .filter('user_id', 'in',
                            (await supabase.from('profiles').select('id').eq('group_id', group.id)).data?.map(p => p.id) || []
                        )

                    return { ...group, userCount: userCount || 0, recordCount: recordCount || 0, avgScore: 0 }
                }))
                setGroups(enrichedGroups)
            }
            setLoading(false)
        }
        fetchGroups()
    }, [])

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">기업 / 그룹 관리</h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">관리 기관 및 교육 코호트를 생성하고 관리합니다.</p>
                </div>
                {userProfile?.role === 'super_admin' && (
                    <Button className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 h-12 px-6 rounded-xl">
                        <Plus size={20} />
                        새 관리 그룹 생성
                    </Button>
                )}
            </div>

            {/* Filter Bar */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-grow flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="그룹명이나 설명으로 검색..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-400 italic">그룹 정보를 불러오는 중...</div>
                ) : filteredGroups.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400 italic">등록된 그룹이 없습니다.</div>
                ) : filteredGroups.map((group) => (
                    <Card key={group.id} className="border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white group overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                                    <Building2 size={24} />
                                </div>
                                <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-bold">
                                    운영 중
                                </Badge>
                            </div>
                            <CardTitle className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                                {group.name}
                            </CardTitle>
                            <p className="text-sm text-slate-500 font-medium line-clamp-1 mt-1">
                                {group.description || '설명이 없습니다.'}
                            </p>
                        </CardHeader>

                        <CardContent className="pt-4">
                            <div className="grid grid-cols-3 gap-4 border-y border-slate-50 py-5">
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">참여 유저</p>
                                    <div className="flex items-center justify-center gap-1.5 font-bold text-slate-800">
                                        <Users size={14} className="text-indigo-500" />
                                        {group.userCount}
                                    </div>
                                </div>
                                <div className="text-center border-x border-slate-50">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">진단 건수</p>
                                    <div className="flex items-center justify-center gap-1.5 font-bold text-slate-800">
                                        <History size={14} className="text-indigo-500" />
                                        {group.recordCount}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">평균 점수</p>
                                    <div className="flex items-center justify-center gap-1.5 font-bold text-slate-800">
                                        <TrendingUp size={14} className="text-emerald-500" />
                                        {group.avgScore || '-'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                    <Calendar size={12} />
                                    생성일: {new Date(group.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl">
                                        <Copy size={16} />
                                    </Button>
                                    <Button size="sm" variant="outline" className="gap-2 font-bold text-slate-600 border-slate-200 rounded-xl hover:bg-slate-50">
                                        상세 보기
                                        <ChevronRight size={14} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
