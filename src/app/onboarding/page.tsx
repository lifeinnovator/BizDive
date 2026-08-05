'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OnboardingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [userType, setUserType] = useState<'guest' | 'auth'>('guest')
    const [formData, setFormData] = useState({
        company_name: '',
        stage: 'P',
        industry: 'I',
        user_name: '',
        user_title: '',
        email: ''
    })

    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setUserType('auth')
                // Fetch profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        company_name: profile.company_name || '',
                        user_name: profile.user_name || '',
                        user_title: profile.user_title || '',
                        stage: profile.stage || 'P',
                        industry: profile.industry || 'I',
                        email: user.email || ''
                    }))
                } else {
                    setFormData(prev => ({
                        ...prev,
                        email: user.email || ''
                    }))
                }
            } else {
                // Check Session Storage for Guest Info from Login Page
                const guestDataStr = sessionStorage.getItem('bizdive_guest')
                if (guestDataStr) {
                    const guestData = JSON.parse(guestDataStr)
                    setFormData(prev => ({
                        ...prev,
                        user_name: guestData.username || '',
                        email: guestData.email || ''
                    }))
                }
            }
        }
        init()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (userType === 'auth') {
                // Update DB for authenticated user
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('User not found')

                const { error } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        email: user.email!,
                        company_name: formData.company_name,
                        stage: formData.stage as "P" | "E" | "V" | "M",
                        industry: formData.industry as "I" | "H" | "L" | "CT",
                        user_name: formData.user_name,
                        user_title: formData.user_title,
                        updated_at: new Date().toISOString(),
                    })

                if (error) throw error

                // Auth User -> Go to Diagnosis directly as per requested flow adjustment
                // Or Dashboard? new requirement says "Existing user: Dashboard".
                // But this form is "Onboarding" - usually for first time or profile update.
                // If they came here, they probably want to do something. 
                // Let's send to Diagnosis for now since they just filled out the "Start Diagnosis" form.
                router.refresh()
                window.location.href = '/diagnosis'
            } else {
                // Guest User -> Save to Session -> Diagnosis
                sessionStorage.setItem('bizdive_guest', JSON.stringify({
                    username: formData.user_name,
                    email: formData.email,
                    company_name: formData.company_name,
                    user_title: formData.user_title,
                    stage: formData.stage,
                    industry: formData.industry,
                    timestamp: new Date().toISOString()
                }))

                router.refresh()
                // Use hard reload to ensure server-side data is picked up correctly
                window.location.href = '/diagnosis'
            }
        } catch (error) {
            alert('오류가 발생했습니다.')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-16 sm:px-6 lg:px-8 animate-fade-in">
            <div className="sm:mx-auto sm:w-full sm:max-w-xl relative">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="absolute top-0 left-0 -ml-2 sm:-ml-12 hover:bg-slate-200/50 rounded-full transition-colors"
                    aria-label="이전 화면으로 돌아가기"
                >
                    <ArrowLeft className="h-5 w-5 text-slate-500" />
                </Button>

                <div className="flex flex-col items-center mb-6 pt-2">
                    <div className="relative w-[180px] h-[60px] mb-4">
                        <Image
                            src="/BizDive_Logo_Confirm.png"
                            alt="BizDive"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                        기업 정보를 확인해주세요.
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                        전문적인 진단을 위해 기업 정보를 선택해 주세요.
                    </p>
                </div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-8 border border-slate-100/60 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
                    
                    <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>

                        {/* Company Name */}
                        <div className="space-y-2">
                            <label htmlFor="company_name" className="block text-sm font-bold text-slate-700">
                                기업명 <span className="text-indigo-500 ml-1">*</span>
                            </label>
                            <input
                                type="text"
                                name="company_name"
                                id="company_name"
                                required
                                value={formData.company_name}
                                onChange={handleChange}
                                placeholder="예: (주)비즈다이브"
                                className="block w-full rounded-lg border-slate-200 bg-slate-50/50 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-sm px-4 py-2.5 font-medium text-slate-900"
                            />
                        </div>

                        {/* Optional Job Title */}
                        <div className="space-y-2">
                            <label htmlFor="user_title" className="block text-sm font-bold text-slate-700 flex items-center justify-between">
                                직함 <span className="text-slate-400 font-normal text-xs bg-slate-100 px-2 py-0.5 rounded-full">선택</span>
                            </label>
                            <input
                                type="text"
                                name="user_title"
                                id="user_title"
                                value={formData.user_title}
                                onChange={handleChange}
                                placeholder="예: 대표이사"
                                className="block w-full rounded-lg border-slate-200 bg-slate-50/50 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-sm px-4 py-2.5 font-medium text-slate-900"
                            />
                        </div>

                        <div className="h-px bg-slate-100 w-full" />

                        {/* Growth Stage - Card Grid */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                성장 단계 <span className="text-indigo-500 ml-1">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'P', label: '예비창업', sub: 'Pre-Startup' },
                                    { id: 'E', label: '초기창업', sub: '3년 이내' },
                                    { id: 'V', label: '도약/벤처', sub: '7년 이내' },
                                    { id: 'M', label: '중소/중견', sub: '8년 이상' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, stage: item.id })}
                                        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border-2 transition-all duration-300 ${
                                            formData.stage === item.id
                                                ? 'border-indigo-600 bg-indigo-50/30 shadow-sm shadow-indigo-100 transform scale-[0.98]'
                                                : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50 hover:scale-[1.02]'
                                        }`}
                                    >
                                        <span className={`font-bold text-[13px] mb-0.5 ${formData.stage === item.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                                            {item.label}
                                        </span>
                                        <span className={`text-[10px] font-medium ${formData.stage === item.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                                            {item.sub}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Industry - Card Grid */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">
                                산업 분야 <span className="text-indigo-500 ml-1">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'I', label: 'IT/SW/SaaS' },
                                    { id: 'H', label: '제조/하드웨어' },
                                    { id: 'L', label: '로컬/서비스/F&B' },
                                    { id: 'CT', label: '콘텐츠/IP' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, industry: item.id })}
                                        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border-2 transition-all duration-300 ${
                                            formData.industry === item.id
                                                ? 'border-indigo-600 bg-indigo-50/30 shadow-sm shadow-indigo-100 transform scale-[0.98]'
                                                : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50 hover:scale-[1.02]'
                                        }`}
                                    >
                                        <span className={`font-bold text-[13px] ${formData.industry === item.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !formData.company_name || !formData.stage || !formData.industry}
                                className="flex w-full justify-center items-center rounded-lg border border-transparent bg-indigo-600 py-3 px-8 text-[15px] font-bold text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        처리 중...
                                    </>
                                ) : (
                                    '진단 시작하기'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div className="mt-12 text-center pb-8 animate-fade-in">
                 <p className="text-xs text-slate-400 font-medium">© 2026 BizDive. All rights reserved.</p>
            </div>
        </div>
    )
}
