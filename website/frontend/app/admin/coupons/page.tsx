'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Tag,
  Plus,
  Search,
  Copy,
  Trash2,
  Edit3,
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

// ── Types & Mock Data ──────────────────────────────────────────────
interface Coupon {
  id: number
  code: string
  type: "percent" | "flat"
  value: number
  minOrder: number
  maxUses: number
  usedCount: number
  validFrom: string
  validTo: string
  plan: string
  active: boolean
  description: string
  createdAt: string
}

const MOCK_COUPONS: Coupon[] = [
  { id: 1,  code: "GRAVITY30",   type: "percent", value: 30,   minOrder: 0,   maxUses: 500,  usedCount: 243, validFrom: "Jun 1, 2025",  validTo: "Jun 30, 2025", plan: "All Plans",  active: true,  description: "June mega sale — 30% off all plans",    createdAt: "May 28, 2025" },
  { id: 2,  code: "WELCOME10",   type: "flat",    value: 100,  minOrder: 199, maxUses: 1000, usedCount: 891, validFrom: "Jan 1, 2025",  validTo: "Dec 31, 2025", plan: "Premium",    active: true,  description: "New user welcome discount ₹100 off",    createdAt: "Dec 30, 2024" },
  { id: 3,  code: "FAMILY50",    type: "percent", value: 50,   minOrder: 0,   maxUses: 200,  usedCount: 200, validFrom: "May 1, 2025",  validTo: "May 31, 2025", plan: "Family Plan",active: false, description: "Family plan launch promo — 50% off",    createdAt: "Apr 25, 2025" },
  { id: 4,  code: "ANNUAL20",    type: "percent", value: 20,   minOrder: 0,   maxUses: 300,  usedCount: 78,  validFrom: "Jun 1, 2025",  validTo: "Jul 31, 2025", plan: "Annual",     active: true,  description: "Annual plan 20% off — limited time",    createdAt: "May 30, 2025" },
  { id: 5,  code: "DIWALI25",    type: "percent", value: 25,   minOrder: 0,   maxUses: 1000, usedCount: 0,   validFrom: "Oct 20, 2025", validTo: "Nov 5, 2025",  plan: "All Plans",  active: false, description: "Diwali special — 25% off",              createdAt: "Jun 12, 2025" },
  { id: 6,  code: "REFER200",    type: "flat",    value: 200,  minOrder: 299, maxUses: 500,  usedCount: 312, validFrom: "Mar 1, 2025",  validTo: "Aug 31, 2025", plan: "Premium",    active: true,  description: "Referral reward coupon ₹200 off",       createdAt: "Feb 28, 2025" },
  { id: 7,  code: "STUDENT15",   type: "percent", value: 15,   minOrder: 0,   maxUses: 250,  usedCount: 47,  validFrom: "Jun 1, 2025",  validTo: "Sep 30, 2025", plan: "Premium",    active: true,  description: "Student discount — 15% off for verified students", createdAt: "May 31, 2025" },
  { id: 8,  code: "REACTIVATE",  type: "flat",    value: 150,  minOrder: 199, maxUses: 100,  usedCount: 12,  validFrom: "Jun 10, 2025", validTo: "Jun 30, 2025", plan: "All Plans",  active: true,  description: "Win back lapsed users — ₹150 off",      createdAt: "Jun 9, 2025" },
]

const STATUS_COLORS = {
  Active:  { color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  Expired: { color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
  Paused:  { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  Upcoming:{ color: "#4B80F0", bg: "rgba(75,128,240,0.12)" },
}

function getCouponStatus(c: Coupon): keyof typeof STATUS_COLORS {
  if (!c.active) return c.usedCount >= c.maxUses ? "Expired" : "Paused"
  // Simple check — in a real app parse dates properly
  if (c.validTo.includes("2025") && c.usedCount >= c.maxUses) return "Expired"
  if (c.validFrom.includes("Oct") || c.validFrom.includes("Nov")) return "Upcoming"
  return "Active"
}

const EMPTY_COUPON: Omit<Coupon, "id" | "usedCount" | "createdAt"> = {
  code: "", type: "percent", value: 0, minOrder: 0, maxUses: 100,
  validFrom: "", validTo: "", plan: "All Plans", active: true, description: "",
}

const PAGE_SIZE = 6

function StatCard({ label, value, sub, icon: Icon, color, delay }: any) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-30px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", boxShadow: "var(--shadow-card)", display: "flex", alignItems: "center", gap: 14 }}
    >
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
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null)
  const [form, setForm] = useState<typeof EMPTY_COUPON>({ ...EMPTY_COUPON })
  const [copied, setCopied] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)

  const filtered = coupons.filter(c =>
    !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalRedemptions = coupons.reduce((s, c) => s + c.usedCount, 0)
  const activeCoupons = coupons.filter(c => c.active).length
  const revenue = coupons.filter(c => c.active).reduce((s, c) => s + c.usedCount * (c.type === "flat" ? c.value : c.value * 3), 0)

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(code)
    setTimeout(() => setCopied(null), 1800)
  }

  const handleToggle = (id: number) => {
    setCoupons(cs => cs.map(c => c.id === id ? { ...c, active: !c.active } : c))
  }

  const handleDelete = (c: Coupon) => {
    setCoupons(cs => cs.filter(x => x.id !== c.id))
    setDeleteTarget(null)
  }

  const openCreate = () => {
    setEditCoupon(null)
    setForm({ ...EMPTY_COUPON })
    setShowModal(true)
  }

  const openEdit = (c: Coupon) => {
    setEditCoupon(c)
    setForm({ code: c.code, type: c.type, value: c.value, minOrder: c.minOrder, maxUses: c.maxUses, validFrom: c.validFrom, validTo: c.validTo, plan: c.plan, active: c.active, description: c.description })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.code.trim()) return
    if (editCoupon) {
      setCoupons(cs => cs.map(c => c.id === editCoupon.id ? { ...c, ...form } : c))
    } else {
      setCoupons(cs => [...cs, { ...form, id: Date.now(), usedCount: 0, createdAt: "Jun 12, 2025" }])
    }
    setShowModal(false)
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text-primary)", margin: "0 0 4px" }}>Coupons</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>Create and manage discount coupons and promo codes</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}
          >
            <Download size={14} /> Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={openCreate}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #C9913A, #D4A853)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <Plus size={14} /> New Coupon
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 22 }}>
        <StatCard label="Total Coupons" value={String(coupons.length)} sub="All time" icon={Tag} color="#4B80F0" delay={0} />
        <StatCard label="Active Coupons" value={String(activeCoupons)} sub={`${coupons.length - activeCoupons} paused or expired`} icon={CheckCircle} color="#10B981" delay={0.07} />
        <StatCard label="Total Redemptions" value={totalRedemptions.toLocaleString("en-IN")} sub="Across all coupons" icon={Users} color="#D4A853" delay={0.14} />
        <StatCard label="Revenue Influenced" value={`₹${(revenue / 1000).toFixed(1)}k`} sub="Estimated savings given" icon={TrendingUp} color="#8B5CF6" delay={0.21} />
      </div>

      {/* Search */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "13px 18px", marginBottom: 14, display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 320 }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            type="text" placeholder="Search code, description…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ width: "100%", padding: "7px 12px 7px 32px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--text-muted)" }}>{filtered.length} coupons</span>
      </div>

      {/* Coupon Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14, marginBottom: 18 }}>
        <AnimatePresence>
          {paged.map((coupon, i) => {
            const status = getCouponStatus(coupon)
            const sc = STATUS_COLORS[status]
            const usePct = Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)
            return (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.06 }}
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-card)" }}
              >
                {/* Top stripe */}
                <div style={{ height: 4, background: coupon.active ? "linear-gradient(90deg, #C9913A, #D4A853)" : "var(--border)" }} />

                <div style={{ padding: "16px 18px" }}>
                  {/* Code + copy */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "0.08em" }}>{coupon.code}</span>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        title="Copy code"
                        style={{ background: "transparent", border: "none", color: copied === coupon.code ? "#10B981" : "var(--text-muted)", cursor: "pointer", padding: 4, borderRadius: 6, transition: "color 0.2s" }}
                      >
                        {copied === coupon.code ? <CheckCircle size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, color: sc.color, background: sc.bg }}>{status}</span>
                      {/* Toggle */}
                      <button onClick={() => handleToggle(coupon.id)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, color: coupon.active ? "#10B981" : "var(--text-muted)" }}>
                        {coupon.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.4 }}>{coupon.description}</p>

                  {/* Discount value */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 8, background: "rgba(212,168,83,0.12)", border: "1px solid rgba(212,168,83,0.25)" }}>
                      {coupon.type === "percent" ? <Percent size={13} style={{ color: "var(--gold)" }} /> : <IndianRupee size={13} style={{ color: "var(--gold)" }} />}
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>
                        {coupon.type === "percent" ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{coupon.plan}</span>
                    {coupon.minOrder > 0 && <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>· Min ₹{coupon.minOrder}</span>}
                  </div>

                  {/* Usage bar */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Usage</span>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: usePct >= 90 ? "#EF4444" : "var(--text-secondary)" }}>{coupon.usedCount} / {coupon.maxUses}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "var(--bg-surface2)", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${usePct}%` }}
                        transition={{ duration: 0.9, delay: i * 0.07, ease: "easeOut" }}
                        style={{ height: "100%", borderRadius: 3, background: usePct >= 100 ? "#6B7280" : usePct >= 80 ? "#EF4444" : "linear-gradient(90deg, #C9913A, #D4A853)" }}
                      />
                    </div>
                  </div>

                  {/* Validity */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                    <Calendar size={12} style={{ color: "var(--text-muted)" }} />
                    <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{coupon.validFrom} — {coupon.validTo}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => openEdit(coupon)}
                      style={{ flex: 1, padding: "7px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 12.5, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)" }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)" }}
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(coupon)}
                      style={{ flex: 1, padding: "7px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.25)", background: "transparent", color: "#EF4444", fontSize: 12.5, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)" }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        {paged.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 0", color: "var(--text-muted)", fontSize: 14 }}>
            No coupons match your search.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: page === 1 ? "var(--text-muted)" : "var(--text-secondary)", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
            <ChevronLeft size={14} /> Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${page === i + 1 ? "var(--gold)" : "var(--border)"}`, background: page === i + 1 ? "rgba(212,168,83,0.15)" : "transparent", color: page === i + 1 ? "var(--gold)" : "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontWeight: page === i + 1 ? 700 : 400 }}>
              {i + 1}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: page === totalPages ? "var(--text-muted)" : "var(--text-secondary)", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 100 }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(500px, 95vw)", background: "var(--bg-surface)", borderRadius: 18, border: "1px solid var(--border)", zIndex: 110, padding: 28, maxHeight: "90vh", overflowY: "auto" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <h3 style={{ margin: 0, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>
                  {editCoupon ? "Edit Coupon" : "Create New Coupon"}
                </h3>
                <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={20} /></button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Code */}
                <div>
                  <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Coupon Code *</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SUMMER20"
                    style={{ width: "100%", padding: "9px 14px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 15, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.08em", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                {/* Type + Value row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Discount Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as "percent" | "flat" }))}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none" }}
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="flat">Flat (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Value {form.type === "percent" ? "(%)" : "(₹)"}</label>
                    <input type="number" value={form.value || ""} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))}
                      placeholder={form.type === "percent" ? "e.g. 20" : "e.g. 100"}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* Min order + Max uses */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Min Order (₹)</label>
                    <input type="number" value={form.minOrder || ""} onChange={e => setForm(f => ({ ...f, minOrder: Number(e.target.value) }))}
                      placeholder="0 = no minimum"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Max Uses</label>
                    <input type="number" value={form.maxUses || ""} onChange={e => setForm(f => ({ ...f, maxUses: Number(e.target.value) }))}
                      placeholder="e.g. 500"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* Plan */}
                <div>
                  <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Applicable Plan</label>
                  <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none" }}
                  >
                    <option>All Plans</option>
                    <option>Premium</option>
                    <option>Family Plan</option>
                    <option>Annual</option>
                    <option>Annual Family</option>
                  </select>
                </div>

                {/* Valid dates */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Valid From</label>
                    <input value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                      placeholder="Jun 1, 2025"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Valid To</label>
                    <input value={form.validTo} onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))}
                      placeholder="Jun 30, 2025"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6 }}>Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Internal note about this coupon"
                    rows={2}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }}
                  />
                </div>

                {/* Active toggle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>Active</p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>Allow this coupon to be redeemed</p>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, active: !f.active }))} style={{ background: "transparent", border: "none", cursor: "pointer", color: form.active ? "#10B981" : "var(--text-muted)" }}>
                    {form.active ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}>
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #C9913A, #D4A853)", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
                >
                  {editCoupon ? "Save Changes" : "Create Coupon"}
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
