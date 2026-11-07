"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { usePopover } from "@/hooks/usePopover";
import { CheckIcon, ChevronDownIcon } from "../icons";
import { BottomSheet } from "./BottomSheet";

export interface DropdownOption<T extends string | number> {
  value: T;
  label: string;
  /** Muted second line in the list, e.g. a doctor's specialty. */
  description?: string;
  /** Leading visual in the list (e.g. a portrait). */
  icon?: ReactNode;
  /** Smaller leading visual for the trigger; falls back to nothing. */
  triggerIcon?: ReactNode;
}

type Variant = "pill" | "chip" | "field";

const TRIGGER: Record<Variant, string> = {
  /** Desktop filter bars. */
  pill: "h-9 gap-2 rounded-full px-3.5 text-sm",
  /** Phone chip rows: 44px tap target. */
  chip: "h-11 gap-1.5 rounded-full px-4 text-sm font-medium",
  /** Form fields. */
  field: "h-11 w-full gap-2 rounded-xl px-3.5 text-base md:h-10 md:text-sm",
};

interface DropdownProps<T extends string | number> {
  /** Unique per instance (ids for the listbox and its options). */
  id: string;
  /** Accessible name; also the sheet title on phones. */
  label: string;
  value: T;
  options: readonly DropdownOption<T>[];
  onChange: (value: T) => void;
  variant?: Variant;
  /** Highlight the trigger (e.g. a filter that is set). */
  active?: boolean;
  align?: "start" | "end";
  /** Open the desktop menu above the trigger (e.g. in a page footer). */
  placement?: "bottom" | "top";
  className?: string;
  /** For forms: lets a <label htmlFor> point at the trigger. */
  triggerId?: string;
}

/**
 * Custom select: a button that opens a listbox (popover on desktop, bottom
 * sheet on phones). Keyboard: Up/Down/Home/End move, Enter/Space pick,
 * Escape closes, typing jumps to the first matching option.
 */
export function Dropdown<T extends string | number>({
  id,
  label,
  value,
  options,
  onChange,
  variant = "pill",
  active = false,
  align = "start",
  placement = "bottom",
  className,
  triggerId,
}: DropdownProps<T>) {
  const isMobile = useIsMobile();
  const { open, setOpen, close, rootRef, triggerRef } = usePopover({ dismiss: !isMobile });
  const selected = options.find((option) => option.value === value);

  function select(next: T) {
    onChange(next);
    close(!isMobile);
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    }
  }

  const list = (
    <ListBox
      id={id}
      label={label}
      options={options}
      value={value}
      onSelect={select}
      onTab={() => close(false)}
      roomy={isMobile}
    />
  );

  return (
    <div ref={rootRef} className={clsx("relative shrink-0", variant === "field" && "w-full", className)}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-listbox` : undefined}
        aria-label={triggerId ? undefined : `${label}: ${selected?.label ?? "none"}`}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onTriggerKeyDown}
        className={clsx(
          "inline-flex items-center border text-left whitespace-nowrap transition-colors outline-none",
          "focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/10",
          TRIGGER[variant],
          active ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-line bg-white text-ink hover:border-zinc-300",
          open && !active && "border-zinc-300",
        )}
      >
        {selected?.triggerIcon}
        <span className={clsx("truncate", variant === "field" && "flex-1")}>{selected?.label ?? "Select"}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="grid shrink-0 place-items-center opacity-60"
        >
          <ChevronDownIcon width={14} height={14} />
        </motion.span>
      </button>

      {!isMobile && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: placement === "top" ? 4 : -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12 } }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className={clsx(
                "absolute z-40 max-h-80 min-w-full overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-xl shadow-zinc-900/10",
                variant === "field" ? "w-full" : "w-max max-w-[18rem]",
                placement === "top" ? "bottom-full mb-2" : "top-full mt-2",
                align === "start" ? "left-0" : "right-0",
                placement === "top"
                  ? align === "start" ? "origin-bottom-left" : "origin-bottom-right"
                  : align === "start" ? "origin-top-left" : "origin-top-right",
              )}
            >
              {list}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {isMobile &&
        createPortal(
          <BottomSheet open={open} onClose={() => setOpen(false)} labelledBy={`${id}-sheet-title`}>
            <h2 id={`${id}-sheet-title`} className="px-5 pb-2 text-lg font-semibold tracking-tight text-ink">
              {label}
            </h2>
            <div className="px-2 pb-2">{list}</div>
          </BottomSheet>,
          document.body,
        )}
    </div>
  );
}

const TYPEAHEAD_RESET_MS = 600;

function ListBox<T extends string | number>({
  id,
  label,
  options,
  value,
  onSelect,
  onTab,
  roomy,
}: {
  id: string;
  label: string;
  options: readonly DropdownOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  onTab: () => void;
  roomy: boolean;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((option) => option.value === value)));

  useEffect(() => {
    listRef.current?.focus();
  }, []);

  useEffect(() => {
    listRef.current?.querySelector(`#${CSS.escape(`${id}-opt-${active}`)}`)?.scrollIntoView({ block: "nearest" });
  }, [id, active]);

  function onKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const last = options.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => Math.min(last, i + 1));
        return;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        return;
      case "Home":
        event.preventDefault();
        setActive(0);
        return;
      case "End":
        event.preventDefault();
        setActive(last);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        if (options[active]) onSelect(options[active].value);
        return;
      case "Tab":
        onTab();
        return;
    }
    // Type-ahead: jump to the first option starting with the typed letters.
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const now = Date.now();
      const text = (now - typed.current.at > TYPEAHEAD_RESET_MS ? "" : typed.current.text) + event.key.toLowerCase();
      typed.current = { text, at: now };
      const match = options.findIndex((option) =>
        option.label.toLowerCase().replace(/^dr\.?\s*/, "").startsWith(text) || option.label.toLowerCase().startsWith(text),
      );
      if (match >= 0) setActive(match);
    }
  }

  return (
    <ul
      ref={listRef}
      id={`${id}-listbox`}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      aria-activedescendant={`${id}-opt-${active}`}
      onKeyDown={onKeyDown}
      className="flex flex-col gap-0.5 outline-none"
    >
      {options.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <li
            key={String(option.value)}
            id={`${id}-opt-${index}`}
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(option.value)}
            onMouseMove={() => index !== active && setActive(index)}
            className={clsx(
              "flex cursor-pointer items-center gap-3 rounded-lg px-2.5 text-sm transition-colors select-none",
              roomy ? "min-h-14" : option.description ? "min-h-12" : "min-h-9",
              index === active ? "bg-zinc-100" : "bg-transparent",
            )}
          >
            {option.icon}
            <span className="min-w-0 flex-1 py-1.5">
              <span className={clsx("block truncate", isSelected ? "font-semibold text-ink" : "font-medium text-zinc-800")}>
                {option.label}
              </span>
              {option.description && <span className="block truncate text-xs text-muted">{option.description}</span>}
            </span>
            <CheckIcon className={clsx("shrink-0 text-emerald-600", !isSelected && "invisible")} />
          </li>
        );
      })}
    </ul>
  );
}
