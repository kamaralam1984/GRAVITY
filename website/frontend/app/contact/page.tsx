'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FaqItem {
  q: string
  a: string
}

interface FormState {
  name: string
  email: string
  subject: string
  message: string
}

interface ContactCardProps {
  icon: React.ReactNode
  title: string
  detail: string
  note: string
  href?: string
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const FAQ_DATA: FaqItem[] = [
  {
    q: "Is my location data private?",
    a: "Absolutely. KVL Track only shares your location with members of your personal circle that you have explicitly approved. We never sell your data to third parties, advertisers, or analytics platforms. Your privacy is the foundation everything we build stands on.",
  },
  {
    q: "Why isn't my location updating for my family members?",
    a: "This is almost always caused by background app permissions being restricted by the operating system. On iOS, ensure KVL Track has Always On location access in Settings. On Android, disable battery optimisation for KVL Track so the app can post updates in the background without interruption.",
  },
  {
    q: "How do I add someone to my KVL Track circle?",
    a: "Open the app, tap the People icon in the bottom navigation, then tap Invite Member. You can share a direct invite link or enter the person's phone number or email address. They'll receive a request and must accept before location sharing begins between you.",
  },
  {
    q: "Can I pause sharing my location without leaving the circle?",
    a: "Yes. KVL Track's Ghost Mode lets you pause your location visibility for a set duration — 1 hour, 4 hours, or until you manually turn it back on. Other circle members will see that you are currently paused, so there is never any confusion about why your dot isn't moving.",
  },
  {
    q: "What happens to my data if I delete my account?",
    a: "When you delete your KVL Track account, all location history, profile data, and circle associations are permanently removed from our servers within 30 days. You will receive an email confirmation once deletion is complete. The process is irreversible, so please export anything you need first.",
  },
]

const SUBJECT_OPTIONS: string[] = [
  "General Inquiry",
  "Technical Support",
  "Partnership",
  "Press & Media",
  "Feedback",
]

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

// ─── FaqRow component ─────────────────────────────────────────────────────────

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      variants={fadeUp}
      style={{
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '16px',
        }}
      >
        <span
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.5,
          }}
        >
          {item.q}
        </span>
        <span style={{ color: 'var(--gold)', flexShrink: 0 }}>
          {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>

      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
      >
        <p
          style={{
            paddingBottom: '20px',
            color: 'var(--text-secondary)',
            lineHeight: 1.75,
            fontSize: '0.95rem',
            margin: 0,
          }}
        >
          {item.a}
        </p>
      </motion.div>
    </motion.div>
  )
}

// ─── ContactCard component ────────────────────────────────────────────────────

function ContactCard({ icon, title, detail, note, href }: ContactCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(var(--gold-rgb), 0.15)' }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'rgba(var(--gold-rgb), 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--gold)',
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        {title}
      </h3>

      {href ? (
        <a
          href={href}
          style={{
            color: 'var(--gold)',
            fontWeight: 600,
            fontSize: '0.95rem',
            textDecoration: 'none',
          }}
        >
          {detail}
        </a>
      ) : (
        <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.95rem' }}>
          {detail}
        </span>
      )}

      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          margin: 0,
          lineHeight: 1.65,
        }}
      >
        {note}
      </p>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const heroRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLElement>(null)
  const officeRef = useRef<HTMLElement>(null)
  const faqRef = useRef<HTMLElement>(null)

  const heroInView = useInView(heroRef, { once: true, margin: '-80px' })
  const cardsInView = useInView(cardsRef, { once: true, margin: '-80px' })
  const formInView = useInView(formRef, { once: true, margin: '-80px' })
  const officeInView = useInView(officeRef, { once: true, margin: '-80px' })
  const faqInView = useInView(faqRef, { once: true, margin: '-80px' })

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    // Simulated async — no real backend attached
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setForm({ name: '', email: '', subject: 'General Inquiry', message: '' })
    }, 1400)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--bg-surface2)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '6px',
  }

  return (
    <>
      <Navbar />

      <main
        style={{
          background: 'var(--bg)',
          color: 'var(--text-primary)',
          minHeight: '100vh',
          overflowX: 'hidden',
        }}
      >
        {/* ───── Hero ───── */}
        <section
          ref={heroRef}
          style={{
            padding: '120px 24px 80px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Background glow */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '700px',
              height: '340px',
              background:
                'radial-gradient(ellipse, rgba(var(--gold-rgb), 0.07) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <motion.div
            initial="hidden"
            animate={heroInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            style={{ position: 'relative', maxWidth: '740px', margin: '0 auto' }}
          >
            <motion.div variants={fadeUp}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 18px',
                  borderRadius: '100px',
                  background: 'rgba(var(--gold-rgb), 0.1)',
                  border: '1px solid rgba(var(--gold-rgb), 0.25)',
                  color: 'var(--gold)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginBottom: '28px',
                }}
              >
                Get in Touch
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              style={{
                fontSize: 'clamp(2.2rem, 5.5vw, 3.6rem)',
                fontWeight: 800,
                lineHeight: 1.13,
                margin: '0 0 20px',
                letterSpacing: '-0.025em',
              }}
            >
              We'd Love to Hear From You
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{
                fontSize: '1.15rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.78,
                maxWidth: '580px',
                margin: '0 auto 20px',
              }}
            >
              Whether you need help with the app, want to explore a partnership, have a story to
              tell the world, or simply have a question — our team is real, friendly, and ready to
              help. We read every message.
            </motion.p>

            <motion.div
              variants={fadeUp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(var(--safe), 0.08)',
                border: '1px solid rgba(var(--gold-rgb), 0.2)',
                borderRadius: '100px',
                padding: '7px 18px',
                fontSize: '0.85rem',
                color: 'var(--gold)',
                fontWeight: 600,
                marginBottom: '28px',
              }}
            >
              <Clock size={14} />
              Support hours: Mon – Sat 9 AM – 8 PM IST
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                ← Return to KVL Track Home
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* ───── Contact Channel Cards ───── */}
        <section
          ref={cardsRef}
          style={{
            padding: '0 24px 80px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          <motion.div
            initial="hidden"
            animate={cardsInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
              gap: '20px',
            }}
          >
            <ContactCard
              icon={<Mail size={22} />}
              title="Customer Support"
              detail="support@kvlbusinesssolutions.com"
              href="mailto:support@kvlbusinesssolutions.com"
              note="For app issues, account help, billing questions, and general inquiries. We typically reply within 24 to 48 hours on business days."
            />
            <ContactCard
              icon={<MessageSquare size={22} />}
              title="Partnerships"
              detail="partners@kvlbusinesssolutions.com"
              href="mailto:partners@kvlbusinesssolutions.com"
              note="Interested in integrating KVL Track into your platform, exploring co-marketing, or reselling to enterprise clients? We'd love to explore this together."
            />
            <ContactCard
              icon={<Phone size={22} />}
              title="Press & Media"
              detail="press@kvlbusinesssolutions.com"
              href="mailto:press@kvlbusinesssolutions.com"
              note="For journalists, bloggers, and media partners. Interview requests, brand assets, and official statements are all handled here. Response within one business day."
            />
          </motion.div>
        </section>

        {/* ───── Split: Form + Info ───── */}
        <section
          ref={formRef}
          style={{
            padding: '0 24px 100px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          <motion.div
            initial="hidden"
            animate={formInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.45fr)',
              gap: '44px',
              alignItems: 'start',
            }}
          >
            {/* ── Left info panel ── */}
            <motion.div
              variants={fadeUp}
              style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.65rem',
                    fontWeight: 800,
                    marginBottom: '14px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Send Us a Message
                </h2>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    lineHeight: 1.78,
                    fontSize: '0.95rem',
                  }}
                >
                  Fill out the form and a member of our team will get back to you as soon as
                  possible. We read every message carefully and take all feedback seriously —
                  your experience with KVL Track shapes the product.
                </p>
              </div>

              {/* Support hours card */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={18} style={{ color: 'var(--gold)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Support Hours (IST)</span>
                </div>

                {[
                  { day: 'Monday – Saturday', hours: '9:00 AM – 8:00 PM' },
                  { day: 'Sunday', hours: '10:00 AM – 5:00 PM' },
                ].map((row) => (
                  <div
                    key={row.day}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {row.day}
                    </span>
                    <span
                      style={{
                        color: 'var(--safe)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.hours}
                    </span>
                  </div>
                ))}

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Outside of these hours, you can still submit a message and we will respond first
                  thing the next business morning.
                </p>
              </div>

              {/* Quick links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Helpful Links
                </span>
                {[
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Help Centre', href: '/help' },
                  { label: 'App Status Page', href: '/status' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ color: 'var(--gold)', fontSize: '0.65rem' }}>▸</span>
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* ── Right: Contact form ── */}
            <motion.div variants={fadeUp}>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  padding: '36px 32px',
                }}
              >
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      textAlign: 'center',
                      padding: '48px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '18px',
                    }}
                  >
                    <div
                      style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: '50%',
                        background: 'rgba(var(--gold-rgb), 0.14)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gold)',
                        fontSize: '2rem',
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </div>
                    <h3
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        margin: 0,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      Message Sent!
                    </h3>
                    <p
                      style={{
                        color: 'var(--text-secondary)',
                        lineHeight: 1.75,
                        maxWidth: '360px',
                        margin: 0,
                        fontSize: '0.95rem',
                      }}
                    >
                      Thank you for reaching out. Our team will review your message and respond
                      within 24 to 48 hours. Keep an eye on your inbox!
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      style={{
                        marginTop: '6px',
                        padding: '10px 24px',
                        background: 'rgba(var(--gold-rgb), 0.1)',
                        border: '1px solid rgba(var(--gold-rgb), 0.3)',
                        borderRadius: '10px',
                        color: 'var(--gold)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          margin: '0 0 6px',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        Contact Form
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                        All fields are required. We respect your privacy completely.
                      </p>
                    </div>

                    {/* Name + Email row */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px',
                      }}
                    >
                      <div>
                        <label htmlFor="contact-name" style={labelStyle}>
                          Full Name
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          required
                          placeholder="Priya Sharma"
                          value={form.name}
                          onChange={handleChange}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" style={labelStyle}>
                          Email Address
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          required
                          placeholder="priya@example.com"
                          value={form.email}
                          onChange={handleChange}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Subject dropdown */}
                    <div>
                      <label htmlFor="contact-subject" style={labelStyle}>
                        Subject
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          id="contact-subject"
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          style={{
                            ...inputStyle,
                            appearance: 'none',
                            paddingRight: '42px',
                            cursor: 'pointer',
                          }}
                        >
                          {SUBJECT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          style={{
                            position: 'absolute',
                            right: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)',
                            pointerEvents: 'none',
                          }}
                        />
                      </div>
                    </div>

                    {/* Message textarea */}
                    <div>
                      <label htmlFor="contact-message" style={labelStyle}>
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={6}
                        placeholder="Tell us what's on your mind. The more detail you give, the faster we can help."
                        value={form.message}
                        onChange={handleChange}
                        style={{
                          ...inputStyle,
                          resize: 'vertical',
                          minHeight: '140px',
                        }}
                      />
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '14px 28px',
                        background: submitting ? 'rgba(var(--gold-rgb), 0.45)' : 'var(--gold)',
                        color: '#0a0a0a',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        letterSpacing: '0.01em',
                        transition: 'opacity 0.2s, transform 0.15s',
                      }}
                    >
                      <Send size={18} />
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>

                    <p
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        margin: 0,
                        textAlign: 'center',
                      }}
                    >
                      Your information is never sold or shared with third parties.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ───── Office Locations ───── */}
        <section
          ref={officeRef}
          style={{
            padding: '80px 24px',
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <motion.div
            initial="hidden"
            animate={officeInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            style={{ maxWidth: '1100px', margin: '0 auto' }}
          >
            <motion.div
              variants={fadeUp}
              style={{ textAlign: 'center', marginBottom: '52px' }}
            >
              <h2
                style={{
                  fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  marginBottom: '14px',
                }}
              >
                Our Offices
              </h2>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '1rem',
                  maxWidth: '520px',
                  margin: '0 auto',
                  lineHeight: 1.75,
                }}
              >
                KVL Track is proudly built in India. Our teams across Mumbai and Bangalore collaborate
                daily to deliver a product that families across the country trust.
              </p>
            </motion.div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >
              {/* Mumbai HQ */}
              <motion.div
                variants={fadeUp}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: '20px',
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, var(--gold), transparent)',
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '11px',
                      background: 'rgba(var(--gold-rgb), 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold)',
                    }}
                  >
                    <MapPin size={19} />
                  </div>
                  <div>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        color: 'var(--gold)',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        marginBottom: '2px',
                      }}
                    >
                      Headquarters
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                      Mumbai, Maharashtra
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  4th Floor, Lotus Business Park
                  <br />
                  Andheri East, Mumbai 400069
                  <br />
                  Maharashtra, India
                </p>

                <div
                  style={{
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <p
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      margin: 0,
                      lineHeight: 1.65,
                    }}
                  >
                    Home to our product, design, marketing, and executive teams. The Mumbai office is
                    our centre of gravity — where the vision for the app is shaped, debated, and
                    refined every single day.
                  </p>
                </div>
              </motion.div>

              {/* Bangalore Engineering */}
              <motion.div
                variants={fadeUp}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, var(--primary), transparent)',
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '11px',
                      background: 'rgba(var(--primary-rgb), 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                    }}
                  >
                    <MapPin size={19} />
                  </div>
                  <div>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        marginBottom: '2px',
                      }}
                    >
                      Engineering Office
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                      Bangalore, Karnataka
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  3rd Floor, Prestige Tech Park
                  <br />
                  Outer Ring Road, Marathahalli
                  <br />
                  Bangalore 560103, Karnataka, India
                </p>

                <div
                  style={{
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <p
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      margin: 0,
                      lineHeight: 1.65,
                    }}
                  >
                    Our Bangalore hub is home to the engineering, infrastructure, and data science
                    teams. The people who keep KVL Track fast, reliable, and secure operate from this
                    office.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ───── FAQ Section ───── */}
        <section
          ref={faqRef}
          style={{
            padding: '100px 24px',
            maxWidth: '760px',
            margin: '0 auto',
          }}
        >
          <motion.div
            initial="hidden"
            animate={faqInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeUp}
              style={{ textAlign: 'center', marginBottom: '56px' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 18px',
                  borderRadius: '100px',
                  background: 'rgba(var(--gold-rgb), 0.1)',
                  border: '1px solid rgba(var(--gold-rgb), 0.25)',
                  color: 'var(--gold)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginBottom: '22px',
                }}
              >
                FAQ
              </span>

              <h2
                style={{
                  fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  marginBottom: '16px',
                }}
              >
                Frequently Asked Questions
              </h2>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '1rem',
                  lineHeight: 1.75,
                  maxWidth: '520px',
                  margin: '0 auto',
                }}
              >
                Here are the questions we hear most often. If your question isn't answered below,
                use the contact form above and we'll get back to you personally.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '0 28px',
              }}
            >
              {FAQ_DATA.map((item, i) => (
                <FaqRow key={i} item={item} />
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ───── Bottom CTA ───── */}
        <section
          style={{
            padding: '80px 24px 120px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '560px',
              height: '220px',
              background:
                'radial-gradient(ellipse, rgba(var(--gold-rgb), 0.05) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              maxWidth: '580px',
              margin: '0 auto',
              position: 'relative',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                fontWeight: 800,
                marginBottom: '16px',
                letterSpacing: '-0.025em',
              }}
            >
              Still Have Questions?
            </h2>

            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                lineHeight: 1.78,
                marginBottom: '36px',
              }}
            >
              Our support team is standing by. Don't hesitate to reach out — we're a friendly bunch
              and we genuinely love hearing from the people who use KVL Track every day. No bots, no
              automated runarounds. Just real people who care.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <a
                href="mailto:support@kvlbusinesssolutions.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '13px 26px',
                  background: 'var(--gold)',
                  color: '#0a0a0a',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                }}
              >
                <Mail size={16} />
                Email Support
              </a>

              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '13px 26px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                }}
              >
                Return to KVL Track Home
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
