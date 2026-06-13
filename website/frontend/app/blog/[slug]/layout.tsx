import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog Article | Gravity Family Safety',
  description:
    'Read expert family safety tips, GPS tracking guides, and parenting advice from Gravity by Trackalways.',
  openGraph: {
    type: 'article',
  },
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
