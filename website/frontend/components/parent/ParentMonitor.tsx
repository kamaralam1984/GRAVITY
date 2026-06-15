'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Shield, MapPin, Heart, Activity, AlertTriangle, Car,
  Phone, Eye, CheckCircle, Battery, Navigation, Bell, ChevronDown,
  Watch, Gauge, Route, Wifi, WifiOff, Droplets, Flame, Moon, Zap, Footprints,
} from 'lucide-react';

const glassCard = 'bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl';

function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const map: Record<string, string> = {
    Safe: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    Online: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    Offline: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    Home: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    School: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
    Office: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  };
  const px = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`rounded-full font-medium ${px} ${map[status] ?? 'bg-white/10 text-white/60 border border-white/20'}`}>
      {status}
    </span>
  );
}

function BatteryIcon({ level }: { level: number | null }) {
  if (level === null) return <span className="text-xs text-white/30">—</span>;
  const color = level > 50 ? 'text-emerald-400' : level > 20 ? 'text-amber-400' : 'text-red-400';
  return (
    <span className={`flex items-center gap-1 text-xs ${color}`}>
      <Battery className="w-3 h-3" />
      {level}%
    </span>
  );
}

// ── API member shape ────────────────────────────────────────────────────────
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

interface HealthData {
  steps: number | null;
  heart_rate: number | null;
  sleep_hours: number | null;
  calories: number | null;
  water_ml: number | null;
  active_minutes: number | null;
  exists: boolean;
}

function useHealthData(members: ApiMember[]) {
  const [healthMap, setHealthMap] = useState<Record<number, HealthData>>({});

  useEffect(() => {
    if (!members.length) return;
    const token = localStorage.getItem('gv_token');
    if (!token) return;

    async function load() {
      const results = await Promise.all(
        members.map(m =>
          fetch(`/health/today/${m.user_id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
            .then(data => ({ uid: m.user_id, data }))
        )
      );
      const map: Record<number, HealthData> = {};
      results.forEach(({ uid, data }) => { if (data) map[uid] = data; });
      setHealthMap(map);
    }

    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [members]);

  return healthMap;
}

// Health mini-card shown inside expanded member rows
function HealthSummaryCard({ h, goalSteps = 10000 }: { h: HealthData | undefined; goalSteps?: number }) {
  if (!h?.exists) {
    return (
      <div className="bg-white/5 rounded-xl p-3 text-center">
        <p className="text-xs text-white/30">No health data logged today</p>
      </div>
    );
  }
  const stepsPct = h.steps ? Math.min(100, Math.round((h.steps / goalSteps) * 100)) : 0;
  const stats = [
    { icon: Heart,     color: '#EF4444', label: 'HR',     value: h.heart_rate   ? `${h.heart_rate} bpm`           : '—' },
    { icon: Moon,      color: '#8B5CF6', label: 'Sleep',  value: h.sleep_hours  ? `${h.sleep_hours} hrs`          : '—' },
    { icon: Droplets,  color: '#06B6D4', label: 'Water',  value: h.water_ml     ? `${(h.water_ml/1000).toFixed(1)}L` : '—' },
    { icon: Flame,     color: '#F97316', label: 'Cal',    value: h.calories     ? `${h.calories} kcal`            : '—' },
  ];
  return (
    <div className="space-y-2">
      {/* Steps bar */}
      <div className="bg-white/5 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Footprints className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-white/70">Steps Today</span>
          </div>
          <span className="text-xs font-bold text-blue-400">{h.steps ? h.steps.toLocaleString() : '—'} / {goalSteps.toLocaleString()}</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${stepsPct}%` }} transition={{ duration: 0.8 }}
            className="h-full rounded-full"
            style={{ background: stepsPct >= 100 ? 'linear-gradient(90deg,#10B981,#34D399)' : 'linear-gradient(90deg,#3B82F6,#8B5CF6)' }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-white/30">{stepsPct}% of goal</span>
          {h.active_minutes && (
            <span className="text-xs text-emerald-400 flex items-center gap-1"><Zap className="w-3 h-3" />{h.active_minutes} active min</span>
          )}
        </div>
      </div>
      {/* Vitals grid */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="bg-white/5 rounded-xl p-2 text-center">
            <Icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color }} />
            <div className="text-xs font-bold text-white leading-tight">{value}</div>
            <div className="text-xs text-white/30 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function useFamilyMembers() {
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [loading, setLoading] = useState(true);
  const familyIdRef = useRef<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('gv_token');
    if (!token) { setLoading(false); return; }

    async function loadMembers(fid: number) {
      try {
        const memRes = await fetch(`/families/${fid}/members`, { headers: { Authorization: `Bearer ${token}` } });
        if (memRes.ok) {
          const mems: ApiMember[] = await memRes.json();
          setMembers(mems);
        }
      } catch (_) {}
    }

    async function load() {
      try {
        const famRes = await fetch('/families/my', { headers: { Authorization: `Bearer ${token}` } });
        if (!famRes.ok) { setLoading(false); return; }
        const famData = await famRes.json();
        const famsArr = Array.isArray(famData) ? famData : [famData];
        if (!famsArr.length) { setLoading(false); return; }

        familyIdRef.current = famsArr[0].id;
        await loadMembers(familyIdRef.current);
      } catch (_) {}
      finally { setLoading(false); }
    }

    load();

    // Refresh member status every 30s to pick up heartbeat changes
    const interval = setInterval(() => {
      if (familyIdRef.current) loadMembers(familyIdRef.current);
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  return { members, loading };
}

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className={`${glassCard} p-10 flex flex-col items-center gap-3 text-center`}>
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
        <Icon className="w-7 h-7 text-white/20" />
      </div>
      <p className="text-white/60 font-semibold text-sm">{title}</p>
      <p className="text-white/30 text-xs max-w-xs">{subtitle}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHILDREN MONITOR SECTION
// ─────────────────────────────────────────────────────────────────────────────

export function ChildrenMonitorSection() {
  const { members, loading } = useFamilyMembers();
  const healthMap = useHealthData(members);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const colors = ['#F59E0B', '#8B5CF6', '#3B82F6', '#10B981', '#EF4444'];

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className={`${glassCard} p-4 animate-pulse`} style={{ height: 72 }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-white/10 rounded w-1/3" />
                <div className="h-2 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Family Members</h2>
            <p className="text-xs text-white/50">Real-time monitoring</p>
          </div>
          {members.length > 0 && (
            <span className="ml-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              {members.length}
            </span>
          )}
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          {members.filter(m => m.is_online).length}/{members.length} Online
        </span>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No family members"
          subtitle="Add members to your family to start monitoring their location and safety."
        />
      ) : (
        <div className="space-y-3">
          {members.map((m, i) => {
            const color = colors[i % colors.length];
            const isExpanded = expandedId === m.user_id;
            const locationLabel = m.last_location || (m.lat ? 'GPS Location' : 'No location');

            return (
              <motion.div
                key={m.user_id}
                layout
                className={`${glassCard} overflow-hidden cursor-pointer ${isExpanded ? 'border-l-4' : ''}`}
                style={isExpanded ? { borderLeftColor: color } : {}}
                onClick={() => setExpandedId(prev => prev === m.user_id ? null : m.user_id)}
              >
                {/* Collapsed row */}
                <div className="flex items-center gap-3 px-4 py-3" style={{ minHeight: 64 }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-black flex-shrink-0"
                    style={{ background: color }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">{m.name}</span>
                      <span className="text-white/40 text-xs capitalize">{m.role}</span>
                      <StatusBadge status={m.is_online ? 'Online' : 'Offline'} />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <BatteryIcon level={m.battery} />
                      <span className="text-xs text-white/40 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {locationLabel}
                      </span>
                    </div>
                  </div>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-white/40" />
                  </motion.div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-white/10"
                    >
                      <div className="px-4 pb-4 pt-4 space-y-4">
                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 rounded-xl p-3 space-y-1">
                            <div className="flex items-center gap-1.5 text-white/50 text-xs">
                              <MapPin className="w-3 h-3" /> Location
                            </div>
                            <p className="text-white text-sm font-semibold">{locationLabel}</p>
                            {m.lat && m.lng && (
                              <p className="text-white/30 text-xs">{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</p>
                            )}
                          </div>
                          <div className="bg-white/5 rounded-xl p-3 space-y-1">
                            <div className="flex items-center gap-1.5 text-white/50 text-xs">
                              <Wifi className="w-3 h-3" /> Status
                            </div>
                            <div className="flex items-center gap-2">
                              {m.is_online ? (
                                <Wifi className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <WifiOff className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={`text-sm font-semibold ${m.is_online ? 'text-emerald-400' : 'text-gray-400'}`}>
                                {m.is_online ? 'Online' : 'Offline'}
                              </span>
                            </div>
                            <BatteryIcon level={m.battery} />
                          </div>
                        </div>

                        {/* Health Summary */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Heart className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Today's Health</span>
                          </div>
                          <HealthSummaryCard h={healthMap[m.user_id]} />
                        </div>

                        {/* Quick actions */}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { icon: Phone, label: 'Call', color: 'emerald' },
                            { icon: Navigation, label: 'Track', color: 'blue' },
                            { icon: Shield, label: 'SOS Log', color: 'red' },
                          ].map(({ icon: Icon, label, color: c }) => (
                            <motion.button
                              key={label}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`flex flex-col items-center gap-1 p-2 rounded-xl bg-${c}-500/10 border border-${c}-500/20 text-${c}-400 text-xs font-medium`}
                              onClick={e => e.stopPropagation()}
                            >
                              <Icon className="w-4 h-4" />
                              {label}
                            </motion.button>
                          ))}
                        </div>

                        {!m.lat && (
                          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span className="text-xs text-amber-300">Location sharing not started. Ask member to open Gravity app and start sharing.</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ELDERLY MONITOR SECTION
// ─────────────────────────────────────────────────────────────────────────────

export function ElderlyMonitorSection() {
  const { members, loading } = useFamilyMembers();
  const healthMap = useHealthData(members);
  const colors = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'];

  if (loading) {
    return (
      <div className={`${glassCard} p-4 animate-pulse`} style={{ height: 120 }}>
        <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center">
          <Heart className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Elderly Care</h2>
          <p className="text-xs text-white/50">Health monitoring</p>
        </div>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No family members"
          subtitle="Add family members to monitor their health and wellbeing."
        />
      ) : (
        <div className="space-y-3">
          {members.map((m, i) => {
            const color = colors[i % colors.length];
            return (
              <div key={m.user_id} className={`${glassCard} p-4 space-y-3`}>
                {/* Member row */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-black flex-shrink-0"
                    style={{ background: `${color}33`, border: `2px solid ${color}55` }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{m.name}</span>
                      <span className="text-white/40 text-xs capitalize">{m.role}</span>
                      <StatusBadge status={m.is_online ? 'Online' : 'Offline'} />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-white/30" />
                      <span className="text-white/40 text-xs">{m.last_location || 'No location'}</span>
                      <BatteryIcon level={m.battery} />
                    </div>
                  </div>
                </div>

                {/* Health data — real data from API */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Today's Health</span>
                  </div>
                  <HealthSummaryCard h={healthMap[m.user_id]} />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Activity, label: 'Health Log', color: 'rose' },
                    { icon: Bell, label: 'Alert', color: 'amber' },
                    { icon: Phone, label: 'Call', color: 'emerald' },
                  ].map(({ icon: Icon, label, color: c }) => (
                    <motion.button
                      key={label}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl bg-${c}-500/10 border border-${c}-500/20 text-${c}-400 text-xs font-medium`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </motion.button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect device card */}
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
          <Watch className="w-5 h-5 text-violet-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Connect Gravity Watch</p>
          <p className="text-xs text-white/50">Enable heart rate, BP and fall detection monitoring</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-semibold"
        >
          Connect
        </motion.button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH MONITOR SECTION  (dedicated parent view of all member health)
// ─────────────────────────────────────────────────────────────────────────────

export function HealthMonitorSection() {
  const { members, loading } = useFamilyMembers();
  const healthMap = useHealthData(members);
  const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'];

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className={`${glassCard} p-4 animate-pulse`} style={{ height: 160 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div className="h-3 bg-white/10 rounded w-1/3" />
            </div>
            <div className="h-2 bg-white/10 rounded mb-3" />
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,4].map(j => <div key={j} className="h-14 bg-white/10 rounded-xl" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Family Health</h2>
            <p className="text-xs text-white/50">Today's activity & wellness</p>
          </div>
        </div>
        <span className="text-xs text-white/30 flex items-center gap-1">
          <Activity className="w-3 h-3" /> Live
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block ml-1" />
        </span>
      </div>

      {members.length === 0 ? (
        <div className={`${glassCard} p-10 flex flex-col items-center gap-3 text-center`}>
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
            <Heart className="w-7 h-7 text-white/20" />
          </div>
          <p className="text-white/60 font-semibold text-sm">No family members</p>
          <p className="text-white/30 text-xs max-w-xs">Add family members to monitor their health.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((m, i) => {
            const color = colors[i % colors.length];
            const h = healthMap[m.user_id];
            const stepsPct = h?.steps ? Math.min(100, Math.round((h.steps / 10000) * 100)) : 0;
            return (
              <div key={m.user_id} className={`${glassCard} p-4 space-y-3`} style={{ borderLeft: `3px solid ${color}44` }}>
                {/* Member row */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-black flex-shrink-0"
                    style={{ background: color }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{m.name}</span>
                      <span className="text-white/40 text-xs capitalize">{m.role}</span>
                      <StatusBadge status={m.is_online ? 'Online' : 'Offline'} />
                    </div>
                    {h?.exists ? (
                      <p className="text-xs text-emerald-400 mt-0.5">Data logged today ✓</p>
                    ) : (
                      <p className="text-xs text-white/30 mt-0.5">No data logged today</p>
                    )}
                  </div>
                  {h?.heart_rate && (
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold" style={{ color: '#EF4444' }}>{h.heart_rate}</div>
                      <div className="text-xs text-white/30">bpm</div>
                    </div>
                  )}
                </div>

                {/* Steps progress */}
                {h?.exists && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-white/50 flex items-center gap-1">
                          <Footprints className="w-3 h-3" /> Steps
                        </span>
                        <span className="text-xs font-bold" style={{ color }}>
                          {h.steps ? h.steps.toLocaleString() : '—'} / 10,000
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${stepsPct}%` }} transition={{ duration: 0.8 }}
                          className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
                      </div>
                    </div>

                    {/* Vitals row */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { icon: Heart,    color: '#EF4444', label: 'Heart Rate', value: h.heart_rate   ? `${h.heart_rate} bpm`              : '—' },
                        { icon: Moon,     color: '#8B5CF6', label: 'Sleep',      value: h.sleep_hours  ? `${h.sleep_hours}h`                 : '—' },
                        { icon: Droplets, color: '#06B6D4', label: 'Water',      value: h.water_ml     ? `${(h.water_ml/1000).toFixed(1)}L`  : '—' },
                        { icon: Flame,    color: '#F97316', label: 'Calories',   value: h.calories     ? `${h.calories} cal`                 : '—' },
                      ].map(({ icon: Icon, color: c, label, value }) => (
                        <div key={label} className="bg-white/5 rounded-xl p-2 text-center">
                          <Icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: c }} />
                          <div className="text-xs font-bold text-white leading-tight">{value}</div>
                          <div className="text-xs text-white/25 mt-0.5 truncate">{label}</div>
                        </div>
                      ))}
                    </div>

                    {h.active_minutes && (
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-emerald-300 font-semibold">{h.active_minutes} active minutes today</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRIVING SAFETY SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface DrivingData {
  score: number | null;
  total_trips: number;
  total_km: number;
  harsh_brakes: number;
  speeding: number;
  phone_use: number;
  journeys: { id: number; from_location: string; to_location: string; started_at: string | null; status: string; distance_km: number | null; duration_min: number | null }[];
  recent_events: { type: string; severity: string; speed: number | null; occurred_at: string | null }[];
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const scoreColor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <svg width={72} height={72} className="-rotate-90">
      <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
      <motion.circle
        cx={36} cy={36} r={r} fill="none"
        stroke={scoreColor} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />
      <text x={36} y={36} textAnchor="middle" dominantBaseline="middle"
        fontSize={14} fontWeight={700} fill={scoreColor}
        style={{ transform: 'rotate(90deg)', transformOrigin: '36px 36px', fontFamily: 'Inter,sans-serif' }}>
        {score}
      </text>
    </svg>
  );
}

function EventIcon({ type }: { type: string }) {
  const map: Record<string, string> = {
    harsh_brake: '🛑', speeding: '⚡', phone_use: '📱', rapid_accel: '🚀',
  };
  return <span className="text-base">{map[type] || '⚠️'}</span>;
}

function formatTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function DrivingSection() {
  const { members, loading } = useFamilyMembers();
  const [drivingData, setDrivingData] = useState<Record<number, DrivingData>>({});
  const [expanded, setExpanded] = useState<number | null>(null);
  const colors = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'];

  useEffect(() => {
    if (!members.length) return;
    const token = localStorage.getItem('gv_token');
    if (!token) return;
    members.forEach(async (m) => {
      try {
        const res = await fetch(`/driving/member/${m.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDrivingData(prev => ({ ...prev, [m.user_id]: data }));
        }
      } catch (_) {}
    });
  }, [members]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className={`${glassCard} p-4 animate-pulse`} style={{ height: 100 }}>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-white/10 rounded w-1/3" />
                <div className="h-2 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Car className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Driving Safety</h2>
            <p className="text-xs text-white/50">Trips · Score · Events</p>
          </div>
        </div>
        <span className="text-xs text-white/30">{members.length} drivers</span>
      </div>

      {members.length === 0 ? (
        <EmptyState icon={Car} title="No family members" subtitle="Add members to monitor driving safety." />
      ) : (
        <div className="space-y-3">
          {members.map((m, i) => {
            const color = colors[i % colors.length];
            const d = drivingData[m.user_id];
            const isExpanded = expanded === m.user_id;
            const scoreColor = !d || d.score === null ? 'text-white/30' : d.score >= 80 ? 'text-emerald-400' : d.score >= 60 ? 'text-amber-400' : 'text-red-400';
            const badge = !d || d.score === null ? 'No trips yet' : d.score >= 85 ? 'Safe Driver' : d.score >= 70 ? 'Good Driver' : 'Needs Improvement';
            const badgeColor = !d || d.score === null ? 'bg-white/10 text-white/40' : d.score >= 85 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : d.score >= 70 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30';

            return (
              <motion.div key={m.user_id} layout className={`${glassCard} overflow-hidden`}>
                {/* Collapsed header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => setExpanded(prev => prev === m.user_id ? null : m.user_id)}
                >
                  {/* Score ring */}
                  <div className="flex-shrink-0">
                    {d && d.score !== null ? (
                      <ScoreRing score={d.score} color={color} />
                    ) : (
                      <div className="w-[72px] h-[72px] rounded-full border-4 border-white/10 flex items-center justify-center">
                        <span className="text-xs text-white/25 font-bold">—</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0" style={{ background: color }}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-white text-sm">{m.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badgeColor}`}>{badge}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span>🚗 {d?.total_trips ?? 0} trips</span>
                      <span>📍 {d?.total_km ?? 0} km</span>
                      {(d?.harsh_brakes ?? 0) > 0 && <span className="text-amber-400">🛑 {d!.harsh_brakes} harsh</span>}
                      {(d?.phone_use ?? 0) > 0 && <span className="text-red-400">📱 {d!.phone_use}x phone</span>}
                    </div>
                  </div>

                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-white/30" />
                  </motion.div>
                </div>

                {/* Expanded: trips + events */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-white/10"
                    >
                      <div className="p-4 space-y-4">
                        {/* Stats row */}
                        {d && d.total_trips > 0 && (
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: 'Score', value: d.score ?? '—', color: scoreColor },
                              { label: 'Trips', value: d.total_trips, color: 'text-blue-400' },
                              { label: 'Km', value: d.total_km, color: 'text-emerald-400' },
                              { label: 'Events', value: (d.harsh_brakes + d.speeding + d.phone_use), color: d.harsh_brakes + d.speeding + d.phone_use > 0 ? 'text-amber-400' : 'text-emerald-400' },
                            ].map(stat => (
                              <div key={stat.label} className="bg-white/5 rounded-xl p-2.5 text-center">
                                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                                <p className="text-[10px] text-white/30 mt-0.5">{stat.label}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Safety indicators */}
                        {d && d.total_trips > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { label: 'Harsh Brakes', value: d.harsh_brakes, icon: '🛑', good: d.harsh_brakes === 0 },
                              { label: 'Speeding', value: d.speeding, icon: '⚡', good: d.speeding === 0 },
                              { label: 'Phone Use', value: d.phone_use, icon: '📱', good: d.phone_use === 0 },
                            ].map(ind => (
                              <div key={ind.label} className={`rounded-xl p-2.5 text-center ${ind.good ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                                <div className="text-base mb-0.5">{ind.icon}</div>
                                <div className={`text-sm font-bold ${ind.good ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {ind.good ? '✓ None' : ind.value}
                                </div>
                                <div className="text-[9px] text-white/30">{ind.label}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Trip history */}
                        <div>
                          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Recent Trips</p>
                          {!d || d.journeys.length === 0 ? (
                            <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center gap-2 text-center">
                              <Route className="w-6 h-6 text-white/15" />
                              <p className="text-sm text-white/30">No trips yet</p>
                              <p className="text-xs text-white/20">Start a journey from the Journeys tab to begin tracking</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {d.journeys.slice(0, 5).map(j => (
                                <div key={j.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
                                  <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <div className="w-px h-3 bg-white/20" />
                                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-white/70 truncate">{j.from_location} → {j.to_location}</p>
                                    <p className="text-[10px] text-white/30">{formatDate(j.started_at)} · {formatTime(j.started_at)}{j.duration_min ? ` · ${j.duration_min} min` : ''}</p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    {j.distance_km && <p className="text-xs text-white/60 font-semibold">{j.distance_km.toFixed(1)} km</p>}
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${j.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'}`}>
                                      {j.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Recent driving events */}
                        {d && d.recent_events.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Recent Events</p>
                            <div className="space-y-1.5">
                              {d.recent_events.map((ev, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2">
                                  <EventIcon type={ev.type} />
                                  <span className="text-xs text-white/60 capitalize flex-1">{ev.type.replace(/_/g, ' ')}</span>
                                  {ev.speed && <span className="text-xs text-amber-400">{Math.round(ev.speed)} km/h</span>}
                                  <span className="text-[10px] text-white/25">{formatDate(ev.occurred_at)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* How it works */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-blue-400" />
          <p className="text-sm font-semibold text-white">How Driving Safety Works</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { step: '1', text: 'Start a journey', icon: '🚗' },
            { step: '2', text: 'Drive with Gravity', icon: '📍' },
            { step: '3', text: 'See your score', icon: '⭐' },
          ].map(s => (
            <div key={s.step} className="bg-white/5 rounded-xl p-2">
              <div className="text-lg mb-1">{s.icon}</div>
              <p className="text-[10px] text-white/50">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
