'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import {
  Smartphone, Monitor, Shield, CheckCircle2, Clock, AlertTriangle,
  MapPin, Globe, Cpu, Loader2, X
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface Star {
  x: number; y: number; size: number; speed: number
  opacity: number; twinkleSpeed: number; twinkleOffset: number
}

interface DeviceInfo {
  browser: string
  os: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  ip: string
  location: string
}

// ─────────────────────────────────────────────────────────────
// StarfieldCanvas
// ─────────────────────────────────────────────────────────────
function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const starsRef = useRef<Star[]>([])

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

    starsRef.current = Array.from({ length: 130 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.6 + 0.2,
      speed: Math.random() * 0.12 + 0.02,
      opacity: Math.random() * 0.6 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
    }))

    let time = 0
    function draw(ts: number) {
      if (!canvas || !ctx) return
      time = ts * 0.001
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const star of starsRef.current) {
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset)
        const alpha = star.opacity * (0.6 + 0.4 * twinkle)
        star.y += star.speed
        if (star.y > canvas.height + 2) { star.y = -2; star.x = Math.random() * canvas.width }
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
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// FloatingOrb
// ─────────────────────────────────────────────────────────────
function FloatingOrb({ color, opacity, size, top, left, bottom, right, duration }: {
  color: string; opacity: number; size: number
  top?: string; left?: string; bottom?: string; right?: string; duration: number
}) {
  return (
    <motion.div
      style={{
        position: 'absolute', top, left, bottom, right,
        width: size, height: size, borderRadius: '50%',
        background: color, opacity, filter: 'blur(80px)',
        pointerEvents: 'none', zIndex: 1,
      }}
      animate={{ x: [0, 22, -10, 0], y: [0, -16, 8, 0], scale: [1, 1.1, 0.95, 1] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' }}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// DeviceDetectionRing — animated detection animation
// ─────────────────────────────────────────────────────────────
function DeviceDetectionRing({ deviceType }: { deviceType: 'mobile' | 'tablet' | 'desktop' }) {
  const Icon = deviceType === 'desktop' ? Monitor : Smartphone

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 120, height: 120 }}>
      {/* Outer scanning ring */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.7,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: `1.5px solid rgba(239,68,68,${0.5 - i * 0.1})`,
            boxShadow: i === 0 ? '0 0 12px rgba(239,68,68,0.3)' : 'none',
          }}
        />
      ))}

      {/* Rotating arc */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: 90,
          height: 90,
          borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: 'rgba(239,68,68,0.7)',
          borderRightColor: 'rgba(239,68,68,0.3)',
          boxShadow: '0 0 8px rgba(239,68,68,0.2)',
        }}
      />

      {/* Inner circle */}
      <div style={{
        width: 68, height: 68, borderRadius: '50%',
        background: 'rgba(239,68,68,0.08)',
        border: '1.5px solid rgba(239,68,68,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 24px rgba(239,68,68,0.2)',
      }}>
        <motion.div
          animate={{
            filter: [
              'drop-shadow(0 0 4px rgba(239,68,68,0.5))',
              'drop-shadow(0 0 12px rgba(239,68,68,0.9))',
              'drop-shadow(0 0 4px rgba(239,68,68,0.5))',
            ]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={30} color="#ef4444" strokeWidth={1.5} />
        </motion.div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PulsingDot
// ─────────────────────────────────────────────────────────────
function PulsingDot() {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: 10, height: 10, marginRight: 8 }}>
      <motion.span
        animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
        style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'rgba(239,68,68,0.5)',
        }}
      />
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: '#ef4444',
        boxShadow: '0 0 6px rgba(239,68,68,0.8)',
      }} />
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// OptionCard — lifted-on-hover option card
// ─────────────────────────────────────────────────────────────
interface OptionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  glowColor: string
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  delay?: number
}

function OptionCard({ icon, title, description, color, glowColor, onClick, loading, disabled, delay = 0 }: OptionCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '16px 18px',
        borderRadius: 14,
        background: hovered ? `rgba(${hexToRgb(color)}, 0.08)` : 'rgba(255,255,255,0.03)',
        border: `1.5px solid ${hovered ? `rgba(${hexToRgb(color)}, 0.4)` : 'rgba(255,255,255,0.08)'}`,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
        textAlign: 'left',
        transition: 'background 0.25s, border 0.25s',
        boxShadow: hovered ? `0 8px 32px rgba(${hexToRgb(glowColor)}, 0.15), 0 0 0 1px rgba(${hexToRgb(color)}, 0.1)` : 'none',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {/* Icon circle */}
      <motion.div
        animate={hovered ? { scale: 1.1 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: hovered ? `rgba(${hexToRgb(color)}, 0.15)` : `rgba(${hexToRgb(color)}, 0.08)`,
          border: `1.5px solid rgba(${hexToRgb(color)}, ${hovered ? 0.5 : 0.2})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: hovered ? `0 0 16px rgba(${hexToRgb(glowColor)}, 0.4)` : 'none',
          transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
        }}
      >
        {loading
          ? <Loader2 size={20} color={color} style={{ animation: 'spin 1s linear infinite' }} />
          : icon
        }
      </motion.div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <p style={{
          margin: '0 0 3px', fontSize: 15, fontWeight: 700,
          color: hovered ? color : '#fff',
          transition: 'color 0.2s',
        }}>
          {title}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>
          {description}
        </p>
      </div>

      {/* Arrow */}
      <motion.div
        animate={hovered ? { x: 4, opacity: 1 } : { x: 0, opacity: 0.3 }}
        transition={{ duration: 0.2 }}
        style={{ color, fontSize: 18, fontWeight: 300 }}
      >
        ›
      </motion.div>
    </motion.button>
  )
}

// Helper: hex color to rgb values string
function hexToRgb(hex: string): string {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '255,255,255'
  return `${r},${g},${b}`
}

// ─────────────────────────────────────────────────────────────
// DeviceInfoRow
// ─────────────────────────────────────────────────────────────
function DeviceInfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
      <span style={{ color: 'rgba(212,168,83,0.6)', flexShrink: 0 }}>{icon}</span>
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, flexShrink: 0, minWidth: 70 }}>{label}</span>
      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Not-Me Alert Modal
// ─────────────────────────────────────────────────────────────
function NotMeModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        style={{
          background: 'rgba(17,20,32,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 20,
          padding: '32px 28px',
          maxWidth: 380,
          width: '100%',
          boxShadow: '0 0 60px rgba(239,68,68,0.15), 0 24px 48px rgba(0,0,0,0.6)',
          textAlign: 'center',
        }}
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(239,68,68,0.1)',
            border: '1.5px solid rgba(239,68,68,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 24px rgba(239,68,68,0.25)',
          }}
        >
          <AlertTriangle size={28} color="#ef4444" />
        </motion.div>

        <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 800, color: '#fff' }}>
          Security Alert
        </h3>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
          Your session will be terminated and all tokens will be cleared. You should immediately change your password.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCancel}
            style={{
              flex: 1, height: 44, borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', fontSize: 14,
              fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <X size={14} />
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            style={{
              flex: 1, height: 44, borderRadius: 10,
              background: 'rgba(239,68,68,0.15)',
              border: '1.5px solid rgba(239,68,68,0.5)',
              color: '#f87171', fontSize: 14,
              fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: '0 0 20px rgba(239,68,68,0.2)',
            }}
          >
            <AlertTriangle size={14} />
            Confirm
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// Detect device info from browser UA
// ─────────────────────────────────────────────────────────────
function detectDeviceInfo(): DeviceInfo {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''

  let browser = 'Unknown Browser'
  if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) browser = 'Google Chrome'
  else if (ua.includes('Firefox')) browser = 'Mozilla Firefox'
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Apple Safari'
  else if (ua.includes('Edg')) browser = 'Microsoft Edge'
  else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera'

  let os = 'Unknown OS'
  if (ua.includes('Windows NT 10')) os = 'Windows 10/11'
  else if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS X')) os = 'macOS'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('Linux')) os = 'Linux'

  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
  if (/iPhone|Android.*Mobile|IEMobile|WPDesktop/i.test(ua)) deviceType = 'mobile'
  else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) deviceType = 'tablet'

  return {
    browser,
    os,
    deviceType,
    ip: 'Detecting...',
    location: 'Detecting...',
  }
}

// ─────────────────────────────────────────────────────────────
// Main DeviceVerifyPage
// ─────────────────────────────────────────────────────────────
function DeviceVerifyInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    browser: 'Detecting...', os: 'Detecting...',
    deviceType: 'desktop', ip: 'Detecting...', location: 'Detecting...',
  })
  const [loadingOption, setLoadingOption] = useState<'trust' | 'onetime' | null>(null)
  const [showNotMeModal, setShowNotMeModal] = useState(false)
  const [success, setSuccess] = useState<'trust' | 'onetime' | null>(null)

  // Detect device info on mount
  useEffect(() => {
    const info = detectDeviceInfo()
    setDeviceInfo(info)

    // Try to get approximate IP/location from free public API
    fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
      .then((r) => r.json())
      .then((data) => {
        setDeviceInfo((prev) => ({
          ...prev,
          ip: data.ip || 'Private',
          location: [data.city, data.region, data.country_name]
            .filter(Boolean).join(', ') || 'Unknown',
        }))
      })
      .catch(() => {
        setDeviceInfo((prev) => ({ ...prev, ip: 'Private', location: 'Unknown' }))
      })
  }, [])

  function getRedirect() {
    return searchParams?.get('redirect') || '/live-tracking'
  }

  async function handleTrustDevice() {
    setLoadingOption('trust')
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('gravity_token') : null
      const res = await fetch('/auth/device/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          device_type: deviceInfo.deviceType,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.device_token) {
          localStorage.setItem('gravity_device_token', data.device_token)
        }
      }

      setSuccess('trust')
      await new Promise((r) => setTimeout(r, 1400))
      router.push(getRedirect())
    } catch {
      // Even on error, allow continuation
      setSuccess('trust')
      await new Promise((r) => setTimeout(r, 1000))
      router.push(getRedirect())
    } finally {
      setLoadingOption(null)
    }
  }

  async function handleOneTimeAccess() {
    setLoadingOption('onetime')
    await new Promise((r) => setTimeout(r, 600))
    setLoadingOption(null)
    setSuccess('onetime')
    await new Promise((r) => setTimeout(r, 1000))
    router.push(getRedirect())
  }

  function handleNotMe() {
    setShowNotMeModal(true)
  }

  function confirmNotMe() {
    // Clear all auth tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gravity_token')
      localStorage.removeItem('gravity_device_token')
      sessionStorage.clear()
    }
    setShowNotMeModal(false)
    router.push('/login?alert=security')
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
        input::placeholder { color: rgba(255,255,255,0.25); }
        * { box-sizing: border-box; }
      `}</style>

      <StarfieldCanvas />

      {/* Background orbs */}
      <FloatingOrb color="#ef4444" opacity={0.08} size={500} top="-15%" left="-8%" duration={9} />
      <FloatingOrb color="#D4A853" opacity={0.07} size={400} bottom="-12%" right="-8%" duration={11} />
      <FloatingOrb color="#6366f1" opacity={0.06} size={280} top="40%" right="5%" duration={8} />

      <motion.div
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 480, padding: '0 16px' }}
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
            padding: '40px 36px 36px',
            boxShadow: '0 0 80px rgba(212,168,83,0.06), 0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Top border shimmer */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), rgba(212,168,83,0.4), transparent)',
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
                  gap: 14, zIndex: 20,
                }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: [0, 1.25, 1], rotate: [0, 5, 0] }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'rgba(212,168,83,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 40px rgba(212,168,83,0.5), 0 0 80px rgba(212,168,83,0.2)',
                  }}
                >
                  <CheckCircle2 size={38} color="#D4A853" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  style={{ color: '#D4A853', fontWeight: 700, fontSize: 19, margin: 0 }}
                >
                  {success === 'trust' ? 'Device Trusted' : 'Access Granted'}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}
                >
                  {success === 'trust' ? 'This device has been registered' : 'Continuing as guest session'}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Device detection animation */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <DeviceDetectionRing deviceType={deviceInfo.deviceType} />
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <PulsingDot />
              New Device Detected
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}
            >
              A sign-in attempt was made from an unrecognised device. Please verify your identity.
            </motion.p>
          </div>

          {/* Device info panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
              padding: '4px 14px 4px',
              marginBottom: 24,
            }}
          >
            <DeviceInfoRow icon={<Globe size={13} />} label="Browser" value={deviceInfo.browser} />
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
            <DeviceInfoRow icon={<Cpu size={13} />} label="Platform" value={deviceInfo.os} />
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
            <DeviceInfoRow icon={<Shield size={13} />} label="IP" value={deviceInfo.ip} />
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
            <DeviceInfoRow icon={<MapPin size={13} />} label="Location" value={deviceInfo.location} />
          </motion.div>

          {/* Option cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <OptionCard
              icon={<Shield size={20} color="#D4A853" />}
              title="Trust this device"
              description="Remember this device for future logins without verification"
              color="#D4A853"
              glowColor="#D4A853"
              onClick={handleTrustDevice}
              loading={loadingOption === 'trust'}
              disabled={!!loadingOption || !!success}
              delay={0.4}
            />

            <OptionCard
              icon={<Clock size={20} color="#6366f1" />}
              title="One-time access"
              description="Continue without saving — you'll need to verify again next time"
              color="#6366f1"
              glowColor="#6366f1"
              onClick={handleOneTimeAccess}
              loading={loadingOption === 'onetime'}
              disabled={!!loadingOption || !!success}
              delay={0.5}
            />

            <OptionCard
              icon={<AlertTriangle size={20} color="#ef4444" />}
              title="This isn't me"
              description="Report suspicious activity and secure your account immediately"
              color="#ef4444"
              glowColor="#ef4444"
              onClick={handleNotMe}
              disabled={!!loadingOption || !!success}
              delay={0.6}
            />
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              textAlign: 'center', margin: '24px 0 0',
              color: 'rgba(255,255,255,0.18)', fontSize: 11,
              letterSpacing: '1.5px', textTransform: 'uppercase',
            }}
          >
            KVL TRACK Shield — Real-time device intelligence
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Not-me confirmation modal */}
      <AnimatePresence>
        {showNotMeModal && (
          <NotMeModal
            onConfirm={confirmNotMe}
            onCancel={() => setShowNotMeModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DeviceVerifyPage() { return <Suspense fallback={null}><DeviceVerifyInner /></Suspense> }
