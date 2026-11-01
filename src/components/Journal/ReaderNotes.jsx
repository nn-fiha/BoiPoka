import React from "react";
import { Link } from "react-router-dom";

// What other readers wrote about a book
const ReaderNotes = ({ notes }) => {
  const withWords = notes.filter((note) => note.review.trim() || note.quotes.length > 0);

  return (
    <section className="mt-16 border-t border-wood/15 pt-10">
      <h2 className="font-serif text-2xl font-bold">What readers felt</h2>
      {withWords.length === 0 ? (
        <p className="mt-3 text-ink/60">No one has written about this book yet.</p>
      ) : (
        <ul className="mt-6 space-y-6">
          {withWords.map((note) => (
            <li key={note.id} className="rounded-lg bg-card/70 border border-wood/15 p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <Link to={`/u/${note.profile.username}`} className="font-semibold hover:text-wood">
                  {note.profile.display_name || note.profile.username}
                </Link>
                {note.rating > 0 && <span className="text-yellow-500">{"★".repeat(note.rating)}</span>}
                {note.moods.map((mood) => (
                  <span key={mood} className="rounded-full bg-sage/15 px-2 py-0.5 text-xs text-ink/70">
                    {mood}
                  </span>
                ))}
              </div>
              {note.review.trim() && (
                <p className="mt-3 whitespace-pre-line font-bangla text-lg leading-relaxed">{note.review}</p>
              )}
              {note.quotes.map((quote, index) => (
                <blockquote key={index} className="mt-3 border-l-4 border-wood/60 pl-4 font-bangla text-ink/80">
                  “{quote.text}”
                </blockquote>
              ))}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ReaderNotes;
