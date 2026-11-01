import React, { useMemo, useState } from "react";
import Shelf from "./Shelf";
import CoverShelf from "./CoverShelf";
import { STATUSES } from "../../context/ReadingContext";

const GROUPINGS = {
  genre: (book) => book.genre,
  author: (book) => book.author,
};

// How books are ordered inside each shelf
const BOOK_ORDERS = {
  added: { label: "Recently added", compare: (a, b) => (b.entry.created_at || "").localeCompare(a.entry.created_at || "") },
  finished: {
    label: "Date read",
    // Newest finish first; books without a finish date go to the end
    compare: (a, b) => (b.entry.finished_at || "").localeCompare(a.entry.finished_at || ""),
  },
  rating: {
    label: "Highest rated",
    compare: (a, b) => (b.entry.rating || 0) - (a.entry.rating || 0) || BOOK_ORDERS.finished.compare(a, b),
  },
  title: { label: "Title A–Z", compare: (a, b) => a.book.title.localeCompare(b.book.title) },
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
  // Shelves in A–Z order, or the biggest shelves first
  const [order, setOrder] = useState("name");
  const [bookOrder, setBookOrder] = useState("added");
  const [view, setView] = useState(readView);
  // Phones tuck view, sort, shelves and tags into a panel that opens under the search bar
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    Object.values(groups).forEach((group) => group.sort(BOOK_ORDERS[bookOrder].compare));
    const byName = ([a], [b]) => a.localeCompare(b);
    return Object.entries(groups).sort(order === "count" ? (a, b) => b[1].length - a[1].length || byName(a, b) : byName);
  }, [visibleItems, groupBy, order, bookOrder]);

  const readItems = items.filter(({ entry }) => entry.status === "read");
  const statusCounts = items.reduce(
    (counts, { entry }) => ({ ...counts, [entry.status]: counts[entry.status] + 1 }),
    { all: items.length, read: 0, reading: 0, want: 0 }
  );
  const pagesRead = readItems.reduce((sum, { book }) => sum + (book.pages || 0), 0);
  const authors = new Set(readItems.map(({ book }) => book.author)).size;

  const activeFilters = (collection ? 1 : 0) + (tag ? 1 : 0) + (groupBy !== "genre" ? 1 : 0) + (order !== "name" ? 1 : 0) + (bookOrder !== "added" ? 1 : 0);

  const viewToggle = (
    <div className="flex h-11 items-center rounded-full border border-line bg-card p-1 text-sm" role="group" aria-label="Shelf style">
      {[
        ["covers", "bx-grid-alt", "Covers"],
        ["spines", "bx-book", "Spines"],
      ].map(([key, icon, label]) => (
        <button
          key={key}
          onClick={() => chooseView(key)}
          aria-pressed={view === key}
          className={`flex h-full flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 transition ${
            view === key ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"
          }`}
        >
          <i className={`bx ${icon}`}></i> {label}
        </button>
      ))}
    </div>
  );

  const sortSelect = (
    <div className="relative">
      <i className="bx bx-sort-alt-2 pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/50"></i>
      <select
        value={`${groupBy}:${order}`}
        onChange={(e) => {
          const [nextGroup, nextOrder] = e.target.value.split(":");
          setGroupBy(nextGroup);
          setOrder(nextOrder);
        }}
        aria-label="Shelve by"
        className="h-11 appearance-none rounded-full border border-line bg-card pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40"
      >
        <option value="genre:name">By genre · A–Z</option>
        <option value="genre:count">By genre · most books</option>
        <option value="author:name">By author · A–Z</option>
        <option value="author:count">By author · most books</option>
      </select>
      <i className="bx bx-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/50"></i>
    </div>
  );

  // Personal shelves only; library books have no dates or ratings to sort by
  const bookOrderSelect = showStatusFilter && (
    <div className="relative">
      <i className="bx bx-list-ol pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/50"></i>
      <select
        value={bookOrder}
        onChange={(e) => setBookOrder(e.target.value)}
        aria-label="Order books on each shelf"
        className="h-11 appearance-none rounded-full border border-line bg-card pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40"
      >
        {Object.entries(BOOK_ORDERS).map(([key, { label }]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <i className="bx bx-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/50"></i>
    </div>
  );

  const collectionSelect = (
    <div className="relative">
      <i className="bx bx-bookmarks pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/50"></i>
      <select
        value={collectionId}
        onChange={(e) => setCollectionId(e.target.value)}
        aria-label="Custom shelf"
        className="h-11 appearance-none rounded-full border border-line bg-card pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40"
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
  );

  const tagChips = (
    <div className="flex flex-wrap items-center gap-1.5 text-sm">
      <i className="bx bx-purchase-tag text-ink/50" aria-hidden="true"></i>
      {allTags.map((t) => (
        <button
          key={t}
          onClick={() => setTag(tag === t ? null : t)}
          aria-pressed={tag === t}
          className={`rounded-full px-3 py-1.5 font-bangla transition sm:px-2.5 sm:py-0.5 ${
            tag === t ? "bg-terra text-cream" : "border border-line text-ink/70 hover:bg-card hover:text-terra sm:border-0"
          }`}
        >
          #{t}
        </button>
      ))}
    </div>
  );

  const statusFilter = showStatusFilter && (
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
            className={`flex min-h-[2.25rem] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 text-sm transition sm:flex-none sm:px-4 ${
              status === key ? "bg-terra text-cream" : "text-ink/70 hover:bg-paper hover:text-ink"
            }`}
          >
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{label}</span>
            <span className={`rounded-full px-1.5 text-xs tabular-nums ${status === key ? "bg-cream/20" : "bg-ink/5 text-ink/50"}`}>
              {statusCounts[key]}
            </span>
          </button>
        )
      )}
    </div>
  );

  if (items.length === 0) {
    return <div className="py-16 text-center text-ink/60">{emptyMessage}</div>;
  }

  return (
    <>
      {showStats && (
        // Stat tiles with an optional card (the yearly goal) beside them on wide screens
        <div className="mb-5 flex flex-col gap-2 sm:mb-10 sm:gap-4 lg:flex-row lg:items-stretch">
            <dl className="grid w-full grid-cols-3 gap-2 sm:gap-4 lg:max-w-lg">
              {[
                ["Books read", readItems.length],
                ["Pages", pagesRead.toLocaleString()],
                ["Authors", authors],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-card/60 border border-line px-3 py-2 sm:px-4 sm:py-3">
                  <dt className="text-[10px] sm:text-xs uppercase tracking-wide text-ink/60">{label}</dt>
                  <dd className="font-serif text-xl sm:text-2xl font-bold">{value}</dd>
                </div>
              ))}
            </dl>
          {statsAside && <div className="lg:flex-1">{statsAside}</div>}
        </div>
      )}

      <div className="mb-6 space-y-3 sm:mb-12">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative min-w-0 flex-1">
            <i className="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-lg text-ink/45"></i>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books…"
              className="h-11 w-full rounded-full border border-line bg-card pl-11 pr-4 font-bangla focus:outline-none focus:ring-2 focus:ring-terra/40"
            />
          </div>
          <button
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="shelf-filters"
            className={`relative flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition sm:hidden ${
              filtersOpen ? "border-ink bg-ink text-paper" : "border-line bg-card"
            }`}
            aria-label={`Filters${activeFilters ? ` (${activeFilters} active)` : ""}`}
          >
            <i className={`bx ${filtersOpen ? "bx-x" : "bx-slider-alt"} text-lg`}></i> Filters
            {activeFilters > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-terra px-1 text-[11px] text-cream">
                {activeFilters}
              </span>
            )}
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            {viewToggle}
            {sortSelect}
            {bookOrderSelect}
          </div>
        </div>

        {/* Phones: filter panel that slides open under the search bar */}
        <div
          id="shelf-filters"
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out sm:hidden ${
            filtersOpen ? "grid-rows-[1fr] opacity-100" : "pointer-events-none !mt-0 grid-rows-[0fr] opacity-0"
          }`}
          aria-hidden={!filtersOpen}
        >
          <div className="overflow-hidden">
            <div className="space-y-4 rounded-2xl border border-line bg-card p-4">
              <section>
                <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink/60">Shelf style</h3>
                {viewToggle}
              </section>
              <section>
                <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink/60">Shelve by</h3>
                <div className="flex gap-2">
                  {[
                    ["genre", "Genre"],
                    ["author", "Author"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setGroupBy(key)}
                      aria-pressed={groupBy === key}
                      className={`h-10 flex-1 rounded-full border text-sm transition ${
                        groupBy === key ? "border-ink bg-ink text-paper" : "border-line"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink/60">Order</h3>
                <div className="flex gap-2">
                  {[
                    ["name", "A–Z"],
                    ["count", "Most books"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setOrder(key)}
                      aria-pressed={order === key}
                      className={`h-10 flex-1 rounded-full border text-sm transition ${
                        order === key ? "border-ink bg-ink text-paper" : "border-line"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </section>
              {showStatusFilter && (
                <section>
                  <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink/60">Books on each shelf</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(BOOK_ORDERS).map(([key, { label }]) => (
                      <button
                        key={key}
                        onClick={() => setBookOrder(key)}
                        aria-pressed={bookOrder === key}
                        className={`h-10 rounded-full border text-sm transition ${
                          bookOrder === key ? "border-ink bg-ink text-paper" : "border-line"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </section>
              )}
              {collections.length > 0 && (
                <section>
                  <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink/60">My shelves</h3>
                  <div className="flex flex-wrap gap-2">
                    {[{ id: "all", name: "All books", entryIds: items.map(({ entry }) => entry.id) }, ...collections].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCollectionId(c.id)}
                        aria-pressed={collectionId === c.id}
                        className={`rounded-full border px-3.5 py-2 text-sm transition ${
                          collectionId === c.id ? "border-sage bg-sage text-white" : "border-line"
                        }`}
                      >
                        {c.name} <span className="opacity-70">{c.entryIds.length}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
              {allTags.length > 0 && (
                <section>
                  <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink/60">Tags</h3>
                  {tagChips}
                </section>
              )}
              {extraActions && <section>{extraActions({ status })}</section>}
              <div className="flex items-center justify-between border-t border-line pt-3 text-sm">
                <span className="text-ink/60">
                  {visibleItems.length} {visibleItems.length === 1 ? "book" : "books"}
                </span>
                {activeFilters > 0 && (
                  <button
                    onClick={() => {
                      setCollectionId("all");
                      setTag(null);
                      setGroupBy("genre");
                    }}
                    className="-my-2 py-2 font-medium text-terra"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {statusFilter}
          {collections.length > 0 && <div className="hidden sm:block">{collectionSelect}</div>}
          {extraActions && <div className="hidden sm:ml-auto sm:block">{extraActions({ status })}</div>}
        </div>

        {allTags.length > 0 && <div className="hidden sm:block">{tagChips}</div>}

        {/* Phones: show what's filtered, with one-tap removal */}
        {(collection || tag) && (
          <div className="flex flex-wrap gap-2 sm:hidden">
            {collection && (
              <button onClick={() => setCollectionId("all")} className="flex items-center gap-1 rounded-full bg-sage/15 px-3 py-1.5 text-sm">
                <i className="bx bx-bookmark"></i> {collection.name} <i className="bx bx-x text-base"></i>
              </button>
            )}
            {tag && (
              <button onClick={() => setTag(null)} className="flex items-center gap-1 rounded-full bg-terra/10 px-3 py-1.5 font-bangla text-sm text-terra">
                #{tag} <i className="bx bx-x text-base"></i>
              </button>
            )}
          </div>
        )}
      </div>


      {shelves.length === 0 ? (
        <p className="py-20 text-center text-ink/60">No books match that. Try another search.</p>
      ) : view === "covers" ? (
        <div className="display-panel relative -mx-4 overflow-hidden rounded-none px-2 pb-6 pt-7 shadow-xl sm:mx-0 sm:rounded-3xl sm:px-8 sm:pb-10 sm:pt-12">
          <div className="display-spotlight pointer-events-none absolute inset-x-0 top-0 h-72" />
          <h2 className="relative mb-5 px-2 text-center font-display text-[1.6rem] leading-tight tracking-wide text-white drop-shadow-sm sm:mb-10 sm:text-5xl">
            {collection ? collection.name : title}
          </h2>
          <div className="relative space-y-6 sm:space-y-12">
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
