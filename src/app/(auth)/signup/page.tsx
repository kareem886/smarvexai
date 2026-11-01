'use client'

import Link from 'next/link'
import { useState, useCallback } from 'react'
import { Sparkles, Check, X } from 'lucide-react'

interface PasswordRule {
  label: string
  test: (pw: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter (A–Z)', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter (a–z)', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number (0–9)', test: (pw) => /[0-9]/.test(pw) },
  { label: 'One special character (!@#$…)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
]

export default function SignupPage() {
  const [password, setPassword] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password))

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!allRulesPassed) {
      setError('Please meet all password requirements.')
      return
    }
    setError('')
    setLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      body: formData,
      redirect: 'manual',
    })

    // 3xx redirect — check where it's going
    if (res.type === 'opaqueredirect' || res.status === 0) {
      // fetch followed a redirect to /signup?error= or /signup/verify
      window.location.href = '/signup/verify'
      return
    }

    if (res.redirected) {
      const url = new URL(res.url)
      if (url.pathname.startsWith('/signup')) {
        const err = url.searchParams.get('error')
        setError(err ? decodeURIComponent(err) : 'Something went wrong.')
        setLoading(false)
      } else {
        window.location.href = res.url
      }
      return
    }

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json.error || 'Something went wrong.')
      setLoading(false)
      return
    }

    window.location.href = '/signup/verify'
  }, [allRulesPassed])

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
          <h2 className="text-white font-semibold text-base mb-5">Create your brand account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/40 text-xs font-medium mb-1.5 block uppercase tracking-wide">Brand Name</label>
              <input
                type="text"
                name="brandName"
                required
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-white/15 focus:outline-none focus:border-violet-500/50 focus:bg-white/6 transition-all text-sm"
                placeholder="Your Brand Name"
              />
            </div>

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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-white/15 focus:outline-none focus:border-violet-500/50 focus:bg-white/6 transition-all text-sm"
                placeholder="Create a strong password"
              />

              {/* Password rules — show when focused or when something is typed */}
              {(passwordFocused || password.length > 0) && (
                <div className="mt-3 space-y-1.5 bg-white/3 border border-white/6 rounded-xl px-4 py-3">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(password)
                    return (
                      <div key={rule.label} className="flex items-center gap-2">
                        <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors ${passed ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                          {passed
                            ? <Check size={10} className="text-emerald-400" />
                            : <X size={10} className="text-white/20" />
                          }
                        </span>
                        <span className={`text-xs transition-colors ${passed ? 'text-emerald-400' : 'text-white/30'}`}>
                          {rule.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (password.length > 0 && !allRulesPassed)}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 py-3 transition-all text-sm shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 mt-1"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-white/25 text-xs text-center mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
