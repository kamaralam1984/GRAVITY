'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { FileText, CheckCircle, AlertTriangle, CreditCard, Scale, Mail, Shield, Users } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    icon: CheckCircle,
    content: "By downloading, installing, or using the Gravity application, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, do not use the service. You must be at least 13 years old to create an account and use Gravity. Users between the ages of 13 and 18 must have verifiable parental or guardian consent before registering. Your continued use of the service following any updates to these terms constitutes acceptance of the revised terms. We recommend reviewing this page periodically to stay informed of any changes that may affect your rights.",
    bullets: [] as string[],
  },
  {
    id: "description",
    title: "2. Description of Service",
    icon: Shield,
    content: "Gravity is a family safety and location sharing platform developed and operated by Trackalways Technologies Private Limited. The service enables consenting family members and trusted individuals to share real-time location data, set geofencing alerts for places like home and school, send emergency SOS signals to the family circle, and access wellness and check-in features. Gravity is intended for personal, non-commercial use only. We reserve the right to modify, suspend, or discontinue any feature of the service at any time with reasonable notice to users.",
    bullets: [] as string[],
  },
  {
    id: "registration",
    title: "3. Account Registration",
    icon: Users,
    content: "To access the full features of Gravity, you must register for an account. You agree to provide accurate, current, and complete information during registration and to keep this information up to date. Each individual may maintain only one active account. Sharing accounts between multiple individuals is not permitted. You are solely responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. If you suspect unauthorized access to your account, you must notify us immediately at support@trackalways.com. We are not liable for any loss arising from unauthorized account use.",
    bullets: [] as string[],
  },
  {
    id: "acceptable-use",
    title: "4. Acceptable Use",
    icon: AlertTriangle,
    content: "You agree to use Gravity only for lawful purposes and in accordance with these terms. The following activities are strictly prohibited on the platform.",
    bullets: [
      "Tracking any individual without their explicit knowledge and consent",
      "Reselling, sublicensing, or commercially redistributing access to the service",
      "Reverse engineering, decompiling, or attempting to extract the source code of the application",
      "Misusing or falsely triggering the SOS emergency feature",
      "Uploading or transmitting malicious code, spam, or any content that violates applicable law",
      "Circumventing any security, access control, or rate-limiting mechanism of the platform",
      "Using the service to harass, stalk, or intimidate any individual",
    ],
  },
  {
    id: "location-consent",
    title: "5. Location Sharing and Consent",
    icon: Shield,
    content: "All location tracking within Gravity is consensual and transparent. Location sharing is activated only after the user explicitly grants location permission through the operating system permission dialog. Every member of a family circle can see who has access to their location at all times. Users may pause location sharing at any time directly from the app without requiring action from any other circle member. Gravity does not engage in hidden, covert, or background tracking of any kind. Location data is visible only to members of the approved family circle and is never shared with advertisers, data brokers, or other external parties.",
    bullets: [] as string[],
  },
  {
    id: "privacy",
    title: "6. Privacy",
    icon: Shield,
    content: "Your use of Gravity is also governed by our Privacy Policy, which is incorporated into these Terms of Service by reference. The Privacy Policy describes in detail how we collect, use, store, and protect your personal information, including location data. By agreeing to these Terms of Service, you also agree to the practices described in the Privacy Policy. We encourage you to read the Privacy Policy carefully before using the service. If you have any privacy-related questions or concerns, you may contact our privacy team at privacy@trackalways.com at any time.",
    bullets: [] as string[],
  },
  {
    id: "billing",
    title: "7. Subscription and Billing",
    icon: CreditCard,
    content: "Gravity offers a free tier with core features available at no charge. Premium features are available through paid subscription plans billed on a monthly or annual basis. All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes where required by law. Subscriptions are set to auto-renew at the end of each billing period unless cancelled in advance. You authorize Gravity to charge your designated payment method at the applicable rate. We reserve the right to change subscription pricing with at least 30 days prior notice. Continued use of the paid service after a price change constitutes acceptance of the new pricing.",
    bullets: [] as string[],
  },
  {
    id: "cancellation",
    title: "8. Cancellation and Refunds",
    icon: FileText,
    content: "You may cancel your Gravity subscription at any time directly from the account settings within the app or web dashboard. Cancellation takes effect at the end of the current billing period, after which your account will revert to the free tier. Monthly subscriptions are non-refundable for any partial month remaining after cancellation. Annual subscriptions that are cancelled within the first 7 days of a new billing cycle may be eligible for a prorated refund for the unused portion of the year, at our discretion. Refund requests should be submitted to billing@trackalways.com with your account details and reason for cancellation.",
    bullets: [] as string[],
  },
  {
    id: "intellectual-property",
    title: "9. Intellectual Property",
    icon: Scale,
    content: "The Gravity application, including its design, branding, software code, algorithms, user interface, and all related documentation, is the exclusive intellectual property of Trackalways Technologies Private Limited and is protected under applicable copyright, trademark, and intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable license to use the application for its intended personal purpose. All rights not expressly granted to you are reserved by Gravity. You retain full ownership of the personal data you generate and upload to the service. Gravity claims no ownership rights over your personal content.",
    bullets: [] as string[],
  },
  {
    id: "disclaimers",
    title: "10. Disclaimers",
    icon: AlertTriangle,
    content: "The Gravity service is provided on an as-is and as-available basis without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or completely secure at all times. Location accuracy depends on device hardware, GPS signal strength, and network availability and may not be sufficient for emergency response purposes. You should not rely solely on Gravity for emergency services. In an emergency situation, always contact local emergency services directly. We disclaim all implied warranties of merchantability, fitness for a particular purpose, and non-infringement to the fullest extent permitted by applicable law.",
    bullets: [] as string[],
  },
  {
    id: "liability",
    title: "11. Limitation of Liability",
    icon: Scale,
    content: "To the fullest extent permitted by applicable law, Trackalways Technologies Private Limited and its officers, directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Gravity service. This includes, without limitation, loss of data, loss of profits, personal injury, or property damage. In all cases, the aggregate liability of Gravity to you for any claims arising from your use of the service shall not exceed the total amount you paid to Gravity in the twelve months immediately preceding the event giving rise to the claim.",
    bullets: [] as string[],
  },
  {
    id: "governing-law",
    title: "12. Governing Law",
    icon: Scale,
    content: "These Terms of Service shall be governed by and construed in accordance with the laws of India, without regard to conflict-of-law principles. Any dispute, claim, or controversy arising out of or relating to these terms or your use of the Gravity service shall be subject to the exclusive jurisdiction of the competent courts located in Mumbai, Maharashtra, India. By using the service, you consent to the personal jurisdiction of such courts. If any provision of these terms is found to be unenforceable, the remaining provisions shall remain in full force and effect. These terms constitute the entire agreement between you and Gravity with respect to the subject matter herein.",
    bullets: [] as string[],
  },
]

function SectionCard({
  section,
  index,
}: {
  section: (typeof SECTIONS)[0]
  index: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const Icon = section.icon
  const isEven = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.5, delay: 0.04 * index }}
      className={`rounded-2xl border p-8 ${
        isEven
          ? "bg-white border-slate-200"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
        >
          <Icon className="w-5 h-5" style={{ color: "var(--primary)" }} />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mt-1">{section.title}</h2>
      </div>
      <p className="text-slate-600 leading-relaxed mb-4">{section.content}</p>
      {section.bullets.length > 0 && (
        <ul className="space-y-2 mt-3">
          {section.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-600">
              <span
                className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "var(--primary)" }}
              />
              <span className="leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}

export default function TermsPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-3xl mx-auto text-center" ref={heroRef}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border"
              style={{
                backgroundColor: "color-mix(in srgb, var(--primary) 10%, transparent)",
                borderColor: "color-mix(in srgb, var(--primary) 25%, transparent)",
              }}
            >
              <FileText className="w-4 h-4" style={{ color: "var(--primary)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--primary)" }}>
                Terms of Service
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
              Please read these terms carefully before using Gravity. They govern your access
              to and use of our family safety platform.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <span>Last Updated: June 2025</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>Effective Date: June 1, 2025</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Summary Bar */}
      <section className="py-5 px-4" style={{ backgroundColor: "var(--primary)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/90">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Consent-based tracking only</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>No hidden location access</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>Cancel anytime from the app</span>
            </div>
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span>Governed by Indian law</span>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-12 px-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Table of Contents
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-sm hover:underline truncate transition-colors duration-150"
                style={{ color: "var(--primary)" }}
              >
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          {SECTIONS.map((section, index) => (
            <div key={section.id} id={section.id}>
              <SectionCard section={section} index={index} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-slate-900">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--primary)" }} />
            <h2 className="text-2xl font-bold text-white mb-3">
              Questions About These Terms?
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              If anything is unclear or you have concerns about the terms governing your use
              of Gravity, our team is ready to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Mail className="w-4 h-4" />
                Contact Us
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
              >
                Return to Gravity Home
              </Link>
            </div>
            <p className="mt-6 text-slate-500 text-sm">
              You can also review our{" "}
              <Link
                href="/privacy"
                className="underline hover:text-slate-300 transition-colors"
                style={{ color: "var(--primary)" }}
              >
                Privacy Policy
              </Link>{" "}
              for details on how we handle your data.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
