'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
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
  Filter,
} from 'lucide-react'

// ── Types & Data ──────────────────────────────────────────────────
interface Subscription {
  id: string
  userId: number
  userName: string
  email: string
  plan: string
  billing: "Monthly" | "Annual"
  amount: number
  status: "Active" | "Cancelled" | "Expired" | "Trial" | "Paused"
  startDate: string
  nextBilling: string
  cancelledAt?: string
  renewals: number
  paymentMethod: string
  city: string
  avatar: string
}

const MOCK_SUBS: Subscription[] = [
  { id: "SUB-001", userId: 1,  userName: "Priya Sharma",    email: "priya.sharma@gmail.com",   plan: "Family",   billing: "Monthly", amount: 699,  status: "Active",    startDate: "Jan 12, 2024", nextBilling: "Jul 12, 2025", renewals: 17, paymentMethod: "UPI",         city: "Mumbai",    avatar: "PS" },
  { id: "SUB-002", userId: 2,  userName: "Rajesh Kumar",    email: "rajesh.k@yahoo.com",       plan: "Premium",  billing: "Annual",  amount: 2999, status: "Active",    startDate: "Feb 3, 2024",  nextBilling: "Feb 3, 2026",  renewals: 1,  paymentMethod: "Credit Card", city: "Delhi",     avatar: "RK" },
  { id: "SUB-003", userId: 3,  userName: "Ananya Singh",    email: "ananya.singh@outlook.com", plan: "Premium",  billing: "Monthly", amount: 299,  status: "Trial",     startDate: "Jun 8, 2025",  nextBilling: "Jun 22, 2025", renewals: 0,  paymentMethod: "—",           city: "Bangalore", avatar: "AS" },
  { id: "SUB-004", userId: 4,  userName: "Meera Patel",     email: "meera.patel@gmail.com",    plan: "Premium",  billing: "Monthly", amount: 299,  status: "Cancelled", startDate: "Apr 14, 2024", nextBilling: "—",            cancelledAt: "Jun 1, 2025", renewals: 13, paymentMethod: "Debit Card", city: "Ahmedabad", avatar: "MP" },
  { id: "SUB-005", userId: 5,  userName: "Arjun Nair",      email: "arjun.nair@gmail.com",     plan: "Family",   billing: "Annual",  amount: 5999, status: "Active",    startDate: "May 2, 2024",  nextBilling: "May 2, 2026",  renewals: 1,  paymentMethod: "UPI",         city: "Chennai",   avatar: "AN" },
  { id: "SUB-006", userId: 6,  userName: "Kavita Mehta",    email: "kavita.mehta@hotmail.com", plan: "Premium",  billing: "Monthly", amount: 299,  status: "Expired",   startDate: "May 20, 2024", nextBilling: "—",            renewals: 11, paymentMethod: "Wallet",      city: "Hyderabad", avatar: "KM" },
  { id: "SUB-007", userId: 7,  userName: "Suresh Iyer",     email: "suresh.iyer@gmail.com",    plan: "Family",   billing: "Monthly", amount: 699,  status: "Active",    startDate: "Jun 8, 2024",  nextBilling: "Jul 8, 2025",  renewals: 12, paymentMethod: "Net Banking", city: "Pune",      avatar: "SI" },
  { id: "SUB-008", userId: 8,  userName: "Deepa Reddy",     email: "deepa.reddy@gmail.com",    plan: "Premium",  billing: "Monthly", amount: 299,  status: "Active",    startDate: "Jun 15, 2024", nextBilling: "Jul 15, 2025", renewals: 11, paymentMethod: "UPI",         city: "Mumbai",    avatar: "DR" },
  { id: "SUB-009", userId: 9,  userName: "Vikram Joshi",    email: "vikram.joshi@gmail.com",   plan: "Premium",  billing: "Monthly", amount: 299,  status: "Paused",    startDate: "Jul 1, 2024",  nextBilling: "—",            renewals: 10, paymentMethod: "UPI",         city: "Jaipur",    avatar: "VJ" },
  { id: "SUB-010", userId: 10, userName: "Pooja Desai",     email: "pooja.desai@gmail.com",    plan: "Premium",  billing: "Annual",  amount: 2999, status: "Active",    startDate: "Jul 18, 2024", nextBilling: "Jul 18, 2026", renewals: 1,  paymentMethod: "UPI",         city: "Surat",     avatar: "PD" },
  { id: "SUB-011", userId: 11, userName: "Arun Verma",      email: "arun.verma@gmail.com",     plan: "Premium",  billing: "Monthly", amount: 299,  status: "Expired",   startDate: "Aug 5, 2024",  nextBilling: "—",            renewals: 8,  paymentMethod: "Debit Card",  city: "Lucknow",   avatar: "AV" },
  { id: "SUB-012", userId: 12, userName: "Sunita Gupta",    email: "sunita.gupta@gmail.com",   plan: "Family",   billing: "Annual",  amount: 5999, status: "Active",    startDate: "Aug 22, 2024", nextBilling: "Aug 22, 2026", renewals: 1,  paymentMethod: "Credit Card", city: "Kanpur",    avatar: "SG" },
]

const PLAN_ICONS: Record<string, React.ElementType> = {
  Premium: Star,
  Family:  Shield,
}

const PLAN_COLORS: Record<string, { color: string; bg: string }> = {
  Premium: { color: "#D4A853", bg: "rgba(212,168,83,0.12)" },
  Family:  { color: "#4B80F0", bg: "rgba(75,128,240,0.12)" },
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Active:    { color: "#10B981", bg: "rgba(16,185,129,0.12)",  icon: CheckCircle },
  Cancelled: { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   icon: XCircle },
  Expired:   { color: "#6B7280", bg: "rgba(107,114,128,0.12)", icon: Clock },
  Trial:     { color: "#4B80F0", bg: "rgba(75,128,240,0.12)",  icon: Zap },
  Paused:    { color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: AlertCircle },
}

const BILLING_COLORS = {
  Monthly: { color: "#8B5CF6", bg: "rgba(139,92,246,0.10)" },
  Annual:  { color: "#10B981", bg: "rgba(16,185,129,0.10)" },
}

// Plan breakdown bar data
const PLAN_BREAKDOWN = [
  { label: "Free",           count: 21098, pct: 42, color: "#6B7280" },
  { label: "Premium Monthly",count: 10540, pct: 21, color: "#D4A853" },
  { label: "Premium Annual", count: 7041,  pct: 14, color: "#C9913A" },
  { label: "Family Monthly", count: 7546,  pct: 15, color: "#4B80F0" },
  { label: "Family Annual",  count: 4009,  pct: 8,  color: "#6B96F5" },
]

const STATUS_FILTERS = ["All", "Active", "Trial", "Paused", "Cancelled", "Expired"]
const PLAN_FILTERS   = ["All", "Premium", "Family"]
const PAGE_SIZE = 8
const AVATAR_COLORS = ["#4B80F0", "#D4A853", "#10B981", "#8B5CF6", "#EF4444", "#F59E0B"]

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
          {trend && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 600, color: up ? "#10B981" : "#EF4444", background: up ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)", padding: "2px 7px", borderRadius: 999 }}>
              {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{trend}
            </span>
          )}
          {!trend && <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>{sub}</p>}
        </div>
      </div>
    </motion.div>
  )
}

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [planFilter, setPlanFilter] = useState("All")
  const [page, setPage] = useState(1)
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(false)

  const filtered = MOCK_SUBS.filter(s => {
    const matchSearch = !search || s.userName.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "All" || s.status === statusFilter
    const matchPlan = planFilter === "All" || s.plan === planFilter
    return matchSearch && matchStatus && matchPlan
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const activeCount = MOCK_SUBS.filter(s => s.status === "Active").length
  const trialCount  = MOCK_SUBS.filter(s => s.status === "Trial").length
  const mrr = MOCK_SUBS.filter(s => s.status === "Active" && s.billing === "Monthly").reduce((s, x) => s + x.amount, 0)
    + MOCK_SUBS.filter(s => s.status === "Active" && s.billing === "Annual").reduce((s, x) => s + x.amount / 12, 0)

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text-primary)", margin: "0 0 4px" }}>Subscriptions</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>Monitor all user subscriptions, billing cycles, and plan health</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800) }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}
          >
            <RefreshCw size={14} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
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

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 22 }}>
        <StatCard label="Active Subscriptions" value={String(activeCount)} trend="+12.4% this month" up icon={CheckCircle} color="#10B981" delay={0} />
        <StatCard label="Free Trials" value={String(trialCount)} sub="Convert to paid" icon={Zap} color="#4B80F0" delay={0.07} />
        <StatCard label="MRR (est.)" value={`₹${Math.round(mrr / 1000)}k`} trend="+18.7% this month" up icon={IndianRupee} color="#D4A853" delay={0.14} />
        <StatCard label="Churn Rate" value="2.4%" trend="-0.3% this month" up={false} icon={TrendingDown} color="#EF4444" delay={0.21} />
      </div>

      {/* Plan Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12 }}
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px", marginBottom: 18 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", margin: 0 }}>Plan Breakdown</h3>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>50,234 total users</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {PLAN_BREAKDOWN.map((item, i) => (
            <div key={item.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{item.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{item.pct}%</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 48, textAlign: "right" }}>{item.count.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div style={{ height: 7, borderRadius: 4, background: "var(--bg-surface2)", overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ duration: 0.9, delay: 0.2 + i * 0.08, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 4, background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

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

        {/* Plan filter */}
        <div style={{ display: "flex", gap: 6 }}>
          {PLAN_FILTERS.map(f => (
            <button key={f} onClick={() => { setPlanFilter(f); setPage(1) }}
              style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${planFilter === f ? "var(--gold)" : "var(--border)"}`, background: planFilter === f ? "rgba(212,168,83,0.12)" : "transparent", color: planFilter === f ? "var(--gold)" : "var(--text-secondary)", fontSize: 12.5, fontWeight: planFilter === f ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}
            >{f}</button>
          ))}
        </div>

        {/* Status filter */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map(f => {
            const sc = f !== "All" ? STATUS_CONFIG[f] : null
            return (
              <button key={f} onClick={() => { setStatusFilter(f); setPage(1) }}
                style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${statusFilter === f ? (sc?.color || "var(--primary)") : "var(--border)"}`, background: statusFilter === f ? (sc ? sc.bg : "rgba(var(--primary-rgb),0.10)") : "transparent", color: statusFilter === f ? (sc?.color || "var(--primary)") : "var(--text-secondary)", fontSize: 12, fontWeight: statusFilter === f ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}
              >{f}</button>
            )
          })}
        </div>

        <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--text-muted)" }}>{filtered.length} subscriptions</span>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface2)" }}>
                {["Sub ID", "User", "Plan", "Billing", "Amount", "Status", "Start Date", "Next Billing", "Renewals", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paged.map((sub, i) => {
                  const sc = STATUS_CONFIG[sub.status]
                  const StatusIcon = sc.icon
                  const pc = PLAN_COLORS[sub.plan] || PLAN_COLORS["Premium"]
                  const PlanIcon = PLAN_ICONS[sub.plan] || Star
                  const bc = BILLING_COLORS[sub.billing]
                  const avatarBg = AVATAR_COLORS[sub.userId % AVATAR_COLORS.length]
                  return (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-surface2)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      onClick={() => setSelectedSub(sub)}
                    >
                      {/* Sub ID */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)", background: "var(--bg-surface2)", padding: "2px 8px", borderRadius: 6 }}>{sub.id}</span>
                      </td>
                      {/* User */}
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                            {sub.avatar}
                          </div>
                          <div>
                            <p style={{ margin: "0 0 1px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{sub.userName}</p>
                            <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-muted)" }}>{sub.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Plan */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: pc.color, background: pc.bg }}>
                          <PlanIcon size={11} /> {sub.plan}
                        </span>
                      </td>
                      {/* Billing */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, color: bc.color, background: bc.bg }}>{sub.billing}</span>
                      </td>
                      {/* Amount */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>₹{sub.amount.toLocaleString("en-IN")}</span>
                        <span style={{ fontSize: 10.5, color: "var(--text-muted)", display: "block" }}>/{sub.billing === "Monthly" ? "mo" : "yr"}</span>
                      </td>
                      {/* Status */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: sc.color, background: sc.bg }}>
                          <StatusIcon size={11} /> {sub.status}
                        </span>
                      </td>
                      {/* Start Date */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{sub.startDate}</span>
                      </td>
                      {/* Next Billing */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12.5, color: sub.nextBilling === "—" ? "var(--text-muted)" : "var(--text-secondary)" }}>{sub.nextBilling}</span>
                      </td>
                      {/* Renewals */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{sub.renewals}×</span>
                      </td>
                      {/* Actions */}
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
                  <td colSpan={10} style={{ padding: "40px 14px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No subscriptions match your filters.</td>
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
              {Array.from({ length: totalPages }, (_, i) => (
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

              {/* User info */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "14px", background: "var(--bg-surface2)", borderRadius: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: AVATAR_COLORS[selectedSub.userId % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {selectedSub.avatar}
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{selectedSub.userName}</p>
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)" }}>{selectedSub.email}</p>
                </div>
              </div>

              {/* Plan + status badges */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {(() => {
                  const pc = PLAN_COLORS[selectedSub.plan] || PLAN_COLORS["Premium"]
                  const PlanIcon = PLAN_ICONS[selectedSub.plan] || Star
                  const sc = STATUS_CONFIG[selectedSub.status]
                  const StatusIcon = sc.icon
                  return (
                    <>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, color: pc.color, background: pc.bg }}>
                        <PlanIcon size={12} /> {selectedSub.plan}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, color: sc.color, background: sc.bg }}>
                        <StatusIcon size={12} /> {selectedSub.status}
                      </span>
                    </>
                  )
                })()}
              </div>

              {/* Amount highlight */}
              <div style={{ textAlign: "center", marginBottom: 20, padding: "16px", background: "rgba(212,168,83,0.06)", border: "1px solid rgba(212,168,83,0.20)", borderRadius: 12 }}>
                <p style={{ margin: "0 0 2px", fontSize: 30, fontWeight: 800, fontFamily: "Plus Jakarta Sans, sans-serif", color: "var(--text-primary)" }}>₹{selectedSub.amount.toLocaleString("en-IN")}</p>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>{selectedSub.billing} · {selectedSub.paymentMethod}</p>
              </div>

              {/* Detail rows */}
              {[
                { label: "Subscription ID", value: selectedSub.id },
                { label: "Start Date",      value: selectedSub.startDate },
                { label: "Next Billing",    value: selectedSub.nextBilling },
                { label: "Total Renewals",  value: `${selectedSub.renewals}×` },
                { label: "City",            value: selectedSub.city },
                ...(selectedSub.cancelledAt ? [{ label: "Cancelled On", value: selectedSub.cancelledAt }] : []),
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{value}</span>
                </div>
              ))}

              {/* Actions */}
              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedSub.status === "Active" && (
                  <button style={{ padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 13.5, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    <ArrowUpRight size={14} /> Upgrade Plan
                  </button>
                )}
                {(selectedSub.status === "Cancelled" || selectedSub.status === "Expired") && (
                  <button style={{ padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #C9913A, #D4A853)", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    <RotateCcw size={14} /> Reactivate
                  </button>
                )}
                {selectedSub.status === "Active" && (
                  <button style={{ padding: "10px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)", color: "#EF4444", fontSize: 13.5, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    <Ban size={14} /> Cancel Subscription
                  </button>
                )}
                {selectedSub.status === "Trial" && (
                  <button style={{ padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #4B80F0, #6B96F5)", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    <Zap size={14} /> Convert to Paid
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
