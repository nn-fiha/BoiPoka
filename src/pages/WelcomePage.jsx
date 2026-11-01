import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useReading } from "../context/ReadingContext";
import { fetchCatalog, saveGoal, updateProfile } from "../lib/api";
import { usePageTitle } from "../hooks/usePageTitle";
import BookCover from "../components/Shelf/BookCover";
import VisibilityPicker, { visibilityChanges, visibilityOf } from "../components/Share/VisibilityPicker";

const STEPS = ["Welcome", "Your books", "Your goal", "Sharing"];
const GOAL_PRESETS = [6, 12, 24, 52];

// Remembers that this reader finished (or skipped) the intro on this device
export const welcomeKey = (userId) => `boipoka.welcomed.${userId}`;

export const hasSeenWelcome = (userId) => {
  try {
    return localStorage.getItem(welcomeKey(userId)) === "1";
  } catch {
    return true;
  }
};

const markWelcomed = (userId) => {
  try {
    localStorage.setItem(welcomeKey(userId), "1");
  } catch {
    // Without storage the intro may show again next time, which is harmless
  }
};

// A short guided intro for new readers: bio, first books, yearly goal and sharing
const WelcomePage = () => {
  const { user, profile, setProfile } = useAuth();
  const { addManyToShelf } = useReading();
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const [step, setStep] = useState(0);
  const [bio, setBio] = useState("");
  const [catalog, setCatalog] = useState(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState(() => new Set());
  const [goal, setGoal] = useState(12);
  const [visibility, setVisibility] = useState("public");
  const [busy, setBusy] = useState(false);

  usePageTitle("Welcome", { noindex: true });

  useEffect(() => {
    fetchCatalog().then(setCatalog).catch(() => setCatalog([]));
  }, []);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setVisibility(visibilityOf(profile));
    }
  }, [profile]);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (catalog || []).filter((book) => !term || `${book.title} ${book.author}`.toLowerCase().includes(term));
  }, [catalog, query]);

  if (!user) return <Navigate to="/login" replace />;
  if (!profile) return <p className="py-24 text-center text-ink/60">Getting your shelf ready…</p>;

  const name = profile.display_name || profile.username;

  const finish = () => {
    markWelcomed(user.id);
    navigate(`/u/${profile.username}`, { replace: true });
  };

  const togglePick = (id) =>
    setPicked((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Saves whatever the current step collected, then moves on
  const next = async () => {
    setBusy(true);
    try {
      if (step === 0 && bio.trim() !== (profile.bio || "")) {
        setProfile(await updateProfile(profile.id, { bio: bio.trim() || null }));
      }
      if (step === 1 && picked.size > 0) {
        const added = await addManyToShelf(catalog.filter((book) => picked.has(book.id)));
        if (added.length) toast.success(`${added.length} ${added.length === 1 ? "book" : "books"} on your shelf`);
      }
      if (step === 2 && goal > 0) {
        await saveGoal(user.id, year, goal);
      }
      if (step === 3) {
        setProfile(await updateProfile(profile.id, visibilityChanges(visibility)));
        toast.success("Your shelf is ready — অভিনন্দন!");
        finish();
        return;
      }
      setStep((s) => s + 1);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-14">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex flex-1 gap-1.5" aria-hidden="true">
          {STEPS.map((label, i) => (
            <span key={label} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-terra" : "bg-ink/10"}`} />
          ))}
        </div>
        <span className="text-xs text-ink/60" aria-live="polite">
          Step {step + 1} of {STEPS.length}
        </span>
        <button onClick={finish} className="-my-2 py-2 text-sm text-ink/60 hover:text-ink">
          Skip
        </button>
      </div>

      <div key={step} className="motion-safe:animate-fade-in">
        {step === 0 && (
          <section>
            <p className="font-bangla text-lg text-terra">স্বাগতম!</p>
            <h1 className="mt-1 font-serif text-3xl font-bold sm:text-4xl">Welcome to BoiPoka, {name}</h1>
            <p className="mt-3 text-ink/70">
              Let's set up your shelf in under a minute: a few books you've read, a goal for {year}, and who can see it.
            </p>
            <label className="mt-8 block text-sm font-medium" htmlFor="welcome-bio">
              A line about you as a reader <span className="font-normal text-ink/50">(optional)</span>
            </label>
            <input
              id="welcome-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={120}
              placeholder="যত বই পড়েছি, সব এক তাকে।"
              className="mt-1.5 h-12 w-full rounded-xl border border-line bg-card px-4 font-bangla focus:border-terra focus:outline-none focus:ring-4 focus:ring-terra/15"
            />
            <p className="mt-1.5 text-xs text-ink/50">Shown under your name on your shelf.</p>
          </section>
        )}

        {step === 1 && (
          <section>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">Which of these have you read?</h1>
            <p className="mt-3 text-ink/70">Tap the covers to put them on your shelf. You can add any other book later.</p>
            <div className="relative mt-6">
              <i className="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-lg text-ink/45"></i>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search books…"
                className="h-11 w-full rounded-full border border-line bg-card pl-11 pr-4 font-bangla focus:outline-none focus:ring-2 focus:ring-terra/40"
              />
            </div>
            {!catalog ? (
              <p className="py-12 text-center text-ink/60">Opening the library…</p>
            ) : (
              <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
                {matches.map((book) => {
                  const selected = picked.has(book.id);
                  return (
                    <li key={book.id}>
                      <button
                        onClick={() => togglePick(book.id)}
                        aria-pressed={selected}
                        aria-label={`${book.title} by ${book.author}`}
                        className="group block w-full text-left"
                      >
                        <span className="relative block">
                          <BookCover
                            book={book}
                            className={`aspect-[2/3] w-full rounded-md shadow-md transition ${
                              selected ? "ring-4 ring-terra ring-offset-2 ring-offset-paper" : "group-hover:-translate-y-0.5"
                            }`}
                          />
                          {selected && (
                            <span className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-terra text-cream shadow motion-safe:animate-pop-in">
                              <i className="bx bx-check text-xl"></i>
                            </span>
                          )}
                        </span>
                        <span className="mt-1.5 block truncate font-bangla text-xs sm:text-sm">{book.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {step === 2 && (
          <section>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">Set a {year} reading goal</h1>
            <p className="mt-3 text-ink/70">How many books would you like to finish this year? You can change it any time.</p>
            <div className="mt-8 flex items-center justify-center gap-5">
              <button
                onClick={() => setGoal((g) => Math.max(1, g - 1))}
                aria-label="One fewer book"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-2xl hover:bg-card"
              >
                <i className="bx bx-minus"></i>
              </button>
              <div className="text-center">
                <div className="font-serif text-6xl font-bold tabular-nums">{goal}</div>
                <div className="text-sm text-ink/60">books in {year}</div>
              </div>
              <button
                onClick={() => setGoal((g) => Math.min(1000, g + 1))}
                aria-label="One more book"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-2xl hover:bg-card"
              >
                <i className="bx bx-plus"></i>
              </button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {GOAL_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setGoal(preset)}
                  aria-pressed={goal === preset}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    goal === preset ? "border-terra bg-terra text-cream" : "border-line hover:bg-card"
                  }`}
                >
                  {preset} {preset === 52 ? "· one a week" : preset === 12 ? "· one a month" : ""}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">Who can see your shelf?</h1>
            <p className="mb-6 mt-3 text-ink/70">You can change this any time from the Share button on your shelf.</p>
            <VisibilityPicker value={visibility} onChange={setVisibility} disabled={busy} />
          </section>
        )}
      </div>

      {/* Actions stay at the bottom of the screen on phones */}
      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-10 flex gap-3 bg-paper/90 py-3 backdrop-blur sm:static sm:bg-transparent sm:py-0 sm:backdrop-blur-none">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={busy}
            className="h-12 rounded-xl border border-line px-5 font-medium hover:bg-card"
          >
            Back
          </button>
        )}
        <button
          onClick={next}
          disabled={busy}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-terra font-medium text-cream transition hover:bg-terra-dark disabled:opacity-70"
        >
          {busy && <i className="bx bx-loader-alt animate-spin text-lg"></i>}
          {step === 1
            ? picked.size
              ? `Add ${picked.size} ${picked.size === 1 ? "book" : "books"}`
              : "I'll add books later"
            : step === 3
              ? "Open my shelf"
              : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
