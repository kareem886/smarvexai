import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Password validation — must match client-side rules
function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.'
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character.'
  return null
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const brandName = formData.get('brandName') as string

  const verifyUrl = new URL('/signup/verify', request.url)
  const errorUrl = new URL('/signup', request.url)

  // Server-side password validation (defence in depth)
  const pwError = validatePassword(password)
  if (pwError) {
    errorUrl.searchParams.set('error', pwError)
    return NextResponse.redirect(errorUrl)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() { /* no-op: not setting cookies on signup response */ },
      },
    }
  )

  // emailRedirectTo tells Supabase where to send the user after they click the link
  const emailRedirectTo = new URL('/auth/confirm', request.url).toString()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { brand_name: brandName },
      emailRedirectTo,
    },
  })

  if (error) {
    errorUrl.searchParams.set('error', error.message)
    return NextResponse.redirect(errorUrl)
  }

  // If email confirmation is disabled in Supabase (dev mode), user is already confirmed
  // data.user.email_confirmed_at will be set — create brand record and go to dashboard
  const user = data.user
  if (user && user.email_confirmed_at) {
    // Auto-confirmed (e.g. Supabase project has email confirm disabled)
    const slug = brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    await supabase.from('brands').insert({ name: brandName, slug, owner_id: user.id })
    const { data: brand } = await supabase.from('brands').select('id').eq('owner_id', user.id).single()
    if (brand) {
      await supabase.from('brand_users').insert({ brand_id: brand.id, user_id: user.id, role: 'owner' })
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Email confirmation required — brand record will be created in /auth/confirm after verification
  // Store brandName temporarily so confirm route can create the brand
  // We encode it in the redirect URL as a hint (confirm route reads it from the session metadata)
  return NextResponse.redirect(verifyUrl)
}
