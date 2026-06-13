import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Author | Gravity Blog',
  description:
    'Read articles from Gravity\'s family safety experts and contributors.',
}

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
