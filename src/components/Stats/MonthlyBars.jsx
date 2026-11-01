import React, { useState } from "react";
import { MONTHS } from "../../lib/stats";

// Books finished per month: one series, so one colour and no legend
const MonthlyBars = ({ perMonth }) => {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(1, ...perMonth.map((books) => books.length));

  return (
    <div>
      <div className="relative flex h-44 items-end gap-1.5 sm:gap-3 border-b border-line">
        {perMonth.map((books, month) => (
          <div
            key={month}
            className="relative flex h-full flex-1 flex-col items-center justify-end"
            onMouseEnter={() => setHovered(month)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(month)}
            onBlur={() => setHovered(null)}
            tabIndex={0}
            aria-label={`${MONTHS[month]}: ${books.length} ${books.length === 1 ? "book" : "books"}`}
          >
            {books.length > 0 && <span className="mb-1 text-xs tabular-nums text-ink/60">{books.length}</span>}
            <div
              className={`w-full max-w-[2.5rem] rounded-t-[4px] transition-colors ${
                hovered === month ? "bg-terra-dark" : "bg-terra"
              }`}
              style={{ height: `${(books.length / max) * 80}%`, minHeight: books.length ? 4 : 0 }}
            />
            {hovered === month && books.length > 0 && (
              <div className="pointer-events-none absolute bottom-full z-10 mb-1 w-44 rounded-xl border border-line bg-card p-2.5 text-left text-xs shadow-xl motion-safe:animate-pop-in">
                <div className="mb-1 font-medium">
                  {MONTHS[month]} · {books.length} {books.length === 1 ? "book" : "books"}
                </div>
                {books.slice(0, 4).map(({ book }) => (
                  <div key={book.id} className="truncate font-bangla text-ink/70">
                    {book.title}
                  </div>
                ))}
                {books.length > 4 && <div className="text-ink/50">+{books.length - 4} more</div>}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5 sm:gap-3">
        {MONTHS.map((month) => (
          <span key={month} className="flex-1 text-center text-[10px] sm:text-xs text-ink/50">
            {month.slice(0, 1)}
            <span className="hidden sm:inline">{month.slice(1)}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default MonthlyBars;
