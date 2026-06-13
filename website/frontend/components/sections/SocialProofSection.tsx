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

interface Counter {
  end: number;
  suffix: string;
  prefix: string;
  label: string;
  icon: string;
  iconBg: string;
  decimals?: number;
}

const COUNTERS: Counter[] = [
  { prefix: '', end: 2.5, suffix: 'M+', label: 'Active Families', icon: '👨‍👩‍👧‍👦', iconBg: 'rgba(212,168,83,0.15)', decimals: 1 },
  { prefix: '', end: 8.2, suffix: 'M+', label: 'Children Protected', icon: '🧒', iconBg: 'rgba(16,185,129,0.15)', decimals: 1 },
  { prefix: '', end: 450, suffix: 'K+', label: 'Elderly Monitored', icon: '👴', iconBg: 'rgba(75,128,240,0.15)', decimals: 0 },
  { prefix: '', end: 23, suffix: 'M+', label: 'SOS Alerts Resolved', icon: '🚨', iconBg: 'rgba(239,68,68,0.15)', decimals: 0 },
  { prefix: '', end: 127, suffix: '', label: 'Countries Served', icon: '🌍', iconBg: 'rgba(168,85,247,0.15)', decimals: 0 },
  { prefix: '', end: 850, suffix: 'M+', label: 'Daily Location Updates', icon: '📡', iconBg: 'rgba(34,197,94,0.15)', decimals: 0 },
];

function useCountUp(end: number, decimals: number, inView: boolean, duration = 2200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  const startTs = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;
    startTs.current = null;

    function step(ts: number) {
      if (startTs.current === null) startTs.current = ts;
      const elapsed = ts - startTs.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * end).toFixed(decimals)));
      if (progress < 1) {
        raf.current = requestAnimationFrame(step);
      }
    }

    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [inView, end, decimals, duration]);

  return value;
}

function CounterCard({ counter, index, inView }: { counter: Counter; index: number; inView: boolean }) {
  const [isDark, setIsDark] = useState(true);
  const value = useCountUp(counter.end, counter.decimals ?? 0, inView);

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const displayValue = counter.decimals ? value.toFixed(counter.decimals) : Math.floor(value).toString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
      whileHover={{ y: -6, scale: 1.03 }}
      className="flex flex-col items-center text-center p-6 rounded-3xl relative overflow-hidden group cursor-default"
      style={{
        background: isDark ? 'rgba(17,20,32,0.8)' : 'rgba(255,255,255,0.9)',
        border: isDark ? '1px solid rgba(240,237,232,0.07)' : '1px solid rgba(15,17,23,0.08)',
        backdropFilter: 'blur(16px)',
        boxShadow: isDark
          ? '0 4px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${counter.iconBg} 0%, transparent 70%)`,
        }}
      />

      {/* Icon */}
      <div
        className="text-3xl w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative z-10"
        style={{
          background: counter.iconBg,
          border: `1px solid ${counter.iconBg.replace('0.15', '0.3')}`,
        }}
      >
        {counter.icon}
      </div>

      {/* Number */}
      <div
        className="text-4xl xl:text-5xl font-extrabold relative z-10 gradient-text-gold"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {counter.prefix}{displayValue}{counter.suffix}
      </div>

      {/* Label */}
      <p
        className="text-sm font-medium mt-2 relative z-10"
        style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
      >
        {counter.label}
      </p>
    </motion.div>
  );
}

/* ── Gold SVG particle field ──────────────────────────────────────────────── */
function ParticleField() {
  const dots = Array.from({ length: 28 }, (_, i) => ({
    cx: (i * 137.5) % 100,
    cy: ((i * 97.3) % 80) + 10,
    r: 0.8 + (i % 3) * 0.4,
    opacity: 0.15 + (i % 4) * 0.07,
  }));

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="var(--gold)" opacity={d.opacity} />
      ))}
    </svg>
  );
}

export default function SocialProofSection() {
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
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-28 overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #0B0D13 0%, #111420 50%, #0B0D13 100%)'
          : 'linear-gradient(180deg, #FDF8F3 0%, #F5F0E8 50%, #FDF8F3 100%)',
      }}
    >
      {/* Particle field */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
        <ParticleField />
      </div>

      {/* Radial gold glow center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse, rgba(212,168,83,0.06) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(184,114,10,0.05) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6">

        {/* Header */}
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
              Global Impact
            </span>
          </motion.div>

          <motion.h2
            {...fadeUp(0.1)}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Protecting Families{' '}
            <span className="gradient-text-gold">Worldwide</span>
          </motion.h2>

          <motion.p
            {...fadeUp(0.2)}
            className="mt-5 text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            Gravity's reach spans continents, protecting millions of families every single day
            with real-time intelligence and AI-powered safety.
          </motion.p>
        </div>

        {/* Counter grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {COUNTERS.map((counter, i) => (
            <CounterCard key={counter.label} counter={counter} index={i} inView={inView} />
          ))}
        </div>

        {/* Bottom divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 h-px origin-left"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, transparent, rgba(212,168,83,0.3), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(184,114,10,0.2), transparent)',
          }}
        />
      </div>
    </section>
  );
}
