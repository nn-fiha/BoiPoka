import React, { useState } from "react";
import { toast } from "react-toastify";
import { updateBook } from "../../lib/api";
import { GENRES } from "../../lib/genres";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-card px-2 py-1.5 font-bangla text-sm focus:outline-none focus:ring-2 focus:ring-terra/40";

const FIELDS = ["title", "author", "genre", "language", "pages", "publisher", "isbn", "cover_url"];

// Lets a reader correct a book's catalog details
const BookDetailsForm = ({ book, onSaved, onCancel }) => {
  const [form, setForm] = useState(() => Object.fromEntries(FIELDS.map((field) => [field, book[field] ?? ""])));
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  // Keep the book's current genre selectable even if it isn't in the standard list
  const genres = GENRES.includes(form.genre) || !form.genre ? GENRES : [form.genre, ...GENRES];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const changes = Object.fromEntries(
        FIELDS.map((field) => [field, typeof form[field] === "string" ? form[field].trim() || null : form[field]])
      );
      changes.pages = changes.pages ? Number(changes.pages) : null;
      changes.genre = changes.genre || "Uncategorized";
      const saved = await updateBook(book.id, changes);
      // Row-level security silently skips the update when you aren't allowed to edit
      if (!saved) throw new Error("You can edit books you added or have on your shelf.");
      toast.success("Book details updated");
      onSaved(saved);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="motion-safe:animate-pop-in mt-6 space-y-3 rounded-lg border border-line bg-card/60 p-4">
      <label className="block text-xs font-medium text-ink/70">
        Title
        <input required value={form.title} onChange={set("title")} className={inputClass} />
      </label>
      <label className="block text-xs font-medium text-ink/70">
        Author
        <input required value={form.author} onChange={set("author")} className={inputClass} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs font-medium text-ink/70">
          Genre
          <select value={form.genre} onChange={set("genre")} className={inputClass}>
            {genres.map((genre) => (
              <option key={genre}>{genre}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-ink/70">
          Pages
          <input type="number" min="1" value={form.pages} onChange={set("pages")} className={inputClass} />
        </label>
        <label className="block text-xs font-medium text-ink/70">
          Language
          <input value={form.language} onChange={set("language")} className={inputClass} placeholder="Bangla" />
        </label>
        <label className="block text-xs font-medium text-ink/70">
          ISBN
          <input value={form.isbn} onChange={set("isbn")} className={inputClass} />
        </label>
      </div>
      <label className="block text-xs font-medium text-ink/70">
        Publisher
        <input value={form.publisher} onChange={set("publisher")} className={inputClass} />
      </label>
      <label className="block text-xs font-medium text-ink/70">
        Cover image URL
        <input type="url" value={form.cover_url} onChange={set("cover_url")} className={inputClass} placeholder="https://…" />
      </label>
      <div className="flex gap-2 pt-1">
        <button disabled={busy} className="rounded-full bg-terra px-4 py-1.5 text-sm text-cream hover:bg-terra-dark disabled:opacity-60">
          {busy ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full px-4 py-1.5 text-sm hover:bg-card">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default BookDetailsForm;
