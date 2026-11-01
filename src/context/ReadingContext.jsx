import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { supabase } from "../lib/supabase";
import {
  addToCollection,
  createCollection,
  deleteCollection,
  fetchCollections,
  fetchShelf,
  removeFromCollection,
} from "../lib/api";
import { useAuth } from "./AuthContext";

export const STATUSES = {
  read: { label: "Read", short: "Read", bangla: "পড়া শেষ", color: "bg-emerald-700" },
  reading: { label: "Reading", short: "Reading", bangla: "পড়ছি", color: "bg-amber-600" },
  want: { label: "Want to read", short: "Want", bangla: "পড়তে চাই", color: "bg-sky-700" },
};

export const MOODS = [
  "Couldn't put it down",
  "Made me cry",
  "Mind-blowing",
  "Comfort read",
  "Slow burn",
  "Re-read worthy",
];

const EDITABLE_FIELDS = ["status", "started_at", "finished_at", "rating", "moods", "review", "quotes", "current_page", "tags"];
const SAVE_DELAY_MS = 600;

const ReadingContext = createContext(null);

// The signed-in reader's own shelf, kept in memory and synced to Supabase
export const ReadingProvider = ({ children }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState({});
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const pendingSaves = useRef({});
  // Mirrors `entries` so quick successive edits build on each other
  const entriesRef = useRef(entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const reload = useCallback(async () => {
    if (!user) {
      setEntries({});
      setCollections([]);
      return;
    }
    setLoading(true);
    try {
      const rows = await fetchShelf(user.id);
      setEntries(Object.fromEntries(rows.map((row) => [row.book_id, row])));
      // Custom shelves need migration 004; the rest of the shelf works without it
      setCollections(await fetchCollections(user.id).catch(() => []));
    } catch (error) {
      toast.error(`Couldn't load your shelf: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const persist = async (entry) => {
    const changes = Object.fromEntries(EDITABLE_FIELDS.map((field) => [field, entry[field]]));
    const { error } = await supabase.from("shelf_entries").update(changes).eq("id", entry.id);
    if (error) toast.error(`Couldn't save: ${error.message}`);
  };

  const getEntry = (bookId) => entries[bookId] || null;

  // Update locally right away, then save after the reader pauses typing
  const updateEntry = (bookId, changes) => {
    const entry = { ...entriesRef.current[bookId], ...changes };
    entriesRef.current = { ...entriesRef.current, [bookId]: entry };
    setEntries(entriesRef.current);
    clearTimeout(pendingSaves.current[bookId]);
    pendingSaves.current[bookId] = setTimeout(() => persist(entry), SAVE_DELAY_MS);
  };

  const addToShelf = async (book, status = "read") => {
    const { data, error } = await supabase
      .from("shelf_entries")
      .insert({ book_id: book.id, status })
      .select("*, book:books(*)")
      .single();
    if (error) {
      toast.error(error.code === "23505" ? "Already on your shelf" : error.message);
      return null;
    }
    setEntries((current) => ({ ...current, [book.id]: data }));
    return data;
  };

  // Shelve several books in one request (used by the welcome flow)
  const addManyToShelf = async (books, status = "read") => {
    const fresh = books.filter((book) => !entriesRef.current[book.id]);
    if (fresh.length === 0) return [];
    const { data, error } = await supabase
      .from("shelf_entries")
      .insert(fresh.map((book) => ({ book_id: book.id, status })))
      .select("*, book:books(*)");
    if (error) {
      toast.error(error.message);
      return [];
    }
    setEntries((current) => ({ ...current, ...Object.fromEntries(data.map((row) => [row.book_id, row])) }));
    return data;
  };

  const removeFromShelf = async (bookId) => {
    const entry = entries[bookId];
    if (!entry) return;
    clearTimeout(pendingSaves.current[bookId]);
    const { error } = await supabase.from("shelf_entries").delete().eq("id", entry.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setEntries(({ [bookId]: _removed, ...rest }) => rest);
  };

  // Custom shelves ----------------------------------------------------------

  const newCollection = async (name) => {
    try {
      const collection = await createCollection(name.trim());
      setCollections((current) => [...current, collection]);
      return collection;
    } catch (error) {
      toast.error(error.code === "23505" ? "You already have a shelf with that name" : error.message);
      return null;
    }
  };

  const removeCollection = async (id) => {
    try {
      await deleteCollection(id);
      setCollections((current) => current.filter((collection) => collection.id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleInCollection = async (collectionId, entryId) => {
    const collection = collections.find((c) => c.id === collectionId);
    const isIn = collection.entryIds.includes(entryId);
    const update = (ids) =>
      setCollections((current) => current.map((c) => (c.id === collectionId ? { ...c, entryIds: ids(c.entryIds) } : c)));
    update((ids) => (isIn ? ids.filter((id) => id !== entryId) : [...ids, entryId]));
    try {
      await (isIn ? removeFromCollection(collectionId, entryId) : addToCollection(collectionId, entryId));
    } catch (error) {
      update((ids) => (isIn ? [...ids, entryId] : ids.filter((id) => id !== entryId)));
      toast.error(error.message);
    }
  };

  // Refresh the embedded book after its catalog details are edited
  const syncBook = (book) =>
    setEntries((current) => (current[book.id] ? { ...current, [book.id]: { ...current[book.id], book } } : current));

  return (
    <ReadingContext.Provider
      value={{
        entries,
        loading,
        getEntry,
        updateEntry,
        addToShelf,
        addManyToShelf,
        removeFromShelf,
        syncBook,
        reload,
        collections,
        newCollection,
        removeCollection,
        toggleInCollection,
      }}
    >
      {children}
    </ReadingContext.Provider>
  );
};

export const useReading = () => useContext(ReadingContext);
