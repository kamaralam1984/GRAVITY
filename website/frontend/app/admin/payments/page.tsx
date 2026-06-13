'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Download,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  BarChart2,
} from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────────────
const MOCK_PAYMENTS = [
  { id: "PAY-001", user: "Priya Sharma",   email: "priya.sharma@gmail.com",  plan: "Family Plan",    amount: 699,  status: "Success",  method: "UPI",         gateway: "Razorpay", date: "Jun 12, 2025", time: "11:45 AM", txnId: "rzp_001abc" },
  { id: "PAY-002", user: "Rajesh Kumar",   email: "rajesh.k@yahoo.com",      plan: "Premium",        amount: 299,  status: "Success",  method: "Credit Card", gateway: "Razorpay", date: "Jun 12, 2025", time: "10:22 AM", txnId: "rzp_002def" },
  { id: "PAY-003", user: "Ananya Singh",   email: "ananya.singh@outlook.com",plan: "Premium",        amount: 299,  status: "Failed",   method: "Debit Card",  gateway: "Razorpay", date: "Jun 12, 2025", time: "09:55 AM", txnId: "rzp_003ghi" },
  { id: "PAY-004", user: "Meera Patel",    email: "meera.patel@gmail.com",   plan: "Family Plan",    amount: 699,  status: "Pending",  method: "Net Banking", gateway: "Paytm",    date: "Jun 11, 2025", time: "08:14 PM", txnId: "ptm_004jkl" },
  { id: "PAY-005", user: "Arjun Nair",     email: "arjun.nair@gmail.com",    plan: "Annual Premium", amount: 2999, status: "Success",  method: "UPI",         gateway: "Razorpay", date: "Jun 11, 2025", time: "05:37 PM", txnId: "rzp_005mno" },
  { id: "PAY-006", user: "Kavita Mehta",   email: "kavita.mehta@hotmail.com",plan: "Premium",        amount: 299,  status: "Refunded", method: "UPI",         gateway: "Razorpay", date: "Jun 11, 2025", time: "03:20 PM", txnId: "rzp_006pqr" },
  { id: "PAY-007", user: "Suresh Iyer",    email: "suresh.iyer@gmail.com",   plan: "Annual Family",  amount: 5999, status: "Success",  method: "Credit Card", gateway: "Stripe",   date: "Jun 10, 2025", time: "02:48 PM", txnId: "str_007stu" },
  { id: "PAY-008", user: "Deepa Reddy",    email: "deepa.reddy@gmail.com",   plan: "Premium",        amount: 299,  status: "Success",  method: "Wallet",      gateway: "PhonePe",  date: "Jun 10, 2025", time: "01:09 PM", txnId: "php_008vwx" },
  { id: "PAY-009", user: "Vikram Joshi",   email: "vikram.joshi@gmail.com",  plan: "Family Plan",    amount: 699,  status: "Failed",   method: "Debit Card",  gateway: "Razorpay", date: "Jun 10, 2025", time: "11:33 AM", txnId: "rzp_009yza" },
  { id: "PAY-010", user: "Pooja Desai",    email: "pooja.desai@gmail.com",   plan: "Annual Premium", amount: 2999, status: "Success",  method: "UPI",         gateway: "Razorpay", date: "Jun 09, 2025", time: "10:05 AM", txnId: "rzp_010bcde" },
  { id: "PAY-011", user: "Arun Verma",     email: "arun.verma@gmail.com",    plan: "Premium",        amount: 299,  status: "Success",  method: "UPI",         gateway: "Razorpay", date: "Jun 09, 2025", time: "09:21 AM", txnId: "rzp_011efgh" },
  { id: "PAY-012", user: "Sunita Gupta",   email: "sunita.gupta@gmail.com",  plan: "Family Plan",    amount: 699,  status: "Pending",  method: "Net Banking", gateway: "Paytm",    date: "Jun 08, 2025", time: "07:44 PM", txnId: "ptm_012ijkl" },
]

const MONTHLY_REVENUE = [1.2, 1.8, 2.4, 3.1, 3.8, 4.4, 4.8, 4.2, 4.6, 4.9, 5.0, 5.2]
const MONTH_LABELS    = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Success:  { color: "#10B981", bg: "rgba(16,185,129,0.12)",  icon: CheckCircle },
  Failed:   { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   icon: XCircle },
  Pending:  { color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  Refunded: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  icon: ArrowDownLeft },
}

const STATUS_FILTERS = ["All", "Success", "Failed", "Pending", "Refunded"]
const PAGE_SIZE = 8

// ── Bar chart helpers ────────────────────────────────────────────
function buildBarChart(data: number[], w: number, h: number, padX = 20, padY = 16) {
  const max = Math.max(...data)
  const barW = (w - padX * 2) / data.length - 4
  return data.map((v, i) => {
    const x = padX + i * ((w - padX * 2) / data.length) + 2
    const barH = ((v / max) * (h - padY * 2))
    const y = h - padY - barH
    return { x, y, barH, barW, value: v, label: MONTH_LABELS[i] }
  })
}

function StatCard({ label, value, sub, icon: Icon, color, up, delay }: any) {
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
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 3px", fontWeight: 500 }}>{label}</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>{value}</p>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 600, color: up ? "#10B981" : "#EF4444", background: up ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)", padding: "2px 7px", borderRadius: 999 }}>
            {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{sub}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default function PaymentsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [page, setPage] = useState(1)
  const [selectedPay, setSelectedPay] = useState<typeof MOCK_PAYMENTS[0] | null>(null)
  const [loading, setLoading] = useState(false)

  const filtered = MOCK_PAYMENTS.filter(p => {
    const matchSearch = !search || p.user.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.txnId.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "All" || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalRevenue = MOCK_PAYMENTS.filter(p => p.status === "Success").reduce((s, p) => s + p.amount, 0)

  const SVG_W = 500
  const SVG_H = 140
  const bars = buildBarChart(MONTHLY_REVENUE, SVG_W, SVG_H)

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text-primary)", margin: "0 0 4px" }}>Payments</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>Track transactions, revenue, and payment health</p>
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

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 22 }}>
        <StatCard label="Revenue This Month" value={`₹${(totalRevenue / 100).toFixed(0)}k`} sub="+18.7% vs last month" icon={IndianRupee} color="#10B981" up delay={0} />
        <StatCard label="Total Transactions" value={String(MOCK_PAYMENTS.length)} sub="+9.3% this month" icon={CreditCard} color="#4B80F0" up delay={0.07} />
        <StatCard label="Failed Payments" value={String(MOCK_PAYMENTS.filter(p => p.status === "Failed").length)} sub="-1 from yesterday" icon={XCircle} color="#EF4444" up delay={0.14} />
        <StatCard label="Avg. Transaction" value="₹843" sub="+5.2% this month" icon={TrendingUp} color="#D4A853" up delay={0.21} />
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px", marginBottom: 18 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", margin: "0 0 2px" }}>Monthly Revenue</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Last 12 months (₹ in Lakhs)</p>
          </div>
          <span style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(16,185,129,0.10)", color: "#10B981", fontSize: 12, fontWeight: 600 }}>+33.5% YoY</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H + 24}`} style={{ width: "100%", minWidth: 360, display: "block" }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {bars.map((bar, i) => (
              <g key={i}>
                <motion.rect
                  x={bar.x} y={bar.y} width={bar.barW} rx={4}
                  fill={i === bars.length - 1 ? "#D4A853" : "url(#barGrad)"}
                  initial={{ height: 0, y: SVG_H - 16 }}
                  animate={{ height: bar.barH, y: bar.y }}
                  transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
                />
                <text x={bar.x + bar.barW / 2} y={SVG_H + 16} textAnchor="middle" fontSize={9} fill="var(--text-muted)" fontFamily="Inter, sans-serif">
                  {bar.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </motion.div>

      {/* Filters */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "13px 18px", marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 300 }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search user, txn ID…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ width: "100%", padding: "7px 12px 7px 32px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => { setStatusFilter(f); setPage(1) }}
              style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${statusFilter === f ? "var(--gold)" : "var(--border)"}`, background: statusFilter === f ? "rgba(212,168,83,0.12)" : "transparent", color: statusFilter === f ? "var(--gold)" : "var(--text-secondary)", fontSize: 12.5, fontWeight: statusFilter === f ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}
            >
              {f}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--text-muted)" }}>{filtered.length} transactions</span>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface2)" }}>
                {["Txn ID", "User", "Plan", "Amount", "Method", "Gateway", "Status", "Date", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paged.map((pay, i) => {
                  const sc = STATUS_CONFIG[pay.status]
                  const StatusIcon = sc.icon
                  return (
                    <motion.tr
                      key={pay.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-surface2)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      onClick={() => setSelectedPay(pay)}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)", background: "var(--bg-surface2)", padding: "2px 8px", borderRadius: 6 }}>{pay.id}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <p style={{ margin: "0 0 1px", fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{pay.user}</p>
                        <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-muted)" }}>{pay.email}</p>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{pay.plan}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>₹{pay.amount}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{pay.method}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12.5, color: "var(--text-muted)", background: "var(--bg-surface2)", padding: "2px 8px", borderRadius: 6 }}>{pay.gateway}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: sc.color, background: sc.bg }}>
                          <StatusIcon size={11} /> {pay.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <p style={{ margin: "0 0 1px", fontSize: 12.5, color: "var(--text-secondary)" }}>{pay.date}</p>
                        <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-muted)" }}>{pay.time}</p>
                      </td>
                      <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedPay(pay)}
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
                  <td colSpan={9} style={{ padding: "40px 14px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
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

      {/* Payment Detail Drawer */}
      <AnimatePresence>
        {selectedPay && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPay(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100 }} />
            <motion.div
              initial={{ x: 380, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 380, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              style={{ position: "fixed", top: 0, right: 0, width: 360, height: "100vh", background: "var(--bg-surface)", borderLeft: "1px solid var(--border)", zIndex: 110, overflowY: "auto", padding: 24 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>Transaction Details</h3>
                <button onClick={() => setSelectedPay(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>

              {/* Status badge */}
              <div style={{ textAlign: "center", marginBottom: 22 }}>
                {(() => {
                  const sc = STATUS_CONFIG[selectedPay.status]
                  const StatusIcon = sc.icon
                  return (
                    <div>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                        <StatusIcon size={28} style={{ color: sc.color }} />
                      </div>
                      <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, fontFamily: "Plus Jakarta Sans, sans-serif", color: "var(--text-primary)" }}>₹{selectedPay.amount}</p>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, color: sc.color, background: sc.bg }}>
                        <StatusIcon size={12} /> {selectedPay.status}
                      </span>
                    </div>
                  )
                })()}
              </div>

              {/* Detail rows */}
              {[
                { label: "Transaction ID", value: selectedPay.id },
                { label: "Razorpay ID", value: selectedPay.txnId },
                { label: "User", value: selectedPay.user },
                { label: "Email", value: selectedPay.email },
                { label: "Plan", value: selectedPay.plan },
                { label: "Payment Method", value: selectedPay.method },
                { label: "Gateway", value: selectedPay.gateway },
                { label: "Date", value: `${selectedPay.date}, ${selectedPay.time}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, textAlign: "right", maxWidth: "55%" }}>{value}</span>
                </div>
              ))}

              {/* Actions */}
              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                <button style={{ padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}>
                  Download Receipt
                </button>
                {selectedPay.status === "Success" && (
                  <button style={{ padding: "10px", borderRadius: 10, border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.06)", color: "#8B5CF6", fontSize: 13.5, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    <ArrowDownLeft size={14} /> Issue Refund
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
