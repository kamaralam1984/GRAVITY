'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Shield,
  AlertTriangle,
  Eye,
  Lock,
  User,
  Globe,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  Terminal,
  Database,
  X,
  Plus,
} from 'lucide-react'

const SECURITY_ALERTS = [
  { title: "Multiple failed admin login attempts", detail: "5 attempts from IP 203.0.113.45", time: "30min ago", action: "Block IP", severity: "critical" },
  { title: "Unusual API call volume detected", detail: "10,000 req/min from device DEV-089", time: "2h ago", action: "Investigate", severity: "high" },
  { title: "Admin account password changed", detail: "Admin Rohit Kumar changed password", time: "3h ago", action: "View", severity: "info" },
]

const AUDIT_LOGS = [
  { time: "11:45:23", type: "Admin Login",   actor: "kamaralamjdu@gmail.com", action: "Signed in",               resource: "Admin Portal",  ip: "192.168.1.1",   status: "Success" },
  { time: "11:43:12", type: "Family Update", actor: "System",                 action: "Auto-renewed subscription", resource: "FAM-002",       ip: "Internal",      status: "Success" },
  { time: "11:40:05", type: "SOS Resolved",  actor: "Admin Anita",            action: "Resolved alert",           resource: "SOS-001",       ip: "192.168.1.2",   status: "Success" },
  { time: "11:35:44", type: "Failed Login",  actor: "unknown@evil.com",       action: "Login attempt",            resource: "Admin Portal",  ip: "203.0.113.45",  status: "Failed" },
  { time: "11:30:21", type: "Data Export",   actor: "Admin Rohit",            action: "Exported CSV",             resource: "Families",      ip: "192.168.1.3",   status: "Success" },
  { time: "11:25:18", type: "API Call",      actor: "DEV-089",                action: "Location update",          resource: "Locations API", ip: "49.205.0.1",    status: "Success" },
  { time: "11:20:44", type: "Admin Login",   actor: "admin@gravity.in",       action: "Signed in",               resource: "Admin Portal",  ip: "192.168.1.4",   status: "Success" },
  { time: "11:18:09", type: "Data Change",   actor: "Admin Priya",            action: "Updated family plan",     resource: "FAM-019",       ip: "192.168.1.2",   status: "Success" },
  { time: "11:14:33", type: "Auth Event",    actor: "user_9982",              action: "2FA enabled",             resource: "User Account",  ip: "103.21.58.12",  status: "Success" },
  { time: "11:10:07", type: "Failed Login",  actor: "bot@spam.com",           action: "Login attempt",            resource: "Admin Portal",  ip: "198.51.100.22", status: "Failed" },
  { time: "11:05:51", type: "SOS Triggered", actor: "System",                 action: "SOS alert created",       resource: "SOS-002",       ip: "Internal",      status: "Warning" },
  { time: "11:01:22", type: "API Call",      actor: "DEV-045",                action: "Geofence check",          resource: "Geofence API",  ip: "122.173.0.9",   status: "Success" },
  { time: "10:58:44", type: "Data Export",   actor: "Admin Rohit",            action: "Exported PDF report",     resource: "Analytics",     ip: "192.168.1.3",   status: "Success" },
  { time: "10:52:18", type: "Auth Event",    actor: "admin@gravity.in",       action: "Permission updated",      resource: "Admin Role",    ip: "192.168.1.4",   status: "Success" },
  { time: "10:47:55", type: "Data Change",   actor: "Admin Anita",            action: "Deleted inactive device", resource: "DEV-001",       ip: "192.168.1.2",   status: "Success" },
]

const BLOCKED_IPS = [
  { ip: "203.0.113.45", reason: "Brute force login", blockedAt: "30min ago" },
  { ip: "198.51.100.22", reason: "Repeated login failures", blockedAt: "2d ago" },
  { ip: "185.220.101.34", reason: "Known malicious actor", blockedAt: "1w ago" },
]

const LOG_TABS = ["All Events", "Auth Events", "Admin Actions", "API Calls", "Data Changes", "Security"]

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  "Success": { color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  "Failed":  { color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
  "Warning": { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
}

const TYPE_ICON: Record<string, React.ElementType> = {
  "Admin Login": User,
  "Family Update": Database,
  "SOS Resolved": Shield,
  "Failed Login": AlertTriangle,
  "Data Export": Download,
  "API Call": Terminal,
  "Auth Event": Lock,
  "Data Change": Database,
  "SOS Triggered": AlertTriangle,
}

export default function AuditLogsPage() {
  const [activeTab, setActiveTab] = useState("All Events")
  const [search, setSearch] = useState("")
  const [newBlockIP, setNewBlockIP] = useState("")
  const [blockedIPs, setBlockedIPs] = useState(BLOCKED_IPS)
  const [retention, setRetention] = useState("90")
  const [liveIndicator, setLiveIndicator] = useState(true)

  const filtered = AUDIT_LOGS.filter(log => {
    if (search && !log.actor.toLowerCase().includes(search.toLowerCase()) && !log.type.toLowerCase().includes(search.toLowerCase())) return false
    if (activeTab === "All Events") return true
    if (activeTab === "Auth Events") return log.type.includes("Login") || log.type === "Auth Event"
    if (activeTab === "Admin Actions") return log.actor.startsWith("Admin")
    if (activeTab === "API Calls") return log.type === "API Call"
    if (activeTab === "Data Changes") return log.type === "Data Change" || log.type === "Data Export"
    if (activeTab === "Security") return log.status === "Failed" || log.status === "Warning"
    return true
  })

  const cardStyle = {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "20px 24px",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1300 }}>
      <Link href="/" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
        ← Back to Gravity Home
      </Link>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Audit Logs
            </h1>
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#10B981" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
              LIVE
            </motion.div>
          </div>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 14 }}>
            Security and activity monitoring for all admin and user actions
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none", background: "var(--gold)", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {[
          { label: "Total Events Today", value: "45,234", sub: "normal operations", color: "#10B981", icon: Terminal },
          { label: "Security Alerts", value: "3", sub: "require attention", color: "#F97316", icon: AlertTriangle },
          { label: "Failed Logins", value: "12", sub: "last 24 hours", color: "#F59E0B", icon: Lock },
          { label: "Admin Actions", value: "234", sub: "actions logged", color: "#4B80F0", icon: User },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: s.color, marginTop: 1 }}>{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Security Alerts */}
      <div style={{ ...cardStyle, border: "1px solid rgba(249,115,22,0.4)", background: "rgba(249,115,22,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <AlertTriangle size={18} style={{ color: "#F97316" }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: "#F97316" }}>Security Alerts</span>
          <span style={{ fontSize: 11, background: "rgba(249,115,22,0.2)", color: "#F97316", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>3 Active</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SECURITY_ALERTS.map((alert, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: alert.severity === "critical" ? "rgba(239,68,68,0.15)" : alert.severity === "high" ? "rgba(249,115,22,0.15)" : "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AlertTriangle size={16} style={{ color: alert.severity === "critical" ? "#EF4444" : alert.severity === "high" ? "#F97316" : "#3B82F6" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{alert.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{alert.detail}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} />{alert.time}</span>
                <button style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: alert.severity === "critical" ? "#EF4444" : alert.severity === "high" ? "#F97316" : "#3B82F6", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {alert.action}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Log filter tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {LOG_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
              borderColor: activeTab === tab ? "var(--gold)" : "var(--border)",
              background: activeTab === tab ? "rgba(var(--gold-rgb),0.12)" : "var(--bg-surface)",
              color: activeTab === tab ? "var(--gold)" : "var(--text-secondary)" }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ position: "relative", maxWidth: 500 }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by actor, event type..."
          style={{ width: "100%", padding: "9px 14px 9px 34px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
      </div>

      {/* Audit log table */}
      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface2)" }}>
                {["Timestamp", "Event Type", "Actor", "Action", "Resource", "IP Address", "Status", "Details"].map(col => (
                  <th key={col} style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => {
                const sc = STATUS_CONFIG[log.status]
                const IconComp = TYPE_ICON[log.type] || Globe
                return (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.025 }}
                    style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-surface2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "11px 16px", color: "var(--text-muted)", fontFamily: "monospace", fontSize: 12 }}>{log.time}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <IconComp size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                        <span style={{ color: "var(--text-primary)", fontWeight: 500, whiteSpace: "nowrap" }}>{log.type}</span>
                      </div>
                    </td>
                    <td style={{ padding: "11px 16px", color: "var(--text-secondary)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.actor}</td>
                    <td style={{ padding: "11px 16px", color: "var(--text-secondary)" }}>{log.action}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ background: "var(--bg-surface2)", color: "var(--text-muted)", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontFamily: "monospace" }}>{log.resource}</span>
                    </td>
                    <td style={{ padding: "11px 16px", color: "var(--text-muted)", fontFamily: "monospace", fontSize: 12 }}>{log.ip}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: sc.color, background: sc.bg, borderRadius: 6, padding: "3px 8px" }}>{log.status}</span>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <button style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        <Eye size={11} /> {log.status === "Failed" ? "Block" : "View"}
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* IP Blocklist */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
              <Shield size={16} style={{ color: "#EF4444" }} />
              IP Blocklist
            </div>
            <span style={{ fontSize: 11, background: "rgba(239,68,68,0.12)", color: "#EF4444", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>{blockedIPs.length} Blocked</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {blockedIPs.map((entry, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-surface2)", borderRadius: 8, padding: "10px 12px" }}>
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{entry.ip}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{entry.reason} · {entry.blockedAt}</div>
                </div>
                <button onClick={() => setBlockedIPs(blockedIPs.filter((_, j) => j !== i))}
                  style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.08)", color: "#10B981", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                  Unblock
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input value={newBlockIP} onChange={e => setNewBlockIP(e.target.value)} placeholder="Enter IP address to block..."
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, outline: "none" }} />
            <button onClick={() => { if (newBlockIP) { setBlockedIPs([...blockedIPs, { ip: newBlockIP, reason: "Manually blocked", blockedAt: "just now" }]); setNewBlockIP("") } }}
              style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#EF4444", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Plus size={14} /> Block
            </button>
          </div>
        </div>

        {/* Log Retention Settings */}
        <div style={{ ...cardStyle }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Database size={16} style={{ color: "#4B80F0" }} />
            Log Retention Settings
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--bg-surface2)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Current Retention Period</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>90 Days</div>
              <div style={{ fontSize: 12, color: "#10B981", marginTop: 2 }}>Logs older than 90 days are automatically archived</div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Change Retention Period</div>
              <select value={retention} onChange={e => setRetention(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-surface2)", color: "var(--text-primary)", fontSize: 13, marginBottom: 10 }}>
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days (recommended)</option>
                <option value="180">180 Days</option>
                <option value="365">1 Year</option>
              </select>
              <button style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "var(--gold)", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Apply Retention Policy
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Total Log Size", value: "2.4 GB" },
                { label: "Oldest Log", value: "89 days ago" },
                { label: "Logs Archived", value: "1,24,532" },
                { label: "Last Purge", value: "3 days ago" },
              ].map((stat, i) => (
                <div key={i} style={{ background: "var(--bg-surface2)", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{stat.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
