'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Cookie, Shield, BarChart2, Settings, Target, Info, ArrowLeft, ExternalLink } from 'lucide-react'

const cookieTypes = [
  {
    id: 'essential',
    icon: Shield,
    name: 'Essential Cookies',
    color: 'var(--safe)',
    colorAlpha: 'rgba(34,197,94,0.1)',
    colorBorder: 'rgba(34,197,94,0.3)',
    description: 'These cookies are strictly necessary for the Service to function. Without them, core functionality such as logging in, maintaining your session, and protecting against cross-site request forgery attacks would not work. You cannot opt out of essential cookies through our consent manager — disabling them may be done through your browser but will break the Service.',
    canOptOut: false,
  },
  {
    id: 'analytics',
    icon: BarChart2,
    name: 'Analytics Cookies',
    color: 'var(--primary)',
    colorAlpha: 'rgba(var(--primary-rgb),0.1)',
    colorBorder: 'rgba(var(--primary-rgb),0.3)',
    description: 'Analytics cookies help us understand how visitors interact with our website and app. We use Google Analytics 4 and Mixpanel to collect anonymized, aggregated data about page views, feature usage, and user flows. This data helps us improve the product. All analytics data is anonymized — we do not use analytics cookies to identify individual users. You may opt out of analytics cookies at any time.',
    canOptOut: true,
  },
  {
    id: 'preferences',
    icon: Settings,
    name: 'Preference Cookies',
    color: 'var(--gold)',
    colorAlpha: 'rgba(var(--gold-rgb),0.1)',
    colorBorder: 'rgba(var(--gold-rgb),0.3)',
    description: 'Preference cookies allow our website to remember choices you have made — such as your preferred theme (light or dark mode), language, region, and consent preferences. These cookies persist across browser sessions so you do not need to reconfigure these settings on every visit. Disabling them will not break core functionality but you will need to re-select your preferences each visit.',
    canOptOut: true,
  },
  {
    id: 'marketing',
    icon: Target,
    name: 'Marketing & Attribution',
    color: 'var(--sos)',
    colorAlpha: 'rgba(var(--sos),0.08)',
    colorBorder: 'rgba(var(--sos),0.25)',
    description: 'We use limited marketing cookies solely for attribution — understanding which marketing channel (e.g., organic search, paid ads, social media) brought you to KVL Track. We do not use third-party advertising networks or build cross-site behavioral profiles. Attribution data helps us invest in the most effective channels. We do not show targeted ads inside our app. You may opt out of attribution cookies.',
    canOptOut: true,
  },
]

const cookieTable = [
  {
    name: 'gravity_session',
    purpose: 'Maintains your authenticated session between page loads',
    duration: 'Session (closes when browser closes)',
    type: 'Essential',
    typeColor: 'var(--safe)',
  },
  {
    name: 'gravity_auth_token',
    purpose: 'Stores a secure token for persistent login (Remember Me)',
    duration: '30 days',
    type: 'Essential',
    typeColor: 'var(--safe)',
  },
  {
    name: 'csrf_token',
    purpose: 'Protects against cross-site request forgery attacks on forms',
    duration: 'Session',
    type: 'Essential',
    typeColor: 'var(--safe)',
  },
  {
    name: 'cookie_consent',
    purpose: 'Stores your cookie consent choices to avoid repeated prompts',
    duration: '1 year',
    type: 'Essential',
    typeColor: 'var(--safe)',
  },
  {
    name: '_ga',
    purpose: 'Google Analytics — distinguishes unique users for aggregate reporting',
    duration: '2 years',
    type: 'Analytics',
    typeColor: 'var(--primary)',
  },
  {
    name: '_ga_XXXXXXX',
    purpose: 'Google Analytics 4 — maintains session state for reporting',
    duration: '2 years',
    type: 'Analytics',
    typeColor: 'var(--primary)',
  },
  {
    name: 'mp_xxxxxxxxxx_mixpanel',
    purpose: 'Mixpanel — tracks anonymized feature usage and funnel events',
    duration: '1 year',
    type: 'Analytics',
    typeColor: 'var(--primary)',
  },
  {
    name: 'gravity_theme',
    purpose: 'Remembers your preferred color scheme (light/dark/system)',
    duration: '1 year',
    type: 'Preferences',
    typeColor: 'var(--gold)',
  },
  {
    name: 'gravity_lang',
    purpose: 'Stores your preferred language and regional date/number format',
    duration: '1 year',
    type: 'Preferences',
    typeColor: 'var(--gold)',
  },
  {
    name: 'gravity_utm',
    purpose: 'Attribution — records which marketing channel referred your visit',
    duration: '30 days',
    type: 'Marketing',
    typeColor: 'var(--sos)',
  },
]

const browserGuides = [
  {
    name: 'Google Chrome',
    url: 'https://support.google.com/chrome/answer/95647',
    steps: 'Settings → Privacy and Security → Cookies and Other Site Data',
  },
  {
    name: 'Mozilla Firefox',
    url: 'https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer',
    steps: 'Settings → Privacy & Security → Cookies and Site Data',
  },
  {
    name: 'Safari (iOS & macOS)',
    url: 'https://support.apple.com/guide/safari/manage-cookies-sfri11471',
    steps: 'Settings → Safari → Privacy & Security → Block All Cookies',
  },
  {
    name: 'Microsoft Edge',
    url: 'https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge',
    steps: 'Settings → Site Permissions → Cookies and Site Data',
  },
]

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>

        {/* Hero */}
        <section
          className="relative pt-32 pb-20 px-6"
          style={{ background: 'var(--bg-surface)' }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
            <div
              className="absolute top-0 left-1/4 w-[400px] h-[280px] rounded-full opacity-10 blur-3xl"
              style={{ background: 'radial-gradient(ellipse, rgba(var(--gold-rgb),0.6), transparent 70%)' }}
            />
          </div>

          <div className="max-w-5xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <ArrowLeft size={16} />
                Return to KVL Track Home
              </Link>

              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(var(--gold-rgb), 0.12)', border: '1px solid rgba(var(--gold-rgb), 0.3)' }}
                >
                  <Cookie size={28} style={{ color: 'var(--gold)' }} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--gold)' }}>
                    Legal Document
                  </p>
                  <h1
                    className="text-4xl md:text-5xl font-extrabold"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                  >
                    Cookie Policy
                  </h1>
                </div>
              </div>

              <p className="text-lg leading-relaxed max-w-2xl mb-6" style={{ color: 'var(--text-secondary)' }}>
                We believe in complete transparency about how our website uses cookies and similar tracking technologies. This policy explains what we use, why, and how you can control it.
              </p>

              <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                {['Last Updated: June 2025', '10 cookies documented', 'GDPR Compliant Consent'].map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* What Are Cookies */}
        <section className="py-16 px-6" style={{ background: 'var(--bg)' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: 'rgba(var(--gold-rgb), 0.1)', border: '1px solid rgba(var(--gold-rgb), 0.25)' }}
                >
                  <Info size={18} style={{ color: 'var(--gold)' }} />
                </div>
                <div>
                  <h2
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                  >
                    What Are Cookies?
                  </h2>
                  <div className="h-px w-12 mb-4" style={{ background: 'rgba(var(--gold-rgb), 0.4)' }} />
                  <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.85' }}>
                    Cookies are small text files that websites and web applications store on your device (computer, tablet, or mobile phone) when you visit them. They are widely used to make websites work efficiently, to personalize your experience, and to provide information to website owners. Cookies are not programs — they cannot execute code or carry viruses. They contain data that is sent to and from a web server, allowing the server to recognize your device on subsequent visits. Similar technologies include local storage (data stored in your browser), session storage (temporary browser-based storage), and pixel tags (tiny invisible images used for tracking). When we refer to "cookies" in this policy, we mean all such similar technologies unless otherwise specified. Our website uses a combination of first-party cookies (set by kvlbusinesssolutions.com directly) and third-party cookies (set by our service providers).
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Cookie Types */}
        <section className="py-16 px-6" style={{ background: 'var(--bg-surface)' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <h2
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Types of Cookies We Use
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                We use four categories of cookies, each serving a distinct purpose.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cookieTypes.map((ct, i) => {
                const Icon = ct.icon
                return (
                  <motion.div
                    key={ct.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="rounded-2xl p-6"
                    style={{
                      background: 'var(--bg-surface2)',
                      border: `1px solid var(--border)`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: ct.colorAlpha, border: `1px solid ${ct.colorBorder}` }}
                      >
                        <Icon size={18} style={{ color: ct.color }} />
                      </div>
                      <div className="flex-1">
                        <h3
                          className="font-bold text-base"
                          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                        >
                          {ct.name}
                        </h3>
                      </div>
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{
                          background: ct.canOptOut ? 'rgba(var(--primary-rgb),0.1)' : 'rgba(34,197,94,0.1)',
                          color: ct.canOptOut ? 'var(--primary)' : 'var(--safe)',
                          border: `1px solid ${ct.canOptOut ? 'rgba(var(--primary-rgb),0.3)' : 'rgba(34,197,94,0.3)'}`,
                        }}
                      >
                        {ct.canOptOut ? 'Optional' : 'Required'}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {ct.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Cookie Table */}
        <section className="py-16 px-6" style={{ background: 'var(--bg)' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Full Cookie Reference
              </h2>
              <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
                A complete list of all cookies currently used on kvlbusinesssolutions.com and the KVL Track web app.
              </p>

              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--border)' }}
              >
                {/* Table Header */}
                <div
                  className="grid grid-cols-4 gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
                >
                  <span>Cookie Name</span>
                  <span className="col-span-2">Purpose</span>
                  <span>Duration</span>
                </div>

                {cookieTable.map((cookie, i) => (
                  <motion.div
                    key={cookie.name}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    className="grid grid-cols-4 gap-4 px-5 py-4 items-start"
                    style={{
                      background: i % 2 === 0 ? 'var(--bg-surface)' : 'transparent',
                      borderBottom: i < cookieTable.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div>
                      <code
                        className="text-xs px-2 py-1 rounded-lg font-mono block truncate"
                        style={{
                          background: 'var(--bg-surface2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                        }}
                        title={cookie.name}
                      >
                        {cookie.name}
                      </code>
                      <span
                        className="text-[10px] mt-1 inline-block font-semibold"
                        style={{ color: cookie.typeColor }}
                      >
                        {cookie.type}
                      </span>
                    </div>
                    <p className="text-sm col-span-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {cookie.purpose}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {cookie.duration}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How to Control */}
        <section className="py-16 px-6" style={{ background: 'var(--bg-surface)' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                How to Control Cookies
              </h2>
              <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
                You have several options for managing cookie preferences.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {/* Consent Manager */}
                <div
                  className="rounded-2xl p-6"
                  style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}
                >
                  <Settings size={20} style={{ color: 'var(--gold)', marginBottom: 12 }} />
                  <h3
                    className="font-bold mb-3"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                  >
                    Our Cookie Consent Manager
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    When you first visit kvlbusinesssolutions.com, you will see a cookie consent banner allowing you to accept all cookies, reject non-essential cookies, or customize your preferences by category. You can update your preferences at any time by clicking the cookie icon in the bottom corner of our website. Your choices are saved in the cookie_consent cookie for 1 year.
                  </p>
                  <button
                    className="text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                    style={{
                      background: 'rgba(var(--gold-rgb),0.12)',
                      border: '1px solid rgba(var(--gold-rgb),0.3)',
                      color: 'var(--gold)',
                    }}
                  >
                    Open Cookie Preferences
                  </button>
                </div>

                {/* Impact */}
                <div
                  className="rounded-2xl p-6"
                  style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}
                >
                  <Info size={20} style={{ color: 'var(--primary)', marginBottom: 12 }} />
                  <h3
                    className="font-bold mb-3"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                  >
                    Impact of Disabling Cookies
                  </h3>
                  <ul className="text-sm leading-relaxed space-y-2" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-start gap-2">
                      <span style={{ color: 'var(--safe)', marginTop: 3, flexShrink: 0 }}>●</span>
                      <span><strong>Essential off:</strong> Login and core features will break. Not recommended.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: 'var(--primary)', marginTop: 3, flexShrink: 0 }}>●</span>
                      <span><strong>Analytics off:</strong> Site still works fully. We get less improvement data.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: 'var(--gold)', marginTop: 3, flexShrink: 0 }}>●</span>
                      <span><strong>Preferences off:</strong> You will need to re-select theme and language each visit.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: 'var(--sos)', marginTop: 3, flexShrink: 0 }}>●</span>
                      <span><strong>Marketing off:</strong> You will see the same experience. We lose attribution data only.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Browser Guides */}
              <h3
                className="font-bold text-lg mb-4"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Browser-Level Cookie Controls
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {browserGuides.map((b, i) => (
                  <motion.a
                    key={b.name}
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="flex items-start gap-3 p-4 rounded-xl transition-all"
                    style={{
                      background: 'var(--bg-surface2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(var(--gold-rgb),0.4)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
                    }}
                  >
                    <ExternalLink size={14} style={{ color: 'var(--gold)', marginTop: 3, flexShrink: 0 }} />
                    <div>
                      <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                        {b.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {b.steps}
                      </p>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Third-party opt-outs */}
              <div
                className="mt-8 rounded-2xl p-6"
                style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}
              >
                <h3
                  className="font-bold mb-3"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                >
                  Third-Party Analytics Opt-Outs
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  In addition to our consent manager, you may opt out of individual third-party analytics services directly:
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg transition-all"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={12} />
                    Google Analytics Opt-out
                  </a>
                  <a
                    href="https://mixpanel.com/optout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg transition-all"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={12} />
                    Mixpanel Opt-out
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Changes & Contact */}
        <section className="py-16 px-6" style={{ background: 'var(--bg)' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <h2
                className="text-xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Changes to This Cookie Policy
              </h2>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.85' }}>
                We may update this Cookie Policy periodically to reflect changes in the cookies we use or for other operational, legal, or regulatory reasons. We will post the updated policy on this page with a revised "Last Updated" date. For material changes, we will display a prominent notice on our website or send an email notification. We encourage you to review this policy regularly. If you continue to use our website after we post changes, you are consenting to the updated policy. The current version of this Cookie Policy is effective as of June 2025.
              </p>
            </motion.div>

            {/* CTA Cards */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl p-10 text-center"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
            >
              <Cookie size={32} style={{ color: 'var(--gold)', margin: '0 auto 16px' }} />
              <h2
                className="text-2xl font-bold mb-3"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Questions About Cookies?
              </h2>
              <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                Our privacy team can answer questions about our cookie practices and help you exercise your rights.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                    color: '#1A0F05',
                  }}
                >
                  <Shield size={16} />
                  Full Privacy Policy
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    background: 'var(--bg-surface2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <ArrowLeft size={16} />
                  Return to Home
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
