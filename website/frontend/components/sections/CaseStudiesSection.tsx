'use client';

import { motion } from 'framer-motion';
import { ArrowRight, School, Heart, Car } from 'lucide-react';

interface CaseStat {
  value: string;
  label: string;
}

interface CaseStudy {
  category: string;
  categoryColor: string;
  categoryBg: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  stats: CaseStat[];
  accentColor: string;
  delay: number;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    category: 'School Safety',
    categoryColor: '#4B80F0',
    categoryBg: 'rgba(75,128,240,0.12)',
    icon: <School className="w-5 h-5" />,
    title: 'How DPS Noida Reduced Child Safety Incidents by 94%',
    description:
      'Delhi Public School Noida deployed Gravity\'s AI-powered zone monitoring and emergency alert system across their campus. Real-time location tracking and SOS alerts transformed safety outcomes within 6 months of deployment.',
    stats: [
      { value: '1,200', label: 'Students Protected' },
      { value: '94%', label: 'Incident Reduction' },
      { value: '0', label: 'Incidents Since Deployment' },
    ],
    accentColor: '#4B80F0',
    delay: 0,
  },
  {
    category: 'Elder Care',
    categoryColor: '#10B981',
    categoryBg: 'rgba(16,185,129,0.12)',
    icon: <Heart className="w-5 h-5" />,
    title: 'Senior Care Home Detects 47 Fall Emergencies with Gravity Elder',
    description:
      'A leading senior care facility integrated Gravity Elder\'s fall detection and vitals monitoring for their residents. The AI engine flagged 47 emergencies before staff could manually detect them, saving critical response minutes.',
    stats: [
      { value: '340', label: 'Elderly Residents' },
      { value: '47', label: 'Emergencies Detected' },
      { value: '3.2min', label: 'Avg Response Time' },
    ],
    accentColor: '#10B981',
    delay: 0.1,
  },
  {
    category: 'Driving Safety',
    categoryColor: '#D4A853',
    categoryBg: 'rgba(212,168,83,0.12)',
    icon: <Car className="w-5 h-5" />,
    title: 'Teen Driver Risk Reduced 67% at Tata Motors Family Program',
    description:
      'Tata Motors\' employee family wellness program rolled out Gravity\'s teen driving coach to 850 families. Harsh braking, speed alerts, and AI coaching delivered measurable risk reduction across the entire cohort.',
    stats: [
      { value: '850', label: 'Teen Drivers' },
      { value: '67%', label: 'Risk Reduction' },
      { value: '4.8★', label: 'Parent Satisfaction' },
    ],
    accentColor: '#D4A853',
    delay: 0.2,
  },
];

export default function CaseStudiesSection() {
  return (
    <section className="relative py-24 overflow-hidden" style={{ background: '#0B0D13' }}>
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(212,168,83,0.04) 0%, transparent 70%)',
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
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{
              background: 'rgba(212,168,83,0.08)',
              borderColor: 'rgba(212,168,83,0.3)',
            }}
          >
            <span className="text-sm font-medium" style={{ color: '#D4A853' }}>
              Real Results, Real Families
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Case{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #D4A853 0%, #F5CC78 50%, #D4A853 100%)' }}
            >
              Studies
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Measurable safety improvements across schools, elder care, and family programs worldwide.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CASE_STUDIES.map((cs) => (
            <motion.article
              key={cs.title}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: cs.delay }}
              whileHover={{ y: -6 }}
              className="relative rounded-2xl overflow-hidden flex flex-col group"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              {/* Gold accent left border */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                style={{
                  background: `linear-gradient(180deg, ${cs.accentColor}00 0%, ${cs.accentColor} 40%, ${cs.accentColor} 60%, ${cs.accentColor}00 100%)`,
                }}
              />

              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: `0 0 40px ${cs.accentColor}18` }}
              />

              <div className="flex-1 p-7 pl-8">
                {/* Category badge */}
                <div className="flex items-center gap-2 mb-5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: cs.categoryBg, color: cs.categoryColor }}
                  >
                    {cs.icon}
                  </div>
                  <span
                    className="text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full"
                    style={{ background: cs.categoryBg, color: cs.categoryColor }}
                  >
                    {cs.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-4 leading-snug">
                  {cs.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {cs.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {cs.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl p-3 text-center"
                      style={{
                        background: `${cs.accentColor}0A`,
                        border: `1px solid ${cs.accentColor}25`,
                      }}
                    >
                      <div className="text-xl font-bold" style={{ color: cs.accentColor }}>
                        {stat.value}
                      </div>
                      <div className="text-[10px] leading-tight mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="px-7 pb-7 pl-8">
                <motion.button
                  className="flex items-center gap-2 text-sm font-semibold group/btn transition-colors"
                  style={{ color: cs.accentColor }}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  Read Case Study
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </motion.button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300"
            style={{
              background: 'rgba(212,168,83,0.1)',
              border: '1px solid rgba(212,168,83,0.35)',
              color: '#D4A853',
            }}
          >
            View All Case Studies
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
