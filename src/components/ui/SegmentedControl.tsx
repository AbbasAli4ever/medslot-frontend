"use client";

import clsx from "clsx";
import { motion } from "motion/react";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  /** Unique per instance; drives the sliding indicator's layoutId. */
  id: string;
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Phones: fill the row with equal segments (back to inline from `md`). */
  stretch?: boolean;
}

export function SegmentedControl<T extends string>({
  id,
  label,
  options,
  value,
  onChange,
  stretch = false,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={clsx(
        "items-center rounded-full bg-zinc-100 p-1",
        stretch ? "flex h-11 w-full md:inline-flex md:h-9 md:w-auto" : "inline-flex h-9",
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={clsx(
              "relative rounded-full px-3 text-[13px] font-medium transition-colors",
              stretch ? "h-9 flex-1 text-sm md:h-7 md:flex-none md:text-[13px]" : "h-7",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600",
              active ? "text-ink" : "text-zinc-500 hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId={`${id}-indicator`}
                className="absolute inset-0 rounded-full bg-white shadow-sm shadow-zinc-900/10"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
