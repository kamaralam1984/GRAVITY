'use client'

import {
  Users2, Shield, Smartphone, DollarSign, Brain, MessageSquare,
  Mail, Bell, MapPin, Settings, Activity, Database, AlertTriangle,
  HardDrive, Globe, Key, BarChart2, FileText, Lock, Zap, Wifi,
  CheckCircle, RefreshCw, Server
} from 'lucide-react'

// ─── Shared ───────────────────────────────────────────────────────────────────

function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, ...style }}>
      {children}
    </div>
  )
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <GlassCard style={{ padding: '20px 24px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={22} color="#8B5CF6" />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>
    </GlassCard>
  )
}

function StatGrid({ items }: { items: { label: string; value: string; color: string }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
      {items.map((item, i) => (
        <GlassCard key={i} style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{item.label}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: item.color }}>{item.value}</div>
        </GlassCard>
      ))}
    </div>
  )
}

function BarList({ items }: { items: { label: string; value: string; pct: number; color: string }[] }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
            <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{item.value}</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-surface2)', borderRadius: 99 }}>
            <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Intelligence / Analytics ─────────────────────────────────────────────────

export function FamilyAnalyticsSection() {
  return (
    <div>
      <SectionHeader icon={Users2} title="Family Analytics" subtitle="Family unit engagement and behavioral analytics" />
      <StatGrid items={[
        { label: 'Total Families', value: '892,341', color: '#8B5CF6' },
        { label: 'Avg Family Size', value: '3.8', color: '#3B82F6' },
        { label: 'Active This Week', value: '78.4%', color: '#10B981' },
        { label: 'Families with SOS', value: '0.3%', color: '#EF4444' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Family Engagement by Plan</div>
        <BarList items={[
          { label: 'Family Shield (Premium)', value: '94%', pct: 94, color: '#EC4899' },
          { label: 'Guardian Pro', value: '82%', pct: 82, color: '#8B5CF6' },
          { label: 'Essential', value: '61%', pct: 61, color: '#3B82F6' },
          { label: 'Free Plan', value: '28%', pct: 28, color: '#6B7280' },
        ]} />
      </GlassCard>
    </div>
  )
}

export function SafetyAnalyticsSection() {
  return (
    <div>
      <SectionHeader icon={Shield} title="Safety Analytics" subtitle="Platform-wide safety event trends and patterns" />
      <StatGrid items={[
        { label: 'SOS Events (30d)', value: '3,821', color: '#EF4444' },
        { label: 'Avg Response Time', value: '2.4 min', color: '#F59E0B' },
        { label: 'Resolved Rate', value: '99.1%', color: '#10B981' },
        { label: 'False Positive Rate', value: '4.2%', color: '#6B7280' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Safety Events by Category</div>
        <BarList items={[
          { label: 'SOS Alerts', value: '3,821', pct: 100, color: '#EF4444' },
          { label: 'Geofence Violations', value: '12,840', pct: 80, color: '#F59E0B' },
          { label: 'Missing Persons', value: '124', pct: 15, color: '#8B5CF6' },
          { label: 'Fall Detection', value: '842', pct: 22, color: '#3B82F6' },
        ]} />
      </GlassCard>
    </div>
  )
}

export function DeviceAnalyticsSection() {
  return (
    <div>
      <SectionHeader icon={Smartphone} title="Device Analytics" subtitle="Device usage patterns and platform distribution" />
      <StatGrid items={[
        { label: 'Total Devices', value: '4.2M', color: '#3B82F6' },
        { label: 'iOS Users', value: '58%', color: '#6B7280' },
        { label: 'Android Users', value: '41%', color: '#10B981' },
        { label: 'Avg Session Length', value: '8.4 min', color: '#8B5CF6' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>App Version Distribution</div>
        <BarList items={[
          { label: 'v4.2.0 (Latest)', value: '64%', pct: 64, color: '#10B981' },
          { label: 'v4.1.x', value: '22%', pct: 22, color: '#3B82F6' },
          { label: 'v4.0.x', value: '9%', pct: 9, color: '#F59E0B' },
          { label: 'v3.x (Legacy)', value: '5%', pct: 5, color: '#EF4444' },
        ]} />
      </GlassCard>
    </div>
  )
}

export function RevenueAnalyticsSection() {
  return (
    <div>
      <SectionHeader icon={DollarSign} title="Revenue Analytics" subtitle="Detailed revenue breakdown and growth metrics" />
      <StatGrid items={[
        { label: 'MRR', value: '₹48.7L', color: '#10B981' },
        { label: 'ARR Run Rate', value: '₹5.84Cr', color: '#3B82F6' },
        { label: 'New MRR (30d)', value: '₹6.2L', color: '#8B5CF6' },
        { label: 'Churned MRR', value: '₹1.1L', color: '#EF4444' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Revenue Trend (6 months)</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
          {[
            { month: 'Jan', value: 28.4, pct: 58 },
            { month: 'Feb', value: 31.2, pct: 64 },
            { month: 'Mar', value: 35.8, pct: 74 },
            { month: 'Apr', value: 38.1, pct: 78 },
            { month: 'May', value: 43.5, pct: 89 },
            { month: 'Jun', value: 48.7, pct: 100 },
          ].map((m, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>₹{m.value}L</div>
              <div style={{ width: '100%', background: i === 5 ? '#8B5CF6' : 'rgba(139,92,246,0.3)', borderRadius: '4px 4px 0 0', height: `${m.pct}%`, minHeight: 4 }} />
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.month}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

export function PredictiveInsightsSection() {
  return (
    <div>
      <SectionHeader icon={Brain} title="Predictive Insights" subtitle="AI-powered predictions and business intelligence" />
      <StatGrid items={[
        { label: 'Churn Risk Users', value: '12,840', color: '#EF4444' },
        { label: 'Upgrade Likely', value: '84,210', color: '#10B981' },
        { label: 'Model Accuracy', value: '91.4%', color: '#8B5CF6' },
        { label: 'Predictions/Day', value: '2.8M', color: '#3B82F6' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>AI Predictions Summary</div>
        {[
          { prediction: 'Users likely to churn in 30 days', count: '12,840', action: 'Send retention offer', urgency: 'high' },
          { prediction: 'Users ready to upgrade to Pro', count: '84,210', action: 'Show upgrade prompt', urgency: 'medium' },
          { prediction: 'Inactive users (7+ days)', count: '234,810', action: 'Re-engagement campaign', urgency: 'medium' },
          { prediction: 'High SOS risk households', count: '4,210', action: 'Proactive safety check', urgency: 'high' },
        ].map((p, i) => (
          <div key={i} style={{ padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{p.prediction}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Action: {p.action}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: p.urgency === 'high' ? '#EF4444' : '#F59E0B' }}>{p.count}</div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: p.urgency === 'high' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)', color: p.urgency === 'high' ? '#EF4444' : '#F59E0B', textTransform: 'uppercase' }}>{p.urgency}</span>
              </div>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

// ─── Support ──────────────────────────────────────────────────────────────────

export function FeedbackSection() {
  return (
    <div>
      <SectionHeader icon={MessageSquare} title="User Feedback" subtitle="Collect and analyze user feedback and ratings" />
      <StatGrid items={[
        { label: 'Avg App Rating', value: '4.7 ★', color: '#F59E0B' },
        { label: 'Feedback This Month', value: '12,840', color: '#3B82F6' },
        { label: 'Positive', value: '94.2%', color: '#10B981' },
        { label: 'Feature Requests', value: '1,284', color: '#8B5CF6' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Recent Feedback</div>
        {[
          { user: 'Priya M.', rating: 5, comment: 'The AI Guardian feature is incredible. Saved my child twice!', date: '2 hours ago' },
          { user: 'Karan S.', rating: 4, comment: 'Great app, would love dark mode improvements.', date: '5 hours ago' },
          { user: 'Ananya I.', rating: 5, comment: 'Best family safety app in India. Highly recommend.', date: '1 day ago' },
          { user: 'Rajesh K.', rating: 3, comment: 'Battery drain is a concern, please optimize.', date: '2 days ago' },
        ].map((f, i) => (
          <div key={i} style={{ padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#8B5CF6', flexShrink: 0 }}>{f.user.split(' ').map(w => w[0]).join('')}</div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{f.user}</span>
                <span style={{ marginLeft: 8, fontSize: 12, color: '#F59E0B' }}>{'★'.repeat(f.rating)}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.date}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 40 }}>{f.comment}</div>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

export function ContactRequestsSection() {
  return (
    <div>
      <SectionHeader icon={Mail} title="Contact Requests" subtitle="Inbound contact form submissions and inquiries" />
      <StatGrid items={[
        { label: 'Open Requests', value: '142', color: '#F59E0B' },
        { label: 'Resolved Today', value: '84', color: '#10B981' },
        { label: 'Avg Response Time', value: '3.2h', color: '#3B82F6' },
        { label: 'Enterprise Inquiries', value: '28', color: '#8B5CF6' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Recent Contact Requests</div>
        {[
          { from: 'Delhi Public School', subject: 'Enterprise plan inquiry for 50 schools', type: 'enterprise', date: '1h ago', status: 'open' },
          { from: 'Priya Mehta', subject: 'Cannot access premium features after payment', type: 'support', date: '2h ago', status: 'in-progress' },
          { from: 'Apollo Hospitals', subject: 'Hospital patient tracking integration', type: 'enterprise', date: '4h ago', status: 'resolved' },
          { from: 'Karan S.', subject: 'Request for family plan refund', type: 'billing', date: '6h ago', status: 'resolved' },
        ].map((r, i) => (
          <div key={i} style={{ padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{r.from}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.subject}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{r.date}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, whiteSpace: 'nowrap', background: r.status === 'resolved' ? 'rgba(16,185,129,0.12)' : r.status === 'in-progress' ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)', color: r.status === 'resolved' ? '#10B981' : r.status === 'in-progress' ? '#3B82F6' : '#F59E0B', textTransform: 'capitalize' }}>{r.status}</span>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

export function KnowledgeBaseSection() {
  return (
    <div>
      <SectionHeader icon={FileText} title="Knowledge Base" subtitle="Help articles, FAQs and documentation management" />
      <StatGrid items={[
        { label: 'Published Articles', value: '284', color: '#3B82F6' },
        { label: 'Monthly Views', value: '1.4M', color: '#10B981' },
        { label: 'Avg Helpfulness', value: '88%', color: '#8B5CF6' },
        { label: 'Search Queries/Day', value: '84K', color: '#F59E0B' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Top Articles</div>
        {[
          { title: 'How to set up SOS Alert', views: '142K', helpful: '96%' },
          { title: 'Setting up family geofences', views: '98K', helpful: '92%' },
          { title: 'AI Guardian — Complete Guide', views: '84K', helpful: '94%' },
          { title: 'Troubleshooting location not updating', views: '76K', helpful: '78%' },
          { title: 'Managing family member permissions', views: '62K', helpful: '89%' },
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{a.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.views} views · {a.helpful} helpful</div>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

export function CustomerSuccessSection() {
  return (
    <div>
      <SectionHeader icon={CheckCircle} title="Customer Success" subtitle="Customer health scores and success metrics" />
      <StatGrid items={[
        { label: 'Customer Health Score', value: '84/100', color: '#10B981' },
        { label: 'NPS Score', value: '+72', color: '#8B5CF6' },
        { label: 'CSAT', value: '94%', color: '#3B82F6' },
        { label: 'Customers at Risk', value: '2.1%', color: '#EF4444' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Enterprise Customer Health</div>
        {[
          { customer: 'Delhi Public School Network', health: 94, status: 'healthy', csm: 'Priya R.' },
          { customer: 'Apollo Hospitals', health: 88, status: 'healthy', csm: 'Karan M.' },
          { customer: 'Fortis Healthcare', health: 72, status: 'at-risk', csm: 'Karan M.' },
          { customer: 'SafeFamily Pro (WL)', health: 91, status: 'healthy', csm: 'Ananya S.' },
        ].map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{c.customer}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>CSM: {c.csm}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.status === 'healthy' ? '#10B981' : '#EF4444' }}>{c.health}/100</div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: c.status === 'healthy' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: c.status === 'healthy' ? '#10B981' : '#EF4444', textTransform: 'capitalize' }}>{c.status}</span>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

// ─── Security ─────────────────────────────────────────────────────────────────

export function LoginActivitySection() {
  return (
    <div>
      <SectionHeader icon={Activity} title="Login Activity" subtitle="Monitor all login events and session activity" />
      <StatGrid items={[
        { label: 'Logins Today', value: '142,841', color: '#3B82F6' },
        { label: 'Failed Attempts', value: '1,284', color: '#EF4444' },
        { label: 'Blocked IPs', value: '84', color: '#F59E0B' },
        { label: 'Active Sessions', value: '183,421', color: '#10B981' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Recent Login Events</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Time', 'User', 'IP Address', 'Location', 'Status'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { time: '09:14', user: 'amit@gravity.app', ip: '10.0.0.2', location: 'Delhi', status: 'success' },
                { time: '09:02', user: 'unknown@test.io', ip: '203.0.113.45', location: 'Russia', status: 'blocked' },
                { time: '08:51', user: 'priya@gmail.com', ip: '103.21.58.12', location: 'Mumbai', status: 'success' },
                { time: '08:33', user: 'root@evil.ru', ip: '91.108.4.10', location: 'Belarus', status: 'blocked' },
                { time: '08:12', user: 'karan@gravity.app', ip: '10.0.0.4', location: 'Mumbai', status: 'success' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{row.time}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>{row.user}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{row.ip}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{row.location}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: row.status === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: row.status === 'success' ? '#10B981' : '#EF4444', textTransform: 'capitalize' }}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}

export function ThreatDetectionSection() {
  return (
    <div>
      <SectionHeader icon={Shield} title="Threat Detection" subtitle="Real-time security threats and anomaly detection" />
      <StatGrid items={[
        { label: 'Active Threats', value: '3', color: '#EF4444' },
        { label: 'Blocked Today', value: '1,284', color: '#F59E0B' },
        { label: 'Anomalies Detected', value: '42', color: '#8B5CF6' },
        { label: 'Threat Score', value: 'Low', color: '#10B981' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Active Threat Alerts</div>
        {[
          { threat: 'Brute force attack from 185.220.x.x', severity: 'critical', status: 'mitigated', time: '14 min ago' },
          { threat: 'Unusual API spike — 10x normal rate', severity: 'warning', status: 'monitoring', time: '1h ago' },
          { threat: 'Multiple accounts from same IP', severity: 'warning', status: 'investigating', time: '2h ago' },
          { threat: 'SQL injection attempt on /api/users', severity: 'critical', status: 'blocked', time: '3h ago' },
        ].map((t, i) => (
          <div key={i} style={{ padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{t.threat}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.time}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: t.severity === 'critical' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)', color: t.severity === 'critical' ? '#EF4444' : '#F59E0B', textTransform: 'uppercase' }}>{t.severity}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(16,185,129,0.12)', color: '#10B981', textTransform: 'capitalize' }}>{t.status}</span>
              </div>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

export function PermissionsSection() {
  return (
    <div>
      <SectionHeader icon={Key} title="Permissions" subtitle="Manage granular permission sets and user capabilities" />
      <StatGrid items={[
        { label: 'Permission Groups', value: '24', color: '#8B5CF6' },
        { label: 'Custom Permissions', value: '142', color: '#3B82F6' },
        { label: 'Permission Changes (7d)', value: '38', color: '#F59E0B' },
        { label: 'Roles Using Perms', value: '8', color: '#10B981' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Permission Groups</div>
        {[
          { group: 'Super Admin', permissions: 142, roles: ['super_admin'], canEdit: false },
          { group: 'Admin', permissions: 98, roles: ['admin'], canEdit: true },
          { group: 'Moderator', permissions: 42, roles: ['moderator'], canEdit: true },
          { group: 'Support Agent', permissions: 28, roles: ['support'], canEdit: true },
          { group: 'Read Only', permissions: 12, roles: ['viewer'], canEdit: true },
        ].map((g, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{g.group}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.permissions} permissions · {g.roles.join(', ')}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: g.canEdit ? 'rgba(59,130,246,0.12)' : 'rgba(107,114,128,0.12)', color: g.canEdit ? '#3B82F6' : '#9CA3AF' }}>{g.canEdit ? 'Editable' : 'System'}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

export function ComplianceCenterSection() {
  return (
    <div>
      <SectionHeader icon={Shield} title="Compliance Center" subtitle="Regulatory compliance monitoring and reporting" />
      <StatGrid items={[
        { label: 'GDPR Compliance', value: '100%', color: '#10B981' },
        { label: 'DPDP Act (India)', value: '100%', color: '#10B981' },
        { label: 'Data Requests (30d)', value: '284', color: '#3B82F6' },
        { label: 'Deletion Requests', value: '42', color: '#8B5CF6' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Compliance Status</div>
        {[
          { standard: 'GDPR (EU)', status: 'compliant', lastAudit: '1 Jun 2025', nextAudit: '1 Dec 2025' },
          { standard: 'DPDP Act 2023 (India)', status: 'compliant', lastAudit: '15 May 2025', nextAudit: '15 Nov 2025' },
          { standard: 'ISO 27001', status: 'compliant', lastAudit: '1 Mar 2025', nextAudit: '1 Sep 2025' },
          { standard: 'SOC 2 Type II', status: 'in-progress', lastAudit: 'Pending', nextAudit: 'Aug 2025' },
          { standard: 'COPPA (Child Data)', status: 'compliant', lastAudit: '1 Apr 2025', nextAudit: '1 Oct 2025' },
        ].map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.standard}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last: {c.lastAudit} · Next: {c.nextAudit}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: c.status === 'compliant' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: c.status === 'compliant' ? '#10B981' : '#F59E0B', textTransform: 'capitalize' }}>{c.status}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

// ─── Administration ───────────────────────────────────────────────────────────

export function RolesSection() {
  return (
    <div>
      <SectionHeader icon={Key} title="Roles" subtitle="Define and manage role-based access control" />
      <StatGrid items={[
        { label: 'Total Roles', value: '8', color: '#8B5CF6' },
        { label: 'Custom Roles', value: '3', color: '#3B82F6' },
        { label: 'Users with Roles', value: '41', color: '#10B981' },
        { label: 'Role Changes (30d)', value: '12', color: '#F59E0B' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>System Roles</div>
        {[
          { role: 'Super Admin', members: 3, permissions: 142, color: '#EC4899' },
          { role: 'Admin', members: 8, permissions: 98, color: '#8B5CF6' },
          { role: 'Moderator', members: 24, permissions: 42, color: '#F59E0B' },
          { role: 'Support Agent', members: 12, permissions: 28, color: '#3B82F6' },
          { role: 'Finance Analyst', members: 4, permissions: 18, color: '#10B981' },
          { role: 'Read Only', members: 6, permissions: 12, color: '#6B7280' },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.role}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.members} members · {r.permissions} permissions</div>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

export function TeamsSection() {
  return (
    <div>
      <SectionHeader icon={Users2} title="Teams" subtitle="Organize staff into functional teams and departments" />
      <StatGrid items={[
        { label: 'Total Teams', value: '12', color: '#3B82F6' },
        { label: 'Team Members', value: '57', color: '#8B5CF6' },
        { label: 'Active Projects', value: '24', color: '#10B981' },
        { label: 'Avg Team Size', value: '4.8', color: '#F59E0B' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Teams Overview</div>
        {[
          { team: 'Engineering', members: 12, lead: 'Amit S.', projects: 8 },
          { team: 'Support & Operations', members: 14, lead: 'Karan M.', projects: 4 },
          { team: 'Product & Design', members: 6, lead: 'Priya R.', projects: 6 },
          { team: 'Sales & Enterprise', members: 8, lead: 'Rajesh K.', projects: 4 },
          { team: 'Finance & Compliance', members: 5, lead: 'Meena P.', projects: 2 },
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.team}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lead: {t.lead} · {t.members} members</div>
            </div>
            <span style={{ fontSize: 12, color: '#8B5CF6', fontWeight: 700 }}>{t.projects} projects</span>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

export function AccessControlSection() {
  return (
    <div>
      <SectionHeader icon={Lock} title="Access Control" subtitle="Fine-grained access control and resource restrictions" />
      <StatGrid items={[
        { label: 'Access Policies', value: '42', color: '#8B5CF6' },
        { label: 'IP Allowlists', value: '8', color: '#3B82F6' },
        { label: 'Restricted Resources', value: '24', color: '#F59E0B' },
        { label: 'Policy Violations (7d)', value: '3', color: '#EF4444' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Access Policies</div>
        {[
          { policy: 'Super Admin — Office Network Only', type: 'ip_restriction', status: 'active', applies: 'Super Admins' },
          { policy: 'Financial Data — MFA Required', type: 'mfa_required', status: 'active', applies: 'Finance Team' },
          { policy: 'User PII — Audit Logged', type: 'audit', status: 'active', applies: 'All Admins' },
          { policy: 'API Keys — Rate Limited', type: 'rate_limit', status: 'active', applies: 'Developers' },
        ].map((p, i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{p.policy}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Applies to: {p.applies}</div>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

// ─── Developer Hub ────────────────────────────────────────────────────────────

export function WebhooksSection() {
  return (
    <div>
      <SectionHeader icon={Wifi} title="Webhooks" subtitle="Configure and monitor webhook endpoints and deliveries" />
      <StatGrid items={[
        { label: 'Active Webhooks', value: '28', color: '#3B82F6' },
        { label: 'Deliveries Today', value: '1.4M', color: '#10B981' },
        { label: 'Failed (24h)', value: '42', color: '#EF4444' },
        { label: 'Avg Latency', value: '84ms', color: '#F59E0B' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Webhook Endpoints</div>
        {[
          { url: 'https://api.safefamily.ae/webhooks/gravity', events: 12, success: '99.8%', status: 'active' },
          { url: 'https://hooks.fortis.com/gravity-events', events: 6, success: '98.4%', status: 'active' },
          { url: 'https://ent.dps.edu.in/notifications', events: 4, success: '97.1%', status: 'active' },
          { url: 'https://internal.gravity.app/webhooks/test', events: 24, success: '100%', status: 'test' },
        ].map((w, i) => (
          <div key={i} style={{ padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#3B82F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.url}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{w.events} event types · Success: {w.success}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: w.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: w.status === 'active' ? '#10B981' : '#F59E0B', textTransform: 'capitalize', flexShrink: 0 }}>{w.status}</span>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

export function IntegrationsSection() {
  return (
    <div>
      <SectionHeader icon={Zap} title="Integrations" subtitle="Third-party service integrations and connected apps" />
      <StatGrid items={[
        { label: 'Active Integrations', value: '34', color: '#10B981' },
        { label: 'API Calls/Day', value: '8.4M', color: '#3B82F6' },
        { label: 'Failed Sync (24h)', value: '12', color: '#EF4444' },
        { label: 'Integration Partners', value: '18', color: '#8B5CF6' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Integration Status</div>
        {[
          { name: 'Google Maps Platform', category: 'Maps', status: 'connected', callsToday: '4.2M' },
          { name: 'Twilio (SMS & Voice)', category: 'Communications', status: 'connected', callsToday: '84K' },
          { name: 'Stripe / Razorpay', category: 'Payments', status: 'connected', callsToday: '12K' },
          { name: 'Firebase (Push)', category: 'Notifications', status: 'connected', callsToday: '1.8M' },
          { name: 'AWS S3 (Storage)', category: 'Cloud', status: 'connected', callsToday: '284K' },
          { name: 'SendGrid (Email)', category: 'Email', status: 'degraded', callsToday: '42K' },
        ].map((int, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{int.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{int.category} · {int.callsToday} calls today</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: int.status === 'connected' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: int.status === 'connected' ? '#10B981' : '#F59E0B', textTransform: 'capitalize' }}>{int.status}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

export function SDKAccessSection() {
  return (
    <div>
      <SectionHeader icon={Key} title="SDK Access" subtitle="Manage SDK distribution and developer app access" />
      <StatGrid items={[
        { label: 'SDK Tokens', value: '142', color: '#8B5CF6' },
        { label: 'Active Apps', value: '84', color: '#3B82F6' },
        { label: 'SDK Downloads (30d)', value: '2,841', color: '#10B981' },
        { label: 'SDK Version', value: 'v3.4.1', color: '#F59E0B' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>SDK Distribution</div>
        <BarList items={[
          { label: 'iOS SDK (Swift)', value: '45%', pct: 45, color: '#6B7280' },
          { label: 'Android SDK (Kotlin)', value: '38%', pct: 38, color: '#10B981' },
          { label: 'React Native SDK', value: '12%', pct: 12, color: '#3B82F6' },
          { label: 'Flutter SDK', value: '5%', pct: 5, color: '#8B5CF6' },
        ]} />
      </GlassCard>
    </div>
  )
}

export function APIAnalyticsSection() {
  return (
    <div>
      <SectionHeader icon={BarChart2} title="API Analytics" subtitle="API usage metrics, performance and error rates" />
      <StatGrid items={[
        { label: 'API Calls Today', value: '42.1M', color: '#3B82F6' },
        { label: 'Avg Response Time', value: '42ms', color: '#10B981' },
        { label: 'Error Rate', value: '0.08%', color: '#EF4444' },
        { label: 'P99 Latency', value: '284ms', color: '#F59E0B' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Top API Endpoints</div>
        {[
          { endpoint: 'GET /api/v1/location/live', calls: '12.4M', avgMs: '18ms', errorRate: '0.01%' },
          { endpoint: 'POST /api/v1/sos/trigger', calls: '84K', avgMs: '32ms', errorRate: '0.00%' },
          { endpoint: 'GET /api/v1/family/members', calls: '8.4M', avgMs: '24ms', errorRate: '0.02%' },
          { endpoint: 'POST /api/v1/geofence/check', calls: '6.2M', avgMs: '8ms', errorRate: '0.01%' },
          { endpoint: 'GET /api/v1/analytics/user', calls: '2.8M', avgMs: '84ms', errorRate: '0.12%' },
        ].map((e, i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#3B82F6', marginBottom: 4 }}>{e.endpoint}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.calls} calls · {e.avgMs} avg · {e.errorRate} errors</div>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

// ─── Infrastructure ───────────────────────────────────────────────────────────

export function DBHealthSection() {
  return (
    <div>
      <SectionHeader icon={Database} title="Database Health" subtitle="Database performance, connections and query metrics" />
      <StatGrid items={[
        { label: 'DB Uptime', value: '99.99%', color: '#10B981' },
        { label: 'Avg Query Time', value: '8ms', color: '#3B82F6' },
        { label: 'Active Connections', value: '284', color: '#8B5CF6' },
        { label: 'DB Size', value: '2.84 TB', color: '#F59E0B' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Database Metrics</div>
        <BarList items={[
          { label: 'CPU Usage', value: '34%', pct: 34, color: '#3B82F6' },
          { label: 'Memory Usage', value: '62%', pct: 62, color: '#F59E0B' },
          { label: 'Disk I/O', value: '28%', pct: 28, color: '#8B5CF6' },
          { label: 'Connection Pool', value: '57%', pct: 57, color: '#10B981' },
        ]} />
      </GlassCard>
    </div>
  )
}

export function QueueMonitoringSection() {
  return (
    <div>
      <SectionHeader icon={Activity} title="Queue Monitoring" subtitle="Message queue health, throughput and backlog status" />
      <StatGrid items={[
        { label: 'Messages/Second', value: '8,420', color: '#3B82F6' },
        { label: 'Queue Backlog', value: '1,284', color: '#F59E0B' },
        { label: 'Consumer Groups', value: '24', color: '#8B5CF6' },
        { label: 'Failed Messages (24h)', value: '42', color: '#EF4444' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Queue Status</div>
        {[
          { queue: 'sos-alerts', messages: '0', throughput: '84/s', status: 'healthy' },
          { queue: 'push-notifications', messages: '1,284', throughput: '2,410/s', status: 'normal' },
          { queue: 'location-updates', messages: '8,420', throughput: '12,840/s', status: 'healthy' },
          { queue: 'email-delivery', messages: '284', throughput: '420/s', status: 'healthy' },
          { queue: 'analytics-events', messages: '42,100', throughput: '84,000/s', status: 'healthy' },
        ].map((q, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div>
              <div style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>{q.queue}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Backlog: {q.messages} · Throughput: {q.throughput}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: q.status === 'healthy' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: q.status === 'healthy' ? '#10B981' : '#F59E0B', textTransform: 'capitalize' }}>{q.status}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

export function ErrorLogsSection() {
  return (
    <div>
      <SectionHeader icon={AlertTriangle} title="Error Logs" subtitle="Application error tracking and stack traces" />
      <StatGrid items={[
        { label: 'Errors Today', value: '284', color: '#EF4444' },
        { label: 'Critical Errors', value: '3', color: '#EF4444' },
        { label: 'Resolved (24h)', value: '241', color: '#10B981' },
        { label: 'Affected Users', value: '142', color: '#F59E0B' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Recent Errors</div>
        {[
          { error: 'TypeError: Cannot read property of undefined', service: 'location-service', occurrences: 84, severity: 'warning', time: '10 min ago' },
          { error: 'Connection timeout to Redis cluster', service: 'cache-service', occurrences: 12, severity: 'critical', time: '1h ago' },
          { error: 'JWT token validation failed', service: 'auth-service', occurrences: 42, severity: 'warning', time: '2h ago' },
          { error: 'Database query exceeded 5s timeout', service: 'analytics-service', occurrences: 6, severity: 'critical', time: '3h ago' },
        ].map((e, i) => (
          <div key={i} style={{ padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#EF4444', marginBottom: 4, wordBreak: 'break-all' }}>{e.error}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.service} · {e.occurrences}x · {e.time}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: e.severity === 'critical' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)', color: e.severity === 'critical' ? '#EF4444' : '#F59E0B', textTransform: 'uppercase', flexShrink: 0 }}>{e.severity}</span>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

export function BackupsSection() {
  return (
    <div>
      <SectionHeader icon={HardDrive} title="Backups" subtitle="Database and file backup schedules and restore points" />
      <StatGrid items={[
        { label: 'Last Backup', value: '2h ago', color: '#10B981' },
        { label: 'Backup Size', value: '2.84 TB', color: '#3B82F6' },
        { label: 'Retention Policy', value: '30 days', color: '#8B5CF6' },
        { label: 'Recovery Time', value: '<15 min', color: '#F59E0B' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Backup Schedule</div>
        {[
          { type: 'Full Database Backup', frequency: 'Daily at 02:00 IST', size: '2.84 TB', status: 'completed', lastRun: '13 Jun 02:00' },
          { type: 'Incremental Backup', frequency: 'Every 6 hours', size: '42 GB', status: 'completed', lastRun: '13 Jun 08:00' },
          { type: 'Media Files Backup', frequency: 'Weekly (Sunday)', size: '1.2 TB', status: 'completed', lastRun: '9 Jun 00:00' },
          { type: 'Config & Secrets Backup', frequency: 'Daily at 03:00 IST', size: '124 MB', status: 'completed', lastRun: '13 Jun 03:00' },
        ].map((b, i) => (
          <div key={i} style={{ padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{b.type}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.frequency} · Size: {b.size} · Last: {b.lastRun}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(16,185,129,0.12)', color: '#10B981', textTransform: 'capitalize', flexShrink: 0 }}>{b.status}</span>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function BrandingSection() {
  return (
    <div>
      <SectionHeader icon={Globe} title="Branding" subtitle="Platform branding, logo and visual identity settings" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <GlassCard style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Brand Assets</div>
          {[
            { label: 'App Logo (Light)', value: 'gravity-logo-light.svg', status: 'active' },
            { label: 'App Logo (Dark)', value: 'gravity-logo-dark.svg', status: 'active' },
            { label: 'Favicon', value: 'favicon-32x32.png', status: 'active' },
            { label: 'Email Header Logo', value: 'email-logo.png', status: 'active' },
          ].map((asset, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{asset.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{asset.value}</div>
              </div>
              <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>{asset.status}</span>
            </div>
          ))}
        </GlassCard>
        <GlassCard style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Brand Colors</div>
          {[
            { label: 'Primary', color: '#8B5CF6', hex: '#8B5CF6' },
            { label: 'Accent (Gold)', color: '#D4A853', hex: '#D4A853' },
            { label: 'Success', color: '#10B981', hex: '#10B981' },
            { label: 'Danger', color: '#EF4444', hex: '#EF4444' },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: c.color, flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.label}</div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{c.hex}</div>
              </div>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  )
}

export function SMTPSection() {
  return (
    <div>
      <SectionHeader icon={Mail} title="SMTP Configuration" subtitle="Email delivery configuration and testing" />
      <GlassCard style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>SMTP Settings</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'SMTP Host', value: 'smtp.sendgrid.net' },
            { label: 'SMTP Port', value: '587 (TLS)' },
            { label: 'From Email', value: 'noreply@gravity.app' },
            { label: 'From Name', value: 'Gravity Safety' },
            { label: 'Authentication', value: 'API Key (SendGrid)' },
            { label: 'Status', value: 'Connected' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-surface2)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: i === 5 ? '#10B981' : 'var(--text-primary)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </GlassCard>
      <StatGrid items={[
        { label: 'Emails Sent Today', value: '284K', color: '#3B82F6' },
        { label: 'Delivery Rate', value: '99.2%', color: '#10B981' },
        { label: 'Bounce Rate', value: '0.8%', color: '#F59E0B' },
        { label: 'Spam Rate', value: '0.02%', color: '#EF4444' },
      ]} />
    </div>
  )
}

export function SMSGatewaySection() {
  return (
    <div>
      <SectionHeader icon={MessageSquare} title="SMS Gateway" subtitle="SMS delivery gateway configuration and status" />
      <StatGrid items={[
        { label: 'Primary Gateway', value: 'MSG91', color: '#8B5CF6' },
        { label: 'SMS Sent Today', value: '84K', color: '#3B82F6' },
        { label: 'Delivery Rate', value: '98.7%', color: '#10B981' },
        { label: 'Balance', value: '₹24,800', color: '#F59E0B' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Gateway Configuration</div>
        {[
          { provider: 'MSG91 (Primary)', region: 'India', status: 'active', deliveryRate: '98.7%', balance: '₹24,800' },
          { provider: 'Twilio (Fallback)', region: 'Global', status: 'standby', deliveryRate: '99.1%', balance: '$142' },
          { provider: 'Vonage (Emergency)', region: 'Global', status: 'standby', deliveryRate: '97.4%', balance: '$84' },
        ].map((g, i) => (
          <div key={i} style={{ padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{g.provider}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.region} · Delivery: {g.deliveryRate} · Balance: {g.balance}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: g.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.12)', color: g.status === 'active' ? '#10B981' : '#9CA3AF', textTransform: 'capitalize' }}>{g.status}</span>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

export function PushConfigSection() {
  return (
    <div>
      <SectionHeader icon={Bell} title="Push Notifications Config" subtitle="FCM/APNs configuration and delivery settings" />
      <StatGrid items={[
        { label: 'Push Sent Today', value: '1.84M', color: '#3B82F6' },
        { label: 'Delivery Rate', value: '96.4%', color: '#10B981' },
        { label: 'Opt-in Rate', value: '84%', color: '#8B5CF6' },
        { label: 'Click-through Rate', value: '14.2%', color: '#F59E0B' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Push Service Status</div>
        {[
          { service: 'Firebase FCM (Android)', status: 'operational', sent: '1.2M', deliveryRate: '97.1%' },
          { service: 'Apple APNs (iOS)', status: 'operational', sent: '640K', deliveryRate: '95.4%' },
          { service: 'Web Push (PWA)', status: 'operational', sent: '24K', deliveryRate: '89.2%' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{s.service}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sent: {s.sent} · Rate: {s.deliveryRate}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>{s.status}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  )
}

export function MapsAPISection() {
  return (
    <div>
      <SectionHeader icon={MapPin} title="Maps API Config" subtitle="Google Maps and location service configuration" />
      <StatGrid items={[
        { label: 'Maps API Calls Today', value: '42.1M', color: '#3B82F6' },
        { label: 'API Quota Used', value: '42%', color: '#10B981' },
        { label: 'Avg Geocode Time', value: '84ms', color: '#8B5CF6' },
        { label: 'Monthly Cost', value: '₹1.84L', color: '#F59E0B' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Maps API Usage</div>
        <BarList items={[
          { label: 'Maps JavaScript API', value: '18.4M calls', pct: 44, color: '#3B82F6' },
          { label: 'Geocoding API', value: '12.8M calls', pct: 30, color: '#8B5CF6' },
          { label: 'Directions API', value: '8.4M calls', pct: 20, color: '#10B981' },
          { label: 'Places API', value: '2.5M calls', pct: 6, color: '#F59E0B' },
        ]} />
      </GlassCard>
    </div>
  )
}

export function AISettingsSection() {
  return (
    <div>
      <SectionHeader icon={Brain} title="AI Settings" subtitle="AI model configuration and behavior settings" />
      <StatGrid items={[
        { label: 'AI Model', value: 'GPT-4o', color: '#8B5CF6' },
        { label: 'Tokens/Day', value: '42M', color: '#3B82F6' },
        { label: 'AI Cost (30d)', value: '₹2.4L', color: '#F59E0B' },
        { label: 'AI Accuracy', value: '91.4%', color: '#10B981' },
      ]} />
      <GlassCard style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>AI Configuration</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Primary Model', value: 'GPT-4o (OpenAI)' },
            { label: 'Fallback Model', value: 'Claude 3.5 Sonnet' },
            { label: 'SOS Risk Model', value: 'Custom BERT v2' },
            { label: 'Driving Coach Model', value: 'Custom CNN v4' },
            { label: 'Temperature', value: '0.3 (Safety-focused)' },
            { label: 'Max Tokens/Request', value: '4,096' },
          ].map((c, i) => (
            <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-surface2)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.value}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

export function PlatformConfigSection() {
  return (
    <div>
      <SectionHeader icon={Settings} title="Platform Config" subtitle="Core platform configuration and feature flags" />
      <GlassCard style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Feature Flags</div>
        {[
          { feature: 'AI Guardian (Real-time)', enabled: true, rollout: '100%' },
          { feature: 'Family Chat 2.0', enabled: true, rollout: '100%' },
          { feature: 'Video Check-in', enabled: false, rollout: '0%' },
          { feature: 'AR Navigation', enabled: false, rollout: '0%' },
          { feature: 'AI Driving Coach v2', enabled: true, rollout: '80%' },
          { feature: 'Elder Fall AI Detection v3', enabled: true, rollout: '60%' },
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{f.feature}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Rollout: {f.rollout}</div>
            </div>
            <div style={{ width: 40, height: 22, borderRadius: 99, background: f.enabled ? '#8B5CF6' : 'var(--bg-surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 3px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: f.enabled ? '#fff' : 'var(--text-muted)', marginLeft: f.enabled ? 'auto' : 0, transition: 'all 0.2s' }} />
            </div>
          </div>
        ))}
      </GlassCard>
      <StatGrid items={[
        { label: 'App Version', value: 'v4.2.0', color: '#10B981' },
        { label: 'API Version', value: 'v3.4.1', color: '#3B82F6' },
        { label: 'Maintenance Mode', value: 'Off', color: '#10B981' },
        { label: 'Registration', value: 'Open', color: '#8B5CF6' },
      ]} />
    </div>
  )
}
