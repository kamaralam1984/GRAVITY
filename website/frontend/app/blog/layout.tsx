import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Gravity Blog',
    default: 'Family Safety Blog | Tips, Guides & News — Gravity',
  },
  description:
    'Expert guides on family safety, GPS tracking, child protection, elderly care, and smart parenting. Written by safety experts at Trackalways.',
  keywords: [
    'family safety blog',
    'GPS tracking tips',
    'child safety guide',
    'parenting apps India',
  ],
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
