'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Shield, Eye, Lock, Database, UserCheck, Trash2, Globe, Mail } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const SECTIONS = [
  {
    id: "introduction",
    title: "1. Introduction",
    icon: Shield,
    content: "Trackalways Technologies Private Limited operates the Gravity family safety application. This Privacy Policy explains how we collect, use, and protect information about you when you use our service. We are committed to handling your personal information with transparency, care, and respect. This policy applies to all users of the Gravity mobile application, web dashboard, and related services. By using Gravity, you agree to the practices described in this policy. If you do not agree with any part of this policy, please discontinue use of the service. We encourage you to read this document carefully and contact us with any questions.",
    bullets: [] as string[],
  },
  {
    id: "collection",
    title: "2. Information We Collect",
    icon: Database,
    content: "We collect several categories of information to provide and improve our service. This includes information you provide directly, information generated through your use of the service, and technical data from your device.",
    bullets: [
      "Account Data: name, email address, phone number, and profile photo when you register",
      "Location Data: GPS coordinates, cell tower signals, and WiFi network data used to determine your position",
      "Usage Data: app interactions, feature usage patterns, session duration, and crash reports",
      "Device Data: operating system version, device model, app version, and unique device identifiers",
      "Communications: messages and alerts exchanged within your family circle through the app",
    ],
  },
  {
    id: "usage",
    title: "3. How We Use Information",
    icon: Eye,
    content: "We use the information we collect solely to operate and improve the Gravity service. We do not use your data for purposes beyond what is described in this policy without your explicit consent.",
    bullets: [
      "Provide the Service: deliver real-time location sharing, SOS alerts, and family circle features",
      "Send Safety Alerts: notify circle members of SOS events, arrival confirmations, and geofence triggers",
      "Improve the Product: analyze usage patterns to fix bugs, enhance performance, and develop new features",
      "Customer Support: respond to inquiries, troubleshoot issues, and resolve disputes",
      "Legal Compliance: fulfill obligations under applicable laws and respond to lawful government requests",
    ],
  },
  {
    id: "location",
    title: "4. Location Data",
    icon: Globe,
    content: "Location data is the core of the Gravity service and receives special treatment. We treat location data with heightened sensitivity and apply additional safeguards beyond those applied to other categories of information. Location access requires explicit permission through the OS permission dialog before any data is collected. You may revoke location permission at any time through your device settings, though this will limit the functionality of the service. Location data is shared only with members of your approved family circle — never with advertisers, data brokers, or other third parties. We do not use location data for advertising targeting of any kind. Location history is retained on a rolling 30-day basis and automatically purged beyond that window unless retained as part of an SOS event record.",
    bullets: [] as string[],
  },
  {
    id: "sharing",
    title: "5. Information Sharing",
    icon: UserCheck,
    content: "We do not sell, rent, or trade your personal information to any third party. We share information only in the limited circumstances described below, and only to the extent necessary for each purpose.",
    bullets: [
      "Circle Members: your location and status are shared with family circle members you have approved",
      "Service Providers: trusted vendors who assist in operating the service, each bound by confidentiality agreements and data processing terms",
      "Law Enforcement: only when required by a valid legal process such as a court order or subpoena",
      "Business Transfers: in the event of a merger or acquisition, your data may transfer to a successor entity under equivalent privacy protections",
      "Safety Emergencies: in rare cases where there is an imminent risk to life, we may share information with emergency responders",
    ],
  },
  {
    id: "retention",
    title: "6. Data Retention",
    icon: Trash2,
    content: "We retain your information only as long as necessary to provide the service and fulfill the purposes described in this policy. Different categories of data are subject to different retention periods based on their nature and purpose.",
    bullets: [
      "Account Data: retained while your account is active and for 30 days following account deletion to allow recovery",
      "Location History: retained on a rolling 30-day basis and automatically deleted beyond that window",
      "SOS Events: retained for up to 12 months from the date of the event for safety and legal purposes",
      "Usage and Analytics Data: retained in aggregated, anonymized form for up to 24 months",
      "Support Records: retained for 12 months after resolution of the relevant support request",
    ],
  },
  {
    id: "rights",
    title: "7. Your Rights",
    icon: Lock,
    content: "You have meaningful rights over your personal information. We are committed to honoring these rights promptly and without discrimination. To exercise any of the rights below, contact us at privacy@trackalways.com.",
    bullets: [
      "Access: request a copy of the personal data we hold about you",
      "Deletion: request permanent deletion of your account and associated personal data",
      "Export: download a portable copy of your data in a machine-readable format",
      "Correction: update or correct inaccurate information in your account profile",
      "Opt-Out: disable optional features such as analytics sharing or marketing communications at any time through app settings",
    ],
  },
  {
    id: "children",
    title: "8. Children and Minors",
    icon: Shield,
    content: "The Gravity service is designed for users aged 13 and older. We do not knowingly collect personal information from children under 13 without verifiable parental consent. If a parent or guardian believes their child under 13 has provided personal information without consent, they should contact us immediately at privacy@trackalways.com and we will promptly delete that information. For users between 13 and 18, we encourage parental involvement in setting up and reviewing account settings. Parental consent features are available within the app to allow guardians to review and approve the family circle configuration for minor members.",
    bullets: [] as string[],
  },
  {
    id: "security",
    title: "9. Security Measures",
    icon: Lock,
    content: "We implement industry-standard technical and organizational security measures to protect your information against unauthorized access, disclosure, alteration, and destruction. Our security program includes the following safeguards.",
    bullets: [
      "Encryption in Transit: all data transmitted between the app and our servers is protected using TLS 1.3",
      "Encryption at Rest: stored data is encrypted using AES-256 encryption on all production systems",
      "Access Controls: strict role-based access controls limit internal access to personal data on a need-to-know basis",
      "Regular Audits: we conduct periodic security assessments and penetration testing of our infrastructure",
      "Incident Response: a formal incident response plan is in place to detect, contain, and notify affected users of any data breach",
    ],
  },
  {
    id: "third-party",
    title: "10. Third-Party Services",
    icon: Globe,
    content: "We integrate certain third-party services to power features of the Gravity application. Each of these providers operates under its own privacy policy and data processing terms. We encourage you to review their policies to understand how they handle information.",
    bullets: [
      "Google Maps: provides mapping and geolocation display features — governed by the Google Privacy Policy",
      "Firebase (Google): provides backend infrastructure, authentication, and push notifications — governed by the Google Privacy Policy",
      "Stripe: processes payment information for subscription plans — Stripe handles payment data under PCI-DSS standards and its own Privacy Policy",
      "Mixpanel: provides product analytics to help us understand feature usage — data is anonymized before transmission where possible",
    ],
  },
  {
    id: "changes",
    title: "11. Changes to This Policy",
    icon: Mail,
    content: "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or applicable law. For material changes that affect your rights or the way we handle your information, we will provide at least 30 days notice before the changes take effect. Notice will be delivered by email to the address registered on your account and by an in-app notification. For minor or clarifying changes, we will update the effective date at the top of this page without advance notice. Continued use of the service after the effective date of any changes constitutes acceptance of the updated policy.",
    bullets: [] as string[],
  },
  {
    id: "contact",
    title: "12. Contact Us",
    icon: Mail,
    content: "If you have questions, concerns, or requests related to this Privacy Policy or your personal information, please contact our Privacy team. We aim to respond to all privacy inquiries within 72 hours.",
    bullets: [
      "Email: privacy@trackalways.com",
      "Subject Line: please include the word Privacy in your subject line for faster routing",
      "Response Time: we aim to respond to all privacy requests within 72 hours",
      "Mailing Address: Trackalways Technologies Private Limited, India",
    ],
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
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mt-1">{section.title}</h2>
      </div>
      <p className="text-slate-600 leading-relaxed mb-4">{section.content}</p>
      {section.bullets.length > 0 && (
        <ul className="space-y-2 mt-3">
          {section.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-600">
              <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}

export default function PrivacyPage() {
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
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">Privacy Policy</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your Privacy Matters
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
              We believe transparency is the foundation of trust. This policy explains exactly
              how Gravity collects, uses, and protects your information.
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
      <section className="bg-blue-600 py-5 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>We never sell your data</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Location shared only with your circle</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>30-day location retention</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>AES-256 encryption at rest</span>
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
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
              >
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Policy Sections */}
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
            <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">
              Questions About Your Privacy?
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Our privacy team is here to help. Reach out any time and we will respond within 72 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
              >
                <Mail className="w-4 h-4" />
                Contact Privacy Team
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
              >
                Return to Gravity Home
              </Link>
            </div>
            <p className="mt-6 text-slate-500 text-sm">
              Or email us directly at{" "}
              <a
                href="mailto:privacy@trackalways.com"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                privacy@trackalways.com
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
