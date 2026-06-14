'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  MapPin,
  Activity,
  Heart,
  Car,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mic,
  Send,
  User,
  Navigation,
} from 'lucide-react'
import { getToken } from '@/lib/auth'

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function getInsightIcon(iconType: string): React.ReactNode {
  if (iconType === 'check') return <CheckCircle size={12} />
  if (iconType === 'heart') return <Heart size={12} />
  if (iconType === 'car') return <Car size={12} />
  if (iconType === 'map') return <MapPin size={12} />
  if (iconType === 'alert') return <AlertTriangle size={12} />
  return <Brain size={12} />
}

function categoryIcon(cat: string): React.ReactNode {
  if (cat === 'route_safety') return <Navigation size={14} />
  if (cat === 'child_risk') return <User size={14} />
  if (cat === 'elderly_risk') return <Heart size={14} />
  if (cat === 'driving_risk') return <Car size={14} />
  if (cat === 'health_risk') return <Activity size={14} />
  return <Shield size={14} />
}

function categoryLabel(cat: string): string {
  if (cat === 'route_safety') return 'Route Safety Score'
  if (cat === 'child_risk') return 'Child Risk Level'
  if (cat === 'elderly_risk') return 'Elderly Risk'
  if (cat === 'driving_risk') return 'Driving Risk'
  if (cat === 'health_risk') return 'Health Risk'
  return cat
}

/* ── Types ──────────────────────────────────────────────────────────────────── */
interface RiskCard {
  label: string
  score: number | null
  maxScore: number
  badge?: string
  badgeColor?: string
  note?: string
  color: string
  icon: React.ReactNode
}

interface InsightItem {
  icon: React.ReactNode
  dotColor: string
  text: string
  time: string
}

/* ── Neural network animation SVG ───────────────────────────────────────────── */
const NN_NODES = [
  { cx: 32, cy: 28 }, { cx: 88, cy: 18 }, { cx: 144, cy: 36 },
  { cx: 200, cy: 22 }, { cx: 256, cy: 40 }, { cx: 300, cy: 24 },
  { cx: 52, cy: 76 }, { cx: 116, cy: 62 }, { cx: 172, cy: 80 },
  { cx: 228, cy: 58 }, { cx: 280, cy: 74 },
  { cx: 24, cy: 120 }, { cx: 80, cy: 108 }, { cx: 140, cy: 124 },
  { cx: 196, cy: 110 }, { cx: 252, cy: 126 }, { cx: 308, cy: 112 },
]
const NN_EDGES = [
  [0,1],[1,2],[2,3],[3,4],[4,5],
  [0,6],[1,6],[1,7],[2,7],[2,8],[3,8],[3,9],[4,9],[4,10],[5,10],
  [6,11],[6,12],[7,12],[7,13],[8,13],[8,14],[9,14],[9,15],[10,15],[10,16],
  [11,12],[12,13],[13,14],[14,15],[15,16],
]

function NeuralNetworkAnimation() {
  return (
    <svg
      viewBox="0 0 332 148"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.22, pointerEvents: 'none' }}
      preserveAspectRatio="xMidYMid slice"
    >
      {NN_EDGES.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={NN_NODES[a].cx} y1={NN_NODES[a].cy}
          x2={NN_NODES[b].cx} y2={NN_NODES[b].cy}
          stroke="url(#nnLineGrad)"
          strokeWidth="0.7"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.7, 0.2] }}
          transition={{ duration: 2.5 + (i % 5) * 0.4, delay: i * 0.07, repeat: Infinity, repeatType: 'reverse' }}
        />
      ))}
      {NN_NODES.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.cx} cy={n.cy} r="2.5"
          fill="url(#nnDotGrad)"
          animate={{ r: [1.8, 3.5, 1.8], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.2 + (i % 4) * 0.5, delay: i * 0.13, repeat: Infinity }}
        />
      ))}
      <defs>
        <linearGradient id="nnLineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D4A853" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <radialGradient id="nnDotGrad">
          <stop offset="0%" stopColor="#D4A853" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </radialGradient>
      </defs>
    </svg>
  )
}

/* ── Animated circular progress ─────────────────────────────────────────────── */
function CircularProgress({ score, max, color }: { score: number; max: number; color: string }) {
  const r = 30
  const c = 2 * Math.PI * r
  const pct = score / max
  return (
    <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
        <motion.circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${c}`}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          transform="rotate(-90 36 36)"
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        textAlign: 'center', lineHeight: 1.1,
      }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>
          {score}
        </span>
        <span style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.3)', display: 'block' }}>/{max}</span>
      </div>
    </div>
  )
}

/* ── Animated map pin ────────────────────────────────────────────────────────── */
function AnimatedPin({ x, y, color, label }: { x: number; y: number; color: string; label: string }) {
  return (
    <g>
      <motion.circle
        cx={x} cy={y} r="10"
        fill={`${color}20`}
        stroke={`${color}50`}
        strokeWidth="1"
        animate={{ r: [8, 14, 8], opacity: [0.6, 0.2, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle cx={x} cy={y} r="4" fill={color}
        animate={{ r: [3, 5, 3] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />
      <text x={x + 8} y={y - 8} fontSize="7" fill="rgba(255,255,255,0.6)" fontFamily="sans-serif">{label}</text>
    </g>
  )
}

/* ── Main dashboard component ────────────────────────────────────────────────── */
export default function AIGuardianDashboard() {
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [familyId, setFamilyId] = useState<number | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [signalsCount, setSignalsCount] = useState(0)

  const [riskCards, setRiskCards] = useState<RiskCard[]>([
    { label: 'Route Safety Score', score: null, maxScore: 100, badge: '…', badgeColor: '#6B7280', color: '#6B7280', icon: <Navigation size={14} /> },
    { label: 'Child Risk Level', score: null, maxScore: 100, badge: '…', badgeColor: '#6B7280', color: '#6B7280', icon: <User size={14} /> },
    { label: 'Elderly Risk', score: null, maxScore: 100, badge: '…', badgeColor: '#6B7280', color: '#6B7280', icon: <Heart size={14} /> },
    { label: 'Driving Risk', score: null, maxScore: 100, badge: '…', badgeColor: '#6B7280', color: '#6B7280', icon: <Car size={14} /> },
    { label: 'Health Risk', score: null, maxScore: 100, badge: '…', badgeColor: '#6B7280', color: '#6B7280', icon: <Activity size={14} /> },
  ])

  const [insights, setInsights] = useState<InsightItem[]>([])

  useEffect(() => {
    async function load() {
      const token = getToken()
      if (!token) return
      const h = { Authorization: `Bearer ${token}` }
      try {
        const famRes = await fetch('/families/my', { headers: h })
        if (!famRes.ok) return
        const famData = await famRes.json()
        const fid = famData.id ?? famData.family?.id
        if (!fid) return
        setFamilyId(fid)

        const [sr, ir] = await Promise.all([
          fetch(`/api/ai-guardian/safety-scores/${fid}`, { headers: h }),
          fetch(`/api/ai-guardian/insights/${fid}`, { headers: h }),
        ])

        if (sr.ok) {
          const d = await sr.json()
          const CATS = ['route_safety', 'child_risk', 'elderly_risk', 'driving_risk', 'health_risk']
          const cards: RiskCard[] = CATS.map(cat => {
            const s = (d.scores as any[]).find((x: any) => x.category === cat)
            if (!s) return { label: categoryLabel(cat), score: null, maxScore: 100, badge: 'N/A', badgeColor: '#6B7280', color: '#6B7280', icon: categoryIcon(cat) }
            return {
              label: categoryLabel(cat),
              score: s.score,
              maxScore: s.max_score,
              badge: s.badge ?? undefined,
              badgeColor: s.color,
              note: s.note ?? undefined,
              color: s.color,
              icon: categoryIcon(cat),
            }
          })
          setRiskCards(cards)
        }

        if (ir.ok) {
          const d = await ir.json()
          const mapped: InsightItem[] = (d.insights as any[]).map((i: any) => ({
            icon: getInsightIcon(i.icon_type),
            dotColor: i.dot_color,
            text: i.text,
            time: i.time,
          }))
          setInsights(mapped)
          setSignalsCount(d.total_signals_processed ?? 0)
        }
      } catch { /* silent — show placeholder state */ }
    }
    load()
  }, [])

  const [isRecording, setIsRecording] = useState(false)

  const startVoiceInput = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = 'en-IN'; rec.continuous = false; rec.interimResults = false
    setIsRecording(true)
    rec.onresult = (e: any) => { setChatInput(e.results[0][0].transcript); setIsRecording(false) }
    rec.onerror = () => setIsRecording(false)
    rec.onend = () => setIsRecording(false)
    rec.start()
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || aiLoading) return
    const userMsg = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setChatInput('')
    setAiLoading(true)

    try {
      const token = getToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/ai-guardian/ask', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: userMsg, family_id: familyId ?? 1 }),
      })
      if (res.ok) {
        const data = await res.json()
        setChatMessages(prev => [...prev, { role: 'ai', text: data.response }])
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', text: 'AI Guardian is processing. Please try again in a moment.' }])
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Connection error — please check your network.' }])
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div
      style={{
        background: 'rgba(11,13,19,0.95)',
        border: '1px solid rgba(212,168,83,0.2)',
        borderRadius: 20,
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(212,168,83,0.04)',
      }}
    >
      {/* ── Dashboard Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(212,168,83,0.08) 0%, rgba(167,139,250,0.06) 100%)',
          borderBottom: '1px solid rgba(212,168,83,0.15)',
          padding: '18px 24px',
          overflow: 'hidden',
        }}
      >
        <NeuralNetworkAnimation />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.div
            animate={{
              boxShadow: ['0 0 10px rgba(212,168,83,0.3)', '0 0 28px rgba(212,168,83,0.7)', '0 0 10px rgba(212,168,83,0.3)'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(212,168,83,0.2), rgba(167,139,250,0.2))',
              border: '1px solid rgba(212,168,83,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Brain size={20} style={{ color: '#D4A853' }} />
          </motion.div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', fontSize: '1.1rem', margin: 0 }}>
              Gravity AI Guardian
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#10B981' }}>Neural Intelligence Active</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {['94% Accurate', 'Real-time'].map((pill) => (
              <span
                key={pill}
                style={{
                  fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px',
                  borderRadius: 999, background: 'rgba(212,168,83,0.1)',
                  border: '1px solid rgba(212,168,83,0.25)', color: '#D4A853',
                }}
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main 3-column layout ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr 280px',
          minHeight: 420,
        }}
      >
        {/* LEFT PANEL — Predictive Safety Engine */}
        <div
          style={{
            borderRight: '1px solid rgba(255,255,255,0.06)',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Shield size={13} style={{ color: '#D4A853' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D4A853', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Predictive Safety Engine
            </span>
          </div>

          {riskCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ x: 3 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${card.color}22`,
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'default',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: `${card.color}18`,
                  border: `1px solid ${card.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: card.color, flexShrink: 0,
                }}
              >
                {card.icon}
              </div>

              {/* Text content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>{card.label}</div>
                {card.score !== null ? (
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: card.color }}>
                    {card.score}/100
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                      borderRadius: 999, background: `${card.badgeColor}20`,
                      border: `1px solid ${card.badgeColor}40`,
                      color: card.badgeColor,
                    }}
                  >
                    {card.badge}
                  </span>
                )}
                {card.note && (
                  <div style={{ fontSize: '0.62rem', color: card.badgeColor, marginTop: 3, opacity: 0.85 }}>
                    {card.note}
                  </div>
                )}
              </div>

              {/* Circular progress (only for numeric scores) */}
              {card.score !== null && (
                <CircularProgress score={card.score} max={card.maxScore} color={card.color} />
              )}
            </motion.div>
          ))}
        </div>

        {/* CENTER — Family Safety Map */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <MapPin size={13} style={{ color: '#A78BFA' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#A78BFA', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Family Safety Map
            </span>
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              style={{
                marginLeft: 'auto', fontSize: '0.62rem', color: '#10B981',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              Live
            </motion.span>
          </div>

          {/* Map SVG */}
          <div
            style={{
              flex: 1,
              background: 'linear-gradient(180deg, #0a1628 0%, #0d1f3c 100%)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 280,
            }}
          >
            {/* Grid overlay */}
            <svg viewBox="0 0 420 280" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              {/* Grid lines */}
              {[60, 120, 180, 240].map(y => (
                <line key={y} x1="0" y1={y} x2="420" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              ))}
              {[70, 140, 210, 280, 350].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="280" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              ))}

              {/* Roads */}
              <path d="M0,140 C80,130 160,150 280,120 C340,105 380,110 420,100" stroke="rgba(255,255,255,0.07)" strokeWidth="3" fill="none" />
              <path d="M210,0 C200,60 215,120 210,180 C205,230 215,260 210,280" stroke="rgba(255,255,255,0.07)" strokeWidth="2" fill="none" />
              <path d="M0,200 C60,190 120,210 200,195 C280,178 360,200 420,185" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />

              {/* Safe zone circle */}
              <motion.circle
                cx="180" cy="90" r="35"
                fill="rgba(16,185,129,0.06)"
                stroke="rgba(16,185,129,0.25)"
                strokeWidth="1"
                strokeDasharray="4 3"
                animate={{ r: [33, 37, 33] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <text x="155" y="87" fontSize="6" fill="rgba(16,185,129,0.6)" fontFamily="sans-serif">Safe Zone</text>

              {/* Alert zone */}
              <motion.circle
                cx="330" cy="185" r="28"
                fill="rgba(245,158,11,0.06)"
                stroke="rgba(245,158,11,0.3)"
                strokeWidth="1"
                strokeDasharray="3 3"
                animate={{ r: [26, 30, 26] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              />

              {/* Route path */}
              <motion.path
                d="M80,220 C120,200 160,160 200,120 C230,90 260,75 300,65"
                stroke="rgba(212,168,83,0.4)"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="5 3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
              />

              {/* Location pins */}
              <AnimatedPin x={180} y={90} color="#10B981" label="Aanya (School)" />
              <AnimatedPin x={290} y={65} color="#D4A853" label="Dad (Office)" />
              <AnimatedPin x={330} y={185} color="#F59E0B" label="Grandma" />
              <AnimatedPin x={80} y={220} color="#A78BFA" label="Home" />
              <AnimatedPin x={200} y={150} color="#EF4444" label="Rohan" />
            </svg>

            {/* Legend overlay */}
            <div
              style={{
                position: 'absolute', bottom: 10, left: 10,
                background: 'rgba(11,13,19,0.85)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '7px 10px',
                display: 'flex', flexDirection: 'column', gap: 4,
                backdropFilter: 'blur(8px)',
              }}
            >
              {[
                { color: '#10B981', label: 'Safe' },
                { color: '#F59E0B', label: 'Monitor' },
                { color: '#EF4444', label: 'Alert' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.45)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — AI Insights Today */}
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Brain size={13} style={{ color: '#EC4899' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#EC4899', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              AI Insights Today
            </span>
          </div>

          {insights.length === 0 && (
            <div style={{ padding: '12px', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', textAlign: 'center' }}>
              Loading AI insights…
            </div>
          )}
          {insights.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 10,
                position: 'relative',
              }}
            >
              {/* Timeline dot */}
              <div
                style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: `${item.dotColor}18`,
                  border: `1.5px solid ${item.dotColor}50`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.dotColor, marginTop: 1,
                }}
              >
                {item.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, margin: 0, marginBottom: 3 }}>
                  {item.text}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={9} style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>{item.time}</span>
                </div>
              </div>
            </motion.div>
          ))}

          {/* AI confidence footer */}
          <div
            style={{
              marginTop: 4,
              padding: '8px 12px',
              background: 'rgba(167,139,250,0.07)',
              border: '1px solid rgba(167,139,250,0.15)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Activity size={10} style={{ color: '#A78BFA' }} />
            <span style={{ fontSize: '0.63rem', color: 'rgba(167,139,250,0.8)' }}>
              {signalsCount > 0 ? `AI processed ${signalsCount.toLocaleString()} signals today` : 'AI Guardian active'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom: Ask AI Guardian chat bar ─────────────────────────────────── */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.015)',
        }}
      >
        {/* Chat messages area (only shown if there are messages) */}
        <AnimatePresence>
          {chatMessages.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                maxHeight: 180,
                overflowY: 'auto',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '8px 12px',
                      borderRadius: msg.role === 'user' ? '10px 10px 3px 10px' : '10px 10px 10px 3px',
                      background: msg.role === 'user' ? 'rgba(212,168,83,0.12)' : 'rgba(167,139,250,0.1)',
                      border: msg.role === 'user' ? '1px solid rgba(212,168,83,0.25)' : '1px solid rgba(167,139,250,0.2)',
                      color: msg.role === 'user' ? '#D4A853' : 'rgba(255,255,255,0.8)',
                      fontSize: '0.8rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {aiLoading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    padding: '8px 14px', borderRadius: '10px 10px 10px 3px',
                    background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)',
                    display: 'flex', gap: 4, alignItems: 'center',
                  }}>
                    {[0, 1, 2].map(j => (
                      <motion.span key={j} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: j * 0.2 }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', display: 'inline-block' }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <div style={{ padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Mic button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={startVoiceInput}
            style={{
              width: 38, height: 38, borderRadius: 10, cursor: 'pointer',
              background: isRecording ? 'rgba(239,68,68,0.15)' : 'rgba(212,168,83,0.1)',
              border: isRecording ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(212,168,83,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isRecording ? '#EF4444' : '#D4A853', flexShrink: 0,
            }}
            aria-label={isRecording ? 'Listening…' : 'Voice input'}
          >
            <Mic size={15} />
          </motion.button>

          {/* Text input */}
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSendMessage() }}
            placeholder="Ask AI Guardian — 'Where is Aanya?' or 'Is grandma safe?'"
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(212,168,83,0.18)',
              borderRadius: 10,
              padding: '10px 14px',
              color: 'rgba(255,255,255,0.75)',
              fontSize: '0.83rem',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />

          {/* Send button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={handleSendMessage}
            style={{
              width: 38, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #D4A853, #B8860B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(212,168,83,0.3)',
              flexShrink: 0,
            }}
            aria-label="Send message"
          >
            <Send size={15} style={{ color: '#0a0900' }} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
