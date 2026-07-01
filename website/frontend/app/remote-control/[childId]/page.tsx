'use client'

// Remote Control / Screen Mirror viewer.
//
// NOTE (dual purpose): this is a plain authenticated web page rendering a live
// <img> feed over a normal HTTP(S) connection, so it inherently *also* works as
// a "cast to TV" viewer — open this same URL with `?readonly=1` in any smart
// TV / browser to get a read-only, chrome-free live view with no control
// affordances. No separate cast feature needed.
//
// Flow:
//   1. On mount: send `screen_mirror_start` command to the child device.
//   2. Open /ws/view/screen/{childId} to receive live JPEG frames.
//   3. Open /ws/control?target={childId} to send tap/swipe/key gestures
//      (skipped entirely when readonly=1).
//   4. On unmount: send `screen_mirror_stop`.

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Wifi, WifiOff, Loader2, ArrowLeftCircle, Home, Square } from 'lucide-react'
import { getToken, getUser } from '@/lib/auth'
import { commandsApi } from '@/lib/api'

type ConnStatus = 'connecting' | 'waiting' | 'live' | 'offline' | 'error'

function getWsBase(): string {
  if (typeof window === 'undefined') return 'ws://localhost:8000'
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}`
}

export default function RemoteControlChildPage({ params }: { params: { childId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const readonly = searchParams.get('readonly') === '1'

  const childId = Number(params.childId)

  const [viewStatus, setViewStatus] = useState<ConnStatus>('connecting')
  const [controlStatus, setControlStatus] = useState<ConnStatus>('connecting')
  const [frameUrl, setFrameUrl] = useState<string | null>(null)

  const viewWsRef = useRef<WebSocket | null>(null)
  const controlWsRef = useRef<WebSocket | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const currentFrameUrl = useRef<string | null>(null)

  // ── Auth guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    const token = getToken()
    const user = getUser()
    if (!token || !user) {
      router.replace(`/login?redirect=/remote-control/${params.childId}`)
    }
  }, [router, params.childId])

  // ── Start / stop screen mirroring on the child device ────────────────────
  useEffect(() => {
    if (!childId) return
    commandsApi.send(childId, 'screen_mirror_start').catch(() => { /* best-effort */ })

    return () => {
      commandsApi.send(childId, 'screen_mirror_stop').catch(() => { /* best-effort */ })
    }
  }, [childId])

  // ── Viewer websocket: receive live screen frames ──────────────────────────
  useEffect(() => {
    if (!childId) return
    const token = getToken()
    if (!token) return

    let cancelled = false
    const ws = new WebSocket(`${getWsBase()}/ws/view/screen/${childId}?token=${encodeURIComponent(token)}`)
    viewWsRef.current = ws

    ws.onopen = () => {
      if (!cancelled) setViewStatus('connecting')
    }

    ws.onmessage = (evt) => {
      if (cancelled) return
      try {
        const msg = JSON.parse(evt.data)
        if (msg.type === 'connected') {
          setViewStatus('connecting')
        } else if (msg.type === 'active' || msg.type === 'child_ready') {
          setViewStatus('live')
        } else if (msg.type === 'waiting' || msg.type === 'child_offline') {
          setViewStatus('waiting')
        } else if (msg.type === 'screen' && msg.data) {
          setViewStatus('live')
          const url = `data:image/jpeg;base64,${msg.data}`
          const prev = currentFrameUrl.current
          currentFrameUrl.current = url
          setFrameUrl(url)
          // Revoking not needed for data URLs; kept simple for maintainability.
          void prev
        } else if (msg.type === 'ping') {
          // keepalive, ignore
        }
      } catch {
        // ignore malformed frame
      }
    }

    ws.onerror = () => {
      if (!cancelled) setViewStatus('error')
    }

    ws.onclose = () => {
      if (!cancelled) setViewStatus((s) => (s === 'live' ? 'waiting' : s))
    }

    return () => {
      cancelled = true
      try { ws.close() } catch { /* ignore */ }
      viewWsRef.current = null
    }
  }, [childId])

  // ── Control websocket: send gestures (skipped in readonly/cast mode) ─────
  useEffect(() => {
    if (readonly || !childId) return
    const token = getToken()
    if (!token) return

    let cancelled = false
    const ws = new WebSocket(`${getWsBase()}/ws/control?token=${encodeURIComponent(token)}&target=${childId}`)
    controlWsRef.current = ws

    ws.onopen = () => {
      if (!cancelled) setControlStatus('connecting')
    }

    ws.onmessage = (evt) => {
      if (cancelled) return
      try {
        const msg = JSON.parse(evt.data)
        if (msg.type === 'child_ready') setControlStatus('live')
        else if (msg.type === 'child_offline') setControlStatus('offline')
      } catch { /* ignore */ }
    }

    ws.onerror = () => { if (!cancelled) setControlStatus('error') }
    ws.onclose = () => { if (!cancelled) setControlStatus('offline') }

    return () => {
      cancelled = true
      try { ws.close() } catch { /* ignore */ }
      controlWsRef.current = null
    }
  }, [readonly, childId])

  // ── Gesture helpers ────────────────────────────────────────────────────────
  const sendControlMsg = useCallback((payload: Record<string, unknown>) => {
    const ws = controlWsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload))
    }
  }, [])

  const normalizedCoords = useCallback((clientX: number, clientY: number) => {
    const el = imgRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
    return { x, y }
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLImageElement>) => {
    if (readonly) return
    const coords = normalizedCoords(e.clientX, e.clientY)
    if (coords) dragStart.current = coords
  }, [readonly, normalizedCoords])

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLImageElement>) => {
    if (readonly) return
    const start = dragStart.current
    dragStart.current = null
    const end = normalizedCoords(e.clientX, e.clientY)
    if (!start || !end) return

    const dist = Math.hypot(end.x - start.x, end.y - start.y)
    if (dist < 0.02) {
      // Treated as a tap
      sendControlMsg({ type: 'tap', x: end.x, y: end.y })
    } else {
      // Treated as a swipe
      sendControlMsg({
        type: 'swipe',
        x1: start.x, y1: start.y,
        x2: end.x, y2: end.y,
        duration: 300,
      })
    }
  }, [readonly, normalizedCoords, sendControlMsg])

  const sendKey = useCallback((action: 'back' | 'home' | 'recents') => {
    sendControlMsg({ type: 'key', action })
  }, [sendControlMsg])

  // ── Status label ───────────────────────────────────────────────────────────
  const statusLabel = viewStatus === 'live'
    ? 'Live'
    : viewStatus === 'waiting'
      ? 'Child offline'
      : viewStatus === 'error'
        ? 'Connection error'
        : 'Connecting…'

  const statusColor = viewStatus === 'live' ? '#10B981' : viewStatus === 'error' ? '#EF4444' : 'rgba(255,255,255,0.5)'

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {!readonly && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Link href="/remote-control" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', textDecoration: 'none' }}>
            <ArrowLeft size={18} /> Back
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            {viewStatus === 'live' ? <Wifi size={16} color={statusColor} /> : <WifiOff size={16} color={statusColor} />}
            <span style={{ color: statusColor }}>{statusLabel}</span>
            {controlStatus === 'offline' && (
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>· control unavailable</span>
            )}
          </div>
        </div>
      )}

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', background: '#000',
      }}>
        {frameUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={frameUrl}
            alt="Live device screen"
            draggable={false}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            style={{
              maxWidth: '100%', maxHeight: '100%', userSelect: 'none',
              touchAction: 'none', cursor: readonly ? 'default' : 'pointer',
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.5)' }}>
            <Loader2 size={28} className="animate-spin" />
            <span>{statusLabel}</span>
          </div>
        )}
      </div>

      {!readonly && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24,
          padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <button onClick={() => sendKey('back')} style={navBtnStyle} aria-label="Back">
            <ArrowLeftCircle size={22} />
          </button>
          <button onClick={() => sendKey('home')} style={navBtnStyle} aria-label="Home">
            <Home size={22} />
          </button>
          <button onClick={() => sendKey('recents')} style={navBtnStyle} aria-label="Recents">
            <Square size={22} />
          </button>
        </div>
      )}
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '10px 20px',
  color: '#fff',
  cursor: 'pointer',
}
