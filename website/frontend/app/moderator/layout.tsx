import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Moderator Panel — KVL TRACK',
  description: 'KVL TRACK moderator dashboard for support tickets, user reports, and content moderation.',
  robots: { index: false, follow: false },
}

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
