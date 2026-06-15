'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi, AdminUser } from '@/lib/api'
import {
  Users, Search, RefreshCw, UserPlus, Eye, Pencil, Trash2,
  KeyRound, ChevronLeft, ChevronRight, X, Check, Ban,
  Mail, Phone, Calendar, Smartphone, Users2, TrendingUp, Activity, Shield,
  AlertTriangle, CheckCircle2, EyeOff, EyeIcon,
} from 'lucide-react'

const AVATAR_COLORS = ['#4B80F0', '#D4A853', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#06B6D4']
const STATUS_FILTERS = ['All', 'Active', 'Inactive']
const PAGE_SIZE = 10

const ROLES = ['user', 'moderator', 'admin', 'superadmin']
const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  user:        { label: 'User',       color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  moderator:   { label: 'Moderator',  color: '#06B6D4', bg: 'rgba(6,182,212,0.12)'   },
  admin:       { label: 'Admin',      color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)'  },
  superadmin:  { label: 'Super Admin',color: '#D4A853', bg: 'rgba(212,168,83,0.12)'  },
}

// ── Modal backdrop ────────────────────────────────────────────────
function Backdrop({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClick}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, backdropFilter: 'blur(2px)' }}
    />
  )
}

// ── Modal box ─────────────────────────────────────────────────────
function Modal({ title, onClose, children, width = 440 }: { title: string; onClose: () => void; children: React.ReactNode; width?: number }) {
  return (
    <>
      <Backdrop onClick={onClose} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', pointerEvents: 'none' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        style={{
          width: '100%',
          maxWidth: width,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          maxHeight: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'all',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '20px 22px 22px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </motion.div>
      </div>
    </>
  )
}

// ── Input field ───────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', placeholder = '', required = false, hint = '' }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; required?: boolean; hint?: string
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
        {label}{required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: isPassword ? '9px 38px 9px 12px' : '9px 12px',
            borderRadius: 9, border: '1px solid var(--border)',
            background: 'var(--bg-surface2)', color: 'var(--text-primary)',
            fontSize: 13.5, outline: 'none', boxSizing: 'border-box',
          }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}>
            {show ? <EyeOff size={15} /> : <EyeIcon size={15} />}
          </button>
        )}
      </div>
      {hint && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0' }}>{hint}</p>}
    </div>
  )
}

// ── Confirm delete dialog ─────────────────────────────────────────
function DeleteConfirm({ user, onConfirm, onClose, loading }: { user: AdminUser; onConfirm: () => void; onClose: () => void; loading: boolean }) {
  return (
    <Modal title="Delete User" onClose={onClose} width={380}>
      <div style={{ textAlign: 'center', padding: '4px 0 12px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <AlertTriangle size={26} style={{ color: '#EF4444' }} />
        </div>
        <p style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 600, margin: '0 0 6px' }}>Delete "{user.name}"?</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 22px' }}>This action cannot be undone. All user data will be permanently removed.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: '#EF4444', color: '#fff', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Create / Edit form ────────────────────────────────────────────
function RoleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>Role<span style={{ color: '#EF4444', marginLeft: 2 }}>*</span></label>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {ROLES.map(r => {
          const cfg = ROLE_CONFIG[r]
          const active = value === r
          return (
            <button key={r} type="button" onClick={() => onChange(r)}
              style={{ padding: '5px 13px', borderRadius: 8, border: `1.5px solid ${active ? cfg.color : 'var(--border)'}`, background: active ? cfg.bg : 'transparent', color: active ? cfg.color : 'var(--text-secondary)', fontSize: 12.5, fontWeight: active ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
              {cfg.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function UserForm({ mode, user, onSubmit, onClose, loading, error }: {
  mode: 'create' | 'edit'; user?: AdminUser; onSubmit: (data: any) => void
  onClose: () => void; loading: boolean; error: string
}) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [role, setRole] = useState(user?.role || 'user')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) return
    if (mode === 'create') {
      if (!password) return
      if (password !== confirm) return
      onSubmit({ name, email, phone: phone || undefined, password, role })
    } else {
      onSubmit({ name, email, phone: phone || undefined, role })
    }
  }

  return (
    <Modal title={mode === 'create' ? 'Create User' : 'Edit User'} onClose={onClose}>
      <Field label="Full Name" value={name} onChange={setName} placeholder="Enter full name" required />
      <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="user@example.com" required />
      <Field label="Phone" value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
      <RoleSelect value={role} onChange={setRole} />
      {mode === 'create' && (
        <>
          <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="Min. 6 characters" required hint="Must be at least 6 characters" />
          <Field label="Confirm Password" value={confirm} onChange={setConfirm} type="password" placeholder="Re-enter password" required />
          {password && confirm && password !== confirm && (
            <p style={{ fontSize: 12, color: '#EF4444', margin: '-8px 0 12px' }}>Passwords do not match</p>
          )}
        </>
      )}
      {error && <p style={{ fontSize: 12.5, color: '#EF4444', margin: '0 0 12px', padding: '8px 12px', borderRadius: 7, background: 'rgba(239,68,68,0.08)' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !name.trim() || !email.trim() || (mode === 'create' && (!password || password !== confirm))}
          style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#C9913A,#D4A853)', color: '#fff', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (mode === 'create' ? 'Creating…' : 'Saving…') : (mode === 'create' ? 'Create User' : 'Save Changes')}
        </button>
      </div>
    </Modal>
  )
}

// ── Change password form ──────────────────────────────────────────
function ChangePasswordForm({ user, onSubmit, onClose, loading, error }: {
  user: AdminUser; onSubmit: (pw: string) => void; onClose: () => void; loading: boolean; error: string
}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  return (
    <Modal title="Change Password" onClose={onClose} width={400}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
        Setting new password for <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong>
      </p>
      <Field label="New Password" value={password} onChange={setPassword} type="password" placeholder="Min. 6 characters" required />
      <Field label="Confirm Password" value={confirm} onChange={setConfirm} type="password" placeholder="Re-enter new password" required />
      {password && confirm && password !== confirm && (
        <p style={{ fontSize: 12, color: '#EF4444', margin: '-8px 0 12px' }}>Passwords do not match</p>
      )}
      {error && <p style={{ fontSize: 12.5, color: '#EF4444', margin: '0 0 12px', padding: '8px 12px', borderRadius: 7, background: 'rgba(239,68,68,0.08)' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
        <button
          onClick={() => onSubmit(password)}
          disabled={loading || !password || password !== confirm}
          style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#C9913A,#D4A853)', color: '#fff', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Changing…' : 'Change Password'}
        </button>
      </div>
    </Modal>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [modal, setModal] = useState<'create' | 'edit' | 'password' | 'delete' | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [drawer, setDrawer] = useState<AdminUser | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  const [toast, setToast] = useState('')
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const loadUsers = useCallback(async (p = page, s = search, sf = statusFilter) => {
    setLoading(true)
    try {
      const skip = (p - 1) * PAGE_SIZE
      const status = sf === 'All' ? undefined : sf.toLowerCase()
      const res = await adminApi.users({ skip, limit: PAGE_SIZE, search: s || undefined, status })
      setUsers(res.users)
      setTotal(res.total)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { loadUsers(page, search, statusFilter) }, [page, statusFilter])

  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => { setPage(1); loadUsers(1, search, statusFilter) }, 350)
  }, [search])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const openModal = (type: typeof modal, user?: AdminUser) => {
    setSelectedUser(user || null)
    setModalError('')
    setModal(type)
  }

  const closeModal = () => { setModal(null); setSelectedUser(null); setModalError('') }

  const handleCreate = async (data: any) => {
    setModalLoading(true); setModalError('')
    try {
      await adminApi.createUser(data)
      closeModal(); loadUsers(1, search, statusFilter); setPage(1)
      showToast('User created successfully')
    } catch (e: any) { setModalError(e.message || 'Failed to create user') }
    finally { setModalLoading(false) }
  }

  const handleEdit = async (data: any) => {
    if (!selectedUser) return
    setModalLoading(true); setModalError('')
    try {
      await adminApi.updateUser(selectedUser.id, data)
      closeModal(); loadUsers()
      showToast('User updated successfully')
    } catch (e: any) { setModalError(e.message || 'Failed to update user') }
    finally { setModalLoading(false) }
  }

  const handlePassword = async (pw: string) => {
    if (!selectedUser) return
    setModalLoading(true); setModalError('')
    try {
      await adminApi.changeUserPassword(selectedUser.id, pw)
      closeModal()
      showToast('Password changed successfully')
    } catch (e: any) { setModalError(e.message || 'Failed to change password') }
    finally { setModalLoading(false) }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    setModalLoading(true)
    try {
      await adminApi.deleteUser(selectedUser.id)
      closeModal()
      if (drawer?.id === selectedUser.id) setDrawer(null)
      loadUsers()
      showToast('User deleted')
    } catch (e: any) { setModalError(e.message || 'Failed to delete user') }
    finally { setModalLoading(false) }
  }

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      await adminApi.updateUserStatus(user.id, !user.is_active)
      loadUsers()
      showToast(`User ${user.is_active ? 'deactivated' : 'activated'}`)
    } catch (e: any) { showToast('Failed to update status') }
  }

  const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length]
  const activeCount = users.filter(u => u.is_active).length

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--text-primary)', margin: '0 0 4px' }}>Users</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>Create, edit and manage all registered users</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => loadUsers()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
            Refresh
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => openModal('create')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C9913A,#D4A853)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <UserPlus size={14} />
            Add User
          </motion.button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Users', value: total, icon: Users, color: '#4B80F0' },
          { label: 'Active', value: users.filter(u => u.is_active).length, icon: Activity, color: '#10B981' },
          { label: 'Inactive', value: users.filter(u => !u.is_active).length, icon: Ban, color: '#F59E0B' },
          { label: 'This Page', value: users.length, icon: Shield, color: '#8B5CF6' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={19} style={{ color }} />
            </div>
            <div>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '0 0 2px', fontWeight: 500 }}>{label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1 }}>{value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 16px', marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search name, email, phone…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '7px 12px 7px 30px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-surface2)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => { setStatusFilter(f); setPage(1) }}
              style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${statusFilter === f ? 'var(--gold)' : 'var(--border)'}`, background: statusFilter === f ? 'rgba(212,168,83,0.12)' : 'transparent', color: statusFilter === f ? 'var(--gold)' : 'var(--text-secondary)', fontSize: 12.5, fontWeight: statusFilter === f ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
              {f}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{total} total</span>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                {['User', 'Email / Phone', 'Role', 'Status', 'Devices', 'Family', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} style={{ padding: '12px 14px' }}>
                          <div style={{ height: 14, borderRadius: 6, background: 'var(--border)', animation: 'pulse 1.5s ease-in-out infinite', width: j === 0 ? 140 : j === 5 ? 80 : 100 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                      No users found
                    </td>
                  </tr>
                ) : users.map((user, i) => (
                  <motion.tr key={user.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => setDrawer(user)}
                  >
                    {/* User */}
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: avatarColor(user.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {user.avatar}
                        </div>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                      </div>
                    </td>
                    {/* Contact */}
                    <td style={{ padding: '11px 14px' }}>
                      <p style={{ margin: '0 0 2px', fontSize: 12.5, color: 'var(--text-secondary)' }}>{user.email}</p>
                      {user.phone && <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{user.phone}</p>}
                    </td>
                    {/* Role */}
                    <td style={{ padding: '11px 14px' }}>
                      {(() => {
                        const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.user
                        return (
                          <span style={{ padding: '3px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, color: cfg.color, background: cfg.bg }}>
                            {cfg.label}
                          </span>
                        )
                      })()}
                    </td>
                    {/* Status */}
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                        color: user.is_active ? '#10B981' : '#F59E0B',
                        background: user.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: user.is_active ? '#10B981' : '#F59E0B' }} />
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {/* Devices */}
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Smartphone size={13} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{user.devices}</span>
                      </div>
                    </td>
                    {/* Family */}
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{user.family_name || '—'}</span>
                    </td>
                    {/* Joined */}
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '11px 14px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <ActionBtn title="View" icon={<Eye size={13} />} onClick={() => setDrawer(user)} />
                        <ActionBtn title="Edit" icon={<Pencil size={13} />} onClick={() => openModal('edit', user)} color="#4B80F0" />
                        <ActionBtn title="Change Password" icon={<KeyRound size={13} />} onClick={() => openModal('password', user)} color="#8B5CF6" />
                        <ActionBtn
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                          icon={user.is_active ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                          onClick={() => handleToggleStatus(user)}
                          color={user.is_active ? '#F59E0B' : '#10B981'}
                        />
                        <ActionBtn title="Delete" icon={<Trash2 size={13} />} onClick={() => openModal('delete', user)} color="#EF4444" />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Page {page} of {totalPages} · {total} users</span>
            <div style={{ display: 'flex', gap: 5 }}>
              <PageBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={13} /> Prev</PageBtn>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pg = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
                return (
                  <PageBtn key={pg} active={pg === page} onClick={() => setPage(pg)}>{pg}</PageBtn>
                )
              })}
              <PageBtn disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next <ChevronRight size={13} /></PageBtn>
            </div>
          </div>
        )}
      </div>

      {/* User detail drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100 }} />
            <motion.div
              initial={{ x: 380, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 380, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              style={{ position: 'fixed', top: 0, right: 0, width: 340, height: '100vh', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', zIndex: 110, overflowY: 'auto', padding: 22 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>User Details</h3>
                <button onClick={() => setDrawer(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 22 }}>
                <div style={{ width: 68, height: 68, borderRadius: '50%', background: avatarColor(drawer.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 10 }}>
                  {drawer.avatar}
                </div>
                <h4 style={{ margin: '0 0 3px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>{drawer.name}</h4>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, color: drawer.is_active ? '#10B981' : '#F59E0B', background: drawer.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: drawer.is_active ? '#10B981' : '#F59E0B' }} />
                    {drawer.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {(() => {
                    const cfg = ROLE_CONFIG[drawer.role] || ROLE_CONFIG.user
                    return <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                  })()}
                </div>
              </div>

              {[
                { icon: Mail, label: 'Email', value: drawer.email },
                { icon: Phone, label: 'Phone', value: drawer.phone || '—' },
                { icon: Users2, label: 'Family', value: drawer.family_name || '—' },
                { icon: Users2, label: 'Family ID', value: drawer.family_id ? `#${drawer.family_id}` : '—' },
                { icon: KeyRound, label: 'Invite Code', value: drawer.invite_code || '—' },
                { icon: Smartphone, label: 'Devices', value: String(drawer.devices) },
                { icon: Calendar, label: 'Joined', value: drawer.created_at ? new Date(drawer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                  <Icon size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 58, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
                </div>
              ))}

              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => { openModal('edit', drawer) }}
                  style={{ padding: '9px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Pencil size={14} /> Edit User
                </button>
                <button onClick={() => { openModal('password', drawer) }}
                  style={{ padding: '9px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <KeyRound size={14} /> Change Password
                </button>
                <button onClick={() => handleToggleStatus(drawer)}
                  style={{ padding: '9px', borderRadius: 9, border: `1px solid ${drawer.is_active ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`, background: drawer.is_active ? 'rgba(245,158,11,0.07)' : 'rgba(16,185,129,0.07)', color: drawer.is_active ? '#F59E0B' : '#10B981', fontSize: 13.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {drawer.is_active ? <><Ban size={14} /> Deactivate</> : <><CheckCircle2 size={14} /> Activate</>}
                </button>
                <button onClick={() => openModal('delete', drawer)}
                  style={{ padding: '9px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: '#EF4444', fontSize: 13.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Trash2 size={14} /> Delete User
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'create' && (
          <UserForm mode="create" onSubmit={handleCreate} onClose={closeModal} loading={modalLoading} error={modalError} />
        )}
        {modal === 'edit' && selectedUser && (
          <UserForm mode="edit" user={selectedUser} onSubmit={handleEdit} onClose={closeModal} loading={modalLoading} error={modalError} />
        )}
        {modal === 'password' && selectedUser && (
          <ChangePasswordForm user={selectedUser} onSubmit={handlePassword} onClose={closeModal} loading={modalLoading} error={modalError} />
        )}
        {modal === 'delete' && selectedUser && (
          <DeleteConfirm user={selectedUser} onConfirm={handleDelete} onClose={closeModal} loading={modalLoading} />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1a1f2e', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 18px', zIndex: 300, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.3)', fontSize: 13.5, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}
          >
            <Check size={15} style={{ color: '#10B981' }} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────────
function ActionBtn({ title, icon, onClick, color = 'var(--text-secondary)' }: { title: string; icon: React.ReactNode; onClick: () => void; color?: string }) {
  return (
    <button title={title} onClick={onClick}
      style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.13s', flexShrink: 0 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}14` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
    >
      {icon}
    </button>
  )
}

function PageBtn({ children, disabled = false, active = false, onClick }: { children: React.ReactNode; disabled?: boolean; active?: boolean; onClick: () => void }) {
  return (
    <button disabled={disabled} onClick={onClick}
      style={{ padding: '5px 9px', borderRadius: 7, border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`, background: active ? 'rgba(212,168,83,0.15)' : 'transparent', color: active ? 'var(--gold)' : disabled ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 3, fontWeight: active ? 700 : 400 }}>
      {children}
    </button>
  )
}
