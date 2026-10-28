'use client'

import { useState, useRef, useEffect } from 'react'
import { AIMessage } from '@/types'
import { Send, Bot } from 'lucide-react'

interface Props {
  brandId: string
  brandName: string
}

export default function AIAskBar({ brandId, brandName }: Props) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content: `مرحباً! أنا مساعد ${brandName} الذكي. اسألني عن مبيعاتك، مخزونك، أو عملاؤك.\n\nHello! I'm your ${brandName} AI assistant. Ask me anything about your sales, stock, or customers.`,
      timestamp: new Date().toISOString(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg: AIMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, question: userMsg.content }),
      })

      const data = await res.json()
      const aiMsg: AIMessage = {
        role: 'assistant',
        content: data.answer || 'Sorry, I could not get an answer right now.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Connection error. Please try again.',
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="mb-4">
        <h2 className="text-white text-lg font-semibold">Ask AI</h2>
        <p className="text-[#8a9bb5] text-sm mt-0.5">Ask anything about your business — in Arabic or English</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-[#4db8b8]/20 border border-[#4db8b8]/30 flex items-center justify-center shrink-0 mt-1">
                <Bot size={16} className="text-[#4db8b8]" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-[#4db8b8] text-[#0a1628] font-medium'
                : 'bg-[#0f2040] border border-[#1a3050] text-white'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4db8b8]/20 border border-[#4db8b8]/30 flex items-center justify-center shrink-0 mt-1">
              <Bot size={16} className="text-[#4db8b8]" />
            </div>
            <div className="bg-[#0f2040] border border-[#1a3050] rounded-2xl px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-2 h-2 bg-[#4db8b8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[#4db8b8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[#4db8b8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="What's my top product this month? / ما هو أكثر منتج مبيعاً؟"
          className="flex-1 bg-[#0f2040] border border-[#1a3050] rounded-xl px-4 py-3 text-white placeholder-[#3a5070] focus:outline-none focus:border-[#4db8b8] transition-colors text-sm"
          dir="auto"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="w-12 h-12 bg-[#4db8b8] hover:bg-[#3da0a0] text-[#0a1628] rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
