export type Brand = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  owner_id: string
  shopify_domain: string | null
  shopify_connected: boolean
  created_at: string
}

export type Product = {
  id: string
  brand_id: string
  shopify_product_id: string
  title: string
  handle: string | null
  product_type: string | null
  status: string
  tags: string[]
  image_url: string | null
  variants?: Variant[]
}

export type Variant = {
  id: string
  brand_id: string
  product_id: string
  shopify_variant_id: string
  title: string
  sku: string | null
  price: number
  compare_at_price: number | null
  inventory_quantity: number
}

export type Order = {
  id: string
  brand_id: string
  shopify_order_id: string
  order_number: number
  email: string | null
  financial_status: string
  fulfillment_status: string | null
  total_price: number
  subtotal_price: number
  total_discounts: number
  currency: string
  shopify_created_at: string
  items?: OrderItem[]
}

export type OrderItem = {
  id: string
  order_id: string
  title: string
  variant_title: string | null
  quantity: number
  price: number
}

export type Customer = {
  id: string
  brand_id: string
  shopify_customer_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  orders_count: number
  total_spent: number
  last_order_at: string | null
  city: string | null
}

export type DashboardStats = {
  revenue_today: number
  revenue_month: number
  revenue_last_month: number
  orders_today: number
  orders_month: number
  total_customers: number
  new_customers_month: number
  low_stock_count: number
  top_products: { title: string; revenue: number; units: number }[]
  recent_orders: Order[]
}

export type AIMessage = {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
