'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Shield,
  School,
  Bus,
  Bell,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Star,
  Heart,
  Eye,
  Smartphone,
  Lock,
  ChevronRight,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/* ── Animation variants ─────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

/* ── Features ───────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <School size={24} />,
    title: "School Arrival Alerts",
    description: "The moment your child steps into the school geofence, you receive an instant notification. No more morning anxiety wondering if they got there safely. Know before the bell rings.",
    color: "#3B82F6",
  },
  {
    icon: <Bell size={24} />,
    title: "School Departure Alerts",
    description: "When school ends, you know the second your child leaves the premises — and who picked them up. Guardian confirmation shows exactly which trusted adult collected them.",
    color: "#10B981",
  },
  {
    icon: <Clock size={24} />,
    title: "Dismissal Mode",
    description: "Set the expected pickup window for your child. If they leave the school zone outside that window — even 10 minutes early — you get an immediate priority alert.",
    color: "#8B5CF6",
  },
  {
    icon: <Bus size={24} />,
    title: "Bus Tracking",
    description: "Track the school bus route in real time. Know when the bus is approaching your stop, when your child boards, and when they safely reach school. No more bus-stop guessing.",
    color: "#F59E0B",
  },
  {
    icon: <Users size={24} />,
    title: "Trusted Guardian Access",
    description: "Grant grandparents, aunties, older siblings, and nannies view-only access to your child location. Each guardian has defined permissions — you stay in full control.",
    color: "#EC4899",
  },
  {
    icon: <Eye size={24} />,
    title: "Child Safety Dashboard",
    description: "One clean screen shows everything that matters — current location, school schedule, battery level, today timeline, and which guardian last checked in. Peace of mind at a glance.",
    color: "#06B6D4",
  },
];

/* ── How it works ───────────────────────────────────────────────────────────── */
const HOW_IT_WORKS = [
  {
    step: "01",
    icon: <MapPin size={22} />,
    title: "Set School Zone",
    description: "Draw a geofence around the school on the map. Set it as tight or generous as the school campus requires. Gravity will monitor entry and exit automatically.",
  },
  {
    step: "02",
    icon: <Users size={22} />,
    title: "Add Trusted Guardians",
    description: "Add grandparents, relatives, babysitters, or older siblings. Each guardian receives a role — pickup-authorized or view-only. You approve every guardian personally.",
  },
  {
    step: "03",
    icon: <Bell size={22} />,
    title: "Get Smart Alerts",
    description: "Gravity sends you real-time notifications for arrivals, departures, early pickups, and battery warnings. Alerts are crisp, clear, and actionable — not spam.",
  },
  {
    step: "04",
    icon: <Heart size={22} />,
    title: "Sleep Peacefully",
    description: "With Gravity monitoring school hours silently in the background, you can focus on work knowing you will be the first to know if anything changes with your child.",
  },
];

/* ── Testimonials ───────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote: "Before Gravity, I would call the school receptionist almost every other day. Now the school arrival alert pops up at 8:05 AM like clockwork. I did not realize how much energy I was spending on that daily anxiety until it was gone.",
    name: "Priya S.",
    location: "Mumbai, Maharashtra",
    rating: 5,
  },
  {
    quote: "Both my wife and I work full-time shifts. We added my mother-in-law and younger sister as trusted guardians. Now whoever picks up Arjun, we both get the notification. Working parents need this feature — it is genuinely life-changing.",
    name: "Rajan K.",
    location: "New Delhi",
    rating: 5,
  },
  {
    quote: "My daughter normally gets dismissed at 3:30 PM. One day I got a Dismissal Mode alert at 2:45 PM — the school had a half-day I had forgotten about. I would have been stuck at office while she waited outside. Gravity saved us from a very scary situation.",
    name: "Meera V.",
    location: "Bengaluru, Karnataka",
    rating: 5,
  },
];

/* ── Comparison table ───────────────────────────────────────────────────────── */
const COMPARISON = [
  { feature: "Know when child arrives at school", gravity: true, noApp: false },
  { feature: "Know when child leaves school", gravity: true, noApp: false },
  { feature: "Identify who picked them up", gravity: true, noApp: false },
  { feature: "Early dismissal alerts", gravity: true, noApp: false },
  { feature: "Bus route tracking", gravity: true, noApp: false },
  { feature: "Battery level monitoring", gravity: true, noApp: false },
  { feature: "Trusted guardian sharing", gravity: true, noApp: false },
  { feature: "Full peace of mind", gravity: true, noApp: false },
];

/* ── Pain points ─────────────────────────────────────────────────────────────── */
const PAIN_POINTS = [
  {
    icon: <AlertCircle size={26} style={{ color: "#3B82F6" }} />,
    question: "Is my child at school?",
    answer: "Gravity sends you automatic arrival and departure alerts the moment your child enters or exits the school geofence. You know before the school day even begins.",
    bg: "rgba(59,130,246,0.06)",
    border: "rgba(59,130,246,0.2)",
  },
  {
    icon: <Users size={26} style={{ color: "#10B981" }} />,
    question: "Who picked them up today?",
    answer: "The Trusted Guardians feature lets you maintain a verified list of pickup-authorized adults. When any guardian collects your child, you receive a confirmed notification instantly.",
    bg: "rgba(16,185,129,0.06)",
    border: "rgba(16,185,129,0.2)",
  },
  {
    icon: <Smartphone size={26} style={{ color: "#8B5CF6" }} />,
    question: "Are they safe right now?",
    answer: "The Child Safety Dashboard shows live location, battery percentage, last movement time, and current zone status — all in one screen designed for worried parents.",
    bg: "rgba(139,92,246,0.06)",
    border: "rgba(139,92,246,0.2)",
  },
];

/* ── Safety zones ────────────────────────────────────────────────────────────── */
const ZONES = [
  { label: "Home", color: "#10B981", ring: 1 },
  { label: "School", color: "#3B82F6", ring: 2 },
  { label: "Friend House", color: "#F59E0B", ring: 3 },
  { label: "Activity Class", color: "#EC4899", ring: 4 },
];

/* ── Section wrapper ─────────────────────────────────────────────────────────── */
function Section({ children, bg = "var(--bg)" }: { children: React.ReactNode; bg?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      style={{ background: bg, padding: "80px 0" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>{children}</div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function ChildSafety() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #0d2040 40%, #062a20 100%)",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          padding: "100px 24px 80px",
        }}
      >
        {/* Soft glow bg */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            height: 800,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, rgba(16,185,129,0.04) 50%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          animate={{ y: [0, -16, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "12%",
            right: "8%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
            filter: "blur(32px)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          style={{
            position: "absolute",
            bottom: "15%",
            left: "6%",
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
            filter: "blur(26px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: 32, textAlign: "left" }}
          >
            <Link
              href="/"
              style={{
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
                fontSize: "0.9rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← Back to Gravity Home
            </Link>
          </motion.div>

          {/* Shield icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}
          >
            <motion.div
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={42} style={{ color: "#3B82F6" }} />
            </motion.div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: 20 }}
          >
            <span
              style={{
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.3)",
                color: "#60A5FA",
                borderRadius: 999,
                padding: "6px 18px",
                fontSize: "0.82rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Child Safety
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 6vw, 4rem)",
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            Every Parent&apos;s
            <br />
            <span style={{ background: "linear-gradient(90deg, #3B82F6, #10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Peace of Mind
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              maxWidth: 640,
              margin: "0 auto 44px",
              lineHeight: 1.75,
            }}
          >
            Know your child is safe from school drop-off to bedtime. Gravity keeps parents connected to their children with smart alerts, trusted guardian sharing, and real-time location — without intruding on childhood.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 60 }}
          >
            <Link
              href="/"
              style={{
                background: "linear-gradient(90deg, #3B82F6, #2563EB)",
                color: "#FFFFFF",
                padding: "14px 32px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 0 28px rgba(59,130,246,0.35)",
              }}
            >
              Get Started Free <ChevronRight size={18} />
            </Link>
            <a
              href="#how-it-works"
              style={{
                background: "transparent",
                color: "#FFFFFF",
                padding: "14px 32px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "1rem",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              See How It Works
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7 }}
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
          >
            {[
              { icon: <School size={16} />, label: "School Alerts" },
              { icon: <MapPin size={16} />, label: "Real-time Location" },
              { icon: <Users size={16} />, label: "Trusted Guardians" },
              { icon: <Lock size={16} />, label: "Privacy First" },
            ].map((badge) => (
              <div
                key={badge.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 999,
                  padding: "7px 16px",
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                }}
              >
                {badge.icon} {badge.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CHALLENGE ────────────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 52 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 16,
              }}
            >
              The Challenge Every Parent Faces
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 640, margin: "0 auto", lineHeight: 1.75 }}>
              Parenting in the modern world means navigating constant low-grade worry about your child safety. These are the three questions that keep parents anxious every school day — and how Gravity answers each one.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}
          >
            {PAIN_POINTS.map((p) => (
              <motion.div
                key={p.question}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                style={{
                  background: p.bg,
                  border: `1px solid ${p.border}`,
                  borderRadius: 18,
                  padding: "32px 26px",
                }}
              >
                <div style={{ marginBottom: 16 }}>{p.icon}</div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 12,
                  }}
                >
                  "{p.question}"
                </h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, margin: 0, fontSize: "0.92rem" }}>
                  {p.answer}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── FEATURES GRID ────────────────────────────────────────────────────── */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 52 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 16,
              }}
            >
              Child Safety Features Built for Real Parenting
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
              Six powerful features that work seamlessly together to give you complete situational awareness of your child safety — without hovering over them every moment.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 22 }}
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -5 }}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "28px 24px",
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: `${f.color}18`,
                    border: `1px solid ${f.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: f.color,
                    marginBottom: 18,
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 10,
                    fontSize: "1.05rem",
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.65, margin: 0, fontSize: "0.9rem" }}>
                  {f.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger} id="how-it-works">
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 16,
              }}
            >
              How Gravity Child Safety Works
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
              Four simple steps from setup to serenity. The whole process takes under 10 minutes and then runs silently in the background — every school day.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 28 }}>
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                style={{ textAlign: "center" }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 120 }}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: i % 2 === 0 ? "rgba(59,130,246,0.12)" : "rgba(16,185,129,0.12)",
                    border: i % 2 === 0 ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(16,185,129,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: i % 2 === 0 ? "#3B82F6" : "#10B981",
                    margin: "0 auto 20px",
                    position: "relative",
                  }}
                >
                  {step.icon}
                  <div
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: i % 2 === 0 ? "#3B82F6" : "#10B981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    {i + 1}
                  </div>
                </motion.div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    fontSize: "1.05rem",
                    marginBottom: 10,
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.65, fontSize: "0.9rem", margin: 0 }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── SAFETY ZONES ─────────────────────────────────────────────────────── */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger}>
          <motion.div
            variants={fadeUp}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 60,
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 16,
                  lineHeight: 1.2,
                }}
              >
                Smart Safety Zones for Every Part of Your Child Day
              </h2>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 28 }}>
                Gravity lets you create named geofences for every regular location in your child daily life. Each zone triggers its own set of smart alerts — so arriving at karate class feels as reassuring as arriving at school.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {ZONES.map((zone) => (
                  <div
                    key={zone.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: "12px 18px",
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: zone.color,
                        boxShadow: `0 0 8px ${zone.color}60`,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                      {zone.label}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginLeft: "auto" }}>
                      Custom alerts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Concentric circles visual */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                height: 340,
              }}
            >
              {[320, 240, 160, 80].map((size, i) => (
                <motion.div
                  key={size}
                  animate={{ scale: [1, 1.02, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                  style={{
                    position: "absolute",
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    border: `2px solid ${ZONES[i]?.color || "#10B981"}40`,
                    background: `${ZONES[i]?.color || "#10B981"}06`,
                  }}
                />
              ))}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px rgba(16,185,129,0.5)",
                  zIndex: 1,
                }}
              >
                <MapPin size={20} style={{ color: "#fff" }} />
              </div>
              {ZONES.map((zone, i) => {
                const angles = [30, 130, 210, 310];
                const distances = [40, 80, 120, 160];
                const angle = (angles[i] * Math.PI) / 180;
                return (
                  <div
                    key={zone.label}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: `translate(calc(-50% + ${Math.cos(angle) * distances[i]}px), calc(-50% + ${Math.sin(angle) * distances[i]}px))`,
                      background: `${zone.color}20`,
                      border: `1px solid ${zone.color}60`,
                      borderRadius: 6,
                      padding: "3px 8px",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: zone.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {zone.label}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 16,
              }}
            >
              Parents Who Sleep Better at Night
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
              Real stories from Indian parents who use Gravity to stay connected to their children during school hours and after.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}
          >
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderTop: "3px solid #3B82F6",
                  borderRadius: 16,
                  padding: "28px 24px",
                }}
              >
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
                  ))}
                </div>
                <div style={{ color: "#3B82F6", fontSize: "2.2rem", lineHeight: 1, marginBottom: 10, fontFamily: "Georgia, serif" }}>
                  &ldquo;
                </div>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: 20, fontSize: "0.92rem", fontStyle: "italic" }}>
                  {t.quote}
                </p>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>{t.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: 2 }}>{t.location}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── COMPARISON TABLE ─────────────────────────────────────────────────── */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 16,
              }}
            >
              Gravity vs. No App: The Real Difference
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
              See what you gain when every school day is covered by a smart safety system instead of phone calls and guesswork.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} style={{ maxWidth: 720, margin: "0 auto", overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "var(--bg-surface)",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid var(--border)",
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-surface2)" }}>
                  <th style={{ padding: "16px 20px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>
                    Feature
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "center", color: "#3B82F6", fontWeight: 700, fontSize: "0.9rem" }}>
                    With Gravity
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "center", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>
                    Without App
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={row.feature}
                    style={{
                      borderTop: "1px solid var(--border)",
                      background: i % 2 === 0 ? "transparent" : "rgba(59,130,246,0.02)",
                    }}
                  >
                    <td style={{ padding: "14px 20px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      {row.feature}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "center" }}>
                      <CheckCircle size={18} style={{ color: "#10B981" }} />
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "center" }}>
                      <AlertCircle size={18} style={{ color: "#EF4444" }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #062a20 100%)",
          padding: "96px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 28px",
            }}
          >
            <Shield size={32} style={{ color: "#3B82F6" }} />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
              color: "#FFFFFF",
              marginBottom: 16,
            }}
          >
            Give Your Child the Safety They Deserve
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.75 }}>
            Every school day, thousands of Indian parents use Gravity to stay connected to their children without hovering. Start your free plan today — no credit card needed, setup takes under 10 minutes.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <Link
              href="/"
              style={{
                background: "linear-gradient(90deg, #3B82F6, #2563EB)",
                color: "#fff",
                padding: "15px 36px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1.05rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 0 28px rgba(59,130,246,0.35)",
              }}
            >
              Get Started Free <ChevronRight size={18} />
            </Link>
            <Link
              href="/pricing"
              style={{
                background: "transparent",
                color: "#fff",
                padding: "15px 36px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "1.05rem",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              View Pricing
            </Link>
          </div>
          <Link href="/" style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.88rem", textDecoration: "none" }}>
            ← Back to Gravity Home
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
