'use client'

// Remote Control — picker page.
// Lets a parent choose which family member's device to remote-control /
// screen-mirror. Reuses the same family-membership API as the dashboard.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MonitorSmartphone, ChevronRight, Loader2, ShieldAlert } from 'lucide-react'
import { getToken, getUser } from '@/lib/auth'
import { familiesApi } from '@/lib/api'

interface Member {
  user_id: number
  name: string
  role?: string
  is_online?: boolean
}

const BG = '#0B0D13'
const GOLD = '#D4A853'
const GLASS = 'rgba(255,255,255,0.04)'
const BORDER = 'rgba(255,255,255,0.08)'

export default function RemoteControlPickerPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = getToken()
    const user = getUser()
    if (!token || !user) {
      router.replace('/login?redirect=/remote-control')
      return
    }

    async function load() {
      try {
        const families = await familiesApi.my()
        if (!Array.isArray(families) || families.length === 0) {
          setError('No family found. Create or join a family first.')
          setLoading(false)
          return
        }
        const fid = families[0].id
        const list = await familiesApi.members(fid)
        // Exclude the logged-in parent themselves from the controllable list
        const others = Array.isArray(list) ? list.filter((m: Member) => m.user_id !== user.id) : []
        setMembers(others)
      } catch (e: any) {
        setError(e?.message || 'Failed to load family members')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Remote Control</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, fontSize: 14 }}>
          View a family member&apos;s screen live and send taps/gestures remotely.
        </p>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.5)' }}>
            <Loader2 size={18} className="animate-spin" /> Loading family members…
          </div>
        )}

        {!loading && error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: 16 }}>
            <ShieldAlert size={18} /> {error}
          </div>
        )}

        {!loading && !error && members.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.5)' }}>No other family members to control.</div>
        )}

        {!loading && members.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {members.map((m) => (
              <Link
                key={m.user_id}
                href={`/remote-control/${m.user_id}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderRadius: 16, background: GLASS,
                  border: `1px solid ${BORDER}`, textDecoration: 'none', color: '#fff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <MonitorSmartphone size={20} color={GOLD} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: m.is_online ? '#10B981' : 'rgba(255,255,255,0.4)' }}>
                      {m.is_online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
