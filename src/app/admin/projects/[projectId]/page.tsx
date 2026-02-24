'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { TrendingUp, AlertCircle, CheckCircle2, Circle, Mail, Building2, Calendar, ArrowLeft, BarChart3, Users, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Subcomponents
import ParticipantsTable from './_components/ParticipantsTable'
import ProjectStatistics from './_components/ProjectStatistics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProjectDashboardPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.projectId as string

    const [project, setProject] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        avgScore: 0
    })
    const [activeRound, setActiveRound] = useState<string>('1')

    useEffect(() => {
        if (!projectId) return;
        const fetchProject = async () => {
            const supabase = createClient()

            // 1. Fetch Project Details (only once or if projectId changes)
            if (!project || project.id !== projectId) {
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
                // Set initial activeRound to project's current round
                setActiveRound(data.round?.toString() || '1')
            }
        }
        fetchProject()
    }, [projectId, router])

    useEffect(() => {
        if (!projectId || !activeRound) return;
        const fetchStats = async () => {
            const supabase = createClient()
            const roundNum = parseInt(activeRound)

            // 2. Fetch Summary Stats for the SELECT ACTIVE ROUND
            const { count: totalParticipants } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', projectId)

            const { data: records } = await supabase
                .from('diagnosis_records')
                .select('total_score')
                .eq('project_id', projectId)
                .eq('round', roundNum)

            const completed = records?.length || 0
            const avg = completed > 0
                ? records!.reduce((sum, r) => sum + (r.total_score || 0), 0) / completed
                : 0

            setStats({
                total: totalParticipants || 0,
                completed,
                avgScore: Math.round(avg * 10) / 10
            })
            setLoading(false)
        }
        fetchStats()
    }, [projectId, activeRound])

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 animate-pulse text-slate-400">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin mb-4"></div>
            <p className="font-medium">프로젝트 정보를 불러오는 중입니다...</p>
        </div>
    )
    if (!project) return null

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
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
                            <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100 font-bold">
                                {project.round}차 진단 운영 중
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                <Building2 size={13} className="text-slate-400" /> 운영사: {project.groups?.name || '소속 그룹 없음'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-slate-400" /> {project.start_date || '미정'} ~ {project.end_date || '미정'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-slate-200 font-bold text-slate-700">사업 정보 수정</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">참여 기업 일괄 등록</Button>
                </div>
            </div>

            {/* Summary Detail Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none bg-indigo-600 text-white shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp size={80} />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-indigo-100 text-sm font-bold opacity-80 mb-1">진단 완료율 ({activeRound}차 기준)</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-4xl font-black">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</h2>
                            <span className="text-indigo-100 text-sm font-medium">{stats.completed} / {stats.total} 제출</span>
                        </div>
                        <div className="w-full bg-white/20 h-2 mt-4 rounded-full overflow-hidden">
                            <div className="bg-white h-full transition-all duration-1000" style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-white shadow-sm border border-slate-100 overflow-hidden relative">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-500 text-sm font-bold mb-1">{activeRound}차 평균 점수</p>
                                <h2 className="text-3xl font-black text-slate-800">{stats.avgScore} <span className="text-lg font-medium text-slate-400">pt</span></h2>
                            </div>
                            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <BarChart3 size={20} />
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 h-3 mt-auto">
                            {[75, 82, 68, 90, 85, 78, 88].map((v, i) => (
                                <div key={i} className="bg-slate-100 rounded-full h-full relative" title={`D${i + 1}`}>
                                    <div className="bg-emerald-500 rounded-full w-full absolute bottom-0" style={{ height: `${v}%` }} />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-500 text-sm font-bold mb-1">미응답 기업 독려</p>
                                <h2 className="text-3xl font-black text-rose-500">{stats.total - stats.completed} <span className="text-lg font-medium text-slate-400">개사</span></h2>
                            </div>
                            <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                                <AlertCircle size={20} />
                            </div>
                        </div>
                        <Button
                            className="w-full bg-slate-900 border-none hover:bg-slate-800 text-white h-10 font-bold rounded-xl text-xs gap-2"
                        >
                            <Mail size={14} /> 미응답자 전체 리마인드 발송
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Final UX: Round-based Navigation */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <Tabs value={activeRound} onValueChange={setActiveRound} className="w-full">
                    <div className="flex items-center justify-between px-8 py-4 border-b border-slate-50 bg-slate-50/30">
                        <TabsList className="bg-transparent h-auto p-0 gap-8">
                            {[1, 2, 3].map((r) => (
                                <TabsTrigger
                                    key={r}
                                    value={r.toString()}
                                    className="data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 border-b-2 border-transparent rounded-none px-0 pb-4 h-full font-black text-slate-400 transition-all hover:text-slate-600"
                                    disabled={r > (project.round || 1)}
                                >
                                    {r}차 진단
                                    {r === project.round && (
                                        <div className="ml-2 w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                                <Button size="sm" variant="ghost" className="h-7 text-xs font-bold px-3 bg-slate-100">데이터 뷰</Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs font-bold px-3 text-slate-400 hover:text-slate-600">성과 비교</Button>
                            </div>
                        </div>
                    </div>

                    {[1, 2, 3].map((r) => (
                        <TabsContent key={r} value={r.toString()} className="mt-0 outline-none p-6 space-y-6">
                            {/* Round Content */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                <div className="xl:col-span-2 space-y-6">
                                    <ParticipantsTable projectId={projectId} projectRound={r} />
                                </div>
                                <div className="space-y-6">
                                    <ProjectStatistics projectId={projectId} projectRound={r} />
                                </div>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    )
}
