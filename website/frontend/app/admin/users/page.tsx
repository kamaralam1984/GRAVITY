'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { adminApi } from '@/lib/api'
import {
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Shield,
  Smartphone,
  MapPin,
  MoreHorizontal,
  UserPlus,
  TrendingUp,
  Activity,
  X,
} from 'lucide-react'

// ── Static mock data ─────────────────────────────────────────────
const MOCK_USERS = [
  { id: 1,  name: "Priya Sharma",    email: "priya.sharma@gmail.com",   phone: "+91 98765 43210", plan: "Family",  status: "Active",   devices: 3, familyName: "Sharma Family",  joinedAt: "Jan 12, 2024", lastSeen: "2 min ago",  city: "Mumbai",    avatar: "PS" },
  { id: 2,  name: "Rajesh Kumar",    email: "rajesh.k@yahoo.com",       phone: "+91 87654 32109", plan: "Premium", status: "Active",   devices: 2, familyName: "Kumar Family",   joinedAt: "Feb 3, 2024",  lastSeen: "15 min ago", city: "Delhi",     avatar: "RK" },
  { id: 3,  name: "Ananya Singh",    email: "ananya.singh@outlook.com", phone: "+91 76543 21098", plan: "Free",    status: "Active",   devices: 1, familyName: "Singh Family",   joinedAt: "Mar 7, 2024",  lastSeen: "1 hr ago",   city: "Bangalore", avatar: "AS" },
  { id: 4,  name: "Meera Patel",     email: "meera.patel@gmail.com",    phone: "+91 65432 10987", plan: "Premium", status: "Inactive", devices: 2, familyName: "Patel Family",   joinedAt: "Apr 14, 2024", lastSeen: "3 days ago", city: "Ahmedabad", avatar: "MP" },
  { id: 5,  name: "Arjun Nair",      email: "arjun.nair@gmail.com",     phone: "+91 54321 09876", plan: "Family",  status: "Active",   devices: 4, familyName: "Nair Family",    joinedAt: "May 2, 2024",  lastSeen: "30 min ago", city: "Chennai",   avatar: "AN" },
  { id: 6,  name: "Kavita Mehta",    email: "kavita.mehta@hotmail.com", phone: "+91 43210 98765", plan: "Free",    status: "Banned",   devices: 0, familyName: "Mehta Family",   joinedAt: "May 20, 2024", lastSeen: "1 week ago", city: "Hyderabad", avatar: "KM" },
  { id: 7,  name: "Suresh Iyer",     email: "suresh.iyer@gmail.com",    phone: "+91 32109 87654", plan: "Premium", status: "Active",   devices: 2, familyName: "Iyer Family",    joinedAt: "Jun 8, 2024",  lastSeen: "5 min ago",  city: "Pune",      avatar: "SI" },
  { id: 8,  name: "Deepa Reddy",     email: "deepa.reddy@gmail.com",    phone: "+91 21098 76543", plan: "Family",  status: "Active",   devices: 3, familyName: "Reddy Family",   joinedAt: "Jun 15, 2024", lastSeen: "20 min ago", city: "Mumbai",    avatar: "DR" },
  { id: 9,  name: "Vikram Joshi",    email: "vikram.joshi@gmail.com",   phone: "+91 10987 65432", plan: "Free",    status: "Active",   devices: 1, familyName: "Joshi Family",   joinedAt: "Jul 1, 2024",  lastSeen: "2 hrs ago",  city: "Jaipur",    avatar: "VJ" },
  { id: 10, name: "Pooja Desai",     email: "pooja.desai@gmail.com",    phone: "+91 99876 54321", plan: "Premium", status: "Active",   devices: 2, familyName: "Desai Family",   joinedAt: "Jul 18, 2024", lastSeen: "45 min ago", city: "Surat",     avatar: "PD" },
  { id: 11, name: "Arun Verma",      email: "arun.verma@gmail.com",     phone: "+91 88765 43210", plan: "Free",    status: "Inactive", devices: 1, familyName: "Verma Family",   joinedAt: "Aug 5, 2024",  lastSeen: "5 days ago", city: "Lucknow",   avatar: "AV" },
  { id: 12, name: "Sunita Gupta",    email: "sunita.gupta@gmail.com",   phone: "+91 77654 32109", plan: "Family",  status: "Active",   devices: 3, familyName: "Gupta Family",   joinedAt: "Aug 22, 2024", lastSeen: "10 min ago", city: "Kanpur",    avatar: "SG" },
]

const PLAN_COLORS: Record<string, { color: string; bg: string }> = {
  Free:    { color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
  Premium: { color: "#D4A853", bg: "rgba(212,168,83,0.12)"  },
  Family:  { color: "#4B80F0", bg: "rgba(75,128,240,0.12)"  },
}

const STATUS_COLORS: Record<string, { color: string; bg: string; dot: string }> = {
  Active:   { color: "#10B981", bg: "rgba(16,185,129,0.12)",  dot: "#10B981" },
  Inactive: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  dot: "#F59E0B" },
  Banned:   { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   dot: "#EF4444" },
}

const PLAN_FILTERS = ["All", "Free", "Premium", "Family"]
const STATUS_FILTERS = ["All", "Active", "Inactive", "Banned"]
const PAGE_SIZE = 8

function StatCard({ label, value, sub, icon: Icon, color, delay }: any) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-30px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "18px 20px",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 3px", fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 2px", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>{sub}</p>
      </div>
    </motion.div>
  )
}

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [planFilter, setPlanFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_USERS[0] | null>(null)
  const [loading, setLoading] = useState(false)

  const filtered = MOCK_USERS.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.city.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === "All" || u.plan === planFilter
    const matchStatus = statusFilter === "All" || u.status === statusFilter
    return matchSearch && matchPlan && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 800)
  }

  const avatarColors = ["#4B80F0", "#D4A853", "#10B981", "#8B5CF6", "#EF4444", "#F59E0B"]

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text-primary)", margin: "0 0 4px" }}>
            Users
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
            Manage all registered users and their accounts
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleRefresh}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}
          >
            <RefreshCw size={14} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #C9913A, #D4A853)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <Download size={14} />
            Export CSV
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 22 }}>
        <StatCard label="Total Users" value="50,234" sub="+12.4% this month" icon={Users} color="#4B80F0" delay={0} />
        <StatCard label="Active Users" value="38,891" sub="77.4% of total" icon={Activity} color="#10B981" delay={0.07} />
        <StatCard label="Premium Users" value="17,581" sub="35% of total" icon={Shield} color="#D4A853" delay={0.14} />
        <StatCard label="New This Month" value="2,340" sub="+18.7% vs last month" icon={TrendingUp} color="#8B5CF6" delay={0.21} />
      </div>

      {/* Filters Row */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 340 }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search name, email, city…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ width: "100%", padding: "7px 12px 7px 32px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Plan filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PLAN_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => { setPlanFilter(f); setPage(1) }}
              style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${planFilter === f ? "var(--gold)" : "var(--border)"}`, background: planFilter === f ? "rgba(212,168,83,0.12)" : "transparent", color: planFilter === f ? "var(--gold)" : "var(--text-secondary)", fontSize: 12.5, fontWeight: planFilter === f ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => { setStatusFilter(f); setPage(1) }}
              style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${statusFilter === f ? "var(--primary)" : "var(--border)"}`, background: statusFilter === f ? "rgba(var(--primary-rgb),0.10)" : "transparent", color: statusFilter === f ? "var(--primary)" : "var(--text-secondary)", fontSize: 12.5, fontWeight: statusFilter === f ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}
            >
              {f}
            </button>
          ))}
        </div>

        <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--text-muted)" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface2)" }}>
                {["User", "Contact", "Plan", "Status", "Devices", "Joined", "Last Seen", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paged.map((user, i) => {
                  const planC = PLAN_COLORS[user.plan]
                  const statusC = STATUS_COLORS[user.status]
                  const avatarBg = avatarColors[user.id % avatarColors.length]
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-surface2)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      onClick={() => setSelectedUser(user)}
                    >
                      {/* User */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                            {user.avatar}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</p>
                            <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-muted)" }}>{user.familyName}</p>
                          </div>
                        </div>
                      </td>
                      {/* Contact */}
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ margin: "0 0 2px", fontSize: 12.5, color: "var(--text-secondary)" }}>{user.email}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>{user.phone}</p>
                      </td>
                      {/* Plan */}
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: planC.color, background: planC.bg }}>
                          {user.plan}
                        </span>
                      </td>
                      {/* Status */}
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: statusC.color, background: statusC.bg }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusC.dot }} />
                          {user.status}
                        </span>
                      </td>
                      {/* Devices */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Smartphone size={13} style={{ color: "var(--text-muted)" }} />
                          <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{user.devices}</span>
                        </div>
                      </td>
                      {/* Joined */}
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{user.joinedAt}</span>
                      </td>
                      {/* Last Seen */}
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{user.lastSeen}</span>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            title="View details"
                            onClick={() => setSelectedUser(user)}
                            style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, transition: "all 0.15s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)" }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)" }}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            title={user.status === "Banned" ? "Unban user" : "Ban user"}
                            style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: user.status === "Banned" ? "#10B981" : "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, transition: "all 0.15s" }}
                          >
                            {user.status === "Banned" ? <CheckCircle size={13} /> : <Ban size={13} />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
              {paged.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
              Page {page} of {totalPages} &middot; {filtered.length} users
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: page === 1 ? "var(--text-muted)" : "var(--text-secondary)", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12.5 }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${page === i + 1 ? "var(--gold)" : "var(--border)"}`, background: page === i + 1 ? "rgba(212,168,83,0.15)" : "transparent", color: page === i + 1 ? "var(--gold)" : "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontWeight: page === i + 1 ? 700 : 400 }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: page === totalPages ? "var(--text-muted)" : "var(--text-secondary)", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12.5 }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100 }}
            />
            <motion.div
              initial={{ x: 360, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 360, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              style={{ position: "fixed", top: 0, right: 0, width: 360, height: "100vh", background: "var(--bg-surface)", borderLeft: "1px solid var(--border)", zIndex: 110, overflowY: "auto", padding: 24 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <h3 style={{ margin: 0, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>User Details</h3>
                <button onClick={() => setSelectedUser(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
                  <X size={20} />
                </button>
              </div>

              {/* Avatar + name */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: avatarColors[selectedUser.id % avatarColors.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                  {selectedUser.avatar}
                </div>
                <h4 style={{ margin: "0 0 4px", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>{selectedUser.name}</h4>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--text-muted)" }}>{selectedUser.familyName}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, ...PLAN_COLORS[selectedUser.plan] }}>{selectedUser.plan}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, ...STATUS_COLORS[selectedUser.status] }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLORS[selectedUser.status].dot }} />
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              {/* Info rows */}
              {[
                { icon: Mail, label: "Email", value: selectedUser.email },
                { icon: Phone, label: "Phone", value: selectedUser.phone },
                { icon: MapPin, label: "City", value: selectedUser.city },
                { icon: Smartphone, label: "Devices", value: String(selectedUser.devices) },
                { icon: Calendar, label: "Joined", value: selectedUser.joinedAt },
                { icon: Activity, label: "Last Seen", value: selectedUser.lastSeen },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <Icon size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)", width: 68, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{value}</span>
                </div>
              ))}

              {/* Actions */}
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                <button style={{ padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 13.5, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  <Mail size={14} /> Send Email
                </button>
                <button style={{ padding: "10px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)", color: "#EF4444", fontSize: 13.5, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  <Ban size={14} /> {selectedUser.status === "Banned" ? "Unban User" : "Ban User"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
