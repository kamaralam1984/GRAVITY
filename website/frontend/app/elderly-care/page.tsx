'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Pill,
  Activity,
  CheckCircle,
  Bell,
  Shield,
  Users,
  ArrowLeft,
  Clock,
  AlertTriangle,
  ChevronRight,
  Phone,
  Footprints,
  Moon,
  Droplets,
  Watch,
  Wifi,
  AlertCircle,
  TrendingUp,
  Calendar,
  User,
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
interface Medication {
  id: number;
  name: string;
  time: string;
  label: string;
  taken: boolean;
  upcoming: boolean;
}

/* ── Static data ─────────────────────────────────────────────────────────────── */
const CAREGIVERS = [
  { name: 'Priya Sharma', relation: 'Daughter', status: 'Online', avatar: 'PS', color: '#10B981' },
  { name: 'Rahul Sharma', relation: 'Son-in-law', status: 'Online', avatar: 'RS', color: '#3B82F6' },
  { name: 'Dr. Arvind Nair', relation: 'Primary Doctor', status: 'On-call', avatar: 'AN', color: '#8B5CF6' },
  { name: 'Sunita Devi', relation: 'Home Nurse', status: 'Active', avatar: 'SD', color: '#F59E0B' },
];

const ACTIVITY_TIMELINE = [
  { time: '6:45 AM', event: 'Woke up', detail: 'Movement detected', icon: <Moon size={14} />, color: '#8B5CF6' },
  { time: '7:30 AM', event: 'Morning walk', detail: '1,200 steps completed', icon: <Footprints size={14} />, color: '#10B981' },
  { time: '8:00 AM', event: 'Medication taken', detail: 'Metformin 500mg', icon: <Pill size={14} />, color: '#D4A853' },
  { time: '10:15 AM', event: 'Wellness check', detail: 'Responded: Feeling good', icon: <CheckCircle size={14} />, color: '#3B82F6' },
  { time: '1:45 PM', event: 'Afternoon rest', detail: 'Stationary 45 min', icon: <Moon size={14} />, color: '#6B7280' },
  { time: '2:00 PM', event: 'Medication taken', detail: 'Aspirin 75mg', icon: <Pill size={14} />, color: '#D4A853' },
];

const WEARABLES = [
  { name: 'Apple Watch', icon: '⌚', desc: 'Series 9 · Health sensors', connected: false },
  { name: 'Fitbit', icon: '📟', desc: 'Charge 6 · Sleep tracking', connected: true },
  { name: 'Garmin', icon: '🏃', desc: 'Venu 3 · GPS + HR', connected: false },
  { name: 'Samsung Watch', icon: '⌚', desc: 'Galaxy Watch 6 · BIA sensor', connected: false },
];

const ESCALATION_STEPS = [
  { step: 1, label: 'Fall Detected', desc: 'Wearable + AI motion analysis', color: '#EF4444', icon: <AlertTriangle size={16} /> },
  { step: 2, label: 'Auto Alert', desc: 'Immediate push to all caregivers', color: '#F59E0B', icon: <Bell size={16} /> },
  { step: 3, label: '45-sec Response', desc: 'Caregiver acknowledges or escalates', color: '#8B5CF6', icon: <Phone size={16} /> },
  { step: 4, label: 'Emergency Services', desc: 'Auto-call 112 if no response', color: '#3B82F6', icon: <Shield size={16} /> },
  { step: 5, label: 'Live Location', desc: 'Shared with emergency responder', color: '#10B981', icon: <Activity size={16} /> },
];

/* ── Glassmorphism card ─────────────────────────────────────────────────────── */
function GlassCard({
  children,
  style,
  accentColor = '#D4A853',
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
        transition: 'border-color 0.25s',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── Section wrapper ─────────────────────────────────────────────────────────── */
function Section({ children, bg = '#0B0D13', id }: { children: React.ReactNode; bg?: string; id?: string }) {
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

/* ── Animated heart rate SVG line ────────────────────────────────────────────── */
function HeartRateLine() {
  return (
    <svg width="100%" height="48" viewBox="0 0 200 48" preserveAspectRatio="none">
      <motion.path
        d="M0,24 L30,24 L38,8 L46,40 L54,4 L62,44 L70,24 L100,24 L108,8 L116,40 L124,4 L132,44 L140,24 L200,24"
        fill="none"
        stroke="#EF4444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.5 }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function ElderlyCare() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  const [sensitivity, setSensitivity] = useState<'Low' | 'Medium' | 'High'>('High');
  const [medications, setMedications] = useState<Medication[]>([
    { id: 1, name: 'Metformin 500mg', time: '8:00 AM', label: 'Morning', taken: true, upcoming: false },
    { id: 2, name: 'Aspirin 75mg', time: '2:00 PM', label: 'Afternoon', taken: true, upcoming: false },
    { id: 3, name: 'Amlodipine 5mg', time: '8:00 PM', label: 'Evening', taken: false, upcoming: true },
  ]);

  function markMedTaken(id: number) {
    setMedications((prev) => prev.map((m) => (m.id === id ? { ...m, taken: true, upcoming: false } : m)));
  }

  const adherencePct = Math.round((medications.filter((m) => m.taken).length / medications.length) * 100);

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          background: 'linear-gradient(135deg, #0B0D13 0%, #150d0a 50%, #0d0a14 100%)',
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
            left: '15%',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '10%',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)',
            filter: 'blur(48px)',
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
              <ArrowLeft size={15} /> Return to Gravity Home
            </Link>
          </motion.div>

          {/* Animated heart rate icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 90 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}
          >
            <div style={{ position: 'relative' }}>
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: 108,
                  height: 108,
                  borderRadius: 24,
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 40px rgba(239,68,68,0.15)',
                }}
              >
                <Heart size={52} style={{ color: '#EF4444', fill: 'rgba(239,68,68,0.3)' }} />
              </motion.div>
              {/* Pulse rings */}
              {[1, 2].map((ring) => (
                <motion.div
                  key={ring}
                  animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: ring * 0.6 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 24,
                    border: '1px solid rgba(239,68,68,0.3)',
                    pointerEvents: 'none',
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }} style={{ marginBottom: 20 }}>
            <span
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#FCA5A5',
                borderRadius: 999,
                padding: '6px 20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Gravity Elder
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
            Gravity Elder —
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #EF4444, #F87171, #EF4444)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI-Powered Elder Care
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            style={{
              color: 'rgba(255,255,255,0.62)',
              fontSize: 'clamp(1rem, 2vw, 1.22rem)',
              maxWidth: 660,
              margin: '0 auto 48px',
              lineHeight: 1.78,
            }}
          >
            Fall detection, health monitoring, medication management, and real-time caregiver alerts. Your parent lives independently — you stay completely informed.
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
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                color: '#FFFFFF',
                padding: '15px 36px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 32px rgba(239,68,68,0.3)',
              }}
            >
              Start Elder Care — ₹399/month <ChevronRight size={18} />
            </Link>
            <a
              href="#fall-detection"
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
              { icon: <AlertTriangle size={15} />, label: 'Fall Detection' },
              { icon: <Heart size={15} />, label: 'Health Monitoring' },
              { icon: <Pill size={15} />, label: 'Medication AI' },
              { icon: <Clock size={15} />, label: '45-sec Response' },
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

      {/* ── FALL DETECTION ────────────────────────────────────────────────────── */}
      <Section bg="#0B0D13" id="fall-detection">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#FCA5A5',
                borderRadius: 999,
                padding: '5px 16px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 18,
              }}
            >
              <AlertTriangle size={13} /> Fall Detection
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
              AI Fall Detection — Always On
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
              Gravity Elder uses wearable data and AI motion analysis to detect falls in real time — and escalates instantly to your emergency contacts.
            </p>
          </motion.div>

          <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
            {/* Main fall detection status card */}
            <motion.div variants={fadeUp}>
              <GlassCard accentColor="#EF4444" style={{ padding: '36px 30px' }} hover={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Fall Detection Status
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: '#FFFFFF' }}>
                      Rajan Sharma
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: 4 }}>
                      Age 74 · Hyderabad
                    </div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 999,
                      background: 'rgba(16,185,129,0.15)',
                      border: '1px solid rgba(16,185,129,0.4)',
                      color: '#10B981',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                    }}
                  >
                    ACTIVE
                  </motion.div>
                </div>

                {/* Fall alerts this week */}
                <div
                  style={{
                    padding: '20px 22px',
                    borderRadius: 14,
                    background: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: 'rgba(16,185,129,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10B981',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <div style={{ color: '#10B981', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1 }}>
                      0 Detected
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', marginTop: 3 }}>
                      Fall alerts this week — All clear
                    </div>
                  </div>
                </div>

                {/* Response time */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: 12,
                    background: 'rgba(212,168,83,0.06)',
                    border: '1px solid rgba(212,168,83,0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem' }}>Emergency contact response time</div>
                  <div style={{ color: '#D4A853', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
                    45 sec
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Sensitivity settings */}
            <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <GlassCard accentColor="#EF4444" style={{ padding: '26px 22px' }} hover={false}>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>
                  Detection Sensitivity
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(['Low', 'Medium', 'High'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setSensitivity(level)}
                      style={{
                        width: '100%',
                        padding: '13px 16px',
                        borderRadius: 10,
                        background: sensitivity === level ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${sensitivity === level ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.07)'}`,
                        color: sensitivity === level ? '#FCA5A5' : 'rgba(255,255,255,0.5)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span>{level}</span>
                      {sensitivity === level && (
                        <CheckCircle size={16} style={{ color: '#EF4444' }} />
                      )}
                    </button>
                  ))}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginTop: 14, lineHeight: 1.55, margin: '14px 0 0' }}>
                  High sensitivity detects subtle falls including slow slides. Recommended for higher-risk individuals.
                </p>
              </GlassCard>

              <GlassCard accentColor="#8B5CF6" style={{ padding: '22px 20px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(139,92,246,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#A78BFA',
                    }}
                  >
                    <Phone size={18} />
                  </div>
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem' }}>Priya Sharma</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>Primary emergency contact</div>
                  </div>
                  <div style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', fontSize: '0.72rem', fontWeight: 700 }}>
                    Active
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── HEALTH MONITORING ─────────────────────────────────────────────────── */}
      <Section bg="#0d1117">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#FCA5A5',
                borderRadius: 999,
                padding: '5px 16px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 18,
              }}
            >
              <Activity size={13} /> Health Monitoring
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
              Real-Time Health Dashboard
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}
          >
            {/* Heart Rate card */}
            <motion.div variants={fadeUp}>
              <GlassCard accentColor="#EF4444" style={{ padding: '28px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(239,68,68,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#EF4444',
                    }}
                  >
                    <Heart size={20} />
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', fontSize: '0.72rem', fontWeight: 700 }}>
                    Normal
                  </div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Heart Rate
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, color: '#EF4444', lineHeight: 1, marginBottom: 4 }}>
                  78
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginBottom: 14 }}>bpm — Resting</div>
                <HeartRateLine />
              </GlassCard>
            </motion.div>

            {/* Blood Pressure card */}
            <motion.div variants={fadeUp}>
              <GlassCard accentColor="#3B82F6" style={{ padding: '28px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(59,130,246,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#3B82F6',
                    }}
                  >
                    <Droplets size={20} />
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', fontSize: '0.72rem', fontWeight: 700 }}>
                    Normal
                  </div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Blood Pressure
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, color: '#60A5FA', lineHeight: 1, marginBottom: 4 }}>
                  120<span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)' }}>/</span>80
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginBottom: 14 }}>mmHg — Optimal</div>
                <div style={{ height: 48, display: 'flex', alignItems: 'center' }}>
                  <svg width="100%" height="32" viewBox="0 0 200 32">
                    <motion.path
                      d="M0,20 Q25,8 50,20 Q75,32 100,16 Q125,4 150,20 Q175,32 200,16"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                  </svg>
                </div>
              </GlassCard>
            </motion.div>

            {/* Steps card */}
            <motion.div variants={fadeUp}>
              <GlassCard accentColor="#10B981" style={{ padding: '28px 22px' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(16,185,129,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10B981',
                    marginBottom: 14,
                  }}
                >
                  <Footprints size={20} />
                </div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Steps Today
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, color: '#10B981', lineHeight: 1, marginBottom: 4 }}>
                  3,240
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginBottom: 16 }}>Goal: 5,000 steps</div>
                <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '64.8%' }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #10B981, #34D399)' }}
                  />
                </div>
              </GlassCard>
            </motion.div>

            {/* Sleep card */}
            <motion.div variants={fadeUp}>
              <GlassCard accentColor="#8B5CF6" style={{ padding: '28px 22px' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(139,92,246,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8B5CF6',
                    marginBottom: 14,
                  }}
                >
                  <Moon size={20} />
                </div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Sleep Last Night
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, color: '#A78BFA', lineHeight: 1, marginBottom: 4 }}>
                  7h 23m
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginBottom: 16 }}>11:04 PM → 6:27 AM</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['Deep', 'REM', 'Light', 'Awake'].map((phase, i) => {
                    const widths = [32, 22, 38, 8];
                    const colors = ['#8B5CF6', '#3B82F6', '#A78BFA', 'rgba(255,255,255,0.15)'];
                    return (
                      <div key={phase} style={{ flex: widths[i], height: 8, borderRadius: 999, background: colors[i] }} title={phase} />
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── MEDICATION MANAGEMENT ─────────────────────────────────────────────── */}
      <Section bg="#0B0D13">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(212,168,83,0.1)',
                border: '1px solid rgba(212,168,83,0.25)',
                color: '#D4A853',
                borderRadius: 999,
                padding: '5px 16px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 18,
              }}
            >
              <Pill size={13} /> Medication Management
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
              Today&apos;s Medication Schedule
            </h2>
          </motion.div>

          <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
            {/* Schedule */}
            <motion.div variants={fadeUp}>
              <GlassCard accentColor="#D4A853" style={{ padding: '28px 24px' }} hover={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ color: '#FFFFFF', fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0 }}>
                    Today — June 13
                  </h3>
                  <div
                    style={{
                      padding: '5px 12px',
                      borderRadius: 999,
                      background: 'rgba(16,185,129,0.1)',
                      border: '1px solid rgba(16,185,129,0.25)',
                      color: '#10B981',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    {Math.round((medications.filter((m) => m.taken).length / medications.length) * 100)}% adherent
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <AnimatePresence>
                    {medications.map((med) => (
                      <motion.div
                        key={med.id}
                        layout
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          padding: '16px 18px',
                          borderRadius: 12,
                          background: med.taken
                            ? 'rgba(16,185,129,0.05)'
                            : med.upcoming
                            ? 'rgba(212,168,83,0.08)'
                            : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${med.taken ? 'rgba(16,185,129,0.2)' : med.upcoming ? 'rgba(212,168,83,0.25)' : 'rgba(255,255,255,0.07)'}`,
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: med.taken ? 'rgba(16,185,129,0.15)' : 'rgba(212,168,83,0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: med.taken ? '#10B981' : '#D4A853',
                            flexShrink: 0,
                          }}
                        >
                          <Pill size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.92rem' }}>{med.name}</span>
                            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>{med.time}</span>
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: 2 }}>
                            {med.label} dose
                          </div>
                        </div>
                        {med.taken ? (
                          <CheckCircle size={20} style={{ color: '#10B981', flexShrink: 0 }} />
                        ) : med.upcoming ? (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <motion.div
                              animate={{ opacity: [1, 0.4, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: '#D4A853',
                                flexShrink: 0,
                              }}
                            />
                            <button
                              onClick={() => markMedTaken(med.id)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: 8,
                                background: 'rgba(212,168,83,0.15)',
                                border: '1px solid rgba(212,168,83,0.3)',
                                color: '#D4A853',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                              }}
                            >
                              Mark Taken
                            </button>
                          </div>
                        ) : null}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </GlassCard>
            </motion.div>

            {/* Adherence stats */}
            <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <GlassCard accentColor="#D4A853" style={{ padding: '28px 22px', textAlign: 'center' }} hover={false}>
                <TrendingUp size={24} style={{ color: '#D4A853', marginBottom: 12 }} />
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Monthly Adherence
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, color: '#D4A853', lineHeight: 1, marginBottom: 4 }}>
                  94%
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', marginBottom: 20 }}>
                  June 2026 — Excellent
                </div>
                <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '94%' }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #D4A853, #F0C878)' }}
                  />
                </div>
              </GlassCard>

              <GlassCard accentColor="#EF4444" style={{ padding: '22px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 11,
                      background: 'rgba(239,68,68,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#EF4444',
                      flexShrink: 0,
                    }}
                  >
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.88rem', marginBottom: 4 }}>
                      Missed Medication Alerts
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', lineHeight: 1.5 }}>
                      Caregiver notified within 30 minutes of a missed dose. 1 missed this month (June 3).
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── CAREGIVER DASHBOARD ───────────────────────────────────────────────── */}
      <Section bg="#0d1117">
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
              <Users size={13} /> Caregiver Dashboard
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
              Family Caregiver Network
            </h2>
          </motion.div>

          <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24 }}>
            {/* Caregiver list */}
            <motion.div variants={fadeUp}>
              <GlassCard accentColor="#3B82F6" style={{ padding: '28px 22px' }} hover={false}>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>
                  Care Team
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {CAREGIVERS.map((cg) => (
                    <div
                      key={cg.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: `${cg.color}18`,
                          border: `1px solid ${cg.color}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: cg.color,
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {cg.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.88rem' }}>{cg.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>{cg.relation}</div>
                      </div>
                      <div
                        style={{
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: `${cg.color}15`,
                          border: `1px solid ${cg.color}30`,
                          color: cg.color,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                        }}
                      >
                        {cg.status}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Today's activity + weekly wellness */}
            <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <GlassCard accentColor="#10B981" style={{ padding: '26px 22px' }} hover={false}>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>
                  Today&apos;s Activity
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 280, overflowY: 'auto' }}>
                  {ACTIVITY_TIMELINE.map((evt, i) => (
                    <motion.div
                      key={evt.event}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: `${evt.color}18`,
                          border: `1px solid ${evt.color}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: evt.color,
                          flexShrink: 0,
                        }}
                      >
                        {evt.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem' }}>{evt.event}</span>
                          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{evt.time}</span>
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{evt.detail}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard accentColor="#D4A853" style={{ padding: '22px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Calendar size={20} style={{ color: '#D4A853' }} />
                    <div>
                      <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem' }}>Weekly Wellness Report</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>June 7 – 13, 2026</div>
                    </div>
                  </div>
                  <div style={{ padding: '5px 14px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', fontSize: '0.78rem', fontWeight: 700 }}>
                    Good Week
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── WEARABLE INTEGRATIONS ─────────────────────────────────────────────── */}
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
              <Watch size={13} /> Wearable Integrations
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
              Works With Your Wearable
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 540, margin: '0 auto', lineHeight: 1.75 }}>
              Gravity Elder integrates with all major health wearables to pull real-time biometric data and enhance fall detection accuracy.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}
          >
            {WEARABLES.map((w, i) => (
              <motion.div key={w.name} variants={fadeUp} whileHover={{ y: -5 }}>
                <GlassCard
                  accentColor={w.connected ? '#10B981' : '#8B5CF6'}
                  style={{ padding: '28px 22px', position: 'relative', overflow: 'hidden' }}
                  hover={false}
                >
                  {w.connected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#10B981',
                        boxShadow: '0 0 8px rgba(16,185,129,0.6)',
                      }}
                    />
                  )}
                  <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{w.icon}</div>
                  <h3 style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1rem', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                    {w.name}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: 18, lineHeight: 1.5 }}>
                    {w.desc}
                  </p>
                  <button
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 10,
                      background: w.connected ? 'rgba(16,185,129,0.12)' : 'rgba(139,92,246,0.12)',
                      border: `1px solid ${w.connected ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)'}`,
                      color: w.connected ? '#10B981' : '#A78BFA',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    {w.connected ? (
                      <>
                        <Wifi size={14} /> Connected
                      </>
                    ) : (
                      <>
                        <Wifi size={14} /> Connect
                      </>
                    )}
                  </button>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── EMERGENCY ESCALATION ─────────────────────────────────────────────── */}
      <Section bg="#0d1117">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#FCA5A5',
                borderRadius: 999,
                padding: '5px 16px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 18,
              }}
            >
              <Shield size={13} /> Emergency Escalation
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
              5-Step Emergency Response
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
              When a fall is detected, Gravity follows a structured escalation protocol — from instant alert to emergency services in under 2 minutes.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ position: 'relative' }}>
              {/* Connector line */}
              <div
                style={{
                  position: 'absolute',
                  left: 31,
                  top: 40,
                  bottom: 40,
                  width: 2,
                  background: 'linear-gradient(180deg, #EF4444, #F59E0B, #8B5CF6, #3B82F6, #10B981)',
                  borderRadius: 999,
                  opacity: 0.3,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {ESCALATION_STEPS.map((step, i) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}
                    style={{
                      display: 'flex',
                      gap: 20,
                      alignItems: 'center',
                      padding: '18px 24px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${step.color}20`,
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: `${step.color}18`,
                        border: `2px solid ${step.color}50`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: step.color,
                        flexShrink: 0,
                        zIndex: 1,
                      }}
                    >
                      {step.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <div style={{ color: step.color, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.88rem' }}>
                          Step {step.step}
                        </div>
                        <h4 style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{step.label}</h4>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', margin: 0 }}>{step.desc}</p>
                    </div>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: step.color,
                        boxShadow: `0 0 10px ${step.color}80`,
                        flexShrink: 0,
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0B0D13 0%, #150d0a 60%, #0d0a14 100%)',
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
            background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 28px',
            }}
          >
            <Heart size={38} style={{ color: '#EF4444', fill: 'rgba(239,68,68,0.3)' }} />
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
            Start Elder Care —
            <br />
            <span style={{ color: '#EF4444' }}>₹399/month</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.78 }}>
            Distance does not have to mean worry. Gravity Elder keeps your loved ones safe, monitored, and connected — every single day. First month free.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                color: '#FFFFFF',
                padding: '16px 40px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '1.05rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 36px rgba(239,68,68,0.3)',
              }}
            >
              Start Elder Care — ₹399/month <ChevronRight size={18} />
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
              View All Plans
            </Link>
          </div>
          <div style={{ marginTop: 32 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={14} /> Return to Gravity Home
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </>
  );
}
