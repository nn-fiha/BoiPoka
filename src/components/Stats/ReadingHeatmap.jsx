import React, { useEffect, useMemo, useRef, useState } from "react";
import { MONTHS } from "../../lib/stats";

const LEVELS = ["bg-ink/[0.06]", "bg-sage/35", "bg-sage/60", "bg-sage/85", "bg-sage-dark dark:bg-sage-light"];
const DAY_MS = 86400000;

const isoDate = (date) => date.toISOString().slice(0, 10);

// A GitHub-style calendar of the days books were finished
const ReadingHeatmap = ({ year, perDay }) => {
  const [hovered, setHovered] = useState(null);
  const scrollerRef = useRef(null);

  // On narrow screens only part of the year fits; start at the current month, not January
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const now = new Date();
    if (now.getFullYear() !== year) {
      scroller.scrollLeft = 0;
      return;
    }
    const startOfYear = new Date(year, 0, 1);
    const week = Math.floor((now - startOfYear) / (7 * DAY_MS));
    scroller.scrollLeft = Math.max(0, week * 14 - scroller.clientWidth + 60);
  }, [year]);

  const weeks = useMemo(() => {
    const start = new Date(Date.UTC(year, 0, 1));
    // Start the grid on the Sunday on or before 1 January
    const first = new Date(start.getTime() - start.getUTCDay() * DAY_MS);
    const columns = [];
    for (let day = first; day.getUTCFullYear() <= year; day = new Date(day.getTime() + 7 * DAY_MS)) {
      columns.push(
        Array.from({ length: 7 }, (_, i) => {
          const date = new Date(day.getTime() + i * DAY_MS);
          return date.getUTCFullYear() === year ? isoDate(date) : null;
        })
      );
    }
    return columns;
  }, [year]);

  const max = Math.max(1, ...Object.values(perDay).map((books) => books.length));
  const level = (count) => (count === 0 ? 0 : Math.max(1, Math.ceil((count / max) * 4)));

  const describe = (date) => {
    const books = perDay[date] || [];
    const [, month, day] = date.split("-");
    return `${Number(day)} ${MONTHS[Number(month) - 1]}: ${
      books.length ? `${books.length} finished — ${books.map(({ book }) => book.title).join(", ")}` : "no books finished"
    }`;
  };

  return (
    <div>
      <div ref={scrollerRef} className="overflow-x-auto pb-2">
        <div className="inline-flex gap-[3px]" onMouseLeave={() => setHovered(null)}>
          {weeks.map((week, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              {week.map((date, d) =>
                date ? (
                  <div
                    key={d}
                    className={`h-[11px] w-[11px] rounded-[2px] ${LEVELS[level((perDay[date] || []).length)]} ${
                      hovered === date ? "ring-1 ring-ink/60" : ""
                    }`}
                    onMouseEnter={() => setHovered(date)}
                    onClick={() => setHovered(date)}
                    title={describe(date)}
                  />
                ) : (
                  <div key={d} className="h-[11px] w-[11px]" />
                )
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-ink/50">
        <span className="min-h-[1rem] font-bangla">{hovered ? describe(hovered) : "Tap or hover a day to see what you finished"}</span>
        <span className="flex items-center gap-1">
          Less
          {LEVELS.map((cls) => (
            <span key={cls} className={`h-[11px] w-[11px] rounded-[2px] ${cls}`} />
          ))}
          More
        </span>
      </div>
    </div>
  );
};

export default ReadingHeatmap;
