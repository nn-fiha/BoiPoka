import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCatalog } from "../lib/api";
import { parseFreeRead, readProgress } from "../lib/freeRead";
import { useReading } from "../context/ReadingContext";
import CoverShelf from "../components/Shelf/CoverShelf";
import { ShelfSkeleton } from "../components/Common/Skeleton";
import { usePageMeta } from "../hooks/usePageTitle";

// Public-domain books readers can open and read right here, free
const FreeReadingPage = () => {
  const { getEntry } = useReading();
  const [books, setBooks] = useState(null);
  const [query, setQuery] = useState("");

  usePageMeta({
    title: "Read free — Bangla and English classics",
    description:
      "Read Tagore, Bankim, Sarat Chandra, Jane Austen, Dickens and more for free on BoiPoka. Public-domain classics, chapter by chapter, in Bangla and English.",
  });

  useEffect(() => {
    fetchCatalog()
      .then((all) => setBooks(all.filter((book) => parseFreeRead(book.free_read))))
      .catch(() => setBooks([]));
  }, []);

  const shelves = useMemo(() => {
    if (!books) return [];
    const term = query.trim().toLowerCase();
    const items = books
      .filter((book) => !term || `${book.title} ${book.author}`.toLowerCase().includes(term))
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((book) => ({ book, entry: getEntry(book.id) || { status: "read", rating: 0 } }));
    // Books you've started reading on this device come first
    const started = items.filter(({ book }) => readProgress(book.id));
    return [
      ["Continue reading", started],
      ["বাংলা ক্লাসিক · Bangla classics", items.filter(({ book }) => book.language === "Bangla")],
      ["English classics", items.filter(({ book }) => book.language !== "Bangla")],
    ].filter(([, shelf]) => shelf.length);
  }, [books, query, getEntry]);

  if (!books) return <ShelfSkeleton />;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-8">
      <section className="py-6 sm:py-10">
        <p className="font-bangla text-lg text-terra">বিনা মূল্যে পড়ুন</p>
        <h1 className="mt-1 font-serif text-3xl font-bold sm:text-5xl">Read free</h1>
        <p className="mt-3 max-w-2xl text-ink/70">
          {books.length} classics you can read right here, chapter by chapter. These books are old enough to be in the public domain, so they're
          free for everyone. BoiPoka remembers where you stopped.
        </p>
        <div className="relative mt-6 max-w-xl">
          <i className="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-lg text-ink/45"></i>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search free books…"
            aria-label="Search free books"
            className="h-11 w-full rounded-full border border-line bg-card pl-11 pr-4 font-bangla focus:outline-none focus:ring-2 focus:ring-terra/40"
          />
        </div>
      </section>

      {shelves.length === 0 ? (
        <p className="py-16 text-center text-ink/60">No free books match “{query}”.</p>
      ) : (
        <div className="display-panel relative -mx-4 overflow-hidden rounded-none px-2 pb-6 pt-7 shadow-xl sm:mx-0 sm:rounded-3xl sm:px-8 sm:pb-10 sm:pt-12">
          <div className="display-spotlight pointer-events-none absolute inset-x-0 top-0 h-72" />
          <h2 className="relative mb-5 px-2 text-center font-display text-[1.6rem] leading-tight tracking-wide text-white drop-shadow-sm sm:mb-10 sm:text-5xl">
            Free Reading Room
          </h2>
          <div className="relative space-y-6 sm:space-y-12">
            {shelves.map(([label, items]) => (
              <CoverShelf key={label} label={label} items={items} />
            ))}
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-ink/50">
        Texts come from{" "}
        <a href="https://bn.wikisource.org" target="_blank" rel="noreferrer" className="underline hover:text-ink">
          Bangla Wikisource
        </a>{" "}
        and{" "}
        <a href="https://www.gutenberg.org" target="_blank" rel="noreferrer" className="underline hover:text-ink">
          Project Gutenberg
        </a>
        . Looking for something newer? <Link to="/library" className="underline hover:text-ink">Browse the library</Link>.
      </p>
    </div>
  );
};

export default FreeReadingPage;
