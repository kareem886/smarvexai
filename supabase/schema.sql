-- ============================================================
-- SmarvexAI Database Schema
-- Multi-tenant: each brand is fully isolated via brand_id
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- BRANDS (one row per clothing brand client)
-- ============================================================
create table brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text default '#0f4c75',
  owner_id uuid references auth.users(id) on delete cascade,
  shopify_domain text unique,
  shopify_access_token text,
  shopify_connected boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- BRAND USERS (team members per brand)
-- ============================================================
create table brand_users (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'owner' check (role in ('owner', 'admin', 'viewer')),
  created_at timestamptz default now(),
  unique(brand_id, user_id)
);

-- ============================================================
-- PRODUCTS (synced from Shopify)
-- ============================================================
create table products (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id) on delete cascade,
  shopify_product_id text not null,
  title text not null,
  handle text,
  product_type text,
  status text default 'active',
  tags text[],
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(brand_id, shopify_product_id)
);

-- ============================================================
-- VARIANTS (size, color per product)
-- ============================================================
create table variants (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  shopify_variant_id text not null,
  title text not null,
  sku text,
  price numeric(10,2),
  compare_at_price numeric(10,2),
  inventory_quantity integer default 0,
  weight numeric(8,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(brand_id, shopify_variant_id)
);

-- ============================================================
-- ORDERS (synced from Shopify)
-- ============================================================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id) on delete cascade,
  shopify_order_id text not null,
  order_number integer,
  email text,
  phone text,
  financial_status text,
  fulfillment_status text,
  total_price numeric(10,2),
  subtotal_price numeric(10,2),
  total_discounts numeric(10,2) default 0,
  currency text default 'EGP',
  customer_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  shopify_created_at timestamptz,
  unique(brand_id, shopify_order_id)
);

-- ============================================================
-- ORDER ITEMS (line items per order)
-- ============================================================
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  variant_id uuid references variants(id),
  shopify_line_item_id text,
  title text,
  variant_title text,
  quantity integer,
  price numeric(10,2),
  total_discount numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- CUSTOMERS (synced from Shopify)
-- ============================================================
create table customers (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id) on delete cascade,
  shopify_customer_id text not null,
  first_name text,
  last_name text,
  email text,
  phone text,
  orders_count integer default 0,
  total_spent numeric(10,2) default 0,
  last_order_at timestamptz,
  tags text[],
  city text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(brand_id, shopify_customer_id)
);

-- ============================================================
-- AI CONVERSATIONS (chat history per brand)
-- ============================================================
create table ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id) on delete cascade,
  user_id uuid references auth.users(id),
  messages jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SYNC LOGS (track when data was last pulled)
-- ============================================================
create table sync_logs (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id) on delete cascade,
  entity text not null, -- 'orders', 'products', 'customers'
  status text default 'success' check (status in ('success', 'error', 'running')),
  records_synced integer default 0,
  error_message text,
  synced_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (each brand only sees their own data)
-- ============================================================
alter table brands enable row level security;
alter table brand_users enable row level security;
alter table products enable row level security;
alter table variants enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table customers enable row level security;
alter table ai_conversations enable row level security;
alter table sync_logs enable row level security;

-- Brands: owner can see their brand
create policy "Brand owner access" on brands
  for all using (owner_id = auth.uid());

-- Brand users: members can see brands they belong to
create policy "Brand member access" on brand_users
  for all using (user_id = auth.uid());

-- All data tables: access via brand membership
create policy "Brand data access - products" on products
  for all using (brand_id in (
    select brand_id from brand_users where user_id = auth.uid()
  ));

create policy "Brand data access - variants" on variants
  for all using (brand_id in (
    select brand_id from brand_users where user_id = auth.uid()
  ));

create policy "Brand data access - orders" on orders
  for all using (brand_id in (
    select brand_id from brand_users where user_id = auth.uid()
  ));

create policy "Brand data access - order_items" on order_items
  for all using (brand_id in (
    select brand_id from brand_users where user_id = auth.uid()
  ));

create policy "Brand data access - customers" on customers
  for all using (brand_id in (
    select brand_id from brand_users where user_id = auth.uid()
  ));

create policy "Brand data access - ai_conversations" on ai_conversations
  for all using (brand_id in (
    select brand_id from brand_users where user_id = auth.uid()
  ));

create policy "Brand data access - sync_logs" on sync_logs
  for all using (brand_id in (
    select brand_id from brand_users where user_id = auth.uid()
  ));

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index on orders(brand_id, shopify_created_at desc);
create index on orders(brand_id, financial_status);
create index on products(brand_id, status);
create index on variants(brand_id, inventory_quantity);
create index on customers(brand_id, total_spent desc);
create index on customers(brand_id, last_order_at desc);
create index on order_items(brand_id, product_id);
