'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  Home, Shield, Lock, Camera, Bell, Wifi, ChevronRight,
  CheckCircle, Zap, Eye, Users, Clock, MapPin, ArrowRight,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/* ── Variants ───────────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

function Section({ children, id, bg = '#0B0D13' }: { children: React.ReactNode; id?: string; bg?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      style={{ background: bg, padding: '80px 0' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>{children}</div>
    </motion.section>
  )
}

/* ── Platform data ──────────────────────────────────────────────────────────── */
const PLATFORMS = [
  {
    name: 'Amazon Alexa',
    logo: '🔵',
    color: '#00CAFF',
    tagline: '"Hey Alexa, where is my family?"',
    badge: 'Alexa Skill',
    badgeColor: '#00CAFF',
    features: [
      'Ask where any family member is by name',
      'Voice-triggered family check-ins',
      '"Alexa, is Rohan home yet?" answered instantly',
      'SOS alert via voice command',
    ],
  },
  {
    name: 'Google Home',
    logo: '🏠',
    color: '#4285F4',
    tagline: '"Hey Google, is everyone home?"',
    badge: 'Works with Google Home',
    badgeColor: '#4285F4',
    features: [
      'Arrival and departure presence detection',
      'Broadcast family alerts to all speakers',
      'Trigger home automations on family events',
      'Chromecast family map display',
    ],
  },
  {
    name: 'Home Assistant',
    logo: '⚙️',
    color: '#18BCEF',
    tagline: 'Open-source. Your data, your rules.',
    badge: 'MQTT & REST API',
    badgeColor: '#18BCEF',
    features: [
      'Full MQTT integration for all events',
      'Custom automations via YAML/blueprints',
      'Lovelace card for family map',
      'Webhook triggers for location events',
    ],
  },
  {
    name: 'Apple HomeKit',
    logo: '🍎',
    color: '#A0AEC0',
    tagline: 'Presence detection via iCloud',
    badge: 'Coming Soon',
    badgeColor: '#A0AEC0',
    comingSoon: true,
    features: [
      'iCloud family presence detection',
      'Siri voice commands for family status',
      'Arrival/departure HomeKit scenes',
      'Privacy-first on-device processing',
    ],
  },
]

/* ── Smart devices ──────────────────────────────────────────────────────────── */
const DEVICES = [
  {
    icon: Lock, name: 'Smart Locks', color: '#F59E0B',
    status: 'Locked',
    statusColor: '#10B981',
    description: 'Auto-unlock when family arrives, auto-lock when last person leaves.',
    features: ['Auto-unlock on arrival', 'Full lock history', 'Remote unlock from app', 'Guest access codes'],
  },
  {
    icon: Camera, name: 'Smart Cameras', color: '#3B82F6',
    status: 'Recording',
    statusColor: '#10B981',
    description: 'Motion alerts linked to family locations — know who triggered the sensor.',
    features: ['Location-linked motion alerts', 'Family face recognition', 'Arm/disarm with presence', 'SOS auto-record'],
  },
  {
    icon: Bell, name: 'Smart Doorbell', color: '#8B5CF6',
    status: 'Active',
    statusColor: '#10B981',
    description: 'Visitor notifications sent to the whole family when nobody is home.',
    features: ['No-one-home visitor alerts', 'Family group notifications', '2-way audio from any device', 'Package detection alerts'],
  },
  {
    icon: Wifi, name: 'Smart Sensors', color: '#10B981',
    status: 'All Closed',
    statusColor: '#10B981',
    description: 'Door and window open/close alerts correlated with family presence.',
    features: ['Door/window open alerts', 'Motion zone monitoring', 'Presence-aware notifications', 'Tamper detection'],
  },
]

/* ── Automation rules ───────────────────────────────────────────────────────── */
const AUTOMATIONS = [
  {
    trigger: 'When Sarah arrives home',
    actions: ['Turn on lights', 'Send notification to family', 'Unlock front door', 'Play welcome message on Alexa'],
    color: '#10B981',
    icon: '🏠',
  },
  {
    trigger: 'When last family member leaves',
    actions: ['Lock all doors', 'Arm cameras', 'Turn off lights', 'Send "Home secured" to family'],
    color: '#F59E0B',
    icon: '🔒',
  },
  {
    trigger: 'When child arrives at school',
    actions: ['Send parent notification', 'Mark attendance confirmed', 'Update family map status', 'Log arrival time'],
    color: '#3B82F6',
    icon: '🎒',
  },
  {
    trigger: 'When elderly SOS triggered',
    actions: ['Notify all caregivers instantly', 'Unlock door for emergency access', 'Start camera recording', 'Call emergency services if no response'],
    color: '#EF4444',
    icon: '🆘',
  },
]

/* ── Family presence ────────────────────────────────────────────────────────── */
const FAMILY_STATUS = [
  { name: 'Dad', initials: 'D', color: '#3B82F6', status: 'Home', location: 'Living Room', isHome: true },
  { name: 'Mom', initials: 'M', color: '#10B981', status: 'Away', location: 'Office — Connaught Place', isHome: false },
  { name: 'Rohan', initials: 'R', color: '#F59E0B', status: 'Away', location: 'School — DPS', isHome: false },
]

/* ── Timeline data ──────────────────────────────────────────────────────────── */
const TIMELINE_HOURS = ['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm']
const OCCUPANCY = [1, 3, 1, 1, 0, 0, 2, 3, 3] // number of people home at each hour

/* ── Coming soon integrations ───────────────────────────────────────────────── */
const COMING_SOON = [
  { name: 'Ring', icon: '🔔', color: '#F97316' },
  { name: 'Nest', icon: '🌡️', color: '#4CAF50' },
  { name: 'Philips Hue', icon: '💡', color: '#E040FB' },
  { name: 'Yale Lock', icon: '🔑', color: '#2196F3' },
]

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function SmartHomePage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          background: 'linear-gradient(135deg, #0a1020 0%, #0d1830 45%, #0a1a14 100%)',
          minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', padding: '120px 24px 80px',
        }}
      >
        {/* House silhouette */}
        <svg style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 1000, opacity: 0.05, pointerEvents: 'none' }}
          viewBox="0 0 1000 320" preserveAspectRatio="xMidYMax slice">
          <polygon points="500,20 180,200 820,200" fill="white" />
          <rect x="200" y="200" width="600" height="120" fill="white" />
          <rect x="410" y="240" width="90" height="80" fill="#0a1020" />
          <rect x="250" y="218" width="70" height="70" fill="#0a1020" />
          <rect x="670" y="218" width="70" height="70" fill="#0a1020" />
          {/* Connection lines to device dots */}
          <line x1="500" y1="110" x2="80" y2="60" stroke="white" strokeWidth="1.5" strokeDasharray="8,5" />
          <line x1="500" y1="110" x2="920" y2="60" stroke="white" strokeWidth="1.5" strokeDasharray="8,5" />
          <line x1="500" y1="110" x2="940" y2="240" stroke="white" strokeWidth="1.5" strokeDasharray="8,5" />
          <line x1="500" y1="110" x2="60" y2="240" stroke="white" strokeWidth="1.5" strokeDasharray="8,5" />
          <circle cx="80" cy="60" r="16" fill="white" />
          <circle cx="920" cy="60" r="16" fill="white" />
          <circle cx="940" cy="240" r="16" fill="white" />
          <circle cx="60" cy="240" r="16" fill="white" />
        </svg>

        {/* Ambient glows */}
        <div style={{
          position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, rgba(59,130,246,0.04) 50%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity }}
          style={{
            position: 'absolute', top: '15%', left: '10%',
            width: 250, height: 250, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,202,255,0.06) 0%, transparent 70%)',
            filter: 'blur(32px)', pointerEvents: 'none',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, delay: 2 }}
          style={{
            position: 'absolute', bottom: '15%', right: '8%',
            width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
            filter: 'blur(36px)', pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: -16 }} animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }} style={{ marginBottom: 32, textAlign: 'left' }}
          >
            <Link href="/" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              ← Back to Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }} animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}
          >
            <motion.div
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                width: 96, height: 96, borderRadius: '50%',
                background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Home size={42} style={{ color: '#34D399' }} />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }} style={{ marginBottom: 20 }}
          >
            <span style={{
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
              color: '#34D399', borderRadius: 999, padding: '6px 18px',
              fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Smart Home Ecosystem
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}
          >
            Gravity Smart Home —
            <br />
            <span style={{ background: 'linear-gradient(135deg, #34D399, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Your Home. Your Family. Connected.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: 640, margin: '0 auto 44px', lineHeight: 1.75 }}
          >
            Connect Alexa, Google Home, smart locks, cameras, and sensors into one intelligent family safety network. Your home knows when you're safe.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}
          >
            <Link href="/pricing" style={{
              background: 'linear-gradient(90deg, #10B981, #059669)',
              color: '#fff', padding: '14px 32px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 700, fontSize: 16,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 28px rgba(16,185,129,0.3)',
            }}>
              Connect Your Smart Home <ChevronRight size={18} />
            </Link>
            <a href="#automations" style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', padding: '14px 32px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 600, fontSize: 16,
            }}>
              See Automations
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={heroInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {[
              { label: 'Alexa & Google', icon: '🔊' },
              { label: 'Smart Locks', icon: '🔒' },
              { label: 'AI Cameras', icon: '📹' },
              { label: '4 Platforms', icon: '🏠' },
              { label: 'Home Assistant', icon: '⚙️' },
            ].map((b) => (
              <div key={b.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 999, padding: '7px 16px',
                color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500,
              }}>
                <span>{b.icon}</span> {b.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ECOSYSTEM INTEGRATIONS ────────────────────────────────────────────── */}
      <Section id="integrations" bg="rgba(255,255,255,0.02)">
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#F1EDE4', letterSpacing: '-0.02em', marginBottom: 14 }}>
            Ecosystem Integrations
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
            Four major smart home platforms. One connected family safety layer.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {PLATFORMS.map((p) => (
            <motion.div
              key={p.name}
              variants={fadeUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              style={{
                background: '#0B0D13', border: `1px solid ${p.color}25`,
                borderTop: `3px solid ${p.color}`,
                borderRadius: 18, padding: '28px 24px',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {p.comingSoon && (
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'rgba(160,174,192,0.12)', border: '1px solid rgba(160,174,192,0.25)',
                  borderRadius: 999, padding: '3px 10px',
                  fontSize: 11, fontWeight: 700, color: '#A0AEC0', letterSpacing: '0.06em',
                }}>
                  COMING SOON
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${p.color}14`, border: `1px solid ${p.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26,
                }}>
                  {p.logo}
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, color: '#F1EDE4', fontSize: 16, marginBottom: 4 }}>{p.name}</h3>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: p.badgeColor,
                    background: `${p.badgeColor}15`, border: `1px solid ${p.badgeColor}30`,
                    borderRadius: 999, padding: '2px 9px',
                  }}>{p.badge}</span>
                </div>
              </div>

              <p style={{
                fontSize: 14, fontStyle: 'italic', color: p.color,
                fontWeight: 600, marginBottom: 16, lineHeight: 1.4,
              }}>
                {p.tagline}
              </p>

              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.features.map((feat) => (
                  <li key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.45 }}>
                    <CheckCircle size={13} style={{ color: p.color, flexShrink: 0, marginTop: 2 }} />
                    {feat}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── SMART DEVICES ─────────────────────────────────────────────────────── */}
      <Section id="devices" bg="#0B0D13">
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#F1EDE4', letterSpacing: '-0.02em', marginBottom: 14 }}>
            Connected Smart Devices
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 540, margin: '0 auto', lineHeight: 1.75 }}>
            Every device in your home becomes part of the family safety network — with intelligent triggers and alerts.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {DEVICES.map(({ icon: Icon, name, color, status, statusColor, description, features }) => (
            <motion.div
              key={name}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}20`,
                borderRadius: 18, padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${color}15`, border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: statusColor }}>{status}</span>
                </div>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F1EDE4', marginBottom: 8 }}>{name}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 16 }}>{description}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <CheckCircle size={12} style={{ color, flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── AUTOMATION RULES ──────────────────────────────────────────────────── */}
      <Section id="automations" bg="rgba(255,255,255,0.015)">
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#F1EDE4', letterSpacing: '-0.02em', marginBottom: 14 }}>
            Smart Automation Rules
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 540, margin: '0 auto', lineHeight: 1.75 }}>
            Build powerful IF/THEN rules that connect your family's movements with your home's devices — automatically.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {AUTOMATIONS.map(({ trigger, actions, color, icon }) => (
            <motion.div
              key={trigger}
              variants={fadeUp}
              style={{
                background: '#0B0D13', border: `1px solid ${color}20`,
                borderRadius: 18, padding: '26px 22px',
              }}
            >
              {/* IF */}
              <div style={{ marginBottom: 16 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color, letterSpacing: '0.1em',
                  background: `${color}15`, border: `1px solid ${color}25`,
                  borderRadius: 999, padding: '3px 10px',
                }}>IF</span>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginTop: 12, padding: '12px 14px', borderRadius: 10,
                  background: `${color}08`, border: `1px solid ${color}20`,
                }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#F1EDE4', lineHeight: 1.4 }}>{trigger}</p>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 8, marginBottom: 12 }}>
                <ArrowRight size={16} style={{ color, opacity: 0.6 }} />
              </div>

              {/* THEN */}
              <div>
                <span style={{
                  fontSize: 10, fontWeight: 700, color, letterSpacing: '0.1em',
                  background: `${color}15`, border: `1px solid ${color}25`,
                  borderRadius: 999, padding: '3px 10px',
                }}>THEN</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                  {actions.map((action, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <Zap size={12} style={{ color, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── PRESENCE DETECTION ────────────────────────────────────────────────── */}
      <Section id="presence" bg="#0B0D13">
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#F1EDE4', letterSpacing: '-0.02em', marginBottom: 14 }}>
            Family Presence Detection
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 540, margin: '0 auto', lineHeight: 1.75 }}>
            Your smart home always knows who's home — and uses that intelligence to keep everyone safe.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28 }}>
          {/* Family status grid */}
          <motion.div variants={fadeUp} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 22, padding: '28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Users size={18} style={{ color: '#10B981' }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>FAMILY STATUS RIGHT NOW</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {FAMILY_STATUS.map(({ name, initials, color, status, location, isHome }) => (
                <div key={name} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 12,
                  background: isHome ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
                  border: isHome ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: `${color}20`, border: `2px solid ${color}50`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17, fontWeight: 700, color,
                  }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#F1EDE4', marginBottom: 3 }}>{name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={11} style={{ color: isHome ? '#10B981' : 'rgba(255,255,255,0.35)' }} />
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{location}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: isHome ? '#10B981' : '#6B7280', display: 'inline-block',
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: isHome ? '#10B981' : 'rgba(255,255,255,0.45)' }}>
                      {status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Occupancy timeline */}
          <motion.div variants={fadeUp} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 22, padding: '28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Clock size={18} style={{ color: '#3B82F6' }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>HOME OCCUPANCY TODAY</p>
            </div>

            {/* Bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, marginBottom: 10 }}>
              {TIMELINE_HOURS.map((hour, i) => {
                const val = OCCUPANCY[i]
                const pct = (val / 3) * 100
                return (
                  <div key={hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${Math.max(pct, 4)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.05 }}
                      viewport={{ once: true }}
                      style={{
                        width: '100%', borderRadius: '3px 3px 0 0',
                        background: val === 3 ? '#10B981' : val >= 1 ? '#3B82F6' : 'rgba(255,255,255,0.08)',
                        alignSelf: 'flex-end',
                      }}
                    />
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {TIMELINE_HOURS.map((hour) => (
                <span key={hour} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', flex: 1 }}>{hour}</span>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
              {[
                { color: '#10B981', label: 'Full family home' },
                { color: '#3B82F6', label: 'Someone home' },
                { color: 'rgba(255,255,255,0.15)', label: 'Empty' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Current status pill */}
            <div style={{
              marginTop: 20, padding: '12px 16px', borderRadius: 10,
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                <span style={{ color: '#3B82F6', fontWeight: 700 }}>Right now:</span> 1 of 3 family members home. Smart lock is armed, cameras are monitoring.
              </p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── COMING SOON ───────────────────────────────────────────────────────── */}
      <Section id="coming-soon" bg="rgba(255,255,255,0.015)">
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, color: '#F1EDE4', letterSpacing: '-0.02em', marginBottom: 14 }}>
            More Integrations Coming Soon
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            We're expanding the ecosystem. Vote for your favourite in the app.
          </p>
        </motion.div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          {COMING_SOON.map(({ name, icon, color }) => (
            <motion.div
              key={name}
              variants={fadeUp}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                background: '#0B0D13', border: `1px solid ${color}20`,
                borderRadius: 14, padding: '14px 20px',
              }}
            >
              <span style={{ fontSize: 22 }}>{icon}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#F1EDE4' }}>{name}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, color,
                background: `${color}15`, border: `1px solid ${color}25`,
                borderRadius: 999, padding: '3px 10px',
              }}>COMING SOON</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0a1020 0%, #0a1a14 100%)',
        padding: '96px 24px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
          }}>
            <Home size={32} style={{ color: '#34D399' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16, letterSpacing: '-0.02em' }}>
            Connect Your Smart Home
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 520, margin: '0 auto 16px', lineHeight: 1.75 }}>
            Transform your smart home into a unified family safety network. Setup takes under 5 minutes.
          </p>
          <p style={{ color: '#D4A853', fontSize: 18, fontWeight: 800, marginBottom: 40 }}>
            Premium Feature — Included in Family Plan
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <Link href="/pricing" style={{
              background: 'linear-gradient(90deg, #10B981, #059669)',
              color: '#fff', padding: '15px 36px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 700, fontSize: 16,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 28px rgba(16,185,129,0.3)',
            }}>
              Connect Your Smart Home <ChevronRight size={18} />
            </Link>
            <Link href="/pricing" style={{
              background: 'transparent', color: '#fff', padding: '15px 36px',
              borderRadius: 12, textDecoration: 'none', fontWeight: 600,
              fontSize: 16, border: '1px solid rgba(255,255,255,0.2)',
            }}>
              View Pricing
            </Link>
          </div>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textDecoration: 'none' }}>
            ← Back to Gravity Home
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
