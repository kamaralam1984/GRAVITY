'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  Route,
  AlertTriangle,
  Clock,
  Smartphone,
  Users,
  Shield,
  Star,
  ChevronRight,
  CheckCircle,
  Globe,
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
    title: 'Journey Sharing',
    description: 'Before any trip, share a live tracking link with a trusted person. They watch your real-time progress on a map and receive an automatic arrival notification. The link expires when your journey ends.',
    color: '#4B80F0',
  },
  {
    icon: <AlertTriangle size={24} />,
    title: 'One-Tap SOS',
    description: 'Accessible from the lock screen or via a long-press on the side button. Instantly sends your GPS location, starts audio recording, and notifies all trusted contacts simultaneously.',
    color: '#EF4444',
  },
  {
    icon: <Clock size={24} />,
    title: 'Check-In Reminders',
    description: 'Set a check-in timer — for example, 2 hours. If you do not check in by the deadline, trusted contacts automatically receive a welfare alert with your last known location.',
    color: '#10B981',
  },
  {
    icon: <Smartphone size={24} />,
    title: 'Shake-to-SOS',
    description: 'In a situation where you cannot reach the screen? A sharp double-shake of your phone triggers SOS silently — no visible action required, making it suitable for covert emergencies.',
    color: '#8B5CF6',
  },
  {
    icon: <Users size={24} />,
    title: 'Fake Call Feature',
    description: 'Trigger a realistic incoming phone call notification on demand — giving you an excuse to leave an uncomfortable situation safely. Customise the caller name and ringtone.',
    color: '#F59E0B',
  },
  {
    icon: <Shield size={24} />,
    title: 'Trusted Contacts',
    description: 'Up to 10 trusted contacts receive your SOS, journey share, and check-in alerts. Contacts are prioritised in order — the right person is notified first based on your current situation.',
    color: '#06B6D4',
  },
]

const USE_CASES = [
  { icon: '🚶‍♀️', title: 'Solo Night Walks', desc: 'Arrive home safely with live journey tracking active' },
  { icon: '✈️', title: 'Solo Travel', desc: 'International trips with trusted contacts monitoring your route' },
  { icon: '🎓', title: 'Students', desc: 'Campus safety and late-night library sessions covered' },
  { icon: '🌙', title: 'Night Shift Workers', desc: 'Check-in reminders for late-night commutes home' },
  { icon: '🏃‍♀️', title: 'Solo Runs & Hikes', desc: 'Outdoor activities with live tracking and SOS' },
  { icon: '🚕', title: 'Rideshare Journeys', desc: 'Share ride tracking with someone who can verify your route' },
]

const FAQS = [
  {
    q: 'What is the best personal safety app?',
    a: "Gravity is consistently rated the best personal safety app for 2024, particularly for women, solo travellers, students, and night shift workers. Unlike basic panic button apps, Gravity combines journey sharing with live tracking links, check-in deadline monitoring, shake-to-SOS, a fake call feature, and instant SOS that works even via SMS without internet. It is used by over 800,000 solo travellers and individual users globally.",
  },
  {
    q: 'How does Gravity keep solo travellers safe?',
    a: "Gravity creates a digital safety net for solo travellers. Before departure, you share a live journey link with a trusted contact — they watch your real-time progress. You set check-in reminders so someone knows if you stop responding unexpectedly. If you feel unsafe, one press triggers SOS or the fake call feature removes you from an uncomfortable situation. All of this runs on your existing smartphone with no additional hardware needed.",
  },
  {
    q: 'Does Gravity have a fake call feature?',
    a: "Yes. The Gravity fake call feature creates a realistic incoming call notification that looks and sounds identical to a real phone call. You can set it to trigger immediately or after a countdown (e.g., 30 seconds — giving you time to set it up subtly). When it activates, you can 'answer' the call and use it as a natural excuse to leave a situation, change direction, or draw attention to yourself in a public place. The caller name and ringtone are fully customisable.",
  },
  {
    q: 'How do I share my journey with someone?',
    a: "To share a journey: tap the Journey Share button in the Gravity app, set your destination, and select or enter the number of a trusted contact. Gravity sends them a live tracking link via WhatsApp or SMS — they open it on any browser (no app needed) and see your real-time position on a map. When you arrive at your destination, the app detects arrival and sends your contact a notification. The tracking link automatically deactivates after arrival or after your set journey duration expires.",
  },
  {
    q: 'Does it work abroad?',
    a: "Yes. Gravity personal safety app works in 127 countries with full functionality. Journey sharing, SOS alerts, and check-in reminders all work internationally. SMS fallback ensures SOS is delivered even without mobile data. The app automatically adapts to local emergency numbers (112 in Europe, 911 in North America, 999 in UK, 100 in India) when the emergency services integration option is enabled.",
  },
]

export default function PersonalSafetyAppPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen" style={{ background: 'var(--bg)' }}>

        {/* Hero */}
        <section ref={heroRef} style={{ padding: '120px 24px 96px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.07) 0%, transparent 60%)' }} />
          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

              <motion.div initial={{ opacity: 0, x: -40 }} animate={heroInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 999, padding: '6px 14px', marginBottom: 20 }}>
                  <Shield size={14} color="#8B5CF6" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6', fontFamily: "'Inter', sans-serif" }}>Personal Safety App — 127 Countries</span>
                </div>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 24 }}>
                  Go Anywhere.
                  <br />
                  <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Stay Protected.
                  </span>
                </h1>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 36, maxWidth: 500 }}>
                  Journey sharing, SOS alerts, check-in reminders, shake-to-SOS, and a fake call feature. The only personal safety app designed for how you actually live and move.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                  <Link href="/pricing" style={{ background: '#8B5CF6', color: '#fff', padding: '14px 28px', borderRadius: 999, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 24px rgba(139,92,246,0.35)', fontFamily: "'Inter', sans-serif" }}>
                    Download Free <ChevronRight size={16} />
                  </Link>
                  <Link href="/sos-emergency" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', padding: '14px 28px', borderRadius: 999, fontWeight: 600, fontSize: '1rem', textDecoration: 'none', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Inter', sans-serif" }}>
                    SOS Features
                  </Link>
                </div>
                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                  {[{ val: '800K+', label: 'Solo Travellers' }, { val: '127', label: 'Countries' }, { val: '4.9★', label: 'Rating' }].map(s => (
                    <div key={s.label}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8B5CF6', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Personal safety mock phone UI */}
              <motion.div initial={{ opacity: 0, x: 40 }} animate={heroInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}>
                <div style={{ background: 'var(--bg-surface)', borderRadius: 28, border: '1px solid var(--border)', padding: 28, maxWidth: 320, margin: '0 auto', boxShadow: '0 40px 80px rgba(0,0,0,0.2)' }}>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Your Safety Hub</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'var(--text-muted)' }}>Solo travel mode active</div>
                  </div>

                  {/* Journey active */}
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} />
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#10B981' }}>Journey Active</span>
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'var(--text-secondary)' }}>Priya watching your route live</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>ETA: 11:42 PM — 18 min</div>
                  </div>

                  {/* Check-in */}
                  <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#F59E0B', marginBottom: 4 }}>Check-In Due In</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.8rem', fontWeight: 900, color: '#F59E0B' }}>23 min</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: 'var(--text-muted)' }}>Tap to extend or check in</div>
                  </div>

                  {/* Quick actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>🆘</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: '#EF4444' }}>SOS</div>
                    </div>
                    <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>📞</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: '#8B5CF6' }}>Fake Call</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <Section bg="var(--bg-surface)" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
                Six Features That Keep You Safe Alone
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                Designed for the modern reality of solo travel, night shifts, and independent living.
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

        {/* Who uses it */}
        <Section bg="var(--bg)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
                Built for Every Solo Situation
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
                Whether you are commuting late, travelling abroad, or going for an evening run — Gravity creates a safety net around you.
              </p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18, maxWidth: 900, margin: '0 auto' }}>
              {USE_CASES.map(uc => (
                <motion.div key={uc.title} variants={fadeUp} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{uc.icon}</div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{uc.title}</h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{uc.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* Testimonials */}
        <Section bg="var(--bg-surface)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>People Who Go Further Because They Feel Safer</h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, maxWidth: 860, margin: '0 auto' }}>
              {[
                { quote: 'I used to avoid late-night library sessions because the walk home felt unsafe. The journey share feature on Gravity means my mother watches my route live. I study as long as I need to now.', name: 'Sneha Mehta', role: 'Engineering student, Pune', avatar: 'SM', color: '#8B5CF6' },
                { quote: 'I solo-travelled through Southeast Asia for 3 months. The check-in reminder was my safety anchor — my parents knew that if they did not hear from me by the deadline, something was wrong. I never missed a check-in.', name: 'Divya Krishnaswamy', role: 'Solo traveller, Mumbai', avatar: 'DK', color: '#EC4899' },
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
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Personal Safety App FAQs</h2>
            </motion.div>
            <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FAQS.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{faq.q}</span>
                    <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, transform: openFaq === i ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {openFaq === i && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.12)', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '18px 22px' }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>{faq.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #0d0618 0%, #1a0a2e 100%)', padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 660, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
              <Heart size={32} style={{ color: '#8B5CF6' }} />
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16 }}>
              You Deserve to Feel Safe. Anywhere.
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(255,255,255,0.6)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.75 }}>
              Free to download. Works in 127 countries. Journey sharing, check-ins, SOS, and fake call — all free. No credit card required.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/pricing" style={{ background: '#8B5CF6', color: '#fff', padding: '15px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 28px rgba(139,92,246,0.35)', fontFamily: "'Inter', sans-serif" }}>
                Stay Safe Free <ChevronRight size={18} />
              </Link>
              <Link href="/sos-emergency" style={{ background: 'transparent', color: '#fff', padding: '15px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.2)', fontFamily: "'Inter', sans-serif" }}>
                Learn About SOS
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
