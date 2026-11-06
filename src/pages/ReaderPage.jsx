import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchBook } from "../lib/api";
import { loadFreeBook, parseFreeRead, readProgress, saveProgress } from "../lib/freeRead";
import { usePageTitle } from "../hooks/usePageTitle";

const SIZES = ["text-base", "text-lg", "text-xl", "text-2xl"];
const SIZE_KEY = "boipoka.readerSize";

const readSize = () => {
  try {
    return Math.min(SIZES.length - 1, Number(localStorage.getItem(SIZE_KEY) ?? 1));
  } catch {
    return 1;
  }
};

// Reads a public-domain book chapter by chapter, remembering where you stopped
const ReaderPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState(null);
  const [index, setIndex] = useState(0);
  const [html, setHtml] = useState(null);
  const [error, setError] = useState(null);
  const [size, setSize] = useState(readSize);
  const [tocOpen, setTocOpen] = useState(false);
  const restoreScroll = useRef(null);

  const source = parseFreeRead(book?.free_read);
  usePageTitle(book ? `Reading ${book.title}` : "Reader", { noindex: true });

  // The book and its list of chapters
  useEffect(() => {
    let cancelled = false;
    setError(null);
    setChapters(null);
    setHtml(null);
    (async () => {
      try {
        const found = await fetchBook(id);
        if (cancelled) return;
        const freeSource = parseFreeRead(found?.free_read);
        if (!freeSource) throw new Error("There's no free copy of this book to read.");
        setBook(found);
        const list = await loadFreeBook(freeSource);
        if (cancelled) return;
        const saved = readProgress(id);
        const start = saved && saved.chapter < list.length ? saved.chapter : list.start || 0;
        restoreScroll.current = saved?.chapter === start ? saved.scroll : 0;
        setChapters(list);
        setIndex(start);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // The current chapter's text
  useEffect(() => {
    if (!chapters) return;
    let cancelled = false;
    setHtml(null);
    chapters[index]
      .load()
      .then((text) => {
        if (cancelled) return;
        setHtml(text);
        const scroll = restoreScroll.current ?? 0;
        restoreScroll.current = null;
        // Wait a frame so the chapter is laid out before scrolling to where you were
        requestAnimationFrame(() => window.scrollTo(0, scroll * (document.documentElement.scrollHeight - window.innerHeight)));
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [chapters, index]);

  // Remember the chapter and how far down it you are
  useEffect(() => {
    if (!chapters || html === null) return;
    const save = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      saveProgress(id, { chapter: index, chapters: chapters.length, label: chapters[index].label, scroll: max > 0 ? window.scrollY / max : 0 });
    };
    save();
    let timer;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(save, 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [id, chapters, index, html]);

  const changeSize = (step) => {
    const next = Math.max(0, Math.min(SIZES.length - 1, size + step));
    setSize(next);
    try {
      localStorage.setItem(SIZE_KEY, String(next));
    } catch {
      // The size resets next visit
    }
  };

  const goTo = (next) => {
    restoreScroll.current = 0;
    setIndex(next);
    setTocOpen(false);
  };

  if (error) {
    return (
      <div className="py-24 text-center">
        <p className="text-ink/70">{error}</p>
        <Link to={`/book/${id}`} className="mt-4 inline-block text-terra underline">
          Back to the book
        </Link>
      </div>
    );
  }

  const bangla = book?.language === "Bangla";
  const percent = chapters ? Math.round(((index + 1) / chapters.length) * 100) : 0;

  return (
    // A grey desk with a white page on it, like a PDF viewer; a dark desk and page in dark mode
    <div className="min-h-screen bg-[#e7e4db] pb-16 dark:bg-[#111512]">
      {/* Toolbar stays on screen while reading */}
      <div className="sticky top-16 z-20 border-b border-line bg-paper/95 backdrop-blur sm:top-20">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2">
          <Link to={`/book/${id}`} className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-card" aria-label="Back to the book">
            <i className="bx bx-arrow-back text-xl"></i>
          </Link>
          <button
            onClick={() => setTocOpen((open) => !open)}
            aria-expanded={tocOpen}
            className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full px-3 py-2 text-left hover:bg-card"
          >
            <span className="min-w-0">
              <span className="block truncate font-bangla text-sm font-semibold">{book?.title || "Opening the book…"}</span>
              <span className="block truncate font-bangla text-xs text-ink/60">
                {chapters ? `${chapters[index].label} · ${index + 1} of ${chapters.length}` : "Loading chapters…"}
              </span>
            </span>
            <i className={`bx bx-chevron-down shrink-0 text-lg text-ink/50 transition ${tocOpen ? "rotate-180" : ""}`}></i>
          </button>
          <div className="flex shrink-0 items-center rounded-full border border-line" role="group" aria-label="Text size">
            <button onClick={() => changeSize(-1)} disabled={size === 0} className="h-9 w-9 rounded-l-full text-sm hover:bg-card disabled:opacity-40" aria-label="Smaller text">
              A
            </button>
            <button
              onClick={() => changeSize(1)}
              disabled={size === SIZES.length - 1}
              className="h-9 w-9 rounded-r-full text-lg hover:bg-card disabled:opacity-40"
              aria-label="Larger text"
            >
              A
            </button>
          </div>
        </div>
        <div className="h-0.5 bg-line" aria-hidden="true">
          <div className="h-full bg-terra transition-all" style={{ width: `${percent}%` }} />
        </div>

        {tocOpen && chapters && (
          <nav className="mx-auto max-h-[60vh] max-w-3xl overflow-y-auto px-4 pb-3" aria-label="Chapters">
            <ol className="divide-y divide-line rounded-xl border border-line bg-card">
              {chapters.map((chapter, i) => (
                <li key={`${i}-${chapter.label}`}>
                  <button
                    onClick={() => goTo(i)}
                    aria-current={i === index ? "true" : undefined}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left font-bangla text-sm hover:bg-paper ${i === index ? "text-terra" : ""}`}
                  >
                    <span className="w-7 shrink-0 text-right text-xs tabular-nums text-ink/40">{i + 1}</span>
                    {chapter.label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      <article className="mx-auto mt-4 max-w-3xl bg-white px-6 py-10 text-[#1d1d1b] shadow-[0_2px_16px_rgba(0,0,0,0.18)] sm:mt-10 sm:px-16 sm:py-16 dark:bg-[#1c211d] dark:text-ink">
        {html === null ? (
          <div className="space-y-3" aria-label="Loading chapter">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-ink/10" style={{ width: `${90 - (i % 3) * 12}%` }} />
            ))}
          </div>
        ) : (
          <div
            className={`reader-text ${SIZES[size]} ${bangla ? "reader-bangla leading-loose" : "font-serif leading-relaxed"}`}
            lang={bangla ? "bn" : "en"}
            // Cleaned in lib/freeRead.js: only plain formatting tags, no attributes, links or scripts
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        {chapters && html !== null && (
          <>
            <div className="mt-12 flex gap-3">
              {index > 0 && (
                <button onClick={() => goTo(index - 1)} className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl border border-line font-medium hover:bg-card">
                  <i className="bx bx-chevron-left text-xl"></i> Previous
                </button>
              )}
              {index < chapters.length - 1 ? (
                <button
                  onClick={() => goTo(index + 1)}
                  className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-terra font-medium text-cream hover:bg-terra-dark"
                >
                  Next chapter <i className="bx bx-chevron-right text-xl"></i>
                </button>
              ) : (
                <Link to={`/book/${id}`} className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-sage font-medium text-white hover:bg-sage-dark">
                  <i className="bx bx-check text-xl"></i> Finished — write about it
                </Link>
              )}
            </div>
            <p className="mt-8 text-center text-xs text-ink/50">
              Public-domain text from{" "}
              <a href={source.url} target="_blank" rel="noreferrer" className="underline hover:text-ink">
                {source.credit}
              </a>
            </p>
          </>
        )}
      </article>
    </div>
  );
};

export default ReaderPage;
