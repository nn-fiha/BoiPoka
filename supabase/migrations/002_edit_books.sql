-- Let readers fix book details (genre, pages, cover…) for books they added or have on their shelf

-- Only descriptive columns are editable; id, created_by and openlibrary_key stay fixed
revoke update on public.books from authenticated;
grant update (title, author, genre, language, pages, publisher, cover_url, isbn) on public.books to authenticated;

create policy "Readers edit books they added or shelved"
  on public.books for update
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.shelf_entries e
      where e.book_id = books.id and e.user_id = auth.uid()
    )
  )
  with check (true);
