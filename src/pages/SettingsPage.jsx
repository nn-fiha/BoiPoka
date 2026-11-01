import React, { useState } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../lib/api";
import NewPasswordForm from "../components/Auth/NewPasswordForm";
import VisibilityPicker, { visibilityChanges, visibilityOf } from "../components/Share/VisibilityPicker";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-card px-3 py-2 font-bangla focus:outline-none focus:ring-2 focus:ring-terra/40";

const SettingsPage = () => {
  const { user, profile, setProfile, updatePassword } = useAuth();
  const [form, setForm] = useState({
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    visibility: visibilityOf(profile),
    research_consent: profile?.research_consent ?? false,
  });
  const [busy, setBusy] = useState(false);
  usePageTitle("Settings", { noindex: true });

  if (!profile) return <p className="py-24 text-center text-ink/60">Loading…</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { visibility, ...fields } = form;
      setProfile(await updateProfile(profile.id, { ...fields, ...visibilityChanges(visibility) }));
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

        <div>
          <div className="mb-2 text-sm font-medium">Who can see your shelf</div>
          <VisibilityPicker value={form.visibility} onChange={(visibility) => setForm({ ...form, visibility })} />
          <p className="mt-2 text-xs text-ink/50">Get your share link from the Share button on your shelf.</p>
        </div>

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

      <section className="mt-14 border-t border-line pt-10">
        <h2 className="font-serif text-2xl font-bold">Account</h2>
        <p className="mt-1 text-sm text-ink/60">
          Signed in as <span className="font-medium text-ink">{user?.email}</span>
        </p>
        <h3 className="mb-4 mt-8 font-medium">Change password</h3>
        <NewPasswordForm
          submitLabel="Update password"
          onSubmit={async (password) => {
            const result = await updatePassword(password);
            if (!result.error) toast.success("Password updated");
            return result;
          }}
        />
      </section>
    </div>
  );
};

export default SettingsPage;
