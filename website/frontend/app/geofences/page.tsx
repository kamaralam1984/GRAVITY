'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Shield, Plus, Trash2, Home, School, Briefcase,
  AlertCircle, X, ToggleLeft, ToggleRight, Loader2
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getToken } from '@/lib/auth'

// ─── Types ────────────────────────────────────────────────────────────────────

type GeofenceType = 'home' | 'school' | 'work' | 'custom'

interface Geofence {
  id: number
  name: string
  type: GeofenceType
  center_lat: number
  center_lng: number
  radius_meters: number
  color: string
  is_active: boolean
}

interface Family {
  id: number
  name: string
}

interface AddFormState {
  name: string
  address: string
  radius_meters: number
  type: GeofenceType
  center_lat: number | null
  center_lng: number | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

const GOLD = '#B8720A'
const GREEN = '#10B981'
const RED = '#EF4444'
const BG = '#0B0D13'
const GLASS = 'rgba(255,255,255,0.04)'
const BORDER = 'rgba(255,255,255,0.08)'

const TYPE_META: Record<GeofenceType, { label: string; icon: React.ReactNode; color: string }> = {
  home:   { label: 'Home',   icon: <Home   size={18} />, color: '#10B981' },
  school: { label: 'School', icon: <School size={18} />, color: '#3B82F6' },
  work:   { label: 'Work',   icon: <Briefcase size={18} />, color: '#8B5CF6' },
  custom: { label: 'Custom', icon: <MapPin  size={18} />, color: GOLD },
}

const RADIUS_OPTIONS = [100, 200, 300, 500, 1000, 2000]

// ─── Helper: auth headers ──────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

// ─── Helper: geocode address via Nominatim ────────────────────────────────

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
    const data = await res.json()
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
    return null
  } catch {
    return null
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: GeofenceType }) {
  const meta = TYPE_META[type] ?? TYPE_META.custom
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: `${meta.color}18`, color: meta.color,
      border: `1px solid ${meta.color}40`, borderRadius: '20px',
      padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600,
    }}>
      {meta.icon}
      {meta.label}
    </span>
  )
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: active ? `${GREEN}18` : 'rgba(255,255,255,0.06)',
      color: active ? GREEN : '#6B7280',
      border: `1px solid ${active ? GREEN + '40' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: '20px', padding: '3px 10px',
      fontSize: '0.75rem', fontWeight: 600,
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: active ? GREEN : '#4B5563',
        display: 'inline-block',
      }} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function GeofenceCard({
  g,
  onDelete,
  onToggle,
}: {
  g: Geofence
  onDelete: (id: number) => void
  onToggle: (id: number) => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${g.name}"?`)) return
    setDeleting(true)
    await onDelete(g.id)
    setDeleting(false)
  }

  async function handleToggle() {
    setToggling(true)
    await onToggle(g.id)
    setToggling(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      style={{
        background: GLASS,
        border: `1px solid ${BORDER}`,
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* color accent strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: '4px', height: '100%',
        background: g.color || GOLD,
        borderRadius: '4px 0 0 4px',
      }} />

      {/* Top row: name + badges */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ margin: 0, color: '#F1F5F9', fontWeight: 700, fontSize: '1.05rem' }}>
            {g.name}
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <TypeBadge type={g.type} />
            <StatusPill active={g.is_active} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {/* Toggle button */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            title={g.is_active ? 'Deactivate' : 'Activate'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: g.is_active ? GREEN : '#6B7280',
              padding: '6px', borderRadius: '8px',
              transition: 'background 0.15s',
              display: 'flex', alignItems: 'center',
            }}
          >
            {toggling
              ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              : g.is_active
                ? <ToggleRight size={22} />
                : <ToggleLeft size={22} />
            }
          </button>
          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete geofence"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: RED, padding: '6px', borderRadius: '8px',
              transition: 'background 0.15s',
              display: 'flex', alignItems: 'center',
            }}
          >
            {deleting
              ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              : <Trash2 size={18} />
            }
          </button>
        </div>
      </div>

      {/* Details row */}
      <div style={{
        display: 'flex', gap: '20px', flexWrap: 'wrap',
        borderTop: `1px solid ${BORDER}`, paddingTop: '12px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ color: '#6B7280', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Radius
          </span>
          <span style={{ color: '#CBD5E1', fontSize: '0.9rem', fontWeight: 600 }}>
            {g.radius_meters >= 1000
              ? `${(g.radius_meters / 1000).toFixed(1)} km`
              : `${g.radius_meters} m`}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ color: '#6B7280', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Coordinates
          </span>
          <span style={{ color: '#CBD5E1', fontSize: '0.9rem', fontFamily: 'monospace' }}>
            {g.center_lat.toFixed(4)}, {g.center_lng.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Visual circle preview */}
      <div style={{
        position: 'relative', height: '90px', borderRadius: '12px',
        background: 'rgba(0,0,0,0.2)', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {[3, 2, 1].map((scale) => (
          <div key={scale} style={{
            position: 'absolute',
            width: `${scale * 52}px`, height: `${scale * 52}px`,
            borderRadius: '50%',
            border: `1.5px solid ${g.color || GOLD}`,
            opacity: 0.15 + (3 - scale) * 0.12,
          }} />
        ))}
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%',
          background: g.color || GOLD,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
        }}>
          <MapPin size={12} color="#fff" />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Add Geofence Modal ───────────────────────────────────────────────────────

function AddGeofenceModal({
  familyId,
  onClose,
  onCreated,
}: {
  familyId: number
  onClose: () => void
  onCreated: (g: Geofence) => void
}) {
  const [form, setForm] = useState<AddFormState>({
    name: '',
    address: '',
    radius_meters: 200,
    type: 'custom',
    center_lat: null,
    center_lng: null,
  })
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const TYPE_COLORS: Record<GeofenceType, string> = {
    home: '#10B981', school: '#3B82F6', work: '#8B5CF6', custom: GOLD,
  }

  async function handleGeocode() {
    if (!form.address.trim()) return
    setGeocoding(true)
    setGeocodeError(null)
    const result = await geocodeAddress(form.address)
    setGeocoding(false)
    if (result) {
      setForm(f => ({ ...f, center_lat: result.lat, center_lng: result.lng }))
    } else {
      setGeocodeError('Address not found. Try a more specific address.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.name.trim()) { setError('Name is required'); return }
    if (form.center_lat === null || form.center_lng === null) {
      setError('Please look up the address coordinates first')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`${BASE}/geofences/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          family_id: familyId,
          name: form.name.trim(),
          type: form.type,
          center_lat: form.center_lat,
          center_lng: form.center_lng,
          radius_meters: form.radius_meters,
          color: TYPE_COLORS[form.type],
          alert_on_enter: true,
          alert_on_exit: true,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to create' }))
        throw new Error(err.detail || 'Failed to create geofence')
      }
      const data = await res.json()
      // Build geofence object to add locally
      const newG: Geofence = {
        id: data.id,
        name: form.name.trim(),
        type: form.type,
        center_lat: form.center_lat!,
        center_lng: form.center_lng!,
        radius_meters: form.radius_meters,
        color: TYPE_COLORS[form.type],
        is_active: true,
      }
      onCreated(newG)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create geofence')
    } finally {
      setSaving(false)
    }
  }

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdrop}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ duration: 0.25 }}
          style={{
            background: '#131720', border: `1px solid ${BORDER}`,
            borderRadius: '20px', padding: '32px',
            width: '100%', maxWidth: '480px',
            maxHeight: '90vh', overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: `${GOLD}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={18} color={GOLD} />
              </div>
              <h2 style={{ margin: 0, color: '#F1F5F9', fontWeight: 700, fontSize: '1.15rem' }}>
                Add Safe Zone
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 600 }}>Zone Name *</label>
              <input
                type="text"
                placeholder="e.g. Home, Grandma's House"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                style={inputStyle}
              />
            </div>

            {/* Type selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 600 }}>Zone Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {(['home', 'school', 'work', 'custom'] as GeofenceType[]).map((t) => {
                  const meta = TYPE_META[t]
                  const selected = form.type === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      style={{
                        background: selected ? `${meta.color}20` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selected ? meta.color : BORDER}`,
                        borderRadius: '10px', padding: '10px 6px',
                        cursor: 'pointer', color: selected ? meta.color : '#6B7280',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                        fontSize: '0.72rem', fontWeight: 600, transition: 'all 0.15s',
                      }}
                    >
                      {meta.icon}
                      {meta.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Address + geocode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 600 }}>Address / Location *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. Bandra West, Mumbai"
                  value={form.address}
                  onChange={e => {
                    setForm(f => ({ ...f, address: e.target.value, center_lat: null, center_lng: null }))
                    setGeocodeError(null)
                  }}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleGeocode}
                  disabled={geocoding || !form.address.trim()}
                  style={{
                    background: `${GOLD}20`, border: `1px solid ${GOLD}40`,
                    borderRadius: '10px', padding: '0 14px', cursor: 'pointer',
                    color: GOLD, fontWeight: 600, fontSize: '0.8rem',
                    opacity: geocoding || !form.address.trim() ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
                  }}
                >
                  {geocoding ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <MapPin size={14} />}
                  Look up
                </button>
              </div>
              {geocodeError && (
                <span style={{ color: RED, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={13} /> {geocodeError}
                </span>
              )}
              {form.center_lat !== null && form.center_lng !== null && (
                <span style={{ color: GREEN, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={13} /> Found: {form.center_lat.toFixed(5)}, {form.center_lng.toFixed(5)}
                </span>
              )}
            </div>

            {/* Radius */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 600 }}>
                Radius: {form.radius_meters >= 1000
                  ? `${(form.radius_meters / 1000).toFixed(1)} km`
                  : `${form.radius_meters} m`}
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {RADIUS_OPTIONS.map((r) => {
                  const selected = form.radius_meters === r
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, radius_meters: r }))}
                      style={{
                        background: selected ? `${GOLD}20` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selected ? GOLD : BORDER}`,
                        borderRadius: '8px', padding: '6px 12px',
                        cursor: 'pointer', color: selected ? GOLD : '#6B7280',
                        fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s',
                      }}
                    >
                      {r >= 1000 ? `${r / 1000}km` : `${r}m`}
                    </button>
                  )
                })}
              </div>
            </div>

            {error && (
              <div style={{
                background: `${RED}10`, border: `1px solid ${RED}30`,
                borderRadius: '10px', padding: '10px 14px',
                color: RED, fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center',
              }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`,
                  color: '#94A3B8', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 2, padding: '12px', borderRadius: '12px',
                  background: saving ? 'rgba(184,114,10,0.5)' : GOLD,
                  border: 'none', color: '#fff', fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {saving && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
                {saving ? 'Creating…' : 'Create Zone'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Shared input style ───────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${BORDER}`,
  borderRadius: '10px',
  padding: '10px 14px',
  color: '#F1F5F9',
  fontSize: '0.9rem',
  outline: 'none',
  width: '100%',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GeofencesPage() {
  const [token, setToken] = useState<string | null>(null)
  const [family, setFamily] = useState<Family | null>(null)
  const [geofences, setGeofences] = useState<Geofence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Get token client-side (localStorage)
  useEffect(() => {
    setToken(getToken())
  }, [])

  // Fetch family then geofences
  const loadData = useCallback(async (tok: string) => {
    setLoading(true)
    setError(null)
    try {
      const headers = { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' }

      // Step 1: get my families
      const famRes = await fetch(`${BASE}/families/my`, { headers })
      if (!famRes.ok) throw new Error('Failed to load family data')
      const families: Family[] = await famRes.json()
      if (!families || families.length === 0) {
        setError('You are not part of any family yet. Create or join a family first.')
        setLoading(false)
        return
      }
      const fam = families[0]
      setFamily(fam)

      // Step 2: get geofences for this family
      const gRes = await fetch(`${BASE}/geofences/family/${fam.id}`, { headers })
      if (!gRes.ok) throw new Error('Failed to load geofences')
      const gData: Geofence[] = await gRes.json()
      setGeofences(gData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) loadData(token)
    else if (token === null && typeof window !== 'undefined') {
      // token check done, not logged in
      setLoading(false)
    }
  }, [token, loadData])

  async function handleDelete(id: number) {
    try {
      await fetch(`${BASE}/geofences/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      setGeofences(prev => prev.filter(g => g.id !== id))
    } catch {
      // ignore
    }
  }

  async function handleToggle(id: number) {
    try {
      const res = await fetch(`${BASE}/geofences/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
      })
      if (res.ok) {
        const data: { id: number; is_active: boolean } = await res.json()
        setGeofences(prev => prev.map(g => g.id === id ? { ...g, is_active: data.is_active } : g))
      }
    } catch {
      // ignore
    }
  }

  function handleCreated(newG: Geofence) {
    setGeofences(prev => [newG, ...prev])
    setShowModal(false)
  }

  // ── Render: not logged in ───────────────────────────────────────────────────
  if (!loading && !token) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '80vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: GLASS, border: `1px solid ${BORDER}`,
              borderRadius: '20px', padding: '48px 40px',
              textAlign: 'center', maxWidth: '400px',
            }}
          >
            <Shield size={48} color={GOLD} style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#F1F5F9', fontWeight: 700, marginBottom: '10px' }}>Please log in</h2>
            <p style={{ color: '#6B7280', marginBottom: '24px', lineHeight: 1.6 }}>
              You need to be logged in to manage your family safe zones.
            </p>
            <a
              href="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: GOLD, color: '#fff', padding: '12px 28px',
                borderRadius: '50px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem',
              }}
            >
              Go to Login
            </a>
          </motion.div>
        </main>
        <Footer />
      </>
    )
  }

  const activeCount = geofences.filter(g => g.is_active).length

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #4B5563; }
      `}</style>

      <Navbar />

      <main style={{ minHeight: '100vh', background: BG, paddingBottom: '80px' }}>
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <section style={{
          background: 'linear-gradient(180deg, rgba(184,114,10,0.06) 0%, transparent 100%)',
          borderBottom: `1px solid ${BORDER}`,
          padding: '100px 24px 40px',
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  background: `${GOLD}18`, border: `1px solid ${GOLD}30`,
                  borderRadius: '20px', padding: '4px 14px',
                }}>
                  <MapPin size={13} color={GOLD} />
                  <span style={{ color: GOLD, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                    SAFE ZONES
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{
                    fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800,
                    color: '#F1F5F9', margin: '0 0 8px', lineHeight: 1.2,
                  }}>
                    Geofences
                    {family && (
                      <span style={{ color: '#6B7280', fontWeight: 400, fontSize: '1.1rem' }}>
                        {' '}— {family.name}
                      </span>
                    )}
                  </h1>
                  {!loading && (
                    <p style={{ color: '#6B7280', margin: 0, fontSize: '0.9rem' }}>
                      {geofences.length} zone{geofences.length !== 1 ? 's' : ''} total
                      {geofences.length > 0 && ` · ${activeCount} active`}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: GOLD, color: '#fff', border: 'none',
                    borderRadius: '12px', padding: '12px 22px',
                    fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                    boxShadow: `0 4px 20px ${GOLD}40`,
                  }}
                >
                  <Plus size={16} /> Add Geofence
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <section style={{ padding: '36px 24px', maxWidth: '1000px', margin: '0 auto' }}>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <Loader2 size={36} color={GOLD} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Loading safe zones…</span>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: `${RED}10`, border: `1px solid ${RED}30`,
                borderRadius: '14px', padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: '12px',
                color: RED, maxWidth: '600px', margin: '40px auto',
              }}
            >
              <AlertCircle size={20} />
              <span style={{ fontSize: '0.9rem' }}>{error}</span>
            </motion.div>
          )}

          {/* Empty state */}
          {!loading && !error && geofences.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: 'center', padding: '80px 24px',
              }}
            >
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: `${GOLD}12`, border: `1px solid ${GOLD}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Shield size={32} color={GOLD} />
              </div>
              <h3 style={{ color: '#F1F5F9', fontWeight: 700, marginBottom: '8px' }}>
                No safe zones yet
              </h3>
              <p style={{ color: '#6B7280', marginBottom: '28px', maxWidth: '360px', margin: '0 auto 28px', lineHeight: 1.6 }}>
                Create geofences around important places — home, school, work — and get alerted when family members enter or leave.
              </p>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: GOLD, color: '#fff', border: 'none',
                  borderRadius: '12px', padding: '12px 24px',
                  fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                }}
              >
                <Plus size={16} /> Create Your First Zone
              </button>
            </motion.div>
          )}

          {/* Geofence grid */}
          {!loading && !error && geofences.length > 0 && (
            <motion.div
              layout
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
              }}
            >
              <AnimatePresence>
                {geofences.map((g) => (
                  <GeofenceCard
                    key={g.id}
                    g={g}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </main>

      {/* ── Add Modal ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && family && (
          <AddGeofenceModal
            familyId={family.id}
            onClose={() => setShowModal(false)}
            onCreated={handleCreated}
          />
        )}
      </AnimatePresence>

      <Footer />
    </>
  )
}
