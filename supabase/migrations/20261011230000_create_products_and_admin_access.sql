create table if not exists public.products (
  id text primary key,
  name text not null,
  name_en text,
  category text not null default 'Accessories',
  price numeric not null check (price >= 0),
  original_price numeric check (original_price is null or original_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image text not null,
  tag text,
  tag_en text,
  description text,
  description_en text,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  gallery_images text[] not null default '{}',
  rating numeric check (rating is null or (rating >= 0 and rating <= 5)),
  review_count integer check (review_count is null or review_count >= 0),
  materials text,
  details text,
  created_at timestamptz not null default now()
);

create table if not exists public.product_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Create the admin in Supabase Auth first, then grant access:
-- insert into public.product_admins (user_id)
-- select id from auth.users where email = 'admin@example.com';

alter table public.products enable row level security;
alter table public.product_admins enable row level security;

create or replace function public.is_product_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.product_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_product_admin() from public;
grant execute on function public.is_product_admin() to authenticated;

drop policy if exists "Products are readable by everyone" on public.products;
create policy "Products are readable by everyone"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "Product admins can insert products" on public.products;
create policy "Product admins can insert products"
  on public.products for insert
  to authenticated
  with check ((select public.is_product_admin()));

drop policy if exists "Product admins can update products" on public.products;
create policy "Product admins can update products"
  on public.products for update
  to authenticated
  using ((select public.is_product_admin()))
  with check ((select public.is_product_admin()));

drop policy if exists "Product admins can delete products" on public.products;
create policy "Product admins can delete products"
  on public.products for delete
  to authenticated
  using ((select public.is_product_admin()));

drop policy if exists "Users can read their own product admin membership" on public.product_admins;
create policy "Users can read their own product admin membership"
  on public.product_admins for select
  to authenticated
  using (user_id = (select auth.uid()));

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.product_admins to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'products'
  ) then
    alter publication supabase_realtime add table public.products;
  end if;
end
$$;
