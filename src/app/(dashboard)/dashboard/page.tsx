import PulseDashboard from '@/components/dashboard/PulseDashboard'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const brand = {
    id: 'preview-brand',
    name: 'SmarvexAI Demo',
    logo_url: null as null,
    shopify_domain: null as null,
    shopify_access_token: null as null,
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
      { id: 'o1', brand_id: 'preview-brand', shopify_order_id: '5001', order_number: 1051, customer_name: 'Ahmed Hassan', customer_email: 'ahmed@example.com', total_price: '1250.00', financial_status: 'paid', fulfillment_status: 'fulfilled', shopify_created_at: new Date(Date.now() - 1800000).toISOString(), line_items: [] },
      { id: 'o2', brand_id: 'preview-brand', shopify_order_id: '5002', order_number: 1050, customer_name: 'Sara Mostafa', customer_email: 'sara@example.com', total_price: '3600.00', financial_status: 'paid', fulfillment_status: 'unfulfilled', shopify_created_at: new Date(Date.now() - 5400000).toISOString(), line_items: [] },
      { id: 'o3', brand_id: 'preview-brand', shopify_order_id: '5003', order_number: 1049, customer_name: 'Omar Khalid', customer_email: 'omar@example.com', total_price: '870.00', financial_status: 'paid', fulfillment_status: 'fulfilled', shopify_created_at: new Date(Date.now() - 10800000).toISOString(), line_items: [] },
      { id: 'o4', brand_id: 'preview-brand', shopify_order_id: '5004', order_number: 1048, customer_name: 'Nour Ibrahim', customer_email: 'nour@example.com', total_price: '2100.00', financial_status: 'paid', fulfillment_status: 'fulfilled', shopify_created_at: new Date(Date.now() - 18000000).toISOString(), line_items: [] },
      { id: 'o5', brand_id: 'preview-brand', shopify_order_id: '5005', order_number: 1047, customer_name: 'Mona Adel', customer_email: 'mona@example.com', total_price: '4930.00', financial_status: 'paid', fulfillment_status: 'unfulfilled', shopify_created_at: new Date(Date.now() - 25200000).toISOString(), line_items: [] },
    ],
    top_products: [],
  }

  return <PulseDashboard brand={brand} stats={stats} />
}
