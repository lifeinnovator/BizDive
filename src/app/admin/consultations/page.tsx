'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, Search, Building2, UserCircle, Phone, Mail, Calendar, MessageSquare, ExternalLink } from 'lucide-react'

type Consultation = {
    id: string
    company_name: string
    contact_name: string
    contact_phone: string
    contact_email: string
    topics: string[]
    message: string
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
    created_at: string
}

const statusMap = {
    pending: { label: '접수 대기', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    assigned: { label: '매칭 완료', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    in_progress: { label: '상담 진행중', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    completed: { label: '완료', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    cancelled: { label: '취소/보류', color: 'bg-slate-100 text-slate-700 border-slate-200' },
}

const topicLabels: Record<string, string> = {
    business_strategy: '비즈니스 전략',
    funding: '투자/자금',
    marketing: '마케팅/영업',
    hr_org: '인사/조직',
    product: '제품/기술',
    other: '기타'
}

export default function ConsultationsAdminPage() {
    const [consultations, setConsultations] = useState<Consultation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchConsultations()
    }, [])

    const fetchConsultations = async () => {
        setIsLoading(true)
        const supabase = createClient()
        const { data, error } = await supabase
            .from('consultations')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching consultations:', error)
        } else {
            setConsultations(data || [])
        }
        setIsLoading(false)
    }

    const updateStatus = async (id: string, newStatus: string) => {
        const supabase = createClient()
        const { error } = await supabase
            .from('consultations')
            .update({ status: newStatus })
            .eq('id', id)

        if (!error) {
            setConsultations(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c))
        } else {
            alert('상태 업데이트에 실패했습니다.')
        }
    }

    const filteredConsultations = consultations.filter(c =>
        c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contact_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 mt-12">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
                <span className="ml-3 text-slate-500 font-medium">데이터를 불러오는 중입니다...</span>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="text-indigo-600" size={24} />
                        전문가 매칭 신청 관리
                    </h1>
                    <p className="text-slate-500 mt-1">접수된 모든 컨설팅 상담 신청 내역을 확인하고 상태를 변경합니다.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="기업명 또는 담당자 검색"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-6 py-4">신청 기업 / 담당자</th>
                                <th className="px-6 py-4">연락처 / 이메일</th>
                                <th className="px-6 py-4">신청 주제</th>
                                <th className="px-6 py-4">상태 관리</th>
                                <th className="px-6 py-4 text-right">신청일</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredConsultations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <MessageSquare size={32} className="text-slate-300 mb-2" />
                                            <p className="text-base font-medium text-slate-600">접수된 신청 내역이 없습니다</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredConsultations.map(consult => (
                                    <tr key={consult.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-bold text-slate-800 text-base mb-1 flex items-center gap-1.5">
                                                <Building2 size={16} className="text-slate-400" />
                                                {consult.company_name}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-[13px]">
                                                <UserCircle size={14} />
                                                {consult.contact_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="space-y-1.5 text-[13px]">
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-slate-400" />
                                                    {consult.contact_phone}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-slate-400" />
                                                    <a href={`mailto:${consult.contact_email}`} className="hover:text-indigo-600 transition-colors">
                                                        {consult.contact_email}
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                {consult.topics.map(topic => (
                                                    <span key={topic} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium tracking-wide">
                                                        {topicLabels[topic] || topic}
                                                    </span>
                                                ))}
                                            </div>
                                            {consult.message && (
                                                <div className="text-[12px] text-slate-500 bg-slate-50 p-2.5 rounded-md border border-slate-100 line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                                                    <span className="font-semibold text-slate-600 block mb-0.5">요청 메시지:</span>
                                                    {consult.message}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <select
                                                value={consult.status}
                                                onChange={(e) => updateStatus(consult.id, e.target.value)}
                                                className={`text-sm px-3 py-1.5 rounded-md border font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer w-full max-w-[140px] appearance-none ${statusMap[consult.status as keyof typeof statusMap]?.color || 'bg-white border-slate-200'}`}
                                            >
                                                <option value="pending">🟡 접수 대기</option>
                                                <option value="assigned">🔵 배정 완료</option>
                                                <option value="in_progress">🟣 상담 진행중</option>
                                                <option value="completed">🟢 완료</option>
                                                <option value="cancelled">⚪️ 취소/보류</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 align-top text-right text-slate-400 text-[13px]">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Calendar size={14} />
                                                {new Date(consult.created_at).toLocaleDateString('ko-KR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="mt-1 text-slate-300">
                                                {new Date(consult.created_at).toLocaleTimeString('ko-KR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
