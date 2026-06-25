'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Car, MapPin, Gauge, Navigation, AlertTriangle, TrendingUp, TrendingDown, Clock, Route, Zap, Shield, Award, Activity, Plus, ChevronRight, Loader2 } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/* ── Types ──────────────────────────────────────────────────────────────────── */
interface Vehicle {
  id: number
  name: string
  make: string
  model: string
  plate: string
  color: string
  speed: number
  lat: number
  lng: number
  lastSeen?: string
}

interface BehaviorEvent {
  id: number
  event_type: string
  severity: string
  time: string
  vehicle?: string
}

interface Trip {
  id: number
  start: string
  end: string
  distance: number
  duration: number
  maxSpeed: number
  date: string
}

interface DriverScore {
  score: number
  grade: string
  harshBrakes: number
  speeding: number
  phoneUse: number
  totalKm: number
}

/* ── Mock Data ──────────────────────────────────────────────────────────────── */
const MOCK_VEHICLES: Vehicle[] = [
  { id: 1, name: "Dad's Car", make: "Toyota", model: "Innova", plate: "MH01AB1234", color: "white", speed: 42, lat: 19.076, lng: 72.877, lastSeen: "Just now" },
  { id: 2, name: "Mom's Scooter", make: "Honda", model: "Activa", plate: "MH01CD5678", color: "red", speed: 0, lat: 19.082, lng: 72.880, lastSeen: "3 min ago" },
]

const MOCK_EVENTS: BehaviorEvent[] = [
  { id: 1, event_type: "harsh_brake", severity: "high", time: "2 min ago", vehicle: "Dad's Car" },
  { id: 2, event_type: "speeding", severity: "medium", time: "12 min ago", vehicle: "Dad's Car" },
  { id: 3, event_type: "phone_use", severity: "high", time: "34 min ago", vehicle: "Mom's Scooter" },
  { id: 4, event_type: "harsh_accel", severity: "low", time: "1 hr ago", vehicle: "Dad's Car" },
  { id: 5, event_type: "harsh_brake", severity: "medium", time: "2 hr ago", vehicle: "Mom's Scooter" },
  { id: 6, event_type: "speeding", severity: "high", time: "3 hr ago", vehicle: "Dad's Car" },
]

const MOCK_TRIPS: Trip[] = [
  { id: 1, start: "Home", end: "Office, BKC", distance: 18.4, duration: 42, maxSpeed: 78, date: "Today, 09:15" },
  { id: 2, start: "Office, BKC", end: "Mall, Lower Parel", distance: 6.2, duration: 18, maxSpeed: 55, date: "Today, 13:02" },
  { id: 3, start: "Mall", end: "Home", distance: 17.9, duration: 51, maxSpeed: 72, date: "Today, 15:44" },
]

const MOCK_SCORE: DriverScore = {
  score: 84,
  grade: "A",
  harshBrakes: 3,
  speeding: 2,
  phoneUse: 1,
  totalKm: 312,
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const severityColor: Record<string, string> = {
  high: "#EF4444",
  medium: "#F97316",
  low: "#EAB308",
  critical: "#DC2626",
}

const eventMeta: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  harsh_brake: { label: "Harsh Brake", icon: <AlertTriangle size={14} />, color: "#EF4444" },
  speeding: { label: "Speeding", icon: <Gauge size={14} />, color: "#F97316" },
  phone_use: { label: "Phone Use", icon: <Activity size={14} />, color: "#A855F7" },
  harsh_accel: { label: "Harsh Accel", icon: <Zap size={14} />, color: "#EAB308" },
}

const vehicleColorMap: Record<string, string> = {
  white: "#F8FAFC", red: "#EF4444", black: "#1F2937", blue: "#3B82F6",
  silver: "#9CA3AF", gold: "#D4A853",
}

function gradeColor(grade: string) {
  return grade === "A+" || grade === "A" ? "#10B981"
    : grade === "B" ? "#3B82F6"
    : grade === "C" ? "#F97316"
    : "#EF4444"
}

/* ── Animated Score Ring ────────────────────────────────────────────────────── */
function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const [displayScore, setDisplayScore] = useState(0)
  const radius = 70
  const stroke = 10
  const circumference = 2 * Math.PI * radius
  const progress = (displayScore / 100) * circumference
  const color = gradeColor(grade)

  useEffect(() => {
    let start = 0
    const end = score
    const duration = 1800
    const step = (end - start) / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { start = end; clearInterval(timer) }
      setDisplayScore(Math.round(start))
    }, 16)
    return () => clearInterval(timer)
  }, [score])

  return (
    <div style={{ position: "relative", width: 180, height: 180, flexShrink: 0 }}>
      <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <motion.circle
          cx="90" cy="90" r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)", textAlign: "center",
      }}>
        <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#FFF", lineHeight: 1 }}>{displayScore}</div>
        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Driver Score</div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.9, type: "spring" }}
          style={{
            marginTop: 6,
            background: `${color}20`, border: `1px solid ${color}50`,
            color, borderRadius: 8, padding: "2px 10px",
            fontSize: "0.85rem", fontWeight: 800,
          }}
        >
          {grade}
        </motion.div>
      </div>
    </div>
  )
}

/* ── Speed Needle ───────────────────────────────────────────────────────────── */
function SpeedDisplay({ speed }: { speed: number }) {
  const isMoving = speed > 0
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <motion.div
        animate={isMoving ? { rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Gauge size={14} style={{ color: isMoving ? "#D4A853" : "rgba(255,255,255,0.3)" }} />
      </motion.div>
      <span style={{ color: isMoving ? "#D4A853" : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: "0.9rem" }}>
        {speed} km/h
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function VenusPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES)
  const [events, setEvents] = useState<BehaviorEvent[]>(MOCK_EVENTS)
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS)
  const [score, setScore] = useState<DriverScore>(MOCK_SCORE)
  const [loading, setLoading] = useState(true)
  const [activeVehicle, setActiveVehicle] = useState<number | null>(null)

  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })
  const scoreRef = useRef(null)
  const scoreInView = useInView(scoreRef, { once: true })

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [vRes, eRes, tRes, sRes] = await Promise.all([
          fetch('/api/venus/vehicles'),
          fetch('/api/venus/behavior/events'),
          fetch('/api/venus/trips'),
          fetch('/api/venus/behavior/score'),
        ])
        if (vRes.ok) setVehicles(await vRes.json())
        if (eRes.ok) setEvents(await eRes.json())
        if (tRes.ok) setTrips(await tRes.json())
        if (sRes.ok) setScore(await sRes.json())
      } catch {
        // Use mock data
      } finally {
        setLoading(false)
      }
    }
    const t = setTimeout(() => { setLoading(false) }, 800)
    fetchAll()
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <Navbar />

      {/* ── SPEED LINE STYLES ─────────────────────────────────────────────────── */}
      <style>{`
        @keyframes speedLine {
          0% { transform: translateX(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(110vw); opacity: 0; }
        }
        .speed-line {
          position: absolute;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,168,83,0.3), transparent);
          animation: speedLine linear infinite;
          pointer-events: none;
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          background: "linear-gradient(135deg, #050507 0%, #08090f 40%, #0a0612 100%)",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          padding: "120px 24px 80px",
        }}
      >
        {/* Speed lines */}
        {[8, 22, 38, 52, 65, 78].map((top, i) => (
          <div
            key={i}
            className="speed-line"
            style={{
              top: `${top}%`,
              width: `${180 + i * 40}px`,
              animationDuration: `${1.8 + i * 0.3}s`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}

        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(212,168,83,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,83,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }} />

        {/* Radial glow */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 5, repeat: Infinity }}
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 600, height: 600, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,168,83,0.07) 0%, rgba(138,43,226,0.04) 40%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, position: "relative", zIndex: 1, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              style={{ marginBottom: 16 }}
            >
              <span style={{
                background: "rgba(212,168,83,0.12)", border: "1px solid rgba(212,168,83,0.3)",
                color: "#D4A853", borderRadius: 999, padding: "5px 16px",
                fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                <Car size={11} /> KVL Business Solutions Vehicle Tracking
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3.5rem, 8vw, 6rem)",
                fontWeight: 900,
                lineHeight: 0.95,
                marginBottom: 20,
                letterSpacing: "-0.02em",
              }}
            >
              <span style={{
                background: "linear-gradient(135deg, #D4A853 0%, #F5D78E 50%, #B8860B 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                VENUS
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.35 }}
              style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.15rem", marginBottom: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 300 }}
            >
              Vehicle Intelligence Platform
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.45 }}
              style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", lineHeight: 1.7, maxWidth: 460 }}
            >
              Real-time GPS tracking, driver behavior scoring, trip analytics, and live vehicle health monitoring — all in one cinematic dashboard.
            </motion.p>
          </div>

          {/* Car silhouette SVG */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
            style={{ flex: "0 0 auto" }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "relative" }}
            >
              <svg width="320" height="160" viewBox="0 0 320 160" fill="none">
                {/* Glow */}
                <ellipse cx="160" cy="148" rx="120" ry="12" fill="rgba(212,168,83,0.15)" />
                {/* Car body */}
                <path d="M40 110 L60 70 L100 50 L220 50 L260 70 L280 110 Z" fill="rgba(212,168,83,0.08)" stroke="rgba(212,168,83,0.4)" strokeWidth="1.5" />
                <path d="M110 50 L130 30 L190 30 L210 50" fill="rgba(212,168,83,0.06)" stroke="rgba(212,168,83,0.35)" strokeWidth="1.5" />
                {/* Windows */}
                <path d="M118 50 L134 34 L186 34 L202 50" fill="rgba(212,168,83,0.12)" stroke="rgba(212,168,83,0.25)" strokeWidth="1" />
                <line x1="160" y1="34" x2="160" y2="50" stroke="rgba(212,168,83,0.2)" strokeWidth="1" />
                {/* Wheels */}
                <circle cx="95" cy="115" r="22" fill="rgba(0,0,0,0.6)" stroke="rgba(212,168,83,0.5)" strokeWidth="2" />
                <circle cx="95" cy="115" r="10" fill="rgba(212,168,83,0.15)" stroke="rgba(212,168,83,0.4)" strokeWidth="1.5" />
                <circle cx="225" cy="115" r="22" fill="rgba(0,0,0,0.6)" stroke="rgba(212,168,83,0.5)" strokeWidth="2" />
                <circle cx="225" cy="115" r="10" fill="rgba(212,168,83,0.15)" stroke="rgba(212,168,83,0.4)" strokeWidth="1.5" />
                {/* Headlights */}
                <ellipse cx="275" cy="90" rx="8" ry="6" fill="rgba(212,168,83,0.6)" />
                <line x1="275" y1="90" x2="310" y2="85" stroke="rgba(212,168,83,0.3)" strokeWidth="8" strokeLinecap="round" />
              </svg>
              {/* Speed badge */}
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: "absolute", top: 10, right: -10,
                  background: "rgba(212,168,83,0.15)", border: "1px solid rgba(212,168,83,0.4)",
                  borderRadius: 8, padding: "6px 12px",
                  color: "#D4A853", fontSize: "0.85rem", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <Gauge size={12} /> 42 km/h
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── DRIVER SCORE CARD ────────────────────────────────────────────────── */}
      <section style={{ background: "#070709", padding: "64px 24px" }} ref={scoreRef}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={scoreInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div style={{ marginBottom: 12, textAlign: "center" }}>
              <span style={{
                background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.25)",
                color: "#D4A853", borderRadius: 999, padding: "4px 14px",
                fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              }}>Driver Performance</span>
            </div>
            <h2 style={{ textAlign: "center", fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem,3.5vw,2.2rem)", fontWeight: 800, color: "#FFF", marginBottom: 32 }}>
              Driver Score Overview
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={scoreInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
            style={{
              background: "linear-gradient(135deg, rgba(212,168,83,0.06), rgba(138,43,226,0.04))",
              border: "1px solid rgba(212,168,83,0.2)",
              borderRadius: 24,
              padding: "40px",
              display: "flex",
              gap: 40,
              alignItems: "center",
              flexWrap: "wrap",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow corner */}
            <div style={{
              position: "absolute", top: -40, right: -40,
              width: 200, height: 200, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(212,168,83,0.08), transparent 70%)",
              pointerEvents: "none",
            }} />

            {/* Score ring */}
            <ScoreRing score={score.score} grade={score.grade} />

            {/* Metrics */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                {[
                  { label: "Harsh Brakes", value: score.harshBrakes, unit: "events", icon: <AlertTriangle size={14} />, color: "#EF4444" },
                  { label: "Speeding", value: score.speeding, unit: "events", icon: <Gauge size={14} />, color: "#F97316" },
                  { label: "Phone Use", value: score.phoneUse, unit: "events", icon: <Activity size={14} />, color: "#A855F7" },
                  { label: "Total KM", value: score.totalKm, unit: "km", icon: <Route size={14} />, color: "#D4A853" },
                ].map((m) => (
                  <motion.div
                    key={m.label}
                    whileHover={{ scale: 1.03 }}
                    style={{
                      background: `${m.color}10`,
                      border: `1px solid ${m.color}25`,
                      borderRadius: 14,
                      padding: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: m.color }}>
                      {m.icon}
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</span>
                    </div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#FFF" }}>{m.value}</div>
                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{m.unit}</div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(212,168,83,0.4)" }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: "linear-gradient(90deg, #D4A853, #B8860B)",
                  color: "#0a0800", border: "none", borderRadius: 12,
                  padding: "13px 28px", fontWeight: 800, fontSize: "0.95rem",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                }}
              >
                View Full Report <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── VEHICLES GRID ────────────────────────────────────────────────────── */}
      <section style={{ background: "#050507", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, color: "#FFF", marginBottom: 6 }}>
                Your Vehicles
              </h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>
                {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} connected
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(212,168,83,0.3)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.35)",
                color: "#D4A853", borderRadius: 12, padding: "10px 20px",
                fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 7,
              }}
            >
              <Plus size={15} /> Add Vehicle
            </motion.button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2 size={32} style={{ color: "#D4A853", animation: "spin 1s linear infinite" }} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              <AnimatePresence>
                {vehicles.map((v, i) => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -5, boxShadow: "0 20px 60px rgba(212,168,83,0.15)" }}
                    onClick={() => setActiveVehicle(activeVehicle === v.id ? null : v.id)}
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                      border: activeVehicle === v.id ? "1px solid rgba(212,168,83,0.5)" : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 20,
                      padding: "24px",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Moving indicator */}
                    {v.speed > 0 && (
                      <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                          position: "absolute", top: 16, right: 16,
                          width: 8, height: 8, borderRadius: "50%",
                          background: "#10B981",
                          boxShadow: "0 0 8px #10B981",
                        }}
                      />
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        position: "relative",
                      }}>
                        <Car size={22} style={{ color: "#D4A853" }} />
                        <div style={{
                          position: "absolute", bottom: 2, right: 2,
                          width: 10, height: 10, borderRadius: "50%",
                          background: vehicleColorMap[v.color] || "#9CA3AF",
                          border: "1px solid rgba(0,0,0,0.3)",
                        }} />
                      </div>
                      <div>
                        <div style={{ color: "#FFF", fontWeight: 700, fontSize: "0.95rem" }}>{v.name}</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>{v.make} {v.model}</div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px" }}>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Speed</div>
                        <SpeedDisplay speed={v.speed} />
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px" }}>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Plate</div>
                        <div style={{ color: "#D4A853", fontWeight: 700, fontSize: "0.85rem" }}>{v.plate}</div>
                      </div>
                    </div>

                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", marginBottom: 16,
                    }}>
                      <MapPin size={12} style={{ color: "#D4A853", flexShrink: 0 }} />
                      {v.lat.toFixed(3)}°N, {v.lng.toFixed(3)}°E
                      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={11} /> {v.lastSeen}
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: "100%",
                        background: "linear-gradient(90deg, rgba(212,168,83,0.15), rgba(212,168,83,0.08))",
                        border: "1px solid rgba(212,168,83,0.3)",
                        color: "#D4A853", borderRadius: 10, padding: "9px",
                        fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}
                    >
                      <Navigation size={13} /> Track Live
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* ── BEHAVIOR EVENTS ──────────────────────────────────────────────────── */}
      <section style={{ background: "#070709", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, color: "#FFF", marginBottom: 8 }}>
            Behavior Events
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.9rem", marginBottom: 32 }}>Recent 10 driving behavior detections</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {events.slice(0, 10).map((ev, i) => {
              const meta = eventMeta[ev.event_type] || { label: ev.event_type, icon: <Activity size={14} />, color: "#9CA3AF" }
              const sColor = severityColor[ev.severity] || "#9CA3AF"
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ x: 4, background: "rgba(255,255,255,0.04)" }}
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderLeft: `3px solid ${meta.color}`,
                    borderRadius: "0 14px 14px 0",
                    padding: "14px 18px",
                    display: "flex", alignItems: "center", gap: 14,
                    transition: "background 0.2s",
                  }}
                >
                  {/* Timeline dot */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: `${meta.color}15`,
                    border: `1px solid ${meta.color}35`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: meta.color, flexShrink: 0,
                  }}>
                    {meta.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ color: "#FFF", fontWeight: 700, fontSize: "0.9rem" }}>{meta.label}</span>
                      <span style={{
                        background: `${sColor}18`, border: `1px solid ${sColor}35`,
                        color: sColor, borderRadius: 999, padding: "1px 8px",
                        fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>{ev.severity}</span>
                      {ev.vehicle && (
                        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>{ev.vehicle}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.3)", fontSize: "0.78rem", flexShrink: 0 }}>
                    <Clock size={11} /> {ev.time}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TRIP TIMELINE ────────────────────────────────────────────────────── */}
      <section style={{ background: "#050507", padding: "64px 24px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, color: "#FFF", marginBottom: 8 }}>
            Recent Trips
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.9rem", marginBottom: 36 }}>Today's journey timeline</p>

          <div style={{ position: "relative" }}>
            {/* Vertical timeline bar */}
            <div style={{
              position: "absolute", left: 24, top: 0, bottom: 0,
              width: 2, background: "linear-gradient(180deg, rgba(212,168,83,0.5), rgba(212,168,83,0.1))",
            }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingLeft: 60 }}>
              {trips.map((trip, i) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ x: 6 }}
                  style={{
                    background: "linear-gradient(135deg, rgba(212,168,83,0.06), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(212,168,83,0.15)",
                    borderRadius: 18,
                    padding: "24px 24px 24px 28px",
                    position: "relative",
                  }}
                >
                  {/* Timeline node */}
                  <div style={{
                    position: "absolute", left: -50, top: 24,
                    width: 14, height: 14, borderRadius: "50%",
                    background: "#D4A853", border: "2px solid rgba(212,168,83,0.3)",
                    boxShadow: "0 0 10px rgba(212,168,83,0.5)",
                  }} />

                  {/* Animated route SVG */}
                  <div style={{ marginBottom: 16 }}>
                    <svg width="100%" height="36" viewBox="0 0 300 36">
                      <motion.line
                        x1="20" y1="18" x2="280" y2="18"
                        stroke="rgba(212,168,83,0.3)" strokeWidth="1" strokeDasharray="4 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: i * 0.2 + 0.3, duration: 0.8 }}
                      />
                      <circle cx="20" cy="18" r="5" fill="#D4A853" />
                      <circle cx="280" cy="18" r="5" fill="rgba(212,168,83,0.4)" stroke="#D4A853" strokeWidth="1.5" />
                      <motion.circle
                        cx="20" cy="18" r="4"
                        fill="#D4A853"
                        animate={{ cx: [20, 280, 20] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
                      />
                    </svg>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <MapPin size={13} style={{ color: "#D4A853" }} />
                        <span style={{ color: "#FFF", fontWeight: 600, fontSize: "0.9rem" }}>{trip.start}</span>
                        <ChevronRight size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
                        <span style={{ color: "#FFF", fontWeight: 600, fontSize: "0.9rem" }}>{trip.end}</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={11} /> {trip.date}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                      {[
                        { label: "Distance", value: `${trip.distance} km`, icon: <Route size={12} /> },
                        { label: "Duration", value: `${trip.duration} min`, icon: <Clock size={12} /> },
                        { label: "Max Speed", value: `${trip.maxSpeed} km/h`, icon: <Gauge size={12} /> },
                      ].map((stat) => (
                        <div key={stat.label} style={{
                          background: "rgba(212,168,83,0.07)",
                          border: "1px solid rgba(212,168,83,0.15)",
                          borderRadius: 10, padding: "8px 12px",
                          textAlign: "center", minWidth: 70,
                        }}>
                          <div style={{ color: "#D4A853", marginBottom: 3, display: "flex", justifyContent: "center" }}>{stat.icon}</div>
                          <div style={{ color: "#FFF", fontWeight: 700, fontSize: "0.82rem" }}>{stat.value}</div>
                          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem" }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
