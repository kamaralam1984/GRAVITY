'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

/* ─────────────── Apple icon ─────────────── */
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 flex-shrink-0">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.42.07 2.41.77 3.24.82 1.24-.21 2.43-.96 3.76-.84 1.6.16 2.8.82 3.57 2.07-3.27 1.96-2.49 6.33.63 7.53-.74 1.88-1.68 3.73-3.2 5.3ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z" />
    </svg>
  )
}

/* ─────────────── Google Play icon ─────────────── */
function PlayStoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 flex-shrink-0">
      <path d="M3.18 23.26c.37.2.79.2 1.16.01l12.41-7.17-2.56-2.56L3.18 23.26Zm-1.18-1.4V2.14c0-.55.47-.97 1.01-.87L14.99 10 3.01 18.73c-.54.1-1.01-.32-1.01-.87ZM20.23 10.79l-2.48-1.43-2.82 2.82 2.82 2.82 2.5-1.44c.71-.41.71-1.36-.02-1.77ZM4.35 1.73 14.99 10l-2.56 2.56L1.01 2.6c.37-.56 1.05-.73 1.72-.44l1.62.93-.03-.36Z" />
    </svg>
  )
}

/* ─────────────── Store button ─────────────── */
function StoreButton({
  icon,
  line1,
  line2,
  delay,
}: {
  icon: React.ReactNode
  line1: string
  line2: string
  delay: number
}) {
  return (
    <motion.a
      href="#download"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      className="inline-flex items-center gap-3.5 px-6 py-3.5 rounded-xl transition-all duration-200 focus:outline-none"
      style={{
        background: 'rgba(0,0,0,0.52)',
        border: '1px solid rgba(255,255,255,0.22)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.background = 'rgba(0,0,0,0.70)'
        el.style.borderColor = 'rgba(212,168,83,0.55)'
        el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35), 0 0 20px rgba(212,168,83,0.15)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.background = 'rgba(0,0,0,0.52)'
        el.style.borderColor = 'rgba(255,255,255,0.22)'
        el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)'
      }}
    >
      <div className="text-white">{icon}</div>
      <div className="text-left">
        <p className="text-white/55 text-[10px] leading-tight">{line1}</p>
        <p
          className="text-white font-bold text-base leading-tight"
          style={{ fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)' }}
        >
          {line2}
        </p>
      </div>
    </motion.a>
  )
}

/* ─────────────── Floating phone mockup ─────────────── */
function PhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.0, ease: 'easeOut', delay: 0.4 }}
      className="absolute left-8 xl:left-24 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none"
      style={{ zIndex: 2 }}
    >
      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Warm amber glow behind phone */}
        <div
          className="absolute inset-0 rounded-[2.5rem] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212,168,83,0.22) 0%, transparent 70%)',
            transform: 'scale(1.35)',
            zIndex: -1,
          }}
        />

        <div
          className="relative w-[180px] h-[360px] rounded-[2.2rem] overflow-hidden"
          style={{
            background: '#1A0F05',
            border: '1.5px solid rgba(212,168,83,0.25)',
            boxShadow: '0 0 50px rgba(212,168,83,0.15), 0 30px 70px rgba(0,0,0,0.5)',
          }}
        >
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-black/60 z-20" />

          {/* Status bar */}
          <div className="flex items-center justify-between px-4 pt-4 pb-1">
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>9:41</span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, #D4A853, #F5C842)' }} />
            <div className="flex items-center gap-0.5">
              <div className="w-4 h-[4px] rounded-sm" style={{ border: '1px solid rgba(255,255,255,0.25)' }}>
                <div className="h-full w-3/4 rounded-[1px]" style={{ background: '#10B981' }} />
              </div>
            </div>
          </div>

          {/* Map area */}
          <div className="mx-2 rounded-xl overflow-hidden relative" style={{ height: 180, background: '#2A1805' }}>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(212,168,83,0.08) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(212,168,83,0.08) 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px',
              }}
            />
            {/* Family member dots */}
            {[
              { top: '20%', left: '22%', label: 'M', color: '#D4A853' },
              { top: '38%', right: '20%', label: 'S', color: '#10B981' },
              { top: '65%', left: '15%', label: 'D', color: '#F5C842' },
            ].map(({ top, left, right, label, color }) => (
              <div
                key={label}
                className="absolute w-7 h-7 rounded-full flex items-center justify-center z-10"
                style={{
                  top,
                  left,
                  right,
                  background: color,
                  border: '2px solid rgba(255,255,255,0.8)',
                  boxShadow: `0 0 10px ${color}60`,
                }}
              >
                <span className="text-[8px] font-bold text-white">{label}</span>
              </div>
            ))}
          </div>

          {/* Bottom info */}
          <div className="px-3 pt-2.5 pb-2">
            <p className="text-[8px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(212,168,83,0.6)' }}>
              My Circle · All safe
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[8px] text-emerald-400 font-medium">3 members protected</span>
            </div>
          </div>

          {/* SOS button */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: '#EF4444',
                border: '1.5px solid rgba(255,255,255,0.2)',
                boxShadow: '0 0 18px rgba(239,68,68,0.5)',
              }}
            >
              <span
                className="text-white font-extrabold text-[8px] tracking-widest"
                style={{ fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)' }}
              >
                SOS
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────── Floating family badge ─────────────── */
function FamilyBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 }}
      className="absolute right-8 xl:right-24 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none"
      style={{ zIndex: 2 }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="rounded-2xl px-5 py-4"
        style={{
          background: 'rgba(26,15,5,0.82)',
          border: '1px solid rgba(212,168,83,0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(212,168,83,0.12)',
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-xs font-semibold" style={{ color: '#10B981' }}>Just now</span>
        </div>
        <p className="text-sm font-bold text-white mb-0.5">
          Priya is safe ✓
        </p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Arrived home · 6:32 PM
        </p>
        <div className="mt-3 flex items-center gap-2">
          {['👩', '👨', '👧'].map((e, i) => (
            <span key={i} className="text-base">{e}</span>
          ))}
          <span className="text-xs ml-1" style={{ color: 'rgba(212,168,83,0.7)' }}>Circle notified</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────── Top wave SVG ─────────────── */
function TopWave() {
  return (
    <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none">
      <svg
        viewBox="0 0 1440 60"
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full"
        preserveAspectRatio="none"
        style={{ height: 60 }}
      >
        <path
          d="M0,0 C480,60 960,0 1440,60 L1440,0 L0,0 Z"
          className="fill-[var(--bg)]"
          style={{ fill: 'var(--bg)' }}
        />
      </svg>
    </div>
  )
}

/* ─────────────── DownloadCTA ─────────────── */
export default function DownloadCTA() {
  return (
    <section
      id="download"
      className="relative overflow-hidden"
      style={{ minHeight: 500 }}
    >
      {/* Real family photo at 15% opacity */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1920&auto=format&fit=crop&q=80"
          alt=""
          fill
          unoptimized
          className="object-cover"
          style={{ opacity: 0.15 }}
          priority={false}
        />
      </div>

      {/* Warm gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(11,13,19,0.93) 0%, rgba(26,15,5,0.89) 50%, rgba(11,13,19,0.93) 100%)',
        }}
      />

      {/* Top wave — blends with previous section */}
      <TopWave />

      {/* Central warm amber blob glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,168,83,0.18) 0%, transparent 65%)',
          filter: 'blur(70px)',
          opacity: 0.9,
        }}
      />

      {/* Floating phone mockup — left */}
      <PhoneMockup />

      {/* Family safe badge — right */}
      <FamilyBadge />

      {/* Main content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-32 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <span
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-8"
            style={{
              color: '#D4A853',
              background: 'rgba(212,168,83,0.12)',
              border: '1px solid rgba(212,168,83,0.35)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <span>✨</span>
            Available Now
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-white leading-[1.04] tracking-tight"
          style={{ fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)' }}
        >
          Keep Your Family
          <br />
          Safe.{' '}
          <span
            className="shimmer-gold-text"
            style={{
              background: 'linear-gradient(90deg, #D4A853 0%, #F5C842 40%, #D4A853 70%, #F5C842 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer-gold 3s linear infinite',
            }}
          >
            Always.
          </span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 text-lg max-w-lg mx-auto leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Join 50,000+ families already protected by KVL Track.
        </motion.p>

        {/* Store buttons */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <StoreButton icon={<AppleIcon />} line1="Download on the" line2="App Store" delay={0.35} />
          <StoreButton icon={<PlayStoreIcon />} line1="Get it on" line2="Google Play" delay={0.45} />
        </div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-7 text-sm"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          ★★★★★ 4.9 rating · 50K+ downloads · Free to start
        </motion.p>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-wrap justify-center gap-6 mt-8 text-sm"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          {[
            { text: 'No credit card required' },
            { text: 'End-to-end encrypted' },
            { text: 'Works on iOS & Android' },
            { text: 'Cancel anytime' },
          ].map(({ text }) => (
            <span key={text} className="flex items-center gap-1.5">
              <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span>
              {text}
            </span>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
