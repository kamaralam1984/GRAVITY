import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog Category | KVL Track Family Safety',
  description:
    'Browse family safety articles by topic — safety tips, parenting guides, technology insights, and more.',
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
