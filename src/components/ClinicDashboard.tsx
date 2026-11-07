"use client";

import { MotionConfig } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { errorMessage, updateStatus } from "@/lib/api";
import { formatDate } from "@/lib/date";
import { EMPTY_FILTERS, type Appointment, type AppointmentFilters } from "@/lib/types";
import { useAppointments, useDoctors } from "@/hooks/useClinicData";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSession } from "@/hooks/useSession";
import { LogoMark } from "./brand/Logo";
import { AppointmentsTable } from "./AppointmentsTable";
import { BookingDrawer } from "./BookingDrawer";
import { Filters } from "./Filters";
import { FloatingBookButton, Header } from "./Header";
import { Spinner } from "./ui/Spinner";
import { useToast } from "./Toast";

const HIGHLIGHT_MS = 3000;

/** The whole single-page app: header, filtered appointments list, booking drawer. */
export function ClinicDashboard() {
  const session = useSession();
  const toast = useToast();
  const [filters, setFilters] = useState<AppointmentFilters>(EMPTY_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<number | null>(null);

  // Typing in search waits 300ms before hitting the API; other filters apply at once.
  const search = useDebouncedValue(filters.search, 300);
  const appointments = useAppointments({ ...filters, search });
  const doctors = useDoctors();

  const hasFilters = Object.values(filters).some((value) => value !== "");
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const { refetch } = appointments;
  // Closing the drawer also refreshes the list: a failed booking means our data may be stale.
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (highlightId === null) return;
    const timer = setTimeout(() => setHighlightId(null), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [highlightId]);

  function handleBooked(appointment: Appointment) {
    setDrawerOpen(false);
    setHighlightId(appointment.id);
    toast.success(
      `Booked ${appointment.doctor_detail.name} at ${appointment.start_time} on ${formatDate(appointment.date)}`,
    );
    appointments.refetch();
  }

  async function handleUpdateStatus(appointment: Appointment, status: "cancelled" | "completed") {
    try {
      const updated = await updateStatus(appointment.id, status);
      // Update the row in place so the badge animates, then sync with the server
      // (the row may no longer match the current status filter).
      appointments.mutate((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
      toast.success(
        status === "cancelled"
          ? `Cancelled ${appointment.patient_name}'s visit. The slot is free again.`
          : `Marked ${appointment.patient_name}'s visit as completed.`,
      );
      appointments.refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const rows = appointments.data;
  const subtitle = rows
    ? `${rows.length} ${rows.length === 1 ? "appointment" : "appointments"}${hasFilters ? " match your filters" : " in total"}`
    : appointments.error
      ? "Unavailable"
      : "Loading…";

  // Staff-only: hold a branded splash until the session is confirmed (or we redirect to /login).
  if (!session.user) {
    return (
      <div className="grid flex-1 place-items-center">
        <div className="flex flex-col items-center gap-3 text-muted">
          <LogoMark size={40} className="animate-pulse motion-reduce:animate-none" />
          <span className="text-sm">Checking your session…</span>
        </div>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <Header onBook={openDrawer} user={session.user} onLogout={session.logout} />

      {/* Bottom padding on phones keeps the last row clear of the floating Book pill. */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 pt-6 pb-32 sm:px-6 md:gap-6 md:py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Appointments</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted">
              {subtitle}
              {rows && appointments.isLoading && <Spinner className="text-zinc-400" />}
            </p>
          </div>
        </div>

        <Filters
          filters={filters}
          doctors={doctors.data ?? []}
          onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          onClear={() => setFilters(EMPTY_FILTERS)}
        />

        <AppointmentsTable
          appointments={rows}
          isLoading={appointments.isLoading}
          error={appointments.error}
          errorText={errorMessage(appointments.error)}
          hasFilters={hasFilters}
          highlightId={highlightId}
          onRetry={appointments.refetch}
          onBook={openDrawer}
          onUpdateStatus={handleUpdateStatus}
        />
      </main>

      <FloatingBookButton onBook={openDrawer} />
      <BookingDrawer open={drawerOpen} onClose={closeDrawer} doctors={doctors.data} onBooked={handleBooked} />
    </MotionConfig>
  );
}
