import React, { useEffect, useState } from "react";
import { fetchCatalog } from "../lib/api";
import { useReading } from "../context/ReadingContext";
import BookshelfView from "../components/Shelf/BookshelfView";
import { ShelfSkeleton } from "../components/Common/Skeleton";
import { usePageTitle } from "../hooks/usePageTitle";

// Every book anyone has added to BoiPoka
const LibraryPage = () => {
  const { getEntry } = useReading();
  const [books, setBooks] = useState(null);
  usePageTitle("Library");

  useEffect(() => {
    fetchCatalog().then(setBooks).catch(() => setBooks([]));
  }, []);

  if (!books) return <ShelfSkeleton />;

  // Books on your own shelf show their status and rating
  const items = books.map((book) => ({ book, entry: getEntry(book.id) || { status: "read", rating: 0 } }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8">
      <section className="py-6 sm:py-10">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold">The BoiPoka library</h1>
        <p className="mt-2 font-bangla text-base sm:text-lg text-ink/70">
          {books.length} books readers have shelved so far — open one to see what people felt.
        </p>
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
