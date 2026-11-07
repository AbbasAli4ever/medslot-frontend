"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Phones: below Tailwind's `md` breakpoint. */
export const MOBILE_QUERY = "(max-width: 767px)";

/**
 * Subscribe to a CSS media query. Returns false on the server, so only use it
 * for UI that isn't part of the first render (e.g. dialogs) or where a brief
 * desktop-first paint is fine. Prefer Tailwind `md:` classes for styling.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useIsMobile = () => useMediaQuery(MOBILE_QUERY);
