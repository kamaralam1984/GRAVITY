'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Megaphone,
  Tag,
  Gift,
  TrendingUp,
  Users,
  Mail,
  Percent,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  Clock,
  BarChart2,
  Target,
  X,
  RefreshCw,
} from 'lucide-react'

const CAMPAIGNS = [
  {
    name: "Summer Safety Campaign",
    type: "Email",
    typeColor: "#4B80F0",
    audience: "All Free Users",
    sent: "21,784",
    openRate: 34.2,
    convRate: 8.1,
    status: "Active",
  },
  {
    name: "Elderly Care Feature Launch",
    type: "Push",
    typeColor: "#10B981",
    audience: "Family Plan",
    sent: "8,668",
    openRate: 52.1,
    convRate: 12.4,
    status: "Active",
  },
  {
    name: "Upgrade to Family Plus",
    type: "Email",
    typeColor: "#4B80F0",
    audience: "Premium Users",
    sent: "19,782",
    openRate: 28.7,
    convRate: 6.3,
    status: "Paused",
  },
]

const COUPONS = [
  { code: "FAMILY50",  discount: "50% off",       plan: "Family Plan",  uses: 234, max: 500, expires: "Jun 30", status: "Active" },
  { code: "GRAVFREE3", discount: "3 months free",  plan: "Any Plan",     uses: 89,  max: 200, expires: "Jul 15", status: "Active" },
  { code: "ELDERCARE", discount: "Rs 200 off",     plan: "Care Plan",    uses: 45,  max: 100, expires: "Jun 20", status: "Expiring Soon" },
  { code: "DRIVESAFE", discount: "30% off",        plan: "Family Plus",  uses: 156, max: 300, expires: "Aug 1",  status: "Active" },
  { code: "MONSOON20", discount: "20% off",        plan: "Any Plan",     uses: 312, max: 1000, expires: "Jul 31", status: "Active" },
  { code: "REFER100",  discount: "Rs 100 credit",  plan: "Any Plan",     uses: 78,  max: 500, expires: "Dec 31", status: "Active" },
  { code: "KIDSSAFE",  discount: "40% off",        plan: "Family",       uses: 98,  max: 200, expires: "Jun 25", status: "Expiring Soon" },
  { code: "ANNUAL30",  discount: "30% off annual", plan: "Any Plan",     uses: 445, max: 600, expires: "Aug 15", status: "Active" },
]

const FUNNEL = [
  { stage: "Website Visit", value: 100, count: "2,45,820" },
  { stage: "Sign Up",       value: 38,  count: "93,412" },
  { stage: "Create Circle", value: 22,  count: "54,080" },
  { stage: "Invite Member", value: 14,  count: "34,414" },
  { stage: "Upgrade",       value: 6,   count: "14,749" },
]

const COUPON_STATUS: Record<string, { color: string; bg: string }> = {
  "Active":        { color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  "Expiring Soon": { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  "Expired":       { color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
}

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export default function MarketingPage() {
  const [showCouponForm, setShowCouponForm] = useState(false)
  const [coupons, setCoupons] = useState(COUPONS)
  const [copiedCode, setCopiedCode] = useState("")
  const [newCode, setNewCode] = useState("")
  const [discountType, setDiscountType] = useState("percent")
  const [discountVal, setDiscountVal] = useState("")
  const [appliesTo, setAppliesTo] = useState("Any Plan")
  const [maxUses, setMaxUses] = useState("")
  const [expiry, setExpiry] = useState("")

  const handleCopy = (code: string) => {
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(""), 2000)
  }

  const handleCreateCoupon = () => {
    if (!newCode || !discountVal) return
    setCoupons([{
      code: newCode.toUpperCase(),
      discount: discountType === "percent" ? `${discountVal}% off` : `Rs ${discountVal} off`,
      plan: appliesTo,
      uses: 0,
      max: parseInt(maxUses) || 100,
      expires: expiry || "TBD",
      status: "Active",
    }, ...coupons])
    setNewCode(""); setDiscountVal(""); setMaxUses(""); setExpiry("")
    setShowCouponForm(false)
  }

  const cardStyle = {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "20px 24px",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1300 }}>
      <Link href="/" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
        ← Back to KVL Track Home
      </Link>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Marketing Hub
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 14 }}>
            Campaigns, coupons and growth analytics — all in one place
          </p>
        </div>
        <button onClick={() => setShowCouponForm(!showCouponForm)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gold)", color: "#000", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          <Plus size={16} />
          New Campaign
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {[
          { label: "Active Campaigns", value: "3", sub: "2 email, 1 push", icon: Megaphone, color: "#D4A853" },
          { label: "Active Coupons", value: "12", sub: "4 expiring soon", icon: Tag, color: "#10B981" },
          { label: "Conversions This Month", value: "1,234", sub: "+18.4% vs last month", icon: TrendingUp, color: "#4B80F0" },
          { label: "Revenue from Marketing", value: "Rs 3,24,500", sub: "attributed", icon: Target, color: "#8B5CF6" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: s.color, marginTop: 1 }}>{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Campaigns */}
      <div style={{ ...cardStyle }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Megaphone size={18} style={{ color: "var(--gold)" }} />
          Active Campaigns
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
          {CAMPAIGNS.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}
              style={{ background: "var(--bg-surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{c.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: c.typeColor, background: `${c.typeColor}18`, borderRadius: 6, padding: "2px 8px" }}>{c.type}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.audience}</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                  color: c.status === "Active" ? "#10B981" : "#F59E0B",
                  background: c.status === "Active" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)" }}>
                  {c.status}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { label: "Sent", val: c.sent },
                  { label: "Open Rate", val: `${c.openRate}%` },
                  { label: "Conv. Rate", val: `${c.convRate}%` },
                ].map((stat, j) => (
                  <div key={j} style={{ background: "var(--bg-surface)", borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{stat.val}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid var(--gold)", background: "rgba(var(--gold-rgb),0.08)", color: "var(--gold)", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                  <Edit size={12} /> Edit
                </button>
                <button style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                  {c.status === "Active" ? "Pause" : "Resume"}
                </button>
                <button style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                  <BarChart2 size={12} /> Stats
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Coupon Management */}
      <div style={{ ...cardStyle }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            <Tag size={18} style={{ color: "#10B981" }} />
            Coupon Management
          </div>
          <button onClick={() => setShowCouponForm(!showCouponForm)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: showCouponForm ? "var(--bg-surface2)" : "#10B981", color: showCouponForm ? "var(--text-secondary)" : "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {showCouponForm ? <X size={14} /> : <Plus size={14} />}
            {showCouponForm ? "Cancel" : "Create Coupon"}
          </button>
        </div>

        {/* Create coupon form */}
        <AnimatePresence>
          {showCouponForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", marginBottom: 20 }}>
              <div style={{ background: "var(--bg-surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Gift size={16} style={{ color: "#D4A853" }} />
                  Create New Coupon
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Coupon Code</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} placeholder="e.g. SAVE20"
                        style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "monospace", textTransform: "uppercase" }} />
                      <button onClick={() => setNewCode(generateCode())}
                        style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-muted)", cursor: "pointer" }}>
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Discount Type</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setDiscountType("percent")}
                        style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer",
                          borderColor: discountType === "percent" ? "var(--gold)" : "var(--border)",
                          background: discountType === "percent" ? "rgba(var(--gold-rgb),0.12)" : "transparent",
                          color: discountType === "percent" ? "var(--gold)" : "var(--text-muted)" }}>
                        <Percent size={12} style={{ display: "inline", marginRight: 4 }} />Percent
                      </button>
                      <button onClick={() => setDiscountType("fixed")}
                        style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer",
                          borderColor: discountType === "fixed" ? "var(--gold)" : "var(--border)",
                          background: discountType === "fixed" ? "rgba(var(--gold-rgb),0.12)" : "transparent",
                          color: discountType === "fixed" ? "var(--gold)" : "var(--text-muted)" }}>
                        Rs Fixed
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Discount Value</label>
                    <input value={discountVal} onChange={e => setDiscountVal(e.target.value)} placeholder={discountType === "percent" ? "e.g. 30" : "e.g. 200"}
                      type="number"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Applicable Plan</label>
                    <select value={appliesTo} onChange={e => setAppliesTo(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-primary)", fontSize: 13 }}>
                      <option>Any Plan</option>
                      <option>Basic</option>
                      <option>Family</option>
                      <option>Premium</option>
                      <option>Family Plus</option>
                      <option>Care Plan</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Max Uses</label>
                    <input value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="e.g. 500" type="number"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Expiry Date</label>
                    <input value={expiry} onChange={e => setExpiry(e.target.value)} type="date"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <button onClick={handleCreateCoupon}
                  style={{ marginTop: 16, padding: "11px 32px", borderRadius: 10, border: "none", background: "var(--gold)", color: "#000", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Create Coupon
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coupons table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Code", "Discount", "Plan", "Uses / Max", "Expires", "Status", "Actions"].map(col => (
                  <th key={col} style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon, i) => {
                const sc = COUPON_STATUS[coupon.status] || COUPON_STATUS["Active"]
                return (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-surface2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 13, color: "var(--gold)", background: "rgba(var(--gold-rgb),0.1)", borderRadius: 6, padding: "3px 8px" }}>{coupon.code}</span>
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--text-primary)", fontWeight: 600 }}>{coupon.discount}</td>
                    <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>{coupon.plan}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{coupon.uses} / {coupon.max}</span>
                        <div style={{ height: 4, borderRadius: 2, background: "var(--bg-surface2)", width: 80 }}>
                          <div style={{ height: "100%", borderRadius: 2, background: coupon.uses / coupon.max > 0.8 ? "#F97316" : "#4B80F0", width: `${Math.min(100, (coupon.uses / coupon.max) * 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>{coupon.expires}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: sc.color, background: sc.bg, borderRadius: 6, padding: "3px 8px" }}>{coupon.status}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button onClick={() => handleCopy(coupon.code)}
                          style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: copiedCode === coupon.code ? "#10B981" : "var(--text-muted)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                          {copiedCode === coupon.code ? <CheckCircle size={11} /> : <Copy size={11} />}
                          Copy
                        </button>
                        <button style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                          <Edit size={11} /> {coupon.status === "Expiring Soon" ? "Extend" : "Edit"}
                        </button>
                        <button onClick={() => setCoupons(coupons.filter((_, j) => j !== i))}
                          style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)", background: "transparent", color: "#EF4444", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Funnel + Growth Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Conversion Funnel */}
        <div style={{ ...cardStyle }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Target size={17} style={{ color: "#4B80F0" }} />
            Conversion Funnel
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FUNNEL.map((stage, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{stage.stage}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{stage.count}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#4B80F0" }}>{stage.value}%</span>
                  </div>
                </div>
                <div style={{ height: 26, borderRadius: 6, background: "var(--bg-surface2)", overflow: "hidden", position: "relative" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${stage.value}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: "easeOut" }}
                    style={{ height: "100%", background: `linear-gradient(90deg, #4B80F0, #7C3AED)`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)", padding: "10px 12px", background: "var(--bg-surface2)", borderRadius: 8 }}>
            Overall conversion: Visit to Paid = <strong style={{ color: "#4B80F0" }}>6.0%</strong> — industry average is 2-3%
          </div>
        </div>

        {/* Growth Metrics */}
        <div style={{ ...cardStyle }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={17} style={{ color: "#10B981" }} />
            Growth Metrics
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Customer Acquisition Cost", value: "Rs 234", sub: "per paid user", color: "#F97316" },
              { label: "Lifetime Value (LTV)", value: "Rs 4,820", sub: "avg per user", color: "#4B80F0" },
              { label: "LTV:CAC Ratio", value: "20.6x", sub: "excellent", color: "#10B981" },
              { label: "Payback Period", value: "3.2 months", sub: "break-even", color: "#8B5CF6" },
            ].map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.1 }}
                style={{ background: "var(--bg-surface2)", borderRadius: 12, padding: "16px", border: `1px solid ${m.color}22` }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: m.color, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{m.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{m.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Top performing content */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 10 }}>Top Issues Driving Upgrades</div>
            {[
              { label: "SOS alert reliability concern", pct: 42 },
              { label: "Family location accuracy", pct: 31 },
              { label: "Elderly care monitoring", pct: 18 },
              { label: "Driving safety scoring", pct: 9 },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>
                  <span>{item.label}</span><span style={{ fontWeight: 700 }}>{item.pct}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: "var(--bg-surface2)" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                    style={{ height: "100%", borderRadius: 3, background: "#D4A853" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
