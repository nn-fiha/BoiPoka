import React, { useState } from "react";
import { Link } from "react-router-dom";
import BookCover from "./BookCover";
import Modal from "../Common/Modal";

// Randomly picks a book from your "Want to read" pile, with a quick way to start it
const PickNextRead = ({ items, onStart }) => {
  const pile = items.filter(({ entry }) => entry.status === "want");
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState(null);
  // Bumped on every pick so the cover replays its entrance animation
  const [round, setRound] = useState(0);

  if (pile.length === 0) return null;

  const pickAnother = () => {
    const others = pile.filter((item) => item.book.id !== pick?.book.id);
    const choices = others.length ? others : pile;
    setPick(choices[Math.floor(Math.random() * choices.length)]);
    setRound((n) => n + 1);
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={pickAnother}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-terra px-4 text-sm font-medium text-terra transition hover:bg-terra hover:text-cream sm:w-auto"
      >
        <i className="bx bx-dice-5 text-lg"></i> Pick my next read
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Your next read" size="max-w-sm">
        {pick && (
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-terra">Your next read</p>
            <div key={round} className="motion-safe:animate-pop-in">
              <BookCover book={pick.book} className="mx-auto mt-5 aspect-[2/3] w-36 rounded-md shadow-xl" />
              <h2 className="mt-5 font-bangla text-2xl font-semibold leading-tight">{pick.book.title}</h2>
              <p className="mt-1 font-bangla text-ink/70">{pick.book.author}</p>
            </div>
            <p className="mt-3 text-xs text-ink/50">
              Picked from {pile.length} {pile.length === 1 ? "book" : "books"} on your Want to read pile
            </p>
            <div className="mt-6 flex flex-col gap-2">
              {onStart && (
                <button
                  onClick={() => {
                    onStart(pick.book);
                    setOpen(false);
                  }}
                  className="rounded-full bg-terra py-3 font-medium text-cream transition hover:bg-terra-dark"
                >
                  <i className="bx bx-book-reader align-middle"></i> Start reading
                </button>
              )}
              <div className="flex gap-2">
                <button
                  onClick={pickAnother}
                  disabled={pile.length < 2}
                  className="flex-1 rounded-full border border-line py-2.5 text-sm transition hover:bg-card disabled:opacity-50"
                >
                  <i className="bx bx-dice-5 align-middle"></i> Pick another
                </button>
                <Link
                  to={`/book/${pick.book.id}`}
                  className="flex-1 rounded-full border border-line py-2.5 text-sm transition hover:bg-card"
                >
                  Open book
                </Link>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default PickNextRead;
