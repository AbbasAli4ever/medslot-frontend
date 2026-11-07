"use client";

import { AnimatePresence, motion } from "motion/react";
import { errorMessage } from "@/lib/api";
import { addDays } from "@/lib/date";
import type { Doctor, DoctorDay } from "@/lib/types";
import type { FetchResult } from "@/hooks/useFetch";
import { AlertIcon, CalendarIcon, RefreshIcon } from "../icons";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { DayControls } from "./DayControls";
import { DaySummary } from "./DaySummary";
import { DayTimeline } from "./DayTimeline";

interface DoctorDayViewProps {
  doctors: Doctor[] | undefined;
  doctorId: number | null;
  date: string;
  day: FetchResult<DoctorDay>;
  highlightId: number | null;
  onDoctorChange: (id: number) => void;
  onDateChange: (date: string) => void;
  /** A free slot was picked: open the booking flow prefilled with it. */
  onBookSlot: (doctorId: number, date: string, start: string) => void;
}

/** One doctor's day as 30-minute slot pills: who's booked, what's free, what's past. */
export function DoctorDayView(props: DoctorDayViewProps) {
  const { doctors, doctorId, date, day, highlightId, onDoctorChange, onDateChange, onBookSlot } = props;
  const data = day.data;

  // One key per (doctor, date, state) so switching day or doctor cross-fades.
  const state = data ? (data.is_open ? "open" : "closed") : day.error ? "error" : "loading";
  const contentKey = `${doctorId}:${date}:${state}`;

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <DayControls
        doctors={doctors}
        doctorId={doctorId}
        date={date}
        onDoctorChange={onDoctorChange}
        onDateChange={onDateChange}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={contentKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="flex flex-col gap-4 md:gap-5"
        >
          {state === "loading" && <DaySkeleton />}
          {state === "error" && <DayError message={errorMessage(day.error)} onRetry={day.refetch} />}
          {state === "closed" && <ClosedDay onNext={() => onDateChange(addDays(date, 1))} />}
          {state === "open" && data && (
            <>
              <DaySummary summary={data.summary} />
              <DayTimeline
                date={data.date}
                slots={data.slots}
                highlightId={highlightId}
                onBook={(start) => onBookSlot(data.doctor.id, data.date, start)}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ states */

function DaySkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-5" aria-busy="true" aria-label="Loading the day">
      <Skeleton className="h-[62px] rounded-2xl" />
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 md:p-5">
        <Skeleton className="h-3 w-36" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 16 }, (_, i) => (
            <Skeleton key={i} className="h-10 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-6 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-red-50 text-red-600">
        <AlertIcon width={20} height={20} />
      </span>
      <div>
        <p className="font-medium text-ink">Couldn&apos;t load this day</p>
        <p className="mt-1 max-w-sm text-sm text-muted">{message}</p>
      </div>
      <Button size="sm" onClick={onRetry} className="mt-1">
        <RefreshIcon width={14} height={14} />
        Retry
      </Button>
    </div>
  );
}

function ClosedDay({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-zinc-100 text-zinc-500">
        <CalendarIcon width={20} height={20} />
      </span>
      <div>
        <p className="font-medium text-ink">Clinic closed on Sundays</p>
        <p className="mt-1 text-sm text-muted">The clinic is open Monday to Saturday, 09:00 to 17:00.</p>
      </div>
      <Button size="sm" onClick={onNext} className="mt-1">
        Go to Monday
      </Button>
    </div>
  );
}
