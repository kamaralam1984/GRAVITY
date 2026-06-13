'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle, Mail, Building2, Users, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PricingSection from '@/components/sections/PricingSection';
import { REGIONAL_PRICING, PRICING_PLANS } from '@/lib/constants';
import JsonLd from '@/components/seo/JsonLd';
import { buildFAQSchema } from '@/lib/seo/schemas';

/* ── Extended FAQ (12 questions) ──────────────────────────────────────────── */
const FAQ_EXTENDED = [
  {
    question: 'Can I change plans anytime?',
    answer:
      'Yes. You can upgrade, downgrade, or cancel from your account settings at any time. Changes are instant, and any unused portion of a prepaid period is credited toward your next billing cycle.',
  },
  {
    question: 'Is the Free plan truly free forever?',
    answer:
      'Yes — no credit card, no expiry, no hidden fees. The Free plan includes live location for up to 3 members, SOS alerts, basic geofencing, and the check-in system for as long as you use Gravity.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a 30-day money-back guarantee on all paid plans. Contact support within 30 days of your first payment for a full refund, no questions asked.',
  },
  {
    question: 'Is my location data safe and private?',
    answer:
      'All location data is end-to-end encrypted. We never sell or share your data with third parties or advertisers. You control who sees your location, and you can delete all your data from the app at any time.',
  },
  {
    question: 'How many members can join my circle?',
    answer:
      'Free: 3 members. Premium: 10 members. Family Plus: 25 members. Elder Care: 10 members. School Edition: 500 students. Enterprise and White Label: unlimited.',
  },
  {
    question: 'Do you support family accounts across different countries?',
    answer:
      'Absolutely. Gravity works in 50+ countries. Circle members can be in different countries and still appear on the shared family map in real time. Payments can be made in local currency in Kenya, India, UAE, and more.',
  },
  {
    question: 'Is there a student or non-profit discount?',
    answer:
      'Yes. We offer 50% discounts for verified educational institutions and registered non-profits. Contact our team at billing@trackalways.com with your verification documents.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept credit and debit cards (Stripe), Apple Pay, Google Pay, M-Pesa, Airtel Money (Kenya), UPI/Razorpay (India), and Flutterwave/Paystack (Africa). Payment options depend on your region.',
  },
  {
    question: 'Do you offer white label?',
    answer:
      'Yes — Gravity offers full white-label customization. Your brand, your domain, your app. We handle infrastructure, compliance, and updates while you focus on your customers. Contact our enterprise team for a tailored quote and onboarding plan.',
  },
  {
    question: 'What is the Enterprise SLA?',
    answer:
      '99.9% uptime guaranteed with a 1-hour critical incident response time. Enterprise plans include dedicated infrastructure, multi-region failover, 24/7 phone support, and quarterly business reviews.',
  },
  {
    question: 'Is there an API?',
    answer:
      'Yes — Gravity offers a full REST + WebSocket API with 50+ endpoints covering location, safety events, notifications, analytics, and more. Available on Enterprise and White Label plans. Visit our API Marketplace for documentation and SDKs.',
  },
  {
    question: 'Can white label use a custom domain?',
    answer:
      'Absolutely. White-label deployments fully support custom domains such as gravity.yourschool.edu or safety.yourcompany.com — with SSL certificates provisioned and renewed automatically at no extra cost.',
  },
];

/* ── Accordion item ─────────────────────────────────────────────────────────── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.03] transition-colors duration-150 focus:outline-none"
      >
        <span
          className="text-[#F8FAFC] font-semibold text-sm md:text-base pr-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {question}
        </span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-[#94A3B8] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p
              className="px-6 pb-5 text-[#94A3B8] text-sm leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Competitor comparison table ─────────────────────────────────────────── */
const COMP_FEATURES = [
  { feature: 'Real-time tracking',   gravity: true,    life360: true,    googleFL: true,    findMy: true    },
  { feature: 'AI Safety Guardian',   gravity: true,    life360: false,   googleFL: false,   findMy: false   },
  { feature: 'School bus tracking',  gravity: true,    life360: false,   googleFL: false,   findMy: false   },
  { feature: 'Fall detection',       gravity: true,    life360: false,   googleFL: false,   findMy: false   },
  { feature: 'Driving safety',       gravity: true,    life360: true,    googleFL: false,   findMy: false   },
  { feature: 'Elder care module',    gravity: true,    life360: false,   googleFL: false,   findMy: false   },
  { feature: 'SOS emergency',        gravity: true,    life360: true,    googleFL: false,   findMy: true    },
  { feature: 'White label',          gravity: true,    life360: false,   googleFL: false,   findMy: false   },
  { feature: 'Enterprise API',       gravity: true,    life360: false,   googleFL: false,   findMy: false   },
  { feature: 'India price/month',    gravity: '₹299',  life360: '₹1,200', googleFL: 'Free', findMy: 'Free'  },
];

function CompetitorTable() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const COLS = [
    { key: 'gravity',  label: 'Gravity',           gold: true  },
    { key: 'life360',  label: 'Life360',            gold: false },
    { key: 'googleFL', label: 'Google Family Link', gold: false },
    { key: 'findMy',   label: 'Find My',            gold: false },
  ];

  return (
    <div ref={ref} className="overflow-x-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <th
                className="text-left py-4 px-5 text-[#94A3B8] font-semibold"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Feature
              </th>
              {COLS.map((col) => (
                <th
                  key={col.key}
                  className="text-center py-4 px-4 font-bold text-sm"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: col.gold ? '#D4A853' : '#94A3B8',
                    ...(col.gold ? {
                      background: 'rgba(212,168,83,0.06)',
                      borderLeft: '1px solid rgba(212,168,83,0.2)',
                      borderRight: '1px solid rgba(212,168,83,0.2)',
                    } : {}),
                  }}
                >
                  {col.gold && <span className="block text-[10px] font-normal mb-0.5 text-[#D4A853]/70">★ Best</span>}
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMP_FEATURES.map((row, i) => (
              <motion.tr
                key={row.feature}
                initial={{ opacity: 0, x: -12 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                style={{ borderBottom: i < COMP_FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
              >
                <td
                  className="py-3.5 px-5 text-[#F8FAFC] font-medium"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {row.feature}
                </td>
                {COLS.map((col) => {
                  const val = row[col.key as keyof typeof row];
                  return (
                    <td
                      key={col.key}
                      className="py-3.5 px-4 text-center"
                      style={{
                        ...(col.gold ? {
                          background: 'rgba(212,168,83,0.04)',
                          borderLeft: '1px solid rgba(212,168,83,0.12)',
                          borderRight: '1px solid rgba(212,168,83,0.12)',
                        } : {}),
                      }}
                    >
                      {val === true ? (
                        <span style={{ color: col.gold ? '#D4A853' : '#10B981', fontSize: '16px' }}>✓</span>
                      ) : val === false ? (
                        <span style={{ color: 'rgba(148,163,184,0.25)', fontSize: '14px' }}>—</span>
                      ) : (
                        <span
                          style={{
                            color: col.gold ? '#D4A853' : '#94A3B8',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '13px',
                            fontWeight: col.gold ? 700 : 400,
                          }}
                        >
                          {val as string}
                        </span>
                      )}
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

/* ── Regional pricing table ──────────────────────────────────────────────── */
function RegionalTable() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const allPlans = ['Free', 'Premium', 'Family Plus', 'Elder Care'];

  const TABLE_DATA: Record<
    string,
    { free: string; premium: string; familyPlus: string; elderCare: string; gateway: string; flag: string }
  > = {
    India: {
      flag: '🇮🇳',
      free: 'Free',
      premium: '₹299/mo',
      familyPlus: '₹499/mo',
      elderCare: '₹399/mo',
      gateway: 'UPI · Razorpay',
    },
    'Kenya / East Africa': {
      flag: '🇰🇪',
      free: 'Free',
      premium: 'KES 550/mo',
      familyPlus: 'KES 950/mo',
      elderCare: 'KES 750/mo',
      gateway: 'M-Pesa · Airtel Money',
    },
    'UAE / MENA': {
      flag: '🇦🇪',
      free: 'Free',
      premium: 'AED 14/mo',
      familyPlus: 'AED 25/mo',
      elderCare: 'AED 20/mo',
      gateway: 'Stripe · PayTabs',
    },
    'UK / Europe': {
      flag: '🇬🇧',
      free: 'Free',
      premium: '£3.49/mo',
      familyPlus: '£5.99/mo',
      elderCare: '£4.99/mo',
      gateway: 'Stripe · PayPal',
    },
    'USA / Canada': {
      flag: '🇺🇸',
      free: 'Free',
      premium: '$3.99/mo',
      familyPlus: '$6.99/mo',
      elderCare: '$5.49/mo',
      gateway: 'Stripe · Apple Pay',
    },
    'Rest of Africa': {
      flag: '🌍',
      free: 'Free',
      premium: '$1.99/mo',
      familyPlus: '$3.99/mo',
      elderCare: '$2.99/mo',
      gateway: 'Flutterwave · Paystack',
    },
  };

  return (
    <div ref={ref} className="overflow-x-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="text-left py-4 px-4 text-[#94A3B8] font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>Region</th>
              {allPlans.map((p) => (
                <th
                  key={p}
                  className={`text-center py-4 px-4 font-semibold ${p === 'Family Plus' ? 'text-[#D4A853]' : 'text-[#94A3B8]'}`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {p}
                </th>
              ))}
              <th className="text-left py-4 px-4 text-[#94A3B8] font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>Payment</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(TABLE_DATA).map(([region, data], i) => (
              <motion.tr
                key={region}
                initial={{ opacity: 0, x: -16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-4 px-4 text-[#F8FAFC] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <span className="mr-2">{data.flag}</span>{region}
                </td>
                <td className="py-4 px-4 text-center text-[#94A3B8]" style={{ fontFamily: "'Inter', sans-serif" }}>{data.free}</td>
                <td className="py-4 px-4 text-center text-blue-300 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>{data.premium}</td>
                <td className="py-4 px-4 text-center text-[#D4A853] font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>{data.familyPlus}</td>
                <td className="py-4 px-4 text-center text-emerald-300 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>{data.elderCare}</td>
                <td className="py-4 px-4 text-[#94A3B8] text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>{data.gateway}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

/* ── Money Back Guarantee Banner ──────────────────────────────────────────── */
function MoneyBackBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="max-w-7xl mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative rounded-2xl overflow-hidden p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        style={{
          background: 'linear-gradient(135deg, #B8760A 0%, #D4A853 40%, #F5C842 65%, #D4A853 85%, #B8760A 100%)',
        }}
      >
        {/* Shine effect */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
            width: '60%',
          }}
        />
        <div className="flex items-center gap-4 relative z-10">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(0,0,0,0.15)' }}
          >
            <ShieldCheck size={32} color="#1A0F05" strokeWidth={2.5} />
          </div>
          <div>
            <h3
              className="text-2xl font-extrabold text-[#1A0F05]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              30-Day Money-Back Guarantee
            </h3>
            <p
              className="text-[#3D2800] text-sm mt-0.5"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Not happy? Get a full refund within 30 days — no questions asked. Risk-free safety for your family.
            </p>
          </div>
        </div>
        <a
          href="/#download"
          className="flex-shrink-0 px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 relative z-10"
          style={{
            background: 'rgba(0,0,0,0.2)',
            color: '#1A0F05',
            border: '1.5px solid rgba(0,0,0,0.15)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Try Gravity Risk-Free →
        </a>
      </motion.div>
    </div>
  );
}

/* ── Enterprise section ───────────────────────────────────────────────────── */
function EnterpriseSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [formState, setFormState] = useState({ name: '', email: '', company: '', teamSize: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you! Our enterprise team will contact you within 24 hours.');
  };

  const ENTERPRISE_FEATURES = [
    'Unlimited circle members',
    'Multi-team management console',
    'Custom geofencing & alert rules',
    'Full REST + WebSocket API',
    'SSO / SAML integration',
    'White-label option',
    'Dedicated account manager',
    'SLA-backed 99.9% uptime',
    '24/7 phone support',
    'Custom billing & invoicing',
  ];

  return (
    <section ref={ref} className="py-24 max-w-7xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden border border-violet-500/20 p-8 md:p-12"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(13,22,53,0.9) 60%, rgba(59,130,246,0.05) 100%)',
          boxShadow: '0 0 60px rgba(139,92,246,0.1)',
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-violet-500/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-12">
          {/* Left: info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Building2 size={22} className="text-violet-400" />
              <span className="text-xs font-bold text-violet-300 uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>
                Enterprise / B2B
              </span>
            </div>
            <h2
              className="text-3xl md:text-4xl font-extrabold text-[#F8FAFC] mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Gravity for{' '}
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                Organizations
              </span>
            </h2>
            <p className="text-[#94A3B8] mb-8 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Schools, hospitals, logistics companies, and NGOs use Gravity to keep their people safe.
              Custom pricing, dedicated support, and flexible deployment for teams of any size.
            </p>
            <ul className="grid grid-cols-2 gap-2.5">
              {ENTERPRISE_FEATURES.map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-sm text-[#94A3B8]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <CheckCircle size={14} className="text-violet-400 flex-shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center gap-3 text-sm text-[#94A3B8]" style={{ fontFamily: "'Inter', sans-serif" }}>
              <Users size={16} className="text-violet-300" />
              <span>Trusted by schools, healthcare providers, and NGOs in 30+ countries</span>
            </div>
          </div>

          {/* Right: contact form */}
          <div>
            <div className="rounded-2xl p-6 backdrop-blur-xl bg-white/[0.04] border border-white/[0.08]">
              <h3 className="text-[#F8FAFC] font-bold text-xl mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Get a Custom Quote
              </h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Full Name</label>
                    <input type="text" name="name" required value={formState.name} onChange={handleChange} placeholder="Jane Smith"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:border-violet-500/50 transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }} />
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Work Email</label>
                    <input type="email" name="email" required value={formState.email} onChange={handleChange} placeholder="jane@company.com"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:border-violet-500/50 transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Organization Name</label>
                  <input type="text" name="company" required value={formState.company} onChange={handleChange} placeholder="Acme Corp"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:border-violet-500/50 transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif" }} />
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Team Size</label>
                  <select name="teamSize" value={formState.teamSize} onChange={handleChange}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-violet-500/50 transition-colors appearance-none"
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                    <option value="" style={{ background: '#0D1635' }}>Select team size</option>
                    <option value="10-50" style={{ background: '#0D1635' }}>10 – 50 people</option>
                    <option value="50-200" style={{ background: '#0D1635' }}>50 – 200 people</option>
                    <option value="200-1000" style={{ background: '#0D1635' }}>200 – 1,000 people</option>
                    <option value="1000+" style={{ background: '#0D1635' }}>1,000+ people</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>How can we help?</label>
                  <textarea name="message" value={formState.message} onChange={handleChange} rows={3} placeholder="Tell us about your use case..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                    style={{ fontFamily: "'Inter', sans-serif" }} />
                </div>
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 text-white font-semibold text-sm hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] active:scale-95 transition-all duration-200 focus:outline-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}>
                  <Mail size={16} />
                  Send Enquiry
                </button>
                <p className="text-center text-xs text-[#94A3B8]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  We respond within 24 hours, Monday – Friday.
                </p>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function PricingPage() {
  const tableRef = useRef<HTMLElement>(null);
  const tableInView = useInView(tableRef as React.RefObject<Element>, { once: true, margin: '-60px' });
  const compRef = useRef<HTMLElement>(null);
  const compInView = useInView(compRef as React.RefObject<Element>, { once: true, margin: '-60px' });
  const faqRef = useRef<HTMLElement>(null);
  const faqInView = useInView(faqRef as React.RefObject<Element>, { once: true, margin: '-60px' });

  return (
    <main style={{ background: '#050A18', minHeight: '100vh' }}>
      <JsonLd data={buildFAQSchema(FAQ_EXTENDED)} />
      <Navbar />

      {/* Main pricing section */}
      <div className="pt-20">
        <PricingSection />
      </div>

      {/* Money-back guarantee banner */}
      <MoneyBackBanner />

      {/* Competitor comparison */}
      <section ref={compRef} className="py-16 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={compInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-xl bg-white/[0.04] border border-[#D4A853]/30 mb-4"
            style={{ color: '#D4A853', fontFamily: "'Inter', sans-serif" }}
          >
            <span>⚡</span>
            How Gravity compares
          </span>
          <h2
            className="text-3xl md:text-4xl font-extrabold text-[#F8FAFC]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Gravity vs. The Competition
          </h2>
          <p
            className="text-[#94A3B8] mt-3 max-w-2xl"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            See how Gravity stacks up against Life360, Google Family Link, and Find My — across every feature that matters.
          </p>
        </motion.div>

        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
          <CompetitorTable />
        </div>

        <p className="text-[#94A3B8] text-xs mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
          * Comparison based on publicly available pricing and features as of June 2026. Life360 India price is approximate for premium tier.
        </p>
      </section>

      {/* Regional pricing table */}
      <section ref={tableRef} className="py-20 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={tableInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-300 backdrop-blur-xl bg-white/[0.04] border border-blue-500/30 mb-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <span>🌍</span>
            Local pricing in your currency
          </span>
          <h2
            className="text-3xl md:text-4xl font-extrabold text-[#F8FAFC]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Regional Pricing
          </h2>
          <p className="text-[#94A3B8] mt-3 max-w-2xl" style={{ fontFamily: "'Inter', sans-serif" }}>
            We price Gravity in local currencies so that every family around the world can afford safety. All annual plans save ~30%.
          </p>
        </motion.div>

        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
          <RegionalTable />
        </div>

        <p className="text-[#94A3B8] text-xs mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
          * Monthly rates shown. Annual billing saves ~30%. Local currency rates are approximate and may vary with exchange rates.
        </p>
      </section>

      {/* Extended FAQ */}
      <section ref={faqRef} className="py-16 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={faqInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <h2
            className="text-3xl md:text-4xl font-extrabold text-[#F8FAFC]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Everything You Need to Know
          </h2>
          <p className="text-[#94A3B8] mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            Common questions about plans, billing, privacy, and enterprise features.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {FAQ_EXTENDED.map((item, i) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 16 }}
              animate={faqInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.05 }}
            >
              <FAQItem question={item.question} answer={item.answer} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enterprise section */}
      <EnterpriseSection />

      <Footer />
    </main>
  );
}
