'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { getToken, getUser } from '@/lib/auth'

interface FloatingSOSProps {
  famId: number | null
  childName: string
}

export default function FloatingSOS({ famId, childName }: FloatingSOSProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [pressing, setPressing] = useState(false)
  const [sent, setSent] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const holdTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const defaultPos = { x: window.innerWidth - 72, y: window.innerHeight - 160 }
    const saved = localStorage.getItem('gravity_sos_pos')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPosition(parsed)
      } catch {
        setPosition(defaultPos)
      }
    } else {
      setPosition(defaultPos)
    }
  }, [])

  async function sendSOS() {
    const token = getToken()
    const user = getUser()
    if (!token || !famId) return
    try {
      await fetch('/sos/trigger', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ family_id: famId, message: `🆘 SOS from ${childName}! Emergency help needed.`, location: null })
      })
      setSent(true)
      setTimeout(() => setSent(false), 5000)
    } catch (_) {}
  }

  function startHold() {
    setPressing(true)
    holdTimer.current = setTimeout(() => {
      sendSOS()
      setConfirmed(false)
      setPressing(false)
    }, 2000)
  }

  function cancelHold() {
    setPressing(false)
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
  }

  if (position === null) return null

  return (
    <>
      <style>{`
        @keyframes sos-pulse {
          0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
          70% { box-shadow: 0 0 0 20px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        .sos-pulse { animation: sos-pulse 1.5s ease-out infinite; }
      `}</style>

      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        onDragEnd={(_event, info) => {
          const newPos = {
            x: position.x + info.offset.x,
            y: position.y + info.offset.y,
          }
          setPosition(newPos)
          localStorage.setItem('gravity_sos_pos', JSON.stringify(newPos))
        }}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 120,
          zIndex: 9999,
          touchAction: 'none',
        }}
      >
        <button
          onClick={() => {
            if (!sent) setConfirmed(true)
          }}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: sent
              ? '#10B981'
              : 'linear-gradient(135deg, #EF4444, #DC2626)',
            boxShadow: '0 0 0 0 rgba(239,68,68,0.7)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className={sent ? '' : 'sos-pulse'}
        >
          {sent ? '✓' : 'SOS'}
        </button>

        {confirmed && (
          <div
            style={{
              position: 'absolute',
              bottom: 70,
              right: 0,
              background: '#1F2937',
              border: '1px solid #374151',
              borderRadius: 12,
              padding: '12px 14px',
              width: 160,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <p style={{ color: '#F9FAFB', fontSize: 13, textAlign: 'center', margin: 0, lineHeight: 1.4 }}>
              Hold 2s to send SOS
            </p>
            <button
              onMouseDown={startHold}
              onMouseUp={cancelHold}
              onMouseLeave={cancelHold}
              onTouchStart={startHold}
              onTouchEnd={cancelHold}
              style={{
                width: '100%',
                padding: '8px 0',
                borderRadius: 8,
                border: 'none',
                background: pressing
                  ? 'linear-gradient(135deg, #B91C1C, #991B1B)'
                  : 'linear-gradient(135deg, #EF4444, #DC2626)',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {pressing ? 'Sending...' : 'Hold to Send'}
            </button>
            <button
              onClick={() => {
                cancelHold()
                setConfirmed(false)
              }}
              style={{
                width: '100%',
                padding: '6px 0',
                borderRadius: 8,
                border: '1px solid #374151',
                background: 'transparent',
                color: '#9CA3AF',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </motion.div>
    </>
  )
}
