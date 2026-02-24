'use client'

import React, { useEffect, useState } from 'react'
import {
    Users,
    History,
    Target,
    TrendingUp,
    Download,
    Printer,
    Building2,
    Calendar,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ScoreIndicator from '@/components/admin/ScoreIndicator'
import { createClient } from '@/lib/supabase'
import SuperAdminDashboard from '@/components/admin/dashboards/SuperAdminDashboard'
import InstitutionAdminDashboard from '@/components/admin/dashboards/InstitutionAdminDashboard'

const mockRadarData = [
    { dimension: 'D1', full_name: '시장 분석 및 기회 탐색', score: 85 },
    { dimension: 'D2', full_name: '사업 모델 및 전략', score: 65 },
    { dimension: 'D3', full_name: '제품 및 서비스 경쟁력', score: 45 },
    { dimension: 'D4', full_name: '마케팅 및 영업 역량', score: 72 },
    { dimension: 'D5', full_name: '조직 및 인적 자원', score: 58 },
    { dimension: 'D6', full_name: '재무 관리 및 자금 조달', score: 90 },
    { dimension: 'D7', full_name: 'ESG 및 지속 가능 경영', score: 38 },
]

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true)
    const [userProfile, setUserProfile] = useState<any>(null)
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        totalRecords: 0,
        avgScore: 0,
        totalGroups: 0,
        totalProjects: 0,
        industryDistribution: [] as any[],
        recentActivities: [] as any[]
    })

    useEffect(() => {
        const fetchStats = async () => {
            const supabase = createClient()

            // 1. Get current user profile
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('*, groups(name)')
                .eq('id', user.id)
                .single()

            setUserProfile(profile)

            // 2. Fetch Stats with RBAC Filtering
            const isAdmin = profile?.role === 'super_admin'
            const groupId = profile?.group_id

            // Basic Counts
            const usersQuery = supabase.from('profiles').select('id, industry', { count: 'exact', head: false })
            const projectsQuery = supabase.from('projects').select('id', { count: 'exact', head: true })
            const groupsQuery = supabase.from('groups').select('id', { count: 'exact', head: true })
            const recordsQuery = supabase.from('diagnosis_records').select('id, total_score, created_at, user_id, profiles(company_name, user_name, group_id, groups(name))')

            if (!isAdmin) {
                usersQuery.eq('group_id', groupId)
                projectsQuery.eq('group_id', groupId)
                // Filter records by group_id in profiles
                recordsQuery.filter('profiles.group_id', 'eq', groupId)
            }

            const [usersRes, projectsRes, groupsRes, recordsRes] = await Promise.all([
                usersQuery,
                projectsQuery,
                isAdmin ? groupsQuery : Promise.resolve({ count: 1 }),
                recordsQuery.order('created_at', { ascending: false }).limit(isAdmin ? 10 : 5)
            ])

            // Calculate Industry Distribution
            const industryMap: Record<string, number> = { 'I': 0, 'H': 0, 'L': 0, 'CT': 0 }
            const industryLabels: Record<string, string> = { 'I': 'IT/SaaS', 'H': '제조/HW', 'L': '로컬/F&B', 'CT': '콘텐츠' }
            const industryColors: Record<string, string> = { 'I': '#4f46e5', 'H': '#10b981', 'L': '#f59e0b', 'CT': '#ec4899' }

            usersRes.data?.forEach(u => {
                if (u.industry && industryMap[u.industry] !== undefined) {
                    industryMap[u.industry]++
                }
            })

            const industryDistribution = Object.entries(industryMap).map(([key, count]) => ({
                name: industryLabels[key],
                count,
                color: industryColors[key]
            })).sort((a, b) => b.count - a.count)

            // Process Recent Activities
            const recentActivities = (recordsRes.data as any[])?.map(r => ({
                group: r.profiles?.groups?.name || '소속 없음',
                company: r.profiles?.company_name || '미지정 기업',
                event: '진단 제출 완료',
                time: new Date(r.created_at).toLocaleString(),
                user: r.profiles?.user_name || '담당자',
                score: r.total_score
            })) || []

            const totalRecords = recordsRes.data?.length || 0
            const avgScore = totalRecords > 0
                ? (recordsRes.data as any[]).reduce((acc, curr) => acc + (curr.total_score || 0), 0) / totalRecords
                : 0

            setDashboardStats({
                totalUsers: usersRes.count || 0,
                totalRecords: totalRecords, // This is just the limit for now, maybe fetch separate count
                avgScore: Math.round(avgScore * 10) / 10,
                totalGroups: groupsRes.count || 1,
                totalProjects: projectsRes.count || 0,
                industryDistribution,
                recentActivities
            })
            setLoading(false)
        }
        fetchStats()
    }, [])

    const stats = [
        { name: '전체 가입자', value: dashboardStats.totalUsers.toLocaleString(), delta: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: '진단 완료건', value: dashboardStats.totalRecords.toLocaleString(), delta: '+24%', icon: History, iconColor: 'text-indigo-600', bg: 'bg-indigo-50' },
        { name: '평균 진단 점수', value: dashboardStats.avgScore.toFixed(1), delta: '+2.4', icon: Target, iconColor: 'text-emerald-600', bg: 'bg-emerald-50' },
        { name: '활성 그룹(기관)', value: dashboardStats.totalGroups.toLocaleString(), delta: '+2', icon: Building2, iconColor: 'text-purple-600', bg: 'bg-purple-50' },
    ]

    if (loading) {
        return <div className="p-12 text-center text-slate-400 font-bold animate-pulse italic">데이터를 동기화 중입니다...</div>
    }

    return (
        <div className="space-y-8">
            {userProfile?.role === 'super_admin' ? (
                <SuperAdminDashboard stats={dashboardStats} />
            ) : (
                <InstitutionAdminDashboard profile={userProfile} stats={dashboardStats} />
            )}
        </div>
    )
}
