"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import type { DaySlot } from "@/lib/types";
import { PlusIcon } from "../icons";
import { StatusBadge } from "../StatusBadge";
import { buildTimeline, type TimelineItem } from "./timeline";

/** Height of one 30-minute slot, and the gap between slots, in px. */
const ROW = 56;
const GAP = 8;

interface DayTimelineProps {
  slots: DaySlot[];
  highlightId: number | null;
  onBook: (start: string) => void;
}

/** Vertical day grid: times on the left, one block per slot (visits span the slots they fill). */
export function DayTimeline({ slots, highlightId, onBook }: DayTimelineProps) {
  const items = buildTimeline(slots);
  const grid: CSSProperties = { gridAutoRows: `${ROW}px`, rowGap: `${GAP}px` };

  return (
    <div className="rounded-2xl border border-line bg-white p-3 md:p-4">
      <ol className="grid grid-cols-[48px_1fr] gap-x-3 md:grid-cols-[56px_1fr]" style={grid} aria-label="Time slots">
        {slots.map((slot, i) => (
          <li
            key={`time-${slot.start}`}
            aria-hidden="true"
            className={clsx(
              "pt-2 text-right text-xs font-medium tabular-nums",
              slot.status === "past" ? "text-zinc-300" : "text-muted",
            )}
            style={{ gridColumn: 1, gridRow: i + 1 }}
          >
            {slot.start}
          </li>
        ))}

        {items.map((item, index) => (
          <motion.li
            key={item.key}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(index, 16) * 0.025, duration: 0.25 }}
            style={{ gridColumn: 2, gridRow: `${item.row} / span ${item.span}` }}
            className="min-w-0"
          >
            <TimelineBlock item={item} highlighted={item.kind === "appointment" && item.appointment.id === highlightId} onBook={onBook} />
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

function TimelineBlock({
  item,
  highlighted,
  onBook,
}: {
  item: TimelineItem;
  highlighted: boolean;
  onBook: (start: string) => void;
}) {
  if (item.kind === "free") {
    return (
      <button
        type="button"
        onClick={() => onBook(item.start)}
        aria-label={`Book ${item.start} to ${item.end}`}
        className={clsx(
          "group flex h-full w-full items-center justify-between rounded-xl border border-dashed border-emerald-300 px-3.5 text-left transition-colors",
          "hover:border-emerald-500 hover:bg-emerald-50/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600 active:bg-emerald-50",
        )}
      >
        <span className="text-[13px] text-muted tabular-nums">
          {item.start} – {item.end} · Free
        </span>
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[13px] font-medium text-emerald-700 transition-colors group-hover:bg-emerald-100">
          <PlusIcon width={14} height={14} />
          Book
        </span>
      </button>
    );
  }

  if (item.kind === "past") {
    return (
      <div className="flex h-full items-center rounded-xl bg-zinc-50 px-3.5 text-[13px] text-zinc-400 tabular-nums">
        {item.start} – {item.end} · Past
      </div>
    );
  }

  const { appointment, past, span } = item;
  return (
    <motion.div
      initial={false}
      animate={{
        boxShadow: highlighted
          ? ["0 0 0 0 rgba(16,185,129,0.5)", "0 0 0 6px rgba(16,185,129,0.15)", "0 0 0 0 rgba(16,185,129,0)"]
          : "0 0 0 0 rgba(16,185,129,0)",
      }}
      transition={{ duration: highlighted ? 1.6 : 0 }}
      className={clsx(
        "flex h-full items-center gap-3 rounded-xl border pr-3 pl-2.5",
        past ? "border-line bg-zinc-50" : "border-emerald-200 bg-emerald-50",
      )}
    >
      <span
        className={clsx("w-1 self-stretch rounded-full", past ? "bg-zinc-300" : "bg-emerald-500", span > 1 ? "my-3" : "my-2.5")}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className={clsx("truncate text-sm font-semibold", past ? "text-zinc-500" : "text-ink")}>
          {appointment.patient_name}
        </p>
        <p className="text-xs text-muted tabular-nums">
          {appointment.start_time} – {appointment.end_time} · {appointment.duration_minutes} min
        </p>
      </div>
      <StatusBadge status={appointment.status} />
    </motion.div>
  );
}
