'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Search,
    Filter,
    Plus,
    Calendar,
    Building2,
    Users,
    ArrowRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'

export default function ProjectsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [userProfile, setUserProfile] = useState<any>(null)

    useEffect(() => {
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

            // 2. Fetch Projects with RBAC
            let projectsQ = supabase.from('projects').select('*, groups(name)')

            if (profile?.role === 'group_admin' && profile.group_id) {
                projectsQ = projectsQ.eq('group_id', profile.group_id)
            }

            const { data: projectsData } = await projectsQ.order('created_at', { ascending: false })
            setProjects(projectsData || [])
            setLoading(false)
        }
        fetchData()
    }, [])

    const filteredProjects = projects.filter(project =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.manager_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">사업관리</h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">운영 중인 참여 기업 기수(사업)를 관리하고 진단 현황을 추적합니다.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-5 shadow-sm shadow-indigo-200 font-bold transition-all">
                        <Plus size={18} />
                        새 사업 생성
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
                            placeholder="사업명 또는 담당자명으로 검색..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <select className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                            <option value="">전체 상태</option>
                            <option value="active">진행 중</option>
                            <option value="completed">종료</option>
                            <option value="planned">예정</option>
                        </select>
                        <Button variant="outline" className="gap-2 font-bold text-slate-500 border-slate-200 h-11 rounded-xl">
                            <Filter size={16} />
                            상세 필터
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Projects Grid/List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-10 text-center text-slate-400 font-medium">데이터를 불러오는 중...</div>
                ) : filteredProjects.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-100 border-dashed">
                        조건에 맞는 사업(프로젝트)이 없습니다.
                    </div>
                ) : (
                    filteredProjects.map((project) => (
                        <Link href={`/admin/projects/${project.id}`} key={project.id}>
                            <Card className="border border-slate-200 shadow-sm bg-white hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group h-full flex flex-col">
                                <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="outline" className={`font-bold border px-2.5 py-0.5 ${project.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                            {project.status === 'active' ? '진행 중' : project.status === 'completed' ? '종료됨' : '예정됨'}
                                        </Badge>
                                        {userProfile?.role === 'super_admin' && (
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium text-[10px] uppercase">
                                                {project.groups?.name}
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {project.name}
                                    </h3>

                                    <div className="space-y-3 mt-auto pt-4 border-t border-slate-100">
                                        <div className="flex items-center text-sm text-slate-600 font-medium">
                                            <Calendar size={15} className="mr-2.5 text-slate-400" />
                                            {project.start_date ? new Date(project.start_date).toLocaleDateString() : '미정'} ~ {project.end_date ? new Date(project.end_date).toLocaleDateString() : '미정'}
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 font-medium">
                                            <Users size={15} className="mr-2.5 text-slate-400" />
                                            담당자: <span className="ml-1 text-slate-800 font-semibold">{project.manager_name || '미지정'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between text-indigo-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                        상세내역 보기
                                        <ArrowRight size={16} />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
