import PulseDashboard from '@/components/dashboard/PulseDashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // AUTH BYPASS — mock data for preview
  const brand = {
    id: 'preview-brand',
    name: 'SmarvexAI Demo',
    logo_url: null,
    shopify_domain: null,
    shopify_access_token: null,
    created_at: new Date().toISOString(),
  }

  const stats = {
    revenue_today: 14750,
    revenue_month: 312480,
    revenue_last_month: 285000,
    orders_today: 23,
    orders_month: 418,
    total_customers: 1842,
    new_customers_month: 94,
    low_stock_count: 3,
    recent_orders: [
      {
        id: 'ord-001',
        brand_id: 'preview-brand',
        shopify_order_id: '5001',
        order_number: 1051,
        customer_name: 'Ahmed Hassan',
        customer_email: 'ahmed@example.com',
        total_price: '1250.00',
        financial_status: 'paid',
        fulfillment_status: 'fulfilled',
        shopify_created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        line_items: [],
      },
      {
        id: 'ord-002',
        brand_id: 'preview-brand',
        shopify_order_id: '5002',
        order_number: 1050,
        customer_name: 'Sara Mostafa',
        customer_email: 'sara@example.com',
        total_price: '3600.00',
        financial_status: 'paid',
        fulfillment_status: 'unfulfilled',
        shopify_created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        line_items: [],
      },
      {
        id: 'ord-003',
        brand_id: 'preview-brand',
        shopify_order_id: '5003',
        order_number: 1049,
        customer_name: 'Omar Khalid',
        customer_email: 'omar@example.com',
        total_price: '870.00',
        financial_status: 'paid',
        fulfillment_status: 'fulfilled',
        shopify_created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        line_items: [],
      },
      {
        id: 'ord-004',
        brand_id: 'preview-brand',
        shopify_order_id: '5004',
        order_number: 1048,
        customer_name: 'Nour Ibrahim',
        customer_email: 'nour@example.com',
        total_price: '2100.00',
        financial_status: 'paid',
        fulfillment_status: 'fulfilled',
        shopify_created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        line_items: [],
      },
      {
        id: 'ord-005',
        brand_id: 'preview-brand',
        shopify_order_id: '5005',
        order_number: 1047,
        customer_name: 'Mona Adel',
        customer_email: 'mona@example.com',
        total_price: '4930.00',
        financial_status: 'paid',
        fulfillment_status: 'unfulfilled',
        shopify_created_at: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
        line_items: [],
      },
    ],
    top_products: [],
  }

  return <PulseDashboard brand={brand} stats={stats} />
}
