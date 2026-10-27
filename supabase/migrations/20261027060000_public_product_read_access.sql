drop policy if exists "Products are readable by everyone" on public.products;
create policy "Products are readable by everyone"
  on public.products for select
  to anon, authenticated
  using (true);

grant select on public.products to anon, authenticated;
