'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getToken, getUser, updateUser } from '@/lib/auth';
import {
  MapPin,
  Shield,
  Navigation,
  Clock,
  MessageSquare,
  Send,
  Settings,
  Bell,
  Lock,
  ChevronRight,
  Check,
  Plus,
  Edit,
  Trash2,
  Heart,
  Activity,
  Moon,
  Droplets,
  Flame,
  Users,
  Smartphone,
  CreditCard,
  Key,
  Globe,
  LogOut,
  X,
  Star,
  Calendar,
  Route,
  Zap,
  Copy,
  RefreshCw,
} from 'lucide-react';

// ─── Shared Utilities ──────────────────────────────────────────────────────────

function AnimatedToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-8 h-5 rounded-full transition-colors duration-300 focus:outline-none ${
        value ? 'bg-[#D4AF37]' : 'bg-white/10'
      }`}
      aria-checked={value}
      role="switch"
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow"
        animate={{ x: value ? 12 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

function MemberAvatar({
  initials,
  color,
  size = 28,
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-xs text-white flex-shrink-0"
      style={{ width: size, height: size, background: color }}
    >
      {initials}
    </div>
  );
}

// ─── GeofenceSection ──────────────────────────────────────────────────────────

interface Geofence {
  id: string;
  name: string;
  address: string;
  radius: number;
  color: string;
  colorHex: string;
  members: { name: string; initials: string; color: string }[];
  active: boolean;
  type: 'safe' | 'restricted';
  mapX: number;
  mapY: number;
  recentActivity: { action: string; member: string; time: string }[];
}

const INITIAL_GEOFENCES: Geofence[] = [
  {
    id: 'home',
    name: 'Home',
    address: 'Andheri West, Mumbai',
    radius: 200,
    color: 'green',
    colorHex: '#22c55e',
    members: [
      { name: 'Priya', initials: 'P', color: '#D4AF37' },
      { name: 'Rahul', initials: 'R', color: '#3b82f6' },
      { name: 'Aarav', initials: 'A', color: '#a855f7' },
    ],
    active: true,
    type: 'safe',
    mapX: 40,
    mapY: 55,
    recentActivity: [
      { action: 'entered', member: 'Aarav', time: '3:45 PM' },
      { action: 'exited', member: 'Rahul', time: '8:15 AM' },
    ],
  },
  {
    id: 'school',
    name: 'School — DPS Mumbai',
    address: 'DPS, Powai, Mumbai',
    radius: 300,
    color: 'blue',
    colorHex: '#3b82f6',
    members: [{ name: 'Aarav', initials: 'A', color: '#a855f7' }],
    active: true,
    type: 'safe',
    mapX: 65,
    mapY: 35,
    recentActivity: [
      { action: 'entered', member: 'Aarav', time: '7:58 AM' },
      { action: 'exited', member: 'Aarav', time: '3:30 PM' },
    ],
  },
  {
    id: 'office',
    name: 'Office — Bandra',
    address: 'BKC, Bandra East, Mumbai',
    radius: 500,
    color: 'amber',
    colorHex: '#f59e0b',
    members: [{ name: 'Rahul', initials: 'R', color: '#3b82f6' }],
    active: true,
    type: 'safe',
    mapX: 25,
    mapY: 70,
    recentActivity: [
      { action: 'entered', member: 'Rahul', time: '9:10 AM' },
    ],
  },
  {
    id: 'mall',
    name: 'Mall — No-go Zone',
    address: 'Phoenix Mall, Kurla',
    radius: 250,
    color: 'red',
    colorHex: '#ef4444',
    members: [{ name: 'Aarav', initials: 'A', color: '#a855f7' }],
    active: true,
    type: 'restricted',
    mapX: 72,
    mapY: 65,
    recentActivity: [],
  },
];

export function GeofenceSection() {
  const [geofences, setGeofences] = useState<Geofence[]>(INITIAL_GEOFENCES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGeofence, setSelectedGeofence] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add modal state
  const [newZone, setNewZone] = useState({
    name: '',
    address: '',
    radius: 200,
    members: [] as string[],
    alertType: 'both' as 'entry' | 'exit' | 'both',
  });

  const allMembers = [
    { name: 'Priya', initials: 'P', color: '#D4AF37' },
    { name: 'Rahul', initials: 'R', color: '#3b82f6' },
    { name: 'Aarav', initials: 'A', color: '#a855f7' },
  ];

  const recentEvents = [
    { member: 'Aarav', initials: 'A', color: '#a855f7', action: 'entered', zone: 'School zone', time: '7:58 AM' },
    { member: 'Rahul', initials: 'R', color: '#3b82f6', action: 'entered', zone: 'Office zone', time: '9:10 AM' },
    { member: 'Aarav', initials: 'A', color: '#a855f7', action: 'exited', zone: 'School zone', time: '3:30 PM' },
    { member: 'Aarav', initials: 'A', color: '#a855f7', action: 'entered', zone: 'Home', time: '3:45 PM' },
    { member: 'Priya', initials: 'P', color: '#D4AF37', action: 'exited', zone: 'Home', time: '10:00 AM' },
  ];

  function toggleGeofence(id: string) {
    setGeofences((prev) =>
      prev.map((g) => (g.id === id ? { ...g, active: !g.active } : g))
    );
  }

  function deleteGeofence(id: string) {
    setGeofences((prev) => prev.filter((g) => g.id !== id));
  }

  function toggleMember(name: string) {
    setNewZone((prev) => ({
      ...prev,
      members: prev.members.includes(name)
        ? prev.members.filter((m) => m !== name)
        : [...prev.members, name],
    }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Geofences</h2>
            <p className="text-white/50 text-sm">{geofences.filter((g) => g.active).length} active zones</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] text-black font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Zone
        </motion.button>
      </div>

      {/* Map View Placeholder */}
      <div
        className="relative rounded-2xl overflow-hidden border border-white/10"
        style={{ height: 200, background: 'linear-gradient(135deg, #0a1628 0%, #0f2040 50%, #0a1628 100%)' }}
      >
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          {[...Array(8)].map((_, i) => (
            <line key={`v${i}`} x1={`${(i + 1) * 12.5}%`} y1="0" x2={`${(i + 1) * 12.5}%`} y2="100%" stroke="#D4AF37" strokeWidth="0.5" />
          ))}
          {[...Array(5)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={`${(i + 1) * 16.67}%`} x2="100%" y2={`${(i + 1) * 16.67}%`} stroke="#D4AF37" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Map label */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-[#D4AF37] text-xs font-semibold">Mumbai Region</span>
        </div>

        {/* Geofence circles on map */}
        {geofences.map((gf) => (
          <motion.div
            key={gf.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ left: `${gf.mapX}%`, top: `${gf.mapY}%` }}
            onClick={() => setSelectedGeofence(gf.id === selectedGeofence ? null : gf.id)}
          >
            {/* Pulse ring */}
            {gf.active && (
              <motion.div
                className="absolute rounded-full border-2"
                style={{
                  borderColor: gf.colorHex,
                  width: gf.radius / 6,
                  height: gf.radius / 6,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            {/* Main circle */}
            <div
              className="rounded-full border-2 flex items-center justify-center"
              style={{
                borderColor: gf.colorHex,
                background: `${gf.colorHex}22`,
                width: gf.radius / 8,
                height: gf.radius / 8,
                minWidth: 28,
                minHeight: 28,
              }}
            >
              <MapPin style={{ color: gf.colorHex, width: 10, height: 10 }} />
            </div>
            {/* Label */}
            <div
              className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ color: gf.colorHex, background: '#0a162888' }}
            >
              {gf.name.split(' — ')[0]}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Geofence Cards */}
      <div className="space-y-3">
        {geofences.map((gf) => (
          <motion.div
            key={gf.id}
            layout
            className="rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            {/* Card main row */}
            <div className="flex items-center gap-3 p-4" style={{ borderLeft: `3px solid ${gf.colorHex}` }}>
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${gf.colorHex}22` }}
              >
                <Shield style={{ color: gf.colorHex, width: 18, height: 18 }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm truncate">{gf.name}</span>
                  {gf.type === 'restricted' && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-semibold">NO-GO</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-white/40 text-xs">{gf.radius}m radius</span>
                  {/* Avatar stack */}
                  <div className="flex -space-x-1.5">
                    {gf.members.map((m) => (
                      <MemberAvatar key={m.name} initials={m.initials} color={m.color} size={18} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggle + Actions */}
              <div className="flex items-center gap-3">
                <AnimatedToggle value={gf.active} onChange={() => toggleGeofence(gf.id)} />
                <button
                  onClick={() => setExpandedId(expandedId === gf.id ? null : gf.id)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <ChevronRight
                    className="w-4 h-4 transition-transform duration-200"
                    style={{ transform: expandedId === gf.id ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  />
                </button>
              </div>
            </div>

            {/* Expanded section */}
            <AnimatePresence>
              {expandedId === gf.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-white/5"
                >
                  <div className="px-4 py-3 space-y-3">
                    {/* Address */}
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <MapPin className="w-3.5 h-3.5" />
                      {gf.address}
                    </div>

                    {/* Recent Activity */}
                    {gf.recentActivity.length > 0 && (
                      <div>
                        <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">Recent Activity</p>
                        <div className="space-y-1.5">
                          {gf.recentActivity.map((ev, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: ev.action === 'entered' ? '#22c55e' : '#f59e0b' }}
                              />
                              <span className="text-white/60">
                                <span className="text-white/80 font-medium">{ev.member}</span>{' '}
                                {ev.action} zone
                              </span>
                              <span className="text-white/30 ml-auto">{ev.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors px-3 py-1.5 rounded-lg bg-white/5">
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors px-3 py-1.5 rounded-lg bg-white/5">
                        <MapPin className="w-3.5 h-3.5" />
                        View on Map
                      </button>
                      <button
                        onClick={() => deleteGeofence(gf.id)}
                        className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg bg-red-500/10 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Feed */}
      <div className="rounded-2xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {recentEvents.map((ev, i) => (
            <div key={i} className="flex items-center gap-3">
              <MemberAvatar initials={ev.initials} color={ev.color} size={28} />
              <div className="flex-1">
                <span className="text-white/80 text-sm">
                  <span className="font-semibold">{ev.member}</span>{' '}
                  <span className={ev.action === 'entered' ? 'text-green-400' : 'text-amber-400'}>{ev.action}</span>{' '}
                  {ev.zone}
                </span>
              </div>
              <span className="text-white/30 text-xs">{ev.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Zone Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t border-white/10 p-6 space-y-5"
              style={{ background: 'linear-gradient(180deg, #0f1e38 0%, #0a1628 100%)' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Add New Zone</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Zone Name */}
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">Zone Name</label>
                <input
                  type="text"
                  value={newZone.name}
                  onChange={(e) => setNewZone((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Grandma's House"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#D4AF37]/50"
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">Address</label>
                <input
                  type="text"
                  value={newZone.address}
                  onChange={(e) => setNewZone((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Search address..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#D4AF37]/50"
                />
              </div>

              {/* Radius Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Radius</label>
                  <span className="text-[#D4AF37] text-sm font-bold">{newZone.radius}m</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={1000}
                  step={50}
                  value={newZone.radius}
                  onChange={(e) => setNewZone((p) => ({ ...p, radius: Number(e.target.value) }))}
                  className="w-full accent-[#D4AF37]"
                />
                <div className="flex justify-between text-white/20 text-xs mt-1">
                  <span>50m</span>
                  <span>1km</span>
                </div>
              </div>

              {/* Members */}
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">Members</label>
                <div className="flex gap-2 flex-wrap">
                  {allMembers.map((m) => (
                    <button
                      key={m.name}
                      onClick={() => toggleMember(m.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        newZone.members.includes(m.name)
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                          : 'border-white/10 bg-white/5 text-white/50'
                      }`}
                    >
                      <MemberAvatar initials={m.initials} color={m.color} size={16} />
                      {m.name}
                      {newZone.members.includes(m.name) && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert Type */}
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">Alert Type</label>
                <div className="flex gap-2">
                  {(['entry', 'exit', 'both'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewZone((p) => ({ ...p, alertType: type }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        newZone.alertType === type
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                          : 'border-white/10 bg-white/5 text-white/40'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(false)}
                className="w-full py-3.5 rounded-2xl bg-[#D4AF37] text-black font-bold text-sm"
              >
                Save Zone
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── JourneySection ────────────────────────────────────────────────────────────

interface Journey {
  id: string;
  member: string;
  initials: string;
  memberColor: string;
  from: string;
  to: string;
  startTime: string;
  mode: 'bus' | 'car' | 'walk';
  distance: number;
  status: 'active' | 'completed';
  progress: number;
  eta?: string;
  speed?: number;
  score?: number;
  date: 'today' | 'yesterday' | 'week';
}

const MODE_CONFIG = {
  bus: { icon: '🚌', label: 'Bus', color: '#3b82f6' },
  car: { icon: '🚗', label: 'Car', color: '#f59e0b' },
  walk: { icon: '🚶', label: 'Walk', color: '#22c55e' },
};

const MEMBER_COLORS = ['#a855f7','#3b82f6','#10b981','#f59e0b','#ef4444','#D4AF37'];
function nameToColor(name: string) {
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % MEMBER_COLORS.length;
  return MEMBER_COLORS[h];
}
function formatTime(iso: string | null) {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function getDateLabel(iso: string | null): 'today' | 'yesterday' | 'week' {
  if (!iso) return 'week';
  const d = new Date(iso); const now = new Date();
  const daysDiff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (daysDiff === 0) return 'today';
  if (daysDiff === 1) return 'yesterday';
  return 'week';
}

interface ApiJourney { id: number; from_location: string; to_location: string; started_at: string; arrived_at: string | null; status: string; distance_km: number | null; speed: number | null; user_name?: string; from?: string; to?: string; }

function apiToJourney(j: ApiJourney, memberName: string): Journey {
  return {
    id: String(j.id),
    member: j.user_name || memberName,
    initials: (j.user_name || memberName).charAt(0).toUpperCase(),
    memberColor: nameToColor(j.user_name || memberName),
    from: j.from_location || j.from || 'Unknown',
    to: j.to_location || j.to || 'Unknown',
    startTime: formatTime(j.started_at),
    mode: 'car',
    distance: j.distance_km ?? 0,
    status: j.status === 'active' ? 'active' : 'completed',
    progress: j.status === 'active' ? 50 : 100,
    speed: j.speed ?? undefined,
    date: getDateLabel(j.started_at),
  };
}

export function JourneySection() {
  const [selectedJourney, setSelectedJourney] = useState<string | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStart, setShowStart] = useState(false);
  const [startForm, setStartForm] = useState({ from: '', to: '' });
  const [starting, setStarting] = useState(false);

  async function fetchJourneys() {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('gv_token') || '' : '';
      const headers: Record<string,string> = token ? { Authorization: `Bearer ${token}` } : {};
      const [activeRes, myRes] = await Promise.all([
        fetch('/journeys/active', { headers }),
        fetch('/journeys/my', { headers }),
      ]);
      const allMap = new Map<string, Journey>();
      if (activeRes.ok) {
        const data = await activeRes.json();
        (data.journeys || []).forEach((j: ApiJourney) => {
          const journey = apiToJourney(j, j.user_name || 'Member');
          allMap.set(journey.id, journey);
        });
      }
      if (myRes.ok) {
        const data = await myRes.json();
        (data.journeys || []).forEach((j: ApiJourney) => {
          if (!allMap.has(String(j.id))) {
            const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('gv_user') || '{}') : {};
            const journey = apiToJourney(j, user.name || 'You');
            allMap.set(journey.id, journey);
          }
        });
      }
      setJourneys(Array.from(allMap.values()));
    } catch (_) {}
    setLoading(false);
  }

  useEffect(() => { fetchJourneys(); }, []);

  async function handleStartJourney() {
    if (!startForm.from || !startForm.to) return;
    setStarting(true);
    try {
      const token = localStorage.getItem('gv_token') || '';
      const res = await fetch('/journeys/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ from_location: startForm.from, to_location: startForm.to }),
      });
      if (res.ok) { setShowStart(false); setStartForm({ from: '', to: '' }); fetchJourneys(); }
    } catch (_) {}
    setStarting(false);
  }

  const activeJourneys = journeys.filter((j) => j.status === 'active');
  const historyJourneys = journeys.filter((j) => j.status === 'completed');
  const todayJourneys = historyJourneys.filter((j) => j.date === 'today');
  const yesterdayJourneys = historyJourneys.filter((j) => j.date === 'yesterday');
  const weekJourneys = historyJourneys.filter((j) => j.date === 'week');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Route className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Family Journeys</h2>
            <p className="text-white/50 text-sm">Live tracking & history</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeJourneys.length > 0 && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-green-400 text-xs font-semibold">{activeJourneys.length} Active</span>
            </motion.div>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowStart(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37] text-black text-xs font-bold"
          >
            <Zap className="w-3.5 h-3.5" />
            Start
          </motion.button>
        </div>
      </div>

      {/* Start Journey Modal */}
      <AnimatePresence>
        {showStart && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60"
              onClick={() => setShowStart(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-2xl p-5 space-y-4"
              style={{ background: 'rgba(18,22,36,0.98)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <h3 className="text-white font-bold text-lg">Start New Journey</h3>
              <div className="space-y-3">
                <input
                  value={startForm.from}
                  onChange={e => setStartForm(p => ({ ...p, from: e.target.value }))}
                  placeholder="From (e.g. Home)"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <input
                  value={startForm.to}
                  onChange={e => setStartForm(p => ({ ...p, to: e.target.value }))}
                  placeholder="To (e.g. School)"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowStart(false)} className="flex-1 py-3 rounded-xl text-white/50 text-sm font-semibold border border-white/10">Cancel</button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStartJourney}
                  disabled={starting || !startForm.from || !startForm.to}
                  className="flex-1 py-3 rounded-xl bg-[#D4AF37] text-black text-sm font-bold disabled:opacity-50"
                >{starting ? 'Starting...' : 'Start Journey'}</motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && journeys.length === 0 && (
        <div className="rounded-2xl p-8 text-center space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-4xl">🗺️</div>
          <p className="text-white font-semibold">No journeys yet</p>
          <p className="text-white/40 text-sm">Tap "Start" to begin tracking a journey. Your family will see it live.</p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowStart(true)} className="mt-2 px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black text-sm font-bold">Start First Journey</motion.button>
        </div>
      )}

      {/* Active Journeys */}
      {!loading && activeJourneys.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider">Live Now</h3>
          {activeJourneys.map((journey) => {
            const mode = MODE_CONFIG[journey.mode];
            return (
              <motion.div
                key={journey.id}
                layout
                className="rounded-2xl p-4 border border-white/10 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                }}
                onClick={() => setSelectedJourney(journey.id === selectedJourney ? null : journey.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <MemberAvatar initials={journey.initials} color={journey.memberColor} size={36} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">{journey.member}</span>
                      <span className="text-lg">{mode.icon}</span>
                      {journey.speed && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${mode.color}22`, color: mode.color }}
                        >
                          {journey.speed} km/h
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-white/50 text-xs mt-0.5">
                      <span>{journey.from}</span>
                      <Navigation className="w-3 h-3" />
                      <span>{journey.to}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {journey.eta ? (
                      <>
                        <p className="text-white/40 text-xs">ETA</p>
                        <p className="text-[#D4AF37] font-bold text-sm">{journey.eta}</p>
                      </>
                    ) : (
                      <span className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        Arrived
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-white/30 mb-1.5">
                    <span>{journey.from}</span>
                    <span>{journey.distance} km</span>
                    <span>{journey.to}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${mode.color}, ${journey.eta ? '#D4AF37' : '#22c55e'})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${journey.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  {/* Moving dot */}
                  <div className="relative h-0">
                    <motion.div
                      className="absolute top-0 w-3 h-3 rounded-full -translate-y-2.5 -translate-x-1.5 border-2 border-white"
                      style={{
                        left: `${journey.progress}%`,
                        background: journey.eta ? '#D4AF37' : '#22c55e',
                      }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37] text-black text-xs font-bold"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Track Live
                  </motion.button>
                  <span className="text-white/30 text-xs ml-auto">Started {journey.startTime}</span>
                </div>

                {/* Route placeholder */}
                <AnimatePresence>
                  {selectedJourney === journey.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div
                        className="rounded-xl p-4 relative"
                        style={{ height: 120, background: 'linear-gradient(135deg, #0a1628, #0f2040)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        {/* Dotted route */}
                        <svg className="absolute inset-0 w-full h-full">
                          <line x1="15%" y1="50%" x2="85%" y2="50%" stroke={mode.color} strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
                          <circle cx="15%" cy="50%" r="6" fill={mode.color} opacity="0.9" />
                          <circle cx="85%" cy="50%" r="6" fill="#22c55e" opacity="0.9" />
                          {/* Progress dot */}
                          <circle cx={`${15 + journey.progress * 0.7}%`} cy="50%" r="5" fill="#D4AF37">
                            <animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite" />
                          </circle>
                        </svg>
                        <div className="absolute bottom-3 left-4 text-white/30 text-xs">{journey.from}</div>
                        <div className="absolute bottom-3 right-4 text-white/30 text-xs">{journey.to}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Journey History */}
      {!loading && historyJourneys.length > 0 && (
        <div>
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">Journey History</h3>
          <div className="relative">
            <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-white/10 rounded-full" />
            <div className="space-y-0">
              {todayJourneys.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mb-3 pl-10">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">Today</span>
                  </div>
                  {todayJourneys.map((journey) => (
                    <JourneyHistoryItem key={journey.id} journey={journey} />
                  ))}
                </>
              )}
              {yesterdayJourneys.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mb-3 mt-4 pl-10">
                    <Calendar className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Yesterday</span>
                  </div>
                  {yesterdayJourneys.map((journey) => (
                    <JourneyHistoryItem key={journey.id} journey={journey} />
                  ))}
                </>
              )}
              {weekJourneys.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mb-3 mt-4 pl-10">
                    <Calendar className="w-3.5 h-3.5 text-white/20" />
                    <span className="text-white/20 text-xs font-bold uppercase tracking-widest">Earlier</span>
                  </div>
                  {weekJourneys.map((journey) => (
                    <JourneyHistoryItem key={journey.id} journey={journey} />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function JourneyHistoryItem({ journey }: { journey: Journey }) {
  const mode = MODE_CONFIG[journey.mode];
  return (
    <div className="flex items-start gap-3 mb-4">
      {/* Timeline dot */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 border-[#0a1628] z-10"
        style={{ background: mode.color }}
      >
        <span className="text-xs">{mode.icon}</span>
      </div>

      {/* Content */}
      <div
        className="flex-1 rounded-2xl p-3 border border-white/8"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <MemberAvatar initials={journey.initials} color={journey.memberColor} size={22} />
            <span className="text-white font-semibold text-sm">{journey.member}</span>
          </div>
          {journey.score !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs font-bold">{journey.score}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-white/50 text-xs">
          <span>{journey.from}</span>
          <Navigation className="w-3 h-3" />
          <span>{journey.to}</span>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-white/30 text-xs">{journey.startTime}</span>
          <span className="text-white/20">•</span>
          <span className="text-white/30 text-xs">{journey.distance} km</span>
          <span className="text-white/20">•</span>
          <span className="text-xs font-medium" style={{ color: mode.color }}>{mode.label}</span>
          <span className="ml-auto flex items-center gap-1 text-green-400 text-xs">
            <Check className="w-3 h-3" />
            Completed
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── FamilyChatSection ─────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  sender: string;
  initials: string;
  senderColor: string;
  text: string;
  time: string;
  type: 'sent' | 'received' | 'system';
  read?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'System',
    initials: '',
    senderColor: '',
    text: 'Aarav arrived at School — DPS Mumbai',
    time: '7:58 AM',
    type: 'system',
  },
  {
    id: 'm2',
    sender: 'Priya',
    initials: 'P',
    senderColor: '#D4AF37',
    text: 'Good morning everyone! Have a great day 🌟',
    time: '8:00 AM',
    type: 'sent',
    read: true,
  },
  {
    id: 'm3',
    sender: 'Rahul',
    initials: 'R',
    senderColor: '#3b82f6',
    text: 'Morning! Heading to office now. Traffic is heavy on the highway.',
    time: '8:32 AM',
    type: 'received',
  },
  {
    id: 'm4',
    sender: 'Aarav',
    initials: 'A',
    senderColor: '#a855f7',
    text: 'Reached school safely! 😊',
    time: '8:05 AM',
    type: 'received',
  },
  {
    id: 'm5',
    sender: 'Priya',
    initials: 'P',
    senderColor: '#D4AF37',
    text: 'Great Aarav! Be good in class.',
    time: '8:06 AM',
    type: 'sent',
    read: true,
  },
  {
    id: 'm6',
    sender: 'System',
    initials: '',
    senderColor: '',
    text: 'Rahul entered Office — Bandra zone',
    time: '9:10 AM',
    type: 'system',
  },
];

const QUICK_MESSAGES = [
  { text: 'Where are you?', emoji: '🗺️' },
  { text: 'Come home now', emoji: '🏠' },
  { text: 'Are you safe?', emoji: '✅' },
  { text: "I'm on my way", emoji: '🚗' },
  { text: 'Stay where you are', emoji: '📍' },
];

const CHAT_TABS = [
  { id: 'family', label: 'Family Group', initials: 'FG', color: '#D4AF37' },
  { id: 'aarav', label: 'Aarav', initials: 'A', color: '#a855f7' },
  { id: 'rahul', label: 'Rahul', initials: 'R', color: '#3b82f6' },
];

export function FamilyChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [activeChat, setActiveChat] = useState('family');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const msg: ChatMessage = {
      id: `m${Date.now()}`,
      sender: 'Priya',
      initials: 'P',
      senderColor: '#D4AF37',
      text: text.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type: 'sent',
      read: false,
    };
    setMessages((prev) => [...prev, msg]);
    setInputText('');
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Family Chat</h2>
            <p className="text-white/50 text-sm">3 members online</p>
          </div>
        </div>
        <div className="flex -space-x-1.5">
          {[
            { i: 'P', c: '#D4AF37' },
            { i: 'R', c: '#3b82f6' },
            { i: 'A', c: '#a855f7' },
          ].map((m, idx) => (
            <div key={idx} className="relative">
              <MemberAvatar initials={m.i} color={m.c} size={28} />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border border-[#0a1628]" />
            </div>
          ))}
        </div>
      </div>

      {/* Chat Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CHAT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveChat(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${
              activeChat === tab.id
                ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                : 'border-white/10 bg-white/5 text-white/50'
            }`}
          >
            <MemberAvatar initials={tab.initials} color={tab.color} size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message Thread */}
      <div
        ref={scrollRef}
        className="space-y-3 overflow-y-auto pr-1"
        style={{ height: 350, scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
      >
        {messages.map((msg, i) => {
          const prevMsg = messages[i - 1];
          const showName = msg.type === 'received' && (!prevMsg || prevMsg.sender !== msg.sender || prevMsg.type !== 'received');

          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <Shield className="w-3 h-3 text-[#D4AF37]" />
                  <span className="text-white/40 text-xs">{msg.text}</span>
                  <span className="text-white/20 text-xs">· {msg.time}</span>
                </div>
              </div>
            );
          }

          if (msg.type === 'sent') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-xs">
                  <div
                    className="px-4 py-2.5 rounded-2xl rounded-tr-sm text-white text-sm leading-relaxed"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #c4a02d)' }}
                  >
                    <span className="text-black">{msg.text}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-white/25 text-xs">{msg.time}</span>
                    <span className="text-[#D4AF37] text-xs">
                      {msg.read ? '✓✓' : '✓'}
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex items-end gap-2">
              <MemberAvatar initials={msg.initials} color={msg.senderColor} size={28} />
              <div className="max-w-xs">
                {showName && (
                  <p className="text-white/40 text-xs mb-1 ml-1">{msg.sender}</p>
                )}
                <div
                  className="px-4 py-2.5 rounded-2xl rounded-tl-sm text-white/85 text-sm leading-relaxed"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {msg.text}
                </div>
                <span className="text-white/25 text-xs mt-1 ml-1 block">{msg.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Safety Messages */}
      <div>
        <p className="text-white/30 text-xs mb-2 font-medium">Quick Messages</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_MESSAGES.map((qm) => (
            <button
              key={qm.text}
              onClick={() => sendMessage(`${qm.emoji} ${qm.text}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-medium whitespace-nowrap hover:border-[#D4AF37]/40 hover:text-white/80 transition-all flex-shrink-0"
            >
              <span>{qm.emoji}</span>
              {qm.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div
        className="flex items-center gap-2 p-2 rounded-2xl border border-white/10"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <button className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
          placeholder="Message your family..."
          className="flex-1 bg-transparent text-white text-sm placeholder-white/25 focus:outline-none"
        />
        <button className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors flex-shrink-0">
          <span className="text-base">😊</span>
        </button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => sendMessage(inputText)}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: inputText.trim()
              ? 'linear-gradient(135deg, #D4AF37, #c4a02d)'
              : 'rgba(255,255,255,0.05)',
          }}
        >
          <Send
            className="w-4 h-4"
            style={{ color: inputText.trim() ? '#000' : 'rgba(255,255,255,0.2)' }}
          />
        </motion.button>
      </div>
    </div>
  );
}

// ─── ParentSettingsSection ─────────────────────────────────────────────────────

interface SettingToggle {
  pushNotifications: boolean;
  smsAlerts: boolean;
  geofenceAlerts: boolean;
  journeyUpdates: boolean;
  healthAlerts: boolean;
  locationHistory: boolean;
  preciseLocation: boolean;
  twoFactor: boolean;
  appLock: boolean;
}

export function ParentSettingsSection() {
  const [toggles, setToggles] = useState<SettingToggle>({
    pushNotifications: true,
    smsAlerts: true,
    geofenceAlerts: true,
    journeyUpdates: true,
    healthAlerts: false,
    locationHistory: true,
    preciseLocation: true,
    twoFactor: true,
    appLock: true,
  });

  const [alertSensitivity, setAlertSensitivity] = useState(2);
  const [profileUser, setProfileUser] = useState(() => getUser());
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  function setToggle(key: keyof SettingToggle) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function openEdit() {
    setEditName(profileUser?.name ?? '');
    setEditPhone(profileUser?.phone ?? '');
    setEditError('');
    setEditSuccess(false);
    setShowEditProfile(true);
  }

  async function saveProfile() {
    setEditLoading(true);
    setEditError('');
    try {
      const token = getToken();
      const res = await fetch('/auth/profile', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), phone: editPhone.trim() || null }),
      });
      if (!res.ok) {
        const d = await res.json();
        setEditError(d.detail ?? 'Update failed');
        return;
      }
      const updated = await res.json();
      updateUser({ name: updated.name, phone: updated.phone });
      setProfileUser(getUser());
      setEditSuccess(true);
      setTimeout(() => setShowEditProfile(false), 1200);
    } catch {
      setEditError('Network error');
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEditProfile(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)' }}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
                background: '#12131F', borderRadius: '20px 20px 0 0',
                border: '1px solid rgba(212,175,55,0.2)',
                padding: '24px 20px 36px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Edit Profile</span>
                <button onClick={() => setShowEditProfile(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '6px 10px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name</label>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Your name"
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Phone Number</label>
                  <input
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    type="tel"
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 5 }}>
                    Yeh number child ke SOS contacts mein dikhega
                  </p>
                </div>

                {editError && <p style={{ fontSize: 12, color: '#EF4444' }}>{editError}</p>}
                {editSuccess && <p style={{ fontSize: 12, color: '#10B981' }}>✓ Profile update ho gaya!</p>}

                <button
                  onClick={saveProfile}
                  disabled={editLoading || !editName.trim()}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12,
                    background: editLoading ? 'rgba(212,175,55,0.4)' : 'linear-gradient(135deg, #D4AF37, #b8902d)',
                    border: 'none', color: '#000', fontSize: 15, fontWeight: 700, cursor: editLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-[#D4AF37]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <p className="text-white/50 text-sm">Family & account preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <div
        className="rounded-2xl p-5 border border-white/10"
        style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(255,255,255,0.03) 100%)' }}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-black font-black text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #c4a02d)' }}
          >
            {(profileUser?.name?.[0] ?? 'P').toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-lg">{profileUser?.name ?? 'Parent'}</h3>
              <button onClick={openEdit} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
                <Edit className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-semibold">Family Admin</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-white/40 text-xs">
              <span>{profileUser?.email ?? ''}</span>
            </div>
            {profileUser?.phone ? (
              <div className="flex items-center gap-2 mt-1 text-white/50 text-xs">
                <Smartphone className="w-3 h-3" />
                <span>{profileUser.phone}</span>
              </div>
            ) : (
              <button onClick={openEdit} className="flex items-center gap-1 mt-1 text-xs text-amber-400/70 hover:text-amber-400 transition-colors">
                <Plus className="w-3 h-3" />
                <span>Phone number add karo (SOS ke liye)</span>
              </button>
            )}
          </div>
        </div>

        {/* Plan badge */}
        <div
          className="mt-4 flex items-center justify-between p-3 rounded-xl border border-[#D4AF37]/20"
          style={{ background: 'rgba(212,175,55,0.05)' }}
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[#D4AF37] font-semibold text-sm">Premium Plan</span>
            <span className="text-white/30 text-xs">· Active</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-black text-xs font-bold"
          >
            Manage
          </motion.button>
        </div>
      </div>

      {/* Settings Groups */}
      <SettingsGroup title="Family & Members" icon={<Users className="w-4 h-4 text-[#D4AF37]" />}>
        <SettingsRow
          icon={<Users className="w-4 h-4 text-blue-400" />}
          label="Manage Family Members"
          sublabel="Add or remove members"
          action="chevron"
        />
        <SettingsRow
          icon={<Bell className="w-4 h-4 text-amber-400" />}
          label="Pending Invitations"
          sublabel="1 pending"
          badge="1"
          action="chevron"
        />
        <SettingsRow
          icon={<Shield className="w-4 h-4 text-green-400" />}
          label="Family Permissions"
          sublabel="Control who can see what"
          action="chevron"
        />
      </SettingsGroup>

      <SettingsGroup title="Safety & Alerts" icon={<Shield className="w-4 h-4 text-red-400" />}>
        <SettingsRow
          icon={<Heart className="w-4 h-4 text-red-400" />}
          label="Emergency Contacts"
          sublabel="3 contacts saved"
          badge="3"
          action="chevron"
        />
        <SettingsRow
          icon={<Zap className="w-4 h-4 text-amber-400" />}
          label="SOS Settings"
          sublabel="Auto-call & contact order"
          action="chevron"
        />
        {/* Alert Sensitivity */}
        <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Activity className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="text-white/85 text-sm font-medium">Alert Sensitivity</p>
            <div className="flex items-center gap-2 mt-2">
              {['Low', 'Medium', 'High'].map((level, idx) => (
                <button
                  key={level}
                  onClick={() => setAlertSensitivity(idx)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    alertSensitivity === idx
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                      : 'border-white/10 bg-white/5 text-white/30'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
        <SettingsRow
          icon={<Moon className="w-4 h-4 text-indigo-400" />}
          label="Quiet Hours"
          sublabel="10:00 PM – 6:00 AM"
          action="chevron"
        />
      </SettingsGroup>

      <SettingsGroup title="Location & Privacy" icon={<Globe className="w-4 h-4 text-blue-400" />}>
        <SettingsRow
          icon={<Clock className="w-4 h-4 text-blue-400" />}
          label="Location History"
          sublabel="30 days stored"
          action="toggle"
          toggleValue={toggles.locationHistory}
          onToggle={() => setToggle('locationHistory')}
        />
        <SettingsRow
          icon={<Globe className="w-4 h-4 text-green-400" />}
          label="Share Location With"
          sublabel="Family only"
          action="chevron"
        />
        <SettingsRow
          icon={<MapPin className="w-4 h-4 text-amber-400" />}
          label="Location Accuracy"
          sublabel={toggles.preciseLocation ? 'Precise' : 'Approximate'}
          action="toggle"
          toggleValue={toggles.preciseLocation}
          onToggle={() => setToggle('preciseLocation')}
        />
      </SettingsGroup>

      <SettingsGroup title="Notifications" icon={<Bell className="w-4 h-4 text-amber-400" />}>
        <SettingsRow
          icon={<Bell className="w-4 h-4 text-amber-400" />}
          label="Push Notifications"
          sublabel="In-app alerts"
          action="toggle"
          toggleValue={toggles.pushNotifications}
          onToggle={() => setToggle('pushNotifications')}
        />
        <SettingsRow
          icon={<MessageSquare className="w-4 h-4 text-green-400" />}
          label="SMS Alerts"
          sublabel="Critical events only"
          action="toggle"
          toggleValue={toggles.smsAlerts}
          onToggle={() => setToggle('smsAlerts')}
        />
        <SettingsRow
          icon={<Shield className="w-4 h-4 text-blue-400" />}
          label="Geofence Alerts"
          sublabel="Entry & exit notifications"
          action="toggle"
          toggleValue={toggles.geofenceAlerts}
          onToggle={() => setToggle('geofenceAlerts')}
        />
        <SettingsRow
          icon={<Route className="w-4 h-4 text-indigo-400" />}
          label="Journey Updates"
          sublabel="Start, arrive & delays"
          action="toggle"
          toggleValue={toggles.journeyUpdates}
          onToggle={() => setToggle('journeyUpdates')}
        />
        <SettingsRow
          icon={<Heart className="w-4 h-4 text-red-400" />}
          label="Health Alerts"
          sublabel="Vitals & activity"
          action="toggle"
          toggleValue={toggles.healthAlerts}
          onToggle={() => setToggle('healthAlerts')}
        />
      </SettingsGroup>

      <SettingsGroup title="Device & Security" icon={<Key className="w-4 h-4 text-green-400" />}>
        <SettingsRow
          icon={<Smartphone className="w-4 h-4 text-blue-400" />}
          label="Linked Devices"
          sublabel="3 devices connected"
          badge="3"
          action="chevron"
        />
        <SettingsRow
          icon={<Shield className="w-4 h-4 text-green-400" />}
          label="Two-Factor Auth"
          sublabel="Enabled"
          badge="ON"
          badgeColor="green"
          action="toggle"
          toggleValue={toggles.twoFactor}
          onToggle={() => setToggle('twoFactor')}
        />
        <SettingsRow
          icon={<Lock className="w-4 h-4 text-[#D4AF37]" />}
          label="App Lock"
          sublabel="PIN / Biometric"
          action="toggle"
          toggleValue={toggles.appLock}
          onToggle={() => setToggle('appLock')}
        />
        <SettingsRow
          icon={<Key className="w-4 h-4 text-purple-400" />}
          label="Session Management"
          sublabel="Active sessions"
          action="chevron"
        />
      </SettingsGroup>

      <SettingsGroup title="Account" icon={<Settings className="w-4 h-4 text-white/40" />}>
        <SettingsRow
          icon={<CreditCard className="w-4 h-4 text-[#D4AF37]" />}
          label="Billing & Plans"
          sublabel="Premium · ₹599/month"
          action="chevron"
        />
        <SettingsRow
          icon={<Navigation className="w-4 h-4 text-blue-400" />}
          label="Download My Data"
          sublabel="Export all data"
          action="chevron"
        />
        <SettingsRow
          icon={<MessageSquare className="w-4 h-4 text-green-400" />}
          label="Help & Support"
          sublabel="FAQs & contact us"
          action="chevron"
        />

        {/* Sign Out */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex items-center gap-3 py-3 border-t border-white/5 mt-1"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-red-400 text-sm font-semibold">Sign Out</p>
            <p className="text-red-400/40 text-xs">Priya@gravity.family</p>
          </div>
        </motion.button>
      </SettingsGroup>
    </div>
  );
}

// ─── SettingsGroup & SettingsRow helpers ──────────────────────────────────────

function SettingsGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
      {/* Group header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        {icon}
        <span className="text-white/50 text-xs font-bold uppercase tracking-widest">{title}</span>
      </div>
      <div className="px-4 divide-y divide-white/5">{children}</div>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  sublabel,
  action,
  toggleValue,
  onToggle,
  badge,
  badgeColor = 'gold',
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  action: 'toggle' | 'chevron';
  toggleValue?: boolean;
  onToggle?: () => void;
  badge?: string;
  badgeColor?: 'gold' | 'green' | 'red';
}) {
  const badgeColors = {
    gold: 'bg-[#D4AF37]/20 text-[#D4AF37]',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white/85 text-sm font-medium truncate">{label}</p>
          {badge && (
            <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${badgeColors[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
        {sublabel && <p className="text-white/35 text-xs mt-0.5">{sublabel}</p>}
      </div>
      {action === 'toggle' && toggleValue !== undefined && onToggle ? (
        <AnimatedToggle value={toggleValue} onChange={onToggle} />
      ) : (
        <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
      )}
    </div>
  );
}

// ─── Family Management Section ────────────────────────────────────────────────
export function FamilySection() {
  const [family, setFamily] = useState<{ id: number; name: string; invite_code: string; plan: string } | null>(null);
  const [members, setMembers] = useState<{ user_id: number; name: string; role: string; is_online: boolean; last_location: string | null; battery: number | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  function getToken() {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('gv_token') || '';
  }

  async function load() {
    setLoading(true);
    const h = { Authorization: `Bearer ${getToken()}` };
    try {
      const famRes = await fetch('/families/my', { headers: h });
      if (!famRes.ok) { setLoading(false); return; }
      const fam = await famRes.json();
      let famData = Array.isArray(fam) ? fam[0] : fam;
      if (!famData?.id) {
        // Auto-create
        const cr = await fetch('/families/create', {
          method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'My Family' }),
        });
        if (!cr.ok) { setLoading(false); return; }
        famData = await cr.json();
      }
      setFamily(famData);
      setNewName(famData.name);
      const memRes = await fetch(`/families/${famData.id}/members`, { headers: h });
      if (memRes.ok) setMembers(await memRes.json());
    } catch { setError('Failed to load family'); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function copyCode() {
    if (!family?.invite_code) return;
    navigator.clipboard.writeText(family.invite_code).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    });
  }

  async function regenCode() {
    if (!family) return;
    setRegenLoading(true);
    const h = { Authorization: `Bearer ${getToken()}` };
    const res = await fetch(`/families/${family.id}/regenerate-code`, { method: 'POST', headers: h });
    if (res.ok) { const d = await res.json(); setFamily(f => f ? { ...f, invite_code: d.invite_code } : f); }
    setRegenLoading(false);
  }

  async function saveRename() {
    if (!family || !newName.trim()) return;
    setRenameLoading(true);
    const h = { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
    const res = await fetch(`/families/${family.id}/rename`, { method: 'PATCH', headers: h, body: JSON.stringify({ name: newName.trim() }) });
    if (res.ok) { const d = await res.json(); setFamily(f => f ? { ...f, name: d.name } : f); setRenaming(false); }
    setRenameLoading(false);
  }

  async function removeMember(userId: number) {
    if (!family) return;
    setRemovingId(userId);
    const h = { Authorization: `Bearer ${getToken()}` };
    const res = await fetch(`/families/${family.id}/members/${userId}`, { method: 'DELETE', headers: h });
    if (res.ok) setMembers(m => m.filter(mb => mb.user_id !== userId));
    setRemovingId(null);
  }

  const ROLE_COLORS: Record<string, string> = { owner: '#D4AF37', member: '#8B5CF6', child: '#3B82F6' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(139,92,246,0.3)', borderTopColor: '#8B5CF6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users className="w-6 h-6" style={{ color: '#8B5CF6' }} />
        </div>
        <div>
          {renaming ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 8, padding: '4px 10px', color: '#fff', fontSize: 16, fontWeight: 700, width: 160 }}
                autoFocus
              />
              <button onClick={saveRename} disabled={renameLoading} style={{ background: '#8B5CF6', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#fff', cursor: 'pointer', fontSize: 12 }}>
                {renameLoading ? '...' : 'Save'}
              </button>
              <button onClick={() => setRenaming(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>{family?.name || 'My Family'}</h2>
              <button onClick={() => setRenaming(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Edit className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
              </button>
            </div>
          )}
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{members.length} member{members.length !== 1 ? 's' : ''} · {family?.plan || 'free'} plan</p>
        </div>
      </div>

      {/* Invite Code Card */}
      <motion.div
        style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.2) 0%,rgba(59,130,246,0.12) 100%)', border: '1.5px solid rgba(139,92,246,0.4)', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', right: -20, top: -20, width: 110, height: 110, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.3) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Family Invite Code</span>
          <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ width: 7, height: 7, borderRadius: '50%', background: '#8B5CF6' }} />
        </div>

        <motion.div
          animate={{ boxShadow: ['0 0 0px rgba(139,92,246,0)', '0 0 24px rgba(139,92,246,0.6)', '0 0 0px rgba(139,92,246,0)'] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: 'rgba(139,92,246,0.15)', border: '1.5px solid rgba(139,92,246,0.5)', borderRadius: 12, padding: '14px 20px', fontFamily: 'monospace', fontSize: 28, fontWeight: 800, color: '#C4B5FD', letterSpacing: '0.3em', textAlign: 'center' as const, marginBottom: 14 }}
        >
          {family?.invite_code || '──────'}
        </motion.div>

        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            onClick={copyCode}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.25)', border: `1.5px solid ${copied ? 'rgba(16,185,129,0.5)' : 'rgba(139,92,246,0.5)'}`, borderRadius: 12, padding: '11px 0', color: copied ? '#10B981' : '#C4B5FD', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s' }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </motion.button>
          <motion.button
            onClick={regenCode}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            disabled={regenLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '11px 16px', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            <RefreshCw className={`w-4 h-4 ${regenLoading ? 'animate-spin' : ''}`} />
            New
          </motion.button>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' as const, marginTop: 12 }}>Share this code with family members to let them join</p>
      </motion.div>

      {/* Members List */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Members ({members.length})</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
              No members yet. Share your invite code!
            </div>
          )}
          {members.map((m, i) => {
            const initials = m.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
            const COLORS = ['#D4AF37', '#8B5CF6', '#3B82F6', '#10B981', '#EF4444'];
            const roleColor = ROLE_COLORS[m.role] || '#8B5CF6';
            return (
              <motion.div
                key={m.user_id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px' }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: COLORS[i % COLORS.length] + '33', border: `2px solid ${COLORS[i % COLORS.length]}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: COLORS[i % COLORS.length] }}>
                    {initials}
                  </div>
                  <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: m.is_online ? '#10B981' : '#4B5563', border: '2px solid #111' }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{m.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: roleColor, background: roleColor + '22', borderRadius: 6, padding: '2px 7px', textTransform: 'capitalize' as const }}>{m.role}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin className="w-3 h-3" style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{m.last_location || 'Location unavailable'}</span>
                    {m.battery !== null && <span style={{ marginLeft: 4, color: m.battery > 20 ? 'rgba(255,255,255,0.4)' : '#EF4444' }}>· 🔋{m.battery}%</span>}
                  </div>
                </div>

                {/* Remove (not for owner) */}
                {m.role !== 'owner' && (
                  <motion.button
                    onClick={() => removeMember(m.user_id)}
                    disabled={removingId === m.user_id}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '8px 10px', cursor: 'pointer', color: '#EF4444', flexShrink: 0 }}
                  >
                    {removingId === m.user_id ? '...' : <Trash2 className="w-4 h-4" />}
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {error && <p style={{ color: '#EF4444', fontSize: 13, textAlign: 'center' as const }}>{error}</p>}
    </div>
  );
}
