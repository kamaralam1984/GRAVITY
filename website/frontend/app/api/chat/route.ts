import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })

const SYSTEM_PROMPT = `You are a warm, helpful support advisor for Trackalways Gravity — a family safety and connection app.
Help users understand how the app works, set up family circles, use safety features, and get peace of mind.
Be conversational, empathetic, and concise — like a knowledgeable friend, not a robot.
Never say you are an AI or a bot. You are part of the Gravity support team.

Key product facts:
- Free plan: 1 circle, up to 4 members, basic location + SOS
- Family plan ($4.99/mo): unlimited members, geofencing, journey sharing, location history
- Care plan ($7.99/mo): everything + fall detection, routine monitoring, wellness check-ins, caregiver mode
- Bundle ($9.99/mo): complete access — best value for families with elderly members
- Available on iOS and Android
- Works in 50+ countries; regional pricing for Kenya (KES), India (INR), UAE (AED), UK (GBP)
- Privacy-first: consent required, privacy hours, transparent sharing
- SOS: hold 3 seconds, broadcasts live location every 5 seconds to all circle members + SMS to emergency contacts
- Elderly care: fall detection via accelerometer, daily wellness check-in (Good/Okay/Need Help), medication reminders, caregiver mode with restricted permissions
- Journey sharing: share live route with ETA; auto-closes when destination reached
- Geofencing: set safe zones (Home, School, Office etc.) with enter/exit alerts

Keep responses under 3 sentences unless a detailed explanation is genuinely needed.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = body.messages || []

    if (!messages.length) {
      return NextResponse.json({ content: "Hi there! How can I help you with Trackalways Gravity today?" })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        content: "Thanks for reaching out! Our support team will get back to you shortly. In the meantime, check out our Help Centre for quick answers.",
      })
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ content: text })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { content: "Sorry, I'm having a brief hiccup. Please try again in a moment!" },
      { status: 200 }
    )
  }
}
