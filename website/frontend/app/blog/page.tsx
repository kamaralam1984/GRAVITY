'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  User,
  Tag,
  Mail,
  ArrowRight,
  BookOpen,
  Shield,
  Brain,
  Cpu,
  Heart,
  Building2,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/* ── Types ───────────────────────────────────────────────────────────────────── */
type Category = 'All' | 'Safety' | 'Parenting' | 'Technology' | 'Health' | 'Company';

/* ── Category config ─────────────────────────────────────────────────────────── */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  All: <BookOpen size={14} />,
  Safety: <Shield size={14} />,
  Parenting: <Brain size={14} />,
  Technology: <Cpu size={14} />,
  Health: <Heart size={14} />,
  Company: <Building2 size={14} />,
};

const CATEGORIES: Category[] = ['All', 'Safety', 'Parenting', 'Technology', 'Health', 'Company'];

/* ── Blog posts ──────────────────────────────────────────────────────────────── */
const POSTS = [
  {
    id: 1,
    title: 'Geofencing 101: How Virtual Boundaries Keep Your Kids Safer',
    category: 'Safety' as Category,
    excerpt:
      `Geofencing transforms an invisible digital perimeter into a powerful parenting tool. When your child steps beyond a set boundary — school gates, the neighbourhood park, a friend\'s building — you receive an instant notification. No constant checking, no frantic calls. This guide walks through how to configure smart zones inside Gravity, understand the difference between entry and exit alerts, and avoid alert fatigue by nesting zones intelligently. Real-world examples from Indian urban and suburban families show exactly how this one feature can replace hours of daily anxiety.`,
    author: 'Priya Sharma',
    date: 'June 2, 2025',
    readTime: '5 min read',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    id: 2,
    title: 'The Psychology of Family Safety: Why Anxiety Goes Down When Everyone Is Trackable',
    category: 'Parenting' as Category,
    excerpt:
      'Counter-intuitively, knowing where your loved ones are does not create helicopter parenting — it enables healthy independence. A 2024 study from the University of Delhi found parents who used real-time family location apps reported 34% lower anxiety scores on the State-Trait Anxiety Inventory compared to non-users. When the mental load of uncertainty is lifted, parents grant children more freedom, not less. This article unpacks the neuroscience behind the safety paradox and offers practical tips for using Gravity without crossing into surveillance territory.',
    author: 'Dr. Ananya Mehta',
    date: 'May 28, 2025',
    readTime: '8 min read',
    gradient: 'from-purple-500 to-pink-400',
  },
  {
    id: 3,
    title: 'GPS vs Cell Tower Tracking: What Every Parent Should Know',
    category: 'Technology' as Category,
    excerpt:
      `Not all location data is created equal. GPS delivers sub-5-metre accuracy but drains battery and struggles indoors. Cell tower triangulation is battery-friendly and works inside malls and metro stations, but accuracy can vary between 50 and 300 metres. Wi-Fi positioning bridges the gap in dense urban environments. Gravity\'s hybrid engine fuses all three signals to always deliver the best available fix — switching seamlessly as your family members move through different environments. Learn exactly how each technology works and why the hybrid approach matters for Indian cities.`,
    author: 'Rohan Iyer',
    date: 'May 20, 2025',
    readTime: '6 min read',
    gradient: 'from-green-500 to-emerald-400',
  },
  {
    id: 4,
    title: 'Setting Up Emergency SOS: A Complete Guide for Indian Families',
    category: 'Safety' as Category,
    excerpt:
      'India saw over 3.7 lakh road accidents in 2023 alone. When seconds matter, a single SOS press in Gravity broadcasts your exact GPS coordinates, device battery level, and a live location link to every member of your family circle simultaneously. This step-by-step guide covers adding emergency contacts, customising alert sounds, enabling auto-SOS on crash detection, and the best practices for ensuring elderly parents know how to trigger help even under extreme stress. Screenshots included for every configuration screen.',
    author: 'Priya Sharma',
    date: 'May 14, 2025',
    readTime: '4 min read',
    gradient: 'from-red-500 to-orange-400',
  },
  {
    id: 5,
    title: 'How Gravity Protects Your Privacy While Keeping Families Safe',
    category: 'Company' as Category,
    excerpt:
      'Privacy and safety are not opposites — they are partners. Gravity is built on a consent-first model: nobody is tracked without explicit opt-in, every circle member sees exactly who can view their location, and location history is encrypted at rest and in transit using AES-256. We never sell your data to advertisers, and our servers are hosted in ISO 27001-certified data centres in India to comply with the DPDP Act 2023. This deep dive into our architecture explains how we balance meaningful family visibility with world-class personal privacy protection.',
    author: 'Vikram Nair',
    date: 'May 7, 2025',
    readTime: '5 min read',
    gradient: 'from-gold-500 to-yellow-400',
  },
  {
    id: 6,
    title: 'Senior Care at a Distance: How Tech Is Helping Adult Children Stay Connected',
    category: 'Health' as Category,
    excerpt:
      `Forty per cent of India\'s elderly population lives apart from their adult children, and that number is climbing as urban migration accelerates. Gravity\'s Elder Circle feature gives ageing parents a dignified way to share their location, receive wellness check-ins, and summon help in a medical emergency — all without the stigma of being "monitored." Adult children in Bangalore can see that their parent in Varanasi completed their morning walk, all from a glance at a single screen. This article explores how families across India are using Gravity to bridge the distance without eroding independence.`,
    author: 'Dr. Ananya Mehta',
    date: 'April 30, 2025',
    readTime: '7 min read',
    gradient: 'from-teal-500 to-cyan-400',
  },
];

/* ── Fade-in wrapper ─────────────────────────────────────────────────────────── */
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
export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  const filteredPosts =
    activeCategory === 'All'
      ? POSTS
      : POSTS.filter((p) => p.category === activeCategory);

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
            borderBottom: '1px solid var(--border)',
            padding: '80px 24px 64px',
            textAlign: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ maxWidth: 700, margin: '0 auto' }}
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
                marginBottom: 24,
              }}
            >
              <BookOpen size={13} />
              Editorial
            </span>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              The{' '}
              <span className="gradient-text-gold">Gravity Journal</span>
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
                marginBottom: 0,
              }}
            >
              Insights on family safety, modern parenting, connected living, and the technology
              that brings loved ones closer — wherever they are.
            </p>
          </motion.div>
        </section>

        {/* ── Featured post ──────────────────────────────────────────────────── */}
        <section style={{ background: 'var(--bg)', padding: '64px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <FadeIn>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: 'var(--gold)',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Featured Article
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                }}
              >
                {/* Visual panel */}
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(var(--primary-rgb),0.15) 0%, rgba(var(--gold-rgb),0.12) 100%)',
                    minHeight: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 40,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Decorative blobs */}
                  <div
                    style={{
                      position: 'absolute',
                      top: -40,
                      left: -40,
                      width: 220,
                      height: 220,
                      borderRadius: '50%',
                      background: `rgba(var(--gold-rgb), 0.08)`,
                      filter: 'blur(40px)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -30,
                      right: -30,
                      width: 180,
                      height: 180,
                      borderRadius: '50%',
                      background: `rgba(var(--primary-rgb), 0.1)`,
                      filter: 'blur(36px)',
                    }}
                  />
                  <span
                    style={{
                      display: 'inline-block',
                      background: `rgba(var(--gold-rgb), 0.15)`,
                      border: `1px solid rgba(var(--gold-rgb), 0.35)`,
                      color: 'var(--gold)',
                      borderRadius: 999,
                      padding: '4px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 12,
                      position: 'relative',
                    }}
                  >
                    Family Safety
                  </span>
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text-muted)',
                      position: 'relative',
                    }}
                  >
                    June 10, 2025 &nbsp;·&nbsp; 10 min read
                  </p>
                </div>

                {/* Content panel */}
                <div style={{ padding: '40px 44px' }}>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                      marginBottom: 20,
                    }}
                  >
                    The Hidden Cost of Not Knowing: Why Families Need Real-Time Location Sharing in 2025
                  </h2>

                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      lineHeight: 1.85,
                      fontSize: '0.97rem',
                      marginBottom: 16,
                    }}
                  >
                    Every day, millions of Indian parents send their children off to school, tuition
                    classes, or a friend`s home — and then wait. The phone rings, and for one terrifying`,
                    instant before seeing the caller ID, the stomach drops. That micro-moment of dread,
                    repeated dozens of times a day, is not harmless. Psychologists call it anticipatory
                    anxiety, and research published in the Indian Journal of Psychiatry suggests
                    chronically elevated ambient worry correlates with higher cortisol levels, poorer
                    sleep, and reduced occupational performance in caregivers.
                  </p>

                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      lineHeight: 1.85,
                      fontSize: '0.97rem',
                      marginBottom: 16,
                    }}
                  >
                    India`s cities have grown faster than their safety infrastructure. In Delhi NCR`,
                    alone, the average school commute now spans 8.4 kilometres — a 40% increase
                    since 2015. Meanwhile, NCRB data for 2023 recorded over 1.06 lakh kidnapping and
                    abduction cases nationwide. Against this backdrop, calling "just checking in" every
                    30 minutes is not over-parenting; it is a rational response to genuine uncertainty.
                    But it is also exhausting — for parent and child alike.
                  </p>

                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      lineHeight: 1.85,
                      fontSize: '0.97rem',
                      marginBottom: 28,
                    }}
                  >
                    Real-time location sharing reframes the equation. Instead of 12 check-in calls, a
                    parent gets one glance at Gravity`s live map and knows their teenager arrived safely`,
                    at coaching class. Studies from Stanford`s Human-Computer Interaction Group found`,
                    that passive location awareness reduces the urge to make check-in calls by over 60%,
                    while simultaneously increasing the child`s sense of autonomy. The data is clear:`,
                    families that share location intentionally — with consent, transparency, and
                    boundaries — report stronger trust, not weaker independence.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background:
                          'linear-gradient(135deg, var(--primary) 0%, var(--gold) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      RS
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          margin: 0,
                        }}
                      >
                        Rahul Singhvi
                      </p>
                      <p
                        style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}
                      >
                        Head of Research, Gravity
                      </p>
                    </div>
                    <Link
                      href="/"
                      style={{
                        marginLeft: 'auto',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--gold)',
                        color: '#000',
                        padding: '10px 20px',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: 'none',
                      }}
                    >
                      Read Article <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── Category filter ────────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            padding: '28px 24px',
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginRight: 6,
              }}
            >
              Filter by:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 16px',
                  borderRadius: 999,
                  border:
                    activeCategory === cat
                      ? '1px solid var(--gold)'
                      : '1px solid var(--border)',
                  background:
                    activeCategory === cat
                      ? `rgba(var(--gold-rgb), 0.12)`
                      : 'var(--bg)',
                  color:
                    activeCategory === cat ? 'var(--gold)' : 'var(--text-secondary)',
                  fontWeight: activeCategory === cat ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {CATEGORY_ICONS[cat]}
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ── Post grid ──────────────────────────────────────────────────────── */}
        <section style={{ background: 'var(--bg)', padding: '64px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {filteredPosts.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                No posts in this category yet. Check back soon.
              </p>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: 28,
              }}
            >
              {filteredPosts.map((post, i) => (
                <FadeIn key={post.id} delay={i * 0.07}>
                  <article
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 16,
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'border-color 0.25s, transform 0.25s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        'rgba(var(--gold-rgb),0.4)';
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        'var(--border)';
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Colour banner */}
                    <div
                      style={{
                        height: 6,
                        background: `linear-gradient(90deg, ${post.gradient
                          .replace('from-', '')
                          .replace(' to-', ', ')})`,
                      }}
                    />

                    <div style={{ padding: '28px 28px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Category pill */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          background: `rgba(var(--primary-rgb), 0.08)`,
                          border: `1px solid rgba(var(--primary-rgb), 0.2)`,
                          color: 'var(--primary-light)',
                          borderRadius: 999,
                          padding: '3px 12px',
                          fontSize: 11,
                          fontWeight: 700,
                          marginBottom: 14,
                          width: 'fit-content',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        <Tag size={10} />
                        {post.category}
                      </span>

                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          lineHeight: 1.4,
                          marginBottom: 12,
                        }}
                      >
                        {post.title}
                      </h3>

                      <p
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.88rem',
                          lineHeight: 1.75,
                          flex: 1,
                          marginBottom: 20,
                        }}
                      >
                        {post.excerpt}
                      </p>

                      {/* Meta */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '1px solid var(--border)',
                          paddingTop: 16,
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12,
                            color: 'var(--text-muted)',
                          }}
                        >
                          <User size={12} />
                          <span>{post.author}</span>
                          <span>·</span>
                          <span>{post.date}</span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 12,
                            color: 'var(--gold)',
                            fontWeight: 600,
                          }}
                        >
                          <Clock size={12} />
                          {post.readTime}
                        </div>
                      </div>
                    </div>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Newsletter ─────────────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--bg-surface2)',
            borderTop: '1px solid var(--border)',
            padding: '72px 24px',
          }}
        >
          <FadeIn>
            <div
              style={{
                maxWidth: 560,
                margin: '0 auto',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: `rgba(var(--gold-rgb), 0.12)`,
                  border: `1px solid rgba(var(--gold-rgb), 0.3)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <Mail size={24} style={{ color: 'var(--gold)' }} />
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: 12,
                }}
              >
                Stay in the Loop
              </h2>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.75,
                  marginBottom: 32,
                  fontSize: '0.97rem',
                }}
              >
                Get the latest family safety tips, Gravity product updates, and expert parenting
                insights delivered to your inbox every two weeks. Join 28,000+ families who read
                the Gravity Journal.
              </p>

              <form
                onSubmit={(e) => e.preventDefault()}
                style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  style={{
                    flex: '1 1 240px',
                    padding: '12px 18px',
                    borderRadius: 10,
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'var(--gold)',
                    color: '#000',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  Subscribe <ArrowRight size={14} />
                </button>
              </form>

              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14 }}>
                No spam, ever. Unsubscribe in one click at any time.
              </p>
            </div>
          </FadeIn>
        </section>

        {/* ── Download CTA ───────────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--bg)',
            borderTop: '1px solid var(--border)',
            padding: '72px 24px',
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
              Ready to start?
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: 14,
              }}
            >
              Put Gravity to Work for Your Family
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                maxWidth: 480,
                margin: '0 auto 32px',
                lineHeight: 1.75,
              }}
            >
              Everything you have read here — geofencing, live tracking, SOS, elder care — is
              available in the Gravity app, free to download today.
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--gold)',
                color: '#000',
                padding: '14px 32px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'none',
              }}
            >
              Download Gravity <ArrowRight size={16} />
            </Link>
          </FadeIn>
        </section>
      </main>

      <Footer />
    </>
  );
}
