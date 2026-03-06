'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase'

const formSchema = z.object({
    companyName: z.string().min(2, { message: '기업명을 2자 이상 입력해주세요.' }),
    contactName: z.string().min(2, { message: '담당자 성함을 2자 이상 입력해주세요.' }),
    contactPhone: z.string().min(10, { message: '올바른 연락처를 입력해주세요.' }),
    contactEmail: z.string().email({ message: '올바른 이메일 주소를 입력해주세요.' }),
    topics: z.array(z.string()).min(1, { message: '최소 한 가지 이상의 관심 분야를 선택해주세요.' }),
    message: z.string().optional(),
})

const TOPICS = [
    { id: 'business_strategy', label: '비즈니스 모델 및 전략' },
    { id: 'funding', label: '투자 유치 및 자금 조달' },
    { id: 'marketing', label: '마케팅 및 영업' },
    { id: 'hr_org', label: '인사 및 조직 관리' },
    { id: 'product', label: '제품 개발 및 기술' },
    { id: 'other', label: '기타' },
]

export default function ConsultationApplyPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyName: '',
            contactName: '',
            contactPhone: '',
            contactEmail: '',
            topics: [],
            message: '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const supabase = createClient()

            // Get current user id if logged in
            const { data: { user } } = await supabase.auth.getUser()

            const { error } = await supabase.from('consultations').insert({
                user_id: user?.id || null,
                company_name: values.companyName,
                contact_name: values.contactName,
                contact_phone: values.contactPhone,
                contact_email: values.contactEmail,
                topics: values.topics,
                message: values.message,
                status: 'pending'
            })

            if (error) throw error

            setIsSuccess(true)
        } catch (error) {
            console.error('Error submitting consultation request:', error)
            alert('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center"
                >
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">신청이 완료되었습니다</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        전문가 매칭 신청이 성공적으로 접수되었습니다. <br />
                        남겨주신 연락처로 1~2영업일 내에 담당 컨설턴트가 연락드릴 예정입니다.
                    </p>
                    <Link href="/">
                        <Button className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700">
                            홈으로 돌아가기
                        </Button>
                    </Link>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-8 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    랜딩 페이지로 돌아가기
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-indigo-950 p-8 sm:p-10 text-white">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-3">전문가 1:1 맞춤 컨설팅 신청</h1>
                        <p className="text-indigo-200 text-sm sm:text-base">
                            기업의 현황을 가장 잘 아는 전문 컨설턴트가 배정되어 실질적인 해결책을 제안해 드립니다.
                        </p>
                    </div>

                    <div className="p-8 sm:p-10">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                                {/* 기업 정보 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2">기본 정보</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="companyName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700">기업명</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="예: 비즈다이브 주식회사" {...field} className="h-12 bg-slate-50" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="contactName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700">담당자 성함/직급</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="예: 홍길동 대표" {...field} className="h-12 bg-slate-50" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="contactEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700">이메일</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="example@bizdive.com" {...field} className="h-12 bg-slate-50" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="contactPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700">연락처</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="010-0000-0000" {...field} className="h-12 bg-slate-50" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* 상담 내용 */}
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="text-lg font-bold text-slate-800 pb-2">상담 희망 내용</h3>

                                    <FormField
                                        control={form.control}
                                        name="topics"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel className="font-bold text-slate-700 mb-3 block">어떤 분야의 상담이 필요하신가요? (다중 선택 가능)</FormLabel>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {TOPICS.map((topic) => (
                                                        <FormField
                                                            key={topic.id}
                                                            control={form.control}
                                                            name="topics"
                                                            render={({ field }) => {
                                                                return (
                                                                    <FormItem
                                                                        key={topic.id}
                                                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-slate-200 p-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                                                                    >
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(topic.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    return checked
                                                                                        ? field.onChange([...field.value, topic.id])
                                                                                        : field.onChange(
                                                                                            field.value?.filter(
                                                                                                (value) => value !== topic.id
                                                                                            )
                                                                                        )
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal cursor-pointer w-full text-[14px]">
                                                                            {topic.label}
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                )
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem className="pt-4">
                                                <FormLabel className="font-bold text-slate-700">추가 전달 사항 (선택)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="기업이 현재 겪고 있는 가장 주된 고민이나 컨설턴트에게 미리 알려주고 싶은 내용을 자유롭게 작성해주세요."
                                                        className="min-h-[120px] bg-slate-50 resize-y"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-14 text-lg font-bold bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl shadow-md transition-all mt-4"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? '신청 처리 중...' : '전문가 매칭 신청하기'}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}
