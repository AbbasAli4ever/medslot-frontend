"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type KeyboardEvent } from "react";
import type { StaffUser } from "@/lib/auth";
import { usePopover } from "@/hooks/usePopover";
import { LogOutIcon } from "./icons";

/** "Front Desk" -> "FD", "sara" -> "S" */
function initials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase());
  return letters.join("") || "?";
}

/** Round avatar button with a dropdown: who is signed in, and Log out. */
export function AccountMenu({ user, onLogout }: { user: StaffUser; onLogout: () => void }) {
  const { open, setOpen, close, rootRef, triggerRef } = usePopover();

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? "account-menu" : undefined}
        aria-label={`Account: ${user.name}`}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onTriggerKeyDown}
        className="grid size-9 place-items-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-700 text-[13px] font-semibold tracking-wide text-white shadow-sm shadow-emerald-900/20 ring-emerald-500/25 ring-offset-2 transition-shadow outline-none hover:ring-4 focus-visible:ring-4 aria-expanded:ring-4"
      >
        {initials(user.name)}
      </button>

      <AnimatePresence>
        {open && <Menu user={user} onLogout={onLogout} onClose={() => close()} onTab={() => close(false)} />}
      </AnimatePresence>
    </div>
  );
}

function Menu({
  user,
  onLogout,
  onClose,
  onTab,
}: {
  user: StaffUser;
  onLogout: () => void;
  onClose: () => void;
  onTab: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      items[(index + step + items.length) % items.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    } else if (event.key === "Tab") {
      onTab();
    }
  }

  return (
    <motion.div
      ref={ref}
      id="account-menu"
      role="menu"
      aria-label="Account"
      onKeyDown={onKeyDown}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.12 } }}
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      className="absolute top-full right-0 z-40 mt-2 w-60 origin-top-right overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-xl shadow-zinc-900/10"
    >
      <div role="none" className="px-3 py-2.5">
        <p className="truncate text-sm font-medium text-ink">{user.name}</p>
        <p className="truncate text-xs text-muted">{user.email}</p>
      </div>
      <div role="separator" className="my-1 h-px bg-line" />
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onClose();
          onLogout();
        }}
        className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-medium text-zinc-700 outline-none hover:bg-zinc-100 hover:text-ink focus-visible:bg-zinc-100 focus-visible:text-ink"
      >
        <LogOutIcon className="text-zinc-500" />
        Log out
      </button>
    </motion.div>
  );
}
