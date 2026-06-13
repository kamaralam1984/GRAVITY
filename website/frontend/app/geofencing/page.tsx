'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  MapPin,
  Bell,
  Home,
  GraduationCap,
  Navigation,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Zap,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ZoneType {
  icon: React.ReactNode
  title: string
  description: string
  examples: string[]
  color: string
}

interface AlertExample {
  emoji: string
  title: string
  body: string
  time: string
  alertType: string
}

interface FamilyScenario {
  emoji: string
  title: string
  subtitle: string
  description: string
}

interface FAQItem {
  question: string
  answer: string
}

interface Step {
  number: string
  title: string
  description: string
}

// ─── Static data ──────────────────────────────────────────────────────────────

const ZONE_TYPES: ZoneType[] = [
  {
    icon: <Home size={28} />,
    title: "Home Zone",
    description: "Automatic alerts when family members arrive at or leave home. Never wonder if the kids got back safely after school.",
    examples: [
      "Arrival alert sent to all parents",
      "Departure notification in real time",
      "Configurable radius from 100m to 2km",
      "Schedule active hours on weekdays only",
    ],
    color: "var(--primary)",
  },
  {
    icon: <GraduationCap size={28} />,
    title: "School Zone",
    description: "Track daily school attendance automatically. Know when your child arrives at school and get alerted if they leave during class hours.",
    examples: [
      "Morning arrival logged every day",
      "Unexpected departure triggers instant alert",
      "View full attendance timeline in app",
      "Works even without Wi-Fi on device",
    ],
    color: "var(--gold)",
  },
  {
    icon: <Navigation size={28} />,
    title: "Custom Zones",
    description: "Draw any zone on the map for any place that matters. A grandparent home, a sports ground, a tuition centre — you decide.",
    examples: [
      "Draw freehand or use circle radius",
      "Name and colour-code each zone",
      "Share zones with co-parents or guardians",
      "Unlimited zones on Pro plan",
    ],
    color: "var(--safe)",
  },
]

const ALERT_EXAMPLES: AlertExample[] = [
  {
    emoji: "🏠",
    title: "Aarav reached Home",
    body: "Your son arrived at Home Zone. 3:47 PM, Wednesday.",
    time: "Just now",
    alertType: "arrival",
  },
  {
    emoji: "🏫",
    title: "Priya left School Zone",
    body: "Departure detected at 11:22 AM — earlier than usual. Tap to see location.",
    time: "2 min ago",
    alertType: "departure",
  },
  {
    emoji: "👵",
    title: "Nani arrived at Market",
    body: "Your mother entered the Local Market zone safely.",
    time: "15 min ago",
    alertType: "arrival",
  },
  {
    emoji: "⚠️",
    title: "Rohan outside Safe Zone",
    body: "Rohan has moved outside the set evening boundary near Sector 14.",
    time: "18 min ago",
    alertType: "warning",
  },
  {
    emoji: "✅",
    title: "Kavya is at Tuition",
    body: "Arrived at Sharma Tuition Centre. Expected back by 7 PM.",
    time: "1 hr ago",
    alertType: "arrival",
  },
]

const FAMILY_SCENARIOS: FamilyScenario[] = [
  {
    emoji: "👩‍💼",
    title: "Working Parents",
    subtitle: "Both parents at the office",
    description: "Get a notification the moment your child reaches home from school. No more anxious calls during back-to-back meetings — Gravity handles the update for you.",
  },
  {
    emoji: "👴",
    title: "Elderly Monitoring",
    subtitle: "Senior family member safety",
    description: "Set a comfort zone around home for an elderly parent. If they wander beyond it, you receive a gentle alert with their live location so you can assist immediately.",
  },
  {
    emoji: "🧑‍🎓",
    title: "Teen Safety",
    subtitle: "Teenagers need freedom too",
    description: "Agree on boundaries together and set zones around trusted places. Teens get independence while parents stay informed — no constant check-in calls needed.",
  },
  {
    emoji: "🚌",
    title: "School Run",
    subtitle: "Daily commute confidence",
    description: "Whether your child takes the bus or auto, you see exactly when they enter the school zone each morning. Spot any unusual delay before it becomes a worry.",
  },
  {
    emoji: "✈️",
    title: "Family Travel",
    subtitle: "Airports, malls, crowded places",
    description: "Create a temporary zone around your hotel or resort while travelling. Anyone who wanders beyond the zone boundary triggers an alert so the group stays together.",
  },
]

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How accurate are the geofence zones?",
    answer: "Gravity uses a combination of GPS, Wi-Fi triangulation, and cell tower data to deliver zone accuracy within 50 to 100 metres in most urban areas. In open outdoor spaces accuracy is typically within 10 to 30 metres. The minimum zone radius you can set is 100 metres to account for natural GPS drift.",
  },
  {
    question: "How much battery does geofencing use?",
    answer: "Gravity is engineered for minimal battery impact. The geofencing engine uses low-power location APIs built into iOS and Android, which draw significantly less power than continuous GPS tracking. Most users report less than 3 to 5 percent additional daily battery usage with geofencing active.",
  },
  {
    question: "Can I receive alerts for multiple family members at once?",
    answer: "Yes. You can monitor all family members from a single dashboard and receive separate alerts for each person. Alerts clearly show the name of the person, the zone name, and whether it is an arrival or departure event. You can also mute alerts for specific members or zones during set hours.",
  },
  {
    question: "What happens if the internet connection is lost?",
    answer: "The Gravity app caches zone data on the device. Location events are recorded locally and synced the moment connectivity is restored. You will receive the alert with the correct timestamp even if there was a brief outage. For critical safety scenarios we recommend ensuring a stable data connection where possible.",
  },
  {
    question: "Can I set active hours for a geofence zone?",
    answer: "Absolutely. Every zone supports a schedule. For example you can set the School Zone to only generate alerts on weekdays between 7 AM and 4 PM. This prevents unnecessary notifications on weekends or holidays. Schedules are timezone-aware and sync automatically when you travel.",
  },
]

const STEPS: Step[] = [
  {
    number: "01",
    title: "Open the Zones tab",
    description: "Launch Gravity and tap the Zones icon in the bottom navigation. You will see a map view with any existing zones overlaid as coloured circles.",
  },
  {
    number: "02",
    title: "Draw your zone",
    description: "Tap the plus button and choose a location by searching an address or tapping the map. Drag the radius slider to set the boundary size, then name the zone and pick a colour.",
  },
  {
    number: "03",
    title: "Choose who and when",
    description: "Select which family members the zone applies to. Set active hours and choose alert preferences — sound, vibration, or silent. Save and the zone is live instantly.",
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConcentricRings() {
  return (
    <div
      style={{
        position: "relative",
        width: "320px",
        height: "320px",
        margin: "0 auto",
        flexShrink: 0,
      }}
    >
      {[320, 240, 160, 80].map((size, i) => (
        <motion.div
          key={size}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            border: `2px solid rgba(var(--primary-rgb), ${0.1 + i * 0.09})`,
            background:
              i === 3 ? "rgba(var(--primary-rgb), 0.08)" : "transparent",
          }}
        />
      ))}
      <motion.div
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          zIndex: 2,
        }}
      >
        <MapPin size={22} />
      </motion.div>
      {[0, 60, 130, 200, 270].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const r = 118
        const x = 160 + r * Math.cos(rad)
        const y = 160 + r * Math.sin(rad)
        return (
          <motion.div
            key={deg}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              delay: 1 + i * 0.3,
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            style={{
              position: "absolute",
              left: `${x - 7}px`,
              top: `${y - 7}px`,
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              background: "var(--gold)",
            }}
          />
        )
      })}
    </div>
  )
}

function ZoneCard({
  zone,
  index,
}: {
  zone: ZoneType
  index: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.55 }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-32px",
          right: "-32px",
          width: "130px",
          height: "130px",
          borderRadius: "50%",
          border: `44px solid ${zone.color}`,
          opacity: 0.06,
        }}
      />
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: `${zone.color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: zone.color,
        }}
      >
        {zone.icon}
      </div>
      <h3
        style={{
          fontSize: "1.2rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          margin: 0,
        }}
      >
        {zone.title}
      </h3>
      <p
        style={{
          color: "var(--text-secondary)",
          lineHeight: 1.75,
          margin: 0,
          fontSize: "0.93rem",
        }}
      >
        {zone.description}
      </p>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {zone.examples.map((ex) => (
          <li
            key={ex}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
            }}
          >
            <CheckCircle
              size={16}
              style={{ color: zone.color, flexShrink: 0, marginTop: "2px" }}
            />
            {ex}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

function AlertCard({
  alert,
  index,
}: {
  alert: AlertExample
  index: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  const borderColor =
    alert.alertType === "warning"
      ? "var(--gold)"
      : alert.alertType === "arrival"
      ? "var(--safe)"
      : "var(--primary)"

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -28 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.45 }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        gap: "16px",
        alignItems: "flex-start",
      }}
    >
      <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{alert.emoji}</span>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "4px",
            flexWrap: "wrap",
            gap: "6px",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              color: "var(--text-primary)",
              fontSize: "0.93rem",
            }}
          >
            {alert.title}
          </span>
          <span
            style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}
          >
            {alert.time}
          </span>
        </div>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          {alert.body}
        </p>
      </div>
    </motion.div>
  )
}

function ScenarioCard({
  scenario,
  index,
}: {
  scenario: FamilyScenario
  index: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <span style={{ fontSize: "2rem" }}>{scenario.emoji}</span>
      <div>
        <h4
          style={{
            margin: "0 0 4px",
            fontWeight: 700,
            color: "var(--text-primary)",
            fontSize: "1rem",
          }}
        >
          {scenario.title}
        </h4>
        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--primary)",
            fontWeight: 600,
          }}
        >
          {scenario.subtitle}
        </span>
      </div>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          lineHeight: 1.75,
          margin: 0,
        }}
      >
        {scenario.description}
      </p>
    </motion.div>
  )
}

function FAQRow({
  item,
  index,
  open,
  onToggle,
}: {
  item: FAQItem
  index: number
  open: boolean
  onToggle: () => void
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        overflow: "hidden",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontWeight: 600,
            color: "var(--text-primary)",
            fontSize: "0.975rem",
            lineHeight: 1.4,
          }}
        >
          {item.question}
        </span>
        <span style={{ color: "var(--primary)", flexShrink: 0 }}>
          {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                padding: "0 24px 20px",
                color: "var(--text-secondary)",
                lineHeight: 1.8,
                margin: 0,
                fontSize: "0.9rem",
              }}
            >
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GeofencingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  const whatRef = useRef(null)
  const whatInView = useInView(whatRef, { once: true, margin: "-80px" })

  const stepsRef = useRef(null)
  const stepsInView = useInView(stepsRef, { once: true, margin: "-80px" })

  const ctaRef = useRef(null)
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" })

  const toggleFAQ = (i: number) =>
    setOpenFAQ(openFAQ === i ? null : i)

  return (
    <>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          minHeight: "90vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 62% 50%, rgba(var(--primary-rgb), 0.05) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "1100px",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "60px",
            alignItems: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(var(--primary-rgb), 0.1)",
                border: "1px solid rgba(var(--primary-rgb), 0.25)",
                borderRadius: "100px",
                padding: "6px 16px",
                marginBottom: "24px",
              }}
            >
              <MapPin size={14} style={{ color: "var(--primary)" }} />
              <span
                style={{
                  color: "var(--primary)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                GEOFENCING
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                lineHeight: 1.15,
                margin: "0 0 20px",
              }}
            >
              Set Zones.{" "}
              <span style={{ color: "var(--primary)" }}>Get Instant</span>{" "}
              Alerts.
            </h1>

            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1.1rem",
                lineHeight: 1.8,
                maxWidth: "480px",
                margin: "0 0 36px",
              }}
            >
              Draw a boundary around any place that matters — home, school,
              office, grandparents house. The moment someone arrives or
              leaves, you know instantly. No checking, no calling, no
              worrying.
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                marginBottom: "36px",
              }}
            >
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "var(--primary)",
                  color: "#fff",
                  padding: "14px 28px",
                  borderRadius: "50px",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                <Zap size={16} />
                Try Geofencing Free
              </Link>
              <a
                href="#how-it-works"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  padding: "14px 28px",
                  borderRadius: "50px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  border: "1px solid var(--border)",
                  textDecoration: "none",
                }}
              >
                See How It Works
              </a>
            </div>

            <div
              style={{
                display: "flex",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              {[
                "Instant SMS + app alerts",
                "Works offline",
                "No battery drain",
              ].map((feat) => (
                <div
                  key={feat}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircle
                    size={16}
                    style={{ color: "var(--safe)" }}
                  />
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.875rem",
                    }}
                  >
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <ConcentricRings />
          </motion.div>
        </div>
      </section>

      {/* ── What Is Geofencing ────────────────────────────────────────────── */}
      <section
        ref={whatRef}
        style={{
          background: "var(--bg-surface)",
          padding: "96px 24px",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{ maxWidth: "780px", margin: "0 auto", textAlign: "center" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={whatInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: "0 0 24px",
              }}
            >
              What Is Geofencing?
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1.05rem",
                lineHeight: 1.85,
                margin: "0 0 20px",
              }}
            >
              Geofencing is a location-based technology that lets you draw
              virtual boundaries — called zones — on a map. When a tracked
              device crosses into or out of one of these zones, the system
              fires an automatic notification. Think of it like an invisible
              tripwire around every place your family calls important.
            </p>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1.05rem",
                lineHeight: 1.85,
                margin: "0 0 20px",
              }}
            >
              With Gravity, setting up a geofence takes under a minute.
              There is no complicated hardware to install. The Gravity app
              on your family member's phone does all the work in the
              background, silently monitoring their position relative to the
              zones you have created and pinging you the instant something
              changes.
            </p>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1.05rem",
                lineHeight: 1.85,
                margin: 0,
              }}
            >
              Whether you are a parent managing a busy school schedule, a
              caregiver looking after an elderly relative, or simply someone
              who wants a heads-up when the kids get home safely, geofencing
              removes the need to constantly check the app or make anxious
              phone calls. The alert comes to you — precisely when it
              matters.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Zone Type Cards ───────────────────────────────────────────────── */}
      <section style={{ background: "var(--bg)", padding: "96px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: "0 0 16px",
              }}
            >
              Three Powerful Zone Types
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1rem",
                maxWidth: "520px",
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Gravity gives you purpose-built zones for everyday family life,
              plus the freedom to create anything custom.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {ZONE_TYPES.map((zone, i) => (
              <ZoneCard key={zone.title} zone={zone} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Create a Zone ──────────────────────────────────────────── */}
      <section
        id="how-it-works"
        ref={stepsRef}
        style={{
          background: "var(--bg-surface2)",
          padding: "96px 24px",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: "0 0 16px",
              }}
            >
              Create a Zone in 3 Steps
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1rem",
                lineHeight: 1.7,
              }}
            >
              No technical knowledge needed. If you can use Google Maps,
              you can set up a geofence in under a minute.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -40 }}
                animate={stepsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.18, duration: 0.55 }}
                style={{
                  display: "flex",
                  gap: "28px",
                  alignItems: "flex-start",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "28px 32px",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    flexShrink: 0,
                  }}
                >
                  {step.number}
                </div>
                <div>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      fontSize: "1.1rem",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      margin: 0,
                      lineHeight: 1.75,
                      fontSize: "0.93rem",
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Smart Alert Examples ──────────────────────────────────────────── */}
      <section style={{ background: "var(--bg)", padding: "96px 24px" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: "0 0 16px",
              }}
            >
              What Alerts Look Like
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1rem",
                lineHeight: 1.7,
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              Clean, contextual notifications delivered to your phone the
              moment a zone event fires — no coordinates, just plain language.
            </p>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {ALERT_EXAMPLES.map((alert, i) => (
              <AlertCard key={alert.title} alert={alert} index={i} />
            ))}
          </div>

          <p
            style={{
              textAlign: "center",
              marginTop: "28px",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
            }}
          >
            Alerts arrive via push notification, SMS, and are logged in
            the app timeline.
          </p>
        </div>
      </section>

      {/* ── Real Family Scenarios ─────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--bg-surface3)",
          padding: "96px 24px",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: "0 0 16px",
              }}
            >
              Real Families. Real Peace of Mind.
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1rem",
                lineHeight: 1.7,
                maxWidth: "520px",
                margin: "0 auto",
              }}
            >
              Gravity geofencing fits into the everyday rhythms of Indian
              families across every life stage.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
              gap: "22px",
            }}
          >
            {FAMILY_SCENARIOS.map((scenario, i) => (
              <ScenarioCard
                key={scenario.title}
                scenario={scenario}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--bg)", padding: "96px 24px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: "0 0 16px",
              }}
            >
              Frequently Asked Questions
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1rem",
                lineHeight: 1.7,
              }}
            >
              Everything you need to know before you set your first zone.
            </p>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {FAQ_ITEMS.map((item, i) => (
              <FAQRow
                key={i}
                item={item}
                index={i}
                open={openFAQ === i}
                onToggle={() => toggleFAQ(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section
        ref={ctaRef}
        style={{
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)",
          padding: "96px 24px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "rgba(var(--primary-rgb), 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 28px",
              color: "var(--primary)",
            }}
          >
            <Bell size={30} />
          </div>

          <h2
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: "0 0 20px",
              lineHeight: 1.2,
            }}
          >
            Try Geofencing Free
          </h2>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.05rem",
              lineHeight: 1.8,
              maxWidth: "500px",
              margin: "0 auto 36px",
            }}
          >
            Set up your first zone in under a minute. No credit card needed.
            Works across Android and iOS. Join thousands of Indian families
            who use Gravity to stay connected with the people they love.
          </p>

          <div
            style={{
              display: "flex",
              gap: "14px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "36px",
            }}
          >
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "var(--primary)",
                color: "#fff",
                padding: "16px 36px",
                borderRadius: "50px",
                fontWeight: 700,
                fontSize: "1rem",
                textDecoration: "none",
              }}
            >
              <Zap size={18} />
              Get Started Free
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              gap: "28px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {[
              "Free 14-day trial",
              "Cancel anytime",
              "Works on all devices",
            ].map((badge) => (
              <div
                key={badge}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <CheckCircle size={15} style={{ color: "var(--safe)" }} />
                <span
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                  }}
                >
                  {badge}
                </span>
              </div>
            ))}
          </div>

          <p
            style={{
              marginTop: "28px",
              color: "var(--text-muted)",
              fontSize: "0.78rem",
              lineHeight: 1.6,
            }}
          >
            geofencing app · family location alerts · arrival departure
            notifications · safe zone app India
          </p>
        </motion.div>
      </section>

      <Footer />
    </>
  )
}
