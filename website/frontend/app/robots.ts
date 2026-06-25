import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/admin/*', '/api/*'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin'],
      },
    ],
    sitemap: 'https://gravity.kvlbusinesssolutions.com/sitemap.xml',
    host: 'https://gravity.kvlbusinesssolutions.com',
  }
}
