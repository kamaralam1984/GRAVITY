'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/* ── Feature data ─────────────────────────────────────────────────────────── */
const SAFETY_FEATURES = [
  {
    icon: '🆘',
    title: 'Panic SOS',
    subtitle: 'Shake to activate',
    description:
      'Shake your phone 3 times or hold the power button to instantly broadcast your location and an emergency alert to all trusted contacts — no unlocking required.',
    color: '#EF4444',
    rgb: '239,68,68',
  },
  {
    icon: '📍',
    title: 'Live Location Sharing',
    subtitle: 'Real-time & private',
    description:
      'Share your exact GPS location with trusted contacts for 15 minutes, 1 hour, or 2 hours. They see you on a live map. You control who sees it, and when it stops.',
    color: '#3B82F6',
    rgb: '59,130,246',
  },
  {
    icon: '📞',
    title: 'Fake Call Feature',
    subtitle: 'Escape uncomfortable situations',
    description:
      'Schedule a fake incoming call to help you exit unsafe situations gracefully. Customize the caller name and set a delay of 30 seconds, 1 minute, or 2 minutes.',
    color: '#8B5CF6',
    rgb: '139,92,246',
  },
  {
    icon: '🚶‍♀️',
    title: 'Safe Walk Mode',
    subtitle: 'Auto-check-in every 5 minutes',
    description:
      'Start Safe Walk when commuting alone. KVL Track checks in automatically every 5 minutes. If you miss two check-ins, an alert is sent to your trusted contacts with your last known location.',
    color: '#10B981',
    rgb: '16,185,129',
  },
  {
    icon: '👥',
    title: 'Trusted Contacts Alert',
    subtitle: 'Instant notification chain',
    description:
      'Designate up to 5 trusted contacts who receive real-time alerts during any emergency. Contacts are notified simultaneously via SMS and push notification.',
    color: '#F59E0B',
    rgb: '245,158,11',
  },
];

/* ── Statistics ───────────────────────────────────────────────────────────── */
const STATS = [
  { value: '1 in 3', label: 'women feel unsafe commuting', icon: '📊' },
  { value: '2.4M', label: 'women protected by KVL Track', icon: '🛡️' },
  { value: '<3 sec', label: 'average SOS response time', icon: '⚡' },
  { value: '99.8%', label: 'SOS alert delivery rate', icon: '✓' },
];

/* ── Available cities ─────────────────────────────────────────────────────── */
const CITIES = [
  { name: 'Delhi', emoji: '🏛️' },
  { name: 'Mumbai', emoji: '🌊' },
  { name: 'Bengaluru', emoji: '🌿' },
  { name: 'Hyderabad', emoji: '💎' },
  { name: 'Chennai', emoji: '🏖️' },
  { name: 'Pune', emoji: '🎓' },
];

/* ── How it works steps ───────────────────────────────────────────────────── */
const HOW_STEPS = [
  { step: '01', title: 'Download KVL Track', desc: 'Free on Android and iOS. No subscription needed for core women safety features.' },
  { step: '02', title: 'Add Trusted Contacts', desc: 'Add family, friends, or colleagues as your safety circle. They get a one-tap notification.' },
  { step: '03', title: 'Activate Safe Walk', desc: 'Enable Safe Walk before your commute. KVL Track watches over you silently in the background.' },
  { step: '04', title: 'Shake for SOS', desc: 'In an emergency, shake your phone three times. Your location goes out instantly to all contacts.' },
];

/* ── Testimonials ─────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote: 'I use Safe Walk every time I travel home late. Knowing my family can see me live gives me confidence.',
    name: 'Priya S.',
    city: 'Bengaluru',
    avatar: 'P',
    color: '#D4A853',
  },
  {
    quote: 'The fake call feature helped me exit a scary situation at a parking lot. Simple but powerful.',
    name: 'Neha R.',
    city: 'Delhi',
    avatar: 'N',
    color: '#8B5CF6',
  },
  {
    quote: "My daughter uses KVL Track's SOS. As a mother, it gives me peace of mind every single day.",
    name: 'Kavitha M.',
    city: 'Chennai',
    avatar: 'K',
    color: '#10B981',
  },
];

/* ── Components ───────────────────────────────────────────────────────────── */
function StatCard({ value, label, icon, index }: { value: string; label: string; icon: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-2xl p-6 text-center"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div
        className="text-3xl font-extrabold mb-1"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: 'linear-gradient(90deg, #D4A853, #F5C842)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {value}
      </div>
      <p className="text-sm text-[#94A3B8]" style={{ fontFamily: "'Inter', sans-serif" }}>
        {label}
      </p>
    </motion.div>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof SAFETY_FEATURES)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.09 }}
      whileHover={{ y: -6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: hovered ? `1px solid rgba(${feature.rgb},0.4)` : '1px solid rgba(255,255,255,0.07)',
        boxShadow: hovered ? `0 0 32px rgba(${feature.rgb},0.2), 0 16px 40px rgba(0,0,0,0.2)` : '0 2px 12px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ background: `rgba(${feature.rgb},0.15)` }}
      >
        {feature.icon}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3
            className="text-lg font-bold text-[#F8FAFC]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {feature.title}
          </h3>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: `rgba(${feature.rgb},0.15)`,
              color: feature.color,
              border: `1px solid rgba(${feature.rgb},0.3)`,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {feature.subtitle}
          </span>
        </div>
        <p className="text-sm text-[#94A3B8] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Share Location Card ─────────────────────────────────────────────────── */
function ShareLocationCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [selected, setSelected] = useState<'30m' | '1h' | '2h'>('1h');

  const OPTIONS = [
    { id: '30m' as const, label: '30 minutes' },
    { id: '1h' as const, label: '1 hour' },
    { id: '2h' as const, label: '2 hours' },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.55 }}
      className="rounded-2xl p-6 max-w-sm mx-auto"
      style={{
        background: 'linear-gradient(145deg, rgba(212,168,83,0.08) 0%, rgba(13,22,53,0.95) 100%)',
        border: '1px solid rgba(212,168,83,0.25)',
        boxShadow: '0 0 40px rgba(212,168,83,0.12)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#D4A853]/20 flex items-center justify-center text-xl">📍</div>
        <div>
          <p className="text-[#F8FAFC] font-bold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Share my location for</p>
          <p className="text-[#94A3B8] text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>Trusted contacts will see you live</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none"
            style={{
              background: selected === opt.id ? 'linear-gradient(135deg, #D4A853, #F5C842)' : 'rgba(255,255,255,0.05)',
              color: selected === opt.id ? '#1A0F05' : '#94A3B8',
              border: selected === opt.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-xl font-bold text-sm"
        style={{
          background: 'linear-gradient(135deg, #D4A853, #F5C842)',
          color: '#1A0F05',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxShadow: '0 4px 16px rgba(212,168,83,0.4)',
        }}
      >
        Start Sharing Location
      </motion.button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#94A3B8]" style={{ fontFamily: "'Inter', sans-serif" }}>
        <span>🔒</span>
        <span>Location stops automatically after selected time</span>
      </div>
    </motion.div>
  );
}

/* ── Check-in Card ────────────────────────────────────────────────────────── */
function CheckInCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [checked, setChecked] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.55, delay: 0.1 }}
      className="rounded-2xl p-6 max-w-sm mx-auto"
      style={{
        background: 'linear-gradient(145deg, rgba(16,185,129,0.08) 0%, rgba(13,22,53,0.95) 100%)',
        border: '1px solid rgba(16,185,129,0.25)',
        boxShadow: '0 0 40px rgba(16,185,129,0.1)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl">✅</div>
        <div>
          <p className="text-[#F8FAFC] font-bold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>I'm reaching safely</p>
          <p className="text-[#94A3B8] text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>Notify your trusted contacts</p>
        </div>
      </div>

      <p className="text-[#94A3B8] text-xs mb-5 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
        Tap once when you arrive safely. All trusted contacts receive an instant notification:
        <span className="text-emerald-400 font-semibold"> "Priya has reached safely."</span>
      </p>

      <AnimatePresence mode="wait">
        {!checked ? (
          <motion.button
            key="btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setChecked(true)}
            className="w-full py-3 rounded-xl font-bold text-sm"
            style={{
              background: 'linear-gradient(135deg, #10B981, #34D399)',
              color: '#fff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
            }}
          >
            I Have Reached Safely
          </motion.button>
        ) : (
          <motion.div
            key="done"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full py-3 rounded-xl font-bold text-sm text-center"
            style={{
              background: 'rgba(16,185,129,0.15)',
              color: '#10B981',
              border: '1px solid rgba(16,185,129,0.3)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            ✓ Contacts notified!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function WomenSafetyPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-60px' });

  return (
    <main style={{ background: '#050A18', minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative pt-32 pb-20 px-6 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(239,68,68,0.06) 0%, rgba(5,10,24,0) 60%)',
        }}
      >
        {/* Ambient glows */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: '900px',
            height: '500px',
            background: 'radial-gradient(ellipse, rgba(239,68,68,0.12) 0%, rgba(212,168,83,0.05) 45%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute top-20 right-0 pointer-events-none"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
              style={{
                color: '#EF4444',
                border: '1px solid rgba(239,68,68,0.35)',
                background: 'rgba(239,68,68,0.07)',
              }}
            >
              🛡️ Women Safety
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <span className="text-[#F8FAFC]">KVL Track Women Safety</span>
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #EF4444, #D4A853, #F5C842)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Because Every Woman Deserves
            </span>
            <br />
            <span className="text-[#F8FAFC]">to Feel Safe</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-[#94A3B8] max-w-2xl mx-auto mb-4 leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Real-time location sharing, instant SOS, fake call protection, and Safe Walk mode —
            designed specifically for women commuting, travelling, or simply being alone.
          </motion.p>

          {/* Stat callout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full mb-10"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            <span className="text-[#EF4444] font-bold text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
              📊 1 in 3 women feel unsafe commuting
            </span>
            <span className="text-[#94A3B8] text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
              — National Crime Research Bureau, India
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="/#download"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                color: '#fff',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: '0 6px 24px rgba(239,68,68,0.4)',
              }}
            >
              🛡️ Download Free — Protect Yourself Now
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-white/[0.06]"
              style={{
                color: '#94A3B8',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              See all features →
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-5 text-sm text-[#94A3B8]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Available on Android &amp; iOS · Free · No credit card required
          </motion.p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} className="py-16 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-16 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
            style={{
              color: '#D4A853',
              border: '1px solid rgba(212,168,83,0.35)',
              background: 'rgba(212,168,83,0.07)',
            }}
          >
            Safety Features
          </span>
          <h2
            className="text-3xl md:text-4xl font-extrabold text-[#F8FAFC]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Built for Women's Safety
          </h2>
          <p className="text-[#94A3B8] mt-3 max-w-xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
            Every feature is designed with real-world safety scenarios in mind — from late-night commutes to unexpected emergencies.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAFETY_FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </section>

      {/* ── INTERACTIVE CARDS (share location + check-in) ── */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl font-extrabold text-[#F8FAFC]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Two Taps to Peace of Mind
          </h2>
          <p className="text-[#94A3B8] mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
            Simple interactions that keep your loved ones informed without constant check-ins.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <ShareLocationCard />
          <CheckInCard />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl font-extrabold text-[#F8FAFC]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Get Protected in 4 Steps
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div
                className="text-3xl font-extrabold mb-3"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: 'linear-gradient(90deg, #D4A853, #F5C842)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {step.step}
              </div>
              <h3 className="text-[#F8FAFC] font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {step.title}
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── AVAILABLE IN ── */}
      <section className="py-12 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55 }}
          className="text-center mb-8"
        >
          <h2
            className="text-2xl font-bold text-[#F8FAFC]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Available in Major Indian Cities
          </h2>
          <p className="text-[#94A3B8] mt-2 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            Optimized for local maps, transit routes, and emergency services.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3">
          {CITIES.map((city, i) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span className="text-lg">{city.emoji}</span>
              <span className="text-[#F8FAFC] font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {city.name}
              </span>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs text-[#94A3B8] mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
          + 50 more cities across India, Kenya, UAE, and globally
        </p>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="text-center mb-10"
        >
          <h2
            className="text-2xl md:text-3xl font-bold text-[#F8FAFC]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Real Women. Real Stories.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-5 italic" style={{ fontFamily: "'Inter', sans-serif" }}>
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: `rgba(${t.color === '#D4A853' ? '212,168,83' : t.color === '#8B5CF6' ? '139,92,246' : '16,185,129'},0.2)`, color: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-[#F8FAFC] font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.name}</p>
                  <p className="text-[#94A3B8] text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>{t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65 }}
          className="max-w-3xl mx-auto rounded-3xl p-10 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(13,22,53,0.95) 50%, rgba(212,168,83,0.08) 100%)',
            border: '1px solid rgba(239,68,68,0.25)',
            boxShadow: '0 0 80px rgba(239,68,68,0.1)',
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              width: '600px',
              height: '300px',
              background: 'radial-gradient(ellipse, rgba(239,68,68,0.1) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div className="relative z-10">
            <div className="text-5xl mb-4">🛡️</div>
            <h2
              className="text-3xl md:text-4xl font-extrabold text-[#F8FAFC] mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Download Free
            </h2>
            <p className="text-[#94A3B8] mb-8 text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
              Available on Android &amp; iOS. Safety features are free forever — no subscription, no credit card.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.a
                href="/#download"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base"
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  color: '#fff',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: '0 6px 28px rgba(239,68,68,0.45)',
                }}
              >
                <span>📱</span> Download for Android
              </motion.a>
              <motion.a
                href="/#download"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#F8FAFC',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                <span>🍎</span> Download for iOS
              </motion.a>
            </div>
            <p className="mt-6 text-xs text-[#94A3B8]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Join 2.4 million women who already use KVL Track for their daily safety
            </p>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
