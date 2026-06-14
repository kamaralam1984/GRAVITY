'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  School, Bus, ClipboardCheck, ShieldCheck, Bell, BarChart2,
  Pill, Activity, FileText, Users, Heart, Search, Filter,
  Eye, Edit, MapPin, Phone, AlertTriangle, CheckCircle,
  XCircle, Clock, ChevronDown, Send, Download, Share2,
  Navigation, Zap, TrendingUp, TrendingDown, User, Star
} from 'lucide-react'

// ─── Shared helpers ────────────────────────────────────────────────────────────

const Badge = ({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) => (
  <span style={{ background: bg, color, border: `1px solid ${border}`, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99 }}>
    {label}
  </span>
)

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; bg: string; border: string }> = {
    Active:       { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)' },
    Inactive:     { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)' },
    'On Route':   { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)' },
    Delayed:      { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
    'At School':  { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)' },
    Ended:        { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)' },
    Taken:        { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)' },
    Pending:      { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
    Missed:       { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)' },
    Overdue:      { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)' },
    Verified:     { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)' },
    Unauthorized: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)' },
    'On Duty':    { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)' },
    'Off Duty':   { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)' },
    Break:        { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
  }
  const s = map[status] ?? { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)' }
  return <Badge label={status} {...s} />
}

const card = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 } as const

const StatCard = ({ label, value, sub, subColor = '#10B981' }: { label: string; value: string; sub?: string; subColor?: string }) => (
  <div style={card}>
    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: subColor, marginTop: 6 }}>{sub}</div>}
  </div>
)

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div style={{ marginBottom: 24 }}>
    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>{subtitle}</p>
  </div>
)

const TableWrap = ({ children, search, onSearch, extra }: { children: React.ReactNode; search: string; onSearch: (v: string) => void; extra?: React.ReactNode }) => (
  <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
    <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search..."
          style={{ width: '100%', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px 6px 32px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      {extra}
    </div>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        {children}
      </table>
    </div>
  </div>
)

const TH = ({ children }: { children: React.ReactNode }) => (
  <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{children}</th>
)

const TD = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text-primary)', ...style }}>{children}</td>
)

const ActionBtn = ({ label, color = 'var(--gold)' }: { label: string; color?: string }) => (
  <button style={{ background: 'transparent', border: `1px solid ${color}`, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600, color, cursor: 'pointer' }}>{label}</button>
)

const SelectFilter = ({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) => (
  <div style={{ position: 'relative' }}>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ appearance: 'none', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 28px 6px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
    >
      <option value="">{label}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
  </div>
)

// ─── 1. SchoolManagementSection ────────────────────────────────────────────────

const SCHOOLS = [
  { name: 'Delhi Public School', city: 'Delhi',     board: 'CBSE',  students: 2340, contact: '+91 98110 12345', routes: 12, status: 'Active' },
  { name: 'Kendriya Vidyalaya',  city: 'Mumbai',    board: 'CBSE',  students: 1890, contact: '+91 98220 23456', routes: 9,  status: 'Active' },
  { name: 'Bishop Cotton School',city: 'Bangalore', board: 'ICSE',  students: 1540, contact: '+91 80123 34567', routes: 7,  status: 'Active' },
  { name: 'DAV Public School',   city: 'Hyderabad', board: 'CBSE',  students: 1320, contact: '+91 40123 45678', routes: 6,  status: 'Active' },
  { name: 'St. Xavier\'s School',city: 'Kolkata',   board: 'ICSE',  students: 1205, contact: '+91 33123 56789', routes: 5,  status: 'Active' },
  { name: 'Amrita Vidyalayam',   city: 'Chennai',   board: 'State', students: 980,  contact: '+91 44123 67890', routes: 4,  status: 'Active' },
  { name: 'Narayana E-Techno',   city: 'Hyderabad', board: 'CBSE',  students: 2100, contact: '+91 40234 78901', routes: 10, status: 'Active' },
  { name: 'Podar International', city: 'Mumbai',    board: 'ICSE',  students: 1780, contact: '+91 22234 89012', routes: 8,  status: 'Active' },
  { name: 'Ryan International',  city: 'Delhi',     board: 'CBSE',  students: 1450, contact: '+91 11234 90123', routes: 7,  status: 'Inactive' },
  { name: 'Presidency School',   city: 'Bangalore', board: 'State', students: 870,  contact: '+91 80345 01234', routes: 3,  status: 'Active' },
  { name: 'The Heritage School', city: 'Kolkata',   board: 'ICSE',  students: 1120, contact: '+91 33345 12345', routes: 5,  status: 'Active' },
  { name: 'Springdales School',  city: 'Delhi',     board: 'CBSE',  students: 1360, contact: '+91 11345 23456', routes: 6,  status: 'Active' },
]

export function SchoolManagementSection() {
  const [search, setSearch] = useState('')
  const [boardFilter, setBoardFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')

  const filtered = SCHOOLS.filter(s =>
    (!boardFilter || s.board === boardFilter) &&
    (!cityFilter  || s.city  === cityFilter)  &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <SectionHeader title="School Management" subtitle="Manage school admin portals, bus routes and alert configurations" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Schools"       value="1,234" sub="+12 this month" />
        <StatCard label="Active Schools"      value="1,180" sub="95.6% active rate" />
        <StatCard label="Total Students"      value="2.4L"  sub="+8,200 this month" />
        <StatCard label="Avg Students/School" value="195"   sub="↑ from 188 last month" />
      </div>

      <TableWrap
        search={search}
        onSearch={setSearch}
        extra={
          <>
            <SelectFilter value={boardFilter} onChange={setBoardFilter} options={['CBSE','ICSE','State']} label="All Boards" />
            <SelectFilter value={cityFilter}  onChange={setCityFilter}  options={['Delhi','Mumbai','Bangalore','Hyderabad','Chennai','Pune','Kolkata']} label="All Cities" />
          </>
        }
      >
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
            <TH>School Name</TH><TH>City</TH><TH>Board</TH><TH>Students</TH><TH>Contact</TH><TH>Bus Routes</TH><TH>Status</TH><TH>Actions</TH>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <TD><span style={{ fontWeight: 600 }}>{s.name}</span></TD>
              <TD>{s.city}</TD>
              <TD>
                <Badge
                  label={s.board}
                  color={s.board === 'CBSE' ? '#3B82F6' : s.board === 'ICSE' ? '#8B5CF6' : '#F59E0B'}
                  bg={s.board === 'CBSE' ? 'rgba(59,130,246,0.1)' : s.board === 'ICSE' ? 'rgba(139,92,246,0.1)' : 'rgba(245,158,11,0.1)'}
                  border={s.board === 'CBSE' ? 'rgba(59,130,246,0.2)' : s.board === 'ICSE' ? 'rgba(139,92,246,0.2)' : 'rgba(245,158,11,0.2)'}
                />
              </TD>
              <TD style={{ fontWeight: 600 }}>{s.students.toLocaleString()}</TD>
              <TD style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{s.contact}</TD>
              <TD style={{ textAlign: 'center' }}>{s.routes}</TD>
              <TD><StatusBadge status={s.status} /></TD>
              <TD>
                <div style={{ display: 'flex', gap: 6 }}>
                  <ActionBtn label="View" color="#3B82F6" />
                  <ActionBtn label="Edit" />
                  <ActionBtn label="Routes" color="#8B5CF6" />
                  <ActionBtn label="Alerts" color="#EF4444" />
                </div>
              </TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </motion.div>
  )
}

// ─── 2. SchoolBusTrackingSection ───────────────────────────────────────────────

const BUSES = [
  { bus: 'MH-01-AB-1234', school: 'Podar International', route: 'Route 3 – Andheri West', driver: 'Ramesh Yadav', students: 32, speed: '42 km/h', status: 'On Route',  location: 'Andheri East', eta: '08:24 AM' },
  { bus: 'DL-02-CD-5678', school: 'Delhi Public School', route: 'Route 7 – Rohini Sec 3', driver: 'Suresh Kumar',  students: 28, speed: '0 km/h',  status: 'Delayed',   location: 'Pitampura', eta: '08:48 AM' },
  { bus: 'KA-03-EF-9012', school: 'Bishop Cotton',       route: 'Route 1 – Koramangala', driver: 'Prakash Nair',  students: 35, speed: '38 km/h', status: 'On Route',  location: 'BTM Layout', eta: '07:55 AM' },
  { bus: 'TS-04-GH-3456', school: 'Narayana E-Techno',   route: 'Route 5 – Madhapur',    driver: 'Venkat Rao',    students: 40, speed: '55 km/h', status: 'On Route',  location: 'Gachibowli', eta: '08:10 AM' },
  { bus: 'TN-05-IJ-7890', school: 'Amrita Vidyalayam',   route: 'Route 2 – T Nagar',     driver: 'Murugan S',     students: 25, speed: '0 km/h',  status: 'At School', location: 'School Campus', eta: '—' },
  { bus: 'WB-06-KL-1234', school: 'St. Xavier\'s',       route: 'Route 4 – Salt Lake',   driver: 'Debashish Roy', students: 30, speed: '0 km/h',  status: 'Delayed',   location: 'EM Bypass', eta: '09:05 AM' },
  { bus: 'MH-07-MN-5678', school: 'Kendriya Vidyalaya',  route: 'Route 9 – Bandra',      driver: 'Anil Patil',    students: 22, speed: '29 km/h', status: 'On Route',  location: 'Bandra East', eta: '08:30 AM' },
  { bus: 'DL-08-OP-9012', school: 'Ryan International',  route: 'Route 6 – Dwarka',      driver: 'Rajan Mishra',  students: 38, speed: '0 km/h',  status: 'Ended',     location: 'School Campus', eta: '—' },
  { bus: 'KA-09-QR-3456', school: 'Presidency School',   route: 'Route 3 – Whitefield',  driver: 'Kiran Gowda',   students: 18, speed: '46 km/h', status: 'On Route',  location: 'Marathahalli', eta: '08:15 AM' },
  { bus: 'MH-10-ST-7890', school: 'Podar International', route: 'Route 6 – Powai',       driver: 'Vijay Jadhav',  students: 27, speed: '0 km/h',  status: 'At School', location: 'School Campus', eta: '—' },
]

export function SchoolBusTrackingSection() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = BUSES.filter(b =>
    (!statusFilter || b.status === statusFilter) &&
    (b.bus.toLowerCase().includes(search.toLowerCase()) ||
     b.school.toLowerCase().includes(search.toLowerCase()) ||
     b.driver.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <SectionHeader title="School Bus Live Tracking" subtitle="Real-time bus positions, speeds, ETAs and delay alerts" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Buses"     value="3,420" sub="fleet registered" subColor="var(--text-muted)" />
        <StatCard label="Active Right Now" value="1,234" sub="36.1% of fleet" />
        <StatCard label="On Route"        value="1,100" sub="89.1% on time" />
        <StatCard label="Delayed"         value="23"    sub="avg 14 min delay" subColor="#F59E0B" />
        <StatCard label="Stopped"         value="111"   sub="at school / ended" subColor="var(--text-muted)" />
      </div>

      <TableWrap
        search={search}
        onSearch={setSearch}
        extra={<SelectFilter value={statusFilter} onChange={setStatusFilter} options={['On Route','Delayed','At School','Ended']} label="All Statuses" />}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
            <TH>Bus No</TH><TH>School</TH><TH>Route</TH><TH>Driver</TH><TH>Students</TH><TH>Speed</TH><TH>Status</TH><TH>Last Location</TH><TH>ETA</TH>
          </tr>
        </thead>
        <tbody>
          {filtered.map((b, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: b.status === 'Delayed' ? 'rgba(245,158,11,0.04)' : 'transparent' }}>
              <TD>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {b.status === 'On Route' && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)', flexShrink: 0 }} />
                  )}
                  <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{b.bus}</span>
                </div>
              </TD>
              <TD style={{ fontSize: 12 }}>{b.school}</TD>
              <TD style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.route}</TD>
              <TD>{b.driver}</TD>
              <TD style={{ textAlign: 'center', fontWeight: 600 }}>{b.students}</TD>
              <TD style={{ fontWeight: 600, color: b.status === 'Delayed' ? '#F59E0B' : 'var(--text-primary)' }}>{b.speed}</TD>
              <TD><StatusBadge status={b.status} /></TD>
              <TD style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} /> {b.location}
                </div>
              </TD>
              <TD style={{ fontWeight: 600, color: b.status === 'Delayed' ? '#F59E0B' : 'var(--text-primary)' }}>{b.eta}</TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </motion.div>
  )
}

// ─── 3. AttendanceSection ──────────────────────────────────────────────────────

const ATTENDANCE_ROWS = [
  { school: 'Delhi Public School',  grade: 'All Grades', present: 96.2, absent: 89,  late: 44, notable: '' },
  { school: 'Kendriya Vidyalaya',   grade: 'All Grades', present: 94.8, absent: 98,  late: 31, notable: '' },
  { school: 'Bishop Cotton School', grade: 'All Grades', present: 97.1, absent: 45,  late: 18, notable: '' },
  { school: 'Narayana E-Techno',    grade: 'All Grades', present: 91.3, absent: 183, late: 64, notable: 'Absence spike – Grade 10' },
  { school: 'St. Xavier\'s School', grade: 'All Grades', present: 95.5, absent: 54,  late: 22, notable: '' },
  { school: 'Amrita Vidyalayam',    grade: 'All Grades', present: 93.2, absent: 67,  late: 39, notable: '' },
  { school: 'Podar International',  grade: 'All Grades', present: 96.8, absent: 57,  late: 15, notable: '' },
  { school: 'Ryan International',   grade: 'All Grades', present: 88.7, absent: 164, late: 72, notable: 'Absence spike – Grade 8' },
  { school: 'Presidency School',    grade: 'All Grades', present: 94.1, absent: 51,  late: 27, notable: '' },
  { school: 'The Heritage School',  grade: 'All Grades', present: 95.9, absent: 46,  late: 21, notable: '' },
]

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const ATT_VALS = [93.1, 94.8, 95.2, 94.3, 96.1, 91.4, 0]

export function AttendanceSection() {
  const [search, setSearch] = useState('')
  const [schoolFilter, setSchoolFilter] = useState('')

  const filtered = ATTENDANCE_ROWS.filter(r =>
    (!schoolFilter || r.school === schoolFilter) &&
    r.school.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <SectionHeader title="Attendance Management" subtitle="Track daily school attendance across all registered institutions" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Today's Attendance" value="94.3%"    sub="↑ 1.2% vs yesterday" />
        <StatCard label="Present Today"       value="1,18,432" sub="out of 1,25,555" />
        <StatCard label="Absent Today"        value="7,123"   sub="↑ 340 vs yesterday"  subColor="#EF4444" />
        <StatCard label="Late Arrivals"       value="2,341"   sub="↓ 120 vs yesterday"  subColor="#F59E0B" />
      </div>

      {/* 7-day chart */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Last 7 Days Attendance %</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 100 }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: ATT_VALS[i] > 0 ? '#10B981' : 'var(--text-muted)' }}>
                {ATT_VALS[i] > 0 ? `${ATT_VALS[i]}%` : '—'}
              </div>
              <div style={{
                width: '100%', background: ATT_VALS[i] > 0 ? 'var(--gold)' : 'var(--border)',
                borderRadius: '4px 4px 0 0', opacity: ATT_VALS[i] > 0 ? 1 : 0.3,
                height: ATT_VALS[i] > 0 ? `${(ATT_VALS[i] - 88) / 12 * 80}px` : '8px'
              }} />
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <TableWrap
        search={search}
        onSearch={setSearch}
        extra={<SelectFilter value={schoolFilter} onChange={setSchoolFilter} options={ATTENDANCE_ROWS.map(r => r.school)} label="All Schools" />}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
            <TH>School</TH><TH>Grade</TH><TH>Present %</TH><TH>Absent</TH><TH>Late</TH><TH>Notable</TH>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: r.notable ? 'rgba(245,158,11,0.04)' : 'transparent' }}>
              <TD style={{ fontWeight: 600 }}>{r.school}</TD>
              <TD>{r.grade}</TD>
              <TD>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, maxWidth: 80 }}>
                    <div style={{ width: `${r.present}%`, height: '100%', background: r.present >= 95 ? '#10B981' : r.present >= 90 ? '#F59E0B' : '#EF4444', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontWeight: 700, color: r.present >= 95 ? '#10B981' : r.present >= 90 ? '#F59E0B' : '#EF4444' }}>{r.present}%</span>
                </div>
              </TD>
              <TD style={{ color: r.absent > 150 ? '#EF4444' : 'var(--text-primary)', fontWeight: r.absent > 150 ? 700 : 400 }}>{r.absent}</TD>
              <TD>{r.late}</TD>
              <TD>
                {r.notable
                  ? <span style={{ fontSize: 11, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={11} /> {r.notable}</span>
                  : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                }
              </TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </motion.div>
  )
}

// ─── 4. PickupVerificationSection ─────────────────────────────────────────────

const PICKUPS = [
  { child: 'Ananya Sharma',   school: 'Delhi Public School',  person: 'Meena Sharma',    rel: 'Mother',         method: 'Face ID',   time: '03:12 PM', status: 'Verified' },
  { child: 'Rohan Mehta',     school: 'Kendriya Vidyalaya',   person: 'Arun Mehta',      rel: 'Father',         method: 'OTP',       time: '03:18 PM', status: 'Verified' },
  { child: 'Priya Reddy',     school: 'Narayana E-Techno',    person: 'Suresh Reddy',    rel: 'Uncle',          method: 'QR Code',   time: '03:24 PM', status: 'Verified' },
  { child: 'Karthik Nair',    school: 'Bishop Cotton School', person: 'Unknown Person',   rel: '—',              method: 'None',      time: '03:31 PM', status: 'Unauthorized' },
  { child: 'Divya Iyer',      school: 'Amrita Vidyalayam',    person: 'Lakshmi Iyer',    rel: 'Mother',         method: 'Face ID',   time: '03:35 PM', status: 'Verified' },
  { child: 'Arjun Gupta',     school: 'Ryan International',   person: 'Sunita Gupta',    rel: 'Mother',         method: 'OTP',       time: '03:40 PM', status: 'Verified' },
  { child: 'Sneha Pillai',    school: 'Podar International',  person: 'Rajesh Pillai',   rel: 'Father',         method: 'QR Code',   time: '03:44 PM', status: 'Verified' },
  { child: 'Vivek Joshi',     school: 'Springdales School',   person: 'Kavita Joshi',    rel: 'Mother',         method: 'Face ID',   time: '03:50 PM', status: 'Verified' },
  { child: 'Meera Krishnan',  school: 'The Heritage School',  person: 'Unknown Person',   rel: '—',              method: 'None',      time: '03:55 PM', status: 'Unauthorized' },
  { child: 'Aditya Bose',     school: 'St. Xavier\'s School', person: 'Suchitra Bose',   rel: 'Mother',         method: 'OTP',       time: '04:01 PM', status: 'Verified' },
  { child: 'Riya Verma',      school: 'Delhi Public School',  person: 'Pending',          rel: '—',              method: '—',         time: '—',        status: 'Pending' },
  { child: 'Ishaan Malhotra', school: 'Kendriya Vidyalaya',   person: 'Pending',          rel: '—',              method: '—',         time: '—',        status: 'Pending' },
]

export function PickupVerificationSection() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = PICKUPS.filter(p =>
    (!statusFilter || p.status === statusFilter) &&
    (p.child.toLowerCase().includes(search.toLowerCase()) ||
     p.person.toLowerCase().includes(search.toLowerCase()) ||
     p.school.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <SectionHeader title="Pickup Verification" subtitle="Authorized pickup tracking and unauthorized attempt monitoring" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Verified Pickups Today" value="8,934"  sub="↑ 234 vs yesterday" />
        <StatCard label="Pending Verification"   value="23"     sub="awaiting confirmation" subColor="#F59E0B" />
        <StatCard label="Unauthorized Attempts"  value="4"      sub="alerts sent to parents" subColor="#EF4444" />
        <StatCard label="Success Rate"           value="99.95%" sub="industry benchmark: 99%" />
      </div>

      <TableWrap
        search={search}
        onSearch={setSearch}
        extra={<SelectFilter value={statusFilter} onChange={setStatusFilter} options={['Verified','Pending','Unauthorized']} label="All Statuses" />}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
            <TH>Child</TH><TH>School</TH><TH>Pickup Person</TH><TH>Relationship</TH><TH>Method</TH><TH>Time</TH><TH>Status</TH><TH>Actions</TH>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: p.status === 'Unauthorized' ? 'rgba(239,68,68,0.06)' : 'transparent' }}>
              <TD style={{ fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {p.status === 'Unauthorized' && <AlertTriangle size={13} color="#EF4444" />}
                  {p.child}
                </div>
              </TD>
              <TD style={{ fontSize: 12 }}>{p.school}</TD>
              <TD style={{ color: p.status === 'Unauthorized' ? '#EF4444' : 'var(--text-primary)', fontWeight: p.status === 'Unauthorized' ? 700 : 400 }}>{p.person}</TD>
              <TD style={{ color: 'var(--text-secondary)' }}>{p.rel}</TD>
              <TD>{p.method !== '—' ? (
                <Badge
                  label={p.method}
                  color="#3B82F6"
                  bg="rgba(59,130,246,0.1)"
                  border="rgba(59,130,246,0.2)"
                />
              ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}</TD>
              <TD style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.time}</TD>
              <TD><StatusBadge status={p.status} /></TD>
              <TD>
                <div style={{ display: 'flex', gap: 6 }}>
                  <ActionBtn label="View" color="#3B82F6" />
                  {p.status === 'Unauthorized' && <ActionBtn label="Alert" color="#EF4444" />}
                  {p.status === 'Pending'      && <ActionBtn label="Verify" color="#10B981" />}
                </div>
              </TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </motion.div>
  )
}

// ─── 5. ChildAlertsSection ─────────────────────────────────────────────────────

const ALERTS = [
  { type: 'SOS',            child: 'Ananya Sharma',   time: '2 min ago',   desc: 'SOS button pressed near school exit gate', severity: 'critical' },
  { type: 'Missing',        child: 'Karthik Nair',    time: '8 min ago',   desc: 'Child not detected on bus or school premises', severity: 'critical' },
  { type: 'SOS',            child: 'Rohan Mehta',     time: '15 min ago',  desc: 'Panic alert from wristband device', severity: 'critical' },
  { type: 'Geofence Breach',child: 'Priya Reddy',     time: '22 min ago',  desc: 'Exited designated school zone boundary', severity: 'high' },
  { type: 'Geofence Breach',child: 'Divya Iyer',      time: '34 min ago',  desc: 'Entered restricted construction area', severity: 'high' },
  { type: 'Missing',        child: 'Vivek Joshi',     time: '41 min ago',  desc: 'Not marked present – bus or school', severity: 'critical' },
  { type: 'Health',         child: 'Sneha Pillai',    time: '52 min ago',  desc: 'Elevated heart rate detected – 142 bpm', severity: 'medium' },
  { type: 'Geofence Breach',child: 'Aditya Bose',     time: '1h 4min ago', desc: 'Left school 45 min before dismissal time', severity: 'high' },
  { type: 'Health',         child: 'Meera Krishnan',  time: '1h 18min ago',desc: 'Inactivity alert – no movement for 90 min', severity: 'medium' },
  { type: 'Geofence Breach',child: 'Arjun Gupta',     time: '1h 32min ago',desc: 'Entered unfamiliar neighbourhood zone', severity: 'medium' },
  { type: 'Health',         child: 'Riya Verma',      time: '2h ago',      desc: 'Low device battery – location may be lost', severity: 'low' },
  { type: 'Geofence Breach',child: 'Ishaan Malhotra', time: '2h 20min ago',desc: 'Bus deviated from approved route briefly', severity: 'medium' },
]

const ALERT_ICON: Record<string, React.ReactNode> = {
  SOS:             <Zap size={14} />,
  Missing:         <User size={14} />,
  'Geofence Breach': <MapPin size={14} />,
  Health:          <Heart size={14} />,
}

const ALERT_COLOR: Record<string, string> = {
  critical: '#EF4444',
  high:     '#F59E0B',
  medium:   '#3B82F6',
  low:      '#10B981',
}

export function ChildAlertsSection() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const filtered = ALERTS.filter(a =>
    (!typeFilter || a.type === typeFilter) &&
    (a.child.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase()))
  )

  const counts = { SOS: 3, 'Geofence Breach': 18, Missing: 2, Health: 24 }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <SectionHeader title="Child Alert Console" subtitle="Real-time child safety alerts sorted by severity" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Active Alerts"    value="47"  sub="across all schools"       subColor="#F59E0B" />
        <StatCard label="SOS Alerts"       value="3"   sub="immediate response needed" subColor="#EF4444" />
        <StatCard label="Geofence Breach"  value="18"  sub="↑ 5 vs yesterday"         subColor="#F59E0B" />
        <StatCard label="Missing Children" value="2"   sub="authorities notified"      subColor="#EF4444" />
        <StatCard label="Health Alerts"    value="24"  sub="↓ 3 vs yesterday"         subColor="#3B82F6" />
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search alerts..."
            style={{ width: '100%', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px 6px 32px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <SelectFilter value={typeFilter} onChange={setTypeFilter} options={['SOS','Geofence Breach','Missing','Health']} label="All Types" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((a, i) => {
          const c = ALERT_COLOR[a.severity]
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ ...card, display: 'flex', alignItems: 'center', gap: 16, borderLeft: `3px solid ${c}` }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${c}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c, flexShrink: 0 }}>
                {ALERT_ICON[a.type] ?? <Bell size={14} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{a.child}</span>
                  <Badge label={a.type} color={c} bg={`${c}18`} border={`${c}33`} />
                  <Badge label={a.severity.toUpperCase()} color={c} bg={`${c}18`} border={`${c}33`} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.desc}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{a.time}</div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <ActionBtn label="Resolve"  color="#10B981" />
                <ActionBtn label="Escalate" color="#EF4444" />
                <ActionBtn label="Contact"  color="#3B82F6" />
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── 6. ChildAnalyticsSection ──────────────────────────────────────────────────

const AGE_GROUPS = [
  { label: '5–8 yrs',  count: 42800, pct: 34 },
  { label: '9–12 yrs', count: 51200, pct: 41 },
  { label: '13–16 yrs',count: 23400, pct: 19 },
  { label: '17–18 yrs', count: 7500,  pct: 6 },
]

const COMMON_ALERTS = [
  { label: 'Geofence Breach', pct: 38, color: '#F59E0B' },
  { label: 'Health Alert',    pct: 28, color: '#3B82F6' },
  { label: 'SOS',             pct: 12, color: '#EF4444' },
  { label: 'Late Pickup',     pct: 14, color: '#8B5CF6' },
  { label: 'Other',           pct: 8,  color: '#6B7280' },
]

const TOP_SCHOOLS_SAFETY = [
  { school: 'Bishop Cotton School', city: 'Bangalore', score: 98.4, students: 1540 },
  { school: 'Podar International',  city: 'Mumbai',    score: 97.9, students: 1780 },
  { school: 'The Heritage School',  city: 'Kolkata',   score: 97.1, students: 1120 },
  { school: 'Delhi Public School',  city: 'Delhi',     score: 96.8, students: 2340 },
  { school: 'Amrita Vidyalayam',    city: 'Chennai',   score: 96.3, students: 980  },
]

export function ChildAnalyticsSection() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <SectionHeader title="Child Analytics" subtitle="Behaviour, safety trends, and age-wise insights" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Avg Daily Active Hours" value="3.2h"   sub="↑ 0.3h vs last month" />
        <StatCard label="Geofence Compliance"    value="96.4%"  sub="↑ 0.8% this month" />
        <StatCard label="SOS False Alarms"       value="0.3%"   sub="industry best: 0.5%" />
        <StatCard label="Tracked Children"       value="1,24,900" sub="across 1,234 schools" subColor="var(--text-muted)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Age distribution */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Age Distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {AGE_GROUPS.map(g => (
              <div key={g.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{g.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{g.count.toLocaleString()} ({g.pct}%)</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 4 }}>
                  <div style={{ width: `${g.pct * 2.5}%`, height: '100%', background: 'var(--gold)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert type distribution */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Most Common Alerts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {COMMON_ALERTS.map(a => (
              <div key={a.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: a.color }}>{a.pct}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 4 }}>
                  <div style={{ width: `${a.pct * 2.5}%`, height: '100%', background: a.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top schools by safety */}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Top 5 Schools by Safety Score</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
              <TH>#</TH><TH>School</TH><TH>City</TH><TH>Students</TH><TH>Safety Score</TH>
            </tr>
          </thead>
          <tbody>
            {TOP_SCHOOLS_SAFETY.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <TD><span style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>#{i + 1}</span></TD>
                <TD style={{ fontWeight: 600 }}>{s.school}</TD>
                <TD>{s.city}</TD>
                <TD>{s.students.toLocaleString()}</TD>
                <TD>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#10B981' }}>{s.score}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>/100</span>
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

// ─── 7. MedicationSection ──────────────────────────────────────────────────────

const MEDICATIONS = [
  { elder: 'Ramesh Verma',    medication: 'Metformin 500mg',    dosage: '1 tab',    freq: 'Twice daily', nextDue: '06:00 PM', caregiver: 'Priya Verma',    compliance: 98, status: 'Taken' },
  { elder: 'Sumitra Devi',    medication: 'Amlodipine 5mg',     dosage: '1 tab',    freq: 'Once daily',  nextDue: '08:00 AM', caregiver: 'Ajay Singh',      compliance: 94, status: 'Pending' },
  { elder: 'Govind Rao',      medication: 'Atorvastatin 10mg',  dosage: '1 tab',    freq: 'Once daily',  nextDue: '09:00 PM', caregiver: 'Kavya Rao',       compliance: 77, status: 'Overdue' },
  { elder: 'Lakshmi Nair',    medication: 'Aspirin 75mg',       dosage: '1 tab',    freq: 'Once daily',  nextDue: '07:30 AM', caregiver: 'Suresh Nair',     compliance: 92, status: 'Taken' },
  { elder: 'Baldev Singh',    medication: 'Glimepiride 2mg',    dosage: '1 tab',    freq: 'Twice daily', nextDue: '01:00 PM', caregiver: 'Harpreet Kaur',   compliance: 65, status: 'Missed' },
  { elder: 'Kamala Bai',      medication: 'Ramipril 5mg',       dosage: '1 cap',    freq: 'Once daily',  nextDue: '08:00 AM', caregiver: 'Deepa Bai',       compliance: 88, status: 'Taken' },
  { elder: 'Narayan Joshi',   medication: 'Pantoprazole 40mg',  dosage: '1 tab',    freq: 'Once daily',  nextDue: '07:00 AM', caregiver: 'Sunita Joshi',    compliance: 96, status: 'Taken' },
  { elder: 'Saraswati Iyer',  medication: 'Levothyroxine 50mcg',dosage: '1 tab',    freq: 'Once daily',  nextDue: '06:30 AM', caregiver: 'Arvind Iyer',     compliance: 99, status: 'Taken' },
  { elder: 'Mohan Lal',       medication: 'Losartan 50mg',      dosage: '1 tab',    freq: 'Twice daily', nextDue: '06:00 PM', caregiver: 'Rekha Lal',       compliance: 72, status: 'Overdue' },
  { elder: 'Usha Sharma',     medication: 'Insulin Glargine',   dosage: '20 units', freq: 'Once daily',  nextDue: '10:00 PM', caregiver: 'Amit Sharma',     compliance: 91, status: 'Pending' },
  { elder: 'Chandrakant Patil',medication: 'Methotrexate 10mg', dosage: '2 tabs',   freq: 'Weekly',      nextDue: 'Sunday',   caregiver: 'Anita Patil',     compliance: 83, status: 'Pending' },
  { elder: 'Indira Menon',    medication: 'Bisoprolol 5mg',     dosage: '1 tab',    freq: 'Once daily',  nextDue: '08:00 AM', caregiver: 'Rahul Menon',     compliance: 97, status: 'Taken' },
]

export function MedicationSection() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [compFilter, setCompFilter] = useState('')

  const filtered = MEDICATIONS.filter(m => {
    const matchComp = !compFilter ||
      (compFilter === 'Low (<80%)' && m.compliance < 80) ||
      (compFilter === 'Medium (80-90%)' && m.compliance >= 80 && m.compliance < 90) ||
      (compFilter === 'High (>90%)' && m.compliance >= 90)
    return (
      (!statusFilter || m.status === statusFilter) &&
      matchComp &&
      (m.elder.toLowerCase().includes(search.toLowerCase()) ||
       m.medication.toLowerCase().includes(search.toLowerCase()))
    )
  })

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <SectionHeader title="Medication Management" subtitle="Elder prescription tracking, compliance monitoring and caregiver alerts" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Prescriptions" value="34,230" sub="across 18,920 elders" subColor="var(--text-muted)" />
        <StatCard label="Due Today"           value="1,234"  sub="need to be administered" subColor="#F59E0B" />
        <StatCard label="Taken"               value="1,100"  sub="89.2% compliance rate" />
        <StatCard label="Missed"              value="89"     sub="caregiver alerted"       subColor="#EF4444" />
        <StatCard label="Overdue"             value="45"     sub=">30 min past schedule"   subColor="#EF4444" />
      </div>

      <TableWrap
        search={search}
        onSearch={setSearch}
        extra={
          <>
            <SelectFilter value={statusFilter} onChange={setStatusFilter} options={['Taken','Pending','Missed','Overdue']} label="All Statuses" />
            <SelectFilter value={compFilter} onChange={setCompFilter} options={['Low (<80%)','Medium (80-90%)','High (>90%)']} label="Compliance" />
          </>
        }
      >
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
            <TH>Elder</TH><TH>Medication</TH><TH>Dosage</TH><TH>Frequency</TH><TH>Next Due</TH><TH>Caregiver</TH><TH>Compliance %</TH><TH>Status</TH>
          </tr>
        </thead>
        <tbody>
          {filtered.map((m, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: m.compliance < 80 ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
              <TD style={{ fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {m.compliance < 80 && <AlertTriangle size={12} color="#EF4444" />}
                  {m.elder}
                </div>
              </TD>
              <TD style={{ fontWeight: 500 }}>{m.medication}</TD>
              <TD style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{m.dosage}</TD>
              <TD style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{m.freq}</TD>
              <TD style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{m.nextDue}</TD>
              <TD style={{ fontSize: 12 }}>{m.caregiver}</TD>
              <TD>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, maxWidth: 60 }}>
                    <div style={{ width: `${m.compliance}%`, height: '100%', background: m.compliance >= 90 ? '#10B981' : m.compliance >= 80 ? '#F59E0B' : '#EF4444', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 12, color: m.compliance >= 90 ? '#10B981' : m.compliance >= 80 ? '#F59E0B' : '#EF4444' }}>{m.compliance}%</span>
                </div>
              </TD>
              <TD><StatusBadge status={m.status} /></TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </motion.div>
  )
}

// ─── 8. FallDetectionSection ───────────────────────────────────────────────────

const FALLS = [
  { elder: 'Govind Rao',       time: '07:24 AM', location: 'Bathroom',        severity: 'Critical', device: 'Smart Watch',  response: '2 min',  outcome: 'Hospitalised', notified: true },
  { elder: 'Baldev Singh',     time: '09:11 AM', location: 'Living Room',     severity: 'High',     device: 'Pendant',      response: '4 min',  outcome: 'First Aid',    notified: true },
  { elder: 'Sumitra Devi',     time: '10:45 AM', location: 'Kitchen',         severity: 'Medium',   device: 'Smart Watch',  response: '6 min',  outcome: 'Minor Injury', notified: true },
  { elder: 'Mohan Lal',        time: '11:30 AM', location: 'Bedroom',         severity: 'High',     device: 'Floor Sensor', response: '3 min',  outcome: 'No Injury',    notified: true },
  { elder: 'Chandrakant Patil',time: '01:15 PM', location: 'Garden',          severity: 'Critical', device: 'Smart Watch',  response: '8 min',  outcome: 'Hospitalised', notified: true },
  { elder: 'Usha Sharma',      time: '02:40 PM', location: 'Stairs',          severity: 'High',     device: 'Pendant',      response: '5 min',  outcome: 'Fracture',     notified: true },
  { elder: 'Ramesh Verma',     time: '03:55 PM', location: 'Living Room',     severity: 'Medium',   device: 'Smart Watch',  response: '7 min',  outcome: 'False Positive', notified: false },
  { elder: 'Lakshmi Nair',     time: '04:22 PM', location: 'Bathroom',        severity: 'Medium',   device: 'Floor Sensor', response: '9 min',  outcome: 'False Positive', notified: false },
  { elder: 'Kamala Bai',       time: '05:10 PM', location: 'Bedroom',         severity: 'Medium',   device: 'Pendant',      response: '11 min', outcome: 'Unknown',      notified: true },
  { elder: 'Indira Menon',     time: '06:33 PM', location: 'Balcony',         severity: 'High',     device: 'Smart Watch',  response: '3 min',  outcome: 'No Injury',    notified: true },
]

const SEVERITY_COLOR: Record<string, string> = { Critical: '#EF4444', High: '#F59E0B', Medium: '#3B82F6' }

const FALL_TREND = [2, 5, 3, 8, 4, 6, 3, 9, 5, 7, 4, 23]
const MONTHS     = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun']

export function FallDetectionSection() {
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const maxFall = Math.max(...FALL_TREND)

  const filtered = FALLS.filter(f =>
    (!severityFilter || f.severity === severityFilter) &&
    (f.elder.toLowerCase().includes(search.toLowerCase()) || f.location.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <SectionHeader title="Fall Detection Events" subtitle="Fall detection alerts, severity classification and emergency response tracking" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Events Today" value="23"  sub="↑ 8 vs yesterday"        subColor="#F59E0B" />
        <StatCard label="Confirmed Falls"    value="8"   sub="emergency protocols"      subColor="#EF4444" />
        <StatCard label="False Positives"    value="12"  sub="52.2% false positive rate" subColor="#F59E0B" />
        <StatCard label="Unknown"            value="3"   sub="under investigation"       subColor="#6B7280" />
        <StatCard label="Emergency Called"   value="2"   sub="ambulance dispatched"      subColor="#EF4444" />
      </div>

      {/* Trend chart */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Fall Events – Last 12 Months</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 90 }}>
          {FALL_TREND.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: v === maxFall ? '#EF4444' : 'var(--text-muted)' }}>{v}</div>
              <div style={{
                width: '100%', height: `${(v / maxFall) * 65}px`,
                background: v === maxFall ? '#EF4444' : 'var(--gold)',
                borderRadius: '4px 4px 0 0', opacity: 0.85
              }} />
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{MONTHS[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Map placeholder */}
      <div style={{ ...card, marginBottom: 24, height: 300, minHeight: 300, overflow: 'hidden' }}>
        {typeof window !== 'undefined' && (
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=72.7,18.9,72.9,19.1&layer=mapnik"
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
            title="Child Safety Map"
          />
        )}
      </div>

      <TableWrap
        search={search}
        onSearch={setSearch}
        extra={<SelectFilter value={severityFilter} onChange={setSeverityFilter} options={['Critical','High','Medium']} label="All Severities" />}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
            <TH>Elder</TH><TH>Time</TH><TH>Location</TH><TH>Severity</TH><TH>Device</TH><TH>Response Time</TH><TH>Outcome</TH><TH>Caregiver Notified</TH>
          </tr>
        </thead>
        <tbody>
          {filtered.map((f, i) => {
            const c = SEVERITY_COLOR[f.severity] ?? '#6B7280'
            return (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: f.severity === 'Critical' ? 'rgba(239,68,68,0.05)' : 'transparent' }}>
                <TD style={{ fontWeight: 600 }}>{f.elder}</TD>
                <TD style={{ fontFamily: 'monospace', fontSize: 12 }}>{f.time}</TD>
                <TD><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} color="var(--text-muted)" />{f.location}</div></TD>
                <TD><Badge label={f.severity} color={c} bg={`${c}18`} border={`${c}33`} /></TD>
                <TD style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f.device}</TD>
                <TD style={{ fontWeight: 600, color: parseInt(f.response) <= 3 ? '#10B981' : parseInt(f.response) <= 6 ? '#F59E0B' : '#EF4444' }}>{f.response}</TD>
                <TD style={{ fontSize: 12 }}>{f.outcome}</TD>
                <TD>
                  {f.notified
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981', fontSize: 12 }}><CheckCircle size={13} /> Yes</span>
                    : <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#EF4444', fontSize: 12 }}><XCircle size={13} /> No</span>
                  }
                </TD>
              </tr>
            )
          })}
        </tbody>
      </TableWrap>
    </motion.div>
  )
}

// ─── 9. WellnessReportsSection ─────────────────────────────────────────────────

const WELLNESS = [
  { elder: 'Ramesh Verma',     period: 'May 2026', score: 87, mobility: 82, sleep: 79, adherence: 98, caregiver: 'Priya Verma' },
  { elder: 'Sumitra Devi',     period: 'May 2026', score: 74, mobility: 68, sleep: 71, adherence: 94, caregiver: 'Ajay Singh' },
  { elder: 'Govind Rao',       period: 'May 2026', score: 61, mobility: 55, sleep: 60, adherence: 77, caregiver: 'Kavya Rao' },
  { elder: 'Lakshmi Nair',     period: 'May 2026', score: 91, mobility: 88, sleep: 86, adherence: 92, caregiver: 'Suresh Nair' },
  { elder: 'Baldev Singh',     period: 'May 2026', score: 58, mobility: 52, sleep: 63, adherence: 65, caregiver: 'Harpreet Kaur' },
  { elder: 'Kamala Bai',       period: 'May 2026', score: 79, mobility: 74, sleep: 81, adherence: 88, caregiver: 'Deepa Bai' },
  { elder: 'Narayan Joshi',    period: 'Apr 2026', score: 83, mobility: 80, sleep: 77, adherence: 96, caregiver: 'Sunita Joshi' },
  { elder: 'Saraswati Iyer',   period: 'Apr 2026', score: 95, mobility: 92, sleep: 94, adherence: 99, caregiver: 'Arvind Iyer' },
  { elder: 'Mohan Lal',        period: 'Apr 2026', score: 63, mobility: 58, sleep: 67, adherence: 72, caregiver: 'Rekha Lal' },
  { elder: 'Usha Sharma',      period: 'Apr 2026', score: 76, mobility: 72, sleep: 74, adherence: 91, caregiver: 'Amit Sharma' },
  { elder: 'Indira Menon',     period: 'May 2026', score: 89, mobility: 85, sleep: 88, adherence: 97, caregiver: 'Rahul Menon' },
]

const scoreColor = (s: number) => s >= 85 ? '#10B981' : s >= 70 ? '#F59E0B' : '#EF4444'

export function WellnessReportsSection() {
  const [search, setSearch] = useState('')
  const [periodFilter, setPeriodFilter] = useState('')

  const filtered = WELLNESS.filter(w =>
    (!periodFilter || w.period === periodFilter) &&
    (w.elder.toLowerCase().includes(search.toLowerCase()) || w.caregiver.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <SectionHeader title="Wellness Reports" subtitle="Periodic elder wellness summaries shared with doctors and caregivers" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Reports This Month"    value="4,230"  sub="↑ 380 vs last month" />
        <StatCard label="Shared with Doctors"   value="1,234"  sub="29.2% doctor review rate" subColor="#3B82F6" />
        <StatCard label="Caregiver Reviewed"    value="3,890"  sub="92% review rate" />
        <StatCard label="Pending Review"        value="340"    sub="overdue 7+ days" subColor="#F59E0B" />
      </div>

      <TableWrap
        search={search}
        onSearch={setSearch}
        extra={<SelectFilter value={periodFilter} onChange={setPeriodFilter} options={['May 2026','Apr 2026','Mar 2026']} label="All Periods" />}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
            <TH>Elder</TH><TH>Report Period</TH><TH>Overall Score</TH><TH>Mobility</TH><TH>Sleep</TH><TH>Med Adherence</TH><TH>Caregiver</TH><TH>Actions</TH>
          </tr>
        </thead>
        <tbody>
          {filtered.map((w, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <TD style={{ fontWeight: 600 }}>{w.elder}</TD>
              <TD style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{w.period}</TD>
              <TD>
                <span style={{ fontSize: 18, fontWeight: 800, color: scoreColor(w.score) }}>{w.score}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>/100</span>
              </TD>
              <TD><span style={{ fontWeight: 600, color: scoreColor(w.mobility) }}>{w.mobility}</span></TD>
              <TD><span style={{ fontWeight: 600, color: scoreColor(w.sleep) }}>{w.sleep}</span></TD>
              <TD><span style={{ fontWeight: 600, color: scoreColor(w.adherence) }}>{w.adherence}%</span></TD>
              <TD style={{ fontSize: 12 }}>{w.caregiver}</TD>
              <TD>
                <div style={{ display: 'flex', gap: 6 }}>
                  <ActionBtn label="View"     color="#3B82F6" />
                  <ActionBtn label="Share"    color="#8B5CF6" />
                  <ActionBtn label="Download" color="var(--text-muted)" />
                </div>
              </TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </motion.div>
  )
}

// ─── 10. CaregiverConsoleSection ───────────────────────────────────────────────

const CAREGIVERS = [
  { name: 'Priya Verma',    elders: 3, lastCheckin: '10 min ago', alerts: 1, tasks: 8,  status: 'On Duty',  rating: 4.9 },
  { name: 'Ajay Singh',     elders: 2, lastCheckin: '22 min ago', alerts: 0, tasks: 6,  status: 'On Duty',  rating: 4.7 },
  { name: 'Kavya Rao',      elders: 3, lastCheckin: '5 min ago',  alerts: 2, tasks: 10, status: 'On Duty',  rating: 4.8 },
  { name: 'Suresh Nair',    elders: 2, lastCheckin: '1h ago',     alerts: 0, tasks: 5,  status: 'Break',    rating: 4.6 },
  { name: 'Harpreet Kaur',  elders: 3, lastCheckin: '3h ago',     alerts: 3, tasks: 4,  status: 'Off Duty', rating: 3.9 },
  { name: 'Deepa Bai',      elders: 2, lastCheckin: '18 min ago', alerts: 0, tasks: 7,  status: 'On Duty',  rating: 4.9 },
  { name: 'Sunita Joshi',   elders: 2, lastCheckin: '30 min ago', alerts: 1, tasks: 5,  status: 'On Duty',  rating: 4.5 },
  { name: 'Arvind Iyer',    elders: 3, lastCheckin: '8 min ago',  alerts: 0, tasks: 9,  status: 'On Duty',  rating: 5.0 },
  { name: 'Rekha Lal',      elders: 2, lastCheckin: '2h ago',     alerts: 2, tasks: 3,  status: 'Break',    rating: 4.2 },
  { name: 'Amit Sharma',    elders: 2, lastCheckin: '14 min ago', alerts: 0, tasks: 6,  status: 'On Duty',  rating: 4.8 },
  { name: 'Rahul Menon',    elders: 3, lastCheckin: '45 min ago', alerts: 1, tasks: 7,  status: 'On Duty',  rating: 4.6 },
  { name: 'Geeta Mishra',   elders: 2, lastCheckin: '6h ago',     alerts: 0, tasks: 0,  status: 'Off Duty', rating: 4.1 },
]

export function CaregiverConsoleSection() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')

  const filtered = CAREGIVERS.filter(c => {
    const matchRating = !ratingFilter ||
      (ratingFilter === '5 Stars' && c.rating >= 4.9) ||
      (ratingFilter === '4+ Stars' && c.rating >= 4.0 && c.rating < 4.9) ||
      (ratingFilter === 'Below 4' && c.rating < 4.0)
    return (
      (!statusFilter || c.status === statusFilter) &&
      matchRating &&
      c.name.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <SectionHeader title="Caregiver Console" subtitle="Monitor caregiver activity, response rates and elder assignments" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Active Caregivers"    value="18,920" sub="registered on platform" subColor="var(--text-muted)" />
        <StatCard label="On Duty Now"          value="4,230"  sub="22.4% on shift" />
        <StatCard label="Response Rate"        value="96.8%"  sub="avg alert response" />
        <StatCard label="Avg Elder/Caregiver"  value="2.4"    sub="recommended max: 3" />
      </div>

      <TableWrap
        search={search}
        onSearch={setSearch}
        extra={
          <>
            <SelectFilter value={statusFilter} onChange={setStatusFilter} options={['On Duty','Break','Off Duty']} label="All Statuses" />
            <SelectFilter value={ratingFilter} onChange={setRatingFilter} options={['5 Stars','4+ Stars','Below 4']} label="All Ratings" />
          </>
        }
      >
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
            <TH>Caregiver</TH><TH>Elders</TH><TH>Last Check-in</TH><TH>Active Alerts</TH><TH>Tasks Done</TH><TH>Status</TH><TH>Rating</TH><TH>Action</TH>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <TD style={{ fontWeight: 600 }}>{c.name}</TD>
              <TD style={{ textAlign: 'center', fontWeight: 700 }}>{c.elders}</TD>
              <TD style={{ fontSize: 12, color: 'var(--text-secondary)' }}><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{c.lastCheckin}</div></TD>
              <TD style={{ textAlign: 'center' }}>
                {c.alerts > 0
                  ? <span style={{ fontWeight: 700, color: '#EF4444' }}>{c.alerts}</span>
                  : <span style={{ color: 'var(--text-muted)' }}>—</span>
                }
              </TD>
              <TD style={{ textAlign: 'center', fontWeight: 600 }}>{c.tasks}</TD>
              <TD><StatusBadge status={c.status} /></TD>
              <TD>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={12} fill={c.rating >= 4.5 ? '#F59E0B' : 'none'} color={c.rating >= 4.5 ? '#F59E0B' : 'var(--text-muted)'} />
                  <span style={{ fontWeight: 700, color: c.rating >= 4.5 ? '#F59E0B' : 'var(--text-primary)' }}>{c.rating.toFixed(1)}</span>
                </div>
              </TD>
              <TD>
                <button style={{ background: 'transparent', border: '1px solid var(--gold)', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: 'var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Send size={10} /> Message
                </button>
              </TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </motion.div>
  )
}

// ─── 11. ElderAnalyticsSection ─────────────────────────────────────────────────

const ELDER_AGE = [
  { label: '65–70 yrs', count: 7840, pct: 41 },
  { label: '71–80 yrs', count: 6230, pct: 33 },
  { label: '81+ yrs',   count: 4850, pct: 26 },
]

const FALL_MONTHS_DATA = [4,7,5,9,6,8,4,11,7,9,6,23]

const MED_ADHERENCE_CITIES = [
  { city: 'Bangalore', pct: 94 },
  { city: 'Mumbai',    pct: 91 },
  { city: 'Delhi',     pct: 88 },
  { city: 'Chennai',   pct: 93 },
  { city: 'Hyderabad', pct: 89 },
  { city: 'Pune',      pct: 90 },
  { city: 'Kolkata',   pct: 86 },
]

const HEALTH_CONDITIONS = [
  { label: 'Diabetes',           pct: 34, color: '#EF4444' },
  { label: 'Hypertension',       pct: 28, color: '#F59E0B' },
  { label: 'Arthritis',          pct: 19, color: '#3B82F6' },
  { label: 'Heart Disease',      pct: 11, color: '#8B5CF6' },
  { label: 'Parkinson\'s',       pct: 5,  color: '#10B981' },
  { label: 'Other',              pct: 3,  color: '#6B7280' },
]

const TOP_CITIES_ELDER = [
  { city: 'Mumbai',    elders: 4230, caregivers: 1820, avgAge: 74.2 },
  { city: 'Delhi',     elders: 3980, caregivers: 1640, avgAge: 72.8 },
  { city: 'Bangalore', elders: 2910, caregivers: 1230, avgAge: 71.4 },
  { city: 'Hyderabad', elders: 2340, caregivers: 980,  avgAge: 73.1 },
  { city: 'Chennai',   elders: 1980, caregivers: 840,  avgAge: 75.3 },
]

export function ElderAnalyticsSection() {
  const maxFall = Math.max(...FALL_MONTHS_DATA)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <SectionHeader title="Elder Analytics" subtitle="Demographic insights, health trends and safety performance" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Elders Tracked"   value="18,920" sub="across 7 cities" subColor="var(--text-muted)" />
        <StatCard label="Avg Age"                value="73.4"   sub="yrs — stable" subColor="var(--text-muted)" />
        <StatCard label="Fall Events This Month" value="23"     sub="↓ 12% vs last month" subColor="#10B981" />
        <StatCard label="Avg Medication Adherence" value="90.1%" sub="↑ 1.4% this month" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Age distribution */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Age Distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ELDER_AGE.map(a => (
              <div key={a.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{a.count.toLocaleString()} ({a.pct}%)</span>
                </div>
                <div style={{ height: 10, background: 'var(--border)', borderRadius: 5 }}>
                  <div style={{ width: `${a.pct * 2.44}%`, height: '100%', background: 'var(--gold)', borderRadius: 5 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health conditions */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Common Health Conditions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {HEALTH_CONDITIONS.map(h => (
              <div key={h.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{h.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: h.color }}>{h.pct}%</span>
                </div>
                <div style={{ height: 7, background: 'var(--border)', borderRadius: 4 }}>
                  <div style={{ width: `${h.pct * 2.9}%`, height: '100%', background: h.color, borderRadius: 4, opacity: 0.85 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Fall trend */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Fall Events – Last 12 Months</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {FALL_MONTHS_DATA.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 9, color: v === maxFall ? '#EF4444' : 'var(--text-muted)' }}>{v}</div>
                <div style={{
                  width: '100%', height: `${(v / maxFall) * 55}px`,
                  background: v === maxFall ? '#EF4444' : 'var(--gold)',
                  borderRadius: '3px 3px 0 0', opacity: 0.85
                }} />
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{MONTHS[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Medication adherence by city */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Medication Adherence by City</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MED_ADHERENCE_CITIES.map(c => (
              <div key={c.city}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.city}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.pct >= 92 ? '#10B981' : c.pct >= 88 ? '#F59E0B' : '#EF4444' }}>{c.pct}%</span>
                </div>
                <div style={{ height: 7, background: 'var(--border)', borderRadius: 4 }}>
                  <div style={{ width: `${c.pct}%`, height: '100%', background: c.pct >= 92 ? '#10B981' : c.pct >= 88 ? '#F59E0B' : '#EF4444', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top cities table */}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Top 5 Cities by Elder Population</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
              <TH>#</TH><TH>City</TH><TH>Elders Tracked</TH><TH>Caregivers</TH><TH>Avg Age</TH>
            </tr>
          </thead>
          <tbody>
            {TOP_CITIES_ELDER.map((c, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <TD><span style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>#{i + 1}</span></TD>
                <TD style={{ fontWeight: 600 }}>{c.city}</TD>
                <TD style={{ fontWeight: 700 }}>{c.elders.toLocaleString()}</TD>
                <TD>{c.caregivers.toLocaleString()}</TD>
                <TD style={{ fontWeight: 600 }}>{c.avgAge} yrs</TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
