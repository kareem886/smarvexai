'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [brandName, setBrandName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { brand_name: brandName }
      }
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Create the brand record
      const slug = brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const { error: brandError } = await supabase.from('brands').insert({
        name: brandName,
        slug,
        owner_id: data.user.id,
      })

      if (!brandError) {
        // Add owner to brand_users
        const { data: brand } = await supabase
          .from('brands')
          .select('id')
          .eq('owner_id', data.user.id)
          .single()

        if (brand) {
          await supabase.from('brand_users').insert({
            brand_id: brand.id,
            user_id: data.user.id,
            role: 'owner'
          })
        }
      }

      // Full page reload so the server middleware picks up the new session cookie
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white">SmarvexAI</h1>
          <p className="text-[#4db8b8] mt-1 text-sm">Brand Intelligence Platform</p>
        </div>

        <div className="bg-[#0f2040] border border-[#1a3050] rounded-2xl p-8">
          <h2 className="text-white text-xl font-semibold mb-6">Create your brand account</h2>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-[#8a9bb5] text-sm mb-1 block">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
                className="w-full bg-[#0a1628] border border-[#1a3050] rounded-lg px-4 py-3 text-white placeholder-[#3a5070] focus:outline-none focus:border-[#4db8b8] transition-colors"
                placeholder="Your Brand Name"
              />
            </div>

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
                minLength={6}
                className="w-full bg-[#0a1628] border border-[#1a3050] rounded-lg px-4 py-3 text-white placeholder-[#3a5070] focus:outline-none focus:border-[#4db8b8] transition-colors"
                placeholder="Min. 6 characters"
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-[#8a9bb5] text-sm text-center mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4db8b8] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
