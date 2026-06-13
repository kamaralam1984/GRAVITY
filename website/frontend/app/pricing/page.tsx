'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle, Mail, Building2, Users } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PricingSection from '@/components/sections/PricingSection';
import { REGIONAL_PRICING, PRICING_PLANS } from '@/lib/constants';
import JsonLd from '@/components/seo/JsonLd';
import { buildFAQSchema } from '@/lib/seo/schemas';

/* ── Extended FAQ (8 questions) ─────────────────────────────────────────────── */
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
      'Free: up to 3 members. Family: up to 10. Care: up to 10. Bundle: up to 25. All plans let the circle leader add and remove members freely.',
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
];

/* ── Accordion item ──────────────────────────────────────────────────────────── */
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
          className={`flex-shrink-0 text-[#94A3B8] transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
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

/* ── Regional pricing table ──────────────────────────────────────────────────── */
function RegionalTable() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const allPlans = ['Free', 'Family', 'Care', 'Bundle'];

  const TABLE_DATA: Record<
    string,
    { free: string; family: string; care: string; bundle: string; gateway: string; flag: string }
  > = {
    'Kenya / East Africa': {
      flag: '🇰🇪',
      free: 'Free',
      family: 'KES 650/mo',
      care: 'KES 1,050/mo',
      bundle: 'KES 1,550/mo',
      gateway: 'M-Pesa · Airtel Money',
    },
    India: {
      flag: '🇮🇳',
      free: 'Free',
      family: '₹399/mo',
      care: '₹649/mo',
      bundle: '₹949/mo',
      gateway: 'UPI · Razorpay',
    },
    'UAE / MENA': {
      flag: '🇦🇪',
      free: 'Free',
      family: 'AED 18/mo',
      care: 'AED 29/mo',
      bundle: 'AED 43/mo',
      gateway: 'Stripe · PayTabs',
    },
    'UK / Europe': {
      flag: '🇬🇧',
      free: 'Free',
      family: '£3.99/mo',
      care: '£6.49/mo',
      bundle: '£9.49/mo',
      gateway: 'Stripe · PayPal',
    },
    'USA / Canada': {
      flag: '🇺🇸',
      free: 'Free',
      family: '$4.99/mo',
      care: '$7.99/mo',
      bundle: '$11.99/mo',
      gateway: 'Stripe · Apple Pay',
    },
    'Rest of Africa': {
      flag: '🌍',
      free: 'Free',
      family: '$2.99/mo',
      care: '$4.99/mo',
      bundle: '$7.49/mo',
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
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th
                className="text-left py-4 px-4 text-[#94A3B8] font-semibold"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Region
              </th>
              {allPlans.map((p) => (
                <th
                  key={p}
                  className={`text-center py-4 px-4 font-semibold ${
                    p === 'Family' ? 'text-blue-300' : 'text-[#94A3B8]'
                  }`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {p}
                </th>
              ))}
              <th
                className="text-left py-4 px-4 text-[#94A3B8] font-semibold"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Payment Gateway
              </th>
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
                <td
                  className="py-4 px-4 text-[#F8FAFC] font-medium"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <span className="mr-2">{data.flag}</span>
                  {region}
                </td>
                <td
                  className="py-4 px-4 text-center text-[#94A3B8]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {data.free}
                </td>
                <td
                  className="py-4 px-4 text-center text-blue-300 font-semibold"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {data.family}
                </td>
                <td
                  className="py-4 px-4 text-center text-[#94A3B8]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {data.care}
                </td>
                <td
                  className="py-4 px-4 text-center text-amber-300 font-semibold"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {data.bundle}
                </td>
                <td
                  className="py-4 px-4 text-[#94A3B8] text-xs"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {data.gateway}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

/* ── Enterprise section ──────────────────────────────────────────────────────── */
function EnterpriseSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission placeholder
    alert('Thank you! Our enterprise team will contact you within 24 hours.');
  };

  const ENTERPRISE_FEATURES = [
    'Unlimited circle members',
    'Multi-team management console',
    'Custom geofencing & alert rules',
    'API access & webhooks',
    'SSO / SAML integration',
    'White-label option',
    'Dedicated account manager',
    'SLA-backed 99.99% uptime',
    '24/7 phone support',
    'Custom billing & invoicing',
  ];

  return (
    <section
      ref={ref}
      className="py-24 max-w-7xl mx-auto px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden border border-violet-500/20 p-8 md:p-12"
        style={{
          background:
            'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(13,22,53,0.9) 60%, rgba(59,130,246,0.05) 100%)',
          boxShadow: '0 0 60px rgba(139,92,246,0.1)',
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-violet-500/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-12">
          {/* Left: info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Building2 size={22} className="text-violet-400" />
              <span
                className="text-xs font-bold text-violet-300 uppercase tracking-widest"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
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

            <p
              className="text-[#94A3B8] mb-8 leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Schools, hospitals, logistics companies, and NGOs use Gravity to keep their
              people safe. Custom pricing, dedicated support, and flexible deployment for
              teams of any size.
            </p>

            <ul className="grid grid-cols-2 gap-2.5">
              {ENTERPRISE_FEATURES.map((feat) => (
                <li
                  key={feat}
                  className="flex items-center gap-2 text-sm text-[#94A3B8]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
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
            <div
              className="rounded-2xl p-6 backdrop-blur-xl bg-white/[0.04] border border-white/[0.08]"
            >
              <h3
                className="text-[#F8FAFC] font-bold text-xl mb-6"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Get a Custom Quote
              </h3>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs text-[#94A3B8] mb-1.5 font-medium"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formState.name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:border-violet-500/50 transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs text-[#94A3B8] mb-1.5 font-medium"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Work Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formState.email}
                      onChange={handleChange}
                      placeholder="jane@company.com"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:border-violet-500/50 transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs text-[#94A3B8] mb-1.5 font-medium"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Organization Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={formState.company}
                    onChange={handleChange}
                    placeholder="Acme Corp"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:border-violet-500/50 transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs text-[#94A3B8] mb-1.5 font-medium"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Team Size
                  </label>
                  <select
                    name="teamSize"
                    value={formState.teamSize}
                    onChange={handleChange}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-violet-500/50 transition-colors appearance-none"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <option value="" style={{ background: '#0D1635' }}>Select team size</option>
                    <option value="10-50" style={{ background: '#0D1635' }}>10 – 50 people</option>
                    <option value="50-200" style={{ background: '#0D1635' }}>50 – 200 people</option>
                    <option value="200-1000" style={{ background: '#0D1635' }}>200 – 1,000 people</option>
                    <option value="1000+" style={{ background: '#0D1635' }}>1,000+ people</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-xs text-[#94A3B8] mb-1.5 font-medium"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    How can we help?
                  </label>
                  <textarea
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us about your use case..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 text-white font-semibold text-sm hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] active:scale-95 transition-all duration-200 focus:outline-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Mail size={16} />
                  Send Enquiry
                </button>

                <p
                  className="text-center text-xs text-[#94A3B8]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
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

/* ── Page ────────────────────────────────────────────────────────────────────── */
export default function PricingPage() {
  const tableRef = useRef<HTMLElement>(null);
  const tableInView = useInView(tableRef as React.RefObject<Element>, { once: true, margin: '-60px' });
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

      {/* Regional pricing table */}
      <section
        ref={tableRef}
        className="py-20 max-w-7xl mx-auto px-6"
      >
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
          <p
            className="text-[#94A3B8] mt-3 max-w-2xl"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            We price Gravity in local currencies so that every family around the world can
            afford safety. All annual plans save 20%.
          </p>
        </motion.div>

        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
          <RegionalTable />
        </div>

        <p
          className="text-[#94A3B8] text-xs mt-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          * Prices shown are monthly rates. Annual billing saves 20%. Local currency rates are
          approximate and may vary with exchange rates.
        </p>
      </section>

      {/* Extended FAQ */}
      <section
        ref={faqRef}
        className="py-16 max-w-7xl mx-auto px-6"
      >
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
          <p
            className="text-[#94A3B8] mt-3"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Common questions about plans, billing, and privacy.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {FAQ_EXTENDED.map((item, i) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 16 }}
              animate={faqInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.06 }}
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
