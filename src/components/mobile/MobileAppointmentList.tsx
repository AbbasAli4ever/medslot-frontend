"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { formatDate, formatTimestamp, relativeDayLabel } from "@/lib/date";
import { rowMotion } from "@/lib/motion";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { DoctorAvatar } from "../DoctorPicker";
import { ChevronRightIcon } from "../icons";
import { RowActions } from "../RowActions";
import { StatusBadge } from "../StatusBadge";
import { BottomSheet } from "../ui/BottomSheet";

type FinalStatus = Exclude<AppointmentStatus, "booked">;

interface MobileAppointmentListProps {
  appointments: Appointment[];
  highlightId: number | null;
  onUpdateStatus: (appointment: Appointment, status: FinalStatus) => Promise<void>;
}

/** Group appointments (already sorted by date and time) under day headers. */
function groupByDate(appointments: Appointment[]) {
  const groups = new Map<string, Appointment[]>();
  for (const appt of appointments) {
    groups.set(appt.date, [...(groups.get(appt.date) ?? []), appt]);
  }
  return Array.from(groups, ([date, items]) => ({ date, items }));
}

/** Phone list: date sections, tappable rows, details in a bottom sheet. */
export function MobileAppointmentList({ appointments, highlightId, onUpdateStatus }: MobileAppointmentListProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // Looked up live so the sheet reflects status changes (and closes if the row leaves the list).
  const selected = appointments.find((a) => a.id === selectedId);
  let index = 0;

  return (
    <>
      <div className="flex flex-col gap-6">
        {groupByDate(appointments).map(({ date, items }) => (
          <section key={date} aria-labelledby={`day-${date}`}>
            <h2 id={`day-${date}`} className="px-1 pb-2 text-[13px] font-medium text-muted">
              {relativeDayLabel(date)}
            </h2>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
              <AnimatePresence initial={true}>
                {items.map((appt) => (
                  <motion.li key={appt.id} {...rowMotion(index++, appt.id === highlightId)}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(appt.id)}
                      className="flex min-h-16 w-full items-center gap-2.5 py-3 pr-3 pl-3.5 text-left transition-colors active:bg-zinc-50"
                    >
                      <DoctorAvatar name={appt.doctor_detail.name} tone="soft" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-ink">{appt.patient_name}</span>
                        <span className="block truncate text-[13px] text-muted tabular-nums">
                          {appt.doctor_detail.name} · {appt.start_time}–{appt.end_time}
                        </span>
                      </span>
                      <StatusBadge status={appt.status} />
                      <ChevronRightIcon className="shrink-0 text-zinc-300" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </section>
        ))}
      </div>

      <BottomSheet open={selected !== undefined} onClose={() => setSelectedId(null)} labelledBy="appointment-sheet-title">
        {selected && <AppointmentDetails appointment={selected} onUpdateStatus={onUpdateStatus} />}
      </BottomSheet>
    </>
  );
}

function AppointmentDetails({
  appointment: appt,
  onUpdateStatus,
}: {
  appointment: Appointment;
  onUpdateStatus: MobileAppointmentListProps["onUpdateStatus"];
}) {
  const rows: [string, React.ReactNode][] = [
    [
      "Phone",
      <a key="phone" href={`tel:${appt.patient_phone}`} className="font-medium text-emerald-700 tabular-nums">
        {appt.patient_phone}
      </a>,
    ],
    ["Doctor", `${appt.doctor_detail.name} · ${appt.doctor_detail.specialty}`],
    ["Date", formatDate(appt.date)],
    ["Time", `${appt.start_time} – ${appt.end_time} (${appt.duration_minutes} min)`],
    ["Reason", appt.reason || "—"],
    ["Booked on", formatTimestamp(appt.created_at)],
  ];

  return (
    <div className="flex flex-col gap-5 px-5 pb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="appointment-sheet-title" className="truncate text-xl font-semibold tracking-tight text-ink">
            {appt.patient_name}
          </h2>
          <p className="text-sm text-muted">{relativeDayLabel(appt.date)} at {appt.start_time}</p>
        </div>
        <StatusBadge status={appt.status} />
      </div>

      <dl className="divide-y divide-line rounded-2xl border border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 px-4 py-3 text-[15px]">
            <dt className="shrink-0 text-muted">{label}</dt>
            <dd className="min-w-0 text-right break-words text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {appt.status === "booked" && (
        <RowActions layout="sheet" status={appt.status} onUpdate={(status) => onUpdateStatus(appt, status)} />
      )}
    </div>
  );
}
