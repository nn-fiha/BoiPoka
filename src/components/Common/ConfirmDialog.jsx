import React from "react";
import Modal from "./Modal";

// A styled replacement for window.confirm
const ConfirmDialog = ({ open, title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel }) => (
  <Modal open={open} onClose={onCancel} title={title} size="max-w-sm" hideClose>
    <div className="text-center sm:text-left">
      <div
        className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full sm:mx-0 ${
          danger ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-terra/10 text-terra"
        }`}
      >
        <i className={`bx ${danger ? "bx-trash" : "bx-question-mark"} text-2xl`}></i>
      </div>
      <h2 className="font-serif text-xl font-bold">{title}</h2>
      {message && <p className="mt-2 text-sm text-ink/70">{message}</p>}
    </div>
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button onClick={onCancel} className="rounded-full border border-line px-5 py-2.5 text-sm font-medium hover:bg-card">
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className={`rounded-full px-5 py-2.5 text-sm font-medium text-white transition ${
          danger ? "bg-red-600 hover:bg-red-700" : "bg-terra hover:bg-terra-dark"
        }`}
      >
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
