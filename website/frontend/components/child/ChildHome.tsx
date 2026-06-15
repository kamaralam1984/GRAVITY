'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import {
  Shield,
  MapPin,
  Zap,
  Bell,
  Users,
  Activity,
  Wifi,
  ChevronRight,
  Check,
  Smartphone,
  AlertTriangle,
} from 'lucide-react';
import { getToken, getUser } from '@/lib/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

type SafeStatus = 'safe' | 'alert' | 'sos';

interface ChildHomeProps {
  childName: string;
  safeStatus: SafeStatus;
  steps: number;
  battery: number;
  familyOnline: number;
  onNavigate?: (tab: string) => void;
}

interface ApiMember {
  user_id: number;
  name: string;
  role: string;
  last_location: string | null;
  lat: number | null;
  lng: number | null;
  battery: number | null;
  is_online: boolean;
}

interface AlertItem {
  id: number;
  icon: React.ElementType;
  text: string;
  time: string;
  color: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function memberColor(idx: number): string {
  const colors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#EC4899'];
  return colors[idx % colors.length];
}

function memberInitials(name: string): string {
  return name.trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatTimeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<SafeStatus, string> = {
  safe: '#10B981',
  alert: '#F59E0B',
  sos: '#EF4444',
};

const STATUS_LABELS: Record<SafeStatus, string> = {
  safe: 'You are Safe',
  alert: 'Alert Active',
  sos: 'SOS Sent',
};

const STATUS_GLOW: Record<SafeStatus, string> = {
  safe: 'rgba(16, 185, 129, 0.35)',
  alert: 'rgba(245, 158, 11, 0.35)',
  sos: 'rgba(239, 68, 68, 0.35)',
};

// ─── Animated Number ──────────────────────────────────────────────────────────

function AnimatedNumber({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

// ─── Circular Progress Ring ───────────────────────────────────────────────────

function CircularProgress({
  value,
  max,
  color,
  size = 72,
  strokeWidth = 5,
}: {
  value: number;
  max: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
}

// ─── Battery Bar ──────────────────────────────────────────────────────────────

function BatteryBar({ level }: { level: number }) {
  const color = level < 20 ? '#EF4444' : level < 50 ? '#F59E0B' : '#10B981';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div
        style={{
          width: 22,
          height: 44,
          borderRadius: 6,
          border: `2px solid ${color}`,
          position: 'relative',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.04)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 8,
            height: 5,
            borderRadius: '2px 2px 0 0',
            background: color,
          }}
        />
        <motion.div
          initial={{ height: '0%' }}
          animate={{ height: `${level}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: `linear-gradient(to top, ${color}, ${color}88)`,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 700 }}>{level}%</span>
    </div>
  );
}

// ─── Floating Sparkle Dots ─────────────────────────────────────────────────────

function FloatingSparkles({ statusColor }: { statusColor: string }) {
  const dots = [
    { angle: 0, radius: 120, delay: 0 },
    { angle: 72, radius: 115, delay: 0.4 },
    { angle: 144, radius: 125, delay: 0.8 },
    { angle: 216, radius: 118, delay: 1.2 },
    { angle: 288, radius: 122, delay: 1.6 },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {dots.map((dot, i) => {
        const rad = (dot.angle * Math.PI) / 180;
        const cx = 50 + (dot.radius / 2.5) * Math.cos(rad);
        const cy = 50 + (dot.radius / 2.5) * Math.sin(rad);
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: `${cx}%`,
              top: `${cy}%`,
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: statusColor,
              boxShadow: `0 0 8px ${statusColor}`,
            }}
            animate={{ scale: [0.6, 1.4, 0.6], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.4, delay: dot.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChildHome({
  childName,
  safeStatus,
  steps,
  battery,
  familyOnline,
  onNavigate,
}: ChildHomeProps) {
  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [activeGeofences, setActiveGeofences] = useState<number>(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [safeSignalSent, setSafeSignalSent] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<ApiMember[]>([]);
  const [lastLocation, setLastLocation] = useState<string | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<AlertItem[]>([]);
  const [greeting] = useState(getGreeting());
  const [famId, setFamId] = useState<number | null>(null);

  const statusColor = STATUS_COLORS[safeStatus];
  const statusGlow = STATUS_GLOW[safeStatus];
  const statusLabel = STATUS_LABELS[safeStatus];
  const stepsMax = 10000;
  const stepsPercent = Math.round((steps / stepsMax) * 100);
  const scoreColor =
    safetyScore !== null
      ? safetyScore >= 80
        ? '#10B981'
        : safetyScore >= 50
        ? '#F59E0B'
        : '#EF4444'
      : '#6B7280';

  // Load real family + location + geofence data
  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (!token || !user) return;

    async function load() {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const famRes = await fetch('/families/my', { headers });
        if (!famRes.ok) return;
        const fams = await famRes.json();
        if (!Array.isArray(fams) || fams.length === 0) return;
        const famId = fams[0].id;
        setFamId(famId);

        // Load members → real avatars + own location
        const memRes = await fetch(`/families/${famId}/members`, { headers });
        if (memRes.ok) {
          const members: ApiMember[] = await memRes.json();
          setFamilyMembers(members);
          const me = members.find((m) => m.user_id === user!.id);
          if (me?.last_location) setLastLocation(me.last_location);
        }

        // Geofences
        try {
          const geoRes = await fetch(`/geofences/family/${famId}`, { headers });
          if (geoRes.ok) {
            const geos = await geoRes.json();
            setActiveGeofences(Array.isArray(geos) ? geos.length : 0);
          }
        } catch (_) {}

        // SOS / recent alerts
        try {
          const sosRes = await fetch(`/sos/family/${famId}`, { headers });
          if (sosRes.ok) {
            const list = await sosRes.json();
            const alerts: AlertItem[] = (Array.isArray(list) ? list.slice(0, 3) : []).map(
              (s: { id: number; message?: string; created_at?: string; resolved?: boolean }) => ({
                id: s.id,
                icon: s.resolved ? Shield : AlertTriangle,
                text: s.message || 'SOS Alert',
                time: s.created_at ? formatTimeAgo(s.created_at) : 'Recently',
                color: s.resolved ? '#10B981' : '#EF4444',
              })
            );
            setRecentAlerts(alerts);
          }
        } catch (_) {}
      } catch (_) {}
    }
    load();
  }, []);

  const onlineMembers = familyMembers.filter((m) => m.is_online);

  return (
    <>
      {/* Global styles */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes pulse-ring-slow {
          0% { transform: scale(0.85); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes pulse-ring-slower {
          0% { transform: scale(0.9); opacity: 0.4; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        .ring-1 { animation: pulse-ring 2.4s ease-out infinite; }
        .ring-2 { animation: pulse-ring-slow 2.4s ease-out 0.8s infinite; }
        .ring-3 { animation: pulse-ring-slower 2.4s ease-out 1.6s infinite; }
        ::-webkit-scrollbar { height: 0px; width: 0px; }
      `}</style>

      {/* Page Container */}
      <div
        style={{
          minHeight: '100vh',
          background: '#0B0D13',
          color: '#fff',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          padding: '24px 16px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Floating orb backgrounds */}
        <div
          style={{
            position: 'fixed', top: -120, right: -80, width: 320, height: 320,
            borderRadius: '50%', background: `radial-gradient(circle, ${statusColor}18 0%, transparent 70%)`,
            pointerEvents: 'none', zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'fixed', bottom: -100, left: -60, width: 280, height: 280,
            borderRadius: '50%', background: 'radial-gradient(circle, #3B82F620 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 500, height: 500, borderRadius: '50%',
            background: `radial-gradient(circle, ${statusColor}0A 0%, transparent 65%)`,
            pointerEvents: 'none', zIndex: 0,
          }}
        />

        {/* Content wrapper */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto' }}>

          {/* ── Top Bar ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {greeting}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                {childName} ✦
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                <Bell size={16} color="rgba(255,255,255,0.6)" />
              </div>
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${statusColor}22`, border: `1px solid ${statusColor}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Wifi size={16} color={statusColor} />
              </div>
            </div>
          </motion.div>

          {/* ── 1. HERO SAFETY BUBBLE ──────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              marginBottom: 36, minHeight: '38vh', justifyContent: 'center', position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute', width: 360, height: 360, borderRadius: '50%',
                background: `radial-gradient(circle, ${statusColor}18 0%, transparent 65%)`,
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              <div className="ring-3" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${statusColor}` }} />
              <div className="ring-2" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${statusColor}` }} />
              <div className="ring-1" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${statusColor}` }} />
              <FloatingSparkles statusColor={statusColor} />
              <div
                style={{
                  position: 'absolute', inset: 20, borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 35%, ${statusColor}30, ${statusColor}10)`,
                  border: `2px solid ${statusColor}60`,
                  boxShadow: `0 0 40px ${statusGlow}, inset 0 0 20px ${statusColor}15`,
                  backdropFilter: 'blur(10px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
                  <Shield size={40} color={statusColor} style={{ filter: `drop-shadow(0 0 10px ${statusColor})` }} />
                </motion.div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'center', letterSpacing: '0.02em', lineHeight: 1.2, maxWidth: 100 }}>
                  {childName}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center' }}>
                  {statusLabel}
                </div>
              </div>
            </div>

            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                marginTop: 20, padding: '6px 18px', borderRadius: 50,
                background: `${statusColor}18`, border: `1px solid ${statusColor}40`,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
              <span style={{ fontSize: 12, color: statusColor, fontWeight: 600, letterSpacing: '0.08em' }}>
                LIVE TRACKING ACTIVE
              </span>
            </motion.div>
          </motion.div>

          {/* ── 2. QUICK STATS ROW ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ marginBottom: 24 }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
              Today&apos;s Stats
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>

              {/* Steps Card */}
              <div style={{ minWidth: 110, padding: '16px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress value={steps} max={stepsMax} color="#3B82F6" size={68} />
                  <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Activity size={14} color="#3B82F6" />
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#3B82F6' }}>{stepsPercent}%</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}><AnimatedNumber value={steps} /></div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Steps</div>
                </div>
              </div>

              {/* Battery Card */}
              <div style={{ minWidth: 90, padding: '16px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <BatteryBar level={battery} />
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Battery</div>
              </div>

              {/* Family Online Card — real members */}
              <div style={{ minWidth: 120, padding: '16px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', position: 'relative', height: 32 }}>
                  {(onlineMembers.length > 0 ? onlineMembers : familyMembers).slice(0, 4).map((member, i) => (
                    <div
                      key={member.user_id}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: memberColor(i), border: '2px solid #0B0D13',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800, color: '#fff',
                        position: 'absolute', left: i * 18, top: 0, zIndex: 4 - i,
                        boxShadow: `0 0 8px ${memberColor(i)}60`,
                      }}
                    >
                      {memberInitials(member.name)}
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#10B981' }}>
                    {familyOnline} <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>online</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Family</div>
                </div>
              </div>

              {/* Safety Score Card */}
              <div style={{ minWidth: 100, padding: '16px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: `radial-gradient(circle, ${scoreColor}22, transparent)`,
                    border: `2px solid ${scoreColor}50`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                  }}
                >
                  <span style={{ fontSize: 20, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
                    {safetyScore !== null ? <AnimatedNumber value={safetyScore} /> : '—'}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: scoreColor, fontWeight: 700 }}>
                    {safetyScore !== null ? (safetyScore >= 80 ? 'Excellent' : safetyScore >= 50 ? 'Good' : 'Fair') : 'Active'}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Safety Score</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── 3. TODAY'S SUMMARY CARDS (2×2) ────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ marginBottom: 24 }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
              Today&apos;s Summary
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

              {/* Last Location — real */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                style={{ padding: 16, borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#10B98120', border: '1px solid #10B98140', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <MapPin size={16} color="#10B981" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lastLocation || 'Locating...'}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                  {lastLocation ? 'Last known location' : 'Waiting for GPS'}
                </div>
              </motion.div>

              {/* Check-in Status */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
                style={{ padding: 16, borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#3B82F620', border: '1px solid #3B82F640', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Bell size={16} color="#3B82F6" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 3 }}>
                  {checkedIn ? 'Checked In' : 'Not Checked'}
                </div>
                <div style={{ fontSize: 10, color: checkedIn ? '#10B981' : 'rgba(255,255,255,0.4)', fontWeight: checkedIn ? 600 : 400 }}>
                  {checkedIn ? 'Family notified ✓' : 'Tap Check In below'}
                </div>
              </motion.div>

              {/* Active Geofences — real count */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56 }}
                style={{ padding: 16, borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Shield size={16} color="#D4AF37" />
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                  {activeGeofences > 0 ? `${activeGeofences} Zones` : 'No Zones'}
                </div>
                {activeGeofences > 0 ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 50, background: '#10B98120', border: '1px solid #10B98140' }}>
                    <Check size={9} color="#10B981" />
                    <span style={{ fontSize: 9, color: '#10B981', fontWeight: 700 }}>All Active</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Set up in parent app</div>
                )}
              </motion.div>

              {/* Device / App Status */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.64 }}
                style={{ padding: 16, borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#8B5CF620', border: '1px solid #8B5CF640', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Smartphone size={16} color="#8B5CF6" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                  Gravity App
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 50, background: '#10B98120', border: '1px solid #10B98140' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} />
                  <span style={{ fontSize: 9, color: '#10B981', fontWeight: 700 }}>Connected</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* ── 4. QUICK ACTIONS ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{ marginBottom: 24 }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
              Quick Actions
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {/* Check In Now */}
              <motion.button
                whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}
                onClick={async () => {
                  if (checkedIn) return;
                  setCheckedIn(true);
                  try {
                    const token = getToken();
                    if (token && famId) {
                      await fetch('/chat/send', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ family_id: famId, content: `✅ ${childName} has checked in` }),
                      });
                    }
                  } catch { /* ignore */ }
                }}
                style={{
                  padding: '11px 20px', borderRadius: 50,
                  background: checkedIn ? '#10B98130' : 'linear-gradient(135deg, #10B981, #059669)',
                  border: checkedIn ? '1px solid #10B981' : 'none',
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7,
                  boxShadow: checkedIn ? 'none' : '0 4px 20px rgba(16,185,129,0.35)',
                  transition: 'all 0.3s ease',
                }}
              >
                {checkedIn ? <Check size={14} /> : <Zap size={14} />}
                {checkedIn ? 'Checked In!' : 'Check In Now'}
              </motion.button>

              {/* Message Family */}
              <motion.button
                whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}
                onClick={() => {
                  setMessageSent(true);
                  onNavigate?.('chat');
                }}
                style={{
                  padding: '11px 20px', borderRadius: 50,
                  background: messageSent ? '#3B82F630' : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  border: messageSent ? '1px solid #3B82F6' : 'none',
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7,
                  boxShadow: messageSent ? 'none' : '0 4px 20px rgba(59,130,246,0.35)',
                  transition: 'all 0.3s ease',
                }}
              >
                {messageSent ? <Check size={14} /> : <Users size={14} />}
                {messageSent ? 'Opening Chat...' : 'Message Family'}
              </motion.button>

              {/* I'm Safe */}
              <motion.button
                whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}
                onClick={async () => {
                  if (safeSignalSent) return;
                  setSafeSignalSent(true);
                  try {
                    const token = getToken();
                    if (token && famId) {
                      await fetch('/chat/send', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ family_id: famId, content: `🟢 ${childName} is safe` }),
                      });
                    }
                  } catch { /* ignore */ }
                }}
                style={{
                  padding: '11px 20px', borderRadius: 50,
                  background: safeSignalSent ? 'rgba(212,175,55,0.15)' : 'linear-gradient(135deg, #D4AF37, #B8960C)',
                  border: safeSignalSent ? '1px solid #D4AF37' : 'none',
                  color: safeSignalSent ? '#D4AF37' : '#000',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7,
                  boxShadow: safeSignalSent ? 'none' : '0 4px 20px rgba(212,175,55,0.4)',
                  transition: 'all 0.3s ease',
                }}
              >
                {safeSignalSent ? <Check size={14} /> : <Shield size={14} />}
                {safeSignalSent ? 'Signal Sent!' : "I'm Safe"}
              </motion.button>
            </div>
          </motion.div>

          {/* ── 5. RECENT ALERTS ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Recent Alerts
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                View All <ChevronRight size={12} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentAlerts.length === 0 ? (
                <div
                  style={{
                    padding: '20px 16px', borderRadius: 16,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: '#10B98118', border: '1px solid #10B98140', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Shield size={15} color="#10B981" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>No recent alerts</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>All clear — you are safe</div>
                  </div>
                </div>
              ) : (
                recentAlerts.map((alert, i) => {
                  const Icon = alert.icon;
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      style={{
                        padding: '14px 16px', borderRadius: 16,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: 12,
                        borderLeft: `3px solid ${alert.color}`, position: 'relative', overflow: 'hidden',
                      }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 60, background: `linear-gradient(to right, ${alert.color}12, transparent)`, pointerEvents: 'none' }} />
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${alert.color}18`, border: `1px solid ${alert.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                        <Icon size={15} color={alert.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.text}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{alert.time}</div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
}
