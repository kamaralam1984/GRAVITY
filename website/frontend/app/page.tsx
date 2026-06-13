import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
// Above-fold: render immediately for LCP
import HeroSection from '@/components/sections/HeroSection'
import StatsSection from '@/components/sections/StatsSection'
// Below-fold: code-split into separate chunks, deferred on client
const FeaturesSection        = dynamic(() => import('@/components/sections/FeaturesSection'),        { loading: () => <div className="min-h-[600px]" /> })
const LiveMapDemoSection     = dynamic(() => import('@/components/sections/LiveMapDemoSection'),     { loading: () => <div className="min-h-[500px]" /> })
const HowItWorksSection      = dynamic(() => import('@/components/sections/HowItWorksSection'),      { loading: () => <div className="min-h-[600px]" /> })
const ElderlyCareSection     = dynamic(() => import('@/components/sections/ElderlyCareSection'),     { loading: () => <div className="min-h-[500px]" /> })
const TestimonialsSection    = dynamic(() => import('@/components/sections/TestimonialsSection'),    { loading: () => <div className="min-h-[400px]" /> })
const PricingSection         = dynamic(() => import('@/components/sections/PricingSection'),         { loading: () => <div className="min-h-[600px]" /> })
const DownloadCTA            = dynamic(() => import('@/components/sections/DownloadCTA'),            { loading: () => <div className="min-h-[300px]" /> })
const AIAssistant            = dynamic(() => import('@/components/effects/AIAssistant'),             { ssr: false })
// New Gravity 3.0 sections
const SocialProofSection     = dynamic(() => import('@/components/sections/SocialProofSection'),     { loading: () => <div className="min-h-[500px]" /> })
const InteractiveProductDemo = dynamic(() => import('@/components/sections/InteractiveProductDemo'), { loading: () => <div className="min-h-[600px]" /> })
const AIGuardianSection      = dynamic(() => import('@/components/sections/AIGuardianSection'),      { loading: () => <div className="min-h-[600px]" /> })
const ROISection             = dynamic(() => import('@/components/sections/ROISection'),             { loading: () => <div className="min-h-[500px]" /> })
const EnterpriseTrustSection  = dynamic(() => import('@/components/sections/EnterpriseTrustSection'),  { loading: () => <div className="min-h-[600px]" /> })
const ParentChildSection      = dynamic(() => import('@/components/sections/ParentChildSection'),      { loading: () => <div className="min-h-[700px]" /> })
// Gravity 4.0 new sections
const CustomerLogosSection    = dynamic(() => import('@/components/sections/CustomerLogosSection'),    { loading: () => <div className="min-h-[300px]" /> })
const CaseStudiesSection      = dynamic(() => import('@/components/sections/CaseStudiesSection'),      { loading: () => <div className="min-h-[700px]" /> })
const TrustBadgesSection      = dynamic(() => import('@/components/sections/TrustBadgesSection'),      { loading: () => <div className="min-h-[600px]" /> })
const VideoWalkthroughSection = dynamic(() => import('@/components/sections/VideoWalkthroughSection'), { loading: () => <div className="min-h-[600px]" /> })
const WhatsAppCTASection      = dynamic(() => import('@/components/sections/WhatsAppCTASection'),      { loading: () => <div className="min-h-[300px]" /> })
import JsonLd from '@/components/seo/JsonLd'
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildSoftwareApplicationSchema,
} from '@/lib/seo/schemas'

export default function HomePage() {
  return (
    <main className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      <JsonLd data={buildOrganizationSchema()} />
      <JsonLd data={buildWebSiteSchema()} />
      <JsonLd data={buildSoftwareApplicationSchema()} />
      <Navbar />

      <div id="hero">
        <HeroSection />
      </div>

      <div id="stats">
        <StatsSection />
      </div>

      <div id="social-proof">
        <SocialProofSection />
      </div>

      <div id="features">
        <FeaturesSection />
      </div>

      <div id="ai-guardian">
        <AIGuardianSection />
      </div>

      <div id="parent-child">
        <ParentChildSection />
      </div>

      <div id="demo">
        <LiveMapDemoSection />
      </div>

      <div id="interactive-demo">
        <InteractiveProductDemo />
      </div>

      <div id="how-it-works">
        <HowItWorksSection />
      </div>

      <div id="elderly-care">
        <ElderlyCareSection />
      </div>

      <div id="roi">
        <ROISection />
      </div>

      <div id="testimonials">
        <TestimonialsSection />
      </div>

      <div id="pricing">
        <PricingSection />
      </div>

      <div id="enterprise">
        <EnterpriseTrustSection />
      </div>

      <div id="customer-logos">
        <CustomerLogosSection />
      </div>

      <div id="case-studies">
        <CaseStudiesSection />
      </div>

      <div id="trust-badges">
        <TrustBadgesSection />
      </div>

      <div id="video-walkthrough">
        <VideoWalkthroughSection />
      </div>

      <div id="whatsapp-cta">
        <WhatsAppCTASection />
      </div>

      <div id="download">
        <DownloadCTA />
      </div>

      <Footer />
      <AIAssistant />
    </main>
  )
}
