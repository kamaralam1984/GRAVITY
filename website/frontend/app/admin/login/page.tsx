'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react'
import { adminApi, setAdminToken } from '@/lib/api'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await adminApi.login(email, password)
      setAdminToken(result.access_token)
      localStorage.setItem("gravity_admin_auth", "true")
      router.push("/admin")
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please check your details.")
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--hero-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Background blobs */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--hero-blob1)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--hero-blob2)",
          pointerEvents: "none",
        }}
      />

      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ position: "absolute", top: 24, left: 24 }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-muted)",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 500,
            transition: "color 0.18s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <ArrowLeft size={14} />
          Back to main site
        </Link>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: "40px 36px",
          boxShadow: "var(--shadow-lg)",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C9913A, #D4A853, #B8720A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 800,
              fontSize: 26,
              color: "#fff",
              margin: "0 auto 16px",
              boxShadow: "0 8px 32px rgba(184,114,10,0.4)",
            }}
          >
            G
          </motion.div>

          <h1
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 800,
              fontSize: 22,
              margin: "0 0 6px",
              lineHeight: 1.2,
            }}
            className="gradient-text-gold"
          >
            Admin Portal
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
            Secure access to the KVL Track command center
          </p>
        </div>

        {/* Security badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(var(--gold-rgb),0.08)",
            border: "1px solid rgba(var(--gold-rgb),0.2)",
            borderRadius: 10,
            padding: "8px 14px",
            marginBottom: 24,
          }}
        >
          <Shield size={14} style={{ color: "var(--gold)", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Protected admin access — authorized personnel only
          </span>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                color: "var(--sos)",
                overflow: "hidden",
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Email */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 6,
                letterSpacing: "0.02em",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="kamaralamjdu@gmail.com"
              required
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                border: "1px solid var(--border-strong)",
                background: "var(--bg-surface2)",
                color: "var(--text-primary)",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.18s, box-shadow 0.18s",
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = "var(--gold)"
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(var(--gold-rgb),0.12)"
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = "var(--border-strong)"
                e.currentTarget.style.boxShadow = "none"
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 6,
                letterSpacing: "0.02em",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: "100%",
                  padding: "11px 42px 11px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border-strong)",
                  background: "var(--bg-surface2)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.18s, box-shadow 0.18s",
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = "var(--gold)"
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(var(--gold-rgb),0.12)"
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = "var(--border-strong)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.015 } : {}}
            whileTap={!loading ? { scale: 0.985 } : {}}
            className="btn-gold"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14.5,
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                  }}
                />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: 24,
          fontSize: 12,
          color: "var(--text-muted)",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        © 2025 KVL Business Solutions Technologies. Admin access only.
      </motion.p>
    </div>
  )
}
