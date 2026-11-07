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
        // Handled here only: a drawer underneath must not close too.
        event.preventDefault();
        event.stopPropagation();
        close();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    // Capture on window runs before any dialog's document-level Escape handler.
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, dismiss, close]);

  return { open, setOpen, toggle, close, rootRef, triggerRef };
}
