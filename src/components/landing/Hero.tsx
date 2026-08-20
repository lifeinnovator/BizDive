import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const Hero = () => {
    return (
        <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 px-6 md:px-12 bg-white flex flex-col items-center justify-center text-center min-h-[70vh] sm:min-h-[75vh] selection:bg-indigo-900 selection:text-white border-b border-indigo-50">
            <div className="mx-auto w-full max-w-5xl">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-tight border border-indigo-100 flex items-center gap-2 shadow-sm">
                        <Image src="/favicon.png" alt="" width={16} height={16} className="opacity-80" />
                        BizDive - 7D 기업경영 심층자가진단
                    </span>
                </div>
                <h1 className="text-[36px] sm:text-[48px] lg:text-[76px] font-extrabold tracking-tighter text-indigo-950 leading-[1.2] sm:leading-[1.1] mb-6 sm:mb-8 break-keep">
                    직관을 넘어, <br />
                    데이터로 증명하는 <br />
                    비즈니스 경쟁력
                </h1>
                <p className="text-[17px] sm:text-xl text-slate-600 font-medium tracking-tight mb-4 max-w-3xl mx-auto leading-relaxed break-keep">
                    현재 상태를 7가지 핵심 영역으로 진단하고,<br />
                    사업 단계에 따라 전문가 의견과 비교하며<br className="hidden sm:block" />
                    필요한 멘토링과 실행 과제를 연결합니다.
                </p>
                <p className="text-base sm:text-lg text-slate-500 font-medium tracking-tight mb-10 sm:mb-14 max-w-2xl mx-auto leading-relaxed break-keep">
                    참여 중인 지원사업의 진단·멘토링·결과를 한곳에서 확인하세요.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/onboarding" prefetch={false} className="w-full sm:w-auto">
                        <Button className="h-14 px-10 rounded-none bg-indigo-900 hover:bg-indigo-800 text-white text-[17px] font-bold w-full sm:w-auto flex items-center gap-2 group transition-all shadow-md">
                            내 성장 진단 시작하기
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
                <p className="mt-5 text-xs font-semibold text-slate-400">지원사업 참여기업은 운영기관에서 안내받은 계정으로 로그인해 주세요.</p>
            </div>
        </section>
    );
};

export default Hero;
