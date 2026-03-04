import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowRight, BarChart3, ChevronRight, Activity, Search, ShieldCheck, Zap } from 'lucide-react'

// Sub-components for better organization
const Navigation = () => (
  <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
    <div className="container px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-xl text-indigo-700 tracking-tight">
          BizDive
        </Link>
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
          <Link href="#features" className="hover:text-indigo-600 transition-colors">서비스 소개</Link>
          <Link href="/onboarding" className="hover:text-indigo-600 transition-colors">진단하기</Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/login">
          <Button variant="ghost" className="text-slate-600 font-medium hidden sm:flex">
            관리자 로그인
          </Button>
        </Link>
        <Link href="/login">
          <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full font-semibold px-6 shadow-soft">
            시작하기
          </Button>
        </Link>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-white pt-24 pb-32">
    {/* Abstract Background Animation - radar polygon style represented via CSS shapes */}
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-40">
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-indigo-100/50 rounded-full blur-3xl animate-pulse-soft"></div>
      <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-[30%] right-[20%] w-[500px] h-[500px] bg-amber-50/40 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] animate-[spin_120s_linear_infinite]" viewBox="0 0 100 100">
        <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="none" stroke="currentColor" className="text-indigo-600" strokeWidth="0.5" />
        <polygon points="50,15 85,30 85,70 50,85 15,70 15,30" fill="none" stroke="currentColor" className="text-emerald-600" strokeWidth="0.5" />
      </svg>
    </div>

    <div className="container px-4 text-center">
      <Badge variant="secondary" className="mb-6 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none px-4 py-1.5 text-xs font-semibold uppercase tracking-wider animate-fade-in">
        Start Business Diagnostics
      </Badge>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
        당신의 비즈니스는 <br className="hidden sm:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">
          지속 가능한가요?
        </span>
      </h1>

      <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        7D 데이터로 증명하는 완벽한 생존 리포트. <br className="hidden sm:block" />
        BizDive로 객관적인 사업성을 확인하고 관리하세요.
      </p>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <Link href="/onboarding" className="w-full sm:w-auto">
          <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-14 px-8 text-base shadow-elevated group transition-all">
            5분 만에 생존 점수 확인
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <Link href="/login" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full h-14 px-8 rounded-full text-base font-medium border-slate-200 hover:bg-slate-50 text-slate-700">
            기관용 관리자 데모
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

const SplitUXSection = () => (
  <section className="py-24 bg-white">
    <div className="container px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">당신에게 필요한 BizDive는?</h2>
        <p className="text-slate-600">역할에 맞춘 최적의 진단 및 관리 경험을 제공합니다.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Founder Card */}
        <Card className="p-2 border-slate-100 shadow-soft hover:shadow-card transition-shadow duration-300 bg-gradient-to-b from-indigo-50/50 to-white">
          <CardHeader className="text-center pb-4 pt-8">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-indigo-500">
              <Zap className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">창업자 / 예비 창업자</CardTitle>
            <CardDescription className="text-lg font-medium text-slate-900 mt-2">"내 아이디어의 등급은?"</CardDescription>
          </CardHeader>
          <CardContent className="text-slate-600 text-center pb-8 border-b border-slate-100">
            <ul className="space-y-3 text-sm flex flex-col items-center">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> 7단계 핵심 지표 정밀 분석</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> AI 기반 맞춤형 액션 플랜 리포트</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> 객관적인 생존 가능성 점검</li>
            </ul>
          </CardContent>
          <CardFooter className="pt-6 pb-4 flex justify-center">
            <Link href="/onboarding" className="w-full max-w-[240px]">
              <Button variant="outline" className="w-full rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700">
                진단 시작하기
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Institution Card */}
        <Card className="p-2 border-slate-100 shadow-soft hover:shadow-card transition-shadow duration-300 bg-gradient-to-b from-emerald-50/50 to-white">
          <CardHeader className="text-center pb-4 pt-8">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-emerald-500">
              <BarChart3 className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">지원사업 담당자 / 기관</CardTitle>
            <CardDescription className="text-lg font-medium text-slate-900 mt-2">"엑셀 없는 사업 관리를 원하시나요?"</CardDescription>
          </CardHeader>
          <CardContent className="text-slate-600 text-center pb-8 border-b border-slate-100">
            <ul className="space-y-3 text-sm flex flex-col items-center">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 차수별 기업 성장 데이터 자동 추적</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 미응답 기업 원클릭 독려 메일</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 관리자 전용 대시보드 제공</li>
            </ul>
          </CardContent>
          <CardFooter className="pt-6 pb-4 flex justify-center">
            <Link href="/login" className="w-full max-w-[240px]">
              <Button variant="outline" className="w-full rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
                관리자 데모 체험
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section id="features" className="py-24 bg-slate-50">
    <div className="container px-4">
      <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-24 max-w-6xl mx-auto">
        <div className="flex-1 space-y-8">
          <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50/50 px-3 py-1 rounded-full text-xs">
            DIAGNOSTIC LOGIC
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            비즈니스 해부학, <br />
            <span className="text-indigo-600">7D 진단 시스템</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            우리는 단순한 질문을 던지지 않습니다. <br />
            시장성, 기술력, 수익모델 등 7가지 객관적 지표로 비즈니스를 정밀하게 해부합니다.
          </p>

          <div className="space-y-6 pt-4">
            {[
              { title: "다면적 분석", desc: "7개의 상호 연관된 지표를 통한 입체적 평가" },
              { title: "객관적 스코어링", desc: "전문가 로직에 기반한 정확하고 일관된 점수 산출" },
              { title: "실행 가능성 검증", desc: "아이디어를 넘어 실제 비즈니스 구현 가능성 철저 파악" }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 text-indigo-500">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 relative w-full w-full">
          {/* Mockup visual */}
          <div className="relative aspect-[4/5] sm:aspect-square w-full max-w-[500px] mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex items-center justify-center p-8">
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-indigo-500 to-emerald-400"></div>
            <div className="w-full space-y-8">
              <div className="text-center border-b border-slate-100 pb-6">
                <div className="text-5xl font-extrabold text-slate-900 mb-2">92<span className="text-2xl text-slate-400 font-medium">/100</span></div>
                <div className="text-sm font-medium text-slate-500">종합 생존 점수</div>
              </div>
              {/* Dummy radar chart bars */}
              <div className="space-y-4">
                {[
                  { l: '시장성', v: 90, c: 'bg-indigo-500' },
                  { l: '경쟁력', v: 75, c: 'bg-emerald-500' },
                  { l: '수익성', v: 85, c: 'bg-amber-500' },
                  { l: '실행력', v: 95, c: 'bg-rose-500' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{item.l}</span>
                      <span>{item.v}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.c} rounded-full`} style={{ width: `${item.v}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 text-center">
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100">
                  매우 우수합니다
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const B2BProofSection = () => (
  <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
    {/* Background elements */}
    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

    <div className="container px-4 text-center z-10 relative">
      <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
        사업관리의 새로운 경험
      </h2>
      <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-16 font-light">
        "담당자의 단순 반복 업무 <span className="font-semibold text-emerald-400">80%</span>를 줄여드립니다." <br className="hidden sm:block" />
        엑셀 없이 실시간으로 참가 기업의 성장을 추적하세요.
      </p>

      {/* Abstract Dashboard GUI Representation */}
      <div className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-8">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <div className="text-xs text-slate-400 font-mono">admin.bizdive.io</div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">총 참가 기업</div>
            <div className="text-3xl font-bold">142<span className="text-sm font-normal text-slate-500 ml-1">개사</span></div>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">진단 완료율</div>
            <div className="text-3xl font-bold text-emerald-400">87<span className="text-sm font-normal">体现</span></div>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col justify-center items-center">
            <Button size="sm" variant="secondary" className="w-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-transparent">
              미응답 일괄 독려
            </Button>
          </div>
        </div>

        {/* Chart fake */}
        <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700 h-48 flex items-end gap-2 px-12 justify-between">
          {[40, 55, 45, 70, 65, 85, 92].map((h, i) => (
            <div key={i} className="w-full max-w-[40px] bg-gradient-to-t from-indigo-500/20 to-indigo-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const RetrievalSection = () => (
  <section className="py-24 bg-indigo-50">
    <div className="container px-4 text-center max-w-2xl mx-auto">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-sm">
        <Search className="w-7 h-7" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
        과거의 성장을 다시 확인해 보세요
      </h2>
      <p className="text-slate-600 mb-8">
        이미 진단을 받으셨나요? 이메일 주소만으로 완료된 리포트를 간편하게 찾아드립니다.
      </p>

      <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" action="/login">
        <Input
          type="email"
          placeholder="진단 시 입력한 이메일 주소"
          className="h-12 bg-white border-slate-200 focus-visible:ring-indigo-500"
        />
        <Button className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 shrink-0">
          나의 리포트 찾기
        </Button>
      </form>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-white border-t border-slate-100 py-12">
    <div className="container px-4 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex flex-col items-center md:items-start gap-2">
        <span className="font-bold text-xl text-slate-900 tracking-tight">BizDive</span>
        <p className="text-xs text-slate-500">© 2026 LifeInnovator. All rights reserved.</p>
      </div>

      <div className="flex gap-6 text-sm font-medium text-slate-600">
        <Link href="#" className="hover:text-slate-900 transition-colors">서비스 정보</Link>
        <Link href="#" className="hover:text-slate-900 transition-colors">이용약관</Link>
        <Link href="#" className="hover:text-slate-900 transition-colors">개인정보처리방침</Link>
      </div>

      <Link href="/login">
        <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-slate-600">
          Master Admin
        </Button>
      </Link>
    </div>
  </footer>
);

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If already logged in, redirect them immediately
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background selection:bg-indigo-100 selection:text-indigo-900">
      <Navigation />
      <main>
        <Hero />
        <SplitUXSection />
        <FeaturesSection />
        <B2BProofSection />
        <RetrievalSection />
      </main>
      <Footer />
    </div>
  )
}
