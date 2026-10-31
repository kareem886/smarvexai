'use client'

import { useState, useRef, useEffect } from 'react'
import { AIMessage } from '@/types'
import { Send, Sparkles } from 'lucide-react'

interface Props {
  brandId: string
  brandName: string
}

const suggestions = [
  "What's my top product this month?",
  "How are sales trending?",
  "Which customers are most loyal?",
  "What should I restock soon?",
]

export default function SiroChat({ brandId, brandName }: Props) {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim()
    if (!content || loading) return

    const userMsg: AIMessage = { role: 'user', content, timestamp: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, question: content }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.answer || 'I couldn\'t get an answer right now.',
        timestamp: new Date().toISOString(),
      }])
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Connection error. Please try again.',
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)] max-h-[800px]">

      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">SIRO</h2>
          <p className="text-white/30 text-xs">Your brand intelligence assistant</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full px-2.5 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-violet-400 text-[10px] font-medium">Online</span>
        </div>
      </div>

      {/* Empty state */}
      {messages.length === 0 && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center mb-4">
            <Sparkles size={24} className="text-violet-400" />
          </div>
          <h3 className="text-white font-semibold text-base">Ask SIRO anything</h3>
          <p className="text-white/30 text-sm mt-1.5 max-w-xs">
            Ask about your sales, customers, stock, or trends — in English or Arabic
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-sm">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 text-white/50 hover:text-white/80 rounded-full px-3 py-1.5 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles size={13} className="text-violet-400" />
                </div>
              )}
              <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-white text-[#080d1a] font-medium rounded-br-sm'
                  : 'bg-[#0c1525] border border-white/6 text-white/80 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center shrink-0 mt-1">
                <Sparkles size={13} className="text-violet-400" />
              </div>
              <div className="bg-[#0c1525] border border-white/6 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-5">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div className="mt-4 flex gap-2.5 items-center bg-[#0c1525] border border-white/8 rounded-2xl px-4 py-2.5 focus-within:border-violet-500/40 transition-colors">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask SIRO anything…"
          className="flex-1 bg-transparent text-white placeholder-white/20 focus:outline-none text-sm"
          dir="auto"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30 hover:shadow-lg hover:shadow-violet-500/25 shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
