import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAlsoLoved, fetchRelatedBooks } from "../../lib/api";
import BookCover from "../Shelf/BookCover";

const HEADINGS = {
  loved: "Readers who loved this also loved",
  author: "More by this author",
  mixed: "You might also like",
  genre: "More in this genre",
};

// Recommendations: books loved by this book's fans, or related books as a fallback
const AlsoLoved = ({ book }) => {
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setResult(null);
    (async () => {
      try {
        // also_loved needs migration 004; fall back quietly without it
        const loved = await fetchAlsoLoved(book.id).catch(() => []);
        if (loved.length) {
          if (!cancelled) setResult({ reason: "loved", items: loved });
          return;
        }
        const related = await fetchRelatedBooks(book);
        if (!cancelled) setResult({ reason: related.reason, items: related.books.map((b) => ({ book: b })) });
      } catch {
        if (!cancelled) setResult({ reason: "genre", items: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [book]);

  if (!result || result.items.length === 0) return null;

  return (
    <section className="mt-10 border-t border-line pt-8 sm:mt-16 sm:pt-10">
      <h2 className="font-serif text-2xl font-bold">{HEADINGS[result.reason]}</h2>
      <ul className="mt-6 flex gap-4 overflow-x-auto pb-2 sm:gap-6">
        {result.items.map(({ book: other, readers }) => (
          <li key={other.id} className="w-24 shrink-0 sm:w-32">
            <Link to={`/book/${other.id}`} className="group block">
              <BookCover book={other} className="aspect-[2/3] w-full rounded shadow-md transition group-hover:-translate-y-1" />
              <div className="mt-2 truncate font-bangla text-sm">{other.title}</div>
              <div className="truncate font-bangla text-xs text-ink/60">
                {readers ? `${readers} ${Number(readers) === 1 ? "reader" : "readers"} loved it` : other.author}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AlsoLoved;
