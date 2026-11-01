import React from "react";
import { MOODS, STATUSES } from "../../context/ReadingContext";
import StarRating from "./StarRating";
import QuoteBook from "./QuoteBook";
import ReadingProgress from "./ReadingProgress";
import TagEditor from "./TagEditor";
import CollectionPicker from "./CollectionPicker";

const Section = ({ title, children }) => (
  <section className="mt-10">
    <h2 className="font-serif text-xl font-bold mb-3">{title}</h2>
    {children}
  </section>
);

// Today's date as YYYY-MM-DD in the reader's own time zone
const today = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

// The signed-in reader's journal for one book; every change autosaves
const JournalEditor = ({ entry, book, tagSuggestions = [], onChange }) => {
  // Moving a book along fills in the obvious date, without overwriting one the reader set
  const changeStatus = (status) =>
    onChange({
      status,
      ...(status === "reading" && !entry.started_at && { started_at: today() }),
      ...(status === "read" && entry.status !== "read" && !entry.finished_at && { finished_at: today() }),
      ...(status === "read" && book.pages && { current_page: book.pages }),
    });

  const toggleMood = (mood) =>
    onChange({
      moods: entry.moods.includes(mood) ? entry.moods.filter((m) => m !== mood) : [...entry.moods, mood],
    });

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {Object.entries(STATUSES).map(([key, status]) => (
          <button
            key={key}
            onClick={() => changeStatus(key)}
            className={`rounded-full px-4 py-1.5 text-sm border transition ${
              entry.status === key ? `${status.color} text-white border-transparent` : "border-line hover:bg-card"
            }`}
          >
            {status.label} <span className="font-bangla opacity-80">· {status.bangla}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-5">
        <div>
          <div className="text-xs uppercase tracking-wide text-ink/60 mb-1">My rating</div>
          <StarRating value={entry.rating} onChange={(rating) => onChange({ rating })} />
        </div>
        {[
          ["started_at", "Started"],
          ["finished_at", "Finished"],
        ].map(([field, label]) => (
          <label key={field} className="text-xs uppercase tracking-wide text-ink/60">
            {label}
            <input
              type="date"
              value={entry[field] || ""}
              onChange={(e) => onChange({ [field]: e.target.value || null })}
              className="mt-1 block rounded-md border border-line bg-card px-2 py-1 text-base normal-case tracking-normal text-ink"
            />
          </label>
        ))}
      </div>

      {entry.status === "reading" && (
        <Section title="Reading progress">
          <ReadingProgress
            currentPage={entry.current_page}
            totalPages={book.pages}
            onChange={(current_page) => onChange({ current_page })}
          />
        </Section>
      )}

      <Section title="How it felt">
        <div className="flex flex-wrap gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => toggleMood(mood)}
              className={`rounded-full px-3 py-1 text-sm border transition ${
                entry.moods.includes(mood) ? "bg-sage text-white border-sage" : "border-line hover:bg-card"
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </Section>

      <Section title="My shelves">
        <CollectionPicker entryId={entry.id} />
      </Section>

      <Section title="Tags">
        <TagEditor tags={entry.tags || []} suggestions={tagSuggestions} onChange={(tags) => onChange({ tags })} />
      </Section>

      <Section title="My thoughts">
        <textarea
          value={entry.review}
          onChange={(e) => onChange({ review: e.target.value })}
          rows={7}
          placeholder="বাংলায় বা English-এ — what stayed with you?"
          className="w-full rounded-lg border border-line bg-card p-4 font-bangla text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-terra/40"
        />
        <p className="mt-1 text-xs text-ink/50">Saved automatically.</p>
      </Section>

      <Section title="Quotes I loved">
        <QuoteBook
          quotes={entry.quotes}
          onAdd={(text, page) => onChange({ quotes: [...entry.quotes, { text, page }] })}
          onRemove={(index) => onChange({ quotes: entry.quotes.filter((_, i) => i !== index) })}
        />
      </Section>
    </>
  );
};

export default JournalEditor;
