import React, { useId, useState } from "react";

// Labelled input with an icon, inline hint or error, and a show/hide toggle for passwords
const Field = ({ label, icon, error, hint, type = "text", right, className = "", ...props }) => {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {right}
      </div>
      <div className="relative">
        {icon && <i className={`bx ${icon} pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-ink/40`}></i>}
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? `${id}-note` : undefined}
          className={`h-12 w-full rounded-xl border bg-card pr-4 text-[15px] transition placeholder:text-ink/35 focus:outline-none focus:ring-4 ${
            icon ? "pl-11" : "pl-4"
          } ${isPassword ? "pr-12" : ""} ${
            error ? "border-red-500/70 focus:ring-red-500/15" : "border-line focus:border-terra focus:ring-terra/15"
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink/50 hover:bg-ink/5 hover:text-ink"
          >
            <i className={`bx ${visible ? "bx-hide" : "bx-show"} text-xl`}></i>
          </button>
        )}
      </div>
      {(error || hint) && (
        <p id={`${id}-note`} className={`mt-1.5 text-xs ${error ? "text-red-600 dark:text-red-400" : "text-ink/55"}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
};

export default Field;
