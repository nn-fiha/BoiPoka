import React, { useMemo, useState } from "react";
import Shelf from "./Shelf";
import CoverShelf from "./CoverShelf";
import { STATUSES } from "../../context/ReadingContext";

const GROUPINGS = {
  genre: (book) => book.genre,
  author: (book) => book.author,
};

const VIEW_KEY = "boipoka.shelfView";

const readView = () => {
  try {
    return localStorage.getItem(VIEW_KEY) || "covers";
  } catch {
    return "covers";
  }
};

// Stats, filters and shelves for a list of { book, entry } items
const BookshelfView = ({ items, title, emptyMessage, showStats = true, showStatusFilter = true }) => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [groupBy, setGroupBy] = useState("genre");
  const [view, setView] = useState(readView);

  const chooseView = (next) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Falls back to the default view next visit
    }
  };

  const visibleItems = items.filter(({ book, entry }) => {
    const text = `${book.title} ${book.author}`.toLowerCase();
    const matchesStatus = status === "all" || entry.status === status;
    return matchesStatus && text.includes(query.trim().toLowerCase());
  });

  const shelves = useMemo(() => {
    const groups = {};
    visibleItems.forEach((item) => {
      const key = GROUPINGS[groupBy](item.book);
      (groups[key] = groups[key] || []).push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [visibleItems, groupBy]);

  const readItems = items.filter(({ entry }) => entry.status === "read");
  const pagesRead = readItems.reduce((sum, { book }) => sum + (book.pages || 0), 0);
  const authors = new Set(readItems.map(({ book }) => book.author)).size;

  if (items.length === 0) {
    return <div className="py-16 text-center text-ink/60">{emptyMessage}</div>;
  }

  return (
    <>
      {showStats && (
        <dl className="grid grid-cols-3 max-w-lg gap-2 sm:gap-4 mb-8 sm:mb-10">
          {[
            ["Books read", readItems.length],
            ["Pages", pagesRead.toLocaleString()],
            ["Authors", authors],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-card/60 border border-wood/15 px-3 py-2.5 sm:px-4 sm:py-3">
              <dt className="text-[10px] sm:text-xs uppercase tracking-wide text-ink/60">{label}</dt>
              <dd className="font-serif text-xl sm:text-2xl font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mb-8 sm:mb-12 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-sm">
          <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-ink/50"></i>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or author…"
            className="w-full rounded-full border border-wood/25 bg-card pl-9 pr-4 py-2 font-bangla focus:outline-none focus:ring-2 focus:ring-wood/40"
          />
        </div>
        {showStatusFilter && (
          // Scrolls sideways on narrow phones instead of wrapping onto two lines
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
            {[["all", "All"], ...Object.entries(STATUSES).map(([key, s]) => [key, s.label])].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStatus(key)}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm border transition ${
                  status === key ? "bg-ink text-paper border-ink" : "border-wood/25 hover:bg-card"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-3 lg:ml-auto">
          <div className="flex rounded-full border border-wood/25 p-0.5 text-sm" role="group" aria-label="Shelf style">
            {[
              ["covers", "bx-grid-alt", "Covers"],
              ["spines", "bx-book", "Spines"],
            ].map(([key, icon, label]) => (
              <button
                key={key}
                onClick={() => chooseView(key)}
                aria-pressed={view === key}
                className={`whitespace-nowrap rounded-full px-3 py-1 transition ${view === key ? "bg-ink text-paper" : "hover:bg-card"}`}
              >
                <i className={`bx ${icon} align-middle`}></i> {label}
              </button>
            ))}
          </div>
          <label className="whitespace-nowrap text-sm text-ink/70">
            <span className="hidden sm:inline">Shelve by </span>
            <select
              aria-label="Shelve by"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="ml-1 rounded-md border border-wood/25 bg-card px-2 py-1"
            >
              <option value="genre">By genre</option>
              <option value="author">By author</option>
            </select>
          </label>
        </div>
      </div>

      {shelves.length === 0 ? (
        <p className="py-20 text-center text-ink/60">No books match that. Try another search.</p>
      ) : view === "covers" ? (
        <div className="display-panel relative -mx-4 overflow-hidden rounded-none px-2 pb-8 pt-10 shadow-xl sm:mx-0 sm:rounded-3xl sm:px-8 sm:pb-10 sm:pt-12">
          <div className="display-spotlight pointer-events-none absolute inset-x-0 top-0 h-72" />
          <h2 className="relative mb-8 sm:mb-10 px-2 text-center font-display text-[1.75rem] leading-tight sm:text-5xl tracking-wide text-white drop-shadow-sm">
            {title}
          </h2>
          <div className="relative space-y-10 sm:space-y-12">
            {shelves.map(([label, shelfItems]) => (
              <CoverShelf key={label} label={label} items={shelfItems} />
            ))}
          </div>
        </div>
      ) : (
        shelves.map(([label, shelfItems]) => <Shelf key={label} label={label} items={shelfItems} />)
      )}
    </>
  );
};

export default BookshelfView;
