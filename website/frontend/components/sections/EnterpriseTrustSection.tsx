'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  };
}

interface ComplianceBadge {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
}

const COMPLIANCE: ComplianceBadge[] = [
  { icon: '🛡️', title: 'GDPR Compliant', subtitle: 'EU Data Regulation', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  { icon: '📋', title: 'ISO 27001 Certified', subtitle: 'Security Management', color: '#D4A853', bg: 'rgba(212,168,83,0.12)' },
  { icon: '✅', title: 'SOC 2 Type II', subtitle: 'Security Controls', color: '#4B80F0', bg: 'rgba(75,128,240,0.12)' },
  { icon: '🔒', title: 'End-to-End Encryption', subtitle: 'AES-256 Secured', color: '#D4A853', bg: 'rgba(212,168,83,0.12)' },
  { icon: '👁️', title: 'Zero Knowledge Security', subtitle: 'Privacy by Design', color: '#A855F7', bg: 'rgba(168,85,247,0.12)' },
  { icon: '🤖', title: 'AI Safety Engine', subtitle: 'Proactive Protection', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
];

interface CustomerSegment {
  icon: string;
  count: string;
  label: string;
}

const SEGMENTS: CustomerSegment[] = [
  { icon: '🏫', count: '2,400+', label: 'Schools' },
  { icon: '🏥', count: '890+', label: 'Hospitals' },
  { icon: '🤝', count: '1,200+', label: 'NGOs' },
  { icon: '🛡️', count: '340+', label: 'Security Agencies' },
  { icon: '🏢', count: '5,600+', label: 'Enterprises' },
  { icon: '🌍', count: '18', label: 'Governments' },
];

const MARQUEE_ORGS = [
  'Ministry of Home Affairs', 'Global Health Alliance', 'SafeGuard Corp',
  'EduProtect Network', 'UN Child Safety', 'SecureFleet International',
  'National Elder Care', 'CampusSafe Systems', 'FamilyFirst NGO',
  'TrustShield Enterprises', 'GovSafe Initiative', 'HealthGuard Networks',
];

export default function EnterpriseTrustSection() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-28 overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: isDark
            ? 'linear-gradient(rgba(212,168,83,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,83,0.04) 1px, transparent 1px)'
            : 'linear-gradient(rgba(184,114,10,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(184,114,10,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6">

        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 mb-5">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{
                backgroundColor: isDark ? 'rgba(212,168,83,0.10)' : 'rgba(184,114,10,0.08)',
                border: `1px solid ${isDark ? 'rgba(212,168,83,0.22)' : 'rgba(184,114,10,0.20)'}`,
                color: isDark ? '#D4A853' : '#B8720A',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Enterprise Trust
            </span>
          </motion.div>

          <motion.h2
            {...fadeUp(0.1)}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Trusted by organizations that{' '}
            <span className="gradient-text-gold">protect people</span>
          </motion.h2>

          <motion.p
            {...fadeUp(0.2)}
            className="mt-5 text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            From government agencies to schools and hospitals — the world's most
            safety-conscious organizations rely on Gravity.
          </motion.p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* LEFT: Compliance badges */}
          <div>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl font-bold mb-6"
              style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Security & Compliance
            </motion.h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COMPLIANCE.map((badge, i) => (
                <motion.div
                  key={badge.title}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, scale: 1.04 }}
                  className="flex flex-col items-center text-center p-4 rounded-2xl group cursor-default relative overflow-hidden"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(212,168,83,0.05), rgba(212,168,83,0.02))'
                      : 'linear-gradient(135deg, rgba(184,114,10,0.04), rgba(184,114,10,0.01))',
                    border: isDark
                      ? '1px solid rgba(212,168,83,0.12)'
                      : '1px solid rgba(184,114,10,0.12)',
                    backdropFilter: 'blur(16px)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${badge.bg}, 0 0 0 1px ${badge.color}33`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
                    style={{ background: badge.bg }}
                  >
                    {badge.icon}
                  </div>

                  <p
                    className="text-sm font-bold leading-tight"
                    style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {badge.title}
                  </p>

                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: badge.color }} />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: badge.color, fontFamily: "'Inter', sans-serif" }}
                    >
                      Verified
                    </span>
                  </div>

                  <p
                    className="text-[10px] mt-1"
                    style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                  >
                    {badge.subtitle}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT: Customer segments */}
          <div>
            <motion.h3
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl font-bold mb-6"
              style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Organizations We Protect
            </motion.h3>

            <div className="flex flex-col gap-3">
              {SEGMENTS.map((seg, i) => (
                <motion.div
                  key={seg.label}
                  initial={{ opacity: 0, x: 30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ x: 6 }}
                  className="flex items-center gap-4 p-4 rounded-2xl group cursor-default"
                  style={{
                    background: isDark ? 'rgba(17,20,32,0.6)' : 'rgba(255,255,255,0.8)',
                    border: isDark ? '1px solid rgba(240,237,232,0.07)' : '1px solid rgba(15,17,23,0.08)',
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <span className="text-2xl w-10 text-center shrink-0">{seg.icon}</span>

                  <div className="flex-1">
                    <p
                      className="text-sm"
                      style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                    >
                      {seg.label}
                    </p>
                  </div>

                  <span
                    className="text-xl font-extrabold gradient-text-gold"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {seg.count}
                  </span>

                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    style={{ color: 'var(--gold)' }}
                  >
                    <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Scrolling marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 overflow-hidden relative"
        >
          <div
            className="h-px mb-6"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(212,168,83,0.2), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(184,114,10,0.15), transparent)',
            }}
          />

          <p
            className="text-center text-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
          >
            Trusted by leading organizations worldwide
          </p>

          {/* Marquee track */}
          <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)' }}>
            <div
              className="flex gap-8 whitespace-nowrap"
              style={{ animation: 'marquee-scroll 28s linear infinite' }}
            >
              {[...MARQUEE_ORGS, ...MARQUEE_ORGS].map((org, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full shrink-0 text-sm font-medium"
                  style={{
                    color: 'var(--text-muted)',
                    fontFamily: "'Inter', sans-serif",
                    background: isDark ? 'rgba(212,168,83,0.06)' : 'rgba(184,114,10,0.05)',
                    border: isDark ? '1px solid rgba(212,168,83,0.10)' : '1px solid rgba(184,114,10,0.10)',
                  }}
                >
                  <span style={{ color: 'var(--gold)', fontSize: '10px' }}>✦</span>
                  {org}
                </span>
              ))}
            </div>
          </div>

          <style jsx>{`
            @keyframes marquee-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </motion.div>
      </div>
    </section>
  );
}
