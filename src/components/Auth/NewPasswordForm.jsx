import React, { useState } from "react";
import { friendlyAuthError, passwordStrength } from "../../lib/authErrors";
import Field from "./Field";
import SubmitButton from "./SubmitButton";

const STRENGTH_COLORS = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-sage", "bg-sage-dark dark:bg-sage-light"];

// New password + confirmation with a strength meter; used for resets and in Settings
const NewPasswordForm = ({ onSubmit, submitLabel = "Save new password" }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const strength = passwordStrength(password);

  const errors = {
    password: password.length < 8 ? "Use at least 8 characters." : null,
    confirm: confirm !== password ? "The passwords don't match." : null,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);
    if (errors.password || errors.confirm) return;
    setBusy(true);
    const { error: authError } = await onSubmit(password);
    setBusy(false);
    if (authError) setError(authError);
    else {
      setPassword("");
      setConfirm("");
      setSubmitted(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <Field
          label="New password"
          icon="bx-lock-alt"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={submitted && errors.password}
        />
        {password && (
          <div className="mt-2 flex items-center gap-3" aria-live="polite">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4].map((step) => (
                <span
                  key={step}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${strength.score >= step ? STRENGTH_COLORS[strength.score] : "bg-ink/10"}`}
                />
              ))}
            </div>
            <span className="w-16 text-right text-xs text-ink/60">{strength.label}</span>
          </div>
        )}
      </div>
      <Field
        label="Confirm password"
        icon="bx-lock"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={submitted && errors.confirm}
      />
      {error && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {friendlyAuthError(error)}
        </p>
      )}
      <SubmitButton busy={busy}>{submitLabel}</SubmitButton>
    </form>
  );
};

export default NewPasswordForm;
