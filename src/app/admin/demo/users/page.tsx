'use client';

import React from 'react';
import { 
    Search, 
    UserPlus, 
    MoreVertical, 
    Mail, 
    ShieldCheck, 
    Building2,
    Calendar,
    ArrowUpRight,
    SearchX,
    Filter,
    Download,
    Users,
    BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const MOCK_USERS = [
    {
        id: '1',
        name: '김혁진',
        email: 'ceo@techstartup.co',
        company: '테크스타트업 (주)',
        role: '기업 관리자',
        joinDate: '2026.03.01',
        records: 2,
        avgScore: 86.5
    },
    {
        id: '2',
        name: '이지민',
        email: 'hello@localcreator.kr',
        company: '로컬크리에이터랩',
        role: '기업 관리자',
        joinDate: '2026.03.05',
        records: 1,
        avgScore: 72.0
    },
    {
        id: '3',
        name: '박서연',
        email: 'contact@ecoinno.com',
        company: '에코이노베이션',
        role: '기업 관리자',
        joinDate: '2026.03.08',
        records: 0,
        avgScore: 0
    },
    {
        id: '4',
        name: '최도훈',
        email: 'admin@fintechkr.io',
        company: '핀테크코리아',
        role: '기업 관리자',
        joinDate: '2026.02.20',
        records: 3,
        avgScore: 92.4
    },
    {
        id: '5',
        name: '강유리',
        email: 'info@nextstep.io',
        company: '넥스트스텝',
        role: '기업 관리자',
        joinDate: '2026.03.02',
        records: 1,
        avgScore: 77.8
    }
];

export default function AdminDemoUsers() {
    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">사용자 관리</h2>
                    <p className="text-[14px] text-slate-400 font-medium mt-1">기관 소속 멤버들과 지원 사업에 참여 중인 기업 관계자 목록입니다.</p>
                </div>
                <div className="flex items-center gap-2">
                     <Button variant="outline" className="h-11 px-5 border-slate-200 text-slate-600 font-bold rounded-xl flex items-center gap-2">
                        <Download size={16} />
                        엑셀 다운로드
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all">
                        <UserPlus size={18} />
                        멤버 초대하기
                    </Button>
                </div>
            </div>

            {/* Stats Summary Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-indigo-600 text-white p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 opacity-10 transform scale-150 rotate-12 transition-transform group-hover:rotate-0">
                        <Users size={120} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-indigo-100 text-[12px] font-bold uppercase tracking-widest mb-1.5 opacity-80">전체 소속 사용자</p>
                        <h3 className="text-3xl font-black">142<span className="text-sm font-bold ml-1 text-indigo-200">명</span></h3>
                        <div className="flex items-center gap-2 mt-4 text-[11px] font-bold py-1 px-3 bg-white/10 rounded-full w-fit">
                            <ArrowUpRight size={12} className="text-emerald-300" />
                            <span>최근 7일간 12명 가입</span>
                        </div>
                    </div>
                </Card>

                <Card className="border-none shadow-sm bg-white p-6 rounded-2xl flex flex-col justify-between">
                     <div>
                        <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest mb-1.5">활성 기업 관리자</p>
                        <h3 className="text-3xl font-black text-slate-800">128<span className="text-sm font-bold ml-1 text-slate-400">사</span></h3>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[85%] rounded-full"></div>
                    </div>
                </Card>

                <Card className="border-none shadow-sm bg-white p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                        <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest mb-1.5">미응답 기업</p>
                        <h3 className="text-3xl font-black text-rose-500">14<span className="text-sm font-bold ml-1 text-slate-400">사</span></h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-4">진단 요청 후 5일 이상 경과된 기업</p>
                </Card>
            </div>

            {/* List Table Area */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input 
                            placeholder="사용자 이름, 이메일, 업체명으로 검색..." 
                            className="pl-10 h-11 bg-slate-50 border-none rounded-xl font-medium text-[13px]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-11 px-4 border-slate-100 text-slate-400 bg-slate-50/50">
                            <Filter size={16} />
                        </Button>
                        <select className="h-11 bg-slate-50 border-none rounded-xl px-4 text-[13px] font-bold text-slate-600 outline-none min-w-[140px]">
                            <option>전체 권한</option>
                            <option>기관 관리자</option>
                            <option>기업 관리자</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/30 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-4">Full Name / Profile</th>
                                <th className="px-8 py-4">Company</th>
                                <th className="px-8 py-4">Status / Records</th>
                                <th className="px-8 py-4 text-right">Avg Score</th>
                                <th className="px-8 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {MOCK_USERS.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-xs">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[14px] font-bold text-slate-800">{user.name}</span>
                                                    <Badge className="bg-slate-100 text-slate-500 border-none text-[9px] h-4 flex items-center">{user.role}</Badge>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Mail size={12} className="text-slate-300" />
                                                    <span className="text-[12px] text-slate-400 font-medium">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={14} className="text-slate-300" />
                                            <span className="text-[13px] font-bold text-slate-600">{user.company}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px] font-bold text-slate-700">{user.records}건 제출</span>
                                                    {user.records > 0 && <BadgeCheck size={14} className="text-emerald-500" />}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium mt-0.5">가입일: {user.joinDate}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <span className={`text-[16px] font-black ${user.avgScore >= 80 ? 'text-indigo-600' : user.avgScore > 0 ? 'text-slate-700' : 'text-slate-300'}`}>
                                                {user.avgScore > 0 ? user.avgScore : '-'}
                                            </span>
                                            {user.avgScore > 0 && <span className="text-[10px] font-bold text-slate-300">PT</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
                    <Button variant="ghost" className="text-xs font-bold text-slate-400 hover:text-indigo-600">
                        가입된 전체 142명 목록 보기
                    </Button>
                </div>
            </div>
        </div>
    );
}
