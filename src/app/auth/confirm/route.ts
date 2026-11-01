import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  const cookieStore = await cookies()

  if (token_hash && type) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.verifyOtp({
      type: type as 'email' | 'recovery' | 'invite' | 'email_change',
      token_hash,
    })

    if (!error && data.user) {
      const user = data.user
      const brandName = (user.user_metadata?.brand_name as string) || 'My Brand'

      // Create brand + brand_user records now that email is confirmed
      const existing = await supabase.from('brands').select('id').eq('owner_id', user.id).maybeSingle()
      if (!existing.data) {
        const slug = brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const { data: brand } = await supabase
          .from('brands')
          .insert({ name: brandName, slug, owner_id: user.id })
          .select('id')
          .single()

        if (brand) {
          await supabase.from('brand_users').insert({
            brand_id: brand.id,
            user_id: user.id,
            role: 'owner',
          })
        }
      }

      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Verification failed
  return NextResponse.redirect(
    new URL('/login?error=Email+verification+failed.+Please+try+signing+up+again.', request.url)
  )
}
