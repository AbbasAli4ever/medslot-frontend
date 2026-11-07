"use client";

import { useCallback, useState } from "react";
import { ApiError, getAvailableSlots, getDoctorDay, getDoctors, listAppointments } from "@/lib/api";
import type { AppointmentFilters, PageSize } from "@/lib/types";
import { useFetch } from "./useFetch";

export function useDoctors() {
  return useFetch("doctors", getDoctors);
}

/**
 * Load one page of the filtered appointments list.
 * A page past the end (the API answers 404, e.g. after the last row of the
 * last page was cancelled under a status filter) falls back to the last page.
 */
async function loadPage(filters: AppointmentFilters, page: number, pageSize: number, signal: AbortSignal) {
  try {
    return await listAppointments(filters, page, pageSize, signal);
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 404 || page === 1) throw err;
    const first = await listAppointments(filters, 1, pageSize, signal);
    return first.total_pages <= 1 ? first : listAppointments(filters, first.total_pages, pageSize, signal);
  }
}

/**
 * Paginated appointments list. The page resets to 1 whenever the filters or
 * the page size change; while another page of the same list loads, the
 * current rows stay on screen.
 */
export function useAppointments(filters: AppointmentFilters) {
  const filterKey = JSON.stringify(filters);
  const [pageSize, setPageSizeState] = useState<PageSize>(10);
  const group = `${filterKey}|${pageSize}`;
  const [pageState, setPageState] = useState({ group, page: 1 });
  const page = pageState.group === group ? pageState.page : 1;

  const key = `${group}|${page}`;
  const loader = useCallback(
    (signal: AbortSignal) => loadPage(JSON.parse(filterKey) as AppointmentFilters, page, pageSize, signal),
    [filterKey, page, pageSize],
  );
  const result = useFetch(key, loader, { group: filterKey });

  // The loader fell back to an earlier page: adopt it so the controls match.
  // (Adjusting state during render is React's recommended pattern for this.)
  const served = result.data?.page;
  if (!result.isLoading && served !== undefined && served !== page) {
    setPageState({ group, page: served });
  }

  const setPage = useCallback((next: number) => setPageState({ group, page: Math.max(1, next) }), [group]);
  const setPageSize = useCallback((size: PageSize) => setPageSizeState(size), []);

  return { ...result, page, pageSize, setPage, setPageSize };
}

export function useAvailableSlots(doctorId: number | null, date: string | null) {
  const key = doctorId !== null && date !== null ? `${doctorId}:${date}` : null;
  const loader = useCallback(
    (signal: AbortSignal) =>
      doctorId !== null && date !== null
        ? getAvailableSlots(doctorId, date, signal).then((res) => res.slots)
        : Promise.resolve<string[]>([]),
    [doctorId, date],
  );
  return useFetch(key, loader);
}

/** One doctor's day as 30-minute slots. Pass `null` to skip (e.g. while the view is hidden). */
export function useDoctorDay(doctorId: number | null, date: string | null) {
  const key = doctorId !== null && date !== null ? `day:${doctorId}:${date}` : null;
  const loader = useCallback(
    (signal: AbortSignal) => {
      if (doctorId === null || date === null) return Promise.reject(new Error("No doctor or date"));
      return getDoctorDay(doctorId, date, signal);
    },
    [doctorId, date],
  );
  return useFetch(key, loader);
}
