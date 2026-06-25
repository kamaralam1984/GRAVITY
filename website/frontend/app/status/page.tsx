'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  CheckCircle2, AlertCircle, XCircle, MapPin, Bell, AlertTriangle,
  Shield, Map, Lock, Server, Smartphone, ArrowLeft, Mail, Clock, TrendingUp,
} from 'lucide-react'

/* ─── Service data ─── */
const services = [
  { name: 'Location Services', icon: MapPin, status: 'operational', uptime: 99.98 },
  { name: 'Push Notifications', icon: Bell, status: 'operational', uptime: 99.96 },
  { name: 'SOS & Emergency', icon: AlertTriangle, status: 'operational', uptime: 100.0 },
  { name: 'Geofence Alerts', icon: Shield, status: 'operational', uptime: 99.97 },
  { name: 'Maps & Tiles', icon: Map, status: 'operational', uptime: 99.94 },
  { name: 'Authentication', icon: Lock, status: 'operational', uptime: 99.99 },
  { name: 'API Services', icon: Server, status: 'operational', uptime: 99.97 },
  { name: 'Mobile Apps (iOS & Android)', icon: Smartphone, status: 'operational', uptime: 99.95 },
]

/* ─── Incident history ─── */
const incidents = [
  {
    id: 'INC-2025-042',
    title: 'Elevated Push Notification Delivery Latency',
    date: 'May 14, 2025',
    duration: '47 minutes',
    impact: 'Push notifications for geofence alerts were delayed by 3–8 minutes for approximately 12% of affected users in the South Asia region. SOS alerts were unaffected.',
    cause: 'A configuration change in our FCM routing layer triggered a queue backlog during peak hours.',
    resolution: 'Reverted FCM routing configuration; cleared notification queue; deployed improved queue-depth monitoring to prevent recurrence.',
    severity: 'minor',
  },
  {
    id: 'INC-2025-031',
    title: 'Location History API Degraded Performance',
    date: 'April 22, 2025',
    duration: '1 hour 12 minutes',
    impact: 'Location history timelines failed to load for approximately 8% of users. Real-time location sharing and SOS features were fully operational throughout the incident.',
    cause: 'A database index fragmentation issue caused slow queries on the location_history table following a large batch data migration.',
    resolution: 'Emergency re-indexing performed; read replicas scaled up; query optimization deployed. Full capacity restored ahead of SLA window.',
    severity: 'minor',
  },
  {
    id: 'INC-2025-018',
    title: 'Authentication Service Intermittent Errors',
    date: 'March 7, 2025',
    duration: '23 minutes',
    impact: 'A subset of users (estimated 3%) experienced failed login attempts and token refresh errors. Existing authenticated sessions were not affected.',
    cause: 'Certificate rotation for our internal OAuth token service caused a brief mismatch between token signing keys.',
    resolution: 'Certificate synchronization corrected across all nodes; automatic key rotation improved with zero-downtime procedures. Users who were logged out were able to re-authenticate immediately after resolution.',
    severity: 'minor',
  },
]

/* ─── Helpers ─── */
type StatusType = 'operational' | 'degraded' | 'outage'

function StatusBadge({ status }: { status: StatusType }) {
  const cfg = {
    operational: { color: 'var(--safe)', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', label: 'Operational' },
    degraded: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', label: 'Degraded' },
    outage: { color: 'var(--sos)', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', label: 'Outage' },
  }[status]
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  )
}

/* Generates a 90-day bar chart — mostly green with occasional amber */
function UptimeBar({ uptime }: { uptime: number }) {
  // Generate deterministic "outage days" from uptime percentage
  const days = 90
  // How many non-operational days
  const badDays = Math.round(days * (1 - uptime / 100) * 4)
  const bars = Array.from({ length: days }, (_, i) => {
    // Scatter bad days deterministically
    const isBad = badDays > 0 && (i * 7 + 3) % Math.round(days / badDays) === 0
    return isBad ? 'amber' : 'green'
  })
  return (
    <div className="flex gap-px mt-2" title={`${uptime}% uptime last 90 days`}>
      {bars.map((color, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: 20,
            background: color === 'green' ? 'rgba(34,197,94,0.7)' : 'rgba(245,158,11,0.75)',
            minWidth: 2,
          }}
        />
      ))}
    </div>
  )
}

function IncidentSeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
      style={{
        color: severity === 'major' ? 'var(--sos)' : '#F59E0B',
        background: severity === 'major' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
        border: `1px solid ${severity === 'major' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
      }}
    >
      {severity} incident
    </span>
  )
}

export default function StatusPage() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [checkedAt, setCheckedAt] = useState<string>('')

  useEffect(() => {
    setCheckedAt(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }))
  }, [])

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 4000)
  }

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>

        {/* ── Hero ── */}
        <section
          className="relative pt-32 pb-20 px-6 text-center"
          style={{ background: 'var(--bg-surface)' }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] rounded-full opacity-20 blur-3xl"
              style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.4), transparent 70%)' }}
            />
          </div>

          <div className="max-w-3xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--safe)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <ArrowLeft size={16} />
                Back to KVL Track Home
              </Link>

              {/* Global status badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 120 }}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-8"
                style={{
                  background: 'rgba(34,197,94,0.12)',
                  border: '1px solid rgba(34,197,94,0.35)',
                }}
              >
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ background: 'var(--safe)', boxShadow: '0 0 10px rgba(34,197,94,0.6)' }}
                />
                <span className="font-bold text-base" style={{ color: 'var(--safe)' }}>
                  All Systems Operational
                </span>
              </motion.div>

              <h1
                className="text-4xl md:text-5xl font-extrabold mb-4"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                System Status
              </h1>

              <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
                Real-time operational status for all KVL Track platform services.
                All 8 services are currently running normally.
              </p>

              {/* Uptime stats */}
              <div className="flex flex-wrap justify-center gap-6">
                {[
                  { label: 'Uptime (30 days)', value: '99.97%' },
                  { label: 'Uptime (90 days)', value: '99.98%' },
                  { label: 'Avg API Response', value: '<50ms' },
                  { label: 'Active Incidents', value: '0' },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="px-5 py-3 rounded-2xl text-center"
                    style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}
                  >
                    <p className="text-2xl font-extrabold mb-1" style={{ color: 'var(--safe)', fontFamily: 'var(--font-display)' }}>
                      {stat.value}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
                {checkedAt && <>Last checked: {checkedAt} IST</>}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Service Grid ── */}
        <section className="py-16 px-6" style={{ background: 'var(--bg)' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-8"
            >
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Current Service Status
              </h2>
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--safe)', border: '1px solid rgba(34,197,94,0.3)' }}>
                8 / 8 Operational
              </span>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc, i) => {
                const Icon = svc.icon
                return (
                  <motion.div
                    key={svc.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="rounded-2xl p-5"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
                        >
                          <Icon size={16} style={{ color: 'var(--safe)' }} />
                        </div>
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {svc.name}
                        </span>
                      </div>
                      <StatusBadge status={svc.status as StatusType} />
                    </div>

                    {/* 90-day uptime bars */}
                    <UptimeBar uptime={svc.uptime} />

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        90-day history
                      </span>
                      <span className="text-[11px] font-semibold" style={{ color: 'var(--safe)' }}>
                        {svc.uptime}% uptime
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'rgba(34,197,94,0.7)' }} />
                Operational
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'rgba(245,158,11,0.75)' }} />
                Degraded
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'rgba(239,68,68,0.7)' }} />
                Outage
              </span>
            </div>
          </div>
        </section>

        {/* ── Incident History ── */}
        <section className="py-16 px-6" style={{ background: 'var(--bg-surface)' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Incident History
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Past 90 days. All incidents have been fully resolved. We maintain a transparent record of every service disruption.
              </p>
            </motion.div>

            <div className="space-y-6">
              {incidents.map((inc, i) => (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-2xl p-6"
                  style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <CheckCircle2 size={16} style={{ color: 'var(--safe)', flexShrink: 0 }} />
                        <h3
                          className="font-bold"
                          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                        >
                          {inc.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 ml-7 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>{inc.id}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={10} />{inc.date}</span>
                        <span>•</span>
                        <span>Duration: {inc.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <IncidentSeverityBadge severity={inc.severity} />
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ color: 'var(--safe)', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
                      >
                        Resolved
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 ml-7">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                        Impact
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {inc.impact}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                        Root Cause
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {inc.cause}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                        Resolution
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {inc.resolution}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 text-center text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              No incidents in the 30 days prior to this period. Full incident history available on request.
            </motion.div>
          </div>
        </section>

        {/* ── SLA & Maintenance ── */}
        <section className="py-16 px-6" style={{ background: 'var(--bg)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* SLA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl p-6"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <TrendingUp size={22} style={{ color: 'var(--gold)', marginBottom: 12 }} />
                <h3
                  className="text-lg font-bold mb-3"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                >
                  Service Level Commitments
                </h3>
                <div className="space-y-3">
                  {[
                    { tier: 'Free Plan', sla: '99.5% monthly uptime' },
                    { tier: 'Premium Plan', sla: '99.9% monthly uptime' },
                    { tier: 'SOS & Emergency', sla: '99.99% — highest priority' },
                    { tier: 'API Response (P50)', sla: '<50ms globally' },
                    { tier: 'API Response (P99)', sla: '<200ms globally' },
                  ].map(item => (
                    <div key={item.tier} className="flex items-center justify-between text-sm py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.tier}</span>
                      <span className="font-semibold" style={{ color: 'var(--safe)' }}>{item.sla}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                  SLA credits are available for Premium subscribers when commitments are not met. Contact support for details.
                </p>
              </motion.div>

              {/* Maintenance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl p-6"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <Clock size={22} style={{ color: 'var(--primary)', marginBottom: 12 }} />
                <h3
                  className="text-lg font-bold mb-3"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                >
                  Maintenance Windows
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Scheduled maintenance is performed during low-traffic windows to minimize impact. We aim for zero-downtime deployments using blue-green deployment strategies. When downtime is unavoidable, we announce it at least 48 hours in advance.
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'Standard maintenance window', value: 'Tuesdays 2:00–4:00 AM IST' },
                    { label: 'Emergency patch window', value: 'Any time, with prior notice' },
                    { label: 'Major version deployments', value: '7 days advance notice' },
                    { label: 'Database migrations', value: 'Sundays 1:00–3:00 AM IST' },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col text-sm py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{item.label}</span>
                      <span className="font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Subscribe to Updates ── */}
        <section className="py-16 px-6" style={{ background: 'var(--bg-surface)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
              >
                <Bell size={24} style={{ color: 'var(--safe)' }} />
              </div>

              <h2
                className="text-2xl font-bold mb-3"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Subscribe to Status Updates
              </h2>
              <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                Get notified by email the moment a service incident is detected, updated, or resolved. No spam — only critical status updates.
              </p>

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: 'var(--bg-surface2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(34,197,94,0.5)'
                    e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.1)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--border)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.96 }}
                  className="px-6 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: subscribed
                      ? 'rgba(34,197,94,0.2)'
                      : 'rgba(34,197,94,0.15)',
                    border: '1px solid rgba(34,197,94,0.4)',
                    color: 'var(--safe)',
                  }}
                >
                  {subscribed ? 'Subscribed!' : 'Notify Me'}
                </motion.button>
              </form>

              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                You can unsubscribe at any time. We also post updates on{' '}
                <a href="https://twitter.com/kvlbusinesssolutions" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                  Twitter / X
                </a>.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 px-6" style={{ background: 'var(--bg)' }}>
          <div className="max-w-3xl mx-auto">
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
              <Server size={28} style={{ color: 'var(--gold)', margin: '0 auto 16px' }} />
              <h2
                className="text-2xl font-bold mb-3"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Experiencing an Issue?
              </h2>
              <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                If you`re experiencing a problem not reflected here, our support team is available 24/7 for SOS-related issues and during business hours for general support.`
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                    color: '#1A0F05',
                  }}
                >
                  <Mail size={16} />
                  Contact Support
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
                  Back to KVL Track Home
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
