'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '@/lib/api'
import {
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  Crown,
  Shield,
} from 'lucide-react'

/* ─────────────────────────── types ─────────────────────────── */
interface FamilyRow {
  id: string
  name: string
  members: number
  plan: 'Free' | 'Premium' | 'Family'
  status: 'Active' | 'Suspended' | 'Trial'
  joined: string
  spend: string
  avatarColor: string
}

/* ─────────────────────────── data ──────────────────────────── */
const FAMILIES: FamilyRow[] = [
  { id: 'FAM-001', name: 'The Sharma Family',  members: 5, plan: 'Family',  status: 'Active',    joined: 'Jan 2025', spend: '₹499', avatarColor: '#4B80F0' },
  { id: 'FAM-002', name: 'Mehta Household',    members: 3, plan: 'Premium', status: 'Active',    joined: 'Feb 2025', spend: '₹299', avatarColor: '#D4A853' },
  { id: 'FAM-003', name: 'Iyer Family',         members: 6, plan: 'Family',  status: 'Active',    joined: 'Jan 2025', spend: '₹499', avatarColor: '#10B981' },
  { id: 'FAM-004', name: 'Kapoor Circle',       members: 4, plan: 'Premium', status: 'Suspended', joined: 'Dec 2024', spend: '₹0',   avatarColor: '#EF4444' },
  { id: 'FAM-005', name: 'The Gupta Family',    members: 7, plan: 'Family',  status: 'Active',    joined: 'Mar 2025', spend: '₹499', avatarColor: '#8B5CF6' },
  { id: 'FAM-006', name: 'Nair Household',      members: 2, plan: 'Free',    status: 'Active',    joined: 'Apr 2025', spend: '₹0',   avatarColor: '#06B6D4' },
  { id: 'FAM-007', name: 'Reddy Circle',        members: 5, plan: 'Premium', status: 'Active',    joined: 'Jan 2025', spend: '₹299', avatarColor: '#F59E0B' },
  { id: 'FAM-008', name: 'Singh Family',        members: 8, plan: 'Family',  status: 'Active',    joined: 'Feb 2025', spend: '₹499', avatarColor: '#EC4899' },
  { id: 'FAM-009', name: 'Joshi Household',     members: 3, plan: 'Free',    status: 'Active',    joined: 'May 2025', spend: '₹0',   avatarColor: '#14B8A6' },
  { id: 'FAM-010', name: 'Patel Circle',        members: 4, plan: 'Premium', status: 'Active',    joined: 'Mar 2025', spend: '₹299', avatarColor: '#6366F1' },
]

const REVENUE_HISTORY = [42, 68, 55, 78, 90, 85, 95]

/* ─────────────────────────── helpers ───────────────────────── */
function PlanBadge({ plan }: { plan: FamilyRow['plan'] }) {
  const styles: Record<FamilyRow['plan'], string> = {
    Free:    'background:rgba(107,114,128,0.15); color:#6B7280; border:1px solid rgba(107,114,128,0.25)',
    Premium: 'background:rgba(212,168,83,0.12); color:var(--gold); border:1px solid rgba(212,168,83,0.3)',
    Family:  'background:rgba(75,128,240,0.12); color:var(--primary); border:1px solid rgba(75,128,240,0.3)',
  }
  return (
    <span style={{ ...parseInlineStyle(styles[plan]), borderRadius: '999px', padding: '2px 10px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {plan === 'Premium' && <Crown size={10} />}
      {plan === 'Family' && <Users size={10} />}
      {plan}
    </span>
  )
}

function StatusBadge({ status }: { status: FamilyRow['status'] }) {
  const map: Record<FamilyRow['status'], { bg: string; color: string; dot: string }> = {
    Active:    { bg: 'rgba(16,185,129,0.1)',  color: '#10B981', dot: '#10B981' },
    Suspended: { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', dot: '#EF4444' },
    Trial:     { bg: 'rgba(212,168,83,0.12)', color: 'var(--gold)', dot: 'var(--gold)' },
  }
  const s = map[status] ?? { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', dot: '#6B7280' }
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.dot}33`, borderRadius: '999px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  )
}

function parseInlineStyle(s: string): React.CSSProperties {
  const obj: Record<string, string> = {}
  s.split(';').forEach(part => {
    const [k, v] = part.split(':')
    if (k && v) obj[k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v.trim()
  })
  return obj as React.CSSProperties
}

/* ─────────────────────────── mini revenue chart ────────────── */
function RevenueChart() {
  const max = Math.max(...REVENUE_HISTORY)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48 }}>
      {REVENUE_HISTORY.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 48}px` }}
          transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
          style={{ flex: 1, background: i === REVENUE_HISTORY.length - 1 ? 'var(--gold)' : 'rgba(var(--gold-rgb),0.35)', borderRadius: 3 }}
        />
      ))}
    </div>
  )
}

/* ─────────────────────────── avatar circle ─────────────────── */
function Avatar({ name, color, size = 32 }: { name: string; color: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

/* ─────────────────────────── slide-over panel ──────────────── */
function FamilyPanel({ family, onClose }: { family: FamilyRow; onClose: () => void }) {
  const memberNames = ['Raj', 'Priya', 'Asha', 'Kiran', 'Dev', 'Sia', 'Anil', 'Neha']
  const memberColors = ['#4B80F0', '#10B981', '#D4A853', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4', '#EF4444']

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)',
        zIndex: 9999, display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.18)',
      }}
    >
      {/* header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={family.name} color={family.avatarColor} size={44} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{family.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{family.id}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={16} />
        </button>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* plan + status */}
        <div style={{ display: 'flex', gap: 10 }}>
          <PlanBadge plan={family.plan} />
          <StatusBadge status={family.status} />
        </div>

        {/* info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Members', value: family.members },
            { label: 'Monthly Spend', value: family.spend },
            { label: 'Joined', value: family.joined },
            { label: 'Devices', value: family.members * 2 },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--bg-surface2)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* members */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Family Members</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {memberNames.slice(0, family.members).map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-surface2)', borderRadius: 10, border: '1px solid var(--border)' }}
              >
                <Avatar name={name} color={memberColors[i % memberColors.length]} size={28} />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{name}</span>
                {i === 0 && <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(var(--gold-rgb),0.12)', color: 'var(--gold)', borderRadius: 999, padding: '2px 8px', fontWeight: 600 }}>Admin</span>}
              </motion.div>
            ))}
          </div>
        </div>

        {/* revenue chart */}
        <div style={{ background: 'var(--bg-surface2)', borderRadius: 14, padding: '16px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Revenue (Last 7 Days)</div>
          <RevenueChart />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span key={i} style={{ fontSize: 10, color: 'var(--text-muted)', flex: 1, textAlign: 'center' }}>{d}</span>
            ))}
          </div>
        </div>

        {/* action button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%', padding: '12px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 13,
            background: family.status === 'Active' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
            color: family.status === 'Active' ? '#EF4444' : '#10B981',
            border: `1px solid ${family.status === 'Active' ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
          }}
        >
          {family.status === 'Active' ? 'Suspend Family Account' : 'Reactivate Family Account'}
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────── main page ─────────────────────── */
export default function FamiliesPage() {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedFamily, setSelectedFamily] = useState<FamilyRow | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [families, setFamilies] = useState(FAMILIES)
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    adminApi.families(0, 20, undefined)
      .then(d => {
        if (d.families && d.families.length > 0) {
          setFamilies(d.families.map((f: any) => ({
            id: `FAM-${String(f.id).padStart(3,"0")}`,
            name: f.name,
            members: f.member_count ?? 2,
            plan: f.plan.charAt(0).toUpperCase() + f.plan.slice(1),
            status: f.status ?? "Active",
            joined: f.created_at ? new Date(f.created_at).toLocaleDateString("en-IN", {month:"short",year:"numeric"}) : "Jan 2025",
            spend: f.monthly_spend ? `₹${f.monthly_spend}` : "₹0",
            avatarColor: '#4B80F0',
          })))
        }
        setApiLoading(false)
      })
      .catch(() => setApiLoading(false))
  }, [])

  const filtered = families.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.id.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'All' || f.plan === planFilter
    const matchStatus = statusFilter === 'All' || f.status === statusFilter
    return matchSearch && matchPlan && matchStatus
  })

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } }),
  }

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>

      {/* overlay */}
      <AnimatePresence>
        {selectedFamily && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedFamily(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998, backdropFilter: 'blur(2px)' }}
          />
        )}
      </AnimatePresence>

      {/* slide-over */}
      <AnimatePresence>
        {selectedFamily && <FamilyPanel family={selectedFamily} onClose={() => setSelectedFamily(null)} />}
      </AnimatePresence>

      {/* ── header ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Family Accounts</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Manage all registered family circles</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
            <Download size={15} /> Export
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'var(--gold)', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>
            <Plus size={15} /> Add Family
          </motion.button>
        </div>
      </motion.div>

      {/* ── stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: Users, label: 'Total Families', value: '50,234', sub: 'All registered', color: 'var(--primary)', bg: 'rgba(75,128,240,0.08)' },
          { icon: Shield, label: 'Active Families', value: '48,891', sub: '97.3% of total', color: 'var(--safe)', bg: 'rgba(16,185,129,0.08)' },
          { icon: Crown, label: 'Premium / Family Plan', value: '28,450', sub: '56.7% conversion', color: 'var(--gold)', bg: 'rgba(var(--gold-rgb),0.08)' },
        ].map(({ icon: Icon, label, value, sub, color, bg }, i) => (
          <motion.div key={label} custom={i} variants={cardVariants} initial="hidden" animate="visible"
            whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, background: `linear-gradient(135deg, ${color}, ${color}aa)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 3 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── filter toolbar ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>

        {/* search */}
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search families..."
            style={{ width: '100%', paddingLeft: 36, paddingRight: 12, height: 38, background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* plan filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} color="var(--text-muted)" />
          <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
            style={{ height: 38, padding: '0 12px', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}>
            {['All', 'Free', 'Premium', 'Family'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* status filter */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ height: 38, padding: '0 12px', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}>
          {['All', 'Active', 'Suspended'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* date range */}
        <div style={{ display: 'flex', gap: 6 }}>
          <input type="date" defaultValue="2025-01-01"
            style={{ height: 38, padding: '0 10px', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none' }} />
          <span style={{ color: 'var(--text-muted)', lineHeight: '38px', fontSize: 12 }}>to</span>
          <input type="date" defaultValue="2025-12-31"
            style={{ height: 38, padding: '0 10px', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none' }} />
        </div>
      </motion.div>

      {/* ── table ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
              {['Family ID', 'Family Name', 'Members', 'Plan', 'Status', 'Joined', 'Monthly Spend', 'Actions'].map(col => (
                <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((family, i) => (
                <motion.tr
                  key={family.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--bg-surface2)' : 'transparent', cursor: 'pointer' }}
                  whileHover={{ backgroundColor: 'rgba(var(--gold-rgb),0.05)' }}
                >
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px' }}>{family.id}</span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={family.name} color={family.avatarColor} size={32} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{family.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Users size={13} color="var(--text-muted)" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{family.members}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px' }}><PlanBadge plan={family.plan} /></td>
                  <td style={{ padding: '13px 16px' }}><StatusBadge status={family.status} /></td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{family.joined}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: family.spend === '₹0' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{family.spend}</span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedFamily(family)}
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)' }}>
                        <Eye size={14} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <Edit size={14} />
                      </motion.button>
                      <div style={{ position: 'relative' }}>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => setOpenMenu(openMenu === family.id ? null : family.id)}
                          style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                          <MoreHorizontal size={14} />
                        </motion.button>
                        <AnimatePresence>
                          {openMenu === family.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -4 }}
                              style={{ position: 'absolute', right: 0, top: 34, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 6, zIndex: 100, minWidth: 140, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                              {['Suspend Account', 'Send Message', 'View Invoices', 'Delete Family'].map((action, ai) => (
                                <div key={action} style={{ padding: '8px 12px', fontSize: 13, color: action === 'Delete Family' ? '#EF4444' : 'var(--text-secondary)', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                  {action}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {/* ── pagination ── */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface2)' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Showing <strong style={{ color: 'var(--text-primary)' }}>1–10</strong> of <strong style={{ color: 'var(--text-primary)' }}>50,234</strong> families</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <ChevronLeft size={15} />
            </motion.button>
            {[1, 2, 3].map(p => (
              <motion.button key={p} whileHover={{ scale: 1.05 }}
                style={{ width: 32, height: 32, borderRadius: 8, border: p === 1 ? 'none' : '1px solid var(--border)', background: p === 1 ? 'var(--gold)' : 'var(--bg-surface)', color: p === 1 ? '#fff' : 'var(--text-secondary)', fontWeight: p === 1 ? 700 : 400, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p}
              </motion.button>
            ))}
            <span style={{ fontSize: 13, color: 'var(--text-muted)', padding: '0 4px' }}>...</span>
            <motion.button whileHover={{ scale: 1.05 }}
              style={{ width: 42, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              5023
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gold)' }}>
              <ChevronRight size={15} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
