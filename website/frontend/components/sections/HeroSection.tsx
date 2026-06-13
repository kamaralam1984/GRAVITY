'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/* ─── Hero background slides ─────────────────────────────────────────────────── */
const HERO_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=1920&auto=format&fit=crop&q=85',
    label: 'Family connected through Gravity',
  },
  {
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&auto=format&fit=crop&q=85',
    label: 'Always together, wherever you are',
  },
  {
    src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1920&auto=format&fit=crop&q=85',
    label: 'Real-time tracking for peace of mind',
  },
  {
    src: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1920&auto=format&fit=crop&q=85',
    label: 'Every family member protected',
  },
];

/* ─── Map avatar pin data ─────────────────────────────────────────────────────── */
interface PinDef {
  initials: string;
  name: string;
  color: string;
  photo: string;
  top: string;
  left?: string;
  right?: string;
  floatDelay: number;
  floatDur: number;
}
const MAP_PINS: PinDef[] = [
  {
    initials: 'M', name: 'Mom', color: '#3B82F6',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
    top: '22%', left: '18%', floatDelay: 0,   floatDur: 3.4,
  },
  {
    initials: 'P', name: 'Priya', color: '#10B981',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
    top: '14%', right: '20%', floatDelay: 0.5, floatDur: 2.9,
  },
  {
    initials: 'R', name: 'Raj', color: '#F59E0B',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
    top: '60%', left: '24%', floatDelay: 0.9, floatDur: 3.8,
  },
  {
    initials: 'A', name: 'Anya', color: '#A855F7',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
    top: '55%', right: '18%', floatDelay: 0.7, floatDur: 3.2,
  },
];

/* ─── Social proof avatars ───────────────────────────────────────────────────── */
const PROOF_AVATARS = [
  { photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=faces&auto=format&q=80' },
  { photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces&auto=format&q=80' },
  { photo: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=64&h=64&fit=crop&crop=faces&auto=format&q=80' },
  { photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=64&h=64&fit=crop&crop=faces&auto=format&q=80' },
  { photo: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=64&h=64&fit=crop&crop=faces&auto=format&q=80' },
];

/* ─── Notification badges ────────────────────────────────────────────────────── */
const BADGES = [
  {
    id: 'school',
    dotColor: '#10B981',
    text: 'Priya reached school',
    sub: 'Just now · Safe',
    position: { top: '8%', left: '-5%' },
    floatDur: 3.5,
    type: 'safe' as const,
  },
  {
    id: 'sos',
    dotColor: '#EF4444',
    text: 'SOS Alert',
    sub: 'Live location sent',
    position: { top: '45%', right: '-8%' },
    floatDur: 2.8,
    type: 'sos' as const,
  },
  {
    id: 'battery',
    dotColor: '#F59E0B',
    text: 'Battery Low: 18%',
    sub: "Dad's phone",
    position: { bottom: '12%', left: '-4%' },
    floatDur: 4.0,
    type: 'warn' as const,
  },
] as const;

/* ─── Stat pills ─────────────────────────────────────────────────────────────── */
const STATS = [
  { dot: '#10B981', label: '99.9% Uptime' },
  { dot: '#3B82F6', label: '50+ Countries' },
  { dot: '#D4A853', label: 'Military Grade Encryption' },
];

/* ─── Entrance animation factory ─────────────────────────────────────────────── */
function fadeUp(delay: number) {
  return {
    initial:    { opacity: 0, y: 30 },
    animate:    { opacity: 1, y: 0  },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  };
}

/* ─── Hero Section ───────────────────────────────────────────────────────────── */
export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isDark,  setIsDark]  = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  /* Theme detection via MutationObserver */
  useEffect(() => {
    setMounted(true);
    const update = () => setIsDark(document.documentElement.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  /* Slide auto-advance */
  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  /* Parallax scroll */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden pt-20 flex items-center"
      style={{ background: 'var(--hero-bg)' }}
    >
      {/* ── Background: auto-sliding images ──────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {HERO_SLIDES.map((slide, i) => (
          <motion.div
            key={slide.src}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: i === activeSlide ? 1 : 0, scale: i === activeSlide ? 1.06 : 1 }}
            transition={{ opacity: { duration: 1.4, ease: 'easeInOut' }, scale: { duration: 6, ease: 'linear' } }}
            style={{ originX: '50%', originY: '50%' }}
          >
            <Image
              src={slide.src}
              alt={slide.label}
              fill
              sizes="100vw"
              priority={i === 0}
              loading={i === 0 ? undefined : 'lazy'}
              className="object-cover object-center"
              style={{ opacity: 'var(--hero-photo-opacity)' as unknown as number }}
            />
          </motion.div>
        ))}
        {/* Gradient overlay */}
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* ── Warm animated blobs (background atmosphere) ───────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {/* Blob 1 — large warm gold, top-left */}
        <motion.div style={{ y: blob1Y }} aria-hidden>
          <div
            style={{
              position: 'absolute',
              top: '-80px',
              left: '5%',
              width: '700px',
              height: '700px',
              background: 'var(--hero-blob1)',
              filter: 'blur(70px)',
              borderRadius: '60% 40% 35% 65% / 55% 45% 55% 45%',
              animation: 'blob-morph 12s ease-in-out infinite',
            }}
          />
        </motion.div>

        {/* Blob 2 — deep amber/rust, bottom-right */}
        <motion.div style={{ y: blob2Y }} aria-hidden>
          <div
            style={{
              position: 'absolute',
              bottom: '-100px',
              right: '8%',
              width: '600px',
              height: '600px',
              background: 'var(--hero-blob2)',
              filter: 'blur(80px)',
              borderRadius: '45% 55% 55% 45% / 40% 60% 40% 60%',
              animation: 'blob-morph 18s ease-in-out infinite reverse',
            }}
          />
        </motion.div>

        {/* Blob 3 — gold, center-right for phone glow */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '15%',
            width: '400px',
            height: '400px',
            background: 'var(--hero-blob3)',
            filter: 'blur(60px)',
            animation: 'breathe 6s ease-in-out infinite',
          }}
          aria-hidden
        />
      </div>

      {/* ── Main content grid ────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-[55fr_45fr] gap-10 lg:gap-8 items-center">

          {/* ═══════════════════════════════════════════════════════════════════
              LEFT COLUMN — Text
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col">

            {/* 1. Eyebrow trust badge */}
            <motion.div {...fadeUp(0.1)}>
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: isDark ? 'rgba(212,168,83,0.10)' : 'rgba(184,114,10,0.08)',
                  border: `1px solid ${isDark ? 'rgba(212,168,83,0.22)' : 'rgba(184,114,10,0.20)'}`,
                  color: isDark ? '#D4A853' : '#B8720A',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {/* Gold pulse dot */}
                <span className="relative flex h-2 w-2 shrink-0">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: isDark ? '#D4A853' : '#B8720A' }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: isDark ? '#D4A853' : '#B8720A' }}
                  />
                </span>
                Trusted by 50,000+ Families Worldwide
              </span>
            </motion.div>

            {/* 2. Main headline — static render for fast LCP, CSS fade avoids JS dependency */}
            <h1
              className="mt-5 font-extrabold leading-[1.06] tracking-tight text-5xl sm:text-6xl lg:text-7xl"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--text-primary)',
                animation: 'slide-up-in 0.7s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              Your Family,
              <br />
              Always{' '}
              <span className="gradient-text-gold">Within</span>
              <br />
              <span className="gradient-text-gold">Reach</span>
            </h1>

            {/* 3. Subheadline */}
            <motion.p
              {...fadeUp(0.3)}
              className="mt-5 text-lg md:text-xl leading-relaxed max-w-lg"
              style={{
                color: 'var(--text-secondary)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              One app. Every family member protected — children, parents,
              grandparents. Wherever life takes them.
            </motion.p>

            {/* 4. CTA buttons */}
            <motion.div {...fadeUp(0.4)} className="flex flex-wrap gap-3 mt-8">
              {/* Primary — gold */}
              <motion.a
                href="#download"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                className="btn-gold inline-flex items-center gap-2 py-3.5 px-7 rounded-2xl text-base font-semibold text-white"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Download Free
              </motion.a>

              {/* Secondary — glass outlined */}
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  const el = document.querySelector('#how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 py-3.5 px-7 rounded-2xl text-base font-semibold transition-all duration-200 focus:outline-none"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-primary)',
                  backdropFilter: 'blur(16px)',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {/* Play circle */}
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: isDark ? 'rgba(212,168,83,0.15)' : 'rgba(184,114,10,0.12)' }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10"
                    style={{ color: isDark ? '#D4A853' : '#B8720A', marginLeft: '1px' }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                See How It Works
              </motion.button>
            </motion.div>

            {/* 5. Social proof */}
            <motion.div {...fadeUp(0.5)} className="flex items-center gap-3 mt-6">
              {/* Overlapping avatars */}
              <div className="flex -space-x-2.5">
                {PROOF_AVATARS.map((av, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 overflow-hidden shrink-0"
                    style={{
                      borderColor: isDark ? 'var(--bg)' : 'var(--bg)',
                      zIndex: PROOF_AVATARS.length - i,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={av.photo} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span
                className="text-sm"
                style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
              >
                <strong style={{ color: 'var(--text-secondary)' }}>50,000+</strong> families trust Gravity
              </span>
            </motion.div>

            {/* 6. Stat pills */}
            <motion.div {...fadeUp(0.55)} className="flex flex-wrap gap-2.5 mt-5">
              {STATS.map((s) => (
                <span
                  key={s.label}
                  className="glass-warm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    color: 'var(--text-secondary)',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
                  {s.label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              RIGHT COLUMN — Phone mockup + notification badges
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="hidden md:flex justify-center items-center relative py-8">

            {/* Soft glow behind phone */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
              style={{
                background: isDark
                  ? 'radial-gradient(circle, rgba(212,168,83,0.15) 0%, transparent 65%)'
                  : 'radial-gradient(circle, rgba(184,114,10,0.10) 0%, transparent 65%)',
                filter: 'blur(40px)',
                animation: 'breathe 5s ease-in-out infinite',
              }}
              aria-hidden
            />

            {/* Phone wrapper with parallax */}
            <motion.div
              style={{ y: phoneY }}
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="relative"
              aria-label="Gravity app phone preview"
            >
              {/* ── Floating notification badges ─────────────────────────── */}
              {BADGES.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.7, x: badge.type === 'sos' ? 20 : -20 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: [0, badge.type === 'warn' ? 7 : -7, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.4, delay: 0.5 + i * 0.2 },
                    scale:   { duration: 0.4, delay: 0.5 + i * 0.2, ease: 'backOut' },
                    x:       { duration: 0.4, delay: 0.5 + i * 0.2 },
                    y: {
                      duration: badge.floatDur,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1.2 + i * 0.3,
                    },
                  }}
                  className="absolute z-20 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl whitespace-nowrap"
                  style={{
                    ...badge.position,
                    backdropFilter: 'blur(20px)',
                    backgroundColor:
                      badge.type === 'sos'
                        ? isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)'
                        : isDark ? 'rgba(212,168,83,0.08)' : 'rgba(184,114,10,0.07)',
                    border:
                      badge.type === 'sos'
                        ? `1px solid ${isDark ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.20)'}`
                        : `1px solid ${isDark ? 'rgba(212,168,83,0.20)' : 'rgba(184,114,10,0.18)'}`,
                    boxShadow: isDark
                      ? '0 8px 32px rgba(0,0,0,0.4)'
                      : '0 8px 24px rgba(0,0,0,0.10)',
                  }}
                >
                  {/* Animated dot */}
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: badge.dotColor }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: badge.dotColor }}
                    />
                  </span>
                  <span>
                    <span
                      className="block text-xs font-semibold"
                      style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}
                    >
                      {badge.text}
                    </span>
                    <span
                      className="block text-[10px]"
                      style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                    >
                      {badge.sub}
                    </span>
                  </span>
                </motion.div>
              ))}

              {/* ── Phone shell ─────────────────────────────────────────── */}
              <div
                className="relative w-56 sm:w-64 rounded-[3rem] overflow-hidden animate-float"
                style={{
                  border: `4px solid ${isDark ? 'rgba(240,237,232,0.12)' : 'rgba(15,17,23,0.12)'}`,
                  backgroundColor: isDark ? '#111420' : '#FFFFFF',
                  boxShadow: isDark
                    ? 'var(--glow-gold), 0 24px 80px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.04)'
                    : 'var(--glow-gold), 0 24px 60px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(0,0,0,0.04)',
                  animationDuration: '6s',
                }}
                aria-hidden
              >
                {/* Dynamic island / notch */}
                <div
                  className="mx-auto mt-2 w-20 h-5 rounded-full flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: '#000',
                    marginLeft: 'auto', marginRight: 'auto',
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-[#1C1C1E]" />
                  <div className="w-3 h-3 rounded-full bg-[#1C1C1E]" />
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between px-5 pt-1.5 pb-1">
                  <span
                    className="text-[9px] font-medium"
                    style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                  >
                    9:41
                  </span>
                  <div className="flex items-center gap-1">
                    {/* Signal bars */}
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <rect x="0" y="7" width="2" height="3" rx="0.5" fill="var(--text-muted)" />
                      <rect x="3" y="5" width="2" height="5" rx="0.5" fill="var(--text-muted)" />
                      <rect x="6" y="3" width="2" height="7" rx="0.5" fill="var(--text-muted)" />
                      <rect x="9" y="0" width="2" height="10" rx="0.5" fill="var(--text-muted)" />
                    </svg>
                    {/* Battery */}
                    <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
                      <rect x="0.5" y="0.5" width="14" height="9" rx="2" stroke="var(--text-muted)" strokeWidth="1" />
                      <rect x="2" y="2" width="9" height="6" rx="1" fill="#10B981" />
                      <path d="M15.5 3.5v3a1.5 1.5 0 000-3z" fill="var(--text-muted)" />
                    </svg>
                  </div>
                </div>

                {/* App header */}
                <div
                  className="flex items-center justify-between px-4 py-2"
                  style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Family Map
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span
                      className="text-[10px] font-semibold text-emerald-500"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      LIVE
                    </span>
                  </span>
                </div>

                {/* Map area */}
                <div
                  className="relative mx-3 mt-2.5 rounded-2xl overflow-hidden"
                  style={{
                    height: 200,
                    background: isDark
                      ? 'linear-gradient(145deg, #0B1525 0%, #0F1E35 100%)'
                      : 'linear-gradient(145deg, #dbeafe 0%, #eff6ff 100%)',
                  }}
                >
                  {/* Organic road paths */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    {/* Roads */}
                    <motion.path
                      d="M10 80 Q70 50 140 90 Q180 110 230 70"
                      stroke={isDark ? 'rgba(75,128,240,0.22)' : 'rgba(37,99,235,0.20)'}
                      strokeWidth="2.5" fill="none" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 1.6, delay: 0.6, ease: 'easeOut' }}
                    />
                    <motion.path
                      d="M0 150 Q60 130 120 160 Q170 185 240 150"
                      stroke={isDark ? 'rgba(75,128,240,0.15)' : 'rgba(37,99,235,0.14)'}
                      strokeWidth="2" fill="none" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 1.6, delay: 0.85, ease: 'easeOut' }}
                    />
                    <motion.path
                      d="M80 0 Q100 60 80 130 Q70 180 100 200"
                      stroke={isDark ? 'rgba(75,128,240,0.13)' : 'rgba(37,99,235,0.12)'}
                      strokeWidth="1.5" fill="none" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 1.6, delay: 1.1, ease: 'easeOut' }}
                    />
                    {/* Area accuracy glow */}
                    <circle cx="120" cy="100" r="22" fill={isDark ? 'rgba(212,168,83,0.08)' : 'rgba(184,114,10,0.06)'} />
                    <circle cx="120" cy="100" r="12" fill={isDark ? 'rgba(212,168,83,0.15)' : 'rgba(184,114,10,0.12)'} />
                    <circle cx="120" cy="100" r="5"  fill={isDark ? 'rgba(212,168,83,0.55)' : 'rgba(184,114,10,0.5)'} />
                  </svg>

                  {/* Avatar pins */}
                  {MAP_PINS.map((pin) => (
                    <motion.div
                      key={pin.initials}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                      transition={{
                        opacity: { duration: 0.35, delay: 0.7 + pin.floatDelay },
                        scale:   { duration: 0.35, delay: 0.7 + pin.floatDelay, ease: 'backOut' },
                        y: {
                          duration: pin.floatDur,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: pin.floatDelay + 1.1,
                        },
                      }}
                      className="absolute z-10"
                      style={{ top: pin.top, left: pin.left, right: pin.right }}
                    >
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden border-2"
                        style={{
                          borderColor: `${pin.color}99`,
                          boxShadow: `0 4px 16px ${pin.color}66, 0 0 0 3px ${pin.color}22`,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pin.photo}
                          alt={pin.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Pulse ring */}
                      <motion.div
                        animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: pin.floatDelay }}
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: pin.color, opacity: 0.4 }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Bottom safety bar */}
                <div className="px-4 pt-3 pb-4">
                  <div
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style={{
                      backgroundColor: isDark ? 'rgba(16,185,129,0.07)' : 'rgba(4,120,87,0.06)',
                      border: `1px solid ${isDark ? 'rgba(16,185,129,0.18)' : 'rgba(4,120,87,0.15)'}`,
                    }}
                  >
                    <div>
                      <p
                        className="text-[9px] font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                      >
                        Family Circle
                      </p>
                      <p
                        className="text-xs font-bold mt-0.5"
                        style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        All 4 members safe
                      </p>
                    </div>
                    {/* Checkmark */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(4,120,87,0.12)' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6.5L4.5 9L10 3" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* ── Slide dot navigation ─────────────────────────────────────────────── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            aria-label={`Slide ${i + 1}`}
            className="relative h-1.5 rounded-full transition-all duration-500 focus:outline-none"
            style={{
              width: i === activeSlide ? 28 : 8,
              background: i === activeSlide
                ? 'var(--gold)'
                : 'rgba(255,255,255,0.35)',
            }}
          >
            {i === activeSlide && (
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--gold)', opacity: 0.4 }}
                animate={{ scaleX: [0, 1] }}
                transition={{ duration: 5, ease: 'linear' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Bottom fade ──────────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, var(--bg), transparent)',
        }}
        aria-hidden
      />
    </section>
  );
}
