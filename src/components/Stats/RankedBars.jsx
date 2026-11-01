import React from "react";

// Labelled horizontal bars for a ranked list (genres, authors)
const RankedBars = ({ rows, emptyText }) => {
  if (rows.length === 0) return <p className="text-sm text-ink/50">{emptyText}</p>;
  const max = rows[0].count;

  return (
    <ul className="space-y-2.5">
      {rows.map(({ label, count }) => (
        <li key={label} className="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-center gap-3 text-sm">
          <span className="truncate font-bangla" title={label}>
            {label}
          </span>
          <span className="h-2.5 rounded-full bg-ink/[0.06]">
            <span className="block h-full rounded-full bg-sage" style={{ width: `${(count / max) * 100}%` }} />
          </span>
          <span className="w-6 text-right tabular-nums text-ink/60">{count}</span>
        </li>
      ))}
    </ul>
  );
};

export default RankedBars;
