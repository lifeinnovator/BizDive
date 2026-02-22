'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function deleteRecordAction(recordId: string) {
    if (!recordId) {
        return { success: false, error: '유효하지 않은 레코드 정보입니다.' }
    }

    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: '로그인이 필요합니다.' }
        }

        // Only delete the record if it belongs to the authenticated user
        const { error } = await supabase
            .from('diagnosis_records')
            .delete()
            .eq('id', recordId)
            .eq('user_id', user.id)

        if (error) {
            console.error('삭제 오류:', error)
            return { success: false, error: '삭제 요청에 실패했습니다.' }
        }

        revalidatePath('/dashboard')
        return { success: true }
    } catch (e) {
        console.error('Delete action exception:', e)
        return { success: false, error: '서버 오류가 발생했습니다.' }
    }
}
