'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getToken, clearAuth } from '@/lib/auth';
import {
  Shield,
  MapPin,
  AlertTriangle,
  Bell,
  Users,
  Activity,
  Zap,
  Heart,
  ChevronRight,
  Eye,
  Phone,
  MessageSquare,
  Navigation,
  Clock,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  MoreVertical,
  Radio,
  Wifi,
  Battery,
  Car,
  Home,
  School,
  AlertCircle,
  Star,
  RefreshCw,
  Copy,
  CheckCheck,
  UserPlus,
} from 'lucide-react';

// ─── Shared types ─────────────────────────────────────────────────────────────

type MemberStatus = 'safe' | 'sos' | 'alert' | 'offline';
type MemberRole = 'Child' | 'Elder' | 'Self';

interface FamilyMember {
  id: string;
  name: string;
  initials: string;
  role: MemberRole;
  status: MemberStatus;
  location: string;
  lastSeen: string;
  battery: number;
  avatarColor: string;
  lat: number;
  lng: number;
  coordinates: string;
  distanceFromHome: string;
  accurateLocation: boolean;
}

interface ActivityEvent {
  id: string;
  type: 'safe' | 'sos' | 'geofence' | 'location';
  description: string;
  time: string;
  member: FamilyMember;
  read: boolean;
}

interface Alert {
  id: string;
  type: 'sos' | 'geofence' | 'safety' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'info';
  title: string;
  description: string;
  member: FamilyMember;
  timestamp: string;
  resolved: boolean;
  read: boolean;
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'm1',
    name: 'Sarah',
    initials: 'SA',
    role: 'Self',
    status: 'safe',
    location: 'Home',
    lastSeen: '1 min ago',
    battery: 85,
    avatarColor: '#B8720A',
    lat: 28.6139,
    lng: 77.209,
    coordinates: '28.6139° N, 77.2090° E',
    distanceFromHome: '0.0 km',
    accurateLocation: true,
  },
  {
    id: 'm2',
    name: 'Arjun',
    initials: 'AR',
    role: 'Child',
    status: 'safe',
    location: 'School',
    lastSeen: '2 min ago',
    battery: 62,
    avatarColor: '#10B981',
    lat: 28.622,
    lng: 77.218,
    coordinates: '28.6220° N, 77.2180° E',
    distanceFromHome: '1.4 km',
    accurateLocation: true,
  },
  {
    id: 'm3',
    name: 'Priya',
    initials: 'PR',
    role: 'Child',
    status: 'alert',
    location: 'Mall Rd',
    lastSeen: '8 min ago',
    battery: 23,
    avatarColor: '#8B5CF6',
    lat: 28.63,
    lng: 77.225,
    coordinates: '28.6300° N, 77.2250° E',
    distanceFromHome: '2.1 km',
    accurateLocation: false,
  },
  {
    id: 'm4',
    name: 'Grandpa',
    initials: 'GP',
    role: 'Elder',
    status: 'safe',
    location: 'Park',
    lastSeen: '5 min ago',
    battery: 71,
    avatarColor: '#3B82F6',
    lat: 28.608,
    lng: 77.2,
    coordinates: '28.6080° N, 77.2000° E',
    distanceFromHome: '0.8 km',
    accurateLocation: true,
  },
];

const ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: 'e1',
    type: 'safe',
    description: 'Arjun arrived at School safely',
    time: '2 min ago',
    member: FAMILY_MEMBERS[1],
    read: false,
  },
  {
    id: 'e2',
    type: 'geofence',
    description: 'Priya left the Home zone',
    time: '10 min ago',
    member: FAMILY_MEMBERS[2],
    read: false,
  },
  {
    id: 'e3',
    type: 'location',
    description: 'Grandpa location updated',
    time: '15 min ago',
    member: FAMILY_MEMBERS[3],
    read: true,
  },
  {
    id: 'e4',
    type: 'safe',
    description: 'Sarah checked in from Home',
    time: '20 min ago',
    member: FAMILY_MEMBERS[0],
    read: true,
  },
  {
    id: 'e5',
    type: 'location',
    description: 'Arjun battery low — 23%',
    time: '32 min ago',
    member: FAMILY_MEMBERS[1],
    read: true,
  },
];

const ALERTS_DATA: Alert[] = [
  {
    id: 'a1',
    type: 'sos',
    severity: 'critical',
    title: 'SOS Alert',
    description: 'Priya triggered an emergency SOS from Mall Road.',
    member: FAMILY_MEMBERS[2],
    timestamp: '10 min ago',
    resolved: false,
    read: false,
  },
  {
    id: 'a2',
    type: 'geofence',
    severity: 'high',
    title: 'Geofence Exit',
    description: 'Priya exited the "Home" safe zone boundary.',
    member: FAMILY_MEMBERS[2],
    timestamp: '12 min ago',
    resolved: false,
    read: false,
  },
  {
    id: 'a3',
    type: 'safety',
    severity: 'medium',
    title: 'Low Battery',
    description: "Priya's device battery is at 23%. Charging recommended.",
    member: FAMILY_MEMBERS[2],
    timestamp: '18 min ago',
    resolved: false,
    read: true,
  },
  {
    id: 'a4',
    type: 'system',
    severity: 'info',
    title: 'Safe Arrival',
    description: 'Arjun arrived at Delhi Public School on schedule.',
    member: FAMILY_MEMBERS[1],
    timestamp: '35 min ago',
    resolved: true,
    read: true,
  },
  {
    id: 'a5',
    type: 'safety',
    severity: 'high',
    title: 'Speed Alert',
    description: 'Vehicle travelling at 92 km/h in a 60 km/h zone near Ring Road.',
    member: FAMILY_MEMBERS[0],
    timestamp: '1 hr ago',
    resolved: true,
    read: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(status: MemberStatus): string {
  switch (status) {
    case 'safe': return '#10B981';
    case 'sos': return '#EF4444';
    case 'alert': return '#F59E0B';
    case 'offline': return '#6B7280';
  }
}

function activityColor(type: ActivityEvent['type']): string {
  switch (type) {
    case 'safe': return '#10B981';
    case 'sos': return '#EF4444';
    case 'geofence': return '#F59E0B';
    case 'location': return '#3B82F6';
  }
}

function severityBorderColor(severity: Alert['severity']): string {
  switch (severity) {
    case 'critical': return '#EF4444';
    case 'high': return '#F59E0B';
    case 'medium': return '#3B82F6';
    case 'info': return '#10B981';
  }
}

function severityIconColor(severity: Alert['severity']): string {
  return severityBorderColor(severity);
}

function AlertTypeIcon({ type, severity }: { type: Alert['type']; severity: Alert['severity'] }) {
  const color = severityIconColor(severity);
  const size = 20;
  switch (type) {
    case 'sos': return <AlertCircle size={size} style={{ color }} />;
    case 'geofence': return <MapPin size={size} style={{ color }} />;
    case 'safety': return <Shield size={size} style={{ color }} />;
    case 'system': return <Bell size={size} style={{ color }} />;
  }
}

function ActivityIcon({ type }: { type: ActivityEvent['type'] }) {
  const color = activityColor(type);
  const size = 16;
  switch (type) {
    case 'safe': return <Check size={size} style={{ color }} />;
    case 'sos': return <AlertCircle size={size} style={{ color }} />;
    case 'geofence': return <MapPin size={size} style={{ color }} />;
    case 'location': return <Navigation size={size} style={{ color }} />;
  }
}

// Avatar circle component
function Avatar({
  member,
  size = 36,
}: {
  member: Pick<FamilyMember, 'initials' | 'avatarColor' | 'name'>;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${member.avatarColor}cc, ${member.avatarColor}66)`,
        border: `2px solid ${member.avatarColor}88`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size < 32 ? 10 : 13,
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
        letterSpacing: '0.5px',
      }}
    >
      {member.initials}
    </div>
  );
}

// Battery bar
function BatteryBar({ level }: { level: number }) {
  const color = level > 50 ? '#10B981' : level > 20 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Battery size={12} style={{ color, opacity: 0.8 }} />
      <div
        style={{
          width: 28,
          height: 5,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${level}%`,
            height: '100%',
            background: color,
            borderRadius: 3,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1 }}>
        {level}%
      </span>
    </div>
  );
}

// Pulsing dot
function PulseDot({ color = '#10B981', size = 8 }: { color?: string; size?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <motion.div
        animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: color,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: color,
        }}
      />
    </div>
  );
}

// ─── Glass card style helper ──────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. DashboardSection
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#B8720A', '#10B981', '#8B5CF6', '#3B82F6', '#EF4444', '#F59E0B', '#06B6D4', '#EC4899'];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)} days ago`;
}

export function DashboardSection() {
  const [stats, setStats] = useState({
    activeMembers: 0,
    sosAlerts: 0,
    geofences: 6,
    devices: 0,
  });
  const [members, setMembers] = useState<FamilyMember[]>(FAMILY_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>(ACTIVITY_EVENTS);
  const [routineAlerts, setRoutineAlerts] = useState<{ member: string; alert: string; severity: string }[]>([]);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Dedicated invite code fetch — independent of loadFamily
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch('/families/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(fam => {
        const f = Array.isArray(fam) ? fam[0] : fam;
        if (f?.invite_code) setInviteCode(f.invite_code);
      })
      .catch(() => {});
  }, []);

  // Load real family members and live locations
  useEffect(() => {
    async function loadFamily() {
      const token = getToken();
      if (!token) return;
      const h = { Authorization: `Bearer ${token}` };
      try {
        const famRes = await fetch('/families/my', { headers: h });
        if (!famRes.ok) {
          if (famRes.status === 401) {
            clearAuth();
            if (typeof window !== 'undefined') window.location.href = '/login';
          }
          return;
        }
        const fam = await famRes.json();
        let famData = Array.isArray(fam) ? fam[0] : fam;
        let fid = famData?.id ?? famData?.family?.id;
        if (!fid) {
          // Auto-create family if parent has none
          const cr = await fetch('/families/create', {
            method: 'POST',
            headers: { ...h, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'My Family' }),
          });
          if (!cr.ok) return;
          famData = await cr.json();
          fid = famData?.id;
          if (!fid) return;
        }
        if (famData?.invite_code) setInviteCode(famData.invite_code);

        const memRes = await fetch(`/families/${fid}/members`, { headers: h });
        if (!memRes.ok) return;
        const raw: any[] = await memRes.json();
        if (!raw.length) return;

        const mapped: FamilyMember[] = raw.map((m, i) => {
          const name: string = m.name ?? 'Member';
          const initials = name.split(' ').map((w: string) => w[0] ?? '').join('').slice(0, 2).toUpperCase();
          const role: MemberRole = m.role === 'owner' ? 'Self' : 'Child';
          const isOnline: boolean = !!m.is_online;
          return {
            id: String(m.user_id ?? i),
            name,
            initials,
            role,
            status: isOnline ? 'safe' : 'offline',
            location: m.last_location ?? 'Location unavailable',
            lastSeen: 'Recently',
            battery: m.battery ?? 50,
            avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
            lat: m.lat ?? 0,
            lng: m.lng ?? 0,
            coordinates: m.lat ? `${Number(m.lat).toFixed(4)}° N, ${Number(m.lng).toFixed(4)}° E` : 'Unavailable',
            distanceFromHome: '—',
            accurateLocation: !!(m.lat && m.lng),
          };
        });

        setMembers(mapped);
        const online = mapped.filter(mb => mb.status === 'safe').length;
        setStats(prev => ({ ...prev, activeMembers: online, devices: mapped.length }));

        // Generate live activity events from member locations
        const acts: ActivityEvent[] = mapped.map((mb, i) => ({
          id: `live-${i}`,
          type: 'location' as ActivityEvent['type'],
          description: `${mb.name} — ${mb.location}`,
          time: mb.lastSeen,
          member: mb,
          read: false,
        }));
        setEvents(acts);
      } catch { /* keep demo fallback */ }
    }
    loadFamily();
    const iv = setInterval(loadFamily, 30000);
    return () => clearInterval(iv);
  }, []);

  // Routine anomaly check via AI
  useEffect(() => {
    async function checkRoutines() {
      const token = getToken();
      if (!token) return;
      const h = { Authorization: `Bearer ${token}` };
      try {
        const famRes = await fetch('/families/my', { headers: h });
        if (!famRes.ok) return;
        const fam = await famRes.json();
        const famData2 = Array.isArray(fam) ? fam[0] : fam;
        const fid = famData2?.id ?? famData2?.family?.id;
        if (!fid) return;
        const locRes = await fetch(`/location/live/${fid}`, { headers: h });
        if (!locRes.ok) return;
        const locData = await locRes.json();
        const members: any[] = locData.members ?? locData ?? [];
        const alerts: { member: string; alert: string; severity: string }[] = [];
        for (const m of members) {
          const hrs = m.hours_since_last_location ?? m.hours_inactive ?? 0;
          if (hrs >= 2) {
            const r = await fetch('/ai/analyze-routine', {
              method: 'POST',
              headers: { ...h, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: String(m.user_id ?? m.id ?? ''),
                user_name: m.name ?? m.user_name ?? 'Member',
                hours_inactive: hrs,
                last_location: m.location ?? m.last_location ?? 'Unknown',
                usual_pattern: 'Active during daytime hours',
              }),
            });
            if (r.ok) {
              const d = await r.json();
              alerts.push({ member: m.name ?? 'Member', alert: d.alert, severity: d.severity });
            }
          }
        }
        if (alerts.length > 0) setRoutineAlerts(alerts);
      } catch { /* silent */ }
    }
    checkRoutines();
  }, []);

  function copyInviteCode() {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function markAllRead() {
    setEvents((prev) => prev.map((e) => ({ ...e, read: true })));
  }

  const quickActions = [
    {
      icon: <MessageSquare size={28} style={{ color: '#B8720A' }} />,
      label: 'Broadcast Message',
      color: '#B8720A',
    },
    {
      icon: <MapPin size={28} style={{ color: '#10B981' }} />,
      label: 'Request Location',
      color: '#10B981',
    },
    {
      icon: <Bell size={28} style={{ color: '#8B5CF6' }} />,
      label: 'Set Quiet Hours',
      color: '#8B5CF6',
    },
    {
      icon: <Eye size={28} style={{ color: '#3B82F6' }} />,
      label: 'View Geofences',
      color: '#3B82F6',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        padding: '0 0 24px',
      }}
    >
      {/* ── Hero Card ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          ...glassCard,
          background:
            'linear-gradient(135deg, rgba(184,114,10,0.15) 0%, rgba(16,185,129,0.08) 100%)',
          border: '1px solid rgba(184,114,10,0.25)',
          padding: '20px 22px 16px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 160,
        }}
      >
        {/* Subtle glow orb */}
        <div
          style={{
            position: 'absolute',
            right: -30,
            top: -30,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(184,114,10,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.3px',
                lineHeight: 1.2,
              }}
            >
              Good Morning, Family
            </div>
            <div
              style={{
                fontSize: 13,
                color: stats.activeMembers > 0 ? '#10B981' : 'rgba(255,255,255,0.4)',
                marginTop: 4,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <PulseDot color={stats.activeMembers > 0 ? '#10B981' : '#6B7280'} size={7} />
              {stats.devices === 0 ? 'Loading family...' : `${stats.activeMembers} of ${stats.devices} members online`}
            </div>
          </div>

          {/* Animated shield */}
          <motion.div
            animate={{
              filter: [
                'drop-shadow(0 0 8px rgba(16,185,129,0.4))',
                'drop-shadow(0 0 18px rgba(16,185,129,0.8))',
                'drop-shadow(0 0 8px rgba(16,185,129,0.4))',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Shield size={60} style={{ color: '#10B981', opacity: 0.9 }} />
          </motion.div>
        </div>

        {/* Quick stats */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            marginTop: 18,
            borderTop: '1px solid rgba(255,255,255,0.07)',
            paddingTop: 14,
          }}
        >
          {[
            { value: stats.activeMembers, label: 'Active Members', color: '#10B981' },
            { value: stats.sosAlerts, label: 'SOS Alerts', color: '#EF4444' },
            { value: stats.geofences, label: 'Geofences', color: '#B8720A' },
            { value: stats.devices, label: 'Devices', color: '#3B82F6' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: 'center',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: s.color,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.45)',
                  marginTop: 3,
                  letterSpacing: '0.3px',
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Invite Code Card ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        style={{
          ...glassCard,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(59,130,246,0.10) 100%)',
          border: '1px solid rgba(139,92,246,0.35)',
          padding: '16px 18px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow orb */}
        <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <UserPlus size={16} style={{ color: '#8B5CF6' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Family Invite Code</span>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 7, height: 7, borderRadius: '50%', background: '#8B5CF6', marginLeft: 2 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.div
            animate={{ boxShadow: ['0 0 0px rgba(139,92,246,0)', '0 0 18px rgba(139,92,246,0.6)', '0 0 0px rgba(139,92,246,0)'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              flex: 1,
              background: 'rgba(139,92,246,0.12)',
              border: '1.5px solid rgba(139,92,246,0.4)',
              borderRadius: 10,
              padding: '10px 14px',
              fontFamily: 'monospace',
              fontSize: 22,
              fontWeight: 800,
              color: '#C4B5FD',
              letterSpacing: '0.25em',
              textAlign: 'center' as const,
            }}
          >
            {inviteCode || '——————'}
          </motion.div>

          <motion.button
            onClick={copyInviteCode}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.25)',
              border: `1.5px solid ${copied ? 'rgba(16,185,129,0.5)' : 'rgba(139,92,246,0.5)'}`,
              borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
              color: copied ? '#10B981' : '#C4B5FD', fontSize: 13, fontWeight: 600,
              transition: 'all 0.25s',
              whiteSpace: 'nowrap' as const,
            }}
          >
            {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 10, textAlign: 'center' as const }}>
          Share this code with family members so they can join your circle
        </p>
      </motion.div>

      {/* ── Section label ─────────────────────────────────────────────── */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          paddingLeft: 2,
        }}
      >
        Family Status
      </div>

      {/* ── Family member cards (horizontal scroll) ───────────────────── */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 6,
          paddingLeft: 1,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {members.map((member, i) => {
          const isSelected = selectedMember === member.id;
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedMember(isSelected ? null : member.id)}
              style={{
                ...glassCard,
                width: isSelected ? 220 : 180,
                minWidth: isSelected ? 220 : 180,
                padding: '14px 14px 12px',
                cursor: 'pointer',
                border: isSelected
                  ? `1px solid ${member.avatarColor}66`
                  : '1px solid rgba(255,255,255,0.08)',
                transition: 'width 0.3s ease, border 0.2s ease',
              }}
            >
              {/* Top row: avatar + name + status dot */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}
              >
                <div style={{ position: 'relative' }}>
                  <Avatar member={member} size={36} />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: statusColor(member.status),
                      border: '1.5px solid #0B0D13',
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {member.name}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      fontSize: 9,
                      fontWeight: 600,
                      color: member.avatarColor,
                      background: `${member.avatarColor}18`,
                      borderRadius: 4,
                      padding: '1px 5px',
                      letterSpacing: '0.5px',
                      marginTop: 1,
                    }}
                  >
                    {member.role}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginBottom: 6,
                }}
              >
                <MapPin size={11} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                  {member.location}
                </span>
              </div>

              {/* Last seen */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginBottom: 8,
                }}
              >
                <Clock size={10} style={{ color: 'rgba(255,255,255,0.3)' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                  {member.lastSeen}
                </span>
              </div>

              {/* Battery */}
              <BatteryBar level={member.battery} />

              {/* Expanded details */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: '1px solid rgba(255,255,255,0.07)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                        {member.coordinates}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: statusColor(member.status),
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px',
                        }}
                      >
                        Status: {member.status.toUpperCase()}
                      </div>
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          background: `${member.avatarColor}22`,
                          border: `1px solid ${member.avatarColor}44`,
                          borderRadius: 8,
                          padding: '5px 8px',
                          cursor: 'pointer',
                          marginTop: 2,
                        }}
                      >
                        <Phone size={11} style={{ color: member.avatarColor }} />
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: member.avatarColor,
                          }}
                        >
                          Call {member.name}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* ── AI Routine Alerts ────────────────────────────────────────── */}
      {routineAlerts.length > 0 && (
        <div style={{ ...glassCard, padding: '14px 16px', border: '1px solid rgba(245,158,11,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <AlertTriangle size={14} style={{ color: '#F59E0B' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F59E0B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>AI Routine Alerts</span>
          </div>
          {routineAlerts.map((a, i) => (
            <div key={i} style={{ padding: '9px 12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8, marginBottom: i < routineAlerts.length - 1 ? 8 : 0, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.severity === 'high' ? '#EF4444' : '#F59E0B', flexShrink: 0, marginTop: 5 }} />
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginRight: 6 }}>{a.member}</span>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)' }}>{a.alert}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Live Activity Feed ────────────────────────────────────────── */}
      <div
        style={{
          ...glassCard,
          padding: '16px 16px 14px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} style={{ color: '#B8720A' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Live Activity</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 6,
                padding: '2px 6px',
              }}
            >
              <PulseDot color="#EF4444" size={6} />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', letterSpacing: '0.8px' }}>
                LIVE
              </span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={markAllRead}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 11,
              color: 'rgba(255,255,255,0.55)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Mark all read
          </motion.button>
        </div>

        {/* Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 10,
                background: event.read
                  ? 'rgba(255,255,255,0.02)'
                  : 'rgba(255,255,255,0.06)',
                border: event.read
                  ? '1px solid rgba(255,255,255,0.04)'
                  : `1px solid ${activityColor(event.type)}33`,
              }}
            >
              {/* Type icon */}
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: `${activityColor(event.type)}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ActivityIcon type={event.type} />
              </div>

              {/* Description */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: event.read ? 400 : 600,
                    color: event.read ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.9)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {event.description}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                  {event.time}
                </div>
              </div>

              {/* Member avatar */}
              <Avatar member={event.member} size={24} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          paddingLeft: 2,
        }}
      >
        Quick Actions
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        {quickActions.map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            whileTap={{ scale: 0.95 }}
            style={{
              ...glassCard,
              padding: '16px 14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 10,
              border: `1px solid ${action.color}22`,
              transition: 'border 0.2s ease',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${action.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {action.icon}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.82)',
                lineHeight: 1.3,
              }}
            >
              {action.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. FamilyMapSection
// ─────────────────────────────────────────────────────────────────────────────

export function FamilyMapSection() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [familyId, setFamilyId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  function mapRaw(raw: any[]): FamilyMember[] {
    return raw.map((m, i) => {
      const name: string = m.name ?? 'Member';
      const initials = name.split(' ').map((w: string) => w[0] ?? '').join('').slice(0, 2).toUpperCase();
      return {
        id: String(m.user_id ?? i),
        name,
        initials,
        role: (m.role === 'owner' ? 'Self' : 'Child') as MemberRole,
        status: (m.is_online ? 'safe' : 'offline') as MemberStatus,
        location: m.last_location ?? 'Unknown',
        lastSeen: 'Recently',
        battery: m.battery ?? 50,
        avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
        lat: m.lat ?? 0,
        lng: m.lng ?? 0,
        coordinates: m.lat ? `${Number(m.lat).toFixed(4)}° N, ${Number(m.lng).toFixed(4)}° E` : 'Unavailable',
        distanceFromHome: '—',
        accurateLocation: !!(m.lat && m.lng),
      };
    });
  }

  async function fetchMembers(fid: number) {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`/families/${fid}/members`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const raw: any[] = await res.json();
      if (raw.length) setMembers(mapRaw(raw));
    } catch {}
  }

  useEffect(() => {
    async function init() {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch('/families/my', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const fam = await res.json();
        const fid = Array.isArray(fam) ? fam[0]?.id : (fam.id ?? fam.family?.id);
        if (!fid) return;
        setFamilyId(fid);
        await fetchMembers(fid);
      } catch {}
    }
    init();
  }, []);

  // Init Leaflet map ONCE (separate from markers)
  useEffect(() => {
    if (typeof window === 'undefined' || !mapDivRef.current || mapRef.current) return;
    import('leaflet').then((Lmod) => {
      if (mapRef.current || !mapDivRef.current) return; // guard double-init
      const L = (Lmod as any).default ?? Lmod;
      try { (L.Icon.Default.prototype as any)._getIconUrl = undefined; } catch {}
      const map = L.map(mapDivRef.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: false }).setView([28.6139, 77.209], 12);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 20 }).addTo(map);
      mapRef.current = { map, L };
      setMapReady(true);
    });
    return () => {
      if (mapRef.current?.map) {
        mapRef.current.map.remove();
        mapRef.current = null;
        markersRef.current = {};
      }
    };
  }, []);

  // Update markers when members change (only after map is ready)
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const { map, L } = mapRef.current;

    Object.values(markersRef.current).forEach((mk: any) => { try { mk.remove(); } catch {} });
    markersRef.current = {};

    const valid = members.filter(m => m.lat && m.lng);
    valid.forEach(m => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:30px;height:30px;border-radius:50%;background:${m.avatarColor};color:#fff;font-weight:800;font-size:11px;display:flex;align-items:center;justify-content:center;border:2.5px solid rgba(255,255,255,0.9);box-shadow:0 0 10px ${m.avatarColor}99;cursor:pointer;">${m.initials}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const marker = L.marker([m.lat, m.lng], { icon })
        .addTo(map)
        .bindPopup(`<div style="font-size:12px;padding:2px 4px;"><b>${m.name}</b><br/><span style="color:#777;">${m.location}</span></div>`);
      markersRef.current[m.id] = marker;
    });

    if (valid.length > 1) {
      map.fitBounds(L.latLngBounds(valid.map((m: FamilyMember) => [m.lat, m.lng])), { padding: [40, 40], maxZoom: 14 });
    } else if (valid.length === 1) {
      map.setView([valid[0].lat, valid[0].lng], 14);
    }
  }, [members, mapReady]);

  function handleRefresh() {
    if (!familyId || refreshing) return;
    setRefreshing(true);
    fetchMembers(familyId).finally(() => setRefreshing(false));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 24 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MapPin size={18} style={{ color: '#B8720A' }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Family Map</span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 8,
              padding: '3px 8px',
            }}
          >
            <PulseDot color="#10B981" size={7} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981', letterSpacing: '0.8px' }}>
              LIVE
            </span>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleRefresh}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <motion.div
            animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : {}}
          >
            <RefreshCw size={15} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* Map card — real Leaflet map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'relative',
          width: '100%',
          height: 280,
          borderRadius: 18,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />

        {/* Open full map button */}
        <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 999 }}>
          <a href="/live-tracking" style={{ textDecoration: 'none' }}>
            <motion.div
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'rgba(11,13,19,0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(184,114,10,0.5)',
                borderRadius: 10,
                padding: '7px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                color: '#B8720A',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              <Navigation size={12} />
              Full map
            </motion.div>
          </a>
        </div>
      </motion.div>

      {/* Member location cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {members.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            style={{
              ...glassCard,
              padding: '13px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Avatar + status */}
            <div style={{ position: 'relative' }}>
              <Avatar member={member} size={40} />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  background: statusColor(member.status),
                  border: '2px solid #0B0D13',
                }}
              />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{member.name}</span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: member.avatarColor,
                    background: `${member.avatarColor}18`,
                    borderRadius: 4,
                    padding: '1px 5px',
                    letterSpacing: '0.5px',
                  }}
                >
                  {member.role}
                </span>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}
              >
                <MapPin size={10} style={{ color: 'rgba(255,255,255,0.4)' }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                  {member.location}
                </span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                {member.accurateLocation ? member.coordinates : 'Approx. location'} · {member.lastSeen}
              </div>
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              {/* Accuracy indicator */}
              <div
                style={{
                  background: member.accurateLocation ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${member.accurateLocation ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 6,
                  padding: '3px 7px',
                  fontSize: 9,
                  fontWeight: 600,
                  color: member.accurateLocation ? '#10B981' : 'rgba(255,255,255,0.4)',
                  whiteSpace: 'nowrap',
                }}
              >
                {member.accurateLocation ? 'Accurate' : 'Approx.'}
              </div>

              {/* Navigate button */}
              <a
                href={member.lat && member.lng ? `https://www.google.com/maps?q=${member.lat},${member.lng}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'rgba(184,114,10,0.12)',
                    border: '1px solid rgba(184,114,10,0.3)',
                    borderRadius: 6,
                    padding: '3px 7px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                >
                  <Navigation size={10} style={{ color: '#B8720A' }} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: '#B8720A' }}>Navigate</span>
                </motion.div>
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. AlertsSection
// ─────────────────────────────────────────────────────────────────────────────

type AlertFilter = 'all' | 'sos' | 'geofence' | 'safety' | 'system';

export function AlertsSection() {
  const [alerts, setAlerts] = useState<Alert[]>(ALERTS_DATA);
  const [filter, setFilter] = useState<AlertFilter>('all');
  const [visibleCount, setVisibleCount] = useState(5);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const filtered = alerts.filter((a) => filter === 'all' || a.type === filter);
  const visible = filtered.slice(0, visibleCount);

  function countByType(type: Alert['type']) {
    return alerts.filter((a) => a.type === type && !a.read).length;
  }

  function resolveAlert(id: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true, read: true } : a))
    );
  }

  const filters: { key: AlertFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: unreadCount },
    { key: 'sos', label: 'SOS', count: countByType('sos') },
    { key: 'geofence', label: 'Geofence', count: countByType('geofence') },
    { key: 'safety', label: 'Safety', count: countByType('safety') },
    { key: 'system', label: 'System', count: countByType('system') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell size={18} style={{ color: '#B8720A' }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Alerts</span>
          {unreadCount > 0 && (
            <div
              style={{
                background: '#EF4444',
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 6px',
                fontSize: 11,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {unreadCount}
            </div>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '5px 11px',
            fontSize: 11,
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Mark all read
        </motion.button>
      </motion.div>

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 2,
          scrollbarWidth: 'none',
        }}
      >
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <motion.button
              key={f.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: active ? 'rgba(184,114,10,0.18)' : 'rgba(255,255,255,0.04)',
                border: active
                  ? '1px solid rgba(184,114,10,0.5)'
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                color: active ? '#B8720A' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              {f.label}
              {f.count > 0 && (
                <div
                  style={{
                    background: active ? '#B8720A' : '#EF4444',
                    borderRadius: 8,
                    minWidth: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  {f.count}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Alert cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence mode="popLayout">
          {visible.map((alert, i) => {
            const borderColor = severityBorderColor(alert.severity);
            const isSOS = alert.type === 'sos' && !alert.resolved;

            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                style={{
                  ...glassCard,
                  padding: '14px 14px 12px',
                  borderLeft: `3px solid ${borderColor}`,
                  background: alert.read
                    ? 'rgba(255,255,255,0.03)'
                    : `rgba(${alert.severity === 'critical' ? '239,68,68' : alert.severity === 'high' ? '245,158,11' : alert.severity === 'medium' ? '59,130,246' : '16,185,129'},0.06)`,
                  boxShadow: !alert.read
                    ? `0 0 0 1px ${borderColor}22, inset 0 0 20px ${borderColor}06`
                    : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* SOS pulse border animation */}
                {isSOS && (
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 16,
                      border: '1px solid rgba(239,68,68,0.5)',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Top row: icon + title + menu */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${borderColor}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AlertTypeIcon type={alert.type} severity={alert.severity} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#fff',
                        marginBottom: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {alert.title}
                      {!alert.read && (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: borderColor,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.58)',
                        lineHeight: 1.45,
                      }}
                    >
                      {alert.description}
                    </div>
                  </div>

                  <MoreVertical
                    size={16}
                    style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, cursor: 'pointer' }}
                  />
                </div>

                {/* Bottom row: member + time + resolve */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 8,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Member */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Avatar member={alert.member} size={22} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                      {alert.member.name}
                    </span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                      · {alert.timestamp}
                    </span>
                  </div>

                  {/* Resolve / Resolved */}
                  {alert.resolved ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: 'rgba(16,185,129,0.12)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: 8,
                        padding: '4px 9px',
                      }}
                    >
                      <Check size={10} style={{ color: '#10B981' }} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#10B981' }}>
                        Resolved
                      </span>
                    </div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={() => resolveAlert(alert.id)}
                      style={{
                        background: `${borderColor}18`,
                        border: `1px solid ${borderColor}44`,
                        borderRadius: 8,
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        color: borderColor,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {isSOS ? (
                        <>
                          <Phone size={11} />
                          Respond
                        </>
                      ) : (
                        <>
                          <Check size={11} />
                          Resolve
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Load more */}
        {visibleCount < filtered.length && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setVisibleCount((v) => v + 5)}
            style={{
              ...glassCard,
              width: '100%',
              padding: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <ChevronRight
              size={14}
              style={{ transform: 'rotate(90deg)', color: 'rgba(255,255,255,0.4)' }}
            />
            Load more alerts ({filtered.length - visibleCount} remaining)
          </motion.button>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              ...glassCard,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              textAlign: 'center',
            }}
          >
            <Shield size={36} style={{ color: '#10B981', opacity: 0.5 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
              No alerts in this category
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
              Your family is safe and all clear.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
