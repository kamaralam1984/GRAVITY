'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Briefcase,
  Globe,
  Heart,
  Zap,
  Users,
  TrendingUp,
  DollarSign,
  Laptop,
  BookOpen,
  Baby,
  Home,
  Mail,
  CheckCircle,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/* ── Data ────────────────────────────────────────────────────────────────────── */
const VALUES = [
  {
    icon: <Heart size={28} />,
    title: 'Mission-Driven Work',
    description:
      'Every feature you ship protects real families. When you fix a geofencing bug at midnight, there is a grandmother in Jaipur whose adult children will sleep easier because of it. The mission is tangible, personal, and urgent.',
    color: 'var(--sos)',
  },
  {
    icon: <Globe size={28} />,
    title: 'Remote-First Culture',
    description:
      'We built a distributed team intentionally, not as an afterthought. Our async-first workflows, documented decisions, and overlap-friendly meeting windows mean your best work happens wherever you are most effective.',
    color: 'var(--primary)',
  },
  {
    icon: <TrendingUp size={28} />,
    title: 'Competitive Compensation',
    description:
      'Market-rate salaries benchmarked annually against Levels.fyi and Glassdoor data, meaningful equity packages with standard four-year vesting, and transparent pay bands that are visible to every employee.',
    color: 'var(--gold)',
  },
  {
    icon: <Zap size={28} />,
    title: 'Meaningful Impact',
    description:
      'Gravity is used by over two million families across India today. When we ship, we move the needle for real people — not just vanity metrics. Your work ships fast, gets measured rigorously, and shapes a product families depend on.',
    color: 'var(--safe)',
  },
];

const STATS = [
  { value: '45', label: 'Team Members' },
  { value: '12', label: 'Countries' },
  { value: '4.8', label: 'Glassdoor Rating' },
  { value: 'Series A', label: 'Funded' },
];

const JOBS = [
  {
    id: 1,
    title: 'Senior iOS Engineer',
    team: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    responsibilities: [
      `Lead architecture decisions for Gravity's iOS app (Swift/SwiftUI), owning the real-time location pipeline from CoreLocation to our WebSocket layer.`,
      'Mentor two mid-level iOS engineers through design reviews, pair sessions, and structured 1:1 feedback cycles.',
      'Collaborate with Product and Design to ship battery-efficient background tracking features that pass App Store review on the first submission.',
    ],
    gradient: 'from-blue-500/20 to-cyan-400/10',
    accentColor: 'var(--primary)',
  },
  {
    id: 2,
    title: 'Product Designer (UX)',
    team: 'Design',
    location: 'Remote / Bangalore',
    type: 'Full-time',
    responsibilities: [
      `Own end-to-end UX for Gravity's mobile and web surfaces — from user research and journey mapping through to high-fidelity Figma prototypes and usability testing.`,
      'Establish and maintain a cohesive design system used by both iOS and Android squads, ensuring pixel-perfect implementation.',
      'Run moderated user interviews with Indian families across metro and Tier-2 cities to surface unmet needs and validate design hypotheses before engineering begins.',
    ],
    gradient: 'from-purple-500/20 to-pink-400/10',
    accentColor: '#a855f7',
  },
  {
    id: 3,
    title: 'Growth Marketing Manager',
    team: 'Marketing',
    location: 'Mumbai / Remote',
    type: 'Full-time',
    responsibilities: [
      'Own paid acquisition across Meta, Google UAC, and influencer channels with a combined monthly budget of ₹40 lakh, targeting a blended CAC below ₹120.',
      'Build and run A/B testing infrastructure for landing pages, app store listings, and onboarding flows — measure, learn, and iterate in weekly sprints.',
      'Develop referral and family-invite loops in partnership with the Product team that currently account for 34% of new sign-ups and help that number grow.',
    ],
    gradient: 'from-orange-500/20 to-yellow-400/10',
    accentColor: 'var(--gold)',
  },
  {
    id: 4,
    title: 'Senior Backend Engineer (Node.js)',
    team: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    responsibilities: [
      'Design and operate the high-throughput location-ingestion service that processes 14 million GPS events per hour with sub-200ms P99 latency using Node.js, Kafka, and PostgreSQL + TimescaleDB.',
      'Drive the migration of legacy REST endpoints to a GraphQL federation layer, improving mobile client performance and reducing over-fetching by an estimated 40%.',
      'Champion backend observability — instrument with OpenTelemetry, build Grafana dashboards, and lead weekly on-call reviews that shrink MTTR from hours to minutes.',
    ],
    gradient: 'from-green-500/20 to-emerald-400/10',
    accentColor: 'var(--safe)',
  },
  {
    id: 5,
    title: 'Customer Success Lead',
    team: 'Operations',
    location: 'Bangalore',
    type: 'Full-time',
    responsibilities: [
      `Own the post-onboarding experience for Gravity's 8,000+ B2B school and enterprise clients — drive 90-day activation rates and reduce involuntary churn through proactive health-score monitoring.`,
      'Build and manage a team of four Customer Success Associates, establishing playbooks, escalation paths, and quarterly business review templates.',
      'Act as the voice of the customer internally: synthesise support tickets, NPS verbatims, and renewal feedback into a monthly product insight report presented directly to the CPO.',
    ],
    gradient: 'from-teal-500/20 to-cyan-400/10',
    accentColor: '#14b8a6',
  },
];

const BENEFITS = [
  {
    icon: <Heart size={24} />,
    title: 'Comprehensive Health Insurance',
    description:
      'Full medical, dental, and vision coverage for you and your dependants. No waiting period, zero co-pay for primary care.',
  },
  {
    icon: <DollarSign size={24} />,
    title: 'Equity Package',
    description:
      'Meaningful ESOP grants with a standard four-year vest and one-year cliff. We share the upside transparently — every employee sees the cap table model.',
  },
  {
    icon: <Laptop size={24} />,
    title: 'Remote-First Setup',
    description:
      'Work from anywhere in India (or abroad for up to 90 days a year). Flexible hours built around outcomes, not seat time.',
  },
  {
    icon: <BookOpen size={24} />,
    title: '₹60,000 Learning Budget',
    description:
      'Annual allowance for courses, conferences, books, or certifications. No approval process needed for anything under ₹10,000.',
  },
  {
    icon: <Baby size={24} />,
    title: 'Generous Parental Leave',
    description:
      '26 weeks paid maternity leave and 8 weeks paid paternity leave, with a phased re-entry program and no penalty on promotions or reviews.',
  },
  {
    icon: <Home size={24} />,
    title: 'Home Office Stipend',
    description:
      '₹40,000 one-time setup allowance plus ₹3,000 monthly internet and co-working reimbursement. Your workspace should be as good as ours.',
  },
];

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Application Review',
    description:
      'Every application is read by a human — no automated ATS scoring. You will hear back within five business days with specific, honest feedback.',
  },
  {
    step: '02',
    title: 'Introductory Call',
    description:
      'A 30-minute video call with your future hiring manager. No trick questions — we want to understand your experience, your goals, and answer your questions honestly.',
  },
  {
    step: '03',
    title: 'Technical / Skills Round',
    description:
      'A focused take-home or live exercise scoped to under three hours. We pay candidates for their time on assessments that exceed 90 minutes.',
  },
  {
    step: '04',
    title: 'Final Interview & Offer',
    description:
      'A 90-minute loop with three team members across different functions. We aim to make decisions within 48 hours and extend offers with full transparency on comp and equity.',
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────────────── */
function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────────── */
export default function CareersPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <>
      <Navbar />

      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        {/* ── Back link ──────────────────────────────────────────────────────── */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px' }}>
            <Link
              href="/"
              style={{
                color: 'var(--text-muted)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)')
              }
            >
              <ArrowLeft size={14} />
              Return to Gravity Home
            </Link>
          </div>
        </div>

        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          style={{
            background: 'var(--bg-surface)',
            padding: '100px 24px 80px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative background shapes */}
          <div
            style={{
              position: 'absolute',
              top: -80,
              right: -80,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: `rgba(var(--primary-rgb), 0.06)`,
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -60,
              left: -60,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: `rgba(var(--gold-rgb), 0.06)`,
              filter: 'blur(50px)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              maxWidth: 800,
              margin: '0 auto',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: `rgba(var(--gold-rgb), 0.1)`,
                  border: `1px solid rgba(var(--gold-rgb), 0.3)`,
                  color: 'var(--gold)',
                  borderRadius: 999,
                  padding: '6px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 28,
                }}
              >
                <Briefcase size={13} />
                We`re Hiring — 5 Open Roles`
              </span>

              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  lineHeight: 1.12,
                  marginBottom: 22,
                }}
              >
                Build the Future of{' '}
                <span className="gradient-text-gold">Family Safety</span>
              </h1>

              <p
                style={{
                  fontSize: '1.15rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.8,
                  maxWidth: 620,
                  margin: '0 auto 36px',
                }}
              >
                At Gravity, we believe that knowing your loved ones are safe should be effortless.
                We are building the infrastructure of family peace of mind — and we need exceptional
                people to help us do it. Join a team that ships fast, cares deeply, and measures
                success by the anxiety it removes from families across India and beyond.
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href="#open-roles"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--gold)',
                    color: '#000',
                    padding: '14px 28px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 15,
                    textDecoration: 'none',
                  }}
                >
                  See Open Roles <ArrowRight size={16} />
                </a>
                <a
                  href="mailto:careers@trackalways.com"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    padding: '14px 28px',
                    borderRadius: 12,
                    fontWeight: 600,
                    fontSize: 15,
                    textDecoration: 'none',
                    border: '1px solid var(--border-strong)',
                  }}
                >
                  <Mail size={15} />
                  Send Your CV
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Culture photo strip ────────────────────────────────────────────── */}
        <section style={{ background: 'var(--bg)', padding: '56px 24px 0' }}>
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {[
              { label: 'Our Bangalore HQ', color: 'from-blue-600/30 to-indigo-600/20', icon: <Home size={32} /> },
              { label: 'Team All-Hands', color: 'from-purple-600/30 to-pink-500/20', icon: <Users size={32} /> },
              { label: 'Remote Work Life', color: 'from-green-600/30 to-emerald-500/20', icon: <Laptop size={32} /> },
              { label: 'Learning & Growth', color: 'from-yellow-600/30 to-amber-500/20', icon: <BookOpen size={32} /> },
              { label: 'Family Safety Mission', color: 'from-red-600/30 to-rose-500/20', icon: <Heart size={32} /> },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div
                  style={{
                    height: 160,
                    borderRadius: 16,
                    background: `linear-gradient(135deg, rgba(var(--primary-rgb),0.12), rgba(var(--gold-rgb),0.08))`,
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div style={{ color: 'var(--text-muted)', opacity: 0.6 }}>{item.icon}</div>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      textAlign: 'center',
                      padding: '0 12px',
                    }}
                  >
                    {item.label}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── Stats ──────────────────────────────────────────────────────────── */}
        <section style={{ background: 'var(--bg)', padding: '56px 24px' }}>
          <div
            style={{
              maxWidth: 900,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 20,
            }}
          >
            {STATS.map((s, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px 20px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '2.2rem',
                      fontWeight: 900,
                      color: 'var(--gold)',
                      marginBottom: 6,
                    }}
                  >
                    {s.value}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                    {s.label}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── Why Gravity ────────────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            padding: '80px 24px',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <FadeIn>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: 12,
                  }}
                >
                  Our Culture
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: 14,
                  }}
                >
                  Why Gravity
                </h2>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    maxWidth: 520,
                    margin: '0 auto',
                    lineHeight: 1.75,
                  }}
                >
                  We are a team of parents, engineers, designers, and researchers who share one
                  belief: that technology should reduce worry, not create it.
                </p>
              </div>
            </FadeIn>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 24,
              }}
            >
              {VALUES.map((v, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 16,
                      padding: '32px 28px',
                      height: '100%',
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: `rgba(var(--gold-rgb), 0.08)`,
                        border: `1px solid rgba(var(--gold-rgb), 0.2)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: v.color,
                        marginBottom: 20,
                      }}
                    >
                      {v.icon}
                    </div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: 10,
                      }}
                    >
                      {v.title}
                    </h3>
                    <p
                      style={{
                        color: 'var(--text-muted)',
                        lineHeight: 1.75,
                        fontSize: '0.9rem',
                      }}
                    >
                      {v.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Open Positions ─────────────────────────────────────────────────── */}
        <section
          id="open-roles"
          style={{ background: 'var(--bg)', padding: '80px 24px' }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <FadeIn>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: 12,
                  }}
                >
                  Trackalways Jobs · Family Safety Startup India
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: 14,
                  }}
                >
                  Open Positions
                </h2>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    maxWidth: 480,
                    margin: '0 auto',
                    lineHeight: 1.75,
                  }}
                >
                  Five roles across Engineering, Design, Marketing, and Operations.
                  All roles are open to candidates across India — most are fully remote.
                </p>
              </div>
            </FadeIn>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {JOBS.map((job, i) => (
                <FadeIn key={job.id} delay={i * 0.08}>
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 18,
                      overflow: 'hidden',
                      transition: 'border-color 0.25s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.borderColor =
                        'rgba(var(--gold-rgb),0.4)')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)')
                    }
                  >
                    <div style={{ padding: '32px 36px' }}>
                      {/* Header row */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 12,
                          alignItems: 'flex-start',
                          marginBottom: 20,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 220 }}>
                          <h3
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '1.25rem',
                              fontWeight: 800,
                              color: 'var(--text-primary)',
                              marginBottom: 10,
                            }}
                          >
                            {job.title}
                          </h3>
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 8,
                            }}
                          >
                            {[
                              { icon: <Briefcase size={11} />, text: job.team },
                              { icon: <MapPin size={11} />, text: job.location },
                              { icon: <Users size={11} />, text: job.type },
                            ].map((badge, bi) => (
                              <span
                                key={bi}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  background: 'var(--bg)',
                                  border: '1px solid var(--border)',
                                  color: 'var(--text-secondary)',
                                  borderRadius: 999,
                                  padding: '4px 12px',
                                  fontSize: 12,
                                  fontWeight: 500,
                                }}
                              >
                                {badge.icon}
                                {badge.text}
                              </span>
                            ))}
                          </div>
                        </div>

                        <a
                          href="mailto:careers@trackalways.com"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'var(--gold)',
                            color: '#000',
                            padding: '11px 22px',
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 13,
                            textDecoration: 'none',
                            flexShrink: 0,
                          }}
                        >
                          Apply Now <ArrowRight size={13} />
                        </a>
                      </div>

                      {/* Responsibilities */}
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {job.responsibilities.map((resp, ri) => (
                          <li
                            key={ri}
                            style={{
                              display: 'flex',
                              gap: 12,
                              alignItems: 'flex-start',
                              color: 'var(--text-secondary)',
                              fontSize: '0.9rem',
                              lineHeight: 1.7,
                            }}
                          >
                            <CheckCircle
                              size={15}
                              style={{ color: 'var(--safe)', flexShrink: 0, marginTop: 3 }}
                            />
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Benefits ───────────────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--bg-surface2)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            padding: '80px 24px',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <FadeIn>
              <div style={{ textAlign: 'center', marginBottom: 52 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: 12,
                  }}
                >
                  Perks & Benefits
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: 14,
                  }}
                >
                  We Take Care of Our Team
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', lineHeight: 1.75 }}>
                  When your team is protected and well-resourced, they do their best work. Here is
                  how Gravity invests in the people who build it.
                </p>
              </div>
            </FadeIn>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 20,
              }}
            >
              {BENEFITS.map((b, i) => (
                <FadeIn key={i} delay={i * 0.08}>
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 16,
                      padding: '28px 26px',
                      display: 'flex',
                      gap: 16,
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        background: `rgba(var(--gold-rgb), 0.1)`,
                        border: `1px solid rgba(var(--gold-rgb), 0.25)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gold)',
                        flexShrink: 0,
                      }}
                    >
                      {b.icon}
                    </div>
                    <div>
                      <h4
                        style={{
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          fontSize: '0.95rem',
                          marginBottom: 6,
                        }}
                      >
                        {b.title}
                      </h4>
                      <p
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.86rem',
                          lineHeight: 1.7,
                        }}
                      >
                        {b.description}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Application Process ────────────────────────────────────────────── */}
        <section style={{ background: 'var(--bg)', padding: '80px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <FadeIn>
              <div style={{ textAlign: 'center', marginBottom: 52 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: 12,
                  }}
                >
                  How to Join
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: 14,
                  }}
                >
                  Our Application Process
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', lineHeight: 1.75 }}>
                  We have designed a fair, transparent process that respects your time.
                  Most candidates go from application to offer in under three weeks.
                </p>
              </div>
            </FadeIn>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                position: 'relative',
              }}
            >
              {PROCESS_STEPS.map((step, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 16,
                      padding: '28px 24px',
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: `rgba(var(--gold-rgb), 0.12)`,
                        border: `2px solid rgba(var(--gold-rgb), 0.35)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: '1rem',
                        color: 'var(--gold)',
                      }}
                    >
                      {step.step}
                    </div>
                    <h4
                      style={{
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        marginBottom: 10,
                      }}
                    >
                      {step.title}
                    </h4>
                    <p
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                        lineHeight: 1.7,
                      }}
                    >
                      {step.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Glassdoor strip ────────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            padding: '48px 24px',
          }}
        >
          <FadeIn>
            <div
              style={{
                maxWidth: 700,
                margin: '0 auto',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', gap: 4 }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={22}
                    style={{
                      color: i < 4 ? 'var(--gold)' : 'var(--gold)',
                      fill: i < 5 ? 'var(--gold)' : 'none',
                    }}
                  />
                ))}
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                }}
              >
                4.8 / 5 on Glassdoor
              </p>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.75,
                  maxWidth: 520,
                  fontSize: '0.95rem',
                }}
              >
                "The best place I have worked. Leadership is transparent, the mission is real, and
                you can see the impact of your work every week." — Senior Engineer, Gravity (2025)
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Based on 38 verified employee reviews on Glassdoor.
              </p>
            </div>
          </FadeIn>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--bg)',
            borderTop: '1px solid var(--border)',
            padding: '80px 24px',
            textAlign: 'center',
          }}
        >
          <FadeIn>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: 14,
              }}
            >
              Gravity Careers · Trackalways Jobs
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: 14,
              }}
            >
              Don`t See Your Role?`
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                maxWidth: 480,
                margin: '0 auto 32px',
                lineHeight: 1.75,
              }}
            >
              We hire for talent and attitude as much as specific skills. If you believe in our
              mission and think you can make Gravity better, we want to hear from you.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              <a
                href="mailto:careers@trackalways.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--gold)',
                  color: '#000',
                  padding: '14px 28px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: 'none',
                }}
              >
                <Mail size={16} />
                Send Us Your CV
              </a>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  padding: '14px 28px',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: 'none',
                  border: '1px solid var(--border-strong)',
                }}
              >
                <ArrowLeft size={15} />
                Back to Gravity Home
              </Link>
            </div>
            <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              careers@trackalways.com — we respond to every application within 5 business days.
            </p>
          </FadeIn>
        </section>
      </main>

      <Footer />
    </>
  );
}
