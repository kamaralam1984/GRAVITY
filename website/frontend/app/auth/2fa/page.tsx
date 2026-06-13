'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Shield, Lock, Loader2, CheckCircle2, AlertCircle, RefreshCw, KeyRound } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface Star {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  twinkleSpeed: number
  twinkleOffset: number
}

// ─────────────────────────────────────────────────────────────
// StarfieldCanvas
// ─────────────────────────────────────────────────────────────
function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const starsRef = useRef<Star[]>([])
  const timeRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    starsRef.current = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.6 + 0.2,
      speed: Math.random() * 0.12 + 0.02,
      opacity: Math.random() * 0.6 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
    }))

    function draw(ts: number) {
      if (!canvas || !ctx) return
      timeRef.current = ts * 0.001
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const star of starsRef.current) {
        const twinkle = Math.sin(timeRef.current * star.twinkleSpeed * 60 + star.twinkleOffset)
        const alpha = star.opacity * (0.6 + 0.4 * twinkle)
        star.y += star.speed
        if (star.y > canvas.height + 2) {
          star.y = -2
          star.x = Math.random() * canvas.width
        }
        const grd = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3)
        grd.addColorStop(0, `rgba(255,255,255,${alpha})`)
        grd.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.fill()
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    animFrameRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// FloatingOrb
// ─────────────────────────────────────────────────────────────
interface FloatingOrbProps {
  color: string; opacity: number; size: number
  top?: string; left?: string; bottom?: string; right?: string; duration: number
}

function FloatingOrb({ color, opacity, size, top, left, bottom, right, duration }: FloatingOrbProps) {
  return (
    <motion.div
      style={{
        position: 'absolute', top, left, bottom, right,
        width: size, height: size, borderRadius: '50%',
        background: color, opacity, filter: 'blur(80px)',
        pointerEvents: 'none', zIndex: 1,
      }}
      animate={{ x: [0, 25, -12, 0], y: [0, -18, 8, 0], scale: [1, 1.1, 0.95, 1] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' }}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// OTPBoxes — 6 individual digit boxes with scanning line
// ─────────────────────────────────────────────────────────────
function OTPBoxes({ value, onChange, disabled }: {
  value: string; onChange: (v: string) => void; disabled?: boolean
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(6, ' ').split('')

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i].trim() && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  function handleChange(i: number, v: string) {
    const d = v.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d || ' '
    onChange(next.join('').replace(/ /g, ''))
    if (d && i < 5) inputs.current[i + 1]?.focus()
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    const focusIdx = Math.min(pasted.length, 5)
    inputs.current[focusIdx]?.focus()
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Scanning line animation */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 2,
          height: '100%',
          background: 'linear-gradient(180deg, transparent 0%, #D4A853 30%, rgba(212,168,83,0.9) 50%, #D4A853 70%, transparent 100%)',
          boxShadow: '0 0 8px rgba(212,168,83,0.8), 0 0 16px rgba(212,168,83,0.4)',
          borderRadius: 2,
          zIndex: 2,
          pointerEvents: 'none',
        }}
        animate={{ x: [-4, 334] }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          repeatDelay: 0.8,
          ease: 'easeInOut',
        }}
      />

      <div className="flex gap-3 justify-center" style={{ display: 'flex', gap: 12 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.input
            key={i}
            ref={(el) => { inputs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i] === ' ' ? '' : digits[i]}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            onPaste={handlePaste}
            whileFocus={{ scale: 1.1 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              width: 50,
              height: 58,
              textAlign: 'center',
              fontSize: '1.4rem',
              fontWeight: 700,
              borderRadius: 12,
              background: digits[i].trim()
                ? 'rgba(212,168,83,0.08)'
                : 'rgba(255,255,255,0.04)',
              border: digits[i].trim()
                ? '1.5px solid rgba(212,168,83,0.7)'
                : '1.5px solid rgba(255,255,255,0.1)',
              color: '#fff',
              outline: 'none',
              caretColor: '#D4A853',
              boxShadow: digits[i].trim()
                ? '0 0 16px rgba(212,168,83,0.3), inset 0 1px 0 rgba(212,168,83,0.1)'
                : 'none',
              transition: 'border 0.2s, box-shadow 0.2s, background 0.2s',
              cursor: disabled ? 'not-allowed' : 'text',
              opacity: disabled ? 0.6 : 1,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// AnimatedShieldIcon
// ─────────────────────────────────────────────────────────────
function AnimatedShieldIcon({ success }: { success: boolean }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer pulsing ring */}
      <motion.div
        animate={success ? { scale: [1, 1.8], opacity: [0.6, 0] } : { scale: [1, 1.4, 1], opacity: [0.4, 0.1, 0.4] }}
        transition={success
          ? { duration: 0.6, ease: 'easeOut' }
          : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: '50%',
          border: `2px solid ${success ? '#D4A853' : 'rgba(212,168,83,0.5)'}`,
          boxShadow: success ? '0 0 30px rgba(212,168,83,0.7)' : 'none',
        }}
      />

      {/* Middle ring */}
      <motion.div
        animate={success ? { scale: [1, 2], opacity: [0.4, 0] } : { scale: [1, 1.2, 1], opacity: [0.3, 0.05, 0.3] }}
        transition={success
          ? { duration: 0.8, delay: 0.1, ease: 'easeOut' }
          : { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }
        }
        style={{
          position: 'absolute',
          width: 76,
          height: 76,
          borderRadius: '50%',
          border: '1.5px solid rgba(212,168,83,0.4)',
        }}
      />

      {/* Shield circle background */}
      <motion.div
        animate={success
          ? { scale: [1, 1.2, 1], background: ['rgba(212,168,83,0.1)', 'rgba(212,168,83,0.25)', 'rgba(212,168,83,0.15)'] }
          : {}
        }
        transition={{ duration: 0.5 }}
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: success ? 'rgba(212,168,83,0.15)' : 'rgba(212,168,83,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: success
            ? '0 0 40px rgba(212,168,83,0.6), 0 0 80px rgba(212,168,83,0.25)'
            : '0 0 20px rgba(212,168,83,0.2)',
          transition: 'box-shadow 0.4s',
        }}
      >
        <motion.div
          animate={success ? { scale: [1, 1.3, 1], rotate: [0, 10, -5, 0] } : {
            filter: [
              'drop-shadow(0 0 4px rgba(212,168,83,0.5))',
              'drop-shadow(0 0 12px rgba(212,168,83,0.9))',
              'drop-shadow(0 0 4px rgba(212,168,83,0.5))',
            ]
          }}
          transition={success
            ? { duration: 0.5, ease: 'easeOut' }
            : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {success
            ? <CheckCircle2 size={30} color="#D4A853" strokeWidth={2} />
            : <Shield size={30} color="#D4A853" strokeWidth={1.5} />
          }
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// GoldButton
// ─────────────────────────────────────────────────────────────
function GoldButton({ onClick, disabled, loading, children }: {
  onClick?: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode
}) {
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null)

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled || loading) return
    const rect = e.currentTarget.getBoundingClientRect()
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() })
    setTimeout(() => setRipple(null), 600)
    onClick?.()
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      style={{
        position: 'relative', overflow: 'hidden',
        width: '100%', height: 52, borderRadius: 12, border: 'none',
        background: disabled || loading
          ? 'rgba(212,168,83,0.3)'
          : 'linear-gradient(135deg, #D4A853 0%, #B8882F 50%, #D4A853 100%)',
        color: '#0B0D13', fontWeight: 700, fontSize: 15,
        letterSpacing: '0.5px', cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: disabled || loading
          ? 'none'
          : '0 4px 24px rgba(212,168,83,0.35), 0 2px 8px rgba(212,168,83,0.2)',
        transition: 'background 0.3s, box-shadow 0.3s',
      }}
    >
      {ripple && (
        <motion.span
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 8, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute', left: ripple.x - 10, top: ripple.y - 10,
            width: 20, height: 20, borderRadius: '50%',
            background: 'rgba(255,255,255,0.4)', pointerEvents: 'none',
          }}
        />
      )}
      {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : children}
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────────────
// Main TwoFactorPage
// ─────────────────────────────────────────────────────────────
function TwoFactorInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [code, setCode] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [useBackup, setUseBackup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

  function showError(msg: string) {
    setError(msg)
    setShakeKey((k) => k + 1)
    setTimeout(() => setError(null), 5000)
  }

  const handleVerify = useCallback(async () => {
    const payload = useBackup ? backupCode.trim() : code
    if (!payload || payload.length < 6) {
      return showError(useBackup ? 'Please enter your backup code.' : 'Please enter the complete 6-digit code.')
    }

    setLoading(true)
    setError(null)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('gravity_token') : null
      const res = await fetch('/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(useBackup ? { backup_code: payload } : { code: payload }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.message || '2FA verification failed')

      if (data.access_token || data.token) {
        localStorage.setItem('gravity_token', data.access_token || data.token)
      }

      setSuccess(true)
      await new Promise((r) => setTimeout(r, 1600))
      const redirect = searchParams?.get('redirect') || '/live-tracking'
      router.push(redirect)
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [code, backupCode, useBackup, router, searchParams])

  // Auto-submit when all 6 digits entered (non-backup mode)
  useEffect(() => {
    if (!useBackup && code.length === 6 && !loading && !success) {
      handleVerify()
    }
  }, [code, useBackup, loading, success, handleVerify])

  const shakeVariants = {
    idle: { x: 0 },
    shake: {
      x: [-10, 10, -8, 8, -5, 5, -2, 2, 0],
      transition: { duration: 0.55 },
    },
  }

  return (
    <div
      style={{
        position: 'relative', minHeight: '100vh', width: '100%',
        background: '#0B0D13', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes scanPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        input::placeholder { color: rgba(255,255,255,0.25); }
        * { box-sizing: border-box; }
      `}</style>

      <StarfieldCanvas />

      {/* Background orbs */}
      <FloatingOrb color="#D4A853" opacity={0.12} size={500} top="-15%" left="-8%" duration={9} />
      <FloatingOrb color="#6366f1" opacity={0.08} size={400} bottom="-12%" right="-8%" duration={11} />
      <FloatingOrb color="#D4A853" opacity={0.06} size={280} top="50%" right="5%" duration={7} />

      {/* Card wrapper with shake */}
      <motion.div
        key={shakeKey}
        variants={shakeVariants}
        animate={error ? 'shake' : 'idle'}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440, padding: '0 16px' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            background: 'rgba(17, 20, 32, 0.8)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(212,168,83,0.15)',
            borderRadius: 24,
            padding: '44px 40px 40px',
            boxShadow: '0 0 80px rgba(212,168,83,0.07), 0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top border shimmer */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.6), transparent)',
              pointerEvents: 'none',
            }}
          />

          {/* Success overlay */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute', inset: 0, borderRadius: 24,
                  background: 'rgba(17,20,32,0.97)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 16, zIndex: 20,
                }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: [0, 1.3, 1], rotate: [0, 5, 0] }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    width: 88, height: 88, borderRadius: '50%',
                    background: 'rgba(212,168,83,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 50px rgba(212,168,83,0.6), 0 0 100px rgba(212,168,83,0.25)',
                  }}
                >
                  <CheckCircle2 size={42} color="#D4A853" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ color: '#D4A853', fontWeight: 700, fontSize: 20, letterSpacing: '0.5px', margin: 0 }}
                >
                  Identity Verified
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}
                >
                  Entering GRAVITY...
                </motion.p>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 1.0, ease: 'easeInOut' }}
                  style={{
                    width: 160, height: 2, borderRadius: 1,
                    background: 'linear-gradient(90deg, transparent, #D4A853, transparent)',
                    transformOrigin: 'left',
                    boxShadow: '0 0 8px rgba(212,168,83,0.6)',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shield icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <AnimatedShieldIcon success={success} />
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{
                margin: '0 0 8px',
                fontSize: 24,
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '0.3px',
              }}
            >
              Two-Factor Authentication
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                margin: 0, fontSize: 14,
                color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.5,
              }}
            >
              {useBackup
                ? 'Enter one of your saved backup codes'
                : 'Enter the 6-digit code from your authenticator app'
              }
            </motion.p>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', borderRadius: 10,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  boxShadow: '0 0 20px rgba(239,68,68,0.1)',
                  color: '#f87171', fontSize: 13,
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input area */}
          <AnimatePresence mode="wait">
            {!useBackup ? (
              <motion.div
                key="totp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
              >
                <OTPBoxes value={code} onChange={setCode} disabled={loading || success} />

                <div style={{ width: '100%' }}>
                  <GoldButton
                    onClick={handleVerify}
                    loading={loading}
                    disabled={loading || success || code.length < 6}
                  >
                    <Lock size={16} />
                    <span>Verify Code</span>
                  </GoldButton>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="backup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {/* Backup code input */}
                <motion.div
                  animate={{
                    boxShadow: backupCode
                      ? '0 0 0 1.5px #D4A853, 0 0 20px rgba(212,168,83,0.2)'
                      : '0 0 0 1px rgba(255,255,255,0.08)',
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    borderRadius: 12, background: 'rgba(255,255,255,0.04)',
                    padding: '0 14px', height: 52,
                  }}
                >
                  <KeyRound size={17} color={backupCode ? '#D4A853' : 'rgba(255,255,255,0.35)'} style={{ transition: 'color 0.2s', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Enter backup code (e.g. XXXX-XXXX)"
                    value={backupCode}
                    disabled={loading || success}
                    onChange={(e) => setBackupCode(e.target.value)}
                    style={{
                      flex: 1, background: 'transparent', border: 'none',
                      outline: 'none', color: '#fff', fontSize: 15,
                      caretColor: '#D4A853', letterSpacing: '1px',
                    }}
                  />
                </motion.div>

                <GoldButton
                  onClick={handleVerify}
                  loading={loading}
                  disabled={loading || success || !backupCode.trim()}
                >
                  <Lock size={16} />
                  <span>Use Backup Code</span>
                </GoldButton>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ textAlign: 'center', marginTop: 20 }}
          >
            <button
              onClick={() => {
                setUseBackup((b) => !b)
                setCode('')
                setBackupCode('')
                setError(null)
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(212,168,83,0.7)', fontSize: 13, fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                transition: 'color 0.2s', padding: 0,
              }}
            >
              {useBackup ? (
                <><Shield size={13} /> Use authenticator app instead</>
              ) : (
                <><RefreshCw size={13} /> Use a backup code instead</>
              )}
            </button>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              textAlign: 'center', margin: '20px 0 0',
              color: 'rgba(255,255,255,0.2)', fontSize: 12,
              letterSpacing: '1px', textTransform: 'uppercase',
            }}
          >
            Secured by GRAVITY Shield
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function TwoFactorPage() { return <Suspense fallback={null}><TwoFactorInner /></Suspense> }
