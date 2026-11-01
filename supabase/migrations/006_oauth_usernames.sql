-- Google (and other OAuth) sign-ups don't send a username, so build one from the email
-- address, e.g. "nurun.fiha@gmail.com" -> "nurunfiha_3fa2". Email sign-ups keep theirs.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  chosen text := lower(new.raw_user_meta_data ->> 'username');
  base text;
begin
  if chosen is null or chosen !~ '^[a-z0-9_]{3,24}$' then
    base := left(regexp_replace(lower(split_part(coalesce(new.email, 'reader'), '@', 1)), '[^a-z0-9_]', '', 'g'), 16);
    if length(base) < 3 then
      base := 'reader';
    end if;
    -- A short random suffix keeps generated names unique
    chosen := base || '_' || substr(md5(random()::text || new.id::text), 1, 4);
  end if;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    chosen,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      chosen
    )
  );
  return new;
end;
$$;
