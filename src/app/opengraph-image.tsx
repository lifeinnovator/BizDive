import { ImageResponse } from 'next/og'
import { promises as fs } from 'fs'
import path from 'path'

export const alt = 'BizDive - 7D 기업경영 심층자가진단'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
    // Read the user's uploaded logo image
    const logoPath = path.join(process.cwd(), 'public', 'uploaded-og-logo.png')
    const logoData = await fs.readFile(logoPath)
    const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* 
                  The KakaoTalk preview box often crops the image heavily (sometimes 1:1 in the center).
                  By placing the logo tightly in the center with a restricted width, 
                  it ensures the logo will not be cut off.
                */}
                <img
                    src={logoBase64}
                    alt="BizDive Logo"
                    style={{ width: '1000px', objectFit: 'contain' }}
                />
            </div>
        ),
        {
            ...size,
        }
    )
}
