import clsx from "clsx";
import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "../icons";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** "pill" for filter bars, "field" for forms. */
  shape?: "pill" | "field";
}

/** Native select (keeps keyboard + mobile pickers) with a custom chevron. */
export function Select({ shape = "field", className, children, ...props }: SelectProps) {
  return (
    <div className={clsx("relative", className)}>
      <select
        className={clsx(
          "w-full cursor-pointer appearance-none border border-line bg-white pr-9 text-ink outline-none transition-colors",
          "hover:border-zinc-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",
          shape === "pill" ? "h-9 rounded-full pl-4 text-sm" : "h-11 rounded-xl pl-3.5 text-base md:h-10 md:text-sm",
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400" />
    </div>
  );
}
