'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Download, Mail, ExternalLink, Calendar, Globe, Users, Zap, Award } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const COMPANY_FACTS = [
  { label: "Founded", value: "2022", icon: Calendar },
  { label: "Headquarters", value: "Mumbai, India", icon: Globe },
  { label: "Families Protected", value: "50,000+", icon: Users },
  { label: "Available on", value: "iOS and Android", icon: Zap },
]

const COVERAGE = [
  {
    publication: "TechCrunch India",
    headline: "Gravity raises seed round to make family safety mainstream in India",
    date: "January 15, 2025",
    excerpt: "The Mumbai-based startup is betting that real-time location sharing can become a household utility across India the same way UPI payments did. With a freemium model and privacy-first architecture, Gravity is quietly building the safety layer for the next billion smartphone users.",
    color: "var(--primary)",
  },
  {
    publication: "Economic Times",
    headline: "Mumbai startup redefines how Indian families stay connected through real-time location",
    date: "December 3, 2024",
    excerpt: "As smartphone penetration deepens across tier-2 and tier-3 cities, Gravity is positioning itself at the intersection of family trust and mobile technology. The platform has grown five-fold in 2024 alone, driven entirely by word-of-mouth among parents and caregivers across the country.",
    color: "var(--gold)",
  },
  {
    publication: "YourStory",
    headline: "Meet the team building an Indian answer to Life360",
    date: "November 8, 2024",
    excerpt: "Founded by a team of ex-Flipkart and Ola engineers, Gravity is designed ground-up for the Indian context — supporting low-bandwidth conditions, multiple languages, and the nuanced dynamics of multigenerational households that dominate the subcontinent.",
    color: "var(--safe)",
  },
  {
    publication: "Inc42",
    headline: "Gravity freemium model targets 50 million Indian families",
    date: "September 30, 2024",
    excerpt: "With a zero-cost entry tier and a premium plan priced below a cup of coffee per month, Gravity is aggressively democratising family safety tech. Founders say the addressable market in India alone exceeds what most Western counterparts have tapped globally.",
    color: "var(--primary)",
  },
  {
    publication: "The Ken",
    headline: "The privacy-first family tracker that avoids the surveillance trap",
    date: "August 22, 2024",
    excerpt: "Unlike legacy location apps that operate as covert surveillance tools, Gravity builds consent and transparency into every layer. Every family member sees who can see them, can pause sharing at any time, and receives clear notifications when their location is being accessed.",
    color: "var(--gold)",
  },
  {
    publication: "Mint",
    headline: "Family safety apps see 3x growth post-pandemic in India",
    date: "July 14, 2024",
    excerpt: "A Mint analysis of the family safety app category shows a sustained three-times growth curve since 2022, with Gravity emerging as the fastest-growing domestic player. Analysts cite rising smartphone adoption among senior citizens and working parents as the primary growth driver.",
    color: "var(--safe)",
  },
]

const BOILERPLATE = "Gravity by TRACKALWAYS is a family safety platform designed for the needs of modern Indian households. Founded in 2022 and headquartered in Mumbai, Gravity provides real-time location sharing, SOS alerts, place arrival and departure notifications, and driving behaviour monitoring through a privacy-first mobile application available on iOS and Android. The platform serves over 50,000 families across India, with a freemium model that makes core safety features accessible to everyone. Gravity is built on the belief that staying connected with loved ones should be simple, transparent, and affordable. The company is backed by seed funding and is actively expanding its feature set to cover elder care, student safety, and enterprise fleet management. For more information, visit trackalways.com."

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function PressPage() {
  const heroRef = useRef(null)
  const factsRef = useRef(null)
  const coverageRef = useRef(null)
  const assetsRef = useRef(null)
  const contactRef = useRef(null)

  const heroInView = useInView(heroRef, { once: true, margin: "-80px" })
  const factsInView = useInView(factsRef, { once: true, margin: "-80px" })
  const coverageInView = useInView(coverageRef, { once: true, margin: "-80px" })
  const assetsInView = useInView(assetsRef, { once: true, margin: "-80px" })
  const contactInView = useInView(contactRef, { once: true, margin: "-80px" })

  return (
    <div style={{ background: "var(--bg)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section
        ref={heroRef}
        style={{
          paddingTop: "120px",
          paddingBottom: "80px",
          borderBottom: "1px solid var(--border)",
          background: "linear-gradient(180deg, rgba(var(--primary-rgb),0.06) 0%, transparent 100%)",
        }}
      >
        <motion.div
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={stagger}
          style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}
        >
          <motion.div variants={fadeUp}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: "var(--text-muted)",
                textDecoration: "none",
                marginBottom: "24px",
                letterSpacing: "0.04em",
              }}
            >
              Back to Gravity
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(var(--gold-rgb),0.12)",
              border: "1px solid rgba(var(--gold-rgb),0.3)",
              borderRadius: "100px",
              padding: "6px 16px",
              marginBottom: "28px",
            }}
          >
            <Award size={14} color="var(--gold)" />
            <span
              style={{
                fontSize: "12px",
                color: "var(--gold)",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Press and Media
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            style={{
              fontSize: "clamp(2.4rem, 6vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            Press &amp; Media
          </motion.h1>

          <motion.p
            variants={fadeUp}
            style={{
              fontSize: "1.2rem",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              maxWidth: "600px",
              margin: "0 auto 36px",
            }}
          >
            Resources for journalists, analysts, and media partners covering family safety technology.
            Everything you need to tell the Gravity story accurately and compellingly.
          </motion.p>

          <motion.div
            variants={fadeUp}
            style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}
          >
            <a
              href="mailto:media@trackalways.com"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--primary)",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "15px",
              }}
            >
              <Mail size={16} />
              Contact Press Team
            </a>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "15px",
              }}
            >
              <Download size={16} />
              Download Press Kit
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Company Facts */}
      <section ref={factsRef} style={{ padding: "72px 24px", background: "var(--bg-surface)" }}>
        <motion.div
          initial="hidden"
          animate={factsInView ? "visible" : "hidden"}
          variants={stagger}
          style={{ maxWidth: "900px", margin: "0 auto" }}
        >
          <motion.h2
            variants={fadeUp}
            style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "8px", textAlign: "center" }}
          >
            Company at a Glance
          </motion.h2>
          <motion.p
            variants={fadeUp}
            style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: "40px", fontSize: "15px" }}
          >
            Key facts for editorial use
          </motion.p>

          <motion.div
            variants={stagger}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "16px",
            }}
          >
            {COMPANY_FACTS.map((fact) => {
              const Icon = fact.icon
              return (
                <motion.div
                  key={fact.label}
                  variants={fadeUp}
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "28px 24px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "rgba(var(--primary-rgb),0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    <Icon size={20} color="var(--primary)" />
                  </div>
                  <div
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 800,
                      marginBottom: "6px",
                      color: "var(--text-primary)",
                    }}
                  >
                    {fact.value}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
                    {fact.label}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* Press Coverage */}
      <section ref={coverageRef} style={{ padding: "80px 24px" }}>
        <motion.div
          initial="hidden"
          animate={coverageInView ? "visible" : "hidden"}
          variants={stagger}
          style={{ maxWidth: "900px", margin: "0 auto" }}
        >
          <motion.h2
            variants={fadeUp}
            style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "8px" }}
          >
            Recent Press Coverage
          </motion.h2>
          <motion.p
            variants={fadeUp}
            style={{ color: "var(--text-muted)", marginBottom: "40px", fontSize: "15px" }}
          >
            Selected coverage from leading Indian and global technology publications
          </motion.p>

          <motion.div variants={stagger} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {COVERAGE.map((item) => (
              <motion.div
                key={item.headline}
                variants={fadeUp}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderLeft: `4px solid ${item.color}`,
                  borderRadius: "12px",
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: item.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {item.publication}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Calendar size={12} />
                    {item.date}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.4, margin: 0 }}>
                  {item.headline}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {item.excerpt}
                </p>
                <a
                  href="#"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "13px",
                    color: item.color,
                    textDecoration: "none",
                    fontWeight: 600,
                    width: "fit-content",
                  }}
                >
                  Read article <ExternalLink size={12} />
                </a>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Brand Assets */}
      <section ref={assetsRef} style={{ padding: "80px 24px", background: "var(--bg-surface)" }}>
        <motion.div
          initial="hidden"
          animate={assetsInView ? "visible" : "hidden"}
          variants={stagger}
          style={{ maxWidth: "900px", margin: "0 auto" }}
        >
          <motion.h2 variants={fadeUp} style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "8px" }}>
            Brand Assets
          </motion.h2>
          <motion.p
            variants={fadeUp}
            style={{ color: "var(--text-muted)", marginBottom: "40px", fontSize: "15px" }}
          >
            Official logos, icons, and colour palette for editorial and partner use
          </motion.p>

          <motion.div
            variants={stagger}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Logo Dark */}
            <motion.div
              variants={fadeUp}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "140px",
                  background: "#0a0a0f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    color: "var(--gold)",
                    textTransform: "uppercase",
                  }}
                >
                  GRAVITY
                </span>
              </div>
              <div style={{ padding: "16px 20px" }}>
                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
                  Primary Logo (Dark)
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  For use on dark backgrounds
                </div>
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "7px 14px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <Download size={12} /> Download SVG
                </button>
              </div>
            </motion.div>

            {/* Logo Light */}
            <motion.div
              variants={fadeUp}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "140px",
                  background: "#f5f5f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    color: "#1a1a2e",
                    textTransform: "uppercase",
                  }}
                >
                  GRAVITY
                </span>
              </div>
              <div style={{ padding: "16px 20px" }}>
                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
                  Primary Logo (Light)
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  For use on light backgrounds
                </div>
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "7px 14px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <Download size={12} /> Download SVG
                </button>
              </div>
            </motion.div>

            {/* App Icon */}
            <motion.div
              variants={fadeUp}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "140px",
                  background: "var(--bg-surface2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: "var(--gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 32px rgba(var(--gold-rgb),0.4)",
                  }}
                >
                  <span style={{ fontSize: "2rem", fontWeight: 900, color: "#0a0a0f" }}>G</span>
                </div>
              </div>
              <div style={{ padding: "16px 20px" }}>
                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>App Icon</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  PNG at 1024x1024 and 512x512
                </div>
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "7px 14px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <Download size={12} /> Download PNG
                </button>
              </div>
            </motion.div>

            {/* Brand Colors */}
            <motion.div
              variants={fadeUp}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "140px",
                  background: "var(--bg-surface2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  padding: "20px",
                }}
              >
                {[
                  { bg: "var(--primary)", label: "Primary" },
                  { bg: "var(--gold)", label: "Gold" },
                  { bg: "var(--safe)", label: "Safe" },
                  { bg: "#0a0a0f", label: "Dark" },
                ].map((swatch) => (
                  <div key={swatch.label} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        background: swatch.bg,
                        border: "1px solid rgba(255,255,255,0.1)",
                        marginBottom: "4px",
                      }}
                    />
                    <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{swatch.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "16px 20px" }}>
                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>Brand Colours</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  Hex codes and Figma variables
                </div>
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "7px 14px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <Download size={12} /> Download PDF
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Press Kit CTA */}
          <motion.div
            variants={fadeUp}
            style={{
              marginTop: "40px",
              background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.1) 0%, rgba(var(--gold-rgb),0.08) 100%)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "10px" }}>Full Press Kit</h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "15px",
                marginBottom: "24px",
                lineHeight: 1.6,
              }}
            >
              Download the complete press kit including all logos, product screenshots, founder headshots,
              and brand guidelines in a single archive.
            </p>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "var(--gold)",
                color: "#0a0a0f",
                border: "none",
                borderRadius: "8px",
                padding: "14px 32px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              <Download size={18} />
              Download Complete Press Kit
            </button>
            <p style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
              ZIP archive — all assets at print resolution
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Boilerplate */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "8px" }}>
            Company Boilerplate
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "28px", fontSize: "15px" }}>
            Standard copy approved for use in editorial contexts
          </p>
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderLeft: "4px solid var(--primary)",
              borderRadius: "12px",
              padding: "32px",
            }}
          >
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.85,
                color: "var(--text-secondary)",
                margin: 0,
                fontStyle: "italic",
              }}
            >
              {BOILERPLATE}
            </p>
            <div style={{ marginTop: "20px", fontSize: "12px", color: "var(--text-muted)" }}>
              Approved boilerplate — last reviewed January 2025
            </div>
          </div>
        </div>
      </section>

      {/* Press Contacts */}
      <section ref={contactRef} style={{ padding: "80px 24px", background: "var(--bg-surface)" }}>
        <motion.div
          initial="hidden"
          animate={contactInView ? "visible" : "hidden"}
          variants={stagger}
          style={{ maxWidth: "900px", margin: "0 auto" }}
        >
          <motion.h2 variants={fadeUp} style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "8px" }}>
            Press Contacts
          </motion.h2>
          <motion.p
            variants={fadeUp}
            style={{ color: "var(--text-muted)", marginBottom: "36px", fontSize: "15px" }}
          >
            We respond to all press inquiries within 24 hours on business days
          </motion.p>

          <motion.div
            variants={stagger}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <motion.div
              variants={fadeUp}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "28px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "rgba(var(--primary-rgb),0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <Mail size={20} color="var(--primary)" />
              </div>
              <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>Media Inquiries</div>
              <div style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "14px" }}>
                For press releases, interview requests, product briefings, and editorial queries
              </div>
              <a
                href="mailto:media@trackalways.com"
                style={{ color: "var(--primary)", fontWeight: 700, fontSize: "15px", textDecoration: "none" }}
              >
                media@trackalways.com
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "28px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "rgba(var(--gold-rgb),0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <Globe size={20} color="var(--gold)" />
              </div>
              <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>Partnerships</div>
              <div style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "14px" }}>
                For co-marketing opportunities, analyst relations, and strategic partnership inquiries
              </div>
              <a
                href="mailto:partnerships@trackalways.com"
                style={{ color: "var(--gold)", fontWeight: 700, fontSize: "15px", textDecoration: "none" }}
              >
                partnerships@trackalways.com
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(var(--primary-rgb),0.06)",
              border: "1px solid rgba(var(--primary-rgb),0.2)",
              borderRadius: "10px",
              padding: "16px 20px",
              width: "fit-content",
            }}
          >
            <Zap size={16} color="var(--primary)" />
            <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
              Response time: within 24 hours for all press and media inquiries
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            Covering Gravity?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "16px",
              lineHeight: 1.7,
              marginBottom: "36px",
            }}
          >
            We would love to help you tell the story of family safety in India.
            Reach out to our press team or explore the product yourself.
          </p>
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--primary)",
                color: "#fff",
                padding: "13px 28px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "15px",
              }}
            >
              Explore Gravity
            </Link>
            <Link
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                padding: "13px 28px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "15px",
              }}
            >
              <Mail size={15} />
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
