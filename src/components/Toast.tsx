"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertIcon, CheckIcon, XIcon } from "./icons";

type Tone = "success" | "error";

interface Toast {
  id: number;
  tone: Tone;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const AUTO_DISMISS_MS = 4500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (tone: Tone, message: string) => {
      const id = ++nextId.current;
      setToasts((all) => [...all.slice(-2), { id, tone, message }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-[calc(max(env(safe-area-inset-bottom),16px)+64px)] z-[60] flex flex-col items-stretch gap-2 md:bottom-4 md:left-auto md:items-end"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              role={toast.tone === "error" ? "alert" : "status"}
              className={clsx(
                "pointer-events-auto flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-sm shadow-lg",
                // Phones: dark full-width bar. Desktop: light card, bottom-right.
                "bg-zinc-900 text-white shadow-zinc-900/20",
                "md:max-w-sm md:rounded-xl md:border md:border-line md:bg-white md:text-ink md:shadow-zinc-900/5",
              )}
            >
              <span
                className={clsx(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                  toast.tone === "success"
                    ? "bg-emerald-500 text-white md:bg-emerald-50 md:text-emerald-600"
                    : "bg-red-500 text-white md:bg-red-50 md:text-red-600",
                )}
              >
                {toast.tone === "success" ? <CheckIcon width={12} height={12} /> : <AlertIcon width={12} height={12} />}
              </span>
              <p className="flex-1 leading-5">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="-my-2 -mr-2 grid size-9 shrink-0 place-items-center rounded-md text-zinc-400 transition-colors hover:text-white md:-my-0 md:-mr-1 md:size-auto md:p-0.5 md:hover:text-ink"
              >
                <XIcon width={14} height={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
