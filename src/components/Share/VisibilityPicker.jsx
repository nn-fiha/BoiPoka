import React from "react";

export const VISIBILITY = {
  public: {
    icon: "bx-globe",
    label: "Public",
    description: "Anyone can find your shelf and see your notes on book pages.",
  },
  link: {
    icon: "bx-link",
    label: "Anyone with the link",
    description: "Hidden from everyone else. Friends with your link can view it.",
  },
  private: {
    icon: "bx-lock-alt",
    label: "Only me",
    description: "Nobody else can see your shelf or notes.",
  },
};

export const visibilityOf = (profile) =>
  profile?.is_public ? "public" : profile?.share_enabled ? "link" : "private";

export const visibilityChanges = (key) => ({
  is_public: key === "public",
  share_enabled: key !== "private",
});

// Three radio cards for who can see a shelf
const VisibilityPicker = ({ value, onChange, disabled }) => (
  <div role="radiogroup" aria-label="Who can see your shelf" className="space-y-2">
    {Object.entries(VISIBILITY).map(([key, option]) => {
      const selected = value === key;
      return (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={selected}
          disabled={disabled}
          onClick={() => onChange(key)}
          className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition disabled:opacity-60 ${
            selected ? "border-terra bg-terra/[0.07] ring-1 ring-terra" : "border-line hover:bg-card"
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              selected ? "bg-terra text-cream" : "bg-ink/5 text-ink/60"
            }`}
          >
            <i className={`bx ${option.icon} text-lg`}></i>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{option.label}</span>
            <span className="block text-xs text-ink/60">{option.description}</span>
          </span>
          <span
            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
              selected ? "border-terra" : "border-ink/25"
            }`}
          >
            {selected && <span className="h-2.5 w-2.5 rounded-full bg-terra" />}
          </span>
        </button>
      );
    })}
  </div>
);

export default VisibilityPicker;
