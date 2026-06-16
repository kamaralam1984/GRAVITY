'use client'
import { useState, useEffect } from 'react'

export default function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('gravity_pwa_dismissed')
    if (dismissed) return

    const handler = (e: any) => {
      e.preventDefault()
      setPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!show || !prompt) return null

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: 12, right: 12, zIndex: 9998,
      background: 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(16,185,129,0.1))',
      border: '1px solid rgba(212,168,83,0.35)',
      borderRadius: 20, padding: '14px 16px',
      backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ fontSize: 28, flexShrink: 0 }}>📲</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Install Gravity App</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
          Home screen pe add karo — background mein bhi chalta rahega
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={() => { localStorage.setItem('gravity_pwa_dismissed', '1'); setShow(false) }}
          style={{ padding: '6px 12px', borderRadius: 50, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer' }}>
          Later
        </button>
        <button onClick={async () => {
          if (!prompt) return
          await prompt.prompt()
          const choice = await prompt.userChoice
          if (choice.outcome === 'accepted') localStorage.setItem('gravity_pwa_dismissed', '1')
          setShow(false)
        }}
          style={{ padding: '6px 14px', borderRadius: 50, background: 'linear-gradient(135deg, #D4A853, #10B981)', border: 'none', color: '#000', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          Install
        </button>
      </div>
    </div>
  )
}
