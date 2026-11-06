// Finds free, public-domain copies of catalog books that readers can read inside BoiPoka:
// Bangla books on Bangla Wikisource and English books on Project Gutenberg.
// Writes supabase/migrations/008_free_reading.sql to run in the Supabase SQL editor.
// Usage: node --env-file=.env scripts/find-free-reads.mjs
import { writeFileSync } from "node:fs";

const { VITE_SUPABASE_URL: base, VITE_SUPABASE_ANON_KEY: anonKey } = process.env;
if (!base || !anonKey) throw new Error("Run with --env-file=.env so the Supabase URL and key are set");

// Wikimedia asks scripts to say who they are
const HEADERS = { "User-Agent": "BoiPokaReader/1.0 (https://boi-poka.vercel.app; finds public-domain books)" };
const WIKISOURCE = "https://bn.wikisource.org/w/api.php";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sql = (value) => `'${String(value).replace(/'/g, "''")}'`;
const simplify = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ঀ-৿]/g, "");

// Bangla spellings vary (গীতাঞ্জলী / গীতাঞ্জলি, ঘরে বাইরে / ঘরে-বাইরে, two ways to type ৎ),
// so compare titles and names on a loosened form
const banglaKey = (text = "") =>
  text
    .normalize("NFC")
    .replace(/\u09a4\u09cd\u200d/g, "\u09ce")
    .replace(/\u09c0/g, "\u09bf")
    .replace(/\u09c2/g, "\u09c1")
    .replace(/[\s\-\u200c\u200d।,.]/g, "");

// Lower-case words separated by single spaces: "Gulliver's Travels" → "gullivers travels"
const words = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\u2019']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getJson = async (url) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.status === 429 || res.status >= 500) {
      await sleep(5000 * (attempt + 1));
      continue;
    }
    return res.ok ? res.json() : null;
  }
  return null;
};

const wiki = (params) =>
  getJson(`${WIKISOURCE}?${new URLSearchParams({ ...params, format: "json", formatversion: "2" })}`);

// Links in a page's HTML, in reading order
const linksIn = (html) => [...html.matchAll(/<a href="\/wiki\/[^"#]+"[^>]*title="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));

const wikisourceWork = async (book) => {
  const title = book.title.trim();
  const search = await wiki({ action: "query", list: "search", srsearch: title, srnamespace: "0", srlimit: "30" });
  // Same title, optionally followed by "(author, year)" or "(প্রথম পর্ব)"
  const candidates = new Set(
    (search?.query?.search || [])
      .map((r) => r.title)
      .filter((t) => !t.includes("/") && banglaKey(t.replace(/\s*\(.*\)$/, "")) === banglaKey(title))
  );

  let best = null;
  for (const candidate of candidates) {
    await sleep(800);
    const page = await wiki({ action: "parse", page: candidate, prop: "text", redirects: "1" });
    const html = page?.parse?.text;
    if (!html) continue;
    // The book's author must appear on the page, so a same-named book by someone else is never picked
    if (!banglaKey(html).includes(banglaKey(book.author))) continue;
    const chapters = [...new Set(linksIn(html).filter((t) => t.startsWith(`${page.parse.title}/`)))];
    const textLength = html.replace(/<[^>]+>/g, "").length;
    // Either a contents page with chapters, or a whole book on one page
    if (chapters.length >= 2 || textLength > 20000) {
      const score = chapters.length * 1000 + textLength;
      if (!best || score > best.score) best = { work: page.parse.title, chapters: chapters.length, score };
    }
  }
  return best;
};

// Project Gutenberg's whole catalog as one CSV, matched locally (its search API is too slow for hundreds of books)
const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') field += text[++i];
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") (row.push(field), (field = ""));
    else if (char === "\n") (row.push(field), rows.push(row), (row = []), (field = ""));
    else if (char !== "\r") field += char;
  }
  return rows;
};

console.log("Downloading the Project Gutenberg catalog…");
const catalog = parseCsv(await (await fetch("https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv", { headers: HEADERS })).text())
  .slice(1)
  .filter(([, type, , , language]) => type === "Text" && language === "en")
  .map(([id, , , title, , authors]) => ({
    id: Number(id),
    title: words(title.split(/[\n:;]/)[0]),
    // "Swift, Jonathan, 1667-1745; Winter, Milo" → ["swift", "winter"]
    surnames: authors.split(";").map((author) => simplify(author.split(",")[0])),
  }));

// Books whose main edition has a different title on Gutenberg, checked by hand
const GUTENBERG_IDS = { "Robinson Crusoe": 521 };

const gutenbergBook = async (book) => {
  if (GUTENBERG_IDS[book.title]) return { id: GUTENBERG_IDS[book.title] };
  const want = words(book.title);
  const surname = simplify(book.author.trim().split(/\s+/).at(-1));
  // Whole words only, so "It" doesn't match "Italian Letters", and the author's surname must match exactly
  const matches = catalog.filter(
    (entry) => (entry.title === want || entry.title.startsWith(`${want} `)) && entry.surnames.includes(surname)
  );
  // The oldest entry is the main edition; later ones are often illustrated or abridged reprints
  const match = matches.sort((a, b) => a.id - b.id)[0];
  return match ? { id: match.id } : null;
};

const response = await fetch(`${base}/rest/v1/books?select=id,title,author,language&order=language,title`, { headers: { apikey: anonKey } });
const books = await response.json();

const updates = [];
for (const book of books) {
  let source = null;
  if (book.language === "Bangla") {
    const found = await wikisourceWork(book);
    if (found) source = `wikisource:${found.work}`;
    console.log(`${found ? `WS ${String(found.chapters).padStart(3)}ch` : "   -     "}  ${book.title}${found ? `  →  ${found.work}` : ""}`);
  } else {
    const found = await gutenbergBook(book);
    if (found) source = `gutenberg:${found.id}`;
    console.log(`${found ? `PG ${String(found.id).padStart(5)}` : "   -     "}  ${book.title}`);
  }
  if (source) updates.push(`update public.books set free_read = ${sql(source)} where id = ${sql(book.id)};`);
  if (book.language === "Bangla") await sleep(500);
}

writeFileSync(
  new URL("../supabase/migrations/008_free_reading.sql", import.meta.url),
  `-- Free, public-domain copies readers can read inside BoiPoka (generated by scripts/find-free-reads.mjs)
-- "wikisource:<page>" is a book on Bangla Wikisource, "gutenberg:<id>" a Project Gutenberg book.
alter table public.books add column if not exists free_read text;

${updates.join("\n")}
`
);
console.log(`\nFound ${updates.length} of ${books.length} books free to read. Wrote supabase/migrations/008_free_reading.sql`);
