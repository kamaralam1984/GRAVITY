'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  MapPin,
  Users,
  Clock,
  Battery,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Route,
  History,
  Navigation,
  Heart,
  Star,
  ChevronRight,
  Zap,
  Lock,
  Globe,
  CheckCircle,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

function Section({ children, bg = 'var(--bg)', id }: { children: React.ReactNode; bg?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      style={{ background: bg, padding: '96px 0' }}
    >
      {children}
    </motion.section>
  );
}

const FAMILY_FEATURES = [
  {
    icon: <MapPin size={24} />,
    title: 'Live Location Sharing',
    description: 'See every family member on a single live map with real-time GPS updates. Location refreshes automatically — no manual refreshing needed. Works even in low-signal areas.',
    color: '#4B80F0',
  },
  {
    icon: <Navigation size={24} />,
    title: 'Activity Status Detection',
    description: 'KVL Track automatically detects whether each member is Driving, Walking, Running, or Stationary — without requiring anyone to manually check in. Intelligence happens in the background.',
    color: '#10B981',
  },
  {
    icon: <Bell size={24} />,
    title: 'Safe Arrival Notifications',
    description: 'The moment a family member reaches home, work, school, or any saved place — you receive a quiet notification. Know everyone is safe without a single phone call.',
    color: '#8B5CF6',
  },
  {
    icon: <Route size={24} />,
    title: 'Journey Sharing',
    description: 'Share your route with family before a long drive, solo night out, or solo trip. They follow along in real time and get notified the moment you arrive safely.',
    color: '#F59E0B',
  },
  {
    icon: <History size={24} />,
    title: 'Route Playback',
    description: "Replay exactly where any family member has been — down to the street level. Understand routines, verify school arrivals, or review a concerning journey retroactively.",
    color: '#EC4899',
  },
  {
    icon: <Clock size={24} />,
    title: 'Smart ETA Predictions',
    description: 'AI predicts when each family member will arrive based on current route, traffic, and historical patterns. Know before they know when they\'ll be home.',
    color: '#06B6D4',
  },
  {
    icon: <Battery size={24} />,
    title: 'Battery Monitoring',
    description: "See every family member's battery level in real time. Low battery alerts warn you before someone goes dark — before the worry begins.",
    color: '#F97316',
  },
  {
    icon: <Users size={24} />,
    title: 'Multiple Family Circles',
    description: 'Create separate circles for your nuclear family, extended family, or trusted friend groups. Each circle has its own privacy settings and member permissions.',
    color: '#6366F1',
  },
];

const PRIVACY_FEATURES = [
  {
    icon: <EyeOff size={22} />,
    title: 'Privacy Hours',
    description: 'Define hours when your location is automatically paused — nights, personal time, date nights. Privacy built into the schedule, not an afterthought.',
    color: '#8B5CF6',
  },
  {
    icon: <Shield size={22} />,
    title: 'Ghost Mode',
    description: 'Go completely invisible to your circle temporarily. One tap, complete privacy. You see the family; they cannot see you until you choose to share again.',
    color: '#EC4899',
  },
  {
    icon: <Clock size={22} />,
    title: 'Temporary Sharing',
    description: 'Share location for exactly 1 hour, 4 hours, or 24 hours with anyone — even people not in KVL Track. Link expires automatically.',
    color: '#10B981',
  },
  {
    icon: <Lock size={22} />,
    title: 'End-to-End Encryption',
    description: 'Your location data is encrypted in transit and at rest. Only your family circle can see your location — not us, not partners, not data brokers.',
    color: '#4B80F0',
  },
];

const HISTORY_OPTIONS = [
  { days: '7 Days', desc: 'Past week of movement', color: '#4B80F0' },
  { days: '30 Days', desc: 'Monthly pattern review', color: '#10B981' },
  { days: '90 Days', desc: 'Quarterly journey archive', color: '#8B5CF6' },
  { days: '365 Days', desc: 'Full year timeline', color: '#D4A853' },
];

const TESTIMONIALS = [
  {
    name: 'Sunita Nair',
    role: 'Mother of two, Bangalore',
    quote: 'I used to call my kids every 30 minutes while they were traveling. Now I watch their location on the map and only call if something actually seems wrong. My anxiety dropped by half.',
    rating: 5,
    avatar: 'SN',
    color: '#4B80F0',
  },
  {
    name: 'Rajesh Kumar',
    role: 'Father, Chennai',
    quote: 'The ETA prediction is genuinely magical. My wife used to worry when I was stuck in traffic. Now KVL Track tells her I\'m 20 minutes away before I even text.',
    rating: 5,
    avatar: 'RK',
    color: '#10B981',
  },
  {
    name: 'Ananya Singh',
    role: 'Working professional, Mumbai',
    quote: 'Privacy Hours was the feature that made me stop worrying about "tracking". I turn it on every evening — it respects my personal time automatically.',
    rating: 5,
    avatar: 'AS',
    color: '#D4A853',
  },
];

export default function FamilyTrackingPage() {
  const heroRef = useRef(null);

  const MOCK_MEMBERS = [
    { name: 'Mum', status: 'Home', battery: 82, color: '#10B981', x: '30%', y: '40%' },
    { name: 'Dad', status: 'Driving', battery: 54, color: '#4B80F0', x: '60%', y: '30%' },
    { name: 'Arjun', status: 'School', battery: 91, color: '#D4A853', x: '50%', y: '60%' },
    { name: 'Priya', status: 'Walking', battery: 23, color: '#EC4899', x: '75%', y: '55%' },
  ];

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, background: 'var(--bg)', minHeight: '100vh' }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section style={{ position: 'relative', overflow: 'hidden', padding: '96px 0 80px' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{
              position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
              width: 800, height: 800, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(75,128,240,0.12) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }} />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(75,128,240,0.12)', border: '1px solid rgba(75,128,240,0.25)',
                  borderRadius: 999, padding: '6px 14px', marginBottom: 20,
                }}>
                  <MapPin size={14} color="#4B80F0" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#4B80F0', fontFamily: "'Inter', sans-serif" }}>
                    Family Safety Hub
                  </span>
                </div>
                <h1 style={{
                  fontSize: 52, fontWeight: 800, lineHeight: 1.12, marginBottom: 24,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)',
                }}>
                  Keep Your Family{' '}
                  <span style={{
                    background: 'linear-gradient(135deg, #4B80F0 0%, #7C3AED 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    Connected & Safe
                  </span>
                </h1>
                <p style={{
                  fontSize: 18, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 36,
                  fontFamily: "'Inter', sans-serif", maxWidth: 520,
                }}>
                  Real-time location sharing, smart arrival alerts, journey tracking, and AI-powered ETAs — all in one place. Know everyone is safe without the anxiety.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <motion.a
                    href="#download"
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    className="btn-gold"
                    style={{ padding: '14px 28px', borderRadius: 999, fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}
                  >
                    Start for Free
                    <ChevronRight size={16} />
                  </motion.a>
                  <motion.a
                    href="#features"
                    whileHover={{ scale: 1.02 }}
                    style={{
                      padding: '14px 28px', borderRadius: 999, fontSize: 15, fontWeight: 600,
                      border: '1px solid var(--border)', color: 'var(--text-primary)',
                      display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                      background: 'var(--bg-surface)', fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    See How It Works
                  </motion.a>
                </div>
                <div style={{ display: 'flex', gap: 28, marginTop: 32, flexWrap: 'wrap' }}>
                  {[{ val: '2M+', label: 'Families Protected' }, { val: '99.9%', label: 'Uptime' }, { val: '4.9★', label: 'App Rating' }].map(s => (
                    <div key={s.label}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.val}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Map UI Mock */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                style={{
                  position: 'relative', borderRadius: 24, overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'linear-gradient(135deg, #0d1b2a 0%, #1a2744 100%)',
                  aspectRatio: '1 / 0.9',
                  boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                }}
              >
                {/* Grid pattern */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'linear-gradient(rgba(75,128,240,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(75,128,240,0.05) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }} />
                {/* Pulsing center dot */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                  width: 12, height: 12, borderRadius: '50%', background: '#4B80F0',
                  boxShadow: '0 0 0 20px rgba(75,128,240,0.15)',
                }} />
                {/* Member pins */}
                {MOCK_MEMBERS.map((m, i) => (
                  <motion.div
                    key={m.name}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 300 }}
                    style={{
                      position: 'absolute', left: m.x, top: m.y,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div style={{
                      background: m.color, borderRadius: 999, padding: '6px 12px',
                      display: 'flex', alignItems: 'center', gap: 6,
                      boxShadow: `0 4px 20px ${m.color}55`,
                      border: '2px solid rgba(255,255,255,0.15)',
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white', opacity: 0.9 }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'white', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>
                        {m.name}
                      </span>
                    </div>
                    <div style={{
                      marginTop: 4, background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '2px 8px',
                      display: 'flex', justifyContent: 'space-between', gap: 8,
                    }}>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontFamily: "'Inter', sans-serif" }}>{m.status}</span>
                      <span style={{ fontSize: 9, color: m.battery < 30 ? '#EF4444' : '#10B981', fontFamily: "'Inter', sans-serif" }}>{m.battery}%</span>
                    </div>
                  </motion.div>
                ))}
                {/* Top bar */}
                <div style={{
                  position: 'absolute', top: 16, left: 16, right: 16,
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
                  borderRadius: 12, padding: '10px 14px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Family Map</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: 11, color: '#10B981', fontFamily: "'Inter', sans-serif" }}>Live</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Core Features Grid ───────────────────────────────────────────── */}
        <Section id="features" bg="var(--bg-surface)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 16 }}>
                Everything Your Family Needs
              </h2>
              <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
                Eight core safety features working together, invisibly, in the background.
              </p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {FAMILY_FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 20, padding: '28px 24px',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                  }}
                  whileHover={{ y: -4, boxShadow: `0 20px 60px rgba(0,0,0,0.2)` }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16, color: f.color,
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif", margin: 0 }}>
                    {f.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Location History ─────────────────────────────────────────────── */}
        <Section bg="var(--bg)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
              <motion.div variants={fadeUp}>
                <h2 style={{ fontSize: 38, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 20, lineHeight: 1.2 }}>
                  Location History<br />Up to{' '}
                  <span style={{ color: '#D4A853' }}>365 Days</span>
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 32, fontFamily: "'Inter', sans-serif" }}>
                  KVL Track stores a full year of location history for every family member. Review daily routines, verify arrivals, understand travel patterns, and replay any journey in detail.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {HISTORY_OPTIONS.map(opt => (
                    <div key={opt.days} style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      background: 'var(--bg-surface)', borderRadius: 14, padding: '14px 20px',
                      border: '1px solid var(--border)',
                    }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{opt.days}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{opt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div variants={fadeUp}>
                {/* Timeline visual mock */}
                <div style={{
                  background: 'var(--bg-surface)', borderRadius: 24,
                  border: '1px solid var(--border)', padding: 28,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>TODAY'S TIMELINE — ARJUN</div>
                  {[
                    { time: '07:32', place: 'Left Home', icon: '🏠', color: '#4B80F0' },
                    { time: '08:14', place: 'Arrived at School', icon: '🏫', color: '#10B981' },
                    { time: '14:05', place: 'Left School', icon: '🚶', color: '#F59E0B' },
                    { time: '14:41', place: 'Stopped at Café', icon: '☕', color: '#8B5CF6' },
                    { time: '15:22', place: 'Arrived Home', icon: '🏠', color: '#10B981' },
                  ].map((t, i, arr) => (
                    <div key={t.time} style={{ display: 'flex', gap: 16, marginBottom: i < arr.length - 1 ? 20 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${t.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{t.icon}</div>
                        {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 20, marginTop: 4 }} />}
                      </div>
                      <div style={{ paddingTop: 6 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.place}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{t.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </Section>

        {/* ── Privacy Features ─────────────────────────────────────────────── */}
        <Section bg="var(--bg-surface)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontSize: 38, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 16 }}>
                Safety Without Surveillance
              </h2>
              <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto', fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
                Location sharing should feel safe, not monitored. Every privacy control you need, built in from day one.
              </p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {PRIVACY_FEATURES.map(f => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  style={{
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 20, padding: '28px 24px',
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14, color: f.color,
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{f.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif", margin: 0 }}>{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Testimonials ─────────────────────────────────────────────────── */}
        <Section bg="var(--bg)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontSize: 38, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 16 }}>
                Families Who Feel the Difference
              </h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {TESTIMONIALS.map(t => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 20, padding: '28px 24px',
                  }}
                >
                  <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="#D4A853" stroke="none" />
                    ))}
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 20, fontFamily: "'Inter', sans-serif", fontStyle: 'italic' }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.avatar}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <Section bg="var(--bg-surface)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ textAlign: 'center' }}>
            <motion.div variants={fadeUp}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: 24, marginBottom: 24, background: 'rgba(75,128,240,0.12)', border: '1px solid rgba(75,128,240,0.2)' }}>
                <Heart size={32} color="#4B80F0" />
              </div>
              <h2 style={{ fontSize: 42, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 20 }}>
                Your Family Deserves to Feel Safe
              </h2>
              <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 36px', fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
                Free to start. No credit card required. Ready in under 5 minutes.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.a
                  href="#download"
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn-gold"
                  style={{ padding: '16px 32px', borderRadius: 999, fontSize: 16, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}
                >
                  Download KVL Track Free
                  <ChevronRight size={18} />
                </motion.a>
                <Link href="/pricing" style={{
                  padding: '16px 32px', borderRadius: 999, fontSize: 16, fontWeight: 600,
                  border: '1px solid var(--border)', color: 'var(--text-primary)',
                  display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                  background: 'var(--bg)', fontFamily: "'Inter', sans-serif",
                }}>
                  View Pricing
                </Link>
              </div>
            </motion.div>
          </div>
        </Section>

      </main>
      <Footer />
    </>
  );
}
