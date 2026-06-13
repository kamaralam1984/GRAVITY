'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye, EyeOff, Mail, Phone, Shield, Zap,
  ArrowRight, Loader2, CheckCircle2, AlertCircle,
  Fingerprint, Smartphone
} from 'lucide-react'

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

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          prompt: () => void
        }
      }
    }
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string
          scope: string
          redirectURI: string
          usePopup: boolean
        }) => void
        signIn: () => Promise<{ authorization: { id_token: string } }>
      }
    }
  }
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

    // Initialise 150 stars
    starsRef.current = Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.8 + 0.2,
      speed: Math.random() * 0.15 + 0.02,
      opacity: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
    }))

    function draw(ts: number) {
      if (!canvas || !ctx) return
      timeRef.current = ts * 0.001

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const star of starsRef.current) {
        // Twinkle
        const twinkle = Math.sin(timeRef.current * star.twinkleSpeed * 60 + star.twinkleOffset)
        const alpha = star.opacity * (0.6 + 0.4 * twinkle)

        // Slow drift downward (parallax)
        star.y += star.speed
        if (star.y > canvas.height + 2) {
          star.y = -2
          star.x = Math.random() * canvas.width
        }

        // Draw glow
        const grd = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3)
        grd.addColorStop(0, `rgba(255,255,255,${alpha})`)
        grd.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Draw core
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
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// FloatingOrb
// ─────────────────────────────────────────────────────────────
interface FloatingOrbProps {
  color: string
  opacity: number
  size: number
  top?: string
  left?: string
  bottom?: string
  right?: string
  duration: number
}

function FloatingOrb({ color, opacity, size, top, left, bottom, right, duration }: FloatingOrbProps) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        top,
        left,
        bottom,
        right,
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        opacity,
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 1,
      }}
      animate={{
        x: [0, 30, -15, 0],
        y: [0, -20, 10, 0],
        scale: [1, 1.12, 0.96, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        repeatType: 'loop',
      }}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// OTPInput — 6 individual boxes
// ─────────────────────────────────────────────────────────────
function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.input
          key={i}
          ref={(el) => { inputs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === ' ' ? '' : digits[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          whileFocus={{ scale: 1.08 }}
          style={{
            width: 48,
            height: 56,
            textAlign: 'center',
            fontSize: '1.25rem',
            fontWeight: 700,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.05)',
            border: digits[i].trim()
              ? '1.5px solid rgba(212,168,83,0.7)'
              : '1.5px solid rgba(255,255,255,0.1)',
            color: '#fff',
            outline: 'none',
            caretColor: '#D4A853',
            boxShadow: digits[i].trim() ? '0 0 12px rgba(212,168,83,0.25)' : 'none',
            transition: 'border 0.2s, box-shadow 0.2s',
          }}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Google SVG
// ─────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// Apple SVG
// ─────────────────────────────────────────────────────────────
function AppleIcon() {
  return (
    <svg width="18" height="22" viewBox="0 0 814 1000" fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.1c-42.8-76.4-79.6-198.9-79.6-314.8 0-14.3.6-28.6 1.9-42.8 12.8-152.4 108.2-224.9 202.2-224.9 53.2 0 97.9 35.9 131.1 35.9 33.2 0 84.5-37.5 149.4-37.5 23.7 0 108.2 2 162.2 76.4zm-124.8-197.5c31.3-37.5 54.4-89.7 54.4-141.9 0-7.1-.6-14.3-1.9-20.1-51.3 1.9-110.8 34.4-147.7 76.4-28 31.9-54.4 83.8-54.4 136.7 0 7.7.6 15.4 2.6 22.4 3.2.6 8.4 1.3 13.6 1.3 46.2 0 99.4-31.3 133.4-74.8z" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// InputField — styled input wrapper
// ─────────────────────────────────────────────────────────────
interface InputFieldProps {
  icon?: React.ReactNode
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  suffix?: React.ReactNode
  prefix?: React.ReactNode
  disabled?: boolean
}

function InputField({ icon, type = 'text', placeholder, value, onChange, suffix, prefix, disabled }: InputFieldProps) {
  const [focused, setFocused] = useState(false)

  return (
    <motion.div
      animate={{
        boxShadow: focused
          ? '0 0 0 1.5px #D4A853, 0 0 20px rgba(212,168,83,0.2)'
          : '0 0 0 1px rgba(255,255,255,0.08)',
      }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.04)',
        padding: '0 14px',
        height: 52,
        cursor: 'text',
      }}
    >
      {icon && <span style={{ color: focused ? '#D4A853' : 'rgba(255,255,255,0.35)', transition: 'color 0.2s', flexShrink: 0 }}>{icon}</span>}
      {prefix && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: 10 }}>{prefix}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#fff',
          fontSize: 15,
          caretColor: '#D4A853',
        }}
      />
      {suffix && <span style={{ flexShrink: 0 }}>{suffix}</span>}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// GoldButton
// ─────────────────────────────────────────────────────────────
interface GoldButtonProps {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  variant?: 'gold' | 'outline'
  type?: 'button' | 'submit'
}

function GoldButton({ onClick, disabled, loading, children, variant = 'gold', type = 'button' }: GoldButtonProps) {
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null)

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() })
    setTimeout(() => setRipple(null), 600)
    onClick?.()
  }

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: 52,
        borderRadius: 12,
        border: variant === 'outline' ? '1.5px solid rgba(212,168,83,0.4)' : 'none',
        background:
          variant === 'gold'
            ? disabled || loading
              ? 'rgba(212,168,83,0.3)'
              : 'linear-gradient(135deg, #D4A853 0%, #B8882F 50%, #D4A853 100%)'
            : 'transparent',
        color: variant === 'gold' ? '#0B0D13' : '#D4A853',
        fontWeight: 700,
        fontSize: 15,
        letterSpacing: '0.5px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow:
          variant === 'gold' && !(disabled || loading)
            ? '0 4px 24px rgba(212,168,83,0.35), 0 2px 8px rgba(212,168,83,0.2)'
            : 'none',
        transition: 'background 0.3s, box-shadow 0.3s',
      }}
    >
      {ripple && (
        <motion.span
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 8, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.4)',
            pointerEvents: 'none',
          }}
        />
      )}
      {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : children}
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────────────
// Main LoginPage
// ─────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()

  // Tabs
  const [activeTab, setActiveTab] = useState<'email' | 'otp' | 'social'>('email')

  // Email/password
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // OTP
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('Authenticated')

  // OTP countdown
  useEffect(() => {
    if (otpTimer <= 0) return
    const t = setInterval(() => setOtpTimer((p) => p - 1), 1000)
    return () => clearInterval(t)
  }, [otpTimer])

  // Load Google Sign-In SDK
  useEffect(() => {
    if (typeof window === 'undefined') return
    const existing = document.querySelector('script[src*="accounts.google.com"]')
    if (existing) return
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    document.head.appendChild(s)
  }, [])

  // Load Apple Sign-In SDK
  useEffect(() => {
    if (typeof window === 'undefined') return
    const existing = document.querySelector('script[src*="appleid.cdn-apple.com"]')
    if (existing) return
    const s = document.createElement('script')
    s.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
    s.async = true
    document.head.appendChild(s)
  }, [])

  // ── helpers ─────────────────────────────────────────────────
  function showError(msg: string) {
    setError(msg)
    setTimeout(() => setError(null), 5000)
  }

  async function handleLoginSuccess(token: string, message = 'Authenticated') {
    setSuccessMessage(message)
    setSuccess(true)
    localStorage.setItem('gravity_token', token)
    await new Promise((r) => setTimeout(r, 1500))
    router.push('/live-tracking')
  }

  // ── Email login ──────────────────────────────────────────────
  async function handleEmailLogin(e?: React.FormEvent) {
    e?.preventDefault()
    if (!email.trim()) return showError('Please enter your email address.')
    if (!password) return showError('Please enter your password.')
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/auth/login/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.message || 'Login failed')
      await handleLoginSuccess(data.access_token || data.token, 'Welcome back')
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── OTP send ─────────────────────────────────────────────────
  async function handleSendOTP() {
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10)
      return showError('Please enter a valid phone number.')
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phone, purpose: 'login' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.message || 'Failed to send OTP')
      setOtpSent(true)
      setOtpTimer(30)
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Could not send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── OTP verify ───────────────────────────────────────────────
  async function handleVerifyOTP() {
    if (otpCode.length < 6) return showError('Please enter the complete 6-digit OTP.')
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phone, code: otpCode, purpose: 'login' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.message || 'OTP verification failed')
      await handleLoginSuccess(data.access_token || data.token, 'Verified')
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'OTP incorrect or expired.')
    } finally {
      setLoading(false)
    }
  }

  // ── Google sign-in ───────────────────────────────────────────
  function handleGoogleLogin() {
    if (!window.google) return showError('Google Sign-In is loading. Please try again.')
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      callback: async (response) => {
        setLoading(true)
        setError(null)
        try {
          const res = await fetch('/auth/social/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: response.credential }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.detail || data.message || 'Google login failed')
          await handleLoginSuccess(data.access_token || data.token, 'Authenticated with Google')
        } catch (err: unknown) {
          showError(err instanceof Error ? err.message : 'Google login failed.')
        } finally {
          setLoading(false)
        }
      },
    })
    window.google.accounts.id.prompt()
  }

  // ── Apple sign-in ────────────────────────────────────────────
  async function handleAppleLogin() {
    if (!window.AppleID) return showError('Apple Sign-In is loading. Please try again.')
    try {
      window.AppleID.auth.init({
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
        scope: 'name email',
        redirectURI: `${window.location.origin}/auth/callback/apple`,
        usePopup: true,
      })
      const data = await window.AppleID.auth.signIn()
      const idToken = data.authorization.id_token
      setLoading(true)
      const res = await fetch('/auth/social/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity_token: idToken }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.detail || result.message || 'Apple login failed')
      await handleLoginSuccess(result.access_token || result.token, 'Authenticated with Apple')
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== 'popup_closed_by_user') {
        showError(err.message || 'Apple login failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── card shake when error ────────────────────────────────────
  const shakeVariants = {
    idle: { x: 0 },
    shake: {
      x: [-8, 8, -6, 6, -4, 4, 0],
      transition: { duration: 0.45 },
    },
  }

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background: '#0B0D13',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      }}
    >
      {/* Global spin keyframe */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes goldPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(212,168,83,0.6), 0 0 40px rgba(212,168,83,0.3); }
          50% { text-shadow: 0 0 40px rgba(212,168,83,0.9), 0 0 80px rgba(212,168,83,0.5), 0 0 120px rgba(212,168,83,0.2); }
        }
        input::placeholder { color: rgba(255,255,255,0.25); }
        * { box-sizing: border-box; }
      `}</style>

      {/* Starfield */}
      <StarfieldCanvas />

      {/* Background orbs */}
      <FloatingOrb color="#D4A853" opacity={0.15} size={500} top="-10%" left="-5%" duration={8} />
      <FloatingOrb color="#6366f1" opacity={0.1} size={400} bottom="-10%" right="-5%" duration={10} />
      <FloatingOrb color="#D4A853" opacity={0.08} size={300} top="40%" right="10%" duration={7} />

      {/* Login card */}
      <motion.div
        variants={shakeVariants}
        animate={error ? 'shake' : 'idle'}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 460, padding: '0 16px' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            background: 'rgba(17, 20, 32, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(212,168,83,0.15)',
            borderRadius: 24,
            padding: '40px 36px 36px',
            boxShadow:
              '0 0 80px rgba(212,168,83,0.08), 0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
          }}
        >
          {/* ── Success overlay ── */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 24,
                  background: 'rgba(17,20,32,0.97)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  zIndex: 20,
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(212,168,83,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 40px rgba(212,168,83,0.5), 0 0 80px rgba(212,168,83,0.25)',
                  }}
                >
                  <CheckCircle2 size={40} color="#D4A853" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ color: '#D4A853', fontWeight: 700, fontSize: 20, letterSpacing: '0.5px' }}
                >
                  {successMessage}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}
                >
                  Entering GRAVITY...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Logo ── */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <motion.div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginBottom: 8,
              }}
            >
              {/* Shield icon */}
              <motion.div
                animate={{
                  filter: [
                    'drop-shadow(0 0 6px rgba(212,168,83,0.5))',
                    'drop-shadow(0 0 16px rgba(212,168,83,0.9))',
                    'drop-shadow(0 0 6px rgba(212,168,83,0.5))',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Shield size={32} color="#D4A853" strokeWidth={1.5} />
              </motion.div>

              {/* Wordmark */}
              <motion.h1
                animate={{
                  textShadow: [
                    '0 0 20px rgba(212,168,83,0.6)',
                    '0 0 40px rgba(212,168,83,0.9)',
                    '0 0 20px rgba(212,168,83,0.6)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  margin: 0,
                  fontSize: 32,
                  fontWeight: 900,
                  letterSpacing: '6px',
                  color: '#D4A853',
                  lineHeight: 1,
                }}
              >
                GRAVITY
              </motion.h1>
            </motion.div>

            <p style={{ margin: 0, color: 'rgba(255,255,255,0.35)', fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase' }}>
              Family Safety OS
            </p>
          </div>

          {/* ── Tabs ── */}
          <div
            style={{
              display: 'flex',
              gap: 0,
              marginBottom: 28,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              padding: 4,
              position: 'relative',
            }}
          >
            {(['email', 'otp', 'social'] as const).map((tab) => {
              const labels: Record<string, string> = { email: 'Email', otp: 'Phone OTP', social: 'Social' }
              const icons: Record<string, React.ReactNode> = {
                email: <Mail size={14} />,
                otp: <Smartphone size={14} />,
                social: <Fingerprint size={14} />,
              }
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    setError(null)
                  }}
                  style={{
                    flex: 1,
                    height: 38,
                    border: 'none',
                    borderRadius: 8,
                    background: isActive ? 'rgba(212,168,83,0.12)' : 'transparent',
                    color: isActive ? '#D4A853' : 'rgba(255,255,255,0.35)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    position: 'relative',
                    transition: 'color 0.2s, background 0.2s',
                  }}
                >
                  {icons[tab]}
                  {labels[tab]}
                  {isActive && (
                    <motion.div
                      layoutId="tab-underline"
                      style={{
                        position: 'absolute',
                        bottom: 2,
                        left: '20%',
                        right: '20%',
                        height: 2,
                        borderRadius: 1,
                        background: '#D4A853',
                        boxShadow: '0 0 8px rgba(212,168,83,0.8)',
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Error banner ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    boxShadow: '0 0 20px rgba(239,68,68,0.1)',
                    color: '#f87171',
                    fontSize: 13,
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Tab content ── */}
          <AnimatePresence mode="wait">
            {/* ─── EMAIL TAB ─── */}
            {activeTab === 'email' && (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleEmailLogin}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <InputField
                  icon={<Mail size={17} />}
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={setEmail}
                  disabled={loading}
                />
                <InputField
                  icon={<Shield size={17} />}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={setPassword}
                  disabled={loading}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.35)',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Link
                    href="/forgot-password"
                    style={{
                      fontSize: 13,
                      color: 'rgba(212,168,83,0.7)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <GoldButton type="submit" loading={loading} disabled={loading}>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </GoldButton>
              </motion.form>
            )}

            {/* ─── OTP TAB ─── */}
            {activeTab === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <InputField
                  icon={<Phone size={17} />}
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={setPhone}
                  prefix="+91"
                  disabled={otpSent || loading}
                />

                {!otpSent ? (
                  <GoldButton onClick={handleSendOTP} loading={loading} disabled={loading}>
                    <Zap size={16} />
                    <span>Send OTP</span>
                  </GoldButton>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                  >
                    <p style={{ margin: 0, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                      Enter the 6-digit code sent to{' '}
                      <span style={{ color: '#D4A853' }}>+91 {phone}</span>
                    </p>
                    <OTPInput value={otpCode} onChange={setOtpCode} />
                    <GoldButton onClick={handleVerifyOTP} loading={loading} disabled={loading || otpCode.length < 6}>
                      <CheckCircle2 size={16} />
                      <span>Verify OTP</span>
                    </GoldButton>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                      {otpTimer > 0 ? (
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
                          Resend in <span style={{ color: '#D4A853', fontWeight: 600 }}>{otpTimer}s</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => { setOtpSent(false); setOtpCode(''); handleSendOTP() }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#D4A853',
                            fontSize: 13,
                            fontWeight: 600,
                            padding: 0,
                          }}
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ─── SOCIAL TAB ─── */}
            {activeTab === 'social' && (
              <motion.div
                key="social"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {/* Google */}
                <motion.button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    height: 52,
                    borderRadius: 12,
                    background: '#fff',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    color: '#3c4043',
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                    opacity: loading ? 0.7 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <GoogleIcon />
                  Continue with Google
                </motion.button>

                {/* Apple */}
                <motion.button
                  onClick={handleAppleLogin}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    height: 52,
                    borderRadius: 12,
                    background: '#000',
                    border: '1px solid rgba(255,255,255,0.12)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                    opacity: loading ? 0.7 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <AppleIcon />
                  Continue with Apple
                </motion.button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: '1px' }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                </div>

                {/* Trust badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    borderRadius: 10,
                    background: 'rgba(212,168,83,0.06)',
                    border: '1px solid rgba(212,168,83,0.1)',
                  }}
                >
                  <Shield size={14} color="#D4A853" />
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                    We never share your data with third parties
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Footer ── */}
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              New to GRAVITY?{' '}
              <Link
                href="/signup"
                style={{
                  color: '#D4A853',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'color 0.2s',
                }}
              >
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>

        {/* ── Below-card tagline ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            textAlign: 'center',
            marginTop: 20,
            color: 'rgba(255,255,255,0.18)',
            fontSize: 12,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}
        >
          Secured by end-to-end encryption
        </motion.p>
      </motion.div>
    </div>
  )
}
