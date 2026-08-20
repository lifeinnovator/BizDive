import Link from 'next/link';
import { Button } from '@/components/ui/button';

const BannerSection = () => {
    return (
        <section className="bg-white py-8 sm:py-12 px-6 md:px-12 border-t border-slate-200">
            <div className="max-w-7xl mx-auto">
                <div className="bg-[#1e1b4b] text-white rounded-none p-10 sm:p-16 text-center shadow-2xl shadow-indigo-900/10">
                    <h2 className="text-2xl md:text-4xl font-extrabold mb-4 tracking-tighter break-keep text-white">
                        우리 기업의 성장 통증, <br /> 혼자 고민하지 마세요.
                    </h2>
                    <p className="text-indigo-200/90 mb-8 sm:mb-10 text-base md:text-lg font-medium opacity-80 break-keep">
                        진단 결과를 바탕으로 전문 컨설턴트가 <br className="sm:hidden" />
                        1:1 맞춤 솔루션을 제안해 드립니다. <br className="sm:hidden" />
                        <span className="font-bold text-emerald-400">(베타 기간 무료)</span>
                    </p>
                    <Link href="/consultation/apply" prefetch={false}>
                        <Button
                            className="font-bold text-indigo-900 bg-white hover:bg-slate-100 px-8 h-14 text-[16px] rounded-none shadow-sm w-full sm:w-auto"
                        >
                            전문가 매칭 신청하기
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default BannerSection;
