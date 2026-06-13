const BASE_URL = 'https://gravity.trackalways.com'

/* ── Organization ─────────────────────────────────────────────────────────── */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'Trackalways Technologies Pvt Ltd',
    alternateName: 'Gravity by Trackalways',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/logo.png`,
      width: 200,
      height: 60,
    },
    foundingDate: '2022',
    description:
      "Trackalways Technologies Pvt Ltd builds Gravity — India's family safety operating system. Real-time location sharing, SOS alerts, geofencing, elderly care, and AI insights for 50,000+ families.",
    slogan: 'What Pulls You Together',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressRegion: 'Karnataka',
      addressLocality: 'Bangalore',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@trackalways.com',
        availableLanguage: ['English', 'Hindi'],
        areaServed: 'IN',
      },
    ],
    sameAs: [
      'https://www.instagram.com/trackalways',
      'https://www.linkedin.com/company/trackalways',
      'https://twitter.com/trackalways',
      'https://www.facebook.com/trackalways',
      'https://www.youtube.com/@trackalways',
    ],
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: 10,
      maxValue: 50,
    },
  }
}

/* ── WebSite ──────────────────────────────────────────────────────────────── */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Gravity by Trackalways',
    description:
      'Family safety app for India — real-time location sharing, SOS alerts, geofencing, elderly care, and AI family insights.',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-IN',
  }
}

/* ── SoftwareApplication ──────────────────────────────────────────────────── */
export function buildSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${BASE_URL}/#software`,
    name: 'Gravity',
    alternateName: 'Gravity by Trackalways',
    url: BASE_URL,
    downloadUrl: `${BASE_URL}/download`,
    applicationCategory: 'LifestyleApplication',
    applicationSubCategory: 'Family Safety',
    operatingSystem: 'Android, iOS',
    softwareVersion: '2.0',
    description:
      "Gravity is India's family safety operating system. Track family members in real-time, set geofence safe zones, send one-tap SOS alerts, and care for elderly parents — all in one app.",
    featureList: [
      'Real-time family location sharing',
      'SOS emergency alerts',
      'Geofence safe zones',
      'Child safety monitoring',
      'Elderly care suite',
      'Driving safety',
      'AI family assistant',
      'Family chat',
      'Crash detection',
      'Battery & signal monitoring',
    ],
    screenshot: `${BASE_URL}/screenshots/app-home.png`,
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'INR',
        description: 'Basic family location sharing for up to 5 members',
      },
      {
        '@type': 'Offer',
        name: 'Family Pro',
        price: '299',
        priceCurrency: 'INR',
        description: 'Full-featured family safety suite with unlimited history and premium alerts',
        billingDuration: 'P1M',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '12450',
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@id': `${BASE_URL}/#organization`,
    },
    inLanguage: 'en-IN',
    countriesSupported: 'IN',
  }
}

/* ── FAQPage ──────────────────────────────────────────────────────────────── */
export interface FAQItem {
  question: string
  answer: string
  // also accept shorthand q/a aliases used internally
  q?: string
  a?: string
}

export function buildFAQSchema(items: FAQItem[] | { q: string; a: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => {
      const question = (item as FAQItem).question ?? (item as { q: string }).q
      const answer = (item as FAQItem).answer ?? (item as { a: string }).a
      return {
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      }
    }),
  }
}

/* ── NewsArticle ──────────────────────────────────────────────────────────── */
export function buildArticleSchema(post: {
  title: string
  excerpt: string
  author: string
  date: string
  slug: string
  category: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.excerpt,
    url: `${BASE_URL}/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.date,
    articleSection: post.category,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.slug}`,
    },
    image: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/blog/og/${post.slug}.png`,
      width: 1200,
      height: 630,
    },
    inLanguage: 'en-IN',
  }
}

/* ── BreadcrumbList ───────────────────────────────────────────────────────── */
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/* ── Person ───────────────────────────────────────────────────────────────── */
export function buildPersonSchema(author: {
  name: string
  slug: string
  bio: string
  role: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BASE_URL}/blog/authors/${author.slug}/#person`,
    name: author.name,
    description: author.bio,
    jobTitle: author.role,
    url: `${BASE_URL}/blog/authors/${author.slug}`,
    worksFor: {
      '@id': `${BASE_URL}/#organization`,
    },
    image: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/blog/authors/${author.slug}.jpg`,
    },
  }
}

/* ── Product ──────────────────────────────────────────────────────────────── */
export function buildProductSchema(plan: {
  name: string
  price: string
  description: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Gravity ${plan.name}`,
    description: plan.description,
    brand: {
      '@type': 'Brand',
      name: 'Gravity by Trackalways',
    },
    url: `${BASE_URL}/pricing`,
    image: `${BASE_URL}/og-image.png`,
    offers: {
      '@type': 'Offer',
      price: plan.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/pricing`,
      seller: {
        '@id': `${BASE_URL}/#organization`,
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '12450',
      bestRating: '5',
    },
  }
}
