import React, { useEffect, useState } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchPublicProfiles } from "../lib/api";

const HomePage = () => {
  const { profile, loading } = useAuth();
  const [readers, setReaders] = useState([]);
  usePageTitle(null);

  useEffect(() => {
    fetchPublicProfiles().then(setReaders).catch(() => setReaders([]));
  }, []);

  if (loading) return null;
  if (profile) return <Navigate to={`/u/${profile.username}`} replace />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8">
      <section className="py-10 sm:py-24 max-w-2xl">
        <p className="font-bangla text-lg text-terra">আমার পড়ার জগৎ</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-6xl font-bold leading-tight">Every book you've read, on one shelf.</h1>
        <p className="mt-5 text-lg text-ink/70">
          Build your bookshelf, keep a journal for each book — how it felt, what stayed with you, the lines you loved —
          and share it with other readers.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/login?mode=signup" className="rounded-full bg-terra px-6 py-3 font-medium text-cream hover:bg-terra-dark">
            Start my shelf
          </Link>
          <Link to="/login" className="rounded-full border border-line px-6 py-3 font-medium hover:bg-card">
            Sign in
          </Link>
        </div>
        <Link to="/library" className="mt-5 inline-block py-2 text-sm text-ink/60 transition hover:text-terra">
          Browse the library without an account →
        </Link>
      </section>

      {readers.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl font-bold mb-5">Readers' shelves</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {readers.map((reader) => (
              <li key={reader.username}>
                <Link
                  to={`/u/${reader.username}`}
                  className="block rounded-lg border border-line bg-card/70 p-5 hover:shadow-md transition"
                >
                  <div className="font-semibold">{reader.display_name || reader.username}</div>
                  <div className="text-sm text-ink/60">@{reader.username}</div>
                  <div className="mt-2 text-sm">
                    {reader.shelf_entries?.[0]?.count ?? 0} {reader.shelf_entries?.[0]?.count === 1 ? "book" : "books"} on the
                    shelf
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default HomePage;
