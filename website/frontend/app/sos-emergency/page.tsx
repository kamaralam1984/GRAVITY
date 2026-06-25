'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Navigation,
  Clock,
  Shield,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { getToken } from '@/lib/auth';

/* ─── Config ────────────────────────────────────────────────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const HOLD_DURATION_MS = 3000;

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface Coords {
  lat: number;
  lng: number;
}

type PageState = 'idle' | 'holding' | 'triggered' | 'sent' | 'error';

interface SOSResult {
  id: number;
  status: string;
  timestamp: string;
  coords: Coords;
}

/* ─── Static emergency contacts (no API for this yet) ──────────────────────── */
const EMERGENCY_NUMBERS = [
  { label: 'Police', number: '100', color: '#3B82F6' },
  { label: 'Ambulance', number: '108', color: '#EF4444' },
  { label: 'Fire', number: '101', color: '#F97316' },
  { label: 'Women Helpline', number: '1091', color: '#A855F7' },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function SOSEmergencyPage() {
  const [pageState, setPageState] = useState<PageState>('idle');
  const [holdProgress, setHoldProgress] = useState(0); // 0–100
  const [countdown, setCountdown] = useState(3);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<number | null>(null);
  const [sosResult, setSosResult] = useState<SOSResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const holdStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const holdActiveRef = useRef(false);
  const pageStateRef = useRef<PageState>('idle');

  // Keep ref in sync with state so callbacks can read it without stale closure
  useEffect(() => {
    pageStateRef.current = pageState;
  }, [pageState]);

  /* ── Fetch GPS on mount ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setLocationError(`Location unavailable: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  /* ── Fetch family_id on mount ─────────────────────────────────────────────── */
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE}/families/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: Array<{ id: number; name: string }>) => {
        if (Array.isArray(data) && data.length > 0) {
          setFamilyId(data[0].id);
        }
      })
      .catch(() => {
        // Non-fatal — we'll show error on SOS trigger if still null
      });
  }, []);

  /* ── SOS API call ─────────────────────────────────────────────────────────── */
  const triggerSOS = useCallback(
    async (currentCoords: Coords | null, currentFamilyId: number | null) => {
      const token = getToken();
      if (!token) {
        setErrorMessage('You are not logged in. Please sign in first.');
        setPageState('error');
        return;
      }
      if (currentFamilyId === null) {
        setErrorMessage(
          'Could not determine your family. Please ensure you are part of a family group.'
        );
        setPageState('error');
        return;
      }

      // Get fresh coords if we don't have them yet
      let finalCoords = currentCoords;
      if (!finalCoords) {
        try {
          finalCoords = await new Promise<Coords>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              reject,
              { enableHighAccuracy: true, timeout: 5000 }
            );
          });
          setCoords(finalCoords);
        } catch {
          // Proceed without coords — backend allows null
        }
      }

      try {
        const res = await fetch(`${API_BASE}/sos/trigger`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            family_id: currentFamilyId,
            lat: finalCoords?.lat ?? null,
            lng: finalCoords?.lng ?? null,
            message: 'Emergency SOS triggered via KVL Track app',
          }),
        });

        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          throw new Error((detail as { detail?: string }).detail ?? `HTTP ${res.status}`);
        }

        const result = (await res.json()) as { id: number; status: string };
        setSosResult({
          id: result.id,
          status: result.status,
          timestamp: new Date().toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'medium',
          }),
          coords: finalCoords ?? { lat: 0, lng: 0 },
        });
        setPageState('sent');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setErrorMessage(`Failed to send SOS: ${msg}`);
        setPageState('error');
      }
    },
    []
  );

  /* ── Hold animation loop ──────────────────────────────────────────────────── */
  const startHoldLoop = useCallback(
    (capturedCoords: Coords | null, capturedFamilyId: number | null) => {
      holdStartRef.current = performance.now();

      const tick = () => {
        if (!holdActiveRef.current || holdStartRef.current === null) return;
        const elapsed = performance.now() - holdStartRef.current;
        const pct = Math.min((elapsed / HOLD_DURATION_MS) * 100, 100);
        const secs = Math.max(1, Math.ceil(3 - (elapsed / HOLD_DURATION_MS) * 3));
        setHoldProgress(pct);
        setCountdown(secs);

        if (pct < 100) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          // Hold complete — trigger SOS
          setPageState('triggered');
          triggerSOS(capturedCoords, capturedFamilyId);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [triggerSOS]
  );

  /* ── Pointer / touch handlers ─────────────────────────────────────────────── */
  const handlePressStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (pageStateRef.current !== 'idle') return;
      holdActiveRef.current = true;
      setPageState('holding');
      setHoldProgress(0);
      setCountdown(3);
      // Capture current values to pass into the RAF loop
      startHoldLoop(coords, familyId);
    },
    [coords, familyId, startHoldLoop]
  );

  const handlePressEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!holdActiveRef.current) return;
    holdActiveRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    holdStartRef.current = null;
    if (pageStateRef.current === 'holding') {
      setPageState('idle');
      setHoldProgress(0);
      setCountdown(3);
    }
  }, []);

  /* ── Cancel SOS ───────────────────────────────────────────────────────────── */
  const cancelSOS = useCallback(async () => {
    if (sosResult) {
      const token = getToken();
      if (token) {
        try {
          await fetch(`${API_BASE}/sos/${sosResult.id}/resolve`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {
          // Gracefully ignore
        }
      }
    }
    setPageState('idle');
    setSosResult(null);
    setHoldProgress(0);
    setCountdown(3);
  }, [sosResult]);

  /* ── Computed ring circumference for SVG progress ───────────────────────── */
  const RADIUS = 90;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - holdProgress / 100);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0d 0%, #0d0405 50%, #0a0a0d 100%)',
        color: '#fff',
        fontFamily: 'var(--font-body, system-ui, sans-serif)',
        overscrollBehavior: 'none',
      }}
    >
      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(10,10,13,0.8)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'rgba(255,255,255,0.6)',
            textDecoration: 'none',
            fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={18} /> Dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} style={{ color: '#EF4444' }} />
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Emergency SOS</span>
        </div>
        <div style={{ width: 90 }} />
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* ── Location bar ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            padding: '10px 16px',
            marginBottom: 40,
            fontSize: '0.85rem',
          }}
        >
          <Navigation size={15} style={{ color: coords ? '#10B981' : '#6B7280', flexShrink: 0 }} />
          {coords ? (
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </span>
          ) : locationError ? (
            <span style={{ color: '#F59E0B' }}>{locationError}</span>
          ) : (
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Acquiring GPS location…</span>
          )}
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════
            STATE: IDLE or HOLDING — SOS button
        ══════════════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {(pageState === 'idle' || pageState === 'holding') && (
            <motion.div
              key="sos-button-area"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'center' }}
            >
              <p
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.9rem',
                  marginBottom: 40,
                  lineHeight: 1.6,
                }}
              >
                {pageState === 'holding'
                  ? 'Keep holding…'
                  : 'Hold the button for 3 seconds to send an emergency alert to your family.'}
              </p>

              {/* SOS button with SVG ring */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 32,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              >
                <div style={{ position: 'relative', width: 220, height: 220 }}>
                  {/* Pulse rings when idle */}
                  {pageState === 'idle' &&
                    [1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.5 + i * 0.25], opacity: [0.4, 0] }}
                        transition={{
                          duration: 2.5,
                          delay: i * 0.5,
                          repeat: Infinity,
                          ease: 'easeOut',
                        }}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: '50%',
                          border: '2px solid rgba(239,68,68,0.5)',
                          pointerEvents: 'none',
                        }}
                      />
                    ))}

                  {/* SVG progress ring */}
                  <svg
                    width="220"
                    height="220"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      transform: 'rotate(-90deg)',
                    }}
                  >
                    <circle
                      cx="110"
                      cy="110"
                      r={RADIUS}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="110"
                      cy="110"
                      r={RADIUS}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                    />
                  </svg>

                  {/* The actual button */}
                  <button
                    onMouseDown={handlePressStart}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onTouchStart={handlePressStart}
                    onTouchEnd={handlePressEnd}
                    onTouchCancel={handlePressEnd}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 160,
                      height: 160,
                      borderRadius: '50%',
                      background:
                        pageState === 'holding'
                          ? 'radial-gradient(circle, #dc2626, #991b1b)'
                          : 'radial-gradient(circle, #ef4444, #b91c1c)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      boxShadow:
                        pageState === 'holding'
                          ? '0 0 60px rgba(239,68,68,0.7), 0 0 120px rgba(239,68,68,0.3)'
                          : '0 0 40px rgba(239,68,68,0.4)',
                      transition: 'box-shadow 0.15s ease, background 0.15s ease',
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'none',
                    }}
                    aria-label="Hold to send SOS"
                  >
                    <span
                      style={{
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: pageState === 'holding' ? '3rem' : '2.2rem',
                        lineHeight: 1,
                        letterSpacing: '0.05em',
                        transition: 'font-size 0.15s ease',
                        fontFamily: 'var(--font-display, system-ui)',
                      }}
                    >
                      {pageState === 'holding' ? countdown : 'SOS'}
                    </span>
                    {pageState === 'idle' && (
                      <span
                        style={{
                          color: 'rgba(255,255,255,0.75)',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      >
                        Hold 3s
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {pageState === 'holding' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ color: '#EF4444', fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}
                >
                  Sending SOS in {countdown}…
                </motion.p>
              )}

              {pageState === 'idle' && (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: 8 }}>
                  Release before 3 seconds to cancel
                </p>
              )}
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STATE: TRIGGERED — sending animation
          ══════════════════════════════════════════════════════════════════ */}
          {pageState === 'triggered' && (
            <motion.div
              key="sending"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '40px 0' }}
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(239,68,68,0.15)',
                  border: '2px solid #EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <AlertCircle size={48} style={{ color: '#EF4444' }} />
              </motion.div>
              <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.6rem', marginBottom: 8 }}>
                Sending SOS…
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
                Contacting your family circle
              </p>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STATE: SENT — success confirmation
          ══════════════════════════════════════════════════════════════════ */}
          {pageState === 'sent' && sosResult && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 20,
                  padding: '32px 28px',
                  marginBottom: 24,
                  textAlign: 'center',
                }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  style={{ marginBottom: 20 }}
                >
                  <CheckCircle size={72} style={{ color: '#10B981', margin: '0 auto' }} />
                </motion.div>

                <h2
                  style={{
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '1.8rem',
                    marginBottom: 8,
                    fontFamily: 'var(--font-display, system-ui)',
                  }}
                >
                  SOS Alert Sent
                </h2>
                <p style={{ color: '#10B981', fontWeight: 600, fontSize: '1rem', marginBottom: 24 }}>
                  Your family has been notified
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 10,
                      padding: '12px 16px',
                    }}
                  >
                    <Clock size={18} style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                    <div>
                      <div
                        style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: 2 }}
                      >
                        Time sent
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                        {sosResult.timestamp}
                      </div>
                    </div>
                  </div>

                  {sosResult.coords.lat !== 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 10,
                        padding: '12px 16px',
                      }}
                    >
                      <MapPin size={18} style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                      <div>
                        <div
                          style={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '0.75rem',
                            marginBottom: 2,
                          }}
                        >
                          Location shared
                        </div>
                        <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                          {sosResult.coords.lat.toFixed(5)}, {sosResult.coords.lng.toFixed(5)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 10,
                      padding: '12px 16px',
                    }}
                  >
                    <Users size={18} style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                    <div>
                      <div
                        style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: 2 }}
                      >
                        Alert ID
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                        #{sosResult.id}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={cancelSOS}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#EF4444',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <XCircle size={18} />
                Cancel / Mark Resolved
              </button>

              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textAlign: 'center' }}>
                Cancelling will notify your family the emergency is resolved
              </p>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STATE: ERROR
          ══════════════════════════════════════════════════════════════════ */}
          {pageState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 20,
                padding: '32px 28px',
                textAlign: 'center',
                marginBottom: 24,
              }}
            >
              <XCircle size={56} style={{ color: '#EF4444', margin: '0 auto 16px' }} />
              <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', marginBottom: 8 }}>
                SOS Failed
              </h2>
              <p
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.9rem',
                  marginBottom: 24,
                  lineHeight: 1.6,
                }}
              >
                {errorMessage}
              </p>
              <button
                onClick={() => {
                  setPageState('idle');
                  setHoldProgress(0);
                  setCountdown(3);
                  setErrorMessage('');
                }}
                style={{
                  background: '#EF4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 28px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Emergency numbers ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ marginTop: pageState === 'idle' || pageState === 'holding' ? 48 : 32 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Phone size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Emergency Helplines
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
            }}
          >
            {EMERGENCY_NUMBERS.map((contact) => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: `${contact.color}1a`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Phone size={15} style={{ color: contact.color }} />
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                    {contact.number}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                    {contact.label}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* ── Info note ─────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: 32,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <AlertCircle
            size={16}
            style={{ color: 'rgba(255,255,255,0.3)', marginTop: 2, flexShrink: 0 }}
          />
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', lineHeight: 1.65, margin: 0 }}>
            Triggering SOS sends your GPS location and a live tracking link to all members of your
            family circle via push notification. Use only in genuine emergencies.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
