import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../lib/api";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-card px-3 py-2 font-bangla focus:outline-none focus:ring-2 focus:ring-terra/40";

const SettingsPage = () => {
  const { profile, setProfile } = useAuth();
  const [form, setForm] = useState({
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    is_public: profile?.is_public ?? true,
    research_consent: profile?.research_consent ?? false,
  });
  const [busy, setBusy] = useState(false);

  if (!profile) return <p className="py-24 text-center text-ink/60">Loading…</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      setProfile(await updateProfile(profile.id, form));
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold">Settings</h1>
      <p className="mt-1 text-ink/60">@{profile.username}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block text-sm font-medium">
          Display name
          <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className={inputClass} />
        </label>
        <label className="block text-sm font-medium">
          A line about you as a reader
          <input
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            maxLength={120}
            placeholder="যত বই পড়েছি, সব এক তাকে।"
            className={inputClass}
          />
        </label>

        <label className="flex gap-3 rounded-lg border border-line bg-card/60 p-4">
          <input
            type="checkbox"
            checked={form.is_public}
            onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
            className="mt-1 h-4 w-4 accent-terra"
          />
          <span>
            <span className="font-medium">Public shelf</span>
            <span className="block text-sm text-ink/60">
              Anyone can see your shelf and your notes on book pages. Turn off to keep everything private.
            </span>
          </span>
        </label>

        <label className="flex gap-3 rounded-lg border border-line bg-card/60 p-4">
          <input
            type="checkbox"
            checked={form.research_consent}
            onChange={(e) => setForm({ ...form, research_consent: e.target.checked })}
            className="mt-1 h-4 w-4 accent-terra"
          />
          <span>
            <span className="font-medium">Help Bangla language research</span>
            <span className="block text-sm text-ink/60">
              Allow your reviews, moods and ratings to be included — anonymised, without your name or username — in a
              research dataset on how readers feel about books. You can turn this off any time.
            </span>
          </span>
        </label>

        <button disabled={busy} className="rounded-full bg-terra px-6 py-2.5 font-medium text-cream hover:bg-terra-dark disabled:opacity-60">
          Save
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
