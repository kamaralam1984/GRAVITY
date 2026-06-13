'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export function DashboardSection() {
  const [stats, setStats] = useState({
    activeMembers: 4,
    sosAlerts: 1,
    geofences: 6,
    devices: 4,
  });
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>(ACTIVITY_EVENTS);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate live stat updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({ ...prev, activeMembers: 4 }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
                color: '#10B981',
                marginTop: 4,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <PulseDot color="#10B981" size={7} />
              All 4 members safe
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
        {FAMILY_MEMBERS.map((member, i) => {
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

// Map pin positions (percentage-based within the map card)
const PIN_POSITIONS: Record<string, { x: number; y: number }> = {
  m1: { x: 48, y: 55 },
  m2: { x: 65, y: 30 },
  m3: { x: 75, y: 65 },
  m4: { x: 25, y: 70 },
};

export function FamilyMapSection() {
  const [refreshing, setRefreshing] = useState(false);
  const [accurateToggles, setAccurateToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(FAMILY_MEMBERS.map((m) => [m.id, m.accurateLocation]))
  );

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }

  function toggleAccurate(id: string) {
    setAccurateToggles((prev) => ({ ...prev, [id]: !prev[id] }));
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

      {/* Map card */}
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
          background: '#0D1B2A',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Grid lines (CSS map grid) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px),
              repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px)
            `,
          }}
        />

        {/* Road-like lines */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}
          viewBox="0 0 400 280"
          preserveAspectRatio="none"
        >
          <path d="M0 140 Q100 120 200 130 T400 140" stroke="#B8720A" strokeWidth="3" fill="none" />
          <path d="M180 0 Q190 70 185 140 T200 280" stroke="#3B82F6" strokeWidth="2" fill="none" />
          <path d="M0 200 Q80 190 160 195 T400 200" stroke="#10B981" strokeWidth="1.5" fill="none" />
          <path d="M300 0 Q310 60 305 140 T300 280" stroke="#8B5CF6" strokeWidth="1.5" fill="none" />
          <path d="M0 60 Q200 50 400 70" stroke="#B8720A" strokeWidth="1" fill="none" />
        </svg>

        {/* Home marker */}
        <div
          style={{
            position: 'absolute',
            left: '46%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'rgba(184,114,10,0.2)',
              border: '1.5px solid rgba(184,114,10,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Home size={11} style={{ color: '#B8720A' }} />
          </div>
        </div>

        {/* Member pins */}
        {FAMILY_MEMBERS.map((member) => {
          const pos = PIN_POSITIONS[member.id];
          return (
            <div
              key={member.id}
              style={{
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
              }}
            >
              {/* Ping animation */}
              <motion.div
                animate={{ scale: [1, 3], opacity: [0.5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: member.avatarColor,
                  width: 12,
                  height: 12,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />

              {/* Pin dot */}
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: member.avatarColor,
                  border: '2px solid rgba(255,255,255,0.9)',
                  boxShadow: `0 0 8px ${member.avatarColor}88`,
                  position: 'relative',
                  zIndex: 2,
                }}
              />

              {/* Name label */}
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(11,13,19,0.85)',
                  border: `1px solid ${member.avatarColor}55`,
                  borderRadius: 5,
                  padding: '2px 6px',
                  fontSize: 9,
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  zIndex: 3,
                }}
              >
                {member.name}
              </div>
            </div>
          );
        })}

        {/* "Open full map" overlay button */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            zIndex: 20,
          }}
        >
          <motion.button
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
            Open full map
          </motion.button>
        </div>

        {/* Scale indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <div
            style={{
              width: 30,
              height: 2,
              background: 'rgba(255,255,255,0.35)',
              borderRadius: 1,
            }}
          />
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>500m</span>
        </div>
      </motion.div>

      {/* Member location cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {FAMILY_MEMBERS.map((member, i) => (
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
                {accurateToggles[member.id] ? member.coordinates : '~' + member.distanceFromHome + ' from home'} · {member.lastSeen}
              </div>
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              {/* Accurate toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleAccurate(member.id)}
                style={{
                  background: accurateToggles[member.id]
                    ? 'rgba(16,185,129,0.15)'
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${accurateToggles[member.id] ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 6,
                  padding: '3px 7px',
                  fontSize: 9,
                  fontWeight: 600,
                  color: accurateToggles[member.id] ? '#10B981' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {accurateToggles[member.id] ? 'Accurate' : 'Approx.'}
              </motion.button>

              {/* Navigate button */}
              <motion.button
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
              </motion.button>
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
