import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gravity AI Guardian — Predictive Family Safety Intelligence',
  description:
    'AI-powered predictive safety engine that learns your family patterns and prevents emergencies before they happen.',
  keywords: ['AI family safety', 'predictive safety AI', 'family protection AI', 'Gravity AI Guardian'],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
