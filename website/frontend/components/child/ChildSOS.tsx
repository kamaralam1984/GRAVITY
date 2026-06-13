'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const CONTACTS: Contact[] = [
  {
    id: 'mom',
    name: 'Mom',
    relationship: 'Parent',
    phone: '+91 98765 43210',
    initials: 'M',
    color: '#10B981',
  },
  {
    id: 'dad',
    name: 'Dad',
    relationship: 'Parent',
    phone: '+91 98765 12345',
    initials: 'D',
    color: '#3B82F6',
  },
  {
    id: 'emergency',
    name: 'Emergency',
    relationship: 'Police 100',
    phone: '100',
    initials: '!',
    color: '#EF4444',
  },
];

const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'mom',
    name: 'Mom',
    initials: 'M',
    color: '#10B981',
    glowColor: '#10B98166',
    angleDeg: 30,
    distancePx: 60,
    location: 'Home',
    status: 'Online',
    distanceKm: '0.3 km',
    lastSeen: 'Just now',
  },
  {
    id: 'dad',
    name: 'Dad',
    initials: 'D',
    color: '#3B82F6',
    glowColor: '#3B82F666',
    angleDeg: 150,
    distancePx: 120,
    location: 'Office',
    status: 'Online',
    distanceKm: '4.7 km',
    lastSeen: '2 min ago',
  },
  {
    id: 'grandma',
    name: 'Grandma',
    initials: 'G',
    color: '#F59E0B',
    glowColor: '#F59E0B66',
    angleDeg: 270,
    distancePx: 40,
    location: 'Home',
    status: 'Idle',
    distanceKm: '0.1 km',
    lastSeen: '5 min ago',
  },
];

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

export function SOSSection() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [sentConfirmed, setSentConfirmed] = useState(false);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setSosActive(true);
      setSentConfirmed(true);
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleSOS() {
    if (sentConfirmed) return;
    setCountdown(3);
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
              {['Mom', 'Dad'].map((name) => (
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
          {CONTACTS.map((contact) => (
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
                  {contact.relationship} · {contact.phone}
                </p>
              </div>
              {/* Call button */}
              <motion.button
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
                }}
              >
                <Phone size={12} />
                Call
              </motion.button>
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

      {/* Map card */}
      <div
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          height: 280,
          background: 'linear-gradient(135deg, #0F1929 0%, #0A1220 100%)',
        }}
      >
        {/* Grid lines */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={`${(i / 12) * 100}%`}
              y1="0"
              x2={`${(i / 12) * 100}%`}
              y2="100%"
              stroke="#38BDF8"
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={`${(i / 8) * 100}%`}
              x2="100%"
              y2={`${(i / 8) * 100}%`}
              stroke="#38BDF8"
              strokeWidth="0.5"
            />
          ))}
        </svg>

        {/* Faint road-like shapes */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="30%" y="0" width="8%" height="100%" fill="#60A5FA" rx="2" />
          <rect x="60%" y="0" width="6%" height="100%" fill="#60A5FA" rx="2" />
          <rect x="0" y="40%" width="100%" height="6%" fill="#60A5FA" rx="2" />
          <rect x="0" y="65%" width="100%" height="4%" fill="#60A5FA" rx="2" />
        </svg>

        {/* Accuracy circle */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: 'rgba(16,185,129,0.18)',
            border: '1px solid rgba(16,185,129,0.4)',
          }}
        />

        {/* Location pin */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                boxShadow: '0 0 20px rgba(16,185,129,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  transform: 'rotate(45deg)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={14} />
              </div>
            </div>
          </motion.div>
          {/* Shadow under pin */}
          <div
            style={{
              width: 8,
              height: 4,
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.4)',
              marginTop: 2,
            }}
          />
        </div>

        {/* Overlay info bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '12px 16px',
            background: 'linear-gradient(0deg, rgba(10,10,20,0.95) 60%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'white' }}>Home, Mumbai</p>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
              19.0760° N, 72.8777° E
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '7px 12px',
              borderRadius: 20,
              background: 'rgba(59,130,246,0.2)',
              border: '1px solid rgba(59,130,246,0.4)',
              color: '#60A5FA',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Navigation size={11} />
            Open in Maps
          </motion.button>
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
// FamilyRadarSection
// ─────────────────────────────────────────────────────────────────────────────

export function FamilyRadarSection() {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const RADAR_SIZE = 280;
  const CENTER = RADAR_SIZE / 2;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0A0A14 0%, #0F0F1E 100%)',
        padding: '24px 16px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: 0 }}>Family Radar</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
            Live positions of your family
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'rgba(56,189,248,0.1)',
            border: '1px solid rgba(56,189,248,0.25)',
            borderRadius: 20,
          }}
        >
          <Wifi size={13} color="#38BDF8" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#38BDF8' }}>Live</span>
        </div>
      </div>

      {/* Radar circle */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: RADAR_SIZE,
            height: RADAR_SIZE,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(20,180,120,0.06) 0%, rgba(10,10,20,0.95) 70%)',
            border: '1.5px solid rgba(56,189,248,0.2)',
            position: 'relative',
            boxShadow: '0 0 40px rgba(56,189,248,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Concentric grid circles */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <div
              key={ratio}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: RADAR_SIZE * ratio,
                height: RADAR_SIZE * ratio,
                borderRadius: '50%',
                border: '1px solid rgba(56,189,248,0.1)',
              }}
            />
          ))}

          {/* Cross hairs */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: 1,
              background: 'rgba(56,189,248,0.08)',
              transform: 'translateY(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '50%',
              width: 1,
              background: 'rgba(56,189,248,0.08)',
              transform: 'translateX(-50%)',
            }}
          />

          {/* Radar sweep line */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: CENTER,
              height: 2,
              transformOrigin: '0% 50%',
              background: 'linear-gradient(90deg, rgba(20,184,166,0.8), transparent)',
              borderRadius: 1,
            }}
          />

          {/* Sweep gradient fade */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background:
                'conic-gradient(from -10deg, rgba(20,184,166,0.15) 0deg, transparent 60deg)',
              transformOrigin: 'center',
            }}
          />

          {/* Center dot (YOU) */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: CENTER - 8,
              left: CENTER - 8,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #FBBF24, #D97706)',
              boxShadow: '0 0 12px rgba(251,191,36,0.8)',
              zIndex: 10,
            }}
          />
          {/* YOU label */}
          <div
            style={{
              position: 'absolute',
              top: CENTER - 26,
              left: CENTER + 10,
              fontSize: 9,
              fontWeight: 700,
              color: '#FBBF24',
              letterSpacing: '0.08em',
              zIndex: 10,
            }}
          >
            YOU
          </div>

          {/* Family member dots */}
          {FAMILY_MEMBERS.map((member) => {
            const { x, y } = polarToXY(member.angleDeg, member.distancePx, CENTER);
            const isHovered = hoveredMember === member.id;
            return (
              <div key={member.id} style={{ position: 'absolute', zIndex: 20 }}>
                {/* Tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, y: 4 }}
                      style={{
                        position: 'absolute',
                        top: y - 64,
                        left: x - 60,
                        width: 120,
                        background: 'rgba(10,10,25,0.95)',
                        border: `1px solid ${member.color}55`,
                        borderRadius: 10,
                        padding: '8px 10px',
                        pointerEvents: 'none',
                        zIndex: 30,
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: member.color }}>
                        {member.name}
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                        {member.location}
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                        {member.distanceKm} away
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Dot */}
                <motion.div
                  onMouseEnter={() => setHoveredMember(member.id)}
                  onMouseLeave={() => setHoveredMember(null)}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: FAMILY_MEMBERS.findIndex((m) => m.id === member.id) * 0.6,
                  }}
                  style={{
                    position: 'absolute',
                    top: y - 7,
                    left: x - 7,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: member.color,
                    boxShadow: `0 0 10px ${member.glowColor}, 0 0 20px ${member.glowColor}`,
                    cursor: 'pointer',
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#FBBF24',
              boxShadow: '0 0 6px rgba(251,191,36,0.6)',
            }}
          />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>You</span>
        </div>
        {FAMILY_MEMBERS.map((m) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: m.color,
                boxShadow: `0 0 6px ${m.glowColor}`,
              }}
            />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{m.name}</span>
          </div>
        ))}
      </div>

      {/* Family distance cards */}
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
          Family Members
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAMILY_MEMBERS.map((member) => (
            <motion.div
              key={member.id}
              whileHover={{ scale: 1.02 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${member.color}22`,
                borderRadius: 14,
                backdropFilter: 'blur(12px)',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: `${member.color}18`,
                  border: `2px solid ${member.color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 800,
                  color: member.color,
                  flexShrink: 0,
                  boxShadow: `0 0 12px ${member.glowColor}`,
                }}
              >
                {member.initials}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'white' }}>{member.name}</p>
                  <div
                    style={{
                      padding: '2px 7px',
                      borderRadius: 10,
                      background:
                        member.status === 'Online'
                          ? 'rgba(16,185,129,0.15)'
                          : 'rgba(245,158,11,0.15)',
                      border:
                        member.status === 'Online'
                          ? '1px solid rgba(16,185,129,0.35)'
                          : '1px solid rgba(245,158,11,0.35)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: member.status === 'Online' ? '#10B981' : '#F59E0B',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {member.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={11} color="rgba(255,255,255,0.3)" />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{member.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} color="rgba(255,255,255,0.3)" />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{member.lastSeen}</span>
                  </div>
                </div>
              </div>

              {/* Distance badge */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 2,
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: member.color }}>
                  {member.distanceKm}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>away</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          background: 'rgba(56,189,248,0.06)',
          border: '1px solid rgba(56,189,248,0.15)',
          borderRadius: 40,
        }}
      >
        <Users size={13} color="#38BDF8" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          3 family members connected · Updated just now
        </span>
      </div>
    </div>
  );
}
