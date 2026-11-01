// Draws the yearly wrap-up as a 1080×1350 image (the shape Instagram and WhatsApp show best).
// It's drawn on a canvas rather than captured from the page so the download looks the same everywhere.
import { colorsFor } from "../components/Shelf/palette";

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;
const PAD = 92;

const CREAM = "#f7f5ef";
const TERRA = "#e08a63";
const SERIF = 'Fraunces, "Hind Siliguri", serif';
const SANS = 'Poppins, "Hind Siliguri", sans-serif';

const loadImage = (src) =>
  new Promise((resolve) => {
    const image = new Image();
    // Covers come from Open Library, which allows this; without it the canvas couldn't be saved
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });

// Splits text into lines that fit, adding an ellipsis if it runs past maxLines
const wrapLines = (ctx, text, width, maxLines) => {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= width || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    let last = lines[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > width && last.length) last = last.slice(0, -1);
    lines[maxLines - 1] = `${last.trimEnd()}…`;
  }
  return lines;
};

const fitText = (ctx, text, width) => {
  if (ctx.measureText(text).width <= width) return text;
  let cut = text;
  while (cut.length && ctx.measureText(`${cut}…`).width > width) cut = cut.slice(0, -1);
  return `${cut.trimEnd()}…`;
};

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
};

// The same designed placeholder the site shows for books without a cover photo
const drawPlaceholder = (ctx, book, x, y, w, h) => {
  const [background, foreground] = colorsFor(book.title);
  ctx.fillStyle = background;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = foreground;
  ctx.globalAlpha = 0.35;
  ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);
  ctx.globalAlpha = 1;
  ctx.fillStyle = foreground;
  ctx.textAlign = "center";
  ctx.font = `600 22px ${SANS}`;
  wrapLines(ctx, book.title, w - 36, 4).forEach((line, i) => ctx.fillText(line, x + w / 2, y + h / 2 - 20 + i * 28));
  ctx.textAlign = "left";
};

const label = (ctx, text, x, y) => {
  ctx.font = `500 24px ${SANS}`;
  ctx.fillStyle = "rgba(247,245,239,0.6)";
  ctx.fillText(text.toUpperCase(), x, y);
};

export const drawWrapCard = async (canvas, wrap, { name, username, site }) => {
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");

  await Promise.all(
    [`700 96px Fraunces`, `500 30px Fraunces`, `500 30px Poppins`, `600 30px Poppins`, `500 30px "Hind Siliguri"`].map((font) =>
      document.fonts.load(font, "অআ Aa").catch(() => {})
    )
  );
  const covers = await Promise.all(wrap.covers.map((book) => (book.cover_url ? loadImage(book.cover_url) : null)));

  // Background: deep sage with a warm glow in the corner
  const background = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  background.addColorStop(0, "#3f5a4a");
  background.addColorStop(1, "#1f2b24");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  const glow = ctx.createRadialGradient(CARD_WIDTH, 0, 0, CARD_WIDTH, 0, 700);
  glow.addColorStop(0, "rgba(224,138,99,0.35)");
  glow.addColorStop(1, "rgba(224,138,99,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  ctx.textBaseline = "alphabetic";

  // Header
  ctx.fillStyle = "rgba(247,245,239,0.75)";
  ctx.font = `600 28px ${SANS}`;
  ctx.fillText("BoiPoka", PAD, 104);
  ctx.font = `500 26px ${SANS}`;
  ctx.fillText("· আমার পড়ার জগৎ", PAD + ctx.measureText("BoiPoka ").width + 14, 104);

  ctx.fillStyle = CREAM;
  ctx.font = `500 40px ${SANS}`;
  ctx.fillText(fitText(ctx, `${name}'s`, CARD_WIDTH - PAD * 2), PAD, 196);
  ctx.font = `700 104px ${SERIF}`;
  ctx.fillText(`${wrap.year} in books`, PAD, 304);

  // Big numbers
  const figures = [
    [wrap.books.toLocaleString(), wrap.books === 1 ? "book" : "books"],
    [wrap.pages.toLocaleString(), "pages"],
    [wrap.averageRating ? `${wrap.averageRating.toFixed(1)}★` : "–", "avg rating"],
  ];
  const columnWidth = (CARD_WIDTH - PAD * 2) / 3;
  figures.forEach(([value, caption], i) => {
    const x = PAD + i * columnWidth;
    ctx.fillStyle = i === 0 ? TERRA : CREAM;
    ctx.font = `700 92px ${SERIF}`;
    ctx.fillText(fitText(ctx, value, columnWidth - 20), x, 470);
    label(ctx, caption, x, 512);
  });

  // Covers on a little wooden ledge
  const coverW = 164;
  const coverH = 246;
  const gap = 24;
  const coversTop = 576;
  const rowWidth = covers.length * coverW + Math.max(0, covers.length - 1) * gap;
  const startX = (CARD_WIDTH - rowWidth) / 2;
  if (covers.length) {
    const ledge = ctx.createLinearGradient(0, coversTop + coverH, 0, coversTop + coverH + 26);
    ledge.addColorStop(0, "#a9774a");
    ledge.addColorStop(1, "#5e3b1f");
    ctx.fillStyle = ledge;
    roundRect(ctx, PAD - 10, coversTop + coverH - 4, CARD_WIDTH - PAD * 2 + 20, 26, 4);
    ctx.fill();
  }
  wrap.covers.forEach((book, i) => {
    const x = startX + i * (coverW + gap);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = "#000";
    roundRect(ctx, x, coversTop, coverW, coverH, 6);
    ctx.fill();
    ctx.restore();
    if (covers[i]) {
      ctx.save();
      roundRect(ctx, x, coversTop, coverW, coverH, 6);
      ctx.clip();
      ctx.drawImage(covers[i], x, coversTop, coverW, coverH);
      ctx.restore();
    } else {
      drawPlaceholder(ctx, book, x, coversTop, coverW, coverH);
    }
  });

  if (!wrap.books) {
    ctx.fillStyle = "rgba(247,245,239,0.7)";
    ctx.font = `italic 500 40px ${SERIF}`;
    ctx.fillText("The shelf is waiting for its first book.", PAD, 700);
  }

  // Top authors and favourites
  const listTop = covers.length ? 920 : 620;
  if (wrap.books) label(ctx, "Top authors", PAD, listTop);
  wrap.authors.forEach(({ label: author, count }, i) => {
    const y = listTop + 58 + i * 52;
    ctx.font = `600 34px ${SERIF}`;
    ctx.fillStyle = TERRA;
    ctx.fillText(String(i + 1), PAD, y);
    ctx.fillStyle = CREAM;
    ctx.font = `500 32px ${SANS}`;
    const shown = fitText(ctx, author, 330);
    ctx.fillText(shown, PAD + 40, y);
    const nameWidth = ctx.measureText(shown).width;
    ctx.fillStyle = "rgba(247,245,239,0.55)";
    ctx.font = `500 24px ${SANS}`;
    ctx.fillText(`×${count}`, PAD + 52 + nameWidth, y);
  });
  if (wrap.books && !wrap.authors.length) {
    ctx.font = `500 30px ${SANS}`;
    ctx.fillStyle = "rgba(247,245,239,0.6)";
    ctx.fillText("—", PAD, listTop + 58);
  }

  const rightX = CARD_WIDTH / 2 + 50;
  const facts = [
    ["Favourite genre", wrap.genre],
    wrap.mood ? ["Most felt", wrap.mood] : ["Busiest month", wrap.busiestMonth],
  ].filter(([, value]) => value);
  facts.forEach(([caption, value], i) => {
    const y = listTop + i * 104;
    label(ctx, caption, rightX, y);
    ctx.fillStyle = CREAM;
    ctx.font = `500 34px ${SERIF}`;
    ctx.fillText(fitText(ctx, value, CARD_WIDTH - PAD - rightX), rightX, y + 50);
  });

  // Favourite quote
  if (wrap.quote) {
    const quoteTop = listTop + 220;
    ctx.font = `italic 500 32px ${SERIF}`;
    const lines = wrapLines(ctx, `“${wrap.quote.text}”`, CARD_WIDTH - PAD * 2 - 40, 2);
    ctx.fillStyle = TERRA;
    ctx.fillRect(PAD, quoteTop - 4, 6, lines.length * 44 + 48);
    ctx.fillStyle = CREAM;
    lines.forEach((line, i) => ctx.fillText(line, PAD + 34, quoteTop + 30 + i * 44));
    ctx.font = `500 24px ${SANS}`;
    ctx.fillStyle = "rgba(247,245,239,0.6)";
    ctx.fillText(fitText(ctx, `— ${wrap.quote.book.title}`, CARD_WIDTH - PAD * 2 - 40), PAD + 34, quoteTop + 30 + lines.length * 44 + 4);
  }

  // Footer
  ctx.font = `500 26px ${SANS}`;
  ctx.fillStyle = "rgba(247,245,239,0.6)";
  ctx.textAlign = "right";
  ctx.fillText(`${site.replace(/^https?:\/\//, "")}/u/${username}`, CARD_WIDTH - PAD, CARD_HEIGHT - 70);
  ctx.textAlign = "left";
};
