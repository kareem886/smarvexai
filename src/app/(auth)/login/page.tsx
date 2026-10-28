'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white">SmarvexAI</h1>
          <p className="text-[#4db8b8] mt-1 text-sm">Brand Intelligence Platform</p>
        </div>

        {/* Card */}
        <div className="bg-[#0f2040] border border-[#1a3050] rounded-2xl p-8">
          <h2 className="text-white text-xl font-semibold mb-6">Sign in to your brand</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[#8a9bb5] text-sm mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0a1628] border border-[#1a3050] rounded-lg px-4 py-3 text-white placeholder-[#3a5070] focus:outline-none focus:border-[#4db8b8] transition-colors"
                placeholder="you@yourbrand.com"
              />
            </div>

            <div>
              <label className="text-[#8a9bb5] text-sm mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0a1628] border border-[#1a3050] rounded-lg px-4 py-3 text-white placeholder-[#3a5070] focus:outline-none focus:border-[#4db8b8] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4db8b8] hover:bg-[#3da0a0] text-[#0a1628] font-semibold rounded-lg px-4 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-[#8a9bb5] text-sm text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#4db8b8] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
