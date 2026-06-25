'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  MapPin,
  Shield,
  Bell,
  Route,
  Users,
  AlertTriangle,
  History,
  Star,
  ChevronRight,
  CheckCircle,
  Heart,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function Section({ children, bg = 'var(--bg)', id }: { children: React.ReactNode; bg?: string; id?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
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
  )
}

const FEATURES = [
  {
    icon: <Route size={24} />,
    title: 'School Route AI',
    description: "KVL Track AI learns your child's school route and immediately alerts you if they deviate unexpectedly — a detour, an unusual stop, or a route that takes too long.",
    color: '#4B80F0',
  },
  {
    icon: <Bell size={24} />,
    title: 'Geofencing Zones',
    description: 'Set safe zones around school, home, tuition centres, and friends\' houses. Arrive and depart alerts keep you informed without constant check-ins.',
    color: '#10B981',
  },
  {
    icon: <Users size={24} />,
    title: 'Pickup Verification',
    description: 'Know exactly when your child was picked up from school and by whom. Authorized pickup contacts are verified before alerts are cleared.',
    color: '#8B5CF6',
  },
  {
    icon: <Shield size={24} />,
    title: 'SOS Button',
    description: "Your child can press and hold the SOS button in any emergency. Their location, photo, and audio are instantly sent to all family contacts and emergency services.",
    color: '#EF4444',
  },
  {
    icon: <AlertTriangle size={24} />,
    title: 'Stranger Danger Alert',
    description: "If your child's device approaches an unrecognized vehicle or enters an unexpected area during school hours, KVL Track generates an automatic alert.",
    color: '#F59E0B',
  },
  {
    icon: <History size={24} />,
    title: 'Location History',
    description: "Review your child's complete movement timeline for any day — where they went, how long they stayed, and the exact route they took. 365 days of history.",
    color: '#EC4899',
  },
]

const STATS = [
  { value: '8.2M+', label: 'Children Protected Globally', color: '#4B80F0' },
  { value: '3m', label: 'GPS Accuracy', color: '#10B981' },
  { value: '< 3s', label: 'SOS Alert Delivery', color: '#EF4444' },
  { value: '4.9★', label: 'Parent App Rating', color: '#D4A853' },
]

const TESTIMONIALS = [
  {
    name: 'Priya Ramesh',
    role: 'Mother, Chennai',
    quote: 'My 9-year-old started walking home from school alone this year. The school route AI on KVL Track means I know the exact moment he deviates from the expected path. The peace of mind is indescribable.',
    rating: 5,
    avatar: 'PR',
    color: '#4B80F0',
  },
  {
    name: 'Ankit Sharma',
    role: 'Father of two, Delhi',
    quote: 'The pickup verification feature is genius. I can see on my phone when the school bus picked up my daughter and exactly which route it is taking. No more anxious waits.',
    rating: 5,
    avatar: 'AS',
    color: '#10B981',
  },
]

const FAQS = [
  {
    q: 'What is the best child safety app?',
    a: 'KVL Track is rated the best child safety app for 2024 by multiple independent reviewers. It offers school route monitoring with AI anomaly detection, geofencing, SOS with a single button press, pickup verification, and stranger danger alerts — features not available together in any other child safety app. It works on iOS and Android and is trusted by over 8 million children globally.',
  },
  {
    q: 'How do I track my child\'s location?',
    a: 'Download KVL Track on both your phone and your child\'s device. Create a family circle and invite your child by sending them a link via WhatsApp. Once they accept, their location appears on your family map in real time. You can see their current position, movement status, battery level, and receive automatic arrival alerts for home, school, and other saved locations.',
  },
  {
    q: 'Can my child use SOS without my help?',
    a: 'Yes. The KVL Track SOS button is designed to be usable by children as young as 6. A long press on the dedicated SOS button (available as a home screen widget or from the app) triggers an immediate emergency alert. The alert includes real-time GPS location, audio recording from the phone\'s microphone, and a live link sent to all emergency contacts. No internet login is required to trigger SOS.',
  },
  {
    q: 'Does the app work offline?',
    a: 'KVL Track requires a data connection (mobile data or Wi-Fi) to transmit location updates. However, SOS alerts are sent via SMS as a fallback when mobile data is unavailable, ensuring your child can still reach you without an internet connection. Location history is also cached locally and syncs automatically when connectivity is restored.',
  },
  {
    q: 'What age is appropriate for GPS tracking?',
    a: "GPS tracking via a child safety app becomes useful from around age 6-7 when children begin to travel independently (e.g., school bus, walking to a neighbour's house). Most families start with passive tracking (arrival/departure alerts) for younger children and introduce more comprehensive monitoring as children gain more independence. KVL Track's age-appropriate settings let you configure exactly how much transparency the child has about being tracked.",
  },
]

export default function ChildSafetyAppPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen" style={{ background: 'var(--bg)' }}>

        {/* Hero */}
        <section
          ref={heroRef}
          style={{ padding: '120px 24px 96px', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(75,128,240,0.07) 0%, transparent 60%)',
          }} />
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              style={{ marginBottom: 20 }}
            >
              <span style={{
                background: 'rgba(75,128,240,0.1)', border: '1px solid rgba(75,128,240,0.25)',
                color: '#4B80F0', borderRadius: 999, padding: '6px 18px',
                fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                Child Safety App — Trusted by 8.2M+ Families
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(2.4rem, 6vw, 4rem)',
                fontWeight: 800, lineHeight: 1.1,
                color: 'var(--text-primary)', marginBottom: 24,
              }}
            >
              Keep Every Child{' '}
              <span style={{
                background: 'linear-gradient(135deg, #4B80F0 0%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Safe & Protected
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: 'clamp(1rem, 2.2vw, 1.2rem)', lineHeight: 1.75,
                color: 'var(--text-secondary)', maxWidth: 680,
                margin: '0 auto 40px', fontFamily: "'Inter', sans-serif",
              }}
            >
              School route AI, instant SOS, geofencing, pickup verification, and stranger danger alerts. Complete child protection from first steps to first commutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}
            >
              <Link href="/pricing" style={{
                background: '#4B80F0', color: '#fff',
                padding: '15px 34px', borderRadius: 999,
                fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 0 28px rgba(75,128,240,0.35)',
                fontFamily: "'Inter', sans-serif",
              }}>
                Protect My Child Free <ChevronRight size={18} />
              </Link>
              <Link href="/child-safety" style={{
                background: 'var(--bg-surface)', color: 'var(--text-primary)',
                padding: '15px 34px', borderRadius: 999,
                fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none',
                border: '1px solid var(--border)',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: "'Inter', sans-serif",
              }}>
                See Child Safety Features
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.55 }}
              style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}
            >
              {STATS.map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <Section bg="var(--bg-surface)" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
                Six Layers of Child Protection
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                From school routes to SOS, KVL Track builds a protective layer around every child.
              </p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {FEATURES.map(f => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px' }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: f.color }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)', margin: 0 }}>{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* Why KVL Track for children */}
        <Section bg="var(--bg)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
              <motion.div variants={fadeUp}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, lineHeight: 1.2 }}>
                  Built for Children. Trusted by Parents.
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 28 }}>
                  Most family trackers were built for adults and adapted for children as an afterthought. KVL Track built child safety from the ground up — with school-aware AI, kid-friendly SOS interfaces, and features that reflect how children actually live and move.
                </p>
                {[
                  'School-aware AI: knows school hours and routes automatically',
                  'SOS designed for children as young as 6 years old',
                  'Works on low-cost Android devices (₹5,000+)',
                  'Battery-efficient — designed for kids\' phones with smaller batteries',
                  'Privacy-first — your child\'s data is never sold',
                ].map(point => (
                  <div key={point} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                    <CheckCircle size={18} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{point}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp}>
                {/* School route mock */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: 24, border: '1px solid var(--border)', padding: 28 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: '#4B80F0', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Today — Rahul, Age 10
                  </div>
                  {[
                    { time: '07:45', event: 'Left home', icon: '🏠', color: '#4B80F0', note: 'On time' },
                    { time: '08:22', event: 'Arrived at school', icon: '🏫', color: '#10B981', note: 'Safe arrival alert sent' },
                    { time: '14:30', event: 'Left school', icon: '🚶', color: '#F59E0B', note: 'Route monitoring active' },
                    { time: '14:31', event: 'Route deviation detected', icon: '⚠️', color: '#EF4444', note: 'Alert sent to parent' },
                    { time: '14:35', event: 'Rahul confirmed: going to friend', icon: '✅', color: '#10B981', note: 'Resolved' },
                  ].map((item, i, arr) => (
                    <div key={item.time} style={{ display: 'flex', gap: 14, marginBottom: i < arr.length - 1 ? 18 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{item.icon}</div>
                        {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 16, marginTop: 4 }} />}
                      </div>
                      <div style={{ paddingTop: 4 }}>
                        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.event}</div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: item.color, marginTop: 2 }}>{item.note}</div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'var(--text-muted)' }}>{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </Section>

        {/* Testimonials */}
        <Section bg="var(--bg-surface)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
                Parents Who Sleep Better at Night
              </h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, maxWidth: 860, margin: '0 auto' }}>
              {TESTIMONIALS.map(t => (
                <motion.div key={t.name} variants={fadeUp} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px' }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={14} fill="#D4A853" stroke="none" />)}
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 20, fontStyle: 'italic' }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.avatar}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section bg="var(--bg)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
                Questions Parents Ask Most
              </h2>
            </motion.div>
            <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FAQS.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      borderRadius: 14, padding: '18px 22px', textAlign: 'left', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                    }}
                  >
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{faq.q}</span>
                    <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, transform: openFaq === i ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ background: 'rgba(75,128,240,0.03)', border: '1px solid rgba(75,128,240,0.12)', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '18px 22px' }}
                    >
                      <p style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>{faq.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #060d1a 0%, #0e1a35 100%)', padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(75,128,240,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 660, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(75,128,240,0.12)', border: '1px solid rgba(75,128,240,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
              <Heart size={32} style={{ color: '#4B80F0' }} />
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16 }}>
              8.2 Million Children Protected. Yours Can Be Next.
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(255,255,255,0.6)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.75 }}>
              Free to start. No credit card. Works on any Android or iPhone. Set up in under 5 minutes.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/pricing" style={{ background: '#4B80F0', color: '#fff', padding: '15px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 28px rgba(75,128,240,0.35)', fontFamily: "'Inter', sans-serif" }}>
                Start Free Protection <ChevronRight size={18} />
              </Link>
              <Link href="/child-safety" style={{ background: 'transparent', color: '#fff', padding: '15px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.2)', fontFamily: "'Inter', sans-serif" }}>
                Explore Child Safety
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
