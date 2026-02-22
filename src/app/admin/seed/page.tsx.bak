
'use client'

import { useState } from 'react'
import { seedQuestions } from '@/lib/seed-data'

export default function SeedPage() {
    const [status, setStatus] = useState('Idle')

    const handleSeed = async () => {
        setStatus('Seeding...')
        try {
            await seedQuestions()
            setStatus('Done! Check console for details.')
        } catch (e) {
            console.error(e)
            setStatus('Error: ' + JSON.stringify(e))
        }
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin: Seed Data</h1>
            <p className="mb-4">Click below to populate the Questions table with sample data.</p>
            <button
                onClick={handleSeed}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Run Seed Script
            </button>
            <p className="mt-4 font-mono">{status}</p>
        </div>
    )
}
