import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCatalog } from "../lib/api";
import { useReading } from "../context/ReadingContext";
import BookshelfView from "../components/Shelf/BookshelfView";
import { ShelfSkeleton } from "../components/Common/Skeleton";
import { usePageMeta } from "../hooks/usePageTitle";

// Every book anyone has added to BoiPoka
const LibraryPage = () => {
  const { getEntry } = useReading();
  const [books, setBooks] = useState(null);
  usePageMeta({
    title: "Library — Bangla and English books readers love",
    description:
      "Browse every book BoiPoka readers have shelved — Humayun Ahmed, Rabindranath Tagore, Samaresh Majumdar and more — and see what readers felt about each one.",
  });

  useEffect(() => {
    fetchCatalog().then(setBooks).catch(() => setBooks([]));
  }, []);

  if (!books) return <ShelfSkeleton />;

  const freeCount = books.filter((book) => book.free_read).length;
  // Books on your own shelf show their status and rating
  const items = books.map((book) => ({ book, entry: getEntry(book.id) || { status: "read", rating: 0 } }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8">
      <section className="py-6 sm:py-10">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold">The BoiPoka library</h1>
        <p className="mt-2 font-bangla text-base sm:text-lg text-ink/70">
          {books.length} Bangla and English books — open one to see what readers felt, or put it on your shelf.
        </p>
        {freeCount > 0 && (
          <Link
            to="/free"
            className="mt-5 flex items-center gap-3 rounded-2xl border border-sage/40 bg-sage/10 px-4 py-3 transition hover:bg-sage/15 sm:inline-flex sm:pr-6"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage text-white">
              <i className="bx bx-book-reader text-xl"></i>
            </span>
            <span>
              <span className="block font-medium">{freeCount} classics you can read free</span>
              <span className="block font-bangla text-sm text-ink/60">Tagore, Bankim, Sarat, Austen, Dickens… right here on BoiPoka →</span>
            </span>
          </Link>
        )}
      </section>
      <BookshelfView
        items={items}
        title="Digital Library"
        showStats={false}
        showStatusFilter={false}
        emptyMessage="The library is empty."
      />
    </div>
  );
};

export default LibraryPage;
