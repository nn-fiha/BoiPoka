import React, { useState } from "react";
import { toast } from "react-toastify";

const QuoteBook = ({ quotes, onAdd, onRemove }) => {
  const [text, setText] = useState("");
  const [page, setPage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim(), page);
    setText("");
    setPage("");
    toast.success("Quote saved");
  };

  return (
    <div>
      {quotes.length > 0 && (
        <ul className="space-y-3 mb-5">
          {quotes.map((quote, index) => (
            <li key={index} className="group relative rounded-lg border-l-4 border-terra bg-card px-5 py-4">
              <blockquote className="font-bangla text-lg leading-relaxed">“{quote.text}”</blockquote>
              {quote.page && <div className="mt-1 text-sm text-ink/50">page {quote.page}</div>}
              <button
                onClick={() => onRemove(index)}
                aria-label="Remove quote"
                className="absolute top-2 right-2 text-ink/30 hover:text-red-700 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
              >
                <i className="bx bx-x text-xl"></i>
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A line worth remembering…"
          className="flex-1 rounded-md border border-line bg-card px-3 py-2 font-bangla focus:outline-none focus:ring-2 focus:ring-terra/40"
        />
        <input
          value={page}
          onChange={(e) => setPage(e.target.value)}
          placeholder="Page"
          inputMode="numeric"
          className="sm:w-20 rounded-md border border-line bg-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-terra/40"
        />
        <button className="rounded-md bg-terra px-4 py-2 text-cream hover:bg-terra-dark">Add quote</button>
      </form>
    </div>
  );
};

export default QuoteBook;
