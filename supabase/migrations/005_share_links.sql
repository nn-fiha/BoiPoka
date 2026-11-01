-- Share your shelf with friends through a private link, even when it isn't public

alter table public.profiles
  add column share_enabled boolean not null default false,
  add column share_token uuid not null default gen_random_uuid() unique;

-- Row-level security already hides non-public profiles (and so their tokens) from
-- everyone but the owner, who rotates the token by updating their own row.

-- Everything needed to show a shared shelf, for anyone holding a valid link.
-- security definer bypasses row-level security, so it checks the owner's choice itself.
create or replace function public.shared_shelf(token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'profile', jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'display_name', p.display_name,
      'bio', p.bio,
      'is_public', p.is_public
    ),
    'entries', coalesce((
      select jsonb_agg(to_jsonb(e) || jsonb_build_object('book', to_jsonb(b)))
      from public.shelf_entries e
      join public.books b on b.id = e.book_id
      where e.user_id = p.id
    ), '[]'::jsonb),
    'collections', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'entryIds', coalesce((select jsonb_agg(cb.entry_id) from public.collection_books cb where cb.collection_id = c.id), '[]'::jsonb)
      ) order by c.created_at)
      from public.collections c
      where c.user_id = p.id
    ), '[]'::jsonb),
    'goal', (
      select to_jsonb(g) from public.reading_goals g
      where g.user_id = p.id and g.year = extract(year from now())::smallint
    )
  )
  from public.profiles p
  where p.share_token = token
    and (p.share_enabled or p.is_public);
$$;

grant execute on function public.shared_shelf(uuid) to anon, authenticated;
