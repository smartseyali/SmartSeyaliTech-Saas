-- ─────────────────────────────────────────────────────────────────────────────
-- SmartSeyali Storefront — Supabase schema
-- Run this migration once in your Supabase project SQL editor.
-- All tables are scoped by company_id (integer FK to the companies table).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── ecom_categories ──────────────────────────────────────────────────────────
create table if not exists ecom_categories (
  id          bigserial primary key,
  company_id  integer not null,
  slug        text    not null,
  name        text    not null,
  image_url   text,
  sort_order  integer default 0,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (company_id, slug)
);

alter table ecom_categories enable row level security;
create policy "public read" on ecom_categories for select using (is_active = true);

-- ── ecom_products ────────────────────────────────────────────────────────────
create table if not exists ecom_products (
  id                 bigserial primary key,
  company_id         integer not null,
  slug               text    not null,
  name               text    not null,
  category           text    not null default '',
  category_slug      text    not null default '',
  description        text    not null default '',
  short_description  text    not null default '',
  -- Images: prefer images[] array; image_url is a convenience single-image column
  image_url          text,
  images             text[],
  price              numeric(10,2) not null,
  compare_at_price   numeric(10,2),
  rating             numeric(3,1),
  rating_count       integer,
  badge              text check (badge in ('new','bestseller','sale','out-of-stock')),
  in_stock           boolean default true,
  is_featured        boolean default false,
  is_active          boolean default true,
  weight             text,
  sort_order         integer default 0,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  unique (company_id, slug)
);

alter table ecom_products enable row level security;
create policy "public read" on ecom_products for select using (is_active = true);

-- ── ecom_customers ───────────────────────────────────────────────────────────
create table if not exists ecom_customers (
  id         bigserial primary key,
  company_id integer not null,
  name       text    not null,
  email      text    not null,
  phone      text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (company_id, email)
);

alter table ecom_customers enable row level security;
create policy "insert own" on ecom_customers for insert with check (true);

-- ── ecom_orders ──────────────────────────────────────────────────────────────
create table if not exists ecom_orders (
  id                bigserial primary key,
  company_id        integer not null,
  order_number      text    not null,
  customer_name     text    not null,
  customer_email    text    not null,
  customer_phone    text,
  shipping_address  jsonb   not null default '{}',
  billing_address   jsonb,
  subtotal          numeric(10,2) not null,
  shipping_amount   numeric(10,2) default 0,
  tax_amount        numeric(10,2) default 0,
  discount_amount   numeric(10,2) default 0,
  grand_total       numeric(10,2) not null,
  payment_method    text    not null,          -- 'cod' | 'razorpay'
  payment_status    text    not null default 'pending', -- 'pending' | 'paid' | 'failed'
  payment_id        text,                      -- Razorpay payment ID
  status            text    not null default 'pending', -- 'pending'|'confirmed'|'shipped'|'delivered'|'cancelled'
  source            text    default 'storefront',
  tracking_number   text,
  courier_name      text,
  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique (company_id, order_number)
);

alter table ecom_orders enable row level security;
-- Customers can insert their own order; read is restricted (handled by app)
create policy "insert" on ecom_orders for insert with check (true);
create policy "read own" on ecom_orders for select using (true);
create policy "update own" on ecom_orders for update using (true);

-- ── ecom_order_items ─────────────────────────────────────────────────────────
create table if not exists ecom_order_items (
  id           bigserial primary key,
  order_id     bigint  not null references ecom_orders(id) on delete cascade,
  company_id   integer not null,
  product_id   text    not null,
  variant_id   text,
  product_name text    not null,
  variant_name text,
  image_url    text,
  quantity     integer not null,
  unit_price   numeric(10,2) not null,
  amount       numeric(10,2) not null,
  created_at   timestamptz default now()
);

alter table ecom_order_items enable row level security;
create policy "insert" on ecom_order_items for insert with check (true);

-- ── ecom_order_timeline ──────────────────────────────────────────────────────
create table if not exists ecom_order_timeline (
  id         bigserial primary key,
  order_id   bigint  not null references ecom_orders(id) on delete cascade,
  company_id integer,
  status     text    not null,
  note       text,
  created_at timestamptz default now()
);

alter table ecom_order_timeline enable row level security;
create policy "insert" on ecom_order_timeline for insert with check (true);

-- ── Helpful indexes ───────────────────────────────────────────────────────────
create index if not exists idx_ecom_products_company_active  on ecom_products (company_id, is_active);
create index if not exists idx_ecom_products_company_slug    on ecom_products (company_id, slug);
create index if not exists idx_ecom_orders_company_email     on ecom_orders   (company_id, customer_email);
create index if not exists idx_ecom_orders_company_number    on ecom_orders   (company_id, order_number);
