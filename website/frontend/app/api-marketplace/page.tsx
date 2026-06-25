'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/* ── API stats ────────────────────────────────────────────────────────────── */
const API_STATS = [
  { value: '50+', label: 'API Endpoints', icon: '⚡' },
  { value: '99.9%', label: 'Uptime SLA', icon: '✅' },
  { value: '<100ms', label: 'Avg Response Time', icon: '🚀' },
  { value: '10M+', label: 'API calls / day', icon: '📡' },
];

/* ── API categories ───────────────────────────────────────────────────────── */
const API_CATEGORIES = [
  {
    id: 'location',
    icon: '📍',
    title: 'Location API',
    color: '#3B82F6',
    rgb: '59,130,246',
    description: 'Real-time and historical location data for family members, fleets, and assets.',
    endpoints: [
      'GET /v1/location/family',
      'GET /v1/location/member/{id}',
      'POST /v1/location/share',
      'GET /v1/location/history',
      'GET /v1/location/geofences',
      'POST /v1/location/geofence',
    ],
  },
  {
    id: 'safety',
    icon: '🛡️',
    title: 'Safety API',
    color: '#EF4444',
    rgb: '239,68,68',
    description: 'SOS events, fall detection alerts, driving scores, and emergency broadcast.',
    endpoints: [
      'POST /v1/safety/sos',
      'GET /v1/safety/sos/history',
      'GET /v1/safety/driving-score/{id}',
      'GET /v1/safety/fall-events',
      'POST /v1/safety/emergency-broadcast',
      'GET /v1/safety/alerts',
    ],
  },
  {
    id: 'notifications',
    icon: '🔔',
    title: 'Notification API',
    color: '#F59E0B',
    rgb: '245,158,11',
    description: 'Push notifications, SMS alerts, and webhook delivery for all safety events.',
    endpoints: [
      'POST /v1/notifications/push',
      'POST /v1/notifications/sms',
      'POST /v1/webhooks/register',
      'GET /v1/webhooks/list',
      'DELETE /v1/webhooks/{id}',
      'POST /v1/notifications/broadcast',
    ],
  },
  {
    id: 'analytics',
    icon: '📊',
    title: 'Analytics API',
    color: '#8B5CF6',
    rgb: '139,92,246',
    description: 'Usage metrics, safety reports, route analytics, and behavioral insights.',
    endpoints: [
      'GET /v1/analytics/usage',
      'GET /v1/analytics/safety-report',
      'GET /v1/analytics/routes',
      'GET /v1/analytics/sos-trends',
      'GET /v1/analytics/driving-insights',
      'POST /v1/analytics/export',
    ],
  },
];

/* ── Code examples ────────────────────────────────────────────────────────── */
const CODE_EXAMPLES = {
  location: `const response = await fetch(
  'https://api.gravity.kvlbusinesssolutions.com/v1/location/family',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    }
  }
);

const data = await response.json();
// data.members[0].lat, data.members[0].lng
console.log(data.members);`,

  safety: `// Subscribe to SOS events via WebSocket
const ws = new WebSocket(
  'wss://api.gravity.kvlbusinesssolutions.com/v1/safety/stream',
  ['Bearer YOUR_API_KEY']
);

ws.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  if (alert.type === 'SOS') {
    console.log('Emergency:', alert.memberId, alert.location);
  }
};`,

  notifications: `// Register a webhook
await fetch(
  'https://api.gravity.kvlbusinesssolutions.com/v1/webhooks/register',
  {
    method: 'POST',
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
    body: JSON.stringify({
      url: 'https://yourapp.com/webhooks/gravity',
      events: ['sos.triggered', 'geofence.exit', 'fall.detected'],
    }),
  }
);`,

  analytics: `// Get safety report for date range
const report = await fetch(
  'https://api.gravity.kvlbusinesssolutions.com/v1/analytics/safety-report' +
  '?from=2026-06-01&to=2026-06-13&format=json',
  {
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
  }
);

const { totalSOS, resolvedSOS, avgResponseTime } = await report.json();`,
};

/* ── Pricing tiers ────────────────────────────────────────────────────────── */
const API_PRICING = [
  {
    title: 'Pay-as-you-go',
    price: '₹0.01',
    unit: 'per API call',
    icon: '💳',
    color: '#3B82F6',
    rgb: '59,130,246',
    features: [
      'No monthly commitment',
      'First 1,000 calls free / month',
      'All endpoints included',
      'Basic rate limiting: 100 req/s',
    ],
  },
  {
    title: 'Starter Bundle',
    price: '₹500',
    unit: '10,000 calls / month',
    icon: '📦',
    color: '#10B981',
    rgb: '16,185,129',
    features: [
      '10,000 API calls included',
      'Overage: ₹0.008/call',
      'Rate limiting: 500 req/s',
      'Email support',
    ],
    popular: false,
  },
  {
    title: 'Growth Bundle',
    price: '₹3,999',
    unit: '100,000 calls / month',
    icon: '🚀',
    color: '#D4A853',
    rgb: '212,168,83',
    features: [
      '100,000 API calls included',
      'Overage: ₹0.005/call',
      'Rate limiting: 5,000 req/s',
      'Priority support',
      'WebSocket access',
    ],
    popular: true,
  },
  {
    title: 'Enterprise',
    price: 'Custom',
    unit: 'unlimited calls',
    icon: '🏢',
    color: '#8B5CF6',
    rgb: '139,92,246',
    features: [
      'Unlimited API calls',
      'Dedicated infrastructure',
      '99.9% SLA',
      '24/7 support',
      'Custom rate limits',
      'White-label SDK',
    ],
    popular: false,
  },
];

/* ── Components ───────────────────────────────────────────────────────────── */
function StatCard({ value, label, icon, index }: { value: string; label: string; icon: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="rounded-2xl p-6 text-center"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div
        className="text-3xl font-extrabold mb-1"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: 'linear-gradient(90deg, #D4A853, #F5C842)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {value}
      </div>
      <p className="text-sm text-[#94A3B8]" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</p>
    </motion.div>
  );
}

function APICategory({
  category,
  index,
  isActive,
  onSelect,
}: {
  category: (typeof API_CATEGORIES)[0];
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={onSelect}
      className="rounded-2xl p-5 cursor-pointer transition-all duration-300"
      style={{
        background: isActive ? `rgba(${category.rgb},0.1)` : 'rgba(255,255,255,0.04)',
        border: isActive ? `1.5px solid rgba(${category.rgb},0.5)` : '1px solid rgba(255,255,255,0.07)',
        boxShadow: isActive ? `0 0 24px rgba(${category.rgb},0.2)` : 'none',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `rgba(${category.rgb},0.15)` }}
        >
          {category.icon}
        </div>
        <div>
          <h3
            className="font-bold text-[#F8FAFC]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: isActive ? category.color : undefined }}
          >
            {category.title}
          </h3>
          <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            {category.description}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {category.endpoints.slice(0, 3).map((ep) => (
          <span
            key={ep}
            className="text-[10px] px-2 py-0.5 rounded-md font-mono"
            style={{
              background: `rgba(${category.rgb},0.1)`,
              color: isActive ? category.color : '#94A3B8',
              border: `1px solid rgba(${category.rgb},0.15)`,
            }}
          >
            {ep.split('/').slice(-1)[0]}
          </span>
        ))}
        {category.endpoints.length > 3 && (
          <span className="text-[10px] text-[#94A3B8] px-1 py-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            +{category.endpoints.length - 3} more
          </span>
        )}
      </div>
    </motion.div>
  );
}

function CodeBlock({ code, categoryId }: { code: string; categoryId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Syntax highlighting using spans
  const highlighted = code
    .replace(/('.*?')/g, '<span style="color:#A5F3FC">$1</span>')
    .replace(/\b(const|let|var|await|new|if)\b/g, '<span style="color:#818CF8">$1</span>')
    .replace(/\b(fetch|console\.log|JSON\.parse|JSON\.stringify)\b/g, '<span style="color:#34D399">$1</span>')
    .replace(/(\/\/.*$)/gm, '<span style="color:#64748B">$1</span>');

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {/* Code header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#EF4444]/70" />
          <div className="w-3 h-3 rounded-full bg-[#F59E0B]/70" />
          <div className="w-3 h-3 rounded-full bg-[#10B981]/70" />
          <span className="ml-2 text-xs text-[#64748B] font-mono">example.js</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1 rounded-lg transition-all duration-200 focus:outline-none"
          style={{
            background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
            color: copied ? '#10B981' : '#94A3B8',
            border: copied ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code body */}
      <div
        style={{
          background: '#0A0F1E',
          overflowX: 'auto',
        }}
      >
        <pre
          className="px-5 py-5 text-sm leading-relaxed"
          style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace", color: '#E2E8F0' }}
        >
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>
    </div>
  );
}

function PricingCard({
  plan,
  index,
}: {
  plan: (typeof API_PRICING)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="rounded-2xl p-6 flex flex-col relative"
      style={{
        background: plan.popular ? `rgba(${plan.rgb},0.08)` : 'rgba(255,255,255,0.04)',
        border: plan.popular ? `1.5px solid rgba(${plan.rgb},0.4)` : '1px solid rgba(255,255,255,0.08)',
        boxShadow: hovered ? `0 0 28px rgba(${plan.rgb},0.2)` : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className="text-[10px] font-extrabold px-4 py-1 rounded-full uppercase tracking-widest"
            style={{
              background: 'linear-gradient(135deg, #D4A853, #F5C842)',
              color: '#1A0F05',
            }}
          >
            Most Popular
          </span>
        </div>
      )}

      <div className="text-2xl mb-3">{plan.icon}</div>
      <h3 className="font-bold text-[#F8FAFC] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {plan.title}
      </h3>

      <div className="mt-3 mb-1">
        <span
          className="text-3xl font-extrabold"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: plan.popular ? plan.color : '#F8FAFC',
          }}
        >
          {plan.price}
        </span>
        {plan.price !== 'Custom' && (
          <span className="text-sm text-[#94A3B8] ml-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            /{plan.unit}
          </span>
        )}
      </div>
      {plan.price === 'Custom' && (
        <p className="text-xs text-[#94A3B8] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{plan.unit}</p>
      )}

      <div className="my-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

      <ul className="flex-1 flex flex-col gap-2 mb-6">
        {plan.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2 text-sm">
            <span style={{ color: plan.color, flexShrink: 0, marginTop: '2px' }}>✓</span>
            <span className="text-[#94A3B8]" style={{ fontFamily: "'Inter', sans-serif" }}>{feat}</span>
          </li>
        ))}
      </ul>

      <motion.a
        href={plan.price === 'Custom' ? '/enterprise#contact' : '#get-api-key'}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-xl text-sm font-bold text-center block transition-all duration-200 focus:outline-none"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          ...(plan.popular
            ? {
                background: 'linear-gradient(135deg, #D4A853, #F5C842)',
                color: '#1A0F05',
                boxShadow: hovered ? '0 6px 24px rgba(212,168,83,0.5)' : '0 3px 12px rgba(212,168,83,0.3)',
              }
            : plan.price === 'Custom'
            ? {
                background: 'transparent',
                border: `1.5px solid ${plan.color}`,
                color: plan.color,
              }
            : {
                background: `rgba(${plan.rgb},0.12)`,
                border: `1.5px solid rgba(${plan.rgb},0.3)`,
                color: plan.color,
              }),
        }}
      >
        {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
      </motion.a>
    </motion.div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function APIMarketplacePage() {
  const [activeCategory, setActiveCategory] = useState('location');
  const heroRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const codeInView = useInView(codeRef, { once: true, margin: '-60px' });

  const activeCat = API_CATEGORIES.find((c) => c.id === activeCategory)!;

  return (
    <main style={{ background: '#050A18', minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: '1000px',
            height: '500px',
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, rgba(212,168,83,0.05) 45%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
              style={{
                color: '#3B82F6',
                border: '1px solid rgba(59,130,246,0.35)',
                background: 'rgba(59,130,246,0.07)',
              }}
            >
              ⚡ Developer Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <span className="text-[#F8FAFC]">KVL Track Developer Platform</span>
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #3B82F6, #D4A853, #F5C842)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Build on Safety
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            50+ REST + WebSocket endpoints covering location, safety alerts, notifications, and analytics.
            Build safety-critical applications on KVL Track's battle-tested infrastructure.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              id="get-api-key"
              href="/signup?plan=developer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                color: '#fff',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: '0 6px 24px rgba(59,130,246,0.4)',
              }}
            >
              Get API Key — Free
            </a>
            <a
              href="/api-docs"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-white/[0.06]"
              style={{
                color: '#94A3B8',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              View Documentation →
            </a>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-xs text-[#94A3B8]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            First 1,000 API calls free every month · No credit card required
          </motion.p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-10 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {API_STATS.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </div>
      </section>

      {/* ── API CATEGORIES + CODE ── */}
      <section ref={codeRef} className="py-16 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={codeInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
            style={{
              color: '#D4A853',
              border: '1px solid rgba(212,168,83,0.35)',
              background: 'rgba(212,168,83,0.07)',
            }}
          >
            API Categories
          </span>
          <h2
            className="text-3xl md:text-4xl font-extrabold text-[#F8FAFC]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Everything You Need to Build
          </h2>
          <p className="text-[#94A3B8] mt-3 max-w-xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
            Four comprehensive API surfaces — click any category to see a live code example.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: category cards */}
          <div className="flex flex-col gap-4">
            {API_CATEGORIES.map((cat, i) => (
              <APICategory
                key={cat.id}
                category={cat}
                index={i}
                isActive={activeCategory === cat.id}
                onSelect={() => setActiveCategory(cat.id)}
              />
            ))}
          </div>

          {/* Right: code + endpoint list */}
          <div className="sticky top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Code example */}
                <CodeBlock
                  code={CODE_EXAMPLES[activeCategory as keyof typeof CODE_EXAMPLES]}
                  categoryId={activeCategory}
                />

                {/* Full endpoint list */}
                <div
                  className="mt-4 rounded-2xl p-5"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <p
                    className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-3"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {activeCat.title} Endpoints
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {activeCat.endpoints.map((ep) => {
                      const method = ep.startsWith('GET') ? 'GET' : ep.startsWith('POST') ? 'POST' : 'DELETE';
                      const path = ep.replace(/^(GET|POST|DELETE) /, '');
                      const methodColors: Record<string, string> = { GET: '#3B82F6', POST: '#10B981', DELETE: '#EF4444' };
                      return (
                        <div key={ep} className="flex items-center gap-2">
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded w-12 text-center flex-shrink-0"
                            style={{
                              background: `rgba(${methodColors[method] === '#3B82F6' ? '59,130,246' : methodColors[method] === '#10B981' ? '16,185,129' : '239,68,68'},0.15)`,
                              color: methodColors[method],
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {method}
                          </span>
                          <code
                            className="text-xs text-[#94A3B8]"
                            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
                          >
                            {path}
                          </code>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── FEATURE HIGHLIGHTS ── */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: '🔑',
              title: 'Simple Authentication',
              desc: 'API key auth or OAuth2. Generate keys in your dashboard in seconds. Scoped permissions for read-only or full access.',
              color: '#D4A853',
            },
            {
              icon: '📡',
              title: 'WebSocket Streaming',
              desc: 'Subscribe to real-time location updates and safety events via persistent WebSocket connections. Sub-100ms delivery.',
              color: '#3B82F6',
            },
            {
              icon: '🪝',
              title: 'Webhook Delivery',
              desc: 'Register webhooks for any event type — SOS, geofence exit, fall detection, check-ins. Automatic retry on failure.',
              color: '#10B981',
            },
            {
              icon: '🌍',
              title: 'Global CDN',
              desc: 'API edge nodes in Mumbai, Dubai, Nairobi, London, and New York. Consistent low-latency worldwide.',
              color: '#8B5CF6',
            },
            {
              icon: '📖',
              title: 'Full Documentation',
              desc: 'OpenAPI 3.1 spec, Postman collections, SDK libraries for JavaScript, Python, Kotlin, and Swift.',
              color: '#F59E0B',
            },
            {
              icon: '🔒',
              title: 'Enterprise Security',
              desc: 'End-to-end encryption, SOC 2 Type II compliant, GDPR/DPDP ready. All data stays in your chosen region.',
              color: '#EF4444',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-[#F8FAFC] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {item.title}
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
            style={{
              color: '#D4A853',
              border: '1px solid rgba(212,168,83,0.35)',
              background: 'rgba(212,168,83,0.07)',
            }}
          >
            API Pricing
          </span>
          <h2
            className="text-3xl md:text-4xl font-extrabold text-[#F8FAFC]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Pay for What You Use
          </h2>
          <p className="text-[#94A3B8] mt-3 max-w-xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
            Start free, pay-as-you-go, or commit to a bundle for better rates. No surprises.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {API_PRICING.map((plan, i) => (
            <PricingCard key={plan.title} plan={plan} index={i} />
          ))}
        </div>

        <p className="text-center text-xs text-[#94A3B8] mt-6" style={{ fontFamily: "'Inter', sans-serif" }}>
          All plans include HTTPS, 99.9% uptime, and access to the developer dashboard. Prices in INR.
        </p>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65 }}
          className="max-w-3xl mx-auto rounded-3xl p-10 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(13,22,53,0.95) 50%, rgba(212,168,83,0.08) 100%)',
            border: '1px solid rgba(59,130,246,0.25)',
            boxShadow: '0 0 80px rgba(59,130,246,0.1)',
          }}
        >
          <div className="text-5xl mb-4">⚡</div>
          <h2
            className="text-3xl md:text-4xl font-extrabold text-[#F8FAFC] mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Start Building Today
          </h2>
          <p className="text-[#94A3B8] mb-8 text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
            Get your API key in 60 seconds. First 1,000 calls free every month. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              href="/signup?plan=developer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                color: '#fff',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: '0 6px 28px rgba(59,130,246,0.4)',
              }}
            >
              🔑 Get API Key — Free
            </motion.a>
            <motion.a
              href="/api-docs"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#F8FAFC',
                border: '1px solid rgba(255,255,255,0.12)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              📖 Read the Docs
            </motion.a>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
