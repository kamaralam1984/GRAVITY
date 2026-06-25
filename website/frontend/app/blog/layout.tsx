import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | KVL Track Blog',
    default: 'Family Safety Blog | Tips, Guides & News — KVL Track',
  },
  description:
    'Expert guides on family safety, GPS tracking, child protection, elderly care, and smart parenting. Written by safety experts at KVL Business Solutions.',
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
