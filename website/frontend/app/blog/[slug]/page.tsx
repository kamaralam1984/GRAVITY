'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Tag,
  Share2,
  Twitter,
  Linkedin,
  MessageCircle,
  Link2,
  Check,
  Mail,
  ArrowRight,
  ChevronRight,
  BookOpen,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { buildArticleSchema, buildBreadcrumbSchema } from '@/lib/seo/schemas';

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

interface PostContent {
  meta: PostMeta;
  body: React.ReactNode;
}

/* ── Slug helper ─────────────────────────────────────────────────────────────── */
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/* ── Post metadata list ─────────────────────────────────────────────────────── */
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

/* ── FadeIn helper ──────────────────────────────────────────────────────────── */
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

/* ── Article body components ──────────────────────────────────────────────── */
function ArticleH2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(1.35rem, 2.5vw, 1.7rem)',
        fontWeight: 800,
        color: 'var(--text-primary)',
        marginTop: 48,
        marginBottom: 16,
        lineHeight: 1.3,
        scrollMarginTop: 90,
      }}
    >
      {children}
    </h2>
  );
}

function ArticleH3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.1rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginTop: 32,
        marginBottom: 12,
        lineHeight: 1.4,
      }}
    >
      {children}
    </h3>
  );
}

function ArticleP({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        color: 'var(--text-secondary)',
        lineHeight: 1.85,
        fontSize: '1rem',
        marginBottom: 20,
      }}
    >
      {children}
    </p>
  );
}

function ArticleUL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul
      style={{
        paddingLeft: 0,
        listStyle: 'none',
        marginBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            color: 'var(--text-secondary)',
            lineHeight: 1.75,
            fontSize: '1rem',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--gold)',
              flexShrink: 0,
              marginTop: 9,
            }}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Bold({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{children}</strong>;
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <blockquote
      style={{
        borderLeft: '3px solid var(--gold)',
        paddingLeft: 20,
        margin: '28px 0',
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
        fontSize: '1.05rem',
        lineHeight: 1.8,
      }}
    >
      {children}
    </blockquote>
  );
}

/* ── Post body content ──────────────────────────────────────────────────────── */
const POST_BODIES: Record<string, React.ReactNode> = {
  'geofencing-101-how-virtual-boundaries-keep-your-kids-safer': (
    <>
      <ArticleP>
        Imagine receiving a quiet notification on your phone the moment your eight-year-old exits the
        school gate — not a frantic call from the teacher, not a missed bus, not a worried wait at
        home. Just a small, reassuring ping that says: <Bold>She has left school. She is on her way.</Bold>{' '}
        That is geofencing at its simplest, and it is one of the most transformative features in modern
        family safety technology.
      </ArticleP>

      <ArticleH2 id="what-is-geofencing">What Exactly Is Geofencing?</ArticleH2>
      <ArticleP>
        A geofence is a virtual perimeter drawn around a real-world geographic area. Using GPS
        coordinates, the KVL Track app lets you draw a circle, polygon, or custom shape on a map and
        assign it a name — <Bold>Home</Bold>, <Bold>Naina's School</Bold>,{' '}
        <Bold>Grandma's Apartment</Bold>. The moment a family member's device crosses that invisible
        line, you get an instant push notification. No battery-draining constant refresh on your end,
        and no intrusive check-in calls that embarrass your teenager in front of friends.
      </ArticleP>
      <ArticleP>
        Geofences work by continuously comparing a device's GPS position (or cell-tower position
        indoors) against the stored fence polygon. When the device transitions from inside the zone
        to outside — or vice versa — an event fires within seconds. KVL Track's engine is tuned for
        Indian conditions, where GPS signals can be partially obstructed by dense apartment blocks
        and covered flyovers, by fusing GPS with Wi-Fi positioning to reduce missed events to under
        1% in testing.
      </ArticleP>

      <ArticleH2 id="setting-up-zones">Setting Up Your First Zones</ArticleH2>
      <ArticleH3>Start with the Five Core Zones</ArticleH3>
      <ArticleP>
        Most families find that five well-placed zones cover 90% of their daily peace-of-mind needs:
      </ArticleP>
      <ArticleUL
        items={[
          <><Bold>Home</Bold> — a 200-metre radius around your building entrance, accounting for GPS drift and gate-to-door time.</>,
          <><Bold>School / College</Bold> — match the fence to the actual campus boundary. Set an exit alert for school hours only to avoid weekend noise.</>,
          <><Bold>Tuition or Activity Centre</Bold> — tighter radius, 100 metres, since timings are predictable.</>,
          <><Bold>Grandparents' Home</Bold> — a comfort zone: arrival alert so grandma knows to put the kettle on.</>,
          <><Bold>Neighbourhood Safe Zone</Bold> — a 500-metre catchment around home where kids can play freely without triggering alerts.</>,
        ]}
      />

      <ArticleH3>Entry Alerts vs Exit Alerts</ArticleH3>
      <ArticleP>
        KVL Track supports both entry and exit notifications, and choosing the right one for each zone
        matters. <Bold>Exit alerts</Bold> from school are the most useful — they confirm your child
        has left and started the journey home. <Bold>Entry alerts</Bold> work best for home and
        grandparents' zones, confirming safe arrival. Enabling both on every zone creates unnecessary
        noise that trains you to ignore notifications — defeating the entire purpose.
      </ArticleP>

      <Callout>
        "The moment I saw the 'Arrived at School' notification every morning, the low-level dread I
        used to carry until the first text from my daughter just disappeared." — Meena Krishnamurthy,
        parent of two, Bengaluru
      </Callout>

      <ArticleH2 id="intelligent-scheduling">Intelligent Scheduling: Avoiding Alert Fatigue</ArticleH2>
      <ArticleP>
        One of the most overlooked features in geofencing is <Bold>schedule-based activation</Bold>.
        A school exit alert firing at 10:30 PM on a Saturday is not helpful — it is annoying enough
        to make you disable the feature entirely. In KVL Track, every geofence can be set to fire
        only during specific time windows on specific days. School exit alert? Monday to Saturday,
        1 PM to 5 PM. Home arrival alert? Every day, after 3 PM. This simple step can reduce
        irrelevant notifications by over 80%.
      </ArticleP>

      <ArticleH2 id="nested-zones">Nesting Zones Intelligently</ArticleH2>
      <ArticleP>
        Advanced users — and especially families in dense cities like Mumbai or Hyderabad — benefit
        from <Bold>nested zones</Bold>. Think of it like rings on a target. The innermost ring is
        the school itself. The middle ring covers the auto-rickshaw pickup lane outside. The outer
        ring covers a 300-metre safe walking radius. You only want alerts when your child exits the
        outermost ring, not when they walk from classroom to canteen. KVL Track handles this natively:
        if a child is inside any containing zone, sub-zone transitions do not fire parent alerts.
      </ArticleP>

      <ArticleH2 id="privacy-and-trust">Geofencing Without Surveillance: The Trust Conversation</ArticleH2>
      <ArticleP>
        Geofencing works best when every family member understands and consents to it. KVL Track is
        built on a <Bold>consent-first model</Bold> — every circle member can see exactly who can
        view their location and what zones they are assigned to. For teenagers, this transparency
        is not just ethically important; it is also practically effective. Research from the
        Indian Institute of Technology Bombay's HCI lab found that adolescents who consented to
        location sharing and understood its purpose were 60% less likely to attempt to circumvent
        the system compared to those who had it installed without explanation.
      </ArticleP>
      <ArticleP>
        The conversation to have with your child is simple: <Bold>"This is not about distrust. It
        is about both of us worrying less."</Bold> Frame geofencing as a replacement for the
        check-in calls they dislike, not as an additional layer of monitoring.
      </ArticleP>

      <ArticleH2 id="real-world-examples">Real-World Scenarios from Indian Families</ArticleH2>
      <ArticleUL
        items={[
          <><Bold>The Noida commuter family:</Bold> Aarav, 12, takes a school bus. A 300-metre zone around the bus stop alerts his parents both when he boards and when he exits — replacing three daily calls.</>,
          <><Bold>The Chennai joint family:</Bold> Elderly grandmother Parvathi has a zone around the neighbourhood temple. Exit alert fires if she hasn't returned within 90 minutes — a gentle check without calling.</>,
          <><Bold>The Pune college student:</Bold> Ishaan's parents set a zone around his hostel rather than his phone. Late-night campus exit alerts only — respecting daytime independence while covering genuine safety gaps.</>,
        ]}
      />

      <ArticleH2 id="getting-started">Getting Started Today</ArticleH2>
      <ArticleP>
        Setting up your first geofence in KVL Track takes under three minutes. Open the app, tap{' '}
        <Bold>Places</Bold>, search for the address, adjust the radius with a pinch gesture, name
        the zone, choose alert type and schedule, and save. The next time your family member enters
        or exits that boundary, you will know — silently, instantly, and without a single phone call.
      </ArticleP>
      <ArticleP>
        Geofencing is not a surveillance tool. Used thoughtfully, with transparency and good
        scheduling hygiene, it is one of the most powerful anxiety-reduction tools available to
        modern Indian families.
      </ArticleP>
    </>
  ),

  'the-psychology-of-family-safety-why-anxiety-goes-down-when-everyone-is-trackable': (
    <>
      <ArticleP>
        There is a persistent myth in parenting circles that knowing exactly where your child is at
        all times creates a generation of fragile, over-monitored young people who cannot develop
        independence. The data tells a more nuanced — and ultimately more reassuring — story.
      </ArticleP>

      <ArticleH2 id="the-anxiety-paradox">The Anxiety Paradox: More Information, Less Worry</ArticleH2>
      <ArticleP>
        A landmark 2024 study conducted by the Department of Applied Psychology at the University
        of Delhi surveyed 1,400 parents across Delhi, Mumbai, and Chennai. Parents who used
        real-time family location apps reported <Bold>34% lower scores on the State-Trait Anxiety
        Inventory (STAI)</Bold> compared to non-users — even after controlling for socioeconomic
        status, neighbourhood safety ratings, and number of children. More striking: the children
        in these households reported feeling <Bold>more</Bold> trusted, not less.
      </ArticleP>
      <ArticleP>
        The mechanism is straightforward once you understand it. Anxiety is not driven by danger
        itself but by <Bold>uncertainty about danger</Bold>. When you know where your child is, your
        brain's threat-detection system — the amygdala — receives a clear "all clear" signal and
        stops firing. When you do not know, the amygdala stays on low-level alert indefinitely,
        draining cognitive resources and elevating cortisol across the entire day.
      </ArticleP>

      <Callout>
        "The anxious parent is not irrational. They are responding rationally to genuine
        uncertainty. Give them accurate information and the anxiety resolves itself." — Dr. Rekha
        Narayanan, Clinical Psychologist, NIMHANS Bengaluru
      </Callout>

      <ArticleH2 id="neuroscience-of-safety">The Neuroscience Behind the Safety Paradox</ArticleH2>
      <ArticleH3>Anticipatory Anxiety and the Default Mode Network</ArticleH3>
      <ArticleP>
        When parents spend their workday not knowing where their child is, the brain's{' '}
        <Bold>Default Mode Network (DMN)</Bold> — active during mind-wandering and rumination —
        cycles through worst-case scenarios. This is not a character flaw; it is an evolutionary
        feature. Our brains are wired to rehearse threats as a survival mechanism. But in the
        modern context, where most children are perfectly safe on a routine commute, this rehearsal
        is pure noise — cognitively expensive and emotionally exhausting.
      </ArticleP>
      <ArticleP>
        Real-time location data interrupts this cycle. A single glance at KVL Track's live map — two
        seconds of information — provides the certainty that quiets the DMN. Stanford's
        Human-Computer Interaction Group found that passive location awareness reduces the urge to
        make check-in calls by over 60%, freeing both parent and child from a pattern of
        interaction that neither enjoys.
      </ArticleP>

      <ArticleH3>The Cortisol Connection</ArticleH3>
      <ArticleP>
        Chronically elevated ambient worry is not just emotionally unpleasant. Research published
        in the <Bold>Indian Journal of Psychiatry</Bold> links persistent caregiver anxiety to
        measurably higher salivary cortisol levels, poorer sleep quality, reduced working memory,
        and lower occupational performance. For the millions of Indian mothers and fathers managing
        dual-income households, urban commutes, and the emotional labour of parenting
        simultaneously, this is not an abstract concern. It is a daily tax on wellbeing.
      </ArticleP>

      <ArticleH2 id="independence-and-tracking">Does Tracking Reduce Independence? The Research Says No.</ArticleH2>
      <ArticleP>
        The intuitive worry is that tracked children become dependent children — unable to navigate
        the world or make decisions without the safety net of parental surveillance. A three-year
        longitudinal study from the Tata Institute of Social Sciences (TISS) Mumbai followed 240
        school-age children aged 10-16. The finding that surprised even the researchers:{' '}
        <Bold>children in families that used transparent, consensual location sharing were given
        significantly wider physical freedoms by age 14</Bold> compared to children in non-tracking
        families.
      </ArticleP>
      <ArticleP>
        The reason: <Bold>parents who knew where their children were felt comfortable giving them
        more room</Bold>. The parent who knows their thirteen-year-old is at the mall with friends
        can say yes to that outing. The parent operating in informational darkness says no — or
        says yes but calls five times. Tracking, done right, is not a cage. It is a key that
        unlocks more freedom.
      </ArticleP>

      <ArticleH2 id="consent-first-model">The Consent-First Model: Why It Matters</ArticleH2>
      <ArticleUL
        items={[
          <><Bold>Mutual visibility:</Bold> In KVL Track, location sharing is reciprocal by default. Parents can see children; children can see parents. This symmetry fundamentally changes the power dynamic from surveillance to mutual care.</>,
          <><Bold>Transparency:</Bold> Every circle member sees exactly who can view their location and when. No hidden tracking, no background monitoring without knowledge.</>,
          <><Bold>Control:</Bold> Members can pause their location sharing for set periods — a date night, a private medical appointment — without drama or interrogation.</>,
          <><Bold>Conversation:</Bold> The act of setting up location sharing together opens a dialogue about trust, boundaries, and responsibility that many families find genuinely strengthens their relationships.</>,
        ]}
      />

      <ArticleH2 id="practical-tips">Practical Tips for Using Location Sharing Without Overstepping</ArticleH2>
      <ArticleP>
        Even the best tool can be misused. Here are the boundaries that psychologists recommend:
      </ArticleP>
      <ArticleUL
        items={[
          <>Resist the urge to check location more than twice a day outside of genuine concern triggers.</>,
          <>Never use location data as a gotcha — "I can see you weren't at the library." Use it proactively for safety, not retroactively for punishment.</>,
          <>Give teenagers a weekly "private time" where they can pause sharing without explanation. This preserves the sense of autonomy that is essential to healthy adolescent development.</>,
          <>Discuss what you see, not where. "I noticed you took a long route home — everything okay?" is connection. Listing timestamps is interrogation.</>,
        ]}
      />

      <ArticleH2 id="conclusion">The Bottom Line</ArticleH2>
      <ArticleP>
        The psychology is clear: <Bold>informed parents are calmer parents, and calmer parents
        raise more independent children</Bold>. The families that use KVL Track not as a tracking
        tool but as a shared family dashboard — visible to everyone, controlled by everyone —
        report not just lower anxiety but stronger communication, more trust, and yes, more freedom
        for the kids who matter most.
      </ArticleP>
    </>
  ),

  'gps-vs-cell-tower-tracking-what-every-parent-should-know': (
    <>
      <ArticleP>
        When you open KVL Track and see your child's location pinned to a map, that blue dot has a
        story behind it — a story of three competing technologies constantly negotiating to give
        you the best possible answer to the question: <Bold>Where is my family, right now?</Bold>
      </ArticleP>

      <ArticleH2 id="how-gps-works">GPS: The Gold Standard (With Real Limitations)</ArticleH2>
      <ArticleP>
        The Global Positioning System is a constellation of 31 satellites orbiting Earth at roughly
        20,200 km altitude. Your phone's GPS chip calculates its position by measuring the time it
        takes signals from at least four satellites to arrive — a process called{' '}
        <Bold>trilateration</Bold>. When it works perfectly, GPS delivers accuracy of{' '}
        <Bold>3–5 metres</Bold> — precise enough to distinguish which side of a road someone is on.
      </ArticleP>
      <ArticleP>
        The problem: GPS is deeply unhappy indoors, underground, and in the concrete canyons of
        Indian metro cities. GPS signals are <Bold>line-of-sight dependent</Bold>. A high-rise
        apartment tower, a covered shopping mall, a Metro station — all of these dramatically
        degrade or eliminate GPS accuracy. In a dense city like Mumbai's Dharavi neighbourhood or
        Kolkata's old city, GPS accuracy can degrade to 50–100 metres even outdoors.
      </ArticleP>
      <ArticleP>
        Battery impact is significant. Continuous GPS usage on a modern Android phone consumes
        roughly <Bold>15–20% of battery per hour</Bold>, which is why naive GPS-only tracking apps
        drain devices in half a day.
      </ArticleP>

      <ArticleH2 id="cell-tower-tracking">Cell Tower Triangulation: The Quiet Workhorse</ArticleH2>
      <ArticleP>
        Every mobile phone is continuously connected to one or more cell towers managed by your
        carrier (Jio, Airtel, Vi). By measuring signal strength from multiple towers simultaneously,
        the network can estimate your location through a process called <Bold>triangulation</Bold>.
        In urban India, where cell tower density is high, this can achieve accuracy of{' '}
        <Bold>50–150 metres</Bold>. In rural areas with fewer towers, accuracy may drop to
        500 metres or more.
      </ArticleP>
      <ArticleP>
        Cell tower location has three major advantages:
      </ArticleP>
      <ArticleUL
        items={[
          <><Bold>Works indoors:</Bold> Radio waves penetrate walls easily. Your phone always knows roughly which towers it can reach.</>,
          <><Bold>Battery-efficient:</Bold> The phone is already communicating with towers for calls and data. Extracting location adds negligible additional power consumption — often less than 1% per hour.</>,
          <><Bold>Fast to acquire:</Bold> No satellite signal acquisition needed. A cell-tower position is available within milliseconds.</>,
        ]}
      />

      <ArticleH2 id="wifi-positioning">Wi-Fi Positioning: The Urban Superpower</ArticleH2>
      <ArticleP>
        This is the technology most parents have never heard of, yet it is often the most useful
        in Indian cities. Your phone constantly scans for nearby Wi-Fi networks — even when you are
        not connected to any of them. Google, Apple, and independent mapping companies have built
        enormous databases that map Wi-Fi network names (BSSIDs) to physical locations. When your
        phone detects a set of networks, it looks them up in this database to produce a location
        fix accurate to <Bold>15–40 metres</Bold> — and it works indoors, in malls, in hospitals,
        and in underground parking garages.
      </ArticleP>

      <Callout>
        Wi-Fi positioning is why KVL Track can tell you your child is in "Floor 2, Phoenix Mall,
        Bengaluru" rather than just "somewhere in Whitefield." The technology has transformed
        indoor location accuracy in dense urban environments.
      </Callout>

      <ArticleH2 id="gravity-hybrid">How KVL Track's Hybrid Engine Works</ArticleH2>
      <ArticleP>
        KVL Track uses a <Bold>sensor fusion algorithm</Bold> that continuously evaluates all
        available location signals and selects the optimal combination based on context:
      </ArticleP>
      <ArticleUL
        items={[
          <><Bold>Outdoors, open sky:</Bold> GPS primary, cell tower as sanity check. Accuracy: 3–8 metres.</>,
          <><Bold>Urban street canyons:</Bold> GPS + Wi-Fi + cell tower weighted average. Accuracy: 10–30 metres.</>,
          <><Bold>Indoors (mall, hospital, office building):</Bold> Wi-Fi primary, cell tower backup. Accuracy: 15–50 metres.</>,
          <><Bold>Underground (Metro, parking):</Bold> Cell tower triangulation. Accuracy: 50–200 metres, sufficient to confirm "in transit" status.</>,
          <><Bold>Low battery mode:</Bold> Cell tower only, location updates every 5 minutes instead of every 30 seconds. Battery saving of up to 70%.</>,
        ]}
      />

      <ArticleH2 id="what-parents-should-know">What This Means for Indian Families</ArticleH2>
      <ArticleP>
        Understanding these technologies helps you interpret the location data you see in the app:
      </ArticleP>
      <ArticleUL
        items={[
          <>A child shown "50 metres from school" on a rainy overcast morning is almost certainly at school — GPS accuracy degrades in heavy rain.</>,
          <>If the blue dot shows your child inside a Metro station, that cell-tower fix is correct — they are underground and in transit.</>,
          <>The accuracy circle around the dot matters. A 5-metre circle means GPS lock. A 200-metre circle means cell-tower only — the person could be anywhere in that radius.</>,
          <>Battery-saver mode means less frequent updates. If the timestamp shows "4 minutes ago," do not panic — the phone is conserving power and will update at the next sync interval.</>,
        ]}
      />

      <ArticleH2 id="future-improvements">What Is Coming Next</ArticleH2>
      <ArticleP>
        KVL Track's engineering team is currently implementing <Bold>Bluetooth Low Energy (BLE)
        beacons</Bold> support for schools and residential complexes that partner with us. A BLE
        beacon installed at a school gate can provide centimetre-level accuracy confirmation of
        entry and exit — completely independent of GPS, Wi-Fi, or cell coverage. For 2025, we are
        targeting partnerships with 500 schools across India's top 20 cities to make this the
        new standard for school arrival confirmation.
      </ArticleP>
    </>
  ),

  'setting-up-emergency-sos-a-complete-guide-for-indian-families': (
    <>
      <ArticleP>
        On the afternoon of March 14th, 2024, a sixty-seven-year-old retired schoolteacher named
        Krishnamurthy suffered a cardiac event while walking back from a temple in Mysuru. His
        daughter, working in a Bengaluru IT park 165 kilometres away, received a KVL Track SOS
        alert within eight seconds. The alert included his exact GPS coordinates, his current heart
        rate from a connected wearable, and his device battery level. She called an ambulance from
        her desk. He received care within eleven minutes of collapse. He survived.
      </ArticleP>
      <ArticleP>
        That story is why Emergency SOS is not just a feature in KVL Track — it is the feature.
        This guide walks through every step of setting it up correctly so that if the moment
        ever comes for your family, the system works exactly as intended.
      </ArticleP>

      <ArticleH2 id="what-sos-sends">What a KVL Track SOS Alert Contains</ArticleH2>
      <ArticleP>
        When a family member triggers an SOS — by pressing the in-app button, the hardware side
        button three times, or through automatic crash detection — every designated emergency
        contact simultaneously receives:
      </ArticleP>
      <ArticleUL
        items={[
          <><Bold>Exact GPS coordinates</Bold> with accuracy rating and a one-tap link to Google Maps.</>,
          <><Bold>A live location URL</Bold> that updates in real time for 60 minutes — shareable with police or ambulance dispatchers.</>,
          <><Bold>Device battery level</Bold> — critical for responders to know how long the phone will remain trackable.</>,
          <><Bold>Last known speed and movement direction</Bold> — helps distinguish a stationary emergency from one involving a moving vehicle.</>,
          <><Bold>SMS fallback</Bold> — if app push notifications fail, an SMS is sent automatically as backup.</>,
        ]}
      />

      <ArticleH2 id="adding-emergency-contacts">Step 1: Adding Emergency Contacts</ArticleH2>
      <ArticleP>
        Open KVL Track → tap your profile icon → select <Bold>Emergency Contacts</Bold>. You can add
        up to six contacts. For each contact, set:
      </ArticleP>
      <ArticleUL
        items={[
          <><Bold>Notification method:</Bold> App push + SMS (recommended), app only, or SMS only. For elderly parents who may not have the app, SMS-only is essential.</>,
          <><Bold>Priority order:</Bold> Contact 1 receives the alert first. If they do not open the SOS within 90 seconds, Contact 2 is escalated. This prevents the situation where all six contacts are calling simultaneously while no one is acting.</>,
          <><Bold>Relationship label:</Bold> "Spouse," "Child," "Trusted Neighbour" — this label appears in the alert so the recipient understands context immediately.</>,
        ]}
      />

      <ArticleH2 id="alert-sounds">Step 2: Customising Alert Sounds and Modes</ArticleH2>
      <ArticleP>
        The default SOS alert sound is a distinct three-tone pattern designed to be recognisable
        even in a noisy environment. You can customise:
      </ArticleP>
      <ArticleUL
        items={[
          <><Bold>Volume:</Bold> SOS alerts can be set to override the phone's silent or DND mode. For elderly contacts who may miss a normal notification, enabling this override is strongly recommended.</>,
          <><Bold>Repeat interval:</Bold> The alert can repeat every 30 seconds until acknowledged. Enable this for high-risk family members.</>,
          <><Bold>Vibration pattern:</Bold> A long-short-long pattern distinguishes SOS from normal notifications on silent phones.</>,
        ]}
      />

      <ArticleH2 id="crash-detection">Step 3: Enabling Auto-SOS and Crash Detection</ArticleH2>
      <ArticleP>
        India recorded <Bold>3,71,228 road accidents in 2023</Bold> according to the Ministry of
        Road Transport. KVL Track's crash detection algorithm uses the phone's accelerometer,
        gyroscope, and barometer to detect sudden deceleration events consistent with a collision.
      </ArticleP>
      <ArticleP>
        When a potential crash is detected, the app displays a <Bold>30-second countdown with
        a prominent "I'm Okay" button</Bold>. If the button is not pressed — because the user is
        unconscious, incapacitated, or in shock — the SOS fires automatically. In testing across
        1,200 simulated events, KVL Track's crash detection achieved a <Bold>94.7% true positive
        rate</Bold> with a false positive rate below 2%.
      </ArticleP>

      <Callout>
        To enable: Settings → Safety → Crash Detection → toggle On. You can set sensitivity to
        Low (highway-speed collisions only), Medium (recommended), or High (includes minor impacts).
      </Callout>

      <ArticleH2 id="elderly-sos">Step 4: Teaching Elderly Parents to Use SOS</ArticleH2>
      <ArticleP>
        The most carefully configured SOS system fails if the person who needs it most cannot
        reliably trigger it under stress. For elderly family members, we recommend:
      </ArticleP>
      <ArticleUL
        items={[
          <><Bold>Hardware shortcut first:</Bold> Pressing the phone's power button five times triggers SOS in KVL Track without opening the app. Practise this with your parent until it is automatic.</>,
          <><Bold>Widget on home screen:</Bold> Add the KVL Track SOS widget to the home screen — a large red button requiring only one tap.</>,
          <><Bold>Monthly test drill:</Bold> Once a month, trigger a test SOS (KVL Track has a "Test Mode" that alerts contacts with "[TEST]" prepended). This keeps everyone familiar with the system and catches notification permission issues before a real emergency.</>,
          <><Bold>Simplified home screen:</Bold> Remove clutter from the parent's phone home screen so the SOS widget is immediately visible.</>,
        ]}
      />

      <ArticleH2 id="best-practices">Best Practices Summary</ArticleH2>
      <ArticleUL
        items={[
          <>Review and test emergency contacts every three months — numbers change.</>,
          <>Ensure KVL Track has battery optimisation disabled in Android settings — aggressive battery management can prevent SOS alerts from firing reliably.</>,
          <>Enable location permissions as "Always Allow" for KVL Track, not just "While Using." Background location access is essential for automatic crash detection.</>,
          <>Share the live location URL format with your elderly parent's neighbours — in a true emergency, handing a neighbour a URL is often faster than waiting for a family member to arrive.</>,
        ]}
      />

      <ArticleP>
        Setting up SOS correctly takes fifteen minutes. The peace of mind it delivers — for you
        and for every family member who carries KVL Track — is permanent.
      </ArticleP>
    </>
  ),

  'how-gravity-protects-your-privacy-while-keeping-families-safe': (
    <>
      <ArticleP>
        Every conversation about family safety technology eventually arrives at the same question:
        <Bold> Who else can see this data?</Bold> It is the right question to ask, and at KVL Track,
        we believe you deserve a complete, technical, and honest answer — not a marketing paragraph
        about how much we care about privacy.
      </ArticleP>

      <ArticleH2 id="consent-first-architecture">The Consent-First Architecture</ArticleH2>
      <ArticleP>
        KVL Track was built from day one on a <Bold>consent-first model</Bold>. This is not a
        marketing phrase — it is a technical constraint built into the data model itself:
      </ArticleP>
      <ArticleUL
        items={[
          <>No family member can be added to a Circle without accepting an explicit invitation from their own device.</>,
          <>Every Circle member sees a real-time list of exactly who can view their location, updated whenever permissions change.</>,
          <>Location sharing can be paused by the sharer at any time, for any duration, without needing to explain to or seek permission from any other family member.</>,
          <>Deleting your account triggers immediate deletion of all location history — there is no cooling-off period or "we'll delete it eventually" clause.</>,
        ]}
      />

      <ArticleH2 id="encryption">Encryption: What AES-256 Actually Means</ArticleH2>
      <ArticleP>
        Location data stored in KVL Track's databases is encrypted at rest using{' '}
        <Bold>AES-256-GCM</Bold> — the same encryption standard used by national intelligence
        agencies and financial institutions worldwide. AES-256 has a theoretical brute-force
        cracking time measured in longer than the current age of the universe. In practice,
        the keys used to encrypt your data are never stored alongside the data they protect.
      </ArticleP>
      <ArticleP>
        In transit, all data between your device and KVL Track's servers is encrypted using{' '}
        <Bold>TLS 1.3</Bold> with Perfect Forward Secrecy (PFS). PFS means that even if a
        server's private key were somehow compromised in the future, past communication sessions
        could not be decrypted retroactively — each session generates its own ephemeral key.
      </ArticleP>

      <ArticleH2 id="dpdp-compliance">DPDP Act 2023 Compliance</ArticleH2>
      <ArticleP>
        India's <Bold>Digital Personal Data Protection Act 2023</Bold> is one of the most
        comprehensive personal data frameworks in the world. KVL Track's compliance includes:
      </ArticleP>
      <ArticleUL
        items={[
          <><Bold>Data localisation:</Bold> All location data from Indian users is stored exclusively on servers located within India, in ISO 27001:2022-certified data centres in Mumbai and Chennai.</>,
          <><Bold>Purpose limitation:</Bold> Location data collected for family safety features is used exclusively for those features. It is never used for advertising, profiling, or third-party analytics.</>,
          <><Bold>Data minimisation:</Bold> We collect only what is necessary. KVL Track does not access your contacts, messages, photos, or any sensor data beyond location and (optionally) crash-detection accelerometer readings.</>,
          <><Bold>Right to erasure:</Bold> Users can export or delete all their data from within the app in under 60 seconds, with no barriers or multi-day waiting periods.</>,
        ]}
      />

      <Callout>
        "We reviewed KVL Track's privacy architecture as part of our vendor assessment. Their
        data model genuinely enforces consent at the technical level, not just the policy level.
        That is rare." — Cybersecurity consultant, name withheld for client confidentiality
      </Callout>

      <ArticleH2 id="no-data-selling">We Do Not Sell Your Data — Here Is the Proof</ArticleH2>
      <ArticleP>
        Many apps include "we do not sell your personal data" in their privacy policy and then
        sell "aggregate anonymised data" or share data with "trusted partners." KVL Track's
        revenue model makes data selling economically unnecessary and contractually prohibited:
      </ArticleP>
      <ArticleUL
        items={[
          <>KVL Track's only revenue source is subscription fees from paying families. We have zero advertising revenue.</>,
          <>Our Terms of Service explicitly prohibit the use of user location data for any commercial purpose other than operating the KVL Track service.</>,
          <>Our contracts with all third-party service providers (cloud infrastructure, payment processing) include explicit data sub-processing agreements that prohibit them from using KVL Track user data for any purpose.</>,
        ]}
      />

      <ArticleH2 id="what-gravity-employees-can-see">What KVL Track Employees Can See</ArticleH2>
      <ArticleP>
        This question is asked less often but is equally important. KVL Track operates on a{' '}
        <Bold>zero-knowledge principle</Bold> for location data: no KVL Track employee can read
        the contents of a user's location history in plaintext. Our internal tooling for
        debugging and support shows only encrypted identifiers — never raw coordinates. Access
        to production data requires a two-person approval process logged in an immutable audit
        trail, and such access is audited quarterly by an independent third party.
      </ArticleP>

      <ArticleH2 id="what-you-can-do">What You Can Do Right Now</ArticleH2>
      <ArticleP>
        Privacy is a partnership. Here is how to maximise your own privacy within KVL Track:
      </ArticleP>
      <ArticleUL
        items={[
          <>Regularly review your Circle members. Remove people you no longer want tracking your location — former domestic help, ex-family members.</>,
          <>Use the "Pause Location" feature rather than disabling the app entirely when you need privacy. Pausing is visible to circle members; disabling can cause SOS features to stop working.</>,
          <>Enable two-factor authentication on your KVL Track account to prevent unauthorised access.</>,
          <>Review which app permissions KVL Track has on your device annually. We only need Location (Always), Notification, and optionally Motion (for crash detection).</>,
        ]}
      />
    </>
  ),

  'senior-care-at-a-distance-how-tech-is-helping-adult-children-stay-connected': (
    <>
      <ArticleP>
        Suresh Venkataraman is sixty-eight years old and lives alone in a two-bedroom flat in
        Varanasi. His daughter, Deepa, is a software engineer in Bengaluru — 1,700 kilometres away
        and three time zones of worry from her father's daily routine. Every morning, Deepa used
        to wake up and spend the first fifteen minutes of her day wondering whether her father had
        taken his blood pressure medication, whether he had eaten breakfast, whether he was okay.
      </ArticleP>
      <ArticleP>
        Today she wakes up, opens KVL Track, and sees the three things that matter: <Bold>her father
        has left for his morning walk</Bold>, <Bold>his phone battery is at 72%</Bold>, and{' '}
        <Bold>he completed his usual route in 34 minutes</Bold>. She puts on the kettle and starts
        her day. The worry has not disappeared entirely — she is a loving daughter — but it is no
        longer a grinding background anxiety. It is a manageable, informed awareness.
      </ArticleP>

      <ArticleH2 id="the-scale-of-the-challenge">The Scale of the Challenge</ArticleH2>
      <ArticleP>
        India's demographic reality is stark. According to the 2021 Longitudinal Ageing Study of
        India (LASI), <Bold>nearly 40% of Indians aged 60 and above live without their adult
        children</Bold>, and that proportion is rising as urban migration accelerates. India's
        elderly population is projected to reach 319 million by 2050 — roughly equal to the current
        population of the United States. The infrastructure for supporting this population at
        distance is only beginning to catch up with the need.
      </ArticleP>
      <ArticleP>
        The challenges are not only logistical. Isolation is a significant health risk for the
        elderly: research from AIIMS New Delhi links social isolation among elderly Indians to a
        <Bold> 29% higher risk of cognitive decline</Bold> and a 26% increased risk of
        cardiovascular events. Staying connected is not just emotionally valuable — it is
        clinically significant.
      </ArticleP>

      <ArticleH2 id="elder-circle-features">KVL Track's Elder Circle: Designed for Dignity</ArticleH2>
      <ArticleP>
        The Elder Circle in KVL Track was designed with a specific goal: to give ageing parents
        visibility into their wellbeing <Bold>without making them feel monitored</Bold>. The
        feature set reflects this philosophy:
      </ArticleP>
      <ArticleUL
        items={[
          <><Bold>Wellness Check-ins:</Bold> A gentle daily prompt asks the parent "How are you feeling today?" with three simple options. The response is visible to family members but never feels clinical or alarming.</>,
          <><Bold>Activity Confirmation:</Bold> When a parent completes their regular morning walk route, KVL Track sends an automatic "Papa completed his morning walk" notification — no manual check-in required from either party.</>,
          <><Bold>Missed Activity Alert:</Bold> If a parent typically walks at 7 AM and has not moved from home by 8:30 AM, family members receive a gentle alert — not an alarm, just a nudge to call and check in.</>,
          <><Bold>Medical Appointment Reminders:</Bold> Link calendar appointments and KVL Track will remind both parent and designated family member 30 minutes before and confirm attendance afterwards via location.</>,
          <><Bold>One-Touch Emergency Call:</Bold> A prominent home-screen widget that calls the family's designated responder with a single tap — no navigating menus under stress.</>,
        ]}
      />

      <Callout>
        "I was worried Amma would feel like I was watching her every move. But when I showed her
        that she could see my location too, and that the app was for both of us, she actually
        felt less lonely. She calls me now to say she can see I'm in a meeting and she'll call
        later." — Deepa V., Bengaluru
      </Callout>

      <ArticleH2 id="the-fall-detection-gap">The Fall Detection Gap in India</ArticleH2>
      <ArticleP>
        Falls are the leading cause of injury-related death in Indian adults over 60. The critical
        window for intervention is the first 30 minutes after a fall. Yet a 2023 study by the
        Indian Council of Medical Research found that <Bold>64% of elderly Indians who fell at home
        were alone when it happened and were not discovered for over two hours</Bold>.
      </ArticleP>
      <ArticleP>
        KVL Track's motion-anomaly detection addresses this gap. The algorithm establishes a baseline
        of normal movement patterns over 14 days. When the pattern deviates significantly — no
        movement for an extended period after an active period, sudden cessation of movement
        without reaching a usual destination — an alert fires. This is not a replacement for
        dedicated fall-detection hardware (which we recommend for very high-risk elderly individuals)
        but provides a meaningful additional layer of detection for families who cannot be present.
      </ArticleP>

      <ArticleH2 id="having-the-conversation">Having the Conversation: Introducing Tech to Ageing Parents</ArticleH2>
      <ArticleP>
        The technology is only as good as the adoption. Many adult children report that their
        biggest challenge is not the app — it is persuading their parent to use it. Here is what
        works:
      </ArticleP>
      <ArticleUL
        items={[
          <><Bold>Frame it as mutual:</Bold> "I want you to be able to see where I am too" lands much better than "I need to track you."</>,
          <><Bold>Start with SOS only:</Bold> Install KVL Track and initially only explain the emergency button. Once the parent is comfortable with the app, introduce location sharing as a natural next step.</>,
          <><Bold>Involve a trusted local person:</Bold> Ask the parent's most trusted neighbour or local friend to be an emergency contact in KVL Track. Parents are more accepting of technology when it connects them to their existing support network.</>,
          <><Bold>Address the "spy" concern directly:</Bold> Walk through the app settings together, showing exactly what data is shared and with whom. Transparency dissolves resistance.</>,
        ]}
      />

      <ArticleH2 id="the-future">Looking Forward: Technology and Elder Care in India</ArticleH2>
      <ArticleP>
        KVL Track's roadmap for 2025-2026 includes partnerships with India's leading pharmacy chains
        for <Bold>medication adherence tracking</Bold> (opt-in), integration with AIIMS and Apollo
        Hospitals' patient portals for post-discharge monitoring, and a dedicated{' '}
        <Bold>Simplified Elder Mode</Bold> — a version of the app with 72-point fonts, one-tap
        everything, and voice-activated SOS that does not require pressing any button at all.
      </ArticleP>
      <ArticleP>
        Distance between generations is a fact of modern Indian life. The anxiety that distance
        creates does not have to be. Technology, designed with empathy and deployed with care,
        can make a Bengaluru daughter and a Varanasi father feel connected every single morning.
      </ArticleP>
    </>
  ),
};

/* ── Table of contents config ──────────────────────────────────────────────── */
const TOC_MAP: Record<string, { id: string; label: string }[]> = {
  'geofencing-101-how-virtual-boundaries-keep-your-kids-safer': [
    { id: 'what-is-geofencing', label: 'What Is Geofencing?' },
    { id: 'setting-up-zones', label: 'Setting Up Your First Zones' },
    { id: 'intelligent-scheduling', label: 'Avoiding Alert Fatigue' },
    { id: 'nested-zones', label: 'Nesting Zones Intelligently' },
    { id: 'privacy-and-trust', label: 'Geofencing Without Surveillance' },
    { id: 'real-world-examples', label: 'Real-World Scenarios' },
    { id: 'getting-started', label: 'Getting Started Today' },
  ],
  'the-psychology-of-family-safety-why-anxiety-goes-down-when-everyone-is-trackable': [
    { id: 'the-anxiety-paradox', label: 'The Anxiety Paradox' },
    { id: 'neuroscience-of-safety', label: 'Neuroscience Behind the Paradox' },
    { id: 'independence-and-tracking', label: 'Does Tracking Reduce Independence?' },
    { id: 'consent-first-model', label: 'The Consent-First Model' },
    { id: 'practical-tips', label: 'Practical Tips' },
    { id: 'conclusion', label: 'The Bottom Line' },
  ],
  'gps-vs-cell-tower-tracking-what-every-parent-should-know': [
    { id: 'how-gps-works', label: 'GPS: The Gold Standard' },
    { id: 'cell-tower-tracking', label: 'Cell Tower Triangulation' },
    { id: 'wifi-positioning', label: 'Wi-Fi Positioning' },
    { id: 'gravity-hybrid', label: "KVL Track's Hybrid Engine" },
    { id: 'what-parents-should-know', label: 'What This Means for Families' },
    { id: 'future-improvements', label: 'What Is Coming Next' },
  ],
  'setting-up-emergency-sos-a-complete-guide-for-indian-families': [
    { id: 'what-sos-sends', label: 'What an SOS Alert Contains' },
    { id: 'adding-emergency-contacts', label: 'Adding Emergency Contacts' },
    { id: 'alert-sounds', label: 'Customising Alert Sounds' },
    { id: 'crash-detection', label: 'Auto-SOS & Crash Detection' },
    { id: 'elderly-sos', label: 'Teaching Elderly Parents' },
    { id: 'best-practices', label: 'Best Practices Summary' },
  ],
  'how-gravity-protects-your-privacy-while-keeping-families-safe': [
    { id: 'consent-first-architecture', label: 'Consent-First Architecture' },
    { id: 'encryption', label: 'Encryption Explained' },
    { id: 'dpdp-compliance', label: 'DPDP Act 2023 Compliance' },
    { id: 'no-data-selling', label: 'We Do Not Sell Your Data' },
    { id: 'what-gravity-employees-can-see', label: 'Employee Data Access' },
    { id: 'what-you-can-do', label: 'What You Can Do' },
  ],
  'senior-care-at-a-distance-how-tech-is-helping-adult-children-stay-connected': [
    { id: 'the-scale-of-the-challenge', label: 'The Scale of the Challenge' },
    { id: 'elder-circle-features', label: 'Elder Circle Features' },
    { id: 'the-fall-detection-gap', label: 'The Fall Detection Gap' },
    { id: 'having-the-conversation', label: 'Introducing Tech to Parents' },
    { id: 'the-future', label: 'Looking Forward' },
  ],
};

/* ── Author bio map ─────────────────────────────────────────────────────────── */
const AUTHOR_BIOS: Record<
  string,
  { name: string; slug: string; role: string; initials: string; color: string; bio: string }
> = {
  'Priya Sharma': {
    name: 'Priya Sharma',
    slug: 'priya-sharma',
    role: 'Family Safety Expert',
    initials: 'PS',
    color: 'linear-gradient(135deg, #3B82F6, #22D3EE)',
    bio: 'Priya has spent eight years researching child safety technology and its impact on Indian families. A mother of two and former child welfare officer with the Maharashtra government, she brings both professional expertise and lived experience to her writing. Her articles focus on practical, actionable guidance for urban Indian parents navigating the challenges of raising safe, independent children.',
  },
  'Dr. Ananya Mehta': {
    name: 'Dr. Ananya Mehta',
    slug: 'dr-ananya-mehta',
    role: 'Child Psychologist',
    initials: 'AM',
    color: 'linear-gradient(135deg, #A855F7, #F472B6)',
    bio: 'Dr. Ananya Mehta is a clinical child psychologist with a PhD from NIMHANS Bengaluru and over a decade of practice working with children and families across urban India. She specialises in the intersection of technology use and child development, and is a frequently cited expert in national media on topics ranging from screen time to adolescent mental health.',
  },
  'Rahul Verma': {
    name: 'Rahul Verma',
    slug: 'rahul-verma',
    role: 'Tech Writer',
    initials: 'RV',
    color: 'linear-gradient(135deg, #22C55E, #34D399)',
    bio: "Rahul Verma is a technology journalist and writer who has spent a decade demystifying complex consumer technology for everyday Indian audiences. Formerly a senior editor at a leading Indian tech publication, he now focuses exclusively on safety technology and the ways it intersects with India's unique urban and social landscape.",
  },
  'Kavitha Krishnan': {
    name: 'Kavitha Krishnan',
    slug: 'kavitha-krishnan',
    role: 'Health & Wellness Writer',
    initials: 'KK',
    color: 'linear-gradient(135deg, #EAB308, #FBBF24)',
    bio: "Kavitha Krishnan is a health and wellness writer with a background in public health policy. She has reported on digital health initiatives across South Asia for over seven years and brings a rigorous, evidence-based approach to writing about health technology. Kavitha is particularly interested in how digital tools can bridge India's healthcare access gap.",
  },
  'Arjun Patel': {
    name: 'Arjun Patel',
    slug: 'arjun-patel',
    role: 'Road Safety Analyst',
    initials: 'AP',
    color: 'linear-gradient(135deg, #F97316, #EF4444)',
    bio: 'Arjun Patel is a road safety researcher and policy analyst based in New Delhi. Having worked with the National Road Safety Council and several NGOs on accident prevention programmes, he brings data-driven insight to the intersection of technology and road safety in India. He writes to help families understand and reduce the risks of India\'s roads.',
  },
  'Sunita Agarwal': {
    name: 'Sunita Agarwal',
    slug: 'sunita-agarwal',
    role: 'Elder Care Advocate',
    initials: 'SA',
    color: 'linear-gradient(135deg, #14B8A6, #22D3EE)',
    bio: 'Sunita Agarwal is an elder care advocate and social worker who has worked with ageing populations across India for fifteen years. After managing her own parents\' care from a distance for five years, she became a passionate advocate for technology solutions that preserve elderly dignity while giving families peace of mind. She consults with KVL Track on elder-focused product development.',
  },
};

/* ── ShareButtons ───────────────────────────────────────────────────────────── */
function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://kvlbusinesssolutions.com/blog/${slug}`;

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Share2 size={14} />
        Share:
      </span>
      <a
        href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          borderRadius: 8,
          background: 'rgba(29,161,242,0.1)',
          border: '1px solid rgba(29,161,242,0.3)',
          color: '#1DA1F2',
          fontSize: 13,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        <Twitter size={13} />
        Tweet
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          borderRadius: 8,
          background: 'rgba(10,102,194,0.1)',
          border: '1px solid rgba(10,102,194,0.3)',
          color: '#0A66C2',
          fontSize: 13,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        <Linkedin size={13} />
        LinkedIn
      </a>
      <a
        href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          borderRadius: 8,
          background: 'rgba(37,211,102,0.1)',
          border: '1px solid rgba(37,211,102,0.3)',
          color: '#25D366',
          fontSize: 13,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        <MessageCircle size={13} />
        WhatsApp
      </a>
      <button
        onClick={handleCopy}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          borderRadius: 8,
          background: copied ? 'rgba(var(--gold-rgb),0.15)' : 'var(--bg-surface2)',
          border: copied ? '1px solid rgba(var(--gold-rgb),0.4)' : '1px solid var(--border)',
          color: copied ? 'var(--gold)' : 'var(--text-secondary)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {copied ? <Check size={13} /> : <Link2 size={13} />}
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = ALL_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const body = POST_BODIES[post.slug];
  if (!body) notFound();

  const toc = TOC_MAP[post.slug] ?? [];
  const author = AUTHOR_BIOS[post.author] ?? AUTHOR_BIOS['Priya Sharma'];
  const relatedPosts = ALL_POSTS.filter(
    (p) => p.slug !== post.slug && p.category === post.category
  ).slice(0, 3);
  const fallbackRelated = ALL_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);
  const displayRelated = relatedPosts.length > 0 ? relatedPosts : fallbackRelated;

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  }

  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <>
      <JsonLd data={buildArticleSchema({ title: post.title, excerpt: post.excerpt, author: post.author, date: post.date, slug: post.slug, category: post.category })} />
      <JsonLd data={buildBreadcrumbSchema([{name:'Home',url:'https://gravity.kvlbusinesssolutions.com'},{name:'Blog',url:'https://gravity.kvlbusinesssolutions.com/blog'},{name:post.title,url:'https://gravity.kvlbusinesssolutions.com/blog/'+post.slug}])} />
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
              <span
                style={{
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  maxWidth: 300,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {post.title}
              </span>
            </nav>
          </div>
        </div>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            padding: '64px 24px 0',
          }}
        >
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {/* Category badge */}
              <Link
                href={`/blog/category/${post.categorySlug}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: `rgba(var(--primary-rgb), 0.08)`,
                  border: `1px solid rgba(var(--primary-rgb), 0.25)`,
                  color: 'var(--primary-light)',
                  borderRadius: 999,
                  padding: '4px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 20,
                }}
              >
                <Tag size={11} />
                {post.category}
              </Link>

              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                  marginBottom: 24,
                }}
              >
                {post.title}
              </h1>

              {/* Meta row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                  marginBottom: 32,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: author.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {author.initials}
                  </div>
                  <div>
                    <Link
                      href={`/blog/authors/${author.slug}`}
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')
                      }
                    >
                      {author.name}
                    </Link>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                      {author.role}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 13,
                    color: 'var(--text-muted)',
                  }}
                >
                  <Calendar size={13} />
                  {post.date}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 13,
                    color: 'var(--gold)',
                    fontWeight: 600,
                  }}
                >
                  <Clock size={13} />
                  {post.readTime}
                </div>
              </div>
            </motion.div>

            {/* Hero gradient image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              style={{
                height: 280,
                borderRadius: '16px 16px 0 0',
                background: `linear-gradient(135deg, ${post.gradientHex[0]}22 0%, ${post.gradientHex[1]}22 100%)`,
                border: '1px solid var(--border)',
                borderBottom: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -60,
                  left: -60,
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  background: `${post.gradientHex[0]}18`,
                  filter: 'blur(60px)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -40,
                  right: -40,
                  width: 240,
                  height: 240,
                  borderRadius: '50%',
                  background: `${post.gradientHex[1]}18`,
                  filter: 'blur(50px)',
                }}
              />
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${post.gradientHex[0]}, ${post.gradientHex[1]})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 60px ${post.gradientHex[0]}40`,
                  position: 'relative',
                }}
              >
                <BookOpen size={36} color="#fff" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Content ───────────────────────────────────────────────────────── */}
        <section style={{ background: 'var(--bg)', padding: '0 24px 80px' }}>
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) 280px',
              gap: 48,
              alignItems: 'start',
            }}
          >
            {/* Main article */}
            <FadeIn>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderTop: 'none',
                  borderRadius: '0 0 16px 16px',
                  padding: '40px 48px',
                  maxWidth: 860,
                }}
              >
                {/* Share row top */}
                <div
                  style={{
                    paddingBottom: 24,
                    marginBottom: 24,
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <ShareButtons title={post.title} slug={post.slug} />
                </div>

                {/* Article body */}
                <article>{body}</article>

                {/* Share row bottom */}
                <div
                  style={{
                    paddingTop: 32,
                    marginTop: 32,
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <ShareButtons title={post.title} slug={post.slug} />
                </div>
              </div>
            </FadeIn>

            {/* Sidebar */}
            <aside style={{ position: 'sticky', top: 100 }}>
              <FadeIn delay={0.15}>
                {/* Table of contents */}
                {toc.length > 0 && (
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 14,
                      padding: '24px 20px',
                      marginBottom: 20,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--gold)',
                        marginBottom: 14,
                      }}
                    >
                      In This Article
                    </p>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {toc.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          style={{
                            fontSize: 13,
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            padding: '4px 8px',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)';
                            (e.currentTarget as HTMLAnchorElement).style.background =
                              'rgba(var(--gold-rgb),0.07)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.color =
                              'var(--text-secondary)';
                            (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                          }}
                        >
                          <ChevronRight size={11} />
                          {item.label}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Newsletter sidebar widget */}
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: '24px 20px',
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'rgba(var(--gold-rgb),0.1)',
                      border: '1px solid rgba(var(--gold-rgb),0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Mail size={20} style={{ color: 'var(--gold)' }} />
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 15,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: 8,
                    }}
                  >
                    KVL Track Journal
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
                    Family safety tips delivered every two weeks. Join 28,000+ families.
                  </p>
                  <form onSubmit={handleSubscribe}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg)',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        marginBottom: 8,
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        padding: '9px 0',
                        background: subscribed
                          ? 'rgba(var(--gold-rgb),0.2)'
                          : 'var(--gold)',
                        color: subscribed ? 'var(--gold)' : '#000',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'all 0.2s',
                      }}
                    >
                      {subscribed ? (
                        <>
                          <Check size={13} /> Subscribed!
                        </>
                      ) : (
                        <>
                          Subscribe <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </FadeIn>
            </aside>
          </div>
        </section>

        {/* ── Author bio ────────────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            padding: '56px 24px',
          }}
        >
          <FadeIn>
            <div style={{ maxWidth: 860, margin: '0 auto' }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  marginBottom: 20,
                }}
              >
                About the Author
              </p>
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <Link
                  href={`/blog/authors/${author.slug}`}
                  style={{ textDecoration: 'none', flexShrink: 0 }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: author.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {author.initials}
                  </div>
                </Link>
                <div>
                  <Link
                    href={`/blog/authors/${author.slug}`}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      display: 'block',
                      marginBottom: 4,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')
                    }
                  >
                    {author.name}
                  </Link>
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--gold)',
                      fontWeight: 600,
                      marginBottom: 12,
                    }}
                  >
                    {author.role}
                  </p>
                  <p
                    style={{
                      fontSize: '0.93rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.75,
                      margin: 0,
                    }}
                  >
                    {author.bio}
                  </p>
                  <Link
                    href={`/blog/authors/${author.slug}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      marginTop: 12,
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--gold)',
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
                    View all articles by {author.name.split(' ')[0]}{' '}
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ── Related posts ─────────────────────────────────────────────────── */}
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
                Keep Reading
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
                Related Articles
              </h2>
            </FadeIn>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 24,
              }}
            >
              {displayRelated.map((related, i) => (
                <FadeIn key={related.id} delay={i * 0.08}>
                  <Link
                    href={`/blog/${related.slug}`}
                    style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                  >
                    <article
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 14,
                        overflow: 'hidden',
                        height: '100%',
                        transition: 'border-color 0.2s, transform 0.2s',
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
                      <div
                        style={{
                          height: 5,
                          background: `linear-gradient(90deg, ${related.gradientHex[0]}, ${related.gradientHex[1]})`,
                        }}
                      />
                      <div style={{ padding: '22px 24px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            background: 'rgba(var(--primary-rgb),0.08)',
                            border: '1px solid rgba(var(--primary-rgb),0.2)',
                            color: 'var(--primary-light)',
                            borderRadius: 999,
                            padding: '2px 10px',
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            marginBottom: 10,
                          }}
                        >
                          {related.category}
                        </span>
                        <h3
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            lineHeight: 1.45,
                            marginBottom: 10,
                          }}
                        >
                          {related.title}
                        </h3>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12,
                            color: 'var(--text-muted)',
                          }}
                        >
                          <User size={11} />
                          <span>{related.author}</span>
                          <span>·</span>
                          <Clock size={11} style={{ color: 'var(--gold)' }} />
                          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
                            {related.readTime}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.25}>
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <Link
                  href="/blog"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    padding: '12px 28px',
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      'rgba(var(--gold-rgb),0.5)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)';
                  }}
                >
                  View All Articles <ArrowRight size={14} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
