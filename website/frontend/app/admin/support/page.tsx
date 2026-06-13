'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  MoreHorizontal,
  User,
  Tag,
  TrendingUp,
  Phone,
  Mail,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react'

const TICKETS = [
  { id: "TKT-001", user: "Priya Sharma", email: "priya.sharma@gmail.com", phone: "+91 98765 43210", plan: "Family Plus", category: "SOS Not Working", priority: "CRITICAL", status: "Open", created: "2h ago", lastReply: "30min ago", description: "The SOS button on my husbands device is not triggering any alerts. We tested it multiple times and the emergency contacts are not receiving notifications. This is very urgent as he is elderly and relies on this feature for safety." },
  { id: "TKT-002", user: "Rahul Mehta", email: "rahul.mehta@gmail.com", phone: "+91 87654 32109", plan: "Premium", category: "Payment Failed", priority: "High", status: "In Progress", created: "4h ago", lastReply: "1h ago", description: "My subscription renewal failed twice. The payment was deducted from my bank account but the app still shows expired subscription. Please resolve this immediately as I cannot track my family." },
  { id: "TKT-003", user: "Ananya Iyer", email: "ananya.iyer@gmail.com", phone: "+91 76543 21098", plan: "Family", category: "Location Issue", priority: "Normal", status: "Open", created: "6h ago", lastReply: "2h ago", description: "The location of my daughter is showing as 15km away from her actual position. The GPS seems to be inaccurate. She is showing at her school but the app shows a different location entirely." },
  { id: "TKT-004", user: "Vikram Singh", email: "vikram.singh@gmail.com", phone: "+91 65432 10987", plan: "Basic", category: "Feature Request", priority: "Low", status: "Open", created: "1d ago", lastReply: "4h ago", description: "It would be great to have a feature to schedule automatic check-ins. For example, when my child leaves school the app should automatically send me a notification without them having to do anything." },
  { id: "TKT-005", user: "Kavita Gupta", email: "kavita.gupta@gmail.com", phone: "+91 54321 09876", plan: "Premium", category: "Account Access", priority: "High", status: "Resolved", created: "2d ago", lastReply: "1d ago", description: "I was locked out of my account after too many wrong password attempts. I could not reset my password because the OTP was going to an old number." },
  { id: "TKT-006", user: "Suresh Nair", email: "suresh.nair@gmail.com", phone: "+91 43210 98765", plan: "Family Plus", category: "Geofence Issue", priority: "Normal", status: "In Progress", created: "3h ago", lastReply: "45min ago", description: "The geofence alert for my home zone is triggering randomly throughout the day even when no one is entering or leaving. I am getting dozens of false alerts." },
  { id: "TKT-007", user: "Deepa Krishnan", email: "deepa.k@gmail.com", phone: "+91 32109 87654", plan: "Family", category: "Bug Report", priority: "High", status: "Open", created: "5h ago", lastReply: "3h ago", description: "The app crashes every time I try to open the map view on Android 14. It worked fine before the last update. The crash happens consistently within 2-3 seconds of opening the location screen." },
  { id: "TKT-008", user: "Arjun Patel", email: "arjun.patel@gmail.com", phone: "+91 21098 76543", plan: "Basic", category: "Payment Failed", priority: "High", status: "Open", created: "1h ago", lastReply: "1h ago", description: "Tried to upgrade to Family Plan but the payment page shows an error after entering card details. The transaction is being declined but my bank says there are no issues from their side." },
  { id: "TKT-009", user: "Meena Joshi", email: "meena.joshi@gmail.com", phone: "+91 10987 65432", plan: "Family Plus", category: "Privacy Concern", priority: "Normal", status: "Resolved", created: "4d ago", lastReply: "2d ago", description: "I wanted to understand how my familys location data is stored and who can access it. I also wanted to request deletion of historical location data older than 30 days." },
  { id: "TKT-010", user: "Kiran Reddy", email: "kiran.reddy@gmail.com", phone: "+91 99887 76654", plan: "Premium", category: "Location Issue", priority: "CRITICAL", status: "Open", created: "30min ago", lastReply: "30min ago", description: "My mothers location has not updated for the last 6 hours. The last known location was her home but she is supposed to be at the hospital. The device shows online but location is frozen." },
  { id: "TKT-011", user: "Pooja Sharma", email: "pooja.sharma@gmail.com", phone: "+91 88776 65543", plan: "Family", category: "Account Access", priority: "Normal", status: "Resolved", created: "5d ago", lastReply: "4d ago", description: "Needed help adding a second admin to my family circle. The app was showing permission errors when I tried to invite my spouse as a co-admin." },
  { id: "TKT-012", user: "Naveen Kumar", email: "naveen.kumar@gmail.com", phone: "+91 77665 54432", plan: "Family Plus", category: "Feature Request", priority: "Low", status: "Open", created: "2d ago", lastReply: "6h ago", description: "Requesting the ability to export location history as a PDF report for insurance purposes. Currently only CSV export is available which is difficult to share." },
]

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  "CRITICAL": { color: "#EF4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" },
  "High":     { color: "#F97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)" },
  "Normal":   { color: "#4B80F0", bg: "rgba(75,128,240,0.12)", border: "rgba(75,128,240,0.3)" },
  "Low":      { color: "#6B7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.3)" },
}

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  "Open":        { color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
  "In Progress": { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  "Resolved":    { color: "#10B981", bg: "rgba(16,185,129,0.12)" },
}

const TABS = [
  { label: "All", count: 12 },
  { label: "Critical", count: 2 },
  { label: "High", count: 4 },
  { label: "Normal", count: 3 },
  { label: "Low", count: 2 },
  { label: "Resolved", count: 3 },
]

const QUICK_REPLIES = [
  "We are investigating this issue and will update you within 2 hours.",
  "Please update to the latest app version and try again.",
  "Your issue has been resolved. Please restart the app to see the changes.",
  "We have escalated this to our technical team for immediate attention.",
  "Could you please share a screenshot of the error you are seeing?",
]

const CONVERSATION = [
  { sender: "User", time: "2h ago", msg: "The SOS button on my husbands device is not triggering any alerts. We tested it multiple times and the emergency contacts are not receiving notifications." },
  { sender: "Support Bot", time: "1h 50min ago", msg: "Thank you for reaching out to Gravity Support. We have received your ticket and a support agent will get back to you shortly. Your ticket ID is TKT-001." },
  { sender: "Admin Anita", time: "30min ago", msg: "Hello Priya, we are looking into this urgently. Can you please confirm which device model your husband is using and when the issue first started?" },
]

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("All")
  const [selectedTicket, setSelectedTicket] = useState<typeof TICKETS[0] | null>(null)
  const [search, setSearch] = useState("")
  const [replyText, setReplyText] = useState("")
  const [internalNote, setInternalNote] = useState("")

  const filtered = TICKETS.filter(t => {
    if (search && !t.user.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase())) return false
    if (activeTab === "All") return true
    if (activeTab === "Resolved") return t.status === "Resolved"
    if (activeTab === "Critical") return t.priority === "CRITICAL"
    return t.priority === activeTab
  })

  const cardStyle = {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "20px 24px",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1400 }}>
      <Link href="/" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
        ← Back to Gravity Home
      </Link>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Support Center
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 14 }}>
            Manage user support tickets — Open: 47 | In Progress: 23 | Resolved Today: 89
          </p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gold)", color: "#000", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          <Plus size={16} />
          New Ticket
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {[
          { label: "Open Tickets", value: "47", icon: AlertCircle, color: "#EF4444" },
          { label: "Avg Response Time", value: "2.4 hrs", icon: Clock, color: "#F59E0B" },
          { label: "Satisfaction Rate", value: "94.2%", icon: TrendingUp, color: "#10B981" },
          { label: "Resolved Today", value: "89", icon: CheckCircle, color: "#4B80F0" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Left: table + filters */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TABS.map(tab => (
              <button key={tab.label} onClick={() => setActiveTab(tab.label)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                  borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                  borderColor: activeTab === tab.label ? "var(--gold)" : "var(--border)",
                  background: activeTab === tab.label ? "rgba(var(--gold-rgb),0.12)" : "var(--bg-surface)",
                  color: activeTab === tab.label ? "var(--gold)" : "var(--text-secondary)",
                }}>
                {tab.label}
                <span style={{ fontSize: 11, background: "var(--bg-surface2)", borderRadius: 6, padding: "1px 6px" }}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Search + filter bar */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets by user or ID..."
                style={{ width: "100%", padding: "9px 14px 9px 34px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}>
              <Filter size={14} /> Filter
            </button>
          </div>

          {/* Table */}
          <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Ticket ID", "User", "Category", "Priority", "Status", "Created", "Last Reply", "Actions"].map(col => (
                      <th key={col} style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ticket, i) => {
                    const pc = PRIORITY_CONFIG[ticket.priority]
                    const sc = STATUS_CONFIG[ticket.status]
                    return (
                      <motion.tr key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedTicket(ticket)}
                        style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-surface2)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "12px 16px", color: "var(--gold)", fontWeight: 700 }}>{ticket.id}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #4B80F0, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                              {ticket.user.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{ticket.user}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{ticket.category}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: pc.color, background: pc.bg, border: `1px solid ${pc.border}`, borderRadius: 6, padding: "3px 8px" }}>{ticket.priority}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: sc.color, background: sc.bg, borderRadius: 6, padding: "3px 8px" }}>{ticket.status}</span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{ticket.created}</td>
                        <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{ticket.lastReply}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {ticket.status === "Resolved" ? (
                              <button onClick={e => e.stopPropagation()} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 11, cursor: "pointer" }}>View</button>
                            ) : (
                              <>
                                <button onClick={e => { e.stopPropagation(); setSelectedTicket(ticket) }} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--gold)", background: "rgba(var(--gold-rgb),0.1)", color: "var(--gold)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Reply</button>
                                <button onClick={e => e.stopPropagation()} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 11, cursor: "pointer" }}>Close</button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Support Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Response time trend */}
            <div style={{ ...cardStyle }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 16 }}>Response Time Trend (7 days)</div>
              <svg width="100%" height="80" viewBox="0 0 300 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4A853" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#D4A853" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline fill="url(#rtGrad)" stroke="none" points="0,80 0,52 50,44 100,56 150,36 200,28 250,32 300,24 300,80" />
                <polyline fill="none" stroke="#D4A853" strokeWidth="2" points="0,52 50,44 100,56 150,36 200,28 250,32 300,24" />
                {[0,50,100,150,200,250,300].map((x,i) => (
                  <circle key={i} cx={x} cy={[52,44,56,36,28,32,24][i]} r="3" fill="#D4A853" />
                ))}
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <span key={d}>{d}</span>)}
              </div>
            </div>

            {/* Ticket volume by category */}
            <div style={{ ...cardStyle }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 12 }}>Volume by Category</div>
              {[
                { label: "Location Issue", val: 28, color: "#4B80F0" },
                { label: "Payment Failed", val: 22, color: "#EF4444" },
                { label: "SOS Not Working", val: 15, color: "#F97316" },
                { label: "Account Access", val: 18, color: "#10B981" },
                { label: "Feature Request", val: 17, color: "#8B5CF6" },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-secondary)", marginBottom: 3 }}>
                    <span>{item.label}</span><span>{item.val}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--bg-surface2)", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.val}%` }} transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                      style={{ height: "100%", background: item.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Ticket detail panel */}
        <AnimatePresence>
          {selectedTicket && (
            <motion.div key={selectedTicket.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
              style={{ width: 380, flexShrink: 0, ...cardStyle, display: "flex", flexDirection: "column", gap: 16, maxHeight: "85vh", overflowY: "auto" }}>
              {/* Panel header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "var(--gold)" }}>{selectedTicket.id}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{selectedTicket.category}</div>
                </div>
                <button onClick={() => setSelectedTicket(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                  <X size={18} />
                </button>
              </div>

              {/* User info */}
              <div style={{ background: "var(--bg-surface2)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #4B80F0, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                    {selectedTicket.user.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{selectedTicket.user}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{selectedTicket.plan} Plan</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}><Mail size={12} />{selectedTicket.email}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}><Phone size={12} />{selectedTicket.phone}</div>
              </div>

              {/* Priority + status */}
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Priority</div>
                  <select defaultValue={selectedTicket.priority} style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 12 }}>
                    <option>CRITICAL</option><option>High</option><option>Normal</option><option>Low</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Status</div>
                  <select defaultValue={selectedTicket.status} style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 12 }}>
                    <option>Open</option><option>In Progress</option><option>Resolved</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Issue Description</div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6, background: "var(--bg-surface2)", borderRadius: 8, padding: "10px 12px" }}>{selectedTicket.description}</p>
              </div>

              {/* Conversation */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Conversation Thread</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {CONVERSATION.map((msg, i) => (
                    <div key={i} style={{ background: "var(--bg-surface2)", borderRadius: 8, padding: "10px 12px", borderLeft: `3px solid ${msg.sender === "User" ? "#4B80F0" : msg.sender === "Support Bot" ? "#8B5CF6" : "#D4A853"}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: msg.sender === "User" ? "#4B80F0" : msg.sender === "Support Bot" ? "#8B5CF6" : "#D4A853" }}>{msg.sender}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{msg.time}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{msg.msg}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick reply templates */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Quick Replies</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {QUICK_REPLIES.map((qr, i) => (
                    <button key={i} onClick={() => setReplyText(qr)}
                      style={{ textAlign: "left", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", lineHeight: 1.4, transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--gold)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                      {qr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply textarea */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Your Reply</div>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="Type your reply..."
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: "var(--gold)", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Send Reply</button>
                  <button style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 13, cursor: "pointer" }}>Close Ticket</button>
                </div>
              </div>

              {/* Internal notes */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Internal Notes (not visible to user)</div>
                <textarea value={internalNote} onChange={e => setInternalNote(e.target.value)} rows={2} placeholder="Add internal note for team..."
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px dashed var(--border)", background: "rgba(245,158,11,0.04)", color: "var(--text-primary)", fontSize: 12, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
