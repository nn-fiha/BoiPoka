# BoiPoka · আমার পড়ার জগৎ

A bookshelf for every book you've read. Sign up, put books on your wooden shelf, and keep a
journal for each one — status, rating, how it felt, your thoughts (বাংলায় or English) and the
lines you loved. Shelves are public by default, so readers can browse each other's shelves and
see what others felt about a book.

Built with React 18, Vite, Tailwind CSS and Supabase (Postgres + Auth).

## Features
- **Accounts** — email/password sign-up; each reader gets a shelf at `/u/<username>`
- **Bookshelf** — spines sized by page count, grouped by genre or author, with search, status filters and reading stats
- **Book journal** — Read / Reading / Want to read, star rating, dates, mood tags, review, quotes; autosaves
- **Add books** — search the shared BoiPoka library and [Open Library](https://openlibrary.org), or add by hand (handy for Bangla books Open Library lacks)
- **Readers' notes** — every book page shows what other readers wrote
- **Privacy** — make your shelf private, and opt in (or not) to sharing anonymised reviews for Bangla NLP research

## Setup
1. Create a free project at [supabase.com](https://supabase.com).
2. In the project's **SQL Editor**, run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql), then [`supabase/seed.sql`](supabase/seed.sql) (30 starter Bangla books).
3. Copy `.env.example` to `.env` and fill in the **Project URL** and **anon public key** from *Project Settings → API*.
4. Install and run:
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:3000.

> Supabase asks new users to confirm their email by default. For quick local testing you can turn
> that off under *Authentication → Sign In / Providers → Email → Confirm email*.

## Data model
| Table | What it holds |
|---|---|
| `profiles` | username, display name, bio, `is_public`, `research_consent` (one row per auth user, created by trigger) |
| `books` | shared catalog: title, author, genre, language, pages, cover, ISBN, Open Library key |
| `shelf_entries` | one per reader per book: status, dates, rating, moods, review, quotes |

Row-level security lets anyone read public shelves, but only the owner can change their own shelf.

## Scripts
- `npm run dev` — dev server
- `npm run build` — production build into `dist/`
- `node scripts/generate-seed.mjs` — regenerate `supabase/seed.sql` from the original mock catalog
