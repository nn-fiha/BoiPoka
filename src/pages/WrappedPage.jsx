import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useShelf } from "../hooks/useShelf";
import { usePageMeta, SITE_URL } from "../hooks/usePageTitle";
import { availableYears, computeWrap } from "../lib/stats";
import { CARD_HEIGHT, CARD_WIDTH, drawWrapCard } from "../lib/wrapCard";
import { ShelfSkeleton } from "../components/Common/Skeleton";

const toBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

// "My 2026 in books": a shareable image of a reader's year
const WrappedPage = () => {
  const { username } = useParams();
  const { owner, isMine, items, status } = useShelf(username);
  const years = useMemo(() => availableYears(items), [items]);
  const [year, setYear] = useState(new Date().getFullYear());
  const computed = useMemo(() => computeWrap(items, year), [items, year]);
  // The shelf hands back new objects on every render; only redraw when what's on the card changes
  const signature = JSON.stringify(computed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const wrap = useMemo(() => computed, [signature]);
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [drawing, setDrawing] = useState(true);

  const name = owner ? owner.display_name || owner.username : "";
  usePageMeta({
    title: owner ? `${isMine ? "My" : `${name}'s`} ${year} in books` : "Year in books",
    description: owner ? `${name} read ${wrap.books} books and ${wrap.pages.toLocaleString()} pages in ${year}.` : null,
  });

  useEffect(() => {
    if (!years.includes(year)) setYear(years[0]);
  }, [years, year]);

  useEffect(() => {
    // The canvas only exists once the shelf has loaded
    if (status !== "ready" || !owner || !canvasRef.current) return;
    let cancelled = false;
    let url = null;
    setDrawing(true);
    (async () => {
      await drawWrapCard(canvasRef.current, wrap, { name, username: owner.username, site: SITE_URL });
      const blob = await toBlob(canvasRef.current).catch(() => null);
      if (cancelled) return;
      url = blob ? URL.createObjectURL(blob) : null;
      setImageUrl(url);
      setDrawing(false);
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [status, owner, wrap, name]);

  if (status === "missing") {
    return (
      <div className="py-24 text-center">
        <p className="text-ink/70">No public shelf at @{username}.</p>
        <Link to="/" className="mt-4 inline-block text-terra underline">Go home</Link>
      </div>
    );
  }
  if (status === "loading") return <ShelfSkeleton />;

  const fileName = `boipoka-${owner.username}-${year}.png`;

  const download = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = fileName;
    link.click();
  };

  // Phones get the share sheet with the image attached; elsewhere it downloads
  const share = async () => {
    const blob = await toBlob(canvasRef.current);
    const file = blob && new File([blob], fileName, { type: "image/png" });
    if (file && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: `${name}'s ${year} in books`, url: window.location.href });
      } catch {
        // The reader closed the share sheet
      }
      return;
    }
    download();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <Link to={`/u/${owner.username}/stats`} className="-my-2 inline-block py-2 text-sm text-ink/60 hover:text-ink">
        <i className="bx bx-arrow-back align-middle"></i> {isMine ? "My reading stats" : `${name}'s reading stats`}
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start">
        <div className="relative mx-auto w-full max-w-[420px]">
          {/* Drawn off-screen, shown as an image so it can be long-pressed and saved on phones */}
          <canvas ref={canvasRef} width={CARD_WIDTH} height={CARD_HEIGHT} className="hidden" aria-hidden="true" />
          <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-sage-dark shadow-xl">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={`${name}'s ${year} in books: ${wrap.books} books, ${wrap.pages.toLocaleString()} pages${
                  wrap.authors[0] ? `, top author ${wrap.authors[0].label}` : ""
                }`}
                className={`h-full w-full transition-opacity ${drawing ? "opacity-60" : "opacity-100"}`}
              />
            )}
          </div>
        </div>

        <div>
          <p className="font-bangla text-lg text-terra">বছর শেষের হিসাব</p>
          <h1 className="mt-1 font-serif text-3xl font-bold sm:text-5xl">
            {isMine ? "My" : `${name}'s`} {year} in books
          </h1>
          <p className="mt-3 text-ink/70">
            {wrap.books === 0
              ? `No books finished in ${year} yet. Add a finish date to the books you've read and they'll show up here.`
              : `${wrap.books} ${wrap.books === 1 ? "book" : "books"} and ${wrap.pages.toLocaleString()} pages${
                  wrap.authors[0] ? `, most of all ${wrap.authors[0].label}` : ""
                }.`}
          </p>

          {years.length > 1 && (
            <div className="mt-6 inline-flex gap-1 rounded-full border border-line bg-card p-1" role="group" aria-label="Year">
              {years.slice(0, 5).map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  aria-pressed={year === y}
                  className={`min-h-[2.25rem] rounded-full px-3.5 py-1.5 text-sm tabular-nums transition ${
                    year === y ? "bg-terra text-cream" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={share}
              disabled={!imageUrl}
              className="flex h-12 items-center gap-2 rounded-xl bg-terra px-5 font-medium text-cream transition hover:bg-terra-dark disabled:opacity-60"
            >
              <i className="bx bx-share-alt text-lg"></i> Share image
            </button>
            <button
              onClick={download}
              disabled={!imageUrl}
              className="flex h-12 items-center gap-2 rounded-xl border border-line px-5 font-medium transition hover:bg-card disabled:opacity-60"
            >
              <i className="bx bx-download text-lg"></i> Download
            </button>
            <button onClick={copyLink} className="flex h-12 items-center gap-2 rounded-xl border border-line px-5 font-medium transition hover:bg-card">
              <i className="bx bx-link text-lg"></i> Copy link
            </button>
          </div>

          {isMine && (
            <p className="mt-6 text-sm text-ink/60">
              The card uses books you marked as read with a finish date in {year}. Your highest-rated books go on the front, and the quote comes
              from the favourite lines you saved.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WrappedPage;
