'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

/* ─────────────────────────────────────────────────────
   Testimonial data — Row 1 (marquee)
───────────────────────────────────────────────────── */
const ROW1 = [
  {
    name: 'Riya Sharma',
    location: 'Mumbai, India',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
    quote: 'I was so anxious when my daughter started college in another city. KVL Track changed everything — I can see she\'s safe without being intrusive.',
  },
  {
    name: 'James Chen',
    location: 'San Francisco, USA',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
    quote: 'My elderly father lives alone. The fall detection and daily check-ins give our whole family peace of mind. Worth every penny.',
  },
  {
    name: 'Amina Hassan',
    location: 'Dubai, UAE',
    photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&auto=format&fit=crop&q=80',
    quote: 'The SOS feature saved my son when he had a bike accident. The app sent our location immediately. I can\'t imagine life without it.',
  },
]

/* ─────────────────────────────────────────────────────
   Testimonial data — Row 2 (marquee-reverse)
───────────────────────────────────────────────────── */
const ROW2 = [
  {
    name: 'Carlos Mendoza',
    location: 'Mexico City, Mexico',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
    quote: 'Setting geofences for the school and home was so easy. Now I get notified automatically — no more "did you reach?" texts!',
  },
  {
    name: 'Sarah Williams',
    location: 'London, UK',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80',
    quote: 'My kids are teenagers — they don\'t always answer calls. KVL Track lets me check in quietly without making it awkward. Love the Ghost Mode too!',
  },
  {
    name: 'Vikram Patel',
    location: 'Bangalore, India',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80',
    quote: 'The driving safety feature is incredible. I know when my son speeds or brakes hard. It\'s made him a better driver honestly.',
  },
]

/* ─────────────────────────────────────────────────────
   Single card
───────────────────────────────────────────────────── */
function TestimonialCard({ t }: { t: (typeof ROW1)[0] }) {
  return (
    <div
      className="relative flex-shrink-0 rounded-2xl p-6 cursor-default transition-all duration-300 hover:scale-[1.02]"
      style={{
        width: 340,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--glow-gold)'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(var(--gold-rgb),0.3)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
      }}
    >
      {/* Decorative quote mark */}
      <span
        className="absolute top-4 right-5 select-none pointer-events-none leading-none"
        style={{ fontSize: 56, color: 'var(--gold)', opacity: 0.18, fontFamily: 'Georgia, serif' }}
        aria-hidden="true"
      >
        ❝
      </span>

      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {[1,2,3,4,5].map(i => (
          <span key={i} className="text-amber-400 text-sm leading-none">★</span>
        ))}
      </div>

      {/* Quote text */}
      <p
        className="text-sm leading-relaxed relative z-10"
        style={{ color: 'var(--text-secondary)' }}
      >
        &ldquo;{t.quote}&rdquo;
      </p>

      {/* Author row */}
      <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div
          className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
          style={{ border: '2px solid var(--gold-light)' }}
        >
          <Image
            src={t.photo}
            alt={t.name}
            width={48}
            height={48}
            unoptimized
            className="object-cover w-full h-full"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {t.name}
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            📍 {t.location}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   Marquee row
───────────────────────────────────────────────────── */
function MarqueeRow({
  items,
  reverse = false,
  duration = 35,
}: {
  items: (typeof ROW1)
  reverse?: boolean
  duration?: number
}) {
  // Duplicate for seamless loop
  const doubled = [...items, ...items, ...items]

  return (
    <div
      className="overflow-hidden"
      style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)', maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}
    >
      <div
        className="flex gap-4 w-max"
        style={{
          animation: `${reverse ? 'marquee-reverse' : 'marquee'} ${duration}s linear infinite`,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running' }}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} t={t} />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   Rating badge
───────────────────────────────────────────────────── */
function RatingBadge({ store, rating, count }: { store: string; rating: string; count: string }) {
  return (
    <div
      className="flex items-center gap-3 px-6 py-4 rounded-2xl"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {rating}
          </span>
          <span className="text-xl text-amber-400">★</span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>on {store}</p>
      </div>
      <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{count} reviews</p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   Main section
───────────────────────────────────────────────────── */
export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative py-24 overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Warm ambient glows — gold only, no cold blue */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(184,114,10,0.08) 0%, transparent 65%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="inline-block text-xs font-bold tracking-widest uppercase mb-5 px-4 py-1.5 rounded-full"
            style={{
              color: 'var(--gold)',
              background: 'rgba(var(--gold-rgb),0.1)',
              border: '1px solid rgba(var(--gold-rgb),0.25)',
            }}
          >
            Real Families
          </span>

          <h2
            className="text-4xl md:text-5xl font-extrabold leading-[1.15]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            Loved by 50,000+<br />
            <span className="gradient-text-gold">Families Worldwide</span>
          </h2>

          <p className="text-lg mt-4 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Real stories from real people whose lives changed with KVL Track.
          </p>
        </motion.div>
      </div>

      {/* Marquee rows — full width, no horizontal padding cap */}
      <div className="space-y-5">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <MarqueeRow items={ROW1} reverse={false} duration={35} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          <MarqueeRow items={ROW2} reverse={true} duration={40} />
        </motion.div>
      </div>

      {/* Rating badges */}
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-4 mt-14 flex-wrap"
        >
          <RatingBadge store="App Store" rating="4.9" count="8,400+" />

          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--gold), #B8720A)', color: 'white', fontFamily: 'var(--font-display)', boxShadow: 'var(--glow-gold)' }}
          >
            G
          </div>

          <RatingBadge store="Google Play" rating="4.8" count="6,200+" />
        </motion.div>
      </div>
    </section>
  )
}
