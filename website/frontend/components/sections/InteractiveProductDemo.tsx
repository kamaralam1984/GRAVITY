'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  };
}

type TabId = 'gps' | 'sos' | 'geofence' | 'ai' | 'driving';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'gps', label: 'GPS Tracking', icon: '📍' },
  { id: 'sos', label: 'SOS Alert', icon: '🚨' },
  { id: 'geofence', label: 'Geofence', icon: '🔵' },
  { id: 'ai', label: 'AI Alerts', icon: '🧠' },
  { id: 'driving', label: 'Driving Safety', icon: '🚗' },
];

/* ── GPS Tab ──────────────────────────────────────────────────────────────── */
function GPSTab({ isDark }: { isDark: boolean }) {
  const pins = [
    { name: 'Mom', initials: 'M', color: '#3B82F6', top: '28%', left: '22%' },
    { name: 'Priya', initials: 'P', color: '#10B981', top: '18%', right: '20%' },
    { name: 'Raj', initials: 'R', color: '#F59E0B', top: '60%', left: '26%' },
    { name: 'Anya', initials: 'A', color: '#A855F7', top: '55%', right: '16%' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* App header */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
        <span className="text-[11px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Family Map</span>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[9px] font-semibold text-emerald-500" style={{ fontFamily: "'Inter', sans-serif" }}>LIVE</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative m-2.5 rounded-xl overflow-hidden" style={{ minHeight: 160, background: isDark ? 'linear-gradient(145deg, #0B1525, #0F1E35)' : 'linear-gradient(145deg, #dbeafe, #eff6ff)' }}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 160" preserveAspectRatio="xMidYMid slice">
          <path d="M10 70 Q70 40 130 80 Q165 100 200 65" stroke={isDark ? 'rgba(75,128,240,0.3)' : 'rgba(37,99,235,0.2)'} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M0 130 Q55 110 110 140 Q155 160 200 130" stroke={isDark ? 'rgba(75,128,240,0.2)' : 'rgba(37,99,235,0.15)'} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M70 0 Q90 50 70 120 Q60 155 90 160" stroke={isDark ? 'rgba(75,128,240,0.18)' : 'rgba(37,99,235,0.12)'} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>

        {pins.map((pin, i) => (
          <motion.div
            key={pin.name}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
            transition={{
              scale: { delay: i * 0.12, duration: 0.4, ease: 'backOut' },
              opacity: { delay: i * 0.12, duration: 0.3 },
              y: { duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 },
            }}
            className="absolute"
            style={{ top: pin.top, left: pin.left, right: (pin as { right?: string }).right }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white relative"
              style={{
                background: pin.color,
                boxShadow: `0 3px 14px ${pin.color}66, 0 0 0 2px ${pin.color}33`,
              }}
            >
              {pin.initials}
              <motion.div
                animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: i * 0.5 }}
                className="absolute inset-0 rounded-full"
                style={{ background: pin.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Members strip */}
      <div className="px-3 pb-3 grid grid-cols-4 gap-1.5">
        {pins.map((pin) => (
          <div key={pin.name} className="flex flex-col items-center gap-0.5">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
              style={{ background: pin.color }}
            >
              {pin.initials}
            </div>
            <span className="text-[8px]" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{pin.name}</span>
            <div className="flex items-center gap-0.5">
              <div className="w-1 h-1 rounded-full bg-emerald-500" />
              <span className="text-[7px] text-emerald-500" style={{ fontFamily: "'Inter', sans-serif" }}>Safe</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SOS Tab ──────────────────────────────────────────────────────────────── */
function SOSTab({ isDark }: { isDark: boolean }) {
  const [count, setCount] = useState(30);
  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-full flex items-center justify-center relative"
        style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.4)' }}
      >
        <motion.div
          animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full"
          style={{ background: 'rgba(239,68,68,0.3)' }}
        />
        <span className="text-3xl font-black text-red-500" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SOS</span>
      </motion.div>

      <div className="text-center">
        <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Emergency Activated</p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>Live location sent to 4 contacts</p>
      </div>

      <div className="w-full p-3 rounded-xl" style={{ background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div className="text-[9px] font-semibold text-red-500 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>NOTIFIED CONTACTS</div>
        {['Mom', 'Dad', 'Raj', 'Emergency Services'].map((name, i) => (
          <div key={name} className="flex items-center gap-2 py-0.5">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
            />
            <span className="text-[9px]" style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>{name}</span>
            <span className="text-[8px] ml-auto text-emerald-500" style={{ fontFamily: "'Inter', sans-serif" }}>Notified</span>
          </div>
        ))}
      </div>

      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
      >
        <span className="text-[10px] text-red-500" style={{ fontFamily: "'Inter', sans-serif" }}>Auto-cancel in</span>
        <span className="text-sm font-bold text-red-500" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{count}s</span>
      </div>
    </div>
  );
}

/* ── Geofence Tab ─────────────────────────────────────────────────────────── */
function GeofenceTab({ isDark }: { isDark: boolean }) {
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowNotif(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
        <span className="text-[11px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Geofence Zones</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>3 Active</span>
      </div>

      <div className="flex-1 relative m-2.5 rounded-xl overflow-hidden" style={{ minHeight: 140, background: isDark ? 'linear-gradient(145deg, #0B1525, #0F1E35)' : 'linear-gradient(145deg, #dbeafe, #eff6ff)' }}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 160" preserveAspectRatio="xMidYMid slice">
          {/* School zone */}
          <circle cx="80" cy="65" r="38" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.35)" strokeWidth="1.5" strokeDasharray="5,3" />
          <circle cx="80" cy="65" r="4" fill="#10B981" />
          <text x="80" y="110" textAnchor="middle" fill={isDark ? 'rgba(240,237,232,0.5)' : 'rgba(15,17,23,0.5)'} fontSize="7" fontFamily="Inter, sans-serif">School</text>

          {/* Home zone */}
          <circle cx="155" cy="110" r="28" fill="rgba(75,128,240,0.08)" stroke="rgba(75,128,240,0.35)" strokeWidth="1.5" strokeDasharray="5,3" />
          <circle cx="155" cy="110" r="4" fill="#4B80F0" />
          <text x="155" y="147" textAnchor="middle" fill={isDark ? 'rgba(240,237,232,0.5)' : 'rgba(15,17,23,0.5)'} fontSize="7" fontFamily="Inter, sans-serif">Home</text>

          {/* Priya pin approaching school */}
          <motion.circle
            cx={100} cy={70}
            r={5}
            fill="#10B981"
            animate={{ cx: [100, 85, 80], cy: [70, 68, 65] }}
            transition={{ duration: 2, delay: 0.5, ease: 'easeOut', repeat: Infinity, repeatType: 'reverse', repeatDelay: 1.5 }}
          />
        </svg>
      </div>

      <AnimatePresence>
        {showNotif && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: 'backOut' }}
            className="mx-2.5 mb-2.5 px-3 py-2.5 rounded-xl flex items-center gap-2.5"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm shrink-0">📍</div>
            <div>
              <p className="text-[10px] font-bold" style={{ color: '#10B981', fontFamily: "'Inter', sans-serif" }}>Priya entered School Zone</p>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>Just now · Safe arrival confirmed</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── AI Tab ───────────────────────────────────────────────────────────────── */
function AITab({ isDark }: { isDark: boolean }) {
  const alerts = [
    { icon: '⚡', title: 'Unsafe route detected', desc: "Priya's school route flagged", risk: 'HIGH', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', delay: 0.2 },
    { icon: '🧠', title: 'Pattern analysis', desc: 'Raj drives 23% faster on Fridays', risk: 'MEDIUM', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', delay: 0.5 },
    { icon: '💚', title: 'All clear', desc: 'Family activity normal today', risk: 'SAFE', color: '#10B981', bg: 'rgba(16,185,129,0.1)', delay: 0.8 },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
        <span className="text-[11px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI Guardian</span>
        <div className="flex items-center gap-1">
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          <span className="text-[9px] text-violet-500 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>ANALYZING</span>
        </div>
      </div>

      <div className="flex-1 p-2.5 flex flex-col gap-2 overflow-hidden">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.title}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: alert.delay, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
            style={{ background: alert.bg, border: `1px solid ${alert.color}25` }}
          >
            <span className="text-base shrink-0">{alert.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold truncate" style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}>{alert.title}</p>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{alert.desc}</p>
            </div>
            <span
              className="text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: alert.bg, color: alert.color, border: `1px solid ${alert.color}40`, fontFamily: "'Inter', sans-serif" }}
            >
              {alert.risk}
            </span>
          </motion.div>
        ))}

        {/* AI risk score gauge */}
        <div className="mt-auto px-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>Family Risk Score</span>
            <span className="text-[10px] font-bold text-emerald-500" style={{ fontFamily: "'Inter', sans-serif" }}>LOW · 14/100</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '14%' }}
              transition={{ duration: 1.2, delay: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-emerald-500"
              style={{ boxShadow: '0 0 8px rgba(16,185,129,0.5)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Driving Tab ──────────────────────────────────────────────────────────── */
function DrivingTab({ isDark }: { isDark: boolean }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
        <span className="text-[11px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Driving Safety</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>Live</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3">
        {/* Score circle */}
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'} strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="40" fill="none"
              stroke="url(#driveGrad)" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - 0.85) }}
              transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
            <defs>
              <linearGradient id="driveGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-emerald-500" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>85</span>
            <span className="text-[8px] font-medium" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>/100</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[11px] font-bold" style={{ color: '#10B981', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Safe Driving</p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>Raj · Active trip</p>
        </div>

        <div className="w-full grid grid-cols-3 gap-2">
          {[
            { label: 'Speed', value: '42 km/h', color: '#10B981' },
            { label: 'Braking', value: 'Smooth', color: '#4B80F0' },
            { label: 'Phone Use', value: 'None', color: '#10B981' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center px-2 py-2 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
              <span className="text-[10px] font-bold" style={{ color: stat.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stat.value}</span>
              <span className="text-[8px]" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Phone Shell ──────────────────────────────────────────────────────────── */
function PhoneShell({ isDark, children }: { isDark: boolean; children: React.ReactNode }) {
  return (
    <div
      className="relative w-48 sm:w-56 rounded-[2.5rem] overflow-hidden"
      style={{
        border: `3px solid ${isDark ? 'rgba(240,237,232,0.12)' : 'rgba(15,17,23,0.12)'}`,
        backgroundColor: isDark ? '#111420' : '#FFFFFF',
        boxShadow: isDark
          ? '0 0 60px rgba(212,168,83,0.3), 0 24px 80px rgba(0,0,0,0.65)'
          : '0 0 40px rgba(184,114,10,0.15), 0 24px 60px rgba(0,0,0,0.12)',
        height: 380,
      }}
    >
      {/* Dynamic island */}
      <div className="mx-auto mt-2 w-16 h-4 rounded-full bg-black flex items-center justify-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#1C1C1E]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#1C1C1E]" />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 pt-1 pb-1">
        <span className="text-[9px] font-medium" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>9:41</span>
        <div className="flex items-center gap-1">
          <svg width="10" height="8" viewBox="0 0 12 10" fill="none">
            <rect x="0" y="7" width="2" height="3" rx="0.5" fill="var(--text-muted)" />
            <rect x="3" y="5" width="2" height="5" rx="0.5" fill="var(--text-muted)" />
            <rect x="6" y="3" width="2" height="7" rx="0.5" fill="var(--text-muted)" />
            <rect x="9" y="0" width="2" height="10" rx="0.5" fill="var(--text-muted)" />
          </svg>
          <svg width="16" height="8" viewBox="0 0 18 10" fill="none">
            <rect x="0.5" y="0.5" width="14" height="9" rx="2" stroke="var(--text-muted)" strokeWidth="1" />
            <rect x="2" y="2" width="9" height="6" rx="1" fill="#10B981" />
            <path d="M15.5 3.5v3a1.5 1.5 0 000-3z" fill="var(--text-muted)" />
          </svg>
        </div>
      </div>

      {/* Screen content */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 56px)' }}>
        {children}
      </div>
    </div>
  );
}

export default function InteractiveProductDemo() {
  const [activeTab, setActiveTab] = useState<TabId>('gps');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  function renderScreen() {
    switch (activeTab) {
      case 'gps': return <GPSTab isDark={isDark} />;
      case 'sos': return <SOSTab isDark={isDark} />;
      case 'geofence': return <GeofenceTab isDark={isDark} />;
      case 'ai': return <AITab isDark={isDark} />;
      case 'driving': return <DrivingTab isDark={isDark} />;
    }
  }

  return (
    <section className="relative py-28 overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(184,114,10,0.04) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 mb-5">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{
                backgroundColor: isDark ? 'rgba(212,168,83,0.10)' : 'rgba(184,114,10,0.08)',
                border: `1px solid ${isDark ? 'rgba(212,168,83,0.22)' : 'rgba(184,114,10,0.20)'}`,
                color: isDark ? '#D4A853' : '#B8720A',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Live Preview
            </span>
          </motion.div>

          <motion.h2
            {...fadeUp(0.1)}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Experience{' '}
            <span className="gradient-text-gold">KVL Track 3.0</span>
            {' '}in real-time
          </motion.h2>

          <motion.p
            {...fadeUp(0.2)}
            className="mt-5 text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            Explore every feature through an interactive preview — no download required.
          </motion.p>
        </div>

        {/* Demo card */}
        <motion.div
          {...fadeUp(0.3)}
          className="rounded-3xl overflow-hidden"
          style={{
            background: isDark
              ? 'linear-gradient(145deg, rgba(17,20,32,0.95), rgba(24,28,43,0.9))'
              : 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(245,240,232,0.8))',
            border: isDark ? '1px solid rgba(212,168,83,0.12)' : '1px solid rgba(184,114,10,0.12)',
            backdropFilter: 'blur(24px)',
            boxShadow: isDark
              ? '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)'
              : '0 16px 60px rgba(0,0,0,0.08)',
          }}
        >
          {/* Tab bar */}
          <div
            className="flex items-center gap-1.5 p-4 border-b overflow-x-auto"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
          >
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all focus:outline-none shrink-0"
                  style={{
                    background: isActive
                      ? isDark ? 'rgba(212,168,83,0.15)' : 'rgba(184,114,10,0.12)'
                      : 'transparent',
                    border: isActive
                      ? `1px solid ${isDark ? 'rgba(212,168,83,0.3)' : 'rgba(184,114,10,0.25)'}`
                      : '1px solid transparent',
                    color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-8 flex flex-col lg:flex-row items-center gap-12">
            {/* Phone */}
            <div className="shrink-0 flex justify-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <PhoneShell isDark={isDark}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full"
                    >
                      {renderScreen()}
                    </motion.div>
                  </AnimatePresence>
                </PhoneShell>
              </motion.div>
            </div>

            {/* Feature description */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1"
              >
                {activeTab === 'gps' && (
                  <FeatureDesc
                    icon="📍"
                    title="Real-Time GPS Tracking"
                    desc="See every family member on a shared map, updated every 30 seconds. Color-coded pins, battery levels, and safe/unsafe indicators make it easy to keep tabs on everyone."
                    features={['30-second live updates', 'Battery level monitoring', 'Speed & route history', 'Custom map views']}
                    isDark={isDark}
                  />
                )}
                {activeTab === 'sos' && (
                  <FeatureDesc
                    icon="🚨"
                    title="One-Touch SOS Alert"
                    desc="Press and hold the SOS button to instantly share your live location with all emergency contacts and optionally trigger a call to local emergency services."
                    features={['Instant multi-contact alert', 'Live location streaming', 'Auto voice recording', '30-second cancel window']}
                    isDark={isDark}
                  />
                )}
                {activeTab === 'geofence' && (
                  <FeatureDesc
                    icon="🔵"
                    title="Smart Geofence Zones"
                    desc="Draw zones around schools, home, or any location. Get instant alerts when family members arrive or leave — no manual check-ins needed."
                    features={['Unlimited custom zones', 'Arrive & leave alerts', 'Schedule-based zones', 'Zone history log']}
                    isDark={isDark}
                  />
                )}
                {activeTab === 'ai' && (
                  <FeatureDesc
                    icon="🧠"
                    title="AI Risk Intelligence"
                    desc="KVL Track AI learns your family's normal patterns and flags anomalies before they become emergencies. Proactive safety, not just reactive alerts."
                    features={['Route risk scoring', 'Behavior pattern analysis', 'Predictive alerts', 'Real-time risk dashboard']}
                    isDark={isDark}
                  />
                )}
                {activeTab === 'driving' && (
                  <FeatureDesc
                    icon="🚗"
                    title="Driving Safety Monitor"
                    desc="Track driving behavior in real time — speed, harsh braking, phone use, and more. Weekly driving scores help family members improve together."
                    features={['Speed monitoring', 'Harsh braking detection', 'Phone use alerts', 'Weekly safety report']}
                    isDark={isDark}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureDesc({ icon, title, desc, features, isDark }: {
  icon: string; title: string; desc: string; features: string[]; isDark: boolean;
}) {
  return (
    <div>
      <div className="text-3xl mb-3">{icon}</div>
      <h3
        className="text-2xl font-extrabold mb-3"
        style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {title}
      </h3>
      <p
        className="text-base leading-relaxed mb-6"
        style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
      >
        {desc}
      </p>
      <ul className="flex flex-col gap-2">
        {features.map((f, i) => (
          <motion.li
            key={f}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(212,168,83,0.15)' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5.5L4 7.5L8 3" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>{f}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
