import React, { useState } from "react";
import { colorsFor } from "./palette";

// A book's cover image, or a designed placeholder when there isn't one (or it fails to load)
const BookCover = ({ book, className = "" }) => {
  const [failed, setFailed] = useState(false);
  const [background, foreground] = colorsFor(book.title);

  if (book.cover_url && !failed) {
    return (
      <img
        src={book.cover_url}
        alt={`Cover of ${book.title}`}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden p-3 text-center ${className}`}
      style={{ background, color: foreground }}
      role="img"
      aria-label={`Cover of ${book.title}`}
    >
      <span className="absolute inset-2 border border-current opacity-30" />
      <span className="font-bangla text-[10px] uppercase tracking-widest opacity-80 line-clamp-2">{book.author}</span>
      <span className="font-bangla text-base font-semibold leading-tight line-clamp-4">{book.title}</span>
      <span className="mx-auto h-px w-8 bg-current opacity-50" />
    </div>
  );
};

export default BookCover;
