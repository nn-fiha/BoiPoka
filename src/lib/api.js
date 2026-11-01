import { supabase } from "./supabase";

const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

export const fetchProfileByUsername = async (username) =>
  unwrap(await supabase.from("profiles").select("*").eq("username", username.toLowerCase()).maybeSingle());

export const fetchPublicProfiles = async (limit = 12) =>
  unwrap(
    await supabase
      .from("profiles")
      .select("username, display_name, bio, shelf_entries(count)")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(limit)
  );

export const fetchShelf = async (userId) =>
  unwrap(await supabase.from("shelf_entries").select("*, book:books(*)").eq("user_id", userId));

export const fetchCatalog = async () =>
  unwrap(await supabase.from("books").select("*").order("created_at", { ascending: true }));

export const fetchBook = async (id) => unwrap(await supabase.from("books").select("*").eq("id", id).maybeSingle());

// Other readers' notes on a book (RLS already hides private shelves)
export const fetchReaderNotes = async (bookId) =>
  unwrap(
    await supabase
      .from("shelf_entries")
      .select("id, rating, moods, review, quotes, updated_at, profile:profiles(username, display_name)")
      .eq("book_id", bookId)
      .order("updated_at", { ascending: false })
  );

export const searchCatalog = async (query) => {
  // Commas and parentheses would break the PostgREST filter syntax
  const term = query.replace(/[,()]/g, " ").trim();
  return unwrap(
    await supabase
      .from("books")
      .select("*")
      .or(`title.ilike.%${term}%,author.ilike.%${term}%`)
      .limit(10)
  );
};

export const findBookByOpenLibraryKey = async (key) =>
  unwrap(await supabase.from("books").select("*").eq("openlibrary_key", key).maybeSingle());

export const createBook = async (book) => unwrap(await supabase.from("books").insert(book).select().single());

export const updateProfile = async (id, changes) =>
  unwrap(await supabase.from("profiles").update(changes).eq("id", id).select().single());

// Open Library has good coverage of English books and some Bangla ones
export const searchOpenLibrary = async (query) => {
  const params = new URLSearchParams({
    q: query,
    limit: "10",
    fields: "key,title,author_name,cover_i,number_of_pages_median,publisher,isbn,language",
  });
  const response = await fetch(`https://openlibrary.org/search.json?${params}`);
  if (!response.ok) throw new Error("Open Library search failed");
  const { docs } = await response.json();
  return docs.map((doc) => ({
    openlibrary_key: doc.key,
    title: doc.title,
    author: doc.author_name?.join(", ") || "Unknown",
    pages: doc.number_of_pages_median || null,
    publisher: doc.publisher?.[0] || null,
    isbn: doc.isbn?.[0] || null,
    language: doc.language?.includes("ben") ? "Bangla" : doc.language?.includes("eng") ? "English" : null,
    cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
  }));
};

export const updateBook = async (id, changes) =>
  unwrap(await supabase.from("books").update(changes).eq("id", id).select().maybeSingle());

export const fetchGoal = async (userId, year) =>
  unwrap(await supabase.from("reading_goals").select("*").eq("user_id", userId).eq("year", year).maybeSingle());

export const saveGoal = async (userId, year, target) =>
  unwrap(
    await supabase
      .from("reading_goals")
      .upsert({ user_id: userId, year, target, updated_at: new Date().toISOString() })
      .select()
      .single()
  );

export const deleteGoal = async (userId, year) =>
  unwrap(await supabase.from("reading_goals").delete().eq("user_id", userId).eq("year", year));

// Custom shelves ------------------------------------------------------------

const toCollection = ({ collection_books: members = [], ...collection }) => ({
  ...collection,
  entryIds: members.map((member) => member.entry_id),
});

export const fetchCollections = async (userId) =>
  unwrap(
    await supabase
      .from("collections")
      .select("id, name, created_at, collection_books(entry_id)")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
  ).map(toCollection);

export const createCollection = async (name) =>
  toCollection(unwrap(await supabase.from("collections").insert({ name }).select("id, name, created_at").single()));

export const deleteCollection = async (id) => unwrap(await supabase.from("collections").delete().eq("id", id));

export const addToCollection = async (collectionId, entryId) =>
  unwrap(await supabase.from("collection_books").insert({ collection_id: collectionId, entry_id: entryId }));

export const removeFromCollection = async (collectionId, entryId) =>
  unwrap(
    await supabase.from("collection_books").delete().eq("collection_id", collectionId).eq("entry_id", entryId)
  );

// Recommendations -------------------------------------------------------------

// Books loved (4+ stars) by readers who also loved this one
export const fetchAlsoLoved = async (bookId) => {
  const rows = unwrap(await supabase.rpc("also_loved", { target_book: bookId, max_results: 6 }));
  if (rows.length === 0) return [];
  const books = unwrap(await supabase.from("books").select("*").in("id", rows.map((row) => row.book_id)));
  const byId = Object.fromEntries(books.map((book) => [book.id, book]));
  return rows.filter((row) => byId[row.book_id]).map((row) => ({ book: byId[row.book_id], readers: row.readers }));
};

// Fallback when nobody has rated the book yet: same author first, then same genre
export const fetchRelatedBooks = async (book) => {
  const sameAuthor = unwrap(
    await supabase.from("books").select("*").eq("author", book.author).neq("id", book.id).limit(6)
  );
  if (sameAuthor.length >= 3) return { reason: "author", books: sameAuthor };
  const sameGenre = unwrap(
    await supabase.from("books").select("*").eq("genre", book.genre).neq("id", book.id).limit(6 - sameAuthor.length)
  );
  const seen = new Set(sameAuthor.map((b) => b.id));
  return { reason: sameAuthor.length ? "mixed" : "genre", books: [...sameAuthor, ...sameGenre.filter((b) => !seen.has(b.id))] };
};

// Only public profiles are visible, so a private account's name can still collide at sign-up
export const isUsernameTaken = async (username) =>
  Boolean(unwrap(await supabase.from("profiles").select("id").eq("username", username.toLowerCase()).maybeSingle()));
