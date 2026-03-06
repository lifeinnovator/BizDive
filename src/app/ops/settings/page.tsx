'use client'

import React from 'react'
import {
    User,
    Shield,
    Bell,
    Smartphone,
    Settings as SettingsIcon,
    LogOut,
    ChevronRight,
    Globe,
    Database,
    Lock,
    Mail
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">환경 설정</h1>
                    <p className="text-slate-500 mt-1 font-medium">관리자 계정 정보와 시스템 알림 설정을 관리합니다.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Aspect: Profile */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600" />
                        <CardContent className="px-6 pb-6 text-center -mt-12">
                            <div className="inline-block p-1 bg-white rounded-full shadow-lg mb-4">
                                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <User size={40} />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-slate-800">최고 관리자</h3>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Super Admin Account</p>
                            <div className="flex items-center justify-center gap-1.5 mt-4 text-slate-400">
                                <Mail size={14} />
                                <span className="text-sm font-medium">admin@bizdive.kr</span>
                            </div>
                            <Button variant="outline" className="w-full mt-8 gap-2 font-bold border-slate-200 rounded-xl">
                                프로필 수정
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-indigo-900 text-white p-6">
                        <div className="flex items-start gap-4">
                            <Shield className="text-indigo-400 shrink-0" size={24} />
                            <div>
                                <h4 className="font-black text-white">보안 상태 우수</h4>
                                <p className="text-indigo-200 text-xs mt-1 leading-relaxed">
                                    마지막 비밀번호 변경: 12일 전<br />
                                    2단계 인증(2FA) 활성화됨
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Aspect: Settings Sections */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="border-b border-slate-50">
                            <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <SettingsIcon size={20} className="text-indigo-600" />
                                시스템 설정
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50">
                                {[
                                    { icon: Bell, label: '알림 설정', desc: '진단 완료 및 신규 가입 알림 관리', color: 'text-blue-500', bg: 'bg-blue-50' },
                                    { icon: Smartphone, label: '모바일 연동', desc: '푸시 알림 및 모바일 전용 UI 설정', color: 'text-purple-500', bg: 'bg-purple-50' },
                                    { icon: Globe, label: '서비스 정보', desc: '이용 약관 및 개인정보 처리방침 수정', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                    { icon: Database, label: '데이터 백업', desc: '진단 데이터 주기적 백업 자동화 설정', color: 'text-amber-500', bg: 'bg-amber-50' },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                                                <item.icon size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{item.label}</p>
                                                <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="border-b border-slate-50">
                            <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <Lock size={20} className="text-rose-500" />
                                계정 및 보안
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-sm font-bold text-slate-800">세션 관리</p>
                                    <p className="text-[11px] text-slate-400">현재 브라우저 외 다른 기기 로그인 해제</p>
                                </div>
                                <Button variant="outline" size="sm" className="bg-white border-slate-200 text-xs font-bold">전체 로그아웃</Button>
                            </div>
                            <Button variant="ghost" className="w-full text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-black gap-2 h-12 rounded-xl">
                                <LogOut size={18} />
                                관리자 로그아웃
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
