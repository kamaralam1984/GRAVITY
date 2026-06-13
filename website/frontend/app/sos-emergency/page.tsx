'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  AlertCircle,
  MapPin,
  Users,
  Phone,
  Clock,
  Battery,
  Shield,
  CheckCircle,
  XCircle,
  Siren,
  Activity,
  Baby,
  UserMinus,
  CloudLightning,
  HeartPulse,
  Lock,
  ArrowLeft,
  Download,
  Navigation,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/* ── Fade-up animation variant ─────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ── How SOS works steps ────────────────────────────────────────────────────── */
const SOS_STEPS = [
  {
    step: '01',
    title: 'Hold the SOS Button for 3 Seconds',
    description:
      'No accidental triggers. The 3-second hold is intentional — enough time to confirm you need help, short enough to act fast in a real emergency. A countdown ring on screen tells you help is on the way.',
  },
  {
    step: '02',
    title: 'Your Location Is Instantly Shared',
    description:
      'The moment the timer completes, Gravity captures your exact GPS coordinates, current address, device battery percentage, and a live tracking link. All of this is pushed to every member of your safety circle simultaneously.',
  },
  {
    step: '03',
    title: 'Call Emergency Services Option',
    description:
      'A prominent one-tap prompt lets you call 112 (India\'s national emergency number), 100 (police), 108 (ambulance), or 101 (fire). You choose. Gravity never auto-dials so you stay in control of escalation.',
  },
  {
    step: '04',
    title: 'Family Receives Live Tracking Link',
    description:
      'Every circle member gets a push notification with a real-time tracking link — no app download required. They can watch your position update live until you mark the emergency resolved.',
  },
];

/* ── What gets shared cards ─────────────────────────────────────────────────── */
const SHARED_DATA = [
  { icon: <MapPin size={22} />, label: 'Exact GPS Coordinates', detail: 'Lat/long to within 5 metres in open areas' },
  { icon: <Navigation size={22} />, label: 'Current Street Address', detail: 'Human-readable address via reverse geocoding' },
  { icon: <Clock size={22} />, label: 'Timestamp', detail: 'Precise time the SOS was triggered' },
  { icon: <Activity size={22} />, label: 'Live Tracking Link', detail: 'Real-time map updates shared without requiring an app' },
  { icon: <Battery size={22} />, label: 'Battery Level', detail: 'So responders know if the phone may go offline soon' },
  { icon: <Phone size={22} />, label: 'Contact Number', detail: 'Saved profile number displayed to all circle members' },
];

/* ── When to use SOS scenarios ──────────────────────────────────────────────── */
const SCENARIOS = [
  {
    icon: <HeartPulse size={28} />,
    title: 'Medical Emergency',
    description:
      'Chest pain, severe allergic reaction, unconsciousness — when every second counts, one hold alerts your family before you lose the ability to call.',
  },
  {
    icon: <Siren size={28} />,
    title: 'Road Accident',
    description:
      'If you are involved in a collision or witness one and feel unsafe, SOS gets your exact location to loved ones immediately so they can coordinate help.',
  },
  {
    icon: <Baby size={28} />,
    title: 'Lost or Scared Child',
    description:
      'A child who cannot find their parents, or feels threatened, can press and hold their SOS button. Parents receive the alert and see exactly where their child is.',
  },
  {
    icon: <UserMinus size={28} />,
    title: 'Unsafe Situation',
    description:
      'Late-night commute, an unfamiliar neighbourhood, harassment on public transport — discreetly trigger SOS so family knows your location without you making a call.',
  },
  {
    icon: <CloudLightning size={28} />,
    title: 'Natural Disaster',
    description:
      'During floods, earthquakes, or severe storms, networks are congested. Gravity SOS queues your alert until a signal window opens, ensuring it reaches your circle.',
  },
  {
    icon: <Activity size={28} />,
    title: 'Elderly Fall or Health Episode',
    description:
      'For elderly circle members who live alone or semi-independently, a moment of dizziness or a fall can be life-threatening. SOS gives them a direct line to family in seconds.',
  },
];

/* ── Fake-alert protection features ─────────────────────────────────────────── */
const PROTECTIONS = [
  {
    icon: <Clock size={24} />,
    title: '3-Second Hold Requirement',
    description:
      'Accidental pocket-presses or curious children tapping the button will not trigger an alert. The deliberate 3-second hold filters out every false activation.',
  },
  {
    icon: <XCircle size={24} />,
    title: '5-Second Cancel Window',
    description:
      'Immediately after the hold completes, a 5-second cancel window appears on screen. If it was a mistake, you can abort before any notification leaves your device.',
  },
  {
    icon: <Shield size={24} />,
    title: 'Trusted Contact Confirmation',
    description:
      'For households with young children, administrators can enable a "confirm with trusted contact" mode — a designated adult in the circle must acknowledge the alert to escalate it to emergency services.',
  },
];

/* ── Testimonials ────────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote:
      'My mother has a heart condition and lives two streets away. Last monsoon she had a dizzy spell and pressed SOS before sitting down. I was at her door in four minutes — because Gravity showed me exactly where she was.',
    name: 'Ramesh A.',
    location: 'Bangalore, Karnataka',
  },
  {
    quote:
      'My teenage daughter commutes by metro alone after her evening tuitions. The day she felt followed at the station, she triggered SOS silently. I called her in under a minute and stayed on the line until she was home safe.',
    name: 'Priya S.',
    location: 'Mumbai, Maharashtra',
  },
  {
    quote:
      'We went on a trekking trip in Himachal and my brother slipped and injured his ankle. No cell signal to call anyone but the SOS alert queued and delivered when we hit a small signal patch. The rest of the group knew exactly where we were.',
    name: 'Vikram D.',
    location: 'Delhi, NCR',
  },
];

/* ── Comparison table data ──────────────────────────────────────────────────── */
const COMPARISON = [
  { feature: 'Time to alert family', sos: '< 5 seconds', call: '30–90 seconds (dial, explain, wait)' },
  { feature: 'Works when you cannot speak', sos: 'Yes — silent trigger', call: 'No' },
  { feature: 'Shares exact location automatically', sos: 'Yes', call: 'Only if you can describe it' },
  { feature: 'Notifies multiple people at once', sos: 'Yes — entire circle simultaneously', call: 'One person at a time' },
  { feature: 'Provides live tracking link', sos: 'Yes — real-time updates', call: 'No' },
  { feature: 'Includes battery status', sos: 'Yes', call: 'No' },
  { feature: 'Works under network congestion', sos: 'Queued delivery when signal returns', call: 'Call drops or fails to connect' },
];

/* ── Statistics ──────────────────────────────────────────────────────────────── */
const STATS = [
  { value: '73%', label: 'of Gravity families report feeling significantly safer with SOS enabled' },
  { value: '<45s', label: 'average family response time when Gravity SOS is used' },
  { value: '3s', label: 'hold duration — enough to be intentional, fast enough in a crisis' },
  { value: '100%', label: 'of SOS alerts include precise GPS coordinates and a live tracking link' },
];

/* ── Section wrapper with ref for in-view ───────────────────────────────────── */
function Section({
  children,
  bg = 'var(--bg)',
  className = '',
}: {
  children: React.ReactNode;
  bg?: string;
  id?: string;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      style={{ background: bg, padding: '80px 0' }}
      className={className}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>{children}</div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function SOSEmergencyPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          background: 'linear-gradient(135deg, #0d0405 0%, #1a0608 40%, #0a0a0d 100%)',
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '100px 24px 80px',
        }}
      >
        {/* Background radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(var(--sos, 220 38 38), 0.12) 0%, transparent 70%)',
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

          {/* Pulsing SOS button visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {/* Pulse rings */}
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.6 + i * 0.3], opacity: [0.5, 0] }}
                  transition={{ duration: 2, delay: i * 0.4, repeat: Infinity, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '2px solid var(--sos)',
                    pointerEvents: 'none',
                  }}
                />
              ))}
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'var(--sos)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 40px rgba(220,38,38,0.5)',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '1.8rem',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.05em',
                  }}
                >
                  SOS
                </span>
              </div>
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.35 }}
            style={{ marginBottom: 20 }}
          >
            <span
              style={{
                background: 'rgba(220,38,38,0.12)',
                border: '1px solid rgba(220,38,38,0.3)',
                color: 'var(--sos)',
                borderRadius: 999,
                padding: '6px 18px',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Emergency SOS
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.45 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            Help in{' '}
            <span style={{ color: 'var(--sos)' }}>3 Seconds.</span>
            <br />
            Peace of Mind{' '}
            <span className="gradient-text-gold">Always.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.55 }}
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              maxWidth: 640,
              margin: '0 auto 40px',
              lineHeight: 1.7,
            }}
          >
            One three-second hold on the Gravity SOS button silently sends your exact location, a live tracking link, and your battery level to every member of your safety circle — before you can even finish dialling.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.65 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link
              href="/"
              style={{
                background: 'var(--sos)',
                color: '#fff',
                padding: '14px 32px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 24px rgba(220,38,38,0.4)',
              }}
            >
              <Download size={18} /> Download & Enable SOS
            </Link>
            <a
              href="#how-it-works"
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
              How It Works
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────────── */}
      <Section bg="var(--sos, #dc2626)" className="">
        <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
          {STATS.map((s) => (
            <motion.div key={s.value} variants={fadeUp} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.6rem',
                  fontWeight: 800,
                  color: '#fff',
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {s.value}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.5 }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <Section bg="var(--bg)" id="how-it-works">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 16,
              }}
            >
              How Emergency SOS Works
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              From trigger to family notification in under five seconds. Here is the exact sequence that plays out when you activate Gravity SOS.
            </p>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {SOS_STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                style={{
                  display: 'flex',
                  gap: 28,
                  alignItems: 'flex-start',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '28px 32px',
                }}
              >
                <div
                  style={{
                    minWidth: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: i === 0 ? 'var(--sos)' : 'rgba(220,38,38,0.12)',
                    border: i !== 0 ? '1px solid rgba(220,38,38,0.3)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: i === 0 ? '#fff' : 'var(--sos)',
                  }}
                >
                  {step.step}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.15rem', marginBottom: 8 }}>
                    {step.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── WHAT GETS SHARED ──────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
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
              What Gets Shared With Your Family
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Every SOS alert carries a complete situational picture — not just a pin on a map. Your family gets everything they need to respond effectively.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}
          >
            {SHARED_DATA.map((item) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '22px 24px',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    minWidth: 42,
                    height: 42,
                    borderRadius: 10,
                    background: 'rgba(220,38,38,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--sos)',
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, fontSize: '0.95rem' }}>{item.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{item.detail}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── WHO GETS NOTIFIED ─────────────────────────────────────────────────── */}
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
              Who Gets Notified
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 620, margin: '0 auto', lineHeight: 1.7 }}>
              Gravity SOS does not rely on a single person seeing a message. It creates a simultaneous alert web across your chosen contacts.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <motion.div
              variants={fadeUp}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid rgba(220,38,38,0.25)',
                borderRadius: 16,
                padding: '32px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Users size={28} style={{ color: 'var(--sos)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                  Your Safety Circle
                </h3>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
                Every single member of your Gravity circle receives the SOS push notification simultaneously. Whether it is your spouse at work, your mother at home, or your sibling in another city — nobody is left out. The alert includes your location, a live tracking link, and a one-tap call button.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Instant push notification', 'Live tracking link (no app needed)', 'One-tap call-back button', 'Battery level of the person in distress'].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <CheckCircle size={15} style={{ color: 'var(--safe)' }} />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '32px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Phone size={28} style={{ color: 'var(--gold)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                  Emergency Contacts Outside Your Circle
                </h3>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
                You can configure up to five trusted emergency contacts who are not part of your Gravity circle — a neighbour, a colleague, a local friend. When SOS activates, these contacts receive an SMS with your location and a message explaining you triggered an emergency alert. No app required on their end.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['SMS alert with location link', 'Works even on basic phones', 'Configurable message in your language', 'Separate from circle — for local contacts'].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <CheckCircle size={15} style={{ color: 'var(--gold)' }} />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Section>

      {/* ── WHEN TO USE SOS ───────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
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
              When To Use Emergency SOS
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Gravity SOS is designed for real, high-stakes situations across all ages and contexts. Here are six scenarios where it can make the critical difference.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}
          >
            {SCENARIOS.map((scenario) => (
              <motion.div
                key={scenario.title}
                variants={fadeUp}
                whileHover={{ y: -4, borderColor: 'rgba(220,38,38,0.4)' }}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '28px 24px',
                  transition: 'border-color 0.2s',
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 14,
                    background: 'rgba(220,38,38,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--sos)',
                    marginBottom: 16,
                  }}
                >
                  {scenario.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, fontSize: '1.05rem' }}>
                  {scenario.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, margin: 0, fontSize: '0.9rem' }}>{scenario.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── FAKE ALERT PROTECTION ─────────────────────────────────────────────── */}
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
              Fake Alert Protection
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
              False alarms erode trust and cause unnecessary panic. Gravity uses a three-layer system to ensure every SOS alert is real — while keeping the activation fast enough when it matters most.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {PROTECTIONS.map((p) => (
              <motion.div
                key={p.title}
                variants={fadeUp}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '28px 24px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
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
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, fontSize: '1.05rem' }}>
                  {p.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, margin: 0, fontSize: '0.9rem' }}>{p.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── SOS vs CALLING TABLE ──────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
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
              Gravity SOS vs. Just Calling
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Calling someone when you are in danger is not always possible. Here is how Gravity SOS compares to a traditional phone call in a high-stress situation.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: 0,
                background: 'var(--bg)',
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid var(--border)',
              }}
            >
              <thead>
                <tr style={{ background: 'var(--bg-surface2)' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
                    Feature
                  </th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--sos)', fontWeight: 700, fontSize: '0.95rem', borderBottom: '1px solid var(--border)' }}>
                    Gravity SOS
                  </th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem', borderBottom: '1px solid var(--border)' }}>
                    Calling Someone
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} style={{ background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-surface)' }}>
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: '0.92rem', borderBottom: '1px solid var(--border)' }}>
                      {row.feature}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--safe)', fontWeight: 600, fontSize: '0.9rem' }}>{row.sos}</span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', borderBottom: '1px solid var(--border)' }}>
                      {row.call}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              Real Families. Real Emergencies.
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
              These are the moments Gravity SOS was built for — shared by Indian families who used it when it mattered most.
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
                  borderRadius: 16,
                  padding: '28px 24px',
                }}
              >
                <div style={{ color: 'var(--sos)', fontSize: '2.5rem', lineHeight: 1, marginBottom: 12, fontFamily: 'Georgia, serif' }}>&ldquo;</div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20, fontSize: '0.95rem', fontStyle: 'italic' }}>
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

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface2)">
        <motion.div
          variants={stagger}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            variants={fadeUp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(220,38,38,0.12)',
              marginBottom: 24,
            }}
          >
            <AlertCircle size={36} style={{ color: 'var(--sos)' }} />
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
            Enable SOS Today. Hope You Never Need It.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7 }}
          >
            Emergency SOS is available on all Gravity plans — including the free tier. Download Gravity, create your family circle, and enable SOS in under two minutes. The best emergency plan is one you set up before you need it.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                background: 'var(--sos)',
                color: '#fff',
                padding: '15px 36px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1.05rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 24px rgba(220,38,38,0.35)',
              }}
            >
              <Download size={20} /> Download &amp; Enable SOS
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
