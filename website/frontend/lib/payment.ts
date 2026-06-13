// Payment utility — Razorpay + Stripe helpers

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export interface PaymentPlan {
  id: number
  name: string
  monthlyPrice: number
  annualPrice: number
}

// ── Razorpay helpers ─────────────────────────────────────────────────────────

declare global {
  interface Window { Razorpay: any }
}

export async function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export async function createRazorpayOrder(planId: number, billingCycle: string, token: string) {
  const res = await fetch(`${API_BASE}/payments/razorpay/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ plan_id: planId, billing_cycle: billingCycle }),
  })
  if (!res.ok) throw new Error('Failed to create order')
  return res.json()
}

export async function verifyRazorpayPayment(
  orderId: string, paymentId: string, signature: string,
  planId: number, billingCycle: string, token: string
) {
  const res = await fetch(`${API_BASE}/payments/razorpay/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      plan_id: planId,
      billing_cycle: billingCycle,
    }),
  })
  if (!res.ok) throw new Error('Payment verification failed')
  return res.json()
}

export function openRazorpayCheckout(options: {
  orderId: string
  amount: number
  currency: string
  keyId: string
  planName: string
  userName: string
  userEmail: string
  userPhone?: string
  onSuccess: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void
  onFailure: (error: any) => void
}) {
  const rzp = new window.Razorpay({
    key: options.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: options.amount,
    currency: options.currency,
    name: 'TRACKALWAYS GRAVITY',
    description: options.planName,
    image: '/logo.png',
    order_id: options.orderId,
    prefill: { name: options.userName, email: options.userEmail, contact: options.userPhone ?? '' },
    theme: { color: '#D4A853' },
    modal: { backdropclose: false },
    handler: options.onSuccess,
  })
  rzp.on('payment.failed', options.onFailure)
  rzp.open()
}

// ── Stripe helpers ───────────────────────────────────────────────────────────

export async function getStripeConfig(token: string) {
  const res = await fetch(`${API_BASE}/stripe/config`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function createStripePaymentIntent(planId: number, billingCycle: string, currency: string, token: string) {
  const res = await fetch(`${API_BASE}/stripe/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ plan_id: planId, billing_cycle: billingCycle, currency }),
  })
  if (!res.ok) throw new Error('Failed to create payment intent')
  return res.json()
}

export async function confirmStripePayment(paymentIntentId: string, planId: number, billingCycle: string, token: string) {
  const res = await fetch(`${API_BASE}/stripe/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ payment_intent_id: paymentIntentId, plan_id: planId, billing_cycle: billingCycle }),
  })
  if (!res.ok) throw new Error('Payment confirmation failed')
  return res.json()
}

// ── Billing history ──────────────────────────────────────────────────────────

export async function getPaymentHistory(token: string) {
  const res = await fetch(`${API_BASE}/payments/history`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  return res.json()
}

export async function getMySubscription(token: string) {
  const res = await fetch(`${API_BASE}/subscriptions/my`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}
