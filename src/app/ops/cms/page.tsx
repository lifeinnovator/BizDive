'use client'

import React, { useState, useEffect } from 'react'
import {
    Search,
    Filter,
    Plus,
    Save,
    RotateCcw,
    Edit2,
    Trash2,
    Settings2,
    ChevronDown,
    Info,
    Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { fetchAllQuestions, updateQuestionDirect, Question } from '@/lib/cms-logic'
import { toast } from 'sonner'

const mockQuestions: any[] = [] // Removed actual mock data

export default function CMSPage() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const router = useRouter()

    React.useEffect(() => {
        const init = async () => {
            const { createClient } = await import('@/lib/supabase')
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            let profileRole = null
            if (user) {
                setUserId(user.id)
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                profileRole = profileData?.role || null
                setUserRole(profileRole)

                // Path Protection: Only super_admin can stay here
                if (profileRole !== 'super_admin') {
                    toast.error('권한이 없습니다. 최고 관리자 전용 메뉴입니다.')
                    router.push('/admin/projects')
                    return
                }
            } else {
                router.push('/admin') // Redirect to login if no user
                return
            }

            try {
                const data = await fetchAllQuestions()
                setQuestions(data)
            } catch (err) {
                console.error(err)
                toast.error('질문 데이터를 불러오는데 실패했습니다.')
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [router])



    const filteredQuestions = questions.filter((q: Question) =>
        q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">진단 로직 CMS</h1>
                    <p className="text-slate-500 mt-1 font-medium">질문 문항, 가중치 및 피드백 로직을 관리합니다.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 text-slate-600 border-slate-200 bg-white hover:bg-slate-50 rounded-xl h-11">
                        <RotateCcw size={18} />
                        변경사항 초기화
                    </Button>
                    <Button className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 h-11 px-6 rounded-xl">
                        <Save size={18} />
                        전체 저장
                    </Button>
                </div>
            </div>

            {/* Control Panel */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-4 flex flex-col lg:flex-row gap-4">
                    <div className="flex-grow flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="질문 내용이나 ID로 검색..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 font-medium"
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <select className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                            <option>모든 차원(D1~D7)</option>
                            <option>D1. 시장분석</option>
                            <option>D2. 사업모델</option>
                        </select>
                        <Button variant="outline" className="gap-2 font-bold text-slate-500 border-slate-200 h-11 rounded-xl">
                            <Filter size={16} />
                            분류 필터
                        </Button>
                        <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800 h-11 rounded-xl">
                            <Plus size={18} />
                            문항 추가
                        </Button>
                    </div>
                </CardContent>
            </Card>



            {/* Editor List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 className="h-10 w-10 animate-spin mb-4" />
                        <p>문항 데이터를 불러오는 중...</p>
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400">검색 결과가 없습니다.</p>
                    </div>
                ) : (
                    filteredQuestions.map((q: Question) => (
                        <Card key={q.id} className={`border-none shadow-sm transition-all duration-300 ${isEditing === q.id ? 'ring-2 ring-indigo-500 shadow-xl' : 'hover:shadow-md'}`}>
                            <CardContent className="p-0">
                                <div className="flex items-stretch overflow-hidden rounded-xl">
                                    {/* Side Tag */}
                                    <div className={`w-2 ${q.dimension === 'D1' ? 'bg-blue-500' :
                                        q.dimension === 'D2' ? 'bg-indigo-500' :
                                            q.dimension === 'D4' ? 'bg-emerald-500' : 'bg-slate-300'
                                        }`} />

                                    <div className="flex-grow p-6">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="space-y-3 flex-grow">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="font-bold text-slate-400 border-slate-200">{q.id}</Badge>
                                                    <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-bold uppercase text-[10px]">
                                                        {q.category} {q.mapping_code && `(${q.mapping_code})`}
                                                    </Badge>
                                                </div>

                                                {isEditing === q.id ? (
                                                    <textarea
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                        defaultValue={q.content}
                                                        rows={2}
                                                    />
                                                ) : (
                                                    <h3 className="text-lg font-bold text-slate-800 leading-snug">{q.content}</h3>
                                                )}

                                                <div className="flex flex-wrap items-center gap-6 mt-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">가중치</span>
                                                        {isEditing === q.id ? (
                                                            <input type="number" step="0.1" className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold" defaultValue={q.score_weight || 1} />
                                                        ) : (
                                                            <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{q.score_weight || 1}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-grow max-w-md">
                                                        <Info size={14} className="text-slate-300 shrink-0" />
                                                        <p className="text-xs text-slate-400 font-medium italic truncate">{q.rationale}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex md:flex-col gap-2 shrink-0">
                                                {isEditing === q.id ? (
                                                    <Button
                                                        onClick={() => setIsEditing(null)}
                                                        className="bg-emerald-600 text-white hover:bg-emerald-700 h-10 px-4 rounded-xl font-bold"
                                                    >
                                                        완료
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsEditing(q.id)}
                                                        className="h-10 w-10 p-0 border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100"
                                                    >
                                                        <Edit2 size={18} />
                                                    </Button>
                                                )}
                                                <Button variant="outline" className="h-10 w-10 p-0 border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100">
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>


            {/* Footer Info */}
            <div className="bg-slate-900/5 rounded-2xl p-6 border border-dashed border-slate-200">
                <div className="flex gap-4">
                    <Settings2 className="text-slate-400 shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-slate-700">고급 로직 설정</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            현재 총 762개의 문항이 등록되어 있습니다. 가중치의 합은 100%를 기준으로 정규화되며,
                            변경사항은 실시간으로 저장되지 않고 상단의 '전체 저장' 버튼을 눌러야 최종 반영됩니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
