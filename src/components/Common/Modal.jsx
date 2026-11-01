import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const EXIT_MS = 200;

// Animated dialog: centred card on larger screens, bottom sheet on phones.
// Closes on Escape, backdrop click or the close button, and plays an exit animation.
const Modal = ({ open, onClose, title, children, size = "max-w-md", hideClose = false }) => {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const panelRef = useRef(null);
  const previousFocus = useRef(null);
  // Read the latest onClose without re-running the open/close effects on every render
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return undefined;
    }
    if (!mounted) return undefined;
    setClosing(true);
    const timer = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(timer);
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return undefined;
    previousFocus.current = document.activeElement;
    const onKey = (e) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    // Keep the page behind still while the dialog is open
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previousFocus.current?.focus?.();
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <div
        className={`absolute inset-0 bg-black/45 backdrop-blur-[3px] ${
          closing ? "motion-safe:animate-fade-out" : "motion-safe:animate-fade-in"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative w-full ${size} max-h-[90vh] overflow-y-auto rounded-t-3xl border border-line bg-paper p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl outline-none sm:rounded-3xl sm:pb-6 ${
          closing ? "motion-safe:animate-sheet-out sm:motion-safe:animate-pop-out" : "motion-safe:animate-sheet-in sm:motion-safe:animate-pop-in"
        }`}
      >
        <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-ink/15 sm:hidden" aria-hidden="true" />
        {!hideClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink"
          >
            <i className="bx bx-x text-2xl"></i>
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
