'use client'

import { Car, Shield, AlertTriangle, Gauge, Phone, TrendingDown, Star, ChevronRight, CheckCircle, MapPin, Clock, Zap } from 'lucide-react'
import Link from 'next/link'

const featureCards = [
  {
    icon: AlertTriangle,
    title: 'Crash Detection',
    description: 'Accelerometer-based automatic crash detection triggers emergency SOS within 10 seconds of impact, alerting family and emergency contacts instantly.',
    accent: '#EF4444',
  },
  {
    icon: Gauge,
    title: 'Speed Monitoring',
    description: 'Real-time overspeed alerts with zone-specific speed limits. Get notified the moment a family member exceeds safe driving thresholds.',
    accent: '#3B82F6',
  },
  {
    icon: Phone,
    title: 'Phone Use Detection',
    description: 'Detect when someone is using their phone while driving and instantly alert family members — before it becomes a danger.',
    accent: '#F59E0B',
  },
  {
    icon: TrendingDown,
    title: 'Harsh Braking',
    description: 'Identify aggressive braking and rapid acceleration events. Build awareness around dangerous driving habits with detailed reports.',
    accent: '#8B5CF6',
  },
  {
    icon: Star,
    title: 'Driver Safety Score',
    description: 'Weekly safety score from 0–100 with personalised coaching tips to help every driver in your family improve over time.',
    accent: '#10B981',
  },
  {
    icon: MapPin,
    title: 'Route Risk Analysis',
    description: 'AI analyses your family\'s regular routes and flags dangerous stretches, accident-prone zones, and high-risk road segments.',
    accent: '#06B6D4',
  },
]

const scoreBreakdown = [
  { label: 'Speed', score: 92, color: '#10B981' },
  { label: 'Phone', score: 95, color: '#3B82F6' },
  { label: 'Braking', score: 78, color: '#F59E0B' },
  { label: 'Acceleration', score: 84, color: '#8B5CF6' },
]

const parentBenefits = [
  'Know the moment your teen arrives at school or home',
  'Get alerted if they exceed the speed you set',
  'Receive crash detection SOS before anyone else',
  'Review weekly driving reports with full trip history',
  'Set speed limits specific to your teen\'s routes',
]

const teenBenefits = [
  'Build a strong safety record with weekly scores',
  'Get coaching tips to become a better driver',
  'Earn trust from parents through transparent data',
  'Automatic SOS if something goes wrong on the road',
  'No constant check-ins — the data speaks for itself',
]

export default function DrivingSafetyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0B0D13', color: '#F1EDE4' }}>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 400,
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <Car size={16} style={{ color: '#3B82F6' }} />
            <span style={{ color: '#3B82F6', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>
              GRAVITY DRIVING SAFETY
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
            Drive Smart.{' '}
            <span style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Arrive Safe.
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: '#9CA3AF', maxWidth: 680, margin: '0 auto 40px', lineHeight: 1.7 }}>
            AI-powered driving monitoring that keeps your family safe on every journey. Know when someone is speeding, using their phone while driving, or involved in an accident.
          </p>

          {/* Badges row */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { icon: AlertTriangle, label: 'Crash Detection', color: '#EF4444' },
              { icon: Zap, label: 'Real-time Alerts', color: '#F59E0B' },
              { icon: Star, label: 'Driver Score', color: '#10B981' },
              { icon: Shield, label: 'Auto SOS', color: '#3B82F6' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Icon size={14} style={{ color }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: '#D1D5DB' }}>{label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', color: '#fff', fontSize: 16 }}>
              Get Started Free <ChevronRight size={18} />
            </Link>
            <Link href="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F1EDE4', fontSize: 16 }}>
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 px-4" id="how-it-works">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Complete Driving Safety Suite
            </h2>
            <p style={{ color: '#6B7280', fontSize: 17, maxWidth: 520, margin: '0 auto' }}>
              Six layers of protection on every trip, working quietly in the background so your family doesn't have to think about safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map(({ icon: Icon, title, description, accent }) => (
              <div key={title}
                className="p-6 rounded-2xl transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
                  <Icon size={22} style={{ color: accent }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#F1EDE4' }}>{title}</h3>
                <p style={{ color: '#6B7280', lineHeight: 1.7, fontSize: 15 }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Driver Score Mockup */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Your Driver Safety Score
            </h2>
            <p style={{ color: '#6B7280', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
              A clear weekly score with actionable insights — not just data, but a path to becoming a safer driver.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8 justify-center">
            {/* Big Score Card */}
            <div className="p-10 rounded-3xl text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', minWidth: 280 }}>
              <p style={{ color: '#6B7280', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', marginBottom: 16 }}>OVERALL SCORE</p>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                  <circle
                    cx="80" cy="80" r="70"
                    fill="none"
                    stroke="url(#scoreGrad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 70 * 0.87} ${2 * Math.PI * 70}`}
                    strokeDashoffset={2 * Math.PI * 70 * 0.25}
                    transform="rotate(-90 80 80)"
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: 44, fontWeight: 900, color: '#F1EDE4', lineHeight: 1 }}>87</div>
                  <div style={{ fontSize: 14, color: '#6B7280' }}>/100</div>
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#10B981', letterSpacing: '0.05em' }}>GREAT DRIVER</div>
            </div>

            {/* Breakdown */}
            <div className="flex-1 w-full max-w-sm">
              <div className="space-y-4">
                {scoreBreakdown.map(({ label, score, color }) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-2">
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#D1D5DB' }}>{label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color }}>{score}/100</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: 20, fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                Braking score is your area to improve this week. Try releasing the accelerator earlier when approaching stops.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Teen + Parent Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Know When Your Teen is Driving Safely
            </h2>
            <p style={{ color: '#6B7280', fontSize: 17, maxWidth: 540, margin: '0 auto' }}>
              Gravity Driving Safety creates trust between parents and teen drivers — with transparent data instead of constant check-ins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Parents perspective */}
            <div className="p-8 rounded-2xl"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(59,130,246,0.2)' }}>
                  <Shield size={18} style={{ color: '#3B82F6' }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600, letterSpacing: '0.08em' }}>FOR PARENTS</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#F1EDE4' }}>Peace of Mind</p>
                </div>
              </div>
              <ul className="space-y-3">
                {parentBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle size={16} style={{ color: '#3B82F6', marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 15, color: '#D1D5DB', lineHeight: 1.6 }}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Teen perspective */}
            <div className="p-8 rounded-2xl"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.2)' }}>
                  <Star size={18} style={{ color: '#10B981' }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#10B981', fontWeight: 600, letterSpacing: '0.08em' }}>FOR TEEN DRIVERS</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#F1EDE4' }}>Build Your Record</p>
                </div>
              </div>
              <ul className="space-y-3">
                {teenBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle size={16} style={{ color: '#10B981', marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 15, color: '#D1D5DB', lineHeight: 1.6 }}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Driving Report Mockup */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Weekly Driving Report
            </h2>
            <p style={{ color: '#6B7280', fontSize: 16 }}>
              A full summary every week — delivered automatically to the family.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {/* Report header */}
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3">
                <Clock size={16} style={{ color: '#6B7280' }} />
                <span style={{ fontSize: 13, color: '#9CA3AF' }}>Jun 3 – Jun 9, 2026</span>
              </div>
              <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600, padding: '2px 10px', background: 'rgba(16,185,129,0.15)', borderRadius: 99 }}>
                EXCELLENT
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {[
                { label: 'Total Trips', value: '12', icon: Car, color: '#3B82F6' },
                { label: 'Distance', value: '234 km', icon: MapPin, color: '#8B5CF6' },
                { label: 'Incidents', value: '0', icon: AlertTriangle, color: '#10B981' },
                { label: 'Safety Score', value: '94/100', icon: Star, color: '#F59E0B' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="p-6 text-center"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <Icon size={20} style={{ color, margin: '0 auto 10px' }} />
                  <div style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 800, color: '#F1EDE4', marginBottom: 4 }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Bottom message */}
            <div className="px-6 py-4 flex items-center gap-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Zap size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />
              <p style={{ fontSize: 14, color: '#9CA3AF' }}>
                <span style={{ color: '#F59E0B', fontWeight: 600 }}>Tip:</span> Zero incidents this week — great driving! Work on smoother braking to push your score above 95.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
            <Car size={28} style={{ color: '#fff' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Every Trip. Every Driver. Protected.
          </h2>
          <p style={{ color: '#6B7280', fontSize: 17, marginBottom: 36, lineHeight: 1.7 }}>
            Start with Gravity free and add driving safety to your family's protection plan. No hardware required — just the app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', color: '#fff', fontSize: 16 }}>
              View Pricing <ChevronRight size={18} />
            </Link>
            <Link href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F1EDE4', fontSize: 16 }}>
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
