'use client'

import { Button } from '@/components/ui/button'
import { Printer, MessageSquare, LogOut, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function PrintButton() {
    return (
        <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2"
        >
            <Printer className="h-4 w-4" />
            리포트 인쇄 / PDF 저장
        </Button>
    )
}

export function ExpertRequestButton() {
    return (
        <Button
            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md"
            onClick={() => window.open('https://forms.gle/rxVu3dFYjRPNSHaY6', '_blank')} // Updated link
        >
            <MessageSquare className="h-4 w-4" />
            전문가 컨설팅 신청
        </Button>
    )
}

export function ReportHeaderActions() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <Home className="h-4 w-4 mr-2" />
                홈으로
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
            </Button>
        </div>
    )
}
