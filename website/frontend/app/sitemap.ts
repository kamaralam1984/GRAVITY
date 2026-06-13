import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gravity.trackalways.com'
  const now = new Date()

  /* ── Static pages ───────────────────────────────────────────────────────── */
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: baseUrl + '/features', lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: baseUrl + '/pricing', lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: baseUrl + '/child-safety', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: baseUrl + '/elderly-care', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: baseUrl + '/sos-emergency', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: baseUrl + '/live-tracking', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: baseUrl + '/geofencing', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: baseUrl + '/ai-assistant', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: baseUrl + '/driving-safety', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: baseUrl + '/family-tracking', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: baseUrl + '/integrations', lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: baseUrl + '/integrations/titan', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: baseUrl + '/integrations/venus', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: baseUrl + '/integrations/cosmo', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: baseUrl + '/compare/life360', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: baseUrl + '/compare/google-family', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: baseUrl + '/compare/find-my-friends', lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: baseUrl + '/compare/family-orbit', lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: baseUrl + '/case-studies', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: baseUrl + '/blog', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: baseUrl + '/about', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: baseUrl + '/careers', lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: baseUrl + '/press', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: baseUrl + '/contact', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: baseUrl + '/help', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: baseUrl + '/api-docs', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: baseUrl + '/privacy', lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: baseUrl + '/terms', lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: baseUrl + '/cookies', lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: baseUrl + '/status', lastModified: now, changeFrequency: 'daily', priority: 0.5 },
  ]

  /* ── Blog posts ─────────────────────────────────────────────────────────── */
  const blogSlugs = [
    // Featured article
    'the-hidden-cost-of-not-knowing-why-families-need-real-time-location-sharing-in-2025',
    // Regular posts
    'geofencing-101-how-virtual-boundaries-keep-your-kids-safer',
    'the-psychology-of-family-safety-why-anxiety-goes-down-when-everyone-is-trackable',
    'gps-vs-cell-tower-tracking-what-every-parent-should-know',
    'setting-up-emergency-sos-a-complete-guide-for-indian-families',
    'how-gravity-protects-your-privacy-while-keeping-families-safe',
    'senior-care-at-a-distance-how-tech-is-helping-adult-children-stay-connected',
  ]

  const blogPostPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  /* ── Blog category pages ────────────────────────────────────────────────── */
  const blogCategories = ['safety', 'parenting', 'technology', 'health', 'company']

  const blogCategoryPages: MetadataRoute.Sitemap = blogCategories.map((cat) => ({
    url: `${baseUrl}/blog/category/${cat}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  /* ── Author pages ───────────────────────────────────────────────────────── */
  const authorSlugs = [
    'priya-sharma',
    'dr-ananya-mehta',
    'rohan-iyer',
    'kavita-nair',
    'arjun-malhotra',
  ]

  const authorPages: MetadataRoute.Sitemap = authorSlugs.map((slug) => ({
    url: `${baseUrl}/blog/authors/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  /* ── Location pages ─────────────────────────────────────────────────────── */
  const cities = [
    'mumbai',
    'delhi',
    'bangalore',
    'chennai',
    'hyderabad',
    'pune',
    'kolkata',
    'ahmedabad',
    'jaipur',
    'surat',
    'lucknow',
    'chandigarh',
    'bhopal',
    'nagpur',
    'indore',
  ]

  const locationPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/locations`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ...cities.map((city) => ({
      url: `${baseUrl}/locations/${city}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]

  return [
    ...staticPages,
    ...blogPostPages,
    ...blogCategoryPages,
    ...authorPages,
    ...locationPages,
  ]
}
