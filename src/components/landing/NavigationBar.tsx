import Link from 'next/link';
import Image from 'next/image';

const NavigationBar = () => {
    return (
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 py-4 shadow-sm backdrop-blur-md">
            <div className="container mx-auto px-2 md:px-4 flex justify-between items-center max-w-7xl">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/BizDive_Logo_Confirm.png"
                        alt="BizDive"
                        width={180}
                        height={48}
                        className="h-10 sm:h-12 w-auto"
                    />
                </Link>
                <div className="flex items-center gap-3 sm:gap-6">
                    <a href="https://admin.bizdive.kr" className="hidden min-h-11 items-center text-[13px] font-bold text-slate-500 hover:text-indigo-900 md:inline-flex sm:text-[15px]">기관·사업 운영</a>
                    <Link href="/dashboard" prefetch={false} className="inline-flex min-h-11 items-center text-[13px] font-bold text-slate-500 transition-colors hover:text-indigo-900 sm:text-[15px]">
                        나의 대시보드
                    </Link>
                    <Link href="/onboarding" prefetch={false} className="inline-flex min-h-11 items-center rounded-full bg-indigo-900 px-4 text-[13px] font-bold text-white shadow-md transition-all hover:bg-slate-900 sm:text-[15px]">
                        무료 진단 시작
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default NavigationBar;
