'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface NavUser {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

/* ─── Navigation links ───────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Home',          href: '/',               scroll: '#hero'         },
  { label: 'Features',      href: '/features',       scroll: '#features'     },
  { label: 'How It Works',  href: '/',               scroll: '#how-it-works' },
  { label: 'AI Guardian',   href: '/ai-guardian',    scroll: '#ai-guardian'  },
  { label: 'Enterprise',    href: '/enterprise',     scroll: '#enterprise'   },
  { label: 'Pricing',       href: '/pricing',        scroll: '#pricing'      },
];

const ECOSYSTEM_ITEMS = [
  { label: 'Venus',    desc: "Women's safety",   icon: '♀',  href: '/features'        },
  { label: 'Jupiter',  desc: 'Enterprise fleet', icon: '🏢', href: '/integrations'    },
  { label: 'Titan',    desc: 'Elder care',       icon: '🤝', href: '/elderly-care'    },
  { label: 'Cosmo AI', desc: 'AI assistant',     icon: '✦',  href: '/ai-assistant'    },
  { label: 'Tag',      desc: 'Smart tracker',    icon: '📡', href: '/integrations'    },
];

/* ─── Smooth-scroll helper ───────────────────────────────────────────────────── */
function scrollToSection(href: string) {
  if (href === '#hero') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ─── Sun SVG ────────────────────────────────────────────────────────────────── */
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3"  />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"  />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
    </svg>
  );
}

/* ─── Moon SVG ───────────────────────────────────────────────────────────────── */
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/* ─── Logo SVG ───────────────────────────────────────────────────────────────── */
function LogoMark({ scrolled }: { scrolled: boolean }) {
  return (
    <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="gGoldNav" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4A853" />
          <stop offset="100%" stopColor="#B8720A" />
        </linearGradient>
        <linearGradient id="gWhiteNav" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="12"
        fill={scrolled ? 'url(#gGoldNav)' : 'url(#gWhiteNav)'}
        opacity="0.9"
      />
      <circle cx="14" cy="14" r="12" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <text x="14" y="18.5" textAnchor="middle" fontSize="13" fontWeight="800"
        fill={scrolled ? 'white' : '#1A56DB'}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        G
      </text>
    </svg>
  );
}

/* ─── Ecosystem Dropdown ─────────────────────────────────────────────────────── */
function EcosystemDropdown({ isDark, onClose }: { isDark: boolean; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 rounded-2xl overflow-hidden
        ${isDark
          ? 'bg-[#111420]/95 border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.6)]'
          : 'bg-white/95 border border-[var(--border)] shadow-[var(--shadow-lg)]'
        }
      `}
      style={{ backdropFilter: 'blur(24px)' }}
    >
      <div className="p-2">
        {ECOSYSTEM_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors duration-150
              ${isDark
                ? 'hover:bg-white/[0.06] text-[var(--text-primary)]'
                : 'hover:bg-[var(--bg-surface2)] text-[var(--text-primary)]'
              }
            `}
            style={{ textDecoration: 'none', display: 'flex' }}
          >
            <span className="text-base w-6 text-center">{item.icon}</span>
            <span>
              <span className="block text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {item.label}
              </span>
              <span className="block text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                {item.desc}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── User Avatar Dropdown ───────────────────────────────────────────────────── */
function UserMenu({ user, isDark, onLogout }: { user: NavUser; isDark: boolean; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all focus:outline-none"
        style={{
          borderColor: isDark ? 'rgba(212,168,83,0.25)' : 'rgba(212,168,83,0.35)',
          background: isDark ? 'rgba(212,168,83,0.07)' : 'rgba(212,168,83,0.08)',
        }}
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#D4A853,#F5C842)', color: '#1A0F05' }}
        >
          {user.avatar_url
            ? <img src={user.avatar_url} alt={user.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
            : initials}
        </div>
        <span className="text-sm font-medium max-w-[90px] truncate" style={{ color: 'var(--text-primary)' }}>
          {user.name.split(' ')[0]}
        </span>
        <motion.svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
          style={{ color: 'var(--text-muted)', flexShrink: 0 }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden"
            style={{
              background: isDark ? 'rgba(17,20,32,0.97)' : 'rgba(255,255,255,0.97)',
              border: isDark ? '1px solid rgba(212,168,83,0.12)' : '1px solid rgba(212,168,83,0.2)',
              backdropFilter: 'blur(24px)',
              boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              {[
                { label: 'Dashboard', icon: '🗺️', href: '/live-tracking' },
                { label: 'Billing', icon: '💳', href: '/billing' },
                { label: 'Settings', icon: '⚙️', href: '/settings' },
                { label: 'Security (2FA)', icon: '🔐', href: '/auth/2fa' },
              ].map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    display: 'flex',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(212,168,83,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>{item.icon}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif" }}>{item.label}</span>
                </Link>
              ))}

              {/* Divider */}
              <div className="my-1.5 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

              {/* Logout */}
              <button
                onClick={() => { setOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
                style={{ color: '#ef4444', fontFamily: "'Inter', sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Navbar ────────────────────────────────────────────────────────────── */
export default function Navbar() {
  const [scrolled,      setScrolled]      = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [ecosystemOpen, setEcosystemOpen] = useState(false);
  const [isDark,        setIsDark]        = useState(true);
  const [mounted,       setMounted]       = useState(false);
  const [user,          setUser]          = useState<NavUser | null>(null);
  const ecosystemRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';

  /* ── Auth: check token on mount ──────────────────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem('gravity_token');
    if (!token) return;
    fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.id) setUser(data); })
      .catch(() => {});
  }, [pathname]); // re-check on route change (catches post-login redirect)

  function handleLogout() {
    localStorage.removeItem('gravity_token');
    setUser(null);
    router.push('/');
  }

  function handleNavClick(link: { href: string; scroll: string }) {
    setMenuOpen(false);
    if (isHome) {
      setTimeout(() => scrollToSection(link.scroll), menuOpen ? 300 : 0);
    } else if (link.href === '/') {
      router.push('/');
    } else {
      router.push(link.href);
    }
  }

  /* ── Hydration-safe theme init ───────────────────────────────────────────── */
  useEffect(() => {
    setMounted(true);

    // Public marketing site is always dark — panel theme preference doesn't affect it
    setIsDark(true);
    document.documentElement.classList.add('dark');

    // Watch for class changes (e.g. from other components toggling theme)
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  /* ── Scroll detection ────────────────────────────────────────────────────── */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* ── Body scroll lock on mobile menu ────────────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  /* ── Close ecosystem dropdown on outside click ───────────────────────────── */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ecosystemRef.current && !ecosystemRef.current.contains(e.target as Node)) {
        setEcosystemOpen(false);
      }
    }
    if (ecosystemOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ecosystemOpen]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('gravity-theme', next ? 'dark' : 'light');
  }

  /* ── Dynamic header background ───────────────────────────────────────────── */
  const headerBg = scrolled
    ? isDark
      ? 'backdrop-blur-xl border-b shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
      : 'backdrop-blur-xl border-b shadow-sm'
    : 'border-b border-transparent';

  const headerStyle = scrolled
    ? {
        backgroundColor: isDark
          ? 'rgba(11,13,19,0.88)'
          : 'rgba(255,255,255,0.88)',
        borderColor: isDark ? 'rgba(240,237,232,0.07)' : 'rgba(15,17,23,0.08)',
      }
    : {};

  /* ── Nav link style ───────────────────────────────────────────────────────── */
  const linkStyle = isDark
    ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05]'
    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface2)]';

  return (
    <>
      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}
        style={headerStyle}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 h-[72px] flex items-center justify-between gap-4">

          {/* ── Logo ───────────────────────────────────────────────────────── */}
          <button
            onClick={() => scrollToSection('#hero')}
            className="flex items-center gap-2.5 group focus:outline-none shrink-0"
            aria-label="Trackalways KVL Track — scroll to top"
          >
            <motion.div
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                filter: scrolled
                  ? 'drop-shadow(0 0 12px rgba(212,168,83,0.5))'
                  : 'drop-shadow(0 0 8px rgba(255,255,255,0.2))',
              }}
            >
              <LogoMark scrolled={scrolled} />
            </motion.div>
            <div className="flex flex-col leading-none">
              <span
                className="text-[8px] font-semibold tracking-[0.22em] uppercase transition-colors"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: isDark ? 'var(--text-muted)' : 'var(--text-muted)',
                }}
              >
                TRACKALWAYS
              </span>
              <span
                className="text-[17px] font-extrabold tracking-wide transition-colors"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: scrolled
                    ? 'var(--gold)'
                    : 'var(--text-primary)',
                }}
              >
                KVL TRACK
              </span>
            </div>
          </button>

          {/* ── Desktop nav ────────────────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-150 focus:outline-none ${linkStyle}`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {link.label}
              </button>
            ))}

            {/* Ecosystem dropdown trigger */}
            <div ref={ecosystemRef} className="relative">
              <button
                onClick={() => setEcosystemOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-150 focus:outline-none ${linkStyle}`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Ecosystem
                <motion.svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  animate={{ rotate: ecosystemOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </button>
              <AnimatePresence>
                {ecosystemOpen && (
                  <EcosystemDropdown
                    isDark={isDark}
                    onClose={() => setEcosystemOpen(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* ── Desktop right side ─────────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.06 }}
              aria-label="Toggle light/dark theme"
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors duration-200 focus:outline-none
                ${isDark
                  ? 'border-white/[0.10] bg-white/[0.05] text-amber-300 hover:bg-white/[0.09]'
                  : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-amber-600 hover:bg-[var(--bg-surface2)] shadow-sm'
                }
              `}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mounted ? (
                  isDark ? (
                    <motion.span key="sun"
                      initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center"
                    >
                      <SunIcon />
                    </motion.span>
                  ) : (
                    <motion.span key="moon"
                      initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center"
                    >
                      <MoonIcon />
                    </motion.span>
                  )
                ) : (
                  <span key="ph" className="w-4 h-4 block" />
                )}
              </AnimatePresence>
            </motion.button>

            {/* Auth: logged out → Login + Sign Up | logged in → UserMenu */}
            <AnimatePresence mode="wait">
              {user ? (
                <motion.div key="user-menu"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <UserMenu user={user} isDark={isDark} onLogout={handleLogout} />
                </motion.div>
              ) : (
                <motion.div key="auth-btns"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <Link href="/login">
                    <motion.span
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="block px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: 'var(--text-primary)',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'var(--border)',
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'var(--bg-surface)',
                      }}
                    >
                      Log in
                    </motion.span>
                  </Link>
                  <Link href="/signup">
                    <motion.span
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      className="block btn-gold px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Get Started Free
                    </motion.span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Mobile right: theme + hamburger ────────────────────────────── */}
          <div className="lg:hidden flex items-center gap-1.5">
            {/* Theme toggle — mobile */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.88 }}
              aria-label="Toggle theme"
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors focus:outline-none
                ${isDark
                  ? 'border-white/[0.10] bg-white/[0.05] text-amber-300'
                  : 'border-[var(--border)] bg-[var(--bg-surface)] text-amber-600 shadow-sm'
                }
              `}
            >
              {mounted ? (isDark ? <SunIcon /> : <MoonIcon />) : <span className="w-4 h-4 block" />}
            </motion.button>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors focus:outline-none
                ${isDark ? 'hover:bg-white/[0.06] text-[var(--text-primary)]' : 'hover:bg-[var(--bg-surface2)] text-[var(--text-primary)]'}
              `}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <div className="w-5 h-4 relative flex flex-col justify-between">
                <motion.span
                  animate={menuOpen ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="block h-[2px] w-5 rounded-full origin-center"
                  style={{ backgroundColor: 'var(--text-primary)' }}
                />
                <motion.span
                  animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.18 }}
                  className="block h-[2px] w-5 rounded-full"
                  style={{ backgroundColor: 'var(--text-primary)' }}
                />
                <motion.span
                  animate={menuOpen ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="block h-[2px] w-5 rounded-full origin-center"
                  style={{ backgroundColor: 'var(--text-primary)' }}
                />
              </div>
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile full-screen overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed inset-0 z-40 flex flex-col`}
            style={{
              backgroundColor: isDark ? 'rgba(11,13,19,0.97)' : 'rgba(249,247,244,0.97)',
              backdropFilter: 'blur(28px)',
            }}
          >
            {/* Warm ambient blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute w-[400px] h-[400px] rounded-full animate-blob"
                style={{
                  top: '10%', left: '50%', transform: 'translateX(-50%)',
                  background: isDark
                    ? 'radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(184,114,10,0.07) 0%, transparent 70%)',
                  filter: 'blur(60px)',
                }}
              />
              <div
                className="absolute w-[300px] h-[300px] rounded-full animate-blob"
                style={{
                  bottom: '15%', right: '10%',
                  background: isDark
                    ? 'radial-gradient(circle, rgba(75,128,240,0.07) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(26,86,219,0.05) 0%, transparent 70%)',
                  filter: 'blur(60px)',
                  animationDelay: '4s',
                }}
              />
            </div>

            {/* Header row in overlay */}
            <div className="relative flex items-center justify-between px-6 h-[72px] shrink-0">
              <div className="flex items-center gap-2.5">
                <LogoMark scrolled />
                <div className="flex flex-col leading-none">
                  <span className="text-[8px] font-semibold tracking-[0.22em] uppercase"
                    style={{ color: 'var(--text-muted)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    TRACKALWAYS
                  </span>
                  <span className="text-[17px] font-extrabold tracking-wide"
                    style={{ color: 'var(--gold)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    KVL TRACK
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                  ${isDark ? 'hover:bg-white/[0.06] text-[var(--text-primary)]' : 'hover:bg-[var(--bg-surface2)] text-[var(--text-primary)]'}
                `}
                aria-label="Close menu"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="3" x2="15" y2="15" />
                  <line x1="15" y1="3" x2="3" y2="15" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <div className="relative flex-1 flex flex-col items-center justify-center gap-1 px-6 -mt-8">
              {[...NAV_LINKS, { label: 'Integrations', href: '/integrations', scroll: '#ecosystem' }].map((link, i) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, x: -28 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i + 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => handleNavClick(link)}
                  className={`w-full max-w-sm text-center py-4 text-2xl font-bold border-b transition-colors focus:outline-none
                    ${isDark
                      ? 'border-white/[0.06] text-[var(--text-primary)] hover:text-[var(--gold)]'
                      : 'border-[var(--border)] text-[var(--text-primary)] hover:text-[var(--gold)]'
                    }
                  `}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {link.label}
                </motion.button>
              ))}

              {/* Mobile auth buttons */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 w-full max-w-sm flex flex-col gap-3"
              >
                {user ? (
                  <>
                    {/* Logged in mobile: show user + links */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{ background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.15)' }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg,#D4A853,#F5C842)', color: '#1A0F05' }}>
                        {user.name.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                      </div>
                    </div>
                    <Link href="/live-tracking" onClick={() => setMenuOpen(false)}
                      className="block text-center py-3.5 rounded-2xl text-base font-semibold btn-gold"
                      style={{ fontFamily: "'Inter', sans-serif", textDecoration: 'none' }}>
                      Open Dashboard
                    </Link>
                    <button onClick={() => { setMenuOpen(false); handleLogout(); }}
                      className="py-3.5 rounded-2xl text-base font-medium border transition-colors"
                      style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', fontFamily: "'Inter', sans-serif" }}>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/signup" onClick={() => setMenuOpen(false)}
                      className="block text-center py-4 text-base font-bold rounded-2xl btn-gold"
                      style={{ fontFamily: "'Inter', sans-serif", textDecoration: 'none' }}>
                      Get Started Free
                    </Link>
                    <Link href="/login" onClick={() => setMenuOpen(false)}
                      className="block text-center py-4 text-base font-medium rounded-2xl border transition-colors"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: 'var(--text-primary)',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'var(--border)',
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'var(--bg-surface)',
                        textDecoration: 'none',
                      }}>
                      Log in
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
