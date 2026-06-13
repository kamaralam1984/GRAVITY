'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type SOSSize = 'sm' | 'md' | 'lg'

interface SOSButtonProps {
  size?: SOSSize
  onTriggered?: () => void
  demoMode?: boolean
}

const SIZE_MAP: Record<SOSSize, { outer: number; inner: number; fontSize: string; strokeW: number }> = {
  sm: { outer: 100, inner: 72, fontSize: '1rem', strokeW: 4 },
  md: { outer: 140, inner: 104, fontSize: '1.35rem', strokeW: 5 },
  lg: { outer: 180, inner: 136, fontSize: '1.65rem', strokeW: 6 },
}

const HOLD_INTERVAL_MS = 30
const HOLD_INCREMENT = 100 / (2000 / HOLD_INTERVAL_MS) // 2 seconds to full

export default function SOSButton({ size = 'md', onTriggered, demoMode = false }: SOSButtonProps) {
  const [isHolding, setIsHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isTriggered, setIsTriggered] = useState(false)
  const [showFlash, setShowFlash] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef(0)

  const { outer, inner, fontSize, strokeW } = SIZE_MAP[size]
  const radius = (outer - strokeW * 2) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const triggerSOS = useCallback(() => {
    setIsTriggered(true)
    setShowFlash(true)
    setProgress(100)
    setIsHolding(false)
    setTimeout(() => setShowFlash(false), 600)
    onTriggered?.()
  }, [onTriggered])

  const startHold = useCallback((e: React.PointerEvent) => {
    if (isTriggered) return
    e.preventDefault()
    setIsHolding(true)
    progressRef.current = progress

    intervalRef.current = setInterval(() => {
      progressRef.current = Math.min(100, progressRef.current + HOLD_INCREMENT)
      setProgress(progressRef.current)
      if (progressRef.current >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        triggerSOS()
      }
    }, HOLD_INTERVAL_MS)
  }, [isTriggered, progress, triggerSOS])

  const endHold = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsHolding(false)
    if (progressRef.current < 100) {
      setProgress(0)
      progressRef.current = 0
    }
  }, [])

  const cancel = useCallback(() => {
    setIsTriggered(false)
    setProgress(0)
    progressRef.current = 0
    setIsHolding(false)
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const activeGlow = isHolding || isTriggered

  return (
    <div className="relative flex flex-col items-center gap-4 select-none">
      {/* Screen flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] pointer-events-none"
            style={{ background: 'rgba(239,68,68,0.55)' }}
          />
        )}
      </AnimatePresence>

      {/* Expanding ping rings when holding */}
      <AnimatePresence>
        {(isHolding || isTriggered) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute rounded-full border-2 border-red-500"
                initial={{ width: outer, height: outer, opacity: 0.7 }}
                animate={{ width: outer * 1.9, height: outer * 1.9, opacity: 0 }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* SVG Progress Ring + Button */}
      <div className="relative flex items-center justify-center" style={{ width: outer, height: outer }}>
        {/* Progress SVG ring */}
        <svg
          width={outer}
          height={outer}
          className="absolute top-0 left-0 -rotate-90"
          style={{ pointerEvents: 'none' }}
        >
          {/* Track */}
          <circle
            cx={outer / 2}
            cy={outer / 2}
            r={radius}
            fill="none"
            stroke="rgba(239,68,68,0.15)"
            strokeWidth={strokeW}
          />
          {/* Progress */}
          <motion.circle
            cx={outer / 2}
            cy={outer / 2}
            r={radius}
            fill="none"
            stroke="#EF4444"
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.03s linear' }}
          />
        </svg>

        {/* Button core */}
        <motion.button
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          whileTap={{ scale: 0.94 }}
          disabled={isTriggered}
          className="relative flex items-center justify-center rounded-full cursor-pointer overflow-hidden"
          style={{
            width: inner,
            height: inner,
            background: activeGlow
              ? 'radial-gradient(circle at 35% 35%, #F87171, #EF4444 55%, #DC2626)'
              : 'radial-gradient(circle at 35% 35%, #F87171, #EF4444 55%, #B91C1C)',
            boxShadow: activeGlow
              ? '0 0 60px rgba(239,68,68,0.7), 0 0 20px rgba(239,68,68,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
              : '0 0 40px rgba(239,68,68,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.15)',
            transition: 'box-shadow 0.2s ease, background 0.2s ease',
            touchAction: 'none',
          }}
          aria-label="SOS Emergency Button"
        >
          {/* Inner highlight */}
          <div
            className="absolute top-2 left-3 rounded-full opacity-30"
            style={{ width: inner * 0.35, height: inner * 0.18, background: 'rgba(255,255,255,0.8)', filter: 'blur(4px)' }}
          />

          <AnimatePresence mode="wait">
            {isTriggered ? (
              <motion.div
                key="triggered"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-0.5"
              >
                <motion.span
                  className="font-bold text-white"
                  style={{ fontSize: 'calc(' + fontSize + ' * 0.65)', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  SENDING
                </motion.span>
                <span
                  className="text-white/80"
                  style={{ fontSize: 'calc(' + fontSize + ' * 0.5)', fontFamily: "'Inter', sans-serif" }}
                >
                  location...
                </span>
              </motion.div>
            ) : (
              <motion.span
                key="sos"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold text-white tracking-widest"
                style={{
                  fontSize,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  letterSpacing: '0.12em',
                }}
              >
                SOS
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Status text */}
      <div className="text-center min-h-[2.5rem]">
        <AnimatePresence mode="wait">
          {isTriggered ? (
            <motion.div
              key="triggered-text"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex flex-col items-center gap-1"
            >
              <motion.p
                className="text-sm font-semibold"
                style={{ color: '#EF4444', fontFamily: "'Inter', sans-serif" }}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                SOS Alert Sent
              </motion.p>
              {demoMode && (
                <p className="text-xs" style={{ color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>
                  Demo mode — no real alert sent
                </p>
              )}
            </motion.div>
          ) : isHolding ? (
            <motion.p
              key="holding-text"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm"
              style={{ color: '#FCA5A5', fontFamily: "'Inter', sans-serif" }}
            >
              Hold to send SOS…
            </motion.p>
          ) : (
            <motion.p
              key="idle-text"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs"
              style={{ color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}
            >
              Hold 2 seconds to trigger
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Cancel button */}
      <AnimatePresence>
        {isTriggered && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            onClick={cancel}
            className="px-5 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{
              backdropFilter: 'blur(12px)',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.35)',
              color: '#FCA5A5',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Cancel Alert
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
