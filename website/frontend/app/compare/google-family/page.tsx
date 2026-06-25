'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Minus,
  Star,
  Shield,
  Zap,
  Heart,
  Lock,
  ChevronRight,
  Globe,
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

const COMPARISON_ROWS = [
  { feature: 'Real-time Location Sharing', gravity: 'yes', google: 'yes', gravityNote: 'All family members, continuous', googleNote: 'Limited to enabled contacts' },
  { feature: 'Location History', gravity: 'yes', google: 'partial', gravityNote: '365 days on all paid plans', googleNote: 'Google Maps Timeline only' },
  { feature: 'Crash Detection', gravity: 'yes', google: 'no', gravityNote: 'Included on Family+ plan', googleNote: 'Not available' },
  { feature: 'Elderly Care Suite', gravity: 'yes', google: 'no', gravityNote: 'Medication reminders, wellness', googleNote: 'Not available' },
  { feature: 'SOS Emergency Alerts', gravity: 'yes', google: 'no', gravityNote: 'One-tap, silent, shake modes', googleNote: 'Not available' },
  { feature: 'Child Safety Controls', gravity: 'yes', google: 'partial', gravityNote: 'School alerts, bus tracking, guardians', googleNote: 'Basic screen time only' },
  { feature: 'Driving Safety', gravity: 'yes', google: 'no', gravityNote: 'Speed, braking, phone usage reports', googleNote: 'Not available' },
  { feature: 'AI Family Assistant', gravity: 'yes', google: 'no', gravityNote: 'Predictive alerts & insights', googleNote: 'Not available' },
  { feature: 'Family Chat', gravity: 'yes', google: 'no', gravityNote: 'Built-in messaging & voice notes', googleNote: 'Not available in Family Link' },
  { feature: 'Wearable Integration', gravity: 'yes', google: 'partial', gravityNote: 'Apple Watch, Galaxy Watch, Fitbit', googleNote: 'Wear OS only, limited features' },
  { feature: 'Health Monitoring', gravity: 'yes', google: 'no', gravityNote: 'Heart rate, sleep, steps tracking', googleNote: 'Not available' },
  { feature: 'Geofencing Alerts', gravity: 'yes', google: 'partial', gravityNote: 'Unlimited zones, smart alerts', googleNote: 'School geofence only' },
  { feature: 'Indian Payment Support', gravity: 'yes', google: 'partial', gravityNote: 'UPI, Razorpay, all Indian banks', googleNote: 'Limited INR billing support' },
  { feature: 'Data Privacy', gravity: 'yes', google: 'no', gravityNote: 'Zero data sold to third parties', googleNote: 'Data used for Google ad profiling' },
  { feature: 'Monthly Price (family)', gravity: 'yes', google: 'yes', gravityNote: 'From ₹199/month', googleNote: 'Free but feature-limited' },
  { feature: 'Offline Location Cache', gravity: 'yes', google: 'no', gravityNote: 'Last known location when offline', googleNote: 'Requires internet connection' },
];

const DIFFERENTIATORS = [
  {
    icon: <Shield size={28} />,
    title: 'Built for Indian Families',
    description: 'UPI payments, Indian emergency services integration, local language support, and features designed around how Indian families actually live — not imported Western defaults.',
    color: '#4B80F0',
  },
  {
    icon: <Heart size={28} />,
    title: 'Elderly Care Built In',
    description: 'Google Family Link was built for child screen time. KVL Track includes a complete elderly care suite — medication reminders, wellness monitoring, fall detection, and caregiver dashboards.',
    color: '#EC4899',
  },
  {
    icon: <Zap size={28} />,
    title: 'AI-Powered Intelligence',
    description: 'While Google Family Link shows you a map, KVL Track tells you what matters: late arrival predictions, routine change alerts, health risk flags, and driving safety coaching.',
    color: '#D4A853',
  },
  {
    icon: <Lock size={28} />,
    title: 'Privacy-First Architecture',
    description: "Google's business model monetizes user data. KVL Track is subscription-only — your family's location data is never shared with advertisers, data brokers, or analytics platforms.",
    color: '#10B981',
  },
];

const FAQS = [
  {
    q: 'Is Google Family Link really free?',
    a: 'Google Family Link is free, but it is primarily a parental control and screen time tool for children, not a family safety platform. It has very limited location features, no SOS system, no driving safety, and no elderly care capabilities. KVL Track provides a genuinely complete safety platform at ₹199/month for the whole family.',
  },
  {
    q: "Can KVL Track track adult family members, not just children?",
    a: "Yes. KVL Track is designed for the whole family — adults, elderly parents, teenagers, and children. Google Family Link only works with children's devices and requires parental approval. KVL Track lets all family members share location by mutual consent.",
  },
  {
    q: 'Why does KVL Track cost money if Google Family Link is free?',
    a: 'When a product is free, you and your data are the product. Google uses Family Link location data as part of its advertising and profiling ecosystem. KVL Track charges a subscription fee precisely so we never need to monetize your family\'s location data. Free forever on the basic plan; paid plans unlock the full safety suite.',
  },
  {
    q: 'Does KVL Track work on both Android and iPhone?',
    a: 'Yes. KVL Track works on Android 8+ and iOS 15+. Unlike Google Family Link, which has very limited iOS support, KVL Track provides full feature parity across both platforms — including Apple Watch integration and iOS-specific features like Live Activities.',
  },
  {
    q: "Will switching from Google Family Link affect my child's device controls?",
    a: "KVL Track is a location sharing and safety app, not a device management tool. If you rely on Google Family Link for app controls and screen time limits, you can use both apps simultaneously. KVL Track adds safety intelligence on top of whatever parental controls you already have in place.",
  },
];

const TESTIMONIALS = [
  {
    name: 'Meera Krishnan',
    role: 'Mother of three, Hyderabad',
    quote: "We used Google Family Link for two years. It showed location — that was it. KVL Track gave us school alerts, my mother-in-law's medication reminders, and my husband's driving report all in one place. There's genuinely no comparison.",
    rating: 5,
    avatar: 'MK',
    color: '#EC4899',
  },
  {
    name: 'Deepak Agarwal',
    role: 'Father, Pune',
    quote: "Google Family Link stopped working properly when my son turned 13 and got an adult account. KVL Track works for everyone — my wife, my parents, my college-age daughter. One app for the whole family.",
    rating: 5,
    avatar: 'DA',
    color: '#4B80F0',
  },
  {
    name: 'Lakshmi Iyer',
    role: 'Daughter, caring for elderly parent, Chennai',
    quote: "Google doesn't have elderly care. Full stop. My father's medication reminders and inactivity alerts alone made KVL Track worth it. It actually helps me take care of him even when I'm at work.",
    rating: 5,
    avatar: 'LI',
    color: '#10B981',
  },
];

function CellIcon({ val }: { val: 'yes' | 'no' | 'partial' }) {
  if (val === 'yes') return <CheckCircle size={18} color="#10B981" strokeWidth={2.5} />;
  if (val === 'no') return <XCircle size={18} color="#EF4444" strokeWidth={2.5} />;
  return <Minus size={18} color="#F59E0B" strokeWidth={2.5} />;
}

export default function CompareGoogleFamilyPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, background: 'var(--bg)', minHeight: '100vh' }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section style={{ position: 'relative', overflow: 'hidden', padding: '96px 0 80px', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{
              position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
              width: 700, height: 700, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }} />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212,168,83,0.12)', border: '1px solid rgba(212,168,83,0.25)', borderRadius: 999, padding: '6px 14px', marginBottom: 24 }}>
                <Globe size={14} color="#D4A853" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#D4A853', fontFamily: "'Inter', sans-serif" }}>Detailed Comparison</span>
              </div>
              <h1 style={{ fontSize: 52, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 24, lineHeight: 1.12 }}>
                KVL Track vs{' '}
                <span style={{ color: '#4285F4' }}>Google Family Link</span>
              </h1>
              <p style={{ fontSize: 20, color: 'var(--text-secondary)', maxWidth: 620, margin: '0 auto 40px', fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
                Google Family Link is a free screen-time tool. KVL Track is a complete Family Safety Operating System. Here is exactly how they differ.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.a
                  href="#comparison"
                  whileHover={{ scale: 1.04, y: -1 }}
                  className="btn-gold"
                  style={{ padding: '14px 28px', borderRadius: 999, fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}
                >
                  See Full Comparison
                  <ChevronRight size={16} />
                </motion.a>
                <Link href="/pricing" style={{ padding: '14px 28px', borderRadius: 999, fontSize: 15, fontWeight: 600, border: '1px solid var(--border)', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: 'var(--bg-surface)', fontFamily: "'Inter', sans-serif" }}>
                  View Pricing
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Comparison Table ─────────────────────────────────────────────── */}
        <Section id="comparison" bg="var(--bg-surface)">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 12 }}>
                Feature-by-Feature Comparison
              </h2>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>
                Every feature that matters to family safety, side by side.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)' }}>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
                background: 'var(--bg)', padding: '16px 24px',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>FEATURE</div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: 13, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: 'linear-gradient(135deg, #D4A853, #B8720A)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>KVL TRACK</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#4285F4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>GOOGLE</div>
              </div>
              {COMPARISON_ROWS.map((row, i) => (
                <div
                  key={row.feature}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
                    padding: '16px 24px',
                    background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg)',
                    borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{row.feature}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <CellIcon val={row.gravity as 'yes' | 'no' | 'partial'} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>{row.gravityNote}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <CellIcon val={row.google as 'yes' | 'no' | 'partial'} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>{row.googleNote}</span>
                  </div>
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 24, marginTop: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { icon: <CheckCircle size={14} color="#10B981" />, label: 'Fully supported' },
                { icon: <Minus size={14} color="#F59E0B" />, label: 'Partially supported' },
                { icon: <XCircle size={14} color="#EF4444" />, label: 'Not available' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {l.icon}
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{l.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </Section>

        {/* ── Why KVL Track ──────────────────────────────────────────────────── */}
        <Section bg="var(--bg)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontSize: 38, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 16 }}>
                Why Indian Families Choose KVL Track Over Google Family Link
              </h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {DIFFERENTIATORS.map(d => (
                <motion.div
                  key={d.title}
                  variants={fadeUp}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px' }}
                  whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: `${d.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: d.color }}>
                    {d.icon}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{d.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif", margin: 0 }}>{d.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Testimonials ─────────────────────────────────────────────────── */}
        <Section bg="var(--bg-surface)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 12 }}>
                Families Who Made the Switch
              </h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {TESTIMONIALS.map(t => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px' }}
                >
                  <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={14} fill="#D4A853" stroke="none" />)}
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

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <Section bg="var(--bg)">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 12 }}>
                Frequently Asked Questions
              </h2>
            </motion.div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FAQS.map((faq, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px' }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{faq.q}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>{faq.a}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <Section bg="var(--bg-surface)">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" style={{ textAlign: 'center' }}>
            <motion.div variants={fadeUp}>
              <h2 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 20 }}>
                Ready to Upgrade From Google Family Link?
              </h2>
              <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 36, fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
                Free plan available. No credit card required. Works alongside Google Family Link if needed.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.a
                  href="#download"
                  whileHover={{ scale: 1.04, y: -1 }}
                  className="btn-gold"
                  style={{ padding: '16px 32px', borderRadius: 999, fontSize: 16, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}
                >
                  Download KVL Track Free
                  <ChevronRight size={18} />
                </motion.a>
                <Link href="/compare/life360" style={{ padding: '16px 32px', borderRadius: 999, fontSize: 16, fontWeight: 600, border: '1px solid var(--border)', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: 'var(--bg)', fontFamily: "'Inter', sans-serif" }}>
                  Compare vs Life360
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
