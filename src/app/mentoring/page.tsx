'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, UserRoundSearch } from 'lucide-react'

type Need = { dimension: string; score: number; code: string; label: string }
type Mentor = { id: string; display_name: string; headline: string | null; specialty_codes: string[]; requested: boolean }

function MentoringContent() {
  const projectId = useSearchParams().get('projectId') || ''
  const [needs, setNeeds] = useState<Need[]>([])
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [error, setError] = useState(projectId ? '' : '사업 정보가 필요합니다.')
  const [loading, setLoading] = useState(Boolean(projectId))
  const [requesting, setRequesting] = useState<string | null>(null)
  const load = useCallback(async () => {
    setLoading(true)
    const response = await fetch(`/api/mentoring/recommendations?projectId=${encodeURIComponent(projectId)}`, { cache: 'no-store' })
    const result = await response.json()
    if (!response.ok) setError(result.error || '멘토 추천을 불러오지 못했습니다.')
    else { setNeeds(result.needs || []); setMentors(result.mentors || []) }
    setLoading(false)
  }, [projectId])
  useEffect(() => { if (projectId) void Promise.resolve().then(load) }, [load, projectId])
  const requestMentoring = async (mentor: Mentor) => {
    setRequesting(mentor.id)
    const codes = needs.filter((need) => mentor.specialty_codes.includes(need.code)).map((need) => need.code)
    const response = await fetch('/api/mentoring/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, mentorId: mentor.id, requestedCodes: codes }) })
    const result = await response.json()
    if (!response.ok) alert(result.error || '멘토링을 요청하지 못했습니다.')
    else await load()
    setRequesting(null)
  }
  return <main className="min-h-screen bg-slate-50 px-5 py-12"><div className="mx-auto max-w-4xl"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-black text-slate-900">진단 연계 멘토 선택</h1><p className="mt-2 text-sm text-slate-500">최근 자가·진단위원 결과의 보완 분야에 맞는 멘토를 확인합니다.</p></div><Link href="/dashboard" className="text-sm font-semibold text-indigo-600">대시보드</Link></div>{loading ? <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div> : error ? <div className="mt-8 rounded-xl border bg-white p-8 text-center text-sm text-slate-500">{error}</div> : <><div className="mt-8 flex flex-wrap gap-2">{needs.map((need) => <span key={need.code} className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">{need.label} · {need.score.toFixed(1)}</span>)}</div><div className="mt-5 grid gap-4 md:grid-cols-2">{mentors.map((mentor) => <div key={mentor.id} className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-start gap-3"><div className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><UserRoundSearch size={20} /></div><div><h2 className="font-bold text-slate-900">{mentor.display_name}</h2><p className="mt-1 text-sm text-slate-500">{mentor.headline || '전문 멘토'}</p></div></div><div className="mt-4 flex flex-wrap gap-1">{needs.filter((need) => mentor.specialty_codes.includes(need.code)).map((need) => <span key={need.code} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{need.label}</span>)}</div><button className="mt-5 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-bold text-white disabled:bg-slate-300" disabled={mentor.requested || requesting === mentor.id} onClick={() => void requestMentoring(mentor)}>{mentor.requested ? '요청 완료' : requesting === mentor.id ? '요청 중...' : '이 멘토에게 요청'}</button></div>)}</div>{mentors.length === 0 && <div className="mt-5 rounded-xl border bg-white p-8 text-center text-sm text-slate-500">현재 진단 분야와 일치하는 활성 멘토가 없습니다.</div>}</>}</div></main>
}

export default function MentoringPage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}><MentoringContent /></Suspense>
}
