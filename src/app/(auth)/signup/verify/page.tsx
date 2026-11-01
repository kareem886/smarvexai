import Link from 'next/link'
import { Sparkles, Mail } from 'lucide-react'

export default function VerifyEmailPage() {
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
        <div className="bg-[#0c1525] border border-white/8 rounded-2xl p-7 shadow-2xl shadow-black/40 text-center">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-5">
            <Mail size={26} className="text-violet-400" />
          </div>

          <h2 className="text-white font-semibold text-base mb-2">Check your email</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            We&apos;ve sent a verification link to your email address. Click the link to activate your account.
          </p>

          <div className="bg-white/3 border border-white/6 rounded-xl px-4 py-3 text-white/30 text-xs leading-relaxed mb-6">
            Didn&apos;t receive it? Check your spam folder, or{' '}
            <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
              try again
            </Link>{' '}
            with a different email.
          </div>

          <Link
            href="/login"
            className="block w-full bg-white/5 hover:bg-white/8 border border-white/8 text-white/60 hover:text-white font-medium rounded-xl px-4 py-3 transition-all text-sm"
          >
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  )
}
