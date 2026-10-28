import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { brandId, question } = await req.json()

    // Verify user belongs to this brand
    const { data: brandUser } = await supabase
      .from('brand_users')
      .select('brand_id')
      .eq('user_id', user.id)
      .eq('brand_id', brandId)
      .single()

    if (!brandUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Gather brand context from DB
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [
      { data: brand },
      { data: topProducts },
      { data: recentOrders },
      { data: lowStock },
      { data: topCustomers },
    ] = await Promise.all([
      supabase.from('brands').select('name').eq('id', brandId).single(),
      supabase.from('order_items').select('title, quantity, price').eq('brand_id', brandId).gte('created_at', startOfMonth).limit(50),
      supabase.from('orders').select('order_number, total_price, financial_status, shopify_created_at').eq('brand_id', brandId).order('shopify_created_at', { ascending: false }).limit(10),
      supabase.from('variants').select('title, inventory_quantity, products(title)').eq('brand_id', brandId).lte('inventory_quantity', 5).gt('inventory_quantity', 0).limit(10),
      supabase.from('customers').select('first_name, last_name, total_spent, orders_count, last_order_at').eq('brand_id', brandId).order('total_spent', { ascending: false }).limit(5),
    ])

    // Build context string
    const context = `
Brand: ${brand?.name}
Date: ${now.toLocaleDateString('en-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

RECENT ORDERS (last 10):
${recentOrders?.map(o => `- Order #${o.order_number}: EGP ${o.total_price} (${o.financial_status}) on ${new Date(o.shopify_created_at).toLocaleDateString()}`).join('\n') || 'No recent orders'}

TOP ITEMS THIS MONTH:
${topProducts?.map(i => `- ${i.title}: ${i.quantity} units at EGP ${i.price} each`).join('\n') || 'No data yet'}

LOW STOCK VARIANTS:
${lowStock?.map(v => `- ${(v.products as any)?.title} / ${v.title}: ${v.inventory_quantity} units left`).join('\n') || 'No low stock items'}

TOP CUSTOMERS:
${topCustomers?.map(c => `- ${c.first_name} ${c.last_name}: EGP ${c.total_spent} total, ${c.orders_count} orders, last order: ${c.last_order_at ? new Date(c.last_order_at).toLocaleDateString() : 'N/A'}`).join('\n') || 'No customer data'}
    `.trim()

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 500,
      system: `You are the AI business assistant for ${brand?.name}, an Egyptian clothing brand.
You have access to their real store data. Answer questions concisely and specifically using the data provided.
You can respond in Arabic or English depending on what language the user asks in.
Be direct, specific, and actionable. Use Egyptian Pound (EGP) for currency.
If you don't have enough data to answer precisely, say so honestly.`,
      messages: [
        {
          role: 'user',
          content: `Store Data:\n${context}\n\nQuestion: ${question}`
        }
      ]
    })

    const answer = message.content[0].type === 'text' ? message.content[0].text : 'Could not generate a response.'

    return NextResponse.json({ answer })
  } catch (error) {
    console.error('AI ask error:', error)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
