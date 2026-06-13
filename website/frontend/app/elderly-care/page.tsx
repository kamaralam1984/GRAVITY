'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Heart,
  Pill,
  MapPin,
  Battery,
  AlertCircle,
  Activity,
  CheckCircle,
  Bell,
  Shield,
  Users,
  Smartphone,
  ArrowLeft,
  Download,
  Clock,
  Smile,
  Eye,
  Lock,
  Home,
  Phone,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/* ── Animation variants ─────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ── Feature cards ──────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <Smile size={26} />,
    title: 'Wellness Check-ins',
    description:
      'A gentle daily notification asks your parent how they are feeling. A single tap responds. If they do not respond within a set window, you receive an alert immediately.',
  },
  {
    icon: <Pill size={26} />,
    title: 'Medication Reminders',
    description:
      'Set timed reminders for each medication. If the reminder is acknowledged but you still want confirmation, a caregiver notification confirms the dose was taken.',
  },
  {
    icon: <Home size={26} />,
    title: 'Geofence Home Zone',
    description:
      `Draw a safe zone around your parent\'s home or neighbourhood. You are notified when they leave or return — without watching their every move.`,
  },
  {
    icon: <Battery size={26} />,
    title: 'Battery Alerts',
    description:
      `When your parent\'s phone drops below a set battery threshold, you get a heads-up. Low battery is often the hidden reason families cannot reach their elders.`,
  },
  {
    icon: <AlertCircle size={26} />,
    title: 'One-Touch SOS Button',
    description:
      'A prominent, easy-to-reach SOS button on the Gravity home screen. One three-second hold sends their exact location and a live tracking link to everyone in the circle.',
  },
  {
    icon: <Activity size={26} />,
    title: 'Activity Status Detection',
    description:
      'Gravity detects whether the device is moving or stationary. If an elderly parent has not moved for an unusually long time during the day, a gentle wellness check is triggered automatically.',
  },
];

/* ── Wellness check details ─────────────────────────────────────────────────── */
const WELLNESS_STEPS = [
  { icon: <Bell size={20} />, title: 'Scheduled Check Notification', text: 'At a time you choose — morning, evening, or both — your parent receives a gentle nudge from Gravity asking how they are.' },
  { icon: <Smile size={20} />, title: '1-Tap Mood Response', text: 'They tap once: "All fine", "Tired today", or "Not great". No typing. No complexity. One thumb press and the family is reassured.' },
  { icon: <Clock size={20} />, title: 'Grace Period Window', text: 'If they do not respond within your chosen window — say, 30 minutes — you receive a soft alert. Not an alarm, a nudge to check in yourself.' },
  { icon: <Phone size={20} />, title: 'Missed Check-in Alert', text: 'A second missed check-in in a row triggers a firmer notification to all circle members, so the family can coordinate who calls or visits.' },
];

/* ── Medication reminder features ──────────────────────────────────────────── */
const MED_FEATURES = [
  { label: 'Multiple daily reminders', detail: 'Morning, afternoon, evening, and night slots' },
  { label: 'Caregiver notification', detail: 'Alert if a scheduled reminder is dismissed without acknowledgement' },
  { label: 'Refill reminders', detail: 'Set a date to remind yourself to refill the prescription' },
  { label: 'Custom medication names', detail: 'Plain-language names — no medical codes needed' },
  { label: 'Works offline', detail: 'Reminders fire even without an internet connection' },
  { label: 'Multiple medications', detail: 'Up to 10 different medications on paid plans' },
];

/* ── Independence principle points ─────────────────────────────────────────── */
const INDEPENDENCE_POINTS = [
  {
    icon: <Lock size={22} />,
    title: 'Consent-Based Tracking',
    text: 'Your elderly parent must accept the circle invitation and explicitly enable location sharing. They are never tracked without their knowledge or approval.',
  },
  {
    icon: <Eye size={22} />,
    title: 'They Can See Who Watches',
    text: 'Every elder circle member can open Gravity and see exactly who in the family has location access and which features are enabled — full transparency, always.',
  },
  {
    icon: <Shield size={22} />,
    title: 'Privacy Hours Respect Boundaries',
    text: 'Elders can configure Privacy Hours — time blocks during which location is paused and only SOS remains active. Personal time remains personal.',
  },
  {
    icon: <Heart size={22} />,
    title: 'Dignity Over Surveillance',
    text: 'Gravity is built around connection, not monitoring. The features surface information only when something is out of the ordinary — not as a 24-hour watch feed.',
  },
];

/* ── Testimonials ────────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote:
      'My father is 74 and lives in Coimbatore while I work in Pune. Before Gravity, I called him four times a day just to confirm he was fine. Now the wellness check does that for me and I call him properly in the evenings — we actually talk instead of just checking.',
    name: 'Aarthi K.',
    location: 'Pune, Maharashtra',
  },
  {
    quote:
      'Amma has blood pressure issues and forgets her evening tablet. The Gravity reminder has been a lifesaver — literally. And when she does not tap "I took it", I get a message and I call her. The app has made her more responsible about it too, because she knows we will notice.',
    name: 'Sanjay M.',
    location: 'Chennai, Tamil Nadu',
  },
  {
    quote:
      'Papa was not happy about "being tracked" at first. But once we showed him that he can see who has access and that he controls when his location is shared, he came around. He actually pressed SOS once during a dizzy spell and said afterwards — he felt safer knowing we were a tap away.',
    name: 'Neha R.',
    location: 'Hyderabad, Telangana',
  },
];

/* ── Setup steps ─────────────────────────────────────────────────────────────── */
const SETUP_STEPS = [
  {
    step: '01',
    title: 'Download Gravity on Your Phone First',
    text: 'Create your account and set up a family circle. You will be the circle administrator. This takes about two minutes.',
  },
  {
    step: '02',
    title: `Install Gravity on Your Parent\'s Smartphone`,
    text: 'Any mid-range Android or iPhone works. Gravity is designed for easy navigation — large text, minimal menus. Sit with your parent during this step and let them explore the interface.',
  },
  {
    step: '03',
    title: 'Invite Them to Your Circle',
    text: 'Send a circle invitation via WhatsApp, SMS, or email. Your parent taps the link, reviews the permissions, and accepts. They immediately see who else is in the circle.',
  },
  {
    step: '04',
    title: 'Set Up Their Wellness Check Schedule',
    text: 'In the circle settings, configure daily check-in times and the response window. Choose the features most relevant to your parent — wellness checks, medication reminders, geofence, or all of them.',
  },
  {
    step: '05',
    title: 'Show Them the SOS Button',
    text: 'Spend five minutes walking your parent through the SOS feature. Practise holding it for 3 seconds and pressing cancel. Familiarity in calm moments saves seconds in stressful ones.',
  },
  {
    step: '06',
    title: 'Add Other Family Members to the Circle',
    text: 'Siblings, spouses, nearby relatives — add everyone who should receive alerts. Shared responsibility means no single caregiver carries the entire weight.',
  },
];

/* ── Statistics ──────────────────────────────────────────────────────────────── */
const STATS = [
  { value: '2.3Cr+', label: 'elderly Indians live alone or semi-independently according to UNFPA estimates' },
  { value: '68%', label: 'of adult children in India live more than 100 km from their parents' },
  { value: '1 in 3', label: 'seniors experience a fall or health episode annually — many go unreported' },
  { value: '<2 min', label: 'to set up Gravity elderly care for a parent' },
];

/* ── Section wrapper ─────────────────────────────────────────────────────────── */
function Section({
  children,
  bg = 'var(--bg)',
}: {
  children: React.ReactNode;
  bg?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      style={{ background: bg, padding: '80px 0' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>{children}</div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function ElderlyCare() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          background: 'linear-gradient(135deg, #0e0a04 0%, #1a1206 40%, #0d0c0a 100%)',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '100px 24px 80px',
        }}
      >
        {/* Warm radial background */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(var(--gold-rgb), 0.08) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        {/* Floating soft orbs */}
        <motion.div
          animate={{ y: [0, -18, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '15%',
            right: '10%',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(var(--gold-rgb), 0.06) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          animate={{ y: [0, 14, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '8%',
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(var(--gold-rgb), 0.05) 0%, transparent 70%)',
            filter: 'blur(24px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: 32, textAlign: 'left' }}
          >
            <Link
              href="/"
              style={{
                color: 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ArrowLeft size={16} /> Return to Gravity Home
            </Link>
          </motion.div>

          {/* Animated heart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 110 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(var(--gold-rgb), 0.12)',
                border: '1px solid rgba(var(--gold-rgb), 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Heart size={42} style={{ color: 'var(--gold)' }} />
            </motion.div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: 20 }}
          >
            <span
              style={{
                background: 'rgba(var(--gold-rgb), 0.1)',
                border: '1px solid rgba(var(--gold-rgb), 0.25)',
                color: 'var(--gold)',
                borderRadius: 999,
                padding: '6px 18px',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Elderly Care
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 6vw, 4rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            Independence for Them.
            <br />
            <span className="gradient-text-gold">Peace of Mind</span> for You.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              maxWidth: 660,
              margin: '0 auto 44px',
              lineHeight: 1.75,
            }}
          >
            Millions of Indian parents live alone while their adult children work in distant cities. Gravity bridges that distance — not with surveillance, but with gentle, caring features that respect your parent`s dignity and keep your family connected across any geography.`
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link
              href="/"
              style={{
                background: 'var(--gold)',
                color: '#0a0900',
                padding: '14px 32px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 24px rgba(var(--gold-rgb), 0.3)',
              }}
            >
              <Download size={18} /> Set Up Elderly Care Now
            </Link>
            <a
              href="#features"
              style={{
                background: 'transparent',
                color: 'var(--text-primary)',
                padding: '14px 32px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                border: '1px solid var(--border-strong)',
              }}
            >
              Explore Features
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── THE CHALLENGE ─────────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 16,
              }}
            >
              The Challenge of Elder Care in India
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 680, margin: '0 auto', lineHeight: 1.75 }}>
              India is facing a quiet but profound shift in family structure. Rapid urbanisation has dispersed the joint family — today, millions of elderly parents live alone or with just a spouse, while their children pursue careers in cities hundreds of kilometres away. The love has not diminished. The distance has simply made care harder.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 48 }}
          >
            {STATS.map((s) => (
              <motion.div
                key={s.value}
                variants={fadeUp}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '24px 20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.2rem',
                    fontWeight: 800,
                    color: 'var(--gold)',
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{
              background: 'var(--bg)',
              border: '1px solid rgba(var(--gold-rgb), 0.2)',
              borderRadius: 16,
              padding: '32px',
              maxWidth: 780,
              margin: '0 auto',
            }}
          >
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0, fontSize: '1rem' }}>
              The result is a cycle of anxiety that affects both generations. Elderly parents feel the weight of aloneness but resist worrying their children. Adult children feel guilty for being away but cannot afford to leave their livelihoods. Neither generation should have to carry that burden alone. Gravity was built to ease exactly this — through quiet, unobtrusive technology that bridges the physical gap without replacing the emotional one.
            </p>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────────────── */}
      <Section bg="var(--bg)" id="features">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 16,
              }}
            >
              Gravity`s Elderly Care Features`
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Six thoughtfully designed capabilities that work together to keep your elderly loved ones safe, independent, and connected to the family.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22 }}
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -4, borderColor: 'rgba(var(--gold-rgb), 0.4)' }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '28px 24px',
                  transition: 'border-color 0.2s',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: 'rgba(var(--gold-rgb), 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gold)',
                    marginBottom: 16,
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, fontSize: '1.05rem' }}>
                  {f.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, margin: 0, fontSize: '0.9rem' }}>{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── WELLNESS CHECK ────────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }} className="responsive-grid">
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(var(--gold-rgb), 0.1)',
                  border: '1px solid rgba(var(--gold-rgb), 0.2)',
                  color: 'var(--gold)',
                  borderRadius: 999,
                  padding: '5px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 20,
                }}
              >
                <Smile size={14} /> Wellness Check
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: 16,
                  lineHeight: 1.2,
                }}
              >
                A Daily Reassurance,
                <br />
                Without the Worry Calls
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 24 }}>
                The wellness check-in is Gravity`s gentlest feature. Rather than calling your parent four times a day hoping they pick up, you get a structured daily check that puts the interaction in their hands — on their terms, at a time that suits them.`
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.75 }}>
                If your parent has a bad day, you know. If they are thriving, you are reassured without interrupting their routine. The wellness check creates a tiny daily thread of connection that accumulates into something meaningful over weeks and months.
              </p>
            </div>
            <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {WELLNESS_STEPS.map((step) => (
                <motion.div
                  key={step.title}
                  variants={fadeUp}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: '18px 20px',
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      minWidth: 38,
                      height: 38,
                      borderRadius: 10,
                      background: 'rgba(var(--gold-rgb), 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold)',
                    }}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: 4 }}>{step.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.55 }}>{step.text}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── MEDICATION REMINDERS ──────────────────────────────────────────────── */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(var(--gold-rgb), 0.08)',
                border: '1px solid rgba(var(--gold-rgb), 0.2)',
                color: 'var(--gold)',
                borderRadius: 999,
                padding: '5px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 20,
              }}
            >
              <Pill size={14} /> Medication Reminders
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 16,
              }}
            >
              The Right Tablet, at the Right Time
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
              For elderly parents managing multiple medications — blood pressure, diabetes, thyroid, cardiac — missed doses are not just inconvenient. They can be dangerous. Gravity`s medication reminder system gives caregivers visibility without needing to phone-check every evening.`
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}
          >
            {MED_FEATURES.map((m) => (
              <motion.div
                key={m.label}
                variants={fadeUp}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '18px 20px',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                }}
              >
                <CheckCircle size={18} style={{ color: 'var(--gold)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: 3 }}>{m.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>{m.detail}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{
              marginTop: 36,
              background: 'var(--bg-surface)',
              border: '1px solid rgba(var(--gold-rgb), 0.2)',
              borderRadius: 16,
              padding: '28px 32px',
              maxWidth: 720,
              margin: '36px auto 0',
            }}
          >
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Caregiver Notification:</strong> If your parent acknowledges the reminder but you have enabled caregiver confirmation for a critical medication, you receive a check notification 15 minutes after the scheduled dose. You can confirm with one tap or call if needed. No second-guessing. No 9pm panic calls.
            </p>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── THE INDEPENDENCE PRINCIPLE ────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 16,
              }}
            >
              The Independence Principle
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 620, margin: '0 auto', lineHeight: 1.75 }}>
              Safety technology for elderly people walks a fine line. Done badly, it becomes surveillance — eroding dignity and creating resentment. Gravity is built around the principle that your parent is an adult who deserves to be treated as one. Every feature is consent-based, transparent, and designed to support independence, not restrict it.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22 }}
          >
            {INDEPENDENCE_POINTS.map((p) => (
              <motion.div
                key={p.title}
                variants={fadeUp}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '28px 22px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    background: 'rgba(var(--gold-rgb), 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gold)',
                    margin: '0 auto 16px',
                  }}
                >
                  {p.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, fontSize: '1rem' }}>
                  {p.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, margin: 0, fontSize: '0.88rem' }}>{p.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────────── */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 16,
              }}
            >
              Real Stories. Real Families.
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              From Coimbatore to Hyderabad, Indian families are using Gravity to care for their elders across distance — with love, not anxiety.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}
          >
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderLeft: '3px solid var(--gold)',
                  borderRadius: 16,
                  padding: '28px 24px',
                }}
              >
                <div style={{ color: 'var(--gold)', fontSize: '2.5rem', lineHeight: 1, marginBottom: 12, fontFamily: 'Georgia, serif' }}>&ldquo;</div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20, fontSize: '0.93rem', fontStyle: 'italic' }}>
                  {t.quote}
                </p>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{t.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 2 }}>{t.location}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── SETUP GUIDE ───────────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 16,
              }}
            >
              Setting Up Gravity for Your Parent
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
              Designed to be set up in a single sitting — even if your parent is not technically confident. The whole process takes under 15 minutes and you only need to do it once.
            </p>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 780, margin: '0 auto' }}>
            {SETUP_STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                style={{
                  display: 'flex',
                  gap: 24,
                  alignItems: 'flex-start',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '22px 28px',
                }}
              >
                <div
                  style={{
                    minWidth: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: i === 0 ? 'var(--gold)' : 'rgba(var(--gold-rgb), 0.1)',
                    border: i !== 0 ? '1px solid rgba(var(--gold-rgb), 0.3)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color: i === 0 ? '#0a0900' : 'var(--gold)',
                  }}
                >
                  {step.step}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>
                    {step.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, margin: 0, fontSize: '0.9rem' }}>{step.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            style={{
              marginTop: 36,
              textAlign: 'center',
              background: 'var(--bg)',
              border: '1px solid rgba(var(--gold-rgb), 0.2)',
              borderRadius: 16,
              padding: '28px 32px',
              maxWidth: 680,
              margin: '36px auto 0',
            }}
          >
            <Smartphone size={28} style={{ color: 'var(--gold)', marginBottom: 12 }} />
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Tip:</strong> If you are setting Gravity up remotely, video-call your parent while they follow along on their phone. Most families complete the setup in under 10 minutes on a video call. Gravity`s large-text mode is ideal for elderly users — enable it in Settings under Accessibility.`
            </p>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── PRICING ───────────────────────────────────────────────────────────── */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 16,
              }}
            >
              Affordable for Every Indian Family
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto 28px', lineHeight: 1.7 }}>
              Caring for your elderly parent should not come with a premium price tag. Gravity`s elderly care features — wellness checks, medication reminders, geofencing, SOS — are available starting from the free plan. For families who want the full suite of caregiver tools, our Care plan is priced to be genuinely accessible.`
            </p>
            <Link
              href="/pricing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(var(--gold-rgb), 0.1)',
                border: '1px solid rgba(var(--gold-rgb), 0.3)',
                color: 'var(--gold)',
                borderRadius: 12,
                padding: '12px 28px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
              }}
            >
              View Pricing Plans
            </Link>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, maxWidth: 900, margin: '0 auto' }}
          >
            {[
              { plan: 'Free', price: '₹0', features: ['3 circle members', 'SOS alerts', 'Basic wellness check', 'Geofencing (1 zone)'] },
              { plan: 'Family', price: '₹199/mo', features: ['10 circle members', 'Unlimited wellness checks', 'Medication reminders', 'Geofencing (5 zones)', 'Battery alerts'] },
              { plan: 'Care', price: '₹349/mo', features: ['Full caregiver dashboard', 'Activity monitoring', 'Multi-elder support', 'Priority notifications', 'All Family features'] },
            ].map((tier, i) => (
              <motion.div
                key={tier.plan}
                variants={fadeUp}
                style={{
                  background: i === 1 ? 'rgba(var(--gold-rgb), 0.06)' : 'var(--bg-surface)',
                  border: i === 1 ? '1px solid rgba(var(--gold-rgb), 0.3)' : '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '26px 22px',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  {tier.plan}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: i === 1 ? 'var(--gold)' : 'var(--text-primary)',
                    marginBottom: 18,
                  }}
                >
                  {tier.price}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
                  {tier.features.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <CheckCircle size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface2)">
        <motion.div variants={stagger} style={{ textAlign: 'center' }}>
          <motion.div
            variants={fadeUp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(var(--gold-rgb), 0.1)',
              marginBottom: 24,
            }}
          >
            <Heart size={36} style={{ color: 'var(--gold)' }} />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 16,
            }}
          >
            Start Caring From Wherever You Are
          </motion.h2>
          <motion.p
            variants={fadeUp}
            style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7 }}
          >
            Distance does not have to mean disconnection. Gravity keeps the thread between you and your elderly parents strong, quiet, and caring — every single day. Set up takes minutes. The peace of mind lasts a lifetime.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                background: 'var(--gold)',
                color: '#0a0900',
                padding: '15px 36px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1.05rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 24px rgba(var(--gold-rgb), 0.25)',
              }}
            >
              <Download size={20} /> Set Up Elderly Care Now
            </Link>
            <Link
              href="/"
              style={{
                background: 'transparent',
                color: 'var(--text-primary)',
                padding: '15px 36px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1.05rem',
                border: '1px solid var(--border-strong)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <ArrowLeft size={18} /> Return to Gravity Home
            </Link>
          </motion.div>
        </motion.div>
      </Section>

      <Footer />
    </>
  );
}
