"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { AppointmentStatus } from "@/lib/types";
import { Button } from "./ui/Button";

type FinalStatus = Exclude<AppointmentStatus, "booked">;

interface RowActionsProps {
  status: AppointmentStatus;
  onUpdate: (status: FinalStatus) => Promise<void>;
  /** "inline" for table rows, "sheet" for full-width buttons in the phone bottom sheet. */
  layout?: "inline" | "sheet";
}

const swap = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.15 },
};

/**
 * Actions for a booked appointment. "Cancel" asks for an inline confirmation
 * first; the clicked button shows a spinner while the PATCH runs.
 */
export function RowActions({ status, onUpdate, layout = "inline" }: RowActionsProps) {
  const sheet = layout === "sheet";
  const size = sheet ? "lg" : "sm";
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState<FinalStatus | null>(null);

  async function run(next: FinalStatus) {
    setPending(next);
    try {
      await onUpdate(next);
    } finally {
      setPending(null);
      setConfirming(false);
    }
  }

  const view = status !== "booked" ? "none" : confirming ? "confirm" : "idle";

  return (
    <div className={sheet ? "flex flex-col" : "flex min-h-8 items-center justify-end"}>
      <AnimatePresence mode="wait" initial={false}>
        {view === "idle" && (
          <motion.div key="idle" {...swap} className={sheet ? "grid grid-cols-2 gap-2" : "flex items-center gap-1.5"}>
            <Button
              size={size}
              variant="secondary"
              loading={pending === "completed"}
              onClick={() => run("completed")}
            >
              Mark completed
            </Button>
            <Button
              size={size}
              variant={sheet ? "secondary" : "ghost"}
              disabled={pending !== null}
              onClick={() => setConfirming(true)}
              className={sheet ? "text-red-700" : "hover:bg-red-50 hover:text-red-700"}
            >
              Cancel
            </Button>
          </motion.div>
        )}

        {view === "confirm" && (
          <motion.div
            key="confirm"
            {...swap}
            role="group"
            aria-label="Confirm cancellation"
            className={
              sheet
                ? "flex flex-col gap-3 rounded-2xl bg-red-50/70 p-3"
                : "flex items-center gap-1.5 rounded-lg bg-red-50/70 py-0.5 pr-0.5 pl-3"
            }
            onKeyDown={(e) => {
              if (e.key === "Escape" && pending === null) {
                e.stopPropagation();
                setConfirming(false);
              }
            }}
          >
            <span className={clsx("font-medium text-red-700", sheet ? "text-sm" : "text-[13px] whitespace-nowrap")}>
              {sheet ? "Cancel this appointment? The slot becomes free again." : "Cancel?"}
            </span>
            <div className={sheet ? "grid grid-cols-2 gap-2" : "contents"}>
              <Button size={size} variant="ghost" disabled={pending !== null} onClick={() => setConfirming(false)}>
                Keep
              </Button>
              <Button
                size={size}
                variant="danger"
                loading={pending === "cancelled"}
                onClick={() => run("cancelled")}
                autoFocus
              >
                Yes, cancel
              </Button>
            </div>
          </motion.div>
        )}

        {view === "none" && !sheet && (
          <motion.span key="none" {...swap} className="text-sm text-zinc-300" aria-label="No actions">
            —
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
