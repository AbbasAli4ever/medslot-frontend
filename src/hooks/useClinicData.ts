"use client";

import { useCallback } from "react";
import { getAvailableSlots, getDoctors, listAppointments } from "@/lib/api";
import type { AppointmentFilters } from "@/lib/types";
import { useFetch } from "./useFetch";

export function useDoctors() {
  return useFetch("doctors", getDoctors);
}

export function useAppointments(filters: AppointmentFilters) {
  const key = JSON.stringify(filters);
  const loader = useCallback(
    (signal: AbortSignal) => listAppointments(JSON.parse(key) as AppointmentFilters, signal),
    [key],
  );
  return useFetch(key, loader);
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
