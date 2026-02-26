import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Debug endpoint to check auth and record ownership on Vercel
// Access: GET /api/debug-auth?recordId=xxx
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get('recordId') || 'b9e555d6-95d8-4375-892b-1794ff8a04f9'
    
    const supabase = await createClient()
    
    // 1. Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user) {
        return NextResponse.json({
            status: 'AUTH_FAILED',
            authError: authError?.message,
            user: null
        })
    }
    
    // 2. Query the record
    const { data: record, error: recordError } = await supabase
        .from('diagnosis_records')
        .select(`
            id, user_id, created_at,
            profiles (
                user_name,
                company_name,
                stage,
                industry,
                group_id
            )
        `)
        .eq('id', recordId)
        .single()
    
    // 3. Query current user profile
    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role, group_id')
        .eq('id', user.id)
        .single()
    
    // 4. Security check simulation
    const profile = Array.isArray(record?.profiles) ? record.profiles[0] : record?.profiles
    const recordUserId = record?.user_id?.toString().toLowerCase()
    const currentUserId = user.id?.toString().toLowerCase()
    const isOwner = recordUserId === currentUserId
    
    return NextResponse.json({
        status: 'OK',
        auth: {
            userId: user.id,
            email: user.email
        },
        record: record ? {
            id: record.id,
            user_id: record.user_id,
            created_at: record.created_at
        } : null,
        recordError: recordError?.message || null,
        securityCheck: {
            recordUserId,
            currentUserId,
            isOwner,
            currentUserRole: currentUserProfile?.role,
            profileGroupId: profile?.group_id,
            currentUserGroupId: currentUserProfile?.group_id
        }
    })
}
