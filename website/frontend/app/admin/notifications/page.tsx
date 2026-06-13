'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { adminApi } from '@/lib/api'
import {
  Bell, Send, ChevronDown, Clock, Users, Smartphone, TrendingUp,
  X, Calendar, CheckCircle2, AlertCircle, ChevronUp,
} from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Sent Today",     value: "45,234",  icon: Send,       color: "var(--primary)", colorRgb: "var(--primary-rgb)" },
  { label: "Delivery Rate",  value: "94.2%",   icon: CheckCircle2, color: "var(--safe)", colorRgb: "16,185,129" },
  { label: "Open Rate",      value: "38.7%",   icon: TrendingUp, color: "var(--gold)", colorRgb: "var(--gold-rgb)" },
  { label: "Scheduled",      value: "5",       icon: Clock,      color: "#A78BFA", colorRgb: "167,139,250" },
]

const SCHEDULED = [
  {
    id: 1,
    title: "Weekly Digest: Family Updates",
    message: "Your weekly family activity summary is ready. Check what your circle has been up to!",
    target: "All Users",
    time: "Jun 13, 2025 — 9:00 AM",
    count: "142,891",
  },
  {
    id: 2,
    title: "Premium Feature Unlock Reminder",
    message: "You have unused Premium features. Explore AI Insights, Ghost Mode, and more!",
    target: "Free Users",
    time: "Jun 14, 2025 — 11:30 AM",
    count: "21,784",
  },
  {
    id: 3,
    title: "Geofence Setup Guide",
    message: "Did you know you can set up custom safe zones? Learn how to protect your family.",
    target: "New Users (< 30 days)",
    time: "Jun 15, 2025 — 10:00 AM",
    count: "8,234",
  },
  {
    id: 4,
    title: "SOS Drill: Test Your Alert",
    message: "It is important to know your SOS works. Take 30 seconds to test it today.",
    target: "Premium + Family",
    time: "Jun 16, 2025 — 3:00 PM",
    count: "28,450",
  },
  {
    id: 5,
    title: "New Feature Announcement: AI Location Insights",
    message: "AI-powered location insights are here! Get smart summaries of your family movement patterns.",
    target: "All Users",
    time: "Jun 18, 2025 — 8:00 AM",
    count: "142,891",
  },
]

const HISTORY = [
  { title: "New Feature: AI Insights",     target: "All Users",  sent: "142,891", delivered: "139,234", delivPct: "97.4", opened: "54,321", openPct: "38.1", date: "Jun 10" },
  { title: "SOS Feature Update",           target: "Premium",    sent: "89,234",  delivered: "87,891",  delivPct: "98.5", opened: "45,678", openPct: "51.2", date: "Jun 8" },
  { title: "Battery Saver Tips",           target: "Android",    sent: "82,456",  delivered: "79,234",  delivPct: "96.1", opened: "28,456", openPct: "34.5", date: "Jun 5" },
  { title: "Circle Invite Reminder",       target: "Free Users", sent: "21,784",  delivered: "20,100",  delivPct: "92.3", opened: "6,230",  openPct: "28.6", date: "Jun 3" },
  { title: "May Month Recap",              target: "All Users",  sent: "138,920",  delivered: "134,201",  delivPct: "96.6", opened: "47,890", openPct: "34.5", date: "Jun 1" },
  { title: "Geofence Update v2",           target: "Premium",    sent: "89,234",  delivered: "88,012",  delivPct: "98.6", opened: "52,100", openPct: "58.4", date: "May 29" },
  { title: "Emergency Prep Guide",         target: "All Users",  sent: "142,891", delivered: "139,800", delivPct: "97.8", opened: "49,320", openPct: "34.5", date: "May 26" },
  { title: "Exclusive Upgrade Offer",      target: "Free Users", sent: "21,784",  delivered: "20,890",  delivPct: "95.9", opened: "8,900",  openPct: "40.9", date: "May 22" },
  { title: "Speed Improvements Notice",    target: "All Users",  sent: "142,891", delivered: "138,230", delivPct: "96.7", opened: "38,760", openPct: "27.1", date: "May 19" },
  { title: "Privacy Policy Update",        target: "All Users",  sent: "142,891", delivered: "141,000", delivPct: "98.7", opened: "31,200", openPct: "21.8", date: "May 15" },
  { title: "Family Day Greeting",          target: "All Users",  sent: "142,891", delivered: "140,123", delivPct: "98.1", opened: "71,400", openPct: "49.9", date: "May 12" },
  { title: "Referral Bonus Announcement",  target: "Premium",    sent: "89,234",  delivered: "86,900",  delivPct: "97.4", opened: "44,100", openPct: "49.4", date: "May 8" },
]

const DELIVERY_TREND = [
  { day: "Mon", delivery: 94.1, open: 36.2 },
  { day: "Tue", delivery: 95.3, open: 39.8 },
  { day: "Wed", delivery: 93.8, open: 37.1 },
  { day: "Thu", delivery: 96.2, open: 41.5 },
  { day: "Fri", delivery: 94.7, open: 38.9 },
  { day: "Sat", delivery: 91.2, open: 32.4 },
  { day: "Sun", delivery: 90.8, open: 31.7 },
]

const TARGET_OPTIONS = ["All Users", "Free Users", "Premium Users", "Family Plan", "Specific City", "Specific Family"]
const PRIORITY_OPTIONS = ["Normal", "High"]

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildLinePath(data: number[], w: number, h: number, padX = 32, padY = 16): string {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const xs = data.map((_, i) => padX + (i / (data.length - 1)) * (w - padX * 2))
  const ys = data.map(v => padY + (1 - (v - min) / range) * (h - padY * 2))
  let d = `M ${xs[0]} ${ys[0]}`
  for (let i = 1; i < xs.length; i++) {
    const cpx = (xs[i - 1] + xs[i]) / 2
    d += ` C ${cpx} ${ys[i - 1]}, ${cpx} ${ys[i]}, ${xs[i]} ${ys[i]}`
  }
  return d
}

// ── Card ──────────────────────────────────────────────────────────────────────

function Card({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 20,
        boxShadow: "var(--shadow-card)",
        transition: "box-shadow 0.25s ease",
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [target, setTarget] = useState("All Users")
  const [priority, setPriority] = useState("Normal")
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now")
  const [scheduledItems, setScheduledItems] = useState(SCHEDULED)
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [notifications, setNotifications] = useState(HISTORY)

  useEffect(() => {
    adminApi.notifications()
      .then(d => {
        if (d.notifications && d.notifications.length > 0) {
          setNotifications(d.notifications.map((n: any) => ({
            title: n.title,
            target: n.target ?? "All Users",
            sent: n.sent_count?.toLocaleString("en-IN") ?? "0",
            delivered: n.delivered_count?.toLocaleString("en-IN") ?? "0",
            delivPct: n.delivered_count && n.sent_count ? ((n.delivered_count / n.sent_count) * 100).toFixed(1) : "0",
            opened: n.opened_count?.toLocaleString("en-IN") ?? "0",
            openPct: n.delivered_count && n.opened_count ? ((n.opened_count / n.delivered_count) * 100).toFixed(1) : "0",
            date: n.sent_at ? new Date(n.sent_at).toLocaleDateString("en-IN") : "",
          })))
        }
      })
      .catch(() => {})
  }, [])

  const deliveryData = DELIVERY_TREND.map(d => d.delivery)
  const openData = DELIVERY_TREND.map(d => d.open)
  const SVG_W = 460
  const SVG_H = 140

  const delivLine = buildLinePath(deliveryData, SVG_W, SVG_H)
  const openLine  = buildLinePath(openData, SVG_W, SVG_H)

  function cancelScheduled(id: number) {
    setScheduledItems(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: 1400, margin: "0 auto" }}>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text-primary)", margin: "0 0 4px" }}>
            Notifications
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
            Send to <strong style={{ color: "var(--text-primary)" }}>142,891</strong> registered devices
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setFormOpen(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 20px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #C9913A, #D4A853)",
            color: "#fff", cursor: "pointer", fontSize: 13.5, fontWeight: 600,
            boxShadow: "0 4px 16px rgba(184,114,10,0.35)",
          }}
        >
          <Send size={15} />
          Send Notification
          {formOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </motion.button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginBottom: 24 }}>
        {STATS.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} delay={i * 0.07}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `rgba(${stat.colorRgb},0.12)`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 4px", fontWeight: 500 }}>{stat.label}</p>
                  <span className="gradient-text-gold" style={{ fontSize: 24, fontWeight: 800, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>
                    {stat.value}
                  </span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* ── Send Notification Form ── */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: 16, padding: 24,
            }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 20px" }}>
                Compose Notification
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                  {/* Title */}
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                      Notification Title
                    </label>
                    <input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Enter a compelling title..."
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10,
                        border: "1px solid var(--border)", background: "var(--bg-surface2)",
                        color: "var(--text-primary)", fontSize: 13.5, outline: "none",
                        boxSizing: "border-box", transition: "border-color 0.18s",
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                      Message Body
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Write your notification message..."
                      rows={3}
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10,
                        border: "1px solid var(--border)", background: "var(--bg-surface2)",
                        color: "var(--text-primary)", fontSize: 13.5, outline: "none",
                        boxSizing: "border-box", resize: "vertical", fontFamily: "Inter, sans-serif",
                        transition: "border-color 0.18s",
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  </div>

                  {/* Row: Target + Schedule + Priority */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                        Target Audience
                      </label>
                      <div style={{ position: "relative" }}>
                        <select
                          value={target}
                          onChange={e => setTarget(e.target.value)}
                          style={{
                            width: "100%", padding: "9px 32px 9px 12px", borderRadius: 10,
                            border: "1px solid var(--border)", background: "var(--bg-surface2)",
                            color: "var(--text-primary)", fontSize: 13, outline: "none",
                            appearance: "none", cursor: "pointer",
                          }}
                        >
                          {TARGET_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                        Schedule
                      </label>
                      <div style={{ display: "flex", gap: 6 }}>
                        {(["now", "later"] as const).map(mode => (
                          <button key={mode} onClick={() => setScheduleMode(mode)} style={{
                            flex: 1, padding: "9px 4px", borderRadius: 10, border: "1px solid var(--border)",
                            background: scheduleMode === mode ? "rgba(var(--gold-rgb),0.12)" : "var(--bg-surface2)",
                            color: scheduleMode === mode ? "var(--gold)" : "var(--text-secondary)",
                            fontWeight: scheduleMode === mode ? 600 : 500, fontSize: 12.5, cursor: "pointer",
                            transition: "all 0.18s",
                          }}>
                            {mode === "now" ? "Send Now" : "Schedule"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                        Priority
                      </label>
                      <div style={{ position: "relative" }}>
                        <select
                          value={priority}
                          onChange={e => setPriority(e.target.value)}
                          style={{
                            width: "100%", padding: "9px 32px 9px 12px", borderRadius: 10,
                            border: "1px solid var(--border)", background: "var(--bg-surface2)",
                            color: "var(--text-primary)", fontSize: 13, outline: "none",
                            appearance: "none", cursor: "pointer",
                          }}
                        >
                          {PRIORITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                      </div>
                    </div>
                  </div>

                  {/* Send button */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        adminApi.sendNotification({ title, body: message, type: "info", target })
                          .then(() => { setFormOpen(false) })
                          .catch(() => {})
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "10px 24px", borderRadius: 10, border: "none",
                        background: "linear-gradient(135deg, #C9913A, #D4A853)",
                        color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700,
                        boxShadow: "0 4px 16px rgba(184,114,10,0.30)",
                      }}
                    >
                      <Send size={15} />
                      {scheduleMode === "now" ? "Send Now" : "Schedule"}
                    </motion.button>
                  </div>
                </div>

                {/* Phone Preview */}
                <div style={{ flexShrink: 0 }}>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 10px", fontWeight: 500, textAlign: "center" }}>Preview</p>
                  <div style={{
                    width: 220, background: "var(--bg-surface2)", borderRadius: 18,
                    border: "1px solid var(--border)", padding: 12,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  }}>
                    {/* Status bar */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, padding: "0 4px" }}>
                      <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>9:41</span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>100%</span>
                    </div>
                    {/* Notification card */}
                    <div style={{
                      background: "var(--bg-surface)", borderRadius: 12, padding: 12,
                      border: "1px solid var(--border-strong)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #C9913A, #D4A853)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Bell size={12} color="#fff" />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>GRAVITY</span>
                        <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: "auto" }}>now</span>
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px", lineHeight: 1.3 }}>
                        {title || "Notification Title"}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as "vertical" }}>
                        {message || "Your notification message will appear here..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scheduled Notifications ── */}
      <Card delay={0.12} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 2px" }}>
              Scheduled Notifications
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{scheduledItems.length} pending</p>
          </div>
          <span style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(167,139,250,0.12)", color: "#A78BFA", fontSize: 12, fontWeight: 600 }}>
            {scheduledItems.length} Scheduled
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <AnimatePresence>
            {scheduledItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "14px 16px", borderRadius: 12,
                  background: "var(--bg-surface2)", border: "1px solid var(--border)",
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(167,139,250,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Calendar size={16} style={{ color: "#A78BFA" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.title}
                    </p>
                  </div>
                  <p style={{ margin: "0 0 6px", fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" as "vertical" }}>
                    {item.message}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--text-muted)" }}>
                      <Users size={12} />
                      {item.target} ({item.count} devices)
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--text-muted)" }}>
                      <Clock size={12} />
                      {item.time}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => cancelScheduled(item.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                    borderRadius: 8, border: "1px solid rgba(239,68,68,0.30)",
                    background: "rgba(239,68,68,0.06)", color: "var(--sos)",
                    cursor: "pointer", fontSize: 12, fontWeight: 600, flexShrink: 0,
                    transition: "all 0.18s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.14)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)" }}
                >
                  <X size={13} />
                  Cancel
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>

      {/* ── History Table + Delivery Trend ── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2.2fr) minmax(0,1fr)", gap: 16, alignItems: "start" }}>

        {/* History Table */}
        <Card delay={0.18}>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 16px" }}>
            Notification History
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Title", "Target", "Sent", "Delivered", "Opened", "Date"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "8px 12px",
                      fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {notifications.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.04 }}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: hoveredRow === i ? "rgba(var(--gold-rgb),0.04)" : i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)",
                      transition: "background 0.15s",
                    }}
                  >
                    <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 500, color: "var(--text-primary)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row.title}
                    </td>
                    <td style={{ padding: "11px 12px" }}>
                      <span style={{
                        fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                        background: row.target === "All Users" ? "rgba(var(--gold-rgb),0.10)" : "rgba(var(--primary-rgb),0.10)",
                        color: row.target === "All Users" ? "var(--gold)" : "var(--primary)",
                        whiteSpace: "nowrap",
                      }}>
                        {row.target}
                      </span>
                    </td>
                    <td style={{ padding: "11px 12px", fontSize: 12.5, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{row.sent}</td>
                    <td style={{ padding: "11px 12px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 12.5, color: "var(--text-primary)", fontWeight: 500 }}>{row.delivered}</span>
                      <span style={{ fontSize: 11, color: "var(--safe)", marginLeft: 4 }}>({row.delivPct}%)</span>
                    </td>
                    <td style={{ padding: "11px 12px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 12.5, color: "var(--text-primary)", fontWeight: 500 }}>{row.opened}</span>
                      <span style={{ fontSize: 11, color: "var(--primary)", marginLeft: 4 }}>({row.openPct}%)</span>
                    </td>
                    <td style={{ padding: "11px 12px", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{row.date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Delivery Trend Chart */}
        <Card delay={0.22}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 2px" }}>
              Delivery Trend
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Last 7 days</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 20, height: 3, borderRadius: 2, background: "var(--safe)" }} />
              <span style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>Delivery %</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 20, height: 3, borderRadius: 2, background: "var(--primary)" }} />
              <span style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>Open %</span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H + 24}`} style={{ width: "100%", minWidth: 280, display: "block" }} aria-label="Delivery trend chart">
              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1].map(f => (
                <line key={f} x1={32} y1={16 + (1 - f) * (SVG_H - 32)} x2={SVG_W - 16} y2={16 + (1 - f) * (SVG_H - 32)}
                  stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
              ))}
              {/* Lines */}
              <motion.path d={delivLine} fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.4, ease: "easeInOut", delay: 0.2 }} />
              <motion.path d={openLine} fill="none" stroke="#4B80F0" strokeWidth={2} strokeLinecap="round"
                strokeDasharray="5 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.4, ease: "easeInOut", delay: 0.4 }} />
              {/* X labels */}
              {DELIVERY_TREND.map((d, i) => {
                const x = 32 + (i / (DELIVERY_TREND.length - 1)) * (SVG_W - 48)
                return (
                  <text key={i} x={x} y={SVG_H + 14} textAnchor="middle" fontSize={10}
                    fill="var(--text-muted)" fontFamily="Inter, sans-serif">
                    {d.day}
                  </text>
                )
              })}
            </svg>
          </div>

          {/* Stats below chart */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 4, display: "flex", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 2px" }}>Avg Delivery</p>
              <span style={{ fontSize: 18, fontWeight: 800, color: "var(--safe)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>93.7%</span>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 2px" }}>Avg Open Rate</p>
              <span style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>36.8%</span>
            </div>
          </div>
        </Card>
      </div>

    </div>
  )
}
