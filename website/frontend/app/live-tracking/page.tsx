'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  MapPin, Navigation, Battery, Wifi, WifiOff, Smartphone,
  Shield, ChevronRight, Users, Clock, Zap, RefreshCw,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/* ─── config ─────────────────────────────────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const WS_BASE  = process.env.NEXT_PUBLIC_WS_URL ?? API_BASE.replace(/^http/, 'ws')

/* ─── types ──────────────────────────────────────────────────── */
interface FamilyMember {
  user_id: number | string
  name: string
  avatar_url?: string | null
  lat: number
  lng: number
  accuracy?: number | null
  speed?: number | null
  heading?: number | null
  battery?: number | null
  activity?: string
  place_name?: string | null
  is_online?: boolean
  recorded_at?: string | null
  timestamp?: string
}

/* ─── avatar helper ──────────────────────────────────────────── */
function Avatar({ name, url, size = 40 }: { name: string; url?: string | null; size?: number }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  if (url) return <img src={url} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
      style={{ width: size, height: size, background: 'linear-gradient(135deg,#D4A853,#F5C842)', color: '#1A0F05' }}
    >
      {initials}
    </div>
  )
}

/* ─── MemberCard ─────────────────────────────────────────────── */
function MemberCard({ m, selected, onClick }: { m: FamilyMember; selected: boolean; onClick: () => void }) {
  const timeAgo = m.recorded_at
    ? (() => {
        const diff = Math.floor((Date.now() - new Date(m.recorded_at!).getTime()) / 1000)
        if (diff < 60) return `${diff}s ago`
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        return `${Math.floor(diff / 3600)}h ago`
      })()
    : 'Just now'

  const speedKmh = m.speed !== null && m.speed !== undefined ? Math.round(m.speed * 3.6) : null

  return (
    <motion.div
      layout
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all"
      style={{
        background: selected ? 'rgba(212,168,83,0.1)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected ? 'rgba(212,168,83,0.35)' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      <div className="relative">
        <Avatar name={m.name} url={m.avatar_url} size={42} />
        <span
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
          style={{
            background: m.is_online ? '#22c55e' : '#6b7280',
            borderColor: '#111420',
            boxShadow: m.is_online ? '0 0 6px #22c55e' : 'none',
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{m.name}</p>
        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {m.place_name ?? `${m.lat.toFixed(4)}, ${m.lng.toFixed(4)}`}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{timeAgo}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        {m.battery !== null && m.battery !== undefined && (
          <div className="flex items-center gap-1">
            <Battery className="w-3 h-3" style={{ color: m.battery < 20 ? '#ef4444' : '#D4A853' }} />
            <span className="text-xs" style={{ color: m.battery < 20 ? '#ef4444' : '#D4A853' }}>
              {m.battery}%
            </span>
          </div>
        )}
        {speedKmh !== null && speedKmh > 0 && (
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-400">{speedKmh} km/h</span>
          </div>
        )}
        {m.activity && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full capitalize"
            style={{ background: 'rgba(212,168,83,0.15)', color: '#D4A853' }}
          >
            {m.activity}
          </span>
        )}
      </div>
    </motion.div>
  )
}

/* ─── MapPlaceholder (Leaflet loads client-side only) ────────── */
function MapView({ members, selected }: { members: FamilyMember[]; selected: FamilyMember | null }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})

  useEffect(() => {
    if (typeof window === 'undefined' || leafletRef.current) return

    import('leaflet').then((L) => {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!mapRef.current) return
      const map = L.map(mapRef.current, { zoomControl: true }).setView([28.6139, 77.209], 12)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)
      leafletRef.current = { map, L }
    })
  }, [])

  /* update markers whenever members change */
  useEffect(() => {
    if (!leafletRef.current) return
    const { map, L } = leafletRef.current

    members.forEach((m) => {
      const key = String(m.user_id)
      const initials = m.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:38px;height:38px;border-radius:50%;
          background:linear-gradient(135deg,#D4A853,#F5C842);
          color:#1A0F05;font-weight:800;font-size:13px;
          display:flex;align-items:center;justify-content:center;
          border:3px solid #fff;
          box-shadow:0 2px 12px rgba(212,168,83,0.6);
        ">${initials}</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      })

      if (markersRef.current[key]) {
        markersRef.current[key].setLatLng([m.lat, m.lng]).setIcon(icon)
      } else {
        const marker = L.marker([m.lat, m.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${m.name}</b><br/>${m.place_name ?? ''}`)
        markersRef.current[key] = marker
      }
    })
  }, [members])

  /* pan to selected */
  useEffect(() => {
    if (!leafletRef.current || !selected) return
    leafletRef.current.map.flyTo([selected.lat, selected.lng], 15, { duration: 1 })
    const key = String(selected.user_id)
    if (markersRef.current[key]) markersRef.current[key].openPopup()
  }, [selected])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={mapRef}
        className="w-full h-full rounded-2xl overflow-hidden"
        style={{ minHeight: 400 }}
      />
    </>
  )
}

/* ─── Live Map Page ──────────────────────────────────────────── */
function LiveTrackingInner() {
  const searchParams = useSearchParams()
  const FAMILY_ID = Number(searchParams.get('family') ?? '1')

  const [members, setMembers]     = useState<FamilyMember[]>([])
  const [selected, setSelected]   = useState<FamilyMember | null>(null)
  const [wsStatus, setWsStatus]   = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')
  const [onlineCount, setOnlineCount] = useState(0)
  const [lastUpdate, setLastUpdate]   = useState<Date | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  /* load initial snapshot via REST */
  const loadSnapshot = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/location/live/${FAMILY_ID}`)
      if (res.ok) {
        const data: FamilyMember[] = await res.json()
        setMembers(data)
        if (data.length) setLastUpdate(new Date())
      }
    } catch { /* offline */ }
  }, [])

  /* connect WebSocket for live updates */
  const connectWS = useCallback(() => {
    const userId = typeof window !== 'undefined'
      ? (localStorage.getItem('gravity_user_id') ?? 'viewer')
      : 'viewer'
    const ws = new WebSocket(`${WS_BASE}/location/ws/${FAMILY_ID}?user_id=${userId}`)
    wsRef.current = ws
    setWsStatus('connecting')

    ws.onopen = () => setWsStatus('connected')
    ws.onclose = () => {
      setWsStatus('disconnected')
      setTimeout(connectWS, 3000)
    }
    ws.onerror = () => setWsStatus('disconnected')

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'room_joined') {
          setOnlineCount(msg.online ?? 0)
        } else if (msg.type === 'member_online' || msg.type === 'member_offline') {
          setOnlineCount(msg.online ?? 0)
        } else if (msg.type === 'location_update') {
          setMembers((prev) => {
            const idx = prev.findIndex((m) => String(m.user_id) === String(msg.user_id))
            const updated: FamilyMember = {
              user_id: msg.user_id,
              name: msg.name ?? `User ${msg.user_id}`,
              avatar_url: msg.avatar_url,
              lat: msg.lat,
              lng: msg.lng,
              accuracy: msg.accuracy,
              speed: msg.speed,
              heading: msg.heading,
              battery: msg.battery,
              activity: msg.activity,
              place_name: msg.place_name,
              is_online: true,
              timestamp: msg.timestamp,
              recorded_at: msg.timestamp,
            }
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = updated
              return next
            }
            return [...prev, updated]
          })
          setLastUpdate(new Date())
          /* keep selected in sync */
          setSelected((prev) =>
            prev && String(prev.user_id) === String(msg.user_id)
              ? { ...prev, lat: msg.lat, lng: msg.lng, activity: msg.activity, battery: msg.battery }
              : prev,
          )
        }
      } catch { /* bad json */ }
    }

    /* heartbeat */
    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }))
    }, 30000)

    return () => { clearInterval(ping); ws.close() }
  }, [])

  useEffect(() => {
    loadSnapshot()
    const cleanup = connectWS()
    return cleanup
  }, [loadSnapshot, connectWS])

  const wsColor = wsStatus === 'connected' ? '#22c55e' : wsStatus === 'connecting' ? '#D4A853' : '#ef4444'
  const wsLabel = wsStatus === 'connected' ? 'Live' : wsStatus === 'connecting' ? 'Connecting…' : 'Reconnecting…'

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen pt-20"
        style={{ background: 'linear-gradient(160deg,#0B0D13 0%,#111420 60%,#0d1020 100%)' }}
      >
        {/* ── Hero ── */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(212,168,83,0.12)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.25)' }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: wsColor, boxShadow: `0 0 6px ${wsColor}` }}
              />
              {wsLabel} · {onlineCount} family members online
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Family Live Map
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Real-time GPS location of every family member — updates as they move.
            </p>
          </motion.div>

          {/* ── Main layout: map + sidebar ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 rounded-3xl overflow-hidden relative"
              style={{ background: '#111420', border: '1px solid rgba(255,255,255,0.07)', minHeight: 480 }}
            >
              {/* status bar */}
              <div
                className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between px-3 py-2 rounded-xl backdrop-blur-sm"
                style={{ background: 'rgba(17,20,32,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: wsColor, animation: wsStatus === 'connected' ? 'pulse 1.5s infinite' : 'none' }}
                  />
                  <span className="text-xs font-semibold" style={{ color: wsColor }}>{wsLabel}</span>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {lastUpdate && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lastUpdate.toLocaleTimeString()}
                    </span>
                  )}
                  <button
                    onClick={loadSnapshot}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                </div>
              </div>

              {members.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-24">
                  <MapPin className="w-12 h-12" style={{ color: 'rgba(212,168,83,0.3)' }} />
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    No family members sharing location yet
                  </p>
                  <Link
                    href="/track"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{ background: 'linear-gradient(135deg,#D4A853,#F5C842)', color: '#1A0F05' }}
                  >
                    <Smartphone className="w-4 h-4" />
                    Open Mobile Tracker
                  </Link>
                </div>
              ) : (
                <MapView members={members} selected={selected} />
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col gap-4"
            >
              {/* Family list */}
              <div
                className="rounded-3xl p-4 flex-1"
                style={{ background: '#111420', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4" style={{ color: '#D4A853' }} />
                    Family Members
                  </h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(212,168,83,0.15)', color: '#D4A853' }}
                  >
                    {members.length}
                  </span>
                </div>

                {members.length === 0 ? (
                  <p className="text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    No members yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {members.map((m) => (
                        <MemberCard
                          key={String(m.user_id)}
                          m={m}
                          selected={selected?.user_id === m.user_id}
                          onClick={() => setSelected((prev) => prev?.user_id === m.user_id ? null : m)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Open tracker CTA */}
              <div
                className="rounded-3xl p-4"
                style={{ background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.15)' }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: '#D4A853' }}>
                  Share your location
                </p>
                <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Open the mobile tracker on your phone to appear on this map in real-time.
                </p>
                <Link
                  href="/track"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold w-full transition-all"
                  style={{ background: 'linear-gradient(135deg,#D4A853,#F5C842)', color: '#1A0F05' }}
                >
                  <Navigation className="w-4 h-4" />
                  Open Tracker
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Privacy badge */}
              <div
                className="rounded-2xl p-3 flex items-start gap-3"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#22c55e' }} />
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  All locations are end-to-end encrypted and only shared within your family circle.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { step: '01', title: 'Open on your phone', desc: 'Go to gravity.trackalways.com/track on any smartphone — no app install needed.', icon: Smartphone },
              { step: '02', title: 'Start sharing', desc: 'Tap "Start Sharing Location". Your GPS updates are sent every 8 seconds.', icon: Navigation },
              { step: '03', title: 'Family sees you live', desc: 'Everyone in your circle sees your pin move on this map in real-time.', icon: Users },
            ].map(({ step, title, desc, icon: Icon }) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl p-5"
                style={{ background: '#111420', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(212,168,83,0.15)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#D4A853' }} />
                </div>
                <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(212,168,83,0.6)' }}>{step}</p>
                <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        .leaflet-container { background: #111420 !important; }
      `}</style>
    </>
  )
}

export default function LiveTrackingPage() { return <Suspense fallback={null}><LiveTrackingInner /></Suspense> }
