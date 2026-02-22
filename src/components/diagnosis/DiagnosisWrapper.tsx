'use client'

import React, { useEffect, useState } from 'react'
import DiagnosisForm, { ProfileData } from '@/components/diagnosis/DiagnosisForm'
import { Database } from '@/types/database'
import { getGuestQuestions } from '@/app/diagnosis/actions'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

type Question = Database['public']['Tables']['questions']['Row']

interface DiagnosisWrapperProps {
    initialQuestions?: Question[]
    user?: { id: string } | null
    profile?: ProfileData | null
    isGuest?: boolean
}

export default function DiagnosisWrapper({ initialQuestions, user, profile, isGuest }: DiagnosisWrapperProps) {
    const router = useRouter()
    const [questions, setQuestions] = useState<Question[]>(initialQuestions || [])
    const [guestProfile, setGuestProfile] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(isGuest)

    useEffect(() => {
        if (isGuest) {
            // Load Guest Data from Session
            const guestDataStr = sessionStorage.getItem('bizdive_guest')
            if (!guestDataStr) {
                // No guest data found, redirect to onboarding
                router.replace('/onboarding')
                return
            }

            const guestData = JSON.parse(guestDataStr)
             
            setGuestProfile({
                company_name: guestData.company_name,
                user_name: guestData.username,
                email: guestData.email,
                stage: guestData.stage,
                industry: guestData.industry,
                // Add dummy ID/Metadata to mimic profile structure for form
                id: 'guest',
                role: 'guest'
            })

            // Fetch Questions based on Guest Choice
            const fetchQuestions = async () => {
                const { data, error } = await getGuestQuestions(guestData.stage, guestData.industry)
                if (data) {
                    setQuestions(data)
                } else {
                    alert('진단 문항을 불러오는데 실패했습니다.')
                }
                setLoading(false)
            }

            fetchQuestions()
        }
    }, [isGuest, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">진단 문항을 준비 중입니다...</p>
                </div>
            </div>
        )
    }

    if (!questions.length) {
        return <div>문항 데이터가 없습니다. 다시 시도해주세요.</div>
    }

    return (
        <DiagnosisForm
            questions={questions}
            userId={user?.id || 'guest'}
            profile={profile || guestProfile || {}}
            isGuest={isGuest}
        />
    )
}
