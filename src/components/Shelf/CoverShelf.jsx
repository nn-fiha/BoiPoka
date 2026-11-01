import React from "react";
import { Link } from "react-router-dom";
import BookCover from "./BookCover";
import { STATUSES } from "../../context/ReadingContext";

const FaceOutBook = ({ book, entry }) => {
  const progress =
    entry.status === "reading" && book.pages && entry.current_page
      ? Math.min(100, Math.round((entry.current_page / book.pages) * 100))
      : null;

  return (
    <Link
      to={`/book/${book.id}`}
      className="group relative shrink-0 w-[6.5rem] sm:w-36 snap-start focus:outline-none"
      title={`${book.title} — ${book.author}`}
    >
      <span
        aria-hidden="true"
        className="book-contact-shadow pointer-events-none absolute -bottom-1.5 left-1 right-1 h-3 transition duration-300 group-hover:scale-x-75 group-hover:opacity-50"
      />
      <div className="relative transition duration-300 ease-out group-hover:-translate-y-3 group-hover:-rotate-1 group-focus-visible:-translate-y-3">
        <BookCover
          book={book}
          className="aspect-[2/3] w-full rounded-[3px] shadow-[4px_8px_14px_rgba(30,20,70,0.35)] group-hover:shadow-[8px_20px_28px_rgba(30,20,70,0.45)] transition-shadow"
        />
        {/* Light catching the left edge, like a real paperback */}
        <span className="pointer-events-none absolute inset-y-0 left-0 w-2 rounded-l-[3px] bg-gradient-to-r from-black/25 to-transparent" />
        {entry.status !== "read" && (
          <span
            className={`absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow ${STATUSES[entry.status].color}`}
          >
            {STATUSES[entry.status].label}
            {progress !== null && ` · ${progress}%`}
          </span>
        )}
        {progress !== null && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 overflow-hidden rounded-b-[3px] bg-black/40">
            <span className="block h-full bg-amber-400" style={{ width: `${progress}%` }} />
          </span>
        )}
        {entry.rating > 0 && (
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-xs text-yellow-300 opacity-0 transition group-hover:opacity-100">
            {"★".repeat(entry.rating)}
          </span>
        )}
      </div>
    </Link>
  );
};

// One shelf of face-out covers, drawn in 3D: recessed back wall, ledge and front edge.
// Scrolls sideways when the books overflow.
const CoverShelf = ({ label, items }) => (
  <section className="relative">
    <div className="flex items-baseline justify-between px-3 sm:px-1 mb-2 text-white/90">
      <h2 className="font-display text-lg sm:text-xl tracking-wide">{label}</h2>
      <span className="text-xs sm:text-sm">
        {items.length} {items.length === 1 ? "book" : "books"}
      </span>
    </div>
    <div className="relative">
      {/* Back wall ends where the ledge's top surface begins */}
      <div className="display-board absolute inset-x-3 top-8 bottom-9 sm:inset-x-6" />

      {/* Books sit partway into the ledge's depth, so they rest on it rather than float above */}
      <div className="relative z-10 -mb-5 flex snap-x items-end gap-4 overflow-x-auto px-5 pb-2 pt-6 sm:gap-10 sm:px-12">
        {items.map(({ book, entry }) => (
          <FaceOutBook key={book.id} book={book} entry={entry} />
        ))}
      </div>

      <div className="display-ledge-top relative h-5" />
      <div className="display-ledge-front relative h-4 rounded-b-[3px]" />
    </div>
  </section>
);

export default CoverShelf;
