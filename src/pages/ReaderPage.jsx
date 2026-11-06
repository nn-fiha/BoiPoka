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
  // The bars slide away while you read and come back when you scroll up or tap the page
  const [barsShown, setBarsShown] = useState(true);
  const restoreScroll = useRef(null);
  const currentChapter = useRef(null);

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

  // Hide the bars when scrolling down through the text, show them when scrolling up or reaching the end
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 40;
      if (y < 80 || atEnd || y < lastY - 8) setBarsShown(true);
      else if (y > lastY + 8) setBarsShown(false);
      if (Math.abs(y - lastY) > 8) lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Opening the chapter list scrolls it to the chapter you're on
  useEffect(() => {
    if (tocOpen) currentChapter.current?.scrollIntoView({ block: "center" });
  }, [tocOpen]);

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
    setBarsShown(true);
  };

  // Tapping the page shows or hides the bars, like an ebook app; selecting text doesn't count
  const handlePageTap = (e) => {
    if (e.target.closest("a, button") || window.getSelection()?.toString()) return;
    setBarsShown((shown) => !shown);
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
  const showBars = barsShown || tocOpen;
  const hasPrevious = chapters && index > 0;
  const hasNext = chapters && index < chapters.length - 1;

  return (
    // A grey desk with a white page on it, like a PDF viewer; a dark desk and page in dark mode.
    // The reader takes the whole screen: the site header and tab bar are hidden on this page.
    <div className="min-h-screen bg-[#e7e4db] pb-24 pt-[calc(3.75rem+env(safe-area-inset-top))] dark:bg-[#111512] sm:pb-16">
      {/* Reading progress stays visible even when the bars are hidden */}
      <div className="fixed inset-x-0 top-0 z-40 h-0.5 bg-line/60" aria-hidden="true">
        <div className="h-full bg-terra transition-all" style={{ width: `${percent}%` }} />
      </div>

      <header
        className={`fixed inset-x-0 top-0 z-30 border-b border-line bg-paper/95 pt-[env(safe-area-inset-top)] backdrop-blur transition-transform duration-300 ${
          showBars ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-1 px-2 py-2 sm:gap-2 sm:px-4">
          <Link to={`/book/${id}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-card" aria-label="Back to the book">
            <i className="bx bx-arrow-back text-2xl"></i>
          </Link>
          <button
            onClick={() => setTocOpen((open) => !open)}
            aria-expanded={tocOpen}
            aria-controls="reader-chapters"
            className="flex min-h-[2.75rem] min-w-0 flex-1 items-center gap-1.5 rounded-xl px-2 text-left hover:bg-card"
          >
            <span className="min-w-0">
              <span className="block truncate font-bangla text-sm font-semibold">{book?.title || "Opening the book…"}</span>
              <span className="block truncate font-bangla text-xs text-ink/60">
                {chapters ? `${chapters[index].label} · ${index + 1} of ${chapters.length}` : "Loading chapters…"}
              </span>
            </span>
            <i className={`bx ${tocOpen ? "bx-x" : "bx-list-ul"} ml-auto shrink-0 text-xl text-ink/60`}></i>
          </button>
          <div className="flex shrink-0 items-center rounded-full border border-line" role="group" aria-label="Text size">
            <button onClick={() => changeSize(-1)} disabled={size === 0} className="h-11 w-10 rounded-l-full text-sm hover:bg-card disabled:opacity-40" aria-label="Smaller text">
              A
            </button>
            <button
              onClick={() => changeSize(1)}
              disabled={size === SIZES.length - 1}
              className="h-11 w-10 rounded-r-full text-xl hover:bg-card disabled:opacity-40"
              aria-label="Larger text"
            >
              A
            </button>
          </div>
        </div>

        {tocOpen && chapters && (
          // Phones get the whole screen for the chapter list; wider screens a dropdown
          <nav
            id="reader-chapters"
            aria-label="Chapters"
            className="mx-auto h-[calc(100dvh-3.75rem-env(safe-area-inset-top))] max-w-3xl overflow-y-auto overscroll-contain px-2 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:h-auto sm:max-h-[60vh] sm:px-4 sm:pb-3"
          >
            <ol className="divide-y divide-line rounded-xl border border-line bg-card">
              {chapters.map((chapter, i) => (
                <li key={`${i}-${chapter.label}`} ref={i === index ? currentChapter : undefined}>
                  <button
                    onClick={() => goTo(i)}
                    aria-current={i === index ? "true" : undefined}
                    className={`flex min-h-[3rem] w-full items-center gap-3 px-4 py-2.5 text-left font-bangla hover:bg-paper ${
                      i === index ? "font-semibold text-terra" : ""
                    }`}
                  >
                    <span className="w-7 shrink-0 text-right text-xs tabular-nums text-ink/40">{i + 1}</span>
                    {chapter.label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </header>

      {/* Tapping outside the chapter list closes it */}
      {tocOpen && <button className="fixed inset-0 z-20 cursor-default bg-black/20" aria-label="Close chapter list" onClick={() => setTocOpen(false)} />}

      <article
        onClick={handlePageTap}
        className="mx-auto max-w-3xl bg-white px-5 py-8 text-[#1d1d1b] sm:mt-6 sm:px-16 sm:py-16 sm:shadow-[0_2px_16px_rgba(0,0,0,0.18)] dark:bg-[#1c211d] dark:text-ink"
      >
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
              {hasPrevious && (
                <button onClick={() => goTo(index - 1)} className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl border border-line font-medium hover:bg-card">
                  <i className="bx bx-chevron-left text-xl"></i> Previous
                </button>
              )}
              {hasNext ? (
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

      {/* Phones: chapter buttons within thumb reach, sliding away with the top bar */}
      {chapters && (
        <nav
          aria-label="Chapter navigation"
          className={`fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-line bg-paper/95 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur transition-transform duration-300 sm:hidden ${
            showBars && !tocOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <button
            onClick={() => goTo(index - 1)}
            disabled={!hasPrevious}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line disabled:opacity-30"
            aria-label="Previous chapter"
          >
            <i className="bx bx-chevron-left text-2xl"></i>
          </button>
          <button onClick={() => setTocOpen(true)} className="min-w-0 flex-1 text-center text-xs text-ink/60">
            <span className="block tabular-nums">
              Chapter {index + 1} of {chapters.length} · {percent}%
            </span>
          </button>
          <button
            onClick={() => goTo(index + 1)}
            disabled={!hasNext}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-terra text-cream disabled:opacity-30"
            aria-label="Next chapter"
          >
            <i className="bx bx-chevron-right text-2xl"></i>
          </button>
        </nav>
      )}
    </div>
  );
};

export default ReaderPage;
