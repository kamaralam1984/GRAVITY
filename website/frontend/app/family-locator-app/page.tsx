'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  MapPin,
  Clock,
  History,
  Battery,
  Zap,
  Globe,
  Star,
  ChevronRight,
  CheckCircle,
  Navigation,
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
    title: 'Real-Time Family Map',
    description: 'All family members on a single live map. See who is at home, who is commuting, who is at school — updated in real time, automatically, without anyone needing to check in.',
    color: '#4B80F0',
  },
  {
    icon: <Zap size={24} />,
    title: '3-Metre GPS Accuracy',
    description: 'Gravity uses multi-constellation GPS (GPS, GLONASS, Galileo) for industry-leading accuracy within 3 metres outdoors. In cities, Wi-Fi triangulation supplements GPS for indoor precision.',
    color: '#10B981',
  },
  {
    icon: <History size={24} />,
    title: 'Location History',
    description: 'Replay any family member\'s movements for any day in the past year. Street-level accuracy on playback. Useful for verifying routes, understanding patterns, or reviewing a past journey.',
    color: '#8B5CF6',
  },
  {
    icon: <Battery size={24} />,
    title: 'Battery Level',
    description: "See every family member's battery percentage in real time on the family map. Low battery alerts warn you before someone goes offline — before the anxiety of a silent phone starts.",
    color: '#F59E0B',
  },
  {
    icon: <Navigation size={24} />,
    title: 'Speed Indicator',
    description: 'See current travel speed for each family member. Know at a glance whether they are walking, driving, or stationary — without calling to ask.',
    color: '#EF4444',
  },
  {
    icon: <Clock size={24} />,
    title: 'Last Seen Time',
    description: "If a family member's phone goes offline, Gravity shows their last known location with timestamp — so you always have some information, even when tracking is unavailable.",
    color: '#06B6D4',
  },
]

const FAMILY_PINS = [
  { name: 'Mum', status: 'Home', color: '#10B981', x: '25%', y: '45%', battery: 87 },
  { name: 'Dad', status: 'Driving', color: '#4B80F0', x: '62%', y: '28%', battery: 52 },
  { name: 'Arjun', status: 'School', color: '#D4A853', x: '48%', y: '62%', battery: 91 },
  { name: 'Nisha', status: 'Mall', color: '#EC4899', x: '78%', y: '52%', battery: 34 },
]

const FAQS = [
  {
    q: 'How accurate is Gravity family locator?',
    a: 'Gravity achieves GPS accuracy within 3 metres in open outdoor conditions. This is among the best accuracy available in any consumer GPS app. In dense urban environments or indoors, the system supplements GPS with Wi-Fi network triangulation, typically achieving 10-30 metres accuracy. Location updates every 5-15 seconds depending on movement speed — faster when moving, slower when stationary to conserve battery.',
  },
  {
    q: 'Can I see location without them knowing?',
    a: "Gravity does not support secret or covert tracking. Every family member can see who in the circle can view their location and can verify the app is running. This is by design — we believe family safety should be built on transparency and trust, not surveillance. Family members can activate Privacy Hours or Ghost Mode to temporarily pause sharing when they need personal time.",
  },
  {
    q: 'Does it work internationally?',
    a: 'Yes. Gravity family locator works in 127 countries with no additional setup. GPS works globally, and the app automatically uses local Wi-Fi and cell networks for supplemental accuracy. International roaming data usage is optimised to minimise costs — Gravity uses compressed location packets designed to work within typical roaming data allowances.',
  },
  {
    q: 'How often is location updated?',
    a: 'Location updates dynamically based on movement: when a family member is moving at speed (driving, cycling), updates occur every 5-8 seconds. When walking, every 10-15 seconds. When stationary, every 30-60 seconds to conserve battery. You can increase frequency to real-time (every 3-5 seconds) for any member from the app settings, with a slight increase in battery usage.',
  },
  {
    q: "What if someone turns off their phone?",
    a: "When a family member's phone is powered off, Gravity shows their last known location with a timestamp indicating when tracking was last active. You receive a notification that their device has gone offline. If you have set battery alerts, you receive advance warning when their battery drops below 20% so you can check in before they go dark.",
  },
]

export default function FamilyLocatorAppPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen" style={{ background: 'var(--bg)' }}>

        {/* Hero */}
        <section ref={heroRef} style={{ padding: '120px 24px 96px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 0%, rgba(75,128,240,0.07) 0%, transparent 60%)' }} />
          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

              <motion.div initial={{ opacity: 0, x: -40 }} animate={heroInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(75,128,240,0.1)', border: '1px solid rgba(75,128,240,0.25)', borderRadius: 999, padding: '6px 14px', marginBottom: 20 }}>
                  <MapPin size={14} color="#4B80F0" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#4B80F0', fontFamily: "'Inter', sans-serif" }}>3-Metre GPS Accuracy • 127 Countries</span>
                </div>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 24 }}>
                  Find Anyone in Your Family{' '}
                  <span style={{ background: 'linear-gradient(135deg, #4B80F0 0%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Instantly
                  </span>
                </h1>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 36, maxWidth: 500 }}>
                  Real-time family map with 3-metre GPS accuracy. See location, battery level, speed, and last seen time for every family member — all on one screen.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                  <Link href="/pricing" style={{ background: '#4B80F0', color: '#fff', padding: '14px 28px', borderRadius: 999, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 24px rgba(75,128,240,0.35)', fontFamily: "'Inter', sans-serif" }}>
                    Find My Family Free <ChevronRight size={16} />
                  </Link>
                  <Link href="/family-tracking" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', padding: '14px 28px', borderRadius: 999, fontWeight: 600, fontSize: '1rem', textDecoration: 'none', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Inter', sans-serif" }}>
                    See Tracking Features
                  </Link>
                </div>
                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                  {[{ val: '2.5M+', label: 'Families Using Locator' }, { val: '127', label: 'Countries' }, { val: '3m', label: 'GPS Accuracy' }].map(s => (
                    <div key={s.label}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4B80F0', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Map mock */}
              <motion.div initial={{ opacity: 0, x: 40 }} animate={heroInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}>
                <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(135deg, #0d1b2a 0%, #1a2744 100%)', aspectRatio: '1 / 0.9', boxShadow: '0 40px 100px rgba(0,0,0,0.4)' }}>
                  {/* Grid */}
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(75,128,240,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(75,128,240,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                  {/* Map roads simulation */}
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}>
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#4B80F0" strokeWidth="2" />
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#4B80F0" strokeWidth="2" />
                    <line x1="0" y1="30%" x2="70%" y2="30%" stroke="#4B80F0" strokeWidth="1" />
                    <line x1="30%" y1="0" x2="30%" y2="70%" stroke="#4B80F0" strokeWidth="1" />
                    <line x1="70%" y1="40%" x2="100%" y2="80%" stroke="#4B80F0" strokeWidth="1" />
                  </svg>

                  {/* Family pins */}
                  {FAMILY_PINS.map((m, i) => (
                    <motion.div
                      key={m.name}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.12, type: 'spring', stiffness: 280 }}
                      style={{ position: 'absolute', left: m.x, top: m.y, transform: 'translate(-50%, -100%)' }}
                    >
                      <div style={{ background: m.color, borderRadius: '14px 14px 14px 0', padding: '5px 11px', display: 'flex', alignItems: 'center', gap: 5, boxShadow: `0 4px 16px ${m.color}60`, border: '2px solid rgba(255,255,255,0.15)' }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white', opacity: 0.9 }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'white', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>{m.name}</span>
                      </div>
                      <div style={{ marginTop: 3, background: 'rgba(0,0,0,0.75)', borderRadius: 6, padding: '2px 8px', display: 'flex', gap: 6, justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontFamily: "'Inter', sans-serif" }}>{m.status}</span>
                        <span style={{ fontSize: 9, color: m.battery < 40 ? '#EF4444' : '#10B981', fontFamily: "'Inter', sans-serif" }}>{m.battery}%</span>
                      </div>
                    </motion.div>
                  ))}

                  {/* Top bar */}
                  <div style={{ position: 'absolute', top: 14, left: 14, right: 14, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)', borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Family Map — 4 Members</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                      <span style={{ fontSize: 11, color: '#10B981', fontFamily: "'Inter', sans-serif" }}>Live</span>
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
                More Than Just a Dot on a Map
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                Six layers of location intelligence that turn a simple map into a complete family awareness system.
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

        {/* Testimonials */}
        <Section bg="var(--bg)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Families Who Know Where Everyone Is</h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, maxWidth: 860, margin: '0 auto' }}>
              {[
                { quote: "We have four kids in three different schools and my husband works across the city. The family map in Gravity means I can see in one glance that everyone is where they should be. It changed everything.", name: 'Asha Krishnan', role: 'Mother of four, Mumbai', avatar: 'AK', color: '#4B80F0' },
                { quote: 'My wife and I travel frequently for work. Knowing we can see each other on the map — and that the kids can see where we are — has made our family feel more connected despite the distance.', name: 'Nikhil Joshi', role: 'Consultant, Delhi', avatar: 'NJ', color: '#10B981' },
              ].map(t => (
                <motion.div key={t.name} variants={fadeUp} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px' }}>
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
        <Section bg="var(--bg-surface)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Family Locator App FAQs</h2>
            </motion.div>
            <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FAQS.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{faq.q}</span>
                    <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, transform: openFaq === i ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {openFaq === i && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'rgba(75,128,240,0.03)', border: '1px solid rgba(75,128,240,0.12)', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '18px 22px' }}>
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
              <Globe size={32} style={{ color: '#4B80F0' }} />
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16 }}>
              Your Family. One Map. Always Together.
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(255,255,255,0.6)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.75 }}>
              Free for up to 4 family members. Works in 127 countries. 3-metre accuracy. No credit card required.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/pricing" style={{ background: '#4B80F0', color: '#fff', padding: '15px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 28px rgba(75,128,240,0.35)', fontFamily: "'Inter', sans-serif" }}>
                Start Family Locator Free <ChevronRight size={18} />
              </Link>
              <Link href="/family-tracking" style={{ background: 'transparent', color: '#fff', padding: '15px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.2)', fontFamily: "'Inter', sans-serif" }}>
                See All Features
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
