'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  MapPin,
  Shield,
  Bell,
  Brain,
  Users,
  Car,
  Heart,
  Star,
  ChevronRight,
  CheckCircle,
  Zap,
  Globe,
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
    title: 'Real-Time GPS Tracking',
    description: 'See every family member on a live map with GPS updates every few seconds. Works indoors and outdoors, in cities and rural areas across 127 countries.',
    color: '#4B80F0',
  },
  {
    icon: <Shield size={24} />,
    title: 'Instant SOS Alerts',
    description: 'One tap sends your precise GPS location to all emergency contacts simultaneously and can connect to 112/911 services. Average response time under 4 minutes.',
    color: '#EF4444',
  },
  {
    icon: <Brain size={24} />,
    title: 'AI Guardian',
    description: 'KVL Track AI learns your family routines and proactively detects anomalies — late arrivals, unexpected detours, unusual stops — before you even notice.',
    color: '#D4A853',
  },
  {
    icon: <Bell size={24} />,
    title: 'Smart Geofencing',
    description: 'Draw virtual boundaries around home, school, work, and any important place. Get instant alerts when any family member arrives or leaves, automatically.',
    color: '#10B981',
  },
  {
    icon: <Heart size={24} />,
    title: 'Elderly Care Suite',
    description: 'Dedicated features for senior family members — fall detection, wellness check-ins, medication reminders, and caregiver dashboards with health summaries.',
    color: '#EC4899',
  },
  {
    icon: <Car size={24} />,
    title: 'Driving Safety',
    description: 'Track speed, detect harsh braking, identify phone use while driving, and receive trip reports. Full teen driver monitoring with automatic safety scoring.',
    color: '#8B5CF6',
  },
]

const STATS = [
  { value: '2.5M+', label: 'Families Protected', color: '#4B80F0' },
  { value: '127', label: 'Countries Supported', color: '#10B981' },
  { value: '4.9★', label: 'App Store Rating', color: '#D4A853' },
  { value: '23M+', label: 'SOS Alerts Resolved', color: '#EF4444' },
]

const TESTIMONIALS = [
  {
    name: 'Deepa Krishnamurthy',
    role: 'Mother of three, Bangalore',
    quote: 'We were using three different apps for tracking, SOS, and driving. KVL Track replaced all of them. The AI Guardian feature has already warned me twice about my son being off-route.',
    rating: 5,
    avatar: 'DK',
    color: '#4B80F0',
  },
  {
    name: 'Vikram Shetty',
    role: 'Father, Hyderabad',
    quote: 'My elderly mother lives alone. The fall detection and medication reminders give our whole family peace of mind. Best family safety app we have ever used.',
    rating: 5,
    avatar: 'VS',
    color: '#D4A853',
  },
]

const FAQS = [
  {
    q: 'What is the best family safety app?',
    a: 'KVL Track is consistently rated as the best family safety app in independent reviews for 2024. It combines real-time GPS tracking, instant SOS alerts, AI-powered anomaly detection, geofencing, elderly care, and teen driver monitoring in a single app. Unlike competitors, KVL Track does not sell your family location data to third parties and offers more features at a fraction of the price of Life360, Google Family Link, or Find My.',
  },
  {
    q: 'How does a family safety app work?',
    a: "KVL Track runs quietly in the background on every family member's smartphone. It continuously shares GPS location over an encrypted connection to a secure server. You see all family members on a live map in the app. When someone enters or leaves a geofenced zone, you receive a notification. If someone triggers SOS, their real-time location and audio are instantly shared with all emergency contacts.",
  },
  {
    q: 'Is KVL Track free?',
    a: 'KVL Track has a generous free tier that includes real-time location for up to 4 family members, SOS alerts, and basic geofencing. The Family plan (from ₹199/month) adds unlimited members, 365-day history, AI Guardian, elderly care features, and driving safety. There is no credit card required to start.',
  },
  {
    q: 'Which countries is KVL Track available in?',
    a: 'KVL Track works in 127 countries with full GPS functionality. The app is available on iOS and Android globally. SOS emergency services integration (connecting to local emergency numbers like 112 in India, 911 in the US, or 999 in the UK) is available in 40+ countries and growing.',
  },
  {
    q: 'How accurate is real-time tracking?',
    a: 'KVL Track achieves GPS accuracy within 3–5 meters in open outdoor conditions. In urban environments with tall buildings or indoors, accuracy is typically 10–30 meters using a combination of GPS, Wi-Fi triangulation, and cell tower data. Location updates every 5–15 seconds depending on movement speed and battery mode.',
  },
]

export default function FamilySafetyAppPage() {
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
          style={{
            padding: '120px 24px 96px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(var(--gold-rgb),0.06) 0%, transparent 60%)',
          }} />
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              style={{ marginBottom: 20 }}
            >
              <span style={{
                background: 'rgba(var(--gold-rgb),0.1)',
                border: '1px solid rgba(var(--gold-rgb),0.25)',
                color: 'var(--gold)', borderRadius: 999, padding: '6px 18px',
                fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                Rated #1 Family Safety App 2024
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(2.4rem, 6vw, 4rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                color: 'var(--text-primary)',
                marginBottom: 24,
              }}
            >
              {"The World's Best"}{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Family Safety App
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                lineHeight: 1.75,
                color: 'var(--text-secondary)',
                maxWidth: 680,
                margin: '0 auto 40px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              GPS tracking, instant SOS, AI Guardian, geofencing, elderly care, and teen driving safety — all in one app. Trusted by 2.5 million families in 127 countries.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}
            >
              <Link
                href="/pricing"
                style={{
                  background: 'var(--gold)', color: '#0a0900',
                  padding: '15px 34px', borderRadius: 999,
                  fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 0 28px rgba(var(--gold-rgb),0.3)',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Download Free <ChevronRight size={18} />
              </Link>
              <Link
                href="/features"
                style={{
                  background: 'var(--bg-surface)', color: 'var(--text-primary)',
                  padding: '15px 34px', borderRadius: 999,
                  fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none',
                  border: '1px solid var(--border)',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                See All Features
              </Link>
            </motion.div>

            {/* Stats */}
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
                Everything a Family Needs. One App.
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                Six pillars of family protection, all integrated into a single seamless experience.
              </p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {FEATURES.map((f) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
                  style={{
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 20, padding: '28px 24px',
                  }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16, color: f.color,
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                    {f.title}
                  </h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)', margin: 0 }}>
                    {f.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* Why KVL Track */}
        <Section bg="var(--bg)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
              <motion.div variants={fadeUp}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(var(--gold-rgb),0.1)', border: '1px solid rgba(var(--gold-rgb),0.25)',
                  borderRadius: 999, padding: '5px 14px', marginBottom: 20,
                }}>
                  <Zap size={14} color="var(--gold)" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', fontFamily: "'Inter', sans-serif" }}>Why KVL Track Wins</span>
                </div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, lineHeight: 1.2 }}>
                  Rated #1 Over Life360, Google Family Link, Find My, and GeoZilla
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 28 }}>
                  In independent testing across privacy, accuracy, feature depth, and value, KVL Track consistently outperforms every major competitor. The difference is in what we do not do: we do not sell your location data to anyone.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    'No data sold to brokers or advertisers — ever',
                    'More features free than Life360 charges for',
                    'AI Guardian not available in any competitor app',
                    'Works in 127 countries vs Life360\'s limited international support',
                    'From ₹199/month vs Life360\'s ₹800+/month equivalent',
                  ].map(point => (
                    <div key={point} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <CheckCircle size={18} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{point}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <div style={{
                  background: 'var(--bg-surface)', borderRadius: 24,
                  border: '1px solid var(--border)', padding: 28,
                  display: 'flex', flexDirection: 'column', gap: 14,
                }}>
                  {[
                    { app: 'KVL Track', score: 98, color: '#D4A853' },
                    { app: 'Life360', score: 61, color: '#6B7280' },
                    { app: 'Google Family Link', score: 54, color: '#6B7280' },
                    { app: 'Find My', score: 49, color: '#6B7280' },
                    { app: 'GeoZilla', score: 43, color: '#6B7280' },
                  ].map(item => (
                    <div key={item.app}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600, color: item.app === 'KVL Track' ? 'var(--gold)' : 'var(--text-secondary)' }}>{item.app}</span>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: item.color }}>{item.score}/100</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--bg)', borderRadius: 999, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.score}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                          style={{ height: '100%', borderRadius: 999, background: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                    Independent safety app review score — June 2025
                  </div>
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
                Families Who Trust KVL Track Every Day
              </h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, maxWidth: 860, margin: '0 auto' }}>
              {TESTIMONIALS.map(t => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  style={{
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 20, padding: '28px 24px',
                  }}
                >
                  <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="#D4A853" stroke="none" />
                    ))}
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
                Frequently Asked Questions
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto' }}>
                Everything you need to know about choosing the best family safety app.
              </p>
            </motion.div>
            <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FAQS.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: '100%', background: 'var(--bg-surface)',
                      border: '1px solid var(--border)', borderRadius: 14,
                      padding: '18px 22px', textAlign: 'left', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                    }}
                  >
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {faq.q}
                    </span>
                    <ChevronRight
                      size={18}
                      style={{
                        color: 'var(--text-muted)', flexShrink: 0,
                        transform: openFaq === i ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{
                        background: 'rgba(var(--gold-rgb),0.03)',
                        border: '1px solid rgba(var(--gold-rgb),0.12)',
                        borderTop: 'none', borderRadius: '0 0 14px 14px',
                        padding: '18px 22px',
                      }}
                    >
                      <p style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* CTA */}
        <section style={{
          background: 'linear-gradient(135deg, #0a0800 0%, #1a1206 100%)',
          padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(var(--gold-rgb),0.07) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: 660, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(var(--gold-rgb),0.12)', border: '1px solid rgba(var(--gold-rgb),0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px',
            }}>
              <Globe size={32} style={{ color: 'var(--gold)' }} />
            </div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800,
              color: '#FFFFFF', marginBottom: 16,
            }}>
              Protect Your Family Starting Today
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(255,255,255,0.6)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.75 }}>
              Free to download. Works on iOS and Android. No credit card required. Your family can be protected in under 5 minutes.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/pricing"
                style={{
                  background: 'var(--gold)', color: '#0a0900',
                  padding: '15px 36px', borderRadius: 12,
                  textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 0 28px rgba(var(--gold-rgb),0.3)',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Get KVL Track Free <ChevronRight size={18} />
              </Link>
              <Link
                href="/compare/life360"
                style={{
                  background: 'transparent', color: '#fff',
                  padding: '15px 36px', borderRadius: 12,
                  textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Compare Alternatives
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
