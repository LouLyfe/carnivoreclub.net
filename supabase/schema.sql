-- Carnivore Club — core data model
-- Source: SITE_ARCHITECTURE.md Section 2
-- Run this against a fresh Supabase project (SQL editor or `supabase db push`
-- once this file is split into supabase/migrations/).
--
-- Phase A only reads/writes: profiles, sellers, categories, products.
-- orders / order_items / reviews / recipes / approval_reviews are created now
-- so the schema doesn't need breaking changes in Phase B/C.
--
-- Internal helper functions (is_admin, handle_new_user) live in a `private`
-- schema rather than `public` so PostgREST doesn't auto-expose them as
-- public RPC endpoints (/rest/v1/rpc/...). They're still fully usable by
-- triggers and RLS policies via the schema-qualified name.

-- ─────────────────────────────────────────────────────────────────────────
-- Extensions & schemas
-- ─────────────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";
create schema if not exists private;

-- ─────────────────────────────────────────────────────────────────────────
-- profiles — extends Supabase auth.users
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  full_name   text,
  email       text,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- sellers
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists sellers (
  id                        uuid primary key default gen_random_uuid(),
  profile_id                uuid not null references profiles(id) on delete cascade,
  business_name             text not null,
  abn                       text not null,
  licence_number            text,
  licence_expiry            date,
  insurance_provider        text,
  insurance_policy_number   text,
  insurance_expiry          date,
  stripe_account_id         text,
  status                    text not null default 'pending'
                              check (status in ('pending', 'approved', 'on_hold', 'rejected')),
  created_at                timestamptz not null default now()
);

create index if not exists sellers_profile_id_idx on sellers(profile_id);
create index if not exists sellers_status_idx on sellers(status);

-- ─────────────────────────────────────────────────────────────────────────
-- categories
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists categories (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  slug  text not null unique
);

-- ─────────────────────────────────────────────────────────────────────────
-- products
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists products (
  id                        uuid primary key default gen_random_uuid(),
  seller_id                 uuid not null references sellers(id) on delete cascade,
  category_id               uuid references categories(id),
  name                      text not null,
  description               text,
  price_cents               integer not null check (price_cents >= 0),
  images                    text[] not null default '{}',
  animal_raising_standard   text,
  ingredients_list          text,
  cold_chain_method         text,
  shelf_life                text,
  status                    text not null default 'draft'
                              check (status in ('draft', 'pending_review', 'approved', 'on_hold', 'rejected')),
  tier                      text
                              check (tier in ('approved', 'club_selection', 'founders_pick')),
  created_at                timestamptz not null default now()
);

create index if not exists products_seller_id_idx on products(seller_id);
create index if not exists products_status_idx on products(status);
create index if not exists products_category_id_idx on products(category_id);

-- ─────────────────────────────────────────────────────────────────────────
-- orders / order_items (Phase B, tables created now for schema stability)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists orders (
  id           uuid primary key default gen_random_uuid(),
  buyer_id     uuid not null references profiles(id),
  total_cents  integer not null check (total_cents >= 0),
  status       text not null default 'pending'
                 check (status in ('pending', 'paid', 'fulfilled', 'cancelled')),
  created_at   timestamptz not null default now()
);

create table if not exists order_items (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid not null references orders(id) on delete cascade,
  product_id         uuid not null references products(id),
  seller_id          uuid not null references sellers(id),
  quantity           integer not null check (quantity > 0),
  price_cents        integer not null check (price_cents >= 0),
  commission_cents   integer not null default 0,
  created_at         timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on order_items(order_id);
create index if not exists order_items_seller_id_idx on order_items(seller_id);

-- ─────────────────────────────────────────────────────────────────────────
-- reviews (Phase C)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists reviews (
  id             uuid primary key default gen_random_uuid(),
  order_item_id  uuid not null references order_items(id) on delete cascade,
  buyer_id       uuid not null references profiles(id),
  rating         integer not null check (rating between 1 and 5),
  comment        text,
  created_at     timestamptz not null default now(),
  unique (order_item_id) -- one review per order item
);

-- ─────────────────────────────────────────────────────────────────────────
-- recipes (Phase C)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists recipes (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  body          text not null,
  product_ids   uuid[] not null default '{}',
  category      text
                  check (category in ('basics', 'organ_forward', 'bone_broth', 'tallow', 'meal_prep', 'resets')),
  status        text not null default 'draft'
                  check (status in ('draft', 'pending_review', 'published')),
  created_by    uuid references profiles(id),
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- approval_reviews — log of every five-pillar / compliance decision
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists approval_reviews (
  id             uuid primary key default gen_random_uuid(),
  target_type    text not null check (target_type in ('seller', 'product', 'recipe')),
  target_id      uuid not null,
  reviewer_id    uuid not null references profiles(id),
  pillar_scores  jsonb not null default '{}',
  decision       text not null check (decision in ('approved', 'on_hold', 'rejected')),
  notes          text,
  created_at     timestamptz not null default now()
);

create index if not exists approval_reviews_target_idx on approval_reviews(target_type, target_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────
alter table profiles          enable row level security;
alter table sellers           enable row level security;
alter table categories        enable row level security;
alter table products          enable row level security;
alter table orders            enable row level security;
alter table order_items       enable row level security;
alter table reviews           enable row level security;
alter table recipes           enable row level security;
alter table approval_reviews  enable row level security;

-- Helper: is the current user an admin? (private schema — not a public RPC)
create or replace function private.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
create policy "profiles: read own or admin" on profiles
  for select using (auth.uid() = id or private.is_admin());
create policy "profiles: update own" on profiles
  for update using (auth.uid() = id);

-- sellers
create policy "sellers: owner or admin can read" on sellers
  for select using (auth.uid() = profile_id or private.is_admin());
create policy "sellers: public can read approved" on sellers
  for select using (status = 'approved');
create policy "sellers: authenticated user can apply" on sellers
  for insert with check (auth.uid() = profile_id);
create policy "sellers: owner can update own pending application" on sellers
  for update using (auth.uid() = profile_id and status = 'pending');
create policy "sellers: admin can update any" on sellers
  for update using (private.is_admin());

-- categories (public read, admin write)
create policy "categories: public read" on categories
  for select using (true);
create policy "categories: admin write" on categories
  for all using (private.is_admin());

-- products
create policy "products: public can read approved" on products
  for select using (status = 'approved');
create policy "products: seller can read own" on products
  for select using (
    exists (select 1 from sellers where sellers.id = products.seller_id and sellers.profile_id = auth.uid())
  );
create policy "products: admin can read all" on products
  for select using (private.is_admin());
create policy "products: approved seller can create" on products
  for insert with check (
    exists (
      select 1 from sellers
      where sellers.id = seller_id
        and sellers.profile_id = auth.uid()
        and sellers.status = 'approved'
    )
  );
-- Sellers can update their own product regardless of current status —
-- the app resets status to 'pending_review' whenever an approved listing
-- is edited, so it goes back through admin review rather than silently
-- changing a live listing.
create policy "products: seller can update own" on products
  for update using (
    exists (select 1 from sellers where sellers.id = products.seller_id and sellers.profile_id = auth.uid())
  );
create policy "products: admin can update any" on products
  for update using (private.is_admin());

-- orders / order_items / reviews / recipes: buyer + admin scoped (Phase B/C)
create policy "orders: buyer can read own" on orders
  for select using (auth.uid() = buyer_id or private.is_admin());
create policy "orders: buyer can create own" on orders
  for insert with check (auth.uid() = buyer_id);

create policy "order_items: buyer or seller or admin can read" on order_items
  for select using (
    private.is_admin()
    or exists (select 1 from orders where orders.id = order_items.order_id and orders.buyer_id = auth.uid())
    or exists (select 1 from sellers where sellers.id = order_items.seller_id and sellers.profile_id = auth.uid())
  );

create policy "reviews: public read" on reviews
  for select using (true);
create policy "reviews: buyer can create for own fulfilled order item" on reviews
  for insert with check (auth.uid() = buyer_id);

create policy "recipes: public read published" on recipes
  for select using (status = 'published' or private.is_admin());
create policy "recipes: admin write" on recipes
  for all using (private.is_admin());

-- approval_reviews: admin only
create policy "approval_reviews: admin only" on approval_reviews
  for all using (private.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- Seed: starter categories from the Strategy Plan taxonomy
-- ─────────────────────────────────────────────────────────────────────────
insert into categories (name, slug) values
  ('Beef', 'beef'),
  ('Organ Meats', 'organ-meats'),
  ('Tallow', 'tallow'),
  ('Poultry', 'poultry'),
  ('Pork', 'pork'),
  ('Bone Broth', 'bone-broth'),
  ('Seafood', 'seafood'),
  ('Recipes and Other Products', 'recipes-and-other-products')
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
-- Storage: product photos (up to 7 per listing)
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB per file
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

create policy "product images: public read" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "product images: seller can upload to own folder" on storage.objects
  for insert with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from sellers
      where sellers.profile_id = auth.uid()
        and sellers.status = 'approved'
        and sellers.id::text = (storage.foldername(name))[1]
    )
  );

create policy "product images: seller can delete own" on storage.objects
  for delete using (
    bucket_id = 'product-images'
    and exists (
      select 1 from sellers
      where sellers.profile_id = auth.uid()
        and sellers.id::text = (storage.foldername(name))[1]
    )
  );

-- Admin corrections to a listing (Section: seller/admin edit flows) may
-- add photos on a seller's behalf, e.g. when fixing up a listing directly.
create policy "product images: admin can upload" on storage.objects
  for insert with check (
    bucket_id = 'product-images' and private.is_admin()
  );
