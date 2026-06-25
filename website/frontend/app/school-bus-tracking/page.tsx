'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  MapPin,
  Clock,
  Route,
  Shield,
  Bell,
  AlertTriangle,
  Star,
  ChevronRight,
  CheckCircle,
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
    icon: <MapPin size={24} />,
    title: 'Live Bus GPS',
    description: "See the school bus's precise real-time location on a map — updated every 10 seconds. Know exactly which street it's on, not just a vague 'en route' status.",
    color: '#4B80F0',
  },
  {
    icon: <Clock size={24} />,
    title: 'ETA Countdown',
    description: "A live countdown to your child's bus stop arrival based on current GPS position, route, and traffic. Accurate to within 2 minutes on 94% of trips.",
    color: '#10B981',
  },
  {
    icon: <Route size={24} />,
    title: 'Route Visualisation',
    description: "See the full planned bus route on the map — stops, sequence, and estimated timing at each stop. Understand exactly where the bus should be and when.",
    color: '#8B5CF6',
  },
  {
    icon: <Shield size={24} />,
    title: 'Driver ID Verification',
    description: "Each bus is linked to a verified driver profile. Unfamiliar drivers — substitutes, route changes — are automatically flagged and parents are notified.",
    color: '#F59E0B',
  },
  {
    icon: <Bell size={24} />,
    title: 'Arrival Alert',
    description: 'Receive a push notification 5 minutes before the bus reaches your child\'s stop. Step outside at the right time — no more anxious watching from the window.',
    color: '#EC4899',
  },
  {
    icon: <AlertTriangle size={24} />,
    title: 'Delay Notifications',
    description: 'When the bus is running late — traffic, breakdown, route change — an automatic delay alert is sent to all registered parents with the updated ETA.',
    color: '#EF4444',
  },
]

const FAQS = [
  {
    q: 'How does school bus tracking work?',
    a: 'KVL Track school bus tracking works through a GPS device installed in the bus (provided and managed by the school or transport operator). This device transmits the bus location every 10 seconds to KVL Track servers. Parents with a KVL Track account linked to the school see the live bus position on a map in their app. No action is required from the bus driver or your child — the tracking is automatic.',
  },
  {
    q: 'Do I need to install anything on the bus?',
    a: 'Your school or bus operator needs to install a KVL Track-compatible GPS tracker in the bus. KVL Track provides the hardware (KVL Business Solutions Titan GPS unit) to schools at a subsidised rate through our school partnership programme. If your school is not yet part of the programme, contact us — we can onboard new schools within 5 business days. Parents do not install anything on the bus.',
  },
  {
    q: 'Can I see the bus route on a map?',
    a: "Yes. The KVL Track app shows the full planned route for your child's bus — all stops in sequence with estimated arrival times at each stop. You can see where the bus is on that route in real time, and the app highlights your child's specific stop and shows the live ETA. You can also replay the previous day's route to verify the bus followed the expected path.",
  },
  {
    q: 'What if the bus is late?',
    a: 'When the bus is running more than 5 minutes behind its scheduled arrival at your stop, KVL Track automatically sends a delay alert with the updated ETA. If the delay exceeds 15 minutes, a second alert is sent. If the bus GPS signal is lost (bus powered off, GPS jamming, tunnel), parents are also notified that tracking is unavailable so they know to contact the school directly.',
  },
  {
    q: 'Is it accurate in real-time?',
    a: "KVL Track school bus tracking updates GPS position every 10 seconds with accuracy within 3-5 meters in open areas. Bus ETA predictions are accurate within 2 minutes on 94% of trips. In areas with poor GPS reception (dense urban canyons, underground car parks), the system supplements GPS with cell tower data maintaining accuracy within 30-50 meters.",
  },
]

export default function SchoolBusTrackingPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen" style={{ background: 'var(--bg)' }}>

        {/* Hero */}
        <section ref={heroRef} style={{ padding: '120px 24px 96px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 60%)' }} />
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} style={{ marginBottom: 20 }}>
              <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', borderRadius: 999, padding: '6px 18px', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                School Bus Tracking — 2,400+ Schools | 45,000+ Buses
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 24 }}>
              Know Exactly When{' '}
              <span style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                The Bus Arrives
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }} style={{ fontSize: 'clamp(1rem, 2.2vw, 1.2rem)', lineHeight: 1.75, color: 'var(--text-secondary)', maxWidth: 680, margin: '0 auto 40px', fontFamily: "'Inter', sans-serif" }}>
              Real-time school bus GPS tracking, live ETA countdown, driver verification, and arrival alerts — so you step outside at exactly the right moment, every time.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
              <Link href="/pricing" style={{ background: '#10B981', color: '#fff', padding: '15px 34px', borderRadius: 999, fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 28px rgba(16,185,129,0.35)', fontFamily: "'Inter', sans-serif" }}>
                Track My Child&apos;s Bus <ChevronRight size={18} />
              </Link>
              <Link href="/integrations" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', padding: '15px 34px', borderRadius: 999, fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Inter', sans-serif" }}>
                School Partnership Info
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={heroInView ? { opacity: 1 } : {}} transition={{ delay: 0.55 }} style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { value: '2,400+', label: 'Schools Active', color: '#10B981' },
                { value: '45,000+', label: 'Buses Tracked', color: '#4B80F0' },
                { value: '98%', label: 'ETA Alert Accuracy', color: '#D4A853' },
                { value: '< 10s', label: 'GPS Update Interval', color: '#8B5CF6' },
              ].map(s => (
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
                Complete School Bus Visibility
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                Six features covering everything from live position to delay alerts and driver verification.
              </p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {FEATURES.map(f => (
                <motion.div key={f.title} variants={fadeUp} whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: f.color }}>{f.icon}</div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)', margin: 0 }}>{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* Bus mock UI */}
        <Section bg="var(--bg)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
              <motion.div variants={fadeUp}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, lineHeight: 1.2 }}>
                  From First Stop to Your Door — Fully Tracked
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 28 }}>
                  KVL Track school bus tracking eliminates the anxiety of waiting at the gate. Know the bus is on its way, how far it is, and exactly when it will arrive at your stop.
                </p>
                {[
                  'Works on any parent smartphone — iOS or Android',
                  'No setup at the bus stop or on your child\'s phone required',
                  'Alerts sent via push notification and SMS fallback',
                  'School admin dashboard included for transport coordinators',
                  'Covers all buses in the fleet with one school subscription',
                ].map(point => (
                  <div key={point} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                    <CheckCircle size={18} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{point}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp}>
                <div style={{ background: 'var(--bg-surface)', borderRadius: 24, border: '1px solid var(--border)', padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Bus #247 — Route B</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#10B981' }}>Live GPS</span>
                    </div>
                  </div>

                  {/* ETA card */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: '20px 22px', marginBottom: 16, textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#10B981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Arriving at Your Stop In</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '3rem', fontWeight: 900, color: '#10B981', lineHeight: 1 }}>7</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>minutes — 3:18 PM estimated</div>
                  </div>

                  {/* Route stops */}
                  {[
                    { stop: 'School Gate', time: '2:50', done: true },
                    { stop: 'MG Road Stop', time: '3:04', done: true },
                    { stop: 'Koramangala Circle', time: '3:12', done: true },
                    { stop: 'Your Stop — 5th Block', time: '3:18', done: false, active: true },
                    { stop: 'BTM Layout', time: '3:25', done: false },
                  ].map((stop, i) => (
                    <div key={stop.stop} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 4 ? 10 : 0 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: stop.done ? '#10B981' : stop.active ? '#F59E0B' : 'var(--border)', flexShrink: 0, border: stop.active ? '2px solid #F59E0B' : 'none', boxShadow: stop.active ? '0 0 8px rgba(245,158,11,0.4)' : 'none' }} />
                      <div style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 13, color: stop.active ? 'var(--text-primary)' : stop.done ? 'var(--text-muted)' : 'var(--text-secondary)', fontWeight: stop.active ? 700 : 400 }}>{stop.stop}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: stop.done ? '#10B981' : stop.active ? '#F59E0B' : 'var(--text-muted)' }}>{stop.time}</div>
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
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Schools and Parents Who Use KVL Track</h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, maxWidth: 860, margin: '0 auto' }}>
              {[
                { quote: 'Before KVL Track, I was standing at the gate for 20-30 minutes every afternoon not knowing when the bus would arrive. Now I get a 5-minute alert and walk out exactly on time.', name: 'Nandini Rao', role: 'Parent, Bengaluru', avatar: 'NR', color: '#10B981' },
                { quote: "Our school has 22 buses and 1,800 students. Parent complaints about bus delays dropped by 70% in the first term after we deployed KVL Track. The transparency changes everything.", name: 'Principal D. Krishnan', role: 'School Principal, Chennai', avatar: 'DK', color: '#4B80F0' },
              ].map(t => (
                <motion.div key={t.name} variants={fadeUp} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px' }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#D4A853" stroke="none" />)}
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 20, fontStyle: 'italic' }}>&ldquo;{t.quote}&rdquo;</p>
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
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>School Bus Tracking FAQs</h2>
            </motion.div>
            <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FAQS.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{faq.q}</span>
                    <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, transform: openFaq === i ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {openFaq === i && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.12)', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '18px 22px' }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>{faq.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #020f0a 0%, #061a12 100%)', padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 660, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16 }}>
              Is Your School on KVL Track?
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(255,255,255,0.6)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.75 }}>
              If your school already uses KVL Track, download the parent app and link your account free. If not, invite your school to join 2,400+ schools on the KVL Track network.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/pricing" style={{ background: '#10B981', color: '#fff', padding: '15px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 28px rgba(16,185,129,0.3)', fontFamily: "'Inter', sans-serif" }}>
                Start Bus Tracking <ChevronRight size={18} />
              </Link>
              <Link href="/contact" style={{ background: 'transparent', color: '#fff', padding: '15px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.2)', fontFamily: "'Inter', sans-serif" }}>
                Invite My School
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
