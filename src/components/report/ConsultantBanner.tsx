'use client'

import { Button } from '@/components/ui/button'

export default function ConsultantBanner() {
    return (
        <div className="bg-[#1e1b4b] text-white rounded-2xl p-8 md:p-12 text-center my-12 shadow-xl print:hidden">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
                우리 기업의 성장 통증, 혼자 고민하지 마세요.
            </h2>
            <p className="text-indigo-100 mb-8 text-lg">
                진단 결과를 바탕으로 전문 컨설턴트가 1:1 맞춤 솔루션을 제안해 드립니다. (베타 기간 무료)
            </p>
            <Button
                variant="secondary"
                size="lg"
                className="font-bold text-indigo-900 bg-white hover:bg-gray-100 px-8 h-12 text-lg"
                onClick={() => window.open('https://forms.gle/rxVu3dFYjRPNSHaY6', '_blank')}
            >
                전문가 매칭 신청하기
            </Button>
        </div>
    )
}
