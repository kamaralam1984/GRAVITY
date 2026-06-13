'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, MapPin, Bell, CheckCircle, Navigation,
  Clock, EyeOff, Battery, Activity, Brain, Heart, Pill,
  MessageCircle, Car, Camera, AlertTriangle,
} from 'lucide-react'

/* ─── Feature definitions ───────────────────────────────────────── */
interface Feature {
  id: string
  num: string
  title: string
  description: string
  icon: React.ElementType
  accent: string
  rgb: string
  tag?: string
  size?: 'wide' | 'tall'
  special?: 'sos' | 'map'
}

const FEATURES: Feature[] = [
  {
    id: 'sos', num: '01', title: 'Emergency SOS',
    description: 'One hold sends your exact location to every circle member and emergency contacts simultaneously.',
    icon: Shield, accent: '#EF4444', rgb: '239,68,68',
    tag: 'Safety First', size: 'wide', special: 'sos',
  },
  {
    id: 'map', num: '02', title: 'Live Family Map',
    description: "See every member's position updating in real-time, with street-level precision.",
    icon: MapPin, accent: '#3B82F6', rgb: '59,130,246',
    tag: 'Always On', size: 'tall', special: 'map',
  },
  {
    id: 'alerts', num: '03', title: 'Smart Alerts',
    description: 'Geofence arrivals and departures notify you the moment it matters.',
    icon: Bell, accent: '#F59E0B', rgb: '245,158,11', tag: 'Geofence',
  },
  {
    id: 'checkin', num: '04', title: 'Safe Check-in',
    description: 'One-tap check-ins let family know you arrived safely — no call needed.',
    icon: CheckCircle, accent: '#10B981', rgb: '16,185,129', tag: 'Peace of Mind',
  },
  {
    id: 'nav', num: '05', title: 'Route Sharing',
    description: 'Share your live route so family can follow along during commutes or trips.',
    icon: Navigation, accent: '#D4A853', rgb: '212,168,83', tag: 'Live Route',
  },
  {
    id: 'history', num: '06', title: 'Location History',
    description: '30-day encrypted timeline of every place visited — private and secure.',
    icon: Clock, accent: '#6366F1', rgb: '99,102,241', tag: 'Privacy',
  },
  {
    id: 'ghost', num: '07', title: 'Ghost Mode',
    description: 'Go invisible on the map for up to 1 hour without alerting anyone.',
    icon: EyeOff, accent: '#64748B', rgb: '100,116,139', tag: 'Private',
  },
  {
    id: 'battery', num: '08', title: 'Battery Alerts',
    description: "Get notified when a family member's phone drops below 20%.",
    icon: Battery, accent: '#F59E0B', rgb: '245,158,11', tag: 'Device Care',
  },
  {
    id: 'activity', num: '09', title: 'Activity Status',
    description: 'Know if someone is driving, walking, or stationary — auto detected.',
    icon: Activity, accent: '#EC4899', rgb: '236,72,153', tag: 'Context-Aware',
  },
  {
    id: 'ai', num: '10', title: 'AI Insights',
    description: 'Gravity learns routines and flags deviations — arriving home 2 hrs late? Family gets a nudge.',
    icon: Brain, accent: '#8B5CF6', rgb: '139,92,246', tag: 'Smart',
  },
  {
    id: 'wellness', num: '11', title: 'Wellness Check',
    description: 'Daily gentle check-ins for elderly members with one-tap mood reporting.',
    icon: Heart, accent: '#EF4444', rgb: '239,68,68', tag: 'Care',
  },
  {
    id: 'meds', num: '12', title: 'Med Reminders',
    description: 'Smart medication reminders notify both user and caregiver for accountability.',
    icon: Pill, accent: '#10B981', rgb: '16,185,129', tag: 'Health',
  },
  {
    id: 'chat',
    num: '13',
    title: 'Family Chat',
    description: "Instant messaging built for families. Share updates, photos, and voice notes with your entire circle in one secure place.",
    icon: MessageCircle,
    accent: '#6366F1',
    rgb: '99,102,241',
    tag: 'New',
  },
  {
    id: 'driving',
    num: '14',
    title: 'Driving Safety',
    description: "Smart detection alerts family when a member is driving. Monitors speed, phone use, and sends safe-arrival confirmation.",
    icon: Car,
    accent: '#0EA5E9',
    rgb: '14,165,233',
    tag: 'New',
  },
  {
    id: 'moments',
    num: '15',
    title: 'Family Moments',
    description: "Celebrate arrivals, milestones, and everyday moments together. Auto-generated highlights from your family journey.",
    icon: Camera,
    accent: '#EC4899',
    rgb: '236,72,153',
    tag: 'Social',
  },
  {
    id: "child",
    num: "16",
    title: "Child Safety Suite",
    description: "School arrival alerts, dismissal mode, bus tracking, and trusted guardian access — built for every parent.",
    icon: Shield,
    accent: "#6366F1",
    rgb: "99,102,241",
    tag: "Child",
  },
  {
    id: "crash",
    num: "17",
    title: "Crash Detection",
    description: "AI detects accidents automatically and triggers emergency response with location within seconds.",
    icon: AlertTriangle,
    accent: "#EF4444",
    rgb: "239,68,68",
    tag: "Safety",
  },
  {
    id: "medical",
    num: "18",
    title: "Emergency Profile",
    description: "Store blood group, allergies, medications, and insurance for every family member — instantly accessible in emergencies.",
    icon: Heart,
    accent: "#10B981",
    rgb: "16,185,129",
    tag: "Health",
  },
]

/* ─── Map photo pins ────────────────────────────────────────────── */
const MAP_PHOTOS = [
  {
    x: '22%', y: '35%', color: '#3B82F6', name: 'Mom',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop&crop=faces&auto=format&q=80',
  },
  {
    x: '58%', y: '55%', color: '#10B981', name: 'Dad',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=faces&auto=format&q=80',
  },
  {
    x: '74%', y: '25%', color: '#F59E0B', name: 'Priya',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=faces&auto=format&q=80',
  },
  {
    x: '14%', y: '68%', color: '#8B5CF6', name: 'Anya',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=48&h=48&fit=crop&crop=faces&auto=format&q=80',
  },
]

/* ─── SOS Card inner ────────────────────────────────────────────── */
function SOSCard({ feature }: { feature: Feature }) {
  return (
    <div className="flex flex-col sm:flex-row h-full gap-6">
      {/* Left — pulsing button */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          {[1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(239,68,68,0.28)' }}
              animate={{ scale: [1, 2.5], opacity: [0.7, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: i * 0.7 }}
            />
          ))}
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center z-10"
            style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
              boxShadow: '0 0 40px rgba(239,68,68,0.5), 0 8px 32px rgba(239,68,68,0.3)',
            }}
          >
            <Shield className="w-9 h-9 text-white" />
          </div>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#EF4444',
          }}
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          Hold 3s to trigger
        </div>
      </div>

      {/* Right — content */}
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-mono" style={{ color: 'rgba(239,68,68,0.6)' }}>
            {feature.num}
          </span>
          <span
            className="text-xs font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            {feature.tag}
          </span>
        </div>

        <h3
          className="text-2xl font-bold leading-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          {feature.title}
        </h3>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {feature.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {['Mom', 'Dad', 'Priya', 'Anya'].map((name, i) => (
            <motion.div
              key={name}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
              style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.18)',
                color: 'var(--text-secondary)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
              Alerting {name}…
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Map Card inner ────────────────────────────────────────────── */
function MapCard({ feature }: { feature: Feature }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="relative flex-1 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #07111E 0%, #0C1E3A 55%, #081428 100%)',
          minHeight: 220,
        }}
      >
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {[20, 40, 60, 80].map((p) => (
            <g key={p}>
              <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="rgba(59,130,246,0.12)" strokeWidth="1" />
              <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="rgba(59,130,246,0.12)" strokeWidth="1" />
            </g>
          ))}
          <line x1="0" y1="45%" x2="100%" y2="52%" stroke="rgba(96,165,250,0.22)" strokeWidth="2.5" />
          <line x1="40%" y1="0" x2="46%" y2="100%" stroke="rgba(96,165,250,0.18)" strokeWidth="2" />
          <line x1="0" y1="72%" x2="100%" y2="68%" stroke="rgba(96,165,250,0.1)" strokeWidth="1.5" />
          <circle cx="22%" cy="35%" r="12%" fill="rgba(59,130,246,0.05)"
            stroke="rgba(59,130,246,0.28)" strokeWidth="1" strokeDasharray="5 4" />
        </svg>

        {/* Radar sweep */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: '22%', top: '35%',
            width: 0, height: 0,
            transformOrigin: '0 0',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        >
          <svg style={{ position: 'absolute', left: '-80px', top: '-80px', width: '160px', height: '160px' }}>
            <defs>
              <radialGradient id="map-radar-feat" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(59,130,246,0.45)" />
                <stop offset="100%" stopColor="rgba(59,130,246,0)" />
              </radialGradient>
            </defs>
            <path d="M 80 80 L 80 10 A 70 70 0 0 1 138 45 Z" fill="url(#map-radar-feat)" />
          </svg>
        </motion.div>

        {/* Photo pins */}
        {MAP_PHOTOS.map((pin, i) => (
          <motion.div
            key={pin.name}
            className="absolute z-10"
            style={{ left: pin.x, top: pin.y, transform: 'translate(-50%, -50%)' }}
            animate={{
              x: [0, i % 2 === 0 ? 5 : -5, 0, i % 2 === 0 ? -3 : 3, 0],
              y: [0, i < 2 ? -5 : 4, 0, i < 2 ? 4 : -4, 0],
            }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {[1, 2].map((r) => (
              <motion.div
                key={r}
                className="absolute rounded-full"
                style={{
                  background: pin.color,
                  inset: -(r * 7),
                }}
                animate={{ scale: [1, 1.9 + r * 0.3], opacity: [0.55, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut', delay: r * 1 }}
              />
            ))}
            <div
              className="relative w-9 h-9 rounded-full overflow-hidden z-10"
              style={{
                border: `2px solid ${pin.color}`,
                boxShadow: `0 0 14px ${pin.color}88`,
              }}
            >
              <img src={pin.photo} alt={pin.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </div>
            <div
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 z-20"
              style={{ border: '1.5px solid #071428' }}
            />
          </motion.div>
        ))}

        {/* Live badge */}
        <div
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium z-20"
          style={{
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(16,185,129,0.3)',
            color: '#10B981',
          }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          Live · 4
        </div>
      </div>

      {/* Bottom info */}
      <div className="mt-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-mono" style={{ color: 'rgba(59,130,246,0.6)' }}>
            {feature.num}
          </span>
          <span
            className="text-xs font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full"
            style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            {feature.tag}
          </span>
        </div>
        <h3
          className="text-xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          {feature.title}
        </h3>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {feature.description}
        </p>
      </div>
    </div>
  )
}

/* ─── Normal Feature Card ───────────────────────────────────────── */
function NormalCard({ feature, index }: { feature: Feature; index: number }) {
  const [hovered, setHovered] = useState(false)
  const Icon = feature.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 44, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="group relative rounded-3xl p-6 overflow-hidden cursor-default"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        boxShadow: hovered
          ? `0 16px 48px rgba(${feature.rgb},0.18), 0 4px 16px rgba(${feature.rgb},0.1)`
          : '0 1px 4px rgba(0,0,0,0.06)',
        borderColor: hovered ? `rgba(${feature.rgb},0.4)` : undefined,
      }}
    >
      {/* Hover radial glow */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(ellipse at 20% 20%, rgba(${feature.rgb},0.09), transparent 65%)`,
        }}
      />

      {/* Large background icon — decorative */}
      <div
        className="absolute -bottom-5 -right-5 w-28 h-28 rounded-3xl flex items-center justify-center pointer-events-none"
        style={{
          background: `rgba(${feature.rgb},0.05)`,
          transform: 'rotate(12deg)',
        }}
      >
        <Icon style={{ width: 52, height: 52, color: `rgba(${feature.rgb},0.14)` }} />
      </div>

      {/* Top row: number + icon badge */}
      <div className="relative z-10 flex items-center justify-between mb-5">
        <span
          className="text-xs font-mono font-bold tracking-wider"
          style={{ color: `rgba(${feature.rgb},0.5)` }}
        >
          {feature.num}
        </span>

        <motion.div
          animate={hovered ? { scale: 1.12, rotate: 8 } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, rgba(${feature.rgb},0.95), rgba(${feature.rgb},0.7))`,
            boxShadow: hovered
              ? `0 8px 24px rgba(${feature.rgb},0.42)`
              : `0 4px 12px rgba(${feature.rgb},0.25)`,
          }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      {/* Tag */}
      {feature.tag && (
        <div className="relative z-10 mb-3">
          <span
            className="inline-block text-xs font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full"
            style={{
              background: `rgba(${feature.rgb},0.1)`,
              color: feature.accent,
              border: `1px solid rgba(${feature.rgb},0.2)`,
            }}
          >
            {feature.tag}
          </span>
        </div>
      )}

      {/* Title */}
      <h3
        className="relative z-10 text-lg font-bold leading-snug"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p
        className="relative z-10 text-sm mt-2 leading-relaxed"
        style={{ color: 'var(--text-muted)' }}
      >
        {feature.description}
      </p>

      {/* Bottom accent bar */}
      <div
        className="relative z-10 mt-5 h-px rounded-full overflow-hidden"
        style={{ background: 'var(--border)' }}
      >
        <motion.div
          className="h-full rounded-full"
          animate={{ width: hovered ? '100%' : '0%' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            background: `linear-gradient(90deg, rgba(${feature.rgb},0.85), rgba(${feature.rgb},0.25))`,
          }}
        />
      </div>
    </motion.div>
  )
}

/* ─── Special Card (SOS / Map) wrapper ─────────────────────────── */
function SpecialCard({ feature, index }: { feature: Feature; index: number }) {
  const isWide = feature.size === 'wide'

  return (
    <motion.div
      initial={{ opacity: 0, y: 44, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className={[
        'group relative rounded-3xl p-6 overflow-hidden cursor-default',
        isWide ? 'md:col-span-2' : 'md:col-span-2 md:row-span-2 flex flex-col',
      ].join(' ')}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid rgba(${feature.rgb},0.22)`,
        boxShadow: `0 4px 24px rgba(${feature.rgb},0.08)`,
        transition: 'box-shadow 0.3s, border-color 0.3s',
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at ${isWide ? '8%' : '50%'} ${isWide ? '50%' : '20%'}, rgba(${feature.rgb},0.07), transparent 60%)`,
        }}
      />

      {/* Top color stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
        style={{ background: `linear-gradient(90deg, ${feature.accent}, transparent)` }}
      />

      {feature.special === 'sos' && <SOSCard feature={feature} />}
      {feature.special === 'map' && <MapCard feature={feature} />}
    </motion.div>
  )
}

/* ─── Section ───────────────────────────────────────────────────── */
export default function FeaturesSection() {
  const normal = FEATURES.filter((f) => !f.special)

  return (
    <section
      id="features"
      className="relative py-28 px-4 sm:px-6 overflow-hidden"
      style={{ background: 'var(--bg-surface2)' }}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.1), transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.08), transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-5 px-4 py-1.5 rounded-full"
            style={{
              color: 'var(--gold)',
              background: 'rgba(var(--gold-rgb),0.1)',
              border: '1px solid rgba(var(--gold-rgb),0.25)',
            }}
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--gold)' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            Powerful Features
          </span>

          <h2
            className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            Everything Your{' '}
            <span className="gradient-text-gold">Family Needs</span>
          </h2>

          <p className="text-lg mt-4 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            12 deeply integrated features working invisibly in the background — so you never worry.
          </p>

          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="h-0.5 mx-auto mt-6 rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }}
          />
        </motion.div>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-auto gap-4">
          {/* Row 1: SOS (2-col) + Map (2-col, 2-row) */}
          <SpecialCard feature={FEATURES[0]} index={0} />
          <SpecialCard feature={FEATURES[1]} index={1} />

          {/* Row 2: 2 normal cards fill under SOS; Map continues */}
          {normal.slice(0, 2).map((f, i) => (
            <NormalCard key={f.id} feature={f} index={i + 2} />
          ))}

          {/* Rows 3-4: remaining 8 normal cards, 4 per row */}
          {normal.slice(2).map((f, i) => (
            <NormalCard key={f.id} feature={f} index={i + 4} />
          ))}
        </div>

        {/* ── Footer strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-14 text-center"
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            All features work offline · End-to-end encrypted · No ads · No data selling
          </p>
        </motion.div>
      </div>
    </section>
  )
}
