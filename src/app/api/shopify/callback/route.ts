import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const shop = searchParams.get('shop')
  const state = searchParams.get('state')

  if (!code || !shop || !state) {
    return NextResponse.redirect(new URL('/dashboard?error=shopify_missing_params', request.url))
  }

  // Validate shop domain
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/
  if (!shopRegex.test(shop)) {
    return NextResponse.redirect(new URL('/dashboard?error=shopify_invalid_shop', request.url))
  }

  // Decode state to get userId
  let userId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    userId = decoded.userId
    // Check timestamp isn't too old (10 minutes)
    if (Date.now() - decoded.timestamp > 10 * 60 * 1000) {
      return NextResponse.redirect(new URL('/dashboard?error=shopify_state_expired', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/dashboard?error=shopify_invalid_state', request.url))
  }

  // Exchange code for access token
  const clientId = process.env.SHOPIFY_CLIENT_ID!
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET!

  let accessToken: string
  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    if (!tokenRes.ok) {
      console.error('Shopify token exchange failed:', await tokenRes.text())
      return NextResponse.redirect(new URL('/dashboard?error=shopify_token_failed', request.url))
    }

    const tokenData = await tokenRes.json()
    accessToken = tokenData.access_token
  } catch (err) {
    console.error('Shopify token exchange error:', err)
    return NextResponse.redirect(new URL('/dashboard?error=shopify_token_error', request.url))
  }

  // Save to Supabase
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

  // Get brand_id for this user
  const { data: brandUser } = await supabase
    .from('brand_users')
    .select('brand_id')
    .eq('user_id', userId)
    .single()

  if (!brandUser) {
    return NextResponse.redirect(new URL('/dashboard?error=shopify_no_brand', request.url))
  }

  // Upsert the Shopify connection
  const { error: upsertError } = await supabase
    .from('brand_shopify_connections')
    .upsert({
      brand_id: brandUser.brand_id,
      shop_domain: shop,
      access_token: accessToken,
      scopes: 'read_orders,read_products,read_customers,read_inventory',
      connected_at: new Date().toISOString(),
    }, {
      onConflict: 'brand_id',
    })

  if (upsertError) {
    console.error('Supabase upsert error:', upsertError)
    return NextResponse.redirect(new URL('/dashboard?error=shopify_save_failed', request.url))
  }

  // Success!
  return NextResponse.redirect(new URL('/dashboard?shopify=connected', request.url))
}
