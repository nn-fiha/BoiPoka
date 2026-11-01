import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { useAuth } from "../context/AuthContext";
import { isUsernameTaken } from "../lib/api";
import { friendlyAuthError, passwordStrength } from "../lib/authErrors";
import AuthLayout from "../components/Auth/AuthLayout";
import Field from "../components/Auth/Field";
import SubmitButton from "../components/Auth/SubmitButton";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;
const RESEND_COOLDOWN = 60;
// Google sign-in needs the provider switched on in Supabase first
const GOOGLE_ENABLED = import.meta.env.VITE_AUTH_GOOGLE === "true";

const STRENGTH_COLORS = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-sage", "bg-sage-dark dark:bg-sage-light"];

const Heading = ({ title, bangla, children }) => (
  <div className="mb-8">
    <h1 className="font-serif text-3xl font-bold sm:text-4xl">{title}</h1>
    {bangla && <p className="mt-1 font-bangla text-ink/60">{bangla}</p>}
    {children && <p className="mt-3 text-sm text-ink/70">{children}</p>}
  </div>
);

const Alert = ({ tone = "error", children }) => (
  <div
    role={tone === "error" ? "alert" : "status"}
    className={`flex gap-2.5 rounded-xl px-4 py-3 text-sm motion-safe:animate-fade-in ${
      tone === "error"
        ? "bg-red-500/10 text-red-700 dark:text-red-300"
        : "bg-sage/15 text-sage-dark dark:text-sage-light"
    }`}
  >
    <i className={`bx ${tone === "error" ? "bx-error-circle" : "bx-check-circle"} mt-0.5 text-lg`}></i>
    <div>{children}</div>
  </div>
);

const Divider = () => (
  <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-ink/40">
    <span className="h-px flex-1 bg-line" />
    or
    <span className="h-px flex-1 bg-line" />
  </div>
);

const LoginPage = () => {
  const { user, signIn, signUp, sendPasswordReset, sendMagicLink, resendConfirmation, signInWithGoogle } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = ["signup", "forgot", "magic"].includes(searchParams.get("mode")) ? searchParams.get("mode") : "signin";

  const [form, setForm] = useState({ email: "", password: "", username: "", displayName: "" });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  // After an email goes out: { kind: "confirm" | "reset" | "magic", email }
  const [sent, setSent] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [usernameStatus, setUsernameStatus] = useState(null);

  usePageTitle({ signin: "Sign in", signup: "Create your shelf", forgot: "Reset password", magic: "Email sign-in link" }[mode]);

  // Count down before another email can be requested
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Live username availability, debounced while typing
  useEffect(() => {
    if (mode !== "signup") return undefined;
    const name = form.username.toLowerCase();
    if (!USERNAME_PATTERN.test(name)) {
      setUsernameStatus(null);
      return undefined;
    }
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      try {
        setUsernameStatus((await isUsernameTaken(name)) ? "taken" : "available");
      } catch {
        setUsernameStatus(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [form.username, mode]);

  if (user && !sent) return <Navigate to={location.state?.from || "/"} replace />;

  const switchMode = (next) => {
    setSearchParams(next === "signin" ? {} : { mode: next }, { replace: true, state: location.state });
    setError(null);
    setTouched({});
    setSent(null);
  };

  // Functional updates so autofill filling several fields at once doesn't drop any
  const set = (field) => (e) => {
    const { value } = e.target;
    setForm((current) => ({ ...current, [field]: value }));
  };
  const blur = (field) => () => setTouched((current) => ({ ...current, [field]: true }));

  const strength = passwordStrength(form.password);
  const errors = {
    email: !EMAIL_PATTERN.test(form.email.trim()) ? "Enter a valid email address." : null,
    password:
      mode === "signup"
        ? form.password.length < 8
          ? "Use at least 8 characters."
          : null
        : !form.password
          ? "Enter your password."
          : null,
    username: !USERNAME_PATTERN.test(form.username.toLowerCase())
      ? "3–24 characters: lowercase letters, numbers or _."
      : usernameStatus === "taken"
        ? "That username is taken."
        : null,
  };
  const show = (field) => (touched[field] || touched.submit) && errors[field];

  const run = async (fields, action) => {
    setTouched((current) => ({ ...current, submit: true }));
    setError(null);
    if (fields.some((field) => errors[field])) return;
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const email = form.email.trim();
  const unwrap = async (promise) => {
    const { data, error: authError } = await promise;
    if (authError) throw authError;
    return data;
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    run(["email", "password"], () => unwrap(signIn({ email, password: form.password })));
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    run(["email", "password", "username"], async () => {
      const data = await unwrap(signUp({ ...form, email }));
      // No session means Supabase is waiting for the email to be confirmed
      if (!data.session) {
        setSent({ kind: "confirm", email });
        setCooldown(RESEND_COOLDOWN);
      }
    });
  };

  const handleForgot = (e) => {
    e.preventDefault();
    run(["email"], async () => {
      await unwrap(sendPasswordReset(email));
      setSent({ kind: "reset", email });
      setCooldown(RESEND_COOLDOWN);
    });
  };

  const handleMagic = (e) => {
    e.preventDefault();
    run(["email"], async () => {
      await unwrap(sendMagicLink(email));
      setSent({ kind: "magic", email });
      setCooldown(RESEND_COOLDOWN);
    });
  };

  const resend = async (target) => {
    setBusy(true);
    setError(null);
    try {
      const action =
        target.kind === "confirm"
          ? resendConfirmation(target.email)
          : target.kind === "reset"
            ? sendPasswordReset(target.email)
            : sendMagicLink(target.email);
      await unwrap(action);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const { error: authError } = await signInWithGoogle();
    if (authError) setError(authError);
  };

  const needsConfirmation = error && (error.code === "email_not_confirmed" || /not confirmed/i.test(error.message));

  // "Check your inbox" screen -----------------------------------------------
  if (sent) {
    const copy = {
      confirm: ["Confirm your email", "Tap the link we sent to finish creating your shelf."],
      reset: ["Check your inbox", "We sent a link to choose a new password. It expires in an hour."],
      magic: ["Check your inbox", "Tap the link we sent to sign in — no password needed."],
    }[sent.kind];

    return (
      <AuthLayout>
        <div className="text-center motion-safe:animate-pop-in">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-terra/10 text-terra">
            <i className="bx bx-envelope text-4xl"></i>
          </div>
          <h1 className="font-serif text-3xl font-bold">{copy[0]}</h1>
          <p className="mt-3 text-ink/70">{copy[1]}</p>
          <p className="mt-1 font-medium">{sent.email}</p>

          <div className="mt-8 space-y-3">
            {error && <Alert>{friendlyAuthError(error)}</Alert>}
            <button
              onClick={() => resend(sent)}
              disabled={busy || cooldown > 0}
              className="h-12 w-full rounded-xl border border-line font-medium transition hover:bg-card disabled:opacity-60"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
            </button>
            <button onClick={() => switchMode("signin")} className="text-sm text-terra hover:underline">
              Back to sign in
            </button>
          </div>
          <p className="mt-8 text-xs text-ink/50">Can't find it? Check your spam or promotions folder.</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div key={mode} className="motion-safe:animate-fade-in">
        {mode === "signin" && (
          <>
            <Heading title="Welcome back" bangla="আবার স্বাগতম" />
            <form onSubmit={handleSignIn} noValidate className="space-y-4">
              <Field
                label="Email"
                icon="bx-envelope"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                onBlur={blur("email")}
                error={show("email")}
                autoFocus
              />
              <Field
                label="Password"
                icon="bx-lock-alt"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={form.password}
                onChange={set("password")}
                onBlur={blur("password")}
                error={show("password")}
                right={
                  <button type="button" onClick={() => switchMode("forgot")} className="text-xs font-medium text-terra hover:underline">
                    Forgot password?
                  </button>
                }
              />
              {error && (
                <Alert>
                  {friendlyAuthError(error)}
                  {needsConfirmation && (
                    <button
                      type="button"
                      onClick={() => {
                        setSent({ kind: "confirm", email });
                        resend({ kind: "confirm", email });
                      }}
                      className="ml-1 font-medium underline"
                    >
                      Resend confirmation
                    </button>
                  )}
                </Alert>
              )}
              <SubmitButton busy={busy}>Sign in</SubmitButton>
            </form>

            <Divider />
            <div className="space-y-3">
              <button
                onClick={() => switchMode("magic")}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line font-medium transition hover:bg-card"
              >
                <i className="bx bx-mail-send text-lg"></i> Email me a sign-in link
              </button>
              {GOOGLE_ENABLED && (
                <button
                  onClick={handleGoogle}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line font-medium transition hover:bg-card"
                >
                  <i className="bx bxl-google text-xl"></i> Continue with Google
                </button>
              )}
            </div>

            <p className="mt-8 text-center text-sm text-ink/70">
              New to BoiPoka?{" "}
              <button onClick={() => switchMode("signup")} className="font-medium text-terra hover:underline">
                Create your shelf
              </button>
            </p>
          </>
        )}

        {mode === "signup" && (
          <>
            <Heading title="Create your shelf" bangla="নতুন তাক বানাও">
              Free forever. Keep a journal for every book you read.
            </Heading>
            <form onSubmit={handleSignUp} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Display name"
                  icon="bx-user"
                  autoComplete="name"
                  placeholder="Fiha"
                  value={form.displayName}
                  onChange={set("displayName")}
                />
                <Field
                  label="Username"
                  icon="bx-at"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="fiha"
                  value={form.username}
                  onChange={(e) => {
                    const username = e.target.value.toLowerCase().replace(/\s/g, "");
                    setForm((current) => ({ ...current, username }));
                  }}
                  onBlur={blur("username")}
                  // A taken name is worth flagging while they type, not only after they leave the field
                  error={show("username") || (usernameStatus === "taken" ? "That username is taken." : null)}
                  hint={
                    usernameStatus === "available"
                      ? `✓ boipoka/u/${form.username} is yours`
                      : usernameStatus === "checking"
                        ? "Checking…"
                        : "Your shelf's web address"
                  }
                />
              </div>
              <Field
                label="Email"
                icon="bx-envelope"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                onBlur={blur("email")}
                error={show("email")}
              />
              <div>
                <Field
                  label="Password"
                  icon="bx-lock-alt"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={set("password")}
                  onBlur={blur("password")}
                  error={show("password")}
                />
                {form.password && (
                  <div className="mt-2 flex items-center gap-3" aria-live="polite">
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <span
                          key={step}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            strength.score >= step ? STRENGTH_COLORS[strength.score] : "bg-ink/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="w-16 text-right text-xs text-ink/60">{strength.label}</span>
                  </div>
                )}
              </div>
              {error && <Alert>{friendlyAuthError(error)}</Alert>}
              <SubmitButton busy={busy}>Create account</SubmitButton>
              <p className="text-center text-xs text-ink/50">
                Your shelf is public by default — you can make it private any time in Settings.
              </p>
            </form>
            <p className="mt-8 text-center text-sm text-ink/70">
              Already have a shelf?{" "}
              <button onClick={() => switchMode("signin")} className="font-medium text-terra hover:underline">
                Sign in
              </button>
            </p>
          </>
        )}

        {(mode === "forgot" || mode === "magic") && (
          <>
            <button onClick={() => switchMode("signin")} className="mb-6 text-sm text-ink/60 hover:text-ink">
              <i className="bx bx-arrow-back align-middle"></i> Back to sign in
            </button>
            <Heading
              title={mode === "forgot" ? "Forgot your password?" : "Sign in with a link"}
              bangla={mode === "forgot" ? "পাসওয়ার্ড ভুলে গেছ?" : null}
            >
              {mode === "forgot"
                ? "Enter your email and we'll send you a link to choose a new one."
                : "We'll email you a one-time link — no password needed."}
            </Heading>
            <form onSubmit={mode === "forgot" ? handleForgot : handleMagic} noValidate className="space-y-4">
              <Field
                label="Email"
                icon="bx-envelope"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                onBlur={blur("email")}
                error={show("email")}
                autoFocus
              />
              {error && <Alert>{friendlyAuthError(error)}</Alert>}
              <SubmitButton busy={busy}>{mode === "forgot" ? "Send reset link" : "Email me a link"}</SubmitButton>
            </form>
          </>
        )}
      </div>

      <p className="mt-10 text-center text-xs text-ink/40">
        <Link to="/library" className="hover:text-ink/70">
          Browse the library without an account →
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
