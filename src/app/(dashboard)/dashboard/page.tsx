import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PulseDashboard from '@/components/dashboard/PulseDashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: brandUser } = await supabase
    .from('brand_users')
    .select('brand_id, role, brands(*)')
    .eq('user_id', user.id)
    .single()

  if (!brandUser) {
    await supabase.auth.signOut()
    redirect('/login')
  }

  const brand = brandUser.brands as any

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()
  const brandId = brand.id

  const [
    { data: ordersMonth },
    { data: ordersToday },
    { data: ordersLastMonth },
    { count: totalCustomers },
    { count: newCustomers },
    { count: lowStockCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('total_price').eq('brand_id', brandId).eq('financial_status', 'paid').gte('shopify_created_at', startOfMonth),
    supabase.from('orders').select('total_price').eq('brand_id', brandId).eq('financial_status', 'paid').gte('shopify_created_at', startOfDay),
    supabase.from('orders').select('total_price').eq('brand_id', brandId).eq('financial_status', 'paid').gte('shopify_created_at', startOfLastMonth).lte('shopify_created_at', endOfLastMonth),
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('brand_id', brandId),
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('brand_id', brandId).gte('created_at', startOfMonth),
    supabase.from('variants').select('*', { count: 'exact', head: true }).eq('brand_id', brandId).lte('inventory_quantity', 5).gt('inventory_quantity', 0),
    supabase.from('orders').select('*').eq('brand_id', brandId).order('shopify_created_at', { ascending: false }).limit(5),
  ])

  const stats = {
    revenue_today: ordersToday?.reduce((s, o) => s + Number(o.total_price), 0) || 0,
    revenue_month: ordersMonth?.reduce((s, o) => s + Number(o.total_price), 0) || 0,
    revenue_last_month: ordersLastMonth?.reduce((s, o) => s + Number(o.total_price), 0) || 0,
    orders_today: ordersToday?.length || 0,
    orders_month: ordersMonth?.length || 0,
    total_customers: totalCustomers || 0,
    new_customers_month: newCustomers || 0,
    low_stock_count: lowStockCount || 0,
    recent_orders: recentOrders || [],
    top_products: [],
  }

  return <PulseDashboard brand={brand} stats={stats} />
}
