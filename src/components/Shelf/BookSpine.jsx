import React from "react";
import { Link } from "react-router-dom";
import { STATUSES } from "../../context/ReadingContext";
import { colorsFor, hash } from "./palette";

const BookSpine = ({ book, entry }) => {
  const seed = hash(book.title);
  const [background, foreground] = colorsFor(book.title);
  // Thicker books get wider spines; heights vary a little so the shelf looks lived-in
  const width = Math.round(Math.min(64, Math.max(30, 24 + (book.pages || 250) / 18)));
  const height = 190 + (seed % 5) * 10;

  return (
    <Link
      to={`/book/${book.id}`}
      title={`${book.title} — ${book.author}`}
      className="group pointer-events-auto relative shrink-0 rounded-t-sm rounded-b-[2px] transition-transform duration-200 hover:-translate-y-4 focus-visible:-translate-y-4 focus:outline-none"
      style={{ width, height, background, color: foreground }}
    >
      <span className="absolute inset-y-0 left-0 w-[3px] bg-black/20" />
      <span className="absolute inset-y-0 right-0 w-[2px] bg-card/10" />
      <span className="absolute top-3 inset-x-1 h-px bg-current opacity-40" />
      <span className="absolute bottom-3 inset-x-1 h-px bg-current opacity-40" />
      <span className="spine-title absolute inset-0 flex items-center justify-center py-6 font-bangla font-semibold text-sm leading-tight overflow-hidden">
        {book.title}
      </span>
      {entry.status !== "read" && (
        <span
          className={`absolute -top-2 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full ring-2 ring-paper ${STATUSES[entry.status].color}`}
          aria-label={STATUSES[entry.status].label}
        />
      )}

      {/* Cover peek on hover */}
      <span className="pointer-events-none absolute bottom-full left-0 mb-6 hidden group-hover:flex group-focus-visible:flex flex-col items-start z-20">
        {book.cover_url && <img src={book.cover_url} alt="" className="h-40 w-auto rounded shadow-2xl" />}
        <span className="mt-2 whitespace-nowrap rounded bg-ink px-2 py-1 font-bangla text-xs text-paper">
          {book.author}
          {entry.rating > 0 && <span className="ml-1 text-yellow-400">{"★".repeat(entry.rating)}</span>}
        </span>
      </span>
    </Link>
  );
};

export default BookSpine;
