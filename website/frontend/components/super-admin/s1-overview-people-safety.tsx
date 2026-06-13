'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, AlertTriangle, Users, Zap, Shield, Heart, Star,
  CheckCircle, XCircle, Clock, MapPin, Phone, CreditCard,
  Bell, Search, Filter, RefreshCw, Eye, MoreHorizontal,
  TrendingUp, TrendingDown, Minus, MessageSquare, Send,
  Cpu, Database, Server, Wifi, Package, Globe, ArrowRight,
  UserCheck, UserX, AlertCircle, FileText, BarChart2, Map,
  ChevronDown, ChevronUp, Flag, Siren, Mail
} from 'lucide-react'

// ─── shared helpers ───────────────────────────────────────────────────────────

const badge = (label: string, color: string) => (
  <span style={{
    background: `${color}1a`,
    color,
    border: `1px solid ${color}33`,
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 99,
    whiteSpace: 'nowrap' as const,
  }}>{label}</span>
)

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div style={{ marginBottom: 24 }}>
    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>{subtitle}</p>
  </div>
)

const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 20,
    ...style,
  }}>{children}</div>
)

const StatCard = ({
  label,
  value,
  sub,
  subColor = '#10B981',
  icon: Icon,
  iconColor = 'var(--gold)',
}: {
  label: string
  value: string | number
  sub?: string
  subColor?: string
  icon?: React.ElementType
  iconColor?: string
}) => (
  <div style={{
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 20,
  }}>
    {Icon && (
      <div style={{ marginBottom: 10 }}>
        <Icon size={18} color={iconColor} />
      </div>
    )}
    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: subColor, marginTop: 6 }}>{sub}</div>}
  </div>
)

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) => (
  <input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      flex: 1,
      background: 'var(--bg-surface2)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: '6px 12px',
      color: 'var(--text-primary)',
      fontSize: 13,
      outline: 'none',
      minWidth: 0,
    }}
  />
)

const FilterBtn = ({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) => (
  <button
    onClick={onClick}
    style={{
      background: active ? 'var(--gold)' : 'var(--bg-surface2)',
      color: active ? '#000' : 'var(--text-secondary)',
      border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
      borderRadius: 6,
      padding: '5px 12px',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      whiteSpace: 'nowrap' as const,
    }}
  >{children}</button>
)

const TH = ({ children, right = false }: { children: React.ReactNode; right?: boolean }) => (
  <th style={{
    padding: '10px 20px',
    textAlign: right ? 'right' : 'left',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap' as const,
  }}>{children}</th>
)

const TD = ({
  children,
  right = false,
  muted = false,
}: {
  children: React.ReactNode
  right?: boolean
  muted?: boolean
}) => (
  <td style={{
    padding: '12px 20px',
    fontSize: 13,
    color: muted ? 'var(--text-muted)' : 'var(--text-primary)',
    textAlign: right ? 'right' : 'left',
    whiteSpace: 'nowrap' as const,
  }}>{children}</td>
)

// ─── 1. LiveOperationsSection ─────────────────────────────────────────────────

const allEvents = [
  { time: '10:47:02', event: 'SOS Triggered', user: 'Priya Sharma', location: 'Mumbai', status: 'SOS', id: 1 },
  { time: '10:47:01', event: 'User Joined Family', user: 'Arjun Mehta', location: 'Delhi', status: 'Auth', id: 2 },
  { time: '10:46:58', event: 'Payment Received', user: 'Kavya Reddy', location: 'Hyderabad', status: 'Payments', id: 3 },
  { time: '10:46:55', event: 'Geofence Breach', user: 'Rahul Gupta', location: 'Pune', status: 'SOS', id: 4 },
  { time: '10:46:52', event: 'Device Offline', user: 'Sneha Iyer', location: 'Chennai', status: 'Auth', id: 5 },
  { time: '10:46:48', event: 'SOS Resolved', user: 'Vikram Singh', location: 'Bangalore', status: 'SOS', id: 6 },
  { time: '10:46:45', event: 'Subscription Upgraded', user: 'Meera Nair', location: 'Mumbai', status: 'Payments', id: 7 },
  { time: '10:46:41', event: 'New User Signup', user: 'Aditya Kumar', location: 'Kolkata', status: 'Auth', id: 8 },
  { time: '10:46:38', event: 'Family Circle Created', user: 'Pooja Verma', location: 'Delhi', status: 'Auth', id: 9 },
  { time: '10:46:34', event: 'Payment Failed', user: 'Suresh Babu', location: 'Hyderabad', status: 'Payments', id: 10 },
  { time: '10:46:30', event: 'SOS Triggered', user: 'Anita Desai', location: 'Ahmedabad', status: 'SOS', id: 11 },
  { time: '10:46:27', event: 'Location Shared', user: 'Ravi Shankar', location: 'Jaipur', status: 'Auth', id: 12 },
  { time: '10:46:23', event: 'Refund Processed', user: 'Divya Pillai', location: 'Kochi', status: 'Payments', id: 13 },
  { time: '10:46:19', event: 'Child School Arrived', user: 'Neha Joshi', location: 'Pune', status: 'Auth', id: 14 },
  { time: '10:46:15', event: 'Fall Alert — Elderly', user: 'Ramesh Yadav', location: 'Lucknow', status: 'SOS', id: 15 },
  { time: '10:46:11', event: 'Device Online', user: 'Sunita Rao', location: 'Mumbai', status: 'Auth', id: 16 },
  { time: '10:46:08', event: 'Annual Plan Purchased', user: 'Manish Shah', location: 'Surat', status: 'Payments', id: 17 },
  { time: '10:46:05', event: 'Panic Button Press', user: 'Lalita Patel', location: 'Vadodara', status: 'SOS', id: 18 },
  { time: '10:46:01', event: 'OTP Verified', user: 'Kiran Bhat', location: 'Bangalore', status: 'Auth', id: 19 },
  { time: '10:45:58', event: 'Safe Arrival Alert', user: 'Preethi Varma', location: 'Chennai', status: 'Auth', id: 20 },
]

const statusColor: Record<string, string> = {
  SOS: '#EF4444',
  Payments: '#10B981',
  Auth: '#3B82F6',
  All: 'var(--gold)',
}

export function LiveOperationsSection() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 3000)
    return () => clearInterval(t)
  }, [])

  const filtered = allEvents.filter(e => {
    const matchFilter = filter === 'All' || e.status === filter
    const matchSearch =
      search === '' ||
      e.user.toLowerCase().includes(search.toLowerCase()) ||
      e.event.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div>
      <SectionHeader
        title="Live Operations"
        subtitle="Real-time platform activity feed — refreshes every 3 seconds"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Users Online Now" value="1,83,421" sub="+847 this hour" icon={Users} />
        <StatCard label="Active SOS" value="12" sub="3 critical" subColor="#EF4444" icon={AlertTriangle} iconColor="#EF4444" />
        <StatCard label="New Signups / hr" value="847" sub="+12.3% vs yesterday" icon={Activity} />
        <StatCard label="API Calls / min" value="24.3k" sub="99.99% success" icon={Zap} iconColor="#3B82F6" />
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap' as const,
        }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search events, users, locations..." />
          {['All', 'SOS', 'Payments', 'Auth'].map(f => (
            <FilterBtn key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</FilterBtn>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <motion.div
              animate={{ rotate: tick * 360 }}
              transition={{ duration: 0.5 }}
            >
              <RefreshCw size={13} color="#10B981" />
            </motion.div>
            <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>LIVE</span>
          </div>
        </div>

        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)', position: 'sticky' as const, top: 0, zIndex: 1 }}>
                <TH>Time</TH>
                <TH>Event</TH>
                <TH>User</TH>
                <TH>Location</TH>
                <TH>Status</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <TD muted>{row.time}</TD>
                  <TD>{row.event}</TD>
                  <TD>{row.user}</TD>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} color="var(--text-muted)" />
                      {row.location}
                    </div>
                  </td>
                  <TD>{badge(row.status, statusColor[row.status])}</TD>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 2. AICopilotSection ──────────────────────────────────────────────────────

const chatHistory = [
  {
    role: 'user',
    text: 'Show me users with 3+ SOS in the last 7 days.',
    time: '10:30 AM',
  },
  {
    role: 'ai',
    text: 'Found 47 users with 3+ SOS triggers in the past 7 days. Top concern: Priya Sharma (Mumbai) — 6 SOS events, mostly between 10 PM–1 AM. I recommend flagging for welfare check. Shall I generate the full report?',
    time: '10:30 AM',
  },
  {
    role: 'user',
    text: 'What is the revenue forecast for next quarter?',
    time: '10:35 AM',
  },
  {
    role: 'ai',
    text: 'Based on current ARR of ₹4.2Cr and 23% MoM growth, Q3 forecast is ₹6.1–6.8Cr. Premium plan upgrades are the primary driver (+41%). Churn risk is low at 2.1%. Confidence: 91%.',
    time: '10:35 AM',
  },
  {
    role: 'user',
    text: 'Detect any anomalies in device connectivity this week.',
    time: '10:41 AM',
  },
  {
    role: 'ai',
    text: 'Detected 3 anomalies: (1) Sudden 18% spike in device-offline events in Chennai on Tuesday 2AM — possible network outage. (2) 94 devices in Hyderabad reporting GPS drift > 500m. (3) 12 devices sending duplicate heartbeats — possible firmware bug. Action items ready.',
    time: '10:41 AM',
  },
]

const quickInsights = [
  { label: 'Platform Health', value: '98.7%', color: '#10B981', sub: 'All systems nominal' },
  { label: 'Safety Score Avg', value: '87.4', color: 'var(--gold)', sub: '+1.2 pts this week' },
  { label: 'Churn Risk Users', value: '1,203', color: '#F59E0B', sub: 'Needs attention' },
  { label: 'Revenue Today', value: '₹3.4L', color: '#10B981', sub: '+18% vs yesterday' },
]

const quickActions = [
  { label: 'Generate Safety Report', icon: FileText, color: '#3B82F6' },
  { label: 'Find High-Risk Users', icon: AlertTriangle, color: '#EF4444' },
  { label: 'Revenue Forecast', icon: TrendingUp, color: '#10B981' },
  { label: 'Anomaly Detection', icon: Cpu, color: '#F59E0B' },
]

export function AICopilotSection() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(chatHistory)
  const bottomRef = useRef<HTMLDivElement>(null)

  const send = () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    const aiMsg = {
      role: 'ai',
      text: 'Analyzing your query across 1,83,421 active users and 4.2M data points... Based on current platform data, I have identified 3 key insights relevant to your query. Shall I generate a detailed report?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg, aiMsg])
    setInput('')
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  return (
    <div>
      <SectionHeader
        title="AI Copilot"
        subtitle="Intelligent assistant for platform insights, anomaly detection and forecasts"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="AI Queries Today" value="1,247" sub="+23% vs yesterday" icon={MessageSquare} />
        <StatCard label="Avg Response Time" value="0.8s" sub="Target: <2s" icon={Zap} iconColor="#10B981" />
        <StatCard label="Accuracy Rate" value="94.2%" sub="+0.4% this week" icon={CheckCircle} iconColor="#10B981" />
        <StatCard label="Reports Generated" value="89" sub="Today" icon={FileText} iconColor="#3B82F6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {/* Chat */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column' as const,
          overflow: 'hidden',
          minHeight: 420,
        }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Gravity AI Copilot</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>GPT-4o powered</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  background: m.role === 'user' ? 'var(--gold)' : 'var(--bg-surface2)',
                  color: m.role === 'user' ? '#000' : 'var(--text-primary)',
                  border: `1px solid ${m.role === 'user' ? 'var(--gold)' : 'var(--border)'}`,
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  padding: '10px 14px',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}>
                  {m.text}
                  <div style={{ fontSize: 10, color: m.role === 'user' ? 'rgba(0,0,0,0.5)' : 'var(--text-muted)', marginTop: 4 }}>{m.time}</div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask the AI anything about your platform..."
              style={{
                flex: 1,
                background: 'var(--bg-surface2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              onClick={send}
              style={{
                background: 'var(--gold)',
                border: 'none',
                borderRadius: 8,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Send size={14} color="#000" />
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {quickActions.map(a => (
                <button key={a.label} style={{
                  background: 'var(--bg-surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  fontWeight: 500,
                  textAlign: 'left' as const,
                }}>
                  <a.icon size={14} color={a.color} />
                  {a.label}
                  <ArrowRight size={11} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
                </button>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Insights</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quickInsights.map(q => (
                <div key={q.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.label}</div>
                    <div style={{ fontSize: 10, color: q.color, marginTop: 1 }}>{q.sub}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: q.color }}>{q.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── 3. PlatformStatusSection ─────────────────────────────────────────────────

const services = [
  { name: 'API Gateway', uptime: 99.99, status: 'ok', latency: '42ms' },
  { name: 'Database', uptime: 99.95, status: 'ok', latency: '8ms' },
  { name: 'Location Service', uptime: 100, status: 'ok', latency: '61ms' },
  { name: 'Notification Service', uptime: 98.2, status: 'warn', latency: '320ms' },
  { name: 'AI Engine', uptime: 99.8, status: 'ok', latency: '810ms' },
  { name: 'Payment Gateway', uptime: 99.99, status: 'ok', latency: '105ms' },
  { name: 'WebSocket', uptime: 100, status: 'ok', latency: '18ms' },
  { name: 'CDN', uptime: 99.97, status: 'ok', latency: '12ms' },
]

const incidents = [
  { id: 'INC-1042', date: '11 Jun 2026', service: 'Notification Service', duration: '22 min', impact: '4,200 users', resolution: 'Queue flush + restart', status: 'Resolved' },
  { id: 'INC-1041', date: '09 Jun 2026', service: 'API Gateway', duration: '4 min', impact: '800 users', resolution: 'Rate limit config fix', status: 'Resolved' },
  { id: 'INC-1040', date: '06 Jun 2026', service: 'Database', duration: '11 min', impact: '12,000 users', resolution: 'Replica failover', status: 'Resolved' },
  { id: 'INC-1039', date: '02 Jun 2026', service: 'CDN', duration: '18 min', impact: '7,300 users', resolution: 'Edge node reboot', status: 'Resolved' },
  { id: 'INC-1038', date: '29 May 2026', service: 'AI Engine', duration: '35 min', impact: '890 queries', resolution: 'Model reload', status: 'Resolved' },
]

// 30 days uptime data (percent)
const uptimeDays = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  uptime: 97 + Math.random() * 3,
}))

export function PlatformStatusSection() {
  return (
    <div>
      <SectionHeader
        title="Platform Status"
        subtitle="Real-time service health, incidents and 30-day uptime history"
      />

      {/* Service grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {services.map(s => (
          <div key={s.name} style={{
            background: 'var(--bg-surface)',
            border: `1px solid ${s.status === 'ok' ? 'var(--border)' : '#F59E0B44'}`,
            borderRadius: 12,
            padding: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
              {s.status === 'ok'
                ? <CheckCircle size={14} color="#10B981" />
                : <AlertTriangle size={14} color="#F59E0B" />}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.status === 'ok' ? '#10B981' : '#F59E0B' }}>
              {s.uptime}%
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Latency: {s.latency}</div>
            {/* mini bar */}
            <div style={{ marginTop: 8, height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${s.uptime}%`, height: '100%', background: s.status === 'ok' ? '#10B981' : '#F59E0B', borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>

      {/* 30-day uptime chart */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>30-Day Uptime History</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 60 }}>
          {uptimeDays.map(d => {
            const pct = (d.uptime - 97) / 3
            const h = Math.max(8, pct * 60)
            const color = d.uptime >= 99.5 ? '#10B981' : d.uptime >= 98 ? '#F59E0B' : '#EF4444'
            return (
              <div
                key={d.day}
                title={`Day ${d.day}: ${d.uptime.toFixed(2)}%`}
                style={{ flex: 1, height: h, background: color, borderRadius: 2, minWidth: 4, cursor: 'pointer', transition: 'opacity 0.2s' }}
              />
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>May 14</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Jun 13</span>
        </div>
      </Card>

      {/* Incidents table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Incidents</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
              <TH>Incident ID</TH><TH>Date</TH><TH>Service</TH><TH>Duration</TH><TH>Impact</TH><TH>Resolution</TH><TH>Status</TH>
            </tr>
          </thead>
          <tbody>
            {incidents.map((inc, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <TD><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gold)' }}>{inc.id}</span></TD>
                <TD muted>{inc.date}</TD>
                <TD>{inc.service}</TD>
                <TD>{inc.duration}</TD>
                <TD muted>{inc.impact}</TD>
                <TD muted>{inc.resolution}</TD>
                <TD>{badge('Resolved', '#10B981')}</TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 4. ChildrenSection ─────────────────────────────────────────────

const childStatusColor: Record<string, string> = {
  Safe: '#10B981',
  Alert: '#EF4444',
  Offline: '#6B7280',
}

interface ChildRow {
  id: number
  name: string
  family_name: string
  parent_name: string
  device_count: number
  device: string
  status: 'Safe' | 'Offline' | 'Alert'
  is_active: boolean
  joined_at: string | null
}

export function ChildrenSection() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [children, setChildren] = useState<ChildRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ safe: 0, offline: 0, alert: 0 })
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('gv_token') || ''
    setLoading(true)
    const tid = setTimeout(() => {
      fetch('/admin-api/children?limit=50&search=' + encodeURIComponent(search), {
        headers: { Authorization: 'Bearer ' + token }
      })
        .then(r => r.json())
        .then(d => {
          setChildren(d.children || [])
          setTotal(d.total || 0)
          setStats({ safe: d.safe_count || 0, offline: d.offline_count || 0, alert: d.alert_count || 0 })
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }, 300)
    searchTimerRef.current = tid
    return () => clearTimeout(tid)
  }, [search])

  const filtered = statusFilter === 'All' ? children : children.filter(c => c.status === statusFilter)

  const filterCounts: Record<string, number> = {
    All: total,
    Safe: stats.safe,
    Alert: stats.alert,
    Offline: stats.offline,
  }

  return (
    <div>
      <SectionHeader
        title="Children Profiles"
        subtitle="Monitor all children registered on the platform"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 10 }}><Users size={18} color="var(--gold)" /></div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>Total Children</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{total.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: '#10B981', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={12} /><span>Registered on platform</span>
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 10 }}><Shield size={18} color="#10B981" /></div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>Safe Now</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{stats.safe.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: '#10B981', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={12} /><span>Currently safe</span>
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 10 }}><AlertTriangle size={18} color="#EF4444" /></div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>Alerts Today</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{stats.alert.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: '#EF4444', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingDown size={12} /><span>Need attention</span>
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 10 }}><Activity size={18} color="#6B7280" /></div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>Offline</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{stats.offline.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Minus size={12} /><span>Device offline</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap' as const, alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, family, parent..." />
          {(['All', 'Safe', 'Alert', 'Offline'] as const).map(s => (
            <FilterBtn key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {s}
                <span style={{
                  background: statusFilter === s ? 'rgba(0,0,0,0.2)' : 'var(--bg-surface)',
                  color: statusFilter === s ? '#000' : 'var(--text-muted)',
                  border: `1px solid ${statusFilter === s ? 'rgba(0,0,0,0.15)' : 'var(--border)'}`,
                  borderRadius: 99,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                  minWidth: 18,
                  textAlign: 'center' as const,
                }}>{filterCounts[s]}</span>
              </span>
            </FilterBtn>
          ))}
          <button style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'var(--bg-surface2)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            whiteSpace: 'nowrap' as const,
          }}>
            <FileText size={12} />Export CSV
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                <TH>Name</TH><TH>Family</TH><TH>Parent</TH><TH>Device</TH><TH>Status</TH><TH>Joined</TH><TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No children found</td></tr>
              ) : filtered.map((c, i) => {
                const isAlert = c.status === 'Alert'
                const isOffline = c.status === 'Offline'
                const borderLeft = isAlert
                  ? '3px solid #EF4444'
                  : isOffline
                  ? '3px solid #6B7280'
                  : '3px solid transparent'
                const joinedDate = c.joined_at ? new Date(c.joined_at).toLocaleDateString('en-IN') : '—'
                return (
                  <tr
                    key={c.id}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      borderLeft,
                      background: hoveredRow === i ? 'var(--bg-surface2)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' as const }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#3B82F620',
                          color: '#3B82F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {c.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{c.name}</span>
                      </div>
                    </td>
                    <TD muted>{c.family_name}</TD>
                    <TD>{c.parent_name}</TD>
                    <TD muted>{c.device}</TD>
                    <TD>{badge(c.status, childStatusColor[c.status] ?? '#6B7280')}</TD>
                    <TD muted>{joinedDate}</TD>
                    <td style={{ padding: '12px 20px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
        }}>
          <span>Showing {filtered.length} of {total.toLocaleString()} children</span>
        </div>
      </div>
    </div>
  )
}

// ─── 5. ElderlySection ───────────────────────────────────────────────────────

interface ElderlyMember {
  id: number
  name: string
  caregiver: string
  health: 'Stable' | 'At Risk' | 'Critical'
  heart_rate: number
  steps: number
  last_checkin: string | null
  device: string
  is_active: boolean
}

export function ElderlySection() {
  const [search, setSearch] = useState('')
  const [healthFilter, setHealthFilter] = useState('All')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [elderly, setElderly] = useState<ElderlyMember[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ stable: 0, atRisk: 0, critical: 0 })

  const healthColor: Record<string, string> = {
    Stable: '#10B981',
    'At Risk': '#F59E0B',
    Critical: '#EF4444',
  }

  useEffect(() => {
    const token = localStorage.getItem('gv_token') || ''
    setLoading(true)
    const timer = setTimeout(() => {
      fetch('/admin-api/elderly?limit=50&search=' + encodeURIComponent(search), {
        headers: { Authorization: 'Bearer ' + token },
      })
        .then(r => r.json())
        .then(d => {
          setElderly(d.elderly || [])
          setTotal(d.total || 0)
          setStats({
            stable: d.stable_count || 0,
            atRisk: d.at_risk_count || 0,
            critical: d.critical_count || 0,
          })
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const filtered = elderly.filter(e => {
    const matchHealth = healthFilter === 'All' || e.health === healthFilter
    return matchHealth
  })

  const filterCounts: Record<string, number> = {
    All: total,
    Stable: stats.stable,
    'At Risk': stats.atRisk,
    Critical: stats.critical,
  }

  const formatCheckin = (val: string | null) => {
    if (!val) return '—'
    const d = new Date(val)
    if (isNaN(d.getTime())) return val
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      <SectionHeader
        title="Elderly Profiles"
        subtitle="Monitor all elderly members and their caregivers"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 10 }}><Heart size={18} color="var(--gold)" /></div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>Total Elderly</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{loading ? '…' : total.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: '#10B981', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={12} /><span>All registered</span>
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 10 }}><Activity size={18} color="#10B981" /></div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>Stable</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{loading ? '…' : stats.stable.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: '#10B981', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle size={12} /><span>Good health</span>
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 10 }}><AlertTriangle size={18} color="#F59E0B" /></div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>At Risk</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{loading ? '…' : stats.atRisk.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: '#F59E0B', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertCircle size={12} /><span>Needs attention</span>
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 10 }}><Siren size={18} color="#EF4444" /></div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>Critical</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{loading ? '…' : stats.critical.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: '#EF4444', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingDown size={12} /><span>Urgent care</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap' as const, alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or caregiver..." />
          {(['All', 'Stable', 'At Risk', 'Critical'] as const).map(s => (
            <FilterBtn key={s} active={healthFilter === s} onClick={() => setHealthFilter(s)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {s}
                <span style={{
                  background: healthFilter === s ? 'rgba(0,0,0,0.2)' : 'var(--bg-surface)',
                  color: healthFilter === s ? '#000' : 'var(--text-muted)',
                  border: `1px solid ${healthFilter === s ? 'rgba(0,0,0,0.15)' : 'var(--border)'}`,
                  borderRadius: 99,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                  minWidth: 18,
                  textAlign: 'center' as const,
                }}>{filterCounts[s]}</span>
              </span>
            </FilterBtn>
          ))}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                <TH>Name</TH><TH>Caregiver</TH><TH>Health Status</TH><TH>Heart Rate</TH><TH>Steps</TH><TH>Last Check-in</TH><TH>Device</TH><TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    Loading elderly members…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    No elderly members found
                  </td>
                </tr>
              ) : filtered.map((e, i) => {
                const isCritical = e.health === 'Critical'
                const isAtRisk = e.health === 'At Risk'
                const avatarBg = isCritical ? '#EF444420' : isAtRisk ? '#F59E0B20' : '#10B98120'
                const avatarColor = isCritical ? '#EF4444' : isAtRisk ? '#F59E0B' : '#10B981'
                const borderLeft = isCritical
                  ? '3px solid #EF4444'
                  : isAtRisk
                  ? '3px solid #F59E0B'
                  : '3px solid transparent'
                const rowBg = isCritical ? '#EF44440a' : 'transparent'
                return (
                  <tr
                    key={e.id}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      borderLeft,
                      background: hoveredRow === i ? 'var(--bg-surface2)' : rowBg,
                      transition: 'background 0.15s',
                    }}
                  >
                    <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' as const }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: avatarBg,
                          color: avatarColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {e.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{e.name}</span>
                      </div>
                    </td>
                    <TD>{e.caregiver}</TD>
                    <TD>{badge(e.health, healthColor[e.health])}</TD>
                    <TD muted>{e.heart_rate ? `${e.heart_rate} bpm` : '—'}</TD>
                    <TD muted>{e.steps != null ? e.steps.toLocaleString() : '—'}</TD>
                    <TD muted>{formatCheckin(e.last_checkin)}</TD>
                    <TD muted>{e.device}</TD>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <Eye size={14} />
                        </button>
                        {isCritical && (
                          <button style={{
                            background: '#EF444420',
                            color: '#EF4444',
                            border: '1px solid #EF444433',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}>
                            Alert
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
        }}>
          <span>Showing {filtered.length} of {total.toLocaleString()} elderly members</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>Prev</button>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Page 1</span>
            <button style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 6. CaregiversSection ─────────────────────────────────────────────────────

interface CaregiverRow {
  id: number
  name: string
  phone: string
  email: string
  elders_monitored: number
  family_members: number
  status: 'Active' | 'Inactive'
  is_active: boolean
  joined_at: string | null
}

export function CaregiversSection() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [caregivers, setCaregivers] = useState<CaregiverRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ active: 0, inactive: 0 })

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem('gv_token') || ''
      fetch('/admin-api/caregivers?limit=50&search=' + encodeURIComponent(search), {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          const list: CaregiverRow[] = data.caregivers || []
          setCaregivers(list)
          setTotal(data.total ?? list.length)
          setStats({
            active: data.active_count ?? list.filter(c => c.is_active).length,
            inactive: data.inactive_count ?? list.filter(c => !c.is_active).length,
          })
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const filtered = caregivers.filter(c => {
    if (statusFilter === 'All') return true
    return c.status === statusFilter
  })

  const avgMonitored = caregivers.reduce((s, c) => s + c.elders_monitored, 0) / Math.max(caregivers.length, 1)

  const filterCounts: Record<string, number> = {
    All: total,
    Active: stats.active,
    Inactive: stats.inactive,
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const actionBtn = (color: string) => ({
    width: 28,
    height: 28,
    borderRadius: 7,
    border: `1px solid ${color}33`,
    background: `${color}12`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties)

  const formatJoined = (val: string | null) => {
    if (!val) return '—'
    const d = new Date(val)
    if (isNaN(d.getTime())) return val
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      <SectionHeader
        title="Caregivers"
        subtitle="Professional and family caregivers registered on the platform"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard
          label="Total Caregivers"
          value={loading ? '…' : total.toLocaleString()}
          sub="All registered"
          icon={Users}
        />
        <StatCard
          label="Active Today"
          value={loading ? '…' : stats.active.toLocaleString()}
          sub="Currently active"
          icon={Activity}
          iconColor="#10B981"
        />
        <StatCard
          label="Avg Monitored"
          value={loading ? '…' : avgMonitored.toFixed(1)}
          sub="Elders per caregiver"
          icon={Heart}
          iconColor="#F59E0B"
        />
        <StatCard
          label="Response Rate"
          value="96.8%"
          sub="+0.4% this week"
          icon={CheckCircle}
          iconColor="#10B981"
        />
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap' as const, alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search caregivers..." />
          {(['All', 'Active', 'Inactive'] as const).map(s => (
            <FilterBtn key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {s}
              <span style={{
                marginLeft: 5,
                background: statusFilter === s ? 'rgba(0,0,0,0.18)' : 'var(--border)',
                color: statusFilter === s ? '#000' : 'var(--text-muted)',
                borderRadius: 99,
                padding: '0 5px',
                fontSize: 10,
                fontWeight: 700,
                lineHeight: '16px',
                display: 'inline-block',
                minWidth: 18,
                textAlign: 'center' as const,
              }}>{filterCounts[s]}</span>
            </FilterBtn>
          ))}
          <div style={{ marginLeft: 'auto' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'var(--bg-surface2)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap' as const,
            }}>
              <FileText size={12} />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                <TH>Name</TH><TH>Phone</TH><TH>Family Members</TH><TH>Elders Monitored</TH><TH>Status</TH><TH>Joined</TH><TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    Loading caregivers…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    No caregivers found
                  </td>
                </tr>
              ) : filtered.map((c, i) => {
                const isActive = c.is_active
                const avatarBg = isActive ? '#10B98120' : '#6B728020'
                const avatarColor = isActive ? '#10B981' : '#6B7280'
                const isHovered = hoveredRow === i
                const workloadColor = c.elders_monitored >= 5 ? '#EF4444' : c.elders_monitored >= 3 ? '#F59E0B' : '#10B981'
                return (
                  <tr
                    key={c.id}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      borderLeft: isActive ? '3px solid transparent' : '3px solid #6B7280',
                      opacity: isActive ? 1 : 0.7,
                      background: isHovered ? 'var(--bg-surface2)' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Name with avatar */}
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: avatarBg,
                          color: avatarColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                          border: `1px solid ${avatarColor}33`,
                        }}>
                          {getInitials(c.name)}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{c.name}</span>
                      </div>
                    </td>

                    <TD muted>{c.phone}</TD>

                    {/* Family Members */}
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.family_members}</span>
                    </td>

                    {/* Elders Monitored with workload bar */}
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{c.elders_monitored}</span>
                        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                          <div style={{
                            width: `${Math.min((c.elders_monitored / 5) * 100, 100)}%`,
                            height: '100%',
                            borderRadius: 2,
                            background: workloadColor,
                          }} />
                        </div>
                      </div>
                    </td>

                    <TD>{badge(c.status, isActive ? '#10B981' : '#6B7280')}</TD>
                    <TD muted>{formatJoined(c.joined_at)}</TD>

                    {/* Actions */}
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button title="View" style={actionBtn('#60A5FA')}>
                          <Eye size={13} color="#60A5FA" />
                        </button>
                        <button title="Message" style={actionBtn('#10B981')}>
                          <MessageSquare size={13} color="#10B981" />
                        </button>
                        <button title="Contact" style={actionBtn('#F59E0B')}>
                          <Mail size={13} color="#F59E0B" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
        }}>
          <span>Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{total.toLocaleString()}</strong> caregivers</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>Prev</button>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Page 1</span>
            <button style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 7. UserVerificationSection ───────────────────────────────────────────────

interface VerificationRow {
  id: number
  user: string
  email: string
  phone: string
  submitted: string
  type: 'Phone' | 'Email'
  status: 'Verified' | 'Pending' | 'Rejected'
  is_active: boolean
}

export function UserVerificationSection() {
  const verifStatusColor: Record<string, string> = {
    Pending: '#F59E0B',
    Verified: '#10B981',
    Rejected: '#EF4444',
  }

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [verifications, setVerifications] = useState<VerificationRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0 })

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem('gv_token') || ''
      fetch(
        '/admin-api/verification?limit=50&search=' +
          encodeURIComponent(search) +
          '&status_filter=' +
          encodeURIComponent(statusFilter) +
          '&type_filter=' +
          encodeURIComponent(typeFilter),
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then(r => r.json())
        .then(data => {
          const list: VerificationRow[] = data.verifications || []
          setVerifications(list)
          setTotal(data.total ?? list.length)
          setStats({
            pending: data.pending_count ?? list.filter(v => v.status === 'Pending').length,
            verified: data.verified_count ?? list.filter(v => v.status === 'Verified').length,
            rejected: data.rejected_count ?? list.filter(v => v.status === 'Rejected').length,
          })
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [search, statusFilter, typeFilter])

  const typeFilterCounts: Record<string, number> = {
    All: verifications.length,
    Phone: verifications.filter(v => v.type === 'Phone').length,
    Email: verifications.filter(v => v.type === 'Email').length,
  }

  const statusFilterCounts: Record<string, number> = {
    All: verifications.length,
    Pending: verifications.filter(v => v.status === 'Pending').length,
    Verified: verifications.filter(v => v.status === 'Verified').length,
    Rejected: verifications.filter(v => v.status === 'Rejected').length,
  }

  const autoVerified = total - stats.pending - stats.rejected

  const countBadge = (count: number, active: boolean) => (
    <span style={{
      marginLeft: 5,
      background: active ? 'rgba(0,0,0,0.18)' : 'var(--border)',
      color: active ? '#000' : 'var(--text-muted)',
      borderRadius: 99,
      padding: '0 5px',
      fontSize: 10,
      fontWeight: 700,
      lineHeight: '16px',
      display: 'inline-block',
      minWidth: 18,
      textAlign: 'center' as const,
    }}>{count}</span>
  )

  return (
    <div>
      <SectionHeader
        title="User Verification"
        subtitle="Phone and email verification queue"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard
          label="Pending Review"
          value={loading ? '…' : stats.pending.toLocaleString()}
          sub="Awaiting verification"
          subColor="#F59E0B"
          icon={Clock}
          iconColor="#F59E0B"
        />
        <StatCard
          label="Verified"
          value={loading ? '…' : stats.verified.toLocaleString()}
          sub="Successfully verified"
          icon={UserCheck}
          iconColor="#10B981"
        />
        <StatCard
          label="Rejected"
          value={loading ? '…' : stats.rejected.toLocaleString()}
          sub="Verification failed"
          subColor="#EF4444"
          icon={UserX}
          iconColor="#EF4444"
        />
        <StatCard
          label="Auto-verified"
          value={loading ? '…' : Math.max(0, autoVerified).toLocaleString()}
          sub="System auto-approved"
          icon={Zap}
          iconColor="#3B82F6"
        />
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap' as const, alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
          {(['All', 'Phone', 'Email'] as const).map(t => (
            <FilterBtn key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
              {t}{countBadge(typeFilterCounts[t], typeFilter === t)}
            </FilterBtn>
          ))}
          <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch' }} />
          {(['All', 'Pending', 'Verified', 'Rejected'] as const).map(s => (
            <FilterBtn key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {s}{countBadge(statusFilterCounts[s], statusFilter === s)}
            </FilterBtn>
          ))}
          <div style={{ marginLeft: 'auto' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--bg-surface2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}>
              <FileText size={13} />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                <TH>User</TH><TH>Email</TH><TH>Phone</TH><TH>Submitted</TH><TH>Type</TH><TH>Status</TH><TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    Loading verifications…
                  </td>
                </tr>
              ) : verifications.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    No verifications found
                  </td>
                </tr>
              ) : verifications.map((v, i) => {
                const isPending = v.status === 'Pending'
                const isRejected = v.status === 'Rejected'
                const borderLeft = isPending
                  ? '3px solid #F59E0B'
                  : isRejected
                  ? '3px solid #EF4444'
                  : 'none'
                return (
                  <tr
                    key={v.id}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      borderLeft,
                      background: hoveredRow === i ? 'var(--bg-surface2)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <TD><span style={{ fontWeight: 600 }}>{v.user}</span></TD>
                    <TD muted>{v.email}</TD>
                    <TD muted>{v.phone}</TD>
                    <TD muted>{v.submitted}</TD>
                    <TD>
                      <span style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, color: 'var(--text-secondary)' }}>{v.type}</span>
                    </TD>
                    <TD>{badge(v.status, verifStatusColor[v.status] ?? '#6B7280')}</TD>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {isPending && (
                          <>
                            <button style={{ background: '#10B98120', color: '#10B981', border: '1px solid #10B98133', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, cursor: 'pointer' }}>Approve</button>
                            <button style={{ background: '#EF444420', color: '#EF4444', border: '1px solid #EF444433', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, cursor: 'pointer' }}>Reject</button>
                          </>
                        )}
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--text-muted)',
        }}>
          <span>Showing <strong style={{ color: 'var(--text-secondary)' }}>{verifications.length}</strong> of <strong style={{ color: 'var(--text-secondary)' }}>{total.toLocaleString()}</strong> verifications</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>Prev</button>
            <button style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 8. EmergencySection ──────────────────────────────────────────────────────

const emergencyData = [
  { id: 'EM-2041', type: 'Medical Emergency', user: 'Kamla Devi', location: 'Mumbai, Andheri', severity: 'Critical', assignedTo: 'Dr. Nair', status: 'Active', time: '10:32 AM' },
  { id: 'EM-2040', type: 'Road Accident', user: 'Arjun Mehta', location: 'Delhi, NH-48', severity: 'High', assignedTo: 'Team Alpha', status: 'Active', time: '10:28 AM' },
  { id: 'EM-2039', type: 'Fire Alert', user: 'Kavya Reddy', location: 'Hyderabad, Banjara Hills', severity: 'High', assignedTo: 'Fire Dept', status: 'In Progress', time: '10:15 AM' },
  { id: 'EM-2038', type: 'Missing Child', user: 'Rahul Gupta', location: 'Pune, FC Road', severity: 'Critical', assignedTo: 'Police', status: 'Active', time: '09:58 AM' },
  { id: 'EM-2037', type: 'Domestic Violence', user: 'Sneha Iyer', location: 'Chennai, T Nagar', severity: 'High', assignedTo: 'Team Beta', status: 'In Progress', time: '09:45 AM' },
  { id: 'EM-2036', type: 'Fall — Elderly', user: 'Baldev Singh', location: 'Bangalore, HSR', severity: 'Medium', assignedTo: 'Vikram Singh', status: 'In Progress', time: '09:30 AM' },
  { id: 'EM-2035', type: 'Medical Emergency', user: 'Meera Nair', location: 'Mumbai, Dadar', severity: 'Medium', assignedTo: 'Dr. Sharma', status: 'Resolved', time: '09:10 AM' },
  { id: 'EM-2034', type: 'Geofence Breach', user: 'Aditya Kumar', location: 'Kolkata, Park St', severity: 'Medium', assignedTo: 'Auto', status: 'Resolved', time: '08:52 AM' },
  { id: 'EM-2033', type: 'Natural Disaster', user: 'Pooja Verma', location: 'Delhi, Yamuna Bank', severity: 'High', assignedTo: 'NDRF', status: 'Resolved', time: '08:30 AM' },
  { id: 'EM-2032', type: 'Road Accident', user: 'Suresh Babu', location: 'Hyderabad, ORR', severity: 'Critical', assignedTo: 'Team Alpha', status: 'Resolved', time: '07:55 AM' },
]

const severityColor: Record<string, string> = {
  Critical: '#EF4444',
  High: '#F59E0B',
  Medium: '#3B82F6',
  Low: '#10B981',
}
const emerStatusColor: Record<string, string> = {
  Active: '#EF4444',
  'In Progress': '#F59E0B',
  Resolved: '#10B981',
}

export function EmergencySection() {
  const [search, setSearch] = useState('')
  const [sevFilter, setSevFilter] = useState('All')

  const filtered = emergencyData.filter(e => {
    const matchSev = sevFilter === 'All' || e.severity === sevFilter
    const matchSearch = search === '' ||
      e.user.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase())
    return matchSev && matchSearch
  })

  return (
    <div>
      <SectionHeader
        title="Emergency Cases"
        subtitle="Active emergencies beyond standard SOS — requires immediate attention"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Active Cases" value="23" sub="Requires action" subColor="#EF4444" icon={Siren} iconColor="#EF4444" />
        <StatCard label="Resolved Today" value="45" sub="+8 vs yesterday" icon={CheckCircle} iconColor="#10B981" />
        <StatCard label="Critical" value="3" sub="Immediate response" subColor="#EF4444" icon={AlertCircle} iconColor="#EF4444" />
        <StatCard label="Avg Resolution" value="18 min" sub="Target: <20 min" icon={Clock} iconColor="#10B981" />
      </div>

      {/* Map placeholder */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        height: 120,
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        color: 'var(--text-muted)',
        fontSize: 13,
      }}>
        <Map size={18} color="var(--text-muted)" />
        <span>Live emergency map — 23 active incidents across India</span>
        <span style={{ background: '#EF444420', color: '#EF4444', border: '1px solid #EF444433', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99 }}>3 Critical</span>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search cases..." />
          {['All', 'Critical', 'High', 'Medium'].map(s => (
            <FilterBtn key={s} active={sevFilter === s} onClick={() => setSevFilter(s)}>{s}</FilterBtn>
          ))}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                <TH>Case ID</TH><TH>Type</TH><TH>User</TH><TH>Location</TH><TH>Severity</TH><TH>Assigned To</TH><TH>Status</TH><TH>Time</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <TD><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gold)' }}>{e.id}</span></TD>
                  <TD>{e.type}</TD>
                  <TD>{e.user}</TD>
                  <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} color="var(--text-muted)" />{e.location}
                    </div>
                  </td>
                  <TD>{badge(e.severity, severityColor[e.severity])}</TD>
                  <TD muted>{e.assignedTo}</TD>
                  <TD>{badge(e.status, emerStatusColor[e.status])}</TD>
                  <TD muted>{e.time}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 9. MissingPersonsSection ─────────────────────────────────────────────────

const missingData = [
  { initials: 'RS', name: 'Ritu Sharma', age: 14, lastLocation: 'Connaught Place, Delhi', reportedBy: 'Priya Sharma', timeMissing: '6 hr 20 min', status: 'Active' },
  { initials: 'AK', name: 'Amit Kumar', age: 9, lastLocation: 'Dadar Station, Mumbai', reportedBy: 'Aditya Kumar', timeMissing: '3 hr 45 min', status: 'Active' },
  { initials: 'SY', name: 'Sunita Yadav', age: 72, lastLocation: 'Hazratganj, Lucknow', reportedBy: 'Ramesh Yadav', timeMissing: '2 hr 10 min', status: 'Active' },
  { initials: 'KP', name: 'Karan Patel', age: 16, lastLocation: 'Lajpat Nagar, Delhi', reportedBy: 'Anita Patel', timeMissing: '5 hr 00 min', status: 'Escalated' },
  { initials: 'MR', name: 'Maya Reddy', age: 8, lastLocation: 'Banjara Hills, Hyderabad', reportedBy: 'Kavya Reddy', timeMissing: '1 hr 30 min', status: 'Active' },
  { initials: 'BS', name: 'Balram Singh', age: 79, lastLocation: 'Silk Board, Bangalore', reportedBy: 'Vikram Singh', timeMissing: '4 hr 15 min', status: 'Escalated' },
  { initials: 'PJ', name: 'Preetika Jain', age: 13, lastLocation: 'Bandra, Mumbai', reportedBy: 'Suresh Jain', timeMissing: '8 hr 50 min', status: 'Escalated' },
  { initials: 'TN', name: 'Tejas Nair', age: 11, lastLocation: 'Fort Kochi, Kerala', reportedBy: 'Divya Pillai', timeMissing: '2 hr 5 min', status: 'Active' },
]

const mpStatusColor: Record<string, string> = {
  Active: '#F59E0B',
  Escalated: '#EF4444',
  Found: '#10B981',
}

export function MissingPersonsSection() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = missingData.filter(m => {
    const matchStatus = statusFilter === 'All' || m.status === statusFilter
    const matchSearch = search === '' ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.lastLocation.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div>
      <SectionHeader
        title="Missing Persons"
        subtitle="Active missing person alerts — coordinate with law enforcement"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Active Alerts" value="8" sub="3 escalated to police" subColor="#EF4444" icon={AlertTriangle} iconColor="#EF4444" />
        <StatCard label="Resolved This Month" value="23" sub="96% found safely" icon={CheckCircle} iconColor="#10B981" />
        <StatCard label="Avg Time to Resolve" value="4.2 hr" sub="Down from 5.1h last month" icon={Clock} />
      </div>

      <div style={{ padding: '12px 0', display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' as const }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or location..." />
        {['All', 'Active', 'Escalated'].map(s => (
          <FilterBtn key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s}</FilterBtn>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{
              background: 'var(--bg-surface)',
              border: `1px solid ${m.status === 'Escalated' ? '#EF444433' : 'var(--border)'}`,
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `${mpStatusColor[m.status]}22`,
              border: `2px solid ${mpStatusColor[m.status]}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              fontWeight: 800,
              color: mpStatusColor[m.status],
              flexShrink: 0,
            }}>{m.initials}</div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Age {m.age}</span>
                {badge(m.status, mpStatusColor[m.status])}
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} /> {m.lastLocation}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={11} /> Reported by: {m.reportedBy}
                </span>
                <span style={{ fontSize: 12, color: m.status === 'Escalated' ? '#EF4444' : '#F59E0B', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> Missing: {m.timeMissing}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button style={{ background: '#10B98120', color: '#10B981', border: '1px solid #10B98133', fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>
                Mark Found
              </button>
              <button style={{ background: '#EF444420', color: '#EF4444', border: '1px solid #EF444433', fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>
                Escalate
              </button>
              <button style={{ background: '#3B82F620', color: '#3B82F6', border: '1px solid #3B82F633', fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>
                Share
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── 10. IncidentReportsSection ───────────────────────────────────────────────

const incidentData = [
  { id: 'IR-3401', title: 'GPS spoofing detected', category: 'Security', priority: 'High', reportedBy: 'Priya Sharma', assigned: 'Security Team', status: 'Open', created: '13 Jun 2026' },
  { id: 'IR-3400', title: 'App crash on iOS 17.4', category: 'Bug', priority: 'Medium', reportedBy: 'Arjun Mehta', assigned: 'Mobile Team', status: 'In Progress', created: '13 Jun 2026' },
  { id: 'IR-3399', title: 'Wrong geofence alerts', category: 'Bug', priority: 'High', reportedBy: 'Kavya Reddy', assigned: 'Location Team', status: 'Open', created: '12 Jun 2026' },
  { id: 'IR-3398', title: 'Payment double charge', category: 'Finance', priority: 'Critical', reportedBy: 'Rahul Gupta', assigned: 'Finance Ops', status: 'In Progress', created: '12 Jun 2026' },
  { id: 'IR-3397', title: 'Notification delay > 5s', category: 'Performance', priority: 'Medium', reportedBy: 'Sneha Iyer', assigned: 'Backend Team', status: 'Open', created: '11 Jun 2026' },
  { id: 'IR-3396', title: 'Data export missing columns', category: 'Data', priority: 'Low', reportedBy: 'Vikram Singh', assigned: 'Data Team', status: 'In Progress', created: '11 Jun 2026' },
  { id: 'IR-3395', title: 'SOS not triggering vibration', category: 'Bug', priority: 'High', reportedBy: 'Meera Nair', assigned: 'Mobile Team', status: 'Open', created: '10 Jun 2026' },
  { id: 'IR-3394', title: 'Fake account creation spike', category: 'Security', priority: 'Critical', reportedBy: 'System', assigned: 'Security Team', status: 'In Progress', created: '10 Jun 2026' },
  { id: 'IR-3393', title: 'Map tiles not loading', category: 'Performance', priority: 'Medium', reportedBy: 'Aditya Kumar', assigned: 'Frontend Team', status: 'Open', created: '09 Jun 2026' },
  { id: 'IR-3392', title: 'Caregiver alerts delayed', category: 'Bug', priority: 'High', reportedBy: 'Pooja Verma', assigned: 'Backend Team', status: 'Open', created: '09 Jun 2026' },
  { id: 'IR-3391', title: 'Profile photo upload failing', category: 'Bug', priority: 'Low', reportedBy: 'Suresh Babu', assigned: 'Backend Team', status: 'In Progress', created: '08 Jun 2026' },
  { id: 'IR-3390', title: 'OTP not sending in Jio', category: 'Bug', priority: 'High', reportedBy: 'Anita Desai', assigned: 'Infra Team', status: 'Open', created: '08 Jun 2026' },
]

const priorityColor: Record<string, string> = {
  Critical: '#EF4444',
  High: '#F59E0B',
  Medium: '#3B82F6',
  Low: '#6B7280',
}
const incidentStatusColor: Record<string, string> = {
  Open: '#F59E0B',
  'In Progress': '#3B82F6',
  Resolved: '#10B981',
}

export function IncidentReportsSection() {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')

  const categories = ['All', 'Bug', 'Security', 'Finance', 'Performance', 'Data']
  const filtered = incidentData.filter(inc => {
    const matchCat = catFilter === 'All' || inc.category === catFilter
    const matchSearch = search === '' ||
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.id.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div>
      <SectionHeader
        title="Incident Reports"
        subtitle="Structured incident management across all platform layers"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Open" value="34" sub="Needs assignment" subColor="#F59E0B" icon={AlertCircle} iconColor="#F59E0B" />
        <StatCard label="In Progress" value="18" sub="Being handled" icon={Activity} iconColor="#3B82F6" />
        <StatCard label="Resolved This Week" value="127" sub="+14% vs last week" icon={CheckCircle} iconColor="#10B981" />
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search incidents..." />
          {categories.map(c => (
            <FilterBtn key={c} active={catFilter === c} onClick={() => setCatFilter(c)}>{c}</FilterBtn>
          ))}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                <TH>ID</TH><TH>Title</TH><TH>Category</TH><TH>Priority</TH><TH>Reported By</TH><TH>Assigned</TH><TH>Status</TH><TH>Created</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <TD><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gold)' }}>{inc.id}</span></TD>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text-primary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{inc.title}</td>
                  <TD>
                    <span style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', fontSize: 11, padding: '2px 8px', borderRadius: 6, color: 'var(--text-secondary)', fontWeight: 500 }}>{inc.category}</span>
                  </TD>
                  <TD>{badge(inc.priority, priorityColor[inc.priority])}</TD>
                  <TD muted>{inc.reportedBy}</TD>
                  <TD muted>{inc.assigned}</TD>
                  <TD>{badge(inc.status, incidentStatusColor[inc.status])}</TD>
                  <TD muted>{inc.created}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 11. RiskMonitoringSection ────────────────────────────────────────────────

const riskFactors = [
  { factor: 'SOS Frequency > 3/week', affected: 4_230, score: 92, trend: 'up' },
  { factor: 'Device Battery < 10% often', affected: 12_890, score: 71, trend: 'up' },
  { factor: 'Geofence Breach Repeat', affected: 3_120, score: 88, trend: 'down' },
  { factor: 'No Location Update > 4hr', affected: 8_450, score: 78, trend: 'flat' },
  { factor: 'Night-time Travel Alone', affected: 6_780, score: 83, trend: 'up' },
  { factor: 'Caregiver Unresponsive', affected: 1_890, score: 95, trend: 'flat' },
  { factor: 'Medication Missed > 2 days', affected: 2_340, score: 86, trend: 'down' },
  { factor: 'School Arrival Missed', affected: 5_670, score: 74, trend: 'up' },
]

const highRiskUsers = [
  { name: 'Priya Sharma', city: 'Mumbai', riskScore: 94, factor: 'SOS Frequency', sosCount: 6 },
  { name: 'Ramesh Yadav', city: 'Lucknow', riskScore: 91, factor: 'Caregiver Unresponsive', sosCount: 2 },
  { name: 'Anita Desai', city: 'Ahmedabad', riskScore: 89, factor: 'Night Travel', sosCount: 4 },
  { name: 'Kavya Reddy', city: 'Hyderabad', riskScore: 87, factor: 'Geofence Breach', sosCount: 3 },
  { name: 'Baldev Singh', city: 'Bangalore', riskScore: 85, factor: 'Medication Missed', sosCount: 1 },
  { name: 'Pooja Verma', city: 'Delhi', riskScore: 83, factor: 'No Location Update', sosCount: 2 },
  { name: 'Suresh Babu', city: 'Hyderabad', riskScore: 81, factor: 'Device Battery Low', sosCount: 3 },
  { name: 'Zara Kumar', city: 'Kolkata', riskScore: 80, factor: 'School Arrival Missed', sosCount: 5 },
  { name: 'Aish Yadav', city: 'Lucknow', riskScore: 79, factor: 'Geofence Breach', sosCount: 3 },
  { name: 'Karan Patel', city: 'Delhi', riskScore: 77, factor: 'SOS Frequency', sosCount: 4 },
]

const cityHeatmap = [
  { city: 'Mumbai', risk: 78 },
  { city: 'Delhi', risk: 82 },
  { city: 'Bangalore', risk: 61 },
  { city: 'Hyderabad', risk: 69 },
  { city: 'Chennai', risk: 55 },
  { city: 'Pune', risk: 48 },
  { city: 'Kolkata', risk: 71 },
  { city: 'Jaipur', risk: 44 },
]

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <TrendingUp size={13} color="#EF4444" />
  if (trend === 'down') return <TrendingDown size={13} color="#10B981" />
  return <Minus size={13} color="#6B7280" />
}

export function RiskMonitoringSection() {
  const [search, setSearch] = useState('')

  const filteredRiskUsers = highRiskUsers.filter(u =>
    search === '' || u.name.toLowerCase().includes(search.toLowerCase()) || u.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <SectionHeader
        title="Risk Monitoring"
        subtitle="Predictive risk detection across all users and family units"
      />

      {/* Risk Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Risk Distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'High Risk', pct: 2.3, color: '#EF4444', users: '4,230' },
              { label: 'Medium Risk', pct: 12.4, color: '#F59E0B', users: '22,870' },
              { label: 'Low Risk', pct: 85.3, color: '#10B981', users: '1,56,791' },
            ].map(r => (
              <div key={r.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.pct}% ({r.users})</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${r.pct}%`, height: '100%', background: r.color, borderRadius: 99, minWidth: r.pct < 5 ? 20 : 0 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Risk Heatmap by City</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cityHeatmap.map(c => {
              const color = c.risk >= 75 ? '#EF4444' : c.risk >= 55 ? '#F59E0B' : '#10B981'
              return (
                <div key={c.city} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 80, flexShrink: 0 }}>{c.city}</span>
                  <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${c.risk}%`, height: '100%', background: color, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 11, color, fontWeight: 700, width: 32, textAlign: 'right' as const }}>{c.risk}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Risk Factors */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Top Risk Factors</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
              <TH>Risk Factor</TH><TH>Affected Users</TH><TH>Risk Score</TH><TH>Trend</TH>
            </tr>
          </thead>
          <tbody>
            {riskFactors.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <TD>{r.factor}</TD>
                <TD>{r.affected.toLocaleString('en-IN')}</TD>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', maxWidth: 80 }}>
                      <div style={{ width: `${r.score}%`, height: '100%', background: r.score >= 85 ? '#EF4444' : r.score >= 70 ? '#F59E0B' : '#10B981', borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: r.score >= 85 ? '#EF4444' : r.score >= 70 ? '#F59E0B' : '#10B981' }}>{r.score}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 20px' }}><TrendIcon trend={r.trend} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* High Risk Users */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search high-risk users..." />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
              <TH>#</TH><TH>Name</TH><TH>City</TH><TH>Risk Score</TH><TH>Top Factor</TH><TH>SOS Count</TH><TH>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {filteredRiskUsers.map((u, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <TD muted>{i + 1}</TD>
                <TD><span style={{ fontWeight: 600 }}>{u.name}</span></TD>
                <TD muted>{u.city}</TD>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: u.riskScore >= 85 ? '#EF4444' : '#F59E0B' }}>{u.riskScore}</span>
                </td>
                <TD muted>{u.factor}</TD>
                <td style={{ padding: '12px 20px' }}>
                  {badge(String(u.sosCount), '#EF4444')}
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 12. SafetyScoresSection ──────────────────────────────────────────────────

const safetyScoreData = [
  { user: 'Priya Sharma', family: 'Sharma Family', score: 92, trend: 'up', topRisk: 'Night travel alone', lastUpdated: '2 min ago' },
  { user: 'Arjun Mehta', family: 'Mehta Family', score: 87, trend: 'flat', topRisk: 'Device battery low', lastUpdated: '5 min ago' },
  { user: 'Kavya Reddy', family: 'Reddy Circle', score: 74, trend: 'down', topRisk: 'Geofence breach', lastUpdated: '12 min ago' },
  { user: 'Rahul Gupta', family: 'Gupta Family', score: 95, trend: 'up', topRisk: 'None', lastUpdated: '1 min ago' },
  { user: 'Sneha Iyer', family: 'Iyer Family', score: 68, trend: 'down', topRisk: 'SOS frequency', lastUpdated: '30 min ago' },
  { user: 'Vikram Singh', family: 'Singh Circle', score: 88, trend: 'up', topRisk: 'Elderly unmonitored', lastUpdated: '8 min ago' },
  { user: 'Meera Nair', family: 'Nair Family', score: 100, trend: 'flat', topRisk: 'None', lastUpdated: '4 min ago' },
  { user: 'Aditya Kumar', family: 'Kumar Family', score: 56, trend: 'down', topRisk: 'School arrival missed', lastUpdated: '1 hr ago' },
  { user: 'Pooja Verma', family: 'Verma Circle', score: 82, trend: 'up', topRisk: 'Device offline', lastUpdated: '20 min ago' },
  { user: 'Suresh Babu', family: 'Babu Family', score: 71, trend: 'flat', topRisk: 'No check-in', lastUpdated: '45 min ago' },
  { user: 'Anita Desai', family: 'Desai Family', score: 93, trend: 'up', topRisk: 'None', lastUpdated: '3 min ago' },
  { user: 'Ravi Shankar', family: 'Shankar Family', score: 79, trend: 'down', topRisk: 'Geofence breach', lastUpdated: '15 min ago' },
]

const scoreColor = (s: number) => s >= 90 ? '#10B981' : s >= 70 ? 'var(--gold)' : '#EF4444'

const ScoreDistribution = () => {
  const buckets = [
    { label: '90–100', count: 3, color: '#10B981' },
    { label: '80–89', count: 3, color: '#10B981' },
    { label: '70–79', count: 3, color: 'var(--gold)' },
    { label: '60–69', count: 2, color: '#F59E0B' },
    { label: '<60', count: 1, color: '#EF4444' },
  ]
  const max = Math.max(...buckets.map(b => b.count))
  return (
    <Card style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Score Distribution (Sample)</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
        {buckets.map(b => (
          <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: b.color }}>{b.count}</span>
            <div style={{ width: '100%', height: (b.count / max) * 60, background: b.color, borderRadius: '4px 4px 0 0', opacity: 0.85 }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{b.label}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function SafetyScoresSection() {
  const [search, setSearch] = useState('')
  const [trendFilter, setTrendFilter] = useState('All')

  const filtered = safetyScoreData.filter(u => {
    const matchTrend = trendFilter === 'All' || u.trend === trendFilter
    const matchSearch = search === '' ||
      u.user.toLowerCase().includes(search.toLowerCase()) ||
      u.family.toLowerCase().includes(search.toLowerCase())
    return matchTrend && matchSearch
  })

  return (
    <div>
      <SectionHeader
        title="Safety Scores"
        subtitle="Per-user and per-family safety scores computed from behavioural signals"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Platform Avg Score" value="87.4" sub="+1.2 pts this week" icon={Shield} iconColor="#10B981" />
        <StatCard label="Perfect Scores (100)" value="12,340" sub="6.7% of users" icon={Star} iconColor="var(--gold)" />
        <StatCard label="Low Scores (<60)" value="2,341" sub="Needs intervention" subColor="#EF4444" icon={AlertTriangle} iconColor="#EF4444" />
      </div>

      <ScoreDistribution />

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search users or families..." />
          {['All', 'up', 'down', 'flat'].map(t => (
            <FilterBtn key={t} active={trendFilter === t} onClick={() => setTrendFilter(t)}>
              {t === 'All' ? 'All' : t === 'up' ? '↑ Rising' : t === 'down' ? '↓ Falling' : '→ Stable'}
            </FilterBtn>
          ))}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 750 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                <TH>User</TH><TH>Family</TH><TH>Score</TH><TH>Trend</TH><TH>Top Risk Factor</TH><TH>Last Updated</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <TD><span style={{ fontWeight: 600 }}>{u.user}</span></TD>
                  <TD muted>{u.family}</TD>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: scoreColor(u.score) }}>{u.score}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>/100</span>
                  </td>
                  <td style={{ padding: '12px 20px' }}><TrendIcon trend={u.trend} /></td>
                  <TD muted>{u.topRisk === 'None' ? <span style={{ color: '#10B981', fontSize: 12 }}>None</span> : u.topRisk}</TD>
                  <TD muted>{u.lastUpdated}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
