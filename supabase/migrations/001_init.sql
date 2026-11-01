-- BoiPoka schema: shared book catalog, per-user shelves and journals

-- Profiles ---------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text,
  bio text,
  is_public boolean not null default true,
  -- Opt-in: allow anonymised reviews to be used in research datasets
  research_consent boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are visible to everyone"
  on public.profiles for select
  using (is_public or id = auth.uid());

create policy "Users update their own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Create a profile row whenever someone signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    lower(new.raw_user_meta_data ->> 'username'),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Books (shared catalog) --------------------------------------------------
create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  genre text not null default 'Uncategorized',
  language text,
  pages integer check (pages > 0),
  publisher text,
  cover_url text,
  isbn text,
  openlibrary_key text unique,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.books enable row level security;

create policy "Anyone can browse the catalog"
  on public.books for select
  using (true);

create policy "Signed-in users can add books"
  on public.books for insert
  to authenticated
  with check (created_by = auth.uid());

-- Shelf entries (one per user per book) -----------------------------------
create table public.shelf_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  status text not null default 'read' check (status in ('read', 'reading', 'want')),
  started_at date,
  finished_at date,
  rating smallint not null default 0 check (rating between 0 and 5),
  moods text[] not null default '{}',
  review text not null default '',
  quotes jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create index shelf_entries_book_id_idx on public.shelf_entries (book_id);

alter table public.shelf_entries enable row level security;

create policy "Entries on public shelves are visible"
  on public.shelf_entries for select
  using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = user_id and p.is_public)
  );

create policy "Users add to their own shelf"
  on public.shelf_entries for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users edit their own shelf"
  on public.shelf_entries for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users remove from their own shelf"
  on public.shelf_entries for delete
  using (user_id = auth.uid());

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger shelf_entries_touch
  before update on public.shelf_entries
  for each row execute function public.touch_updated_at();
