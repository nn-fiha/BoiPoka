import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useShelf } from "../hooks/useShelf";
import { usePageTitle } from "../hooks/usePageTitle";
import { availableYears, computeStats } from "../lib/stats";
import { ShelfSkeleton } from "../components/Common/Skeleton";
import GoalCard from "../components/Stats/GoalCard";
import MonthlyBars from "../components/Stats/MonthlyBars";
import RankedBars from "../components/Stats/RankedBars";
import ReadingHeatmap from "../components/Stats/ReadingHeatmap";
import BookCover from "../components/Shelf/BookCover";

const Card = ({ title, children, className = "" }) => (
  <section className={`min-w-0 rounded-2xl border border-line bg-card p-4 sm:p-6 ${className}`}>
    <h2 className="mb-4 font-serif text-lg font-bold">{title}</h2>
    {children}
  </section>
);

const StatsPage = () => {
  const { username } = useParams();
  const { owner, isMine, items, status } = useShelf(username);
  const years = useMemo(() => availableYears(items), [items]);
  const [year, setYear] = useState(new Date().getFullYear());
  const stats = useMemo(() => computeStats(items, year), [items, year]);

  usePageTitle(owner ? `${isMine ? "My" : `${owner.display_name || owner.username}'s`} reading stats` : "Reading stats");

  useEffect(() => {
    if (!years.includes(year)) setYear(years[0]);
  }, [years, year]);

  if (status === "missing") {
    return (
      <div className="py-24 text-center">
        <p className="text-ink/70">No public shelf at @{username}.</p>
        <Link to="/" className="mt-4 inline-block text-terra underline">Go home</Link>
      </div>
    );
  }
  if (status === "loading") return <ShelfSkeleton />;

  const name = isMine ? "My" : `${owner.display_name || owner.username}'s`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <Link to={`/u/${owner.username}`} className="text-sm text-ink/60 hover:text-ink">
        <i className="bx bx-arrow-back align-middle"></i> {isMine ? "My shelf" : `${owner.display_name || owner.username}'s shelf`}
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold">{name} reading in {year}</h1>
        <div className="flex gap-1 rounded-full border border-line bg-card p-1" role="group" aria-label="Year">
          {years.slice(0, 5).map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              aria-pressed={year === y}
              className={`rounded-full px-3.5 py-1 text-sm tabular-nums transition ${
                year === y ? "bg-terra text-cream" : "text-ink/70 hover:text-ink"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
        <GoalCard ownerId={owner.id} year={year} finishedCount={stats.finished.length} editable={isMine} />
        <dl className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            ["Books", stats.finished.length],
            ["Pages", stats.pages.toLocaleString()],
            ["Avg rating", stats.averageRating ? `${stats.averageRating.toFixed(1)}★` : "–"],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col justify-center rounded-2xl border border-line bg-card px-3 py-3 sm:px-5">
              <dt className="text-[10px] sm:text-xs uppercase tracking-wide text-ink/60">{label}</dt>
              <dd className="font-serif text-2xl sm:text-3xl font-bold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {isMine && stats.undated > 0 && (
        <p className="mt-4 rounded-xl bg-terra/10 px-4 py-3 text-sm">
          <i className="bx bx-info-circle mr-1 align-middle text-terra"></i>
          {stats.undated} read {stats.undated === 1 ? "book has" : "books have"} no finish date, so {stats.undated === 1 ? "it isn't" : "they aren't"}{" "}
          counted in any year. Add a finish date on the book's page.
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Books finished each month" className="lg:col-span-2">
          <MonthlyBars perMonth={stats.perMonth} />
        </Card>
        <Card title="Reading days" className="lg:col-span-2">
          <ReadingHeatmap year={year} perDay={stats.perDay} />
        </Card>
        <Card title="Genres">
          <RankedBars rows={stats.genres} emptyText={`No books finished in ${year} yet.`} />
        </Card>
        <Card title="Most-read authors">
          <RankedBars rows={stats.authors} emptyText={`No books finished in ${year} yet.`} />
        </Card>
        <Card title="Highest rated" className="lg:col-span-2">
          {stats.topRated.length === 0 ? (
            <p className="text-sm text-ink/50">Rate the books you finish to see your favourites here.</p>
          ) : (
            <ol className="flex gap-4 overflow-x-auto pb-2">
              {stats.topRated.map(({ book, entry }) => (
                <li key={book.id} className="w-24 shrink-0 sm:w-28">
                  <Link to={`/book/${book.id}`} className="group block">
                    <BookCover book={book} className="aspect-[2/3] w-full rounded shadow-md transition group-hover:-translate-y-1" />
                    <div className="mt-2 truncate font-bangla text-sm">{book.title}</div>
                    <div className="text-xs text-yellow-500">{"★".repeat(entry.rating)}</div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StatsPage;
