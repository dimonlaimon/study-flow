-- Заметки StudyFlow. Содержимое (заголовок и текст) хранится зашифрованным —
-- в базе нет читаемого текста. Пароль не используется: ключ шифрования
-- вычисляется на устройстве из id пользователя, пользователю ничего вводить не нужно.
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,          -- "vk_<id>" или "telegram_<id>"
  title_enc text not null,         -- зашифрованный заголовок, base64
  content_enc text,                -- зашифрованный текст, base64
  color text,                      -- цвет карточки (не секрет)
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists notes_owner_idx on public.notes (owner_id, created_date desc);

alter table public.notes enable row level security;

drop policy if exists "notes anon all" on public.notes;
create policy "notes anon all" on public.notes
  for all using (true) with check (true);

-- Если таблица notes_keys (эталоны паролей) успела создаться ранее — удаляем,
-- пароли больше не используются.
drop table if exists public.notes_keys;
