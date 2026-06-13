'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  BadgeCheck,
  DatabaseZap,
  Eye,
  Ban,
} from 'lucide-react';

interface TrustBadge {
  icon: React.ReactNode;
  title: string;
  description: string;
  glowColor: string;
  borderColor: string;
  bgGlow: string;
  delay: number;
}

const BADGES: TrustBadge[] = [
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: 'GDPR Compliant',
    description: 'Full compliance with EU General Data Protection Regulation. Your family\'s data rights are always protected.',
    glowColor: '#10B981',
    borderColor: 'rgba(16,185,129,0.4)',
    bgGlow: 'rgba(16,185,129,0.08)',
    delay: 0,
  },
  {
    icon: <BadgeCheck className="w-8 h-8" />,
    title: 'ISO 27001 Certified',
    description: 'International standard for information security management systems. Independently audited annually.',
    glowColor: '#D4A853',
    borderColor: 'rgba(212,168,83,0.4)',
    bgGlow: 'rgba(212,168,83,0.08)',
    delay: 0.08,
  },
  {
    icon: <BadgeCheck className="w-8 h-8" />,
    title: 'SOC 2 Type II',
    description: 'Rigorous third-party audit of security, availability, processing integrity, and confidentiality controls.',
    glowColor: '#4B80F0',
    borderColor: 'rgba(75,128,240,0.4)',
    bgGlow: 'rgba(75,128,240,0.08)',
    delay: 0.16,
  },
  {
    icon: <Lock className="w-8 h-8" />,
    title: 'End-to-End Encrypted',
    description: 'Every message, location ping, and alert is encrypted in transit and at rest. No one can intercept your data.',
    glowColor: '#A855F7',
    borderColor: 'rgba(168,85,247,0.4)',
    bgGlow: 'rgba(168,85,247,0.08)',
    delay: 0.24,
  },
  {
    icon: <DatabaseZap className="w-8 h-8" />,
    title: '256-bit AES Encryption',
    description: 'Military-grade AES-256 encryption secures all stored data. The same standard used by governments worldwide.',
    glowColor: '#06B6D4',
    borderColor: 'rgba(6,182,212,0.4)',
    bgGlow: 'rgba(6,182,212,0.08)',
    delay: 0.32,
  },
  {
    icon: <Ban className="w-8 h-8" />,
    title: 'Zero Data Selling',
    description: 'We will never sell, rent, or trade your personal or location data to any third party. Your family\'s privacy is not a product.',
    glowColor: '#F59E0B',
    borderColor: 'rgba(245,158,11,0.4)',
    bgGlow: 'rgba(245,158,11,0.08)',
    delay: 0.4,
  },
];

export default function TrustBadgesSection() {
  return (
    <section className="relative py-24 overflow-hidden" style={{ background: '#080A10' }}>
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,168,83,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,168,83,0.6) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow centre */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(212,168,83,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{
              background: 'rgba(212,168,83,0.08)',
              borderColor: 'rgba(212,168,83,0.3)',
            }}>
            <ShieldCheck className="w-4 h-4" style={{ color: '#D4A853' }} />
            <span className="text-sm font-medium" style={{ color: '#D4A853' }}>
              Enterprise-Grade Security
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Your Family's Data is{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #D4A853 0%, #F5CC78 50%, #D4A853 100%)' }}
            >
              Fortress-Protected
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Every certification, every audit, every encryption standard — because your loved ones deserve nothing less than the gold standard in security.
          </p>
        </motion.div>

        {/* Badge grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BADGES.map((badge) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: badge.delay }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="relative rounded-2xl p-6 cursor-default group"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, ${badge.bgGlow} 100%)`,
                border: `1px solid ${badge.borderColor}`,
                backdropFilter: 'blur(12px)',
                boxShadow: `0 4px 32px ${badge.glowColor}18, inset 0 1px 0 rgba(255,255,255,0.06)`,
              }}
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: `0 0 40px ${badge.glowColor}30` }}
              />

              {/* Icon circle */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                style={{
                  background: `${badge.bgGlow}`,
                  border: `1px solid ${badge.borderColor}`,
                  color: badge.glowColor,
                }}
              >
                {badge.icon}
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{badge.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {badge.description}
              </p>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-6 right-6 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${badge.glowColor}60, transparent)` }}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom trust strip */}
        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Audited annually by independent third-party security firms &bull; DPDP Act India compliant &bull; CCPA Ready
          </p>
        </motion.div>
      </div>
    </section>
  );
}
