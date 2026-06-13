'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  AlertOctagon,
  Map,
  MapPin,
  CheckCircle,
  Navigation,
  History,
  EyeOff,
  BatteryLow,
  Activity,
  BarChart2,
  Heart,
  Pill,
  UserCheck,
  Image,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { FEATURES } from '@/lib/constants';
import type { Feature } from '@/lib/constants';

/* ── Icon map ────────────────────────────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ReactNode> = {
  AlertOctagon: <AlertOctagon size={24} />,
  Map: <Map size={24} />,
  MapPin: <MapPin size={24} />,
  CheckCircle: <CheckCircle size={24} />,
  Navigation: <Navigation size={24} />,
  History: <History size={24} />,
  EyeOff: <EyeOff size={24} />,
  BatteryLow: <BatteryLow size={24} />,
  Activity: <Activity size={24} />,
  BarChart2: <BarChart2 size={24} />,
  Heart: <Heart size={24} />,
  Pill: <Pill size={24} />,
  UserCheck: <UserCheck size={24} />,
  Image: <Image size={24} />,
};

/* ── Use-case chips for each feature ────────────────────────────────────────── */
const USE_CASES: Record<string, string[]> = {
  sos: ['Emergencies', 'Solo travel', 'Kids walking home'],
  'live-map': ['Daily check-ins', 'School pickups', 'Travel'],
  geofencing: ['School zones', 'Home arrival', 'Workplace'],
  'check-in': ['Late nights', 'Long commutes', 'Solo hiking'],
  'journey-sharing': ['Airport pickups', 'Late commutes', 'Solo travel'],
  'location-history': ['Retracing steps', 'Routine review', 'Safe arrivals'],
  'privacy-hours': ['Work time', 'Teen privacy', 'Personal space'],
  'low-battery': ['School days', 'Long journeys', 'Elderly care'],
  'fall-detection': ['Seniors living alone', 'Solo hikers', 'Medical conditions'],
  'routine-monitoring': ['Elderly parents', 'Children', 'Post-surgery recovery'],
  'wellness-check': ['Mental health', 'Remote family', 'Daily bonding'],
  'medication-reminders': ['Chronic conditions', 'Post-op care', 'Elderly parents'],
  'caregiver-mode': ['Professional caregivers', 'Multi-elder households'],
  'family-moments': ['Family bonding', 'Milestones', 'Daily memories'],
};

/* ── Category badge ──────────────────────────────────────────────────────────── */
const CATEGORY_STYLES: Record<string, { label: string; className: string }> = {
  core: { label: 'Core', className: 'bg-blue-500/15 text-blue-300 border border-blue-500/30' },
  care: { label: 'Elderly Care', className: 'bg-amber-500/15 text-amber-300 border border-amber-500/30' },
  safety: { label: 'Safety', className: 'bg-red-500/15 text-red-300 border border-red-500/30' },
};

/* ── Feature card ────────────────────────────────────────────────────────────── */
function FeatureCard({ feature, delay }: { feature: Feature; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const cat = CATEGORY_STYLES[feature.category];
  const useCases = USE_CASES[feature.id] ?? [];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl p-6 flex flex-col gap-4 backdrop-blur-xl bg-white/[0.04] border ${
        feature.highlight
          ? 'border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.12)]'
          : 'border-white/[0.08]'
      }`}
    >
      {/* Highlight glow */}
      {feature.highlight && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-violet-500/5 pointer-events-none" />
      )}

      {/* Icon + category */}
      <div className="flex items-start justify-between">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.color} bg-current/10`}
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <span className={feature.color}>{ICON_MAP[feature.icon]}</span>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${cat.className}`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {cat.label}
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-[#F8FAFC] font-bold text-lg"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p
        className="text-[#94A3B8] text-sm leading-relaxed flex-1"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {feature.description}
      </p>

      {/* Use cases */}
      {useCases.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.06]">
          {useCases.map((uc) => (
            <span
              key={uc}
              className="text-xs px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[#94A3B8]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {uc}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────────── */
export default function FeaturesPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  const coreFeatures = FEATURES.filter((f) => f.category === 'core');
  const careFeatures = FEATURES.filter((f) => f.category === 'care');
  const safetyFeatures = FEATURES.filter((f) => f.category === 'safety');

  return (
    <main style={{ background: '#050A18', minHeight: '100vh' }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-blue-600/8 blur-[140px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6" ref={heroRef}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-300 backdrop-blur-xl bg-white/[0.04] border border-blue-500/30 mb-6"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <span>✦</span>
              14 powerful features
            </span>

            <h1
              className="text-5xl md:text-6xl font-extrabold text-[#F8FAFC] leading-[1.05] tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Built for{' '}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Every Family
              </span>
            </h1>

            <p
              className="mt-6 text-lg text-[#94A3B8] leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              From a one-tap SOS to AI-powered fall detection, every feature in Gravity
              was designed around one question: what do families actually need to feel safe?
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                { label: '14 Features', color: 'text-blue-300' },
                { label: '50,000+ Families', color: 'text-violet-300' },
                { label: 'iOS & Android', color: 'text-emerald-300' },
                { label: 'Free to Start', color: 'text-amber-300' },
              ].map(({ label, color }) => (
                <span
                  key={label}
                  className={`${color} text-sm px-4 py-2 rounded-full backdrop-blur-xl bg-white/[0.04] border border-white/[0.08]`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Safety features ── */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 rounded-full bg-[#EF4444]" />
          <h2
            className="text-2xl font-bold text-[#F8FAFC]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Safety Features
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safetyFeatures.map((f, i) => (
            <FeatureCard key={f.id} feature={f} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* ── Core features ── */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 rounded-full bg-[#3B82F6]" />
          <h2
            className="text-2xl font-bold text-[#F8FAFC]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Core Features
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((f, i) => (
            <FeatureCard key={f.id} feature={f} delay={i * 0.07} />
          ))}
        </div>
      </section>

      {/* ── Elderly Care call-out ── */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div
          className="relative rounded-3xl p-8 md:p-12 overflow-hidden border border-amber-500/30"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(13,22,53,0.8) 100%)',
            boxShadow: '0 0 60px rgba(245,158,11,0.12)',
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/5 blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 rounded-full bg-[#F59E0B]" />
              <span
                className="text-xs font-bold text-amber-300 uppercase tracking-widest"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Elderly Care Suite
              </span>
            </div>

            <h2
              className="text-3xl md:text-4xl font-extrabold text-[#F8FAFC] mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              The most comprehensive
              <br />
              <span className="text-[#F59E0B]">elderly care toolkit</span> in any app
            </h2>

            <p
              className="text-[#94A3B8] max-w-2xl mb-8 leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Gravity&apos;s Care plan combines fall detection, routine monitoring, wellness check-ins,
              medication reminders, and a dedicated caregiver dashboard into one seamless experience.
              Designed to preserve independence while giving families real assurance.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {careFeatures.map((f, i) => (
                <FeatureCard key={f.id} feature={f} delay={i * 0.08} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-3xl md:text-4xl font-extrabold text-[#F8FAFC] mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Ready to protect your family?
          </h2>
          <p
            className="text-[#94A3B8] mb-8 max-w-md mx-auto"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            All core features are free. Upgrade to unlock the full power of Gravity.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#download"
              className="inline-flex items-center px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-600 hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.45)] active:scale-95 transition-all duration-200"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Download Free
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center px-8 py-4 rounded-xl text-base font-semibold text-[#F8FAFC] backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] hover:border-blue-400/50 hover:bg-white/[0.07] active:scale-95 transition-all duration-200"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              View Pricing
            </a>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
