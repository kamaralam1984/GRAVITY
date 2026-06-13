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

interface MetricCard {
  percentage: number;
  sign: '+' | '-';
  label: string;
  description: string;
  barColor: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
}

const METRICS: MetricCard[] = [
  {
    percentage: 94,
    sign: '+',
    label: 'Child Safety Improvement',
    description: 'Families report significantly fewer safety incidents within 90 days.',
    barColor: '#10B981',
    gradientFrom: '#10B981',
    gradientTo: '#34D399',
    textColor: '#10B981',
  },
  {
    percentage: 67,
    sign: '-',
    label: 'Emergency Response Time',
    description: 'SOS alerts reach emergency contacts 3x faster with Gravity AI routing.',
    barColor: '#EF4444',
    gradientFrom: '#EF4444',
    gradientTo: '#10B981',
    textColor: '#EF4444',
  },
  {
    percentage: 82,
    sign: '+',
    label: 'Elderly Care Efficiency',
    description: 'Caregivers spend less time worrying and more time connecting meaningfully.',
    barColor: '#4B80F0',
    gradientFrom: '#4B80F0',
    gradientTo: '#60A5FA',
    textColor: '#4B80F0',
  },
  {
    percentage: 156,
    sign: '+',
    label: 'Family Engagement',
    description: 'Daily check-ins and location sharing increase family bonds measurably.',
    barColor: '#D4A853',
    gradientFrom: '#D4A853',
    gradientTo: '#F5C842',
    textColor: '#D4A853',
  },
];

function useAnimatedProgress(target: number, inView: boolean, duration = 1800): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  const startTs = useRef<number | null>(null);
  const cap = Math.min(target, 100);

  useEffect(() => {
    if (!inView) return;
    startTs.current = null;

    function step(ts: number) {
      if (startTs.current === null) startTs.current = ts;
      const elapsed = ts - startTs.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * cap));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    }

    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [inView, cap, duration]);

  return value;
}

function MetricCardItem({ metric, index, inView, isDark }: { metric: MetricCard; index: number; inView: boolean; isDark: boolean }) {
  const progress = useAnimatedProgress(metric.percentage, inView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="p-7 rounded-3xl relative overflow-hidden group"
      style={{
        background: isDark
          ? 'linear-gradient(145deg, rgba(17,20,32,0.95), rgba(24,28,43,0.8))'
          : 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(245,240,232,0.6))',
        border: isDark ? '1px solid rgba(240,237,232,0.07)' : '1px solid rgba(15,17,23,0.08)',
        backdropFilter: 'blur(20px)',
        boxShadow: isDark
          ? '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Corner glow */}
      <div
        className="absolute top-0 right-0 w-40 h-40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
        style={{
          background: `radial-gradient(circle at top right, ${metric.barColor}15, transparent 60%)`,
        }}
        aria-hidden
      />

      {/* Percentage */}
      <div className="flex items-baseline gap-1 mb-1">
        <span
          className="text-5xl xl:text-6xl font-extrabold tabular-nums"
          style={{ color: metric.textColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {metric.sign}{metric.percentage > 100 ? progress + Math.round((metric.percentage - 100) * (inView ? 1 : 0)) : progress}
        </span>
        <span
          className="text-2xl font-bold"
          style={{ color: metric.textColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          %
        </span>
      </div>

      {/* Label */}
      <h3
        className="text-base font-bold mb-2"
        style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {metric.label}
      </h3>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full mb-4 overflow-hidden"
        style={{
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        }}
      >
        <motion.div
          initial={{ width: '0%' }}
          animate={inView ? { width: `${Math.min(progress, 100)}%` } : { width: '0%' }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 + 0.2 }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${metric.gradientFrom}, ${metric.gradientTo})`,
            boxShadow: `0 0 12px ${metric.barColor}60`,
          }}
        />
      </div>

      {/* Description */}
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
      >
        {metric.description}
      </p>

      {/* Comparison tag */}
      <div className="mt-4 inline-flex items-center gap-1.5">
        <span
          className="text-[10px] px-2.5 py-1 rounded-full font-medium"
          style={{
            background: `${metric.barColor}15`,
            color: metric.textColor,
            border: `1px solid ${metric.barColor}25`,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          vs. families without Gravity
        </span>
      </div>
    </motion.div>
  );
}

export default function ROISection() {
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
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-28 overflow-hidden"
      style={{ background: 'var(--bg-surface2)' }}
    >
      {/* Gold accent top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(212,168,83,0.3) 40%, rgba(212,168,83,0.3) 60%, transparent)'
            : 'linear-gradient(90deg, transparent, rgba(184,114,10,0.2) 40%, rgba(184,114,10,0.2) 60%, transparent)',
        }}
        aria-hidden
      />

      {/* Background decoration */}
      <div
        className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(212,168,83,0.05) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(184,114,10,0.04) 0%, transparent 70%)',
          filter: 'blur(60px)',
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
              Proven Results
            </span>
          </motion.div>

          <motion.h2
            {...fadeUp(0.1)}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Measurable{' '}
            <span className="gradient-text-gold">Safety Impact</span>
          </motion.h2>

          <motion.p
            {...fadeUp(0.2)}
            className="mt-5 text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            Real numbers from real families. These aren't estimates — they're
            outcomes measured across our global user base.
          </motion.p>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {METRICS.map((metric, i) => (
            <MetricCardItem
              key={metric.label}
              metric={metric}
              index={i}
              inView={inView}
              isDark={isDark}
            />
          ))}
        </div>

        {/* Research quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 text-center"
        >
          <div
            className="inline-block max-w-2xl px-8 py-6 rounded-3xl"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(212,168,83,0.06), rgba(212,168,83,0.03))'
                : 'linear-gradient(135deg, rgba(184,114,10,0.05), rgba(184,114,10,0.02))',
              border: isDark ? '1px solid rgba(212,168,83,0.15)' : '1px solid rgba(184,114,10,0.15)',
            }}
          >
            <svg
              width="32" height="24" viewBox="0 0 32 24" fill="none"
              className="mx-auto mb-4"
              style={{ color: 'var(--gold)', opacity: 0.6 }}
            >
              <path d="M0 24V14C0 6.268 5.372 1.232 16.116 0L17 2.77C12.028 3.77 9.148 6.244 8.36 10.19H14V24H0ZM18 24V14C18 6.268 23.372 1.232 34.116 0L35 2.77C30.028 3.77 27.148 6.244 26.36 10.19H32V24H18Z" fill="currentColor" />
            </svg>

            <p
              className="text-lg font-medium italic leading-relaxed"
              style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Families using Gravity respond to emergencies{' '}
              <span className="gradient-text-gold font-bold not-italic">3x faster</span>
              {' '}and report 94% higher confidence in their family's safety.
            </p>

            <p
              className="mt-4 text-sm font-semibold"
              style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
            >
              — Gravity Research, 2024 · Study of 50,000+ families across 127 countries
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(212,168,83,0.2) 50%, transparent)'
            : 'linear-gradient(90deg, transparent, rgba(184,114,10,0.12) 50%, transparent)',
        }}
        aria-hidden
      />
    </section>
  );
}
