-- ============================================
--  Study Flow — настройка базы Supabase
--  Скопируйте и выполните в Supabase SQL Editor
-- ============================================

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'telegram_id'
  ) then
    alter table public.profiles drop constraint if exists profiles_pkey;
    alter table public.profiles add column if not exists id bigint generated always as identity primary key;
    alter table public.profiles alter column vk_id drop not null;
    alter table public.profiles add constraint profiles_vk_id_unique unique (vk_id);
    alter table public.profiles add column telegram_id text;
    alter table public.profiles add constraint profiles_telegram_id_unique unique (telegram_id);
  end if;
end $$;

alter table public.profiles add column if not exists vk_notify_enabled boolean default false;
alter table public.profiles add column if not exists tg_notify_enabled boolean default false;

create table if not exists public.profiles (
  id bigint generated always as identity primary key,
  vk_id text unique,
  telegram_id text unique,
  full_name text,
  photo_url text,
  role text default 'user',
  vk_notify_enabled boolean default false,
  tg_notify_enabled boolean default false,
  created_date timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles for select using (true);

drop policy if exists "profiles_upsert" on public.profiles;
create policy "profiles_upsert" on public.profiles for insert with check (true);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update using (true);

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

-- ЖУРНАЛ ОТПРАВЛЕННЫХ УВЕДОМЛЕНИЙ
create table if not exists public.notifications_sent (
  id bigint generated always as identity primary key,
  deadline_id bigint not null references public.deadlines(id) on delete cascade,
  profile_id bigint not null references public.profiles(id) on delete cascade,
  platform text not null,
  sent_date timestamptz default now(),
  unique (deadline_id, profile_id, platform)
);

alter table public.notifications_sent enable row level security;

drop policy if exists "notifications_sent_read" on public.notifications_sent;
create policy "notifications_sent_read" on public.notifications_sent for select using (true);

drop policy if exists "notifications_sent_insert" on public.notifications_sent;
create policy "notifications_sent_insert" on public.notifications_sent for insert with check (true);

drop policy if exists "notifications_sent_delete" on public.notifications_sent;
create policy "notifications_sent_delete" on public.notifications_sent for delete using (true);
