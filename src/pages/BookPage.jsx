import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { STATUSES, useReading } from "../context/ReadingContext";
import { fetchBook, fetchReaderNotes } from "../lib/api";
import JournalEditor from "../components/Journal/JournalEditor";
import ReaderNotes from "../components/Journal/ReaderNotes";
import BookCover from "../components/Shelf/BookCover";
import BookDetailsForm from "../components/Journal/BookDetailsForm";

const BookPage = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { getEntry, updateEntry, addToShelf, removeFromShelf, syncBook } = useReading();
  const [book, setBook] = useState(null);
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    Promise.all([fetchBook(id), fetchReaderNotes(id)])
      .then(([bookRow, noteRows]) => {
        if (cancelled) return;
        setBook(bookRow);
        setNotes(noteRows);
        setStatus(bookRow ? "ready" : "missing");
      })
      .catch(() => !cancelled && setStatus("missing"));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "loading") return <p className="py-24 text-center text-ink/60">Opening the book…</p>;
  if (status === "missing") {
    return (
      <div className="py-24 text-center">
        <p className="text-ink/70">That book isn't in the library.</p>
        <Link to="/" className="mt-4 inline-block text-wood underline">Go home</Link>
      </div>
    );
  }

  const entry = getEntry(book.id);
  const canEdit = Boolean(user && (book.created_by === user.id || entry));

  const handleSaved = (saved) => {
    setBook(saved);
    syncBook(saved);
    setEditing(false);
  };
  const otherNotes = notes.filter((note) => note.profile?.username !== profile?.username);

  const handleRemove = () => {
    if (window.confirm("Remove this book and your notes from your shelf?")) removeFromShelf(book.id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
      {profile && (
        <Link to={`/u/${profile.username}`} className="text-sm text-ink/60 hover:text-ink">
          <i className="bx bx-arrow-back align-middle"></i> My shelf
        </Link>
      )}

      {/* Phones: compact cover + title; book details move below the journal */}
      <div className="mt-5 flex gap-4 md:hidden">
        <BookCover book={book} className="aspect-[2/3] w-28 shrink-0 rounded-md shadow-xl" />
        <div className="min-w-0 self-end">
          <h1 className="font-bangla text-2xl font-semibold leading-tight">{book.title}</h1>
          <p className="mt-1 font-bangla text-ink/70">{book.author}</p>
          <p className="mt-2 text-xs text-ink/50">
            {[book.genre, book.pages && `${book.pages} pages`].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <div className="mt-2 md:mt-6 grid gap-8 md:gap-10 md:grid-cols-[240px_1fr]">
        <aside className="order-last md:order-none">
          <div className="hidden md:block">
            <BookCover book={book} className="aspect-[2/3] w-full max-w-[240px] rounded-md shadow-2xl" />
          </div>
          {editing ? (
            <BookDetailsForm book={book} onSaved={handleSaved} onCancel={() => setEditing(false)} />
          ) : (
            <>
              <dl className="md:mt-6 space-y-2 text-sm">
                {[
                  ["Genre", book.genre],
                  ["Pages", book.pages],
                  ["Language", book.language],
                  ["Publisher", book.publisher],
                  ["ISBN", book.isbn],
                ]
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 border-b border-wood/10 pb-1">
                      <dt className="text-ink/60">{label}</dt>
                      <dd className="font-bangla text-right">{value}</dd>
                    </div>
                  ))}
              </dl>
              {canEdit && (
                <button onClick={() => setEditing(true)} className="mt-3 text-sm text-ink/60 hover:text-ink">
                  <i className="bx bx-edit align-middle"></i> Edit book details
                </button>
              )}
            </>
          )}
          {entry && (
            <button onClick={handleRemove} className="mt-6 block text-sm text-red-800/80 hover:text-red-800 dark:text-red-300/80 dark:hover:text-red-300">
              <i className="bx bx-trash align-middle"></i> Remove from my shelf
            </button>
          )}
        </aside>

        <article>
          <h1 className="hidden md:block font-bangla text-4xl font-semibold leading-tight">{book.title}</h1>
          <p className="hidden md:block mt-1 font-bangla text-xl text-ink/70">{book.author}</p>

          {entry ? (
            <JournalEditor entry={entry} onChange={(changes) => updateEntry(book.id, changes)} />
          ) : user ? (
            <div className="mt-8 rounded-lg border border-dashed border-wood/40 p-6">
              <p className="font-medium">Put this book on your shelf</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(STATUSES).map(([key, s]) => (
                  <button
                    key={key}
                    onClick={() => addToShelf(book, key)}
                    className={`rounded-full px-4 py-1.5 text-sm text-white ${s.color} hover:opacity-90`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-8 rounded-lg bg-card/70 p-5">
              <Link to="/login?mode=signup" className="font-medium text-wood underline">Start your own shelf</Link> to keep
              a journal for this book.
            </p>
          )}
        </article>
      </div>

      <ReaderNotes notes={otherNotes} />
    </div>
  );
};

export default BookPage;
