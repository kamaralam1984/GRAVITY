'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Tag,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Twitter,
  Linkedin,
  FileText,
  Eye,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { buildPersonSchema, buildBreadcrumbSchema } from '@/lib/seo/schemas';

/* ── Post data ──────────────────────────────────────────────────────────────── */
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
  gradientHex: [string, string];
}

const ALL_POSTS: PostMeta[] = [
  {
    id: 1,
    slug: 'geofencing-101-how-virtual-boundaries-keep-your-kids-safer',
    title: 'Geofencing 101: How Virtual Boundaries Keep Your Kids Safer',
    category: 'Safety',
    categorySlug: 'safety',
    excerpt:
      "Geofencing transforms an invisible digital perimeter into a powerful parenting tool. When your child steps beyond a set boundary — school gates, the neighbourhood park, a friend's building — you receive an instant notification.",
    author: 'Priya Sharma',
    authorSlug: 'priya-sharma',
    date: 'June 2, 2025',
    readTime: '5 min read',
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
    gradientHex: ['#14B8A6', '#22D3EE'],
  },
];

/* ── Author data ────────────────────────────────────────────────────────────── */
interface Author {
  slug: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  colorHex: string;
  shortBio: string;
  longBio: string;
  expertise: string[];
  twitter: string;
  linkedin: string;
  totalReads: string;
  avgReadTime: string;
}

const AUTHORS: Author[] = [
  {
    slug: 'priya-sharma',
    name: 'Priya Sharma',
    role: 'Family Safety Expert',
    initials: 'PS',
    color: 'linear-gradient(135deg, #3B82F6, #22D3EE)',
    colorHex: '#3B82F6',
    shortBio:
      'Priya has spent eight years researching child safety technology and its impact on Indian families. A mother of two and former child welfare officer with the Maharashtra government.',
    longBio:
      "Priya Sharma brings both professional expertise and lived experience to every article she writes. After seven years as a child welfare officer with the Maharashtra Department of Women and Child Development, she transitioned into technology journalism with a singular focus: helping Indian families use digital tools to create safer, less anxious homes.\n\nShe holds a Master's degree in Child Development from SNDT Women's University Mumbai, and her research has been cited in Maharashtra state policy documents on child safety. As a mother of two school-age children in Pune, she tests every feature she writes about in her own family's daily life.\n\nPriya is a sought-after speaker at parenting conferences across India and contributes regularly to national publications on the intersection of technology, safety, and child psychology. Her philosophy is simple: the best safety technology is the kind that becomes invisible — so reliable and non-intrusive that families stop thinking about it as technology and start thinking of it as trust.",
    expertise: ['Child Safety', 'Geofencing', 'SOS Alerts', 'Family Consent Models', 'Urban Parenting'],
    twitter: 'https://twitter.com/kvlbusinesssolutions',
    linkedin: 'https://linkedin.com/company/kvlbusinesssolutions',
    totalReads: '24K',
    avgReadTime: '4.5 min',
  },
  {
    slug: 'dr-ananya-mehta',
    name: 'Dr. Ananya Mehta',
    role: 'Child Psychologist',
    initials: 'AM',
    color: 'linear-gradient(135deg, #A855F7, #F472B6)',
    colorHex: '#A855F7',
    shortBio:
      'Dr. Ananya Mehta is a clinical child psychologist with a PhD from NIMHANS Bengaluru and over a decade of practice working with children and families across urban India.',
    longBio:
      "Dr. Ananya Mehta completed her PhD in Clinical Psychology from the National Institute of Mental Health and Neurosciences (NIMHANS), Bengaluru, where her doctoral thesis examined the relationship between parental anxiety and adolescent autonomy development in Indian urban families. She subsequently completed a fellowship in Child and Adolescent Psychiatry at AIIMS New Delhi.\n\nIn her clinical practice, Dr. Mehta sees families across a wide spectrum of socioeconomic backgrounds, and has observed first-hand how the anxiety of not knowing where children are manifests in family dynamics, marital stress, and children's own sense of security. This observation led her to research how location-sharing technology, when implemented with psychological principles in mind, can become a therapeutic tool rather than a surveillance device.\n\nShe serves on the advisory board of the Indian Association of Child and Adolescent Mental Health and is a consultant to several EdTech and family safety startups on the psychological dimensions of their products. She writes for the KVL Track Journal to bridge the gap between clinical research and practical parenting guidance.",
    expertise: ['Child Psychology', 'Adolescent Development', 'Parental Anxiety', 'Elder Cognition', 'Family Dynamics'],
    twitter: 'https://twitter.com/kvlbusinesssolutions',
    linkedin: 'https://linkedin.com/company/kvlbusinesssolutions',
    totalReads: '41K',
    avgReadTime: '7.5 min',
  },
  {
    slug: 'rahul-verma',
    name: 'Rahul Verma',
    role: 'Tech Writer',
    initials: 'RV',
    color: 'linear-gradient(135deg, #22C55E, #34D399)',
    colorHex: '#22C55E',
    shortBio:
      'Rahul Verma is a technology journalist who has spent a decade demystifying complex consumer technology for everyday Indian audiences, with a focus on safety technology.',
    longBio:
      "Rahul Verma spent ten years as a technology journalist, including five years as a senior editor at India's leading consumer technology publication, before pivoting to focus exclusively on the intersection of technology and family safety. During his journalism career, he covered everything from smartphone launches to enterprise cybersecurity, but found his most meaningful work in explaining complex technical concepts to non-technical audiences.\n\nHis interest in location technology began with a personal experience: his elderly father was diagnosed with early-stage dementia, and Rahul spent months researching the technical landscape of tracking solutions before settling on one that balanced accuracy, battery life, and dignity. That experience made him realise how poorly the technical realities of location technology are understood by the people who need it most.\n\nRahul holds a degree in Computer Science from BITS Pilani and a Post-Graduate Diploma in Journalism from the Asian College of Journalism, Chennai. He lives in Bengaluru with his wife and their young son, and he brings both his technical background and his role as a parent to every article he writes for the KVL Track Journal.",
    expertise: ['GPS Technology', 'Sensor Fusion', 'Battery Optimisation', 'Consumer Tech', 'Privacy Engineering'],
    twitter: 'https://twitter.com/kvlbusinesssolutions',
    linkedin: 'https://linkedin.com/company/kvlbusinesssolutions',
    totalReads: '18K',
    avgReadTime: '6 min',
  },
  {
    slug: 'kavitha-krishnan',
    name: 'Kavitha Krishnan',
    role: 'Health & Wellness Writer',
    initials: 'KK',
    color: 'linear-gradient(135deg, #EAB308, #FBBF24)',
    colorHex: '#EAB308',
    shortBio:
      'Kavitha Krishnan is a health and wellness writer with a background in public health policy who has reported on digital health initiatives across South Asia for over seven years.',
    longBio:
      "Kavitha Krishnan began her career as a public health policy analyst at the National Health Systems Resource Centre in New Delhi, where she worked on maternal and child health programme evaluation across five states. This grounding in evidence-based public health gave her a rigorous, data-first approach that distinguishes her writing from the wellness content landscape.\n\nAfter transitioning to journalism, she spent five years covering digital health for a pan-Asian publication, reporting on telemedicine rollouts, health app regulation, and the growing intersection of consumer technology and clinical outcomes. She is particularly interested in how digital tools can serve populations that traditional healthcare systems have historically underserved — rural elderly, migrant workers, and families separated by urban migration.\n\nKavitha's approach to privacy and data governance is informed by her policy background. She was one of the first Indian health journalists to report in depth on the implications of the DPDP Act 2023 for health and safety applications, and she serves as an informal advisor to several startups on navigating the regulatory landscape. She holds a Master of Public Health from the Public Health Foundation of India.",
    expertise: ['Digital Health', 'DPDP Compliance', 'Privacy Policy', 'Health Data', 'Public Health'],
    twitter: 'https://twitter.com/kvlbusinesssolutions',
    linkedin: 'https://linkedin.com/company/kvlbusinesssolutions',
    totalReads: '12K',
    avgReadTime: '5 min',
  },
  {
    slug: 'arjun-patel',
    name: 'Arjun Patel',
    role: 'Road Safety Analyst',
    initials: 'AP',
    color: 'linear-gradient(135deg, #F97316, #EF4444)',
    colorHex: '#F97316',
    shortBio:
      "Arjun Patel is a road safety researcher and policy analyst based in New Delhi, with experience at the National Road Safety Council and several road safety NGOs.",
    longBio:
      "Arjun Patel has dedicated his career to understanding and reducing the human cost of road accidents in India — a country that accounts for over 11% of global road accident deaths despite having only 1% of the world's vehicles. He worked for four years as a researcher at the National Road Safety Council, contributing to the National Road Safety Policy and India's implementation of the Decade of Action for Road Safety.\n\nHe subsequently joined iRAP (the International Road Assessment Programme) as a country analyst for India and Sri Lanka, conducting safety assessments of highway corridors and working with state governments on infrastructure intervention prioritisation. In parallel, he has worked with several NGOs on driver behaviour programmes, particularly focusing on distracted driving, fatigue detection, and the role of mobile phones in accident causation.\n\nArjun became interested in family safety technology after observing that crash detection and automatic emergency notification systems — standard in premium European vehicles — were virtually unavailable to the vast majority of Indian road users. He writes for the KVL Track Journal to help Indian families understand how smartphone-based crash detection can partially bridge this safety gap while India's vehicle safety standards continue to evolve.",
    expertise: ['Road Safety', 'Crash Detection', 'Accident Statistics', 'Emergency Response', 'Driver Behaviour'],
    twitter: 'https://twitter.com/kvlbusinesssolutions',
    linkedin: 'https://linkedin.com/company/kvlbusinesssolutions',
    totalReads: '9K',
    avgReadTime: '5.5 min',
  },
  {
    slug: 'sunita-agarwal',
    name: 'Sunita Agarwal',
    role: 'Elder Care Advocate',
    initials: 'SA',
    color: 'linear-gradient(135deg, #14B8A6, #22D3EE)',
    colorHex: '#14B8A6',
    shortBio:
      "Sunita Agarwal is an elder care advocate and social worker who has worked with ageing populations across India for fifteen years, with a personal and professional focus on technology-assisted independent living.",
    longBio:
      "Sunita Agarwal's journey into elder care advocacy began not in a classroom but in a moment of crisis: her own mother, living alone in Jaipur while Sunita worked in Mumbai, fell at home and was not found for over three hours. The experience was transformative. Sunita left her corporate human resources career to complete a Master's degree in Social Work with a specialisation in Gerontology at the Tata Institute of Social Sciences.\n\nOver the following fifteen years, she built a career at the intersection of social work, policy advocacy, and technology. She has consulted for state governments on elder care programme design, worked with HelpAge India on their digital literacy initiatives for seniors, and served as a resource person for the Ministry of Social Justice and Empowerment's National Policy for Senior Citizens review process.\n\nSunita is a fierce advocate for elder dignity in technology design. She consults with technology companies — including KVL Track — to ensure that products designed for elderly users are genuinely usable by elderly users, not just by their adult children. Her central argument: technology that infantilises elders creates resistance and non-adoption; technology that respects their agency creates partnership. She lives in Delhi with her husband and their teenage son, and speaks regularly at gerontology conferences across South Asia.",
    expertise: ['Elder Care', 'Gerontology', 'Dignity-First Design', 'Fall Detection', 'Independent Living'],
    twitter: 'https://twitter.com/kvlbusinesssolutions',
    linkedin: 'https://linkedin.com/company/kvlbusinesssolutions',
    totalReads: '15K',
    avgReadTime: '6.5 min',
  },
];

const AUTHOR_MAP = Object.fromEntries(AUTHORS.map((a) => [a.slug, a]));

/* ── FadeIn ──────────────────────────────────────────────────────────────────── */
function FadeIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/* ── Parse read time to number ──────────────────────────────────────────────── */
function parseMinutes(readTime: string): number {
  const match = readTime.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 5;
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function AuthorPage({ params }: { params: { slug: string } }) {
  const author = AUTHOR_MAP[params.slug];
  if (!author) notFound();

  const authorPosts = ALL_POSTS.filter((p) => p.authorSlug === params.slug);
  const totalReads = parseInt(author.totalReads.replace('K', '000'), 10);
  const avgMin = parseMinutes(author.avgReadTime);

  const otherAuthors = AUTHORS.filter((a) => a.slug !== params.slug).slice(0, 4);

  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <>
      <JsonLd data={buildPersonSchema({ name: author.name, slug: author.slug, bio: author.shortBio, role: author.role })} />
      <JsonLd data={buildBreadcrumbSchema([{name:'Home',url:'https://gravity.kvlbusinesssolutions.com'},{name:'Blog',url:'https://gravity.kvlbusinesssolutions.com/blog'},{name:author.name,url:'https://gravity.kvlbusinesssolutions.com/blog/authors/'+author.slug}])} />
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
                {author.name}
              </span>
            </nav>
          </div>
        </div>

        {/* ── Author Hero ───────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            padding: '80px 24px 72px',
          }}
        >
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 32,
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                {/* Large avatar */}
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: author.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 32,
                    flexShrink: 0,
                    boxShadow: `0 0 60px ${author.colorHex}30`,
                  }}
                >
                  {author.initials}
                </div>

                {/* Author info */}
                <div style={{ flex: 1, minWidth: 240 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: `rgba(var(--gold-rgb), 0.1)`,
                      border: `1px solid rgba(var(--gold-rgb), 0.3)`,
                      color: 'var(--gold)',
                      borderRadius: 999,
                      padding: '4px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: 14,
                    }}
                  >
                    <User size={11} />
                    Author
                  </span>

                  <h1
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      lineHeight: 1.15,
                      marginBottom: 8,
                    }}
                  >
                    {author.name}
                  </h1>

                  <p
                    style={{
                      fontSize: '1rem',
                      color: author.colorHex,
                      fontWeight: 600,
                      marginBottom: 16,
                    }}
                  >
                    {author.role}
                  </p>

                  <p
                    style={{
                      fontSize: '1rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.8,
                      marginBottom: 20,
                      maxWidth: 560,
                    }}
                  >
                    {author.shortBio}
                  </p>

                  {/* Social links */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <a
                      href={author.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: 'rgba(29,161,242,0.1)',
                        border: '1px solid rgba(29,161,242,0.3)',
                        color: '#1DA1F2',
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.75')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')
                      }
                    >
                      <Twitter size={13} />
                      Twitter
                    </a>
                    <a
                      href={author.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: 'rgba(10,102,194,0.1)',
                        border: '1px solid rgba(10,102,194,0.3)',
                        color: '#0A66C2',
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.75')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')
                      }
                    >
                      <Linkedin size={13} />
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>

              {/* Stats bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16,
                  marginTop: 40,
                  borderTop: '1px solid var(--border)',
                  paddingTop: 32,
                }}
              >
                <div
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '20px 24px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <FileText size={16} style={{ color: 'var(--gold)' }} />
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.8rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      lineHeight: 1,
                      marginBottom: 4,
                    }}
                  >
                    {authorPosts.length}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                    Total Articles
                  </p>
                </div>
                <div
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '20px 24px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <Eye size={16} style={{ color: 'var(--gold)' }} />
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.8rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      lineHeight: 1,
                      marginBottom: 4,
                    }}
                  >
                    {author.totalReads}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                    Total Reads
                  </p>
                </div>
                <div
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '20px 24px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <Clock size={16} style={{ color: 'var(--gold)' }} />
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.8rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      lineHeight: 1,
                      marginBottom: 4,
                    }}
                  >
                    {avgMin}m
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                    Avg Read Time
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── About the Author ──────────────────────────────────────────────── */}
        <section style={{ background: 'var(--bg)', padding: '72px 24px' }}>
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) 300px',
              gap: 48,
              alignItems: 'start',
            }}
          >
            {/* Extended bio */}
            <FadeIn>
              <div>
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
                  About the Author
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: 28,
                  }}
                >
                  {author.name}
                </h2>

                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: '36px 40px',
                  }}
                >
                  {author.longBio.split('\n\n').map((paragraph, i) => (
                    <p
                      key={i}
                      style={{
                        color: 'var(--text-secondary)',
                        lineHeight: 1.85,
                        fontSize: '1rem',
                        marginBottom: i < author.longBio.split('\n\n').length - 1 ? 20 : 0,
                      }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Expertise sidebar */}
            <FadeIn delay={0.12}>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '24px 20px',
                  position: 'sticky',
                  top: 100,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: 16,
                  }}
                >
                  Areas of Expertise
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {author.expertise.map((item) => (
                    <div
                      key={item}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: author.colorHex,
                          flexShrink: 0,
                        }}
                      />
                      {item}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 20,
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      marginBottom: 12,
                    }}
                  >
                    Connect
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a
                      href={author.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        padding: '8px',
                        borderRadius: 8,
                        background: 'rgba(29,161,242,0.08)',
                        border: '1px solid rgba(29,161,242,0.25)',
                        color: '#1DA1F2',
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.7')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')
                      }
                    >
                      <Twitter size={12} />
                      Twitter
                    </a>
                    <a
                      href={author.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        padding: '8px',
                        borderRadius: 8,
                        background: 'rgba(10,102,194,0.08)',
                        border: '1px solid rgba(10,102,194,0.25)',
                        color: '#0A66C2',
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.7')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')
                      }
                    >
                      <Linkedin size={12} />
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── Author's articles ─────────────────────────────────────────────── */}
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
                Published Work
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
                Articles by {author.name.split(' ')[0]}
              </h2>
            </FadeIn>

            {authorPosts.length === 0 ? (
              <FadeIn>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '60px 24px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                  }}
                >
                  <BookOpen
                    size={36}
                    style={{ color: 'var(--text-muted)', marginBottom: 12 }}
                  />
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                    Articles by {author.name} coming soon.
                  </p>
                </div>
              </FadeIn>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: 24,
                }}
              >
                {authorPosts.map((post, i) => (
                  <FadeIn key={post.id} delay={i * 0.07}>
                    <Link
                      href={`/blog/${post.slug}`}
                      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                    >
                      <article
                        style={{
                          background: 'var(--bg)',
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
                            height: 5,
                            background: `linear-gradient(90deg, ${post.gradientHex[0]}, ${post.gradientHex[1]})`,
                          }}
                        />

                        <div
                          style={{
                            padding: '24px 24px 20px',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <Link
                            href={`/blog/category/${post.categorySlug}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              background: 'rgba(var(--primary-rgb),0.08)',
                              border: '1px solid rgba(var(--primary-rgb),0.2)',
                              color: 'var(--primary-light)',
                              borderRadius: 999,
                              padding: '3px 12px',
                              fontSize: 11,
                              fontWeight: 700,
                              marginBottom: 12,
                              width: 'fit-content',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              textDecoration: 'none',
                            }}
                          >
                            <Tag size={10} />
                            {post.category}
                          </Link>

                          <h3
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              lineHeight: 1.4,
                              marginBottom: 10,
                              flex: 1,
                            }}
                          >
                            {post.title}
                          </h3>

                          <p
                            style={{
                              color: 'var(--text-muted)',
                              fontSize: '0.87rem',
                              lineHeight: 1.7,
                              marginBottom: 16,
                            }}
                          >
                            {post.excerpt}
                          </p>

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderTop: '1px solid var(--border)',
                              paddingTop: 14,
                              flexWrap: 'wrap',
                              gap: 8,
                            }}
                          >
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {post.date}
                            </span>
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                fontSize: 12,
                                color: 'var(--gold)',
                                fontWeight: 600,
                              }}
                            >
                              <Clock size={11} />
                              {post.readTime}
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Related authors ───────────────────────────────────────────────── */}
        <section style={{ background: 'var(--bg)', padding: '72px 24px' }}>
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
                Meet the Team
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
                Other Contributors
              </h2>
            </FadeIn>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 20,
              }}
            >
              {otherAuthors.map((other, i) => {
                const otherPosts = ALL_POSTS.filter((p) => p.authorSlug === other.slug);
                return (
                  <FadeIn key={other.slug} delay={i * 0.07}>
                    <Link
                      href={`/blog/authors/${other.slug}`}
                      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                    >
                      <div
                        style={{
                          background: 'var(--bg-surface)',
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
                            `${other.colorHex}50`;
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: '50%',
                              background: other.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: 17,
                              flexShrink: 0,
                            }}
                          >
                            {other.initials}
                          </div>
                          <div>
                            <p
                              style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.97rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                marginBottom: 2,
                              }}
                            >
                              {other.name}
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                color: other.colorHex,
                                fontWeight: 600,
                              }}
                            >
                              {other.role}
                            </p>
                          </div>
                        </div>

                        <p
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.65,
                            flex: 1,
                          }}
                        >
                          {other.shortBio.substring(0, 120)}...
                        </p>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: 12,
                            borderTop: '1px solid var(--border)',
                          }}
                        >
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {otherPosts.length} article{otherPosts.length !== 1 ? 's' : ''}
                          </span>
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              fontSize: 12,
                              fontWeight: 600,
                              color: other.colorHex,
                            }}
                          >
                            View Profile <ChevronRight size={12} />
                          </span>
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
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
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
              The KVL Track Journal
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
              Explore All Articles
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                maxWidth: 400,
                margin: '0 auto 28px',
                lineHeight: 1.75,
                fontSize: '0.95rem',
              }}
            >
              Family safety, modern parenting, and connected living — all in one place.
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
              Browse All Articles <ArrowRight size={14} />
            </Link>
          </FadeIn>
        </section>
      </main>

      <Footer />
    </>
  );
}
