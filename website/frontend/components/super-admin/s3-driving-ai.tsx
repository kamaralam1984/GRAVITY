'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, AlertTriangle, Shield, Brain,
  Zap, Car, Phone, Moon, Clock, Search, Download, RefreshCw,
  Eye, Bell, BarChart2, CheckCircle, XCircle, PlayCircle,
  Settings, Send, MessageSquare, BookOpen, Target, Activity,
  ChevronUp, ChevronDown, Star, Users, FileText, Filter,
  RotateCcw, Sliders, Gauge, Award, AlertCircle, Cpu
} from 'lucide-react'

// ─── shared helpers ────────────────────────────────────────────────────────────

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
  label, value, sub, subColor = '#10B981', icon: Icon, iconColor = 'var(--gold)'
}: {
  label: string; value: string | number; sub?: string; subColor?: string;
  icon?: React.ElementType; iconColor?: string
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}
  >
    {Icon && (
      <div style={{ marginBottom: 10 }}>
        <Icon size={18} color={iconColor} />
      </div>
    )}
    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: subColor, marginTop: 6 }}>{sub}</div>}
  </motion.div>
)

const SearchBar = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div style={{ position: 'relative', flex: 1 }}>
    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder ?? 'Search...'}
      style={{
        width: '100%',
        background: 'var(--bg-surface2)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '6px 12px 6px 30px',
        color: 'var(--text-primary)',
        fontSize: 13,
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  </div>
)

const Th = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <th style={{
    padding: '10px 20px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
    ...style,
  }}>{children}</th>
)

const Td = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text-primary)', ...style }}>{children}</td>
)

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <div
    onClick={onToggle}
    style={{
      width: 44,
      height: 24,
      borderRadius: 99,
      background: on ? 'var(--gold)' : 'var(--border)',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 0.2s',
      flexShrink: 0,
    }}
  >
    <div style={{
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: 'var(--text-primary)',
      position: 'absolute',
      top: 3,
      left: on ? 23 : 3,
      transition: 'left 0.2s',
    }} />
  </div>
)

// ─── 1. DriverScoresSection ─────────────────────────────────────────────────

const scoreRanges = [
  { range: '90-100', label: '90–100 (Excellent)', color: 'var(--gold)', count: 23450 },
  { range: '80-90',  label: '80–90 (Good)',       color: '#10B981',     count: 41200 },
  { range: '70-80',  label: '70–80 (Average)',    color: '#F59E0B',     count: 55300 },
  { range: '60-70',  label: '60–70 (Below Avg)',  color: '#F97316',     count: 28700 },
  { range: '50-60',  label: '50–60 (Poor)',        color: '#EF4444',     count: 4230  },
]

const driverScoreData = [
  { name: 'Priya Sharma',   family: 'Sharma Family',  score: 94, trips: 312, speed: 2,  brake: 1,  phone: 0,  trend: 'up'   },
  { name: 'Arjun Mehta',    family: 'Mehta Family',   score: 81, trips: 198, speed: 8,  brake: 5,  phone: 3,  trend: 'up'   },
  { name: 'Kavya Reddy',    family: 'Reddy Family',   score: 76, trips: 245, speed: 14, brake: 9,  phone: 6,  trend: 'down' },
  { name: 'Rahul Gupta',    family: 'Gupta Family',   score: 62, trips: 167, speed: 22, brake: 17, phone: 11, trend: 'down' },
  { name: 'Sneha Iyer',     family: 'Iyer Family',    score: 88, trips: 289, speed: 5,  brake: 3,  phone: 1,  trend: 'up'   },
  { name: 'Vikram Nair',    family: 'Nair Family',    score: 47, trips: 134, speed: 31, brake: 24, phone: 18, trend: 'down' },
  { name: 'Anita Joshi',    family: 'Joshi Family',   score: 73, trips: 221, speed: 11, brake: 7,  phone: 4,  trend: 'up'   },
  { name: 'Dev Patel',      family: 'Patel Family',   score: 91, trips: 356, speed: 1,  brake: 2,  phone: 0,  trend: 'up'   },
  { name: 'Meera Kapoor',   family: 'Kapoor Family',  score: 58, trips: 143, speed: 26, brake: 19, phone: 14, trend: 'down' },
  { name: 'Rohan Bansal',   family: 'Bansal Family',  score: 85, trips: 267, speed: 6,  brake: 4,  phone: 2,  trend: 'up'   },
]

export function DriverScoresSection() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const maxCount = Math.max(...scoreRanges.map(r => r.count))

  const filtered = driverScoreData.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.family.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (filter === 'excellent') return d.score >= 90
    if (filter === 'good')      return d.score >= 70 && d.score < 90
    if (filter === 'poor')      return d.score < 60
    return true
  })

  const scoreColor = (s: number) => s >= 90 ? 'var(--gold)' : s >= 80 ? '#10B981' : s >= 70 ? '#F59E0B' : s >= 60 ? '#F97316' : '#EF4444'

  return (
    <div>
      <SectionHeader title="Driver Score Dashboard" subtitle="Per-driver AI safety scores across all families on the platform" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Platform Avg Score" value="78.4/100" sub="+2.1 pts this month" icon={Gauge} />
        <StatCard label="Excellent Drivers >90" value="23,450" sub="+4.3% this month" icon={Award} iconColor="#10B981" />
        <StatCard label="Poor Drivers <50" value="4,230" sub="-1.2% improved" subColor="#EF4444" icon={AlertTriangle} iconColor="#EF4444" />
        <StatCard label="Improved This Month" value="8,920" sub="+12.4% vs last month" icon={TrendingUp} iconColor="var(--gold)" />
      </div>

      {/* Score Distribution */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Score Distribution</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {scoreRanges.map(r => (
            <div key={r.range} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', width: 130, flexShrink: 0 }}>{r.label}</div>
              <div style={{ flex: 1, background: 'var(--bg-surface2)', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ height: '100%', background: r.color, borderRadius: 99 }}
                />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', width: 50, textAlign: 'right' }}>
                {r.count.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search driver or family..." />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
          >
            <option value="all">All Scores</option>
            <option value="excellent">Excellent ≥90</option>
            <option value="good">Good 70–89</option>
            <option value="poor">Poor &lt;60</option>
          </select>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
              <Th>Driver</Th><Th>Family</Th><Th>Score</Th><Th>Trips</Th>
              <Th>Speed Events</Th><Th>Hard Braking</Th><Th>Phone Use</Th><Th>Trend</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <Td><div style={{ fontWeight: 600 }}>{d.name}</div></Td>
                <Td><span style={{ color: 'var(--text-muted)' }}>{d.family}</span></Td>
                <Td>
                  <span style={{ fontSize: 16, fontWeight: 700, color: scoreColor(d.score) }}>{d.score}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/100</span>
                </Td>
                <Td>{d.trips}</Td>
                <Td><span style={{ color: d.speed > 10 ? '#EF4444' : 'var(--text-primary)' }}>{d.speed}</span></Td>
                <Td><span style={{ color: d.brake > 10 ? '#F59E0B' : 'var(--text-primary)' }}>{d.brake}</span></Td>
                <Td><span style={{ color: d.phone > 5 ? '#EF4444' : 'var(--text-primary)' }}>{d.phone}</span></Td>
                <Td>
                  {d.trend === 'up'
                    ? <ChevronUp size={16} color="#10B981" />
                    : <ChevronDown size={16} color="#EF4444" />}
                </Td>
                <Td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {badge('View', '#3B82F6')}
                    {badge('Coach', 'var(--gold)')}
                  </div>
                </Td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 2. SpeedViolationsSection ─────────────────────────────────────────────

const speedData = [
  { driver: 'Rahul Gupta',   vehicle: 'MH 01 AB 1234', time: '08:32 AM', location: 'NH-48, Mumbai', limit: 80,  actual: 124, over: 44, severity: 'Severe' },
  { driver: 'Vikram Nair',   vehicle: 'DL 05 XY 5678', time: '09:14 AM', location: 'Ring Road, Delhi', limit: 60, actual: 91, over: 31, severity: 'Severe' },
  { driver: 'Meera Kapoor',  vehicle: 'KA 09 PQ 9012', time: '10:05 AM', location: 'Outer Ring Road, Bangalore', limit: 70, actual: 98, over: 28, severity: 'High' },
  { driver: 'Arjun Mehta',   vehicle: 'MH 12 CD 3456', time: '11:22 AM', location: 'ORR, Pune', limit: 80, actual: 104, over: 24, severity: 'High' },
  { driver: 'Kavya Reddy',   vehicle: 'TS 08 EF 7890', time: '12:47 PM', location: 'PVNR Expressway, Hyd', limit: 100, actual: 118, over: 18, severity: 'Medium' },
  { driver: 'Anita Joshi',   vehicle: 'MH 04 GH 2345', time: '02:15 PM', location: 'Eastern Express Hwy', limit: 80, actual: 96, over: 16, severity: 'Medium' },
  { driver: 'Rohan Bansal',  vehicle: 'UP 80 IJ 6789', time: '03:30 PM', location: 'Yamuna Expressway', limit: 100, actual: 112, over: 12, severity: 'Medium' },
  { driver: 'Dev Patel',     vehicle: 'GJ 01 KL 0123', time: '04:55 PM', location: 'SG Highway, Ahmedabad', limit: 80, actual: 90, over: 10, severity: 'Medium' },
]

const severityColor = (s: string) => s === 'Severe' ? '#EF4444' : s === 'High' ? '#F59E0B' : '#3B82F6'

export function SpeedViolationsSection() {
  const [search, setSearch] = useState('')
  const [sevFilter, setSevFilter] = useState('all')

  const filtered = speedData.filter(d => {
    const m = d.driver.toLowerCase().includes(search.toLowerCase()) || d.location.toLowerCase().includes(search.toLowerCase())
    if (!m) return false
    if (sevFilter !== 'all' && d.severity.toLowerCase() !== sevFilter) return false
    return true
  })

  return (
    <div>
      <SectionHeader title="Speed Violations" subtitle="Real-time speed violation logs and severity analysis across all drivers" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Violations Today" value="1,234" sub="+18.3% vs yesterday" subColor="#EF4444" icon={AlertTriangle} iconColor="#EF4444" />
        <StatCard label="Severe (>30km/h over)" value="89" sub="7.2% of total" subColor="#EF4444" icon={Zap} iconColor="#EF4444" />
        <StatCard label="Repeat Offenders" value="234" sub="Violated 3+ times" subColor="#F59E0B" icon={RefreshCw} iconColor="#F59E0B" />
        <StatCard label="Fines Issued" value="45" sub="₹2.25L total value" icon={FileText} />
      </div>

      {/* Map placeholder */}
      <Card style={{ marginBottom: 24, minHeight: 140 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <BarChart2 size={16} color="var(--gold)" />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Violation Heatmap</div>
        </div>
        <div style={{
          height: 100,
          background: 'var(--bg-surface2)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed var(--border)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Live map — hotspots in Mumbai, Delhi, Bangalore</div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
              {['Mumbai (312)', 'Delhi (289)', 'Bangalore (198)', 'Hyderabad (145)'].map(c => (
                <span key={c} style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search driver or location..." />
          <select
            value={sevFilter}
            onChange={e => setSevFilter(e.target.value)}
            style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
          >
            <option value="all">All Severity</option>
            <option value="severe">Severe</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 14px', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer' }}
          >
            <Download size={14} /> Export
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
              <Th>Driver</Th><Th>Vehicle</Th><Th>Time</Th><Th>Location</Th>
              <Th>Limit</Th><Th>Actual</Th><Th>Over By</Th><Th>Severity</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <Td><div style={{ fontWeight: 600 }}>{d.driver}</div></Td>
                <Td><span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{d.vehicle}</span></Td>
                <Td><span style={{ color: 'var(--text-muted)' }}>{d.time}</span></Td>
                <Td><span style={{ fontSize: 12 }}>{d.location}</span></Td>
                <Td>{d.limit} km/h</Td>
                <Td><span style={{ fontWeight: 700, color: '#EF4444' }}>{d.actual} km/h</span></Td>
                <Td><span style={{ fontWeight: 700, color: severityColor(d.severity) }}>+{d.over}</span></Td>
                <Td>{badge(d.severity, severityColor(d.severity))}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {badge('View', '#3B82F6')}
                    {badge('Fine', '#EF4444')}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 3. TeenDrivingSection ─────────────────────────────────────────────────

const teenData = [
  { name: 'Aarav Sharma',   age: 17, parent: 'Priya Sharma',  score: 82, night: 0,  speed: 3,  phone: 2,  lastTrip: '2h ago',   notified: true  },
  { name: 'Diya Mehta',     age: 16, parent: 'Arjun Mehta',   score: 91, night: 0,  speed: 1,  phone: 0,  lastTrip: '4h ago',   notified: false },
  { name: 'Karan Reddy',    age: 18, parent: 'Kavya Reddy',   score: 63, night: 8,  speed: 18, phone: 14, lastTrip: '30m ago',  notified: true  },
  { name: 'Ishaan Gupta',   age: 17, parent: 'Rahul Gupta',   score: 44, night: 12, speed: 26, phone: 21, lastTrip: '1h ago',   notified: true  },
  { name: 'Ananya Iyer',    age: 16, parent: 'Sneha Iyer',    score: 88, night: 1,  speed: 2,  phone: 1,  lastTrip: '5h ago',   notified: false },
  { name: 'Siddharth Nair', age: 18, parent: 'Vikram Nair',   score: 51, night: 9,  speed: 15, phone: 11, lastTrip: '3h ago',   notified: true  },
  { name: 'Tanya Joshi',    age: 17, parent: 'Anita Joshi',   score: 77, night: 3,  speed: 7,  phone: 5,  lastTrip: '6h ago',   notified: false },
  { name: 'Rohan Patel',    age: 16, parent: 'Dev Patel',     score: 95, night: 0,  speed: 0,  phone: 0,  lastTrip: '8h ago',   notified: false },
]

export function TeenDrivingSection() {
  const [search, setSearch] = useState('')

  const filtered = teenData.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.parent.toLowerCase().includes(search.toLowerCase())
  )

  const scoreColor = (s: number) => s >= 80 ? '#10B981' : s >= 60 ? '#F59E0B' : '#EF4444'

  return (
    <div>
      <SectionHeader title="Teen Driving Monitor" subtitle="Dedicated safety panel for teen drivers with parental notification system" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Teen Drivers" value="34,230" sub="+1,234 this month" icon={Users} />
        <StatCard label="Safe Scorers >80" value="28,100" sub="82.1% of all teens" icon={Shield} iconColor="#10B981" />
        <StatCard label="Alerts Today" value="234" sub="Night + Speed + Phone" subColor="#F59E0B" icon={AlertTriangle} iconColor="#F59E0B" />
        <StatCard label="Parents Notified" value="198" sub="84.6% notification rate" icon={Bell} iconColor="#3B82F6" />
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search teen or parent..." />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
              <Th>Teen</Th><Th>Age</Th><Th>Parent</Th><Th>Score</Th>
              <Th>Night Driving</Th><Th>Over Speed</Th><Th>Phone Use</Th><Th>Last Trip</Th><Th>Notified</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <Td><div style={{ fontWeight: 600 }}>{d.name}</div></Td>
                <Td>{d.age} yrs</Td>
                <Td><span style={{ color: 'var(--text-muted)' }}>{d.parent}</span></Td>
                <Td><span style={{ fontWeight: 700, color: scoreColor(d.score) }}>{d.score}/100</span></Td>
                <Td>
                  <span style={{ color: d.night > 5 ? '#EF4444' : 'var(--text-primary)', fontWeight: d.night > 5 ? 700 : 400 }}>
                    {d.night} trips {d.night > 5 && '⚠'}
                  </span>
                </Td>
                <Td>
                  <span style={{ color: d.speed > 10 ? '#EF4444' : 'var(--text-primary)', fontWeight: d.speed > 10 ? 700 : 400 }}>
                    {d.speed} events
                  </span>
                </Td>
                <Td>
                  <span style={{ color: d.phone > 8 ? '#EF4444' : d.phone > 3 ? '#F59E0B' : 'var(--text-primary)', fontWeight: d.phone > 3 ? 700 : 400 }}>
                    {d.phone} times {d.phone > 8 && '⚠'}
                  </span>
                </Td>
                <Td><span style={{ color: 'var(--text-muted)' }}>{d.lastTrip}</span></Td>
                <Td>{d.notified ? badge('Notified', '#10B981') : badge('Pending', '#F59E0B')}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {badge('View', '#3B82F6')}
                    {badge('Alert', '#F59E0B')}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 4. RiskDetectionSection ─────────────────────────────────────────────

const riskAlerts = [
  { driver: 'Vikram Nair',    riskType: 'Speed Pattern',       score: 94, lastEvent: '2m ago',   rec: 'Immediate block recommended',  city: 'Delhi'    },
  { driver: 'Ishaan Gupta',   riskType: 'Phone Addiction',     score: 91, lastEvent: '5m ago',   rec: 'Notify parent + coaching',     city: 'Pune'     },
  { driver: 'Karan Reddy',    riskType: 'Night Driving Pattern',score: 87, lastEvent: '12m ago',  rec: 'Set night driving curfew',     city: 'Hyderabad'},
  { driver: 'Meera Kapoor',   riskType: 'Fatigue Pattern',     score: 83, lastEvent: '25m ago',  rec: 'Suggest rest stop alert',      city: 'Mumbai'   },
  { driver: 'Rahul Gupta',    riskType: 'Speed Pattern',       score: 79, lastEvent: '34m ago',  rec: 'Send speed coaching tips',     city: 'Chennai'  },
  { driver: 'Siddharth Nair', riskType: 'Night Driving Pattern',score: 75, lastEvent: '1h ago',   rec: 'Notify parent immediately',    city: 'Bangalore'},
  { driver: 'Anita Joshi',    riskType: 'Fatigue Pattern',     score: 71, lastEvent: '2h ago',   rec: 'Monitor for 24 hours',         city: 'Kolkata'  },
]

const riskTypeColor = (t: string) => {
  if (t.includes('Speed')) return '#EF4444'
  if (t.includes('Phone')) return '#F59E0B'
  if (t.includes('Night')) return '#8B5CF6'
  return '#F97316'
}

export function RiskDetectionSection() {
  const [search, setSearch] = useState('')

  const filtered = riskAlerts.filter(d =>
    d.driver.toLowerCase().includes(search.toLowerCase()) ||
    d.riskType.toLowerCase().includes(search.toLowerCase())
  )

  const riskScoreColor = (s: number) => s >= 85 ? '#EF4444' : s >= 70 ? '#F59E0B' : '#3B82F6'

  return (
    <div>
      <SectionHeader title="AI Risk Detection" subtitle="Real-time AI-powered driving risk alerts requiring human review or automated action" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="High Risk Drivers" value="4,230" sub="Risk score >70" subColor="#EF4444" icon={AlertTriangle} iconColor="#EF4444" />
        <StatCard label="Active Alerts" value="89" sub="Requires attention" subColor="#F59E0B" icon={Bell} iconColor="#F59E0B" />
        <StatCard label="Auto-Notified" value="67" sub="75.3% auto-handled" icon={CheckCircle} iconColor="#10B981" />
        <StatCard label="Human Review Required" value="22" sub="24.7% escalated" subColor="#EF4444" icon={Eye} iconColor="#EF4444" />
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search driver or risk type..." />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Live · Updates every 30s</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {filtered.map((d, i) => {
            const tc = riskTypeColor(d.riskType)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  padding: '14px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ width: 4, height: 40, borderRadius: 99, background: tc, flexShrink: 0 }} />
                <div style={{ flex: '1 1 140px', minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{d.driver}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.city}</div>
                </div>
                <div style={{ flex: '1 1 160px' }}>{badge(d.riskType, tc)}</div>
                <div style={{ flex: '0 0 80px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Risk Score</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: riskScoreColor(d.score) }}>{d.score}</div>
                </div>
                <div style={{ flex: '0 0 80px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Last Event</div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{d.lastEvent}</div>
                </div>
                <div style={{ flex: '1 1 200px', fontSize: 12, color: 'var(--text-muted)' }}>{d.rec}</div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {badge('Notify', '#3B82F6')}
                  {badge('Block', '#EF4444')}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── 5. AIDrivingCoachSection ─────────────────────────────────────────────

const coachingData = [
  { driver: 'Rahul Gupta',    before: 62, after: 74, tips: 24, sessions: 8,  improvement: 19.4, status: 'Active'    },
  { driver: 'Meera Kapoor',   before: 58, after: 71, tips: 31, sessions: 11, improvement: 22.4, status: 'Active'    },
  { driver: 'Kavya Reddy',    before: 76, after: 82, tips: 15, sessions: 5,  improvement: 7.9,  status: 'Active'    },
  { driver: 'Arjun Mehta',    before: 81, after: 88, tips: 12, sessions: 4,  improvement: 8.6,  status: 'Active'    },
  { driver: 'Vikram Nair',    before: 47, after: 55, tips: 38, sessions: 14, improvement: 17.0, status: 'Active'    },
  { driver: 'Siddharth Nair', before: 51, after: 64, tips: 29, sessions: 9,  improvement: 25.5, status: 'Completed' },
  { driver: 'Anita Joshi',    before: 73, after: 79, tips: 18, sessions: 6,  improvement: 8.2,  status: 'Completed' },
  { driver: 'Karan Reddy',    before: 63, after: 70, tips: 22, sessions: 7,  improvement: 11.1, status: 'Active'    },
]

const coachingTips = [
  { icon: Gauge,        title: 'Speed Awareness',     desc: 'Gentle reminders when approaching speed limits. Shown 3x/day max.' },
  { icon: Phone,        title: 'Phone-Free Driving',  desc: 'Notification to put phone face-down when trip starts.' },
  { icon: Moon,         title: 'Night Drive Safety',  desc: 'Pre-trip checklist and fatigue alerts for drives after 10 PM.' },
  { icon: TrendingUp,   title: 'Weekly Progress',     desc: 'Sunday summary of score improvement and top 3 achievements.' },
  { icon: Award,        title: 'Score Milestones',    desc: 'Celebrate when driver crosses 70, 80, 90 score thresholds.' },
]

export function AIDrivingCoachSection() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = coachingData.filter(d => {
    const m = d.driver.toLowerCase().includes(search.toLowerCase())
    if (!m) return false
    if (statusFilter !== 'all' && d.status.toLowerCase() !== statusFilter) return false
    return true
  })

  return (
    <div>
      <SectionHeader title="AI Driving Coach" subtitle="Automated personalised coaching sessions improving driver scores across the platform" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Active Coaching Sessions" value="23,450" sub="+3.4% this week" icon={PlayCircle} />
        <StatCard label="Tips Sent This Week" value="1,23,450" sub="5.3 tips/driver avg" icon={Send} iconColor="#3B82F6" />
        <StatCard label="Improvement Rate" value="34.2%" sub="+2.1% vs last month" icon={TrendingUp} iconColor="#10B981" />
        <StatCard label="Avg Score Gain" value="+8.3 pts" sub="per month of coaching" icon={Star} iconColor="var(--gold)" />
      </div>

      {/* Tips library */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>Coaching Tips Library</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {coachingTips.map((tip, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2 }}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}
            >
              <tip.icon size={20} color="var(--gold)" style={{ marginBottom: 10 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{tip.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{tip.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search driver..." />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
              <Th>Driver</Th><Th>Score Before</Th><Th>Score After</Th>
              <Th>Tips Sent</Th><Th>Sessions</Th><Th>Improvement</Th><Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <Td><div style={{ fontWeight: 600 }}>{d.driver}</div></Td>
                <Td><span style={{ color: '#EF4444', fontWeight: 600 }}>{d.before}/100</span></Td>
                <Td><span style={{ color: '#10B981', fontWeight: 600 }}>{d.after}/100</span></Td>
                <Td>{d.tips}</Td>
                <Td>{d.sessions}</Td>
                <Td>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>+{d.improvement}%</span>
                </Td>
                <Td>{badge(d.status, d.status === 'Active' ? '#10B981' : '#3B82F6')}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 6. AIGuardianSection ─────────────────────────────────────────────────

const guardianPredictions = [
  { user: 'Priya Sharma',  risk: 'Low Speed Violation',  confidence: 94, time: '10:32 AM', outcome: 'Correct'   },
  { user: 'Rahul Gupta',   risk: 'High Speed Violation', confidence: 91, time: '10:45 AM', outcome: 'Correct'   },
  { user: 'Ananya Iyer',   risk: 'Night Drive Risk',     confidence: 87, time: '11:02 AM', outcome: 'Correct'   },
  { user: 'Karan Reddy',   risk: 'Phone Distraction',   confidence: 83, time: '11:18 AM', outcome: 'Incorrect' },
  { user: 'Dev Patel',     risk: 'Low SOS Risk',        confidence: 96, time: '11:34 AM', outcome: 'Correct'   },
  { user: 'Meera Kapoor',  risk: 'Fatigue Alert',       confidence: 78, time: '11:51 AM', outcome: 'Correct'   },
  { user: 'Vikram Nair',   risk: 'Severe Speed Risk',   confidence: 98, time: '12:05 PM', outcome: 'Correct'   },
]

export function AIGuardianSection() {
  const [search, setSearch] = useState('')

  const filtered = guardianPredictions.filter(d =>
    d.user.toLowerCase().includes(search.toLowerCase()) || d.risk.toLowerCase().includes(search.toLowerCase())
  )

  const confusionMatrix = [
    ['',         'Pred. Pos', 'Pred. Neg'],
    ['Act. Pos', '4,821',     '247'      ],
    ['Act. Neg', '281',       '4,573'    ],
  ]

  return (
    <div>
      <SectionHeader title="AI Safety Guardian" subtitle="Model performance, prediction accuracy, and live outcome tracking" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Predictions This Month" value="1.2M" sub="+14.3% vs last month" icon={Brain} />
        <StatCard label="Accuracy Rate" value="94.2%" sub="+0.3% this month" icon={Target} iconColor="#10B981" />
        <StatCard label="Alerts Prevented" value="12,340" sub="Proactive safety actions" icon={Shield} iconColor="#10B981" />
        <StatCard label="Manual Overrides" value="234" sub="1.9% override rate" subColor="#F59E0B" icon={RefreshCw} iconColor="#F59E0B" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Model performance */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Model Performance Metrics</div>
          {[
            { label: 'Precision', value: '93.4%', bar: 93.4, color: '#10B981' },
            { label: 'Recall',    value: '95.1%', bar: 95.1, color: '#3B82F6' },
            { label: 'F1 Score',  value: '0.942', bar: 94.2, color: 'var(--gold)' },
            { label: 'AUC-ROC',   value: '0.971', bar: 97.1, color: '#8B5CF6' },
          ].map(m => (
            <div key={m.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{m.value}</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-surface2)', borderRadius: 99 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.bar}%` }}
                  transition={{ duration: 0.8 }}
                  style={{ height: '100%', borderRadius: 99, background: m.color }}
                />
              </div>
            </div>
          ))}
        </Card>

        {/* Confusion matrix */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Confusion Matrix</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {confusionMatrix.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => {
                    const isHeader = ri === 0 || ci === 0
                    const isTP = ri === 1 && ci === 1
                    const isTN = ri === 2 && ci === 2
                    return (
                      <td
                        key={ci}
                        style={{
                          padding: '12px 16px',
                          fontSize: isHeader ? 11 : 16,
                          fontWeight: isHeader ? 600 : 800,
                          color: isTP ? '#10B981' : isTN ? '#10B981' : isHeader ? 'var(--text-muted)' : '#EF4444',
                          textAlign: 'center',
                          background: isTP || isTN ? 'rgba(16,185,129,0.08)' : 'transparent',
                          border: '1px solid var(--border)',
                          borderRadius: 4,
                          textTransform: isHeader ? 'uppercase' as const : 'none' as const,
                          letterSpacing: isHeader ? '0.04em' : 0,
                        }}
                      >{cell}</td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search user or risk type..." />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
              <Th>User</Th><Th>Predicted Risk</Th><Th>Confidence</Th><Th>Time</Th><Th>Outcome</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <Td><div style={{ fontWeight: 600 }}>{d.user}</div></Td>
                <Td><span style={{ fontSize: 12 }}>{d.risk}</span></Td>
                <Td>
                  <span style={{ fontWeight: 700, color: d.confidence >= 90 ? '#10B981' : '#F59E0B' }}>{d.confidence}%</span>
                </Td>
                <Td><span style={{ color: 'var(--text-muted)' }}>{d.time}</span></Td>
                <Td>{d.outcome === 'Correct' ? badge('Correct', '#10B981') : badge('Incorrect', '#EF4444')}</Td>
                <Td>{badge('Details', '#3B82F6')}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 7. SafetyPredictionsSection ──────────────────────────────────────────

const monthlyAccuracy = [
  { month: 'Jul', acc: 89 }, { month: 'Aug', acc: 90 }, { month: 'Sep', acc: 91 },
  { month: 'Oct', acc: 90 }, { month: 'Nov', acc: 92 }, { month: 'Dec', acc: 93 },
  { month: 'Jan', acc: 93 }, { month: 'Feb', acc: 94 }, { month: 'Mar', acc: 93 },
  { month: 'Apr', acc: 95 }, { month: 'May', acc: 94 }, { month: 'Jun', acc: 94 },
]

const predCategories = [
  { name: 'SOS Likelihood',    count: '8,234',  accuracy: 97.1, color: '#EF4444' },
  { name: 'Geofence Breach',   count: '12,450', accuracy: 94.3, color: '#F59E0B' },
  { name: 'Device Offline',    count: '4,120',  accuracy: 91.8, color: '#3B82F6' },
  { name: 'Driving Risk',      count: '23,450', accuracy: 93.5, color: '#8B5CF6' },
]

const topPredictedRisks = [
  { user: 'Vikram Nair',   risk: 'Severe Speed Violation',  prob: '96%', window: 'Next 2h' },
  { user: 'Ishaan Gupta',  risk: 'Phone Use While Driving', prob: '91%', window: 'Next 1h' },
  { user: 'Karan Reddy',   risk: 'Night Driving After 11PM',prob: '88%', window: 'Tonight' },
  { user: 'Meera Kapoor',  risk: 'Fatigue-based Accident',  prob: '84%', window: 'Next 3h' },
  { user: 'Rahul Gupta',   risk: 'Speed Violation (Highway)',prob: '81%', window: 'Next 4h' },
]

export function SafetyPredictionsSection() {
  return (
    <div>
      <SectionHeader title="Safety Predictions" subtitle="ML-based safety forecasts using historical patterns and real-time telemetry" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Today's High Risk Users" value="2,341" sub="Above risk threshold 0.8" subColor="#EF4444" icon={AlertTriangle} iconColor="#EF4444" />
        <StatCard label="Predictions Today" value="1.2M" sub="Batch + real-time combined" icon={Brain} />
        <StatCard label="Avg Prediction Accuracy" value="94.2%" sub="+0.8% vs last month" icon={Target} iconColor="#10B981" />
        <StatCard label="Next Batch Run" value="11:30 PM" sub="~8.2M predictions queued" subColor="#3B82F6" icon={Clock} iconColor="#3B82F6" />
      </div>

      {/* Accuracy trend */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Prediction Accuracy — 12 Month Trend</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
          {monthlyAccuracy.map((m, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(m.acc - 85) * 8}px` }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
                style={{ width: '100%', background: 'var(--gold)', borderRadius: '4px 4px 0 0', minHeight: 4 }}
              />
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{m.month}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)' }}>{m.acc}%</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Prediction categories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {predCategories.map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2 }}
            style={{ background: 'var(--bg-surface)', border: `1px solid ${c.color}33`, borderRadius: 12, padding: 20 }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>{c.name}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.count}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Accuracy: <span style={{ color: '#10B981', fontWeight: 600 }}>{c.accuracy}%</span></div>
          </motion.div>
        ))}
      </div>

      {/* Top predicted risks */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
          Top Predicted Risks — Next 4 Hours
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
              <Th>User</Th><Th>Risk</Th><Th>Probability</Th><Th>Time Window</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {topPredictedRisks.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <Td><div style={{ fontWeight: 600 }}>{r.user}</div></Td>
                <Td><span style={{ fontSize: 12 }}>{r.risk}</span></Td>
                <Td><span style={{ fontWeight: 700, color: '#EF4444' }}>{r.prob}</span></Td>
                <Td><span style={{ color: 'var(--text-muted)' }}>{r.window}</span></Td>
                <Td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {badge('Notify', '#3B82F6')}
                    {badge('Monitor', '#F59E0B')}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 8. AIReportsSection ─────────────────────────────────────────────────

const reportRows = [
  { name: 'Weekly Safety Summary',    type: 'Safety Summary',  generated: 'Today 06:00 AM', recipients: 1240, status: 'Sent'      },
  { name: 'High Risk Driver Digest',  type: 'Risk Digest',     generated: 'Today 07:30 AM', recipients: 12,   status: 'Sent'      },
  { name: 'Family Wellness Report',   type: 'Family Wellness', generated: 'Today 08:00 AM', recipients: 8923, status: 'Sent'      },
  { name: 'Revenue Forecast Q2',      type: 'Revenue Forecast',generated: 'Jun 12 09:00 AM',recipients: 5,    status: 'Delivered' },
  { name: 'Anomaly Report — June',    type: 'Anomaly Report',  generated: 'Jun 12 10:00 AM',recipients: 8,    status: 'Delivered' },
  { name: 'Daily Driver Score Digest',type: 'Safety Summary',  generated: 'Scheduled 11PM', recipients: 234,  status: 'Scheduled' },
  { name: 'Teen Safety Weekly',       type: 'Family Wellness', generated: 'Scheduled Sun',  recipients: 3412, status: 'Scheduled' },
]

const reportTypeColor = (t: string) => {
  if (t === 'Safety Summary')  return '#10B981'
  if (t === 'Risk Digest')     return '#EF4444'
  if (t === 'Family Wellness') return '#3B82F6'
  if (t === 'Revenue Forecast')return 'var(--gold)'
  return '#8B5CF6'
}

export function AIReportsSection() {
  const [search, setSearch] = useState('')
  const [showSchedule, setShowSchedule] = useState(false)

  const filtered = reportRows.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase())
  )

  const statusColor = (s: string) => s === 'Sent' || s === 'Delivered' ? '#10B981' : '#F59E0B'

  return (
    <div>
      <SectionHeader title="AI Reports" subtitle="Automated AI-generated reports with scheduling and multi-channel distribution" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Reports Generated" value="8,234" sub="This month" icon={FileText} />
        <StatCard label="Scheduled Reports" value="4" sub="Running on cron" icon={Clock} iconColor="#3B82F6" />
        <StatCard label="On-Demand Reports" value="8,230" sub="User-triggered" icon={RefreshCw} />
        <StatCard label="Distribution Channels" value="3" sub="Email · SMS · In-App" icon={Send} iconColor="var(--gold)" />
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search report name or type..." />
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--gold)', border: 'none', borderRadius: 6, padding: '6px 14px', color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const }}
          >
            <Settings size={13} /> {showSchedule ? 'Close' : 'Schedule Manager'}
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
              <Th>Report Name</Th><Th>Type</Th><Th>Generated</Th><Th>Recipients</Th><Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <Td><div style={{ fontWeight: 600 }}>{r.name}</div></Td>
                <Td>{badge(r.type, reportTypeColor(r.type))}</Td>
                <Td><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.generated}</span></Td>
                <Td>{r.recipients.toLocaleString()}</Td>
                <Td>{badge(r.status, statusColor(r.status))}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {badge('View', '#3B82F6')}
                    {badge('Download', '#10B981')}
                    {badge('Share', '#F59E0B')}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showSchedule && (
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Schedule Manager — Create Scheduled Report</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { label: 'Report Name', placeholder: 'e.g. Weekly Safety Digest' },
              { label: 'Report Type', placeholder: 'Safety Summary' },
              { label: 'Schedule (Cron)', placeholder: '0 6 * * 1' },
              { label: 'Recipients (emails)', placeholder: 'admin@gravity.in' },
              { label: 'Distribution Channel', placeholder: 'Email, SMS, In-App' },
            ].map((f, i) => (
              <div key={i}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{f.label}</div>
                <input
                  placeholder={f.placeholder}
                  style={{ width: '100%', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>
            ))}
          </div>
          <button
            style={{ marginTop: 16, background: 'var(--gold)', border: 'none', borderRadius: 6, padding: '8px 20px', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            Create Scheduled Report
          </button>
        </Card>
      )}
    </div>
  )
}

// ─── 9. AIChatLogsSection ─────────────────────────────────────────────────

const chatLogs = [
  { time: '10:01 AM', user: 'Priya Sharma',  query: 'Where is my daughter right now?',                      category: 'Location',  respTime: '0.6s', satisfaction: 5 },
  { time: '10:04 AM', user: 'Rahul Gupta',   query: 'Why did I get a speed alert just now?',                  category: 'Safety',    respTime: '0.9s', satisfaction: 4 },
  { time: '10:09 AM', user: 'Kavya Reddy',   query: 'How do I add a new geofence for school?',                category: 'General',   respTime: '0.7s', satisfaction: 5 },
  { time: '10:15 AM', user: 'Arjun Mehta',   query: 'Send SOS to emergency contact',                          category: 'Alerts',    respTime: '0.4s', satisfaction: 5 },
  { time: '10:22 AM', user: 'Sneha Iyer',    query: 'Show me my son\'s driving score history last month',     category: 'Safety',    respTime: '1.1s', satisfaction: 4 },
  { time: '10:31 AM', user: 'Dev Patel',     query: 'Why is my GPS not updating?',                            category: 'General',   respTime: '0.8s', satisfaction: 3 },
  { time: '10:38 AM', user: 'Anita Joshi',   query: 'My husband has been at the same location for 3 hours',  category: 'Location',  respTime: '0.6s', satisfaction: 5 },
  { time: '10:45 AM', user: 'Meera Kapoor',  query: 'Turn off late night driving alerts for weekends',        category: 'Alerts',    respTime: '0.9s', satisfaction: 4 },
  { time: '10:52 AM', user: 'Vikram Nair',   query: 'What is my safety score and how to improve it?',         category: 'Safety',    respTime: '0.7s', satisfaction: 5 },
  { time: '11:00 AM', user: 'Rohan Bansal',  query: 'Family trip to Pune this weekend, how to track everyone',category: 'Location',  respTime: '1.2s', satisfaction: 4 },
]

const topTerms = [
  { term: 'location', count: 3412 }, { term: 'safety score', count: 2890 }, { term: 'geofence', count: 2341 },
  { term: 'SOS', count: 1987 }, { term: 'driving alert', count: 1763 }, { term: 'teen driving', count: 1432 },
  { term: 'speed limit', count: 1298 }, { term: 'family track', count: 1187 }, { term: 'night driving', count: 987 }, { term: 'GPS offline', count: 834 },
]

const catColor = (c: string) => c === 'Safety' ? '#10B981' : c === 'Location' ? '#3B82F6' : c === 'Alerts' ? '#EF4444' : '#F59E0B'

export function AIChatLogsSection() {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')

  const filtered = chatLogs.filter(d => {
    const m = d.user.toLowerCase().includes(search.toLowerCase()) || d.query.toLowerCase().includes(search.toLowerCase())
    if (!m) return false
    if (catFilter !== 'all' && d.category.toLowerCase() !== catFilter.toLowerCase()) return false
    return true
  })

  const satisfaction = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

  return (
    <div>
      <SectionHeader title="AI Chat Logs" subtitle="All AI assistant conversations — query analysis, response times, and satisfaction" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Queries Today" value="1,247" sub="+8.4% vs yesterday" icon={MessageSquare} />
        <StatCard label="Users Asking" value="890" sub="71.4% of active users" icon={Users} iconColor="#3B82F6" />
        <StatCard label="Avg Response Time" value="0.8s" sub="-0.1s this week" icon={Zap} iconColor="#10B981" />
        <StatCard label="Top Topic" value="Safety 34%" sub="Location 28% · Alerts 20%" icon={BarChart2} iconColor="var(--gold)" />
      </div>

      {/* Topic distribution */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Topic Distribution</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
          {[
            { label: 'Safety',   pct: 34, color: '#10B981' },
            { label: 'Location', pct: 28, color: '#3B82F6' },
            { label: 'General',  pct: 18, color: '#F59E0B' },
            { label: 'Alerts',   pct: 20, color: '#EF4444' },
          ].map(t => (
            <div key={t.label} style={{ flex: 1, minWidth: 100 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.pct}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-surface2)', borderRadius: 99 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${t.pct}%` }}
                  transition={{ duration: 0.7 }}
                  style={{ height: '100%', borderRadius: 99, background: t.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Table */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search user or query..." />
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
            >
              <option value="all">All Categories</option>
              <option value="Safety">Safety</option>
              <option value="Location">Location</option>
              <option value="Alerts">Alerts</option>
              <option value="General">General</option>
            </select>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                <Th>Time</Th><Th>User</Th><Th>Query</Th><Th>Category</Th><Th>Resp</Th><Th>Rating</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <Td><span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' as const }}>{d.time}</span></Td>
                  <Td><div style={{ fontWeight: 600, fontSize: 12 }}>{d.user}</div></Td>
                  <Td><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.query.substring(0, 40)}{d.query.length > 40 ? '…' : ''}</span></Td>
                  <Td>{badge(d.category, catColor(d.category))}</Td>
                  <Td><span style={{ fontSize: 12, color: '#10B981' }}>{d.respTime}</span></Td>
                  <Td><span style={{ fontSize: 11, color: 'var(--gold)' }}>{satisfaction(d.satisfaction)}</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Word cloud / top terms */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>Top Query Terms</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topTerms.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', fontWeight: i < 3 ? 700 : 400 }}>{t.term}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', width: 40, textAlign: 'right' }}>{(t.count / 1000).toFixed(1)}k</div>
                <div style={{ width: 60, height: 4, background: 'var(--bg-surface2)', borderRadius: 99 }}>
                  <div style={{ height: '100%', borderRadius: 99, background: 'var(--gold)', width: `${(t.count / 3412) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── 10. AIModelsSection ─────────────────────────────────────────────────

const aiModels = [
  {
    name: 'Safety Predictor', version: 'v2.3', accuracy: 94.2,
    reqDay: '8,23,450', latency: '34ms', status: 'Active',
    precision: 93.4, recall: 95.1,
  },
  {
    name: 'Driving Coach', version: 'v1.8', accuracy: 91.7,
    reqDay: '2,34,120', latency: '28ms', status: 'Active',
    precision: 90.8, recall: 92.3,
  },
  {
    name: 'Anomaly Detector', version: 'v3.1', accuracy: 96.8,
    reqDay: '4,12,300', latency: '19ms', status: 'Active',
    precision: 97.1, recall: 96.4,
  },
]

const deployHistory = [
  { model: 'Safety Predictor v2.3',  date: 'Jun 10 2026', by: 'Arjun Mehta',   status: 'Success',  change: 'Accuracy +1.2%' },
  { model: 'Driving Coach v1.8',     date: 'May 28 2026', by: 'Priya Sharma',  status: 'Success',  change: 'Latency -8ms'  },
  { model: 'Anomaly Detector v3.1',  date: 'May 15 2026', by: 'Dev Patel',     status: 'Success',  change: 'New patterns added' },
  { model: 'Safety Predictor v2.2',  date: 'Apr 02 2026', by: 'Kavya Reddy',   status: 'Rollback', change: 'Reverted: drop in recall' },
  { model: 'Anomaly Detector v3.0',  date: 'Mar 18 2026', by: 'Rahul Gupta',   status: 'Success',  change: 'Speed model retrain' },
]

export function AIModelsSection() {
  const maxAcc = 100

  return (
    <div>
      <SectionHeader title="AI Model Management" subtitle="Production model status, performance metrics, deployment history and retraining controls" />

      {/* Model cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        {aiModels.map((m, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -3 }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{m.version}</div>
              </div>
              {badge(m.status, '#10B981')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Accuracy',     val: `${m.accuracy}%`  },
                { label: 'Req/Day',      val: m.reqDay          },
                { label: 'Latency',      val: m.latency         },
                { label: 'Precision',    val: `${m.precision}%` },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{s.val}</div>
                </div>
              ))}
            </div>
            {/* Accuracy bar */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Accuracy</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>{m.accuracy}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-surface2)', borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, background: 'var(--gold)', width: `${(m.accuracy / maxAcc) * 100}%` }} />
              </div>
            </div>
            <button
              style={{ width: '100%', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 0', color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <RotateCcw size={13} /> Retrain Model
            </button>
          </motion.div>
        ))}
      </div>

      {/* Accuracy comparison bar chart */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Accuracy Comparison</div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', height: 120 }}>
          {aiModels.map((m, i) => {
            const colors = ['var(--gold)', '#10B981', '#3B82F6']
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors[i] }}>{m.accuracy}%</div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${m.accuracy - 88}px` }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  style={{ width: '100%', background: colors[i], borderRadius: '6px 6px 0 0', minHeight: 8, maxHeight: 90 }}
                />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>{m.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.version}</div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Deployment history */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
          Deployment History
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
              <Th>Model</Th><Th>Date</Th><Th>Deployed By</Th><Th>Change</Th><Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {deployHistory.map((d, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <Td><div style={{ fontWeight: 600, fontSize: 12 }}>{d.model}</div></Td>
                <Td><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{d.date}</span></Td>
                <Td>{d.by}</Td>
                <Td><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.change}</span></Td>
                <Td>{badge(d.status, d.status === 'Success' ? '#10B981' : '#EF4444')}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 11. AIConfigSection ─────────────────────────────────────────────────

const defaultToggles = {
  safetyPredictions: true,
  drivingCoach: true,
  autoNotifications: true,
  anomalyDetection: true,
  familyInsights: true,
  realTimeScoring: true,
}

export function AIConfigSection() {
  const [toggles, setToggles] = useState(defaultToggles)
  const [confidence, setConfidence] = useState(80)
  const [batchSize, setBatchSize] = useState('10000')
  const [predWindow, setPredWindow] = useState('4')
  const [alertDelay, setAlertDelay] = useState('2')
  const [saved, setSaved] = useState(false)

  const flip = (key: keyof typeof defaultToggles) =>
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const toggleRows: { label: string; sub: string; key: keyof typeof defaultToggles }[] = [
    { label: 'Safety Predictions',   sub: 'ML-based risk forecasts for all users',        key: 'safetyPredictions'  },
    { label: 'Driving Coach',        sub: 'Automated personalised coaching messages',       key: 'drivingCoach'       },
    { label: 'Auto-Notifications',   sub: 'Push alerts when risk threshold is exceeded',   key: 'autoNotifications'  },
    { label: 'Anomaly Detection',    sub: 'Real-time detection of unusual driving patterns',key: 'anomalyDetection'   },
    { label: 'Family Insights',      sub: 'Weekly AI-generated family safety digest',       key: 'familyInsights'     },
    { label: 'Real-time Scoring',    sub: 'Live driver score updates during trips',         key: 'realTimeScoring'    },
  ]

  return (
    <div>
      <SectionHeader title="AI Configuration" subtitle="Toggle AI features and tune model parameters for the entire platform" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Feature toggles */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Feature Toggles</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {toggleRows.map((row, i) => (
              <div
                key={row.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: i < toggleRows.length - 1 ? '1px solid var(--border)' : 'none',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{row.sub}</div>
                </div>
                <Toggle on={toggles[row.key]} onToggle={() => flip(row.key)} />
              </div>
            ))}
          </div>
        </Card>

        {/* Config fields */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>Model Parameters</div>

          {/* Confidence threshold slider */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Confidence Threshold</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Minimum confidence to trigger an alert</div>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>{confidence}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={99}
              value={confidence}
              onChange={e => setConfidence(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
              <span>50% (loose)</span><span>99% (strict)</span>
            </div>
          </div>

          {/* Other config fields */}
          {[
            { label: 'Batch Size',           sub: 'Users processed per prediction job', value: batchSize,   set: setBatchSize,  placeholder: '10000' },
            { label: 'Prediction Window (h)', sub: 'Forecast horizon in hours',          value: predWindow,  set: setPredWindow,  placeholder: '4'     },
            { label: 'Alert Delay (min)',     sub: 'Wait before sending repeat alerts',  value: alertDelay,  set: setAlertDelay,  placeholder: '2'     },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{f.sub}</div>
              <input
                type="number"
                value={f.value}
                onChange={e => f.set(e.target.value)}
                placeholder={f.placeholder}
                style={{ width: '100%', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }}
              />
            </div>
          ))}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            style={{
              marginTop: 8,
              width: '100%',
              background: saved ? '#10B981' : 'var(--gold)',
              border: 'none',
              borderRadius: 8,
              padding: '10px 0',
              color: '#000',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'background 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {saved ? <><CheckCircle size={16} /> Settings Saved!</> : <><Settings size={16} /> Save Settings</>}
          </motion.button>
        </Card>
      </div>
    </div>
  )
}
