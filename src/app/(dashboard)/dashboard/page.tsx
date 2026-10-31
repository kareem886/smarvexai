import PulseDashboard from '@/components/dashboard/PulseDashboard'
import { Brand, DashboardStats } from '@/types'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const brand: Brand = {
    id: 'preview-brand',
    name: 'SmarvexAI Demo',
    slug: 'smarvexai-demo',
    logo_url: null,
    primary_color: '#4db8b8',
    owner_id: 'preview-owner',
    shopify_domain: null,
    shopify_connected: false,
    created_at: new Date().toISOString(),
  }

  const stats: DashboardStats = {
    revenue_today: 14750,
    revenue_month: 312480,
    revenue_last_month: 285000,
    orders_today: 23,
    orders_month: 418,
    total_customers: 1842,
    new_customers_month: 94,
    low_stock_count: 3,
    recent_orders: [
      { id: 'o1', brand_id: 'preview-brand', shopify_order_id: '5001', order_number: 1051, email: 'ahmed@example.com', total_price: 1250, subtotal_price: 1200, total_discounts: 0, currency: 'EGP', financial_status: 'paid', fulfillment_status: 'fulfilled', shopify_created_at: new Date(Date.now() - 1800000).toISOString() },
      { id: 'o2', brand_id: 'preview-brand', shopify_order_id: '5002', order_number: 1050, email: 'sara@example.com', total_price: 3600, subtotal_price: 3600, total_discounts: 0, currency: 'EGP', financial_status: 'paid', fulfillment_status: 'unfulfilled', shopify_created_at: new Date(Date.now() - 5400000).toISOString() },
      { id: 'o3', brand_id: 'preview-brand', shopify_order_id: '5003', order_number: 1049, email: 'omar@example.com', total_price: 870, subtotal_price: 870, total_discounts: 0, currency: 'EGP', financial_status: 'paid', fulfillment_status: 'fulfilled', shopify_created_at: new Date(Date.now() - 10800000).toISOString() },
      { id: 'o4', brand_id: 'preview-brand', shopify_order_id: '5004', order_number: 1048, email: 'nour@example.com', total_price: 2100, subtotal_price: 1900, total_discounts: 200, currency: 'EGP', financial_status: 'paid', fulfillment_status: 'fulfilled', shopify_created_at: new Date(Date.now() - 18000000).toISOString() },
      { id: 'o5', brand_id: 'preview-brand', shopify_order_id: '5005', order_number: 1047, email: 'mona@example.com', total_price: 4930, subtotal_price: 4930, total_discounts: 0, currency: 'EGP', financial_status: 'paid', fulfillment_status: 'unfulfilled', shopify_created_at: new Date(Date.now() - 25200000).toISOString() },
    ],
    top_products: [],
  }

  return <PulseDashboard brand={brand} stats={stats} />
}
