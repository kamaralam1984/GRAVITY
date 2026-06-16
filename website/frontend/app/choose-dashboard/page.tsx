'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Shield, Star, Users, MapPin, ChevronRight, ArrowRight, Check, Loader2, X } from 'lucide-react'
import { getToken, getUser } from '@/lib/auth'

// ─── Starfield ────────────────────────────────────────────────────────────────

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf: number
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const stars = Array.from({ length: 120 }, () => ({
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
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

// ─── Invite Code Modal (for child joining) ────────────────────────────────────

function InviteModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleJoin() {
    if (!code.trim()) { setError('Please enter the invite code.'); return }
    setLoading(true)
    setError('')
    try {
      const token = getToken()
      const res = await fetch(`/families/join/${code.trim().toUpperCase()}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'child' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Invalid invite code')
      setDone(true)
      setTimeout(onSuccess, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join family')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        style={{
          width: '100%', maxWidth: 400,
          background: 'linear-gradient(145deg, #0E1320, #13192A)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: '32px 28px',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.06)', border: 'none',
            borderRadius: 8, width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} color="rgba(255,255,255,0.5)" />
        </button>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 0 30px rgba(16,185,129,0.4)',
              }}
            >
              <Check size={28} color="#fff" strokeWidth={3} />
            </motion.div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Family Joined!</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Taking you to your dashboard...</div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'linear-gradient(135deg, #8B5CF620, #8B5CF640)',
                border: '1px solid #8B5CF650',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <Users size={26} color="#8B5CF6" />
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                Enter Invite Code
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                Ask your parent for the Gravity family invite code
              </div>
            </div>

            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. XY7K2P"
              maxLength={8}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: `1.5px solid ${error ? '#EF444460' : code ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.1)'}`,
                background: 'rgba(255,255,255,0.04)',
                color: '#fff',
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '0.25em',
                textAlign: 'center',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 12,
                caretColor: '#8B5CF6',
              }}
            />

            {error && (
              <div style={{ fontSize: 12, color: '#EF4444', textAlign: 'center', marginBottom: 12 }}>
                {error}
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleJoin}
              disabled={loading}
              style={{
                width: '100%', height: 50, borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 20px rgba(139,92,246,0.35)',
              }}
            >
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : (
                <><span>Join Family</span><ArrowRight size={16} /></>
              )}
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Role Card ────────────────────────────────────────────────────────────────

function RoleCard({
  icon, title, subtitle, features, color, gradient, onClick, delay,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  features: string[]
  color: string
  gradient: string
  onClick: () => void
  delay: number
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.button
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileTap={{ scale: 0.97 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      style={{
        position: 'relative',
        width: '100%',
        padding: '28px 24px',
        borderRadius: 24,
        border: `1.5px solid ${hovered ? color + '80' : 'rgba(255,255,255,0.08)'}`,
        background: hovered
          ? `linear-gradient(145deg, ${color}15, ${color}08)`
          : 'rgba(255,255,255,0.03)',
        cursor: 'pointer',
        textAlign: 'left',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        transition: 'border-color 0.3s, background 0.3s',
        boxShadow: hovered ? `0 8px 40px ${color}25` : 'none',
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 120, height: 120,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}20, transparent)`,
        pointerEvents: 'none',
        transition: 'opacity 0.3s',
        opacity: hovered ? 1 : 0,
      }} />

      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: `${gradient}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18,
        boxShadow: hovered ? `0 4px 20px ${color}40` : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        {icon}
      </div>

      {/* Title */}
      <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.3px' }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.5 }}>
        {subtitle}
      </div>

      {/* Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: 6, background: `${color}25`, border: `1px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={10} color={color} strokeWidth={3} />
            </div>
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Continue as {title.replace("I'm a ", '')}</span>
        <ChevronRight size={16} />
      </div>
    </motion.button>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ChooseDashboardPage() {
  const router = useRouter()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const token = getToken()
    const user = getUser()
    if (!token || !user) {
      router.replace('/login')
      return
    }
    // If admin/super_admin roles → go to their proper dashboard
    if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'moderator') {
      router.replace(user.role === 'moderator' ? '/moderator' : user.role === 'admin' ? '/admin' : '/super-admin')
      return
    }
    setAuthChecked(true)
  }, [router])

  function handleParent() {
    localStorage.setItem('gv_dashboard', 'parent')
    router.push('/parent')
  }

  function handleChildSuccess() {
    router.push('/child')
  }

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B0D13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} color="#D4A853" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0B0D13', position: 'relative', overflow: 'hidden' }}>
        <Starfield />

        {/* Orbs */}
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'fixed', top: '-10%', left: '-5%', width: 500, height: 500,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none', zIndex: 1,
          }}
        />
        <motion.div
          animate={{ x: [0, -40, 30, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          style={{
            position: 'fixed', bottom: '-15%', right: '-8%', width: 560, height: 560,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
            filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1,
          }}
        />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 2,
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 20px',
        }}>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #B8720A, #F5A623)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(212,168,83,0.35)',
            }}>
              <Shield size={22} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{
              fontSize: 22, fontWeight: 800,
              background: 'linear-gradient(135deg, #D4A853, #F5C842)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              GRAVITY
            </span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: 40 }}
          >
            <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: 10 }}>
              Who are you?
            </div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 360 }}>
              Tell us your role so we can take you to the right dashboard
            </div>
          </motion.div>

          {/* Cards */}
          <div style={{
            width: '100%', maxWidth: 560,
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}>
            <RoleCard
              delay={0.2}
              icon={<Shield size={28} color="#D4A853" strokeWidth={2} />}
              title="I'm a Parent"
              subtitle="Monitor and protect your entire family from one place"
              features={[
                'Real-time location of all members',
                'SOS alerts & emergency response',
                'Geofence zones & driving safety',
              ]}
              color="#D4A853"
              gradient="linear-gradient(135deg, rgba(212,168,83,0.25), rgba(212,168,83,0.12))"
              onClick={handleParent}
            />
            <RoleCard
              delay={0.3}
              icon={<Star size={28} color="#8B5CF6" strokeWidth={2} />}
              title="I'm a Child"
              subtitle="Stay connected with your family and stay safe everywhere"
              features={[
                'One-tap SOS emergency button',
                'Check in to let family know you\'re safe',
                'See family members nearby',
              ]}
              color="#8B5CF6"
              gradient="linear-gradient(135deg, rgba(139,92,246,0.25), rgba(139,92,246,0.12))"
              onClick={() => setShowInviteModal(true)}
            />
          </div>

          {/* Footer note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              marginTop: 32,
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: 'rgba(255,255,255,0.3)',
            }}
          >
            <MapPin size={12} />
            <span>You can switch roles anytime from settings</span>
          </motion.div>
        </div>
      </div>

      {/* Invite modal */}
      <AnimatePresence>
        {showInviteModal && (
          <InviteModal
            onClose={() => setShowInviteModal(false)}
            onSuccess={handleChildSuccess}
          />
        )}
      </AnimatePresence>
    </>
  )
}
