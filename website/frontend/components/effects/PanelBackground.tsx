'use client'

/* ─── PanelBackground ────────────────────────────────────────────────────────
 * VFX background for admin / dashboard panels.
 * position: fixed, inset: 0 — sits behind all panel content (z-index: 0).
 * Consists of:
 *   • 4 floating gradient orbs (CSS keyframe animation)
 *   • A subtle grid overlay
 * pointerEvents: none — never blocks interaction.
 * ──────────────────────────────────────────────────────────────────────────── */

export default function PanelBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── Keyframe + per-mode opacity rules ───────────────────────────────── */}
      <style>{`
        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -20px) scale(1.05); }
          66%       { transform: translate(-20px, 30px) scale(0.95); }
        }

        /* In light mode, reduce all orb opacity to 40–50% of dark values */
        html:not(.dark) .panel-orb { opacity: 0.025 !important; }
      `}</style>

      {/* ── Orb 1 — top-left: gold / amber ──────────────────────────────────── */}
      <div
        className="panel-orb"
        style={{
          position: 'absolute',
          top: '-120px',
          left: '-120px',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(245,158,11,0.9) 0%, rgba(251,191,36,0.5) 35%, transparent 70%)',
          opacity: 0.06,
          animation: 'float-orb 16s ease-in-out infinite',
          animationDelay: '0s',
        }}
      />

      {/* ── Orb 2 — top-right: blue / indigo ────────────────────────────────── */}
      <div
        className="panel-orb"
        style={{
          position: 'absolute',
          top: '-80px',
          right: '-100px',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(59,130,246,0.9) 0%, rgba(99,102,241,0.5) 35%, transparent 70%)',
          opacity: 0.06,
          animation: 'float-orb 20s ease-in-out infinite',
          animationDelay: '-6s',
        }}
      />

      {/* ── Orb 3 — bottom-center: purple / violet ───────────────────────────── */}
      <div
        className="panel-orb"
        style={{
          position: 'absolute',
          bottom: '-200px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(139,92,246,0.9) 0%, rgba(167,139,250,0.5) 35%, transparent 70%)',
          opacity: 0.04,
          animation: 'float-orb 24s ease-in-out infinite',
          animationDelay: '-10s',
        }}
      />

      {/* ── Orb 4 — bottom-right: emerald ───────────────────────────────────── */}
      <div
        className="panel-orb"
        style={{
          position: 'absolute',
          bottom: '-60px',
          right: '-60px',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(16,185,129,0.9) 0%, rgba(52,211,153,0.5) 35%, transparent 70%)',
          opacity: 0.05,
          animation: 'float-orb 18s ease-in-out infinite',
          animationDelay: '-3s',
        }}
      />

      {/* ── Grid overlay — dark mode ─────────────────────────────────────────── */}
      <div
        className="dark-grid"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: [
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Grid overlay — light mode ────────────────────────────────────────── */}
      <style>{`
        html:not(.dark) .dark-grid {
          background-image:
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px) !important;
        }
      `}</style>
    </div>
  )
}
