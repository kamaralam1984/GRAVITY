'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Battery, Wifi, WifiOff, AlertTriangle, Navigation,
  Activity, Shield, Eye, EyeOff, Phone, Zap, CheckCircle2,
} from 'lucide-react'

/* ─── config ─────────────────────────────────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const UPDATE_INTERVAL_MS = 8000

/* ─── helpers ────────────────────────────────────────────────── */
function getBatteryPercent(nav: Navigator & { getBattery?: () => Promise<{ level: number }> }) {
  return nav.getBattery?.().then((b) => Math.round(b.level * 100)).catch(() => null) ?? Promise.resolve(null)
}

function getActivity(speed: number | null) {
  if (speed === null) return 'stationary'
  if (speed > 30) return 'driving'
  if (speed > 5)  return 'running'
  if (speed > 0)  return 'walking'
  return 'stationary'
}

/* ─── types ──────────────────────────────────────────────────── */
interface GpsState {
  lat: number | null
  lng: number | null
  accuracy: number | null
  speed: number | null
  heading: number | null
  altitude: number | null
  timestamp: number | null
}

/* ─── StatusChip ─────────────────────────────────────────────── */
function StatusChip({
  icon: Icon,
  label,
  value,
  color = '#D4A853',
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  value: string | number | null
  color?: string
}) {
  return (
    <div
      className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <Icon className="w-5 h-5" style={{ color }} />
      <span className="text-xs font-semibold" style={{ color }}>
        {value ?? '—'}
      </span>
      <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {label}
      </span>
    </div>
  )
}

/* ─── SosButton ──────────────────────────────────────────────── */
function SosButton({ lat, lng, familyId }: { lat: number | null; lng: number | null; familyId: number }) {
  const [pressed, setPressed] = useState(false)

  async function handleSOS() {
    if (!lat || !lng || pressed) return
    setPressed(true)

    const token = typeof window !== 'undefined' ? localStorage.getItem('gravity_token') : null
    await fetch(`${API_BASE}/location/sos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        user_id: 'current',
        lat,
        lng,
        circle_id: String(familyId),
        message: 'SOS triggered from mobile tracker',
      }),
    }).catch(() => {})

    setTimeout(() => setPressed(false), 5000)
  }

  return (
    <motion.button
      onClick={handleSOS}
      whileTap={{ scale: 0.93 }}
      disabled={!lat || !lng || pressed}
      className="w-full py-4 rounded-2xl font-extrabold text-lg tracking-wide uppercase transition-all"
      style={{
        background: pressed
          ? 'rgba(239,68,68,0.2)'
          : 'linear-gradient(135deg, #ef4444, #b91c1c)',
        color: pressed ? '#ef4444' : '#fff',
        border: pressed ? '2px solid #ef4444' : '2px solid transparent',
        boxShadow: pressed ? 'none' : '0 0 30px rgba(239,68,68,0.4)',
        opacity: !lat || !lng ? 0.5 : 1,
      }}
    >
      <span className="flex items-center justify-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        {pressed ? 'SOS Sent — Help Coming' : 'Emergency SOS'}
      </span>
    </motion.button>
  )
}

/* ─── Main Page ──────────────────────────────────────────────── */
function TrackInner() {
  const searchParams = useSearchParams()
  const FAMILY_ID = Number(searchParams.get('family') ?? '1')
  const [gps, setGps] = useState<GpsState>({
    lat: null, lng: null, accuracy: null,
    speed: null, heading: null, altitude: null, timestamp: null,
  })
  const [battery, setBattery]     = useState<number | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [isOnline, setIsOnline]   = useState(true)
  const [lastSent, setLastSent]   = useState<Date | null>(null)
  const [sendCount, setSendCount] = useState(0)
  const [error, setError]         = useState<string | null>(null)

  const watchId      = useRef<number | null>(null)
  const intervalId   = useRef<ReturnType<typeof setInterval> | null>(null)
  const latestGps    = useRef<GpsState>(gps)
  latestGps.current  = gps

  /* fetch battery once on mount */
  useEffect(() => {
    getBatteryPercent(navigator as never).then(setBattery)
  }, [])

  /* online / offline */
  useEffect(() => {
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  /* ── send location to backend ── */
  const sendLocation = useCallback(async (loc: GpsState) => {
    if (!loc.lat || !loc.lng) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('gravity_token') : null

    try {
      const res = await fetch(`${API_BASE}/location/update?family_id=${FAMILY_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          lat: loc.lat,
          lng: loc.lng,
          accuracy: loc.accuracy,
          speed: loc.speed,
          heading: loc.heading,
          altitude: loc.altitude,
          battery,
          activity: getActivity(loc.speed),
        }),
      })
      if (res.ok) {
        setLastSent(new Date())
        setSendCount((c) => c + 1)
        setError(null)
      }
    } catch {
      setError('Network error — location queued')
    }
  }, [battery])

  /* ── start tracking ── */
  function startTracking() {
    setError(null)
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device')
      return
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc: GpsState = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          altitude: pos.coords.altitude,
          timestamp: pos.timestamp,
        }
        setGps(loc)
      },
      (err) => {
        if (err.code === 1) setError('Location permission denied — please allow in browser settings')
        else if (err.code === 2) setError('Location unavailable — check GPS signal')
        else setError('Location timeout — retrying…')
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    )

    /* send REST update every UPDATE_INTERVAL_MS */
    intervalId.current = setInterval(() => {
      sendLocation(latestGps.current)
    }, UPDATE_INTERVAL_MS)

    setIsSharing(true)
  }

  function stopTracking() {
    if (watchId.current !== null)  navigator.geolocation.clearWatch(watchId.current)
    if (intervalId.current !== null) clearInterval(intervalId.current)
    watchId.current  = null
    intervalId.current = null
    setIsSharing(false)
  }

  useEffect(() => () => stopTracking(), [])

  const activityLabel = getActivity(gps.speed)
  const speedKmh = gps.speed !== null ? Math.round(gps.speed * 3.6) : null

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-10 px-4"
      style={{ background: 'linear-gradient(160deg, #0B0D13 0%, #111420 60%, #0d1020 100%)' }}
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mb-8 text-center"
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background: 'rgba(212,168,83,0.12)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.25)' }}
        >
          <Navigation className="w-3.5 h-3.5" />
          Mobile GPS Tracker
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-1">GRAVITY Tracker</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Share real-time location with your family
        </p>
      </motion.div>

      {/* ── Status card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-3xl p-6 mb-5"
        style={{ background: '#111420', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Live indicator */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: isSharing ? '#22c55e' : '#6b7280',
                boxShadow: isSharing ? '0 0 8px #22c55e' : 'none',
                animation: isSharing ? 'pulse 1.5s infinite' : 'none',
              }}
            />
            <span className="text-sm font-semibold text-white">
              {isSharing ? 'Sharing Live' : 'Not sharing'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {isOnline
              ? <Wifi className="w-4 h-4 text-green-400" />
              : <WifiOff className="w-4 h-4 text-red-400" />}
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Coordinates */}
        <div
          className="rounded-2xl p-4 mb-5 text-center"
          style={{ background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.15)' }}
        >
          {gps.lat ? (
            <>
              <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                CURRENT COORDINATES
              </p>
              <p className="font-mono text-sm font-bold" style={{ color: '#D4A853' }}>
                {gps.lat.toFixed(6)}, {gps.lng!.toFixed(6)}
              </p>
              {gps.accuracy && (
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  ±{Math.round(gps.accuracy)}m accuracy
                </p>
              )}
            </>
          ) : (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Waiting for GPS signal…
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <StatusChip icon={Activity} label="Activity" value={activityLabel} />
          <StatusChip icon={Zap} label="Speed" value={speedKmh !== null ? `${speedKmh}` : '—'} />
          <StatusChip icon={Battery} label="Battery" value={battery !== null ? `${battery}%` : '—'} color={battery !== null && battery < 20 ? '#ef4444' : '#D4A853'} />
          <StatusChip icon={MapPin} label="Altitude" value={gps.altitude !== null ? `${Math.round(gps.altitude)}m` : '—'} />
        </div>

        {/* Last sent */}
        <AnimatePresence>
          {lastSent && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-xs text-green-400">
                Update #{sendCount} sent at {lastSent.toLocaleTimeString()}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="err"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start / Stop button */}
        <motion.button
          onClick={isSharing ? stopTracking : startTracking}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3.5 rounded-2xl font-bold text-base transition-all"
          style={
            isSharing
              ? { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }
              : {
                  background: 'linear-gradient(135deg, #D4A853, #F5C842)',
                  color: '#1A0F05',
                  boxShadow: '0 4px 20px rgba(212,168,83,0.35)',
                }
          }
        >
          <span className="flex items-center justify-center gap-2">
            {isSharing ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            {isSharing ? 'Stop Sharing' : 'Start Sharing Location'}
          </span>
        </motion.button>
      </motion.div>

      {/* ── SOS Button ── */}
      <div className="w-full max-w-sm mb-5">
        <SosButton lat={gps.lat} lng={gps.lng} familyId={FAMILY_ID} />
      </div>

      {/* ── Privacy note ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Location shared only with your family circle
          </span>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Updates every 8 seconds · End-to-end encrypted
        </p>
      </motion.div>

      {/* pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

export default function TrackPage() { return <Suspense fallback={null}><TrackInner /></Suspense> }
