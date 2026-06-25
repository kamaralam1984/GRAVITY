'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { Car, Shield, Star, ChevronRight, Brain, Bell, CheckCircle } from 'lucide-react'

/* ── Animation helpers ──────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ── Feature cards ──────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Car,
    title: 'Teen Monitoring',
    description: 'Set speed limits, curfew hours, and geofence zones for new drivers. Get alerted on violations instantly.',
    color: '#3B82F6',
    stat: '0 violations',
    statColor: '#10B981',
    bullets: ['Speed limit alerts', 'Curfew enforcement', 'Phone use detection'],
  },
  {
    icon: Brain,
    title: 'AI Coach',
    description: 'Personalised weekly coaching tips based on real driving data — turning behaviour insights into safer habits.',
    color: '#8B5CF6',
    stat: 'Grade B+ → A',
    statColor: '#D4A853',
    bullets: ['Weekly score report', 'Personalised tips', 'Habit tracking'],
  },
  {
    icon: Bell,
    title: 'Crash Detection',
    description: 'Accelerometer + AI detects crashes and auto-alerts emergency contacts within 30 seconds of impact.',
    color: '#EF4444',
    stat: 'Armed 24/7',
    statColor: '#10B981',
    bullets: ['30-second auto-alert', 'Emergency contacts', 'Live location share'],
  },
]

/* ── Mini circular gauge ────────────────────────────────────────────────────── */
function MiniGauge({ score = 23, size = 120 }: { score?: number; size?: number }) {
  const radius = size * 0.38
  const circumference = 2 * Math.PI * radius
  const arcFill = (score / 100) * circumference
  const cx = size / 2
  const cy = size / 2
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={size * 0.08} />
        <motion.circle
          cx={cx} cy={cy} r={radius}
          fill="none" stroke="#10B981" strokeWidth={size * 0.08}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: circumference - arcFill }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
          viewport={{ once: true }}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: size * 0.24, fontWeight: 900, color: '#10B981', lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: size * 0.1, color: 'rgba(255,255,255,0.4)' }}>/100</div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function DrivingSafetySection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      style={{
        background: '#0B0D13',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 500,
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={stagger}
        style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}
      >
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 48, alignItems: 'center', marginBottom: 64 }}>
          <motion.div variants={fadeUp}>
            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Car size={16} style={{ color: '#3B82F6' }} />
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, color: '#3B82F6',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                Driving Safety
              </span>
            </div>

            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900,
              color: '#F1EDE4', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 18,
            }}>
              KVL Track{' '}
              <span style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Driving Shield
              </span>
            </h2>

            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 480, marginBottom: 28 }}>
              AI-powered road protection that monitors every journey in your family — scoring driver behaviour, detecting fatigue, and triggering emergency SOS if a crash occurs.
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
              {[
                { icon: Shield, label: 'Protecting', value: '500,000+', sub: 'Drivers', color: '#3B82F6' },
                { icon: Star, label: 'Safety Score', value: '99.7%', sub: 'Accuracy', color: '#10B981' },
              ].map(({ icon: Icon, label, value, sub, color }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 18px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: `${color}15`, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 900, color: '#F1EDE4', lineHeight: 1 }}>{value}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/driving-safety" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              color: '#fff', padding: '13px 28px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 700, fontSize: 15,
              boxShadow: '0 0 24px rgba(59,130,246,0.25)',
            }}>
              Learn More <ChevronRight size={16} />
            </Link>
          </motion.div>

          {/* Risk score preview card */}
          <motion.div variants={fadeUp}>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 24, padding: '32px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginBottom: 20 }}>FAMILY RISK DASHBOARD</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
                <MiniGauge score={23} size={120} />
                <div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>Overall Risk Score</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <CheckCircle size={14} style={{ color: '#10B981' }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>SAFE DRIVER</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                    Top <strong style={{ color: '#10B981' }}>15%</strong> of all users
                  </p>
                </div>
              </div>

              {/* Mini score bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Speed', score: 95, color: '#10B981' },
                  { label: 'Phone Use', score: 100, color: '#F59E0B' },
                  { label: 'Braking', score: 88, color: '#3B82F6' },
                ].map(({ label, score, color }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>{score}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${score}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        viewport={{ once: true }}
                        style={{ height: '100%', background: color, borderRadius: 2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)' }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ color: '#10B981', fontWeight: 600 }}>0 incidents</span> this month. Keep it up!
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {FEATURES.map(({ icon: Icon, title, description, color, stat, statColor, bullets }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              style={{
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}20`,
                borderTop: `2px solid ${color}`, borderRadius: 18, padding: '24px',
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
                <span style={{
                  fontSize: 12, fontWeight: 700, color: statColor,
                  background: `${statColor}15`, border: `1px solid ${statColor}25`,
                  borderRadius: 999, padding: '3px 10px',
                }}>
                  {stat}
                </span>
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#F1EDE4', marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 16 }}>{description}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bullets.map((b) => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={13} style={{ color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{b}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom stat strip */}
        <motion.div
          variants={fadeUp}
          style={{
            marginTop: 48, padding: '20px 28px', borderRadius: 16,
            background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={18} style={{ color: '#3B82F6' }} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#F1EDE4' }}>Protecting 500,000+ Drivers</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Across 18 cities in India</p>
            </div>
          </div>
          <Link href="/driving-safety" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
            color: '#60A5FA', padding: '10px 20px', borderRadius: 10,
            textDecoration: 'none', fontWeight: 600, fontSize: 14,
          }}>
            Explore Driving Safety <ChevronRight size={15} />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
