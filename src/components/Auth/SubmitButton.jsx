import React from "react";

const SubmitButton = ({ busy, children, ...props }) => (
  <button
    disabled={busy}
    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-terra font-medium text-cream shadow-sm transition hover:bg-terra-dark active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
    {...props}
  >
    {busy && <i className="bx bx-loader-alt animate-spin text-lg"></i>}
    {children}
  </button>
);

export default SubmitButton;
