-- ============================================
--  Study Flow — настройка базы Supabase
--  Скопируйте и выполните в Supabase SQL Editor
--  (Dashboard → SQL Editor → New query → Run)
-- ============================================

-- ────────────────────────────────────────────
--  МИГРАЦИЯ существующей таблицы profiles
--  (если база уже была с VK-данными)
--  Безопасно выполнять повторно.
-- ────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'telegram_id'
  ) then
    -- Снимаем vk_id как primary key
    alter table public.profiles drop constraint if exists profiles_pkey;
    -- Добавляем автоинкрементный id
    alter table public.profiles add column if not exists id bigint generated always as identity primary key;
    -- vk_id больше не обязателен и не PK
    alter table public.profiles alter column vk_id drop not null;
    alter table public.profiles add constraint profiles_vk_id_unique unique (vk_id);
    -- Колонка для Telegram
    alter table public.profiles add column telegram_id text;
    alter table public.profiles add constraint profiles_telegram_id_unique unique (telegram_id);
  end if;
end $$;

-- ────────────────────────────────────────────
--  СВОЖАЯ УСТАНОВКА (новая база)
-- ────────────────────────────────────────────
create table if not exists public.profiles (
  id bigint generated always as identity primary key,
  vk_id text unique,
  telegram_id text unique,
  full_name text,
  photo_url text,
  role text default 'user',
  created_date timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles for select using (true);

drop policy if exists "profiles_upsert" on public.profiles;
create policy "profiles_upsert" on public.profiles for insert with check (true);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update using (true);

-- Таблица общих дедлайнов группы
create table if not exists public.deadlines (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  subject text,
  due_date timestamptz not null,
  is_notified boolean default false,
  created_by_id text,
  created_by_name text,
  created_date timestamptz default now()
);

alter table public.deadlines enable row level security;

drop policy if exists "deadlines_read" on public.deadlines;
create policy "deadlines_read" on public.deadlines for select using (true);

drop policy if exists "deadlines_insert" on public.deadlines;
create policy "deadlines_insert" on public.deadlines for insert with check (true);

drop policy if exists "deadlines_update" on public.deadlines;
create policy "deadlines_update" on public.deadlines for update using (true);

drop policy if exists "deadlines_delete" on public.deadlines;
create policy "deadlines_delete" on public.deadlines for delete using (true);
