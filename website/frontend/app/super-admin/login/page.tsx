'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { setAuth } from '@/lib/auth'
import type { AuthUser } from '@/lib/auth'

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If already logged in as super_admin, go straight to panel
  useEffect(() => {
    try {
      const raw = localStorage.getItem('gv_user')
      if (!raw) return
      const u = JSON.parse(raw) as AuthUser
      if (u.role === 'super_admin' && localStorage.getItem('gv_token')) {
        router.replace('/super-admin')
      }
    } catch {}
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/auth/login/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || 'Invalid credentials')
        setLoading(false)
        return
      }
      const user: AuthUser = data.user
      if (user.role !== 'super_admin') {
        setError('Access denied — Super Admin credentials required')
        setLoading(false)
        return
      }
      const token: string = data.access_token
      setAuth(token, user)
      document.cookie = `gv_token=${token}; path=/; max-age=604800; SameSite=Lax`
      document.cookie = `gv_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=604800; SameSite=Lax`
      window.location.href = '/super-admin'
    } catch {
      setError('Connection error — please try again')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #060810 0%, #0a0d1a 50%, #060810 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 400, position: 'relative', zIndex: 10,
        background: 'rgba(15,17,25,0.95)',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: 24, padding: '40px 32px',
        boxShadow: '0 0 60px rgba(139,92,246,0.1), 0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #6D28D9, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(139,92,246,0.35)',
          }}>
            <ShieldAlert size={28} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 22, margin: '0 0 6px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Super Admin
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>
            Trackalways Command Center
          </p>
        </div>

        {/* Restricted badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, padding: '8px 14px', marginBottom: 24,
        }}>
          <span style={{ fontSize: 14 }}>🔒</span>
          <span style={{ fontSize: 12, color: 'rgba(239,68,68,0.8)' }}>Restricted — authorized personnel only</span>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: '#EF4444',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com" required autoComplete="username"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, boxSizing: 'border-box',
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                color: '#fff', fontSize: 14, outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter password" required autoComplete="current-password"
                style={{
                  width: '100%', padding: '11px 42px 11px 14px', borderRadius: 10, boxSizing: 'border-box',
                  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                  color: '#fff', fontSize: 14, outline: 'none',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none', marginTop: 4,
            background: loading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #6D28D9, #8B5CF6)',
            color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: loading ? 'none' : '0 4px 20px rgba(139,92,246,0.35)',
            transition: 'all 0.2s',
          }}>
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                Verifying...
              </>
            ) : 'Sign In to Command Center'}
          </button>
        </form>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        © 2025 Trackalways Technologies. Unauthorized access is prohibited.
      </p>
    </div>
  )
}
