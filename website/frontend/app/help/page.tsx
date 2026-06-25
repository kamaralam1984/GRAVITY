'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  Search,
  BookOpen,
  Settings,
  MapPin,
  Siren,
  Shield,
  CreditCard,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  MessageCircle,
  Lightbulb,
} from 'lucide-react'

const categories = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'Install KVL Track, set up your circle, and get everyone connected.',
    count: 12,
    color: 'var(--primary)',
    colorRgb: 'var(--primary-rgb)',
  },
  {
    icon: Settings,
    title: 'Account & Settings',
    description: 'Manage your profile, notifications, and preferences.',
    count: 8,
    color: 'var(--gold)',
    colorRgb: 'var(--gold-rgb)',
  },
  {
    icon: MapPin,
    title: 'Location & Tracking',
    description: 'Understand how tracking works, geofences, and location history.',
    count: 15,
    color: '#9B6BF5',
    colorRgb: '155,107,245',
  },
  {
    icon: Siren,
    title: 'Emergency Features',
    description: 'SOS alerts, emergency contacts, and crisis response.',
    count: 6,
    color: 'var(--sos)',
    colorRgb: '220,38,38',
  },
  {
    icon: Shield,
    title: 'Privacy & Safety',
    description: 'Ghost Mode, data controls, and who can see what.',
    count: 10,
    color: 'var(--safe)',
    colorRgb: '4,120,87',
  },
  {
    icon: CreditCard,
    title: 'Billing & Plans',
    description: 'Subscriptions, upgrades, invoices, and cancellations.',
    count: 9,
    color: '#C2572A',
    colorRgb: '194,87,42',
  },
]

const popularArticles = [
  { title: 'How to invite family members to your circle', slug: '#invite' },
  { title: 'Why is my location not updating?', slug: '#location-not-updating' },
  { title: 'How to set up a geofence zone', slug: '#geofence' },
  { title: 'Turning on Emergency SOS', slug: '#sos' },
  { title: 'Changing your location sharing settings', slug: '#location-settings' },
  { title: 'How to enable Ghost Mode', slug: '#ghost-mode' },
  { title: 'Understanding battery alert notifications', slug: '#battery-alerts' },
  { title: 'Upgrading or downgrading your plan', slug: '#upgrade-plan' },
]

const faqs = [
  {
    q: `How does KVL Track's location tracking actually work?`,
    a: `KVL Track uses your phone's built-in GPS combined with Wi-Fi triangulation and cell tower data to determine location. The app sends encrypted location updates to KVL Track's servers at adaptive intervals — more frequently when you're moving, less often when you're stationary. All data is end-to-end encrypted in transit and at rest, and only your approved circle members can view your location. Battery impact is minimized through smart polling algorithms.`,
  },
  {
    q: 'Will KVL Track drain my phone battery significantly?',
    a: `KVL Track is engineered to minimize battery usage. We use adaptive location polling — when you're stationary, location checks slow to every 10–15 minutes; when you're actively moving, they increase to every 2–3 minutes. In real-world testing, most users see less than 3–5% additional daily battery drain. If you're experiencing heavy drain, ensure you have the latest app version and check that no other apps are conflicting with background permissions.`,
  },
  {
    q: 'Is my location visible to anyone outside my circle?',
    a: 'No. Your location is only shared with people inside your personal KVL Track circle — people you have explicitly invited and who have accepted your invitation. KVL Track never shares location data with advertisers, third-party apps, or any entity outside your circle. Our servers store your location data encrypted, and our privacy policy strictly prohibits selling or licensing location data to external parties. You are always in full control.',
  },
  {
    q: 'How many members can I have in my KVL Track circle?',
    a: 'On the free plan, you can have up to 5 members in a single circle. The Premium plan allows up to 10 members, and the Family plan supports unlimited members across multiple circles. This means you can have a main family circle, a separate circle for elderly parents, and another for your children — all managed from one account. Circles are independent, and members only see others in circles they have been added to.',
  },
  {
    q: 'Can I use KVL Track on multiple devices?',
    a: `Each KVL Track account is tied to one primary device at a time. If you get a new phone, simply log into your account on the new device — your circles and settings transfer automatically. You can be a member of multiple circles across different accounts. For example, a parent can be in their children's circle and also a member of a circle managed by their own parents, all from a single account on one device.`,
  },
  {
    q: 'How long does KVL Track store my location history?',
    a: 'Free plan users get 24 hours of location history. Premium users get 7 days, and Family plan users get up to 30 days of detailed location history. You can clear your location history at any time from Settings > Privacy > Clear Location History. When you delete your account, all associated location data is permanently purged from our servers within 30 days in accordance with our data retention policy and applicable Indian data protection laws.',
  },
  {
    q: 'Can I share my KVL Track account with someone?',
    a: `Account sharing is not supported or recommended, as each account represents one individual's location identity. However, you can invite as many family members as your plan allows — each gets their own account but joins your shared circle. This is important for accuracy and safety: if two people share an account, emergency SOS and location alerts would be ambiguous. Instead, invite each family member so everyone has their own profile in the circle.`,
  },
  {
    q: 'How do I cancel my KVL Track subscription?',
    a: `You can cancel your subscription at any time from inside the app or through the App Store / Google Play subscription management page. Go to Settings > Subscription > Cancel Plan. Your Premium features remain active until the end of the current billing cycle — you will not be charged again after cancellation. Your account and circles are preserved on the free tier. No cancellation fees, no long-term commitments. We also offer a full refund within 7 days of any new paid subscription if you're not satisfied.`,
  },
]

export default function HelpPage() {
  const heroRef = useRef(null)
  const catRef = useRef(null)
  const faqRef = useRef(null)

  const heroInView = useInView(heroRef, { once: true })
  const catInView = useInView(catRef, { once: true })
  const faqInView = useInView(faqRef, { once: true })

  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>

        {/* Hero + Search */}
        <section
          ref={heroRef}
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            padding: '100px 24px 80px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: 14,
                  marginBottom: 32,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <ArrowLeft size={16} />
                Back to Home
              </Link>

              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: 'rgba(var(--primary-rgb), 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <Lightbulb size={30} style={{ color: 'var(--primary)' }} />
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(36px, 5.5vw, 56px)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.15,
                  marginBottom: 14,
                }}
              >
                How can we{' '}
                <span className="gradient-text-gold">help?</span>
              </h1>
              <p
                style={{
                  fontSize: 17,
                  color: 'var(--text-muted)',
                  marginBottom: 36,
                  lineHeight: 1.65,
                }}
              >
                Search our knowledge base, browse help categories, or connect with our support team.
                We`re here to make sure KVL Track works perfectly for your family.`
              </p>

              {/* Search Input */}
              <div
                style={{
                  position: 'relative',
                  maxWidth: 520,
                  margin: '0 auto',
                }}
              >
                <Search
                  size={20}
                  style={{
                    position: 'absolute',
                    left: 18,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder='Search — "How do I add a geofence?"'
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1.5px solid var(--border-strong)',
                    borderRadius: 14,
                    padding: '15px 20px 15px 52px',
                    fontSize: 15,
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    boxShadow: 'var(--shadow-card)',
                  }}
                />
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 14 }}>
                Popular: Ghost Mode, SOS setup, family invite, geofence, battery drain
              </p>
            </motion.div>
          </div>
        </section>

        {/* Help Categories */}
        <section
          ref={catRef}
          style={{ padding: '80px 24px', background: 'var(--bg)' }}
        >
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={catInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 26,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                }}
              >
                Browse by Category
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 36 }}>
                Find guides organized by topic — from your first setup to advanced privacy controls.
              </p>
            </motion.div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 16,
              }}
            >
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={catInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: '24px 22px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `rgba(${cat.colorRgb}, 0.1)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <cat.icon size={22} style={{ color: cat.color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {cat.title}
                    </h3>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: cat.color,
                        background: `rgba(${cat.colorRgb}, 0.1)`,
                        borderRadius: 20,
                        padding: '3px 9px',
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      {cat.count} articles
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {cat.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section style={{ padding: '80px 24px', background: 'var(--bg-surface2)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>

              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 24,
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: 8,
                  }}
                >
                  Popular Articles
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                  Quick answers to what families ask most.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {popularArticles.map((article, i) => (
                    <motion.a
                      key={article.slug}
                      href={article.slug}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '13px 16px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        fontSize: 14,
                        fontWeight: 500,
                        transition: 'border-color 0.2s, background 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--primary)'
                        e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.04)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.background = 'var(--bg-surface)'
                      }}
                    >
                      <span>{article.title}</span>
                      <ChevronRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Quick Stats / Support Panel */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 24,
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: 8,
                  }}
                >
                  Still Need Help?
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                  Our support team is standing by to help you.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Articles Published', value: '60+', color: 'var(--primary)' },
                    { label: 'Avg. Resolution Time', value: '< 4 hrs', color: 'var(--safe)' },
                    { label: 'Customer Satisfaction', value: '98.2%', color: 'var(--gold)' },
                    { label: 'Support Languages', value: 'EN, HI, MR, TA', color: '#9B6BF5' },
                  ].map(stat => (
                    <div
                      key={stat.label}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{stat.label}</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: stat.color }}>{stat.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 24 }}>
                  <Link
                    href="/contact"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      background: 'var(--primary)',
                      color: '#fff',
                      borderRadius: 12,
                      padding: '14px 24px',
                      fontWeight: 700,
                      fontSize: 15,
                      textDecoration: 'none',
                      boxShadow: '0 4px 20px rgba(var(--primary-rgb), 0.3)',
                    }}
                  >
                    <MessageCircle size={18} />
                    Contact Support Team
                  </Link>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                    Mon–Sat 9AM–8PM IST · Sun 10AM–5PM IST
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section
          ref={faqRef}
          style={{ padding: '80px 24px', background: 'var(--bg)' }}
        >
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={faqInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                Frequently Asked Questions
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, textAlign: 'center', marginBottom: 48 }}>
                Deep answers to the questions families ask us most often. Click to expand.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {faqs.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={faqInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: i * 0.07, duration: 0.5 }}
                    style={{
                      background: 'var(--bg-surface)',
                      border: `1px solid ${openFaq === i ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 14,
                      overflow: 'hidden',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        gap: 16,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: openFaq === i ? 'var(--primary)' : 'var(--text-primary)',
                          lineHeight: 1.4,
                        }}
                      >
                        {faq.q}
                      </span>
                      <ChevronDown
                        size={18}
                        style={{
                          color: 'var(--text-muted)',
                          flexShrink: 0,
                          transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.25s',
                        }}
                      />
                    </button>

                    {openFaq === i && (
                      <div style={{ padding: '0 24px 22px' }}>
                        <div
                          style={{
                            height: 1,
                            background: 'var(--border)',
                            marginBottom: 18,
                          }}
                        />
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.75 }}>
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section
          style={{
            padding: '80px 24px',
            background: 'var(--bg-surface2)',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: 12,
                }}
              >
                Couldn`t Find What You Need?`
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32, lineHeight: 1.65 }}>
                Our support team responds in under 4 hours during business hours. We speak English,
                Hindi, Marathi, and Tamil — reach out any way that works for you.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/contact"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: 10,
                    padding: '13px 28px',
                    fontSize: 15,
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 20px rgba(var(--primary-rgb), 0.3)',
                  }}
                >
                  <MessageCircle size={17} />
                  Contact Support
                </Link>
                <a
                  href="mailto:support@trackalways.com"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 10,
                    padding: '13px 28px',
                    fontSize: 15,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  support@trackalways.com
                </a>
              </div>
              <div style={{ marginTop: 36 }}>
                <Link
                  href="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: 14,
                  }}
                >
                  <ArrowLeft size={15} />
                  Return to KVL Track Home
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
