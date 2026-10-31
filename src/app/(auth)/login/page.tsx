'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-[#080d1a] flex items-center justify-center px-4">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 mb-4">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">SIRO</h1>
          <p className="text-white/30 text-xs mt-1 font-medium tracking-widest uppercase">powered by SmarvexAI</p>
        </div>

        {/* Card */}
        <div className="bg-[#0c1525] border border-white/8 rounded-2xl p-7 shadow-2xl shadow-black/40">
          <h2 className="text-white font-semibold text-base mb-5">Sign in to your workspace</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/40 text-xs font-medium mb-1.5 block uppercase tracking-wide">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-white/15 focus:outline-none focus:border-violet-500/50 focus:bg-white/6 transition-all text-sm"
                placeholder="you@yourbrand.com"
              />
            </div>

            <div>
              <label className="text-white/40 text-xs font-medium mb-1.5 block uppercase tracking-wide">Password</label>
              <input
                type="password"
                name="password"
                required
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-white/15 focus:outline-none focus:border-violet-500/50 focus:bg-white/6 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-3 transition-all text-sm shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 mt-1"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-white/25 text-xs text-center mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
