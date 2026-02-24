'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Building2, CheckCircle2, Circle, Link as LinkIcon, ExternalLink, Copy } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface ParticipantsTableProps {
    projectId: string
    projectRound?: number
}

export default function ParticipantsTable({ projectId, projectRound = 1 }: ParticipantsTableProps) {
    const [participants, setParticipants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [projectDetails, setProjectDetails] = useState<any>(null)
    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'unresponded' | 'low_score'>('all')

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

            // 2. Fetch diagnosis records for these users to determine completion status for the SPECIFIC ROUND
            const userIds = profiles.map(p => p.id)
            const { data: recordsData } = await supabase
                .from('diagnosis_records')
                .select('user_id, created_at, total_score')
                .in('user_id', userIds)
                .eq('round', projectRound)
                .eq('project_id', projectId)

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

            // 3. Fetch project details for email context
            const { data: projectData } = await supabase
                .from('projects')
                .select('name')
                .eq('id', projectId)
                .single()
            if (projectData) {
                setProjectDetails(projectData)
            }

            setParticipants(merged)
            setLoading(false)
        }

        if (projectId) {
            fetchParticipants()
        }
    }, [projectId, projectRound])

    const copyMagicLink = (token: string, companyName: string) => {
        if (!token) {
            alert('매직 링크 토큰이 없습니다. 관리자에게 문의하세요.');
            return;
        }
        // In a real app, this would be the actual domain
        const baseUrl = window.location.origin;
        const magicLink = `${baseUrl}/diagnosis?token=${token}&round=${projectRound}`;

        navigator.clipboard.writeText(magicLink).then(() => {
            alert(`${companyName}의 ${projectRound}차 진단 전용 링크가 복사되었습니다.\n\n${magicLink}`);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('링크 복사에 실패했습니다.');
        });
    }

    const sendReminderEmail = async (participant: any) => {
        if (!participant.email || !participant.magic_link_token) {
            toast.error('메일 주소 또는 매직 링크가 없습니다.')
            return;
        }

        setSendingEmailId(participant.id);
        const baseUrl = window.location.origin;
        const magicLink = `${baseUrl}/diagnosis?token=${participant.magic_link_token}&round=${projectRound}`;

        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: participant.email,
                    companyName: participant.company_name || '기업',
                    projectName: projectDetails?.name || '지원사업',
                    projectRound: projectRound,
                    magicLink: magicLink
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(`${participant.company_name} 담당자에게 리마인드 메일을 발송했습니다.`)
            } else {
                throw new Error(data.error || '발송 실패');
            }
        } catch (error: any) {
            console.error('Mail error:', error);
            toast.error(`메일 발송 실패: ${error.message}`)
        } finally {
            setSendingEmailId(null);
        }
    }

    const sendBatchReminders = async () => {
        const unprotectedParticipants = participants.filter(p => p.diagnosisCount === 0);

        if (unprotectedParticipants.length === 0) {
            toast.info('미제출 기업이 없습니다.');
            return;
        }

        if (!confirm(`${unprotectedParticipants.length}개 기업에 독려 메일을 일괄 발송하시겠습니까?`)) {
            return;
        }

        toast.loading(`${unprotectedParticipants.length}개 기업에 메일을 발급/발송 중입니다...`, { id: 'batch-email' });

        let successCount = 0;
        let failCount = 0;

        for (const p of unprotectedParticipants) {
            try {
                const baseUrl = window.location.origin;
                const magicLink = `${baseUrl}/diagnosis?token=${p.magic_link_token}&round=${projectRound}`;

                const res = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: p.email,
                        companyName: p.company_name || '기업',
                        projectName: projectDetails?.name || '지원사업',
                        projectRound: projectRound,
                        magicLink: magicLink
                    })
                });
                if (res.ok) successCount++;
                else failCount++;
            } catch (err) {
                failCount++;
            }
        }

        toast.dismiss('batch-email');
        toast.success(`일괄 발송 완료: 성공 ${successCount}건, 실패 ${failCount}건`);
    }

    if (loading) {
        return <div className="p-10 text-center text-slate-400 font-medium">참여 기업을 불러오는 중...</div>
    }

    return (
        <Card className="border-none shadow-sm bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        참여 기업 목록
                        <Badge variant="secondary" className="bg-white border-slate-200 text-indigo-600 px-2 py-0.5 ml-2">
                            {participants.length}개사
                        </Badge>
                    </h3>

                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 ml-2">
                        <Button
                            size="sm"
                            variant={filter === 'all' ? 'secondary' : 'ghost'}
                            onClick={() => setFilter('all')}
                            className={`h-7 text-xs font-bold px-3 ${filter === 'all' ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'text-slate-500'}`}
                        >
                            전체
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'unresponded' ? 'secondary' : 'ghost'}
                            onClick={() => setFilter('unresponded')}
                            className={`h-7 text-xs font-bold px-3 ${filter === 'unresponded' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'text-slate-500'}`}
                        >
                            미응답
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'low_score' ? 'secondary' : 'ghost'}
                            onClick={() => setFilter('low_score')}
                            className={`h-7 text-xs font-bold px-3 ${filter === 'low_score' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'text-slate-500'}`}
                        >
                            주의(저득점)
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={sendBatchReminders}
                        className="text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200"
                    >
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                        미응답 기업 전체 독려
                    </Button>
                </div>
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
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">전용 링크</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {participants
                                .filter(p => {
                                    if (filter === 'unresponded') return p.diagnosisCount === 0;
                                    if (filter === 'low_score') return p.diagnosisCount > 0 && (p.latestRecord?.total_score || 0) < 60;
                                    return true;
                                })
                                .map((p) => (
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
                                        <td className="px-6 py-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyMagicLink(p.magic_link_token, p.company_name)}
                                                className="h-8 gap-1.5 text-xs text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-indigo-600"
                                                title="기업 전용 진단 링크 복사"
                                            >
                                                <LinkIcon size={13} />
                                                링크 복사
                                            </Button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {p.diagnosisCount === 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => sendReminderEmail(p)}
                                                        disabled={sendingEmailId === p.id}
                                                        className="h-9 gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-100 rounded-lg transition-all border border-transparent mr-1"
                                                    >
                                                        <Mail size={14} />
                                                        {sendingEmailId === p.id ? '발송 중...' : '독려 메일'}
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
