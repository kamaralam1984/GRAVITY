'use client'
import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Camera, CameraOff, Monitor, X, Clock, BarChart2, ChevronDown } from 'lucide-react'
import { getToken, getUser } from '@/lib/auth'

interface Props {
  child: { user_id: number; name: string; role: string }
  famId: number
  onClose: () => void
}

const STUN = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }

interface LogEntry { section: string; duration_seconds: number; logged_at: string }

export default function ChildMonitorPanel({ child, famId, onClose }: Props) {
  const wsRef = useRef<WebSocket | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [activeMode, setActiveMode] = useState<'mic' | 'camera' | 'screen' | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [showLogs, setShowLogs] = useState(false)
  const [wsReady, setWsReady] = useState(false)
  const parentIdRef = useRef<string>('')

  useEffect(() => {
    const user = getUser()
    if (!user) return
    const userId = String(user.id)
    parentIdRef.current = userId

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.host
    const ws = new WebSocket(`${proto}://${host}/monitoring/ws/${famId}/${userId}`)
    wsRef.current = ws

    ws.onopen = () => setWsReady(true)
    ws.onclose = () => { setWsReady(false); stopMonitoring() }

    ws.onmessage = async (evt) => {
      let msg: any
      try { msg = JSON.parse(evt.data) } catch { return }
      if (msg.type === 'offer') {
        await handleOffer(msg.sdp, String(child.user_id))
      } else if (msg.type === 'ice' && pcRef.current) {
        try { await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.candidate)) } catch {}
      }
    }

    return () => { ws.close(); stopMonitoring() }
  }, [famId, child.user_id])

  async function handleOffer(sdp: RTCSessionDescriptionInit, targetId: string) {
    if (pcRef.current) pcRef.current.close()
    const pc = new RTCPeerConnection(STUN)
    pcRef.current = pc

    pc.onicecandidate = (e) => {
      if (e.candidate && wsRef.current?.readyState === 1) {
        wsRef.current.send(JSON.stringify({ type: 'ice', candidate: e.candidate, target: targetId }))
      }
    }

    pc.ontrack = (e) => {
      const stream = e.streams[0]
      if (activeMode === 'mic') {
        if (audioRef.current) { audioRef.current.srcObject = stream; audioRef.current.play().catch(() => {}) }
      } else {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}) }
      }
    }

    await pc.setRemoteDescription(new RTCSessionDescription(sdp))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    wsRef.current?.send(JSON.stringify({ type: 'answer', sdp: pc.localDescription, target: targetId }))
  }

  function sendRequest(type: 'mic' | 'camera' | 'screen') {
    if (!wsRef.current || wsRef.current.readyState !== 1) return
    stopMonitoring()
    setActiveMode(type)
    wsRef.current.send(JSON.stringify({
      type: `request_${type}`,
      from: getUser()?.name ?? 'Parent',
      fromId: parentIdRef.current,
      target: String(child.user_id),
    }))
  }

  function stopMonitoring() {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'stop_monitoring', target: String(child.user_id) }))
    }
    pcRef.current?.close(); pcRef.current = null
    if (audioRef.current) { audioRef.current.srcObject = null }
    if (videoRef.current) { videoRef.current.srcObject = null }
    setActiveMode(null)
  }

  async function fetchLogs() {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch(`/monitoring/activity/${child.user_id}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setLogs(data.logs ?? [])
    } catch {}
  }

  function formatSec(s: number) {
    if (s < 60) return `${s}s`
    if (s < 3600) return `${Math.round(s / 60)}m`
    return `${(s / 3600).toFixed(1)}h`
  }

  const sectionColor: Record<string, string> = {
    home: '#10B981', health: '#EF4444', map: '#3B82F6', chat: '#8B5CF6',
    school: '#F59E0B', safety: '#EF4444', default: '#6B7280',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end',
      backdropFilter: 'blur(12px)',
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxHeight: '90vh', overflowY: 'auto',
        background: 'linear-gradient(180deg, #0f1117 0%, #0B0D13 100%)',
        borderRadius: '28px 28px 0 0',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '24px 20px 40px',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>👤 {child.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>Remote Monitoring</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Connection status */}
        {!wsReady && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, color: '#EF4444', fontSize: 13 }}>
            ⚠️ No connection to child device — child must have Gravity app open
          </div>
        )}

        {/* Control Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { mode: 'mic' as const, icon: <Mic size={22} />, label: 'Listen Mic', color: '#10B981' },
            { mode: 'camera' as const, icon: <Camera size={22} />, label: 'Camera', color: '#3B82F6' },
            { mode: 'screen' as const, icon: <Monitor size={22} />, label: 'Screen', color: '#8B5CF6' },
          ].map(({ mode, icon, label, color }) => (
            <button key={mode}
              onClick={() => activeMode === mode ? stopMonitoring() : sendRequest(mode)}
              style={{
                padding: '16px 8px', borderRadius: 16, cursor: 'pointer',
                background: activeMode === mode ? `${color}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeMode === mode ? color : 'rgba(255,255,255,0.1)'}`,
                color: activeMode === mode ? color : 'rgba(255,255,255,0.6)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
              }}>
              {icon}
              {activeMode === mode ? 'Stop' : label}
              {activeMode === mode && (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, animation: 'pulse 1s infinite' }} />
              )}
            </button>
          ))}
        </div>

        {/* Audio element (hidden) */}
        <audio ref={audioRef} style={{ display: 'none' }} />

        {/* Video display */}
        {(activeMode === 'camera' || activeMode === 'screen') && (
          <div style={{ borderRadius: 16, overflow: 'hidden', background: '#000', marginBottom: 16, position: 'relative' }}>
            <video ref={videoRef} autoPlay playsInline muted={false}
              style={{ width: '100%', maxHeight: 260, objectFit: 'contain', display: 'block' }} />
            {!videoRef.current?.srcObject && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                Connecting...
              </div>
            )}
          </div>
        )}

        {/* Mic active indicator */}
        {activeMode === 'mic' && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Mic size={20} color="#10B981" />
            <div>
              <div style={{ color: '#10B981', fontWeight: 600, fontSize: 14 }}>Listening to mic</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Child audio is streaming — press Stop to end</div>
            </div>
          </div>
        )}

        {/* Activity Logs */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => { setShowLogs(!showLogs); if (!showLogs) fetchLogs() }}
            style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart2 size={16} color="#D4A853" />
              <span style={{ fontWeight: 600, fontSize: 14 }}>App Activity Log</span>
            </div>
            <ChevronDown size={16} color="rgba(255,255,255,0.4)" style={{ transform: showLogs ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {showLogs && (
            <div style={{ padding: '0 16px 16px', maxHeight: 300, overflowY: 'auto' }}>
              {logs.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  No activity logs yet
                </div>
              ) : logs.map((log, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: sectionColor[log.section] ?? sectionColor.default }} />
                    <span style={{ color: '#fff', fontSize: 13, textTransform: 'capitalize' }}>{log.section}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: '#D4A853', fontSize: 13, fontWeight: 600 }}>{formatSec(log.duration_seconds)}</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{log.logged_at.slice(11, 16)} UTC</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
