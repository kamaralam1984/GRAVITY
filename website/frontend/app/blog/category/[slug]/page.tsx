'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  User,
  Tag,
  Shield,
  Brain,
  Cpu,
  Heart,
  Building2,
  BookOpen,
  ChevronRight,
  ArrowRight,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { buildBreadcrumbSchema } from '@/lib/seo/schemas';

/* ── Types ──────────────────────────────────────────────────────────────────── */
interface PostMeta {
  id: number;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  excerpt: string;
  author: string;
  authorSlug: string;
  date: string;
  readTime: string;
  gradient: string;
  gradientHex: [string, string];
}

/* ── All posts data ─────────────────────────────────────────────────────────── */
const ALL_POSTS: PostMeta[] = [
  {
    id: 1,
    slug: 'geofencing-101-how-virtual-boundaries-keep-your-kids-safer',
    title: 'Geofencing 101: How Virtual Boundaries Keep Your Kids Safer',
    category: 'Safety',
    categorySlug: 'safety',
    excerpt:
      "Geofencing transforms an invisible digital perimeter into a powerful parenting tool. When your child steps beyond a set boundary — school gates, the neighbourhood park, a friend's building — you receive an instant notification. No constant checking, no frantic calls.",
    author: 'Priya Sharma',
    authorSlug: 'priya-sharma',
    date: 'June 2, 2025',
    readTime: '5 min read',
    gradient: 'from-blue-500 to-cyan-400',
    gradientHex: ['#3B82F6', '#22D3EE'],
  },
  {
    id: 2,
    slug: 'the-psychology-of-family-safety-why-anxiety-goes-down-when-everyone-is-trackable',
    title: 'The Psychology of Family Safety: Why Anxiety Goes Down When Everyone Is Trackable',
    category: 'Parenting',
    categorySlug: 'parenting',
    excerpt:
      'Counter-intuitively, knowing where your loved ones are does not create helicopter parenting — it enables healthy independence. A 2024 study found parents who used real-time family location apps reported 34% lower anxiety scores.',
    author: 'Dr. Ananya Mehta',
    authorSlug: 'dr-ananya-mehta',
    date: 'May 28, 2025',
    readTime: '8 min read',
    gradient: 'from-purple-500 to-pink-400',
    gradientHex: ['#A855F7', '#F472B6'],
  },
  {
    id: 3,
    slug: 'gps-vs-cell-tower-tracking-what-every-parent-should-know',
    title: 'GPS vs Cell Tower Tracking: What Every Parent Should Know',
    category: 'Technology',
    categorySlug: 'technology',
    excerpt:
      "Not all location data is created equal. GPS delivers sub-5-metre accuracy but drains battery and struggles indoors. KVL Track's hybrid engine fuses GPS, cell towers, and Wi-Fi to always deliver the best available fix.",
    author: 'Rahul Verma',
    authorSlug: 'rahul-verma',
    date: 'May 20, 2025',
    readTime: '6 min read',
    gradient: 'from-green-500 to-emerald-400',
    gradientHex: ['#22C55E', '#34D399'],
  },
  {
    id: 4,
    slug: 'setting-up-emergency-sos-a-complete-guide-for-indian-families',
    title: 'Setting Up Emergency SOS: A Complete Guide for Indian Families',
    category: 'Safety',
    categorySlug: 'safety',
    excerpt:
      'India saw over 3.7 lakh road accidents in 2023 alone. When seconds matter, a single SOS press in KVL Track broadcasts your exact GPS coordinates and a live location link to every member of your family circle simultaneously.',
    author: 'Priya Sharma',
    authorSlug: 'priya-sharma',
    date: 'May 14, 2025',
    readTime: '4 min read',
    gradient: 'from-red-500 to-orange-400',
    gradientHex: ['#EF4444', '#FB923C'],
  },
  {
    id: 5,
    slug: 'how-gravity-protects-your-privacy-while-keeping-families-safe',
    title: 'How KVL Track Protects Your Privacy While Keeping Families Safe',
    category: 'Company',
    categorySlug: 'company',
    excerpt:
      'Privacy and safety are not opposites — they are partners. KVL Track is built on a consent-first model: nobody is tracked without explicit opt-in and location history is encrypted using AES-256.',
    author: 'Kavitha Krishnan',
    authorSlug: 'kavitha-krishnan',
    date: 'May 7, 2025',
    readTime: '5 min read',
    gradient: 'from-yellow-500 to-amber-400',
    gradientHex: ['#EAB308', '#FBBF24'],
  },
  {
    id: 6,
    slug: 'senior-care-at-a-distance-how-tech-is-helping-adult-children-stay-connected',
    title: 'Senior Care at a Distance: How Tech Is Helping Adult Children Stay Connected',
    category: 'Health',
    categorySlug: 'health',
    excerpt:
      "Forty per cent of India's elderly population lives apart from their adult children. KVL Track's Elder Circle feature gives ageing parents a dignified way to share their location and summon help in a medical emergency.",
    author: 'Dr. Ananya Mehta',
    authorSlug: 'dr-ananya-mehta',
    date: 'April 30, 2025',
    readTime: '7 min read',
    gradient: 'from-teal-500 to-cyan-400',
    gradientHex: ['#14B8A6', '#22D3EE'],
  },
];

/* ── Category config ─────────────────────────────────────────────────────────── */
interface CategoryConfig {
  slug: string;
  display: string;
  description: string;
  icon: React.ReactNode;
  iconLarge: React.ReactNode;
  color: string;
  colorHex: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    slug: 'safety',
    display: 'Safety',
    description:
      'Practical guides on geofencing, SOS alerts, crash detection, and every feature that keeps your family safe in an unpredictable world.',
    icon: <Shield size={14} />,
    iconLarge: <Shield size={40} />,
    color: 'from-blue-500 to-cyan-400',
    colorHex: '#3B82F6',
  },
  {
    slug: 'parenting',
    display: 'Parenting',
    description:
      'Research-backed insights on raising confident, independent children in the digital age — without sacrificing peace of mind.',
    icon: <Brain size={14} />,
    iconLarge: <Brain size={40} />,
    color: 'from-purple-500 to-pink-400',
    colorHex: '#A855F7',
  },
  {
    slug: 'technology',
    display: 'Technology',
    description:
      'Deep dives into GPS, cell towers, Wi-Fi positioning, encryption, and all the technology that powers KVL Track under the hood.',
    icon: <Cpu size={14} />,
    iconLarge: <Cpu size={40} />,
    color: 'from-green-500 to-emerald-400',
    colorHex: '#22C55E',
  },
  {
    slug: 'health',
    display: 'Health',
    description:
      'How technology supports elder care, wellness monitoring, and the physical and mental health of every generation in your family.',
    icon: <Heart size={14} />,
    iconLarge: <Heart size={40} />,
    color: 'from-teal-500 to-cyan-400',
    colorHex: '#14B8A6',
  },
  {
    slug: 'company',
    display: 'Company',
    description:
      'Updates from the KVL Track team — product announcements, privacy commitments, engineering deep dives, and our vision for the future.',
    icon: <Building2 size={14} />,
    iconLarge: <Building2 size={40} />,
    color: 'from-yellow-500 to-amber-400',
    colorHex: '#EAB308',
  },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

/* ── FadeIn ──────────────────────────────────────────────────────────────────── */
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

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = CATEGORY_MAP[params.slug];
  if (!category) notFound();

  const posts = ALL_POSTS.filter((p) => p.categorySlug === params.slug);
  const relatedCategories = CATEGORIES.filter((c) => c.slug !== params.slug);

  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([{name:'Home',url:'https://gravity.trackalways.com'},{name:'Blog',url:'https://gravity.trackalways.com/blog'},{name:category.display,url:'https://gravity.trackalways.com/blog/category/'+params.slug}])} />
      <Navbar />

      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px' }}>
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: 'var(--text-muted)',
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/"
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)')
                }
              >
                <ArrowLeft size={13} />
                Home
              </Link>
              <ChevronRight size={12} />
              <Link
                href="/blog"
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)')
                }
              >
                Blog
              </Link>
              <ChevronRight size={12} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                {category.display}
              </span>
            </nav>
          </div>
        </div>

        {/* ── Category Hero ─────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            padding: '80px 24px 72px',
          }}
        >
          <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {/* Large icon */}
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: `${category.colorHex}18`,
                  border: `1px solid ${category.colorHex}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 28px',
                  color: category.colorHex,
                  boxShadow: `0 0 60px ${category.colorHex}20`,
                }}
              >
                {category.iconLarge}
              </div>

              {/* Label */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: `rgba(var(--gold-rgb), 0.1)`,
                  border: `1px solid rgba(var(--gold-rgb), 0.3)`,
                  color: 'var(--gold)',
                  borderRadius: 999,
                  padding: '5px 16px',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 20,
                }}
              >
                <BookOpen size={12} />
                Category
              </span>

              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.15,
                  marginBottom: 16,
                }}
              >
                {category.display}
              </h1>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.8,
                  maxWidth: 560,
                  margin: '0 auto 24px',
                }}
              >
                {category.description}
              </p>

              {/* Article count badge */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  borderRadius: 999,
                  padding: '6px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <Layers size={13} />
                {posts.length} article{posts.length !== 1 ? 's' : ''} in this category
              </span>
            </motion.div>
          </div>
        </section>

        {/* ── Posts grid ────────────────────────────────────────────────────── */}
        <section style={{ background: 'var(--bg)', padding: '72px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {posts.length === 0 ? (
              <FadeIn>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '80px 24px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'rgba(var(--gold-rgb),0.08)',
                      border: '1px solid rgba(var(--gold-rgb),0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: 'var(--gold)',
                    }}
                  >
                    <BookOpen size={28} />
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: 8,
                    }}
                  >
                    No articles yet
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                    We are working on {category.display.toLowerCase()} content. Check back soon.
                  </p>
                  <Link
                    href="/blog"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 20,
                      background: 'var(--gold)',
                      color: '#000',
                      padding: '10px 24px',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 13,
                      textDecoration: 'none',
                    }}
                  >
                    Browse All Articles <ArrowRight size={13} />
                  </Link>
                </div>
              </FadeIn>
            ) : (
              <>
                <FadeIn>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--gold)',
                      marginBottom: 8,
                    }}
                  >
                    All {category.display} Articles
                  </p>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginBottom: 36,
                    }}
                  >
                    {posts.length} Article{posts.length !== 1 ? 's' : ''} on {category.display}
                  </h2>
                </FadeIn>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: 28,
                  }}
                >
                  {posts.map((post, i) => (
                    <FadeIn key={post.id} delay={i * 0.07}>
                      <Link
                        href={`/blog/${post.slug}`}
                        style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                      >
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
                            (e.currentTarget as HTMLElement).style.borderColor =
                              'rgba(var(--gold-rgb),0.4)';
                            (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                          }}
                        >
                          {/* Color banner */}
                          <div
                            style={{
                              height: 6,
                              background: `linear-gradient(90deg, ${post.gradientHex[0]}, ${post.gradientHex[1]})`,
                            }}
                          />

                          <div
                            style={{
                              padding: '28px 28px 24px',
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
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
                      </Link>
                    </FadeIn>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Related categories ────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            padding: '72px 24px',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <FadeIn>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  marginBottom: 8,
                }}
              >
                Explore More
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: 36,
                }}
              >
                Other Categories
              </h2>
            </FadeIn>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              {relatedCategories.map((cat, i) => {
                const catPosts = ALL_POSTS.filter((p) => p.categorySlug === cat.slug);
                return (
                  <FadeIn key={cat.slug} delay={i * 0.06}>
                    <Link
                      href={`/blog/category/${cat.slug}`}
                      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                    >
                      <div
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 14,
                          padding: '24px 20px',
                          height: '100%',
                          transition: 'border-color 0.2s, transform 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            `${cat.colorHex}50`;
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: `${cat.colorHex}18`,
                            border: `1px solid ${cat.colorHex}35`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: cat.colorHex,
                          }}
                        >
                          {cat.icon}
                        </div>
                        <div>
                          <p
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              marginBottom: 4,
                            }}
                          >
                            {cat.display}
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              color: 'var(--text-muted)',
                            }}
                          >
                            {catPosts.length} article{catPosts.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div
                          style={{
                            marginTop: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            color: cat.colorHex,
                          }}
                        >
                          Browse <ChevronRight size={12} />
                        </div>
                      </div>
                    </Link>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Back to blog CTA ──────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--bg)',
            padding: '64px 24px',
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
                marginBottom: 12,
              }}
            >
              All Topics
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: 12,
              }}
            >
              The KVL Track Journal
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                maxWidth: 440,
                margin: '0 auto 28px',
                lineHeight: 1.75,
                fontSize: '0.95rem',
              }}
            >
              Insights on family safety, modern parenting, connected living, and the technology
              that brings loved ones closer.
            </p>
            <Link
              href="/blog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--gold)',
                color: '#000',
                padding: '13px 30px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              View All Articles <ArrowRight size={14} />
            </Link>
          </FadeIn>
        </section>
      </main>

      <Footer />
    </>
  );
}
