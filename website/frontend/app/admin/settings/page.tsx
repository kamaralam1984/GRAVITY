'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save,
  Key,
  Bell,
  Shield,
  Users,
  Globe,
  Database,
  Mail,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
} from 'lucide-react'

/* ─────────────────────────── types ─────────────────────────── */
type Tab = "general" | "team" | "apikeys" | "notifications" | "security" | "data"

interface TeamMember {
  name: string
  email: string
  role: string
  lastActive: string
  status: string
}

interface ApiKey {
  name: string
  prefix: string
  created: string
  lastUsed: string
  permissions: string
}

/* ─────────────────────────── constants ─────────────────────────── */
const NAV_TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "general",       label: "General",        icon: <Globe size={16} /> },
  { id: "team",          label: "Team",            icon: <Users size={16} /> },
  { id: "apikeys",       label: "API Keys",        icon: <Key size={16} /> },
  { id: "notifications", label: "Notifications",   icon: <Bell size={16} /> },
  { id: "security",      label: "Security",        icon: <Shield size={16} /> },
  { id: "data",          label: "Data & Privacy",  icon: <Database size={16} /> },
]

const TEAM_MEMBERS: TeamMember[] = [
  { name: "Prateek Jain",  email: "prateek@trackalways.com", role: "Super Admin", lastActive: "Now",       status: "Active" },
  { name: "Anita Sharma",  email: "anita@trackalways.com",   role: "Admin",       lastActive: "2hr ago",   status: "Active" },
  { name: "Rohit Kumar",   email: "rohit@trackalways.com",   role: "Moderator",   lastActive: "Yesterday", status: "Active" },
  { name: "Sunita Patel",  email: "sunita@trackalways.com",  role: "Viewer",      lastActive: "3d ago",    status: "Active" },
]

const API_KEYS: ApiKey[] = [
  { name: "Mobile App Key",  prefix: "sk_live_4x...", created: "Jan 1",  lastUsed: "2min ago",  permissions: "Read" },
  { name: "Webhook Key",     prefix: "sk_live_8k...", created: "Feb 1",  lastUsed: "1hr ago",   permissions: "Read+Write" },
  { name: "Analytics Key",   prefix: "sk_live_2m...", created: "Mar 1",  lastUsed: "Yesterday", permissions: "Read" },
]

/* ─────────────────────────── sub-components ─────────────────────────── */

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none"
      style={{ backgroundColor: enabled ? "var(--gold)" : "var(--border-strong)" }}
      aria-checked={enabled}
      role="switch"
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300"
        style={{ transform: enabled ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  )
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  readOnly,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  type?: string
  placeholder?: string
  readOnly?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200"
        style={{
          background: "var(--bg-surface2)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
          cursor: readOnly ? "default" : "text",
        }}
        onFocus={(e) => { if (!readOnly) e.currentTarget.style.boxShadow = "0 0 0 2px rgba(var(--gold-rgb),0.35)" }}
        onBlur={(e) => { e.currentTarget.style.boxShadow = "none" }}
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 appearance-none"
        style={{
          background: "var(--bg-surface2)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

function SaveButton({ label = "Save Changes", onClick }: { label?: string; onClick?: () => void }) {
  const [saved, setSaved] = useState(false)
  const handleClick = () => {
    onClick?.()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200"
      style={{
        background: saved ? "var(--safe)" : "var(--gold)",
        color: "#fff",
      }}
    >
      <Save size={15} />
      {saved ? "Saved!" : label}
    </motion.button>
  )
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
      {children}
    </h3>
  )
}

/* ─────────────────────────── tab: General ─────────────────────────── */
function GeneralTab() {
  const [appName, setAppName] = useState("KVL Track Family Safety")
  const [company, setCompany] = useState("Trackalways Technologies Pvt Ltd")
  const [email, setEmail] = useState("support@trackalways.com")
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST)")
  const [maintenance, setMaintenance] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <SectionTitle>Application Info</SectionTitle>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <InputField label="App Name" value={appName} onChange={setAppName} />
          <InputField label="Company" value={company} onChange={setCompany} />
          <InputField label="Support Email" value={email} onChange={setEmail} type="email" />
          <SelectField
            label="Default Timezone"
            value={timezone}
            options={["Asia/Kolkata (IST)", "UTC", "America/New_York", "Europe/London", "Asia/Singapore"]}
            onChange={setTimezone}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>System Status</SectionTitle>
        <div className="flex items-center justify-between rounded-xl p-4" style={{ background: "var(--bg-surface2)", border: "1px solid var(--border)" }}>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Maintenance Mode</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {maintenance ? "Site is under maintenance — users see a maintenance page" : "Site is live and accessible to all users"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: maintenance ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
                color: maintenance ? "var(--sos)" : "var(--safe)",
              }}
            >
              {maintenance ? "Under Maintenance" : "Live"}
            </span>
            <Toggle enabled={maintenance} onToggle={() => setMaintenance(!maintenance)} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl p-4" style={{ background: "var(--bg-surface2)", border: "1px solid var(--border)" }}>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>App Version</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Current deployed version</p>
          </div>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: "rgba(var(--gold-rgb),0.12)", color: "var(--gold)" }}
          >
            v2.4.1 — Latest
          </span>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </div>
  )
}

/* ─────────────────────────── tab: Team ─────────────────────────── */
function TeamTab() {
  const [members, setMembers] = useState<TeamMember[]>(TEAM_MEMBERS)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("Admin")
  const [inviteSent, setInviteSent] = useState(false)

  const handleRevoke = (email: string) => {
    setMembers((prev) => prev.filter((m) => m.email !== email))
  }

  const handleInvite = () => {
    if (!inviteEmail) return
    setInviteSent(true)
    setTimeout(() => {
      setInviteSent(false)
      setShowInvite(false)
      setInviteEmail("")
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Team Members</SectionTitle>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold"
            style={{ background: "rgba(var(--gold-rgb),0.12)", color: "var(--gold)", border: "1px solid rgba(var(--gold-rgb),0.25)" }}
          >
            <Plus size={13} />
            Invite New Admin
          </motion.button>
        </div>

        <AnimatePresence>
          {showInvite && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-5"
            >
              <div
                className="rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-end"
                style={{ background: "var(--bg-surface2)", border: "1px solid var(--border)" }}
              >
                <div className="flex-1">
                  <InputField label="Email Address" value={inviteEmail} onChange={setInviteEmail} type="email" placeholder="colleague@trackalways.com" />
                </div>
                <div className="w-40">
                  <SelectField label="Role" value={inviteRole} options={["Super Admin", "Admin", "Moderator", "Viewer"]} onChange={setInviteRole} />
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleInvite}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold whitespace-nowrap"
                  style={{ background: inviteSent ? "var(--safe)" : "var(--gold)", color: "#fff" }}
                >
                  <Mail size={14} />
                  {inviteSent ? "Sent!" : "Send Invite"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--bg-surface2)", borderBottom: "1px solid var(--border)" }}>
                {["Name", "Email", "Role", "Last Active", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <motion.tr
                  key={m.email}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="transition-colors duration-150"
                  style={{
                    borderBottom: i < members.length - 1 ? "1px solid var(--border)" : "none",
                    background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(var(--gold-rgb),0.05)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{m.name}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{m.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: m.role === "Super Admin" ? "rgba(var(--gold-rgb),0.15)" : "rgba(75,128,240,0.12)",
                        color: m.role === "Super Admin" ? "var(--gold)" : "var(--primary)",
                      }}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>{m.lastActive}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.12)", color: "var(--safe)" }}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {m.role !== "Viewer" ? (
                        <button className="text-xs px-3 py-1 rounded-lg font-medium transition-colors" style={{ color: "var(--primary)", background: "rgba(75,128,240,0.10)" }}>
                          Edit
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRevoke(m.email)}
                          className="text-xs px-3 py-1 rounded-lg font-medium transition-colors"
                          style={{ color: "var(--sos)", background: "rgba(239,68,68,0.10)" }}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}

/* ─────────────────────────── tab: API Keys ─────────────────────────── */
function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKey[]>(API_KEYS)
  const [showModal, setShowModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyPerms, setNewKeyPerms] = useState({ read: true, write: false })
  const [newKeyExpiry, setNewKeyExpiry] = useState("Never")
  const [copied, setCopied] = useState<string | null>(null)
  const [showKey, setShowKey] = useState<string | null>(null)

  const handleCopy = (prefix: string) => {
    navigator.clipboard.writeText(prefix).catch(() => {})
    setCopied(prefix)
    setTimeout(() => setCopied(null), 1500)
  }

  const handleRevoke = (name: string) => {
    setKeys((prev) => prev.filter((k) => k.name !== name))
  }

  const handleGenerate = () => {
    if (!newKeyName) return
    const perms = newKeyPerms.read && newKeyPerms.write ? "Read+Write" : newKeyPerms.write ? "Write" : "Read"
    setKeys((prev) => [
      ...prev,
      { name: newKeyName, prefix: "sk_live_" + Math.random().toString(36).slice(2, 6) + "...", created: "Now", lastUsed: "Never", permissions: perms },
    ])
    setShowModal(false)
    setNewKeyName("")
    setNewKeyPerms({ read: true, write: false })
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>API Keys</SectionTitle>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold"
            style={{ background: "rgba(var(--gold-rgb),0.12)", color: "var(--gold)", border: "1px solid rgba(var(--gold-rgb),0.25)" }}
          >
            <Plus size={13} />
            Generate New Key
          </motion.button>
        </div>

        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--bg-surface2)", borderBottom: "1px solid var(--border)" }}>
                {["Key Name", "Prefix", "Created", "Last Used", "Permissions", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((k, i) => (
                <motion.tr
                  key={k.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    borderBottom: i < keys.length - 1 ? "1px solid var(--border)" : "none",
                    background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(var(--gold-rgb),0.05)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}
                >
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>{k.name}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs px-2 py-1 rounded-lg" style={{ background: "var(--bg-surface3)", color: "var(--text-secondary)" }}>
                      {showKey === k.name ? "sk_live_••••••••••••" : k.prefix}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{k.created}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{k.lastUsed}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: k.permissions === "Read+Write" ? "rgba(75,128,240,0.12)" : "rgba(var(--gold-rgb),0.12)",
                        color: k.permissions === "Read+Write" ? "var(--primary)" : "var(--gold)",
                      }}
                    >
                      {k.permissions}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => setShowKey(showKey === k.name ? null : k.name)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: "var(--bg-surface2)", color: "var(--text-muted)" }}
                        title="Toggle visibility"
                      >
                        {showKey === k.name ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button
                        onClick={() => handleCopy(k.prefix)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{
                          background: copied === k.prefix ? "rgba(16,185,129,0.12)" : "var(--bg-surface2)",
                          color: copied === k.prefix ? "var(--safe)" : "var(--text-muted)",
                        }}
                        title="Copy key"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => handleRevoke(k.name)}
                        className="text-xs px-3 py-1 rounded-lg font-medium"
                        style={{ color: "var(--sos)", background: "rgba(239,68,68,0.10)" }}
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Generate Key Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Generate New API Key</h3>
                <button onClick={() => setShowModal(false)} className="text-xl leading-none" style={{ color: "var(--text-muted)" }}>×</button>
              </div>
              <InputField label="Key Name" value={newKeyName} onChange={setNewKeyName} placeholder="e.g. Production App Key" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Permissions</p>
                <div className="flex gap-4">
                  {(["read", "write"] as const).map((p) => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--text-primary)" }}>
                      <input
                        type="checkbox"
                        checked={newKeyPerms[p]}
                        onChange={(e) => setNewKeyPerms((prev) => ({ ...prev, [p]: e.target.checked }))}
                        className="rounded"
                        style={{ accentColor: "var(--gold)" }}
                      />
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
              <SelectField label="Expiry" value={newKeyExpiry} options={["Never", "30 days", "90 days", "1 year"]} onChange={setNewKeyExpiry} />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ color: "var(--text-muted)", background: "var(--bg-surface2)" }}>
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleGenerate}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: "var(--gold)", color: "#fff" }}
                >
                  <Key size={14} />
                  Generate Key
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────── tab: Notifications ─────────────────────────── */
function NotificationsTab() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [webhookEnabled, setWebhookEnabled] = useState(false)
  const [sosEmail, setSosEmail] = useState(true)
  const [deviceOffline, setDeviceOffline] = useState(true)
  const [lowBattery, setLowBattery] = useState(true)
  const [geofenceBreach, setGeofenceBreach] = useState(true)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [smsSender, setSmsSender] = useState("+91-9876543210")

  const NotifRow = ({
    label,
    desc,
    value,
    onToggle,
  }: { label: string; desc: string; value: boolean; onToggle: () => void }) => (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
      </div>
      <Toggle enabled={value} onToggle={onToggle} />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <SectionTitle>Email Alerts</SectionTitle>
        <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Enable Email Notifications</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Master toggle for all email alerts</p>
          </div>
          <Toggle enabled={emailAlerts} onToggle={() => setEmailAlerts(!emailAlerts)} />
        </div>
        <NotifRow label="SOS Alerts" desc="Immediate email on SOS trigger" value={sosEmail} onToggle={() => setSosEmail(!sosEmail)} />
        <NotifRow label="Device Offline" desc="Alert when device goes offline > 15 min" value={deviceOffline} onToggle={() => setDeviceOffline(!deviceOffline)} />
        <NotifRow label="Low Battery" desc="Alert when device battery < 15%" value={lowBattery} onToggle={() => setLowBattery(!lowBattery)} />
        <NotifRow label="Geofence Breach" desc="Alert on geofence entry/exit" value={geofenceBreach} onToggle={() => setGeofenceBreach(!geofenceBreach)} />
      </SectionCard>

      <SectionCard>
        <SectionTitle>SMS Alerts</SectionTitle>
        <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Enable SMS Notifications</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Send SMS for critical alerts only</p>
          </div>
          <Toggle enabled={smsAlerts} onToggle={() => setSmsAlerts(!smsAlerts)} />
        </div>
        <div className="mt-2">
          <InputField label="SMS Sender Number" value={smsSender} onChange={setSmsSender} />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Webhook</SectionTitle>
        <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Enable Webhook</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>POST events to your endpoint</p>
          </div>
          <Toggle enabled={webhookEnabled} onToggle={() => setWebhookEnabled(!webhookEnabled)} />
        </div>
        <AnimatePresence>
          {webhookEnabled && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <InputField label="Webhook URL" value={webhookUrl} onChange={setWebhookUrl} placeholder="https://your-server.com/webhook/gravity" />
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </div>
  )
}

/* ─────────────────────────── tab: Security ─────────────────────────── */
function SecurityTab() {
  const [twoFA, setTwoFA] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState("4hr")
  const [loginAttempts, setLoginAttempts] = useState("5")
  const [ipWhitelist, setIpWhitelist] = useState("192.168.1.0/24\n10.0.0.0/8")
  const [auditRunning, setAuditRunning] = useState(false)

  const handleAudit = () => {
    setAuditRunning(true)
    setTimeout(() => setAuditRunning(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <SectionTitle>Authentication</SectionTitle>
        <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Two-Factor Authentication (2FA)</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Require TOTP code on every admin login</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: twoFA ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: twoFA ? "var(--safe)" : "var(--sos)" }}>
              {twoFA ? "Enabled" : "Disabled"}
            </span>
            <Toggle enabled={twoFA} onToggle={() => setTwoFA(!twoFA)} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SelectField
            label="Session Timeout"
            value={sessionTimeout}
            options={["30min", "1hr", "4hr", "8hr"]}
            onChange={setSessionTimeout}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Failed Logins Before Lock
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={loginAttempts}
              onChange={(e) => setLoginAttempts(e.target.value)}
              className="rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: "var(--bg-surface2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px rgba(var(--gold-rgb),0.35)" }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = "none" }}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>IP Whitelist</SectionTitle>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Only these IP ranges can access the admin panel. One CIDR per line.</p>
        <textarea
          value={ipWhitelist}
          onChange={(e) => setIpWhitelist(e.target.value)}
          rows={5}
          placeholder="192.168.1.0/24"
          className="w-full rounded-xl px-4 py-3 text-sm font-mono outline-none resize-none"
          style={{ background: "var(--bg-surface2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px rgba(var(--gold-rgb),0.35)" }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = "none" }}
        />
      </SectionCard>

      <SectionCard>
        <SectionTitle>Security Audit</SectionTitle>
        <div className="flex items-center justify-between rounded-xl p-4" style={{ background: "var(--bg-surface2)", border: "1px solid var(--border)" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Last Security Audit</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>June 1, 2025 — No critical issues found</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleAudit}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: auditRunning ? "rgba(16,185,129,0.12)" : "rgba(var(--gold-rgb),0.12)", color: auditRunning ? "var(--safe)" : "var(--gold)", border: "1px solid rgba(var(--gold-rgb),0.2)" }}
          >
            <motion.span animate={auditRunning ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 1, repeat: auditRunning ? Infinity : 0 }}>
              <RefreshCw size={14} />
            </motion.span>
            {auditRunning ? "Running..." : "Run Audit"}
          </motion.button>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </div>
  )
}

/* ─────────────────────────── tab: Data & Privacy ─────────────────────────── */
function DataTab() {
  const [retention, setRetention] = useState("30 days")
  const [gdprUserId, setGdprUserId] = useState("")
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false)
  const [exportDone, setExportDone] = useState(false)
  const [gdprDone, setGdprDone] = useState(false)
  const [purged, setPurged] = useState(false)

  const handleExport = () => {
    setExportDone(true)
    setTimeout(() => setExportDone(false), 2000)
  }

  const handleGdpr = () => {
    if (!gdprUserId) return
    setGdprDone(true)
    setTimeout(() => setGdprDone(false), 2000)
  }

  const handlePurge = () => {
    setPurged(true)
    setShowPurgeConfirm(false)
    setTimeout(() => setPurged(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <SectionTitle>Data Retention</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <SelectField
            label="Location History Retention"
            value={retention}
            options={["7 days", "14 days", "30 days", "60 days", "90 days", "1 year"]}
            onChange={setRetention}
          />
          <div className="flex flex-col justify-end">
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Account data on delete</p>
            <p className="text-sm font-medium px-4 py-2.5 rounded-xl" style={{ background: "var(--bg-surface2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              Retained 30 days, then purged
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Data Export</SectionTitle>
        <div className="flex items-center justify-between rounded-xl p-4" style={{ background: "var(--bg-surface2)", border: "1px solid var(--border)" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Export All Data</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Download all platform data as a ZIP of CSV files</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: exportDone ? "rgba(16,185,129,0.12)" : "rgba(var(--gold-rgb),0.12)", color: exportDone ? "var(--safe)" : "var(--gold)", border: "1px solid rgba(var(--gold-rgb),0.2)" }}
          >
            <Database size={14} />
            {exportDone ? "Exported!" : "Export CSV"}
          </motion.button>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>GDPR Tools</SectionTitle>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Download all data for a specific user by their User ID.</p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <InputField label="User ID" value={gdprUserId} onChange={setGdprUserId} placeholder="usr_xxxxxxxxxxxxxxxx" />
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleGdpr}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold whitespace-nowrap"
            style={{ background: gdprDone ? "var(--safe)" : "var(--primary)", color: "#fff" }}
          >
            <Database size={14} />
            {gdprDone ? "Downloaded!" : "Download Data"}
          </motion.button>
        </div>
      </SectionCard>

      {/* Danger Zone */}
      <div className="rounded-2xl p-6" style={{ background: "rgba(239,68,68,0.05)", border: "1.5px solid rgba(239,68,68,0.3)" }}>
        <h3 className="mb-1 text-sm font-bold uppercase tracking-widest" style={{ color: "var(--sos)" }}>Danger Zone</h3>
        <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>Irreversible actions. Proceed with caution.</p>

        <div className="flex items-center justify-between rounded-xl p-4" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Purge Inactive Accounts</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Permanently delete all accounts inactive for more than 180 days</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowPurgeConfirm(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: purged ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.15)", color: purged ? "var(--safe)" : "var(--sos)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <Trash2 size={14} />
            {purged ? "Purged!" : "Purge Accounts"}
          </motion.button>
        </div>

        <AnimatePresence>
          {showPurgeConfirm && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mt-4 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--sos)" }}>
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowPurgeConfirm(false)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "var(--bg-surface2)", color: "var(--text-muted)" }}>
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handlePurge}
                  className="px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: "var(--sos)", color: "#fff" }}
                >
                  Yes, Purge
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─────────────────────────── main page ─────────────────────────── */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general")

  const tabVariants = {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: "easeOut" } },
    exit: { opacity: 0, x: -16, transition: { duration: 0.15 } },
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Page header */}
      <div className="px-6 pt-8 pb-2">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Manage your KVL Track admin panel configuration</p>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Left sidebar nav */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-full lg:w-56 flex-shrink-0"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 text-left relative"
                style={{
                  background: activeTab === tab.id ? "rgba(var(--gold-rgb),0.10)" : "transparent",
                  color: activeTab === tab.id ? "var(--gold)" : "var(--text-secondary)",
                  borderLeft: activeTab === tab.id ? "3px solid var(--gold)" : "3px solid transparent",
                }}
              >
                <span style={{ color: activeTab === tab.id ? "var(--gold)" : "var(--text-muted)" }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </motion.aside>

        {/* Right content panel */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} variants={tabVariants} initial="initial" animate="animate" exit="exit">
              {activeTab === "general"       && <GeneralTab />}
              {activeTab === "team"          && <TeamTab />}
              {activeTab === "apikeys"       && <ApiKeysTab />}
              {activeTab === "notifications" && <NotificationsTab />}
              {activeTab === "security"      && <SecurityTab />}
              {activeTab === "data"          && <DataTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
