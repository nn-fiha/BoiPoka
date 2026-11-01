import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { deleteGoal, fetchGoal, saveGoal } from "../../lib/api";

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Yearly reading goal with a progress ring; editable on your own shelf
// undatedCount: read books with no finish date, which can't count towards any year
const GoalCard = ({ ownerId, year, finishedCount, editable, compact = false, undatedCount = 0, onDateUndated }) => {
  const [goal, setGoal] = useState(undefined);
  const [editing, setEditing] = useState(false);
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setGoal(undefined);
    fetchGoal(ownerId, year)
      .then((row) => !cancelled && setGoal(row))
      // The goals table may not exist yet if migration 003 hasn't been run
      .catch(() => !cancelled && setGoal(null));
    return () => {
      cancelled = true;
    };
  }, [ownerId, year]);

  if (goal === undefined) return null;
  if (!goal && !editable) return null;

  const startEditing = () => {
    setTarget(goal?.target ? String(goal.target) : "12");
    setEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const value = Number(target);
    if (!Number.isInteger(value) || value < 1 || value > 1000) {
      toast.error("Pick a goal between 1 and 1000 books");
      return;
    }
    setBusy(true);
    try {
      setGoal(await saveGoal(ownerId, year, value));
      setEditing(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      await deleteGoal(ownerId, year);
      setGoal(null);
      setEditing(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className={`flex h-full flex-wrap items-center gap-3 border border-line bg-card ${
          compact ? "rounded-lg px-4 py-2.5" : "rounded-2xl p-4 sm:p-5"
        }`}
      >
        <label className="flex items-center gap-2 text-sm">
          Read
          <input
            type="number"
            min="1"
            max="1000"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            autoFocus
            className="h-10 w-20 rounded-lg border border-line bg-paper px-3 text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-terra/40"
          />
          books in {year}
        </label>
        <div className="ml-auto flex gap-2">
          {goal && (
            <button type="button" onClick={handleRemove} disabled={busy} className="rounded-full px-3 py-1.5 text-sm text-ink/60 hover:text-ink">
              Remove
            </button>
          )}
          <button type="button" onClick={() => setEditing(false)} className="rounded-full px-3 py-1.5 text-sm text-ink/60 hover:text-ink">
            Cancel
          </button>
          <button disabled={busy} className="rounded-full bg-terra px-4 py-1.5 text-sm text-cream hover:bg-terra-dark disabled:opacity-60">
            Save goal
          </button>
        </div>
      </form>
    );
  }

  if (!goal) {
    return (
      <button
        onClick={startEditing}
        className={`flex h-full w-full items-center gap-4 border border-dashed border-line text-left hover:bg-card ${
          compact ? "rounded-lg px-4 py-2.5" : "rounded-2xl p-4 sm:p-5"
        }`}
      >
        <i className="bx bx-target-lock text-3xl text-terra"></i>
        <span>
          <span className="block font-medium">Set a {year} reading goal</span>
          <span className="block text-sm text-ink/60">
            {finishedCount} {finishedCount === 1 ? "book" : "books"} finished so far this year
          </span>
        </span>
      </button>
    );
  }

  const progress = Math.min(1, finishedCount / goal.target);
  const remaining = Math.max(0, goal.target - finishedCount);

  return (
    <div
      className={`flex h-full items-center gap-4 border border-line bg-card ${
        compact ? "rounded-lg px-3 py-2.5 sm:px-4" : "rounded-2xl p-4 sm:gap-5 sm:p-5"
      }`}
    >
      <svg viewBox="0 0 80 80" className={`${compact ? "h-12 w-12" : "h-20 w-20"} shrink-0 -rotate-90`} role="img" aria-label={`${finishedCount} of ${goal.target} books`}>
        <circle cx="40" cy="40" r={RADIUS} fill="none" strokeWidth="8" className="stroke-ink/[0.07]" />
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-terra transition-[stroke-dashoffset] duration-700"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
        />
      </svg>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wide text-ink/60 sm:text-xs">{year} reading goal</div>
        <div className={`font-serif font-bold tabular-nums ${compact ? "text-xl sm:text-2xl" : "text-2xl"}`}>
          {finishedCount} <span className="text-sm font-normal text-ink/60 sm:text-base">of {goal.target} books</span>
          {compact && (
            <span className="ml-2 font-poppins text-xs font-normal text-ink/60 sm:text-sm">
              · {remaining === 0 ? "Goal reached!" : `${remaining} to go`}
            </span>
          )}
        </div>
        {!compact && (
          <div className="text-sm text-ink/60">
            {remaining === 0 ? "Goal reached — অভিনন্দন!" : `${remaining} to go · ${Math.round(progress * 100)}%`}
          </div>
        )}
        {editable && undatedCount > 0 && (
          <div className="mt-0.5 text-xs text-ink/60">
            <i className="bx bx-info-circle align-middle text-terra"></i> {undatedCount} read{" "}
            {undatedCount === 1 ? "book has" : "books have"} no finish date, so {undatedCount === 1 ? "it isn't" : "they aren't"}{" "}
            counted.{" "}
            {onDateUndated && (
              <button onClick={onDateUndated} className="font-medium text-terra underline-offset-2 hover:underline">
                Use the date I added {undatedCount === 1 ? "it" : "them"}
              </button>
            )}
          </div>
        )}
      </div>
      {editable && (
        <button onClick={startEditing} className={`${compact ? "self-center" : "self-start"} text-ink/50 hover:text-ink`} aria-label="Edit goal">
          <i className="bx bx-edit text-xl"></i>
        </button>
      )}
    </div>
  );
};

export default GoalCard;
