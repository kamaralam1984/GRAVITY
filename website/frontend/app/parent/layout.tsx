import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Parent Dashboard — GRAVITY Family Safety',
  description: 'Monitor your entire family in real time — live location, geofences, SOS alerts, battery status, and daily journey history.',
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
