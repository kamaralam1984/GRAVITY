'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─────────────── Link data ─────────────── */
const FOOTER_LINKS = {
  Product: [
    { label: 'Live Tracking',    href: '/live-tracking'   },
    { label: 'Family Tracking',  href: '/family-tracking' },
    { label: 'Geofencing',       href: '/geofencing'      },
    { label: 'SOS & Emergency',  href: '/sos-emergency'   },
    { label: 'Child Safety',     href: '/child-safety'    },
    { label: 'Elderly Care',     href: '/elderly-care'    },
    { label: 'Driving Safety',   href: '/driving-safety'  },
    { label: 'AI Assistant',     href: '/ai-assistant'    },
  ],
  Resources: [
    { label: 'Features',         href: '/features'        },
    { label: 'Pricing',          href: '/pricing'         },
    { label: 'Integrations',     href: '/integrations'    },
    { label: 'API Docs',         href: '/api-docs'        },
    { label: 'Blog',             href: '/blog'            },
    { label: 'Case Studies',     href: '/case-studies'    },
    { label: 'System Status',    href: '/status'          },
  ],
  Compare: [
    { label: 'Gravity vs Life360',        href: '/compare/life360'        },
    { label: 'Gravity vs Google Family',  href: '/compare/google-family'  },
  ],
  Company: [
    { label: 'About Us',         href: '/about'    },
    { label: 'Careers',          href: '/careers'  },
    { label: 'Press Kit',        href: '/press'    },
    { label: 'Contact Us',       href: '/contact'  },
  ],
  Legal: [
    { label: 'Help Center',      href: '/help'     },
    { label: 'Privacy Policy',   href: '/privacy'  },
    { label: 'Terms of Service', href: '/terms'    },
    { label: 'Cookie Policy',    href: '/cookies'  },
  ],
}

/* ─────────────── Inline social SVGs ─────────────── */
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { Icon: InstagramIcon, label: 'Instagram',  href: 'https://instagram.com/trackalways' },
  { Icon: TwitterIcon,   label: 'Twitter / X', href: 'https://twitter.com/trackalways' },
  { Icon: LinkedInIcon,  label: 'LinkedIn',    href: 'https://linkedin.com/company/trackalways' },
  { Icon: YouTubeIcon,   label: 'YouTube',     href: 'https://youtube.com/@trackalways' },
]

/* ─────────────── Motion variants ─────────────── */
const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut', staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

/* ─────────────── Newsletter ─────────────── */
function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
    setEmail('')
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <motion.div
      variants={itemVariants}
      className="border-t pt-10 mt-10 text-center"
      style={{ borderColor: 'var(--border)' }}
    >
      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        Stay updated on family safety tips
      </p>
      <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
        Practical advice delivered to your inbox. No spam, ever.
      </p>

      <form
        onSubmit={handleSubscribe}
        className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
          style={{
            background: 'var(--bg-surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(212,168,83,0.6)'
            e.target.style.boxShadow = '0 0 0 3px rgba(212,168,83,0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.boxShadow = 'none'
          }}
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.03 }}
          className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all focus:outline-none"
          style={{
            background: 'linear-gradient(135deg, #D4A853, #F5C842)',
            color: '#1A0F05',
            fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
            boxShadow: '0 2px 12px rgba(212,168,83,0.3)',
          }}
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                Subscribed ✓
              </motion.span>
            ) : (
              <motion.span key="sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Subscribe
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>

      <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
        No spam. Unsubscribe anytime.
      </p>
    </motion.div>
  )
}

/* ─────────────── Social icon button ─────────────── */
function SocialButton({
  Icon,
  label,
  href,
}: {
  Icon: React.ComponentType
  label: string
  href: string
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileHover={{ scale: 1.12, y: -2 }}
      whileTap={{ scale: 0.92 }}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
      style={{
        background: 'var(--bg-surface2)',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.borderColor = 'rgba(212,168,83,0.5)'
        el.style.color = 'var(--gold, #D4A853)'
        el.style.background = 'rgba(212,168,83,0.1)'
        el.style.boxShadow = '0 0 14px rgba(212,168,83,0.18)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.borderColor = 'var(--border)'
        el.style.color = 'var(--text-muted)'
        el.style.background = 'var(--bg-surface2)'
        el.style.boxShadow = 'none'
      }}
    >
      <Icon />
    </motion.a>
  )
}

/* ─────────────── Footer ─────────────── */
export default function Footer() {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={containerVariants}
      className="relative border-t pt-16 pb-8"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Subtle top glow line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px pointer-events-none"
        style={{
          width: '60%',
          background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.3), transparent)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6">

        {/* ── TOP ROW: Brand + 5 link columns ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-10">

          {/* Column 1 — Brand */}
          <motion.div variants={itemVariants} className="col-span-2 md:col-span-3 lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #D4A853, #F5C842)',
                  boxShadow: '0 0 18px rgba(212,168,83,0.35)',
                }}
              >
                <span
                  className="font-extrabold text-lg leading-none"
                  style={{
                    color: '#1A0F05',
                    fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
                  }}
                >
                  G
                </span>
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="text-[10px] font-semibold tracking-[0.2em] uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  TRACKALWAYS
                </span>
                <span
                  className="text-[18px] font-extrabold tracking-wide"
                  style={{
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
                  }}
                >
                  GRAVITY
                </span>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-sm italic mb-4" style={{ color: 'var(--text-muted)' }}>
              "What Pulls You Together"
            </p>

            {/* Description */}
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
              Family safety reimagined — connecting loved ones through trust, real-time location, and care.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map(({ Icon, label, href }) => (
                <SocialButton key={label} Icon={Icon} label={label} href={href} />
              ))}
            </div>
          </motion.div>

          {/* Columns 2, 3, 4 — Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <motion.div key={title} variants={itemVariants}>
              <h4
                className="text-xs font-semibold uppercase tracking-wider mb-5"
                style={{ color: 'var(--text-muted)' }}
              >
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold, #D4A853)'
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── NEWSLETTER ROW ── */}
        <Newsletter />

        {/* ── Divider ── */}
        <motion.div
          variants={itemVariants}
          className="h-px w-full mt-10 mb-8"
          style={{ background: 'var(--border)' }}
        />

        {/* ── BOTTOM ROW ── */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm"
        >
          {/* Copyright */}
          <span style={{ color: 'var(--text-muted)' }}>
            © 2025 Trackalways. All rights reserved.
          </span>

          {/* Made with love */}
          <span
            className="flex items-center gap-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Made with{' '}
            <span className="text-red-400 mx-0.5 text-base">❤️</span>
            {' '}for families worldwide
          </span>

          {/* Global flags */}
          <div className="flex items-center gap-2 text-base" title="Available worldwide">
            {['🇮🇳', '🇺🇸', '🇬🇧', '🇦🇺', '🇸🇬'].map((flag) => (
              <span key={flag} className="leading-none">{flag}</span>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.footer>
  )
}
