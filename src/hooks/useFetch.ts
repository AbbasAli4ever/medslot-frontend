"use client";

import { useCallback, useEffect, useState } from "react";

interface FetchState<T> {
  key: string | null;
  group?: string;
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

export interface FetchOptions {
  /**
   * Requests that share a group keep the previous data on screen while the
   * next key loads (e.g. pages of the same filtered list), instead of
   * dropping back to a skeleton.
   */
  group?: string;
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
  { group }: FetchOptions = {},
): FetchResult<T> {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<FetchState<T>>({ key: null, version: 0 });

  useEffect(() => {
    if (key === null) return;
    const controller = new AbortController();

    loader(controller.signal).then(
      (data) => setState({ key, group, version, data }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState((prev) => ({
          key,
          group,
          version,
          data: prev.key === key ? prev.data : undefined,
          error,
        }));
      },
    );

    return () => controller.abort();
  }, [key, group, version, loader]);

  const sameKey = key !== null && state.key === key;
  const sameGroup = key !== null && group !== undefined && state.group === group;
  const isCurrent = sameKey && state.version === version;

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  const mutate = useCallback((update: (data: T) => T) => {
    setState((prev) => (prev.data === undefined ? prev : { ...prev, data: update(prev.data) }));
  }, []);

  return {
    data: sameKey || sameGroup ? state.data : undefined,
    error: isCurrent ? state.error : undefined,
    isLoading: key !== null && !isCurrent,
    refetch,
    mutate,
  };
}
