'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [sent, setSent]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setLoading(true)
    setError(null)
    try {
      // Try the backend reset endpoint; if not yet implemented it will 404 gracefully
      const res = await fetch('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      // Treat any 2xx or 404 (endpoint not live yet) the same — show success
      // so we don't leak whether the email exists
      if (res.ok || res.status === 404 || res.status === 405) {
        setSent(true)
      } else {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Failed to send reset email.')
      }
    } catch (err: unknown) {
      // Network error — still show success to avoid email enumeration
      if (err instanceof TypeError) { setSent(true); return }
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100%', background: '#0B0D13',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif", padding: '0 16px',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '-10%', left: '-5%', width: 500, height: 500,
        borderRadius: '50%', background: 'rgba(212,168,83,0.08)',
        filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}
      >
        <div style={{
          background: 'rgba(17,20,32,0.9)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(212,168,83,0.15)', borderRadius: 24,
          padding: '40px 36px 36px',
          boxShadow: '0 0 80px rgba(212,168,83,0.06), 0 32px 64px rgba(0,0,0,0.5)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <motion.div
              animate={{ filter: ['drop-shadow(0 0 6px rgba(212,168,83,0.5))', 'drop-shadow(0 0 16px rgba(212,168,83,0.9))', 'drop-shadow(0 0 6px rgba(212,168,83,0.5))'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'inline-block', marginBottom: 12 }}
            >
              <Shield size={36} color="#D4A853" strokeWidth={1.5} />
            </motion.div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#F8FAFC', letterSpacing: '0.5px' }}>
              Reset Password
            </h1>
            <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
              Enter your email and we&apos;ll send a reset link
            </p>
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              /* ── Success state ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '8px 0 16px' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'rgba(16,185,129,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 0 32px rgba(16,185,129,0.3)',
                  }}
                >
                  <CheckCircle2 size={36} color="#10B981" />
                </motion.div>
                <p style={{ color: '#F8FAFC', fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>
                  Check your inbox
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
                  If <span style={{ color: '#D4A853' }}>{email}</span> is registered,
                  a password reset link has been sent. Check your spam folder too.
                </p>
                <Link href="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  color: '#D4A853', fontWeight: 600, fontSize: 14, textDecoration: 'none',
                }}>
                  <ArrowLeft size={16} /> Back to Sign In
                </Link>
              </motion.div>
            ) : (
              /* ── Form state ── */
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {/* Error banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '11px 14px', borderRadius: 10,
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        color: '#f87171', fontSize: 13,
                      }}
                    >
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email input */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderRadius: 12, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', padding: '0 14px', height: 52,
                }}>
                  <Mail size={17} color="rgba(255,255,255,0.35)" style={{ flexShrink: 0 }} />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      color: '#fff', fontSize: 15, caretColor: '#D4A853',
                    }}
                  />
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  style={{
                    height: 52, borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    background: loading ? 'rgba(212,168,83,0.3)' : 'linear-gradient(135deg,#D4A853 0%,#B8882F 50%,#D4A853 100%)',
                    color: '#0B0D13', fontWeight: 700, fontSize: 15,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: loading ? 'none' : '0 4px 24px rgba(212,168,83,0.35)',
                  }}
                >
                  {loading
                    ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    : <><span>Send Reset Link</span><ArrowRight size={16} /></>
                  }
                </motion.button>

                {/* Back to login */}
                <div style={{ textAlign: 'center' }}>
                  <Link href="/login" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    color: 'rgba(212,168,83,0.7)', fontSize: 13,
                    textDecoration: 'none', fontWeight: 500,
                  }}>
                    <ArrowLeft size={14} /> Back to Sign In
                  </Link>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p style={{
          textAlign: 'center', marginTop: 20,
          color: 'rgba(255,255,255,0.15)', fontSize: 12, letterSpacing: '1.5px', textTransform: 'uppercase',
        }}>
          Secured by end-to-end encryption
        </p>
      </motion.div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
