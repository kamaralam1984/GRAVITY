'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Shield, MapPin, Heart, Activity, AlertTriangle, Car,
  Phone, Eye, CheckCircle, Battery, Navigation, Bell, ChevronDown,
  Watch, Gauge, Route, Wifi, WifiOff,
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

function useFamilyMembers() {
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('gv_token');
        if (!token) { setLoading(false); return; }

        const famRes = await fetch('/families/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!famRes.ok) { setLoading(false); return; }
        const famData = await famRes.json();
        const famsArr = Array.isArray(famData) ? famData : [famData];
        if (!famsArr.length) { setLoading(false); return; }

        const fid = famsArr[0].id;
        const memRes = await fetch(`/families/${fid}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!memRes.ok) { setLoading(false); return; }
        const mems: ApiMember[] = await memRes.json();
        setMembers(mems);
      } catch (_) {}
      finally { setLoading(false); }
    }
    load();
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

                {/* Health data — not available */}
                <div className="bg-white/5 rounded-xl p-3 flex items-start gap-3">
                  <Watch className="w-5 h-5 text-white/20 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white/40">Health data not available</p>
                    <p className="text-xs text-white/25 mt-0.5">
                      Heart rate, blood pressure and steps require a Gravity Watch or compatible health device.
                    </p>
                  </div>
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
// DRIVING SAFETY SECTION
// ─────────────────────────────────────────────────────────────────────────────

export function DrivingSection() {
  const { members, loading } = useFamilyMembers();
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
        <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Car className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Driving Safety</h2>
          <p className="text-xs text-white/50">Trip monitoring</p>
        </div>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No family members"
          subtitle="Add members to monitor driving safety and trips."
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
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-black flex-shrink-0"
                    style={{ background: color }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{m.name}</span>
                      <StatusBadge status={m.is_online ? 'Online' : 'Offline'} />
                    </div>
                    <span className="text-white/40 text-xs">{m.last_location || 'No recent location'}</span>
                  </div>
                </div>

                {/* No driving data */}
                <div className="bg-white/5 rounded-xl p-3 flex items-start gap-3">
                  <Route className="w-5 h-5 text-white/20 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white/40">No trips recorded yet</p>
                    <p className="text-xs text-white/25 mt-0.5">
                      Driving trips, speed data, and safety scores will appear here once the member starts a trip with Gravity.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info card */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Gauge className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Driving Safety Coming Soon</p>
          <p className="text-xs text-white/50">Real-time trip score, harsh brakes, speed alerts and phone detection.</p>
        </div>
      </div>
    </div>
  );
}
