export const BOOK_COLORS = [
  ["#7b2d26", "#f3d9b1"],
  ["#1f4e5f", "#e8e2c8"],
  ["#2f5233", "#f1e7c6"],
  ["#5b3a6b", "#f0dfe9"],
  ["#b5651d", "#fff3dc"],
  ["#283149", "#f6c667"],
  ["#8c2f39", "#fcd5ce"],
  ["#3d5a40", "#e9edc9"],
  ["#4a3728", "#e6ccb2"],
  ["#1d3557", "#a8dadc"],
];

export const hash = (text) => [...text].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);

// A stable [background, foreground] pair for a book, picked from its title
export const colorsFor = (title) => BOOK_COLORS[hash(title) % BOOK_COLORS.length];
