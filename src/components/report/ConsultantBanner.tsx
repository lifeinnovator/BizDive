'use client'

import { Button } from '@/components/ui/button'

export default function ConsultantBanner() {
    return (
        <div className="bg-[#1e1b4b] text-white rounded-xl p-8 text-center my-10 shadow-lg print:hidden">
            <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-tight">
                전문가와 심층 상담이 필요하신가요?
            </h2>
            <p className="text-indigo-200/90 mb-6 text-sm md:text-base font-medium">
                진단 결과를 바탕으로 비즈니스 성장을 위한 구체적인 전략을 제안해 드립니다.
            </p>
            <Button
                variant="secondary"
                size="default"
                className="font-bold text-indigo-900 bg-white hover:bg-indigo-50 px-6 h-10 text-sm shadow-sm"
                onClick={() => window.open('https://forms.gle/rxVu3dFYjRPNSHaY6', '_blank')}
            >
                전문가 상담 신청하기
            </Button>
        </div>
    )
}
