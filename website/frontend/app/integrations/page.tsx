'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Cpu, Car, Brain, Lock, Home, Wifi, Shield, ChevronRight,
  Zap, Globe, Heart, Check, ExternalLink, Activity, Tag, Watch, Smartphone
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/* ── Animation variants ─────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

/* ── Primary Integration Cards ──────────────────────────────────────────────── */
const PRIMARY_INTEGRATIONS = [
  {
    id: "titan",
    name: "Titan",
    tagline: "Smart Home Security",
    description: "Smart lock integration with biometric access, remote control, and automated family arrival notifications directly in the KVL Track dashboard.",
    icon: <Lock size={32} />,
    gradient: "linear-gradient(135deg, #0f2027 0%, #0a3a3a 50%, #0d2e2e 100%)",
    headerGradient: "linear-gradient(135deg, #0d3030 0%, #0a4040 50%, #06282a 100%)",
    accentColor: "#10B981",
    borderColor: "rgba(16,185,129,0.35)",
    glowColor: "rgba(16,185,129,0.2)",
    href: "/integrations/titan",
    status: "active",
    features: [
      "Biometric & PIN entry logging",
      "Remote lock / unlock from app",
      "Auto home-arrival alerts",
    ],
    category: "Smart Home",
  },
  {
    id: "venus",
    name: "Venus",
    tagline: "Vehicle Intelligence Platform",
    description: "Complete vehicle tracking with real-time GPS, driver behavior scoring, trip history, and engine health diagnostics — all in one cinematic dashboard.",
    icon: <Car size={32} />,
    gradient: "linear-gradient(135deg, #0e0a1a 0%, #160d28 50%, #0e0a1a 100%)",
    headerGradient: "linear-gradient(135deg, #18103a 0%, #200f44 50%, #140c30 100%)",
    accentColor: "#A855F7",
    borderColor: "rgba(168,85,247,0.35)",
    glowColor: "rgba(168,85,247,0.18)",
    href: "/integrations/venus",
    status: "active",
    features: [
      "Real-time GPS & speed tracking",
      "Driver behavior scoring",
      "Full trip history & route replay",
    ],
    category: "Vehicle",
  },
  {
    id: "cosmo",
    name: "Cosmo AI",
    tagline: "AI Driving Assistant",
    description: "On-device neural engine dashcam that detects collisions, lane departure, pedestrians, and driver distraction — with instant AI analysis for every event.",
    icon: <Brain size={32} />,
    gradient: "linear-gradient(135deg, #0a0c0e 0%, #0e1218 50%, #080a0c 100%)",
    headerGradient: "linear-gradient(135deg, #0a1a12 0%, #0c2016 50%, #081510 100%)",
    accentColor: "#D4A853",
    borderColor: "rgba(212,168,83,0.35)",
    glowColor: "rgba(212,168,83,0.18)",
    href: "/integrations/cosmo",
    status: "active",
    features: [
      "Real-time collision warning",
      "AI driver distraction detection",
      "Automatic accident clip upload",
    ],
    category: "AI / Vehicle",
  },
]

/* ── Other integrations ─────────────────────────────────────────────────────── */
const OTHER_INTEGRATIONS = [
  { icon: <Tag size={22} />, name: "KVL Business Solutions Tags", category: "Asset Tracking", color: "#EC4899", status: "active", desc: "BT tracking tags for bags, pets, and valuables" },
  { icon: <Watch size={22} />, name: "Apple Watch", category: "Wearable", color: "#6B7280", status: "active", desc: "SOS, heart rate, and wrist-based location" },
  { icon: <Watch size={22} />, name: "Samsung Galaxy Watch", category: "Wearable", color: "#1428A0", status: "active", desc: "Health monitoring and emergency SOS alerts" },
  { icon: <Globe size={22} />, name: "Google Home", category: "Smart Home", color: "#4285F4", status: "active", desc: "Voice-query family status via Nest speakers" },
  { icon: <Globe size={22} />, name: "Amazon Alexa", category: "Smart Home", color: "#00CAFF", status: "active", desc: "Hands-free family location via Echo devices" },
  { icon: <Home size={22} />, name: "Apple HomeKit", category: "Smart Home", color: "#555", status: "active", desc: "Location-triggered home automations" },
  { icon: <Smartphone size={22} />, name: "Developer API", category: "Platform", color: "#D4A853", status: "active", desc: "REST API, webhooks, and native SDKs" },
  { icon: <Activity size={22} />, name: "Fitbit", category: "Wearable", color: "#00B0B9", status: "active", desc: "Daily wellness, steps, and sleep data" },
]

/* ── Section wrapper ─────────────────────────────────────────────────────────── */
function Section({ children, bg = "var(--bg)" }: { children: React.ReactNode; bg?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      style={{ background: bg, padding: "80px 0" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>{children}</div>
    </motion.section>
  )
}

/* ── Primary Card Component ─────────────────────────────────────────────────── */
function PrimaryCard({ integration, index }: { integration: typeof PRIMARY_INTEGRATIONS[0]; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      variants={fadeUp}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: `0 32px 80px ${integration.glowColor}, 0 0 1px ${integration.borderColor}`,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        background: integration.gradient,
        border: `1px solid ${hovered ? integration.borderColor : "rgba(255,255,255,0.07)"}`,
        borderRadius: 24,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.3s",
        position: "relative",
      }}
    >
      {/* Animated glow overlay on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at 50% 0%, ${integration.glowColor} 0%, transparent 60%)`,
              pointerEvents: "none", zIndex: 0,
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{
        background: integration.headerGradient,
        padding: "32px 28px",
        borderBottom: `1px solid ${integration.borderColor}`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* BG pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `radial-gradient(circle at 80% 50%, ${integration.glowColor} 0%, transparent 50%)`,
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <motion.div
              animate={hovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                width: 64, height: 64, borderRadius: 18,
                background: `${integration.accentColor}18`,
                border: `1px solid ${integration.accentColor}35`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: integration.accentColor,
                boxShadow: hovered ? `0 0 24px ${integration.glowColor}` : "none",
              }}
            >
              {integration.icon}
            </motion.div>
            <div>
              <div style={{
                background: `${integration.accentColor}15`,
                border: `1px solid ${integration.accentColor}30`,
                color: integration.accentColor,
                borderRadius: 999, padding: "2px 10px",
                fontSize: "0.68rem", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.08em",
                marginBottom: 6, display: "inline-block",
              }}>
                {integration.category}
              </div>
              <h3 style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem", fontWeight: 900,
                color: "#FFF", lineHeight: 1, marginBottom: 2,
              }}>
                {integration.name}
              </h3>
              <p style={{ color: integration.accentColor, fontSize: "0.82rem", fontWeight: 500 }}>
                {integration.tagline}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            background: integration.status === "active" ? "rgba(16,185,129,0.12)" : "rgba(234,179,8,0.12)",
            border: `1px solid ${integration.status === "active" ? "rgba(16,185,129,0.3)" : "rgba(234,179,8,0.3)"}`,
            color: integration.status === "active" ? "#10B981" : "#EAB308",
            borderRadius: 999, padding: "4px 10px",
            fontSize: "0.7rem", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            <motion.div
              animate={integration.status === "active" ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: 5, height: 5, borderRadius: "50%",
                background: integration.status === "active" ? "#10B981" : "#EAB308",
              }}
            />
            {integration.status === "active" ? "Active" : "Setup Required"}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "24px 28px", position: "relative", zIndex: 1 }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: 20 }}>
          {integration.description}
        </p>

        {/* Feature bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {integration.features.map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.85rem" }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                background: `${integration.accentColor}15`,
                border: `1px solid ${integration.accentColor}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Check size={11} style={{ color: integration.accentColor }} />
              </div>
              <span style={{ color: "rgba(255,255,255,0.65)" }}>{f}</span>
            </div>
          ))}
        </div>

        <Link
          href={integration.href}
          style={{ textDecoration: "none" }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: `linear-gradient(90deg, ${integration.accentColor}22, ${integration.accentColor}10)`,
              border: `1px solid ${integration.accentColor}40`,
              color: integration.accentColor,
              borderRadius: 12, padding: "12px 20px",
              fontWeight: 800, fontSize: "0.9rem",
              display: "flex", alignItems: "center", gap: 8,
              cursor: "pointer",
            }}
          >
            Open {integration.name}
            <motion.div
              animate={hovered ? { x: 4 } : { x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={16} />
            </motion.div>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function IntegrationsHub() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <>
      <Navbar />

      {/* ── STYLES ───────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(180px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
        }
        @keyframes orbitReverse {
          from { transform: rotate(0deg) translateX(260px) rotate(0deg); }
          to { transform: rotate(-360deg) translateX(260px) rotate(360deg); }
        }
        .orbit-dot { animation: orbit 12s linear infinite; }
        .orbit-dot-reverse { animation: orbitReverse 18s linear infinite; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          background: "linear-gradient(135deg, #050507 0%, #080a12 50%, #050507 100%)",
          minHeight: "88vh",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
          padding: "120px 24px 80px",
        }}
      >
        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(212,168,83,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,83,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px", pointerEvents: "none",
        }} />

        {/* Central radial glow */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 6, repeat: Infinity }}
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 700, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,168,83,0.07) 0%, rgba(168,85,247,0.04) 35%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Orbiting nodes */}
        {[
          { color: "#10B981", size: 10, label: "Titan" },
          { color: "#A855F7", size: 10, label: "Venus" },
          { color: "#D4A853", size: 10, label: "Cosmo" },
        ].map((node, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: 0, height: 0,
              transform: `rotate(${i * 120}deg)`,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12 + i * 3, repeat: Infinity, ease: "linear" }}
              style={{
                position: "absolute",
                width: 180, height: 0,
                top: 0, left: 0,
                transformOrigin: "0 0",
              }}
            >
              <div style={{
                position: "absolute",
                left: 175, top: -node.size / 2,
                width: node.size, height: node.size,
                borderRadius: "50%",
                background: node.color,
                boxShadow: `0 0 12px ${node.color}`,
              }} />
            </motion.div>
          </div>
        ))}

        {/* Orbit rings */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 360, height: 360, borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 520, height: 520, borderRadius: "50%",
          border: "1px solid rgba(212,168,83,0.06)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: 32, textAlign: "left" }}
          >
            <Link href="/" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
              ← Back to KVL Track Home
            </Link>
          </motion.div>

          {/* Central hub icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 90 }}
            style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}
          >
            <motion.div
              animate={{ boxShadow: ["0 0 20px rgba(212,168,83,0.2)", "0 0 50px rgba(212,168,83,0.5)", "0 0 20px rgba(212,168,83,0.2)"] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                width: 100, height: 100, borderRadius: "50%",
                background: "rgba(212,168,83,0.1)",
                border: "1px solid rgba(212,168,83,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Cpu size={44} style={{ color: "#D4A853" }} />
            </motion.div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: 20 }}
          >
            <span style={{
              background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.3)",
              color: "#D4A853", borderRadius: 999, padding: "6px 18px",
              fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <Zap size={11} /> Connected Ecosystem
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
              fontWeight: 900, color: "#FFF",
              lineHeight: 1.05, marginBottom: 24,
              letterSpacing: "-0.02em",
            }}
          >
            KVL TRACK{" "}
            <span style={{
              background: "linear-gradient(90deg, #D4A853, #F5D78E, #D4A853)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Ecosystem
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)",
              maxWidth: 600, margin: "0 auto 48px",
              lineHeight: 1.8,
            }}
          >
            One unified platform connecting smart locks, vehicle trackers, AI dashcams, wearables, and your entire smart home — so your family is always protected.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
          >
            <a href="#integrations" style={{
              background: "linear-gradient(90deg, #D4A853, #B8860B)",
              color: "#0a0800", padding: "14px 32px", borderRadius: 12,
              textDecoration: "none", fontWeight: 800, fontSize: "0.98rem",
              display: "inline-flex", alignItems: "center", gap: 8,
              boxShadow: "0 0 28px rgba(212,168,83,0.4)",
            }}>
              Explore Integrations <ChevronRight size={17} />
            </a>
            <Link href="/" style={{
              background: "transparent", color: "#FFF",
              padding: "14px 32px", borderRadius: 12,
              textDecoration: "none", fontWeight: 600, fontSize: "0.98rem",
              border: "1px solid rgba(255,255,255,0.18)",
            }}>
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── PRIMARY INTEGRATION CARDS ────────────────────────────────────────── */}
      <Section bg="#070709">
        <motion.div variants={stagger} id="integrations">
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(212,168,83,0.08)", border: "1px solid rgba(212,168,83,0.2)",
              color: "#D4A853", borderRadius: 999, padding: "5px 14px",
              fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", marginBottom: 20,
            }}>
              <Cpu size={13} /> KVL Business Solutions Hardware
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800, color: "#FFF", marginBottom: 16,
            }}>
              Built-For-KVL Track Hardware
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
              Every KVL Business Solutions device is engineered from the ground up to integrate seamlessly with the KVL Track platform — one dashboard, total visibility.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}
          >
            {PRIMARY_INTEGRATIONS.map((integration, i) => (
              <PrimaryCard key={integration.id} integration={integration} index={i} />
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── OTHER INTEGRATIONS ───────────────────────────────────────────────── */}
      <Section bg="#050507">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
              color: "#60A5FA", borderRadius: 999, padding: "5px 14px",
              fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", marginBottom: 20,
            }}>
              <Wifi size={13} /> Extended Ecosystem
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              fontWeight: 800, color: "#FFF", marginBottom: 14,
            }}>
              Connect Everything Else
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
              Wearables, smart speakers, asset trackers — the KVL Track ecosystem extends beyond KVL Business Solutions hardware to your entire world.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}
          >
            {OTHER_INTEGRATIONS.map((item) => (
              <motion.div
                key={item.name}
                variants={fadeUp}
                whileHover={{ y: -5, boxShadow: `0 16px 40px ${item.color}15` }}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 18, padding: "22px 20px",
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: item.color, opacity: 0.5,
                }} />
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: `${item.color}12`,
                  border: `1px solid ${item.color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: item.color, marginBottom: 14,
                }}>
                  {item.icon}
                </div>
                <div style={{
                  background: `${item.color}12`, border: `1px solid ${item.color}22`,
                  color: item.color, borderRadius: 999, padding: "2px 8px",
                  fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.07em", display: "inline-block", marginBottom: 8,
                }}>
                  {item.category}
                </div>
                <h3 style={{
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  color: "#FFF", fontSize: "0.95rem", marginBottom: 8,
                }}>
                  {item.name}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", lineHeight: 1.55, margin: 0 }}>
                  {item.desc}
                </p>
                <div style={{
                  marginTop: 14,
                  display: "flex", alignItems: "center", gap: 5,
                  color: "#10B981", fontSize: "0.72rem", fontWeight: 600,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981" }} />
                  Active
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── API SECTION ──────────────────────────────────────────────────────── */}
      <Section bg="#070709">
        <motion.div variants={stagger}>
          <motion.div
            variants={fadeUp}
            style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 60, alignItems: "center",
            }}
          >
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(212,168,83,0.08)", border: "1px solid rgba(212,168,83,0.22)",
                color: "#D4A853", borderRadius: 999, padding: "5px 14px",
                fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em", marginBottom: 20,
              }}>
                <Zap size={13} /> Developer API
              </div>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                fontWeight: 800, color: "#FFF",
                marginBottom: 16, lineHeight: 1.2,
              }}>
                Build on the KVL Track Platform
              </h2>
              <p style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.75, marginBottom: 28, fontSize: "0.93rem" }}>
                The KVL Track REST API gives developers full programmatic access to family safety data — with webhooks, native SDKs, and comprehensive documentation for building custom safety applications.
              </p>
              <Link
                href="/contact"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.3)",
                  color: "#D4A853", borderRadius: 12, padding: "12px 24px",
                  textDecoration: "none", fontWeight: 700, fontSize: "0.92rem",
                }}
              >
                Request API Access <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "REST API", detail: "Full RESTful API with JSON, OAuth 2.0 auth, and rate-limited enterprise tiers.", icon: <Globe size={17} /> },
                { label: "Webhooks", detail: "Real-time event webhooks for location, zone crossings, SOS, and health alerts — sub-100ms delivery.", icon: <Zap size={17} /> },
                { label: "SDK Support", detail: "Native SDKs for iOS (Swift), Android (Kotlin), and TypeScript with full documentation.", icon: <Smartphone size={17} /> },
                { label: "Developer Sandbox", detail: "Isolated test environment with simulated family data, events, and alert streams.", icon: <Shield size={17} /> },
              ].map((item) => (
                <div key={item.label} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14, padding: "18px 20px",
                  display: "flex", gap: 14, alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "rgba(212,168,83,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#D4A853", flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#FFF", fontSize: "0.88rem", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", lineHeight: 1.55 }}>{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── PARTNER CTA ──────────────────────────────────────────────────────── */}
      <Section bg="#050507">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.7rem, 4vw, 2.6rem)",
              fontWeight: 800, color: "#FFF", marginBottom: 14,
            }}>
              Become an Integration Partner
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", maxWidth: 560, margin: "0 auto", lineHeight: 1.75 }}>
              Schools, insurers, telecom operators, elder care providers — we want to build together.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20 }}
          >
            {[
              { icon: <Shield size={22} />, title: "Schools", desc: "Safety dashboards integrated with school management systems.", color: "#3B82F6" },
              { icon: <Car size={22} />, title: "Insurance", desc: "Opt-in telematics data for usage-based policy pricing.", color: "#10B981" },
              { icon: <Smartphone size={22} />, title: "Telecom", desc: "White-label KVL Track as a premium subscriber safety service.", color: "#D4A853" },
              { icon: <Heart size={22} />, title: "Elder Care", desc: "Professional caregiver tools built on KVL Track wellness data.", color: "#EC4899" },
            ].map((p) => (
              <motion.div
                key={p.title}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: `0 14px 35px ${p.color}15` }}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16, padding: "26px 20px",
                }}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: 14,
                  background: `${p.color}12`, border: `1px solid ${p.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: p.color, marginBottom: 14,
                }}>
                  {p.icon}
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "#FFF", fontSize: "1rem", marginBottom: 8 }}>
                  {p.title}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{
              marginTop: 40, textAlign: "center",
              background: "rgba(212,168,83,0.04)", border: "1px solid rgba(212,168,83,0.18)",
              borderRadius: 20, padding: "36px", maxWidth: 660, margin: "40px auto 0",
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: 24, fontSize: "0.92rem" }}>
              Our partnerships team evaluates integration requests on a rolling basis. We prioritize partners who share our commitment to user privacy and genuinely improved safety outcomes.
            </p>
            <Link
              href="/contact"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "linear-gradient(90deg, #D4A853, #B8860B)",
                color: "#0a0800", borderRadius: 12, padding: "13px 28px",
                textDecoration: "none", fontWeight: 800, fontSize: "0.95rem",
                boxShadow: "0 0 24px rgba(212,168,83,0.3)",
              }}
            >
              Contact Partnerships Team <ChevronRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg, #060609 0%, #0a0b14 100%)",
        padding: "96px 24px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "48px 48px", pointerEvents: "none",
        }} />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(212,168,83,0.12)", border: "1px solid rgba(212,168,83,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
          }}>
            <Cpu size={32} style={{ color: "#D4A853" }} />
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 800, color: "#FFF", marginBottom: 16,
          }}>
            Start with KVL Track, Expand Everything
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.75 }}>
            Begin free, then connect KVL Business Solutions hardware, wearables, and smart home devices as your family's needs grow.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <Link href="/" style={{
              background: "linear-gradient(90deg, #D4A853, #B8860B)",
              color: "#0a0800", padding: "15px 36px", borderRadius: 12,
              textDecoration: "none", fontWeight: 800, fontSize: "1rem",
              display: "inline-flex", alignItems: "center", gap: 8,
              boxShadow: "0 0 30px rgba(212,168,83,0.4)",
            }}>
              Get Started Free <ChevronRight size={17} />
            </Link>
            <Link href="/pricing" style={{
              background: "transparent", color: "#FFF",
              padding: "15px 36px", borderRadius: 12,
              textDecoration: "none", fontWeight: 600, fontSize: "1rem",
              border: "1px solid rgba(255,255,255,0.18)",
            }}>
              View Plans
            </Link>
          </div>
          <Link href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", textDecoration: "none" }}>
            ← Back to KVL Track Home
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
