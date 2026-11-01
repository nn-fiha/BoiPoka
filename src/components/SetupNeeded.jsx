import React from "react";

// Shown when the Supabase keys are missing from .env
const SetupNeeded = () => (
  <div className="max-w-xl mx-auto px-4 py-20">
    <h1 className="font-serif text-3xl font-bold">BoiPoka needs its database</h1>
    <ol className="mt-6 list-decimal space-y-3 pl-5 text-ink/80">
      <li>Create a free project at supabase.com.</li>
      <li>
        In its SQL editor, run <code className="rounded bg-card px-1">supabase/migrations/001_init.sql</code>, then{" "}
        <code className="rounded bg-card px-1">supabase/seed.sql</code>.
      </li>
      <li>
        Copy <code className="rounded bg-card px-1">.env.example</code> to <code className="rounded bg-card px-1">.env</code> and
        fill in the project URL and anon key (Settings → API).
      </li>
      <li>Restart the dev server.</li>
    </ol>
  </div>
);

export default SetupNeeded;
