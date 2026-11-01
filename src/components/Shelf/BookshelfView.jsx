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
const BookshelfView = ({
  items,
  title,
  emptyMessage,
  showStats = true,
  showStatusFilter = true,
  collections = [],
  extraActions = null,
  statsAside = null,
}) => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [collectionId, setCollectionId] = useState("all");
  const [tag, setTag] = useState(null);
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

  const collection = collections.find((c) => c.id === collectionId);
  const allTags = useMemo(
    () => [...new Set(items.flatMap(({ entry }) => entry.tags || []))].sort((a, b) => a.localeCompare(b)),
    [items]
  );

  const visibleItems = items.filter(({ book, entry }) => {
    const text = `${book.title} ${book.author} ${(entry.tags || []).join(" ")}`.toLowerCase();
    const matchesStatus = status === "all" || entry.status === status;
    const matchesCollection = !collection || collection.entryIds.includes(entry.id);
    const matchesTag = !tag || (entry.tags || []).includes(tag);
    return matchesStatus && matchesCollection && matchesTag && text.includes(query.trim().toLowerCase());
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
  const statusCounts = items.reduce(
    (counts, { entry }) => ({ ...counts, [entry.status]: counts[entry.status] + 1 }),
    { all: items.length, read: 0, reading: 0, want: 0 }
  );
  const pagesRead = readItems.reduce((sum, { book }) => sum + (book.pages || 0), 0);
  const authors = new Set(readItems.map(({ book }) => book.author)).size;

  if (items.length === 0) {
    return <div className="py-16 text-center text-ink/60">{emptyMessage}</div>;
  }

  return (
    <>
      {showStats && (
        // Stat tiles with an optional card (the yearly goal) beside them on wide screens
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:gap-4 lg:flex-row lg:items-stretch">
            <dl className="grid w-full grid-cols-3 gap-2 sm:gap-4 lg:max-w-lg">
              {[
                ["Books read", readItems.length],
                ["Pages", pagesRead.toLocaleString()],
                ["Authors", authors],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-card/60 border border-line px-3 py-2.5 sm:px-4 sm:py-3">
                  <dt className="text-[10px] sm:text-xs uppercase tracking-wide text-ink/60">{label}</dt>
                  <dd className="font-serif text-xl sm:text-2xl font-bold">{value}</dd>
                </div>
              ))}
            </dl>
          {statsAside && <div className="lg:flex-1">{statsAside}</div>}
        </div>
      )}

      <div className="mb-8 sm:mb-12 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:flex-1">
            <i className="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-lg text-ink/45"></i>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or author…"
              className="h-11 w-full rounded-full border border-line bg-card pl-11 pr-4 font-bangla focus:outline-none focus:ring-2 focus:ring-terra/40"
            />
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <div className="flex h-11 items-center rounded-full border border-line bg-card p-1 text-sm" role="group" aria-label="Shelf style">
              {[
                ["covers", "bx-grid-alt", "Covers"],
                ["spines", "bx-book", "Spines"],
              ].map(([key, icon, label]) => (
                <button
                  key={key}
                  onClick={() => chooseView(key)}
                  aria-pressed={view === key}
                  className={`flex h-full items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 transition ${
                    view === key ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  <i className={`bx ${icon}`}></i> {label}
                </button>
              ))}
            </div>
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <i className="bx bx-sort-alt-2 pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/50"></i>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                aria-label="Shelve by"
                className="h-11 w-full appearance-none rounded-full border border-line bg-card pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40"
              >
                <option value="genre">By genre</option>
                <option value="author">By author</option>
              </select>
              <i className="bx bx-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/50"></i>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {showStatusFilter && (
            <div
              className="flex w-full gap-1 rounded-full border border-line bg-card p-1 sm:inline-flex sm:w-auto"
              role="group"
              aria-label="Filter by status"
            >
              {[["all", "All", "All"], ...Object.entries(STATUSES).map(([key, s]) => [key, s.label, s.short])].map(
                ([key, label, short]) => (
                  <button
                    key={key}
                    onClick={() => setStatus(key)}
                    aria-pressed={status === key}
                    aria-label={`${label} (${statusCounts[key]})`}
                    className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1.5 text-sm transition sm:flex-none sm:px-4 ${
                      status === key ? "bg-terra text-cream" : "text-ink/70 hover:bg-paper hover:text-ink"
                    }`}
                  >
                    <span className="sm:hidden">{short}</span>
                    <span className="hidden sm:inline">{label}</span>
                    <span
                      className={`rounded-full px-1.5 text-xs tabular-nums ${
                        status === key ? "bg-cream/20" : "bg-ink/5 text-ink/50"
                      }`}
                    >
                      {statusCounts[key]}
                    </span>
                  </button>
                )
              )}
            </div>
          )}
          {collections.length > 0 && (
            <div className="relative">
              <i className="bx bx-bookmarks pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/50"></i>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                aria-label="Custom shelf"
                className="h-11 w-full appearance-none rounded-full border border-line bg-card pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40 sm:w-auto"
              >
                <option value="all">All shelves</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.entryIds.length})
                  </option>
                ))}
              </select>
              <i className="bx bx-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/50"></i>
            </div>
          )}
          {extraActions && <div className="sm:ml-auto">{extraActions({ status })}</div>}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <i className="bx bx-purchase-tag text-ink/50" aria-hidden="true"></i>
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(tag === t ? null : t)}
                aria-pressed={tag === t}
                className={`rounded-full px-2.5 py-0.5 font-bangla transition ${
                  tag === t ? "bg-terra text-cream" : "text-ink/70 hover:bg-card hover:text-terra"
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {shelves.length === 0 ? (
        <p className="py-20 text-center text-ink/60">No books match that. Try another search.</p>
      ) : view === "covers" ? (
        <div className="display-panel relative -mx-4 overflow-hidden rounded-none px-2 pb-8 pt-10 shadow-xl sm:mx-0 sm:rounded-3xl sm:px-8 sm:pb-10 sm:pt-12">
          <div className="display-spotlight pointer-events-none absolute inset-x-0 top-0 h-72" />
          <h2 className="relative mb-8 sm:mb-10 px-2 text-center font-display text-[1.75rem] leading-tight sm:text-5xl tracking-wide text-white drop-shadow-sm">
            {collection ? collection.name : title}
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
