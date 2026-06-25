import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Super Admin — KVL TRACK',
  description: 'KVL TRACK Super Admin Control Center — Full system management',
  robots: { index: false, follow: false },
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
