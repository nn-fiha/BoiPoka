import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useReading } from "../context/ReadingContext";
import { GENRES } from "../lib/genres";
import { createBook, findBookByOpenLibraryKey, searchCatalog, searchOpenLibrary } from "../lib/api";


const inputClass =
  "mt-1 w-full rounded-md border border-line bg-card px-3 py-2 font-bangla focus:outline-none focus:ring-2 focus:ring-terra/40";

const ResultRow = ({ book, onPick, busy, note }) => (
  <li className="flex items-center gap-4 rounded-lg border border-line bg-card/70 p-3">
    {book.cover_url ? (
      <img src={book.cover_url} alt="" className="h-20 w-14 rounded object-cover" />
    ) : (
      <div className="h-20 w-14 rounded bg-line" />
    )}
    <div className="min-w-0 flex-1">
      <div className="font-bangla font-semibold truncate">{book.title}</div>
      <div className="font-bangla text-sm text-ink/70 truncate">{book.author}</div>
      {note && <div className="text-xs text-ink/50">{note}</div>}
    </div>
    <button
      disabled={busy}
      onClick={() => onPick(book)}
      className="shrink-0 rounded-full bg-terra px-4 py-1.5 text-sm text-cream hover:bg-terra-dark disabled:opacity-50"
    >
      Add
    </button>
  </li>
);

const AddBookPage = () => {
  const { user } = useAuth();
  const { getEntry, addToShelf } = useReading();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [catalogResults, setCatalogResults] = useState([]);
  const [openLibraryResults, setOpenLibraryResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState({ title: "", author: "", genre: "Fiction", language: "Bangla", pages: "", cover_url: "" });

  const finish = async (book) => {
    if (getEntry(book.id)) {
      navigate(`/book/${book.id}`);
      return;
    }
    const entry = await addToShelf(book, "read");
    if (entry) {
      toast.success(`${book.title} is on your shelf`);
      navigate(`/book/${book.id}`);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    const [catalog, openLibrary] = await Promise.allSettled([searchCatalog(query.trim()), searchOpenLibrary(query.trim())]);
    setCatalogResults(catalog.status === "fulfilled" ? catalog.value : []);
    setOpenLibraryResults(openLibrary.status === "fulfilled" ? openLibrary.value : []);
    setSearched(true);
    setBusy(false);
  };

  const pickOpenLibrary = async (result) => {
    setBusy(true);
    try {
      // Reuse the catalog copy if someone already added this edition
      const existing = await findBookByOpenLibraryKey(result.openlibrary_key);
      const book = existing || (await createBook({ ...result, genre: "Uncategorized", created_by: user.id }));
      await finish(book);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const pickCatalog = async (book) => {
    setBusy(true);
    await finish(book);
    setBusy(false);
  };

  const handleManual = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const book = await createBook({
        title: manual.title.trim(),
        author: manual.author.trim(),
        genre: manual.genre,
        language: manual.language || null,
        pages: manual.pages ? Number(manual.pages) : null,
        cover_url: manual.cover_url.trim() || null,
        created_by: user.id,
      });
      await finish(book);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const setField = (field) => (e) => setManual({ ...manual, [field]: e.target.value });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <Link to="/" className="text-sm text-ink/60 hover:text-ink">
        <i className="bx bx-arrow-back align-middle"></i> My shelf
      </Link>
      <h1 className="mt-4 font-serif text-3xl sm:text-4xl font-bold">Add a book</h1>
      <p className="mt-2 text-ink/70">Search the BoiPoka library and Open Library, or add it by hand.</p>

      <form onSubmit={handleSearch} className="mt-8 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Title, author or ISBN — বাংলায়ও চলবে"
          className={`${inputClass} mt-0 flex-1 rounded-full px-4`}
        />
        <button disabled={busy} className="rounded-full bg-ink px-6 text-paper disabled:opacity-60">
          Search
        </button>
      </form>

      {searched && (
        <div className="mt-8 space-y-8">
          <section>
            <h2 className="font-serif text-lg font-bold mb-3">In the BoiPoka library</h2>
            {catalogResults.length === 0 ? (
              <p className="text-sm text-ink/60">Nothing yet.</p>
            ) : (
              <ul className="space-y-2">
                {catalogResults.map((book) => (
                  <ResultRow
                    key={book.id}
                    book={book}
                    busy={busy}
                    onPick={pickCatalog}
                    note={getEntry(book.id) ? "Already on your shelf" : null}
                  />
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="font-serif text-lg font-bold mb-3">From Open Library</h2>
            {openLibraryResults.length === 0 ? (
              <p className="text-sm text-ink/60">No matches. Many Bangla books aren't there — add it by hand below.</p>
            ) : (
              <ul className="space-y-2">
                {openLibraryResults.map((book) => (
                  <ResultRow key={book.openlibrary_key} book={book} busy={busy} onPick={pickOpenLibrary} />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      <section className="mt-12 rounded-lg border border-line bg-card/50 p-6">
        <h2 className="font-serif text-xl font-bold">Add by hand</h2>
        <form onSubmit={handleManual} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium sm:col-span-2">
            Title
            <input required value={manual.title} onChange={setField("title")} className={inputClass} />
          </label>
          <label className="text-sm font-medium">
            Author
            <input required value={manual.author} onChange={setField("author")} className={inputClass} />
          </label>
          <label className="text-sm font-medium">
            Genre
            <select value={manual.genre} onChange={setField("genre")} className={inputClass}>
              {GENRES.map((genre) => (
                <option key={genre}>{genre}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Language
            <select value={manual.language} onChange={setField("language")} className={inputClass}>
              <option>Bangla</option>
              <option>English</option>
              <option>Other</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Pages
            <input type="number" min="1" value={manual.pages} onChange={setField("pages")} className={inputClass} />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Cover image URL <span className="font-normal text-ink/50">(optional)</span>
            <input type="url" value={manual.cover_url} onChange={setField("cover_url")} className={inputClass} />
          </label>
          <button disabled={busy} className="sm:col-span-2 rounded-full bg-terra py-2.5 font-medium text-cream hover:bg-terra-dark disabled:opacity-60">
            Add to my shelf
          </button>
        </form>
      </section>
    </div>
  );
};

export default AddBookPage;
