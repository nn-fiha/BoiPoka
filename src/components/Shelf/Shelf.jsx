import React from "react";
import BookSpine from "./BookSpine";

const Shelf = ({ label, items }) => {
  const pages = items.reduce((sum, { book }) => sum + (book.pages || 0), 0);

  return (
    // The spine row reaches up over the content above (room for the hover cover preview),
    // so the whole shelf ignores clicks except on the spines themselves
    <section className="pointer-events-none mb-14">
      <div className="flex items-baseline justify-between mb-3 px-1">
        <h2 className="font-serif text-xl font-bold">{label}</h2>
        <span className="text-sm text-ink/60">
          {items.length} {items.length === 1 ? "book" : "books"} · {pages.toLocaleString()} pages
        </span>
      </div>
      <div className="relative">
        <div className="flex items-end gap-1 overflow-x-auto px-4 pt-56 -mt-48 pb-0">
          {items.map(({ book, entry }) => (
            <BookSpine key={book.id} book={book} entry={entry} />
          ))}
        </div>
        <div className="shelf-plank-top -mt-1.5 h-3" />
        <div className="shelf-plank h-4 rounded-b-sm" />
      </div>
    </section>
  );
};

export default Shelf;
