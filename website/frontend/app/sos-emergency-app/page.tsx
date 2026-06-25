'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  AlertTriangle,
  MapPin,
  Users,
  Phone,
  Mic,
  History,
  Star,
  ChevronRight,
  CheckCircle,
  Zap,
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
    icon: <AlertTriangle size={24} />,
    title: 'One-Tap SOS',
    description: 'A single press and hold on the SOS button — accessible from lock screen, widget, or inside the app — triggers an immediate emergency sequence. No unlocking, no navigating menus.',
    color: '#EF4444',
  },
  {
    icon: <MapPin size={24} />,
    title: 'Live GPS Sharing',
    description: 'Your precise GPS location is captured the instant SOS is triggered. A live tracking link is sent to all emergency contacts — they can follow your exact position in real time.',
    color: '#4B80F0',
  },
  {
    icon: <Users size={24} />,
    title: 'Emergency Contacts Alert',
    description: 'Up to 10 emergency contacts receive simultaneous push notifications, SMS, and in-app alerts — ensuring someone always responds, no matter where you are.',
    color: '#10B981',
  },
  {
    icon: <Phone size={24} />,
    title: '112/911 Integration',
    description: 'With one additional confirmation tap, KVL Track can automatically dial emergency services (112 in India, 999 in UK, 911 in USA) and share your GPS coordinates with the call.',
    color: '#8B5CF6',
  },
  {
    icon: <Mic size={24} />,
    title: 'Audio Recording',
    description: 'When SOS is activated, KVL Track silently begins recording ambient audio from your microphone. The recording is securely stored and shared with emergency contacts for situational awareness.',
    color: '#F59E0B',
  },
  {
    icon: <History size={24} />,
    title: 'Location History',
    description: 'After an SOS event, your complete location trail leading up to the trigger is preserved — helping responders and investigators reconstruct exactly where you were and how you got there.',
    color: '#06B6D4',
  },
]

const FAQS = [
  {
    q: 'How does KVL Track SOS work?',
    a: 'KVL Track SOS is triggered by pressing and holding the red SOS button for 2 seconds — accessible from a lock screen widget, the app home screen, or a dedicated hardware button shortcut. The trigger captures your GPS coordinates, starts audio recording, and simultaneously sends push notifications, SMS messages, and in-app alerts to all your designated emergency contacts. Each contact receives a live tracking link that shows your real-time location.',
  },
  {
    q: 'What happens when I press SOS?',
    a: "Within 3 seconds of triggering SOS: (1) GPS location is captured and shared. (2) All emergency contacts receive push notifications and SMS. (3) A live tracking link is activated. (4) Audio recording begins. (5) An SOS alert log is created with timestamp and location. If no contact responds within 5 minutes, KVL Track can auto-escalate to emergency services if you have enabled that option in settings.",
  },
  {
    q: 'Can I test the SOS without alerting contacts?',
    a: 'Yes. KVL Track has a dedicated Practice Mode in settings. In Practice Mode, triggering SOS goes through the full UI sequence — countdown, confirmation screen, alert screen — but no actual alerts are sent to contacts or emergency services. We encourage all users to practice at least once so the sequence feels familiar in a real emergency.',
  },
  {
    q: 'Does SOS work without internet?',
    a: 'If mobile data is unavailable, KVL Track automatically falls back to SMS for emergency contact alerts. The SMS includes your last known GPS coordinates and a plain-text message. While the live tracking link will not update without data, your contacts still receive your location at the time of the SOS trigger. For areas with no signal at all, we recommend pairing KVL Track with a KVL Business Solutions Titan wearable which has its own emergency satellite connectivity.',
  },
  {
    q: 'How many contacts can receive SOS alerts?',
    a: 'KVL Track free plan supports up to 3 emergency contacts. The Family plan supports up to 10 contacts. The Family Plus plan supports unlimited contacts with custom escalation sequences — for example, first alert to spouse, then parents, then friends, then a security service — with acknowledgment-based escalation.',
  },
]

export default function SOSEmergencyAppPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen" style={{ background: 'var(--bg)' }}>

        {/* Hero */}
        <section ref={heroRef} style={{ padding: '120px 24px 96px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.07) 0%, transparent 60%)' }} />
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} style={{ marginBottom: 20 }}>
              <span style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', borderRadius: 999, padding: '6px 18px', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                23M+ SOS Alerts Resolved — Avg Response 4.2 min
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2.8rem, 7vw, 4.8rem)', fontWeight: 900, lineHeight: 1.05, color: 'var(--text-primary)', marginBottom: 24 }}>
              One Tap.{' '}
              <span style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Life Saved.
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }} style={{ fontSize: 'clamp(1rem, 2.2vw, 1.2rem)', lineHeight: 1.75, color: 'var(--text-secondary)', maxWidth: 660, margin: '0 auto 48px', fontFamily: "'Inter', sans-serif" }}>
              The fastest SOS emergency app on the market. One press sends your live GPS location to emergency contacts, starts audio recording, and can connect to emergency services — all within seconds.
            </motion.p>

            {/* Animated SOS button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: 56 }}
            >
              <div style={{ position: 'relative', width: 140, height: 140 }}>
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: 'rgba(239,68,68,0.2)' }}
                />
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                  style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: 'rgba(239,68,68,0.25)' }}
                />
                <div style={{ width: 140, height: 140, borderRadius: '50%', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px rgba(239,68,68,0.5)', border: '3px solid rgba(255,255,255,0.15)' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.05em' }}>SOS</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={heroInView ? { opacity: 1 } : {}} transition={{ delay: 0.6 }} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
              <Link href="/pricing" style={{ background: '#EF4444', color: '#fff', padding: '15px 34px', borderRadius: 999, fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 28px rgba(239,68,68,0.4)', fontFamily: "'Inter', sans-serif" }}>
                Download SOS App Free <ChevronRight size={18} />
              </Link>
              <Link href="/sos-emergency" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', padding: '15px 34px', borderRadius: 999, fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Inter', sans-serif" }}>
                SOS Features Deep Dive
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={heroInView ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}>
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 14, padding: '16px 28px', display: 'inline-flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  { value: '23M+', label: 'SOS Alerts Resolved' },
                  { value: '4.2 min', label: 'Average Response Time' },
                  { value: '127', label: 'Countries Active' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#EF4444', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <Section bg="var(--bg-surface)" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
                Everything That Happens in the First 30 Seconds
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                Six simultaneous actions the moment you press SOS — designed to maximise response speed.
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
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
                Why KVL Track Beats Every Other Emergency App
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
                Most SOS apps only send a text message. KVL Track activates a full emergency response system.
              </p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
              {[
                { title: 'Faster than calling', detail: 'No unlock, no dialling. SOS from lock screen in 2 seconds flat.', icon: <Zap size={20} />, color: '#F59E0B' },
                { title: 'Live tracking link', detail: 'Real-time GPS link sent to contacts — not just a one-time coordinate.', icon: <MapPin size={20} />, color: '#4B80F0' },
                { title: 'SMS fallback', detail: 'Works even without mobile data via automatic SMS fallback.', icon: <Phone size={20} />, color: '#10B981' },
                { title: 'Audio evidence', detail: 'Silent audio recording provides situational context for responders.', icon: <Mic size={20} />, color: '#8B5CF6' },
              ].map(item => (
                <motion.div key={item.title} variants={fadeUp} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '24px 20px', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: item.color }}>{item.icon}</div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, lineHeight: 1.65, color: 'var(--text-secondary)', margin: 0 }}>{item.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* Testimonials */}
        <Section bg="var(--bg-surface)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
                Real Stories. Real Responses.
              </h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, maxWidth: 860, margin: '0 auto' }}>
              {[
                {
                  quote: 'I had a panic attack alone in a parking lot. I pressed SOS and my husband received my location within seconds. He was there in 8 minutes. I did not have to say a single word.',
                  name: 'Meera Subramaniam', role: 'Marketing professional, Chennai', avatar: 'MS', color: '#EF4444',
                },
                {
                  quote: 'My 70-year-old mother fell in the bathroom. The fall detection on KVL Track triggered SOS automatically before she could even reach her phone. The response was immediate.',
                  name: 'Karthik Nair', role: 'Doctor, Kochi', avatar: 'KN', color: '#4B80F0',
                },
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
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>SOS App FAQs</h2>
            </motion.div>
            <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FAQS.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{faq.q}</span>
                    <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, transform: openFaq === i ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {openFaq === i && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.12)', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '18px 22px' }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>{faq.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #150303 0%, #2a0808 100%)', padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 660, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16 }}>
              Don&apos;t Wait for an Emergency to Download SOS
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(255,255,255,0.6)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.75 }}>
              Free to download. Takes 2 minutes to set up emergency contacts. Could make the difference when every second counts.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/pricing" style={{ background: '#EF4444', color: '#fff', padding: '15px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 28px rgba(239,68,68,0.4)', fontFamily: "'Inter', sans-serif" }}>
                Download SOS App <ChevronRight size={18} />
              </Link>
              <Link href="/sos-emergency" style={{ background: 'transparent', color: '#fff', padding: '15px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.2)', fontFamily: "'Inter', sans-serif" }}>
                See How It Works
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
