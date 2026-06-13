'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { getAdminToken } from '@/lib/api'
import {
  CreditCard,
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  IndianRupee,
  Eye,
  X,
  RotateCcw,
  Ban,
  Zap,
  Star,
  Shield,
  ArrowUpRight,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────
interface Subscription {
  id: string | number
  family_id?: number
  plan: string
  price_inr?: number
  status: string
  payment_method?: string
  started_at?: string
  expires_at?: string
  // UI-normalised
  _user: string
  _email: string
  _amount: number
  _billing: string
  _startDate: string
  _nextBilling: string
  _status: string
}

const PLAN_ICONS: Record<string, React.ElementType> = {
  premium: Star,
  family:  Shield,
  free:    Zap,
}

const PLAN_COLORS: Record<string, { color: string; bg: string }> = {
  premium: { color: "#D4A853", bg: "rgba(212,168,83,0.12)" },
  family:  { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  free:    { color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  active:    { color: "#10B981", bg: "rgba(16,185,129,0.12)",  icon: CheckCircle },
  expired:   { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   icon: XCircle },
  cancelled: { color: "#6B7280", bg: "rgba(107,114,128,0.12)", icon: Clock },
  trial:     { color: "#4B80F0", bg: "rgba(75,128,240,0.12)",  icon: Zap },
  paused:    { color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: AlertCircle },
}

const STATUS_FILTERS = ["All", "active", "trial", "paused", "cancelled", "expired"]
const STATUS_LABELS: Record<string, string> = {
  All: "All", active: "Active", trial: "Trial", paused: "Paused", cancelled: "Cancelled", expired: "Expired"
}
const PAGE_SIZE = 8
const AVATAR_COLORS = ["#4B80F0", "#D4A853", "#10B981", "#8B5CF6", "#EF4444", "#F59E0B"]

function formatDate(iso?: string) {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  } catch { return iso }
}

function isExpiringSoon(iso?: string): boolean {
  if (!iso) return false
  try {
    const diff = new Date(iso).getTime() - Date.now()
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
  } catch { return false }
}

function normalise(raw: any): Subscription {
  const planKey = (raw.plan || "free").toLowerCase()
  return {
    ...raw,
    _user:       raw.user_name || raw.user || `Family #${raw.family_id || "?"}`,
    _email:      raw.email || "",
    _amount:     raw.price_inr || raw.amount || 0,
    _billing:    raw.billing_cycle || raw.billing || "Monthly",
    _startDate:  formatDate(raw.started_at || raw.start_date),
    _nextBilling: raw.expires_at ? formatDate(raw.expires_at) : "—",
    _status:     (raw.status || "unknown").toLowerCase(),
  }
}

function getPlanKey(plan: string) {
  const p = plan.toLowerCase()
  if (p.includes("premium")) return "premium"
  if (p.includes("family")) return "family"
  return "free"
}

function StatCard({ label, value, sub, icon: Icon, color, trend, up, delay }: any) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-30px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", boxShadow: "var(--shadow-card)" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 4px", fontWeight: 500 }}>{label}</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 5px", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>{value}</p>
          {trend ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 600, color: up ? "#10B981" : "#EF4444", background: up ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)", padding: "2px 7px", borderRadius: 999 }}>
              {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{trend}
            </span>
          ) : (
            <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>{sub}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function SubscriptionsPage() {
  const [subs, setSubs]             = useState<Subscription[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch]         = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [page, setPage]             = useState(1)
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)

  const loadSubs = (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)
    setError(null)

    const token = getAdminToken() || (typeof window !== "undefined" ? localStorage.getItem("gravity_admin_auth") : null)
    fetch("/subscriptions/", { headers: { Authorization: "Bearer " + token } })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => {
        const raw: any[] = Array.isArray(d) ? d : (d.subscriptions || d.data || [])
        setSubs(raw.map(normalise))
      })
      .catch(e => setError(e.message || "Failed to load subscriptions"))
      .finally(() => { setLoading(false); setRefreshing(false) })
  }

  useEffect(() => { loadSubs() }, [])

  const filtered = subs.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || s._user.toLowerCase().includes(q)
      || s._email.toLowerCase().includes(q)
      || String(s.id).toLowerCase().includes(q)
    const matchStatus = statusFilter === "All" || s._status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const activeCount = subs.filter(s => s._status === "active").length
  const expiredCount = subs.filter(s => s._status === "expired").length
  const mrr = subs
    .filter(s => s._status === "active")
    .reduce((acc, s) => {
      const amt = s._amount || 0
      const billing = s._billing.toLowerCase()
      return acc + (billing.includes("annual") ? Math.round(amt / 12) : amt)
    }, 0)

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 12, color: "var(--text-muted)", fontSize: 14 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--gold)", animation: "spin 0.8s linear infinite" }} />
      Loading subscriptions…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const ErrorBanner = error ? (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontSize: 13.5, marginBottom: 16 }}>
      <AlertCircle size={16} />
      {error}
      <button onClick={() => loadSubs()} style={{ marginLeft: "auto", padding: "4px 12px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.4)", background: "transparent", color: "#EF4444", fontSize: 12, cursor: "pointer" }}>Retry</button>
    </div>
  ) : null

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: 1400, margin: "0 auto" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text-primary)", margin: "0 0 4px" }}>Subscriptions</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>Monitor all user subscriptions, billing cycles, and plan health</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => loadSubs(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #C9913A, #D4A853)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <Download size={14} /> Export CSV
          </motion.button>
        </div>
      </div>

      {ErrorBanner}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 22 }}>
        <StatCard label="Total Subscriptions" value={String(subs.length)} sub="All records" icon={CreditCard} color="#4B80F0" delay={0} />
        <StatCard label="Active" value={String(activeCount)} trend={activeCount > 0 ? `${Math.round((activeCount / subs.length) * 100)}% of total` : "—"} up icon={CheckCircle} color="#10B981" delay={0.07} />
        <StatCard label="Expired" value={String(expiredCount)} sub="Need re-engagement" icon={XCircle} color="#EF4444" delay={0.14} />
        <StatCard label="Est. MRR" value={mrr ? `₹${mrr.toLocaleString("en-IN")}` : "—"} sub="From active subs" icon={IndianRupee} color="#D4A853" delay={0.21} />
      </div>

      {/* Filters */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "13px 18px", marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 300 }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            type="text" placeholder="Search user, email, ID…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ width: "100%", padding: "7px 12px 7px 32px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map(f => {
            const sc = f !== "All" ? STATUS_CONFIG[f] : null
            return (
              <button key={f} onClick={() => { setStatusFilter(f); setPage(1) }}
                style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${statusFilter === f ? (sc?.color || "var(--primary)") : "var(--border)"}`, background: statusFilter === f ? (sc ? sc.bg : "rgba(75,128,240,0.10)") : "transparent", color: statusFilter === f ? (sc?.color || "var(--primary)") : "var(--text-secondary)", fontSize: 12, fontWeight: statusFilter === f ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}
              >{STATUS_LABELS[f] || f}</button>
            )
          })}
        </div>

        <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--text-muted)" }}>{filtered.length} subscriptions</span>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface2)" }}>
                {["ID", "User / Family", "Plan", "Amount", "Status", "Payment Method", "Start Date", "Expires", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paged.map((sub, i) => {
                  const sc = STATUS_CONFIG[sub._status] || STATUS_CONFIG["paused"]
                  const StatusIcon = sc.icon
                  const planKey = getPlanKey(sub.plan)
                  const pc = PLAN_COLORS[planKey] || PLAN_COLORS["free"]
                  const PlanIcon = PLAN_ICONS[planKey] || Star
                  const avatarBg = AVATAR_COLORS[Number(sub.family_id || sub.id || 0) % AVATAR_COLORS.length]
                  const expiringSoon = isExpiringSoon(sub.expires_at)
                  return (
                    <motion.tr
                      key={String(sub.id)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-surface2)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      onClick={() => setSelectedSub(sub)}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)", background: "var(--bg-surface2)", padding: "2px 8px", borderRadius: 6 }}>{String(sub.id)}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                            {sub._user.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: "0 0 1px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{sub._user}</p>
                            {sub._email && <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-muted)" }}>{sub._email}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: pc.color, background: pc.bg }}>
                          <PlanIcon size={11} /> {sub.plan}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {sub._amount ? (
                          <>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>₹{sub._amount.toLocaleString("en-IN")}</span>
                            <span style={{ fontSize: 10.5, color: "var(--text-muted)", display: "block" }}>/{sub._billing.toLowerCase().includes("annual") ? "yr" : "mo"}</span>
                          </>
                        ) : <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Free</span>}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: sc.color, background: sc.bg }}>
                          <StatusIcon size={11} /> {sub._status.charAt(0).toUpperCase() + sub._status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{sub.payment_method || "—"}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{sub._startDate}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12.5, color: expiringSoon ? "#EF4444" : sub._nextBilling === "—" ? "var(--text-muted)" : "var(--text-secondary)", fontWeight: expiringSoon ? 600 : 400 }}>
                          {expiringSoon && <AlertCircle size={11} style={{ marginRight: 4, display: "inline" }} />}
                          {sub._nextBilling}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedSub(sub)}
                          style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)" }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)" }}
                        >
                          <Eye size={13} />
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
              {paged.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: "40px 14px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                    {error ? "Could not load subscriptions." : "No subscriptions match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Page {page} of {totalPages} &middot; {filtered.length} subscriptions</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: page === 1 ? "var(--text-muted)" : "var(--text-secondary)", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12.5 }}>
                <ChevronLeft size={14} /> Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${page === i + 1 ? "var(--gold)" : "var(--border)"}`, background: page === i + 1 ? "rgba(212,168,83,0.15)" : "transparent", color: page === i + 1 ? "var(--gold)" : "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontWeight: page === i + 1 ? 700 : 400 }}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: page === totalPages ? "var(--text-muted)" : "var(--text-secondary)", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12.5 }}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Detail Drawer */}
      <AnimatePresence>
        {selectedSub && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSub(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100 }} />
            <motion.div
              initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              style={{ position: "fixed", top: 0, right: 0, width: 380, height: "100vh", background: "var(--bg-surface)", borderLeft: "1px solid var(--border)", zIndex: 110, overflowY: "auto", padding: 26 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <h3 style={{ margin: 0, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>Subscription Details</h3>
                <button onClick={() => setSelectedSub(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={20} /></button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "14px", background: "var(--bg-surface2)", borderRadius: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: AVATAR_COLORS[Number(selectedSub.family_id || selectedSub.id || 0) % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {selectedSub._user.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{selectedSub._user}</p>
                  {selectedSub._email && <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)" }}>{selectedSub._email}</p>}
                </div>
              </div>

              {(() => {
                const planKey = getPlanKey(selectedSub.plan)
                const pc = PLAN_COLORS[planKey] || PLAN_COLORS["free"]
                const PlanIcon = PLAN_ICONS[planKey] || Star
                const sc = STATUS_CONFIG[selectedSub._status] || STATUS_CONFIG["paused"]
                const StatusIcon = sc.icon
                return (
                  <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, color: pc.color, background: pc.bg }}>
                      <PlanIcon size={12} /> {selectedSub.plan}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, color: sc.color, background: sc.bg }}>
                      <StatusIcon size={12} /> {selectedSub._status.charAt(0).toUpperCase() + selectedSub._status.slice(1)}
                    </span>
                  </div>
                )
              })()}

              {selectedSub._amount > 0 && (
                <div style={{ textAlign: "center", marginBottom: 20, padding: "16px", background: "rgba(212,168,83,0.06)", border: "1px solid rgba(212,168,83,0.20)", borderRadius: 12 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 30, fontWeight: 800, fontFamily: "Plus Jakarta Sans, sans-serif", color: "var(--text-primary)" }}>₹{selectedSub._amount.toLocaleString("en-IN")}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>{selectedSub._billing} · {selectedSub.payment_method || "—"}</p>
                </div>
              )}

              {[
                { label: "Subscription ID", value: String(selectedSub.id) },
                { label: "Start Date",      value: selectedSub._startDate },
                { label: "Expires",         value: selectedSub._nextBilling },
                { label: "Payment Method",  value: selectedSub.payment_method || "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{value}</span>
                </div>
              ))}

              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedSub._status === "active" && (
                  <button style={{ padding: "10px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)", color: "#EF4444", fontSize: 13.5, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    <Ban size={14} /> Cancel Subscription
                  </button>
                )}
                {(selectedSub._status === "cancelled" || selectedSub._status === "expired") && (
                  <button style={{ padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #C9913A, #D4A853)", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    <RotateCcw size={14} /> Reactivate
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
