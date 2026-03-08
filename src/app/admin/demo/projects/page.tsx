'use client';

import React from 'react';
import { 
    Search, 
    Plus, 
    MoreHorizontal, 
    Filter,
    Briefcase,
    Calendar,
    Users,
    ClipboardCheck,
    ChevronRight,
    BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const MOCK_PROJECTS = [
    {
        id: '1',
        name: '2026 스타트업 스케일업 지원사업',
        period: '2026.03.01 ~ 2026.12.31',
        companies: 42,
        diagnoses: 42,
        avgScore: 72.5,
        status: '진행중',
        type: '기술성장 지원'
    },
    {
        id: '2',
        name: '지역 소상공인 디지털 전환 컨설팅',
        period: '2026.04.15 ~ 2026.08.30',
        companies: 35,
        diagnoses: 35,
        avgScore: 64.2,
        status: '모집완료',
        type: '디지털 전환'
    },
    {
        id: '3',
        name: 'ICT 융합 글로벌 진출 지원 프로그램',
        period: '2026.01.10 ~ 2026.11.20',
        companies: 65,
        diagnoses: 51,
        avgScore: 68.9,
        status: '진행중',
        type: '글로벌/수출'
    },
    {
        id: '4',
        name: '2025 청년창업 사관학교 (졸업사업)',
        period: '2025.01.01 ~ 2025.12.31',
        companies: 120,
        diagnoses: 240,
        avgScore: 78.4,
        status: '종료',
        type: '창업교육'
    }
];

export default function AdminDemoProjects() {
    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">사업 관리</h2>
                    <p className="text-[14px] text-slate-400 font-medium mt-1">우리 기관에서 주관하는 지원 사업과 진단 프로젝트를 관리합니다.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all">
                    <Plus size={18} />
                    새 프로젝트 개설
                </Button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                        placeholder="프로젝트명, 주관부서 검색..." 
                        className="pl-10 h-11 bg-slate-50 border-none rounded-xl focus-visible:ring-indigo-500 font-medium text-[13px]"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" className="h-11 border-slate-200 text-slate-600 font-bold px-4 rounded-xl flex-1 md:flex-none">
                        <Filter size={16} className="mr-2" />
                        필터
                    </Button>
                    <select className="h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-[13px] font-bold text-slate-600 outline-none focus:ring-1 ring-indigo-500 flex-1 md:flex-none">
                        <option>전체 상태</option>
                        <option>진행중</option>
                        <option>종료</option>
                    </select>
                </div>
            </div>

            {/* Projects List View */}
            <div className="grid grid-cols-1 gap-4">
                {MOCK_PROJECTS.map((project) => (
                    <Card key={project.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden group cursor-pointer border border-transparent hover:border-indigo-100">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row md:items-center p-6 md:p-8 gap-6">
                                {/* Status & Icon */}
                                <div className="flex flex-row md:flex-col items-center md:items-center justify-between md:justify-center gap-3 md:w-32 py-2 px-4 md:px-0 bg-slate-50/50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                                    <div className={`p-3 rounded-xl bg-white shadow-sm text-indigo-600`}>
                                        <Briefcase size={24} />
                                    </div>
                                    <Badge className={`
                                        ${project.status === '진행중' ? 'bg-indigo-600' : 
                                          project.status === '종료' ? 'bg-slate-400' : 'bg-emerald-500'} 
                                        text-white border-none font-bold text-[10px] px-2.5 py-0.5 h-auto
                                    `}>
                                        {project.status}
                                    </Badge>
                                </div>

                                {/* Project Info */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5 overflow-hidden">
                                        <Badge variant="outline" className="text-[10px] font-bold text-indigo-400 border-indigo-100 bg-indigo-50/30 px-2 py-0">
                                            {project.type}
                                        </Badge>
                                        <span className="text-slate-300 text-xs font-bold">•</span>
                                        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">ID: PJ-{1000 + Number(project.id)}</span>
                                    </div>
                                    <h3 className="text-[18px] font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors truncate">
                                        {project.name}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-3 text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span className="text-[12px] font-medium">{project.period}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Summary */}
                                <div className="grid grid-cols-3 md:flex items-center gap-4 md:gap-10 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-10">
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Companies</p>
                                        <div className="flex items-center justify-center md:justify-start gap-1.5">
                                            <Users size={14} className="text-slate-300" />
                                            <span className="text-[15px] font-black text-slate-700">{project.companies}</span>
                                        </div>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Diagnoses</p>
                                        <div className="flex items-center justify-center md:justify-start gap-1.5">
                                            <ClipboardCheck size={14} className="text-slate-300" />
                                            <span className="text-[15px] font-black text-slate-700">{project.diagnoses}</span>
                                        </div>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Score</p>
                                        <div className="flex items-center justify-center md:justify-start gap-1">
                                            <span className="text-[18px] font-black text-indigo-600 leading-none">{project.avgScore}</span>
                                            <span className="text-[10px] font-bold text-indigo-300 mt-1">PT</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action button */}
                                <div className="hidden lg:block ml-4">
                                     <Button variant="ghost" size="icon" className="text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                                        <ChevronRight size={20} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bottom Info */}
            <div className="flex items-center justify-center py-6">
                <p className="text-[12px] text-slate-400 font-medium">데모 화면에서는 프로젝트 상세보기 및 데이터 수정이 지원되지 않습니다.</p>
            </div>
        </div>
    );
}
