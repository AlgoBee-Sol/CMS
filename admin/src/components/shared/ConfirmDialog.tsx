"use client";

import { useState, useRef, useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  confirmText?: string; // When set, user must type this to confirm
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel",
  danger = true, confirmText, isPending, onConfirm, onCancel,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTyped("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const canConfirm = !confirmText || typed === confirmText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          {danger && (
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-bold text-lg" style={{ color: "var(--color-neutral-900)" }}>{title}</h3>
            <p className="mt-1.5 text-sm" style={{ color: "var(--color-neutral-600)" }}>{description}</p>

            {confirmText && (
              <div className="mt-4">
                <p className="text-xs mb-1.5" style={{ color: "var(--color-neutral-600)" }}>
                  Type <strong className="font-mono bg-slate-100 px-1 rounded">{confirmText}</strong> to confirm:
                </p>
                <input
                  ref={inputRef}
                  type="text"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-red-400"
                  style={{ borderColor: "var(--color-neutral-200)" }}
                  placeholder={confirmText}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-slate-50"
            style={{ borderColor: "var(--color-neutral-200)", color: "var(--color-neutral-600)" }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm || isPending}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: danger ? "var(--color-danger)" : "var(--color-primary-600)" }}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
