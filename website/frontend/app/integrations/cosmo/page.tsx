'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Camera, Brain, Eye, AlertTriangle, Shield, Zap, Activity, TrendingUp, ChevronRight, Loader2, CheckCircle2, XCircle, BarChart3, Sparkles } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/* ── Types ──────────────────────────────────────────────────────────────────── */
interface CosmoEvent {
  id: number
  event_type: string
  severity: string
  confidence: number
  ai_analysis: string
  created_at: string
  analyzing?: boolean
  analyzed?: boolean
}

interface BehaviorReport {
  score: number
  grade: string
  top_issue: string
  ai_tip: string
}

/* ── Mock Data ──────────────────────────────────────────────────────────────── */
const MOCK_EVENTS: CosmoEvent[] = [
  { id: 1, event_type: "collision_warning", severity: "critical", confidence: 0.95, ai_analysis: "Forward vehicle braked suddenly. Collision risk detected at 67 km/h.", created_at: new Date(Date.now() - 120000).toISOString() },
  { id: 2, event_type: "pedestrian", severity: "high", confidence: 0.88, ai_analysis: "Pedestrian crossing detected. Speed reduction recommended.", created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 3, event_type: "lane_departure", severity: "medium", confidence: 0.76, ai_analysis: "Slight lane drift detected. Adjust steering.", created_at: new Date(Date.now() - 600000).toISOString() },
  { id: 4, event_type: "phone_use", severity: "high", confidence: 0.92, ai_analysis: "Driver distraction detected. Pull over to use phone safely.", created_at: new Date(Date.now() - 900000).toISOString() },
]

const MOCK_REPORT: BehaviorReport = {
  score: 77,
  grade: "B",
  top_issue: "Occasional Phone Use",
  ai_tip: "Keep your phone in 'Do Not Disturb While Driving' mode. This alone can boost your score by 12 points.",
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const eventMeta: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  collision_warning: { label: "Collision Warning", icon: <AlertTriangle size={16} />, color: "#EF4444" },
  pedestrian: { label: "Pedestrian Detected", icon: <Eye size={16} />, color: "#F97316" },
  lane_departure: { label: "Lane Departure", icon: <Activity size={16} />, color: "#EAB308" },
  phone_use: { label: "Phone Use", icon: <Brain size={16} />, color: "#A855F7" },
  harsh_brake: { label: "Harsh Brake", icon: <Zap size={16} />, color: "#EF4444" },
  tailgating: { label: "Tailgating", icon: <AlertTriangle size={16} />, color: "#F97316" },
}

const severityGlow: Record<string, string> = {
  critical: "0 0 30px rgba(239,68,68,0.35)",
  high: "0 0 22px rgba(249,115,22,0.25)",
  medium: "0 0 18px rgba(234,179,8,0.2)",
  low: "0 0 12px rgba(16,185,129,0.15)",
}

const severityBorder: Record<string, string> = {
  critical: "rgba(239,68,68,0.5)",
  high: "rgba(249,115,22,0.4)",
  medium: "rgba(234,179,8,0.35)",
  low: "rgba(16,185,129,0.3)",
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

/* ── Score Ring ─────────────────────────────────────────────────────────────── */
function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const [display, setDisplay] = useState(0)
  const radius = 65
  const circumference = 2 * Math.PI * radius
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#D4A853" : "#EF4444"

  useEffect(() => {
    let v = 0
    const step = score / (1600 / 16)
    const t = setInterval(() => {
      v += step
      if (v >= score) { v = score; clearInterval(t) }
      setDisplay(Math.round(v))
    }, 16)
    return () => clearInterval(t)
  }, [score])

  return (
    <div style={{ position: "relative", width: 160, height: 160 }}>
      <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle
          cx="80" cy="80" r={radius}
          fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (display / 100) * circumference }}
          style={{ filter: `drop-shadow(0 0 10px ${color}80)` }}
        />
      </svg>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)", textAlign: "center",
      }}>
        <div style={{ fontSize: "2rem", fontWeight: 900, color: "#FFF" }}>{display}</div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.7, type: "spring" }}
          style={{
            background: `${color}20`, border: `1px solid ${color}50`,
            color, borderRadius: 8, padding: "1px 10px",
            fontSize: "0.85rem", fontWeight: 800, marginTop: 2,
          }}
        >
          {grade}
        </motion.div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function CosmoPage() {
  const [events, setEvents] = useState<CosmoEvent[]>(MOCK_EVENTS)
  const [report, setReport] = useState<BehaviorReport>(MOCK_REPORT)
  const [loading, setLoading] = useState(true)
  const [analyzingAll, setAnalyzingAll] = useState(false)
  const [scanY, setScanY] = useState(0)

  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })
  const scoreRef = useRef(null)
  const scoreInView = useInView(scoreRef, { once: true })

  // Scan line animation
  useEffect(() => {
    let pos = 0
    const t = setInterval(() => {
      pos = (pos + 1) % 100
      setScanY(pos)
    }, 20)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [eRes, rRes] = await Promise.all([
          fetch('/api/cosmo/events'),
          fetch('/api/cosmo/behavior-report'),
        ])
        if (eRes.ok) setEvents(await eRes.json())
        if (rRes.ok) setReport(await rRes.json())
      } catch { /* use mock */ }
      finally { setLoading(false) }
    }
    const t = setTimeout(() => setLoading(false), 700)
    fetchAll()
    return () => clearTimeout(t)
  }, [])

  const analyzeEvent = async (id: number) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, analyzing: true } : e))
    try {
      const res = await fetch('/api/cosmo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: id }),
      })
      if (res.ok) {
        const data = await res.json()
        setEvents(prev => prev.map(e => e.id === id ? { ...e, analyzing: false, analyzed: true, ai_analysis: data.analysis || e.ai_analysis } : e))
      }
    } catch {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, analyzing: false, analyzed: true } : e))
    }
  }

  const getAIAnalysis = async () => {
    setAnalyzingAll(true)
    try {
      const res = await fetch('/api/cosmo/behavior-report')
      if (res.ok) setReport(await res.json())
    } catch { /* noop */ }
    await new Promise(r => setTimeout(r, 1200))
    setAnalyzingAll(false)
  }

  return (
    <>
      <Navbar />

      {/* ── GLITCH + SCANLINE STYLES ──────────────────────────────────────────── */}
      <style>{`
        @keyframes glitch {
          0%, 92%, 100% { text-shadow: none; transform: none; }
          93% { text-shadow: -3px 0 rgba(255,0,60,0.8), 3px 0 rgba(0,255,240,0.8); transform: skewX(-1deg); }
          94% { text-shadow: 3px 0 rgba(255,0,60,0.8), -3px 0 rgba(0,255,240,0.8); transform: skewX(1deg); }
          95% { text-shadow: none; transform: none; }
          96% { text-shadow: -2px 0 rgba(255,0,60,0.6); transform: translateX(2px); }
          97% { text-shadow: 2px 0 rgba(0,255,240,0.6); transform: translateX(-2px); }
        }
        .glitch-text { animation: glitch 3s step-end infinite; }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes aiPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 50% { box-shadow: 0 0 0 8px rgba(16,185,129,0); } }

        .ai-badge-pulse { animation: aiPulse 2s ease-in-out infinite; }
        .dot-blink { animation: blink 1.2s step-end infinite; }

        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }

        @keyframes detectionBox {
          0%, 85%, 100% { opacity: 0; }
          20%, 70% { opacity: 1; }
        }
        .detection-box-1 { animation: detectionBox 4s ease-in-out infinite; }
        .detection-box-2 { animation: detectionBox 4s ease-in-out infinite 1.5s; }
        .detection-box-3 { animation: detectionBox 4s ease-in-out infinite 2.8s; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          background: "linear-gradient(135deg, #050508 0%, #080a10 50%, #050508 100%)",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          padding: "120px 24px 80px",
        }}
      >
        {/* Scanline overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
          pointerEvents: "none", zIndex: 0,
        }} />

        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(16,185,129,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }} />

        {/* Central glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 600, height: 600, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, rgba(212,168,83,0.04) 40%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
            style={{
              position: "absolute",
              top: `${15 + (i * 11) % 70}%`,
              left: `${5 + (i * 13) % 85}%`,
              width: 3, height: 3, borderRadius: "50%",
              background: i % 2 === 0 ? "#10B981" : "#D4A853",
              pointerEvents: "none",
            }}
          />
        ))}

        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, position: "relative", zIndex: 1, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              style={{ marginBottom: 16 }}
            >
              <span style={{
                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                color: "#10B981", borderRadius: 999, padding: "5px 16px",
                fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                <Camera size={11} /> KVL Business Solutions AI Dashcam
              </span>
            </motion.div>

            <motion.h1
              className="glitch-text"
              initial={{ opacity: 0, y: 40 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3rem, 8vw, 5.5rem)",
                fontWeight: 900, lineHeight: 0.95,
                marginBottom: 20, letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #D4A853 0%, #F5D78E 40%, #10B981 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}
            >
              COSMO AI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.35 }}
              style={{ color: "rgba(255,255,255,0.45)", fontSize: "1.05rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 300, marginBottom: 12 }}
            >
              AI-Powered Dashcam Intelligence
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
              style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: 440 }}
            >
              Real-time collision detection, driver distraction analysis, lane monitoring, and AI-generated safety insights — all processed on-device, in milliseconds.
            </motion.p>
          </div>

          {/* Camera feed placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.7 }}
            style={{
              flex: "0 0 auto",
              width: 360, height: 210,
              background: "#000",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 12,
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 0 40px rgba(16,185,129,0.15)",
            }}
          >
            {/* Corner brackets */}
            {[["top:0;left:0", "borderTop,borderLeft"], ["top:0;right:0", "borderTop,borderRight"], ["bottom:0;left:0", "borderBottom,borderLeft"], ["bottom:0;right:0", "borderBottom,borderRight"]].map((_, ci) => {
              const positions = [
                { top: 0, left: 0 },
                { top: 0, right: 0 },
                { bottom: 0, left: 0 },
                { bottom: 0, right: 0 },
              ]
              const borders: React.CSSProperties[] = [
                { borderTop: "2px solid #10B981", borderLeft: "2px solid #10B981", borderTopLeftRadius: 8 },
                { borderTop: "2px solid #10B981", borderRight: "2px solid #10B981", borderTopRightRadius: 8 },
                { borderBottom: "2px solid #10B981", borderLeft: "2px solid #10B981", borderBottomLeftRadius: 8 },
                { borderBottom: "2px solid #10B981", borderRight: "2px solid #10B981", borderBottomRightRadius: 8 },
              ]
              return (
                <div key={ci} style={{
                  position: "absolute",
                  ...positions[ci],
                  width: 20, height: 20,
                  ...borders[ci],
                  zIndex: 10,
                }} />
              )
            })}

            {/* Scanning line */}
            <div style={{
              position: "absolute", left: 0, right: 0,
              top: `${scanY}%`,
              height: "2px",
              background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.8), transparent)",
              boxShadow: "0 0 12px rgba(16,185,129,0.6)",
              zIndex: 5,
            }} />

            {/* Road simulation */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, #0a0e14 0%, #111820 40%, #0d1119 100%)",
            }} />
            <div style={{
              position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: 2, height: "70%",
              background: "repeating-linear-gradient(180deg, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.3) 20px, transparent 20px, transparent 40px)",
            }} />

            {/* Detection boxes */}
            <div className="detection-box-1" style={{
              position: "absolute", top: "25%", left: "20%",
              width: 60, height: 80,
              border: "1.5px solid rgba(16,185,129,0.8)",
              borderRadius: 4, zIndex: 6,
              boxShadow: "0 0 8px rgba(16,185,129,0.3)",
            }}>
              <span style={{ position: "absolute", top: -16, left: 0, fontSize: "8px", color: "#10B981", fontWeight: 700, whiteSpace: "nowrap" }}>PEDESTRIAN CLEAR</span>
            </div>
            <div className="detection-box-2" style={{
              position: "absolute", top: "30%", right: "18%",
              width: 70, height: 55,
              border: "1.5px solid rgba(212,168,83,0.8)",
              borderRadius: 4, zIndex: 6,
              boxShadow: "0 0 8px rgba(212,168,83,0.3)",
            }}>
              <span style={{ position: "absolute", top: -16, left: 0, fontSize: "8px", color: "#D4A853", fontWeight: 700, whiteSpace: "nowrap" }}>LANE OK</span>
            </div>
            <div className="detection-box-3" style={{
              position: "absolute", bottom: "30%", left: "35%",
              width: 90, height: 50,
              border: "1.5px solid rgba(59,130,246,0.8)",
              borderRadius: 4, zIndex: 6,
              boxShadow: "0 0 8px rgba(59,130,246,0.3)",
            }}>
              <span style={{ position: "absolute", top: -16, left: 0, fontSize: "8px", color: "#60A5FA", fontWeight: 700, whiteSpace: "nowrap" }}>SPEED: 45 KM/H</span>
            </div>

            {/* AI ACTIVE badge */}
            <div className="ai-badge-pulse" style={{
              position: "absolute", bottom: 10, right: 10,
              background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)",
              borderRadius: 8, padding: "4px 10px",
              display: "flex", alignItems: "center", gap: 5, zIndex: 10,
            }}>
              <div className="dot-blink" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
              <span style={{ color: "#10B981", fontSize: "0.7rem", fontWeight: 700 }}>AI ACTIVE</span>
            </div>

            {/* REC badge */}
            <div style={{
              position: "absolute", top: 10, left: 10,
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: 6, padding: "3px 8px",
              display: "flex", alignItems: "center", gap: 4, zIndex: 10,
            }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }}
              />
              <span style={{ color: "#EF4444", fontSize: "0.65rem", fontWeight: 700 }}>REC</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── AI BEHAVIOR SCORE ────────────────────────────────────────────────── */}
      <section style={{ background: "#070709", padding: "64px 24px" }} ref={scoreRef}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <span style={{
              background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.25)",
              color: "#D4A853", borderRadius: 999, padding: "4px 14px",
              fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            }}>AI Behavior Analysis</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={scoreInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(212,168,83,0.04))",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 24, padding: "40px",
              display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap",
              position: "relative", overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", top: -60, right: -60,
              width: 250, height: 250, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(16,185,129,0.07), transparent 70%)",
              pointerEvents: "none",
            }} />

            <ScoreRing score={report.score} grade={report.grade} />

            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "16px 20px", marginBottom: 16,
              }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  Top Issue Detected
                </div>
                <div style={{ color: "#EF4444", fontWeight: 700, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={14} /> {report.top_issue}
                </div>
              </div>

              <div style={{
                background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: 14, padding: "16px 20px", marginBottom: 20,
              }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                  <Sparkles size={11} /> AI Tip
                </div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.88rem", lineHeight: 1.6 }}>{report.ai_tip}</div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(16,185,129,0.35)" }}
                whileTap={{ scale: 0.97 }}
                onClick={getAIAnalysis}
                disabled={analyzingAll}
                style={{
                  background: "linear-gradient(90deg, #10B981, #059669)",
                  color: "#fff", border: "none", borderRadius: 12,
                  padding: "13px 26px", fontWeight: 800, fontSize: "0.95rem",
                  cursor: analyzingAll ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  opacity: analyzingAll ? 0.7 : 1,
                }}
              >
                {analyzingAll ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Brain size={15} />}
                {analyzingAll ? "Analyzing..." : "Get AI Analysis"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── EVENTS GRID ──────────────────────────────────────────────────────── */}
      <section style={{ background: "#050507", padding: "64px 24px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, color: "#FFF", marginBottom: 8 }}>
            Recent AI Events
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.9rem", marginBottom: 32 }}>
            Detected by Cosmo AI on-device neural engine
          </p>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2 size={32} style={{ color: "#10B981", animation: "spin 1s linear infinite" }} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              <AnimatePresence>
                {events.map((ev, i) => {
                  const meta = eventMeta[ev.event_type] || { label: ev.event_type, icon: <Activity size={16} />, color: "#9CA3AF" }
                  const isCritical = ev.severity === "critical"
                  return (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -4 }}
                      style={{
                        background: `linear-gradient(135deg, ${meta.color}08, rgba(255,255,255,0.02))`,
                        border: `1px solid ${severityBorder[ev.severity] || "rgba(255,255,255,0.1)"}`,
                        borderRadius: 18,
                        padding: "22px",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: severityGlow[ev.severity] || "none",
                      }}
                    >
                      {/* Critical pulse ring */}
                      {isCritical && (
                        <motion.div
                          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{
                            position: "absolute", top: 16, right: 16,
                            width: 12, height: 12, borderRadius: "50%",
                            background: "#EF4444", opacity: 0.6,
                          }}
                        />
                      )}
                      {isCritical && (
                        <div style={{
                          position: "absolute", top: 16, right: 16,
                          width: 12, height: 12, borderRadius: "50%",
                          background: "#EF4444",
                          boxShadow: "0 0 8px #EF4444",
                        }} />
                      )}

                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 12,
                          background: `${meta.color}15`,
                          border: `1px solid ${meta.color}30`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: meta.color, flexShrink: 0,
                        }}>
                          {meta.icon}
                        </div>
                        <div>
                          <div style={{ color: "#FFF", fontWeight: 700, fontSize: "0.9rem" }}>{meta.label}</div>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3 }}>
                            <span style={{
                              background: `${meta.color}18`, border: `1px solid ${meta.color}35`,
                              color: meta.color, borderRadius: 999, padding: "1px 7px",
                              fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                            }}>{ev.severity}</span>
                            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem" }}>{timeAgo(ev.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Confidence bar */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Confidence</span>
                          <span style={{ color: meta.color, fontSize: "0.75rem", fontWeight: 700 }}>{Math.round(ev.confidence * 100)}%</span>
                        </div>
                        <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 99 }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ev.confidence * 100}%` }}
                            transition={{ delay: i * 0.1 + 0.4, duration: 0.7, ease: "easeOut" }}
                            style={{
                              height: "100%", borderRadius: 99,
                              background: meta.color,
                              boxShadow: `0 0 8px ${meta.color}60`,
                            }}
                          />
                        </div>
                      </div>

                      <p style={{
                        color: "rgba(255,255,255,0.55)", fontSize: "0.82rem",
                        lineHeight: 1.6, marginBottom: 16,
                        background: "rgba(255,255,255,0.03)", borderRadius: 10,
                        padding: "10px 12px",
                        borderLeft: `2px solid ${meta.color}40`,
                      }}>
                        {ev.ai_analysis}
                      </p>

                      {ev.analyzed ? (
                        <div style={{
                          display: "flex", alignItems: "center", gap: 6,
                          color: "#10B981", fontSize: "0.8rem", fontWeight: 600,
                        }}>
                          <CheckCircle2 size={14} /> AI Analysis Complete
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => analyzeEvent(ev.id)}
                          disabled={ev.analyzing}
                          style={{
                            background: `${meta.color}10`,
                            border: `1px solid ${meta.color}30`,
                            color: meta.color, borderRadius: 10,
                            padding: "8px 14px", fontWeight: 700, fontSize: "0.78rem",
                            cursor: ev.analyzing ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", gap: 6,
                            opacity: ev.analyzing ? 0.6 : 1,
                          }}
                        >
                          {ev.analyzing
                            ? <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Analyzing...</>
                            : <><Brain size={12} /> Analyze with AI</>
                          }
                        </motion.button>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}
