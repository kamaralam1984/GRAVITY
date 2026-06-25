'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Users, Globe, Activity } from 'lucide-react';

const STATS = [
  { icon: <Users className="w-5 h-5" />, value: '2M+', label: 'Families Protected' },
  { icon: <Globe className="w-5 h-5" />, value: '50+', label: 'Countries' },
  { icon: <Activity className="w-5 h-5" />, value: '99.9%', label: 'Uptime' },
];

const VIDEO_ID = 'dQw4w9WgXcQ';

export default function VideoWalkthroughSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="relative py-24 overflow-hidden" style={{ background: '#0B0D13' }}>
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(212,168,83,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{
              background: 'rgba(212,168,83,0.08)',
              borderColor: 'rgba(212,168,83,0.3)',
            }}
          >
            <Play className="w-4 h-4" style={{ color: '#D4A853' }} />
            <span className="text-sm font-medium" style={{ color: '#D4A853' }}>
              Product Walkthrough
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Watch How KVL Track{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #D4A853 0%, #F5CC78 50%, #D4A853 100%)' }}
            >
              Protects Your Family
            </span>
          </h2>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
            3-minute product walkthrough
          </p>
        </motion.div>

        {/* Video thumbnail */}
        <motion.div
          className="relative rounded-3xl overflow-hidden cursor-pointer group mx-auto"
          style={{
            maxWidth: 820,
            aspectRatio: '16/9',
            background: 'linear-gradient(135deg, #0D1020 0%, #1a1500 50%, #0D1020 100%)',
            border: '1px solid rgba(212,168,83,0.25)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,83,0.1)',
          }}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.01 }}
        >
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(11,13,19,0.7) 0%, rgba(212,168,83,0.12) 50%, rgba(11,13,19,0.7) 100%)',
            }}
          />

          {/* Decorative lines */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  width: `${(i + 1) * 12}%`,
                  height: `${(i + 1) * 12}%`,
                  border: '1px solid rgba(212,168,83,0.6)',
                  borderRadius: '50%',
                }}
              />
            ))}
          </div>

          {/* Gold text watermark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-7xl font-black tracking-widest opacity-[0.04] select-none"
              style={{ color: '#D4A853' }}
            >
              KVL TRACK
            </span>
          </div>

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Pulsing rings */}
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: '2px solid rgba(212,168,83,0.4)',
                    borderRadius: '50%',
                  }}
                  animate={{
                    scale: [1, 1 + i * 0.4],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: 'easeOut',
                  }}
                />
              ))}

              {/* Main play circle */}
              <motion.div
                className="relative w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #D4A853 0%, #F5CC78 100%)',
                  boxShadow: '0 0 40px rgba(212,168,83,0.5)',
                }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Play className="w-8 h-8 text-black ml-1" fill="black" />
              </motion.div>
            </div>
          </div>

          {/* Duration badge */}
          <div
            className="absolute bottom-4 right-4 px-3 py-1 rounded-lg text-sm font-medium"
            style={{
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(8px)',
            }}
          >
            3:00
          </div>

          {/* Hover overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'rgba(212,168,83,0.04)' }}
          />
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="mt-12 flex flex-wrap justify-center gap-8 sm:gap-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} className="text-center flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(212,168,83,0.1)',
                  border: '1px solid rgba(212,168,83,0.25)',
                  color: '#D4A853',
                }}
              >
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Video modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsOpen(false)}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full rounded-2xl overflow-hidden"
              style={{
                maxWidth: 900,
                background: 'rgba(11,13,19,0.95)',
                border: '1px solid rgba(212,168,83,0.3)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,168,83,0.1)',
                backdropFilter: 'blur(20px)',
              }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)',
                }}
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>

              {/* iframe wrapper */}
              <div style={{ aspectRatio: '16/9' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="KVL Track Family Safety — Product Walkthrough"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
