'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Battery, Wifi, WifiOff, AlertTriangle, Navigation,
  Activity, Shield, Eye, EyeOff, Zap, CheckCircle2,
  Compass, RefreshCw, Users, TrendingUp,
} from 'lucide-react'
import { getUser, getToken } from '@/lib/auth'

/* ─── config ─────────────────────────────────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const UPDATE_INTERVAL_MS = 8000
const GOOD_ACCURACY_M   = 50    // below this = good GPS
const POOR_ACCURACY_M   = 500   // above this = network-only, warn user

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

function getActivityEmoji(act: string) {
  const map: Record<string, string> = { driving: '🚗', running: '🏃', walking: '🚶', stationary: '📍' }
  return map[act] ?? '📍'
}

function getGpsQuality(accuracy: number | null) {
  if (accuracy === null)           return { label: 'No Signal',  color: '#6b7280', bg: 'rgba(107,114,128,0.12)', bars: 0 }
  if (accuracy <= 10)              return { label: 'Excellent',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   bars: 4 }
  if (accuracy <= GOOD_ACCURACY_M) return { label: 'Good',       color: '#84cc16', bg: 'rgba(132,204,22,0.12)',  bars: 3 }
  if (accuracy <= POOR_ACCURACY_M) return { label: 'Fair',       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', bars: 2 }
  return                                  { label: 'Poor',        color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  bars: 1 }
}

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${s % 60}s`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/* ─── types ──────────────────────────────────────────────────── */
interface GpsState {
  lat:       number | null
  lng:       number | null
  accuracy:  number | null
  speed:     number | null
  heading:   number | null
  altitude:  number | null
  timestamp: number | null
}

/* ─── Signal Bars ─────────────────────────────────────────────── */
function SignalBars({ bars, color }: { bars: number; color: string }) {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4].map((b) => (
        <div
          key={b}
          style={{
            width: 3,
            height: `${b * 25}%`,
            borderRadius: 1,
            background: b <= bars ? color : 'rgba(255,255,255,0.15)',
            transition: 'background 0.3s',
          }}
        />
      ))}
    </div>
  )
}

/* ─── StatusChip ─────────────────────────────────────────────── */
function StatusChip({
  icon: Icon, label, value, color = '#D4A853', sub,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  value: string | number | null
  color?: string
  sub?: string
}) {
  return (
    <div
      className="flex flex-col items-center gap-1 px-2 py-3 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <Icon className="w-4 h-4" style={{ color }} />
      <span className="text-xs font-bold" style={{ color }}>
        {value ?? '—'}
      </span>
      {sub && <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</span>}
      <span className="text-[9px] uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </span>
    </div>
  )
}

/* ─── GPS Quality Card ────────────────────────────────────────── */
function GpsQualityCard({
  accuracy, isAcquiring,
}: {
  accuracy: number | null
  isAcquiring: boolean
}) {
  const q = getGpsQuality(accuracy)
  const isPoor = accuracy !== null && accuracy > POOR_ACCURACY_M

  return (
    <div
      className="rounded-2xl p-3 mb-4"
      style={{ background: q.bg, border: `1px solid ${q.color}30` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SignalBars bars={q.bars} color={q.color} />
          <div>
            <span className="text-xs font-bold" style={{ color: q.color }}>
              GPS: {q.label}
            </span>
            {accuracy !== null && (
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                ±{accuracy < 1000 ? `${Math.round(accuracy)}m` : `${(accuracy / 1000).toFixed(1)}km`} accuracy
              </p>
            )}
          </div>
        </div>
        {isAcquiring && (
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            >
              <RefreshCw className="w-3.5 h-3.5" style={{ color: q.color }} />
            </motion.div>
            <span className="text-[10px]" style={{ color: q.color }}>Improving…</span>
          </div>
        )}
      </div>
      {isPoor && (
        <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-[10px]" style={{ color: '#f59e0b' }}>
            ⚠ Network-only location. Go outdoors or use a mobile device for accurate GPS.
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── SosButton ──────────────────────────────────────────────── */
function SosButton({ lat, lng, familyId }: { lat: number | null; lng: number | null; familyId: number }) {
  const [pressed, setPressed] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function handleSOS() {
    if (!lat || !lng || pressed) return
    // 3-second countdown to prevent accidental trigger
    setCountdown(3)
    let c = 3
    countRef.current = setInterval(() => {
      c -= 1
      setCountdown(c)
      if (c <= 0) {
        clearInterval(countRef.current!)
        setCountdown(null)
        triggerSOS()
      }
    }, 1000)
  }

  function cancelSOS() {
    if (countRef.current) clearInterval(countRef.current)
    setCountdown(null)
  }

  async function triggerSOS() {
    setPressed(true)
    const token = typeof window !== 'undefined' ? (localStorage.getItem('gv_token') || '') : ''
    await fetch(`${API_BASE}/location/sos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        user_id: 'current', lat, lng,
        circle_id: String(familyId),
        message: 'SOS triggered from mobile tracker',
      }),
    }).catch(() => {})
    setTimeout(() => setPressed(false), 8000)
  }

  if (countdown !== null) {
    return (
      <div className="flex gap-2">
        <motion.button
          onClick={cancelSOS}
          className="flex-1 py-4 rounded-2xl font-bold text-base"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          Cancel
        </motion.button>
        <motion.div
          className="flex-1 py-4 rounded-2xl font-extrabold text-lg tracking-wide text-center"
          style={{
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            color: '#fff',
            boxShadow: '0 0 30px rgba(239,68,68,0.5)',
          }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          SOS in {countdown}…
        </motion.div>
      </div>
    )
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
        {pressed ? '🚨 SOS Sent — Help Coming' : 'Emergency SOS'}
      </span>
    </motion.button>
  )
}

/* ─── Main Page ──────────────────────────────────────────────── */
function TrackInner() {
  const searchParams = useSearchParams()

  const [familyId, setFamilyId]   = useState<number>(Number(searchParams.get('family') ?? '0'))
  const [familyName, setFamilyName] = useState<string>('')
  const [userName, setUserName]   = useState<string>('')

  const [gps, setGps]             = useState<GpsState>({
    lat: null, lng: null, accuracy: null,
    speed: null, heading: null, altitude: null, timestamp: null,
  })
  const [battery, setBattery]     = useState<number | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [isOnline, setIsOnline]   = useState(true)
  const [lastSent, setLastSent]   = useState<Date | null>(null)
  const [sendCount, setSendCount] = useState(0)
  const [error, setError]         = useState<string | null>(null)
  const [isAcquiring, setIsAcquiring] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsed, setElapsed]     = useState(0)
  const [distanceKm, setDistanceKm] = useState(0)

  const watchId      = useRef<number | null>(null)
  const intervalId   = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const latestGps    = useRef<GpsState>(gps)
  const prevLatLng   = useRef<{ lat: number; lng: number } | null>(null)
  const wakeLock     = useRef<WakeLockSentinel | null>(null)
  latestGps.current  = gps

  /* ── load user + family on mount ── */
  useEffect(() => {
    getBatteryPercent(navigator as never).then(setBattery)

    const user = getUser()
    if (user) setUserName(user.name)

    const token = getToken()
    if (!token) return

    // auto-detect family if not in query param
    fetch(`${API_BASE}/families/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.id) {
          setFamilyId(data.id)
          setFamilyName(data.name || 'My Family')
        }
      })
      .catch(() => {})
  }, [])

  /* ── online/offline ── */
  useEffect(() => {
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  /* ── screen wake lock ── */
  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock.current = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
      }
    } catch { /* not supported */ }
  }

  function releaseWakeLock() {
    wakeLock.current?.release().catch(() => {})
    wakeLock.current = null
  }

  /* ── send location ── */
  const sendLocation = useCallback(async (loc: GpsState) => {
    if (!loc.lat || !loc.lng) return
    const token = typeof window !== 'undefined' ? (localStorage.getItem('gv_token') || '') : ''
    const fid = familyId || 1

    // track distance
    if (prevLatLng.current) {
      const d = haversineKm(prevLatLng.current.lat, prevLatLng.current.lng, loc.lat, loc.lng)
      setDistanceKm((prev) => prev + d)
    }
    prevLatLng.current = { lat: loc.lat, lng: loc.lng }

    try {
      const res = await fetch(`${API_BASE}/location/update?family_id=${fid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          lat:      loc.lat,
          lng:      loc.lng,
          accuracy: loc.accuracy,
          speed:    loc.speed,
          heading:  loc.heading,
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
      setError('Network error — will retry')
    }
  }, [battery, familyId])

  /* ── start tracking ── */
  function startTracking() {
    setError(null)
    setIsAcquiring(true)
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device')
      return
    }

    requestWakeLock()

    // First get a quick fix, then watch for updates
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: GpsState = {
          lat:       pos.coords.latitude,
          lng:       pos.coords.longitude,
          accuracy:  pos.coords.accuracy,
          speed:     pos.coords.speed,
          heading:   pos.coords.heading,
          altitude:  pos.coords.altitude,
          timestamp: pos.timestamp,
        }
        setGps(loc)
        if (pos.coords.accuracy <= GOOD_ACCURACY_M) setIsAcquiring(false)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )

    // Then continuously watch — high accuracy, fresh readings
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc: GpsState = {
          lat:       pos.coords.latitude,
          lng:       pos.coords.longitude,
          accuracy:  pos.coords.accuracy,
          speed:     pos.coords.speed,
          heading:   pos.coords.heading,
          altitude:  pos.coords.altitude,
          timestamp: pos.timestamp,
        }
        setGps(loc)
        // stop "acquiring" animation once accuracy is good
        if (pos.coords.accuracy <= GOOD_ACCURACY_M) setIsAcquiring(false)
      },
      (err) => {
        setIsAcquiring(false)
        if (err.code === 1)      setError('Location permission denied — allow in browser settings')
        else if (err.code === 2) setError('Location unavailable — check GPS signal')
        else                     setError('GPS timeout — retrying…')
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    )

    setIsSharing(true)
    const now = new Date()
    setStartTime(now)
    setDistanceKm(0)
    prevLatLng.current = null

    // elapsed timer
    elapsedRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)

    // send first update after 2s (let GPS acquire), then every interval
    setTimeout(() => sendLocation(latestGps.current), 2000)
    intervalId.current = setInterval(() => sendLocation(latestGps.current), UPDATE_INTERVAL_MS)
  }

  function stopTracking() {
    if (watchId.current !== null)  navigator.geolocation.clearWatch(watchId.current)
    if (intervalId.current !== null) clearInterval(intervalId.current)
    if (elapsedRef.current !== null) clearInterval(elapsedRef.current)
    releaseWakeLock()
    watchId.current  = null
    intervalId.current = null
    elapsedRef.current = null
    setIsSharing(false)
    setIsAcquiring(false)
    setElapsed(0)
    setStartTime(null)
  }

  useEffect(() => () => stopTracking(), [])

  const activityLabel = getActivity(gps.speed)
  const speedKmh = gps.speed !== null ? Math.round(gps.speed * 3.6) : null
  const q = getGpsQuality(gps.accuracy)

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-8 px-4"
      style={{ background: 'linear-gradient(160deg, #0B0D13 0%, #111420 60%, #0d1020 100%)' }}
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mb-6 text-center"
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-3"
          style={{ background: 'rgba(212,168,83,0.12)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.25)' }}
        >
          <Navigation className="w-3.5 h-3.5" />
          GRAVITY Live Tracker
        </div>
        <h1 className="text-xl font-extrabold text-white mb-0.5">
          {userName ? `Hi, ${userName.split(' ')[0]}` : 'Share Location'}
        </h1>
        {familyName && (
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <Users className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Sharing with <span style={{ color: '#D4A853' }}>{familyName}</span>
            </p>
          </div>
        )}
      </motion.div>

      {/* ── Status card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-3xl p-5 mb-4"
        style={{ background: '#111420', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Live indicator + online status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: isSharing ? '#22c55e' : '#6b7280' }}
              animate={isSharing ? { scale: [1, 1.3, 1], opacity: [1, 0.5, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
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

        {/* GPS Quality */}
        {(isSharing || gps.lat) && (
          <GpsQualityCard accuracy={gps.accuracy} isAcquiring={isAcquiring} />
        )}

        {/* Coordinates */}
        <div
          className="rounded-2xl p-4 mb-4 text-center"
          style={{ background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.15)' }}
        >
          {gps.lat ? (
            <>
              <p className="text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Current Coordinates
              </p>
              <p className="font-mono text-sm font-bold" style={{ color: '#D4A853' }}>
                {gps.lat.toFixed(6)}, {gps.lng!.toFixed(6)}
              </p>
              {gps.heading !== null && (
                <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <Compass className="w-3 h-3 inline mr-1" />
                  Heading: {Math.round(gps.heading)}°
                </p>
              )}
            </>
          ) : isSharing ? (
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              >
                <Navigation className="w-5 h-5" style={{ color: '#D4A853' }} />
              </motion.div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Acquiring GPS signal…
              </p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Go outdoors for faster lock
              </p>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Tap "Start Sharing" to begin
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <StatusChip
            icon={Activity}
            label="Activity"
            value={getActivityEmoji(activityLabel)}
            sub={activityLabel}
          />
          <StatusChip
            icon={Zap}
            label="Speed"
            value={speedKmh !== null ? `${speedKmh}` : '—'}
            sub={speedKmh !== null ? 'km/h' : ''}
          />
          <StatusChip
            icon={Battery}
            label="Battery"
            value={battery !== null ? `${battery}%` : '—'}
            color={battery !== null && battery < 20 ? '#ef4444' : battery !== null && battery < 40 ? '#f59e0b' : '#D4A853'}
          />
          <StatusChip
            icon={MapPin}
            label="Altitude"
            value={gps.altitude !== null ? `${Math.round(gps.altitude)}` : '—'}
            sub={gps.altitude !== null ? 'm' : ''}
          />
        </div>

        {/* Session stats (while sharing) */}
        {isSharing && startTime && (
          <div
            className="grid grid-cols-2 gap-2 mb-4"
          >
            <div
              className="rounded-xl px-3 py-2 flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <TrendingUp className="w-3.5 h-3.5" style={{ color: '#a855f7' }} />
              <div>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Distance</p>
                <p className="text-xs font-bold" style={{ color: '#a855f7' }}>
                  {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(2)}km`}
                </p>
              </div>
            </div>
            <div
              className="rounded-xl px-3 py-2 flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Navigation className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />
              <div>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Duration</p>
                <p className="text-xs font-bold" style={{ color: '#3b82f6' }}>
                  {formatDuration(elapsed * 1000)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Last sent */}
        <AnimatePresence>
          {lastSent && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl"
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
              className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start / Stop */}
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
        <SosButton lat={gps.lat} lng={gps.lng} familyId={familyId || 1} />
      </div>

      {/* ── Privacy note ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm text-center pb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Shield className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Location shared only with your family circle
          </span>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Updates every 8s · Screen stays on while tracking · End-to-end encrypted
        </p>
      </motion.div>
    </div>
  )
}

export default function TrackPage() { return <Suspense fallback={null}><TrackInner /></Suspense> }
