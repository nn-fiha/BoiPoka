// Pure helpers that turn shelf items ({ book, entry }) into reading statistics

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const yearOf = (date) => (date ? Number(date.slice(0, 4)) : null);

const countBy = (list, keyOf) =>
  Object.entries(
    list.reduce((counts, item) => {
      const key = keyOf(item);
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {})
  )
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

// Years that have at least one finished book, newest first, always including this year
export const availableYears = (items) => {
  const years = new Set([new Date().getFullYear()]);
  items.forEach(({ entry }) => entry.status === "read" && yearOf(entry.finished_at) && years.add(yearOf(entry.finished_at)));
  return [...years].sort((a, b) => b - a);
};

export const finishedInYear = (items, year) =>
  items.filter(({ entry }) => entry.status === "read" && yearOf(entry.finished_at) === year);

export const computeStats = (items, year) => {
  const read = items.filter(({ entry }) => entry.status === "read");
  const finished = finishedInYear(items, year);
  const rated = finished.filter(({ entry }) => entry.rating > 0);

  const perMonth = MONTHS.map(() => []);
  finished.forEach((item) => perMonth[Number(item.entry.finished_at.slice(5, 7)) - 1].push(item));

  const perDay = {};
  finished.forEach((item) => {
    (perDay[item.entry.finished_at] = perDay[item.entry.finished_at] || []).push(item);
  });

  return {
    finished,
    pages: finished.reduce((sum, { book }) => sum + (book.pages || 0), 0),
    averageRating: rated.length ? rated.reduce((sum, { entry }) => sum + entry.rating, 0) / rated.length : null,
    perMonth,
    perDay,
    genres: countBy(finished, ({ book }) => book.genre || "Uncategorized"),
    authors: countBy(finished, ({ book }) => book.author).slice(0, 5),
    topRated: [...rated].sort((a, b) => b.entry.rating - a.entry.rating).slice(0, 5),
    // Read books with no finish date can't be placed in a year
    undated: read.filter(({ entry }) => !entry.finished_at).length,
  };
};
