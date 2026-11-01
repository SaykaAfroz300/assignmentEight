"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Custom confirmation modal dialog (never uses native browser alert/confirm). */
export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Keep It",
  danger = true,
  busy = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          className="fixed inset-0 z-50 grid place-items-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !busy && onClose()}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2 }}
            className="card-surface glow-border relative z-10 w-full max-w-md p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close dialog"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-base-content/15 text-base-content/70 transition hover:border-primary hover:text-base-content"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-4">
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
                  danger ? "bg-error/15 text-error" : "bg-primary/15 text-primary"
                }`}
              >
                <AlertTriangle size={22} />
              </span>
              <div className="pr-6">
                <h3 id="confirm-modal-title" className="font-display text-xl font-bold text-base-content">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-base-content/70">{description}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="btn-outline-brand btn-sm"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className={
                  danger
                    ? "inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-error px-5 text-sm font-semibold text-error-content transition hover:brightness-110 disabled:opacity-50"
                    : "btn-brand btn-brand-sm"
                }
              >
                {busy && <Loader2 size={16} className="animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

