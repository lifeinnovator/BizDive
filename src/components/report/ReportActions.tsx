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
            className="flex-1 sm:flex-none gap-2 px-3 sm:px-4 h-10 text-[13px] sm:text-sm"
        >
            <Printer className="h-4 w-4 shrink-0" />
            <span className="truncate">리포트 인쇄 / PDF 저장</span>
        </Button>
    )
}

export function ExpertRequestButton() {
    return (
        <Button
            className="flex-1 sm:flex-none gap-2 px-3 sm:px-4 h-10 text-[13px] sm:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md"
            onClick={() => window.open('https://forms.gle/rxVu3dFYjRPNSHaY6', '_blank')} // Updated link
        >
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span className="truncate">전문가 컨설팅 신청</span>
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
        <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="px-2 sm:px-3">
                <Home className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">홈으로</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="px-2 sm:px-3 text-red-500 hover:text-red-600 hover:bg-red-50">
                <LogOut className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">로그아웃</span>
            </Button>
        </div>
    )
}
