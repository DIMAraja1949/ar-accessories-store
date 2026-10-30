create table if not exists public.product_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.product_admins enable row level security;

drop policy if exists "Users can read their own product admin membership" on public.product_admins;
create policy "Users can read their own product admin membership"
  on public.product_admins for select
  to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.is_product_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'chefabderrahim639@gmail.com'
    or exists (
      select 1
      from public.product_admins
      where user_id = (select auth.uid())
    );
$$;

revoke all on function public.is_product_admin() from public;
grant execute on function public.is_product_admin() to authenticated;
grant select on public.product_admins to authenticated;
