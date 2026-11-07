"use client";

import { MotionConfig } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { errorMessage, updateStatus } from "@/lib/api";
import { formatDate, formatLongDate, todayISO } from "@/lib/date";
import { EMPTY_FILTERS, type Appointment, type AppointmentFilters } from "@/lib/types";
import type { BookingInitial } from "@/hooks/useBookingForm";
import { useAppointments, useDoctorDay, useDoctors } from "@/hooks/useClinicData";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSession } from "@/hooks/useSession";
import { LogoMark } from "./brand/Logo";
import { AppointmentsTable } from "./AppointmentsTable";
import { BookingDrawer } from "./BookingDrawer";
import { DoctorDayView } from "./doctor-day/DoctorDayView";
import { Filters } from "./Filters";
import { FloatingBookButton, Header } from "./Header";
import { Pagination } from "./Pagination";
import { SegmentedControl } from "./ui/SegmentedControl";
import { Spinner } from "./ui/Spinner";
import { useToast } from "./Toast";

const HIGHLIGHT_MS = 3000;

type View = "appointments" | "day";
const VIEW_OPTIONS = [
  { value: "appointments", label: "Appointments" },
  { value: "day", label: "Doctor's day" },
] as const satisfies readonly { value: View; label: string }[];

/** The whole single-page app: header, appointments list or doctor's day, booking drawer. */
export function ClinicDashboard() {
  const session = useSession();
  const toast = useToast();
  const [view, setView] = useState<View>("appointments");
  const [filters, setFilters] = useState<AppointmentFilters>(EMPTY_FILTERS);
  const [booking, setBooking] = useState<{ open: boolean; initial?: BookingInitial }>({ open: false });
  const [highlightId, setHighlightId] = useState<number | null>(null);

  // Typing in search waits 300ms before hitting the API; other filters apply at once.
  const search = useDebouncedValue(filters.search, 300);
  const appointments = useAppointments({ ...filters, search });
  const doctors = useDoctors();

  // Doctor's day: defaults to the first doctor and today. Only fetched while that view is open,
  // so switching back to it always shows fresh data.
  const [dayDoctor, setDayDoctor] = useState<number | null>(null);
  const [dayDateChoice, setDayDate] = useState<string | null>(null);
  const dayDoctorId = dayDoctor ?? doctors.data?.[0]?.id ?? null;
  const dayDate = view === "day" ? (dayDateChoice ?? todayISO()) : null;
  const doctorDay = useDoctorDay(view === "day" ? dayDoctorId : null, dayDate);

  const hasFilters = Object.values(filters).some((value) => value !== "");
  const openDrawer = useCallback(() => setBooking({ open: true }), []);
  const bookSlot = useCallback(
    (doctorId: number, date: string, slot: string) => setBooking({ open: true, initial: { doctorId, date, slot } }),
    [],
  );
  const { refetch } = appointments;
  const { refetch: refetchDay } = doctorDay;
  // Closing the drawer also refreshes the data: a failed booking means it may be stale.
  const closeDrawer = useCallback(() => {
    setBooking((prev) => ({ ...prev, open: false }));
    refetch();
    refetchDay();
  }, [refetch, refetchDay]);

  useEffect(() => {
    if (highlightId === null) return;
    const timer = setTimeout(() => setHighlightId(null), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [highlightId]);

  function handleBooked(appointment: Appointment) {
    setBooking((prev) => ({ ...prev, open: false }));
    setHighlightId(appointment.id);
    toast.success(
      `Booked ${appointment.doctor_detail.name} at ${appointment.start_time} on ${formatDate(appointment.date)}`,
    );
    appointments.refetch();
    doctorDay.refetch();
  }

  async function handleUpdateStatus(appointment: Appointment, status: "cancelled" | "completed") {
    try {
      const updated = await updateStatus(appointment.id, status);
      // Update the row in place so the badge animates, then sync with the server
      // (the row may no longer match the current status filter).
      appointments.mutate((list) => ({
        ...list,
        results: list.results.map((row) => (row.id === updated.id ? updated : row)),
      }));
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

  const list = appointments.data;
  const listSubtitle = list
    ? `${list.count} ${list.count === 1 ? "appointment" : "appointments"}${hasFilters ? " match your filters" : " in total"}`
    : appointments.error
      ? "Unavailable"
      : "Loading…";
  const day = doctorDay.data;
  const daySubtitle = day
    ? `${day.doctor.name} · ${day.doctor.specialty} · ${formatLongDate(day.date)}`
    : doctorDay.error
      ? "Unavailable"
      : "Loading…";
  const subtitle = view === "appointments" ? listSubtitle : daySubtitle;
  const refreshing = view === "appointments" ? !!list && appointments.isLoading : !!day && doctorDay.isLoading;

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
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {view === "appointments" ? "Appointments" : "Doctor\u2019s day"}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted">
              {subtitle}
              {refreshing && <Spinner className="text-zinc-400" />}
            </p>
          </div>
          {/* Phones: the switcher leads the page; desktop: it sits to the right of the title. */}
          <div className="order-first md:order-none">
            <SegmentedControl id="view" label="View" options={VIEW_OPTIONS} value={view} onChange={setView} stretch />
          </div>
        </div>

        {view === "appointments" ? (
          <>
            <Filters
              filters={filters}
              doctors={doctors.data ?? []}
              onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
              onClear={() => setFilters(EMPTY_FILTERS)}
            />

            <AppointmentsTable
              appointments={list?.results}
              isLoading={appointments.isLoading}
              error={appointments.error}
              errorText={errorMessage(appointments.error)}
              hasFilters={hasFilters}
              highlightId={highlightId}
              onRetry={appointments.refetch}
              onBook={openDrawer}
              onUpdateStatus={handleUpdateStatus}
            />

            {list && (
              <Pagination
                page={appointments.page}
                totalPages={list.total_pages}
                count={list.count}
                shown={list.results.length}
                pageSize={appointments.pageSize}
                isLoading={appointments.isLoading}
                onPageChange={appointments.setPage}
                onPageSizeChange={appointments.setPageSize}
              />
            )}
          </>
        ) : (
          <DoctorDayView
            doctors={doctors.data}
            doctorId={dayDoctorId}
            date={dayDate ?? todayISO()}
            day={doctorDay}
            highlightId={highlightId}
            onDoctorChange={setDayDoctor}
            onDateChange={setDayDate}
            onBookSlot={bookSlot}
          />
        )}
      </main>

      <FloatingBookButton onBook={openDrawer} />
      <BookingDrawer
        open={booking.open}
        initial={booking.initial}
        onClose={closeDrawer}
        doctors={doctors.data}
        onBooked={handleBooked}
      />
    </MotionConfig>
  );
}
