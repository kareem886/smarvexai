import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write cookies to the request (for downstream server components)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Rebuild the response so cookies are forwarded to the browser
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: do not add any logic between createServerClient and getUser()
  // A simple mistake could make it impossible to debug session issues.
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login' || pathname === '/signup'
  const isDashboard = pathname.startsWith('/dashboard')
  const isApi = pathname.startsWith('/api')

  // Unauthenticated user trying to access protected routes
  if (!user && isDashboard) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated user trying to access auth pages → send to dashboard
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: return supabaseResponse (not NextResponse.next()) so cookies are set
  return supabaseResponse
}
