'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, RefreshCw, Navigation, Users, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react'
import { getToken } from '@/lib/auth'

const API_BASE = ''  // relative URLs go through Next.js proxy → port 8001

const MEMBER_COLORS = ['#D4A853', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899']

interface LiveMember {
  user_id: number
  name: string
  lat: number | null
  lng: number | null
  battery: number
  is_online: boolean
  place_name: string
  recorded_at: string | null
  color: string
  initials: string
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

function timeAgo(iso: string | null) {
  if (!iso) return 'Unknown'
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

/* ─── CSS injected once ───────────────────────────────────────── */
function injectMapStyles() {
  if (document.getElementById('uber-map-styles')) return
  const s = document.createElement('style')
  s.id = 'uber-map-styles'
  s.textContent = `
    .leaflet-container { background: #06090F !important; font-family: Inter, sans-serif; }
    .leaflet-control-attribution { display: none !important; }
    .leaflet-control-zoom { display: none !important; }
    .leaflet-tile-pane { filter: brightness(0.9) saturate(1.1); }
    .gv-u-pin { background: transparent !important; border: none !important; }
    @keyframes gv-u-pulse {
      0%   { transform: scale(0.6); opacity: 0.9; }
      100% { transform: scale(3); opacity: 0; }
    }
    @keyframes gv-u-float {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-4px); }
    }
  `
  document.head.appendChild(s)
}

/* ─── Build Leaflet pin HTML ──────────────────────────────────── */
function buildPinHtml(member: LiveMember, active: boolean) {
  const c = member.color
  const size = active ? 44 : 36
  return `
    <div style="position:relative;width:${size}px;height:${size}px;animation:gv-u-float 3s ease-in-out infinite;">
      <div style="
        position:absolute;inset:0;border-radius:50%;background:${c};
        animation:gv-u-pulse 2s ease-out infinite;opacity:0.6;">
      </div>
      <div style="
        position:absolute;inset:0;border-radius:50%;background:${c};
        animation:gv-u-pulse 2s ease-out infinite 0.7s;opacity:0.4;">
      </div>
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:linear-gradient(135deg,${c},${c}cc);
        border:2.5px solid white;
        box-shadow:0 4px 16px ${c}88,0 0 0 1px ${c}44;
        display:flex;align-items:center;justify-content:center;
        font-size:${active ? 13 : 11}px;font-weight:800;color:white;
        font-family:Inter,sans-serif;">
        ${member.initials}
      </div>
      <div style="
        position:absolute;top:${size + 4}px;left:50%;transform:translateX(-50%);
        background:rgba(10,12,18,0.88);backdrop-filter:blur(8px);
        border:1px solid ${c}55;border-radius:6px;padding:2px 7px;
        font-size:10px;font-weight:700;color:white;white-space:nowrap;
        font-family:Inter,sans-serif;">
        ${member.name.split(' ')[0]}
      </div>
    </div>
  `
}

/* ─── Main Component ─────────────────────────────────────────── */
interface UberFamilyMapProps {
  familyId?: number
  height?: string
  showMemberList?: boolean
}

export default function UberFamilyMap({
  familyId: propFamilyId,
  height = '100%',
  showMemberList = true,
}: UberFamilyMapProps) {
  const mapRef     = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<any>(null)
  const markersRef = useRef<Record<number, any>>({})

  const [members, setMembers]       = useState<LiveMember[]>([])
  const [loading, setLoading]       = useState(true)
  const [familyId, setFamilyId]     = useState<number | null>(propFamilyId ?? null)
  const [familyName, setFamilyName] = useState('')
  const [activeMember, setActiveMember] = useState<LiveMember | null>(null)
  const [sheetOpen, setSheetOpen]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  /* ── Load Leaflet & init map ── */
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return
    injectMapStyles()

    import('leaflet').then((L) => {
      if (!mapRef.current || leafletRef.current) return

      const map = L.map(mapRef.current, {
        center: [20.5937, 78.9629], // India center
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true,
      })

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      ).addTo(map)

      leafletRef.current = { L, map }

      // Fix blank map on mobile
      setTimeout(() => map.invalidateSize(), 300)
      setTimeout(() => map.invalidateSize(), 800)
      window.addEventListener('resize', () => map.invalidateSize())
    })

    return () => { leafletRef.current?.map?.remove(); leafletRef.current = null }
  }, [])

  /* ── Fetch family + members ── */
  const fetchMembers = useCallback(async () => {
    const token = getToken()
    if (!token) { setLoading(false); return }
    const headers = { Authorization: `Bearer ${token}` }

    try {
      let fid = familyId
      // Auto-detect family if not provided
      if (!fid) {
        const famRes = await fetch(`${API_BASE}/families/my`, { headers })
        if (!famRes.ok) { setLoading(false); return }
        const famData = await famRes.json()
        const famsArr = Array.isArray(famData) ? famData : [famData]
        if (!famsArr.length) { setLoading(false); return }
        fid = famsArr[0].id
        setFamilyId(fid)
        setFamilyName(famsArr[0].name || 'My Family')
      }
      if (!fid) { setLoading(false); return }

      // Get base members + live locations
      const [baseRes, liveRes] = await Promise.all([
        fetch(`${API_BASE}/families/${fid}/members`, { headers }),
        fetch(`${API_BASE}/location/live/${fid}`, { headers }),
      ])

      const base: any[] = baseRes.ok ? await baseRes.json() : []
      const live: any[] = liveRes.ok ? await liveRes.json() : []

      const liveMap: Record<number, any> = {}
      live.forEach((l) => { liveMap[l.user_id] = l })

      const merged: LiveMember[] = base.map((bm, i) => {
        const lv = liveMap[bm.user_id]
        return {
          user_id:    bm.user_id,
          name:       bm.name,
          lat:        lv?.lat ?? null,
          lng:        lv?.lng ?? null,
          battery:    lv?.battery ?? bm.battery ?? 50,
          is_online:  !!lv,
          place_name: lv ? (lv.place_name || 'Sharing location') : 'Location not shared',
          recorded_at: lv?.recorded_at ?? null,
          color:      MEMBER_COLORS[i % MEMBER_COLORS.length],
          initials:   getInitials(bm.name),
        }
      })

      setMembers(merged)
      setLastUpdate(new Date())
      setLoading(false)

      // Update map markers
      updateMarkers(merged)
    } catch {
      setLoading(false)
    }
  }, [familyId])

  /* ── Update Leaflet markers ── */
  function updateMarkers(ms: LiveMember[]) {
    const ctx = leafletRef.current
    if (!ctx) return
    const { L, map } = ctx

    // Remove old markers
    Object.values(markersRef.current).forEach((m: any) => m.remove())
    markersRef.current = {}

    const validMs = ms.filter((m) => m.lat !== null && m.lng !== null)
    if (!validMs.length) return

    const bounds: [number, number][] = []

    validMs.forEach((member) => {
      const icon = L.divIcon({
        className: 'gv-u-pin',
        html: buildPinHtml(member, false),
        iconSize: [36, 52],
        iconAnchor: [18, 18],
      })

      const marker = L.marker([member.lat!, member.lng!], { icon })
        .addTo(map)
        .on('click', () => {
          setActiveMember(member)
          setSheetOpen(true)
        })

      markersRef.current[member.user_id] = marker
      bounds.push([member.lat!, member.lng!])
    })

    // Fit map to show all members
    if (bounds.length === 1) {
      map.setView(bounds[0], 15)
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 })
    }

    setTimeout(() => map.invalidateSize(), 400)
  }

  useEffect(() => { fetchMembers() }, [fetchMembers])

  // Auto-refresh every 15s
  useEffect(() => {
    const id = setInterval(fetchMembers, 15000)
    return () => clearInterval(id)
  }, [fetchMembers])

  async function handleRefresh() {
    setRefreshing(true)
    await fetchMembers()
    setTimeout(() => setRefreshing(false), 800)
  }

  function centerOnMember(member: LiveMember) {
    if (!member.lat || !member.lng || !leafletRef.current) return
    leafletRef.current.map.setView([member.lat, member.lng], 16, { animate: true })
    setActiveMember(member)
  }

  const onlineCount = members.filter((m) => m.is_online).length

  return (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden' }}>

      {/* ── Real Leaflet Map ── */}
      <div ref={mapRef} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

      {/* ── Top overlay bar ── */}
      <div style={{
        position: 'absolute', top: 12, left: 12, right: 12, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        pointerEvents: 'none',
      }}>
        {/* Left: Family name + live badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(10,12,20,0.82)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: '8px 12px',
          pointerEvents: 'auto',
        }}>
          <MapPin size={14} style={{ color: '#D4A853' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
            {familyName || 'Family Map'}
          </span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: onlineCount > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
            border: `1px solid ${onlineCount > 0 ? 'rgba(16,185,129,0.4)' : 'rgba(107,114,128,0.3)'}`,
            borderRadius: 6, padding: '2px 7px',
          }}>
            <motion.div
              animate={onlineCount > 0 ? { scale: [1, 1.4, 1], opacity: [1, 0.4, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: onlineCount > 0 ? '#10B981' : '#6B7280' }}
            />
            <span style={{ fontSize: 10, fontWeight: 700, color: onlineCount > 0 ? '#10B981' : '#6B7280' }}>
              {onlineCount}/{members.length} Live
            </span>
          </div>
        </div>

        {/* Right: Refresh */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleRefresh}
          style={{
            width: 38, height: 38,
            background: 'rgba(10,12,20,0.82)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', pointerEvents: 'auto',
          }}
        >
          <motion.div
            animate={refreshing ? { rotate: 360 } : {}}
            transition={refreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : {}}
          >
            <RefreshCw size={15} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </motion.div>
        </motion.button>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 8,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10,12,20,0.7)', backdropFilter: 'blur(4px)',
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          >
            <Navigation size={32} style={{ color: '#D4A853' }} />
          </motion.div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 12 }}>
            Loading family locations…
          </p>
        </div>
      )}

      {/* ── No members state ── */}
      {!loading && members.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 8,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            background: 'rgba(10,12,20,0.88)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
            padding: '24px 32px', textAlign: 'center',
          }}>
            <Users size={32} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 10 }} />
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0 }}>No family members found</p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 }}>
              Join or create a family to see locations
            </p>
          </div>
        </div>
      )}

      {/* ── No GPS state (members exist but no location shared) ── */}
      {!loading && members.length > 0 && onlineCount === 0 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 8, pointerEvents: 'none', textAlign: 'center',
        }}>
          <div style={{
            background: 'rgba(10,12,20,0.88)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
            padding: '20px 28px',
          }}>
            <Wifi size={24} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: 8 }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>
              No one is sharing location
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 4 }}>
              Ask family members to open /track
            </p>
          </div>
        </div>
      )}

      {/* ── Bottom member sheet ── */}
      {showMemberList && !loading && members.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        }}>
          {/* Sheet toggle handle */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 4 }}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSheetOpen((v) => !v)}
              style={{
                background: 'rgba(10,12,20,0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 20, padding: '6px 20px',
                display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'pointer',
              }}
            >
              <Users size={12} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                {members.length} Members
              </span>
              {sheetOpen
                ? <ChevronDown size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
                : <ChevronUp size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />}
            </motion.button>
          </div>

          <AnimatePresence>
            {sheetOpen && (
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  background: 'rgba(10,12,20,0.95)',
                  backdropFilter: 'blur(20px)',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  borderTopLeftRadius: 20, borderTopRightRadius: 20,
                  padding: '12px 16px 20px',
                  maxHeight: '45vh', overflowY: 'auto',
                }}
              >
                {/* Last updated */}
                {lastUpdate && (
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginBottom: 10 }}>
                    Updated {timeAgo(lastUpdate.toISOString())}
                  </p>
                )}

                {/* Member cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {members.map((m, i) => (
                    <motion.button
                      key={m.user_id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => centerOnMember(m)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px',
                        borderRadius: 14,
                        background: activeMember?.user_id === m.user_id
                          ? `${m.color}18`
                          : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${activeMember?.user_id === m.user_id ? m.color + '40' : 'rgba(255,255,255,0.06)'}`,
                        cursor: 'pointer', textAlign: 'left', width: '100%',
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, ${m.color}, ${m.color}88)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800, color: 'white',
                        border: `2px solid ${m.is_online ? m.color : 'rgba(255,255,255,0.1)'}`,
                        boxShadow: m.is_online ? `0 0 12px ${m.color}55` : 'none',
                      }}>
                        {m.initials}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{m.name}</span>
                          {m.is_online ? (
                            <span style={{
                              fontSize: 9, fontWeight: 700, color: '#10B981',
                              background: 'rgba(16,185,129,0.15)',
                              border: '1px solid rgba(16,185,129,0.3)',
                              borderRadius: 4, padding: '1px 5px',
                            }}>LIVE</span>
                          ) : (
                            <span style={{
                              fontSize: 9, fontWeight: 600, color: '#6B7280',
                              background: 'rgba(107,114,128,0.12)',
                              border: '1px solid rgba(107,114,128,0.2)',
                              borderRadius: 4, padding: '1px 5px',
                            }}>OFFLINE</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <MapPin size={9} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                          <span style={{
                            fontSize: 11, color: 'rgba(255,255,255,0.4)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {m.place_name}
                          </span>
                        </div>
                        {m.recorded_at && (
                          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>
                            {timeAgo(m.recorded_at)}
                          </p>
                        )}
                      </div>

                      {/* Battery */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                        <div style={{
                          width: 24, height: 12, borderRadius: 3,
                          border: '1.5px solid rgba(255,255,255,0.2)',
                          position: 'relative', overflow: 'hidden',
                        }}>
                          <div style={{
                            position: 'absolute', left: 0, top: 0, bottom: 0,
                            width: `${m.battery}%`,
                            background: m.battery > 30 ? '#10B981' : m.battery > 15 ? '#F59E0B' : '#EF4444',
                            borderRadius: 2,
                          }} />
                        </div>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{m.battery}%</span>
                      </div>

                      {/* Nav arrow */}
                      {m.lat && (
                        <Navigation size={14} style={{ color: m.color, flexShrink: 0, opacity: 0.7 }} />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
