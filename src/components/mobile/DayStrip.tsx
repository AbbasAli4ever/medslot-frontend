"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { isBookableDay, nextDays, startOfToday, toISODate } from "@/lib/date";

interface DayStripProps {
  value: string | null;
  onChange: (value: string) => void;
}

const DAYS_AHEAD = 21;

/** Horizontally scrolling week strip (next three weeks). Sundays are disabled. */
export function DayStrip({ value, onChange }: DayStripProps) {
  const [days] = useState(() => nextDays(DAYS_AHEAD));
  const [today] = useState(startOfToday);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Bring the chosen day into view when the step opens.
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  return (
    <div role="radiogroup" aria-label="Day" className="no-scrollbar flex snap-x snap-mandatory gap-1 overflow-x-auto px-3">
      {days.map((day) => {
        const iso = toISODate(day);
        const selected = iso === value;
        const disabled = !isBookableDay(day, today);
        return (
          <button
            key={iso}
            ref={selected ? selectedRef : undefined}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={day.toDateString()}
            disabled={disabled}
            onClick={() => onChange(iso)}
            className="flex w-[52px] shrink-0 snap-start flex-col items-center gap-1.5 py-1 disabled:cursor-not-allowed"
          >
            <span className={clsx("text-xs font-medium", disabled ? "text-zinc-300" : "text-muted")}>
              {day.toLocaleDateString("en-GB", { weekday: "short" })}
            </span>
            <span
              className={clsx(
                "relative grid size-11 place-items-center rounded-full text-[15px] font-semibold tabular-nums",
                disabled ? "text-zinc-300" : selected ? "text-white" : "text-ink",
              )}
            >
              {selected && (
                <motion.span
                  layoutId="day-strip-selected"
                  className="absolute inset-0 rounded-full bg-emerald-600"
                  transition={{ type: "spring", stiffness: 500, damping: 36 }}
                />
              )}
              <span className="relative">{day.getDate()}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
