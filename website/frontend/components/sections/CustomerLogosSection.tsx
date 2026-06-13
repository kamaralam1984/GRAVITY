'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';

interface LogoItem {
  name: string;
  initial: string;
  color: string;
}

const ROW_1: LogoItem[] = [
  { name: 'Delhi Public School', initial: 'DPS', color: '#4B80F0' },
  { name: 'Kendriya Vidyalaya', initial: 'KV', color: '#10B981' },
  { name: 'HDFC Bank', initial: 'HDFC', color: '#D4A853' },
  { name: 'Tata Group', initial: 'TATA', color: '#06B6D4' },
  { name: 'Infosys', initial: 'INFY', color: '#A855F7' },
  { name: 'Wipro', initial: 'WIPRO', color: '#F59E0B' },
  { name: 'Apollo Hospitals', initial: 'APL', color: '#EF4444' },
  { name: 'Fortis Healthcare', initial: 'FHC', color: '#10B981' },
];

const ROW_2: LogoItem[] = [
  { name: 'NHS UK', initial: 'NHS', color: '#4B80F0' },
  { name: 'Saudi Aramco', initial: 'ARMC', color: '#D4A853' },
  { name: 'Safaricom Kenya', initial: 'SCK', color: '#10B981' },
  { name: 'Etisalat UAE', initial: 'ETS', color: '#06B6D4' },
  { name: 'Standard Bank SA', initial: 'SBS', color: '#A855F7' },
  { name: 'University of Mumbai', initial: 'UOM', color: '#F59E0B' },
  { name: 'ITC Limited', initial: 'ITC', color: '#EF4444' },
  { name: 'Reliance Industries', initial: 'RIL', color: '#D4A853' },
];

function LogoPill({ item }: { item: LogoItem }) {
  return (
    <motion.div
      className="flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-full mx-3 cursor-default select-none transition-all duration-300 group"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
        minWidth: 'max-content',
      }}
      whileHover={{
        borderColor: 'rgba(212,168,83,0.5)',
        background: 'rgba(212,168,83,0.06)',
      }}
    >
      {/* Initial badge */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
        style={{
          background: `${item.color}18`,
          border: `1px solid ${item.color}40`,
          color: item.color,
        }}
      >
        {item.initial.slice(0, 2)}
      </div>
      <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.55)' }}>
        {item.name}
      </span>
    </motion.div>
  );
}

function MarqueeRow({
  items,
  direction = 'left',
  speed = 35,
}: {
  items: LogoItem[];
  direction?: 'left' | 'right';
  speed?: number;
}) {
  const doubled = [...items, ...items, ...items];
  const totalItems = items.length;

  return (
    <div className="overflow-hidden relative" style={{ maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)' }}>
      <motion.div
        className="flex items-center py-2"
        style={{ width: 'max-content' }}
        animate={{
          x: direction === 'left' ? ['0%', `-${100 / 3}%`] : [`-${100 / 3}%`, '0%'],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
      >
        {doubled.map((item, i) => (
          <LogoPill key={`${item.name}-${i}`} item={item} />
        ))}
      </motion.div>
    </div>
  );
}

export default function CustomerLogosSection() {
  return (
    <section className="relative py-20 overflow-hidden" style={{ background: '#0A0C12' }}>
      {/* Subtle top/bottom borders */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.2), transparent)' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.2), transparent)' }}
      />

      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,168,83,0.03) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(212,168,83,0.7)' }}>
            Trusted Globally
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Trusted by Families &amp; Organizations{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #D4A853 0%, #F5CC78 100%)' }}
            >
              Worldwide
            </span>
          </h2>
        </motion.div>

        {/* Marquee rows */}
        <div className="flex flex-col gap-4">
          <MarqueeRow items={ROW_1} direction="left" speed={40} />
          <MarqueeRow items={ROW_2} direction="right" speed={50} />
        </div>

        {/* Bottom count */}
        <motion.div
          className="text-center mt-10 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Joining{' '}
            <span style={{ color: '#D4A853' }}>4,500+</span>{' '}
            schools, hospitals, corporations and government bodies across 50+ countries
          </p>
        </motion.div>
      </div>
    </section>
  );
}
