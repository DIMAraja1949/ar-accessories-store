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
