"use client";

import { motion } from "motion/react";
import type { SlotStatus } from "@/lib/types";

const TILES: { status: SlotStatus; label: string; bar: string; dot: string }[] = [
  { status: "free", label: "Free", bar: "bg-emerald-500", dot: "bg-emerald-500" },
  { status: "booked", label: "Booked", bar: "bg-blue-500", dot: "bg-blue-500" },
  { status: "past", label: "Past", bar: "bg-zinc-300", dot: "bg-zinc-300" },
];

/** Free / booked / past slot counts, each with a bar that grows to its share of the day. */
export function DaySummary({ summary }: { summary: Record<SlotStatus, number> }) {
  const total = Math.max(1, summary.free + summary.booked + summary.past);

  return (
    <dl className="grid grid-cols-3 gap-2 md:gap-3">
      {TILES.map(({ status, label, bar, dot }, i) => (
        <div key={status} className="rounded-2xl border border-line bg-white px-3 py-3 md:px-4">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <span className={`size-1.5 rounded-full ${dot}`} aria-hidden="true" />
            {label}
          </dt>
          <dd className="mt-1 text-xl font-semibold tracking-tight text-ink tabular-nums md:text-2xl">
            {summary[status]}
            <span className="sr-only"> slots</span>
          </dd>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100" aria-hidden="true">
            <motion.div
              className={`h-full rounded-full ${bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${(summary[status] / total) * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.05 * i }}
            />
          </div>
        </div>
      ))}
    </dl>
  );
}
