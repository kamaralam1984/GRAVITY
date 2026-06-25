'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Brain,
  MessageCircle,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Bell,
  Eye,
  ChevronRight,
  Sparkles,
  Activity,
  Heart,
  Lock,
  Mic,
  Send,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/* ── Animation variants ─────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ── AI Capabilities ────────────────────────────────────────────────────────── */
const AI_CAPABILITIES = [
  {
    icon: <MessageCircle size={24} />,
    title: "Natural Language Queries",
    description: "Ask anything about your family in plain, everyday language. No dashboards to navigate, no menus to dig through. Just type or speak your question and get an instant, human-friendly answer.",
    color: "#A78BFA",
  },
  {
    icon: <TrendingUp size={24} />,
    title: "Predictive Late Alerts",
    description: "KVL Track AI learns your family daily routines over time. When someone is running late before they even realize it themselves, you receive a proactive heads-up — not a post-hoc notification.",
    color: "#F59E0B",
  },
  {
    icon: <Eye size={24} />,
    title: "Routine Change Detection",
    description: "If your child suddenly stays at school 40 minutes longer than usual, or your parent's daily walk route changes unexpectedly, AI flags the pattern deviation before you have to wonder about it.",
    color: "#EC4899",
  },
  {
    icon: <Zap size={24} />,
    title: "Battery Risk Prediction",
    description: "AI correlates battery drain patterns with time-of-day usage to predict when a family member is likely to run out of charge — and alerts you before it becomes a problem.",
    color: "#10B981",
  },
  {
    icon: <Activity size={24} />,
    title: "Driving Risk Alerts",
    description: "Real-time detection of unsafe driving patterns — hard braking, rapid acceleration, and high-speed behaviour. KVL Track AI distinguishes one-off events from genuine risk patterns.",
    color: "#EF4444",
  },
  {
    icon: <TrendingUp size={24} />,
    title: "Weekly AI Reports",
    description: "Every Sunday, receive a personalized Family Intelligence Report with safety scores, pattern insights, driving analysis, and wellness trends — presented in a clear, readable digest.",
    color: "#3B82F6",
  },
];

/* ── Initial demo messages (seed state) ─────────────────────────────────────── */
const WELCOME_MESSAGE = { role: 'ai' as const, text: "Hi! I'm your KVL Track AI Assistant. Ask me about your family's location, safety status, recent activity, or anything else I can help with." };

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
export default function AIAssistant() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([WELCOME_MESSAGE])
  const [inputVal, setInputVal] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const sendMsg = useCallback(async (text?: string) => {
    const q = (text ?? inputVal).trim()
    if (!q || aiLoading) return
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setInputVal('')
    setAiLoading(true)
    try {
      const history = [...messages, { role: 'user' as const, content: q }].map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: (m as any).text ?? (m as any).content,
      }))
      const res = await fetch('/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      if (res.ok) {
        const d = await res.json()
        setMessages(prev => [...prev, { role: 'ai', text: d.content }])
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting right now. Please try again in a moment." }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection error. Please check your network." }])
    } finally {
      setAiLoading(false)
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [inputVal, messages, aiLoading])

  const startMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Voice input not supported in this browser. Try Chrome.'); return }
    const rec = new SR()
    rec.lang = 'en-IN'
    rec.continuous = false
    rec.interimResults = false
    setIsRecording(true)
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript
      setInputVal(t)
      setIsRecording(false)
    }
    rec.onerror = () => setIsRecording(false)
    rec.onend = () => setIsRecording(false)
    rec.start()
  }

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          background: "linear-gradient(135deg, #080818 0%, #0e0a28 50%, #120818 100%)",
          minHeight: "92vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          padding: "100px 24px 80px",
        }}
      >
        {/* Gold glow orb */}
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,168,83,0.06) 0%, rgba(139,92,246,0.04) 40%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Floating particles */}
        {[
          { top: "15%", left: "12%", size: 4, delay: 0 },
          { top: "25%", right: "15%", size: 3, delay: 1.5 },
          { top: "60%", left: "8%", size: 5, delay: 0.8 },
          { top: "70%", right: "10%", size: 3, delay: 2.2 },
          { top: "40%", left: "85%", size: 4, delay: 1.2 },
        ].map((p, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -12, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
            style={{
              position: "absolute",
              top: p.top,
              left: (p as any).left,
              right: (p as any).right,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: i % 2 === 0 ? "#A78BFA" : "var(--gold)",
              pointerEvents: "none",
            }}
          />
        ))}

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
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                fontSize: "0.9rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← Back to KVL Track Home
            </Link>
          </motion.div>

          {/* Brain icon with animated glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 110 }}
            style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}
          >
            <motion.div
              animate={{ boxShadow: ["0 0 20px rgba(167,139,250,0.3)", "0 0 40px rgba(167,139,250,0.6)", "0 0 20px rgba(167,139,250,0.3)"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: "rgba(167,139,250,0.12)",
                border: "1px solid rgba(167,139,250,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Brain size={42} style={{ color: "#A78BFA" }} />
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
                background: "rgba(212,168,83,0.1)",
                border: "1px solid rgba(212,168,83,0.3)",
                color: "var(--gold)",
                borderRadius: 999,
                padding: "6px 18px",
                fontSize: "0.82rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Sparkles size={12} /> Powered by Advanced AI
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            Your Family&apos;s
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, var(--gold), #A78BFA, #EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI Guardian
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "clamp(1rem, 2vw, 1.22rem)",
              maxWidth: 660,
              margin: "0 auto 48px",
              lineHeight: 1.8,
            }}
          >
            KVL Track AI watches over your family 24 hours a day — predicting risks before they happen, answering your questions instantly, and learning the rhythms of your family to alert you when something truly matters.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link
              href="/"
              style={{
                background: "linear-gradient(90deg, var(--gold), #B8860B)",
                color: "#0a0900",
                padding: "14px 32px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 0 28px rgba(212,168,83,0.35)",
              }}
            >
              Try AI Free <ChevronRight size={18} />
            </Link>
            <Link
              href="/pricing"
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
              View AI Plans
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── AI CHAT DEMO ─────────────────────────────────────────────────────── */}
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
              Ask KVL Track Anything About Your Family
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
              The KVL Track AI assistant speaks plain language. No commands, no codes, no digging through menus. Just ask — and get a precise, caring answer in seconds.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{
              maxWidth: 640,
              margin: "0 auto",
              background: "#0d0d1a",
              borderRadius: 20,
              border: "1px solid rgba(167,139,250,0.2)",
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(167,139,250,0.06)",
            }}
          >
            {/* Chat header */}
            <div
              style={{
                background: "rgba(167,139,250,0.08)",
                borderBottom: "1px solid rgba(167,139,250,0.15)",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #A78BFA, #EC4899)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Brain size={16} style={{ color: "#fff" }} />
              </motion.div>
              <div>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.92rem" }}>KVL Track AI</div>
                <div style={{ color: "#A78BFA", fontSize: "0.76rem", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
                  Active — monitoring your family
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14, maxHeight: 340, overflowY: 'auto' }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-start" }}
                >
                  {msg.role === "ai" && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #A78BFA, #EC4899)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, color: "#fff" }}>
                      <Brain size={13} />
                    </div>
                  )}
                  <div style={{
                    maxWidth: "80%", padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                    background: msg.role === "user" ? "rgba(212,168,83,0.15)" : "rgba(167,139,250,0.1)",
                    border: msg.role === "user" ? "1px solid rgba(212,168,83,0.25)" : "1px solid rgba(167,139,250,0.2)",
                    color: msg.role === "user" ? "var(--gold)" : "rgba(255,255,255,0.85)",
                    fontSize: "0.88rem", lineHeight: 1.6,
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {aiLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #A78BFA, #EC4899)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff" }}>
                    <Brain size={12} />
                  </div>
                  <div style={{ padding: "10px 16px", borderRadius: "12px 12px 12px 4px", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", display: "flex", gap: 5, alignItems: "center" }}>
                    {[0, 0.2, 0.4].map((d) => (
                      <motion.div key={d} animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: d }} style={{ width: 6, height: 6, borderRadius: "50%", background: "#A78BFA" }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input bar */}
            <div style={{ borderTop: "1px solid rgba(167,139,250,0.15)", padding: "14px 20px", display: "flex", gap: 10, alignItems: "center" }}>
              <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                onClick={startMic}
                style={{
                  width: 36, height: 36, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
                  background: isRecording ? 'rgba(239,68,68,0.2)' : 'rgba(167,139,250,0.1)',
                  border: isRecording ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(167,139,250,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isRecording ? '#EF4444' : '#A78BFA',
                }}
                aria-label="Voice input"
              >
                <Mic size={15} />
              </motion.button>
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMsg() }}
                placeholder={isRecording ? "Listening…" : "Ask about your family — 'Where is Vihaan?'"}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(167,139,250,0.2)",
                  borderRadius: 10, padding: "9px 14px", color: "rgba(255,255,255,0.85)",
                  fontSize: "0.85rem", outline: 'none', fontFamily: 'inherit',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                onClick={() => sendMsg()}
                disabled={aiLoading || !inputVal.trim()}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0,
                  background: "linear-gradient(135deg, var(--gold), #B8860B)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: aiLoading || !inputVal.trim() ? 0.5 : 1,
                }}
                aria-label="Send"
              >
                <Send size={15} style={{ color: "#0a0900" }} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── AI CAPABILITIES ──────────────────────────────────────────────────── */}
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
              What KVL Track AI Can Do for Your Family
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
              Six intelligent capabilities that go far beyond simple location sharing — the difference between being informed and being protected.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 22 }}
          >
            {AI_CAPABILITIES.map((cap) => (
              <motion.div
                key={cap.title}
                variants={fadeUp}
                whileHover={{ y: -5, borderColor: `${cap.color}40` }}
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
                    background: `${cap.color}15`,
                    border: `1px solid ${cap.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: cap.color,
                    marginBottom: 18,
                  }}
                >
                  {cap.icon}
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
                  {cap.title}
                </h3>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.65, margin: 0, fontSize: "0.9rem" }}>
                  {cap.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── AI WEEKLY REPORT ─────────────────────────────────────────────────── */}
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
              Your Weekly Family Intelligence Report
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 580, margin: "0 auto", lineHeight: 1.7 }}>
              Every Sunday morning, KVL Track AI delivers a concise report card for your family. Three composite scores and an AI-written summary that takes 90 seconds to read and tells you everything that matters.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{
              maxWidth: 760,
              margin: "0 auto",
              background: "#0a0a18",
              borderRadius: 20,
              border: "1px solid rgba(212,168,83,0.2)",
              padding: "36px",
              boxShadow: "0 8px 48px rgba(0,0,0,0.3), 0 0 60px rgba(212,168,83,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
              <Sparkles size={18} style={{ color: "var(--gold)" }} />
              <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: "0.9rem" }}>
                Weekly AI Family Report — Week of June 9, 2025
              </span>
            </div>

            {/* Score rings */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 24,
                marginBottom: 36,
              }}
            >
              {[
                { label: "Family Safety Score", score: 94, max: 100, color: "#10B981" },
                { label: "Driving Score", score: 87, max: 100, color: "#F59E0B" },
                { label: "Wellness Score", score: 78, max: 100, color: "#3B82F6" },
              ].map((metric) => (
                <div key={metric.label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      position: "relative",
                      width: 110,
                      height: 110,
                      margin: "0 auto 14px",
                    }}
                  >
                    <svg width="110" height="110" viewBox="0 0 110 110">
                      <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                      <motion.circle
                        cx="55"
                        cy="55"
                        r="46"
                        fill="none"
                        stroke={metric.color}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 46}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
                        whileInView={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - metric.score / metric.max) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        transform="rotate(-90 55 55)"
                        style={{ filter: `drop-shadow(0 0 6px ${metric.color}60)` }}
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%,-50%)",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          color: metric.color,
                          lineHeight: 1,
                        }}
                      >
                        {metric.score}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem" }}>/{metric.max}</div>
                    </div>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8rem", fontWeight: 500 }}>
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>

            {/* AI insights */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "20px 22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                  color: "#A78BFA",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                <Brain size={14} /> AI Weekly Insights
              </div>
              {[
                "Vihaan maintained perfect school attendance this week. Arrival times were consistent at 8:40-8:45 AM across all 5 days.",
                "Priya driving score improved by 4 points. Fewer hard braking events on the Tuesday commute route.",
                "Dadi missed 1 of 14 medication reminders this week. Evening reminder compliance is higher than morning — consider adjusting morning reminder time.",
                "Your family logged 3 trips together over the weekend. Family co-location time up 18% vs last week.",
              ].map((insight, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    marginBottom: i < 3 ? 10 : 0,
                  }}
                >
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#A78BFA",
                      flexShrink: 0,
                      marginTop: 7,
                    }}
                  />
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.84rem", lineHeight: 1.6, margin: 0 }}>
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── PRIVACY ──────────────────────────────────────────────────────────── */}
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
              AI That Respects Your Privacy
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 620, margin: "0 auto", lineHeight: 1.75 }}>
              KVL Track AI is powerful precisely because it is built on trust. Your family data is the most personal data that exists. We take that responsibility with complete seriousness — no exceptions.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 22 }}
          >
            {[
              {
                icon: <Shield size={22} />,
                title: "No Conversation Storage",
                text: "AI queries are processed in real time and never stored as conversation logs. Your questions about your family stay between you and the system — not in a database.",
              },
              {
                icon: <Zap size={22} />,
                title: "On-Device Processing",
                text: "Wherever technically feasible, AI analysis runs on-device — meaning your family patterns are analysed locally rather than uploaded to a remote server for processing.",
              },
              {
                icon: <Eye size={22} />,
                title: "No Data Selling",
                text: "KVL Track earns revenue from subscription fees — not from selling your family location data, driving patterns, or health information to advertisers or data brokers. Never.",
              },
              {
                icon: <Lock size={22} />,
                title: "You Control the AI",
                text: "AI features are opt-in. You choose which capabilities are active, what data the AI analyses, and which family members are included in AI-driven insights and reports.",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "28px 22px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "rgba(167,139,250,0.1)",
                    border: "1px solid rgba(167,139,250,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#A78BFA",
                    margin: "0 auto 16px",
                  }}
                >
                  {item.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    fontSize: "1rem",
                    marginBottom: 10,
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.65, fontSize: "0.88rem", margin: 0 }}>
                  {item.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── PLANS ────────────────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 16,
              }}
            >
              Plans That Include KVL Track AI
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
              AI capabilities are available on Family Plus and Ultimate plans. Start with the free plan to experience core features, then upgrade when you are ready for predictive intelligence.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 22,
              maxWidth: 860,
              margin: "0 auto",
            }}
          >
            {[
              {
                name: "Family",
                price: "₹199/mo",
                ai: false,
                features: ["Real-time location", "School alerts", "SOS emergency", "Geofencing (5 zones)", "Up to 10 members"],
                highlight: false,
              },
              {
                name: "Family Plus",
                price: "₹349/mo",
                ai: true,
                features: ["All Family features", "AI natural language queries", "Predictive late alerts", "Routine change detection", "AI weekly report"],
                highlight: true,
              },
              {
                name: "Ultimate",
                price: "₹599/mo",
                ai: true,
                features: ["All Family Plus features", "Battery risk prediction", "Advanced driving AI", "Multi-family management", "Priority AI support"],
                highlight: false,
              },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                style={{
                  background: plan.highlight ? "rgba(212,168,83,0.06)" : "var(--bg)",
                  border: plan.highlight ? "1px solid rgba(212,168,83,0.35)" : "1px solid var(--border)",
                  borderRadius: 18,
                  padding: "28px 22px",
                  position: "relative",
                }}
              >
                {plan.highlight && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--gold)",
                      color: "#0a0900",
                      borderRadius: 999,
                      padding: "4px 14px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Includes AI
                  </div>
                )}
                <div
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                  }}
                >
                  {plan.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.9rem",
                    fontWeight: 800,
                    color: plan.highlight ? "var(--gold)" : "var(--text-primary)",
                    marginBottom: 20,
                  }}
                >
                  {plan.price}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {plan.features.map((f) => (
                    <div
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <Bell size={13} style={{ color: plan.highlight ? "var(--gold)" : "#A78BFA", flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>
                <Link
                  href="/pricing"
                  style={{
                    display: "block",
                    marginTop: 22,
                    textAlign: "center",
                    padding: "11px",
                    borderRadius: 10,
                    background: plan.highlight ? "var(--gold)" : "rgba(167,139,250,0.12)",
                    color: plan.highlight ? "#0a0900" : "#A78BFA",
                    border: plan.highlight ? "none" : "1px solid rgba(167,139,250,0.3)",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                  }}
                >
                  {plan.highlight ? "Get Family Plus" : "View Plan"}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, #080818 0%, #0e0a28 100%)",
          padding: "96px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(212,168,83,0.2))",
              border: "1px solid rgba(167,139,250,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 28px",
            }}
          >
            <Brain size={32} style={{ color: "#A78BFA" }} />
          </motion.div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
              color: "#FFFFFF",
              marginBottom: 16,
            }}
          >
            Your Family Deserves Smarter Safety
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.75 }}>
            Upgrade to Family Plus and experience a safety platform that thinks alongside you — predicting problems before they happen and giving you intelligence instead of just data.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <Link
              href="/pricing"
              style={{
                background: "linear-gradient(90deg, var(--gold), #B8860B)",
                color: "#0a0900",
                padding: "15px 36px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1.05rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 0 28px rgba(212,168,83,0.3)",
              }}
            >
              Unlock KVL Track AI <ChevronRight size={18} />
            </Link>
            <Link
              href="/"
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
              ← Back to KVL Track Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
