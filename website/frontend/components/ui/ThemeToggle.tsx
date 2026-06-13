'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains('dark'))

    // Keep in sync if another component toggles the theme
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  function toggle() {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('gravity-theme', isDark ? 'dark' : 'light')
    setDark(isDark)
  }

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={className}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'var(--bg-surface2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        outline: 'none',
        flexShrink: 0,
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.boxShadow = dark
          ? '0 0 12px rgba(245,158,11,0.35), 0 0 24px rgba(245,158,11,0.15)'
          : '0 0 12px rgba(59,130,246,0.3), 0 0 24px rgba(59,130,246,0.12)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.boxShadow = 'none'
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted ? (
          dark ? (
            <motion.span
              key="sun"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Sun size={18} color="#F59E0B" strokeWidth={2} />
            </motion.span>
          ) : (
            <motion.span
              key="moon"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Moon size={18} color="var(--primary)" strokeWidth={2} />
            </motion.span>
          )
        ) : (
          // Placeholder during SSR / before hydration to avoid layout shift
          <span key="placeholder" style={{ width: 18, height: 18, display: 'block' }} />
        )}
      </AnimatePresence>
    </motion.button>
  )
}
