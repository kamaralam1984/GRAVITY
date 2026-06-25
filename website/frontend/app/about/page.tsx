'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Shield,
  Eye,
  Heart,
  Watch,
  Truck,
  Globe,
  Tag,
  Sparkles,
  MapPin,
  Users,
  Linkedin,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ECOSYSTEM } from '@/lib/constants';

/* ── Icon map for ecosystem ─────────────────────────────────────────────────── */
const ECOSYSTEM_ICON_MAP: Record<string, React.ReactNode> = {
  Watch: <Watch size={22} />,
  Shield: <Shield size={22} />,
  Truck: <Truck size={22} />,
  Sparkles: <Sparkles size={22} />,
  Tag: <Tag size={22} />,
  Globe: <Globe size={22} />,
};

/* ── Founding principles ─────────────────────────────────────────────────────── */
const PRINCIPLES = [
  {
    icon: <Shield size={28} className="text-blue-400" />,
    title: 'Consent First',
    description:
      'No one is tracked without their knowledge and explicit consent. Every circle member can see who can see them, control their visibility, and opt out at any time. Safety should never feel like surveillance.',
  },
  {
    icon: <Eye size={28} className="text-violet-400" />,
    title: 'Transparency Always',
    description:
      'We publish our privacy practices in plain language, not legalese. We tell you exactly what data we collect, how long we keep it, and who can access it. No dark patterns. No hidden defaults.',
  },
  {
    icon: <Heart size={28} className="text-pink-400" />,
    title: 'Connection Over Control',
    description:
      'KVL Track is not a surveillance tool — it is a closeness tool. We design every feature to strengthen family bonds, not enable control. Privacy hours, consent flows, and member autonomy are built into the core product.',
  },
];

/* ── Team members ────────────────────────────────────────────────────────────── */
const TEAM = [
  {
    name: 'Prateek Jain',
    role: 'Co-Founder & Director',
    bio: 'Prateek has spent over a decade building consumer technology that reaches underserved markets across Africa and Asia. He founded KVL Business Solutions with the conviction that family safety tools should be affordable, private, and designed for the realities of families everywhere — not just in Silicon Valley.',
    initials: 'PJ',
    avatarColor: 'from-blue-500 to-violet-600',
    location: 'Nairobi, Kenya',
    linkedin: '#',
  },
  {
    name: 'Kelsey',
    role: 'Head of Design',
    bio: 'Kelsey leads product design and brand across all KVL Business Solutions products. With a background in human-centred design and a deep belief that safety tools should be beautiful and intuitive, she is the reason KVL Track feels different from every other family app on the market.',
    initials: 'KL',
    avatarColor: 'from-pink-500 to-rose-600',
    location: 'London, UK',
    linkedin: '#',
  },
  {
    name: 'Dev Team',
    role: 'Engineering & Backend',
    bio: 'A distributed team of engineers across Kenya, India, and Europe — building the real-time infrastructure, AI systems, and mobile apps that power KVL Track. Small team. Big impact.',
    initials: 'DT',
    avatarColor: 'from-emerald-500 to-teal-600',
    location: 'Distributed · 3 continents',
    linkedin: '#',
  },
];

/* ── Section: Mission ────────────────────────────────────────────────────────── */
function MissionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="relative pt-32 pb-24 overflow-hidden" ref={ref}>
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-blue-600/6 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-300 backdrop-blur-xl bg-white/[0.04] border border-blue-500/30 mb-6"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <span>🌍</span>
              Our Mission
            </span>

            <h1
              className="text-5xl md:text-6xl font-extrabold text-[#F8FAFC] leading-[1.05] tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              We believe families should{' '}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                feel close
              </span>
              ,<br />
              not surveilled
            </h1>

            <p
              className="mt-8 text-xl text-[#94A3B8] leading-relaxed max-w-3xl mx-auto"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              KVL Business Solutions was built for the billions of families on earth who need real safety tools
              — not expensive hardware, not invasive surveillance, not apps designed for a narrow
              slice of the world. KVL Track is our promise: powerful safety, honest design, and a price
              every family can afford.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-10">
              {[
                { label: 'Founded 2022', emoji: '📅' },
                { label: 'HQ: Nairobi, Kenya', emoji: '📍' },
                { label: '50+ Countries', emoji: '🌍' },
                { label: '50,000+ Families', emoji: '👨‍👩‍👧' },
              ].map(({ label, emoji }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] text-[#94A3B8] text-sm"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <span>{emoji}</span>
                  {label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── Section: Philosophy ─────────────────────────────────────────────────────── */
function PhilosophySection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="py-24 max-w-7xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <span
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-violet-300 backdrop-blur-xl bg-white/[0.04] border border-violet-500/30 mb-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <span>✦</span>
          Founding Principles
        </span>
        <h2
          className="text-4xl md:text-5xl font-extrabold text-[#F8FAFC]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          How We Build
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {PRINCIPLES.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 + i * 0.12 }}
            className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 flex flex-col gap-4"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              {p.icon}
            </div>
            <h3
              className="text-[#F8FAFC] font-bold text-xl"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {p.title}
            </h3>
            <p
              className="text-[#94A3B8] text-sm leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {p.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── Section: Team ───────────────────────────────────────────────────────────── */
function TeamSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="py-24 max-w-7xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <span
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-300 backdrop-blur-xl bg-white/[0.04] border border-blue-500/30 mb-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <Users size={14} />
          The People
        </span>
        <h2
          className="text-4xl md:text-5xl font-extrabold text-[#F8FAFC]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Meet the Team
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {TEAM.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 + i * 0.12 }}
            className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 flex flex-col gap-4"
          >
            {/* Avatar */}
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.avatarColor} flex items-center justify-center border border-white/10`}
            >
              <span
                className="text-lg font-extrabold text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {member.initials}
              </span>
            </div>

            {/* Name + role */}
            <div>
              <h3
                className="text-[#F8FAFC] font-bold text-xl"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {member.name}
              </h3>
              <p
                className="text-blue-300 text-sm font-medium"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {member.role}
              </p>
            </div>

            {/* Bio */}
            <p
              className="text-[#94A3B8] text-sm leading-relaxed flex-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {member.bio}
            </p>

            {/* Location + LinkedIn */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <span
                className="flex items-center gap-1.5 text-xs text-[#94A3B8]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <MapPin size={12} className="text-blue-400" />
                {member.location}
              </span>
              <a
                href={member.linkedin}
                className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-blue-300 transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <Linkedin size={14} />
                LinkedIn
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── Section: Ecosystem ──────────────────────────────────────────────────────── */
function EcosystemSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="py-24 max-w-7xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <span
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-amber-300 backdrop-blur-xl bg-white/[0.04] border border-amber-500/30 mb-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <Sparkles size={14} />
          The KVL Business Solutions Universe
        </span>
        <h2
          className="text-4xl md:text-5xl font-extrabold text-[#F8FAFC]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Our Product Ecosystem
        </h2>
        <p
          className="text-[#94A3B8] mt-4 max-w-2xl mx-auto"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          KVL Track is one part of the KVL Business Solutions universe. Every product is designed to
          work together, giving families a complete safety ecosystem across hardware and software.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ECOSYSTEM.map((product, i) => (
          <motion.a
            key={product.id}
            href={product.href}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.08 + i * 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`group relative backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4 hover:border-white/20 transition-colors ${
              product.id === 'gravity' ? 'border-blue-500/30 bg-blue-500/5' : ''
            }`}
          >
            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center text-white`}
            >
              {ECOSYSTEM_ICON_MAP[product.icon] ?? <Globe size={22} />}
            </div>

            {/* Name + tag */}
            <div className="flex items-center justify-between">
              <h3
                className="text-[#F8FAFC] font-bold text-lg"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {product.name}
              </h3>
              {product.id === 'gravity' && (
                <span
                  className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  You are here
                </span>
              )}
            </div>

            {/* Tagline */}
            <p
              className="text-[#94A3B8] text-sm"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {product.tagline}
            </p>

            {/* Arrow link */}
            <div className="flex items-center gap-1 text-xs text-blue-400 group-hover:text-blue-300 transition-colors mt-auto pt-2">
              <span style={{ fontFamily: "'Inter', sans-serif" }}>Learn more</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}

/* ── Section: HQ ─────────────────────────────────────────────────────────────── */
function HQSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="py-16 max-w-7xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden border border-white/[0.08] p-8 md:p-12"
        style={{
          background:
            'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(13,22,53,0.95) 50%, rgba(139,92,246,0.05) 100%)',
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/5 blur-[80px] pointer-events-none" />

        <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🇰🇪</span>
              <span
                className="text-xs font-bold text-blue-300 uppercase tracking-widest"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Headquarters
              </span>
            </div>

            <h2
              className="text-3xl md:text-4xl font-extrabold text-[#F8FAFC] mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Nairobi, Kenya.
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Global team.
              </span>
            </h2>

            <p
              className="text-[#94A3B8] leading-relaxed mb-6"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              We are headquartered in Nairobi because we believe the future of technology
              is being built from Africa, Asia, and the Global South. Our team spans three
              continents, bringing diverse perspectives to every product decision.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                { flag: '🇰🇪', city: 'Nairobi' },
                { flag: '🇬🇧', city: 'London' },
                { flag: '🇮🇳', city: 'Mumbai' },
              ].map(({ flag, city }) => (
                <span
                  key={city}
                  className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] text-[#94A3B8] text-sm"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <span>{flag}</span>
                  {city}
                </span>
              ))}
            </div>
          </div>

          {/* Map placeholder */}
          <div
            className="relative rounded-2xl overflow-hidden h-56 md:h-64"
            style={{ background: '#1A2756' }}
          >
            <div className="absolute inset-0 opacity-20">
              {[...Array(8)].map((_, i) => (
                <div
                  key={`h${i}`}
                  className="absolute w-full border-t border-blue-500/30"
                  style={{ top: `${i * 12.5}%` }}
                />
              ))}
              {[...Array(6)].map((_, i) => (
                <div
                  key={`v${i}`}
                  className="absolute h-full border-l border-blue-500/30"
                  style={{ left: `${i * 16.66}%` }}
                />
              ))}
            </div>
            <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
              <path d="M80 120 Q160 80 240 140 Q300 170 360 120" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M40 200 Q120 170 200 220 Q280 255 340 200" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
            {/* Nairobi pin */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] border-2 border-white/20">
                <span className="text-white text-xs font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>NBO</span>
              </div>
              <motion.div
                animate={{ scale: [1, 2], opacity: [0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-blue-500"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── CTA ─────────────────────────────────────────────────────────────────────── */
function AboutCTA() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="py-24 max-w-7xl mx-auto px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-4xl md:text-5xl font-extrabold text-[#F8FAFC] mb-4"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Join 50,000+ families
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            already using KVL Track
          </span>
        </h2>

        <p
          className="text-[#94A3B8] mb-10 max-w-md mx-auto"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Free to download. Free to start. No credit card needed.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/#download"
            className="inline-flex items-center px-10 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-600 hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.45)] active:scale-95 transition-all duration-200"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Download the App
          </a>
          <a
            href="/pricing"
            className="inline-flex items-center px-10 py-4 rounded-xl text-base font-semibold text-[#F8FAFC] backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] hover:border-blue-400/50 hover:bg-white/[0.07] active:scale-95 transition-all duration-200"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            View Pricing
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <main style={{ background: '#050A18', minHeight: '100vh' }}>
      <Navbar />
      <MissionSection />
      <PhilosophySection />
      <TeamSection />
      <EcosystemSection />
      <HQSection />
      <AboutCTA />
      <Footer />
    </main>
  );
}
