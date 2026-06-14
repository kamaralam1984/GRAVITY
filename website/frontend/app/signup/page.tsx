'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Check, ChevronRight,
  Loader2, Shield, Zap, Crown, Star, CheckCircle2, AlertCircle,
  Sparkles, ArrowLeft
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    amountInr: 0,
    period: '/mo',
    icon: <Star size={22} />,
    color: '#6B7280',
    features: ['Up to 2 members', 'Basic location sharing', 'SOS alerts'],
  },
  {
    id: 'family',
    name: 'Family',
    price: '₹199',
    amountInr: 199,
    period: '/mo',
    icon: <Shield size={22} />,
    color: '#4B80F0',
    features: ['Up to 5 members', 'Geofencing (5 zones)', 'Drive safety reports'],
  },
  {
    id: 'family_plus',
    name: 'Family Plus',
    price: '₹499',
    amountInr: 499,
    period: '/mo',
    icon: <Zap size={22} />,
    color: '#D4A853',
    popular: true,
    features: ['Up to 10 members', 'Unlimited geofences', 'AI safety insights'],
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: '₹799',
    amountInr: 799,
    period: '/mo',
    icon: <Crown size={22} />,
    color: '#9B6BF5',
    features: ['Unlimited members', 'Priority 24/7 support', 'All features unlocked'],
  },
]

// ─── Password Strength Component ──────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const strength = checks.filter(Boolean).length
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  if (!password) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            animate={{ backgroundColor: i < strength ? colors[strength - 1] : 'rgba(255,255,255,0.1)' }}
            transition={{ duration: 0.3 }}
            style={{ height: 3, flex: 1, borderRadius: 2 }}
          />
        ))}
      </div>
      <p style={{ fontSize: 11, color: strength > 0 ? colors[strength - 1] : 'rgba(255,255,255,0.3)', marginTop: 4, margin: '4px 0 0' }}>
        {password ? (labels[strength - 1] ?? 'Very Weak') : ''}
      </p>
    </div>
  )
}

// ─── Starfield Canvas ─────────────────────────────────────────────────────────
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf: number
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }))
    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.012
      for (const s of stars) {
        const alpha = 0.25 + 0.65 * ((Math.sin(t * s.speed * 60 + s.phase) + 1) / 2)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha * s.a})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}

// ─── Floating Orbs ────────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <>
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.15, 0.9, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed', top: '-10%', left: '-5%', width: 480, height: 480,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none', zIndex: 1,
        }}
      />
      <motion.div
        animate={{ x: [0, -50, 30, 0], y: [0, 40, -20, 0], scale: [1, 0.85, 1.1, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        style={{
          position: 'fixed', bottom: '-15%', right: '-8%', width: 560, height: 560,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,107,245,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1,
        }}
      />
      <motion.div
        animate={{ x: [0, 30, -40, 0], y: [0, -40, 30, 0], scale: [1, 1.2, 0.95, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        style={{
          position: 'fixed', top: '40%', right: '10%', width: 320, height: 320,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(75,128,240,0.12) 0%, transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none', zIndex: 1,
        }}
      />
    </>
  )
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Connecting line before */}
            {i > 0 && (
              <motion.div
                animate={{ backgroundColor: done || active ? 'rgba(212,168,83,0.6)' : 'rgba(255,255,255,0.1)' }}
                transition={{ duration: 0.4 }}
                style={{ width: 48, height: 2, marginRight: 0 }}
              />
            )}
            {/* Circle */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Pulse ring for active */}
              {active && (
                <motion.div
                  animate={{ scale: [1, 1.7, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', width: 36, height: 36, borderRadius: '50%',
                    border: '2px solid rgba(212,168,83,0.5)',
                    pointerEvents: 'none',
                  }}
                />
              )}
              <motion.div
                animate={{
                  background: done
                    ? 'linear-gradient(135deg,#D4A853,#F5C842)'
                    : active
                    ? 'transparent'
                    : 'rgba(255,255,255,0.06)',
                  borderColor: done || active ? '#D4A853' : 'rgba(255,255,255,0.15)',
                }}
                transition={{ duration: 0.35 }}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: '2px solid',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontWeight: 700, fontSize: 13,
                  color: done ? '#1A0F05' : active ? '#D4A853' : 'rgba(255,255,255,0.3)',
                  position: 'relative', zIndex: 2,
                }}
              >
                {done ? <Check size={14} strokeWidth={3} /> : step}
              </motion.div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function InputField({
  label, type = 'text', value, onChange, placeholder, icon, rightEl, disabled,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  icon?: React.ReactNode
  rightEl?: React.ReactNode
  disabled?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 12.5, fontWeight: 600,
        color: 'rgba(255,255,255,0.55)', marginBottom: 7, letterSpacing: '0.03em',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <div style={{
            position: 'absolute', left: 13, color: focused ? '#D4A853' : 'rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', transition: 'color 0.2s', pointerEvents: 'none',
          }}>
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: `11px ${rightEl ? '44px' : '14px'} 11px ${icon ? '42px' : '14px'}`,
            borderRadius: 11,
            border: `1px solid ${focused ? 'rgba(212,168,83,0.7)' : 'rgba(255,255,255,0.1)'}`,
            background: 'rgba(255,255,255,0.04)',
            color: '#F0EDE8',
            fontSize: 14,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: focused ? '0 0 0 3px rgba(212,168,83,0.1)' : 'none',
            backdropFilter: 'blur(6px)',
            opacity: disabled ? 0.5 : 1,
          }}
        />
        {rightEl && (
          <div style={{ position: 'absolute', right: 12, display: 'flex', alignItems: 'center' }}>
            {rightEl}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── OTP Box Row ──────────────────────────────────────────────────────────────
function OtpBoxes({
  value, onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(6, '').split('').slice(0, 6)

  const handleKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const arr = digits.slice()
      if (arr[idx] && arr[idx] !== ' ') {
        arr[idx] = ''
      } else if (idx > 0) {
        arr[idx - 1] = ''
        refs.current[idx - 1]?.focus()
      }
      onChange(arr.join('').replace(/ /g, ''))
    }
  }

  const handleChange = (idx: number, v: string) => {
    const ch = v.replace(/\D/g, '').slice(-1)
    const arr = digits.slice()
    arr[idx] = ch
    onChange(arr.join('').replace(/ /g, ''))
    if (ch && idx < 5) refs.current[idx + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    const nextIdx = Math.min(pasted.length, 5)
    refs.current[nextIdx]?.focus()
  }

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <motion.input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === ' ' ? '' : digits[i]}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          whileFocus={{ scale: 1.08, borderColor: '#D4A853' }}
          style={{
            width: 44, height: 52, borderRadius: 10,
            border: `2px solid ${digits[i] && digits[i] !== ' ' ? 'rgba(212,168,83,0.8)' : 'rgba(255,255,255,0.12)'}`,
            background: digits[i] && digits[i] !== ' ' ? 'rgba(212,168,83,0.08)' : 'rgba(255,255,255,0.04)',
            color: '#F0EDE8', fontSize: 22, fontWeight: 700,
            textAlign: 'center', outline: 'none',
            transition: 'border-color 0.2s, background 0.2s',
            boxShadow: digits[i] && digits[i] !== ' ' ? '0 0 12px rgba(212,168,83,0.2)' : 'none',
          }}
        />
      ))}
    </div>
  )
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({
  plan, selected, onSelect,
}: {
  plan: typeof PLANS[0]
  selected: boolean
  onSelect: () => void
}) {
  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ scale: 1.025, y: -3 }}
      whileTap={{ scale: 0.975 }}
      style={{
        borderRadius: 16,
        border: `1.5px solid ${selected ? plan.color : 'rgba(255,255,255,0.09)'}`,
        background: selected ? `rgba(${hexToRgb(plan.color)},0.1)` : 'rgba(255,255,255,0.03)',
        padding: '18px 16px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(8px)',
        transition: 'border-color 0.25s, background 0.25s',
        boxShadow: selected ? `0 0 24px rgba(${hexToRgb(plan.color)},0.25)` : 'none',
      }}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'linear-gradient(135deg,#D4A853,#F5C842)',
          color: '#1A0F05', fontSize: 9, fontWeight: 800,
          padding: '3px 8px', borderRadius: 99, letterSpacing: '0.08em',
        }}>
          POPULAR
        </div>
      )}
      {/* Selected check */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          style={{
            position: 'absolute', top: 10, left: 10,
            width: 20, height: 20, borderRadius: '50%',
            background: plan.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Check size={11} color="#fff" strokeWidth={3} />
        </motion.div>
      )}
      <div style={{ color: plan.color, marginBottom: 8 }}>{plan.icon}</div>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#F0EDE8', marginBottom: 4 }}>{plan.name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 10 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: plan.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {plan.price}
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{plan.period}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {plan.features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'rgba(255,255,255,0.55)' }}>
            <Check size={10} style={{ color: plan.color, flexShrink: 0 }} strokeWidth={3} />
            {f}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter()

  // Step
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [dir, setDir] = useState(1) // 1 = forward, -1 = back
  const [showSuccess, setShowSuccess] = useState(false)

  // Step 1 state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [step1Error, setStep1Error] = useState('')
  const [step1Loading, setStep1Loading] = useState(false)

  // Step 2 state
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Step 3 state
  const [selectedPlan, setSelectedPlan] = useState('family_plus')
  const [step3Loading, setStep3Loading] = useState(false)
  const [step3Error, setStep3Error] = useState('')

  // ── Countdown timer for OTP resend
  const startCountdown = () => {
    setCountdown(30)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  // ── Navigation helpers
  const goForward = (n: 2 | 3) => { setDir(1); setStep(n as 1 | 2 | 3) }
  const goBack = (n: 1 | 2) => { setDir(-1); setStep(n as 1 | 2 | 3) }

  // ── Password strength
  const passwordChecks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const passwordStrength = passwordChecks.filter(Boolean).length

  // ── Step 1 validation
  const step1Valid =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    passwordStrength >= 2 &&
    password === confirmPassword &&
    agreeTerms

  // ── Step 1 submit
  const handleStep1 = async () => {
    setStep1Error('')
    if (password !== confirmPassword) { setStep1Error('Passwords do not match.'); return }
    if (!step1Valid) return
    setStep1Loading(true)
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.message || 'Registration failed.')
      if (data.access_token) localStorage.setItem('gravity_token', data.access_token)
      goForward(2)
    } catch (err: any) {
      setStep1Error(err.message || 'Something went wrong. Please try again.')
    } finally {
      setStep1Loading(false)
    }
  }

  // ── Send OTP
  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) { setOtpError('Enter a valid 10-digit phone number.'); return }
    setOtpError('')
    setSendLoading(true)
    try {
      const res = await fetch(`${API}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to send OTP.')
      setOtpSent(true)
      startCountdown()
    } catch (err: any) {
      setOtpError(err.message || 'Failed to send OTP.')
    } finally {
      setSendLoading(false)
    }
  }

  // ── Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setOtpError('Enter the 6-digit OTP.'); return }
    setOtpError('')
    setOtpLoading(true)
    try {
      const res = await fetch(`${API}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}`, otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Invalid OTP.')
      goForward(3)
    } catch (err: any) {
      setOtpError(err.message || 'Invalid OTP. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  // ── Load Razorpay script once
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (document.getElementById('rzp-script')) return
    const s = document.createElement('script')
    s.id = 'rzp-script'
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    document.head.appendChild(s)
  }, [])

  // ── Step 3 — free plan activate
  const handleActivateFree = async () => {
    setStep3Loading(true)
    setStep3Error('')
    await new Promise(r => setTimeout(r, 600))
    setStep3Loading(false)
    setShowSuccess(true)
    setTimeout(() => router.push('/live-tracking?family=1'), 2800)
  }

  // ── Step 3 — paid plan → Razorpay
  const handlePayment = async () => {
    setStep3Error('')
    const plan = PLANS.find(p => p.id === selectedPlan)!
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('gravity_token') || localStorage.getItem('gv_token') || '')
      : ''

    setStep3Loading(true)
    try {
      // 1. Create Razorpay order via backend
      const orderRes = await fetch('/payments/razorpay/order-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan_name: selectedPlan, amount_inr: plan.amountInr }),
      })
      if (!orderRes.ok) {
        const err = await orderRes.json()
        throw new Error(err.detail || 'Failed to create payment order')
      }
      const orderData = await orderRes.json()

      // 2. Open Razorpay checkout
      const rzpOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'GRAVITY Family Safety',
        description: `${plan.name} Plan — Monthly`,
        order_id: orderData.order_id,
        prefill: { name, email, contact: phone ? `+91${phone}` : '' },
        theme: { color: '#D4A853', backdrop_color: 'rgba(6,9,15,0.95)' },
        modal: {
          ondismiss: () => { setStep3Loading(false) },
          escape: true,
          animation: true,
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            // 3. Verify payment with backend
            const verifyRes = await fetch('/payments/razorpay/verify-direct', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_name: selectedPlan,
                amount_inr: plan.amountInr,
              }),
            })
            if (!verifyRes.ok) {
              const err = await verifyRes.json()
              throw new Error(err.detail || 'Payment verification failed')
            }
            setStep3Loading(false)
            setShowSuccess(true)
            setTimeout(() => router.push('/live-tracking?family=1'), 2800)
          } catch (err: any) {
            setStep3Loading(false)
            setStep3Error(err.message || 'Payment verification failed. Contact support.')
          }
        },
      }

      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(rzpOptions)
        rzp.on('payment.failed', () => {
          setStep3Loading(false)
          setStep3Error('Payment failed. Please try again.')
        })
        rzp.open()
      } else {
        throw new Error('Payment gateway not loaded. Please refresh and try again.')
      }
    } catch (err: any) {
      setStep3Loading(false)
      setStep3Error(err.message || 'Something went wrong.')
    }
  }

  // ── Step 3 main handler
  const handleComplete = () => {
    if (selectedPlan === 'free') handleActivateFree()
    else handlePayment()
  }

  // ── Step slide variants
  const slideVariants = {
    initial: (d: number) => ({ x: d * 80, opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d * -80, opacity: 0 }),
  }

  // ── Card labels
  const stepLabels = ['Create Account', 'Verify Phone', 'Choose Plan']

  return (
    <div style={{
      minHeight: '100vh', background: '#0B0D13',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '24px 16px',
      position: 'relative', overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
    }}>
      <Starfield />
      <FloatingOrbs />

      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ position: 'fixed', top: 24, left: 24, zIndex: 20 }}
      >
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
          fontSize: 13, fontWeight: 500, transition: 'color 0.18s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = '#D4A853')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </motion.div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, position: 'relative', zIndex: 10 }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg,#C9913A,#D4A853,#B8720A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 18, color: '#fff',
          boxShadow: '0 6px 24px rgba(184,114,10,0.4)',
        }}>G</div>
        <span style={{
          fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 20,
          background: 'linear-gradient(135deg,#D4A853,#F5C842)', WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>GRAVITY</span>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: step === 3 ? 520 : 440,
          background: 'rgba(17,20,32,0.88)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: '36px 32px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(212,168,83,0.08)',
          position: 'relative', zIndex: 10,
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
          transition: 'max-width 0.4s ease',
        }}
      >
        {/* Step indicator */}
        <StepIndicator current={step} total={3} />

        {/* Step title */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={`title-${step}`} custom={dir}
            variants={slideVariants} initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center', marginBottom: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 6 }}>
              <Sparkles size={14} color="#D4A853" />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#D4A853', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Step {step} of 3
              </span>
            </div>
            <h1 style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 22,
              margin: '0 0 6px',
              background: 'linear-gradient(135deg,#F0EDE8,#A8A29E)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {stepLabels[step - 1]}
            </h1>
          </motion.div>
        </AnimatePresence>

        {/* Steps */}
        <AnimatePresence mode="wait" custom={dir}>
          {/* ── STEP 1 ── */}
          {step === 1 && (
            <motion.div key="step1" custom={dir}
              variants={slideVariants} initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <InputField
                  label="Full Name"
                  value={name}
                  onChange={setName}
                  placeholder="Riya Sharma"
                  icon={<User size={15} />}
                />
                <InputField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="riya@example.com"
                  icon={<Mail size={15} />}
                />
                <div>
                  <InputField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={setPassword}
                    placeholder="Min. 8 characters"
                    icon={<Lock size={15} />}
                    rightEl={
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'rgba(255,255,255,0.35)', padding: 0, display: 'flex', alignItems: 'center',
                      }}>
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                  />
                  <PasswordStrength password={password} />
                </div>
                <div>
                  <InputField
                    label="Confirm Password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Repeat your password"
                    icon={<Lock size={15} />}
                    rightEl={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {confirmPassword && (
                          password === confirmPassword
                            ? <CheckCircle2 size={15} color="#22c55e" />
                            : <AlertCircle size={15} color="#ef4444" />
                        )}
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: 'rgba(255,255,255,0.35)', padding: 0, display: 'flex', alignItems: 'center',
                        }}>
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    }
                  />
                </div>

                {/* Terms checkbox */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 2 }}>
                  <div
                    onClick={() => setAgreeTerms(!agreeTerms)}
                    style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                      border: `1.5px solid ${agreeTerms ? '#D4A853' : 'rgba(255,255,255,0.2)'}`,
                      background: agreeTerms ? 'linear-gradient(135deg,#D4A853,#F5C842)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s', cursor: 'pointer',
                    }}
                  >
                    {agreeTerms && <Check size={11} color="#1A0F05" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                    I agree to the{' '}
                    <Link href="/terms" style={{ color: '#D4A853', textDecoration: 'none' }}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" style={{ color: '#D4A853', textDecoration: 'none' }}>Privacy Policy</Link>
                  </span>
                </label>

                {/* Error */}
                <AnimatePresence>
                  {step1Error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                      style={{
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#EF4444',
                        display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden',
                      }}
                    >
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                      {step1Error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Next button */}
                <motion.button
                  onClick={handleStep1}
                  disabled={!step1Valid || step1Loading}
                  whileHover={step1Valid && !step1Loading ? { scale: 1.015 } : {}}
                  whileTap={step1Valid && !step1Loading ? { scale: 0.985 } : {}}
                  style={{
                    width: '100%', padding: '13px',
                    borderRadius: 11, border: 'none',
                    background: step1Valid
                      ? 'linear-gradient(135deg,#D4A853,#F5C842)'
                      : 'rgba(255,255,255,0.06)',
                    color: step1Valid ? '#1A0F05' : 'rgba(255,255,255,0.2)',
                    fontSize: 14.5, fontWeight: 700,
                    cursor: step1Valid && !step1Loading ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.25s',
                    boxShadow: step1Valid ? '0 4px 24px rgba(212,168,83,0.35)' : 'none',
                    marginTop: 4,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                >
                  {step1Loading
                    ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating account...</>
                    : <>Continue <ChevronRight size={16} /></>
                  }
                </motion.button>

                <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>
                  Already have an account?{' '}
                  <Link href="/login" style={{ color: '#D4A853', textDecoration: 'none', fontWeight: 600 }}>
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <motion.div key="step2" custom={dir}
              variants={slideVariants} initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Phone icon with ring */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {[1, 2].map(ring => (
                    <motion.div key={ring}
                      animate={{ scale: [1, 1.5 + ring * 0.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: ring * 0.5, ease: 'easeOut' }}
                      style={{
                        position: 'absolute', width: 64 + ring * 20, height: 64 + ring * 20,
                        borderRadius: '50%', border: '1.5px solid rgba(212,168,83,0.4)',
                        pointerEvents: 'none',
                      }}
                    />
                  ))}
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'linear-gradient(135deg,rgba(212,168,83,0.15),rgba(212,168,83,0.05))',
                    border: '1.5px solid rgba(212,168,83,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Phone size={26} color="#D4A853" />
                  </div>
                </div>
              </div>

              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 13.5, marginBottom: 22, margin: '0 0 22px' }}>
                Enter your phone number to receive a verification code
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Phone input */}
                <div>
                  <label style={{
                    display: 'block', fontSize: 12.5, fontWeight: 600,
                    color: 'rgba(255,255,255,0.55)', marginBottom: 7, letterSpacing: '0.03em',
                  }}>
                    Phone Number
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{
                      padding: '11px 14px', borderRadius: 11,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      color: '#D4A853', fontSize: 14, fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                    }}>
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      disabled={otpSent}
                      style={{
                        flex: 1, padding: '11px 14px', borderRadius: 11,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)',
                        color: '#F0EDE8', fontSize: 14, outline: 'none',
                        opacity: otpSent ? 0.5 : 1,
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,168,83,0.7)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,168,83,0.1)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  </div>
                </div>

                {/* Send OTP button */}
                {!otpSent && (
                  <motion.button
                    onClick={handleSendOtp}
                    disabled={sendLoading || phone.length < 10}
                    whileHover={phone.length >= 10 && !sendLoading ? { scale: 1.015 } : {}}
                    whileTap={phone.length >= 10 && !sendLoading ? { scale: 0.985 } : {}}
                    style={{
                      width: '100%', padding: '13px', borderRadius: 11, border: 'none',
                      background: phone.length >= 10
                        ? 'linear-gradient(135deg,#D4A853,#F5C842)'
                        : 'rgba(255,255,255,0.06)',
                      color: phone.length >= 10 ? '#1A0F05' : 'rgba(255,255,255,0.2)',
                      fontSize: 14.5, fontWeight: 700,
                      cursor: phone.length >= 10 && !sendLoading ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: phone.length >= 10 ? '0 4px 24px rgba(212,168,83,0.35)' : 'none',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    }}
                  >
                    {sendLoading
                      ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Sending...</>
                      : 'Send OTP'
                    }
                  </motion.button>
                )}

                {/* OTP boxes */}
                <AnimatePresence>
                  {otpSent && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                    >
                      <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                        OTP sent to +91 {phone}
                      </p>
                      <OtpBoxes value={otp} onChange={setOtp} />

                      {/* Resend */}
                      <div style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>
                        {countdown > 0 ? (
                          <span>Resend OTP in <span style={{ color: '#D4A853', fontWeight: 600 }}>{countdown}s</span></span>
                        ) : (
                          <button onClick={() => { setOtp(''); handleSendOtp() }} style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: '#D4A853', fontSize: 12.5, fontWeight: 600, padding: 0,
                          }}>
                            Resend OTP
                          </button>
                        )}
                      </div>

                      {/* Verify button */}
                      <motion.button
                        onClick={handleVerifyOtp}
                        disabled={otp.length !== 6 || otpLoading}
                        whileHover={otp.length === 6 && !otpLoading ? { scale: 1.015 } : {}}
                        whileTap={otp.length === 6 && !otpLoading ? { scale: 0.985 } : {}}
                        style={{
                          width: '100%', padding: '13px', borderRadius: 11, border: 'none',
                          background: otp.length === 6
                            ? 'linear-gradient(135deg,#D4A853,#F5C842)'
                            : 'rgba(255,255,255,0.06)',
                          color: otp.length === 6 ? '#1A0F05' : 'rgba(255,255,255,0.2)',
                          fontSize: 14.5, fontWeight: 700,
                          cursor: otp.length === 6 && !otpLoading ? 'pointer' : 'not-allowed',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          boxShadow: otp.length === 6 ? '0 4px 24px rgba(212,168,83,0.35)' : 'none',
                          fontFamily: 'Plus Jakarta Sans, sans-serif',
                        }}
                      >
                        {otpLoading
                          ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Verifying...</>
                          : <>Verify & Continue <ChevronRight size={16} /></>
                        }
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                  {otpError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                      style={{
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#EF4444',
                        display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden',
                      }}
                    >
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                      {otpError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Skip */}
                <button
                  onClick={() => goForward(3)}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center',
                    padding: '4px 0', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <motion.div key="step3" custom={dir}
              variants={slideVariants} initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            >
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20, margin: '0 0 20px' }}>
                Select the plan that best fits your family
              </p>

              {/* 2x2 plan grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20,
              }}>
                {PLANS.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    selected={selectedPlan === plan.id}
                    onSelect={() => setSelectedPlan(plan.id)}
                  />
                ))}
              </div>

              {/* CTA button — changes based on selected plan */}
              <motion.button
                onClick={handleComplete}
                disabled={step3Loading}
                whileHover={!step3Loading ? { scale: 1.015 } : {}}
                whileTap={!step3Loading ? { scale: 0.985 } : {}}
                style={{
                  width: '100%', padding: '14px', borderRadius: 11, border: 'none',
                  background: selectedPlan === 'free'
                    ? 'linear-gradient(135deg,#D4A853,#F5C842)'
                    : `linear-gradient(135deg, ${PLANS.find(p=>p.id===selectedPlan)?.color ?? '#D4A853'}, #D4A853)`,
                  color: '#1A0F05', fontSize: 15, fontWeight: 800,
                  cursor: step3Loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 28px rgba(212,168,83,0.4)',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  letterSpacing: '0.01em',
                }}
              >
                {step3Loading
                  ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                      {selectedPlan === 'free' ? 'Setting up...' : 'Opening payment...'}
                    </>
                  : selectedPlan === 'free'
                  ? <><Sparkles size={16} /> Start Free Trial</>
                  : <>💳 Pay {PLANS.find(p=>p.id===selectedPlan)?.price} & Activate</>
                }
              </motion.button>

              {/* Error */}
              {step3Error && (
                <div style={{
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#EF4444',
                  display: 'flex', alignItems: 'center', gap: 7,
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  {step3Error}
                </div>
              )}

              <p style={{ textAlign: 'center', fontSize: 11.5, color: 'rgba(255,255,255,0.25)', marginTop: 10 }}>
                {selectedPlan === 'free'
                  ? 'No credit card required for the free plan'
                  : '🔒 Secured by Razorpay — UPI, Cards, NetBanking accepted'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SUCCESS OVERLAY ── */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: 'rgba(17,20,32,0.98)',
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', borderRadius: 'inherit',
                zIndex: 50,
              }}
            >
              {/* Confetti particles */}
              {Array.from({ length: 20 }, (_, i) => (
                <motion.div key={i}
                  initial={{ opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 }}
                  animate={{
                    opacity: 0,
                    y: (Math.random() - 0.5) * 260,
                    x: (Math.random() - 0.5) * 260,
                    scale: Math.random() * 0.8 + 0.2,
                    rotate: Math.random() * 720 - 360,
                  }}
                  transition={{ duration: 1.2 + Math.random() * 0.8, delay: 0.3, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', width: 8, height: 8,
                    borderRadius: Math.random() > 0.5 ? '50%' : 2,
                    background: ['#D4A853', '#F5C842', '#9B6BF5', '#4B80F0', '#22c55e', '#f97316'][i % 6],
                    top: '50%', left: '50%',
                  }}
                />
              ))}

              <motion.div
                animate={{ scale: [0, 1.2, 1], rotate: [0, 360, 360] }}
                transition={{ duration: 0.6 }}
                style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#D4A853,#F5C842)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 50px rgba(212,168,83,0.5)',
                }}
              >
                <CheckCircle2 size={40} color="#1A0F05" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  color: '#F0EDE8', fontSize: '1.5rem', marginTop: '1rem', margin: '1rem 0 0',
                  fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800,
                }}
              >
                Welcome to GRAVITY!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 8 }}
              >
                Your family is now protected
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.9, duration: 1.6 }}
                style={{
                  width: 160, height: 3, borderRadius: 99, marginTop: 24,
                  background: 'linear-gradient(90deg,#D4A853,#F5C842)',
                  transformOrigin: 'left',
                }}
              />
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 10 }}
              >
                Redirecting to dashboard...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Login link below card */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        style={{
          marginTop: 20, fontSize: 12.5, color: 'rgba(255,255,255,0.25)',
          textAlign: 'center', position: 'relative', zIndex: 10,
        }}
      >
        © 2025 Trackalways Technologies — protecting families everywhere
      </motion.p>

      {/* Keyframe for spin */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
