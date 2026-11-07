"use client";

import { AnimatePresence, motion } from "motion/react";
import type { SlotStatus } from "@/lib/types";

const STATS: { status: SlotStatus; label: string }[] = [
  { status: "free", label: "Free" },
  { status: "booked", label: "Booked" },
  { status: "past", label: "Past" },
];

/** One compact strip: free / booked / past slot counts, split by hairlines. */
export function DaySummary({ summary }: { summary: Record<SlotStatus, number> }) {
  return (
    <dl className="grid grid-cols-3 divide-x divide-line rounded-2xl border border-line/70 bg-white">
      {STATS.map(({ status, label }) => (
        <div key={status} className="px-4 py-2.5 md:px-5">
          <dt className="text-xs text-muted">{label}</dt>
          <dd className="relative h-7 overflow-hidden text-xl font-semibold tracking-tight text-ink tabular-nums">
            {/* The number rolls when it changes (e.g. right after a booking). */}
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={summary[status]}
                className="block"
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {summary[status]}
              </motion.span>
            </AnimatePresence>
            <span className="sr-only"> slots</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
