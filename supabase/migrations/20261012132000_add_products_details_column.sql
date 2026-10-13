alter table public.products
  add column if not exists details text;

notify pgrst, 'reload schema';
