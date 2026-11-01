import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSharedShelf } from "../lib/api";
import { finishedInYear } from "../lib/stats";
import { usePageTitle } from "../hooks/usePageTitle";
import { useAuth } from "../context/AuthContext";
import BookshelfView from "../components/Shelf/BookshelfView";
import GoalCard from "../components/Stats/GoalCard";
import { ShelfSkeleton } from "../components/Common/Skeleton";

// Read-only showcase of a shelf, opened through its owner's share link
const SharedShelfPage = () => {
  const { token } = useParams();
  const { user } = useAuth();
  const [shelf, setShelf] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    fetchSharedShelf(token)
      .then((data) => !cancelled && setShelf(data))
      .catch(() => !cancelled && setShelf(null));
    return () => {
      cancelled = true;
    };
  }, [token]);

  const owner = shelf?.profile;
  const name = owner?.display_name || owner?.username;
  // Share links are for friends, so keep them out of search results
  usePageTitle(owner ? `${name}'s bookshelf` : "Shared bookshelf", { noindex: true });

  if (shelf === undefined) return <ShelfSkeleton />;

  if (!shelf) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-terra/10 text-terra">
          <i className="bx bx-lock-alt text-4xl"></i>
        </div>
        <h1 className="font-serif text-3xl font-bold">This shelf isn't shared</h1>
        <p className="mt-3 text-ink/70">The link may have been reset, or its owner made the shelf private.</p>
        <Link to="/library" className="mt-8 inline-block rounded-full bg-terra px-6 py-3 font-medium text-cream hover:bg-terra-dark">
          Browse the library
        </Link>
      </div>
    );
  }

  const items = shelf.entries.map(({ book, ...entry }) => ({ book, entry }));
  const year = new Date().getFullYear();
  const isOwner = user?.id === owner.id;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8">
      {isOwner && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-terra/10 px-4 py-3 text-sm motion-safe:animate-fade-in">
          <i className="bx bx-show text-lg text-terra"></i>
          This is how your friends see your shelf.
          <Link to={`/u/${owner.username}`} className="ml-auto font-medium text-terra hover:underline">
            Back to editing
          </Link>
        </div>
      )}

      <section className="flex flex-wrap items-center gap-5 py-8 sm:py-12">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sage text-2xl font-bold text-white sm:h-20 sm:w-20 sm:text-3xl">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-terra">Shared bookshelf</p>
          <h1 className="font-serif text-3xl font-bold sm:text-5xl">{name}'s bookshelf</h1>
          {owner.bio && <p className="mt-1 font-bangla text-lg text-ink/70">{owner.bio}</p>}
        </div>
      </section>

      <BookshelfView
        items={items}
        title={`${name}'s Bookshelf`}
        collections={shelf.collections}
        statsAside={
          shelf.goal ? (
            <GoalCard
              compact
              ownerId={owner.id}
              year={year}
              finishedCount={finishedInYear(items, year).length}
              editable={false}
              initialGoal={shelf.goal}
            />
          ) : null
        }
        emptyMessage={`${name} hasn't shelved any books yet.`}
      />

      {!user && (
        <section className="my-16 rounded-3xl border border-line bg-card p-8 text-center sm:p-12">
          <h2 className="font-serif text-2xl font-bold sm:text-3xl">Keep a shelf of your own</h2>
          <p className="mx-auto mt-2 max-w-md text-ink/70">
            Track every book you've read, write a journal for each, and share your shelf with friends.
          </p>
          <Link
            to="/login?mode=signup"
            className="mt-6 inline-block rounded-full bg-terra px-6 py-3 font-medium text-cream hover:bg-terra-dark"
          >
            Start my shelf — it's free
          </Link>
        </section>
      )}
    </div>
  );
};

export default SharedShelfPage;
