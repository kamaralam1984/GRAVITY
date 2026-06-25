import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog Article | KVL Track Family Safety',
  description:
    'Read expert family safety tips, GPS tracking guides, and parenting advice from KVL Track by KVL Business Solutions.',
  openGraph: {
    type: 'article',
  },
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
