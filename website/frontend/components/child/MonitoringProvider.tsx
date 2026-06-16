'use client'
import { useEffect, useRef, useState } from 'react'
import { getToken, getUser } from '@/lib/auth'

interface Props {
  famId: number | null
}

const STUN = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }

export default function MonitoringProvider({ famId }: Props) {
  const wsRef = useRef<WebSocket | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const [activeType, setActiveType] = useState<'mic' | 'camera' | 'screen' | null>(null)
  const [screenRequest, setScreenRequest] = useState<{ from: string; fromId: string } | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (!famId) return
    const user = getUser()
    const token = getToken()
    if (!user || !token) return

    const userId = String(user.id)
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.host
    const ws = new WebSocket(`${proto}://${host}/monitoring/ws/${famId}/${userId}`)
    wsRef.current = ws

    ws.onmessage = async (evt) => {
      let msg: any
      try { msg = JSON.parse(evt.data) } catch { return }

      if (msg.type === 'request_mic') {
        await startStream('mic', msg.from, msg.fromId)
      } else if (msg.type === 'request_camera') {
        await startStream('camera', msg.from, msg.fromId)
      } else if (msg.type === 'request_screen') {
        setScreenRequest({ from: msg.from ?? 'Parent', fromId: msg.fromId })
      } else if (msg.type === 'stop_monitoring') {
        stopStream()
      } else if (msg.type === 'answer' && pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.sdp))
      } else if (msg.type === 'ice' && pcRef.current) {
        try { await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.candidate)) } catch {}
      }
    }

    ws.onclose = () => { stopStream() }

    return () => {
      ws.close()
      stopStream()
    }
  }, [famId])

  function sendError(targetId: string, message: string) {
    wsRef.current?.send(JSON.stringify({ type: 'stream_error', message, target: targetId }))
  }

  async function startStream(type: 'mic' | 'camera' | 'screen', fromName: string, fromId: string) {
    stopStream()
    try {
      let stream: MediaStream
      if (type === 'mic') {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      } else if (type === 'camera') {
        // video + audio together; fallback to basic if facingMode not supported
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true })
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        }
      } else {
        return // screen handled separately
      }
      streamRef.current = stream
      setActiveType(type)
      await createPeerAndOffer(stream, fromId)
    } catch (err: any) {
      console.warn('Monitoring stream error:', err)
      sendError(fromId, err?.name === 'NotFoundError' ? 'Camera not found on this device' : err?.name === 'NotAllowedError' ? 'Camera permission denied' : 'Could not access camera')
    }
  }

  async function startScreen(fromId: string) {
    stopStream()
    setScreenRequest(null)
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: false })
      streamRef.current = stream
      setActiveType('screen')
      await createPeerAndOffer(stream, fromId)
      stream.getVideoTracks()[0].onended = () => { stopStream() }
    } catch (err: any) {
      const msg =
        err?.name === 'NotAllowedError' ? 'Screen share was denied or cancelled' :
        err?.name === 'NotSupportedError' ? 'Screen sharing not supported on this browser' :
        err?.name === 'NotReadableError' ? 'Could not capture screen — check OS/browser permissions' :
        err?.name === 'TypeError' ? 'Screen sharing not supported on this device' :
        'Could not share screen'
      sendError(fromId, msg)
    }
  }

  async function createPeerAndOffer(stream: MediaStream, targetId: string) {
    const pc = new RTCPeerConnection(STUN)
    pcRef.current = pc
    stream.getTracks().forEach(t => pc.addTrack(t, stream))
    pc.onicecandidate = (e) => {
      if (e.candidate && wsRef.current?.readyState === 1) {
        wsRef.current.send(JSON.stringify({ type: 'ice', candidate: e.candidate, target: targetId }))
      }
    }
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    wsRef.current?.send(JSON.stringify({ type: 'offer', sdp: pc.localDescription, target: targetId }))
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    pcRef.current?.close()
    pcRef.current = null
    setActiveType(null)
  }

  if (!activeType && !screenRequest) return null

  return (
    <>
      <style>{`
        @keyframes monitor-pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        .monitor-pulse { animation: monitor-pulse 2s ease-in-out infinite }
      `}</style>

      {/* Screen share request dialog */}
      {screenRequest && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
        }}>
          <div style={{ background: '#1a1a2e', borderRadius: 24, padding: 28, maxWidth: 320, width: '100%', border: '1px solid rgba(212,168,83,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🖥️</div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
              Screen Share Request
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 24 }}>
              <strong style={{ color: '#D4A853' }}>{screenRequest.from}</strong> wants to view your screen
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setScreenRequest(null)}
                style={{ flex: 1, padding: '12px', borderRadius: 50, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
                Deny
              </button>
              <button onClick={() => startScreen(screenRequest.fromId)}
                style={{ flex: 1, padding: '12px', borderRadius: 50, background: 'linear-gradient(135deg, #D4A853, #10B981)', border: 'none', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active monitoring indicator */}
      {activeType && (
        <div style={{
          position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: 'rgba(239,68,68,0.9)', borderRadius: 50,
          padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <div className="monitor-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
            {activeType === 'mic' ? '🎤 Mic live' : activeType === 'camera' ? '📷 Camera live' : '🖥️ Screen sharing'}
          </span>
          <button onClick={stopStream} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', padding: 0 }}>✕</button>
        </div>
      )}
    </>
  )
}
