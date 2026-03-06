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
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from '@/lib/supabase'

export default function ProjectsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [userProfile, setUserProfile] = useState<any>(null)
    const [availableGroups, setAvailableGroups] = useState<any[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newProject, setNewProject] = useState({
        name: '',
        group_id: '',
        year: new Date().getFullYear(),
        start_date: '',
        end_date: '',
        manager_name: '',
        status: 'planned',
        round: 1,
        sponsor_agency: ''
    })

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

            if (profile?.role === 'super_admin') {
                const { data: groupsData } = await supabase.from('groups').select('*').order('name')
                setAvailableGroups(groupsData || [])
            } else if (profile?.role === 'group_admin' && profile.group_id) {
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

    const handleCreateProject = async () => {
        if (!newProject.name) return

        setIsSubmitting(true)
        const supabase = createClient()

        const projectData = {
            ...newProject,
            group_id: userProfile?.role === 'super_admin' ? (newProject.group_id || null) : userProfile?.group_id,
            start_date: newProject.start_date || null,
            end_date: newProject.end_date || null
        }

        const { data, error } = await supabase
            .from('projects')
            .insert([projectData])
            .select('*, groups(name)')

        setIsSubmitting(false)
        if (error) {
            console.error('Error creating project:', error)
            alert('사업 생성에 실패했습니다.')
        } else {
            setIsCreateModalOpen(false)
            setProjects(data ? [data[0], ...projects] : projects)
            setNewProject({
                name: '',
                group_id: '',
                year: new Date().getFullYear(),
                start_date: '',
                end_date: '',
                manager_name: '',
                status: 'planned',
                round: 1,
                sponsor_agency: ''
            })
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">사업관리</h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">운영 중인 참여 기업 기수(사업)를 관리하고 진단 현황을 추적합니다.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-5 shadow-sm shadow-indigo-200 font-bold transition-all">
                                <Plus size={18} />
                                새 사업 생성
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>새 사업 생성</DialogTitle>
                                <DialogDescription>
                                    새로운 참여 기업 기수(사업)를 생성합니다.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">사업명 *</label>
                                        <Input
                                            value={newProject.name}
                                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                            placeholder="예: 2026 엑셀러레이팅 프로그램"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">주관 기관</label>
                                        <Input
                                            value={newProject.sponsor_agency}
                                            onChange={(e) => setNewProject({ ...newProject, sponsor_agency: e.target.value })}
                                            placeholder="예: 창업진흥원, 중소벤처기업부"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {userProfile?.role === 'super_admin' ? (
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">소속 그룹(운영사) *</label>
                                            <select
                                                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                value={newProject.group_id}
                                                onChange={(e) => setNewProject({ ...newProject, group_id: e.target.value })}
                                            >
                                                <option value="">소속 그룹 선택</option>
                                                {availableGroups.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : <div />}
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">진단 차수</label>
                                        <select
                                            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            value={newProject.round}
                                            onChange={(e) => setNewProject({ ...newProject, round: Number(e.target.value) })}
                                        >
                                            <option value={1}>1차 진단 (사전)</option>
                                            <option value={2}>2차 진단 (중간)</option>
                                            <option value={3}>3차 진단 (사후)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">시작일</label>
                                        <Input
                                            type="date"
                                            value={newProject.start_date}
                                            onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">종료일</label>
                                        <Input
                                            type="date"
                                            value={newProject.end_date}
                                            onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">담당자명</label>
                                        <Input
                                            value={newProject.manager_name}
                                            onChange={(e) => setNewProject({ ...newProject, manager_name: e.target.value })}
                                            placeholder="담당자 이름"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">상태</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={newProject.status}
                                            onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                                        >
                                            <option value="planned">예정</option>
                                            <option value="active">진행 중</option>
                                            <option value="completed">종료</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>취소</Button>
                                <Button onClick={handleCreateProject} disabled={isSubmitting || !newProject.name}>
                                    {isSubmitting ? '생성 중...' : '생성하기'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
                                                {project.groups?.name || '운영사 없음'}
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {project.name}
                                    </h3>
                                    {project.sponsor_agency && (
                                        <p className="text-xs text-slate-500 font-medium mb-3">주관: {project.sponsor_agency}</p>
                                    )}

                                    <div className="space-y-3 mt-auto pt-4 border-t border-slate-100">
                                        <div className="flex items-center text-sm text-slate-600 font-medium bg-indigo-50/50 w-fit px-2 py-0.5 rounded text-indigo-700">
                                            {project.round}차 진단
                                        </div>
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
