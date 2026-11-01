import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useReading } from "../context/ReadingContext";
import { fetchProfileByUsername, fetchShelf } from "../lib/api";
import BookshelfView from "../components/Shelf/BookshelfView";

const ShelfPage = () => {
  const { username } = useParams();
  const { profile: myProfile } = useAuth();
  const { entries: myEntries, loading: myLoading } = useReading();
  const isMine = myProfile?.username === username.toLowerCase();

  const [owner, setOwner] = useState(null);
  const [theirEntries, setTheirEntries] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (isMine) {
      setOwner(myProfile);
      setStatus("ready");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        const profile = await fetchProfileByUsername(username);
        if (cancelled) return;
        if (!profile) {
          setStatus("missing");
          return;
        }
        setOwner(profile);
        setTheirEntries(await fetchShelf(profile.id));
        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("missing");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username, isMine, myProfile]);

  if (status === "missing") {
    return (
      <div className="py-24 text-center">
        <p className="text-ink/70">No public shelf at @{username}.</p>
        <Link to="/" className="mt-4 inline-block text-terra underline">Go home</Link>
      </div>
    );
  }
  if (status === "loading" || (isMine && myLoading) || !owner) {
    return <p className="py-24 text-center text-ink/60">Dusting off the shelf…</p>;
  }

  const rows = isMine ? Object.values(myEntries) : theirEntries;
  const items = rows.filter((row) => row.book).map(({ book, ...entry }) => ({ book, entry }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8">
      <section className="py-6 sm:py-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold">
            {isMine ? "My bookshelf" : `${owner.display_name || owner.username}'s shelf`}
          </h1>
          <p className="mt-2 font-bangla text-lg text-ink/70">
            {owner.bio || (isMine ? "যত বই পড়েছি, সব এক তাকে।" : `@${owner.username}`)}
          </p>
        </div>
        {isMine && (
          <Link to="/add" className="hidden sm:inline-block rounded-full bg-terra px-5 py-2.5 font-medium text-cream hover:bg-terra-dark">
            <i className="bx bx-plus align-middle"></i> Add a book
          </Link>
        )}
      </section>

      <BookshelfView
        items={items}
        title={isMine ? "My Bookshelf" : `${owner.display_name || owner.username}'s Bookshelf`}
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
