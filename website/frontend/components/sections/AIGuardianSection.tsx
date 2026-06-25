'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  };
}

interface AIInsight {
  icon: string;
  title: string;
  body: string;
  riskLabel: string;
  riskColor: string;
  riskBg: string;
  borderColor: string;
}

const AI_INSIGHTS: AIInsight[] = [
  {
    icon: '⚡',
    title: 'Unsafe route detected',
    body: "Priya's school route flagged near construction zone",
    riskLabel: 'HIGH',
    riskColor: '#EF4444',
    riskBg: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.25)',
  },
  {
    icon: '🧠',
    title: 'Pattern analysis',
    body: 'Raj drives 23% faster on Fridays — attention needed',
    riskLabel: 'MEDIUM',
    riskColor: '#F59E0B',
    riskBg: 'rgba(245,158,11,0.1)',
    borderColor: 'rgba(245,158,11,0.25)',
  },
  {
    icon: '💚',
    title: 'All clear',
    body: 'Family activity is completely normal today',
    riskLabel: 'SAFE',
    riskColor: '#10B981',
    riskBg: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.25)',
  },
];

const FEATURE_PILLS = ['Predictive Routes', 'Behavior Analysis', '24/7 Monitoring'];

/* ── Neural network SVG animation ────────────────────────────────────────── */
function NeuralNetworkSVG({ isDark }: { isDark: boolean }) {
  const nodes = [
    { cx: 30,  cy: 50,  r: 4  },
    { cx: 30,  cy: 80,  r: 3  },
    { cx: 30,  cy: 120, r: 4  },
    { cx: 80,  cy: 35,  r: 3.5 },
    { cx: 80,  cy: 65,  r: 4  },
    { cx: 80,  cy: 95,  r: 3.5 },
    { cx: 80,  cy: 130, r: 3  },
    { cx: 130, cy: 50,  r: 4  },
    { cx: 130, cy: 90,  r: 3.5 },
    { cx: 130, cy: 120, r: 4  },
    { cx: 180, cy: 70,  r: 4.5 },
    { cx: 180, cy: 110, r: 4.5 },
  ];

  const connections = [
    [0, 3], [0, 4], [1, 3], [1, 4], [1, 5], [2, 4], [2, 5], [2, 6],
    [3, 7], [3, 8], [4, 7], [4, 8], [4, 9], [5, 8], [5, 9], [6, 9],
    [7, 10], [7, 11], [8, 10], [8, 11], [9, 11],
  ];

  return (
    <svg
      viewBox="0 0 210 165"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Connections */}
      {connections.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={nodes[a].cx} y1={nodes[a].cy}
          x2={nodes[b].cx} y2={nodes[b].cy}
          stroke={isDark ? 'rgba(212,168,83,0.18)' : 'rgba(184,114,10,0.15)'}
          strokeWidth="0.8"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{
            duration: 2.5 + (i % 4) * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.08,
          }}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.circle
          key={i}
          cx={node.cx} cy={node.cy} r={node.r}
          fill={isDark ? 'rgba(212,168,83,0.6)' : 'rgba(184,114,10,0.5)'}
          initial={{ scale: 0.6 }}
          animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2 + (i % 5) * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.12,
          }}
        />
      ))}

      {/* Data pulse dot traveling along connections */}
      <motion.circle
        r="2" fill="var(--gold)"
        animate={{
          cx: [nodes[4].cx, nodes[7].cx, nodes[10].cx],
          cy: [nodes[4].cy, nodes[7].cy, nodes[10].cy],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatDelay: 1.2,
        }}
      />
    </svg>
  );
}

export default function AIGuardianSection() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [visibleCards, setVisibleCards] = useState(0);

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

  // Stagger AI insight cards
  useEffect(() => {
    if (!inView) return;
    let count = 0;
    const id = setInterval(() => {
      count++;
      setVisibleCards(count);
      if (count >= AI_INSIGHTS.length) clearInterval(id);
    }, 600);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <section
      ref={ref}
      className="relative py-28 overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(168,85,247,0.04) 0%, transparent 60%)'
            : 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(168,85,247,0.03) 0%, transparent 60%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT: Text content */}
          <div className="flex flex-col">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-6 self-start"
            >
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase"
                style={{
                  background: isDark ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.08)',
                  border: `1px solid ${isDark ? 'rgba(168,85,247,0.25)' : 'rgba(168,85,247,0.20)'}`,
                  color: '#A855F7',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <motion.span
                  className="w-2 h-2 rounded-full bg-violet-500 shrink-0"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
                NEW · KVL TRACK AI GUARDIAN
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
            >
              Your Family&apos;s
              <br />
              <span className="gradient-text-gold">AI Protector</span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 text-lg leading-relaxed max-w-lg"
              style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
            >
              KVL Track AI Guardian learns your family&apos;s patterns and proactively
              alerts you to risks{' '}
              <em className="not-italic" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                before they become emergencies
              </em>
              .
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap gap-2.5 mt-6"
            >
              {FEATURE_PILLS.map((pill, i) => (
                <span
                  key={pill}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium"
                  style={{
                    background: isDark ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.07)',
                    border: `1px solid ${isDark ? 'rgba(168,85,247,0.22)' : 'rgba(168,85,247,0.18)'}`,
                    color: '#A855F7',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <span style={{ fontSize: '10px' }}>
                    {i === 0 ? '🛣️' : i === 1 ? '📊' : '🌙'}
                  </span>
                  {pill}
                </span>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-8"
            >
              <Link href="/ai-guardian">
                <motion.span
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                    color: '#ffffff',
                    boxShadow: '0 8px 32px rgba(168,85,247,0.35)',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Explore AI Guardian
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.span>
              </Link>
            </motion.div>
          </div>

          {/* RIGHT: AI visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: isDark
                  ? 'linear-gradient(145deg, rgba(17,20,32,0.97), rgba(24,28,43,0.95))'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.97), rgba(245,240,232,0.9))',
                border: isDark ? '1px solid rgba(168,85,247,0.15)' : '1px solid rgba(168,85,247,0.12)',
                backdropFilter: 'blur(24px)',
                boxShadow: isDark
                  ? '0 0 60px rgba(168,85,247,0.12), 0 32px 80px rgba(0,0,0,0.5)'
                  : '0 0 40px rgba(168,85,247,0.08), 0 16px 60px rgba(0,0,0,0.08)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(168,85,247,0.15)' }}
                  >
                    <span className="text-base">🤖</span>
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      AI Guardian
                    </p>
                    <p className="text-[10px]" style={{ color: '#A855F7', fontFamily: "'Inter', sans-serif" }}>Active · Learning</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#A855F7' }}
                  />
                  <span className="text-[10px] font-semibold" style={{ color: '#A855F7', fontFamily: "'Inter', sans-serif" }}>ANALYZING</span>
                </div>
              </div>

              {/* AI Insight cards */}
              <div className="p-5 flex flex-col gap-3">
                {AI_INSIGHTS.map((insight, i) => (
                  <AnimatePresence key={insight.title}>
                    {visibleCards > i && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-start gap-3 p-4 rounded-2xl"
                        style={{
                          background: insight.riskBg,
                          border: `1px solid ${insight.borderColor}`,
                        }}
                      >
                        <span className="text-xl shrink-0">{insight.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-bold"
                            style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          >
                            {insight.title}
                          </p>
                          <p
                            className="text-xs mt-0.5 leading-relaxed"
                            style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                          >
                            {insight.body}
                          </p>
                        </div>
                        <span
                          className="text-[9px] font-bold px-2 py-1 rounded-full shrink-0 self-start"
                          style={{
                            background: insight.riskBg,
                            color: insight.riskColor,
                            border: `1px solid ${insight.borderColor}`,
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {insight.riskLabel}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>

              {/* Neural network visualization */}
              <div
                className="mx-5 mb-5 rounded-2xl overflow-hidden relative"
                style={{
                  height: 140,
                  background: isDark ? 'rgba(168,85,247,0.04)' : 'rgba(168,85,247,0.03)',
                  border: isDark ? '1px solid rgba(168,85,247,0.12)' : '1px solid rgba(168,85,247,0.10)',
                }}
              >
                <div className="absolute inset-3">
                  <NeuralNetworkSVG isDark={isDark} />
                </div>
                <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5">
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-violet-500"
                  />
                  <span
                    className="text-[9px] font-medium"
                    style={{ color: '#A855F7', fontFamily: "'Inter', sans-serif" }}
                  >
                    Neural pattern matching · 847ms
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
