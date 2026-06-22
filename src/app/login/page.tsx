
'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, User, ArrowRight, CheckCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    // Mode: 'login' (returning, default) or 'guest' (new)
    const [mode, setMode] = useState<'guest' | 'login'>('login');

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [rememberEmail, setRememberEmail] = useState(false);

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetSuccess, setResetSuccess] = useState<string | null>(null);

    // Load remembered email
    React.useEffect(() => {
        const savedEmail = localStorage.getItem('bizdive_remembered_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberEmail(true);
        }
    }, []);

    const handleGuestStart = async () => {
        if (!username.trim() || !email.trim()) {
            setError('이름과 이메일을 모두 입력해주세요.');
            return;
        }

        // Save to Session Storage for Onboarding
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('bizdive_guest', JSON.stringify({
                username,
                email
            }));
        }

        router.push('/onboarding');
    };

    const handlePasswordReset = async () => {
        if (!email.trim()) {
            setError('비밀번호를 재설정할 이메일을 입력해주세요.');
            setResetSuccess(null);
            return;
        }

        setLoading(true);
        setError(null);
        setResetSuccess(null);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
            if (resetError) {
                console.error('Password Reset Error:', resetError);
                setError('비밀번호 재설정 메일 발송에 실패했습니다. 가입하신 이메일이 맞는지 확인해주세요.');
            } else {
                setResetSuccess('비밀번호 재설정 메일이 전송되었습니다. 이메일 수신함을 확인해 주세요.');
            }
        } catch (err) {
            setError('비밀번호 재설정 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setError('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError(null);
        setResetSuccess(null);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                console.error('Login Error:', signInError);
                setError('이메일 또는 비밀번호가 일치하지 않습니다.');
            } else {
                // Save or clear email in localStorage
                if (rememberEmail) {
                    localStorage.setItem('bizdive_remembered_email', email);
                } else {
                    localStorage.removeItem('bizdive_remembered_email');
                }

                if (data.user) {
                    // Always redirect to dashboard on the main site
                    router.push('/dashboard');
                } else {
                    router.push('/dashboard');
                }
                router.refresh();
            }
        } catch (err) {
            setError('로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md mx-auto shadow-elevated border-0">
                <CardHeader>
                    <Link href="/" className="hover:opacity-80 transition-opacity flex justify-center">
                        <img
                            src="/BizDive_Logo_Confirm.png"
                            alt="BizDive Logo"
                            className="h-14 sm:h-18 w-auto mb-6"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    </Link>
                    <div className="text-center">
                        <CardTitle className="text-xl font-bold text-foreground">
                            7D 기업경영 심층자가진단
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm text-muted-foreground">
                            7차원 입체적 기업 분석을 시작합니다.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-4">
                    {/* LOGIN FORM */}
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* MIGRATION NOTICE POPUP */}
                        <div className="text-[13px] text-slate-600 bg-amber-50 border border-amber-100 p-3 rounded-lg flex flex-col gap-1.5 shadow-sm">
                            <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                                <AlertCircle className="h-4 w-4" />
                                기존 회원 비밀번호 재설정 안내
                            </div>
                            <p className="leading-relaxed">
                                백엔드 전환으로 인해 <strong>기존 회원은 최초 1회 비밀번호 재설정</strong>이 필요합니다. 아래 이메일 입력 칸에 가입 이메일을 적고 우측의 <strong>[비밀번호 재설정]</strong> 버튼을 눌러 메일을 전송해 주세요.
                            </p>
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="이메일"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 h-11"
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                disabled={loading}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10 h-11"
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="rememberEmail"
                                    checked={rememberEmail}
                                    onChange={(e) => setRememberEmail(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <label
                                    htmlFor="rememberEmail"
                                    className="text-sm font-medium text-slate-500 cursor-pointer select-none"
                                >
                                    이메일 기억하기
                                </label>
                            </div>
                            <button
                                type="button"
                                onClick={handlePasswordReset}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer select-none"
                                disabled={loading}
                            >
                                비밀번호 재설정
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {resetSuccess && (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{resetSuccess}</span>
                            </div>
                        )}

                        <Button
                            onClick={handleLogin}
                            className="w-full bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-90 transition-opacity h-12"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    로그인 중...
                                </>
                            ) : '로그인'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
