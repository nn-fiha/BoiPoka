-- Yearly reading goals: "read 24 books in 2026"

create table public.reading_goals (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  year smallint not null check (year between 1900 and 2100),
  target smallint not null check (target between 1 and 1000),
  updated_at timestamptz not null default now(),
  primary key (user_id, year)
);

alter table public.reading_goals enable row level security;

create policy "Goals on public shelves are visible"
  on public.reading_goals for select
  using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = user_id and p.is_public)
  );

create policy "Users set their own goals"
  on public.reading_goals for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users change their own goals"
  on public.reading_goals for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users remove their own goals"
  on public.reading_goals for delete
  using (user_id = auth.uid());
