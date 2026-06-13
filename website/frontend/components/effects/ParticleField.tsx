'use client'

import { useRef, useEffect } from 'react'

/* ─────────────── types ─────────────── */
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  baseOpacity: number
  colorIndex: number  // 0=blue, 1=violet/slate, 2=white/indigo
}

/* ─────────────── seeded pseudo-random (no Math.random in render) ─────────────── */
function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

/* ─────────────── build particle list ─────────────── */
function buildParticles(w: number, h: number, count: number): Particle[] {
  const rand = seededRand(42)
  return Array.from({ length: count }, () => {
    const speed = 0.12 + rand() * 0.22
    const angle = rand() * Math.PI * 2
    return {
      x: rand() * w,
      y: rand() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 0.8 + rand() * 2.2,
      baseOpacity: 0.25 + rand() * 0.35,
      colorIndex: Math.floor(rand() * 3),
    }
  })
}

/* ─────────────── main component ─────────────── */
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // After null checks, capture into locals that TypeScript knows aren't null
    const cvs: HTMLCanvasElement = canvas
    const context: CanvasRenderingContext2D = ctx

    const CONNECTION_DISTANCE = 120
    const REPEL_RADIUS = 80
    const REPEL_STRENGTH = 1.8

    function isDark(): boolean {
      return document.documentElement.classList.contains('dark')
    }

    function getParticleColor(p: Particle, alpha: number): string {
      if (!isDark()) {
        const LIGHT = ['59,130,246', '100,116,139', '99,102,241']
        return `rgba(${LIGHT[p.colorIndex]},${alpha})`
      }
      const DARK = ['59,130,246', '139,92,246', '200,210,255']
      return `rgba(${DARK[p.colorIndex]},${alpha})`
    }

    function getLineColor(a: Particle, b: Particle, alpha: number): string {
      if (!isDark()) return `rgba(100,116,139,${alpha})`
      return a.colorIndex === b.colorIndex
        ? getParticleColor(a, alpha)
        : `rgba(99,111,246,${alpha})`
    }

    function opacityScale(): number {
      return isDark() ? 1.0 : 0.45
    }

    function particleCount(): number {
      const area = cvs.width * cvs.height
      const base = Math.floor(area / 22000)
      return Math.min(Math.max(base, 35), 65)
    }

    function resize() {
      cvs.width = cvs.offsetWidth
      cvs.height = cvs.offsetHeight
      particlesRef.current = buildParticles(cvs.width, cvs.height, particleCount())
    }

    function animate() {
      context.clearRect(0, 0, cvs.width, cvs.height)

      const particles = particlesRef.current
      const mouse = mouseRef.current
      const scale = opacityScale()

      // Update positions with mouse repulsion
      for (const p of particles) {
        if (mouse) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < REPEL_RADIUS && dist > 0) {
            const force = (REPEL_RADIUS - dist) / REPEL_RADIUS
            p.vx += (dx / dist) * force * 0.08 * REPEL_STRENGTH
            p.vy += (dy / dist) * force * 0.08 * REPEL_STRENGTH
          }
        }

        // Velocity cap
        const maxSpeed = 0.55
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed
          p.vy = (p.vy / speed) * maxSpeed
        }

        p.x += p.vx
        p.y += p.vy

        // Wrap around edges
        if (p.x < -5) p.x = cvs.width + 5
        if (p.x > cvs.width + 5) p.x = -5
        if (p.y < -5) p.y = cvs.height + 5
        if (p.y > cvs.height + 5) p.y = -5
      }

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DISTANCE) {
            const lineAlpha = (1 - dist / CONNECTION_DISTANCE) * 0.18 * scale
            context.beginPath()
            context.moveTo(particles[i].x, particles[i].y)
            context.lineTo(particles[j].x, particles[j].y)
            context.strokeStyle = getLineColor(particles[i], particles[j], lineAlpha)
            context.lineWidth = 0.75
            context.stroke()
          }
        }
      }

      // Draw particles on top
      for (const p of particles) {
        context.beginPath()
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        context.fillStyle = getParticleColor(p, p.baseOpacity * scale)
        context.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    function onMouseMove(e: MouseEvent) {
      const rect = cvs.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onMouseLeave() {
      mouseRef.current = null
    }

    const ro = new ResizeObserver(() => resize())
    ro.observe(cvs)

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave, { passive: true })

    resize()
    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
      ro.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
