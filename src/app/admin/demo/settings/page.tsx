'use client';

import React from 'react';
import { 
    Settings, 
    Bell, 
    Lock, 
    Eye, 
    Database, 
    Global, 
    Monitor,
    Shield,
    Smartphone,
    Save,
    UserCircle,
    Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export default function AdminDemoSettings() {
    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">시스템 설정</h2>
                    <p className="text-[14px] text-slate-400 font-medium mt-1">기관 정보, 알림 설정 및 플랫폼 환경을 관리합니다.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all">
                    <Save size={18} />
                    변경사항 저장
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Sidebar Links Mockup */}
                <div className="space-y-2">
                    <div className="bg-indigo-50 text-indigo-700 p-3 rounded-xl flex items-center gap-3 font-bold text-[13px] cursor-pointer">
                        <Building size={18} />
                        기관 프로필 설정
                    </div>
                    <div className="text-slate-500 hover:bg-white p-3 rounded-xl flex items-center gap-3 font-medium text-[13px] cursor-pointer transition-all">
                        <Bell size={18} />
                        알림 및 자동메일
                    </div>
                    <div className="text-slate-500 hover:bg-white p-3 rounded-xl flex items-center gap-3 font-medium text-[13px] cursor-pointer transition-all">
                        <Lock size={18} />
                        보안 및 접속 관리
                    </div>
                    <div className="text-slate-500 hover:bg-white p-3 rounded-xl flex items-center gap-3 font-medium text-[13px] cursor-pointer transition-all">
                        <Monitor size={18} />
                        플랫폼 테마 설정
                    </div>
                </div>

                {/* Main Settings Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Institution Profile */}
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden p-2">
                        <CardHeader className="px-6 pt-6 pb-2">
                            <CardTitle className="text-lg font-black text-slate-800">기관 프로필</CardTitle>
                            <CardDescription className="text-slate-400 text-[13px] font-medium">데모 기관의 기본 정보를 확인하거나 수정합니다.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">기관명</label>
                                    <Input defaultValue="BizDive 데모 주관기관" className="h-11 bg-slate-50 border-none rounded-xl font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">대표 연락처</label>
                                    <Input defaultValue="02-1234-5678" className="h-11 bg-slate-50 border-none rounded-xl font-bold" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">기관 로고 (다크 모드용)</label>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-300">
                                        <Building size={32} />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-bold text-slate-600">새 로고 업로드</p>
                                        <p className="text-[10px] text-slate-400 mt-1">PNG, SVG (최대 2MB)</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Platform Options */}
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden p-2">
                        <CardHeader className="px-6 pt-6 pb-2">
                            <CardTitle className="text-lg font-black text-slate-800">플랫폼 기능 활성화</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-8 divide-y divide-slate-50">
                            <div className="py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[14px] font-bold text-slate-700">기업 자동 매칭 서비스</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">진단 결과에 따라 적합한 심사위원을 자동으로 매칭합니다.</p>
                                </div>
                                <Switch checked />
                            </div>
                            <div className="py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[14px] font-bold text-slate-700">실시간 채팅 상담</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">참여 기업과 1:1 라이브 채팅을 활성화합니다.</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[14px] font-bold text-slate-700">결과 리포트 암호화</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">PDF 리포트 다운로드 시 비밀번호 설정을 강제합니다.</p>
                                </div>
                                <Switch checked />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="flex items-center justify-center py-6">
                <p className="text-[12px] text-slate-400 font-medium">설정 페이지는 현재 인터페이스만 제공되며, 저장 기능은 데모에서 작동하지 않습니다.</p>
            </div>
        </div>
    );
}
