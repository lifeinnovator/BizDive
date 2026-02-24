'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Building2, CheckCircle2, Circle, MoreHorizontal, ExternalLink, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface ParticipantsTableProps {
    projectId: string
}

export default function ParticipantsTable({ projectId }: ParticipantsTableProps) {
    const [participants, setParticipants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchParticipants = async () => {
            const supabase = createClient()

            // 1. Fetch profiles belonging to this project
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false })

            if (error) {
                console.error("Error fetching participants:", error)
                setLoading(false)
                return
            }

            if (!profiles || profiles.length === 0) {
                setParticipants([])
                setLoading(false)
                return
            }

            // 2. Fetch diagnosis records for these users to determine completion status
            const userIds = profiles.map(p => p.id)
            const { data: recordsData } = await supabase
                .from('diagnosis_records')
                .select('user_id, created_at, total_score')
                .in('user_id', userIds)

            // Map records to profiles
            const merged = profiles.map(p => {
                const userRecords = recordsData?.filter(r => r.user_id === p.id) || []
                return {
                    ...p,
                    diagnosisCount: userRecords.length,
                    latestRecord: userRecords.length > 0
                        ? userRecords.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                        : null
                }
            })

            setParticipants(merged)
            setLoading(false)
        }

        if (projectId) {
            fetchParticipants()
        }
    }, [projectId])

    if (loading) {
        return <div className="p-10 text-center text-slate-400 font-medium">참여 기업을 불러오는 중...</div>
    }

    return (
        <Card className="border-none shadow-sm bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    참여 기업 목록
                    <Badge variant="secondary" className="bg-white border-slate-200 text-indigo-600 px-2 py-0.5 ml-2">
                        {participants.length}개사
                    </Badge>
                </h3>
            </div>

            {participants.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-slate-50/30 rounded-b-xl border-dashed border-t-0">
                    <Building2 size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="font-medium text-sm">해당 그룹(사업)에 배정된 기업이 없습니다.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">기업명 / 이메일</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">담당자</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">진단 제출 여부</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">최근 제출일</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {participants.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="space-y-1 my-1">
                                            <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 line-clamp-1">
                                                <Building2 size={15} className="text-indigo-500" />
                                                {p.company_name || '회사명 미기재'}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                                                <Mail size={12} className="text-slate-400" />
                                                {p.email}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700 font-semibold">
                                        {p.user_name || '미기재'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.diagnosisCount > 0 ? (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold gap-1.5 py-1">
                                                <CheckCircle2 size={13} />
                                                제출 완료
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 font-bold gap-1.5 py-1">
                                                <Circle size={13} strokeWidth={3} />
                                                미제출
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                        {p.latestRecord ? new Date(p.latestRecord.created_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {p.diagnosisCount === 0 && (
                                                <Button variant="ghost" size="sm" className="h-9 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-100 rounded-lg transition-all border border-transparent mr-1">
                                                    독려 메일
                                                </Button>
                                            )}
                                            <Link href={`/admin/users/${p.id}`}>
                                                <Button variant="ghost" size="icon" title="상세 정보" className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm shadow-slate-200/50 rounded-xl transition-all border border-transparent hover:border-slate-200">
                                                    <ExternalLink size={16} />
                                                </Button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    )
}
