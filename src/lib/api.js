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
