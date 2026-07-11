-- Comfy Foot Sales & Product Assistant — core schema
-- Products catalog, customer inquiries, and logged sales (the core sale
-- engine decrements stock atomically via log_sale()).

create extension if not exists pgcrypto;

-- ── products ─────────────────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'General',
  material text not null default '',
  description text not null default '',
  pros text[] not null default '{}',
  benefits text[] not null default '{}',
  price numeric(10,2) not null default 0 check (price >= 0),
  stock_qty integer not null default 0 check (stock_qty >= 0),
  target_age_group text not null default 'All ages',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ── inquiries ────────────────────────────────────────────────────────────
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_age_group text not null default 'Unknown',
  kind text not null default 'inquiry' check (kind in ('inquiry', 'problem')),
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved')),
  rep_notes text not null default '',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ── sales ────────────────────────────────────────────────────────────────
create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  inquiry_id uuid references inquiries(id) on delete set null,
  customer_age_group text not null default 'Unknown',
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  total_amount numeric(10,2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now()
);

create index if not exists sales_product_id_idx on sales(product_id);
create index if not exists inquiries_product_id_idx on inquiries(product_id);
create index if not exists inquiries_status_idx on inquiries(status);

-- ── core engine: log a sale + decrement stock atomically ────────────────
create or replace function log_sale(
  p_product_id uuid,
  p_quantity integer,
  p_unit_price numeric,
  p_customer_age_group text default 'Unknown',
  p_inquiry_id uuid default null
)
returns sales
language plpgsql
as $$
declare
  v_sale sales;
  v_stock integer;
begin
  select stock_qty into v_stock from products where id = p_product_id for update;

  if v_stock is null then
    raise exception 'Product not found';
  end if;

  if v_stock < p_quantity then
    raise exception 'Not enough stock: only % left', v_stock;
  end if;

  update products set stock_qty = stock_qty - p_quantity where id = p_product_id;

  insert into sales (product_id, inquiry_id, customer_age_group, quantity, unit_price)
  values (p_product_id, p_inquiry_id, p_customer_age_group, p_quantity, p_unit_price)
  returning * into v_sale;

  if p_inquiry_id is not null then
    update inquiries
      set status = 'resolved', resolved_at = now()
      where id = p_inquiry_id and status <> 'resolved';
  end if;

  return v_sale;
end;
$$;

-- ── reporting views ──────────────────────────────────────────────────────
create or replace view product_performance as
select
  p.id as product_id,
  p.name,
  p.category,
  p.stock_qty,
  coalesce(sum(s.quantity), 0)::bigint as units_sold,
  coalesce(sum(s.total_amount), 0)::numeric(12,2) as revenue
from products p
left join sales s on s.product_id = p.id
group by p.id, p.name, p.category, p.stock_qty;

create or replace view age_group_performance as
select
  customer_age_group as age_group,
  count(*)::bigint as sale_count,
  coalesce(sum(quantity), 0)::bigint as units_sold,
  coalesce(sum(total_amount), 0)::numeric(12,2) as revenue
from sales
group by customer_age_group;

-- ── RLS: demo-first, no login wall yet (per PRD v1) ─────────────────────
-- Public anon key can read/write freely for now. A later "lock it down"
-- sprint will replace these with per-user/staff-only policies.
alter table products enable row level security;
alter table inquiries enable row level security;
alter table sales enable row level security;

drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (true);
drop policy if exists "public write products" on products;
create policy "public write products" on products for insert with check (true);
drop policy if exists "public update products" on products;
create policy "public update products" on products for update using (true);
drop policy if exists "public delete products" on products;
create policy "public delete products" on products for delete using (true);

drop policy if exists "public read inquiries" on inquiries;
create policy "public read inquiries" on inquiries for select using (true);
drop policy if exists "public write inquiries" on inquiries;
create policy "public write inquiries" on inquiries for insert with check (true);
drop policy if exists "public update inquiries" on inquiries;
create policy "public update inquiries" on inquiries for update using (true);
drop policy if exists "public delete inquiries" on inquiries;
create policy "public delete inquiries" on inquiries for delete using (true);

drop policy if exists "public read sales" on sales;
create policy "public read sales" on sales for select using (true);
drop policy if exists "public write sales" on sales;
create policy "public write sales" on sales for insert with check (true);
drop policy if exists "public delete sales" on sales;
create policy "public delete sales" on sales for delete using (true);

-- RLS policies only filter rows — the anon/authenticated roles also need the
-- base table grants, since this project's Vercel env only exposes the anon
-- key (no service role key configured).
grant select, insert, update, delete on products, inquiries, sales to anon, authenticated;
grant select on product_performance, age_group_performance to anon, authenticated;
grant execute on function log_sale to anon, authenticated;

-- ── seed data — demo placeholders, editable/deletable in the app ────────
insert into products (name, category, material, description, pros, benefits, price, stock_qty, target_age_group, image_url)
values
  ('CloudStep Gel Insoles', 'Insoles', 'Memory foam + gel core',
   'All-day cushioning insole that slips into almost any shoe.',
   array['Shock-absorbing gel core', 'Breathable top fabric', 'Trim-to-fit sizing'],
   array['Reduces heel and arch pain', 'All-day standing comfort', 'Fits dress and work shoes'],
   19.99, 140, '36-45', null),
  ('Orthopedic Arch Support Sandals', 'Sandals', 'EVA foam + cork footbed',
   'Adjustable sandals built around a contoured orthopedic footbed.',
   array['Podiatrist-designed arch support', 'Adjustable dual straps', 'Lightweight EVA sole'],
   array['Eases plantar fasciitis discomfort', 'All-day wear without fatigue', 'Machine washable straps'],
   34.99, 65, '46-60', null),
  ('Comfy Foot Memory Slippers', 'Slippers', 'Plush memory foam + fleece lining',
   'Indoor slippers with a foam sole that molds to your foot.',
   array['Non-slip rubber outsole', 'Fleece-lined interior', 'Machine washable'],
   array['Warm comfort at home', 'Reduces cold-floor foot pain', 'Great gift item'],
   24.99, 200, '60+', null),
  ('Compression Ankle Socks (3-pack)', 'Socks', 'Nylon-spandex blend',
   'Graduated compression socks to reduce swelling and improve circulation.',
   array['Graduated compression', 'Moisture-wicking fabric', 'Reinforced heel and toe'],
   array['Improves circulation on long shifts', 'Reduces foot and ankle swelling', 'Durable everyday wear'],
   15.99, 300, '18-25', null),
  ('Diabetic Comfort Walking Shoes', 'Shoes', 'Breathable mesh + seamless interior',
   'Wide-fit walking shoe designed for sensitive feet.',
   array['Seamless interior lining', 'Extra-wide toe box', 'Removable cushioned insole'],
   array['Minimizes friction and pressure points', 'Supports all-day walking', 'Diabetic-friendly design'],
   59.99, 40, '46-60', null),
  ('Kids Bouncy Sneakers', 'Shoes', 'Lightweight EVA + breathable mesh',
   'Playground-ready sneakers with extra bounce and grip.',
   array['Extra-cushioned sole', 'Reinforced toe cap', 'Easy velcro strap'],
   array['Keeps active kids comfortable', 'Durable for daily play', 'Easy for kids to put on'],
   27.99, 90, 'Under 18', null)
on conflict do nothing;

insert into inquiries (product_id, customer_name, customer_email, customer_age_group, kind, message, status, rep_notes)
select id, 'Maria Santos', 'maria.santos@example.com', '46-60', 'inquiry',
  'Do these sandals really help with plantar fasciitis? My heel pain is pretty bad by the end of the day.',
  'new', ''
from products where name = 'Orthopedic Arch Support Sandals'
on conflict do nothing;

insert into inquiries (product_id, customer_name, customer_email, customer_age_group, kind, message, status, rep_notes)
select id, 'James Cruz', 'jcruz@example.com', '18-25', 'problem',
  'The compression socks I bought last month feel like they''ve lost their stretch already. Is that normal after a few washes?',
  'in_progress', 'Asked for wash routine, following up with a replacement pack if needed.'
from products where name = 'Compression Ankle Socks (3-pack)'
on conflict do nothing;

insert into inquiries (product_id, customer_name, customer_email, customer_age_group, kind, message, status, rep_notes, resolved_at)
select id, 'Ben Alcantara', 'ben.a@example.com', '60+', 'inquiry',
  'Are the memory slippers machine washable? I need something easy to clean.',
  'resolved', 'Confirmed machine washable on cold, air dry. Customer purchased a pair.', now() - interval '2 days'
from products where name = 'Comfy Foot Memory Slippers'
on conflict do nothing;

-- a couple of historical sales so reports aren't empty on first load
insert into sales (product_id, customer_age_group, quantity, unit_price, created_at)
select id, '36-45', 3, price, now() - interval '6 days' from products where name = 'CloudStep Gel Insoles'
on conflict do nothing;

insert into sales (product_id, customer_age_group, quantity, unit_price, created_at)
select id, '60+', 2, price, now() - interval '3 days' from products where name = 'Comfy Foot Memory Slippers'
on conflict do nothing;

insert into sales (product_id, customer_age_group, quantity, unit_price, created_at)
select id, '46-60', 1, price, now() - interval '1 days' from products where name = 'Diabetic Comfort Walking Shoes'
on conflict do nothing;
