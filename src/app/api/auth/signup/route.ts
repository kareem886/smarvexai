import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const brandName = formData.get('brandName') as string

  const successUrl = new URL('/dashboard', request.url)
  const errorUrl = new URL('/signup', request.url)

  const response = NextResponse.redirect(successUrl)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { brand_name: brandName } },
  })

  if (error) {
    errorUrl.searchParams.set('error', error.message)
    return NextResponse.redirect(errorUrl)
  }

  if (data.user) {
    const slug = brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const { error: brandError } = await supabase.from('brands').insert({
      name: brandName,
      slug,
      owner_id: data.user.id,
    })

    if (!brandError) {
      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('owner_id', data.user.id)
        .single()

      if (brand) {
        await supabase.from('brand_users').insert({
          brand_id: brand.id,
          user_id: data.user.id,
          role: 'owner',
        })
      }
    }
  }

  return response
}
