"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { formatDate } from "@/lib/date";
import { rowMotion } from "@/lib/motion";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { AlertIcon, PlusIcon, RefreshIcon } from "./icons";
import { RowActions } from "./RowActions";
import { StatusBadge } from "./StatusBadge";
import { MobileAppointmentList } from "./mobile/MobileAppointmentList";
import { Button } from "./ui/Button";
import { Skeleton } from "./ui/Skeleton";

type FinalStatus = Exclude<AppointmentStatus, "booked">;

interface AppointmentsTableProps {
  appointments: Appointment[] | undefined;
  isLoading: boolean;
  error: unknown;
  errorText: string;
  hasFilters: boolean;
  highlightId: number | null;
  onRetry: () => void;
  onBook: () => void;
  onUpdateStatus: (appointment: Appointment, status: FinalStatus) => Promise<void>;
}

const COLUMNS = [
  { label: "Patient", width: "w-[20%]" },
  { label: "Doctor", width: "w-[16%]" },
  { label: "Date", width: "w-[14%]" },
  { label: "Time", width: "w-[12%]" },
  { label: "Status", width: "w-[12%]" },
  { label: "", width: "w-[26%]" },
];

export function AppointmentsTable(props: AppointmentsTableProps) {
  const { appointments, isLoading, error, errorText, hasFilters, highlightId, onRetry, onBook, onUpdateStatus } =
    props;

  if (error && !appointments) return <ErrorState message={errorText} onRetry={onRetry} />;
  if (!appointments) return <LoadingState />;
  if (appointments.length === 0 && !isLoading) return <EmptyState hasFilters={hasFilters} onBook={onBook} />;

  return (
    <>
      {/* Phones: grouped list with a details sheet */}
      <div className="md:hidden">
        <MobileAppointmentList appointments={appointments} highlightId={highlightId} onUpdateStatus={onUpdateStatus} />
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-white md:block">
        <table className="w-full table-fixed text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-muted">
              {COLUMNS.map(({ label, width }, i) => (
                <th key={i} scope="col" className={`px-5 py-3 font-medium ${width}`}>
                  {label || <span className="sr-only">Actions</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={true}>
              {appointments.map((appt, index) => (
                <motion.tr
                  key={appt.id}
                  {...rowMotion(index, appt.id === highlightId)}
                  className="border-b border-line last:border-0"
                >
                  <td className="px-5 py-3.5">
                    <PatientCell appointment={appt} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-ink">{appt.doctor_detail.name}</div>
                    <div className="text-xs text-muted">{appt.doctor_detail.specialty}</div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-zinc-700">{formatDate(appt.date)}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-zinc-700 tabular-nums">
                    {appt.start_time} – {appt.end_time}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={appt.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <RowActions status={appt.status} onUpdate={(status) => onUpdateStatus(appt, status)} />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </>
  );
}

function PatientCell({ appointment }: { appointment: Appointment }) {
  return (
    <div className="min-w-0">
      <div className="truncate font-medium text-ink">{appointment.patient_name}</div>
      <div className="text-xs text-muted tabular-nums">{appointment.patient_phone}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ states */

function LoadingState() {
  return (
    <div className="rounded-2xl border border-line bg-white" aria-busy="true" aria-label="Loading appointments">
      <div className="border-b border-line px-5 py-3">
        <Skeleton className="h-3 w-24" />
      </div>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-6 border-b border-line px-5 py-4 last:border-0">
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="hidden flex-1 flex-col gap-2 md:flex">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="hidden h-3.5 w-24 md:block" />
          <Skeleton className="hidden h-3.5 w-20 md:block" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasFilters, onBook }: { hasFilters: boolean; onBook: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative size-32 overflow-hidden rounded-3xl"
      >
        <Image src="/illustrations/empty-state.png" alt="" fill sizes="128px" className="object-cover" />
      </motion.div>
      <div>
        <p className="font-medium text-ink">{hasFilters ? "No matching appointments" : "No appointments yet"}</p>
        <p className="mt-1 text-sm text-muted">
          {hasFilters ? "Try different filters, or book a new visit." : "Book the first visit to get the day started."}
        </p>
      </div>
      <Button variant="primary" size="sm" onClick={onBook} className="mt-1">
        <PlusIcon width={14} height={14} />
        Book appointment
      </Button>
    </motion.div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-6 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-red-50 text-red-600">
        <AlertIcon width={20} height={20} />
      </span>
      <div>
        <p className="font-medium text-ink">Couldn&apos;t load appointments</p>
        <p className="mt-1 max-w-sm text-sm text-muted">{message}</p>
      </div>
      <Button size="sm" onClick={onRetry} className="mt-1">
        <RefreshIcon width={14} height={14} />
        Retry
      </Button>
    </div>
  );
}
