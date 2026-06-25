'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Shield,
  School,
  Bus,
  Bell,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Star,
  ChevronRight,
  Navigation,
  UserPlus,
  Trash2,
  BarChart2,
  Brain,
  Activity,
  Calendar,
  Home,
  TrendingUp,
  AlertTriangle,
  Eye,
  Radio,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/* ── Animation variants ─────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

/* ── Types ───────────────────────────────────────────────────────────────────── */
interface AuthorizedPerson {
  id: number;
  name: string;
  relation: string;
  phone: string;
  avatar: string;
}

/* ── Static data ─────────────────────────────────────────────────────────────── */
const DETECTION_CARDS = [
  {
    icon: <Activity size={22} />,
    title: 'Unusual Movement',
    desc: 'Detects erratic or unexpected movement patterns outside normal routes.',
    color: '#3B82F6',
    status: 'Active',
  },
  {
    icon: <MapPin size={22} />,
    title: 'Unsafe Location',
    desc: 'Flags when child enters zones not in their approved safe-zone list.',
    color: '#EF4444',
    status: 'Active',
  },
  {
    icon: <Navigation size={22} />,
    title: 'Route Anomaly',
    desc: 'AI compares real-time path against expected school route.',
    color: '#F59E0B',
    status: 'Monitoring',
  },
  {
    icon: <Clock size={22} />,
    title: 'Missing Check-in',
    desc: 'Auto-alerts if expected arrival or check-in is overdue by 10 minutes.',
    color: '#8B5CF6',
    status: 'Active',
  },
  {
    icon: <Eye size={22} />,
    title: 'Stranger Pattern',
    desc: 'Detects extended stays near unknown locations or unusual loitering.',
    color: '#EC4899',
    status: 'Monitoring',
  },
];

const TIMELINE_EVENTS = [
  { time: '7:42 AM', label: 'Left Home', icon: <Home size={14} />, color: '#10B981', done: true },
  { time: '8:05 AM', label: 'Arrived School', icon: <School size={14} />, color: '#3B82F6', done: true },
  { time: '3:30 PM', label: 'Left School', icon: <School size={14} />, color: '#F59E0B', done: true },
  { time: '4:15 PM', label: 'Activity Class', icon: <Star size={14} />, color: '#8B5CF6', done: true },
  { time: '5:50 PM', label: 'Home Safe', icon: <Home size={14} />, color: '#10B981', done: true },
];

const ATTENDANCE_DATA = [28, 45, 60, 52, 78, 90, 82]; // % bar heights
const ATTENDANCE_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const INITIAL_AUTHORIZED: AuthorizedPerson[] = [
  { id: 1, name: 'Priya Sharma', relation: 'Mother', phone: '+91 98765 43210', avatar: 'PS' },
  { id: 2, name: 'Rahul Sharma', relation: 'Father', phone: '+91 98765 43211', avatar: 'RS' },
  { id: 3, name: 'Kamala Devi', relation: 'Grandmother', phone: '+91 98765 43212', avatar: 'KD' },
];

/* ── Section wrapper ─────────────────────────────────────────────────────────── */
function Section({ children, bg = 'var(--bg)', id }: { children: React.ReactNode; bg?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      style={{ background: bg, padding: '80px 0' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>{children}</div>
    </motion.section>
  );
}

/* ── Glassmorphism card ─────────────────────────────────────────────────────── */
function GlassCard({
  children,
  style,
  accentColor = '#3B82F6',
  hover = true,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accentColor?: string;
  hover?: boolean;
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, borderColor: `${accentColor}60` } : {}}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function ChildSafety() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  const [authorized, setAuthorized] = useState<AuthorizedPerson[]>(INITIAL_AUTHORIZED);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [busEta] = useState(12);
  const [schoolArrived] = useState(true);
  const [delayAlert, setDelayAlert] = useState(false);
  const [routeAlert, setRouteAlert] = useState(true);

  function addPerson() {
    if (!newName.trim()) return;
    const initials = newName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    setAuthorized((prev) => [
      ...prev,
      { id: Date.now(), name: newName, relation: newRelation || 'Guardian', phone: newPhone, avatar: initials },
    ]);
    setNewName('');
    setNewRelation('');
    setNewPhone('');
    setShowAddForm(false);
  }

  function removePerson(id: number) {
    setAuthorized((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          background: 'linear-gradient(135deg, #0B0D13 0%, #0d1a2e 50%, #0a1f18 100%)',
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '110px 24px 80px',
        }}
      >
        {/* Background glows */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '20%',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '10%',
            right: '12%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: 32, textAlign: 'left' }}
          >
            <Link
              href="/"
              style={{
                color: 'rgba(255,255,255,0.45)',
                textDecoration: 'none',
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              ← Back to KVL Track Home
            </Link>
          </motion.div>

          {/* Animated school bus icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 90 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}
          >
            <motion.div
              animate={{ x: [-6, 6, -6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 108,
                height: 108,
                borderRadius: 24,
                background: 'rgba(212,168,83,0.14)',
                border: '1px solid rgba(212,168,83,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(212,168,83,0.18)',
              }}
            >
              <Bus size={52} style={{ color: '#D4A853' }} />
            </motion.div>
          </motion.div>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }} style={{ marginBottom: 20 }}>
            <span
              style={{
                background: 'rgba(212,168,83,0.12)',
                border: '1px solid rgba(212,168,83,0.3)',
                color: '#D4A853',
                borderRadius: 999,
                padding: '6px 20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              KVL Track Kids
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.08,
              marginBottom: 24,
            }}
          >
            KVL Track Kids —
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #D4A853, #F0C878, #D4A853)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Complete Child Safety Platform
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: 'clamp(1rem, 2vw, 1.22rem)',
              maxWidth: 660,
              margin: '0 auto 48px',
              lineHeight: 1.78,
            }}
          >
            School arrival. Bus tracking. AI protection. Every moment of your child&apos;s day, intelligently monitored so you can focus on living — not worrying.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}
          >
            <Link
              href="/"
              style={{
                background: 'linear-gradient(135deg, #D4A853, #B8922E)',
                color: '#0B0D13',
                padding: '15px 36px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 32px rgba(212,168,83,0.35)',
              }}
            >
              Protect Your Child — Start Free <ChevronRight size={18} />
            </Link>
            <a
              href="#school-monitoring"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#FFFFFF',
                padding: '15px 36px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              Explore Features
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {[
              { icon: <School size={15} />, label: 'School Monitoring' },
              { icon: <Bus size={15} />, label: 'Bus Tracking' },
              { icon: <Brain size={15} />, label: 'AI Protection' },
              { icon: <Shield size={15} />, label: 'Safety Score 96/100' },
            ].map((b) => (
              <div
                key={b.label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 999,
                  padding: '7px 16px',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                }}
              >
                {b.icon} {b.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SCHOOL MONITORING ─────────────────────────────────────────────────── */}
      <Section bg="#0B0D13" id="school-monitoring">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.25)',
                color: '#60A5FA',
                borderRadius: 999,
                padding: '5px 16px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 18,
              }}
            >
              <School size={13} /> School Monitoring
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.9rem, 4vw, 2.9rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 16,
              }}
            >
              School Monitoring — Zero Anxiety
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 580, margin: '0 auto', lineHeight: 1.75 }}>
              From the moment your child steps into the school gate to the second they are picked up — every transition verified, every moment logged.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}
          >
            {/* Arrival card */}
            <motion.div variants={fadeUp}>
              <GlassCard accentColor="#10B981" style={{ padding: '28px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: 'rgba(16,185,129,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10B981',
                    }}
                  >
                    <CheckCircle size={22} />
                  </div>
                  <motion.div
                    animate={schoolArrived ? { scale: [1, 1.2, 1], opacity: [1, 0.6, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 999,
                      background: 'rgba(16,185,129,0.15)',
                      border: '1px solid rgba(16,185,129,0.4)',
                      color: '#10B981',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    ARRIVED
                  </motion.div>
                </div>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>
                  School Arrival Verified
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  Arjun arrived at Delhi Public School at 8:05 AM today. 3 minutes early.
                </p>
                <div
                  style={{
                    marginTop: 18,
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(16,185,129,0.08)',
                    color: '#10B981',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Clock size={14} /> Today at 8:05 AM — On Time
                </div>
              </GlassCard>
            </motion.div>

            {/* Departure card */}
            <motion.div variants={fadeUp}>
              <GlassCard accentColor="#F59E0B" style={{ padding: '28px 24px' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'rgba(245,158,11,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F59E0B',
                    marginBottom: 20,
                  }}
                >
                  <Bell size={22} />
                </div>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>
                  Departure Verification
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 16 }}>
                  School dismissal at 3:30 PM. Guardian confirmation auto-triggered on exit.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Geofence exit detected', 'Guardian match confirmed', 'Parent notified'].map((item, i) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
                      <CheckCircle size={13} style={{ color: i < 2 ? '#10B981' : '#F59E0B', flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Smart pickup authorization */}
            <motion.div variants={fadeUp}>
              <GlassCard accentColor="#8B5CF6" style={{ padding: '28px 24px' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'rgba(139,92,246,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8B5CF6',
                    marginBottom: 20,
                  }}
                >
                  <Users size={22} />
                </div>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>
                  Smart Pickup Authorization
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 16 }}>
                  Only pre-approved guardians can trigger the pickup confirmation flow.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Mom', 'Dad', 'Nani'].map((label, i) => (
                    <div
                      key={label}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: 8,
                        background: `rgba(139,92,246,${0.1 + i * 0.05})`,
                        border: '1px solid rgba(139,92,246,0.25)',
                        color: '#A78BFA',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textAlign: 'center',
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Attendance tracking graph */}
            <motion.div variants={fadeUp}>
              <GlassCard accentColor="#3B82F6" style={{ padding: '28px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: 'rgba(59,130,246,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#3B82F6',
                    }}
                  >
                    <BarChart2 size={22} />
                  </div>
                  <div>
                    <h3 style={{ color: '#FFFFFF', fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0 }}>
                      Attendance Track
                    </h3>
                    <div style={{ color: '#10B981', fontSize: '0.82rem', fontWeight: 600 }}>24/25 days this month</div>
                  </div>
                </div>
                {/* 7-day bar chart */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 64 }}>
                  {ATTENDANCE_DATA.map((h, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: i * 0.07, ease: 'easeOut' }}
                        style={{
                          width: '100%',
                          borderRadius: '4px 4px 0 0',
                          background: i === 6 ? 'rgba(59,130,246,0.3)' : 'linear-gradient(180deg, #3B82F6, #1D4ED8)',
                          minHeight: 4,
                        }}
                      />
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem' }}>{ATTENDANCE_DAYS[i]}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── SCHOOL BUS TRACKING ───────────────────────────────────────────────── */}
      <Section bg="#0d1117">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.25)',
                color: '#FCD34D',
                borderRadius: 999,
                padding: '5px 16px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 18,
              }}
            >
              <Bus size={13} /> Live Bus Tracking
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.9rem, 4vw, 2.9rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 16,
              }}
            >
              Bus Tracking in Real Time
            </h2>
          </motion.div>

          <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
            {/* Live bus card */}
            <motion.div variants={fadeUp}>
              <GlassCard accentColor="#F59E0B" style={{ padding: '32px 28px' }} hover={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                  <h3 style={{ color: '#FFFFFF', fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0 }}>Route 7 — Live Position</h3>
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: '#10B981',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    <Radio size={12} /> LIVE
                  </motion.div>
                </div>

                {/* Route line with animated bus */}
                <div style={{ position: 'relative', marginBottom: 28 }}>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.08)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <motion.div
                      animate={{ width: ['0%', '68%'] }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        background: 'linear-gradient(90deg, #10B981, #F59E0B)',
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  <motion.div
                    animate={{ left: ['0%', '65%'] }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      top: -16,
                      transform: 'translateX(-50%)',
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: '#F59E0B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 16px rgba(245,158,11,0.5)',
                    }}
                  >
                    <Bus size={16} style={{ color: '#0B0D13' }} />
                  </motion.div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>School</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Your Stop</div>
                  </div>
                </div>

                {/* ETA */}
                <div
                  style={{
                    padding: '18px 22px',
                    borderRadius: 14,
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginBottom: 4 }}>Estimated Arrival</div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '2.2rem',
                      fontWeight: 800,
                      color: '#F59E0B',
                    }}
                  >
                    {busEta} min
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>Bus arrives in {busEta} minutes</div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Alert toggles */}
            <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  label: 'Delay Alert',
                  desc: 'Notify if bus is more than 10 minutes late',
                  active: delayAlert,
                  toggle: () => setDelayAlert((v) => !v),
                  color: '#EF4444',
                },
                {
                  label: 'Route Deviation Alert',
                  desc: 'Notify if bus leaves expected route',
                  active: routeAlert,
                  toggle: () => setRouteAlert((v) => !v),
                  color: '#F59E0B',
                },
              ].map((item) => (
                <GlassCard key={item.label} accentColor={item.color} style={{ padding: '22px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h4 style={{ color: '#FFFFFF', fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>{item.label}</h4>
                    <button
                      onClick={item.toggle}
                      aria-label={`Toggle ${item.label}`}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 999,
                        background: item.active ? item.color : 'rgba(255,255,255,0.12)',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.25s',
                        flexShrink: 0,
                      }}
                    >
                      <motion.div
                        animate={{ x: item.active ? 22 : 2 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        style={{
                          position: 'absolute',
                          top: 2,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: '#FFFFFF',
                        }}
                      />
                    </button>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', margin: 0, lineHeight: 1.55 }}>
                    {item.desc}
                  </p>
                </GlassCard>
              ))}

              <GlassCard accentColor="#10B981" style={{ padding: '22px 20px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: 'rgba(16,185,129,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10B981',
                    }}
                  >
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem' }}>Current Bus Location</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>Sector 14, Dwarka — 2.4 km away</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── CHILD PROTECTION AI ───────────────────────────────────────────────── */}
      <Section bg="#0B0D13">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.25)',
                color: '#A78BFA',
                borderRadius: 999,
                padding: '5px 16px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 18,
              }}
            >
              <Brain size={13} /> AI Protection Engine
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.9rem, 4vw, 2.9rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 16,
              }}
            >
              Child Protection AI
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
              Five AI detection systems running silently in the background, 24/7. Each one trained on child safety patterns specific to Indian urban and semi-urban environments.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}
          >
            {DETECTION_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                style={{
                  background: `rgba(${card.color === '#3B82F6' ? '59,130,246' : card.color === '#EF4444' ? '239,68,68' : card.color === '#F59E0B' ? '245,158,11' : card.color === '#8B5CF6' ? '139,92,246' : '236,72,153'},0.05)`,
                  border: `1px solid ${card.color}25`,
                  borderRadius: 18,
                  padding: '26px 22px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Glow corner */}
                <div
                  style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${card.color}20, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 13,
                    background: `${card.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.color,
                    marginBottom: 16,
                  }}
                >
                  {card.icon}
                </div>
                <h3 style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                  {card.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', lineHeight: 1.55, marginBottom: 16, margin: '0 0 16px' }}>
                  {card.desc}
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: card.status === 'Active' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                    border: `1px solid ${card.status === 'Active' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                    color: card.status === 'Active' ? '#10B981' : '#F59E0B',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}
                  />
                  {card.status}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── PARENT DASHBOARD ──────────────────────────────────────────────────── */}
      <Section bg="#0d1117">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                color: '#34D399',
                borderRadius: 999,
                padding: '5px 16px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 18,
              }}
            >
              <TrendingUp size={13} /> Parent Dashboard
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.9rem, 4vw, 2.9rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 16,
              }}
            >
              Complete Parental Overview
            </h2>
          </motion.div>

          <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 24 }}>
            {/* Safety Score gauge */}
            <motion.div variants={fadeUp}>
              <GlassCard accentColor="#10B981" style={{ padding: '32px 24px', textAlign: 'center' }} hover={false}>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 28 }}>
                  Child Safety Score
                </h3>
                {/* Circular gauge */}
                <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 24px' }}>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    {/* Track */}
                    <circle cx="80" cy="80" r="66" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                    {/* Progress */}
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="66"
                      fill="none"
                      stroke="url(#safeGrad)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 66}`}
                      strokeDashoffset={2 * Math.PI * 66 * (1 - 0.96)}
                      transform="rotate(-90 80 80)"
                      initial={{ strokeDashoffset: 2 * Math.PI * 66 }}
                      whileInView={{ strokeDashoffset: 2 * Math.PI * 66 * (1 - 0.96) }}
                      transition={{ duration: 1.4, ease: 'easeOut' }}
                    />
                    <defs>
                      <linearGradient id="safeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#34D399" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 800, color: '#10B981', lineHeight: 1 }}>
                      96
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>/ 100</div>
                  </div>
                </div>
                <div
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    color: '#34D399',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                  }}
                >
                  Excellent — All Systems Safe
                </div>

                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'School Attendance', value: '24/25 days' },
                    { label: 'Travel History', value: '7 locations today' },
                    { label: 'Active Alerts', value: 'None' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem' }}>{stat.label}</span>
                      <span style={{ color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 700 }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Daily timeline */}
            <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <GlassCard accentColor="#3B82F6" style={{ padding: '28px 24px' }} hover={false}>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 24 }}>
                  Daily Timeline — Today
                </h3>
                <div style={{ position: 'relative' }}>
                  {/* Vertical line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 19,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      background: 'rgba(255,255,255,0.07)',
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {TIMELINE_EVENTS.map((event, i) => (
                      <motion.div
                        key={event.label}
                        initial={{ opacity: 0, x: -16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{ display: 'flex', gap: 16, alignItems: 'center' }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: `${event.color}18`,
                            border: `2px solid ${event.color}50`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: event.color,
                            flexShrink: 0,
                            zIndex: 1,
                          }}
                        >
                          {event.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem' }}>{event.label}</span>
                            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>{event.time}</span>
                          </div>
                        </div>
                        {event.done && (
                          <CheckCircle size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlassCard>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <GlassCard accentColor="#D4A853" style={{ padding: '20px 18px' }}>
                  <Calendar size={20} style={{ color: '#D4A853', marginBottom: 10 }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: '#D4A853' }}>24/25</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', marginTop: 2 }}>School days this month</div>
                </GlassCard>
                <GlassCard accentColor="#3B82F6" style={{ padding: '20px 18px' }}>
                  <MapPin size={20} style={{ color: '#3B82F6', marginBottom: 10 }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: '#3B82F6' }}>7</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', marginTop: 2 }}>Locations visited today</div>
                </GlassCard>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── AUTHORIZED PICKUPS ────────────────────────────────────────────────── */}
      <Section bg="#0B0D13">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(236,72,153,0.1)',
                border: '1px solid rgba(236,72,153,0.25)',
                color: '#F472B6',
                borderRadius: 999,
                padding: '5px 16px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 18,
              }}
            >
              <Users size={13} /> Authorized Pickups
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.9rem, 4vw, 2.9rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: 16,
              }}
            >
              Manage Authorized Pickups
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 540, margin: '0 auto', lineHeight: 1.75 }}>
              Only people on this list can trigger the school pickup confirmation. You control who can collect your child.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} style={{ maxWidth: 700, margin: '0 auto' }}>
            <GlassCard accentColor="#EC4899" style={{ padding: '28px 24px' }} hover={false}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <AnimatePresence>
                  {authorized.map((person) => (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '14px 16px',
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: '50%',
                          background: 'rgba(236,72,153,0.15)',
                          border: '1px solid rgba(236,72,153,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#F472B6',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {person.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.92rem' }}>{person.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
                          {person.relation} · {person.phone}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            padding: '3px 10px',
                            borderRadius: 999,
                            background: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.25)',
                            color: '#10B981',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          Authorized
                        </div>
                        <button
                          onClick={() => removePerson(person.id)}
                          aria-label={`Remove ${person.name}`}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#EF4444',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add form */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden', marginBottom: 16 }}
                  >
                    <div
                      style={{
                        padding: '18px',
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Full Name"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8,
                          padding: '10px 14px',
                          color: '#FFFFFF',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <input
                          value={newRelation}
                          onChange={(e) => setNewRelation(e.target.value)}
                          placeholder="Relation (e.g. Uncle)"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            padding: '10px 14px',
                            color: '#FFFFFF',
                            fontSize: '0.9rem',
                            outline: 'none',
                          }}
                        />
                        <input
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="Phone Number"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            padding: '10px 14px',
                            color: '#FFFFFF',
                            fontSize: '0.9rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          onClick={addPerson}
                          style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: 8,
                            background: 'linear-gradient(135deg, #D4A853, #B8922E)',
                            color: '#0B0D13',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Add Person
                        </button>
                        <button
                          onClick={() => setShowAddForm(false)}
                          style={{
                            padding: '10px 16px',
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.6)',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 12,
                  background: 'rgba(236,72,153,0.08)',
                  border: '1px dashed rgba(236,72,153,0.3)',
                  color: '#F472B6',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <UserPlus size={16} /> Add Authorized Person
              </button>
            </GlassCard>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0B0D13 0%, #0d1a2e 60%, #0a1f18 100%)',
          padding: '100px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(212,168,83,0.15)',
              border: '1px solid rgba(212,168,83,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 28px',
            }}
          >
            <Shield size={36} style={{ color: '#D4A853' }} />
          </motion.div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.9rem, 4vw, 3rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: 16,
            }}
          >
            Protect Your Child —<br />
            <span style={{ color: '#D4A853' }}>Start Free Today</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.78 }}>
            Every school day, KVL Track watches over your child silently so you don&apos;t have to. From first step out of home to safe return — every moment, verified.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                background: 'linear-gradient(135deg, #D4A853, #B8922E)',
                color: '#0B0D13',
                padding: '16px 40px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '1.05rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 36px rgba(212,168,83,0.3)',
              }}
            >
              Protect Your Child — Start Free <ChevronRight size={18} />
            </Link>
            <Link
              href="/pricing"
              style={{
                background: 'transparent',
                color: '#FFFFFF',
                padding: '16px 36px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1.05rem',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              View Pricing
            </Link>
          </div>
          <div style={{ marginTop: 32 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', textDecoration: 'none' }}>
              ← Back to KVL Track Home
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </>
  );
}
