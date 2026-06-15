'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  AlertTriangle,
  MapPin,
  Phone,
  X,
  Shield,
  Users,
  Navigation,
  Wifi,
  Home,
  School,
  Car,
  Check,
  Clock,
} from 'lucide-react';
import { getToken } from '@/lib/auth';

const UberFamilyMap = dynamic(() => import('@/components/shared/UberFamilyMap'), { ssr: false });

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  initials: string;
  color: string;
}

interface FamilyMember {
  id: string;
  name: string;
  initials: string;
  color: string;
  glowColor: string;
  angleDeg: number;
  distancePx: number;
  location: string;
  status: string;
  distanceKm: string;
  lastSeen: string;
}

interface VisitedPlace {
  id: string;
  name: string;
  time: string;
  distance: string;
  dotColor: string;
  icon: React.ReactNode;
}

interface Geofence {
  id: string;
  name: string;
  radius: string;
  inside: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const MEMBER_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

const EMERGENCY_CONTACT: Contact = {
  id: 'emergency',
  name: 'Emergency',
  relationship: 'Police 100',
  phone: '100',
  initials: '!',
  color: '#EF4444',
};


// ─────────────────────────────────────────────────────────────────────────────
// Helper: polar to cartesian (origin = center of 280px circle → 140px)
// ─────────────────────────────────────────────────────────────────────────────

function polarToXY(angleDeg: number, distancePx: number, center = 140) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: center + distancePx * Math.cos(rad),
    y: center + distancePx * Math.sin(rad),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SOSSection
// ─────────────────────────────────────────────────────────────────────────────

export function SOSSection({ familyId, userId }: { familyId?: number; userId?: number }) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [sentConfirmed, setSentConfirmed] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([EMERGENCY_CONTACT]);
  const [notifiedNames, setNotifiedNames] = useState<string[]>([]);

  useEffect(() => {
    if (!familyId) return;
    const token = getToken();
    fetch(`/families/${familyId}/members`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then((members: { user_id: number; name: string; phone?: string; role: string }[]) => {
        const others = members.filter(m => m.user_id !== userId);
        const mapped: Contact[] = others.map((m, i) => ({
          id: String(m.user_id),
          name: m.name,
          relationship: m.role === 'owner' ? 'Parent' : 'Family Member',
          phone: m.phone ?? '',
          initials: m.name[0]?.toUpperCase() ?? '?',
          color: MEMBER_COLORS[i % MEMBER_COLORS.length],
        }));
        setContacts([...mapped, EMERGENCY_CONTACT]);
        setNotifiedNames(others.map(m => m.name));
      })
      .catch(() => {});
  }, [familyId, userId]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setSosActive(true);
      setSentConfirmed(true);
      setCountdown(null);
      triggerSOSAlert();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleSOS() {
    if (sentConfirmed) return;
    setCountdown(3);
  }

  async function triggerSOSAlert() {
    if (!familyId) return;
    const token = getToken();
    try {
      navigator.geolocation?.getCurrentPosition(async (pos) => {
        await fetch('/sos/trigger', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ family_id: familyId, lat: pos.coords.latitude, lng: pos.coords.longitude, message: 'SOS Alert triggered' }),
        });
      }, async () => {
        await fetch('/sos/trigger', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ family_id: familyId, message: 'SOS Alert triggered' }),
        });
      });
    } catch { /* ignore */ }
  }

  function cancelSOS() {
    setCountdown(null);
    setSosActive(false);
  }

  function resetSOS() {
    setCountdown(null);
    setSosActive(false);
    setSentConfirmed(false);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(220,38,38,0.18) 0%, rgba(10,10,20,0) 70%), linear-gradient(180deg, #0A0A14 0%, #0F0F1E 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px 40px',
        gap: 0,
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* EMERGENCY header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 8,
          alignSelf: 'flex-start',
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#EF4444',
              boxShadow: '0 0 8px #EF4444',
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#EF4444',
              textTransform: 'uppercase',
            }}
          >
            Emergency
          </span>
        </div>
        <AlertTriangle size={18} color="#EF4444" />
      </div>

      <h1
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: '#FFFFFF',
          marginBottom: 4,
          alignSelf: 'flex-start',
        }}
      >
        SOS Alert
      </h1>
      <p
        style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.5)',
          alignSelf: 'flex-start',
          marginBottom: 48,
        }}
      >
        Press to instantly alert your family
      </p>

      {/* SOS Button area */}
      <div style={{ position: 'relative', width: 220, height: 220, marginBottom: 40 }}>
        {/* Pulsing rings */}
        {[0, 0.5, 1].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, delay, repeat: Infinity, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              margin: 'auto',
              width: 160,
              height: 160,
              borderRadius: '50%',
              border: '2px solid rgba(220,38,38,0.6)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        {/* Main SOS button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleSOS}
          disabled={countdown !== null || sentConfirmed}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: sentConfirmed
              ? 'linear-gradient(135deg, #059669, #065F46)'
              : 'linear-gradient(135deg, #DC2626, #991B1B)',
            border: 'none',
            cursor: countdown !== null || sentConfirmed ? 'default' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: sentConfirmed
              ? '0 0 60px rgba(5,150,105,0.5), 0 0 120px rgba(5,150,105,0.25)'
              : '0 0 60px rgba(220,38,38,0.5), 0 0 120px rgba(220,38,38,0.25)',
            transition: 'background 0.4s, box-shadow 0.4s',
            zIndex: 2,
          }}
        >
          <AnimatePresence mode="wait">
            {sentConfirmed ? (
              <motion.div
                key="confirmed"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
              >
                <Check size={40} color="white" strokeWidth={3} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>SENT</span>
              </motion.div>
            ) : countdown !== null ? (
              <motion.span
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                style={{ fontSize: 56, fontWeight: 900, color: 'white', lineHeight: 1 }}
              >
                {countdown}
              </motion.span>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
              >
                <Phone size={24} color="white" />
                <span style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '0.05em' }}>SOS</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Cancel / Reset controls */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 32 }}
          >
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Sending alert in {countdown}...</p>
            <button
              onClick={cancelSOS}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 24px',
                borderRadius: 40,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <X size={14} />
              Hold to cancel
            </button>
          </motion.div>
        )}

        {sentConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            style={{
              width: '100%',
              maxWidth: 360,
              background: 'rgba(5,150,105,0.12)',
              border: '1px solid rgba(5,150,105,0.35)',
              borderRadius: 16,
              padding: '20px 24px',
              marginBottom: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={16} color="#10B981" />
              <span style={{ color: '#10B981', fontWeight: 700, fontSize: 14 }}>Alert Sent to Family</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(notifiedNames.length > 0 ? notifiedNames : ['Family']).map((name) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#10B981',
                    }}
                  />
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{name} notified</span>
                </div>
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>
              They are on their way. Stay calm and stay where you are.
            </p>
            <button
              onClick={resetSOS}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 12,
                cursor: 'pointer',
                alignSelf: 'flex-start',
              }}
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick contacts */}
      <div style={{ width: '100%', maxWidth: 400, marginBottom: 32 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Quick Contacts
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {contacts.map((contact) => (
            <motion.div
              key={contact.id}
              whileHover={{ scale: 1.02, borderColor: contact.color + '66' }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                transition: 'border-color 0.2s',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: contact.color + '22',
                  border: `2px solid ${contact.color}55`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 800,
                  color: contact.color,
                  flexShrink: 0,
                }}
              >
                {contact.initials}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'white' }}>{contact.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  {contact.relationship}{contact.phone ? ` · ${contact.phone}` : ''}
                </p>
              </div>
              {/* Call button */}
              <motion.a
                href={contact.phone ? `tel:${contact.phone.replace(/\s+/g, '')}` : undefined}
                whileTap={{ scale: 0.94 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '7px 14px',
                  borderRadius: 20,
                  background: '#10B98120',
                  border: '1px solid #10B98155',
                  color: '#10B981',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                  textDecoration: 'none',
                  opacity: contact.phone ? 1 : 0.4,
                }}
              >
                <Phone size={12} />
                Call
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Safety tip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 40,
          maxWidth: 340,
          width: '100%',
        }}
      >
        <Shield size={14} color="#10B981" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>
          Your location is being shared with family
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LocationSection
// ─────────────────────────────────────────────────────────────────────────────

export function LocationSection() {
  const [pinPulse, setPinPulse] = useState(true);

  const visitedPlaces: VisitedPlace[] = [
    {
      id: 'home',
      name: 'Home',
      time: '8:00 AM',
      distance: '0.0 km',
      dotColor: '#10B981',
      icon: <Home size={14} color="#10B981" />,
    },
    {
      id: 'school',
      name: 'DPS School',
      time: '9:15 AM',
      distance: '2.3 km',
      dotColor: '#3B82F6',
      icon: <School size={14} color="#3B82F6" />,
    },
    {
      id: 'mall',
      name: 'City Mall',
      time: '4:40 PM',
      distance: '5.1 km',
      dotColor: '#F59E0B',
      icon: <Car size={14} color="#F59E0B" />,
    },
  ];

  const geofences: Geofence[] = [
    { id: 'home', name: 'Home Zone', radius: '200 m', inside: true },
    { id: 'school', name: 'School Zone', radius: '500 m', inside: false },
    { id: 'safe', name: 'Safe Area', radius: '1 km', inside: true },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0A0A14 0%, #0F0F1E 100%)',
        padding: '24px 16px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: 0 }}>My Location</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
            Real-time position tracking
          </p>
        </div>
        {/* Live badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 20,
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>LIVE</span>
        </div>
      </div>

      {/* Real Map card */}
      <div style={{ borderRadius: 20, overflow: 'hidden', height: 300, position: 'relative' }}>
        <UberFamilyMap height="300px" showMemberList={false} />
        {/* Share location CTA overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '12px 14px',
          background: 'linear-gradient(0deg, rgba(10,10,20,0.95) 60%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'white' }}>Family Map</p>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Real-time locations</p>
          </div>
          <motion.a
            href="/track"
            whileTap={{ scale: 0.94 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 20,
              background: 'rgba(16,185,129,0.2)',
              border: '1px solid rgba(16,185,129,0.4)',
              color: '#10B981', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', textDecoration: 'none',
            }}
          >
            <Navigation size={11} />
            Share My Location
          </motion.a>
        </div>
      </div>

      {/* Location timeline */}
      <div>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Today's Journey
        </p>
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {visitedPlaces.map((place, idx) => (
            <div
              key={place.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                borderBottom: idx < visitedPlaces.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              {/* Dot + vertical line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: place.dotColor,
                    boxShadow: `0 0 8px ${place.dotColor}80`,
                    flexShrink: 0,
                  }}
                />
                {idx < visitedPlaces.length - 1 && (
                  <div
                    style={{
                      width: 1,
                      height: 20,
                      background: 'rgba(255,255,255,0.08)',
                      marginTop: 4,
                    }}
                  />
                )}
              </div>
              <div style={{ flexShrink: 0 }}>{place.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'white' }}>{place.name}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{place.time}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{place.distance}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geofences */}
      <div>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Active Geofences
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {geofences.map((gf) => (
            <motion.div
              key={gf.id}
              whileHover={{ scale: 1.01 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${gf.inside ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                borderRadius: 12,
              }}
            >
              <Shield size={16} color={gf.inside ? '#10B981' : '#F59E0B'} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'white' }}>{gf.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Radius: {gf.radius}</p>
              </div>
              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: gf.inside ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                  border: `1px solid ${gf.inside ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: gf.inside ? '#10B981' : '#F59E0B',
                  }}
                >
                  {gf.inside ? 'Inside' : 'Outside'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FamilyRadarSection — Real Uber-style map
// ─────────────────────────────────────────────────────────────────────────────

export function FamilyRadarSection() {
  return (
    <div style={{ height: 'calc(100vh - 140px)', minHeight: 480, position: 'relative' }}>
      <UberFamilyMap height="100%" showMemberList />
    </div>
  );
}
