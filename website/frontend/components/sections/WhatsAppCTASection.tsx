'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const WHATSAPP_URL =
  'https://wa.me/919999999999?text=Hi%20I%20want%20to%20know%20about%20KVL Track';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function WhatsAppCTASection() {
  return (
    <section className="relative py-20 overflow-hidden" style={{ background: '#080C10' }}>
      {/* Green glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(37,211,102,0.07) 0%, rgba(37,211,102,0.02) 40%, transparent 70%)',
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(37,211,102,1) 1px, transparent 1px), linear-gradient(90deg, rgba(37,211,102,1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Top/bottom borders */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(37,211,102,0.25), transparent)' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(37,211,102,0.25), transparent)' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* WhatsApp icon with pulsing ring */}
        <motion.div
          className="inline-flex items-center justify-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative">
            {/* Pulsing rings */}
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full"
                style={{
                  border: '2px solid rgba(37,211,102,0.4)',
                }}
                animate={{
                  scale: [1, 1 + i * 0.45],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: i * 0.55,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Icon container */}
            <div
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                boxShadow: '0 0 40px rgba(37,211,102,0.4), 0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <WhatsAppIcon className="w-10 h-10 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          Get KVL Track on{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
          >
            WhatsApp
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="text-lg mb-10 max-w-2xl mx-auto"
          style={{ color: 'rgba(255,255,255,0.55)' }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
        >
          Send your family location, SOS alerts, and check-ins directly via WhatsApp — no extra app, no extra step. KVL Track meets your family where they already are.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.26 }}
        >
          {[
            'Live location sharing',
            'SOS alerts',
            'Check-in reminders',
            'Geofence notifications',
            'AI safety reports',
          ].map((feat) => (
            <span
              key={feat}
              className="text-xs font-medium px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(37,211,102,0.08)',
                border: '1px solid rgba(37,211,102,0.25)',
                color: 'rgba(37,211,102,0.9)',
              }}
            >
              {feat}
            </span>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.34 }}
        >
          {/* Primary WhatsApp button */}
          <motion.a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base text-white transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              boxShadow: '0 4px 24px rgba(37,211,102,0.35)',
            }}
            whileHover={{ scale: 1.04, boxShadow: '0 8px 36px rgba(37,211,102,0.5)' }}
            whileTap={{ scale: 0.98 }}
          >
            <WhatsAppIcon className="w-5 h-5" />
            Chat on WhatsApp
          </motion.a>

          {/* Secondary demo button */}
          <motion.button
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300"
            style={{
              background: 'rgba(212,168,83,0.06)',
              border: '1.5px solid rgba(212,168,83,0.5)',
              color: '#D4A853',
            }}
            whileHover={{
              background: 'rgba(212,168,83,0.12)',
              boxShadow: '0 4px 24px rgba(212,168,83,0.2)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            Book a Free Demo
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Trust note */}
        <motion.p
          className="mt-8 text-xs"
          style={{ color: 'rgba(255,255,255,0.25)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          No spam. No cold calls. Just a friendly conversation about keeping your family safe.
        </motion.p>
      </div>
    </section>
  );
}
