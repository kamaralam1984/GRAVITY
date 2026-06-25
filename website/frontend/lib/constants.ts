/* ─────────────────────────────────────────────────────────────
   KVL Track — Shared Constants
   ───────────────────────────────────────────────────────────── */

/* ── Nav Links ──────────────────────────────────────────────── */
export const NAV_LINKS = [
  { label: 'Features',     href: '/features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing',      href: '/pricing' },
  { label: 'About',        href: '/about' },
  { label: 'Blog',         href: '/blog' },
] as const

/* ── Features ───────────────────────────────────────────────── */
export type FeatureCategory = 'core' | 'care' | 'safety'

export interface Feature {
  id: string
  title: string
  description: string
  icon: string
  category: FeatureCategory
  color: string
  highlight: boolean
}

export const FEATURES: Feature[] = [
  {
    id: 'sos',
    title: 'SOS Button',
    description:
      'One tap sends an emergency alert with your exact GPS location to every circle member simultaneously. Loud alarm, continuous pings until acknowledged — because seconds count.',
    icon: 'AlertOctagon',
    category: 'safety',
    color: 'text-red-400',
    highlight: true,
  },
  {
    id: 'live-map',
    title: 'Live Family Map',
    description:
      'See every family member on a beautiful real-time map. Battery level, speed, and last-seen time at a glance. Works on any device, any network, anywhere in the world.',
    icon: 'Map',
    category: 'core',
    color: 'text-blue-400',
    highlight: true,
  },
  {
    id: 'geofencing',
    title: 'Geofencing',
    description:
      'Draw safe zones around home, school, work, or any place that matters. Get instant arrival and departure notifications the moment a circle member crosses the boundary.',
    icon: 'MapPin',
    category: 'core',
    color: 'text-violet-400',
    highlight: false,
  },
  {
    id: 'check-in',
    title: 'Check-In System',
    description:
      'Let loved ones know you arrived safely with a single tap. Scheduled check-ins remind you automatically — missed ones trigger gentle alerts to your circle.',
    icon: 'CheckCircle',
    category: 'core',
    color: 'text-green-400',
    highlight: false,
  },
  {
    id: 'journey-sharing',
    title: 'Journey Sharing',
    description:
      'Share a live link to your trip with anyone — even people outside your circle. Perfect for airport pickups, late-night commutes, or solo travel.',
    icon: 'Navigation',
    category: 'core',
    color: 'text-cyan-400',
    highlight: false,
  },
  {
    id: 'location-history',
    title: 'Location History',
    description:
      'Review up to 30 days of location history for any circle member. Useful for retracing steps, confirming safe arrivals, or understanding daily routines.',
    icon: 'History',
    category: 'core',
    color: 'text-indigo-400',
    highlight: false,
  },
  {
    id: 'privacy-hours',
    title: 'Privacy Hours',
    description:
      'Set time windows where your location goes private — ideal for teenagers, work hours, or personal space. Full control stays with the individual.',
    icon: 'EyeOff',
    category: 'core',
    color: 'text-slate-400',
    highlight: false,
  },
  {
    id: 'low-battery',
    title: 'Low Battery Alert',
    description:
      'Get notified the moment a family member\'s battery drops below a custom threshold. Never lose track because of a dead phone again.',
    icon: 'BatteryLow',
    category: 'core',
    color: 'text-yellow-400',
    highlight: false,
  },
  {
    id: 'fall-detection',
    title: 'Fall Detection',
    description:
      'Advanced accelerometer analysis detects sudden falls and automatically triggers an SOS countdown. Critical for seniors, solo hikers, and anyone living alone.',
    icon: 'Activity',
    category: 'care',
    color: 'text-orange-400',
    highlight: true,
  },
  {
    id: 'routine-monitoring',
    title: 'Routine Monitoring',
    description:
      'Learn the normal movement patterns of elderly parents or children. Receive smart alerts when activity deviates significantly from the expected routine.',
    icon: 'BarChart2',
    category: 'care',
    color: 'text-teal-400',
    highlight: false,
  },
  {
    id: 'wellness-check',
    title: 'Wellness Check-in',
    description:
      'Daily mood and wellness nudges let family members share how they are feeling with a simple emoji response. Small signals, big peace of mind.',
    icon: 'Heart',
    category: 'care',
    color: 'text-pink-400',
    highlight: false,
  },
  {
    id: 'medication-reminders',
    title: 'Medication Reminders',
    description:
      'Set medication schedules with confirmation prompts. Caregivers are notified if a dose is missed, closing the gap between intent and action.',
    icon: 'Pill',
    category: 'care',
    color: 'text-lime-400',
    highlight: false,
  },
  {
    id: 'caregiver-mode',
    title: 'Caregiver Mode',
    description:
      'A dedicated dashboard for professional or family caregivers managing multiple individuals. Consolidated alerts, medical notes, and emergency contacts in one place.',
    icon: 'UserCheck',
    category: 'care',
    color: 'text-emerald-400',
    highlight: false,
  },
  {
    id: 'family-moments',
    title: 'Family Moments Feed',
    description:
      'Share photos, notes, and location tags with your circle in a private, ad-free feed. Build memories together without leaving the safety of your family space.',
    icon: 'Image',
    category: 'core',
    color: 'text-fuchsia-400',
    highlight: false,
  },
]

/* ── Pricing Plans ──────────────────────────────────────────── */
export interface PricingPlan {
  id: string
  name: string
  monthlyPrice: number
  annualPrice: number
  badge: string | null
  color: string
  features: string[]
  cta: string
  highlighted: boolean
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    badge: null,
    color: 'border-white/10',
    features: [
      '3 family members',
      'Live location sharing',
      'Basic SOS alerts',
      'Check-ins',
      '7-day location history',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    id: 'family',
    name: 'Family',
    monthlyPrice: 199,
    annualPrice: 159,
    badge: 'Most Popular',
    color: 'border-blue-500/50',
    features: [
      '10 family members',
      'Geofencing (unlimited zones)',
      'Journey sharing',
      'Family chat',
      '30-day location history',
      'Smart alerts',
    ],
    cta: 'Start Family Plan',
    highlighted: false,
  },
  {
    id: 'care',
    name: 'Care',
    monthlyPrice: 299,
    annualPrice: 239,
    badge: 'Best for Caregivers',
    color: 'border-emerald-500/50',
    features: [
      'Everything in Family',
      'Elderly care suite',
      'Medication reminders',
      'Wellness monitoring',
      'Fall detection alerts',
      'Caregiver dashboard',
    ],
    cta: 'Start Care Plan',
    highlighted: false,
  },
  {
    id: 'family-plus',
    name: 'Family Plus',
    monthlyPrice: 499,
    annualPrice: 399,
    badge: 'Best Value',
    color: 'border-amber-500/50',
    features: [
      'Everything in Care',
      'Driving safety suite',
      'Crash detection',
      'AI insights and predictions',
      'Wearable integration',
      'Driver safety reports',
    ],
    cta: 'Get Family Plus',
    highlighted: true,
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    monthlyPrice: 799,
    annualPrice: 639,
    badge: 'All Features',
    color: 'border-violet-500/50',
    features: [
      'Everything in Family Plus',
      'Smart home integration (Titan)',
      'Vehicle tracking (Venus)',
      'KVL Business Solutions ecosystem',
      'Priority 24/7 support',
      'API access',
    ],
    cta: 'Go Ultimate',
    highlighted: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: -1,
    annualPrice: -1,
    badge: 'Custom Pricing',
    color: 'border-slate-500/50',
    features: [
      'Unlimited everything',
      'School safety module',
      'Corporate safety',
      'SLA guarantee',
      'Dedicated account manager',
      'White-label option',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

/* ── Regional Pricing ───────────────────────────────────────── */
export interface RegionalPrice {
  region: string
  flag: string
  currency: string
  familyPrice: string
  carePrice: string
  gateway: string
}

export const REGIONAL_PRICING: RegionalPrice[] = [
  {
    region: 'Kenya / East Africa',
    flag: '🇰🇪',
    currency: 'KES',
    familyPrice: 'KES 650/mo',
    carePrice: 'KES 1,050/mo',
    gateway: 'M-Pesa · Airtel Money',
  },
  {
    region: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    familyPrice: '₹399/mo',
    carePrice: '₹649/mo',
    gateway: 'UPI · Razorpay',
  },
  {
    region: 'UAE / MENA',
    flag: '🇦🇪',
    currency: 'AED',
    familyPrice: 'AED 18/mo',
    carePrice: 'AED 29/mo',
    gateway: 'Stripe · PayTabs',
  },
  {
    region: 'UK / Europe',
    flag: '🇬🇧',
    currency: 'GBP',
    familyPrice: '£3.99/mo',
    carePrice: '£6.49/mo',
    gateway: 'Stripe · PayPal',
  },
  {
    region: 'USA / Canada',
    flag: '🇺🇸',
    currency: 'USD',
    familyPrice: '$4.99/mo',
    carePrice: '$7.99/mo',
    gateway: 'Stripe · Apple Pay',
  },
  {
    region: 'Rest of Africa',
    flag: '🌍',
    currency: 'USD',
    familyPrice: '$2.99/mo',
    carePrice: '$4.99/mo',
    gateway: 'Flutterwave · Paystack',
  },
]

/* ── Stats ──────────────────────────────────────────────────── */
export interface Stat {
  value: number
  suffix: string
  label: string
  icon: string
}

export const STATS: Stat[] = [
  { value: 50000, suffix: '+',  label: 'Families Protected',    icon: 'Users' },
  { value: 50,    suffix: '+',  label: 'Countries',             icon: 'Globe' },
  { value: 2300000, suffix: '+', label: 'SOS Alerts Answered', icon: 'AlertOctagon' },
  { value: 99.9,  suffix: '%',  label: 'Uptime',               icon: 'Shield' },
]

/* ── Testimonials ───────────────────────────────────────────── */
export interface Testimonial {
  name: string
  role: string
  country: string
  flag: string
  initials: string
  rating: number
  quote: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Amara Osei',
    role: 'Mother of 3',
    country: 'Ghana',
    flag: '🇬🇭',
    initials: 'AO',
    rating: 5,
    quote:
      'KVL Track changed everything. My kids walk home from school and I can see every step. The geofence alerts me the second they arrive — I no longer hold my breath until I get a text. It\'s the kind of peace of mind I didn\'t know I needed.',
  },
  {
    name: 'Rohan Mehta',
    role: 'Son caring for elderly father',
    country: 'India',
    flag: '🇮🇳',
    initials: 'RM',
    rating: 5,
    quote:
      'My father lives alone in a different city. Fall detection and the routine monitoring have let him keep his independence while giving our family real assurance. He fell once — KVL Track\'s SOS fired before any of us even knew. That alert may have saved his life.',
  },
  {
    name: 'Sofia & James',
    role: 'Young couple',
    country: 'United Kingdom',
    flag: '🇬🇧',
    initials: 'SJ',
    rating: 5,
    quote:
      'We use journey sharing every single night. When either of us is out late, one tap lets the other follow along in real time. It removed all the "are you safe?" texts and replaced them with quiet confidence. Simple, beautiful, essential.',
  },
]

/* ── How It Works ───────────────────────────────────────────── */
export interface HowItWorksStep {
  step: number
  title: string
  description: string
  icon: string
}

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    step: 1,
    title: 'Download the App',
    description:
      'Available on iOS and Android. Install in under a minute — no account setup required to see it in action.',
    icon: 'Download',
  },
  {
    step: 2,
    title: 'Create Your Circle',
    description:
      'Set up your family circle with a unique name and optional photo. Choose who leads and who joins.',
    icon: 'CircleDot',
  },
  {
    step: 3,
    title: 'Invite Family',
    description:
      'Send invite links via WhatsApp, SMS, or email. Members join in one tap — no tech skills needed.',
    icon: 'UserPlus',
  },
  {
    step: 4,
    title: 'Stay Connected',
    description:
      'Live map, SOS, geofencing, and wellness features are live instantly. Your circle is always within reach.',
    icon: 'Wifi',
  },
]

/* ── Ecosystem Products ─────────────────────────────────────── */
export interface EcosystemProduct {
  id: string
  name: string
  tagline: string
  icon: string
  color: string
  href: string
}

export const ECOSYSTEM: EcosystemProduct[] = [
  {
    id: 'venus',
    name: 'Venus',
    tagline: 'Smart kids\' wearable with GPS',
    icon: 'Watch',
    color: 'from-pink-500 to-rose-600',
    href: '/products/venus',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    tagline: 'Senior safety pendant',
    icon: 'Shield',
    color: 'from-amber-500 to-orange-600',
    href: '/products/jupiter',
  },
  {
    id: 'titan',
    name: 'Titan',
    tagline: 'Rugged fleet tracker',
    icon: 'Truck',
    color: 'from-slate-500 to-slate-700',
    href: '/products/titan',
  },
  {
    id: 'cosmo-ai',
    name: 'Cosmo AI',
    tagline: 'AI safety assistant for families',
    icon: 'Sparkles',
    color: 'from-violet-500 to-purple-700',
    href: '/products/cosmo-ai',
  },
  {
    id: 'tag',
    name: 'Tag',
    tagline: 'Ultra-thin Bluetooth item tracker',
    icon: 'Tag',
    color: 'from-cyan-500 to-blue-600',
    href: '/products/tag',
  },
  {
    id: 'gravity',
    name: 'KVL Track',
    tagline: 'The family safety super-app',
    icon: 'Globe',
    color: 'from-blue-500 to-violet-600',
    href: '/',
  },
]
