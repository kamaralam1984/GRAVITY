'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  School,
  Bus,
  Bell,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  Search,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  UserCheck,
} from 'lucide-react'

interface SafetyEvent {
  id: string
  child: string
  guardian: string
  type: string
  location: string
  time: string
  status: 'safe' | 'alert' | 'pending'
  notified: boolean
}

interface SchoolRecord {
  id: string
  name: string
  students: number
  geofenceActive: boolean
  dismissalMode: boolean
  todayArrivals: number
}

interface GuardianRequest {
  id: string
  child: string
  requestor: string
  relationship: string
  requestedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

const EVENTS: SafetyEvent[] = [
  { id: 'EVT-001', child: 'Aanya Sharma', guardian: 'Priya Sharma', type: 'school_arrival', location: 'Delhi Public School, Vasant Kunj', time: '07:52 AM', status: 'safe', notified: true },
  { id: 'EVT-002', child: 'Rohan Kumar', guardian: 'Rajesh Kumar', type: 'geofence_exit', location: 'Left Home Zone', time: '07:45 AM', status: 'safe', notified: true },
  { id: 'EVT-003', child: 'Kavya Nair', guardian: 'Sunita Nair', type: 'school_arrival', location: 'Kendriya Vidyalaya, Juhu', time: '07:38 AM', status: 'safe', notified: true },
  { id: 'EVT-004', child: 'Aryan Mehta', guardian: 'Deepak Mehta', type: 'late_arrival', location: 'Not arrived at school', time: '08:30 AM', status: 'alert', notified: true },
  { id: 'EVT-005', child: 'Zara Singh', guardian: 'Aman Singh', type: 'school_departure', location: 'Ryan International, Noida', time: '03:15 PM', status: 'safe', notified: true },
  { id: 'EVT-006', child: 'Dev Iyer', guardian: 'Kiran Iyer', type: 'sos_triggered', location: 'Near Metro Station, Bengaluru', time: '02:44 PM', status: 'alert', notified: true },
  { id: 'EVT-007', child: 'Mia Patel', guardian: 'Anita Patel', type: 'unusual_activity', location: 'Unknown area, stationary >30min', time: '01:20 PM', status: 'alert', notified: false },
  { id: 'EVT-008', child: 'Vivaan Reddy', guardian: 'Suresh Reddy', type: 'safe_arrival_home', location: 'Arrived Home', time: '04:05 PM', status: 'safe', notified: true },
]

const SCHOOLS: SchoolRecord[] = [
  { id: 'SCH-001', name: 'Delhi Public School, Vasant Kunj', students: 284, geofenceActive: true, dismissalMode: false, todayArrivals: 241 },
  { id: 'SCH-002', name: 'Kendriya Vidyalaya, Juhu', students: 192, geofenceActive: true, dismissalMode: false, todayArrivals: 178 },
  { id: 'SCH-003', name: 'Ryan International, Noida', students: 367, geofenceActive: true, dismissalMode: true, todayArrivals: 324 },
  { id: 'SCH-004', name: 'Amity International, Gurgaon', students: 143, geofenceActive: false, dismissalMode: false, todayArrivals: 0 },
]

const GUARDIAN_REQUESTS: GuardianRequest[] = [
  { id: 'GR-001', child: 'Aanya Sharma', requestor: 'Meera Sharma (Grandmother)', relationship: 'Grandparent', requestedAt: '2 hours ago', status: 'pending' },
  { id: 'GR-002', child: 'Rohan Kumar', requestor: 'Ritu Verma (Aunt)', relationship: 'Relative', requestedAt: '1 day ago', status: 'pending' },
  { id: 'GR-003', child: 'Kavya Nair', requestor: 'Gita Krishnan (Babysitter)', relationship: 'Caregiver', requestedAt: '3 days ago', status: 'approved' },
]

const EVENT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  school_arrival:    { label: 'School Arrival', color: '#10B981' },
  school_departure:  { label: 'School Departure', color: '#4B80F0' },
  geofence_exit:     { label: 'Geofence Exit', color: '#F59E0B' },
  geofence_entry:    { label: 'Geofence Entry', color: '#10B981' },
  late_arrival:      { label: 'Late Arrival', color: '#EF4444' },
  sos_triggered:     { label: 'SOS Triggered', color: '#EF4444' },
  unusual_activity:  { label: 'Unusual Activity', color: '#F97316' },
  safe_arrival_home: { label: 'Safe Home', color: '#10B981' },
}

const BG = '#0B0D13', SURFACE = '#111420', ELEVATED = '#161926'
const BORDER = 'rgba(255,255,255,0.07)', GOLD = '#D4A853', MUTED = 'rgba(255,255,255,0.4)'

const STATS = [
  { label: 'Children Monitored', value: '8,421', sub: 'Active profiles', color: '#4B80F0', icon: <Shield size={20} /> },
  { label: 'School Arrivals Today', value: '3,247', sub: '94% of expected', color: '#10B981', icon: <School size={20} /> },
  { label: 'Geofence Alerts', value: '14', sub: 'Unresolved today', color: '#EF4444', icon: <Bell size={20} /> },
  { label: 'Guardian Requests', value: '89', sub: 'Awaiting approval', color: '#D4A853', icon: <UserCheck size={20} /> },
]

export default function ChildSafetyPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [activeTab, setActiveTab] = useState<'events' | 'schools' | 'guardians'>('events')
  const [page, setPage] = useState(1)
  const PER_PAGE = 5

  const filtered = EVENTS.filter(e => {
    const matchSearch = !search || e.child.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'All' || e.type === typeFilter
    return matchSearch && matchType
  })

  const pages = Math.ceil(filtered.length / PER_PAGE)
  const displayed = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const alerts = EVENTS.filter(e => e.status === 'alert')

  return (
    <div style={{ background: BG, minHeight: '100vh', color: 'white', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>Child Safety</h1>
            <p style={{ fontSize: 14, color: MUTED, margin: '4px 0 0' }}>School arrivals, geofence monitoring, guardian management</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: s.color, marginTop: 2 }}>{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Alert banner */}
        {alerts.length > 0 && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '14px 20px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={16} color="#EF4444" />
              <span style={{ fontSize: 13, color: '#EF4444', fontWeight: 600 }}>
                {alerts.length} active alert{alerts.length > 1 ? 's' : ''} require attention: {alerts.map(a => a.child).join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: SURFACE, borderRadius: 12, padding: 4, border: `1px solid ${BORDER}`, width: 'fit-content' }}>
          {(['events', 'schools', 'guardians'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: activeTab === tab ? ELEVATED : 'transparent', color: activeTab === tab ? 'white' : MUTED }}>
              {tab === 'events' ? 'Safety Events' : tab === 'schools' ? `Schools (${SCHOOLS.length})` : `Guardian Requests (${GUARDIAN_REQUESTS.filter(g => g.status === 'pending').length})`}
            </button>
          ))}
        </div>

        {activeTab === 'events' && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: MUTED }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by child name, location..."
                  style={{ width: '100%', padding: '10px 12px 10px 34px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
                style={{ padding: '10px 14px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
                <option>All</option>
                {Object.keys(EVENT_TYPE_LABELS).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '150px 120px 200px 100px 80px 80px', padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, background: ELEVATED }}>
                {['Child', 'Event Type', 'Location', 'Time', 'Status', 'Notified'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                ))}
              </div>
              {displayed.map((e, i) => {
                const evStyle = EVENT_TYPE_LABELS[e.type] || { label: e.type, color: MUTED }
                return (
                  <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    style={{ display: 'grid', gridTemplateColumns: '150px 120px 200px 100px 80px 80px', padding: '14px 20px', borderBottom: i < displayed.length - 1 ? `1px solid ${BORDER}` : 'none', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{e.child}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>{e.guardian}</div>
                    </div>
                    <div>
                      <span style={{ background: `${evStyle.color}18`, color: evStyle.color, borderRadius: 999, padding: '3px 8px', fontSize: 10, fontWeight: 600 }}>{evStyle.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} style={{ flexShrink: 0 }} />
                      {e.location}
                    </div>
                    <div style={{ fontSize: 12, color: MUTED, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} />
                      {e.time}
                    </div>
                    <div>
                      <span style={{ background: e.status === 'safe' ? 'rgba(16,185,129,0.1)' : e.status === 'alert' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: e.status === 'safe' ? '#10B981' : e.status === 'alert' ? '#EF4444' : '#F59E0B', borderRadius: 999, padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>
                        {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      {e.notified
                        ? <CheckCircle size={16} color="#10B981" />
                        : <AlertTriangle size={16} color="#EF4444" />}
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 13, color: MUTED }}>Showing {((page-1)*PER_PAGE)+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} style={{ padding: '7px 12px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, color: page===1 ? MUTED : 'white', cursor: page===1 ? 'not-allowed' : 'pointer' }}><ChevronLeft size={14} /></button>
                {Array.from({ length: Math.min(pages, 4) }, (_, i) => i+1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{ padding: '7px 12px', background: page===p ? GOLD : SURFACE, border: `1px solid ${page===p ? GOLD : BORDER}`, borderRadius: 8, color: page===p ? 'black' : 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages} style={{ padding: '7px 12px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, color: page===pages ? MUTED : 'white', cursor: page===pages ? 'not-allowed' : 'pointer' }}><ChevronRight size={14} /></button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'schools' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {SCHOOLS.map((school, i) => (
              <motion.div key={school.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(75,128,240,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <School size={20} color="#4B80F0" />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{school.name}</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{school.id} · {school.students} students</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#10B981', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{school.todayArrivals}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>Today's arrivals</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ background: school.geofenceActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: school.geofenceActive ? '#10B981' : '#EF4444', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                      Geofence {school.geofenceActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ background: school.dismissalMode ? 'rgba(245,158,11,0.12)' : 'rgba(107,114,128,0.1)', color: school.dismissalMode ? '#F59E0B' : MUTED, borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                      Dismissal: {school.dismissalMode ? 'ON' : 'Off'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'guardians' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {GUARDIAN_REQUESTS.map((req, i) => (
              <motion.div key={req.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 2 }}>
                    Guardian access for <span style={{ color: GOLD }}>{req.child}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{req.requestor}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{req.relationship} · Requested {req.requestedAt}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {req.status === 'pending' ? (
                    <>
                      <button style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                      <button style={{ padding: '8px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, color: '#10B981', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                    </>
                  ) : (
                    <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 600 }}>Approved</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
