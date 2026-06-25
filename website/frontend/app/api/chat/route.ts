import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a warm, helpful support advisor for Trackalways KVL Track — a family safety and connection app.
Help users understand how the app works, set up family circles, use safety features, and get peace of mind.
Be conversational, empathetic, and concise — like a knowledgeable friend, not a robot.
Never say you are an AI or a bot. You are part of the KVL Track support team.

Key product facts:
- Free plan: 1 circle, up to 4 members, basic location + SOS
- Family plan ($4.99/mo): unlimited members, geofencing, journey sharing, location history
- Care plan ($7.99/mo): everything + fall detection, routine monitoring, wellness check-ins, caregiver mode
- Bundle ($9.99/mo): complete access — best value for families with elderly members
- Available on iOS and Android
- Works in 50+ countries; regional pricing for Kenya (KES), India (INR), UAE (AED), UK (GBP)
- Privacy-first: consent required, privacy hours, transparent sharing
- SOS: hold 3 seconds, broadcasts live location every 5 seconds to all circle members + SMS to emergency contacts
- Elderly care: fall detection via accelerometer, daily wellness check-in (Good/Okay/Need Help), medication reminders
- Journey sharing: share live route with ETA; auto-closes when destination reached
- Geofencing: set safe zones (Home, School, Office etc.) with enter/exit alerts

Keep responses under 3 sentences unless a detailed explanation is genuinely needed.`

const STATIC_FALLBACK = "Thanks for reaching out! I'm your KVL Track AI assistant — here to help with family safety, location tracking, SOS alerts, and more. What would you like to know?"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = body.messages || []

    if (!messages.length) {
      return NextResponse.json({ content: "Hi! 👋 I'm KVL Track AI. How can I help you today?" })
    }

    // 1. Try Python backend (has Groq/Mistral/DeepSeek/Together/OpenRouter keys)
    const backendUrl = process.env.INTERNAL_API_URL || 'http://127.0.0.1:8001'
    try {
      const backendRes = await fetch(`${backendUrl}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        signal: AbortSignal.timeout(20000),
      })
      if (backendRes.ok) {
        const data = await backendRes.json()
        if (data.content) return NextResponse.json({ content: data.content })
      }
    } catch {
      // backend down or timeout — fall through
    }

    // 2. Try Anthropic Claude (if key is configured)
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (anthropicKey) {
      try {
        const { default: Anthropic } = await import('@anthropic-ai/sdk')
        const client = new Anthropic({ apiKey: anthropicKey })
        const response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        })
        const text = response.content[0].type === 'text' ? response.content[0].text : ''
        if (text) return NextResponse.json({ content: text })
      } catch {
        // Anthropic failed — fall through
      }
    }

    // 3. Try Groq directly (if key is configured)
    const groqKey = process.env.GROQ_API_KEY
    if (groqKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            max_tokens: 400,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
            ],
          }),
          signal: AbortSignal.timeout(15000),
        })
        if (groqRes.ok) {
          const data = await groqRes.json()
          const text = data.choices?.[0]?.message?.content
          if (text) return NextResponse.json({ content: text })
        }
      } catch {
        // Groq failed — fall through
      }
    }

    // 4. Static fallback — always returns something useful, never an error
    return NextResponse.json({ content: STATIC_FALLBACK })
  } catch {
    return NextResponse.json({ content: STATIC_FALLBACK })
  }
}
