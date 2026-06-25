'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Code,
  Key,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Copy,
  CheckCircle,
  BookOpen,
  Terminal,
  Webhook,
  Activity,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function Section({ children, bg = 'var(--bg)', id }: { children: React.ReactNode; bg?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}
      id={id}
      style={{ background: bg, padding: '80px 0' }}>
      {children}
    </motion.section>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    GET: { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    POST: { bg: 'rgba(75,128,240,0.12)', color: '#4B80F0' },
    PUT: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
    DELETE: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
    PATCH: { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
  };
  const c = colors[method] || colors.GET;
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}30`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
      {method}
    </span>
  );
}

function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ background: '#0d1117', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace" }}>{language}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: copied ? '#10B981' : 'rgba(255,255,255,0.4)', padding: '2px 6px' }}
        >
          {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
          <span style={{ fontSize: 11, fontFamily: "'Inter', sans-serif" }}>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre style={{ background: '#0d1117', margin: 0, padding: '16px', overflowX: 'auto', fontSize: 13, lineHeight: 1.65, fontFamily: "'JetBrains Mono', monospace", color: '#e6edf3' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

const API_CATEGORIES = [
  {
    name: 'Authentication',
    icon: <Key size={20} />,
    color: '#D4A853',
    endpoints: [
      { method: 'POST', path: '/auth/register', desc: 'Register a new user account' },
      { method: 'POST', path: '/auth/login', desc: 'Login with email and password, returns JWT' },
      { method: 'POST', path: '/auth/otp/send', desc: 'Send OTP to phone number' },
      { method: 'POST', path: '/auth/otp/verify', desc: 'Verify OTP and authenticate' },
    ],
  },
  {
    name: 'Location',
    icon: <Activity size={20} />,
    color: '#4B80F0',
    endpoints: [
      { method: 'POST', path: '/location/update', desc: 'Update user current location' },
      { method: 'GET', path: '/location/family/{family_id}', desc: 'Get all family member locations' },
      { method: 'GET', path: '/location/history/{user_id}', desc: 'Get location history for a user' },
      { method: 'GET', path: '/location/current/{user_id}', desc: 'Get most recent location for a user' },
    ],
  },
  {
    name: 'Families',
    icon: <Globe size={20} />,
    color: '#10B981',
    endpoints: [
      { method: 'POST', path: '/families/create', desc: 'Create a new family circle' },
      { method: 'GET', path: '/families/my', desc: 'List all families the user belongs to' },
      { method: 'POST', path: '/families/join', desc: 'Join a family using invite code' },
      { method: 'DELETE', path: '/families/{family_id}/leave', desc: 'Leave a family circle' },
    ],
  },
  {
    name: 'Geofences',
    icon: <Shield size={20} />,
    color: '#8B5CF6',
    endpoints: [
      { method: 'POST', path: '/geofences/create', desc: 'Create a new geofence zone' },
      { method: 'GET', path: '/geofences/list/{family_id}', desc: 'List all geofences for a family' },
      { method: 'PUT', path: '/geofences/{id}', desc: 'Update geofence settings' },
      { method: 'DELETE', path: '/geofences/{id}', desc: 'Delete a geofence' },
    ],
  },
  {
    name: 'SOS & Emergency',
    icon: <Zap size={20} />,
    color: '#EF4444',
    endpoints: [
      { method: 'POST', path: '/sos/trigger', desc: 'Trigger an SOS alert with location' },
      { method: 'POST', path: '/sos/resolve/{id}', desc: 'Resolve an active SOS alert' },
      { method: 'GET', path: '/sos/active', desc: 'List all active SOS alerts for family' },
      { method: 'GET', path: '/emergency-profile/my', desc: 'Get user emergency medical profile' },
    ],
  },
  {
    name: 'Health',
    icon: <Activity size={20} />,
    color: '#EC4899',
    endpoints: [
      { method: 'POST', path: '/health/record', desc: 'Submit a health data record' },
      { method: 'GET', path: '/health/history', desc: 'Get health records for the past N days' },
      { method: 'POST', path: '/health/medication', desc: 'Create a medication reminder' },
      { method: 'GET', path: '/health/medications', desc: 'List active medication reminders' },
    ],
  },
  {
    name: 'Driving Safety',
    icon: <Activity size={20} />,
    color: '#F59E0B',
    endpoints: [
      { method: 'POST', path: '/driving/event', desc: 'Log a driving safety event' },
      { method: 'GET', path: '/driving/events', desc: 'Get recent driving events' },
      { method: 'GET', path: '/driving/stats', desc: 'Get driving safety statistics' },
      { method: 'GET', path: '/journeys/list', desc: 'List all user journeys' },
    ],
  },
  {
    name: 'AI Intelligence',
    icon: <Zap size={20} />,
    color: '#06B6D4',
    endpoints: [
      { method: 'POST', path: '/ai/query', desc: 'Query the AI family assistant' },
      { method: 'GET', path: '/ai/alerts', desc: 'Get AI predictive safety alerts' },
      { method: 'GET', path: '/ai/weekly-report', desc: 'Get AI-generated weekly family report' },
      { method: 'GET', path: '/ai/risk-score', desc: 'Get family safety risk score' },
    ],
  },
];

const AUTH_EXAMPLE = `curl -X POST https://api.gravity.kvlbusinesssolutions.com/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "your_password"}'`;

const AUTH_RESPONSE = `{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "name": "Arjun Sharma",
    "email": "user@example.com"
  }
}`;

const LOCATION_EXAMPLE = `curl -X POST https://api.gravity.kvlbusinesssolutions.com/location/update \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "lat": 12.9716,
    "lng": 77.5946,
    "accuracy": 5.0,
    "speed": 0,
    "place_name": "Bengaluru, Karnataka"
  }'`;

const RATE_LIMITS = [
  { tier: 'Free', requests: '100/hour', locations: '30/hour', sos: 'Unlimited' },
  { tier: 'Family', requests: '1,000/hour', locations: '120/hour', sos: 'Unlimited' },
  { tier: 'Family+', requests: '10,000/hour', locations: '360/hour', sos: 'Unlimited' },
  { tier: 'Enterprise', requests: 'Custom', locations: 'Custom', sos: 'Unlimited' },
];

const SDKS = [
  { name: 'Python', icon: '🐍', install: 'pip install gravity-sdk', color: '#3776AB' },
  { name: 'Node.js', icon: '⬢', install: 'npm install @kvlbusinesssolutions/gravity', color: '#68A063' },
  { name: 'React Native', icon: '⚛', install: 'npm install @kvlbusinesssolutions/gravity-rn', color: '#61DAFB' },
  { name: 'Flutter', icon: '🎯', install: 'flutter pub add gravity_sdk', color: '#54C5F8' },
];

export default function ApiDocsPage() {
  const [activeCategory, setActiveCategory] = useState('Authentication');

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, background: 'var(--bg)', minHeight: '100vh' }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 0 64px', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(75,128,240,0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(75,128,240,0.12)', border: '1px solid rgba(75,128,240,0.25)', borderRadius: 999, padding: '6px 14px', marginBottom: 24 }}>
                <Terminal size={14} color="#4B80F0" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#4B80F0', fontFamily: "'Inter', sans-serif" }}>Developer API v2.0</span>
              </div>
              <h1 style={{ fontSize: 52, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 20, lineHeight: 1.12 }}>
                KVL Track{' '}
                <span style={{ background: 'linear-gradient(135deg, #4B80F0 0%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Developer API</span>
              </h1>
              <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 36px', fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
                Build safety into your application. REST API, WebSockets, and Webhooks — with SDKs for Python, Node.js, React Native, and Flutter.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.a href="#quickstart" whileHover={{ scale: 1.04, y: -1 }} className="btn-gold"
                  style={{ padding: '14px 28px', borderRadius: 999, fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}>
                  Quick Start
                  <ChevronRight size={16} />
                </motion.a>
                <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer"
                  style={{ padding: '14px 28px', borderRadius: 999, fontSize: 15, fontWeight: 600, border: '1px solid var(--border)', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: 'var(--bg-surface)', fontFamily: "'Inter', sans-serif" }}>
                  <BookOpen size={16} />
                  Swagger UI
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Quick Start ──────────────────────────────────────────────────── */}
        <Section id="quickstart" bg="var(--bg-surface)">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 8 }}>Quick Start</h2>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>Authenticate and make your first API call in under 5 minutes.</p>
            </motion.div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <motion.div variants={fadeUp}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>STEP 1 — Authenticate</div>
                <CodeBlock code={AUTH_EXAMPLE} language="bash" />
              </motion.div>
              <motion.div variants={fadeUp}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>RESPONSE</div>
                <CodeBlock code={AUTH_RESPONSE} language="json" />
              </motion.div>
              <motion.div variants={fadeUp}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>STEP 2 — Use the token to update location</div>
                <CodeBlock code={LOCATION_EXAMPLE} language="bash" />
              </motion.div>
            </div>
          </div>
        </Section>

        {/* ── API Reference ────────────────────────────────────────────────── */}
        <Section bg="var(--bg)">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 8 }}>API Reference</h2>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>
                Base URL: <code style={{ background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 6, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#4B80F0' }}>https://api.gravity.kvlbusinesssolutions.com</code>
              </p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>
              {/* Sidebar */}
              <motion.div variants={fadeUp} style={{ position: 'sticky', top: 96, height: 'fit-content' }}>
                {API_CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: activeCategory === cat.name ? `${cat.color}15` : 'transparent',
                      color: activeCategory === cat.name ? cat.color : 'var(--text-secondary)',
                      marginBottom: 4, textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}>{cat.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{cat.name}</span>
                  </button>
                ))}
              </motion.div>

              {/* Endpoint list */}
              <motion.div variants={fadeUp}>
                {API_CATEGORIES.filter(c => c.name === activeCategory).map(cat => (
                  <div key={cat.name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${cat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color }}>
                        {cat.icon}
                      </div>
                      <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{cat.name}</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {cat.endpoints.map(ep => (
                        <div key={ep.path} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <MethodBadge method={ep.method} />
                            <code style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{ep.path}</code>
                          </div>
                          <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif", margin: 0 }}>{ep.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </Section>

        {/* ── Rate Limits ──────────────────────────────────────────────────── */}
        <Section bg="var(--bg-surface)">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 8 }}>Rate Limits</h2>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>Limits are per API key, per rolling hour window.</p>
            </motion.div>
            <motion.div variants={fadeUp} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', background: 'var(--bg)', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                {['Tier', 'API Requests', 'Location Updates', 'SOS Triggers'].map(h => (
                  <div key={h} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{h}</div>
                ))}
              </div>
              {RATE_LIMITS.map((r, i) => (
                <div key={r.tier} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '14px 20px', background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg)', borderBottom: i < RATE_LIMITS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{r.tier}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>{r.requests}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>{r.locations}</div>
                  <div style={{ fontSize: 14, color: '#10B981', fontFamily: "'Inter', sans-serif" }}>{r.sos}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </Section>

        {/* ── SDKs ─────────────────────────────────────────────────────────── */}
        <Section bg="var(--bg)">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 8 }}>SDKs & Libraries</h2>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>Official client libraries to get started in minutes.</p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {SDKS.map(sdk => (
                <motion.div
                  key={sdk.name}
                  variants={fadeUp}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <span style={{ fontSize: 28 }}>{sdk.icon}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{sdk.name}</span>
                  </div>
                  <CodeBlock code={sdk.install} language="terminal" />
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Contact ──────────────────────────────────────────────────────── */}
        <Section bg="var(--bg-surface)">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" style={{ textAlign: 'center' }}>
            <motion.div variants={fadeUp}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(75,128,240,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(75,128,240,0.2)' }}>
                <Code size={28} color="#4B80F0" />
              </div>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 16 }}>
                Developer Support
              </h2>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32, fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
                Questions about the API? Our developer team responds within 24 hours on business days.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="mailto:developers@kvlbusinesssolutions.com" className="btn-gold"
                  style={{ padding: '14px 28px', borderRadius: 999, fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontFamily: "'Inter', sans-serif' " }}>
                  Email Developer Support
                </a>
                <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer"
                  style={{ padding: '14px 28px', borderRadius: 999, fontSize: 15, fontWeight: 600, border: '1px solid var(--border)', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: 'var(--bg)', fontFamily: "'Inter', sans-serif" }}>
                  <BookOpen size={16} />
                  Interactive Docs
                </a>
              </div>
            </motion.div>
          </div>
        </Section>

      </main>
      <Footer />
    </>
  );
}
