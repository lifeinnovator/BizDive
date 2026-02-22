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
                router.push('/diagnosis')
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

                router.push('/diagnosis')
            }
        } catch (error) {
            alert('오류가 발생했습니다.')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="absolute top-0 left-0 -ml-12 md:-ml-0"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>

                <div className="flex flex-col items-center">
                    <div className="relative w-64 h-20 mb-0">
                        <Image
                            src="/logo_full.png"
                            alt="BizDive"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <p className="-mt-2 text-center text-sm text-gray-600">
                        {userType === 'auth' ? '기업 정보를 확인해주세요.' : '맞춤형 진단을 위해 기업 정보를 입력해 주세요.'}
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Name/Email Readonly for Guest (Displayed for context) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">이름</label>
                                <div className="mt-1 p-2 bg-gray-100 rounded-md text-sm text-gray-700">
                                    {formData.user_name || '-'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">이메일</label>
                                <div className="mt-1 p-2 bg-gray-100 rounded-md text-sm text-gray-700 truncate">
                                    {formData.email || '-'}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                                기업명 (Company Name) <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="company_name"
                                    id="company_name"
                                    required
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    placeholder="예: (주)비즈다이브"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="user_title" className="block text-sm font-medium text-gray-700">
                                직함 (Job Title) <span className="text-gray-400 font-normal">(선택)</span>
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="user_title"
                                    id="user_title"
                                    value={formData.user_title}
                                    onChange={handleChange}
                                    placeholder="예: 대표이사"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="stage" className="block text-sm font-medium text-gray-700">
                                성장 단계 (Business Stage) <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                                <select
                                    id="stage"
                                    name="stage"
                                    value={formData.stage}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                >
                                    <option value="P">예비창업 (Pre-Startup)</option>
                                    <option value="E">초기창업 3년 미만 (Early-Stage)</option>
                                    <option value="V">도약기 3~7년 (Venture/Scale-up)</option>
                                    <option value="M">중소/중견기업 (Mid-sized)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                                산업 분야 (Industry) <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                                <select
                                    id="industry"
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                >
                                    <option value="I">IT/SW/SaaS</option>
                                    <option value="H">제조/하드웨어 (Manufacturing)</option>
                                    <option value="L">로컬/서비스/F&B</option>
                                    <option value="CT">콘텐츠/IP/지식서비스</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
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
        </div>
    )
}
