// Writes public/sitemap.xml before each build: the main pages, every book and every public shelf.
// Usage: node scripts/generate-sitemap.mjs (runs automatically as part of `npm run build`)
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const SITE = "https://boi-poka.vercel.app";
const OUTPUT = new URL("../public/sitemap.xml", import.meta.url);

// Vercel provides these as environment variables; locally they come from .env
const envFile = new URL("../.env", import.meta.url);
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const query = async (path) => {
  const base = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!base || !key) return [];
  const response = await fetch(`${base}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  return response.ok ? response.json() : [];
};

const day = (date) => (date ? new Date(date).toISOString().slice(0, 10) : undefined);

const entry = ({ path, lastmod, priority }) =>
  [
    "  <url>",
    `    <loc>${SITE}${path}</loc>`,
    lastmod && `    <lastmod>${lastmod}</lastmod>`,
    priority && `    <priority>${priority}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");

let books = [];
let shelves = [];
try {
  [books, shelves] = await Promise.all([
    query("books?select=id,created_at&order=created_at.desc"),
    query("profiles?select=username,created_at&is_public=eq.true"),
  ]);
} catch (error) {
  // A sitemap with just the main pages is better than a failed deploy
  console.warn(`sitemap: couldn't reach Supabase (${error.message}); writing main pages only`);
}

const urls = [
  { path: "/", priority: "1.0" },
  { path: "/library", priority: "0.9" },
  { path: "/free", priority: "0.8" },
  { path: "/login", priority: "0.5" },
  ...shelves.map((profile) => ({ path: `/u/${profile.username}`, lastmod: day(profile.created_at), priority: "0.7" })),
  ...books.map((book) => ({ path: `/book/${book.id}`, lastmod: day(book.created_at), priority: "0.6" })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(entry).join("\n")}
</urlset>
`;

writeFileSync(OUTPUT, xml);
console.log(`sitemap: ${urls.length} URLs (${books.length} books, ${shelves.length} public shelves)`);
