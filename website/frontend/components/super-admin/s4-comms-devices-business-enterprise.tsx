'use client'

import { useState } from 'react'
import {
  Mail, MessageSquare, Megaphone, Watch, MapPin, Camera,
  Home, Activity, FileText, BarChart2, Globe, School,
  Building2, Heart, TrendingUp, Plus, Search, Eye,
  Edit2, Trash2, Send, CheckCircle, XCircle, AlertTriangle,
  Battery, Wifi, Download, RefreshCw
} from 'lucide-react'

// ─── Shared Styles ───────────────────────────────────────────────────────────

const card = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 20,
} as const

const statCard = {
  ...card,
  flex: 1,
  minWidth: 140,
} as const

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  color: 'var(--text-muted)',
  fontWeight: 600,
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
}

const td: React.CSSProperties = {
  padding: '10px 12px',
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'middle',
}

const badge = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 99,
  fontSize: 11,
  fontWeight: 600,
  background: color + '22',
  color: color,
})

const statusColor = (s: string) => {
  const m: Record<string, string> = {
    Active: '#10B981', Sent: '#10B981', Delivered: '#10B981', Paid: '#10B981',
    Online: '#10B981', Healthy: '#10B981', Good: '#10B981',
    Draft: '#F59E0B', Pending: '#F59E0B', Low: '#F59E0B', Warning: '#F59E0B',
    Overdue: '#EF4444', Failed: '#EF4444', Offline: '#EF4444', Critical: '#EF4444',
    Tampered: '#EF4444', Inactive: '#6B7280', Scheduled: '#3B82F6',
    Paused: '#6B7280', Completed: '#10B981', Running: '#3B82F6',
  }
  return m[s] || '#6B7280'
}

function StatRow({ stats }: { stats: { label: string; value: string | number; color?: string }[] }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
      {stats.map((s, i) => (
        <div key={i} style={statCard}>
          <div style={{ fontSize: 22, fontWeight: 700, color: s.color || 'var(--gold)' }}>{s.value}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search..."
        style={{
          width: '100%', boxSizing: 'border-box', padding: '8px 12px 8px 32px',
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--text-primary)', fontSize: 13,
        }}
      />
    </div>
  )
}

function BatteryBar({ pct }: { pct: number }) {
  const color = pct < 20 ? '#EF4444' : pct < 50 ? '#F59E0B' : '#10B981'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 60, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 12, color }}>{pct}%</span>
    </div>
  )
}

function ActionBtns() {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}><Eye size={13} /></button>
      <button style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit2 size={13} /></button>
      <button style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={13} /></button>
    </div>
  )
}

// ─── 1. EmailCampaignsSection ─────────────────────────────────────────────────

export function EmailCampaignsSection() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', audience: '', subject: '' })

  const rows = [
    { name: 'Welcome Series Q2', audience: 'New Users', sent: '24,340', opened: '8,950', clicked: '2,120', status: 'Active' },
    { name: 'Feature Announcement – Geo+', audience: 'All Users', sent: '1,24,000', opened: '42,800', clicked: '9,300', status: 'Sent' },
    { name: 'School Safety Newsletter', audience: 'Schools', sent: '4,230', opened: '1,890', clicked: '340', status: 'Sent' },
    { name: 'Premium Upgrade Offer', audience: 'Free Users', sent: '18,450', opened: '5,230', clicked: '1,890', status: 'Active' },
    { name: 'Monthly Digest – May', audience: 'All Users', sent: '1,10,000', opened: '38,500', clicked: '7,200', status: 'Sent' },
    { name: 'Enterprise Onboarding', audience: 'Enterprise', sent: '890', opened: '670', clicked: '230', status: 'Active' },
    { name: 'SOS Alert Re-engagement', audience: 'Inactive', sent: '12,340', opened: '3,400', clicked: '890', status: 'Paused' },
    { name: 'Diwali Special Offer', audience: 'All Users', sent: '98,000', opened: '28,000', clicked: '8,200', status: 'Completed' },
    { name: 'Hospital Partnership Invite', audience: 'Hospitals', sent: '340', opened: '290', clicked: '120', status: 'Sent' },
    { name: 'NGO Subsidy Announcement', audience: 'NGOs', sent: '230', opened: '198', clicked: '87', status: 'Scheduled' },
  ].filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <StatRow stats={[
        { label: 'Campaigns', value: 34 },
        { label: 'Total Sent', value: '12.4L' },
        { label: 'Open Rate', value: '34.2%', color: '#10B981' },
        { label: 'Click Rate', value: '8.9%', color: '#3B82F6' },
      ]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Email Campaigns</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
        >
          <Plus size={14} /> Create Campaign
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>New Email Campaign</h4>
          {[
            { label: 'Campaign Name', key: 'name' },
            { label: 'Target Audience', key: 'audience' },
            { label: 'Subject Line', key: 'subject' },
          ].map(f => (
            <div key={f.key}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{f.label}</div>
              <input
                value={(formData as any)[f.key]}
                onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13 }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '8px 20px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Save Draft</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '8px 20px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={card}>
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>{['Campaign', 'Audience', 'Sent', 'Opened', 'Clicked', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={td}>{r.name}</td>
                  <td style={td}><span style={{ color: 'var(--text-secondary)' }}>{r.audience}</span></td>
                  <td style={td}>{r.sent}</td>
                  <td style={td}>{r.opened}</td>
                  <td style={td}>{r.clicked}</td>
                  <td style={td}><span style={badge(statusColor(r.status))}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 2. SMSCampaignsSection ───────────────────────────────────────────────────

export function SMSCampaignsSection() {
  const [search, setSearch] = useState('')

  const rows = [
    { name: 'OTP Delivery', type: 'Transactional', recipients: '45,230', delivered: '44,980', failed: '250', cost: '₹4,523', status: 'Active' },
    { name: 'SOS Alert Notify', type: 'Alert', recipients: '8,340', delivered: '8,290', failed: '50', cost: '₹834', status: 'Active' },
    { name: 'School Safety Update', type: 'Promotional', recipients: '12,450', delivered: '12,100', failed: '350', cost: '₹1,245', status: 'Sent' },
    { name: 'Premium Renewal Reminder', type: 'Promotional', recipients: '18,900', delivered: '18,340', failed: '560', cost: '₹1,890', status: 'Sent' },
    { name: 'Device Low Battery Alert', type: 'Alert', recipients: '4,230', delivered: '4,150', failed: '80', cost: '₹423', status: 'Active' },
    { name: 'New Feature Launch', type: 'Promotional', recipients: '89,000', delivered: '86,500', failed: '2,500', cost: '₹8,900', status: 'Paused' },
    { name: 'Hospital Patient Notify', type: 'Transactional', recipients: '3,450', delivered: '3,390', failed: '60', cost: '₹345', status: 'Active' },
    { name: 'Geofence Breach Alert', type: 'Alert', recipients: '2,340', delivered: '2,310', failed: '30', cost: '₹234', status: 'Active' },
  ].filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <StatRow stats={[
        { label: 'Campaigns', value: 23 },
        { label: 'Total Sent', value: '4.2L' },
        { label: 'Delivery Rate', value: '97.3%', color: '#10B981' },
        { label: 'Total Cost', value: '₹8,234', color: '#F59E0B' },
      ]} />
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>SMS Campaigns</h3>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            <Plus size={14} /> New SMS Campaign
          </button>
        </div>
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>{['Campaign', 'Type', 'Recipients', 'Delivered', 'Failed', 'Cost', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={td}>{r.name}</td>
                  <td style={td}><span style={{ color: 'var(--text-secondary)' }}>{r.type}</span></td>
                  <td style={td}>{r.recipients}</td>
                  <td style={td}><span style={{ color: '#10B981' }}>{r.delivered}</span></td>
                  <td style={td}><span style={{ color: '#EF4444' }}>{r.failed}</span></td>
                  <td style={td}><span style={{ color: 'var(--gold)', fontWeight: 600 }}>{r.cost}</span></td>
                  <td style={td}><span style={badge(statusColor(r.status))}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 3. AnnouncementsSection ──────────────────────────────────────────────────

export function AnnouncementsSection() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newAnn, setNewAnn] = useState({ title: '', body: '', target: '', channels: '' })

  const active = [
    { title: '🚨 Server Maintenance — 2 AM to 4 AM IST', body: 'Scheduled maintenance on June 15. App will be in read-only mode. SOS alerts unaffected.', target: 'All Users', channels: 'App, Email, SMS', views: '2,34,567', status: 'Active' },
    { title: 'New Feature: Live Audio Monitoring', body: 'Premium users can now enable live audio monitoring on Gravity Watch Pro. Upgrade to access.', target: 'Premium Users', channels: 'App, Push, Email', views: '89,230', status: 'Active' },
    { title: 'School Safety Month — June 2026', body: 'Special discounts for schools enrolling in June. Contact your district coordinator for bulk pricing.', target: 'Schools', channels: 'Email, SMS', views: '12,450', status: 'Active' },
  ]

  const history = [
    { title: 'Independence Day Safety Drive', date: '15 Aug 2025', target: 'All Users', views: '3,45,000', status: 'Completed' },
    { title: 'App v4.2 Release Notes', date: '1 Jun 2025', target: 'All Users', views: '1,23,000', status: 'Completed' },
    { title: 'Premium Plan Price Revision', date: '1 Apr 2025', target: 'Premium Users', views: '67,000', status: 'Completed' },
    { title: 'SOS Feature Upgrade', date: '15 Mar 2025', target: 'All Users', views: '2,89,000', status: 'Completed' },
  ].filter(r => r.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Announcements</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
        >
          <Plus size={14} /> Create Announcement
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>New Announcement</h4>
          {[
            { label: 'Title', key: 'title' },
            { label: 'Message Body', key: 'body' },
            { label: 'Target Audience', key: 'target' },
            { label: 'Channels (App, Email, SMS)', key: 'channels' },
          ].map(f => (
            <div key={f.key}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{f.label}</div>
              <input
                value={(newAnn as any)[f.key]}
                onChange={e => setNewAnn(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13 }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}><Send size={13} /> Publish</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '8px 20px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {active.map((a, i) => (
          <div key={i} style={{ ...card, borderLeft: '3px solid var(--gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{a.body}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>Target: <b style={{ color: 'var(--text-secondary)' }}>{a.target}</b></span>
                  <span>Channels: <b style={{ color: 'var(--text-secondary)' }}>{a.channels}</b></span>
                  <span>Views: <b style={{ color: 'var(--gold)' }}>{a.views}</b></span>
                </div>
              </div>
              <span style={badge('#10B981')}>{a.status}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <h4 style={{ margin: '0 0 12px', color: 'var(--text-primary)' }}>History</h4>
        <SearchBar value={search} onChange={setSearch} />
        <table style={tableStyle}>
          <thead>
            <tr>{['Title', 'Date', 'Target', 'Views', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {history.map((r, i) => (
              <tr key={i}>
                <td style={td}>{r.title}</td>
                <td style={td}><span style={{ color: 'var(--text-muted)' }}>{r.date}</span></td>
                <td style={td}>{r.target}</td>
                <td style={td}>{r.views}</td>
                <td style={td}><span style={badge(statusColor(r.status))}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 4. SmartWatchesSection ───────────────────────────────────────────────────

export function SmartWatchesSection() {
  const [search, setSearch] = useState('')

  const rows = [
    { id: 'GW-10023', model: 'Gravity Pro X2', owner: 'Priya Sharma', battery: 87, sync: '2 min ago', hr: '72 bpm', status: 'Active' },
    { id: 'GW-10045', model: 'Gravity Kids S1', owner: 'Arjun Mehta', battery: 45, sync: '15 min ago', hr: '88 bpm', status: 'Active' },
    { id: 'GW-10089', model: 'Gravity Elder E1', owner: 'Kavya Reddy', battery: 12, sync: '1 hr ago', hr: '67 bpm', status: 'Active' },
    { id: 'GW-10102', model: 'Gravity Pro X2', owner: 'Rahul Gupta', battery: 93, sync: '5 min ago', hr: '78 bpm', status: 'Active' },
    { id: 'GW-10234', model: 'Gravity Kids S1', owner: 'Anjali Singh', battery: 8, sync: '3 hr ago', hr: '—', status: 'Offline' },
    { id: 'GW-10345', model: 'Gravity Lite L1', owner: 'Vikram Nair', battery: 56, sync: '30 min ago', hr: '82 bpm', status: 'Active' },
    { id: 'GW-10456', model: 'Gravity Pro X2', owner: 'Sunita Rao', battery: 74, sync: '8 min ago', hr: '91 bpm', status: 'Active' },
    { id: 'GW-10567', model: 'Gravity Elder E1', owner: 'Deepak Joshi', battery: 31, sync: '2 hr ago', hr: '65 bpm', status: 'Active' },
    { id: 'GW-10678', model: 'Gravity Kids S1', owner: 'Meera Pillai', battery: 18, sync: '45 min ago', hr: '95 bpm', status: 'Active' },
    { id: 'GW-10789', model: 'Gravity Pro X2', owner: 'Rohan Verma', battery: 0, sync: '24 hr ago', hr: '—', status: 'Offline' },
  ].filter(r => r.id.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <StatRow stats={[
        { label: 'Total Watches', value: '8,920' },
        { label: 'Active', value: '7,230', color: '#10B981' },
        { label: 'Low Battery', value: 340, color: '#F59E0B' },
        { label: 'Offline', value: 890, color: '#EF4444' },
      ]} />
      <div style={card}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 16px' }}>Smart Watches</h3>
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>{['Device ID', 'Model', 'Owner', 'Battery', 'Last Sync', 'Heart Rate', 'Status', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={td}><span style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{r.id}</span></td>
                  <td style={td}>{r.model}</td>
                  <td style={td}>{r.owner}</td>
                  <td style={td}><BatteryBar pct={r.battery} /></td>
                  <td style={td}><span style={{ color: 'var(--text-muted)' }}>{r.sync}</span></td>
                  <td style={td}>{r.hr}</td>
                  <td style={td}><span style={badge(statusColor(r.status))}>{r.status}</span></td>
                  <td style={td}><ActionBtns /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 5. GPSTrackersSection ────────────────────────────────────────────────────

export function GPSTrackersSection() {
  const [search, setSearch] = useState('')

  const rows = [
    { id: 'GT-5001', imei: '356301234567890', owner: 'Priya Sharma', battery: 78, signal: 'Strong', location: 'Connaught Place, Delhi', status: 'Active' },
    { id: 'GT-5002', imei: '356309876543210', owner: 'Arjun Mehta', battery: 34, signal: 'Medium', location: 'Bandra West, Mumbai', status: 'Active' },
    { id: 'GT-5003', imei: '356301122334455', owner: 'DPS Noida Bus#12', battery: 91, signal: 'Strong', location: 'Sector 62, Noida', status: 'Active' },
    { id: 'GT-5004', imei: '356305544332211', owner: 'Kavya Reddy', battery: 15, signal: 'Weak', location: 'Jubilee Hills, Hyd', status: 'Active' },
    { id: 'GT-5005', imei: '356306677889900', owner: 'Rahul Gupta', battery: 0, signal: 'None', location: 'Last: Lajpat Nagar', status: 'Offline' },
    { id: 'GT-5006', imei: '356307788990011', owner: 'Vikram Nair', battery: 62, signal: 'Strong', location: 'Koramangala, Bengaluru', status: 'Active' },
    { id: 'GT-5007', imei: '356308899001122', owner: 'AIIMS Ambulance#3', battery: 88, signal: 'Strong', location: 'Ansari Nagar, Delhi', status: 'Active' },
    { id: 'GT-5008', imei: '356301234500000', owner: 'Sunita Rao', battery: 23, signal: 'Medium', location: 'T. Nagar, Chennai', status: 'Active' },
    { id: 'GT-5009', imei: '356309990001112', owner: 'Deepak Joshi', battery: 55, signal: 'Strong', location: 'Hazratganj, Lucknow', status: 'Tampered' },
    { id: 'GT-5010', imei: '356302233445566', owner: 'Meera Pillai', battery: 80, signal: 'Strong', location: 'Panjim, Goa', status: 'Active' },
  ].filter(r => r.id.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <StatRow stats={[
        { label: 'Total Trackers', value: '4,230' },
        { label: 'Active', value: '3,890', color: '#10B981' },
        { label: 'Low Battery', value: 234, color: '#F59E0B' },
        { label: 'Tampered', value: 12, color: '#EF4444' },
      ]} />
      <div style={card}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 16px' }}>GPS Trackers</h3>
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>{['Tracker ID', 'IMEI', 'Assigned To', 'Battery', 'Signal', 'Last Location', 'Status', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={td}><span style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{r.id}</span></td>
                  <td style={td}><span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{r.imei}</span></td>
                  <td style={td}>{r.owner}</td>
                  <td style={td}><BatteryBar pct={r.battery} /></td>
                  <td style={td}><span style={{ color: r.signal === 'Strong' ? '#10B981' : r.signal === 'Medium' ? '#F59E0B' : '#EF4444' }}>{r.signal}</span></td>
                  <td style={td}><span style={{ color: 'var(--text-secondary)' }}>{r.location}</span></td>
                  <td style={td}><span style={badge(statusColor(r.status))}>{r.status}</span></td>
                  <td style={td}><ActionBtns /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 6. CamerasSection ────────────────────────────────────────────────────────

export function CamerasSection() {
  const [search, setSearch] = useState('')

  const rows = [
    { id: 'CAM-2001', model: 'Gravity Cam 4K', owner: 'DPS Noida', status: 'Active', lastEvent: 'Motion — 5 min ago', storage: '234 GB', storageUsed: 72 },
    { id: 'CAM-2002', model: 'Gravity Doorbell', owner: 'Priya Sharma', status: 'Active', lastEvent: 'Ring — 1 hr ago', storage: '45 GB', storageUsed: 38 },
    { id: 'CAM-2003', model: 'Gravity Cam 4K', owner: 'AIIMS Delhi', status: 'Active', lastEvent: 'Person — 2 min ago', storage: '890 GB', storageUsed: 91 },
    { id: 'CAM-2004', model: 'Gravity Indoor', owner: 'Rahul Gupta', status: 'Offline', lastEvent: '2 days ago', storage: '120 GB', storageUsed: 55 },
    { id: 'CAM-2005', model: 'Gravity PTZ', owner: 'Ryan International', status: 'Active', lastEvent: 'Motion — 10 min ago', storage: '450 GB', storageUsed: 67 },
    { id: 'CAM-2006', model: 'Gravity Cam 4K', owner: 'Vikram Nair', status: 'Active', lastEvent: 'SOS triggered — 3 hr ago', storage: '78 GB', storageUsed: 44 },
    { id: 'CAM-2007', model: 'Gravity Doorbell', owner: 'Anjali Singh', status: 'Active', lastEvent: 'Package detected — 30 min ago', storage: '32 GB', storageUsed: 28 },
    { id: 'CAM-2008', model: 'Gravity PTZ', owner: 'CBSE Board HQ', status: 'Active', lastEvent: 'Face rec — 8 min ago', storage: '670 GB', storageUsed: 83 },
  ].filter(r => r.id.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <StatRow stats={[
        { label: 'Total Cameras', value: '2,340' },
        { label: 'Active', value: '2,100', color: '#10B981' },
        { label: 'Events Today', value: '1,234', color: '#3B82F6' },
        { label: 'Storage Used', value: '4.2 TB', color: '#F59E0B' },
      ]} />
      <div style={card}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 16px' }}>Cameras</h3>
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>{['Camera ID', 'Model', 'Owner', 'Status', 'Last Event', 'Storage', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={td}><span style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{r.id}</span></td>
                  <td style={td}>{r.model}</td>
                  <td style={td}>{r.owner}</td>
                  <td style={td}><span style={badge(statusColor(r.status))}>{r.status}</span></td>
                  <td style={td}><span style={{ color: 'var(--text-secondary)' }}>{r.lastEvent}</span></td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 60, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${r.storageUsed}%`, height: '100%', background: r.storageUsed > 80 ? '#EF4444' : '#3B82F6', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.storage}</span>
                    </div>
                  </td>
                  <td style={td}><ActionBtns /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 7. SmartHomeSection ──────────────────────────────────────────────────────

export function SmartHomeSection() {
  const [search, setSearch] = useState('')

  const rows = [
    { device: 'Front Door Lock', type: 'Smart Lock', owner: 'Priya Sharma', status: 'Locked', battery: 82, lastAction: 'Unlocked 8:30 AM' },
    { device: 'Bedroom Sensor', type: 'Motion Sensor', owner: 'Arjun Mehta', status: 'Active', battery: 67, lastAction: 'Motion 10 min ago' },
    { device: 'Main Gate Lock', type: 'Smart Lock', owner: 'DPS Noida', status: 'Locked', battery: 91, lastAction: 'Locked 7:00 PM' },
    { device: 'Kitchen Smoke Sensor', type: 'Smoke Sensor', owner: 'Kavya Reddy', status: 'Active', battery: 45, lastAction: 'All clear' },
    { device: 'Study Room Door', type: 'Smart Lock', owner: 'Rahul Gupta', status: 'Unlocked', battery: 23, lastAction: 'Unlocked 2:15 PM' },
    { device: 'Garden PIR', type: 'Motion Sensor', owner: 'Vikram Nair', status: 'Active', battery: 78, lastAction: 'Motion 1 hr ago' },
    { device: 'Panic Button – Bedroom', type: 'Panic Button', owner: 'Sunita Rao', status: 'Active', battery: 55, lastAction: 'Test 3 days ago' },
    { device: 'Door Window Sensor', type: 'Contact Sensor', owner: 'Deepak Joshi', status: 'Active', battery: 88, lastAction: 'Closed 6:45 PM' },
  ].filter(r => r.device.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <StatRow stats={[
        { label: 'Total Devices', value: '1,234' },
        { label: 'Smart Locks', value: 890 },
        { label: 'Sensors', value: 344, color: '#3B82F6' },
        { label: 'Alerts Today', value: 23, color: '#F59E0B' },
      ]} />
      <div style={card}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 16px' }}>Smart Home Devices</h3>
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>{['Device', 'Type', 'Owner', 'Status', 'Battery', 'Last Action', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={td}>{r.device}</td>
                  <td style={td}><span style={{ color: 'var(--text-secondary)' }}>{r.type}</span></td>
                  <td style={td}>{r.owner}</td>
                  <td style={td}><span style={badge(r.status === 'Locked' ? '#10B981' : r.status === 'Unlocked' ? '#F59E0B' : '#3B82F6')}>{r.status}</span></td>
                  <td style={td}><BatteryBar pct={r.battery} /></td>
                  <td style={td}><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.lastAction}</span></td>
                  <td style={td}><ActionBtns /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 8. DeviceHealthSection ───────────────────────────────────────────────────

export function DeviceHealthSection() {
  const [search, setSearch] = useState('')

  const distribution = [
    { label: '> 80%', pct: 58, color: '#10B981' },
    { label: '50–80%', pct: 24, color: '#3B82F6' },
    { label: '20–50%', pct: 12, color: '#F59E0B' },
    { label: '< 20%', pct: 6, color: '#EF4444' },
  ]

  const rows = [
    { device: 'GW-10089', owner: 'Kavya Reddy', battery: 12, signal: 'Weak', uptime: 91.2, lastSeen: '1 hr ago', risk: 'Critical' },
    { device: 'GT-5005', owner: 'Rahul Gupta', battery: 0, signal: 'None', uptime: 72.4, lastSeen: '24 hr ago', risk: 'Critical' },
    { device: 'CAM-2004', owner: 'Rahul Gupta', battery: 55, signal: 'None', uptime: 68.1, lastSeen: '2 days ago', risk: 'Critical' },
    { device: 'GW-10234', owner: 'Anjali Singh', battery: 8, signal: 'Weak', uptime: 85.3, lastSeen: '3 hr ago', risk: 'Critical' },
    { device: 'GT-5004', owner: 'Kavya Reddy', battery: 15, signal: 'Weak', uptime: 94.5, lastSeen: '30 min ago', risk: 'Warning' },
    { device: 'GW-10678', owner: 'Meera Pillai', battery: 18, signal: 'Medium', uptime: 97.8, lastSeen: '45 min ago', risk: 'Warning' },
    { device: 'GT-5002', owner: 'Arjun Mehta', battery: 34, signal: 'Medium', uptime: 99.1, lastSeen: '15 min ago', risk: 'Good' },
    { device: 'GW-10567', owner: 'Deepak Joshi', battery: 31, signal: 'Strong', uptime: 98.7, lastSeen: '2 hr ago', risk: 'Good' },
    { device: 'GW-10023', owner: 'Priya Sharma', battery: 87, signal: 'Strong', uptime: 99.9, lastSeen: '2 min ago', risk: 'Healthy' },
    { device: 'CAM-2003', owner: 'AIIMS Delhi', battery: 100, signal: 'Strong', uptime: 99.8, lastSeen: '2 min ago', risk: 'Healthy' },
  ].filter(r => r.device.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <StatRow stats={[
        { label: 'Total Devices', value: '1,45,678' },
        { label: 'Critical Battery <20%', value: '4,230', color: '#EF4444' },
        { label: 'Poor Signal', value: '1,234', color: '#F59E0B' },
        { label: 'Offline >24h', value: '8,920', color: '#EF4444' },
      ]} />

      <div style={{ ...card, marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 12px', color: 'var(--text-primary)' }}>Battery Distribution</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {distribution.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 55, flexShrink: 0 }}>{d.label}</span>
              <div style={{ flex: 1, height: 16, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${d.pct}%`, height: '100%', background: d.color, borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                  <span style={{ fontSize: 11, color: '#000', fontWeight: 600 }}>{d.pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 16px' }}>Device Health — At-Risk Devices</h3>
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>{['Device', 'Owner', 'Battery', 'Signal', 'Uptime %', 'Last Seen', 'Risk'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={td}><span style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{r.device}</span></td>
                  <td style={td}>{r.owner}</td>
                  <td style={td}><BatteryBar pct={r.battery} /></td>
                  <td style={td}><span style={{ color: r.signal === 'Strong' ? '#10B981' : r.signal === 'Medium' ? '#F59E0B' : '#EF4444' }}>{r.signal}</span></td>
                  <td style={td}>{r.uptime}%</td>
                  <td style={td}><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.lastSeen}</span></td>
                  <td style={td}><span style={badge(statusColor(r.risk))}>{r.risk}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 9. InvoicesSection ───────────────────────────────────────────────────────

export function InvoicesSection() {
  const [search, setSearch] = useState('')

  const rows = [
    { inv: 'INV-2026-0892', customer: 'DPS Noida', plan: 'School Pro', amount: '₹24,500', date: '1 Jun 2026', due: '15 Jun 2026', status: 'Paid' },
    { inv: 'INV-2026-0891', customer: 'AIIMS Delhi', plan: 'Hospital Enterprise', amount: '₹48,000', date: '1 Jun 2026', due: '15 Jun 2026', status: 'Paid' },
    { inv: 'INV-2026-0890', customer: 'Priya Sharma', plan: 'Family Premium', amount: '₹2,999', date: '1 Jun 2026', due: '1 Jun 2026', status: 'Paid' },
    { inv: 'INV-2026-0889', customer: 'Childline India', plan: 'NGO Special', amount: '₹4,500', date: '1 Jun 2026', due: '15 Jun 2026', status: 'Overdue' },
    { inv: 'INV-2026-0888', customer: 'Ryan International', plan: 'School Pro', amount: '₹18,000', date: '1 Jun 2026', due: '10 Jun 2026', status: 'Overdue' },
    { inv: 'INV-2026-0887', customer: 'Arjun Mehta', plan: 'Individual Pro', amount: '₹999', date: '1 Jun 2026', due: '1 Jun 2026', status: 'Paid' },
    { inv: 'INV-2026-0886', customer: 'Apollo Hospitals', plan: 'Hospital Pro', amount: '₹28,000', date: '1 Jun 2026', due: '15 Jun 2026', status: 'Paid' },
    { inv: 'INV-2026-0885', customer: 'Kendriya Vidyalaya', plan: 'Govt School', amount: '₹8,500', date: '1 May 2026', due: '15 May 2026', status: 'Overdue' },
    { inv: 'INV-2026-0884', customer: 'Vikram Nair', plan: 'Family Premium', amount: '₹2,999', date: '1 Jun 2026', due: '1 Jun 2026', status: 'Paid' },
    { inv: 'INV-2026-0883', customer: 'Tata Consultancy', plan: 'Corporate', amount: '₹75,000', date: '1 Jun 2026', due: '30 Jun 2026', status: 'Pending' },
    { inv: 'INV-2026-0882', customer: 'Kavya Reddy', plan: 'Individual Pro', amount: '₹999', date: '1 Jun 2026', due: '1 Jun 2026', status: 'Paid' },
    { inv: 'INV-2026-0881', customer: 'Manipal Hospitals', plan: 'Hospital Enterprise', amount: '₹42,000', date: '1 Jun 2026', due: '15 Jun 2026', status: 'Paid' },
  ].filter(r => r.inv.toLowerCase().includes(search.toLowerCase()) || r.customer.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <StatRow stats={[
        { label: 'Total Invoices', value: '8,234' },
        { label: 'Total Amount', value: '₹48.7L', color: 'var(--gold)' },
        { label: 'Paid', value: '7,890', color: '#10B981' },
        { label: 'Overdue', value: 110, color: '#EF4444' },
      ]} />
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Invoices</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}><Download size={13} /> Export</button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}><Plus size={13} /> New Invoice</button>
          </div>
        </div>
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>{['Invoice #', 'Customer', 'Plan', 'Amount', 'Date', 'Due Date', 'Status', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={td}><span style={{ fontFamily: 'monospace', color: 'var(--gold)', fontSize: 12 }}>{r.inv}</span></td>
                  <td style={td}>{r.customer}</td>
                  <td style={td}><span style={{ color: 'var(--text-secondary)' }}>{r.plan}</span></td>
                  <td style={td}><span style={{ fontWeight: 600 }}>{r.amount}</span></td>
                  <td style={td}><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.date}</span></td>
                  <td style={td}><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.due}</span></td>
                  <td style={td}><span style={badge(statusColor(r.status))}>{r.status}</span></td>
                  <td style={td}><ActionBtns /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 10. FinancialReportsSection ──────────────────────────────────────────────

export function FinancialReportsSection() {
  const [search, setSearch] = useState('')

  const months = [
    { month: 'Jul 2025', revenue: '₹38.2L', newMrr: '₹4.2L', churned: '₹0.6L', netMrr: '₹3.6L', growth: '+10.4%' },
    { month: 'Aug 2025', revenue: '₹40.1L', newMrr: '₹4.5L', churned: '₹0.7L', netMrr: '₹3.8L', growth: '+9.8%' },
    { month: 'Sep 2025', revenue: '₹41.5L', newMrr: '₹3.9L', churned: '₹0.5L', netMrr: '₹3.4L', growth: '+8.5%' },
    { month: 'Oct 2025', revenue: '₹43.2L', newMrr: '₹5.1L', churned: '₹0.8L', netMrr: '₹4.3L', growth: '+10.3%' },
    { month: 'Nov 2025', revenue: '₹44.0L', newMrr: '₹4.8L', churned: '₹0.6L', netMrr: '₹4.2L', growth: '+9.7%' },
    { month: 'Dec 2025', revenue: '₹45.8L', newMrr: '₹6.2L', churned: '₹0.5L', netMrr: '₹5.7L', growth: '+12.9%' },
    { month: 'Jan 2026', revenue: '₹44.5L', newMrr: '₹3.8L', churned: '₹0.9L', netMrr: '₹2.9L', growth: '+6.5%' },
    { month: 'Feb 2026', revenue: '₹45.9L', newMrr: '₹4.2L', churned: '₹0.7L', netMrr: '₹3.5L', growth: '+7.8%' },
    { month: 'Mar 2026', revenue: '₹46.8L', newMrr: '₹5.5L', churned: '₹0.8L', netMrr: '₹4.7L', growth: '+10.2%' },
    { month: 'Apr 2026', revenue: '₹47.1L', newMrr: '₹4.9L', churned: '₹0.6L', netMrr: '₹4.3L', growth: '+9.1%' },
    { month: 'May 2026', revenue: '₹47.9L', newMrr: '₹5.2L', churned: '₹0.7L', netMrr: '₹4.5L', growth: '+9.5%' },
    { month: 'Jun 2026', revenue: '₹48.7L', newMrr: '₹5.8L', churned: '₹0.7L', netMrr: '₹5.1L', growth: '+10.6%' },
  ].filter(r => r.month.toLowerCase().includes(search.toLowerCase()))

  const planRevenue = [
    { plan: 'Family Premium', pct: 42, color: 'var(--gold)' },
    { plan: 'School Pro', pct: 28, color: '#3B82F6' },
    { plan: 'Hospital Enterprise', pct: 16, color: '#10B981' },
    { plan: 'Corporate', pct: 9, color: '#8B5CF6' },
    { plan: 'NGO Special', pct: 5, color: '#F59E0B' },
  ]

  return (
    <div>
      <StatRow stats={[
        { label: 'MRR', value: '₹48.7L', color: 'var(--gold)' },
        { label: 'ARR', value: '₹5.84 Cr', color: 'var(--gold)' },
        { label: 'YoY Growth', value: '34.2%', color: '#10B981' },
        { label: 'Churn Rate', value: '1.8%', color: '#EF4444' },
      ]} />

      <div style={{ ...card, marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 16px', color: 'var(--text-primary)' }}>Revenue by Plan</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {planRevenue.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 140, flexShrink: 0 }}>{p.plan}</span>
              <div style={{ flex: 1, height: 18, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${p.pct}%`, height: '100%', background: p.color, borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                  <span style={{ fontSize: 11, color: '#000', fontWeight: 700 }}>{p.pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 16px' }}>Monthly Revenue (Last 12 Months)</h3>
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>{['Month', 'Revenue', 'New MRR', 'Churned', 'Net MRR', 'Growth %'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {months.map((r, i) => (
                <tr key={i}>
                  <td style={td}><b>{r.month}</b></td>
                  <td style={td}><span style={{ color: 'var(--gold)', fontWeight: 600 }}>{r.revenue}</span></td>
                  <td style={td}><span style={{ color: '#10B981' }}>{r.newMrr}</span></td>
                  <td style={td}><span style={{ color: '#EF4444' }}>{r.churned}</span></td>
                  <td style={td}><span style={{ color: '#3B82F6', fontWeight: 600 }}>{r.netMrr}</span></td>
                  <td style={td}><span style={{ color: '#10B981', fontWeight: 600 }}>{r.growth}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 11. WhiteLabelSection ────────────────────────────────────────────────────

export function WhiteLabelSection() {
  const [search, setSearch] = useState('')

  const rows = [
    { partner: 'SafeKids Tech', brand: 'SafeKids', domain: 'safekids.in', users: 4230, revenue: '₹8.4L', commission: 15, status: 'Active' },
    { partner: 'FamilyGuard Solutions', brand: 'FamilyGuard', domain: 'familyguard.co.in', users: 2890, revenue: '₹5.8L', commission: 12, status: 'Active' },
    { partner: 'EduSafe Technologies', brand: 'EduSafe', domain: 'edusafe.in', users: 8900, revenue: '₹12.4L', commission: 18, status: 'Active' },
    { partner: 'HealthTrack India', brand: 'HealthTrack', domain: 'healthtrack.in', users: 1230, revenue: '₹2.4L', commission: 10, status: 'Active' },
    { partner: 'SecureHome Ltd', brand: 'SecureHome', domain: 'securehome.in', users: 3450, revenue: '₹6.9L', commission: 15, status: 'Active' },
    { partner: 'NGO Shield', brand: 'NGO Shield', domain: 'ngoshield.org', users: 560, revenue: '₹0.8L', commission: 5, status: 'Active' },
    { partner: 'CorporateWatch', brand: 'CorpWatch', domain: 'corpwatch.in', users: 890, revenue: '₹3.2L', commission: 12, status: 'Inactive' },
    { partner: 'SmartSafety Co.', brand: 'SmartSafety', domain: 'smartsafety.in', users: 2100, revenue: '₹4.1L', commission: 14, status: 'Active' },
  ].filter(r => r.partner.toLowerCase().includes(search.toLowerCase()) || r.brand.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <StatRow stats={[
        { label: 'Total Partners', value: 23 },
        { label: 'Active', value: 20, color: '#10B981' },
        { label: 'MRR Share', value: '₹12.4L', color: 'var(--gold)' },
        { label: 'Avg Users/Partner', value: '4,230', color: '#3B82F6' },
      ]} />
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>White-Label Partners</h3>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}><Plus size={14} /> Add Partner</button>
        </div>
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>{['Partner', 'Brand', 'Domain', 'Users', 'Revenue', 'Commission %', 'Status', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={td}>{r.partner}</td>
                  <td style={td}><b style={{ color: 'var(--gold)' }}>{r.brand}</b></td>
                  <td style={td}><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{r.domain}</span></td>
                  <td style={td}>{r.users.toLocaleString('en-IN')}</td>
                  <td style={td}><span style={{ fontWeight: 600 }}>{r.revenue}</span></td>
                  <td style={td}><span style={{ color: '#10B981' }}>{r.commission}%</span></td>
                  <td style={td}><span style={badge(statusColor(r.status))}>{r.status}</span></td>
                  <td style={td}><ActionBtns /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 12. SchoolsEnterpriseSection ────────────────────────────────────────────

export function SchoolsEnterpriseSection() {
  const [search, setSearch] = useState('')

  const rows = [
    { school: 'DPS Noida', board: 'CBSE', city: 'Noida', students: 4500, plan: 'School Pro', mrr: '₹24,500', status: 'Active' },
    { school: 'Ryan International', board: 'CBSE', city: 'Mumbai', students: 6200, plan: 'School Pro', mrr: '₹34,000', status: 'Active' },
    { school: 'Kendriya Vidyalaya', board: 'CBSE', city: 'Delhi', students: 1800, plan: 'Govt School', mrr: '₹8,500', status: 'Active' },
    { school: 'DAV Public School', board: 'CBSE', city: 'Chandigarh', students: 2300, plan: 'School Pro', mrr: '₹12,500', status: 'Active' },
    { school: 'St. Xavier\'s', board: 'ICSE', city: 'Kolkata', students: 3100, plan: 'School Pro', mrr: '₹18,000', status: 'Active' },
    { school: 'Navodaya Vidyalaya', board: 'CBSE', city: 'Pune', students: 980, plan: 'Govt School', mrr: '₹4,500', status: 'Active' },
    { school: 'Indus International', board: 'IB', city: 'Bengaluru', students: 1200, plan: 'Premium Plus', mrr: '₹28,000', status: 'Active' },
    { school: 'Army Public School', board: 'CBSE', city: 'Dehradun', students: 1500, plan: 'Govt School', mrr: '₹6,500', status: 'Active' },
    { school: 'Amity International', board: 'CBSE', city: 'Gurgaon', students: 3800, plan: 'School Pro', mrr: '₹21,000', status: 'Active' },
    { school: 'The Doon School', board: 'ICSE', city: 'Dehradun', students: 540, plan: 'Premium Plus', mrr: '₹15,000', status: 'Active' },
  ].filter(r => r.school.toLowerCase().includes(search.toLowerCase()) || r.city.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <StatRow stats={[
        { label: 'Schools', value: 234 },
        { label: 'Students', value: '2.4L', color: '#3B82F6' },
        { label: 'Districts', value: 89, color: '#8B5CF6' },
        { label: 'MRR', value: '₹8.4L', color: 'var(--gold)' },
      ]} />
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Schools & Enterprise</h3>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}><Plus size={14} /> Add School</button>
        </div>
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>{['School', 'Board', 'City', 'Students', 'Plan', 'MRR', 'Status', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={td}><b>{r.school}</b></td>
                  <td style={td}><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.board}</span></td>
                  <td style={td}>{r.city}</td>
                  <td style={td}>{r.students.toLocaleString('en-IN')}</td>
                  <td style={td}><span style={{ color: '#3B82F6' }}>{r.plan}</span></td>
                  <td style={td}><span style={{ fontWeight: 600, color: 'var(--gold)' }}>{r.mrr}</span></td>
                  <td style={td}><span style={badge(statusColor(r.status))}>{r.status}</span></td>
                  <td style={td}><ActionBtns /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 13. HospitalsSection ─────────────────────────────────────────────────────

export function HospitalsSection() {
  const [search, setSearch] = useState('')

  const rows = [
    { hospital: 'AIIMS Delhi', type: 'Government', city: 'New Delhi', patients: 4500, plan: 'Hospital Enterprise', status: 'Active' },
    { hospital: 'Apollo Hospitals', type: 'Private', city: 'Chennai', patients: 2800, plan: 'Hospital Pro', status: 'Active' },
    { hospital: 'Fortis Healthcare', type: 'Private', city: 'Gurgaon', patients: 1900, plan: 'Hospital Pro', status: 'Active' },
    { hospital: 'Manipal Hospitals', type: 'Private', city: 'Bengaluru', patients: 2100, plan: 'Hospital Enterprise', status: 'Active' },
    { hospital: 'Safdarjung Hospital', type: 'Government', city: 'New Delhi', patients: 3200, plan: 'Govt Hospital', status: 'Active' },
    { hospital: 'Medanta Medicity', type: 'Private', city: 'Gurgaon', patients: 1600, plan: 'Hospital Pro', status: 'Active' },
    { hospital: 'Tata Memorial Centre', type: 'Government', city: 'Mumbai', patients: 2400, plan: 'Govt Hospital', status: 'Active' },
    { hospital: 'Max Super Speciality', type: 'Private', city: 'Delhi', patients: 1200, plan: 'Hospital Pro', status: 'Active' },
  ].filter(r => r.hospital.toLowerCase().includes(search.toLowerCase()) || r.city.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <StatRow stats={[
        { label: 'Hospitals', value: 89 },
        { label: 'Patients Monitored', value: '23,450', color: '#3B82F6' },
        { label: 'MRR', value: '₹4.2L', color: 'var(--gold)' },
      ]} />
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Hospitals</h3>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}><Plus size={14} /> Add Hospital</button>
        </div>
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>{['Hospital', 'Type', 'City', 'Patients', 'Plan', 'Status', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={td}><b>{r.hospital}</b></td>
                  <td style={td}><span style={{ color: r.type === 'Government' ? '#3B82F6' : '#8B5CF6', fontSize: 12 }}>{r.type}</span></td>
                  <td style={td}>{r.city}</td>
                  <td style={td}>{r.patients.toLocaleString('en-IN')}</td>
                  <td style={td}><span style={{ color: '#10B981' }}>{r.plan}</span></td>
                  <td style={td}><span style={badge(statusColor(r.status))}>{r.status}</span></td>
                  <td style={td}><ActionBtns /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 14. NGOsSection ──────────────────────────────────────────────────────────

export function NGOsSection() {
  const [search, setSearch] = useState('')

  const rows = [
    { ngo: 'Childline India', focus: 'Child Safety', city: 'Mumbai', beneficiaries: 2340, subsidy: '₹28,000', status: 'Active' },
    { ngo: 'HelpAge India', focus: 'Elder Care', city: 'Delhi', beneficiaries: 1890, subsidy: '₹22,500', status: 'Active' },
    { ngo: 'CRY India', focus: 'Child Rights', city: 'Chennai', beneficiaries: 1450, subsidy: '₹18,000', status: 'Active' },
    { ngo: 'Pratham Education', focus: 'Education', city: 'Mumbai', beneficiaries: 2800, subsidy: '₹34,000', status: 'Active' },
    { ngo: 'Goonj', focus: 'Disaster Relief', city: 'Delhi', beneficiaries: 980, subsidy: '₹12,000', status: 'Active' },
    { ngo: 'CARE India', focus: 'Women Safety', city: 'Kolkata', beneficiaries: 1230, subsidy: '₹15,000', status: 'Active' },
    { ngo: 'Smile Foundation', focus: 'Child Welfare', city: 'Delhi', beneficiaries: 870, subsidy: '₹10,500', status: 'Active' },
    { ngo: 'Nanhi Kali', focus: 'Girl Education', city: 'Pune', beneficiaries: 780, subsidy: '₹9,500', status: 'Inactive' },
  ].filter(r => r.ngo.toLowerCase().includes(search.toLowerCase()) || r.city.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <StatRow stats={[
        { label: 'NGOs', value: 45 },
        { label: 'Beneficiaries', value: '12,340', color: '#10B981' },
        { label: 'Subsidy Granted', value: '₹2.3L', color: 'var(--gold)' },
      ]} />
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>NGOs & Social Sector</h3>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}><Plus size={14} /> Add NGO</button>
        </div>
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>{['NGO', 'Focus Area', 'City', 'Beneficiaries', 'Subsidy', 'Status', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={td}><b>{r.ngo}</b></td>
                  <td style={td}><span style={{ color: '#8B5CF6' }}>{r.focus}</span></td>
                  <td style={td}>{r.city}</td>
                  <td style={td}>{r.beneficiaries.toLocaleString('en-IN')}</td>
                  <td style={td}><span style={{ fontWeight: 600, color: 'var(--gold)' }}>{r.subsidy}</span></td>
                  <td style={td}><span style={badge(statusColor(r.status))}>{r.status}</span></td>
                  <td style={td}><ActionBtns /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── 15. EnterpriseAnalyticsSection ──────────────────────────────────────────

export function EnterpriseAnalyticsSection() {
  const [search, setSearch] = useState('')

  const revenueByType = [
    { type: 'Schools', amount: '₹8.4L', pct: 34, color: '#3B82F6' },
    { type: 'Hospitals', amount: '₹4.2L', pct: 17, color: '#10B981' },
    { type: 'Corporate', amount: '₹7.5L', pct: 31, color: '#8B5CF6' },
    { type: 'NGO', amount: '₹2.3L', pct: 9, color: '#F59E0B' },
    { type: 'White-Label', amount: '₹2.1L', pct: 9, color: 'var(--gold)' },
  ]

  const topAccounts = [
    { account: 'DPS Noida', type: 'School', city: 'Noida', users: 4500, mrr: '₹24,500', contract: '₹2.94L', health: 'Healthy' },
    { account: 'AIIMS Delhi', type: 'Hospital', city: 'New Delhi', users: 4500, mrr: '₹48,000', contract: '₹5.76L', health: 'Healthy' },
    { account: 'Ryan International', type: 'School', city: 'Mumbai', users: 6200, mrr: '₹34,000', contract: '₹4.08L', health: 'Healthy' },
    { account: 'Tata Consultancy', type: 'Corporate', city: 'Mumbai', users: 1200, mrr: '₹75,000', contract: '₹9.00L', health: 'Healthy' },
    { account: 'Apollo Hospitals', type: 'Hospital', city: 'Chennai', users: 2800, mrr: '₹28,000', contract: '₹3.36L', health: 'Healthy' },
    { account: 'Infosys Ltd', type: 'Corporate', city: 'Bengaluru', users: 980, mrr: '₹60,000', contract: '₹7.20L', health: 'Good' },
    { account: 'EduSafe Technologies', type: 'White-Label', city: 'Hyderabad', users: 8900, mrr: '₹42,000', contract: '₹5.04L', health: 'Healthy' },
    { account: 'Manipal Hospitals', type: 'Hospital', city: 'Bengaluru', users: 2100, mrr: '₹42,000', contract: '₹5.04L', health: 'Healthy' },
    { account: 'Amity International', type: 'School', city: 'Gurgaon', users: 3800, mrr: '₹21,000', contract: '₹2.52L', health: 'Good' },
    { account: 'Wipro Technologies', type: 'Corporate', city: 'Bengaluru', users: 650, mrr: '₹45,000', contract: '₹5.40L', health: 'Warning' },
  ].filter(r => r.account.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <StatRow stats={[
        { label: 'Enterprise MRR', value: '₹24.5L', color: 'var(--gold)' },
        { label: 'Enterprise Users', value: '2.3L', color: '#3B82F6' },
        { label: 'Avg Contract Value', value: '₹3.2L', color: '#10B981' },
      ]} />

      <div style={{ ...card, marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 16px', color: 'var(--text-primary)' }}>Revenue by Segment</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {revenueByType.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 100, flexShrink: 0 }}>{r.type}</span>
              <div style={{ flex: 1, height: 18, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${r.pct}%`, height: '100%', background: r.color, borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                  <span style={{ fontSize: 11, color: '#000', fontWeight: 700 }}>{r.pct}%</span>
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: r.color, width: 55, textAlign: 'right' }}>{r.amount}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 16px' }}>Top 10 Enterprise Accounts</h3>
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>{['Account', 'Type', 'City', 'Users', 'MRR', 'Contract Value', 'Health'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {topAccounts.map((r, i) => (
                <tr key={i}>
                  <td style={td}><b>{r.account}</b></td>
                  <td style={td}><span style={{ color: '#3B82F6', fontSize: 12 }}>{r.type}</span></td>
                  <td style={td}>{r.city}</td>
                  <td style={td}>{r.users.toLocaleString('en-IN')}</td>
                  <td style={td}><span style={{ fontWeight: 600, color: 'var(--gold)' }}>{r.mrr}</span></td>
                  <td style={td}><span style={{ fontWeight: 600 }}>{r.contract}</span></td>
                  <td style={td}><span style={badge(statusColor(r.health))}>{r.health}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
