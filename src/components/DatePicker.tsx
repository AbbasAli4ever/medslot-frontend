"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { usePopover } from "@/hooks/usePopover";
import { Calendar } from "./Calendar";
import { BottomSheet } from "./ui/BottomSheet";

interface DatePickerProps {
  /** YYYY-MM-DD, or null for "no date". */
  value: string | null;
  onChange: (value: string | null) => void;
  /** Accessible name of the trigger and the title of the picker. */
  label: string;
  /** Unique per instance (calendar selection animation, sheet title id). */
  id: string;
  /** Past days are selectable (filters and history). */
  allowPast?: boolean;
  /** Show a "Clear" action that sets the value back to null. */
  clearable?: boolean;
  /** Which edge of the trigger the desktop popover lines up with. */
  align?: "start" | "end";
  triggerClassName?: string;
  /** Trigger content, e.g. the formatted date. */
  children: ReactNode;
}

/**
 * Date control with no typing: a button that opens the clinic Calendar,
 * as an anchored popover on desktop and a bottom sheet on phones.
 */
export function DatePicker({
  value,
  onChange,
  label,
  id,
  allowPast = false,
  clearable = false,
  align = "start",
  triggerClassName,
  children,
}: DatePickerProps) {
  const isMobile = useIsMobile();
  const { open, setOpen, toggle, close, rootRef, triggerRef } = usePopover({ dismiss: !isMobile });

  function select(next: string | null) {
    onChange(next);
    close(!isMobile);
  }

  const picker = (
    <>
      <Calendar id={id} value={value} onChange={select} allowPast={allowPast} bare />
      {clearable && (
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
          <span className="text-xs text-muted">Sundays are closed</span>
          <button
            type="button"
            onClick={() => select(null)}
            disabled={!value}
            className="min-h-8 rounded-lg px-2 text-[13px] font-medium text-emerald-700 hover:bg-emerald-50 disabled:text-zinc-300 disabled:hover:bg-transparent"
          >
            Clear
          </button>
        </div>
      )}
    </>
  );

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
        className={triggerClassName}
      >
        {children}
      </button>

      {!isMobile && (
        <AnimatePresence>
          {open && (
            <Popover align={align} label={label}>
              {picker}
            </Popover>
          )}
        </AnimatePresence>
      )}

      {isMobile &&
        createPortal(
          <BottomSheet open={open} onClose={() => setOpen(false)} labelledBy={`${id}-sheet-title`}>
            <h2 id={`${id}-sheet-title`} className="px-5 pb-1 text-lg font-semibold tracking-tight text-ink">
              {label}
            </h2>
            <div className="px-2">{picker}</div>
          </BottomSheet>,
          document.body,
        )}
    </div>
  );
}

function Popover({ align, label, children }: { align: "start" | "end"; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  // Move focus to the selected day (or the first enabled one) so arrows/Enter work at once.
  useEffect(() => {
    const panel = ref.current;
    const target =
      panel?.querySelector<HTMLElement>('[aria-pressed="true"]') ??
      panel?.querySelector<HTMLElement>("[role=gridcell] button:not([disabled])");
    target?.focus();
  }, []);

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-label={label}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.12 } }}
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      className={clsx(
        "absolute top-full z-40 mt-2 w-[300px] overflow-hidden rounded-2xl border border-line bg-white shadow-xl shadow-zinc-900/10",
        align === "start" ? "left-0 origin-top-left" : "right-0 origin-top-right",
      )}
    >
      {children}
    </motion.div>
  );
}
