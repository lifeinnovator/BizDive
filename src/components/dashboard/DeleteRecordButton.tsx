'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteRecordAction } from '@/app/dashboard/actions'

interface DeleteRecordButtonProps {
    recordId: string;
}

export default function DeleteRecordButton({ recordId }: DeleteRecordButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [isHovered, setIsHovered] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        // Prevent clicking this from triggering the parent <Link> block
        e.preventDefault()
        e.stopPropagation()

        if (window.confirm('정말 이 진단 이력을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.')) {
            startTransition(async () => {
                const result = await deleteRecordAction(recordId)
                if (result && !result.success) {
                    alert(result.error || '삭제 중 오류가 발생했습니다.')
                }
            })
        }
    }

    return (
        <div
            onClick={handleDelete}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            /* 
             * Next.js <Link> sometimes intercepts clicks during the capture phase,
             * before they reach this div if the hierarchy is tight. 
             * Using onClickCapture ensures we catch it immediately.
             */
            onClickCapture={handleDelete}
            className={`relative z-10 p-2 -m-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-gray-400 hover:text-rose-500 rounded-full hover:bg-rose-50 cursor-pointer ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
            title="이력 삭제"
            aria-label="Delete diagnostic record"
        >
            <Trash2 className={`w-[18px] h-[18px] transition-transform ${isHovered ? 'scale-110' : 'scale-100'}`} />
        </div>
    )
}
