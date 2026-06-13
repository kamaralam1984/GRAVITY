'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/* ─────────────────────────────────────────────────────────────
   Animation helpers
───────────────────────────────────────────────────────────── */
function fadeUp(delay = 0, duration = 0.7) {
  return {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      delay,
    },
  }
}

function useSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return { ref, inView }
}

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const ZERO_TRUST_PILLARS = [
  {
    icon: '🪪',
    title: 'Identity Verification',
    color: '#4B80F0',
    rgb: '75,128,240',
    points: [
      'Multi-factor authentication (MFA) enforced',
      'Biometric verification on sensitive actions',
      'Continuous session re-authentication',
    ],
  },
  {
    icon: '💻',
    title: 'Device Trust',
    color: '#D4A853',
    rgb: '212,168,83',
    points: [
      'Device fingerprinting on every login',
      'Unrecognized device alerts in real-time',
      'Remote device revocation capability',
    ],
  },
  {
    icon: '🌐',
    title: 'Network Security',
    color: '#10B981',
    rgb: '16,185,129',
    points: [
      'TLS 1.3 for all data in transit',
      'Certificate pinning on mobile apps',
      'DDoS protection via enterprise CDN',
    ],
  },
  {
    icon: '🔐',
    title: 'Data Encryption',
    color: '#8B5CF6',
    rgb: '139,92,246',
    points: [
      '256-bit AES-GCM encryption at rest',
      'Per-user key derivation (PBKDF2)',
      'HSM-backed key storage in production',
    ],
  },
]

const CERTIFICATIONS = [
  {
    label: 'GDPR',
    icon: '🇪🇺',
    fullName: 'General Data Protection Regulation',
    status: 'Compliant',
    desc: 'EU data privacy regulation. We offer DPAs, right to erasure, data portability, and EU-based data residency for European users.',
    color: '#4B80F0',
    rgb: '75,128,240',
  },
  {
    label: 'ISO 27001',
    icon: '📋',
    fullName: 'Information Security Management',
    status: 'Certified',
    desc: 'International standard for information security. Our ISMS is annually audited by an accredited third-party certification body.',
    color: '#D4A853',
    rgb: '212,168,83',
  },
  {
    label: 'SOC 2 Type II',
    icon: '🛡️',
    fullName: 'Service Organization Control 2',
    status: 'Compliant',
    desc: 'AICPA security controls audit covering Security, Availability, and Confidentiality trust service criteria.',
    color: '#10B981',
    rgb: '16,185,129',
  },
  {
    label: 'HIPAA Ready',
    icon: '🏥',
    fullName: 'Health Insurance Portability Act',
    status: 'Ready',
    desc: 'Healthcare data handling controls in place. BAA (Business Associate Agreements) available for healthcare enterprise clients.',
    color: '#8B5CF6',
    rgb: '139,92,246',
  },
]

const SECOPS_ITEMS = [
  {
    icon: '👁️',
    title: '24/7 Security Monitoring',
    desc: 'Our Security Operations Center monitors all systems around the clock. Automated alerts on anomalous activity with human review within 15 minutes.',
    color: '#EF4444',
    rgb: '239,68,68',
  },
  {
    icon: '🤖',
    title: 'Automated Threat Detection',
    desc: 'ML-powered anomaly detection flags brute force, credential stuffing, location spoofing, and API abuse in real time.',
    color: '#F59E0B',
    rgb: '245,158,11',
  },
  {
    icon: '⚡',
    title: 'Incident Response < 1 Hour',
    desc: 'Documented incident response playbooks. P1 severity incidents acknowledged in under 15 minutes, contained within 1 hour.',
    color: '#4B80F0',
    rgb: '75,128,240',
  },
  {
    icon: '🔍',
    title: 'Quarterly Pen Testing',
    desc: 'Independent penetration tests conducted every quarter by CREST-certified security researchers. Full reports available to enterprise clients.',
    color: '#10B981',
    rgb: '16,185,129',
  },
]

const BEHAVIORAL_AUTH_ITEMS = [
  {
    icon: '🧠',
    title: 'AI Behavioral Analysis',
    desc: 'Our AI baseline-profiles normal usage patterns — login time, device, location, and session duration. Any deviation triggers a re-verification step.',
    color: '#8B5CF6',
    rgb: '139,92,246',
  },
  {
    icon: '📱',
    title: 'Device Fingerprinting',
    desc: 'Each device generates a unique cryptographic fingerprint. New or unrecognized devices are flagged and require explicit user approval.',
    color: '#4B80F0',
    rgb: '75,128,240',
  },
  {
    icon: '📍',
    title: 'Location-Based Verification',
    desc: 'Impossible travel detection — if a login occurs from two geographically distant locations within minutes, access is temporarily suspended.',
    color: '#10B981',
    rgb: '16,185,129',
  },
  {
    icon: '👆',
    title: 'Biometric Integration',
    desc: 'FaceID, TouchID, and Android biometric APIs integrated as a second factor. Biometric data never leaves the user\'s device.',
    color: '#D4A853',
    rgb: '212,168,83',
  },
]

const DATA_RESIDENCY_OPTIONS = [
  { country: 'India', flag: '🇮🇳', region: 'Mumbai / Delhi' },
  { country: 'European Union', flag: '🇪🇺', region: 'Frankfurt / Amsterdam' },
  { country: 'UAE / MENA', flag: '🇦🇪', region: 'Dubai / Abu Dhabi' },
  { country: 'United Kingdom', flag: '🇬🇧', region: 'London' },
]

/* ─────────────────────────────────────────────────────────────
   FLOATING LOCK ICONS
───────────────────────────────────────────────────────────── */
function FloatingLocks() {
  const items = [
    { icon: '🔒', x: 6, y: 22, size: 30, delay: 0 },
    { icon: '🛡️', x: 88, y: 18, size: 26, delay: 0.3 },
    { icon: '🔑', x: 4, y: 68, size: 24, delay: 0.7 },
    { icon: '🔐', x: 91, y: 65, size: 28, delay: 0.5 },
    { icon: '✅', x: 14, y: 85, size: 22, delay: 1.0 },
    { icon: '🛡️', x: 83, y: 85, size: 20, delay: 0.2 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{ left: `${item.x}%`, top: `${item.y}%`, fontSize: item.size, opacity: 0.1 }}
          animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
          transition={{
            duration: 5 + i * 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: item.delay,
          }}
        >
          {item.icon}
        </motion.div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
      <div className="absolute inset-0" style={{ background: 'var(--bg)' }} />
      {/* Top glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '1100px',
          height: '700px',
          background:
            'radial-gradient(ellipse, rgba(239,68,68,0.1) 0%, rgba(75,128,240,0.08) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <FloatingLocks />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div {...fadeUp(0)}>
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            style={{
              color: '#EF4444',
              border: '1px solid rgba(239,68,68,0.4)',
              background: 'rgba(239,68,68,0.08)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#EF4444' }} />
            SECURITY & PRIVACY
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.04] tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
        >
          Security That{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #EF4444, #F97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Never Sleeps
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.18)}
          className="mt-4 text-2xl font-semibold"
          style={{ color: 'var(--text-secondary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Zero Trust Architecture
        </motion.p>

        <motion.p
          {...fadeUp(0.26)}
          className="mt-5 max-w-2xl mx-auto text-lg leading-relaxed"
          style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-secondary)' }}
        >
          We never trust, we always verify. Every request — from every device, every user, every network —
          is cryptographically authenticated before access is granted. Your family&apos;s safety data is protected
          by the same standards used by banks and defence organizations.
        </motion.p>

        {/* Quick trust stats */}
        <motion.div
          {...fadeUp(0.36)}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          {[
            { label: '256-bit AES-GCM', sub: 'Encryption' },
            { label: 'Zero Knowledge', sub: 'Key Management' },
            { label: 'ISO 27001', sub: 'Certified' },
            { label: 'SOC 2 Type II', sub: 'Compliant' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center px-5 py-3 rounded-xl"
              style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <span
                className="text-sm font-extrabold"
                style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {item.label}
              </span>
              <span
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
              >
                {item.sub}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   ZERO TRUST — 4 pillars
───────────────────────────────────────────────────────────── */
function ZeroTrustSection() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="py-24" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.07)' }}
          >
            Zero Trust Model
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            &ldquo;Never Trust.{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #EF4444, #F97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Always Verify.&rdquo;
            </span>
          </h2>
          <p
            className="mt-4 max-w-xl mx-auto text-base"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            Every access request is treated as hostile until cryptographically proven legitimate.
            Four independent security layers protect your data.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {ZERO_TRUST_PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 + i * 0.1 }}
              className="rounded-2xl p-7 flex flex-col gap-5"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(16px)',
                border: `1px solid rgba(${pillar.rgb},0.2)`,
                borderTop: `3px solid ${pillar.color}`,
                boxShadow: `0 4px 20px rgba(${pillar.rgb},0.08)`,
              }}
              whileHover={{ scale: 1.02, boxShadow: `0 8px 36px rgba(${pillar.rgb},0.18)` }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: `rgba(${pillar.rgb},0.1)` }}
              >
                {pillar.icon}
              </div>
              <h3
                className="text-base font-bold"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
              >
                {pillar.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {pillar.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-xs">
                    <span style={{ color: pillar.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   END-TO-END ENCRYPTION VISUAL
───────────────────────────────────────────────────────────── */
function EncryptionSection() {
  const { ref, inView } = useSection()

  const encSteps = [
    { icon: '📱', label: 'Your Device', sub: 'AES-GCM encrypted', color: '#4B80F0' },
    { icon: '→', label: '', sub: '', color: '#D4A853', isArrow: true },
    { icon: '🔒', label: 'In Transit', sub: 'TLS 1.3 wrapped', color: '#10B981' },
    { icon: '→', label: '', sub: '', color: '#D4A853', isArrow: true },
    { icon: '🗄️', label: 'At Rest', sub: 'HSM-backed keys', color: '#8B5CF6' },
  ]

  return (
    <section ref={ref} className="py-24" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ color: '#4B80F0', border: '1px solid rgba(75,128,240,0.35)', background: 'rgba(75,128,240,0.07)' }}
          >
            End-to-End Encryption
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Encrypted from Device{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #4B80F0, #818CF8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              to Database
            </span>
          </h2>
        </motion.div>

        {/* Encryption flow visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-14"
        >
          {encSteps.map((step, i) =>
            step.isArrow ? (
              <span
                key={i}
                className="text-2xl font-bold hidden md:block"
                style={{ color: '#D4A853', opacity: 0.7 }}
              >
                →
              </span>
            ) : (
              <div
                key={i}
                className="flex flex-col items-center gap-2 px-7 py-6 rounded-2xl"
                style={{
                  background: `rgba(${step.color === '#4B80F0' ? '75,128,240' : step.color === '#10B981' ? '16,185,129' : '139,92,246'},0.08)`,
                  border: `1.5px solid rgba(${step.color === '#4B80F0' ? '75,128,240' : step.color === '#10B981' ? '16,185,129' : '139,92,246'},0.25)`,
                  minWidth: '140px',
                }}
              >
                <span className="text-3xl">{step.icon}</span>
                <span
                  className="font-bold text-sm"
                  style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {step.label}
                </span>
                <span
                  className="text-xs"
                  style={{ color: step.color, fontFamily: "'Inter', sans-serif" }}
                >
                  {step.sub}
                </span>
              </div>
            )
          )}
        </motion.div>

        {/* Three key claims */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '🔑',
              title: '256-bit AES-GCM Encryption',
              desc: 'Military-grade encryption for all location data, messages, and personal information. The same algorithm used by banks and governments worldwide.',
              color: '#4B80F0',
              rgb: '75,128,240',
            },
            {
              icon: '🗝️',
              title: 'Your Keys, Not Ours',
              desc: 'Zero-knowledge key management. Location data is encrypted with a key derived from your credentials. Even Gravity employees cannot read your location data.',
              color: '#D4A853',
              rgb: '212,168,83',
            },
            {
              icon: '🚫',
              title: 'Even Gravity Cannot See',
              desc: 'Your location history, family circle, and personal safety data are mathematically inaccessible to us. We process but never read your private data.',
              color: '#10B981',
              rgb: '16,185,129',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
              className="rounded-2xl p-7 flex flex-col gap-4"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(16px)',
                border: `1px solid rgba(${item.rgb},0.2)`,
                boxShadow: `0 4px 20px rgba(${item.rgb},0.07)`,
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: `rgba(${item.rgb},0.1)` }}
              >
                {item.icon}
              </div>
              <h3
                className="text-base font-bold"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
              >
                {item.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
              >
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   COMPLIANCE DASHBOARD — 4 large certification cards
───────────────────────────────────────────────────────────── */
function ComplianceSection() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="py-24" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ color: '#10B981', border: '1px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.07)' }}
          >
            Compliance Dashboard
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Certified.{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #10B981, #34D399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Compliant. Audited.
            </span>
          </h2>
          <p
            className="mt-4 max-w-xl mx-auto text-base"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            We meet the most demanding security and privacy standards across all major jurisdictions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {CERTIFICATIONS.map((cert, i) => (
            <motion.div
              key={cert.label}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 + i * 0.1 }}
              className="rounded-2xl p-7 flex flex-col gap-5 relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(16px)',
                border: `1.5px solid rgba(${cert.rgb},0.25)`,
                boxShadow: `0 4px 24px rgba(${cert.rgb},0.1)`,
              }}
              whileHover={{ scale: 1.03, boxShadow: `0 8px 40px rgba(${cert.rgb},0.2)` }}
            >
              {/* Glow corner */}
              <div
                className="absolute top-0 right-0 pointer-events-none"
                style={{
                  width: '80px',
                  height: '80px',
                  background: `radial-gradient(circle at top right, rgba(${cert.rgb},0.2), transparent 70%)`,
                }}
              />
              {/* Badge */}
              <div className="flex items-center justify-between">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: `rgba(${cert.rgb},0.1)` }}
                >
                  {cert.icon}
                </div>
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    color: '#10B981',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
                  {cert.status}
                </div>
              </div>

              <div>
                <h3
                  className="text-xl font-extrabold mb-0.5"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: cert.color }}
                >
                  {cert.label}
                </h3>
                <p
                  className="text-xs"
                  style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                >
                  {cert.fullName}
                </p>
              </div>

              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
              >
                {cert.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   SECURITY OPERATIONS
───────────────────────────────────────────────────────────── */
function SecOpsSection() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="py-24" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.07)' }}
          >
            Security Operations
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Our SOC Works{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #EF4444, #F97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              While You Sleep
            </span>
          </h2>
          <p
            className="mt-4 max-w-xl mx-auto text-base"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            A dedicated Security Operations Center monitors Gravity infrastructure 24 hours a day, 7 days a week.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {SECOPS_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 + i * 0.1 }}
              className="rounded-2xl p-8 flex gap-6 items-start"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(16px)',
                border: `1px solid rgba(${item.rgb},0.2)`,
              }}
              whileHover={{ scale: 1.01 }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `rgba(${item.rgb},0.1)` }}
              >
                {item.icon}
              </div>
              <div>
                <h3
                  className="text-base font-bold mb-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: item.color }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
                >
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   BEHAVIORAL AUTHENTICATION
───────────────────────────────────────────────────────────── */
function BehavioralAuthSection() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="py-24" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.35)', background: 'rgba(139,92,246,0.07)' }}
          >
            Behavioral Authentication
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            AI That Knows{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              When Something&apos;s Wrong
            </span>
          </h2>
          <p
            className="mt-4 max-w-xl mx-auto text-base"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            Beyond passwords — our AI detects anomalous behaviour and stops account takeovers before they happen.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {BEHAVIORAL_AUTH_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 + i * 0.1 }}
              className="rounded-2xl p-7 flex flex-col gap-5"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(16px)',
                border: `1px solid rgba(${item.rgb},0.2)`,
                borderTop: `3px solid ${item.color}`,
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: `rgba(${item.rgb},0.1)` }}
              >
                {item.icon}
              </div>
              <h3
                className="text-base font-bold"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
              >
                {item.title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
              >
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   DATA PRIVACY
───────────────────────────────────────────────────────────── */
function DataPrivacySection() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="py-24" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ color: '#D4A853', border: '1px solid rgba(212,168,83,0.35)', background: 'rgba(212,168,83,0.07)' }}
          >
            Data Privacy
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Your Data.{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #D4A853, #F5C842)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Your Rights.
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {[
            {
              icon: '🚫',
              title: 'We Never Sell Your Data',
              desc: 'Your location data, family circle, and personal information are never sold, shared, or monetized. We earn from subscriptions only.',
              color: '#EF4444',
              rgb: '239,68,68',
            },
            {
              icon: '🗑️',
              title: 'Data Deletion Guarantee',
              desc: 'Request full account deletion at any time. All data — including backups — permanently erased within 30 days. Verifiable.',
              color: '#F59E0B',
              rgb: '245,158,11',
            },
            {
              icon: '🇪🇺',
              title: 'GDPR Right to Erasure',
              desc: 'Full GDPR Article 17 compliance. One-click data export and erasure request directly from your account settings.',
              color: '#4B80F0',
              rgb: '75,128,240',
            },
            {
              icon: '🗺️',
              title: 'Data Residency Options',
              desc: 'Choose where your data lives — India, EU, UAE, or UK. Data never leaves your chosen jurisdiction without consent.',
              color: '#10B981',
              rgb: '16,185,129',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 + i * 0.1 }}
              className="rounded-2xl p-7 flex flex-col gap-4"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(16px)',
                border: `1px solid rgba(${item.rgb},0.2)`,
                borderTop: `3px solid ${item.color}`,
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: `rgba(${item.rgb},0.1)` }}
              >
                {item.icon}
              </div>
              <h3
                className="text-sm font-bold"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
              >
                {item.title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
              >
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Data residency options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="rounded-2xl p-8"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-6"
            style={{ color: '#10B981', fontFamily: "'Inter', sans-serif" }}
          >
            Data Residency Options
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {DATA_RESIDENCY_OPTIONS.map((option) => (
              <div
                key={option.country}
                className="flex items-center gap-3 px-5 py-4 rounded-xl"
                style={{
                  background: 'rgba(16,185,129,0.05)',
                  border: '1px solid rgba(16,185,129,0.15)',
                }}
              >
                <span className="text-2xl">{option.flag}</span>
                <div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {option.country}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                  >
                    {option.region}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   BOTTOM CTA — Download Security Whitepaper
───────────────────────────────────────────────────────────── */
function BottomCta() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="py-24" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="rounded-3xl p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.07) 0%, rgba(75,128,240,0.05) 100%)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.08) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10">
            <div className="text-5xl mb-6">🔐</div>
            <h2
              className="text-4xl md:text-5xl font-extrabold mb-5"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
            >
              Read Our Security Whitepaper
            </h2>
            <p
              className="text-lg mb-10 max-w-xl mx-auto"
              style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
            >
              A 40-page technical document covering our full security architecture, encryption protocols,
              compliance posture, and data handling practices.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/gravity-security-whitepaper.pdf"
                download
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #F97316)',
                  color: '#fff',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: '0 4px 24px rgba(239,68,68,0.35)',
                }}
              >
                Download Security Whitepaper ↓
              </a>
              <a
                href="/enterprise"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid var(--border-strong)',
                  color: 'var(--text-primary)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Enterprise Security Brief →
              </a>
            </div>
            <p
              className="text-xs mt-6"
              style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
            >
              No email required. Direct PDF download.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function SecurityPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <ZeroTrustSection />
      <EncryptionSection />
      <ComplianceSection />
      <SecOpsSection />
      <BehavioralAuthSection />
      <DataPrivacySection />
      <BottomCta />
      <Footer />
    </main>
  )
}
