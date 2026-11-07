"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Open/close state for an anchored popover or menu: closes on Escape (focus
 * goes back to the trigger) and on any pointer press outside `rootRef`.
 * Pass `dismiss: false` when something else (e.g. a modal sheet) owns that.
 */
export function usePopover<TTrigger extends HTMLElement = HTMLButtonElement>({ dismiss = true } = {}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<TTrigger>(null);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);
  const toggle = useCallback(() => setOpen((value) => !value), []);

  useEffect(() => {
    if (!open || !dismiss) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, dismiss, close]);

  return { open, setOpen, toggle, close, rootRef, triggerRef };
}
