'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { getAdminToken } from '@/lib/api'
import {
  Tag,
  Plus,
  Search,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  X,
  Calendar,
  Percent,
  IndianRupee,
  Users,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────
interface Coupon {
  id: number | string
  code: string
  discount_type: "percent" | "flat" | "percentage"
  discount_value: number
  applicable_plan?: string
  max_uses: number
  current_uses: number
  expires_at?: string
  is_active: boolean
  // optional extras from API
  description?: string
  created_at?: string
}

interface CouponForm {
  code: string
  discount_type: "percent" | "flat"
  discount_value: number
  applicable_plan: string
  max_uses: number
  expires_at: string
  is_active: boolean
  description: string
}

const EMPTY_FORM: CouponForm = {
  code: "", discount_type: "percent", discount_value: 0,
  applicable_plan: "All Plans", max_uses: 100, expires_at: "", is_active: true, description: "",
}

const STATUS_COLORS = {
  Active:   { color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  Expired:  { color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
  Inactive: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  Upcoming: { color: "#4B80F0", bg: "rgba(75,128,240,0.12)" },
}

function getCouponStatus(c: Coupon): keyof typeof STATUS_COLORS {
  if (!c.is_active) return "Inactive"
  if (c.expires_at && new Date(c.expires_at) < new Date()) return "Expired"
  if (c.current_uses >= c.max_uses) return "Expired"
  return "Active"
}

function formatExpiry(iso?: string) {
  if (!iso) return "No expiry"
  try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) }
  catch { return iso }
}

function getAdminAuthToken() {
  return getAdminToken() || (typeof window !== "undefined" ? localStorage.getItem("gravity_admin_auth") : null)
}

const PAGE_SIZE = 6

function StatCard({ label, value, sub, icon: Icon, color, delay }: any) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-30px" })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", boxShadow: "var(--shadow-card)", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 3px", fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 1px", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>{sub}</p>
      </div>
    </motion.div>
  )
}

export default function CouponsPage() {
  const [coupons, setCoupons]       = useState<Coupon[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [search, setSearch]         = useState("")
  const [page, setPage]             = useState(1)
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState<CouponForm>({ ...EMPTY_FORM })
  const [copied, setCopied]         = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)
  const [formError, setFormError]   = useState<string | null>(null)

  const loadCoupons = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    const token = getAdminAuthToken()
    fetch("/coupons/", { headers: { Authorization: "Bearer " + token } })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => {
        const raw: any[] = Array.isArray(d) ? d : (d.coupons || d.data || [])
        setCoupons(raw)
      })
      .catch(e => setError(e.message || "Failed to load coupons"))
      .finally(() => { setLoading(false); setRefreshing(false) })
  }

  useEffect(() => { loadCoupons() }, [])

  const filtered = coupons.filter(c =>
    !search
    || c.code.toLowerCase().includes(search.toLowerCase())
    || (c.description || "").toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalRedemptions = coupons.reduce((s, c) => s + (c.current_uses || 0), 0)
  const activeCoupons = coupons.filter(c => c.is_active).length

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(code)
    setTimeout(() => setCopied(null), 1800)
  }

  const handleToggle = async (id: number | string) => {
    const token = getAdminAuthToken()
    // Optimistic update
    setCoupons(cs => cs.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c))
    try {
      const res = await fetch(`/coupons/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      })
      if (!res.ok) {
        // Revert on failure
        setCoupons(cs => cs.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c))
      }
    } catch {
      setCoupons(cs => cs.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c))
    }
  }

  const handleDelete = async (c: Coupon) => {
    const token = getAdminAuthToken()
    setCoupons(cs => cs.filter(x => x.id !== c.id))
    setDeleteTarget(null)
    try {
      await fetch(`/coupons/${c.id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      })
    } catch {
      // Silently ignore — row already removed from UI
    }
  }

  const handleSave = async () => {
    if (!form.code.trim()) { setFormError("Coupon code is required."); return }
    if (!form.discount_value || form.discount_value <= 0) { setFormError("Discount value must be > 0."); return }
    setFormError(null)
    setSaving(true)

    const token = getAdminAuthToken()
    try {
      const res = await fetch("/coupons/create", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({
          code:            form.code.trim().toUpperCase(),
          discount_type:   form.discount_type,
          discount_value:  form.discount_value,
          applicable_plan: form.applicable_plan,
          max_uses:        form.max_uses,
          expires_at:      form.expires_at || null,
          is_active:       form.is_active,
          description:     form.description,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Failed to create coupon" }))
        throw new Error(err.detail || "Failed to create coupon")
      }
      const created = await res.json()
      // Add to list (API may return the new coupon object)
      setCoupons(cs => [created.coupon || created, ...cs])
      setShowModal(false)
      setForm({ ...EMPTY_FORM })
    } catch (e: any) {
      setFormError(e.message || "Failed to create coupon")
    } finally {
      setSaving(false)
    }
  }

  const openCreate = () => {
    setForm({ ...EMPTY_FORM })
    setFormError(null)
    setShowModal(true)
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 12, color: "var(--text-muted)", fontSize: 14 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--gold)", animation: "spin 0.8s linear infinite" }} />
      Loading coupons…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: 1400, margin: "0 auto" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text-primary)", margin: "0 0 4px" }}>Coupons</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>Create and manage discount coupons and promo codes</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => loadCoupons(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}>
            <RefreshCw size={14} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
            Refresh
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={openCreate}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #C9913A, #D4A853)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={14} /> New Coupon
          </motion.button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontSize: 13.5, marginBottom: 16 }}>
          <AlertCircle size={16} />{error}
          <button onClick={() => loadCoupons()} style={{ marginLeft: "auto", padding: "4px 12px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.4)", background: "transparent", color: "#EF4444", fontSize: 12, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 22 }}>
        <StatCard label="Total Coupons"      value={String(coupons.length)}       sub="All time"                                       icon={Tag}         color="#4B80F0" delay={0} />
        <StatCard label="Active Coupons"     value={String(activeCoupons)}         sub={`${coupons.length - activeCoupons} inactive`}   icon={CheckCircle} color="#10B981" delay={0.07} />
        <StatCard label="Total Redemptions"  value={totalRedemptions.toLocaleString("en-IN")} sub="Across all coupons"              icon={Users}       color="#D4A853" delay={0.14} />
        <StatCard label="Coupons Expiring"   value={String(coupons.filter(c => { if (!c.expires_at) return false; const diff = new Date(c.expires_at).getTime() - Date.now(); return diff > 0 && diff < 7 * 86400000 }).length)} sub="Within 7 days" icon={Clock} color="#F59E0B" delay={0.21} />
      </div>

      {/* Search */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "13px 18px", marginBottom: 14, display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 320 }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input type="text" placeholder="Search code, description…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ width: "100%", padding: "7px 12px 7px 32px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--text-muted)" }}>{filtered.length} coupons</span>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface2)" }}>
                {["Code", "Discount", "Plan", "Uses", "Expires", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paged.map((coupon, i) => {
                  const status = getCouponStatus(coupon)
                  const sc = STATUS_COLORS[status]
                  const usePct = coupon.max_uses > 0 ? Math.min(100, ((coupon.current_uses || 0) / coupon.max_uses) * 100) : 0
                  const discountType = coupon.discount_type === "percentage" ? "percent" : coupon.discount_type
                  return (
                    <motion.tr key={String(coupon.id)}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-surface2)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "0.06em" }}>{coupon.code}</span>
                          <button onClick={() => handleCopy(coupon.code)} title="Copy"
                            style={{ background: "transparent", border: "none", color: copied === coupon.code ? "#10B981" : "var(--text-muted)", cursor: "pointer", padding: 2, borderRadius: 5 }}>
                            {copied === coupon.code ? <CheckCircle size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 8, background: "rgba(212,168,83,0.10)", border: "1px solid rgba(212,168,83,0.20)" }}>
                          {discountType === "percent" ? <Percent size={12} style={{ color: "var(--gold)" }} /> : <IndianRupee size={12} style={{ color: "var(--gold)" }} />}
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>
                            {discountType === "percent" ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{coupon.applicable_plan || "All Plans"}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: usePct >= 90 ? "#EF4444" : "var(--text-primary)" }}>
                            {coupon.current_uses || 0} / {coupon.max_uses}
                          </span>
                          <div style={{ marginTop: 4, height: 4, borderRadius: 2, background: "var(--bg-surface2)", overflow: "hidden", width: 80 }}>
                            <div style={{ height: "100%", borderRadius: 2, width: `${usePct}%`, background: usePct >= 100 ? "#6B7280" : usePct >= 80 ? "#EF4444" : "linear-gradient(90deg, #C9913A, #D4A853)" }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--text-secondary)" }}>
                          <Calendar size={12} style={{ color: "var(--text-muted)" }} />
                          {formatExpiry(coupon.expires_at)}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: sc.color, background: sc.bg }}>
                          {status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {/* Toggle active */}
                          <button onClick={() => handleToggle(coupon.id)} title={coupon.is_active ? "Deactivate" : "Activate"}
                            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, color: coupon.is_active ? "#10B981" : "var(--text-muted)" }}>
                            {coupon.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                          </button>
                          <button onClick={() => setDeleteTarget(coupon)} title="Delete"
                            style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.25)", background: "transparent", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", fontSize: 12, transition: "all 0.15s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "40px 14px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                    {error ? "Could not load coupons." : "No coupons match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: page === 1 ? "var(--text-muted)" : "var(--text-secondary)", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
              <ChevronLeft size={14} /> Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${page === i + 1 ? "var(--gold)" : "var(--border)"}`, background: page === i + 1 ? "rgba(212,168,83,0.15)" : "transparent", color: page === i + 1 ? "var(--gold)" : "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontWeight: page === i + 1 ? 700 : 400 }}>
                {i + 1}
              </button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: page === totalPages ? "var(--text-muted)" : "var(--text-secondary)", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 100 }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(500px, 95vw)", background: "var(--bg-surface)", borderRadius: 18, border: "1px solid var(--border)", zIndex: 110, padding: 28, maxHeight: "90vh", overflowY: "auto" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <h3 style={{ margin: 0, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>Create New Coupon</h3>
                <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={20} /></button>
              </div>

              {formError && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 9, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontSize: 13, marginBottom: 16 }}>
                  <AlertCircle size={14} />{formError}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Code */}
                <div>
                  <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Coupon Code *</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SUMMER20"
                    style={{ width: "100%", padding: "9px 14px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 15, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.08em", outline: "none", boxSizing: "border-box" }} />
                </div>

                {/* Discount type + value */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Discount Type</label>
                    <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as "percent" | "flat" }))}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none" }}>
                      <option value="percent">Percentage (%)</option>
                      <option value="flat">Flat (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Value {form.discount_type === "percent" ? "(%)" : "(₹)"}</label>
                    <input type="number" min={1} value={form.discount_value || ""} onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))}
                      placeholder={form.discount_type === "percent" ? "e.g. 20" : "e.g. 100"}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>

                {/* Max uses + plan */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Max Uses</label>
                    <input type="number" min={1} value={form.max_uses || ""} onChange={e => setForm(f => ({ ...f, max_uses: Number(e.target.value) }))}
                      placeholder="e.g. 500"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Applicable Plan</label>
                    <select value={form.applicable_plan} onChange={e => setForm(f => ({ ...f, applicable_plan: e.target.value }))}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none" }}>
                      <option>All Plans</option>
                      <option>Free</option>
                      <option>Premium</option>
                      <option>Family Plan</option>
                      <option>Annual</option>
                      <option>Annual Family</option>
                    </select>
                  </div>
                </div>

                {/* Expiry */}
                <div>
                  <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Expires At (optional)</label>
                  <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Description (optional)</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Internal note about this coupon" rows={2}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }} />
                </div>

                {/* Active toggle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>Active</p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>Allow this coupon to be redeemed immediately</p>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: form.is_active ? "#10B981" : "var(--text-muted)" }}>
                    {form.is_active ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
                <button onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}>
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSave} disabled={saving}
                  style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: saving ? "var(--border)" : "linear-gradient(135deg, #C9913A, #D4A853)", color: saving ? "var(--text-muted)" : "#fff", fontSize: 13.5, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Creating…" : "Create Coupon"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 120 }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(380px, 95vw)", background: "var(--bg-surface)", borderRadius: 16, border: "1px solid var(--border)", zIndex: 130, padding: 28 }}
            >
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <AlertCircle size={26} style={{ color: "#EF4444" }} />
                </div>
                <h3 style={{ margin: "0 0 8px", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>Delete Coupon?</h3>
                <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Are you sure you want to delete <strong style={{ color: "var(--text-primary)" }}>{deleteTarget.code}</strong>? This action cannot be undone.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}>Cancel</button>
                <button onClick={() => handleDelete(deleteTarget)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#EF4444", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
