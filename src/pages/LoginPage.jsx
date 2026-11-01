import React, { useState } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "mt-1 w-full rounded-md border border-wood/25 bg-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wood/40";

const LoginPage = () => {
  const { user, signIn, signUp } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get("mode") === "signup" ? "signup" : "signin");
  const [form, setForm] = useState({ email: "", password: "", username: "", displayName: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={location.state?.from || "/"} replace />;

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (mode === "signup" && !/^[a-z0-9_]{3,24}$/i.test(form.username)) {
      setError("Username: 3–24 letters, numbers or underscores.");
      return;
    }
    setBusy(true);
    const { data, error: authError } = mode === "signup" ? await signUp(form) : await signIn(form);
    setBusy(false);
    if (authError) {
      // The profile trigger fails when the username is already taken
      setError(authError.message.includes("Database error") ? "That username is taken." : authError.message);
    } else if (mode === "signup" && !data.session) {
      setMessage("Check your email to confirm your account, then sign in.");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
      <h1 className="font-serif text-4xl font-bold">{mode === "signup" ? "Start your shelf" : "Welcome back"}</h1>
      <p className="mt-2 font-bangla text-ink/70">{mode === "signup" ? "নতুন তাক বানাও" : "আবার স্বাগতম"}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {mode === "signup" && (
          <>
            <label className="block text-sm font-medium">
              Username
              <input required value={form.username} onChange={set("username")} className={inputClass} placeholder="fiha" />
              <span className="text-xs text-ink/50">Your shelf will live at /u/{form.username || "username"}</span>
            </label>
            <label className="block text-sm font-medium">
              Display name
              <input value={form.displayName} onChange={set("displayName")} className={inputClass} />
            </label>
          </>
        )}
        <label className="block text-sm font-medium">
          Email
          <input required type="email" value={form.email} onChange={set("email")} className={inputClass} autoComplete="email" />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            required
            type="password"
            minLength={6}
            value={form.password}
            onChange={set("password")}
            className={inputClass}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        </label>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/60 dark:text-red-200">{error}</p>}
        {message && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">{message}</p>}

        <button disabled={busy} className="w-full rounded-full bg-wood py-3 font-medium text-cream hover:bg-wood-dark disabled:opacity-60">
          {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/70">
        {mode === "signup" ? "Already have a shelf?" : "New here?"}{" "}
        <button
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setError("");
            setMessage("");
          }}
          className="font-medium text-wood underline"
        >
          {mode === "signup" ? "Sign in" : "Create an account"}
        </button>
      </p>
    </div>
  );
};

export default LoginPage;
