"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { useState } from "react";
import {
  WEEKDAY_LABELS,
  addMonths,
  formatMonth,
  isBookableDay,
  isSameDay,
  isSunday,
  monthGrid,
  parseISODate,
  startOfMonth,
  startOfToday,
  toISODate,
} from "@/lib/date";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

interface CalendarProps {
  /** Selected date as YYYY-MM-DD, or null. */
  value: string | null;
  onChange: (value: string) => void;
  /** Let staff pick past days too (filters, history). Booking keeps it off. */
  allowPast?: boolean;
  /** Unique per instance so the selection pill never animates between two calendars. */
  id?: string;
  /** Drop the outline when the calendar sits inside a popover or sheet. */
  bare?: boolean;
}

/** Month calendar, Monday first. Sundays (clinic closed) are disabled, and so are past days unless `allowPast`. */
export function Calendar({ value, onChange, allowPast = false, id = "calendar", bare = false }: CalendarProps) {
  const [today] = useState(startOfToday);
  const [month, setMonth] = useState(() => startOfMonth(value ? parseISODate(value) : today));
  const selected = value ? parseISODate(value) : null;
  const canGoBack = allowPast || month > startOfMonth(today);

  return (
    <div className={clsx(!bare && "rounded-xl border border-line", "p-3")}>
      <div className="mb-2 flex items-center justify-between px-1">
        <NavButton label="Previous month" disabled={!canGoBack} onClick={() => setMonth((m) => addMonths(m, -1))}>
          <ChevronLeftIcon />
        </NavButton>
        <p className="text-sm font-medium text-ink" aria-live="polite">
          {formatMonth(month)}
        </p>
        <NavButton label="Next month" onClick={() => setMonth((m) => addMonths(m, 1))}>
          <ChevronRightIcon />
        </NavButton>
      </div>

      <div role="grid" aria-label={formatMonth(month)} className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((day) => (
          <div key={day} role="columnheader" className="py-1 text-[11px] font-medium text-zinc-400">
            {day}
          </div>
        ))}

        {monthGrid(month).flat().map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;
          const disabled = allowPast ? isSunday(date) : !isBookableDay(date, today);
          const isSelected = selected !== null && isSameDay(date, selected);
          const isToday = isSameDay(date, today);

          return (
            <div key={date.getTime()} role="gridcell" className="flex justify-center">
              <button
                type="button"
                disabled={disabled}
                aria-pressed={isSelected}
                aria-label={date.toDateString()}
                onClick={() => onChange(toISODate(date))}
                className={clsx(
                  "relative grid size-9 place-items-center rounded-full text-[13px] tabular-nums transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600",
                  disabled && "cursor-not-allowed text-zinc-300",
                  !disabled && !isSelected && "font-medium text-ink hover:bg-emerald-50 hover:text-emerald-700",
                  isSelected && "font-semibold text-white",
                )}
              >
                {isSelected && (
                  <motion.span
                    layoutId={`${id}-selected`}
                    className="absolute inset-0 rounded-full bg-emerald-600"
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  />
                )}
                <span className="relative">{date.getDate()}</span>
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 size-1 rounded-full bg-emerald-500" aria-hidden="true" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-ink disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
