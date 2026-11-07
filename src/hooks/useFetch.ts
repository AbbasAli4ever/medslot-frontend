"use client";

import { useCallback, useEffect, useState } from "react";

interface FetchState<T> {
  key: string | null;
  version: number;
  data?: T;
  error?: unknown;
}

export interface FetchResult<T> {
  /** Data for the current key. Stays visible while a `refetch` runs. */
  data: T | undefined;
  error: unknown;
  isLoading: boolean;
  refetch: () => void;
  /** Update the cached data locally, e.g. after a successful mutation. */
  mutate: (update: (data: T) => T) => void;
}

/**
 * Tiny data-fetching hook. `key` identifies the request (pass `null` to skip);
 * when it changes the old data is dropped so the UI can show a skeleton, while
 * `refetch()` keeps the current data on screen until fresh data arrives.
 * `loader` must be stable (wrap it in useCallback).
 */
export function useFetch<T>(
  key: string | null,
  loader: (signal: AbortSignal) => Promise<T>,
): FetchResult<T> {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<FetchState<T>>({ key: null, version: 0 });

  useEffect(() => {
    if (key === null) return;
    const controller = new AbortController();

    loader(controller.signal).then(
      (data) => setState({ key, version, data }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState((prev) => ({
          key,
          version,
          data: prev.key === key ? prev.data : undefined,
          error,
        }));
      },
    );

    return () => controller.abort();
  }, [key, version, loader]);

  const sameKey = key !== null && state.key === key;
  const isCurrent = sameKey && state.version === version;

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  const mutate = useCallback((update: (data: T) => T) => {
    setState((prev) => (prev.data === undefined ? prev : { ...prev, data: update(prev.data) }));
  }, []);

  return {
    data: sameKey ? state.data : undefined,
    error: isCurrent ? state.error : undefined,
    isLoading: key !== null && !isCurrent,
    refetch,
    mutate,
  };
}
