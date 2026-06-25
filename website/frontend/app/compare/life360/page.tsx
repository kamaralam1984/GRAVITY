'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Minus,
  Star,
  Shield,
  Zap,
  Heart,
  Lock,
  Globe,
  ChevronRight,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/* ── Animation variants ─────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

/* ── Comparison table data ──────────────────────────────────────────────────── */
const COMPARISON_ROWS = [
  { feature: "Real-time location", gravity: "yes", life360: "yes", gravityNote: "Unlimited updates", life360Note: "Yes" },
  { feature: "Location history", gravity: "yes", life360: "partial", gravityNote: "365 days included", life360Note: "30 days (paid only)" },
  { feature: "SOS Emergency Alerts", gravity: "yes", life360: "no", gravityNote: "Free on all plans", life360Note: "Paid plan only" },
  { feature: "Crash Detection", gravity: "yes", life360: "yes", gravityNote: "Included free", life360Note: "Paid plan only" },
  { feature: "AI Predictions", gravity: "yes", life360: "no", gravityNote: "Predictive intelligence", life360Note: "Not available" },
  { feature: "Elderly Care Suite", gravity: "yes", life360: "no", gravityNote: "Dedicated features", life360Note: "Basic only" },
  { feature: "Family Chat", gravity: "yes", life360: "yes", gravityNote: "Built-in messaging", life360Note: "Basic chat" },
  { feature: "Data Privacy", gravity: "yes", life360: "no", gravityNote: "No data sold — ever", life360Note: "Data shared with partners" },
  { feature: "Driving Reports", gravity: "yes", life360: "no", gravityNote: "Free for all members", life360Note: "Paid plan required" },
  { feature: "Wearable Support", gravity: "yes", life360: "no", gravityNote: "Apple Watch + Galaxy Watch", life360Note: "Very limited" },
  { feature: "Medication Reminders", gravity: "yes", life360: "no", gravityNote: "Full reminder system", life360Note: "Not available" },
  { feature: "Child Safety Suite", gravity: "yes", life360: "partial", gravityNote: "Complete feature set", life360Note: "Basic only" },
  { feature: "Smart Home Integration", gravity: "yes", life360: "no", gravityNote: "Trackalways ecosystem", life360Note: "Not available" },
  { feature: "India-specific Features", gravity: "yes", life360: "no", gravityNote: "UPI, Indian cities", life360Note: "Limited India support" },
  { feature: "Monthly Price (family)", gravity: "yes", life360: "no", gravityNote: "From ₹199/month", life360Note: "₹800+ per month" },
];

/* ── FAQ data ────────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "How long does it take to switch from Life360 to KVL Track?",
    a: "Most families complete the switch in under 20 minutes. Download KVL Track, create your family circle, and invite your members via a simple link. Your data from Life360 does not transfer but KVL Track will start building your location history from day one.",
  },
  {
    q: "Will my family lose location history when switching?",
    a: "Yes — existing Life360 history stays with Life360. KVL Track begins a fresh 365-day history from your first active day. For most families the clean start is a non-issue; old history is rarely checked.",
  },
  {
    q: "Is KVL Track cheaper than Life360 for Indian families?",
    a: "Significantly. Life360 Plus for an average Indian family works out to over ₹800 per month when converted. KVL Track Family Plan is ₹199 per month with more features included — and the free plan is genuinely usable, not a stripped-down trial.",
  },
  {
    q: "Does KVL Track have the same driving features as Life360 Driver Protect?",
    a: "KVL Track includes driving reports, trip history, speed alerts, hard braking detection, and rapid acceleration monitoring — all free on the Family plan. AI-powered driving risk analysis is available on Family Plus.",
  },
  {
    q: "Does Life360 really sell user data?",
    a: "This has been publicly documented by multiple investigative outlets including Motherboard/Vice. Life360 has acknowledged sharing location data with data brokers including for insurance and automotive purposes. KVL Track does not engage in any data brokerage and earns revenue solely from subscriptions.",
  },
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

/* ── Comparison cell ─────────────────────────────────────────────────────────── */
function Cell({ value, note }: { value: string; note: string }) {
  if (value === "yes") {
    return (
      <td style={{ padding: "14px 16px", textAlign: "center", verticalAlign: "middle" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <CheckCircle size={18} style={{ color: "#10B981", flexShrink: 0 }} />
          {note && <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", lineHeight: 1.3 }}>{note}</span>}
        </div>
      </td>
    );
  }
  if (value === "no") {
    return (
      <td style={{ padding: "14px 16px", textAlign: "center", verticalAlign: "middle" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <XCircle size={18} style={{ color: "#EF4444", flexShrink: 0 }} />
          {note && <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", lineHeight: 1.3 }}>{note}</span>}
        </div>
      </td>
    );
  }
  return (
    <td style={{ padding: "14px 16px", textAlign: "center", verticalAlign: "middle" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <Minus size={18} style={{ color: "#F59E0B", flexShrink: 0 }} />
        {note && <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", lineHeight: 1.3 }}>{note}</span>}
      </div>
    </td>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function CompareLife360() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
          padding: "120px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(ellipse at 50% 0%, rgba(var(--gold-rgb),0.04) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: 32, textAlign: "left" }}
          >
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
              ← Back to KVL Track Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            style={{ marginBottom: 20 }}
          >
            <span
              style={{
                background: "rgba(var(--gold-rgb),0.1)",
                border: "1px solid rgba(var(--gold-rgb),0.25)",
                color: "var(--gold)",
                borderRadius: 999,
                padding: "6px 18px",
                fontSize: "0.82rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Honest Comparison
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.2rem, 5.5vw, 3.6rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            KVL Track vs Life360
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            style={{
              color: "var(--text-secondary)",
              fontSize: "clamp(1rem, 2vw, 1.18rem)",
              maxWidth: 680,
              margin: "0 auto 20px",
              lineHeight: 1.75,
            }}
          >
            Why 50,000+ families switched to KVL Track. This is an honest, feature-by-feature comparison — no spin, no cherry-picking. We believe the facts speak for themselves.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: 40 }}
          >
            Last updated June 2025. Based on publicly available plan information for both products.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            style={{ display: "flex", gap: 24, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}
          >
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid rgba(var(--gold-rgb),0.25)",
                borderRadius: 14,
                padding: "16px 28px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.3rem", color: "var(--gold)" }}>KVL Track</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>India-built, privacy-first</div>
            </div>
            <div style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "1.1rem" }}>vs</div>
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "16px 28px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.3rem", color: "var(--text-secondary)" }}>Life360</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>US-based, data-sharing model</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── VERDICT CARDS ────────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 14,
              }}
            >
              Quick Verdict: Three Categories That Matter Most
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 580, margin: "0 auto", lineHeight: 1.7 }}>
              Before diving into the full table, here are the three areas where the comparison is most decisive for Indian families.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22 }}
          >
            {[
              {
                icon: <Lock size={26} style={{ color: "#10B981" }} />,
                winner: "KVL Track Wins",
                category: "Privacy",
                detail: "KVL Track earns revenue from subscriptions — not from selling your family location data to insurance companies and data brokers. Life360 has publicly documented data-sharing partnerships with third-party data companies.",
                winnerColor: "#10B981",
                bg: "rgba(16,185,129,0.05)",
                border: "rgba(16,185,129,0.2)",
              },
              {
                icon: <Heart size={26} style={{ color: "#3B82F6" }} />,
                winner: "KVL Track Wins",
                category: "Value for Indian Families",
                detail: "KVL Track Family plan is ₹199/month with SOS, driving reports, and elderly care included free. Equivalent Life360 features cost ₹800+ per month after conversion — more than 4x the price for fewer India-specific features.",
                winnerColor: "#3B82F6",
                bg: "rgba(59,130,246,0.05)",
                border: "rgba(59,130,246,0.2)",
              },
              {
                icon: <Zap size={26} style={{ color: "var(--gold)" }} />,
                winner: "KVL Track Wins",
                category: "AI Features",
                detail: "KVL Track AI provides predictive late alerts, routine change detection, battery risk forecasting, and weekly AI-written family reports. Life360 has no comparable AI intelligence layer — you get raw data, not insights.",
                winnerColor: "var(--gold)",
                bg: "rgba(var(--gold-rgb),0.05)",
                border: "rgba(var(--gold-rgb),0.2)",
              },
            ].map((card) => (
              <motion.div
                key={card.category}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                style={{
                  background: card.bg,
                  border: `1px solid ${card.border}`,
                  borderRadius: 18,
                  padding: "30px 24px",
                }}
              >
                <div style={{ marginBottom: 14 }}>{card.icon}</div>
                <div
                  style={{
                    display: "inline-block",
                    background: `${card.winnerColor}18`,
                    border: `1px solid ${card.winnerColor}35`,
                    color: card.winnerColor,
                    borderRadius: 999,
                    padding: "3px 12px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 10,
                  }}
                >
                  {card.winner}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    fontSize: "1.1rem",
                    marginBottom: 12,
                  }}
                >
                  {card.category}
                </h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "0.88rem", margin: 0 }}>
                  {card.detail}
                </p>
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
              Full Feature Comparison
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
              15 features across safety, privacy, pricing, and platform capabilities — covering every question a switching family typically asks.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "var(--bg-surface)",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid var(--border)",
                minWidth: 580,
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-surface2)" }}>
                  <th
                    style={{
                      padding: "18px 20px",
                      textAlign: "left",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      width: "44%",
                    }}
                  >
                    Feature
                  </th>
                  <th
                    style={{
                      padding: "18px 16px",
                      textAlign: "center",
                      color: "var(--gold)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      width: "28%",
                    }}
                  >
                    KVL Track
                  </th>
                  <th
                    style={{
                      padding: "18px 16px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      width: "28%",
                    }}
                  >
                    Life360
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    style={{
                      borderTop: "1px solid var(--border)",
                      background: i % 2 === 0 ? "transparent" : "rgba(var(--gold-rgb),0.015)",
                    }}
                  >
                    <td
                      style={{
                        padding: "14px 20px",
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      }}
                    >
                      {row.feature}
                    </td>
                    <Cell value={row.gravity} note={row.gravityNote} />
                    <Cell value={row.life360} note={row.life360Note} />
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{
              marginTop: 20,
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              { icon: <CheckCircle size={14} style={{ color: "#10B981" }} />, label: "Included" },
              { icon: <XCircle size={14} style={{ color: "#EF4444" }} />, label: "Not available / paid upgrade" },
              { icon: <Minus size={14} style={{ color: "#F59E0B" }} />, label: "Partial / limited" },
            ].map((legend) => (
              <div key={legend.label} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: "0.8rem" }}>
                {legend.icon} {legend.label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── PRIVACY DEEP DIVE ────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#EF4444",
                  borderRadius: 999,
                  padding: "5px 14px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 20,
                }}
              >
                <Shield size={14} /> Privacy Deep Dive
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 16,
                  lineHeight: 1.2,
                }}
              >
                The Truth About Your Data
              </h2>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 18 }}>
                In 2021, investigative reporting by Motherboard/Vice revealed that Life360 sells precise location data to dozens of data brokers. This data has been used by insurance companies, automotive data firms, and hedge funds to make decisions that affect real people.
              </p>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 18 }}>
                This is not a theoretical privacy risk. When a family tracking app sells your movement data, it means the routes your children walk to school, your parent daily health walks, and your own commute patterns become commercial products — without meaningful informed consent.
              </p>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.75 }}>
                KVL Track charges a transparent subscription fee. That is the entire business model. Your family location data is used to provide you the service — and nothing else. It is not packaged, aggregated, anonymized-then-re-identified, or sold. Full stop.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                {
                  title: "What Life360 does with your data",
                  points: [
                    "Sells location data to third-party data brokers",
                    "Data used by insurance and financial companies",
                    "Difficult to fully opt out of data sharing",
                    "Business model partly dependent on data revenue",
                  ],
                  color: "#EF4444",
                  bg: "rgba(239,68,68,0.05)",
                  border: "rgba(239,68,68,0.15)",
                },
                {
                  title: "What KVL Track does with your data",
                  points: [
                    "Uses data exclusively to provide you the service",
                    "No partnerships with data brokers",
                    "Revenue comes only from subscription fees",
                    "Full data deletion on account cancellation",
                  ],
                  color: "#10B981",
                  bg: "rgba(16,185,129,0.05)",
                  border: "rgba(16,185,129,0.15)",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  style={{
                    background: card.bg,
                    border: `1px solid ${card.border}`,
                    borderRadius: 14,
                    padding: "22px 20px",
                  }}
                >
                  <h4
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      color: card.color,
                      fontSize: "0.92rem",
                      marginBottom: 12,
                    }}
                  >
                    {card.title}
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {card.points.map((p) => (
                      <div key={p} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: card.color,
                            flexShrink: 0,
                            marginTop: 7,
                          }}
                        />
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.86rem", lineHeight: 1.55 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── SWITCHING GUIDE ──────────────────────────────────────────────────── */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 52 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 16,
              }}
            >
              Switch from Life360 in 3 Steps
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
              Moving your family from Life360 to KVL Track takes less time than a single Life360 monthly billing cycle. Here is the entire process.
            </p>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 28,
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            {[
              {
                step: "01",
                icon: <Globe size={22} />,
                title: "Download KVL Track",
                description: "Get KVL Track free on iOS or Android. Create your account — it takes two minutes. No credit card required for the free plan. Your family admin account is ready immediately.",
                color: "var(--gold)",
              },
              {
                step: "02",
                icon: <Shield size={22} />,
                title: "Create Your Family Circle",
                description: "Set up your family circle and configure your home and school zones. The onboarding flow guides you step by step. Import your family members by entering their names and phone numbers.",
                color: "#3B82F6",
              },
              {
                step: "03",
                icon: <Heart size={22} />,
                title: "Invite Your Family",
                description: "Send invitation links to each family member via WhatsApp or SMS. They tap the link, install KVL Track, and join your circle. You can cancel Life360 the same day — your family is immediately covered.",
                color: "#10B981",
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 18,
                  padding: "32px 26px",
                  textAlign: "center",
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    background: `${step.color === "var(--gold)" ? "rgba(212,168,83,0.12)" : step.color === "#3B82F6" ? "rgba(59,130,246,0.12)" : "rgba(16,185,129,0.12)"}`,
                    border: `1px solid ${step.color === "var(--gold)" ? "rgba(212,168,83,0.3)" : step.color === "#3B82F6" ? "rgba(59,130,246,0.3)" : "rgba(16,185,129,0.3)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: step.color,
                    margin: "0 auto 20px",
                  }}
                >
                  {step.icon}
                </motion.div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "2rem",
                    color: step.color,
                    opacity: 0.25,
                    position: "absolute",
                    top: 16,
                    right: 22,
                  }}
                >
                  {step.step}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    fontSize: "1.1rem",
                    marginBottom: 12,
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

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
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
              Common Switching Questions
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
              Answers to every practical question families ask before making the switch from Life360.
            </p>
          </motion.div>

          <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "18px 22px",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      fontSize: "0.95rem",
                    }}
                  >
                    {faq.q}
                  </span>
                  <ChevronRight
                    size={18}
                    style={{
                      color: "var(--text-muted)",
                      flexShrink: 0,
                      transform: openFaq === i ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      background: "rgba(var(--gold-rgb),0.03)",
                      border: "1px solid rgba(var(--gold-rgb),0.12)",
                      borderTop: "none",
                      borderRadius: "0 0 12px 12px",
                      padding: "18px 22px",
                    }}
                  >
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.75, margin: 0, fontSize: "0.92rem" }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, #0a0800 0%, #1a1206 100%)",
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
            background: "radial-gradient(circle, rgba(var(--gold-rgb),0.06) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 660, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: "rgba(var(--gold-rgb),0.12)",
              border: "1px solid rgba(var(--gold-rgb),0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 28px",
            }}
          >
            <Star size={30} style={{ color: "var(--gold)", fill: "rgba(212,168,83,0.2)" }} />
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
            Start Your Free Family Safety Journey Today
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.75 }}>
            Join 50,000+ Indian families who made the switch. Better privacy, better features, better price. No credit card needed to start.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <Link
              href="/"
              style={{
                background: "var(--gold)",
                color: "#0a0900",
                padding: "15px 36px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1.05rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 0 28px rgba(var(--gold-rgb),0.3)",
              }}
            >
              Switch to KVL Track Free <ChevronRight size={18} />
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
              Compare Plans
            </Link>
          </div>
          <Link href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.88rem", textDecoration: "none" }}>
            ← Back to KVL Track Home
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
