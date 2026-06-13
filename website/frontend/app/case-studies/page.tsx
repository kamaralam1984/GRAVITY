'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import {
  BookOpen, Users, Shield, Heart, Car, TrendingUp,
  ChevronRight, ArrowRight, Clock, MapPin, Star,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/* ── Types ─────────────────────────────────────────────────────── */
interface CaseStudy {
  id: string
  title: string
  category: string
  readTime: string
  summary: string
  icon: React.ElementType
  accent: string
  rgb: string
  tag: string
}

/* ── Grid Case Studies Data ────────────────────────────────────── */
const CASE_STUDIES: CaseStudy[] = [
  {
    id: "delhi-school-zones",
    title: "How Delhi Parents Use School Zones to Eliminate Morning Anxiety",
    category: "Child Safety",
    readTime: "5 min read",
    summary: "A group of 200+ Delhi parents discovered how Gravity geofences around school entrances turned chaotic drop-off mornings into calm, confident routines.",
    icon: Shield,
    accent: "#6366F1",
    rgb: "99,102,241",
    tag: "Child Safety",
  },
  {
    id: "mehta-road-trip",
    title: "Mehta Family Cross-City Road Trip Made Safe with Journey Sharing",
    category: "Family Safety",
    readTime: "4 min read",
    summary: "When the Mehta family drove from Mumbai to Hyderabad across three days, live journey sharing kept four family members connected across every highway and rest stop.",
    icon: Car,
    accent: "#0EA5E9",
    rgb: "14,165,233",
    tag: "Family Safety",
  },
  {
    id: "grandma-iyer-meds",
    title: "How Grandma Iyer Medication Reminders Are Managed from Bangalore",
    category: "Elderly Care",
    readTime: "6 min read",
    summary: "Ranjit Iyer manages his 78-year-old mother remotely from Bangalore while she lives alone in Chennai. Gravity medication reminders and daily check-ins gave both of them a new sense of security.",
    icon: Heart,
    accent: "#10B981",
    rgb: "16,185,129",
    tag: "Elderly Care",
  },
  {
    id: "rahul-driving-score",
    title: "Driving Score Feature Helped Rahul Reduce Speeding by 80%",
    category: "Driving Safety",
    readTime: "5 min read",
    summary: "After his parents noticed recurring harsh braking alerts on Gravity, 22-year-old Rahul from Pune transformed his driving habits in just six weeks — and passed his next inspection with a perfect score.",
    icon: TrendingUp,
    accent: "#D4A853",
    rgb: "212,168,83",
    tag: "Driving Safety",
  },
  {
    id: "singh-three-cities",
    title: "The Singh Family Three-City Circle and How Gravity Keeps Them Connected",
    category: "Family Circle",
    readTime: "7 min read",
    summary: "Spread across Delhi, Chandigarh, and Ludhiana, the Singh family uses Gravity as the invisible thread that pulls them together — check-ins at meals, SOS drills on weekends, and a shared family map that feels like everyone is in the same room.",
    icon: Users,
    accent: "#8B5CF6",
    rgb: "139,92,246",
    tag: "Family Circle",
  },
  {
    id: "pune-school-enterprise",
    title: "How a Pune School Integrated Gravity for Campus Safety",
    category: "Enterprise",
    readTime: "8 min read",
    summary: "Sunrise International School in Pune piloted Gravity for their 1,200-student campus. Within three months, parent satisfaction scores rose 40% and the school recorded zero unreported late arrivals.",
    icon: BookOpen,
    accent: "#EF4444",
    rgb: "239,68,68",
    tag: "Enterprise",
  },
]

/* ── Stats Data ────────────────────────────────────────────────── */
const STATS = [
  { value: "50,000+", label: "Families Protected", icon: Users },
  { value: "2,400+", label: "SOS Alerts Responded", icon: Shield },
  { value: "94%", label: "Parent Satisfaction", icon: Star },
  { value: "99.99%", label: "SOS Delivery Rate", icon: TrendingUp },
]

/* ── Stats Strip ────────────────────────────────────────────────── */
function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "var(--border)" }}>
      {STATS.map((stat, i) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col items-center justify-center py-10 px-6 text-center"
            style={{ background: "var(--bg-surface)" }}
          >
            <Icon size={22} className="mb-3" style={{ color: "var(--gold)" }} />
            <span
              className="text-3xl font-extrabold mb-1"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "var(--text-primary)",
              }}
            >
              {stat.value}
            </span>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {stat.label}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ── Featured Story ─────────────────────────────────────────────── */
function FeaturedStory() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <div ref={ref} className="max-w-7xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
          style={{
            color: "var(--gold)",
            background: "rgba(212,168,83,0.08)",
            border: "1px solid rgba(212,168,83,0.25)",
          }}
        >
          <Star size={12} />
          Featured Story
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="relative rounded-3xl overflow-hidden border"
        style={{
          background: "linear-gradient(135deg, rgba(239,68,68,0.05) 0%, var(--bg-surface) 50%, rgba(16,185,129,0.04) 100%)",
          borderColor: "rgba(239,68,68,0.2)",
          boxShadow: "0 0 80px rgba(239,68,68,0.07)",
        }}
      >
        {/* Top accent stripe */}
        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, #EF4444, #D4A853, #10B981)" }}
        />

        <div className="p-8 md:p-12 lg:p-16">
          {/* Category + read time */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                background: "rgba(239,68,68,0.1)",
                color: "#EF4444",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <Shield size={12} />
              Emergency Response
            </span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              <Clock size={12} />
              8 min read
            </span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              <MapPin size={12} />
              Mumbai, India
            </span>
          </div>

          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-6"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--text-primary)",
              maxWidth: "800px",
            }}
          >
            How the Sharma Family in Mumbai Survived an Emergency Because of Gravity SOS
          </h2>

          {/* Story content */}
          <div className="max-w-3xl space-y-5" style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
            <p>
              It was a Tuesday afternoon in October when Priya Sharma received an alert on her phone that changed everything.
              Her father, 71-year-old Ramesh Sharma, had not completed his scheduled 2:00 PM check-in on Gravity. The app
              had sent a gentle reminder to Ramesh at 2:05 PM — and when no response came by 2:12 PM, it automatically escalated
              the alert to the entire family circle.
            </p>
            <p>
              Priya, working from her office in Andheri, saw the notification first. She immediately called her father. No answer.
              She could see on the Gravity family map that he was at home — his last known location was the apartment on Linking Road,
              Bandra, where he lived alone since her mother passed two years ago. His phone had not moved in over 40 minutes.
            </p>
            <p>
              Her brother Vikram, who received the same alert in Pune, tried calling too. Nothing. Within 90 seconds of the missed
              check-in escalation, both siblings were on the phone with each other, and Priya was already calling the building
              security from her car, heading toward Bandra.
            </p>
            <p>
              When the security guard entered with a spare key, they found Ramesh on the kitchen floor. He had suffered a cardiac event
              while preparing lunch. He was conscious but unable to reach his phone. Emergency services were called and arrived
              within six minutes. The Gravity location data — showing the exact building address and apartment number — was shared
              directly with the ambulance dispatcher, cutting precious time from the response.
            </p>
            <p>
              Ramesh Sharma was admitted to Lilavati Hospital. Three weeks later, after a full recovery, he sat at his dining table
              with his children and said something Priya will never forget: "The app didn't just know where I was. It knew I needed help
              before I could ask."
            </p>
            <p>
              Today, Ramesh has Gravity on his phone and on a dedicated tablet in his living room. His children have set up wellness
              check-ins three times a day. The caregiver dashboard is monitored by both siblings and by a part-time home aide. He
              still lives independently — and that is exactly the point.
            </p>
          </div>

          {/* Impact metrics */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Response time", value: "Under 4 minutes" },
              { label: "Alert delivery", value: "Family notified instantly" },
              { label: "Outcome", value: "Full recovery" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl px-5 py-4"
                style={{
                  background: "rgba(16,185,129,0.07)",
                  border: "1px solid rgba(16,185,129,0.18)",
                }}
              >
                <div
                  className="text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "#10B981" }}
                >
                  {item.label}
                </div>
                <div
                  className="font-bold text-base"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #EF4444, #B91C1C)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(239,68,68,0.3)",
              }}
            >
              Read Full Story
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Case Study Card ─────────────────────────────────────────────── */
function CaseStudyCard({ study, index }: { study: CaseStudy; index: number }) {
  const Icon = study.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative rounded-2xl overflow-hidden flex flex-col cursor-default"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Accent top stripe */}
      <div
        className="h-1 w-full flex-shrink-0"
        style={{ background: `linear-gradient(90deg, rgba(${study.rgb},0.9), rgba(${study.rgb},0.3))` }}
      />

      <div className="p-6 flex flex-col flex-1">
        {/* Icon + category badge */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `rgba(${study.rgb},0.12)`,
              border: `1px solid rgba(${study.rgb},0.2)`,
            }}
          >
            <Icon size={18} style={{ color: study.accent }} />
          </div>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              background: `rgba(${study.rgb},0.1)`,
              color: study.accent,
              border: `1px solid rgba(${study.rgb},0.2)`,
            }}
          >
            {study.tag}
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-bold text-base leading-snug mb-3 flex-1"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "var(--text-primary)",
          }}
        >
          {study.title}
        </h3>

        {/* Summary */}
        <p
          className="text-sm leading-relaxed mb-4 line-clamp-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {study.summary}
        </p>

        {/* Footer: read time + link */}
        <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <Clock size={12} />
            {study.readTime}
          </span>
          <button
            className="flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 group-hover:gap-2"
            style={{ color: study.accent }}
          >
            Read Story
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Submit Story Form ──────────────────────────────────────────── */
function SubmitStoryForm() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const [form, setForm] = useState({ name: "", city: "", story: "" })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section ref={ref} className="py-20 max-w-7xl mx-auto px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{
              color: "var(--gold)",
              background: "rgba(212,168,83,0.08)",
              border: "1px solid rgba(212,168,83,0.25)",
            }}
          >
            <Heart size={12} />
            Share Your Story
          </span>
          <h2
            className="text-3xl md:text-4xl font-extrabold"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--text-primary)",
            }}
          >
            Has Gravity Made a Difference?
          </h2>
          <p className="mt-3 text-base" style={{ color: "var(--text-secondary)" }}>
            We want to hear how Gravity has helped your family. Real stories inspire real change.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="rounded-2xl p-8"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          {submitted ? (
            <div className="text-center py-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}
              >
                <Star size={28} style={{ color: "#10B981" }} />
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--text-primary)" }}
              >
                Thank You!
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Your story has been received. Our team will reach out within 48 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Priya Sharma"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      background: "var(--bg-surface2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      background: "var(--bg-surface2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  How Has Gravity Helped You?
                </label>
                <textarea
                  name="story"
                  required
                  rows={5}
                  value={form.story}
                  onChange={handleChange}
                  placeholder="Tell us your story..."
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                  style={{
                    background: "var(--bg-surface2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #D4A853, #F5C842)",
                  color: "#1A0F05",
                  boxShadow: "0 4px 20px rgba(212,168,83,0.3)",
                }}
              >
                Submit Your Story
                <ArrowRight size={16} />
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}

/* ── CTA Section ────────────────────────────────────────────────── */
function CTASection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-6 text-center"
      >
        <h2
          className="text-3xl md:text-5xl font-extrabold mb-4"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "var(--text-primary)",
          }}
        >
          Start Your Own{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #D4A853, #F5C842)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Success Story
          </span>
        </h2>
        <p
          className="text-lg mb-10 max-w-xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Join 50,000 families across India who use Gravity to stay safe, connected, and at peace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-7 py-4 rounded-2xl font-bold text-base"
            style={{
              background: "linear-gradient(135deg, #D4A853, #F5C842)",
              color: "#1A0F05",
              boxShadow: "0 4px 24px rgba(212,168,83,0.35)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Download on App Store
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-7 py-4 rounded-2xl font-bold text-base border"
            style={{
              background: "transparent",
              border: "1.5px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" style={{ color: "var(--gold)" }}>
              <path d="M3.18 23.76c.37.21.8.22 1.19.04L16.7 12 4.37.2C3.98.02 3.55.03 3.18.24 2.42.68 2 1.52 2 2.5v19c0 .98.42 1.82 1.18 2.26zM19.33 10.33L16.7 12l2.63 1.67 2.96-1.67c.84-.48.84-1.19 0-1.67l-2.96-1.67z" />
            </svg>
            Get on Google Play
          </motion.button>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm transition-colors duration-200"
          style={{ color: "var(--text-muted)" }}
        >
          ← Back to Gravity Home
        </Link>
      </motion.div>
    </section>
  )
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function CaseStudiesPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true })
  const gridRef = useRef<HTMLDivElement>(null)
  const gridInView = useInView(gridRef, { once: true, margin: "-60px" })

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="relative pt-32 pb-0 overflow-hidden"
        style={{ background: "var(--bg-surface)" }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "800px",
            height: "400px",
            background: "radial-gradient(ellipse, rgba(212,168,83,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div ref={heroRef} className="relative max-w-7xl mx-auto px-6 text-center pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-5"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{
                color: "var(--gold)",
                background: "rgba(212,168,83,0.08)",
                border: "1px solid rgba(212,168,83,0.25)",
              }}
            >
              <BookOpen size={12} />
              Case Studies
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--text-primary)",
            }}
          >
            Real Families.{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #D4A853, #F5C842, #D4A853)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Real Safety.
            </span>
            <br />
            Real Stories.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl max-w-2xl mx-auto mb-10"
            style={{ color: "var(--text-secondary)" }}
          >
            See how Gravity has protected and connected thousands of families across India.
            Every notification, every check-in, every SOS — these are the stories behind the alerts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            {["50,000+ families across India", "7 cities, 1 safety platform", "94% would recommend Gravity"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--gold)" }}
                />
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Stats strip */}
        <StatsStrip />
      </section>

      {/* ── Featured Story ── */}
      <FeaturedStory />

      {/* ── Case Study Grid ── */}
      <section ref={gridRef} className="max-w-7xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={gridInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{
              color: "var(--text-muted)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <Users size={12} />
            More Stories
          </span>
          <h2
            className="text-3xl md:text-4xl font-extrabold"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "var(--text-primary)",
            }}
          >
            Stories from Every Part of India
          </h2>
          <p className="mt-3 text-base max-w-xl" style={{ color: "var(--text-secondary)" }}>
            From daily school runs to cross-country road trips, Gravity is part of the fabric of family life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CASE_STUDIES.map((study, i) => (
            <CaseStudyCard key={study.id} study={study} index={i} />
          ))}
        </div>
      </section>

      {/* ── Submit Story Form ── */}
      <SubmitStoryForm />

      {/* ── CTA ── */}
      <CTASection />

      <Footer />
    </main>
  )
}
