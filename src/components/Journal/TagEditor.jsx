import React, { useState } from "react";

const normalize = (tag) => tag.trim().replace(/^#/, "").replace(/\s+/g, " ").slice(0, 24);

// Free-form tags: type and press Enter (or comma) to add
const TagEditor = ({ tags, suggestions, onChange }) => {
  const [draft, setDraft] = useState("");

  const add = (value) => {
    const tag = normalize(value);
    if (tag && !tags.some((t) => t.toLowerCase() === tag.toLowerCase())) onChange([...tags, tag]);
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  const unused = suggestions.filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-card p-2 focus-within:ring-2 focus-within:ring-terra/40">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-full bg-terra/10 py-1 pl-3 pr-1.5 font-bangla text-sm text-terra-dark dark:text-terra-light">
            #{tag}
            <button onClick={() => onChange(tags.filter((t) => t !== tag))} aria-label={`Remove tag ${tag}`} className="rounded-full hover:bg-terra/20">
              <i className="bx bx-x text-base align-middle"></i>
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => draft && add(draft)}
          placeholder={tags.length ? "Add tag…" : "Add tags: liberation war, re-read, gift from Ma…"}
          className="min-w-[10rem] flex-1 bg-transparent px-2 py-1 font-bangla text-sm focus:outline-none"
        />
      </div>
      {unused.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
          <span className="text-ink/50">Your tags:</span>
          {unused.slice(0, 10).map((tag) => (
            <button key={tag} onClick={() => add(tag)} className="rounded-full border border-line px-2 py-0.5 font-bangla text-ink/70 hover:border-terra hover:text-terra">
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagEditor;
