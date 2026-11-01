-- Custom shelves, free-form tags, page progress and "readers also loved" recommendations

-- Page progress and tags live on each reader's entry
alter table public.shelf_entries
  add column current_page integer check (current_page >= 0),
  add column tags text[] not null default '{}';

-- Custom shelves ("Favourites", "Book club 2026", …) -------------------------
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.collection_books (
  collection_id uuid not null references public.collections (id) on delete cascade,
  entry_id uuid not null references public.shelf_entries (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (collection_id, entry_id)
);

alter table public.collections enable row level security;
alter table public.collection_books enable row level security;

create policy "Shelves on public profiles are visible"
  on public.collections for select
  using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = user_id and p.is_public)
  );

create policy "Users create their own shelves"
  on public.collections for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users rename their own shelves"
  on public.collections for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users delete their own shelves"
  on public.collections for delete
  using (user_id = auth.uid());

create policy "Shelf contents follow shelf visibility"
  on public.collection_books for select
  using (exists (select 1 from public.collections c where c.id = collection_id));

create policy "Users fill their own shelves with their own books"
  on public.collection_books for insert to authenticated
  with check (
    exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
    and exists (select 1 from public.shelf_entries e where e.id = entry_id and e.user_id = auth.uid())
  );

create policy "Users take books off their own shelves"
  on public.collection_books for delete
  using (exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid()));

-- Readers who rated this book 4+ stars also rated these 4+ stars --------------
-- security invoker: row-level security still hides private shelves
create function public.also_loved(target_book uuid, max_results integer default 6)
returns table (book_id uuid, readers bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select other.book_id, count(distinct other.user_id) as readers
  from public.shelf_entries fan
  join public.shelf_entries other
    on other.user_id = fan.user_id
   and other.book_id <> fan.book_id
   and other.rating >= 4
  where fan.book_id = target_book
    and fan.rating >= 4
  group by other.book_id
  order by readers desc, max(other.updated_at) desc
  limit max_results;
$$;
