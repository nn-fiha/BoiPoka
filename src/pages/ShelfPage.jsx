import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useShelf } from "../hooks/useShelf";
import { useReading } from "../context/ReadingContext";
import { usePageMeta } from "../hooks/usePageTitle";
import { finishedInYear } from "../lib/stats";
import BookshelfView from "../components/Shelf/BookshelfView";
import GoalCard from "../components/Stats/GoalCard";
import { ShelfSkeleton } from "../components/Common/Skeleton";
import PickNextRead from "../components/Shelf/PickNextRead";
import ShareButton from "../components/Common/ShareButton";
import ShareShelfModal from "../components/Share/ShareShelfModal";
import { toast } from "react-toastify";

const ShelfPage = () => {
  const { username } = useParams();
  const { owner, isMine, items, collections, status } = useShelf(username);
  const { updateEntry } = useReading();
  const [sharing, setSharing] = useState(false);
  const ownerName = owner?.display_name || owner?.username;

  const readCount = items.filter(({ entry }) => entry.status === "read").length;
  usePageMeta({
    title: owner ? (isMine ? "My bookshelf" : `${ownerName}'s bookshelf`) : null,
    description: owner
      ? `${ownerName}'s bookshelf on BoiPoka — ${readCount} ${readCount === 1 ? "book" : "books"} read, with ratings, notes and favourite quotes.`
      : null,
    image: items.find(({ book }) => book.cover_url)?.book.cover_url,
  });

  if (status === "missing") {
    return (
      <div className="py-24 text-center">
        <p className="text-ink/70">No public shelf at @{username}.</p>
        <Link to="/" className="mt-4 inline-block text-terra underline">Go home</Link>
      </div>
    );
  }
  if (status === "loading") return <ShelfSkeleton />;

  const year = new Date().getFullYear();
  const undated = items.filter(({ entry }) => entry.status === "read" && !entry.finished_at);

  // Quick fix for books shelved as Read without a date: treat the day they were added as the finish date
  const dateUndated = () => {
    undated.forEach(({ book, entry }) => updateEntry(book.id, { finished_at: entry.created_at.slice(0, 10) }));
    toast.success(`Added finish dates to ${undated.length} ${undated.length === 1 ? "book" : "books"}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8">
      <section className="py-6 sm:py-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold">{isMine ? "My bookshelf" : `${ownerName}'s shelf`}</h1>
          <p className="mt-2 font-bangla text-lg text-ink/70">
            {owner.bio || (isMine ? "যত বই পড়েছি, সব এক তাকে।" : `@${owner.username}`)}
          </p>
        </div>
        <div className="flex gap-2">
          {isMine ? (
            <button
              onClick={() => setSharing(true)}
              className="rounded-full border border-line bg-card px-4 py-2.5 font-medium hover:border-terra hover:text-terra"
            >
              <i className="bx bx-share-alt align-middle"></i> Share
            </button>
          ) : (
            <ShareButton
              title={`${ownerName}'s bookshelf`}
              text={`${ownerName}'s bookshelf on BoiPoka`}
              className="rounded-full border border-line bg-card px-4 py-2.5 font-medium hover:border-terra hover:text-terra"
            />
          )}
          <Link
            to={`/u/${owner.username}/stats`}
            className="rounded-full border border-line bg-card px-5 py-2.5 font-medium hover:border-terra hover:text-terra"
          >
            <i className="bx bx-bar-chart-alt-2 align-middle"></i> Stats
          </Link>
          {isMine && (
            <Link to="/add" className="hidden sm:inline-block rounded-full bg-terra px-5 py-2.5 font-medium text-cream hover:bg-terra-dark">
              <i className="bx bx-plus align-middle"></i> Add a book
            </Link>
          )}
        </div>
      </section>

      {isMine && <ShareShelfModal open={sharing} onClose={() => setSharing(false)} />}

      <BookshelfView
        items={items}
        title={isMine ? "My Bookshelf" : `${ownerName}'s Bookshelf`}
        collections={collections}
        statsAside={
          <GoalCard
            compact
            ownerId={owner.id}
            year={year}
            finishedCount={finishedInYear(items, year).length}
            editable={isMine}
            undatedCount={undated.length}
            onDateUndated={dateUndated}
          />
        }
        extraActions={() =>
          isMine && (
            <PickNextRead
              items={items}
              onStart={(book) => {
                updateEntry(book.id, { status: "reading", started_at: new Date().toLocaleDateString("en-CA") });
                toast.success(`Happy reading — ${book.title}`);
              }}
            />
          )
        }
        emptyMessage={
          isMine ? (
            <>
              Your shelf is empty. <Link to="/add" className="text-terra underline">Add the first book you've read</Link>.
            </>
          ) : (
            "This shelf is still empty."
          )
        }
      />
    </div>
  );
};

export default ShelfPage;
