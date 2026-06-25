import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Author | KVL Track Blog',
  description:
    'Read articles from KVL Track\'s family safety experts and contributors.',
}

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
