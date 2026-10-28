import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PulseDashboard from '@/components/dashboard/PulseDashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get the brand for this user
  const { data: brandUser } = await supabase
    .from('brand_users')
    .select('brand_id, role, brands(*)')
    .eq('user_id', user.id)
    .single()

  if (!brandUser) {
    // Brand data missing — sign out and redirect to login
    await supabase.auth.signOut()
    redirect('/login')
  }

  const brand = brandUser.brands as any

  // Fetch dashboard stats
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  const brandId = brand.id

  // Revenue this month
  const { data: ordersMonth } = await supabase
    .from('orders')
    .select('total_price, shopify_created_at')
    .eq('brand_id', brandId)
    .eq('financial_status', 'paid')
    .gte('shopify_created_at', startOfMonth)

  // Revenue today
  const { data: ordersToday } = await supabase
    .from('orders')
    .select('total_price')
    .eq('brand_id', brandId)
    .eq('financial_status', 'paid')
    .gte('shopify_created_at', startOfDay)

  // Revenue last month
  const { data: ordersLastMonth } = await supabase
    .from('orders')
    .select('total_price')
    .eq('brand_id', brandId)
    .eq('financial_status', 'paid')
    .gte('shopify_created_at', startOfLastMonth)
    .lte('shopify_created_at', endOfLastMonth)

  // Total customers
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brandId)

  // New customers this month
  const { count: newCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brandId)
    .gte('created_at', startOfMonth)

  // Low stock variants
  const { count: lowStockCount } = await supabase
    .from('variants')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brandId)
    .lte('inventory_quantity', 5)
    .gt('inventory_quantity', 0)

  // Recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('brand_id', brandId)
    .order('shopify_created_at', { ascending: false })
    .limit(5)

  const revenueMonth = ordersMonth?.reduce((sum, o) => sum + Number(o.total_price), 0) || 0
  const revenueToday = ordersToday?.reduce((sum, o) => sum + Number(o.total_price), 0) || 0
  const revenueLastMonth = ordersLastMonth?.reduce((sum, o) => sum + Number(o.total_price), 0) || 0

  const stats = {
    revenue_today: revenueToday,
    revenue_month: revenueMonth,
    revenue_last_month: revenueLastMonth,
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
