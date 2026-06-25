'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  Activity,
  Bell,
  Heart,
  Users,
  Shield,
  Clock,
  Star,
  ChevronRight,
  CheckCircle,
  AlertCircle,
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
    icon: <Activity size={24} />,
    title: 'Fall Detection',
    description: 'KVL Track detects sudden falls using the phone accelerometer and gyroscope. An SOS countdown activates — if your parent does not dismiss it in 30 seconds, all caregivers are alerted automatically.',
    color: '#EF4444',
  },
  {
    icon: <Heart size={24} />,
    title: 'Wellness Monitoring',
    description: 'Daily wellness check-ins prompt your parent to confirm how they are feeling. Skipped check-ins trigger caregiver alerts. Wellness scores trend over time for health pattern insights.',
    color: '#EC4899',
  },
  {
    icon: <Bell size={24} />,
    title: 'Medication Reminders',
    description: 'Set up medication schedules with names, dosages, and times. Your parent receives gentle phone notifications. Missed doses are logged and flagged to the caregiver dashboard.',
    color: '#F59E0B',
  },
  {
    icon: <Users size={24} />,
    title: 'Caregiver Dashboard',
    description: 'Up to 8 caregivers — adult children, neighbours, doctors — can monitor the same senior. Each caregiver sees location, wellness score, medication adherence, and recent activity.',
    color: '#4B80F0',
  },
  {
    icon: <Shield size={24} />,
    title: 'Wellness Score',
    description: "A single daily score (0–100) summarising your parent's activity level, check-in history, sleep pattern, and medication adherence. Track trends weekly and monthly.",
    color: '#10B981',
  },
  {
    icon: <AlertCircle size={24} />,
    title: 'Emergency Escalation',
    description: 'When fall detection or SOS triggers, KVL Track escalates through all designated emergency contacts in order — until someone responds. No alert is ever left unacknowledged.',
    color: '#8B5CF6',
  },
]

const STATS = [
  { value: '500K+', label: 'Seniors Monitored', color: '#EC4899' },
  { value: '98.4%', label: 'Fall Detection Accuracy', color: '#EF4444' },
  { value: '8', label: 'Caregivers Per Senior', color: '#4B80F0' },
  { value: '4.2 min', label: 'Average Emergency Response', color: '#10B981' },
]

const FAQS = [
  {
    q: 'What is the best elderly monitoring app?',
    a: "KVL Track is widely considered the most comprehensive elderly monitoring app for families in India and globally. It combines fall detection, medication reminders, wellness check-ins, caregiver dashboards, GPS location tracking, and SOS alerts — all accessible from a single app shared by multiple adult children. Unlike purpose-built senior trackers that require expensive hardware, KVL Track works on any Android smartphone your parent already owns.",
  },
  {
    q: 'How does fall detection work?',
    a: "KVL Track's fall detection uses the phone's accelerometer, gyroscope, and barometer to identify sudden impact events followed by inactivity — the signature motion pattern of a fall. When detected, a 30-second countdown notification appears on your parent's screen. If they do not dismiss it (indicating they are incapacitated), all caregivers receive an immediate SOS alert with GPS coordinates and an audio clip of the surrounding environment.",
  },
  {
    q: 'Does my parent need a smartphone?',
    a: "Yes, KVL Track requires a smartphone — Android (any model from 2018 onwards running Android 8+) or iPhone (iPhone 8 or newer). We have intentionally designed the senior-facing app to be as simple as possible — a single large button for check-ins, clear medication reminders, and an accessible SOS button. Basic digital literacy is sufficient; no technical knowledge is needed.",
  },
  {
    q: 'Can multiple caregivers monitor the same person?',
    a: "Yes. KVL Track supports up to 8 designated caregivers for a single senior account. Each caregiver installs the KVL Track app and is invited to the senior's monitoring circle. All caregivers share the same real-time view — location, wellness score, medication log, and recent activity. Emergency alerts are sent to all caregivers simultaneously, and the escalation system contacts them in sequence until someone acknowledges the alert.",
  },
  {
    q: 'What happens when a fall is detected?',
    a: "When fall detection activates: (1) A 30-second countdown notification appears on your parent's phone — they can dismiss it if they are fine. (2) If not dismissed, all registered caregivers receive an immediate push notification with GPS location. (3) Audio recording starts from the phone's microphone and is shared with caregivers via the app. (4) If no caregiver acknowledges within 5 minutes, KVL Track escalates to the next contact in the sequence. (5) Depending on your plan, 112/emergency services can also be automatically contacted.",
  },
]

export default function ElderlyMonitoringAppPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen" style={{ background: 'var(--bg)' }}>

        {/* Hero */}
        <section ref={heroRef} style={{ padding: '120px 24px 96px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 0%, rgba(236,72,153,0.06) 0%, transparent 60%)' }} />
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} style={{ marginBottom: 20 }}>
              <span style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)', color: '#EC4899', borderRadius: 999, padding: '6px 18px', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Senior Safety App — 500K+ Seniors Monitored
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 24 }}>
              Give Your Parents{' '}
              <span style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Freedom & Safety
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }} style={{ fontSize: 'clamp(1rem, 2.2vw, 1.2rem)', lineHeight: 1.75, color: 'var(--text-secondary)', maxWidth: 680, margin: '0 auto 40px', fontFamily: "'Inter', sans-serif" }}>
              Fall detection, wellness monitoring, medication reminders, and a caregiver dashboard — so your elderly parents can live independently while you stay connected and informed.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
              <Link href="/pricing" style={{ background: '#EC4899', color: '#fff', padding: '15px 34px', borderRadius: 999, fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 28px rgba(236,72,153,0.35)', fontFamily: "'Inter', sans-serif" }}>
                Start Monitoring Free <ChevronRight size={18} />
              </Link>
              <Link href="/elderly-care" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', padding: '15px 34px', borderRadius: 999, fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Inter', sans-serif" }}>
                Elderly Care Features
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={heroInView ? { opacity: 1 } : {}} transition={{ delay: 0.55 }} style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
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
                Complete Senior Care in One App
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                Six layers of protection designed specifically for elderly family members living independently.
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

        {/* Why KVL Track */}
        <Section bg="var(--bg)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
              <motion.div variants={fadeUp}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, lineHeight: 1.2 }}>
                  Why Families Choose KVL Track for Senior Care
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 28 }}>
                  Most elderly care devices require expensive hardware purchases. KVL Track works on the Android phone your parent already has — no new device, no SIM card, no monthly hardware subscription.
                </p>
                {[
                  'Works on any Android phone your parent already owns',
                  'No expensive hardware or dedicated SIM required',
                  'Up to 8 family members can co-monitor simultaneously',
                  'Simple, large-text UI designed for seniors',
                  'Hindi, Tamil, Telugu, and 12 other Indian language support',
                ].map(point => (
                  <div key={point} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                    <CheckCircle size={18} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{point}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp}>
                {/* Testimonial from Rohan Mehta */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: 24, border: '1px solid rgba(236,72,153,0.2)', padding: 32 }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="#D4A853" stroke="none" />)}
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 24, fontStyle: 'italic' }}>
                    &ldquo;My father lives alone in a different city. I was calling him four times a day just to confirm he was okay. Since KVL Track, I can see his wellness score every morning, check that he took his blood pressure medicine, and know immediately if he falls. I call him now to chat, not out of anxiety. That change in our relationship alone is worth everything.&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>RM</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Rohan Mehta</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'var(--text-muted)' }}>Software engineer, Bengaluru — father in Jaipur</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section bg="var(--bg-surface)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
                Common Questions About Senior Monitoring
              </h2>
            </motion.div>
            <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FAQS.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{faq.q}</span>
                    <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, transform: openFaq === i ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {openFaq === i && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'rgba(236,72,153,0.03)', border: '1px solid rgba(236,72,153,0.12)', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '18px 22px' }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>{faq.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #110616 0%, #1c0b2e 100%)', padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 660, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
              <Clock size={32} style={{ color: '#EC4899' }} />
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16 }}>
              Give Your Parents Independence. Give Yourself Peace.
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(255,255,255,0.6)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.75 }}>
              Works on any Android your parent already owns. Free to start. Takes 10 minutes to set up. Caregiver access for up to 8 family members included free.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/pricing" style={{ background: '#EC4899', color: '#fff', padding: '15px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 28px rgba(236,72,153,0.3)', fontFamily: "'Inter', sans-serif" }}>
                Start Senior Monitoring <ChevronRight size={18} />
              </Link>
              <Link href="/elderly-care" style={{ background: 'transparent', color: '#fff', padding: '15px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.2)', fontFamily: "'Inter', sans-serif" }}>
                Learn More
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
