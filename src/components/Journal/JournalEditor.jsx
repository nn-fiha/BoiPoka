import React from "react";
import { MOODS, STATUSES } from "../../context/ReadingContext";
import StarRating from "./StarRating";
import QuoteBook from "./QuoteBook";

const Section = ({ title, children }) => (
  <section className="mt-10">
    <h2 className="font-serif text-xl font-bold mb-3">{title}</h2>
    {children}
  </section>
);

// The signed-in reader's journal for one book; every change autosaves
const JournalEditor = ({ entry, onChange }) => {
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
            onClick={() => onChange({ status: key })}
            className={`rounded-full px-4 py-1.5 text-sm border transition ${
              entry.status === key ? `${status.color} text-white border-transparent` : "border-wood/25 hover:bg-card"
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
              className="mt-1 block rounded-md border border-wood/25 bg-card px-2 py-1 text-base normal-case tracking-normal text-ink"
            />
          </label>
        ))}
      </div>

      <Section title="How it felt">
        <div className="flex flex-wrap gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => toggleMood(mood)}
              className={`rounded-full px-3 py-1 text-sm border transition ${
                entry.moods.includes(mood) ? "bg-sage text-white border-sage" : "border-wood/25 hover:bg-card"
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </Section>

      <Section title="My thoughts">
        <textarea
          value={entry.review}
          onChange={(e) => onChange({ review: e.target.value })}
          rows={7}
          placeholder="বাংলায় বা English-এ — what stayed with you?"
          className="w-full rounded-lg border border-wood/25 bg-card p-4 font-bangla text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-wood/40"
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
