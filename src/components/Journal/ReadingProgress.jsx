import React from "react";

// "Page 120 of 442" with a slider, for books currently being read
const ReadingProgress = ({ currentPage, totalPages, onChange }) => {
  const page = currentPage ?? 0;
  const percent = totalPages ? Math.min(100, Math.round((page / totalPages) * 100)) : null;

  const setPage = (value) => {
    const next = value === "" ? null : Math.max(0, Math.round(Number(value)));
    onChange(totalPages && next !== null ? Math.min(next, totalPages) : next);
  };

  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <label className="flex items-center gap-2 text-sm">
          Page
          <input
            type="number"
            min="0"
            max={totalPages || undefined}
            value={currentPage ?? ""}
            onChange={(e) => setPage(e.target.value)}
            className="h-9 w-20 rounded-lg border border-line bg-paper px-2 text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-terra/40"
          />
          {totalPages ? <span className="text-ink/60">of {totalPages}</span> : null}
        </label>
        {percent !== null && <span className="ml-auto font-serif text-2xl font-bold tabular-nums text-terra">{percent}%</span>}
      </div>
      {totalPages ? (
        <input
          type="range"
          min="0"
          max={totalPages}
          value={page}
          onChange={(e) => setPage(e.target.value)}
          aria-label="Current page"
          className="mt-3 w-full accent-terra"
        />
      ) : (
        <p className="mt-2 text-xs text-ink/50">Add the page count in “Edit book details” to see a percentage.</p>
      )}
    </div>
  );
};

export default ReadingProgress;
