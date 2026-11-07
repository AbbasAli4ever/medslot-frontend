"use client";

import { addDays, formatDate, todayISO } from "@/lib/date";
import type { Doctor } from "@/lib/types";
import { DatePicker } from "../DatePicker";
import { DoctorSelect } from "../DoctorSelect";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "../icons";
import { Skeleton } from "../ui/Skeleton";

interface DayControlsProps {
  doctors: Doctor[] | undefined;
  doctorId: number | null;
  date: string;
  onDoctorChange: (id: number) => void;
  onDateChange: (date: string) => void;
}

/** Doctor dropdown and a prev / pick / next day control. */
export function DayControls({ doctors, doctorId, date, onDoctorChange, onDateChange }: DayControlsProps) {
  const isToday = date === todayISO();

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:rounded-2xl md:border md:border-line md:bg-white md:p-3">
      {doctors ? (
        <DoctorSelect
          id="day-doctor"
          label="Doctor"
          doctors={doctors}
          value={doctorId === null ? "" : String(doctorId)}
          onChange={(id) => onDoctorChange(Number(id))}
        />
      ) : (
        <Skeleton className="h-9 w-40 rounded-full" />
      )}

      <div className="flex items-center gap-1.5">
        {/* Left of the arrows, so they don't move when it appears. */}
        {!isToday && (
          <button
            type="button"
            onClick={() => onDateChange(todayISO())}
            className="h-11 shrink-0 rounded-full px-3 text-[13px] font-medium text-emerald-700 hover:bg-emerald-50 md:h-10"
          >
            Today
          </button>
        )}
        <DayArrow label="Previous day" onClick={() => onDateChange(addDays(date, -1))}>
          <ChevronLeftIcon />
        </DayArrow>
        <div className="min-w-0 flex-1 md:flex-none">
          <DatePicker
            id="day-date"
            label="Choose a day"
            value={date}
            onChange={(next) => next && onDateChange(next)}
            allowPast
            align="end"
            triggerClassName="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium text-ink transition-colors hover:border-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600 md:h-10 md:w-auto"
          >
            <CalendarIcon className="text-zinc-400" />
            <span className="tabular-nums">{formatDate(date)}</span>
          </DatePicker>
        </div>
        <DayArrow label="Next day" onClick={() => onDateChange(addDays(date, 1))}>
          <ChevronRightIcon />
        </DayArrow>
      </div>
    </div>
  );
}

function DayArrow({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-white text-zinc-600 transition-colors hover:border-zinc-300 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600 md:size-10"
    >
      {children}
    </button>
  );
}
