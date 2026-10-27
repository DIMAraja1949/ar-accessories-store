do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'name'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'title'
  ) then
    alter table public.products rename column name to title;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'name_en'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'title_en'
  ) then
    alter table public.products rename column name_en to title_en;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'image'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'featured_image'
  ) then
    alter table public.products rename column image to featured_image;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'tag'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'tags'
  ) then
    alter table public.products rename column tag to tags;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'review_count'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'reviews_count'
  ) then
    alter table public.products rename column review_count to reviews_count;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'details'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'details_material'
  ) then
    alter table public.products rename column details to details_material;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'tags'
      and data_type in ('text', 'character varying', 'character')
  ) then
    alter table public.products
      alter column tags type text[]
      using case
        when tags is null or btrim(tags) = '' then '{}'::text[]
        else string_to_array(tags, ',')
      end;
  end if;
end
$$;

alter table public.products
  add column if not exists title_en text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists description_en text,
  add column if not exists short_description text,
  add column if not exists reviews_count integer,
  add column if not exists details_material text;

notify pgrst, 'reload schema';
