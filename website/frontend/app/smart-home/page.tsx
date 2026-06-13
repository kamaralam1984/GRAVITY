'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  Shield,
  Bell,
  Lock,
  ChevronRight,
  CheckCircle,
  Mic,
  Camera,
  Lightbulb,
  Home,
  Wifi,
  Eye,
  AlertCircle,
  Zap,
  ArrowRight,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/* ── Variants ─────────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

/* ── Integrations ──────────────────────────────────────────────────────────── */
const INTEGRATIONS = [
  {
    name: 'Amazon Alexa',
    icon: '🔵',
    color: '#00CAFF',
    description: 'Voice family status',
    features: ['"Hey Alexa, where is everyone?"', 'Voice-triggered family check-ins', 'Arrival announcements', 'SOS voice command'],
  },
  {
    name: 'Google Home',
    icon: '🏠',
    color: '#4285F4',
    description: 'Family presence detection',
    features: ['Arrival automation triggers', 'Multi-user presence detection', 'Broadcast family alerts', 'Routine integrations'],
  },
  {
    name: 'Apple HomeKit',
    icon: '🍎',
    color: '#A0AEC0',
    description: 'Home security sync',
    features: ['Arrival/departure scenes', 'Home security sync', 'Siri voice commands', 'Privacy-first architecture'],
  },
  {
    name: 'Smart Cameras',
    icon: '📹',
    color: '#10B981',
    description: 'AI motion alerts',
    features: ['AI motion detection', 'Family face recognition', 'Stranger alerts', 'Video clip to family on SOS'],
  },
  {
    name: 'Smart Locks',
    icon: '🔒',
    color: '#F59E0B',
    description: 'Auto-lock automation',
    features: ['Auto-lock when everyone leaves', 'Remote unlock from app', 'Access log for family', 'Guest codes management'],
  },
  {
    name: 'Smart Lights',
    icon: '💡',
    color: '#8B5CF6',
    description: 'Welcome home automation',
    features: ['Welcome home scene', 'SOS strobe mode (red)', 'Presence simulation', 'Bedtime routines'],
  },
]

/* ── Automation flows ──────────────────────────────────────────────────────── */
const FLOWS = [
  {
    title: 'Coming Home',
    color: '#10B981',
    steps: [
      { icon: '📍', label: 'Mom arrives within 500m' },
      { icon: '🔓', label: 'Smart lock unlocks' },
      { icon: '💡', label: 'Lights turn on' },
      { icon: '🔊', label: 'Alexa: "Welcome home, family notified"' },
    ],
  },
  {
    title: 'Last to Leave',
    color: '#F59E0B',
    steps: [
      { icon: '🚪', label: 'Last family member leaves' },
      { icon: '📹', label: 'Cameras arm automatically' },
      { icon: '🔒', label: 'Smart lock locks' },
      { icon: '📱', label: 'Family gets "Home secured" notification' },
    ],
  },
  {
    title: 'SOS at Home',
    color: '#EF4444',
    steps: [
      { icon: '🆘', label: 'SOS pressed inside home' },
      { icon: '🚨', label: 'Outdoor lights strobe red' },
      { icon: '📹', label: 'Cameras start recording' },
      { icon: '📱', label: 'Contacts receive live video clip' },
    ],
  },
]

/* ── Voice commands ───────────────────────────────────────────────────────── */
const VOICE_DEMOS = [
  {
    q: '"Where is Priya?"',
    a: '"Priya is at school, expected home at 4:30 PM"',
    platform: 'Alexa',
    color: '#00CAFF',
  },
  {
    q: '"Is everyone home?"',
    a: '"Dad is home. Mom and kids are still out."',
    platform: 'Google',
    color: '#4285F4',
  },
  {
    q: '"Lock the front door"',
    a: '"Front door locked. All family members are outside."',
    platform: 'Siri',
    color: '#A0AEC0',
  },
]

/* ── Privacy points ───────────────────────────────────────────────────────── */
const PRIVACY = [
  { icon: <Eye size={18} />, text: 'All processing on-device' },
  { icon: <Shield size={18} />, text: 'No third-party data sharing' },
  { icon: <Camera size={18} />, text: 'Camera footage stays local' },
  { icon: <Lock size={18} />, text: 'You control all permissions' },
]

/* ── Section wrapper ──────────────────────────────────────────────────────── */
function Section({ children, bg = 'var(--bg)' }: { children: React.ReactNode; bg?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'}
      style={{ background: bg, padding: '80px 0' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>{children}</div>
    </motion.section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function SmartHomePage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          background: 'linear-gradient(135deg, #0a1020 0%, #0d1830 45%, #0a1a14 100%)',
          minHeight: '90vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', padding: '100px 24px 80px',
        }}
      >
        {/* Home silhouette SVG with glowing connection lines */}
        <svg
          style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 900, opacity: 0.06, pointerEvents: 'none' }}
          viewBox="0 0 900 300"
          preserveAspectRatio="xMidYMax slice"
        >
          {/* House silhouette */}
          <polygon points="450,20 200,180 700,180" fill="white" />
          <rect x="220" y="180" width="460" height="120" fill="white" />
          <rect x="360" y="220" width="80" height="80" fill="#0a1020" />
          <rect x="250" y="200" width="60" height="60" fill="#0a1020" />
          <rect x="580" y="200" width="60" height="60" fill="#0a1020" />
          {/* Connection lines to devices */}
          <line x1="450" y1="100" x2="100" y2="50" stroke="white" strokeWidth="1.5" strokeDasharray="6,4" />
          <line x1="450" y1="100" x2="800" y2="50" stroke="white" strokeWidth="1.5" strokeDasharray="6,4" />
          <line x1="450" y1="100" x2="820" y2="200" stroke="white" strokeWidth="1.5" strokeDasharray="6,4" />
          <line x1="450" y1="100" x2="80" y2="200" stroke="white" strokeWidth="1.5" strokeDasharray="6,4" />
          {/* Device nodes */}
          <circle cx="100" cy="50" r="14" fill="white" />
          <circle cx="800" cy="50" r="14" fill="white" />
          <circle cx="820" cy="200" r="14" fill="white" />
          <circle cx="80" cy="200" r="14" fill="white" />
        </svg>

        {/* Ambient glows */}
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, rgba(59,130,246,0.04) 50%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '15%', left: '12%',
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,202,255,0.06) 0%, transparent 70%)',
            filter: 'blur(28px)', pointerEvents: 'none',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute', bottom: '15%', right: '10%',
            width: 240, height: 240, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
            filter: 'blur(32px)', pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }} style={{ marginBottom: 32, textAlign: 'left' }}
          >
            <Link href="/" style={{
              color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
              fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              ← Back to Gravity Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }} animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}
          >
            <motion.div
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
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
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }} style={{ marginBottom: 20 }}
          >
            <span style={{
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
              color: '#34D399', borderRadius: 999, padding: '6px 18px',
              fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Smart Home Integration
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 6vw, 4rem)',
              fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1, marginBottom: 24,
            }}
          >
            Your Home, Intelligently Safe
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            style={{
              color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              maxWidth: 640, margin: '0 auto 44px', lineHeight: 1.75,
            }}
          >
            Gravity connects with your entire smart home ecosystem to create an automated family safety network. Alexa, Google Home, smart locks, cameras — one connected safety layer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}
          >
            <Link href="/" style={{
              background: 'linear-gradient(90deg, #10B981, #059669)',
              color: '#fff', padding: '14px 32px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 28px rgba(16,185,129,0.35)',
            }}>
              Connect Your Smart Home <ChevronRight size={18} />
            </Link>
            <a href="#automations" style={{
              background: 'transparent', color: '#fff', padding: '14px 32px',
              borderRadius: 12, textDecoration: 'none', fontWeight: 600,
              fontSize: '1rem', border: '1px solid rgba(255,255,255,0.2)',
            }}>
              See Automations
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7 }}
            style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {[
              { icon: <Mic size={15} />, label: 'Voice Control' },
              { icon: <Lock size={15} />, label: 'Smart Locks' },
              { icon: <Camera size={15} />, label: 'AI Cameras' },
              { icon: <Wifi size={15} />, label: '6 Platforms' },
            ].map((b) => (
              <div key={b.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 999, padding: '7px 16px',
                color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', fontWeight: 500,
              }}>
                {b.icon} {b.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── INTEGRATIONS GRID ─────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
            }}>
              Works with Your Entire Smart Home
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto', lineHeight: 1.75 }}>
              Gravity integrates with every major smart home platform. No new hardware required — just connect to what you already have and transform it into a family safety network.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 22,
            }}
          >
            {INTEGRATIONS.map((item) => (
              <motion.div
                key={item.name}
                variants={fadeUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                style={{
                  background: 'var(--bg)', border: `1px solid ${item.color}25`,
                  borderTop: `3px solid ${item.color}`,
                  borderRadius: 16, padding: '26px 22px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 12,
                    background: `${item.color}14`,
                    border: `1px solid ${item.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)', fontWeight: 700,
                      color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: 2,
                    }}>
                      {item.name}
                    </h3>
                    <span style={{ color: item.color, fontSize: '0.78rem', fontWeight: 600 }}>
                      {item.description}
                    </span>
                  </div>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {item.features.map((feat) => (
                    <li key={feat} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                      color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.45,
                    }}>
                      <CheckCircle size={13} style={{ color: item.color, flexShrink: 0, marginTop: 2 }} />
                      {feat}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── AUTOMATION FLOWS ──────────────────────────────────────────────── */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger} id="automations">
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
            }}>
              Intelligent Automation Flows
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Gravity's smart automations trigger across your entire home when family members arrive, leave, or press SOS. Everything works together — automatically.
            </p>
          </motion.div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28,
          }}>
            {FLOWS.map((flow, fi) => (
              <motion.div
                key={flow.title}
                variants={fadeUp}
                style={{
                  background: 'var(--bg-surface)', border: `1px solid ${flow.color}25`,
                  borderRadius: 18, padding: '28px 24px', overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: 120, height: 120,
                  borderRadius: '0 18px 0 100%',
                  background: `${flow.color}08`,
                  pointerEvents: 'none',
                }} />

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: `${flow.color}14`, border: `1px solid ${flow.color}30`,
                  borderRadius: 999, padding: '5px 14px',
                  fontSize: '0.78rem', fontWeight: 700, color: flow.color,
                  marginBottom: 22, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  <Zap size={12} />
                  {flow.title}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {flow.steps.map((step, si) => (
                    <div key={si}>
                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: fi * 0.1 + si * 0.08, duration: 0.4 }}
                        viewport={{ once: true }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 0',
                        }}
                      >
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: `${flow.color}12`,
                          border: `1px solid ${flow.color}25`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.1rem', flexShrink: 0,
                        }}>
                          {step.icon}
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.4 }}>
                          {step.label}
                        </span>
                      </motion.div>
                      {si < flow.steps.length - 1 && (
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          paddingLeft: 19, paddingBottom: 2,
                        }}>
                          <ArrowRight size={14} style={{ color: flow.color, opacity: 0.5 }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── VOICE COMMANDS ────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
            }}>
              Ask Your Smart Speaker Anything
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
              Gravity connects your family's location data directly to your voice assistant. Ask where everyone is — just like that.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            {VOICE_DEMOS.map((demo, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                style={{
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: '24px 24px', overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#818CF8', flexShrink: 0,
                  }}>
                    <Mic size={16} />
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      You say
                    </div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                      {demo.q}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  background: `${demo.color}08`, border: `1px solid ${demo.color}20`,
                  borderRadius: 12, padding: '14px 16px',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `${demo.color}18`, border: `1px solid ${demo.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: demo.color, flexShrink: 0, fontSize: '1rem',
                  }}>
                    🔊
                  </div>
                  <div>
                    <div style={{ color: demo.color, fontSize: '0.75rem', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {demo.platform} responds
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                      {demo.a}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── PRIVACY FIRST ─────────────────────────────────────────────────── */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger}>
          <motion.div
            variants={fadeUp}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 56, alignItems: 'center',
            }}
          >
            <div>
              <span style={{
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                color: '#10B981', borderRadius: 999, padding: '5px 14px',
                fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                display: 'inline-block', marginBottom: 20,
              }}>
                Privacy First
              </span>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, lineHeight: 1.2,
              }}>
                Your Home Data Stays Private
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 28 }}>
                Smart home integration does not mean giving up your privacy. Every connection Gravity makes to your smart home is end-to-end encrypted, processed on your devices, and never shared with third parties.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                {PRIVACY.map((item) => (
                  <div key={item.text} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '14px 18px',
                  }}>
                    <span style={{ color: '#10B981' }}>{item.icon}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <div style={{
                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 12, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <Shield size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  End-to-end encrypted connection to all smart devices
                </span>
              </div>
            </div>

            {/* Visual */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 22, padding: '32px', width: '100%', maxWidth: 360,
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}>
                    <Shield size={28} style={{ color: '#10B981' }} />
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    Privacy Dashboard
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>
                    All systems normal
                  </div>
                </div>

                {[
                  { label: 'Data encryption', status: 'Active', color: '#10B981' },
                  { label: 'Local processing', status: 'Enabled', color: '#10B981' },
                  { label: 'Third-party sharing', status: 'Blocked', color: '#EF4444' },
                  { label: 'Camera data', status: 'Local only', color: '#10B981' },
                  { label: 'Voice recordings', status: 'Not stored', color: '#10B981' },
                ].map((row) => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{row.label}</span>
                    <span style={{
                      background: `${row.color}15`, color: row.color,
                      borderRadius: 999, padding: '2px 10px',
                      fontSize: '0.75rem', fontWeight: 700,
                    }}>
                      {row.status}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0a1020 0%, #0a1a14 100%)',
        padding: '96px 24px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%)',
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
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 700, color: '#FFFFFF', marginBottom: 16,
          }}>
            Connect Your Smart Home
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.75 }}>
            Transform your smart home devices into a unified family safety network. Setup takes minutes. Privacy guaranteed. Start free today.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <Link href="/" style={{
              background: 'linear-gradient(90deg, #10B981, #059669)',
              color: '#fff', padding: '15px 36px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 28px rgba(16,185,129,0.35)',
            }}>
              Connect Your Smart Home <ChevronRight size={18} />
            </Link>
            <Link href="/pricing" style={{
              background: 'transparent', color: '#fff', padding: '15px 36px',
              borderRadius: 12, textDecoration: 'none', fontWeight: 600,
              fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.2)',
            }}>
              View Pricing
            </Link>
          </div>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', textDecoration: 'none' }}>
            ← Back to Gravity Home
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
