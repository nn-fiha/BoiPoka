import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useReading } from "../context/ReadingContext";
import { fetchCollections, fetchProfileByUsername, fetchShelf } from "../lib/api";

// Loads a reader's profile and shelf as { book, entry } items.
// Your own shelf comes from the live reading context so edits show immediately.
export const useShelf = (username) => {
  const { profile: myProfile } = useAuth();
  const { entries: myEntries, loading: myLoading, collections: myCollections } = useReading();
  const isMine = myProfile?.username === username.toLowerCase();

  const [owner, setOwner] = useState(null);
  const [theirEntries, setTheirEntries] = useState([]);
  const [theirCollections, setTheirCollections] = useState([]);
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
        const [rows, collections] = await Promise.all([
          fetchShelf(profile.id),
          fetchCollections(profile.id).catch(() => []),
        ]);
        if (cancelled) return;
        setTheirEntries(rows);
        setTheirCollections(collections);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("missing");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username, isMine, myProfile]);

  const rows = isMine ? Object.values(myEntries) : theirEntries;
  const items = rows.filter((row) => row.book).map(({ book, ...entry }) => ({ book, entry }));
  const loading = status === "loading" || (isMine && myLoading) || !owner;

  const collections = isMine ? myCollections : theirCollections;

  return { owner, isMine, items, collections, status: status === "missing" ? "missing" : loading ? "loading" : "ready" };
};
