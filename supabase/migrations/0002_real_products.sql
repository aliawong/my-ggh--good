-- Replace the demo catalog with real Comfy Foot products.
--
-- price / stock_qty / target_age_group become nullable: "not yet provided"
-- must stay genuinely blank in the UI, not silently become $0.00, "0 in
-- stock", or an invented "All ages" default.

alter table products
  add column if not exists item_number text,
  add column if not exists barcode text,
  add column if not exists pack_size text;

create unique index if not exists products_barcode_key on products(barcode) where barcode is not null;
create unique index if not exists products_item_number_key on products(item_number) where item_number is not null;

alter table products alter column price drop not null;
alter table products alter column price drop default;
alter table products drop constraint if exists products_price_check;
alter table products add constraint products_price_check check (price is null or price >= 0);

alter table products alter column stock_qty drop not null;
alter table products alter column stock_qty drop default;
alter table products drop constraint if exists products_stock_qty_check;
alter table products add constraint products_stock_qty_check check (stock_qty is null or stock_qty >= 0);

alter table products alter column target_age_group drop not null;
alter table products alter column target_age_group drop default;

-- ── wipe demo data — sample products/inquiries/sales only, not real data ──
delete from sales;
delete from inquiries;
delete from products;

-- ── real products (only fields provided so far; everything else left blank) ──
insert into products (name, category, item_number, barcode, pack_size, description)
values
  ('Comfy Stop Shoe Odor 1S', 'Shoe Care', '900937', '9555677900937', '1 box, 20 pieces', null),
  ('Comfy Foot Heel Cushion Pad', 'Heel Cushion / Shoe Comfort', null, '9555677900890', null,
   'Suitable for leather shoes and sports shoes');
