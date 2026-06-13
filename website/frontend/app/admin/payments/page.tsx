'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { getAdminToken } from '@/lib/api'
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
  AlertCircle,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────
interface Payment {
  id: string | number
  user_id?: number
  user?: string
  email?: string
  plan?: string
  amount: number
  currency?: string
  gateway: string
  status: string
  txn_id?: string
  billing_cycle?: string
  created_at?: string
  // UI-normalised fields
  _user: string
  _email: string
  _plan: string
  _status: string
  _txnId: string
  _date: string
  _time: string
  _method: string
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  success:  { color: "#10B981", bg: "rgba(16,185,129,0.12)",  icon: CheckCircle },
  failed:   { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   icon: XCircle },
  pending:  { color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  refunded: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  icon: ArrowDownLeft },
  // capitalised variants (in case API returns them)
  Success:  { color: "#10B981", bg: "rgba(16,185,129,0.12)",  icon: CheckCircle },
  Failed:   { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   icon: XCircle },
  Pending:  { color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  Refunded: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  icon: ArrowDownLeft },
}

const STATUS_FILTERS = ["All", "success", "failed", "pending", "refunded"]
const STATUS_LABELS: Record<string, string> = {
  All: "All", success: "Success", failed: "Failed", pending: "Pending", refunded: "Refunded"
}
const PAGE_SIZE = 8

function normalise(raw: any): Payment {
  const dt = raw.created_at ? new Date(raw.created_at) : null
  return {
    ...raw,
    _user:   raw.user || `User #${raw.user_id || "?"}`,
    _email:  raw.email || "",
    _plan:   raw.plan || raw.billing_cycle || "—",
    _status: raw.status || "unknown",
    _txnId:  raw.txn_id || String(raw.id),
    _date:   dt ? dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—",
    _time:   dt ? dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "",
    _method: raw.gateway || "—",
  }
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
          {sub && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 600, color: up ? "#10B981" : "#EF4444", background: up ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)", padding: "2px 7px", borderRadius: 999 }}>
              {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{sub}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function PaymentsPage() {
  const [payments, setPayments]     = useState<Payment[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch]         = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [page, setPage]             = useState(1)
  const [selectedPay, setSelectedPay] = useState<Payment | null>(null)

  const loadPayments = (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)
    setError(null)

    const token = getAdminToken() || (typeof window !== "undefined" ? localStorage.getItem("gravity_admin_auth") : null)
    fetch("/payments/", { headers: { Authorization: "Bearer " + token } })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => {
        const raw: any[] = Array.isArray(d) ? d : (d.payments || d.data || [])
        setPayments(raw.map(normalise))
      })
      .catch(e => setError(e.message || "Failed to load payments"))
      .finally(() => { setLoading(false); setRefreshing(false) })
  }

  useEffect(() => { loadPayments() }, [])

  const filtered = payments.filter(p => {
    const s = search.toLowerCase()
    const matchSearch = !s
      || p._user.toLowerCase().includes(s)
      || String(p.id).toLowerCase().includes(s)
      || p._txnId.toLowerCase().includes(s)
    const matchStatus = statusFilter === "All"
      || p._status.toLowerCase() === statusFilter.toLowerCase()
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const successPayments = payments.filter(p => p._status.toLowerCase() === "success")
  const totalRevenue = successPayments.reduce((s, p) => s + (p.amount || 0), 0)
  const failedCount  = payments.filter(p => p._status.toLowerCase() === "failed").length
  const avgTxn       = payments.length ? Math.round(totalRevenue / Math.max(successPayments.length, 1)) : 0

  // ── Loading state ────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 12, color: "var(--text-muted)", fontSize: 14 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--gold)", animation: "spin 0.8s linear infinite" }} />
      Loading payments…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  // ── Error state ──────────────────────────────────────────────────
  const ErrorBanner = error ? (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontSize: 13.5, marginBottom: 16 }}>
      <AlertCircle size={16} />
      {error}
      <button onClick={() => loadPayments()} style={{ marginLeft: "auto", padding: "4px 12px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.4)", background: "transparent", color: "#EF4444", fontSize: 12, cursor: "pointer" }}>Retry</button>
    </div>
  ) : null

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: 1400, margin: "0 auto" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text-primary)", margin: "0 0 4px" }}>Payments</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>Track transactions, revenue, and payment health</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => loadPayments(true)}
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

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 22 }}>
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} sub={`${successPayments.length} successful`} icon={IndianRupee} color="#10B981" up delay={0} />
        <StatCard label="Total Transactions" value={String(payments.length)} sub="All time" icon={CreditCard} color="#4B80F0" up delay={0.07} />
        <StatCard label="Failed Payments" value={String(failedCount)} sub={payments.length ? `${Math.round((failedCount / payments.length) * 100)}% failure rate` : "—"} icon={XCircle} color="#EF4444" up={false} delay={0.14} />
        <StatCard label="Avg. Transaction" value={avgTxn ? `₹${avgTxn.toLocaleString("en-IN")}` : "—"} sub="Per successful txn" icon={TrendingUp} color="#D4A853" up delay={0.21} />
      </div>

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
              {STATUS_LABELS[f] || f}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--text-muted)" }}>{filtered.length} transactions</span>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface2)" }}>
                {["Txn ID", "User", "Amount", "Gateway", "Billing Cycle", "Status", "Date", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paged.map((pay, i) => {
                  const sc = STATUS_CONFIG[pay._status] || STATUS_CONFIG["pending"]
                  const StatusIcon = sc.icon
                  return (
                    <motion.tr
                      key={String(pay.id)}
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
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)", background: "var(--bg-surface2)", padding: "2px 8px", borderRadius: 6 }}>{pay._txnId}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <p style={{ margin: "0 0 1px", fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{pay._user}</p>
                        {pay._email && <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-muted)" }}>{pay._email}</p>}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                          {pay.currency && pay.currency !== "INR" ? pay.currency + " " : "₹"}{(pay.amount || 0).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12.5, color: "var(--text-muted)", background: "var(--bg-surface2)", padding: "2px 8px", borderRadius: 6 }}>{pay.gateway || "—"}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{pay._plan}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: sc.color, background: sc.bg }}>
                          <StatusIcon size={11} /> {pay._status.charAt(0).toUpperCase() + pay._status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <p style={{ margin: "0 0 1px", fontSize: 12.5, color: "var(--text-secondary)" }}>{pay._date}</p>
                        {pay._time && <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-muted)" }}>{pay._time}</p>}
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
                  <td colSpan={8} style={{ padding: "40px 14px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                    {error ? "Could not load payments." : "No transactions found."}
                  </td>
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

              {(() => {
                const sc = STATUS_CONFIG[selectedPay._status] || STATUS_CONFIG["pending"]
                const StatusIcon = sc.icon
                return (
                  <div style={{ textAlign: "center", marginBottom: 22 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                      <StatusIcon size={28} style={{ color: sc.color }} />
                    </div>
                    <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, fontFamily: "Plus Jakarta Sans, sans-serif", color: "var(--text-primary)" }}>
                      {selectedPay.currency && selectedPay.currency !== "INR" ? selectedPay.currency + " " : "₹"}{(selectedPay.amount || 0).toLocaleString("en-IN")}
                    </p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, color: sc.color, background: sc.bg }}>
                      <StatusIcon size={12} /> {selectedPay._status.charAt(0).toUpperCase() + selectedPay._status.slice(1).toLowerCase()}
                    </span>
                  </div>
                )
              })()}

              {[
                { label: "Transaction ID", value: String(selectedPay.id) },
                { label: "Payment Ref",    value: selectedPay._txnId },
                { label: "User",           value: selectedPay._user },
                ...(selectedPay._email ? [{ label: "Email", value: selectedPay._email }] : []),
                { label: "Gateway",        value: selectedPay.gateway || "—" },
                { label: "Billing Cycle",  value: selectedPay._plan },
                { label: "Date",           value: `${selectedPay._date}${selectedPay._time ? ", " + selectedPay._time : ""}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, textAlign: "right", maxWidth: "55%", wordBreak: "break-all" }}>{value}</span>
                </div>
              ))}

              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedPay._status.toLowerCase() === "success" && (
                  <button style={{ padding: "10px", borderRadius: 10, border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.06)", color: "#8B5CF6", fontSize: 13.5, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    <ArrowDownLeft size={14} /> Issue Refund
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
