"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { formatShortDate } from "@/lib/date";
import type { AppointmentFilters, AppointmentStatus, Doctor } from "@/lib/types";
import { DatePicker } from "./DatePicker";
import { DoctorSelect } from "./DoctorSelect";
import { CalendarIcon, ChevronDownIcon, SearchIcon, XIcon } from "./icons";
import { SegmentedControl } from "./ui/SegmentedControl";

const STATUS_OPTIONS: { value: AppointmentStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "booked", label: "Booked" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

interface FiltersProps {
  filters: AppointmentFilters;
  doctors: Doctor[];
  onChange: (patch: Partial<AppointmentFilters>) => void;
  onClear: () => void;
}

export function Filters(props: FiltersProps) {
  return (
    <>
      <MobileFilters {...props} />
      <DesktopFilters {...props} />
    </>
  );
}

const hasAnyFilter = (filters: AppointmentFilters) => Object.values(filters).some((value) => value !== "");

function DesktopFilters({ filters, doctors, onChange, onClear }: FiltersProps) {
  const hasFilters = hasAnyFilter(filters);

  return (
    <div className="hidden flex-col gap-3 rounded-2xl border border-line bg-white p-3 md:flex lg:flex-row lg:items-center">
      <label className="relative flex-1 lg:max-w-xs">
        <span className="sr-only">Search patients</span>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search by patient name or phone"
          className="h-9 w-full rounded-full border border-line bg-canvas pr-4 pl-9 text-sm outline-none transition-colors placeholder:text-zinc-400 hover:border-zinc-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <DoctorSelect
          id="filter-doctor"
          label="Filter by doctor"
          doctors={doctors}
          value={filters.doctor}
          onChange={(doctor) => onChange({ doctor })}
          allowAll
        />

        <DatePicker
          id="filter-date"
          label="Filter by date"
          value={filters.date || null}
          onChange={(date) => onChange({ date: date ?? "" })}
          allowPast
          clearable
          triggerClassName={clsx(
            "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm outline-none transition-colors",
            "focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/10",
            filters.date
              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
              : "border-line bg-white text-ink hover:border-zinc-300",
          )}
        >
          <CalendarIcon className={filters.date ? "text-emerald-600" : "text-zinc-400"} />
          {filters.date ? formatShortDate(filters.date) : "Any date"}
          <ChevronDownIcon width={14} height={14} className="opacity-60" />
        </DatePicker>

        <SegmentedControl
          id="status-filter"
          label="Filter by status"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(status) => onChange({ status })}
        />

        <AnimatePresence>
          {hasFilters && (
            <motion.button
              type="button"
              onClick={onClear}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              className="px-2 text-[13px] font-medium text-emerald-700 underline-offset-4 hover:underline"
            >
              Clear
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ phones */

/** Sticky search + a horizontally scrolling chip row (status, doctor, date). */
function MobileFilters({ filters, doctors, onChange, onClear }: FiltersProps) {
  return (
    <div className="sticky top-14 z-20 -mx-4 flex flex-col gap-3 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur md:hidden">
      <label className="relative">
        <span className="sr-only">Search patients</span>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search patients"
          className="h-11 w-full rounded-full border border-line bg-white pr-4 pl-10 text-base outline-none placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />
      </label>

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-4 px-4">
        {STATUS_OPTIONS.map((option) => {
          const active = filters.status === option.value;
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ status: option.value })}
              className={clsx(chipClass, active ? "border-transparent text-white" : "border-line bg-white text-zinc-700")}
            >
              {active && (
                <motion.span
                  layoutId="status-chip"
                  className="absolute inset-0 rounded-full bg-zinc-900"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative">{option.label}</span>
            </button>
          );
        })}

        <span className="my-2 w-px shrink-0 bg-line" aria-hidden="true" />

        <DoctorSelect
          id="filter-doctor-mobile"
          label="Filter by doctor"
          doctors={doctors}
          value={filters.doctor}
          onChange={(doctor) => onChange({ doctor })}
          allowAll
          variant="chip"
        />

        <DatePicker
          id="filter-date-mobile"
          label="Filter by date"
          value={filters.date || null}
          onChange={(date) => onChange({ date: date ?? "" })}
          allowPast
          clearable
          triggerClassName={clsx(
            chipClass,
            filters.date ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-line bg-white text-zinc-700",
          )}
        >
          {filters.date ? formatShortDate(filters.date) : "Any date"}
          <ChevronDownIcon width={14} height={14} className="opacity-60" />
        </DatePicker>

        {hasAnyFilter(filters) && (
          <button type="button" onClick={onClear} className={clsx(chipClass, "border-line bg-white text-emerald-700")}>
            <XIcon width={14} height={14} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

const chipClass =
  "relative inline-flex h-11 shrink-0 snap-start items-center gap-1.5 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors";
