import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'KVL Track — What Pulls You Together'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0B0D13',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #C9913A, #D4A853)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            fontWeight: 900,
            color: '#fff',
            marginBottom: 24,
          }}
        >
          G
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#F1EDE4',
            letterSpacing: '-2px',
            marginBottom: 16,
          }}
        >
          KVL TRACK
        </div>
        <div style={{ fontSize: 24, color: '#D4A853', marginBottom: 12 }}>
          What Pulls You Together
        </div>
        <div style={{ fontSize: 18, color: '#6B7280' }}>
          Family Safety Platform by KVL Business Solutions
        </div>
      </div>
    ),
    { ...size }
  )
}
