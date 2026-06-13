'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

/* ─────────────── feature tiles data ─────────────── */
const CARE_FEATURES = [
  {
    emoji: '🛡️',
    title: 'Fall Detection',
    desc: 'Instant alert when a fall is detected',
  },
  {
    emoji: '🌅',
    title: 'Daily Check-ins',
    desc: 'Gentle morning wellness reminders',
  },
  {
    emoji: '🧠',
    title: 'AI Routine Monitor',
    desc: 'Flags unusual inactivity or routine changes',
  },
  {
    emoji: '💊',
    title: 'Medication Reminders',
    desc: 'For user AND caregiver visibility',
  },
  {
    emoji: '🆘',
    title: 'SOS Button',
    desc: 'Physical or app-based, always within reach',
  },
  {
    emoji: '👩‍⚕️',
    title: 'Caregiver Mode',
    desc: 'Dedicated view for professional caregivers',
  },
]

/* ─────────────── wellness dashboard card ─────────────── */
function WellnessDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="absolute bottom-[-24px] right-[-16px] z-10"
    >
      <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      className="w-64 rounded-2xl p-5 shadow-xl"
      style={{
        background: 'rgba(26, 15, 5, 0.82)',
        border: '1px solid rgba(212, 168, 83, 0.35)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 8px 48px rgba(212,168,83,0.18), 0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-amber-300 font-semibold text-sm" style={{ fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)' }}>
          Daily Wellness
        </span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          All Normal ✓
        </span>
      </div>

      <ul className="space-y-2.5">
        {[
          { label: 'Mood', value: '😊 Feeling good' },
          { label: 'Steps today', value: '2,847' },
          { label: 'Medications', value: '✓ All taken' },
          { label: 'Last check-in', value: '9:45 AM' },
        ].map(({ label, value }) => (
          <li key={label} className="flex items-center justify-between text-xs">
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
            <span className="font-medium" style={{ color: 'rgba(255,255,255,0.88)' }}>{value}</span>
          </li>
        ))}
      </ul>
    </motion.div>
    </motion.div>
  )
}

/* ─────────────── main section ─────────────── */
export default function ElderlyCareSection() {
  return (
    <section
      id="elderly-care"
      className="relative py-24 px-4 sm:px-6 overflow-hidden"
      style={{ background: '#1A0F05' }}
    >
      {/* Warm amber blob glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '10%',
          left: '-8%',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,168,83,0.18) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '5%',
          right: '5%',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,168,83,0.10) 0%, transparent 65%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* ── LEFT SIDE ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
          >
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: -12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-6 px-4 py-1.5 rounded-full"
              style={{
                color: '#D4A853',
                border: '1px solid rgba(212,168,83,0.4)',
                background: 'rgba(212,168,83,0.08)',
              }}
            >
              <span>🤍</span>
              Elderly Care Suite
            </motion.span>

            {/* Headline */}
            <h2
              className="text-4xl sm:text-5xl font-extrabold leading-tight text-white mb-4"
              style={{ fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)' }}
            >
              Complete Care
              <br />
              for Your{' '}
              <span
                className="gradient-text-gold"
                style={{
                  background: 'linear-gradient(90deg, #D4A853, #F5C842, #D4A853)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Parents
              </span>
            </h2>

            {/* Subtext */}
            <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Built with love for aging parents. Gentle, dignified, and powerful — because the people who raised you deserve the best care.
            </p>

            {/* Feature tiles 2-col grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {CARE_FEATURES.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                  className="glass-warm rounded-xl p-4 flex items-start gap-3"
                  style={{
                    background: 'rgba(212,168,83,0.07)',
                    border: '1px solid rgba(212,168,83,0.18)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}
                >
                  {/* Amber icon circle */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full text-base"
                    style={{
                      width: 36,
                      height: 36,
                      background: 'rgba(212,168,83,0.18)',
                      border: '1px solid rgba(212,168,83,0.3)',
                    }}
                  >
                    {feat.emoji}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white mb-0.5">{feat.title}</p>
                    <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social proof */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="text-sm mb-6"
              style={{ color: 'rgba(212,168,83,0.75)' }}
            >
              ★ Trusted by <strong className="text-amber-300">12,000+ elderly users</strong> in 28 countries
            </motion.p>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-gold inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg, #D4A853, #F5C842)',
                color: '#1A0F05',
                boxShadow: '0 4px 24px rgba(212,168,83,0.35)',
                fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
              }}
            >
              Start Caring for Free
              <span>→</span>
            </motion.button>
          </motion.div>

          {/* ── RIGHT SIDE — photo + floating card ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
            className="relative flex items-center justify-center"
          >
            {/* Photo */}
            <div className="relative w-full max-w-md">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/5' }}>
                <Image
                  src="https://images.unsplash.com/photo-1581579188932-d7cf55e60786?w=800&auto=format&fit=crop&q=80"
                  alt="Elderly couple smiling together"
                  fill
                  unoptimized
                  className="object-cover"
                  style={{ opacity: 0.9 }}
                />
                {/* Warm amber gradient overlay at bottom */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(26,15,5,0.65) 0%, rgba(26,15,5,0.1) 45%, transparent 70%)',
                  }}
                />
              </div>

              {/* Floating wellness dashboard card */}
              <WellnessDashboard />

              {/* Top-left floating stat */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute top-[-16px] left-[-16px] rounded-2xl px-4 py-3 z-10"
                style={{
                  background: 'rgba(26,15,5,0.82)',
                  border: '1px solid rgba(212,168,83,0.3)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
                }}
              >
                <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Protected today</p>
                <p className="text-2xl font-extrabold" style={{
                  fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
                  background: 'linear-gradient(90deg, #D4A853, #F5C842)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  12,000+
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>elderly users worldwide</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
