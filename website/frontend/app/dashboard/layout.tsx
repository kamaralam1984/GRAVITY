import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Dashboard — GRAVITY',
  description: 'Your family safety dashboard — real-time location, alerts, and family status.',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
