'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building, User, Calendar, ChevronRight, ChevronDown, CheckCircle2, BookOpen, Plus } from 'lucide-react'
import { getGradeInfo } from '@/data/feedback'
import DeleteRecordButton from '@/components/dashboard/DeleteRecordButton'

interface Record {
    id: string
    total_score: number
    created_at: string
    stage_result: string
    company_name?: string
}

interface Props {
    records: Record[]
    profileName?: string
    profileCompany?: string
}

export default function DiagnosisHistoryList({ records, profileName, profileCompany }: Props) {
    const router = useRouter()

    if (!records || records.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-6">
                    <Plus className="h-10 w-10 text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">아직 진행된 진단이 없습니다</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    우리 기업의 현재 상태가 궁금하신가요? <br />
                    7가지 차원의 정밀 진단을 시작해보세요.
                </p>
                <Link href="/diagnosis">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 h-auto rounded-xl text-lg shadow-lg shadow-indigo-200">
                        첫 진단 시작하기
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {records.map((record) => {
                const stageInfo = getGradeInfo(record.total_score)

                return (
                    <div key={record.id} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 relative">
                        {/* Main Card Row - Fully Clickable */}
                        <div 
                            onClick={() => router.push(`/report/${record.id}`)}
                            className="flex items-center h-[88px] cursor-pointer"
                        >
                            {/* Score */}
                            <div className="w-[88px] h-full flex flex-col items-center justify-center border-r border-gray-100 bg-gray-50 flex-shrink-0 group-hover:bg-indigo-50/30 transition-colors">
                                <span className={`text-[26px] font-bold tracking-tight ${record.total_score >= 80 ? 'text-green-600' : record.total_score >= 50 ? 'text-indigo-600' : 'text-rose-500'}`}>
                                    {record.total_score.toFixed(1)}<span className="text-sm font-normal text-gray-400 ml-0.5">점</span>
                                </span>
                            </div>
 
                            {/* Content */}
                            <div className="flex-grow px-4 py-2 flex justify-between items-center min-w-0">
                                <div className="min-w-0">
                                    <h4 className="text-[15px] font-bold mb-0.5 group-hover:text-indigo-600 transition-colors text-gray-900">
                                        {stageInfo.stageName}
                                    </h4>
                                    <p className="text-gray-500 text-[11px] line-clamp-1 mb-1.5">{stageInfo.shortDesc}</p>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Building className="h-3 w-3" />
                                            <span className="max-w-[80px] truncate">{record.company_name || profileCompany || '회사명 미상'}</span>
                                        </div>
                                        <div className="w-px h-2 bg-gray-300" />
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            <span className="max-w-[60px] truncate">{profileName || '사용자'}</span>
                                        </div>
                                        <div className="w-px h-2 bg-gray-300" />
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{new Date(record.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
 
                                <div className="flex items-center gap-2 shrink-0 ml-3 z-10">
                                    <div onClick={(e) => e.preventDefault()}>
                                        <DeleteRecordButton recordId={record.id} />
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                                </div>
                            </div>
                        </div>

                    </div>
                )
            })}
        </div>
    )
}
