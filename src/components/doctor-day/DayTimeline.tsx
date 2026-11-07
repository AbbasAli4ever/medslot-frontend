"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import { formatLongDate } from "@/lib/date";
import type { DaySlot, DaySlotAppointment } from "@/lib/types";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { usePopover } from "@/hooks/usePopover";
import { PlusIcon } from "../icons";
import { StatusBadge } from "../StatusBadge";
import { BottomSheet } from "../ui/BottomSheet";

interface DayTimelineProps {
  date: string;
  slots: DaySlot[];
  highlightId: number | null;
  onBook: (start: string) => void;
}

/** Same rhythm as the booking drawer's time grid. */
const list = { hidden: {}, show: { transition: { staggerChildren: 0.02 } } };
const pill = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } };

const PILL =
  "relative flex h-10 w-full items-center justify-center gap-1.5 rounded-full border px-3 text-sm font-medium tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600";

/** The day's 30-minute slots as pills: free ones book, booked ones show the patient. */
export function DayTimeline({ date, slots, highlightId, onBook }: DayTimelineProps) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 md:p-5" aria-labelledby="day-slots-title">
      <h3 id="day-slots-title" className="text-xs font-medium tracking-wide text-muted uppercase">
        {formatLongDate(date)}
      </h3>
      <motion.ul
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
        variants={list}
        initial="hidden"
        animate="show"
      >
        {slots.map((slot, index) => (
          <motion.li key={slot.start} variants={pill}>
            {slot.appointment ? (
              <AppointmentPill
                slot={slot}
                appointment={slot.appointment}
                highlighted={slot.appointment.id === highlightId}
                alignEnd={index % 4 >= 2}
              />
            ) : slot.status === "free" ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => onBook(slot.start)}
                aria-label={`Book ${slot.start} to ${slot.end}`}
                className={clsx(PILL, "group border-line bg-white text-ink hover:border-emerald-500 hover:text-emerald-700")}
              >
                {slot.start}
                <PlusIcon
                  width={14}
                  height={14}
                  className="-mr-1 w-0 opacity-0 transition-all group-hover:w-3.5 group-hover:opacity-100 group-focus-visible:w-3.5 group-focus-visible:opacity-100"
                />
              </motion.button>
            ) : (
              <button
                type="button"
                disabled
                aria-label={`${slot.start}, past`}
                className={clsx(PILL, "cursor-not-allowed border-transparent bg-zinc-50 text-zinc-300")}
              >
                {slot.start}
              </button>
            )}
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}

/** Booked / completed slot: soft filled pill; click for the patient, time range and status. */
function AppointmentPill({
  slot,
  appointment,
  highlighted,
  alignEnd,
}: {
  slot: DaySlot;
  appointment: DaySlotAppointment;
  highlighted: boolean;
  alignEnd: boolean;
}) {
  const isMobile = useIsMobile();
  const { open, setOpen, toggle, rootRef, triggerRef } = usePopover({ dismiss: !isMobile });
  const firstName = appointment.patient_name.trim().split(/\s+/)[0];
  const completed = appointment.status === "completed";
  const detailsId = `slot-${slot.start.replace(":", "")}-details`;

  const details = (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <p id={`${detailsId}-title`} className="truncate font-semibold text-ink">
          {appointment.patient_name}
        </p>
        <StatusBadge status={appointment.status} />
      </div>
      <p className="text-sm text-muted tabular-nums">
        {appointment.start_time} – {appointment.end_time} · {appointment.duration_minutes} min
      </p>
    </div>
  );

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        ref={triggerRef}
        type="button"
        whileTap={{ scale: 0.96 }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${slot.start}, ${completed ? "completed" : "booked"}: ${appointment.patient_name}`}
        onClick={toggle}
        initial={false}
        animate={{
          boxShadow: highlighted
            ? ["0 0 0 0 rgba(16,185,129,0.5)", "0 0 0 6px rgba(16,185,129,0.15)", "0 0 0 0 rgba(16,185,129,0)"]
            : "0 0 0 0 rgba(16,185,129,0)",
        }}
        transition={{ boxShadow: { duration: highlighted ? 1.6 : 0 } }}
        className={clsx(
          PILL,
          "border-transparent",
          completed ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
          open && (completed ? "bg-zinc-200/70" : "bg-emerald-100"),
        )}
      >
        <span>{slot.start}</span>
        <span className="min-w-0 truncate font-normal opacity-80">· {firstName}</span>
      </motion.button>

      {!isMobile && (
        <AnimatePresence>
          {open && (
            <motion.div
              role="dialog"
              aria-labelledby={`${detailsId}-title`}
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className={clsx(
                "absolute top-full z-30 mt-2 w-64 rounded-xl border border-line bg-white p-3.5 shadow-xl shadow-zinc-900/10",
                alignEnd ? "right-0 origin-top-right" : "left-0 origin-top-left",
              )}
            >
              {details}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {isMobile &&
        createPortal(
          <BottomSheet open={open} onClose={() => setOpen(false)} labelledBy={`${detailsId}-title`}>
            <div className="px-5 pb-3">{details}</div>
          </BottomSheet>,
          document.body,
        )}
    </div>
  );
}
