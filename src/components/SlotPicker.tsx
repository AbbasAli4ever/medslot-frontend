"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { ClockIcon, RefreshIcon } from "./icons";
import { Button } from "./ui/Button";
import { Skeleton } from "./ui/Skeleton";

interface SlotPickerProps {
  ready: boolean;
  slots: string[] | undefined;
  error: string | null;
  value: string | null;
  onChange: (slot: string) => void;
  onRetry: () => void;
}

const grid = "grid grid-cols-3 gap-2 sm:grid-cols-4";

const list = { hidden: {}, show: { transition: { staggerChildren: 0.02 } } };
const pill = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } };

/** Pill grid of free start times for the chosen doctor and day. */
export function SlotPicker({ ready, slots, error, value, onChange, onRetry }: SlotPickerProps) {
  if (!ready) {
    return <SlotMessage title="Pick a doctor and date" body="Free times will show up here." />;
  }

  if (error && !slots) {
    return (
      <SlotMessage title="Couldn't load times" body={error}>
        <Button size="sm" onClick={onRetry}>
          <RefreshIcon width={14} height={14} /> Retry
        </Button>
      </SlotMessage>
    );
  }

  if (!slots) {
    return (
      <div className={grid} aria-busy="true" aria-label="Loading times">
        {Array.from({ length: 12 }, (_, i) => (
          <Skeleton key={i} className="h-10 rounded-full" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return <SlotMessage title="No free slots" body="Try another day or another doctor." />;
  }

  return (
    <motion.div
      role="radiogroup"
      aria-label="Available times"
      className={grid}
      variants={list}
      initial="hidden"
      animate="show"
    >
      {slots.map((slot) => {
        const selected = slot === value;
        return (
          <motion.button
            key={slot}
            type="button"
            role="radio"
            aria-checked={selected}
            variants={pill}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(slot)}
            className={clsx(
              "relative h-10 rounded-full border text-sm font-medium tabular-nums transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600",
              selected ? "border-transparent text-white" : "border-line text-ink hover:border-zinc-400",
            )}
          >
            {selected && (
              <motion.span
                layoutId="slot-selected"
                className="absolute inset-0 rounded-full bg-zinc-900"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{slot}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export function SlotMessage({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line px-6 py-12 text-center">
      <ClockIcon width={20} height={20} className="text-zinc-400" />
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="text-[13px] text-muted">{body}</p>
      {children}
    </div>
  );
}
