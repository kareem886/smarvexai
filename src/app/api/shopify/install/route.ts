import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shop = searchParams.get('shop')

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 })
  }

  // Validate shop domain
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/
  if (!shopRegex.test(shop)) {
    return NextResponse.json({ error: 'Invalid shop domain' }, { status: 400 })
  }

  // Check user is authenticated
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID!
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://smarvexai-git-main-moghazy.vercel.app'}/api/shopify/callback`
  const scopes = 'read_orders,read_products,read_customers,read_inventory'

  // Generate a random state for CSRF protection
  const state = Buffer.from(JSON.stringify({ userId: user.id, timestamp: Date.now() })).toString('base64url')

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`

  return NextResponse.redirect(installUrl)
}
