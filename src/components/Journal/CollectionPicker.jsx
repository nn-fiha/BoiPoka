import React, { useState } from "react";
import { useReading } from "../../context/ReadingContext";

// Put a book on any of your own custom shelves, or make a new one
const CollectionPicker = ({ entryId }) => {
  const { collections, newCollection, toggleInCollection } = useReading();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const collection = await newCollection(name);
    if (collection) await toggleInCollection(collection.id, entryId);
    setName("");
    setAdding(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {collections.map((collection) => {
        const isIn = collection.entryIds.includes(entryId);
        return (
          <button
            key={collection.id}
            onClick={() => toggleInCollection(collection.id, entryId)}
            aria-pressed={isIn}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition ${
              isIn ? "border-sage bg-sage text-white" : "border-line hover:bg-card"
            }`}
          >
            <i className={`bx ${isIn ? "bx-check" : "bx-bookmark"}`}></i>
            {collection.name}
          </button>
        );
      })}
      {adding ? (
        <form onSubmit={handleCreate} className="flex items-center gap-1">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Shelf name"
            className="h-8 w-40 rounded-full border border-line bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40"
          />
          <button className="rounded-full bg-terra px-3 py-1 text-sm text-cream hover:bg-terra-dark">Add</button>
          <button type="button" onClick={() => setAdding(false)} className="px-2 text-sm text-ink/60" aria-label="Cancel">
            <i className="bx bx-x align-middle text-lg"></i>
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-full border border-dashed border-line px-3 py-1 text-sm text-ink/70 hover:border-terra hover:text-terra"
        >
          <i className="bx bx-plus"></i> New shelf
        </button>
      )}
    </div>
  );
};

export default CollectionPicker;
