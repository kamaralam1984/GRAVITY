'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Search,
  Plus,
  Eye,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield,
} from 'lucide-react'

interface EnterpriseClient {
  id: string
  name: string
  industry: string
  users: number
  plan: string
  contractValue: string
  accountManager: string
  status: 'active' | 'onboarding' | 'renewal_due' | 'churned'
  slaUptime: string
  apiCallsMonth: number
  renewalDate: string
  logo: string
  color: string
}

const CLIENTS: EnterpriseClient[] = [
  { id: 'ENT-001', name: 'Reliance Jio Infocomm', industry: 'Telecom', users: 4200, plan: 'Enterprise Pro', contractValue: '₹18L/yr', accountManager: 'Vikram Singh', status: 'active', slaUptime: '99.98%', apiCallsMonth: 2100000, renewalDate: '2026-03-15', logo: 'RJ', color: '#0078D4' },
  { id: 'ENT-002', name: 'Narayana Health Group', industry: 'Healthcare', users: 1800, plan: 'Enterprise', contractValue: '₹8.4L/yr', accountManager: 'Priya Nair', status: 'active', slaUptime: '99.95%', apiCallsMonth: 890000, renewalDate: '2025-09-30', logo: 'NH', color: '#10B981' },
  { id: 'ENT-003', name: 'Kendriya Vidyalaya Sangathan', industry: 'School Safety', users: 3100, plan: 'School Safety Pro', contractValue: '₹12L/yr', accountManager: 'Arjun Mehta', status: 'renewal_due', slaUptime: '99.91%', apiCallsMonth: 1540000, renewalDate: '2025-07-01', logo: 'KV', color: '#F59E0B' },
  { id: 'ENT-004', name: 'HDFC Ergo Insurance', industry: 'Insurance', users: 650, plan: 'Enterprise', contractValue: '₹6.2L/yr', accountManager: 'Sunita Agarwal', status: 'onboarding', slaUptime: '99.89%', apiCallsMonth: 325000, renewalDate: '2026-06-01', logo: 'HE', color: '#4B80F0' },
  { id: 'ENT-005', name: 'Infosys Corporate Safety', industry: 'Corporate', users: 2700, plan: 'Enterprise Pro', contractValue: '₹14L/yr', accountManager: 'Deepak Sharma', status: 'active', slaUptime: '99.97%', apiCallsMonth: 1350000, renewalDate: '2026-01-20', logo: 'IN', color: '#8B5CF6' },
  { id: 'ENT-006', name: 'Delhi Metro Rail Corp', industry: 'Government', users: 1200, plan: 'Enterprise', contractValue: '₹9.6L/yr', accountManager: 'Kavitha Iyer', status: 'active', slaUptime: '99.93%', apiCallsMonth: 600000, renewalDate: '2025-12-31', logo: 'DM', color: '#EC4899' },
  { id: 'ENT-007', name: 'Bajaj Allianz General', industry: 'Insurance', users: 480, plan: 'Enterprise', contractValue: '₹4.8L/yr', accountManager: 'Vikram Singh', status: 'churned', slaUptime: '-', apiCallsMonth: 0, renewalDate: '-', logo: 'BA', color: '#6B7280' },
  { id: 'ENT-008', name: 'DY Patil International Schools', industry: 'School Safety', users: 920, plan: 'School Safety', contractValue: '₹5.5L/yr', accountManager: 'Priya Nair', status: 'active', slaUptime: '99.90%', apiCallsMonth: 460000, renewalDate: '2026-04-10', logo: 'DP', color: '#06B6D4' },
]

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active:      { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
  onboarding:  { bg: 'rgba(75,128,240,0.12)', color: '#4B80F0' },
  renewal_due: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
  churned:     { bg: 'rgba(107,114,128,0.12)', color: '#6B7280' },
}

const BG = '#0B0D13', SURFACE = '#111420', ELEVATED = '#161926'
const BORDER = 'rgba(255,255,255,0.07)', GOLD = '#D4A853', MUTED = 'rgba(255,255,255,0.4)'

const STATS = [
  { label: 'Enterprise Clients', value: '24', sub: '8 shown above', color: '#D4A853', icon: <Building2 size={20} /> },
  { label: 'Total Enterprise Users', value: '12,847', sub: 'Across all clients', color: '#4B80F0', icon: <Users size={20} /> },
  { label: 'Enterprise MRR', value: '₹4.8L', sub: 'Monthly recurring', color: '#10B981', icon: <TrendingUp size={20} /> },
  { label: 'Avg. Team Size', value: '535', sub: 'Users per client', color: '#8B5CF6', icon: <DollarSign size={20} /> },
]

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.churned
  const labels: Record<string, string> = { active: 'Active', onboarding: 'Onboarding', renewal_due: 'Renewal Due', churned: 'Churned' }
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30`, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
      {labels[status] || status}
    </span>
  )
}

export default function EnterprisePage() {
  const [search, setSearch] = useState('')
  const [industryFilter, setIndustryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedClient, setSelectedClient] = useState<EnterpriseClient | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [page, setPage] = useState(1)
  const PER_PAGE = 5

  const filtered = CLIENTS.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase())
    const matchIndustry = industryFilter === 'All' || c.industry === industryFilter
    const matchStatus = statusFilter === 'All' || c.status === statusFilter.toLowerCase().replace(' ', '_')
    return matchSearch && matchIndustry && matchStatus
  })

  const pages = Math.ceil(filtered.length / PER_PAGE)
  const displayed = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const renewalsSoon = CLIENTS.filter(c => c.status === 'renewal_due')

  return (
    <div style={{ background: BG, minHeight: '100vh', color: 'white', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>Enterprise Accounts</h1>
            <p style={{ fontSize: 14, color: MUTED, margin: '4px 0 0' }}>Manage enterprise clients, contracts, and SLA compliance</p>
          </div>
          <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', background: GOLD, color: '#0B0D13', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={14} /> Add Enterprise Client
          </button>
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

        {/* Renewal alerts */}
        {renewalsSoon.length > 0 && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={16} color="#F59E0B" />
            <span style={{ fontSize: 13, color: '#F59E0B', fontWeight: 600 }}>
              {renewalsSoon.length} contract{renewalsSoon.length > 1 ? 's' : ''} due for renewal soon:{' '}
              {renewalsSoon.map(c => c.name).join(', ')}
            </span>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: MUTED }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
              style={{ width: '100%', padding: '10px 12px 10px 34px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <select value={industryFilter} onChange={e => { setIndustryFilter(e.target.value); setPage(1) }}
            style={{ padding: '10px 14px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
            <option>All</option>
            {['Telecom', 'Healthcare', 'School Safety', 'Insurance', 'Corporate', 'Government'].map(i => <option key={i}>{i}</option>)}
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            style={{ padding: '10px 14px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
            {['All', 'Active', 'Onboarding', 'Renewal Due', 'Churned'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 120px 80px 120px 120px 100px 80px 80px', padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, background: ELEVATED }}>
            {['Company', 'Industry', 'Users', 'Contract', 'Acc. Manager', 'SLA', 'Status', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
            ))}
          </div>
          {displayed.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              style={{ display: 'grid', gridTemplateColumns: '200px 120px 80px 120px 120px 100px 80px 80px', padding: '14px 20px', borderBottom: i < displayed.length - 1 ? `1px solid ${BORDER}` : 'none', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'white', flexShrink: 0 }}>{c.logo}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{c.id}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{c.industry}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>{c.users.toLocaleString()}</div>
              <div style={{ fontSize: 13, color: '#10B981', fontWeight: 600 }}>{c.contractValue}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{c.accountManager}</div>
              <div style={{ fontSize: 12, color: c.status === 'churned' ? MUTED : '#10B981', fontWeight: 600 }}>{c.slaUptime}</div>
              <div><StatusBadge status={c.status} /></div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setSelectedClient(c)} style={{ width: 28, height: 28, borderRadius: 7, background: ELEVATED, border: `1px solid ${BORDER}`, color: MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Eye size={13} />
                </button>
                <button style={{ width: 28, height: 28, borderRadius: 7, background: ELEVATED, border: `1px solid ${BORDER}`, color: MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: MUTED }}>Showing {((page-1)*PER_PAGE)+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} style={{ padding: '7px 12px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, color: page === 1 ? MUTED : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer' }}><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(pages, 4) }, (_, i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ padding: '7px 12px', background: page === p ? GOLD : SURFACE, border: `1px solid ${page === p ? GOLD : BORDER}`, borderRadius: 8, color: page === p ? 'black' : 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages} style={{ padding: '7px 12px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, color: page === pages ? MUTED : 'white', cursor: page === pages ? 'not-allowed' : 'pointer' }}><ChevronRight size={14} /></button>
          </div>
        </div>

        {/* API Usage */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 20 }}>API USAGE THIS MONTH — TOP CLIENTS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {CLIENTS.filter(c => c.apiCallsMonth > 0).sort((a, b) => b.apiCallsMonth - a.apiCallsMonth).slice(0, 5).map(c => {
              const max = 2100000
              return (
                <div key={c.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{c.name}</span>
                    <span style={{ fontSize: 12, color: GOLD, fontWeight: 700 }}>{(c.apiCallsMonth / 1000000).toFixed(1)}M calls</span>
                  </div>
                  <div style={{ background: ELEVATED, borderRadius: 999, height: 8, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(c.apiCallsMonth / max) * 100}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                      style={{ height: '100%', background: c.color, borderRadius: 999 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Client Detail Drawer */}
        <AnimatePresence>
          {selectedClient && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }}>
              <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ width: 440, background: SURFACE, borderLeft: `1px solid ${BORDER}`, height: '100%', overflowY: 'auto', padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, margin: 0 }}>{selectedClient.name}</h3>
                  <button onClick={() => setSelectedClient(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}><X size={20} /></button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, padding: 16, background: ELEVATED, borderRadius: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: selectedClient.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>{selectedClient.logo}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedClient.name}</div>
                    <div style={{ fontSize: 12, color: MUTED }}>{selectedClient.industry} · {selectedClient.id}</div>
                    <div style={{ marginTop: 4 }}><StatusBadge status={selectedClient.status} /></div>
                  </div>
                </div>
                {[
                  { label: 'Total Users', value: selectedClient.users.toLocaleString(), color: GOLD },
                  { label: 'Contract Value', value: selectedClient.contractValue, color: '#10B981' },
                  { label: 'SLA Uptime', value: selectedClient.slaUptime, color: '#4B80F0' },
                  { label: 'Monthly API Calls', value: selectedClient.apiCallsMonth > 0 ? `${(selectedClient.apiCallsMonth / 1000000).toFixed(1)}M` : '-', color: '#8B5CF6' },
                  { label: 'Account Manager', value: selectedClient.accountManager, color: 'white' },
                  { label: 'Plan', value: selectedClient.plan, color: GOLD },
                  { label: 'Contract Renewal', value: selectedClient.renewalDate, color: selectedClient.status === 'renewal_due' ? '#F59E0B' : 'white' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: 13, color: MUTED }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button style={{ flex: 1, padding: '11px 0', background: `${GOLD}20`, border: `1px solid ${GOLD}40`, borderRadius: 10, color: GOLD, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Edit Contract</button>
                  <button style={{ flex: 1, padding: '11px 0', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, color: '#10B981', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>View SLA Report</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Client Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 28, width: '100%', maxWidth: 500 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, margin: 0 }}>Add Enterprise Client</h3>
                  <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}><X size={18} /></button>
                </div>
                {[['Company Name', 'text'], ['Industry', 'select'], ['Estimated Users', 'number'], ['Contract Value (₹/yr)', 'text'], ['Account Manager', 'text'], ['Contract Renewal Date', 'date']].map(([label, type]) => (
                  <div key={label} style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 6 }}>{(label as string).toUpperCase()}</label>
                    {type === 'select' ? (
                      <select style={{ width: '100%', padding: '10px 14px', background: ELEVATED, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                        {['Telecom', 'Healthcare', 'School Safety', 'Insurance', 'Corporate', 'Government'].map(i => <option key={i}>{i}</option>)}
                      </select>
                    ) : (
                      <input type={type as string} style={{ width: '100%', padding: '10px 14px', background: ELEVATED, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    )}
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '11px 0', background: ELEVATED, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '11px 0', background: GOLD, border: 'none', borderRadius: 10, color: '#0B0D13', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Add Client</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
