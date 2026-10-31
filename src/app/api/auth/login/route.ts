import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const errorUrl = new URL('/login', request.url)

  // Collect cookies that Supabase wants to set
  const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(incoming) {
          // Collect — we'll apply to response after sign-in
          incoming.forEach(({ name, value, options }) => {
            cookiesToSet.push({ name, value, options })
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  console.log('[LOGIN] error:', error?.message ?? 'null')
  console.log('[LOGIN] user:', data?.user?.id ?? 'null')
  console.log('[LOGIN] session:', data?.session ? 'present' : 'null')
  console.log('[LOGIN] cookies to set:', cookiesToSet.map(c => c.name).join(', ') || 'NONE')

  if (error || !data.session) {
    errorUrl.searchParams.set('error', error?.message ?? 'Login failed')
    return NextResponse.redirect(errorUrl)
  }

  // Build redirect response AFTER sign-in so we apply real session cookies
  const response = NextResponse.redirect(new URL('/dashboard', request.url))

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  })

  console.log('[LOGIN] response cookies set:', response.cookies.getAll().map(c => c.name).join(', ') || 'NONE')

  return response
}
