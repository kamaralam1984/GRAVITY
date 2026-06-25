'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  Car,
  Smartphone,
  AlertTriangle,
  BarChart2,
  Shield,
  Clock,
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
    icon: <Car size={24} />,
    title: 'Real-Time Speed Monitor',
    description: 'See your teen\'s exact driving speed on a live map. Set speed thresholds — receive an instant alert the moment they exceed 80 km/h, 100 km/h, or any custom limit you set.',
    color: '#EF4444',
  },
  {
    icon: <Smartphone size={24} />,
    title: 'Phone Usage Detection',
    description: 'KVL Track detects when your teen\'s phone screen is unlocked during a moving trip — indicating texting or social media while driving. Instant parent alert, no app access required by the teen.',
    color: '#F59E0B',
  },
  {
    icon: <AlertTriangle size={24} />,
    title: 'Harsh Braking Alert',
    description: 'Sudden deceleration events are detected in real time and flagged in the trip report. Patterns of harsh braking indicate aggressive driving styles that increase accident risk.',
    color: '#8B5CF6',
  },
  {
    icon: <BarChart2 size={24} />,
    title: 'Trip Reports',
    description: 'Every drive generates a detailed trip report: start/end location, total distance, top speed, average speed, harsh braking events, rapid acceleration incidents, and phone usage moments.',
    color: '#4B80F0',
  },
  {
    icon: <Shield size={24} />,
    title: 'Driving Safety Score',
    description: 'A 0–100 safety score is calculated for each trip and tracked over time. The score factors in speed, braking, acceleration, phone use, and time of day. Share with your teen to encourage improvement.',
    color: '#10B981',
  },
  {
    icon: <Clock size={24} />,
    title: 'Curfew Alerts',
    description: "Set a driving curfew — for example, no driving after 10 PM. If your teen's car is detected moving after the curfew time, you receive an immediate push notification.",
    color: '#06B6D4',
  },
]

const FAQS = [
  {
    q: 'Can I see how fast my teen is driving?',
    a: "Yes. KVL Track shows your teen's real-time speed on a live map whenever they are driving. You can also set custom speed alert thresholds — for example, receive an alert if they exceed 80 km/h in urban areas or 110 km/h on highways. Speed is displayed in the parent app in real time and included in every post-trip report.",
  },
  {
    q: 'Does the app detect phone use while driving?',
    a: "Yes. KVL Track detects when the phone screen is unlocked during a detected driving session (speed > 20 km/h). This is a strong proxy for phone-in-hand usage including texting, scrolling social media, or changing music without using a hands-free interface. Each detected incident is flagged in the trip report with the time and location. The teen's app does not receive any notification — only the parent app is alerted.",
  },
  {
    q: 'What is a teen driving safety score?',
    a: "The KVL Track driving safety score (0–100) is calculated per trip using five weighted factors: (1) Speed compliance — percentage of drive within set limits. (2) Harsh braking — number and severity of sudden stops. (3) Rapid acceleration — aggressive starts. (4) Phone usage — screen unlocks while moving. (5) Night driving — driving after 10 PM adds extra risk weighting. Scores trend over weeks so you can track improvement or regression.",
  },
  {
    q: 'Can teens turn off monitoring?',
    a: "Teens cannot disable the monitoring features from within the KVL Track app — only the parent account holder can modify monitoring settings. The teen can see that monitoring is active (we believe in transparency, not secret surveillance), but cannot turn it off. If the teen's phone is powered off during a drive, a notification is sent to the parent account indicating the phone went offline during a previously detected driving session.",
  },
  {
    q: 'What age is appropriate for teen driver monitoring?',
    a: "Teen driver monitoring is appropriate from the moment a new driver starts supervised practice — typically age 16-18 in India (learner's licence stage). Many families find driver monitoring most valuable in the first 12-18 months of independent driving, when crash risk is statistically highest. After a year of clean driving scores, many parents reduce monitoring frequency as a reward for demonstrated responsibility.",
  },
]

export default function TeenDriverMonitoringPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen" style={{ background: 'var(--bg)' }}>

        {/* Hero */}
        <section ref={heroRef} style={{ padding: '120px 24px 96px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 0%, rgba(var(--gold-rgb),0.06) 0%, transparent 60%)' }} />
          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

              <motion.div initial={{ opacity: 0, x: -40 }} animate={heroInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(var(--gold-rgb),0.1)', border: '1px solid rgba(var(--gold-rgb),0.25)', borderRadius: 999, padding: '6px 14px', marginBottom: 20 }}>
                  <Car size={14} color="var(--gold)" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', fontFamily: "'Inter', sans-serif" }}>Teen Driver Monitoring</span>
                </div>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 24 }}>
                  Your Teen&apos;s First Car.
                  <br />
                  <span style={{ background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Monitored. Protected.
                  </span>
                </h1>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 36, maxWidth: 500 }}>
                  Real-time speed alerts, phone use detection, harsh braking reports, curfew monitoring, and driving safety scores. Know how your teen really drives.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                  <Link href="/pricing" style={{ background: 'var(--gold)', color: '#0a0900', padding: '14px 28px', borderRadius: 999, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 24px rgba(var(--gold-rgb),0.3)', fontFamily: "'Inter', sans-serif" }}>
                    Start Monitoring Free <ChevronRight size={16} />
                  </Link>
                  <Link href="/driving-safety" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', padding: '14px 28px', borderRadius: 999, fontWeight: 600, fontSize: '1rem', textDecoration: 'none', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Inter', sans-serif" }}>
                    Driving Safety Features
                  </Link>
                </div>
                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                  {[
                    { val: '1.2M+', label: 'Teen Drivers Monitored' },
                    { val: '34%', label: 'Fewer Speeding Incidents' },
                    { val: '4.8★', label: 'Parent Rating' },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Teen Driver Dashboard Mock */}
              <motion.div initial={{ opacity: 0, x: 40 }} animate={heroInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}>
                <div style={{ background: 'var(--bg-surface)', borderRadius: 24, border: '1px solid var(--border)', padding: 28, boxShadow: '0 40px 80px rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Teen Driver Dashboard</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#10B981' }}>Live</span>
                    </div>
                  </div>

                  {/* Speed gauge */}
                  <div style={{ background: 'var(--bg)', borderRadius: 16, padding: '16px 20px', marginBottom: 14, border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current Speed</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2.2rem', fontWeight: 900, color: '#EF4444' }}>78</span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'var(--text-muted)' }}>km/h</span>
                      <div style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                        Above 70 limit
                      </div>
                    </div>
                  </div>

                  {/* Safety score */}
                  <div style={{ background: 'var(--bg)', borderRadius: 16, padding: '16px 20px', marginBottom: 14, border: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trip Safety Score</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#F59E0B' }}>72</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 8, background: 'var(--bg-surface2)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: '72%', height: '100%', background: '#F59E0B', borderRadius: 999 }} />
                        </div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Fair — 2 harsh braking events</div>
                      </div>
                    </div>
                  </div>

                  {/* Phone alert */}
                  <div style={{ background: 'rgba(239,68,68,0.05)', borderRadius: 16, padding: '14px 20px', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Smartphone size={15} color="#EF4444" />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#EF4444' }}>Phone detected in use</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'var(--text-muted)' }}>Screen unlocked at 78 km/h — 2:34 PM</div>
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
                Everything Parents Need to Know
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                Six monitoring tools that give you a complete picture of your teen&apos;s driving behaviour.
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
                Why Teen Monitoring Reduces Accidents
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
                Research shows that teen drivers who know their driving is monitored reduce speeding by 34% and harsh braking by 28% within the first 30 days.
              </p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto' }}>
              {[
                { stat: '34%', desc: 'Reduction in speeding incidents', color: '#10B981' },
                { stat: '28%', desc: 'Fewer harsh braking events', color: '#4B80F0' },
                { stat: '61%', desc: 'Less phone use while driving', color: '#F59E0B' },
                { stat: '2x', desc: 'Faster reaction to dangerous patterns', color: '#EF4444' },
              ].map(item => (
                <motion.div key={item.stat} variants={fadeUp} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2.4rem', fontWeight: 900, color: item.color, marginBottom: 8 }}>{item.stat}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* Testimonials */}
        <Section bg="var(--bg-surface)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Parents Who Changed the Conversation About Driving</h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, maxWidth: 860, margin: '0 auto' }}>
              {[
                { quote: 'My 17-year-old son was resistant at first, but when we showed him his safety score improving each week, he became competitive about it. His driving has genuinely transformed.', name: 'Suresh Patel', role: 'Father, Ahmedabad', avatar: 'SP', color: 'var(--gold)' },
                { quote: 'Within two weeks of using KVL Track teen monitoring, the speed alert app told me my daughter had driven over 100 km/h on the expressway twice. We had a conversation I am glad we had.', name: 'Lakshmi Iyer', role: 'Mother, Pune', avatar: 'LI', color: '#EF4444' },
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
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Teen Driver Monitoring FAQs</h2>
            </motion.div>
            <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FAQS.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{faq.q}</span>
                    <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, transform: openFaq === i ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {openFaq === i && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'rgba(var(--gold-rgb),0.03)', border: '1px solid rgba(var(--gold-rgb),0.12)', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '18px 22px' }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>{faq.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #0a0800 0%, #1a1206 100%)', padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(var(--gold-rgb),0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 660, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(var(--gold-rgb),0.12)', border: '1px solid rgba(var(--gold-rgb),0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
              <Car size={32} style={{ color: 'var(--gold)' }} />
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: 16 }}>
              Know How Your Teen Really Drives
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(255,255,255,0.6)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.75 }}>
              Free to start. Driving monitoring activates automatically when speed exceeds 20 km/h. No hardware required.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/pricing" style={{ background: 'var(--gold)', color: '#0a0900', padding: '15px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 28px rgba(var(--gold-rgb),0.3)', fontFamily: "'Inter', sans-serif" }}>
                Monitor Teen Driver Free <ChevronRight size={18} />
              </Link>
              <Link href="/driving-safety" style={{ background: 'transparent', color: '#fff', padding: '15px 36px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.2)', fontFamily: "'Inter', sans-serif" }}>
                Driving Safety Details
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
