'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Building2, Mail, Calendar, Target, Briefcase, FileText, CheckCircle2, AlertTriangle, Info, Trophy, Wrench, Edit, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const DIMENSION_LABELS: Record<string, string> = {
    D1: '경영전략/리더십',
    D2: '비즈니스 모델',
    D3: '조직/인사',
    D4: '마케팅/영업',
    D5: '기술/R&D',
    D6: '재무/자금',
    D7: '경영지원/ESG'
}

export default function UserDetailPage() {
    const params = useParams()
    const router = useRouter()
    const userId = params.userId as string

    const [userProfile, setUserProfile] = useState<any>(null)
    const [latestRecord, setLatestRecord] = useState<any>(null)
    const [memos, setMemos] = useState<any[]>([])
    const [newMemo, setNewMemo] = useState('')
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return
            const supabase = createClient()

            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)

            // 1. Fetch Profile + Project info
            const { data: profile } = await supabase
                .from('profiles')
                .select('*, projects(name), groups(name)')
                .eq('id', userId)
                .single()

            if (!profile) {
                router.push('/admin/users')
                return
            }
            setUserProfile(profile)

            // 2. Fetch Latest Diagnosis
            const { data: records } = await supabase
                .from('diagnosis_records')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)

            if (records && records.length > 0) {
                setLatestRecord(records[0])
            }

            // 3. Fetch Memos
            fetchMemos(supabase, userId)
        }

        fetchUserData()
    }, [userId, router])

    const fetchMemos = async (supabase: any, uid: string) => {
        const { data } = await supabase
            .from('mentoring_memos')
            .select('*, author:author_id(user_name, role)')
            .eq('company_id', uid)
            .order('created_at', { ascending: false })

        setMemos(data || [])
        setLoading(false)
    }

    const handleAddMemo = async () => {
        if (!newMemo.trim() || !currentUser) return

        const supabase = createClient()
        const { error } = await supabase
            .from('mentoring_memos')
            .insert({
                company_id: userId,
                author_id: currentUser.id,
                content: newMemo
            })

        if (!error) {
            setNewMemo('')
            fetchMemos(supabase, userId)
        } else {
            console.error(error)
            alert('메모 저장에 실패했습니다.')
        }
    }

    const handleDeleteMemo = async (memoId: string) => {
        if (!confirm('정말로 이 메모를 삭제하시겠습니까?')) return
        const supabase = createClient()
        const { error } = await supabase
            .from('mentoring_memos')
            .delete()
            .eq('id', memoId)

        if (!error) {
            setMemos(memos.filter(m => m.id !== memoId))
        }
    }

    if (loading) {
        return <div className="p-20 text-center animate-pulse text-slate-400">기업 정보를 불러오는 중입니다...</div>
    }

    if (!userProfile) return null

    // --- Helpers for Progress Bar UI ---
    const getProgressBarColor = (score: number) => {
        if (score >= 80) return 'bg-emerald-500'   // High
        if (score >= 60) return 'bg-amber-400'     // Mid
        return 'bg-rose-500'                       // Low
    }
    const getStatusIcon = (score: number) => {
        if (score >= 80) return <Trophy size={16} className="text-emerald-500 shrink-0" />
        if (score >= 60) return <CheckCircle2 size={16} className="text-amber-500 shrink-0" />
        return <Wrench size={16} className="text-rose-500 shrink-0" />
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin/users')} className="h-10 w-10 shrink-0 rounded-full text-slate-500 hover:bg-slate-100 mt-1 md:mt-0">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {userProfile.company_name || '회사명 미기재'}
                            </h1>
                            {latestRecord && (
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 font-bold border-indigo-200">
                                    진단 완료
                                </Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm text-slate-600 font-medium">
                            <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {userProfile.email}</span>
                            <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-slate-400" /> {userProfile.projects?.name || '소속 사업 없음'}</span>
                            <span className="flex items-center gap-1.5"><Building2 size={14} className="text-slate-400" /> {userProfile.groups?.name || '소속 그룹 없음'}</span>
                        </div>
                    </div>
                </div>
                {latestRecord && (
                    <div className="md:text-right bg-slate-50 px-5 py-3 rounded-xl border border-slate-100 shrink-0">
                        <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">종합 진단 점수</p>
                        <div className="text-3xl font-black text-indigo-600">
                            {latestRecord.total_score || 0}<span className="text-lg text-slate-400 font-bold ml-1">점</span>
                        </div>
                    </div>
                )}
            </div>

            <Tabs defaultValue="diagnosis" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6 shadow-sm border border-slate-200 h-12 bg-white rounded-xl overflow-hidden p-1">
                    <TabsTrigger value="diagnosis" className="font-bold gap-2 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white h-full">
                        <Target size={16} /> 진단 상세 결과
                    </TabsTrigger>
                    <TabsTrigger value="memos" className="font-bold gap-2 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white h-full">
                        <FileText size={16} /> 멘토링 메모
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="diagnosis" className="space-y-6 mt-0 outline-none">
                    {!latestRecord ? (
                        <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                            <AlertTriangle size={40} className="text-slate-300 mb-4" />
                            <p className="font-medium text-lg text-slate-600">아직 진단을 진행하지 않은 기업입니다.</p>
                            <p className="text-sm mt-2">기업에 진단 참여를 독려해 주세요.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 1. Progress Bar UI for D1-D7 */}
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Target size={18} className="text-indigo-600" />
                                        항목별 정밀 분석
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 space-y-5">
                                    {Object.keys(DIMENSION_LABELS).map(key => {
                                        const score = latestRecord?.dimension_scores?.[key] || 0
                                        const colorClass = getProgressBarColor(score)
                                        return (
                                            <div key={key} className="space-y-2 group">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-bold text-slate-700 flex items-center gap-2">
                                                        {getStatusIcon(score)}
                                                        {DIMENSION_LABELS[key]}
                                                    </span>
                                                    <span className="font-black text-slate-800">{score}<span className="text-slate-400 text-xs ml-0.5 font-semibold">점</span></span>
                                                </div>
                                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
                                                        style={{ width: `${score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>

                            {/* 2. 3-Section Layout */}
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <FileText size={18} className="text-indigo-600" />
                                        종합 진단 코멘트
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100">
                                        {/* Section A: 현황 진단 */}
                                        <div className="p-5 space-y-3">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                                <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                                                현황 진단
                                            </h4>
                                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-4 font-medium">
                                                현재 {userProfile.company_name}의 비즈니스 모델은 시장 검증 단계에 진입하였으나, 조직 및 인사 관리에 있어 정교한 체계가 부족한 상태입니다. 기술 R&D 역량은 우수하여 단기 성과를 창출할 잠재력이 높습니다.
                                            </p>
                                        </div>
                                        {/* Section B: 전문가 제언 */}
                                        <div className="p-5 space-y-3">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                                <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                                                전문가 제언
                                            </h4>
                                            <p className="text-sm text-slate-600 leading-relaxed bg-emerald-50/50 rounded-lg p-4 font-medium border border-emerald-100/50">
                                                초기 핵심 멤버들의 이탈을 방지하기 위한 성과 보상 체계(스톡옵션 등)를 우선적으로 구체화할 것을 권장합니다. 아울러 부족한 ESG 지표 개선을 위해 지역 사회 기여 활동이나 사내 친환경 정책 도입을 검토해 보시기 바랍니다.
                                            </p>
                                        </div>
                                        {/* Section C: 용어 설명 */}
                                        <div className="p-5 space-y-3">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                                <span className="w-1.5 h-4 bg-slate-300 rounded-full"></span>
                                                용어 설명 (*)
                                            </h4>
                                            <ul className="text-xs text-slate-500 space-y-2 bg-slate-50 rounded-lg p-4">
                                                <li className="flex items-start gap-2">
                                                    <Info size={14} className="mt-0.5 shrink-0 text-slate-400" />
                                                    <span><strong className="text-slate-700">스톡옵션(Stock Option):</strong> 임직원에게 일정 수량의 회사 주식을 일정한 가격으로 매수할 수 있는 권리를 부여하는 제도.</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <Info size={14} className="mt-0.5 shrink-0 text-slate-400" />
                                                    <span><strong className="text-slate-700">ESG 경영:</strong> 환경보호(Environment), 사회공헌(Social), 윤리경영(Governance)을 고려하는 기업 성과 지표.</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="memos" className="mt-0 outline-none">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Edit size={18} className="text-indigo-600" />
                                전담 전문가 멘토링 메모
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Write New Memo */}
                            <div className="mb-8">
                                <div className="border border-indigo-100 bg-indigo-50/30 rounded-xl p-1 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                                    <textarea
                                        rows={3}
                                        placeholder="기업에 대한 정성적 평가나 멘토링 기록을 남겨주세요."
                                        className="w-full bg-transparent border-none outline-none resize-none p-4 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                                        value={newMemo}
                                        onChange={(e) => setNewMemo(e.target.value)}
                                    />
                                    <div className="flex justify-end p-2 border-t border-indigo-100/50 bg-white rounded-b-lg">
                                        <Button onClick={handleAddMemo} className="bg-indigo-600 hover:bg-indigo-700 font-bold gap-2 shadow-sm rounded-lg" size="sm">
                                            <Plus size={16} /> 메모 등록
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Memo List */}
                            <div className="space-y-4">
                                {memos.length === 0 ? (
                                    <p className="text-center text-slate-400 text-sm py-10 font-medium">등록된 멘토링 메모가 없습니다.</p>
                                ) : (
                                    memos.map(memo => (
                                        <div key={memo.id} className="group relative bg-white p-5 border border-slate-200 rounded-xl shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                                        {memo.author?.user_name?.charAt(0) || '운'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{memo.author?.user_name || '운영자'}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{new Date(memo.created_at).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                {(currentUser?.id === memo.author_id || currentUser?.role === 'super_admin') && (
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMemo(memo.id)} className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed px-1">
                                                {memo.content}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
