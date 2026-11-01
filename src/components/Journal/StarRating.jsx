import React, { useState } from "react";

const StarRating = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onMouseEnter={() => setHovered(star)}
          // Clicking the current rating again clears it
          onClick={() => onChange(star === value ? 0 : star)}
          className={`text-3xl leading-none transition ${shown >= star ? "text-yellow-500" : "text-ink/20"}`}
        >
          <i className={`bx ${shown >= star ? "bxs-star" : "bx-star"}`}></i>
        </button>
      ))}
    </div>
  );
};

export default StarRating;
