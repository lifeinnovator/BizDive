'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Users, BarChart3, Building2, Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Subcomponents
import ParticipantsTable from './_components/ParticipantsTable'
import { ProjectStatistics } from './_components/ProjectStatistics'

export default function ProjectDashboardPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.projectId as string

    const [project, setProject] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!projectId) return;
        const fetchProject = async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('projects')
                .select('*, groups(name)')
                .eq('id', projectId)
                .single()

            if (error || !data) {
                console.error('Failed to load project:', error)
                router.push('/admin/projects')
                return
            }
            setProject(data)
            setLoading(false)
        }
        fetchProject()
    }, [projectId, router])

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 animate-pulse text-slate-400">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin mb-4"></div>
            <p className="font-medium">프로젝트 정보를 불러오는 중입니다...</p>
        </div>
    )
    if (!project) return null

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <Button variant="ghost" size="icon" onClick={() => router.push('/admin/projects')} className="h-10 w-10 shrink-0 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        {project.name}
                        <Badge variant="outline" className={`ml-2 px-2.5 py-0.5 font-bold ${project.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                            {project.status === 'active' ? '진행 중' : project.status === 'completed' ? '종료됨' : '예정됨'}
                        </Badge>
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2 text-[13px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                            <Building2 size={13} className="text-slate-400" /> {project.groups?.name || '소속 그룹 없음'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <FileText size={13} className="text-slate-400" /> 담당자: <span className="text-slate-700">{project.manager_name || '미지정'}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" /> {project.start_date || '미정'} ~ {project.end_date || '미정'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="participants" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6 shadow-sm border border-slate-200/60 h-12 bg-white rounded-xl overflow-hidden p-1">
                    <TabsTrigger value="participants" className="font-bold gap-2 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all h-full">
                        <Users size={16} /> 참가 기업 관리
                    </TabsTrigger>
                    <TabsTrigger value="statistics" className="font-bold gap-2 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all h-full">
                        <BarChart3 size={16} /> 진단 통계 요약
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="participants" className="mt-0 outline-none">
                    <ParticipantsTable projectId={projectId} />
                </TabsContent>
                <TabsContent value="statistics" className="mt-0 outline-none">
                    <ProjectStatistics projectId={projectId} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
