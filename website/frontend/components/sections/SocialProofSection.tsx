'use client';

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';

/* ─── Per-card color themes ──────────────────────────────────────────────── */
const CARD_COLORS = [
  { accent: '#D4A853', glow: 'rgba(212,168,83,0.55)',  rgb: '212,168,83',  shimmer: '#F5C842' },
  { accent: '#10B981', glow: 'rgba(16,185,129,0.55)',  rgb: '16,185,129',  shimmer: '#34D399' },
  { accent: '#4B80F0', glow: 'rgba(75,128,240,0.55)',  rgb: '75,128,240',  shimmer: '#93BBFD' },
  { accent: '#EF4444', glow: 'rgba(239,68,68,0.55)',   rgb: '239,68,68',   shimmer: '#FC8181' },
  { accent: '#8B5CF6', glow: 'rgba(139,92,246,0.55)',  rgb: '139,92,246',  shimmer: '#C4B5FD' },
  { accent: '#06B6D4', glow: 'rgba(6,182,212,0.55)',   rgb: '6,182,212',   shimmer: '#67E8F9' },
];

interface Counter {
  end: number; suffix: string; label: string; icon: string; decimals: number;
}
const COUNTERS: Counter[] = [
  { end: 2.5,  suffix: 'M+', label: 'Active Families',        icon: '👨‍👩‍👧‍👦', decimals: 1 },
  { end: 8.2,  suffix: 'M+', label: 'Children Protected',     icon: '🧒',      decimals: 1 },
  { end: 450,  suffix: 'K+', label: 'Elderly Monitored',      icon: '👴',      decimals: 0 },
  { end: 23,   suffix: 'M+', label: 'SOS Alerts Resolved',    icon: '🚨',      decimals: 0 },
  { end: 127,  suffix: '',   label: 'Countries Served',        icon: '🌍',      decimals: 0 },
  { end: 850,  suffix: 'M+', label: 'Daily Location Updates', icon: '📡',      decimals: 0 },
];

/* ─── Count-up hook ─────────────────────────────────────────────────────── */
function useCountUp(end: number, decimals: number, inView: boolean, delay = 0) {
  const [value, setValue] = useState(0);
  const [done,  setDone]  = useState(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;
    const timeout = setTimeout(() => {
      let startTs: number | null = null;
      const duration = 2400;
      function step(ts: number) {
        if (startTs === null) startTs = ts;
        const elapsed = ts - startTs;
        const t = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - t, 4); // quartic ease out
        const v = parseFloat((eased * end).toFixed(decimals));
        setValue(v);
        if (t < 1) { raf.current = requestAnimationFrame(step); }
        else { setDone(true); }
      }
      raf.current = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [inView, end, decimals, delay]);

  return { value, done };
}

/* ─── Floating sparkle particles (canvas-free, pure CSS/SVG) ────────────── */
const SPARKS = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 137.508) % 100,
  y: ((i * 91.3) % 90) + 5,
  size: 1 + (i % 4) * 0.6,
  dur: 3 + (i % 5) * 1.1,
  delay: (i % 7) * 0.4,
  opacity: 0.08 + (i % 5) * 0.05,
}));

function SparkField({ inView }: { inView: boolean }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100"
         preserveAspectRatio="xMidYMid slice" style={{ zIndex: 1 }}>
      {SPARKS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.size} fill="#D4A853" opacity={inView ? s.opacity : 0}
          style={{
            transition: `opacity 1s ease ${s.delay}s`,
            animation: inView ? `spark-float-${i % 3} ${s.dur}s ease-in-out ${s.delay}s infinite` : 'none',
          }}
        />
      ))}
    </svg>
  );
}

/* ─── Grid overlay ──────────────────────────────────────────────────────── */
function GridOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="sp-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(212,168,83,0.04)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sp-grid)" />
      </svg>
    </div>
  );
}

/* ─── Aurora blobs background ────────────────────────────────────────────── */
function AuroraBlobs() {
  const blobs = [
    { color: 'rgba(212,168,83,0.12)',  top: '10%', left: '5%',   w: 400, h: 300, dur: 14 },
    { color: 'rgba(16,185,129,0.08)',  top: '60%', left: '60%',  w: 350, h: 250, dur: 18 },
    { color: 'rgba(75,128,240,0.07)',  top: '20%', left: '70%',  w: 300, h: 300, dur: 22 },
    { color: 'rgba(139,92,246,0.07)',  top: '70%', left: '15%',  w: 280, h: 200, dur: 16 },
    { color: 'rgba(239,68,68,0.05)',   top: '40%', left: '40%',  w: 200, h: 200, dur: 20 },
    { color: 'rgba(6,182,212,0.06)',   top: '5%',  left: '45%',  w: 250, h: 180, dur: 12 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
            y: [0, 20 * (i % 3 === 0 ? 1 : -1), 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 }}
          style={{
            position: 'absolute',
            top: b.top, left: b.left,
            width: b.w, height: b.h,
            background: b.color,
            borderRadius: '60% 40% 50% 55% / 45% 55% 45% 60%',
            filter: 'blur(50px)',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Animated rotating gradient border ─────────────────────────────────── */
function GlowBorder({ color, active }: { color: typeof CARD_COLORS[0]; active: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-3xl pointer-events-none"
      animate={active ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.25 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        background: `linear-gradient(135deg, ${color.accent}60 0%, transparent 40%, ${color.shimmer}40 70%, transparent 100%)`,
        padding: 1,
        borderRadius: 24,
      }}
    >
      <div className="absolute inset-px rounded-3xl" style={{ background: 'rgba(9,11,17,0.92)' }} />
    </motion.div>
  );
}

/* ─── Particle burst when counter finishes ───────────────────────────────── */
function BurstParticles({ color, trigger }: { color: string; trigger: boolean }) {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * 360,
    distance: 30 + (i % 3) * 10,
  }));
  if (!trigger) return null;
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 20 }}>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.03 }}
          style={{
            position: 'absolute',
            width: 4, height: 4,
            borderRadius: '50%',
            background: color,
          }}
        />
      ))}
    </div>
  );
}

/* ─── 3D tilt card ───────────────────────────────────────────────────────── */
function TiltCard({ children, color, index, inView }: {
  children: React.ReactNode;
  color: typeof CARD_COLORS[0];
  index: number;
  inView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / (width / 2);
    const y = (e.clientY - top - height / 2) / (height / 2);
    rotateY.set(x * 10);
    rotateX.set(-y * 10);
  }, [rotateX, rotateY]);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const glowOpacity = useTransform(springX, [-10, 0, 10], [0.3, 0.15, 0.3]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, scale: 0.85 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.09 }}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformStyle: 'preserve-3d',
        perspective: 800,
        position: 'relative',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{ z: 20 }}
    >
      {/* Card body */}
      <div
        className="relative rounded-3xl overflow-hidden cursor-default"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, rgba(${color.rgb},0.12) 0%, rgba(9,11,17,0.92) 60%)`,
          border: `1px solid rgba(${color.rgb},${hovered ? '0.45' : '0.18'})`,
          boxShadow: hovered
            ? `0 0 0 1px rgba(${color.rgb},0.3), 0 20px 60px rgba(${color.rgb},0.25), 0 0 80px rgba(${color.rgb},0.12), inset 0 1px 0 rgba(255,255,255,0.07)`
            : `0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Top shine line */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent 10%, ${color.accent} 50%, transparent 90%)`,
          }}
        />

        {/* Corner glow */}
        <motion.div
          animate={{ opacity: hovered ? 0.7 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute', top: -20, right: -20,
            width: 80, height: 80,
            borderRadius: '50%',
            background: color.glow,
            filter: 'blur(20px)',
          }}
        />

        {/* Scan line animation */}
        {hovered && (
          <motion.div
            initial={{ top: '-10%' }}
            animate={{ top: '110%' }}
            transition={{ duration: 1.2, ease: 'linear', repeat: Infinity }}
            style={{
              position: 'absolute', left: 0, right: 0, height: 40,
              background: `linear-gradient(to bottom, transparent, rgba(${color.rgb},0.06), transparent)`,
              pointerEvents: 'none', zIndex: 5,
            }}
          />
        )}

        {children}
      </div>
    </motion.div>
  );
}

/* ─── Counter Card ───────────────────────────────────────────────────────── */
function CounterCard({ counter, color, index, inView }: {
  counter: Counter;
  color: typeof CARD_COLORS[0];
  index: number;
  inView: boolean;
}) {
  const { value, done } = useCountUp(counter.end, counter.decimals, inView, index * 100);
  const [showBurst, setShowBurst] = useState(false);

  useEffect(() => {
    if (done) {
      setShowBurst(true);
      const t = setTimeout(() => setShowBurst(false), 900);
      return () => clearTimeout(t);
    }
  }, [done]);

  const displayValue = counter.decimals
    ? value.toFixed(counter.decimals)
    : Math.floor(value).toString();

  return (
    <TiltCard color={color} index={index} inView={inView}>
      <div className="flex flex-col items-center text-center px-4 pt-7 pb-6 relative" style={{ zIndex: 10 }}>

        {/* Burst particles */}
        <BurstParticles color={color.accent} trigger={showBurst} />

        {/* Icon with glow ring */}
        <motion.div
          animate={inView ? {
            y: [0, -8, 0],
            rotateZ: [0, 5, -5, 0],
          } : {}}
          transition={{ duration: 3.5 + index * 0.3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }}
          style={{ position: 'relative', marginBottom: 16 }}
        >
          {/* Glow orb behind icon */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
            style={{
              position: 'absolute', inset: -8, borderRadius: '50%',
              background: `radial-gradient(circle, ${color.glow} 0%, transparent 70%)`,
              filter: 'blur(8px)',
            }}
          />

          {/* Rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              border: `1.5px dashed rgba(${color.rgb},0.3)`,
            }}
          />

          {/* Icon box */}
          <div style={{
            width: 60, height: 60, borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
            background: `rgba(${color.rgb},0.12)`,
            border: `1px solid rgba(${color.rgb},0.3)`,
            boxShadow: `0 0 20px rgba(${color.rgb},0.2), inset 0 1px 0 rgba(255,255,255,0.06)`,
            position: 'relative',
          }}>
            {counter.icon}
          </div>
        </motion.div>

        {/* Number with shimmer glow */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          {/* Glow layer behind number */}
          <div style={{
            position: 'absolute', inset: -4,
            background: `radial-gradient(ellipse, rgba(${color.rgb},0.3) 0%, transparent 70%)`,
            filter: 'blur(12px)',
            borderRadius: 8,
          }} />

          <motion.div
            key={done ? 'done' : 'counting'}
            animate={done ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              background: `linear-gradient(135deg, ${color.shimmer} 0%, ${color.accent} 50%, ${color.shimmer} 100%)`,
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: inView ? `shimmer-text-${index} 3s linear infinite` : 'none',
              position: 'relative',
              zIndex: 1,
              textShadow: 'none',
              filter: `drop-shadow(0 0 8px rgba(${color.rgb},0.5))`,
            }}
          >
            {displayValue}{counter.suffix}
          </motion.div>
        </div>

        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: index * 0.09 + 0.4, duration: 0.6 }}
          style={{
            fontSize: 12, fontWeight: 500, color: 'rgba(168,162,158,0.85)',
            fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em',
          }}
        >
          {counter.label}
        </motion.p>

        {/* Bottom pulse line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: index * 0.09 + 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginTop: 14, height: 2, width: '60%', borderRadius: 4, transformOrigin: 'left',
            background: `linear-gradient(90deg, ${color.accent}, ${color.shimmer}, ${color.accent})`,
            backgroundSize: '200% 100%',
            animation: 'shimmer-bar 2s linear infinite',
            boxShadow: `0 0 8px rgba(${color.rgb},0.6)`,
          }}
        />
      </div>
    </TiltCard>
  );
}

/* ─── Inject keyframe animations ─────────────────────────────────────────── */
const VFX_STYLES = `
  @keyframes shimmer-bar {
    0%   { background-position: 200% 0 }
    100% { background-position: -200% 0 }
  }
  @keyframes sp-float-y {
    0%, 100% { transform: translateY(0px) }
    50%       { transform: translateY(-14px) }
  }
  @keyframes sp-twinkle {
    0%, 100% { opacity: 0.06 }
    50%       { opacity: 0.22 }
  }
  @keyframes sp-drift {
    0%, 100% { transform: translateY(0) translateX(0) }
    33%       { transform: translateY(-8px) translateX(4px) }
    66%       { transform: translateY(4px) translateX(-6px) }
  }
  @keyframes aurora-pulse {
    0%, 100% { opacity: 0.7 }
    50%       { opacity: 1 }
  }
`;

/* ─── Main Section ───────────────────────────────────────────────────────── */
export default function SocialProofSection() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

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
      className="relative overflow-hidden"
      style={{
        padding: '100px 0 110px',
        background: 'linear-gradient(180deg, #07090F 0%, #0B0D15 35%, #070A12 70%, #07090F 100%)',
      }}
    >
      {/* Inject keyframes */}
      <style>{VFX_STYLES}</style>

      {/* Aurora blobs */}
      <AuroraBlobs />

      {/* Grid overlay */}
      <GridOverlay />

      {/* Floating spark field */}
      <SparkField inView={inView} />

      {/* Horizontal beam lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        {[20, 50, 80].map((y, i) => (
          <motion.div
            key={i}
            animate={{ scaleX: [0, 1, 0], opacity: [0, 0.12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
            style={{
              position: 'absolute', top: `${y}%`, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.4), transparent)',
              transformOrigin: 'center',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6" style={{ zIndex: 10 }}>

        {/* ── Section header ──────────────────────────────────────── */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <div style={{ height: 1, width: 48, background: 'linear-gradient(90deg, transparent, #D4A853)' }} />
            <span style={{
              padding: '6px 20px', borderRadius: 999,
              background: 'rgba(212,168,83,0.08)',
              border: '1px solid rgba(212,168,83,0.25)',
              color: '#D4A853', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              fontFamily: "'Inter', sans-serif",
            }}>
              Global Impact
            </span>
            <div style={{ height: 1, width: 48, background: 'linear-gradient(90deg, #D4A853, transparent)' }} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900, lineHeight: 1.1,
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              color: '#F0EDE8',
            }}
          >
            Protecting Families{' '}
            <span style={{
              background: 'linear-gradient(135deg, #F5C842 0%, #D4A853 50%, #F5C842 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 24px rgba(212,168,83,0.5))',
              animation: 'shimmer-bar 3s linear infinite',
            }}>
              Worldwide
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              marginTop: 16, fontSize: 17, maxWidth: 540, margin: '16px auto 0',
              color: 'rgba(168,162,158,0.8)', fontFamily: "'Inter', sans-serif",
              lineHeight: 1.7,
            }}
          >
            Real-time intelligence protecting millions of families every day
            across <strong style={{ color: '#D4A853' }}>127 countries</strong> with AI-powered safety.
          </motion.p>
        </div>

        {/* ── Counter grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {COUNTERS.map((counter, i) => (
            <CounterCard
              key={counter.label}
              counter={counter}
              color={CARD_COLORS[i]}
              index={i}
              inView={inView}
            />
          ))}
        </div>

        {/* ── Animated divider ────────────────────────────────────── */}
        <div style={{ marginTop: 64, position: 'relative', height: 1 }}>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: 1, transformOrigin: 'center',
              background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.35), rgba(75,128,240,0.25), rgba(16,185,129,0.25), rgba(212,168,83,0.35), transparent)',
            }}
          />
          {/* Center diamond */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 1.2, duration: 0.5 }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
              width: 8, height: 8,
              background: '#D4A853',
              boxShadow: '0 0 12px rgba(212,168,83,0.8)',
            }}
          />
        </div>

        {/* ── Bottom trust bar ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          style={{
            marginTop: 40, display: 'flex', flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'center', gap: 12,
          }}
        >
          {[
            { label: 'GDPR Compliant',    color: '#10B981' },
            { label: 'ISO 27001',         color: '#D4A853' },
            { label: 'SOC 2 Type II',     color: '#4B80F0' },
            { label: 'E2E Encrypted',     color: '#8B5CF6' },
            { label: '99.9% Uptime SLA',  color: '#06B6D4' },
          ].map((b) => (
            <div key={b.label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 999,
              background: `rgba(${b.color === '#10B981' ? '16,185,129' : b.color === '#D4A853' ? '212,168,83' : b.color === '#4B80F0' ? '75,128,240' : b.color === '#8B5CF6' ? '139,92,246' : '6,182,212'},0.08)`,
              border: `1px solid ${b.color}30`,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: b.color, boxShadow: `0 0 6px ${b.color}` }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: b.color, letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif" }}>
                {b.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
