"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { RefreshIcon } from "../icons";
import { SlotMessage } from "../SlotPicker";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";

interface SlotListProps {
  slots: string[] | undefined;
  error: string | null;
  value: string | null;
  onChange: (slot: string) => void;
  onRetry: () => void;
}

const list = { hidden: {}, show: { transition: { staggerChildren: 0.025 } } };
const row = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

/** Phone slot picker: full-width rows grouped into Morning and Afternoon. */
export function SlotList({ slots, error, value, onChange, onRetry }: SlotListProps) {
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
      <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading times">
        <Skeleton className="mb-1 h-4 w-20" />
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return <SlotMessage title="No free slots" body="Try another day or another doctor." />;
  }

  const groups = [
    { label: "Morning", slots: slots.filter((s) => s < "12:00") },
    { label: "Afternoon", slots: slots.filter((s) => s >= "12:00") },
  ].filter((group) => group.slots.length > 0);

  return (
    <motion.div variants={list} initial="hidden" animate="show" className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.label} role="radiogroup" aria-label={group.label} className="flex flex-col gap-2">
          <h3 className="text-[15px] font-semibold text-ink">{group.label}</h3>
          {group.slots.map((slot) => {
            const selected = slot === value;
            return (
              <motion.button
                key={slot}
                type="button"
                role="radio"
                aria-checked={selected}
                variants={row}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange(slot)}
                className={clsx(
                  "h-12 rounded-xl border text-[15px] font-semibold tabular-nums transition-colors",
                  selected
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-line bg-white text-emerald-700 active:bg-emerald-50",
                )}
              >
                {slot}
              </motion.button>
            );
          })}
        </section>
      ))}
    </motion.div>
  );
}
