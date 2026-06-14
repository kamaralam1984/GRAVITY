'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles, Brain } from 'lucide-react'

/* ─────────────── types ─────────────── */
interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

/* ─────────────── helpers ─────────────── */
function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/* ─────────────── constants ─────────────── */
const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: "Hi! 👋 I'm Gravity AI. Ask me about features, pricing, or how to get started with family safety.",
  timestamp: nowTime(),
}

const QUICK_SUGGESTIONS = [
  'Where is my child?',
  'Is grandma safe?',
  'Show family activity today',
  'Any unusual behavior?',
  'Emergency recommendations',
  'Family safety score',
]

/* ─────────────── typing indicator ─────────────── */
function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm w-fit"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full block"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

/* ─────────────── message timestamp ─────────────── */
function Timestamp({ time }: { time: string }) {
  return (
    <span className="text-[10px] mt-1 font-body" style={{ color: 'rgba(148,163,184,0.55)' }}>
      {time}
    </span>
  )
}

/* ─────────────── main component ─────────────── */
export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasConversation = messages.length > 1
  const charCount = input.length
  const charLimit = 280

  /* entrance animation after 2s */
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 2000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 320)
  }, [isOpen])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isLoading || trimmed.length > charLimit) return

    const userMsg: Message = { role: 'user', content: trimmed, timestamp: nowTime() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.content || "Thanks for reaching out! I'm here to help with Gravity.",
          timestamp: nowTime(),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: nowTime(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* ── Chat window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 z-50 flex flex-col"
            style={{ maxHeight: 580 }}
          >
            <div
              className="flex flex-col rounded-2xl overflow-hidden shadow-2xl"
              style={{
                backdropFilter: 'blur(28px)',
                background: 'rgba(10,18,46,0.96)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 0 50px rgba(59,130,246,0.2), 0 30px 60px rgba(0,0,0,0.55)',
              }}
            >
              {/* ── Header ── */}
              <div
                className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(139,92,246,0.15) 100%)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 0 16px rgba(59,130,246,0.5)' }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full opacity-30"
                    style={{ background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.4), transparent)' }}
                  />
                  <Sparkles size={16} className="text-white relative z-10" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white leading-tight font-display flex items-center gap-1.5">
                    <Brain size={12} className="text-purple-300" />
                    AI Guardian
                  </p>
                  <p className="text-xs flex items-center gap-1.5" style={{ color: '#10B981' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    Online · Always here
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 flex-shrink-0"
                  aria-label="Close chat"
                >
                  <X size={15} style={{ color: '#94A3B8' }} />
                </button>
              </div>

              {/* ── Context banner (first open only) ── */}
              {!hasConversation && (
                <div
                  className="px-4 py-2.5 text-xs text-center font-body"
                  style={{
                    background: 'rgba(59,130,246,0.07)',
                    borderBottom: '1px solid rgba(59,130,246,0.12)',
                    color: '#93C5FD',
                  }}
                >
                  Ask about features, pricing, or getting started
                </div>
              )}

              {/* ── Messages ── */}
              <div
                className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
                style={{ maxHeight: 272, scrollbarWidth: 'thin', scrollbarColor: 'rgba(59,130,246,0.25) transparent' }}
              >
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className="px-4 py-2.5 text-sm leading-relaxed max-w-[88%] font-body"
                      style={{
                        color: '#F8FAFC',
                        ...(msg.role === 'user'
                          ? {
                              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                              borderRadius: '1.1rem 1.1rem 0.25rem 1.1rem',
                              boxShadow: '0 4px 16px rgba(59,130,246,0.25)',
                            }
                          : {
                              backdropFilter: 'blur(12px)',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.09)',
                              borderRadius: '1.1rem 1.1rem 1.1rem 0.25rem',
                            }),
                      }}
                    >
                      {msg.content}
                    </div>
                    <Timestamp time={msg.timestamp} />
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-start"
                  >
                    <TypingIndicator />
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Quick suggestions ── */}
              <AnimatePresence>
                {!hasConversation && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-3 flex flex-wrap gap-2"
                  >
                    {QUICK_SUGGESTIONS.map((s) => (
                      <motion.button
                        key={s}
                        onClick={() => sendMessage(s)}
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs px-3 py-1.5 rounded-full font-body transition-all"
                        style={{
                          backdropFilter: 'blur(12px)',
                          background: 'rgba(59,130,246,0.10)',
                          border: '1px solid rgba(59,130,246,0.28)',
                          color: '#93C5FD',
                        }}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Input row ── */}
              <div
                className="p-3 flex-shrink-0"
                style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="relative flex items-center">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value.slice(0, charLimit))}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about Gravity…"
                    disabled={isLoading}
                    className="w-full rounded-full pl-4 pr-14 py-3 text-sm outline-none transition-all disabled:opacity-50 font-body"
                    style={{
                      backdropFilter: 'blur(12px)',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      color: '#F8FAFC',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(59,130,246,0.5)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.09)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />

                  {/* Send button inside input */}
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-opacity disabled:opacity-35 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
                    aria-label="Send message"
                  >
                    <Send size={13} className="text-white" style={{ transform: 'translateX(1px)' }} />
                  </motion.button>
                </div>

                {/* Character counter */}
                <div className="flex justify-end mt-1 pr-2">
                  <span
                    className="text-[10px] font-body"
                    style={{ color: charCount > charLimit * 0.85 ? '#F59E0B' : 'rgba(148,163,184,0.4)' }}
                  >
                    {charCount}/{charLimit}
                  </span>
                </div>
              </div>

              {/* Powered by footer */}
              <div
                className="flex items-center justify-center gap-1.5 pb-2.5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px', marginTop: '2px' }}
              >
                <Sparkles size={9} style={{ color: 'rgba(167,139,250,0.5)' }} />
                <span className="text-[9px] font-body" style={{ color: 'rgba(148,163,184,0.35)' }}>
                  Powered by Gravity AI Guardian
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger button ── */}
      <AnimatePresence>
        {mounted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 260 }}
            className="fixed bottom-6 right-6 z-50 group"
          >
            {/* Tooltip */}
            <AnimatePresence>
              {!isOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 8, scale: 0.92 }}
                  animate={{ opacity: 0, x: 0, scale: 1 }}
                  whileHover={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <div
                    className="px-3 py-2 rounded-xl text-xs font-medium font-body"
                    style={{
                      background: 'rgba(10,18,46,0.95)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#F8FAFC',
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                    }}
                  >
                    Chat with Gravity AI
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pulsing ring when closed */}
            {!isOpen && (
              <motion.span
                className="absolute inset-0 rounded-full"
                animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.4))' }}
              />
            )}

            <motion.button
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => setIsOpen((v) => !v)}
              className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                boxShadow: '0 0 32px rgba(59,130,246,0.45), 0 8px 24px rgba(0,0,0,0.35)',
              }}
              aria-label={isOpen ? 'Close Gravity AI' : 'Open Gravity AI'}
            >
              {/* AI badge */}
              {!isOpen && (
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white font-display"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', boxShadow: '0 2px 8px rgba(245,158,11,0.5)' }}
                >
                  AI
                </div>
              )}

              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <X size={22} className="text-white" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <MessageCircle size={22} className="text-white" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
