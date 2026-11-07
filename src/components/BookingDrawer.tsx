"use client";

import { AnimatePresence, motion } from "motion/react";
import type { FormEvent } from "react";
import { errorMessage } from "@/lib/api";
import { formatLongDate } from "@/lib/date";
import { useBookingForm } from "@/hooks/useBookingForm";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { Calendar } from "./Calendar";
import { DoctorPicker } from "./DoctorPicker";
import { XIcon } from "./icons";
import { MobileBookingFlow, type BookingProps } from "./mobile/MobileBookingFlow";
import { PatientFields } from "./PatientFields";
import { SlotPicker } from "./SlotPicker";
import { Button } from "./ui/Button";
import { Drawer } from "./ui/Drawer";
import { ErrorAlert } from "./ui/ErrorAlert";

/** Desktop: two-column drawer. Phones: full-screen step-by-step sheet. */
export function BookingDrawer({ open, ...props }: BookingProps & { open: boolean }) {
  const isMobile = useIsMobile();
  return (
    <Drawer open={open} onClose={props.onClose} labelledBy="booking-title">
      {isMobile ? <MobileBookingFlow {...props} /> : <DesktopBookingForm {...props} />}
    </Drawer>
  );
}

function DesktopBookingForm({ onClose, doctors, onBooked, initial }: BookingProps) {
  const form = useBookingForm(onBooked, initial);
  const { doctorId, date, slot, details } = form;
  const doctor = doctors?.find((d) => d.id === doctorId);
  // Keep typed details on screen even if the chosen slot was just taken.
  const showPatient = slot !== null || details.name !== "" || details.phone !== "";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void form.submit();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col">
      <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <h2 id="booking-title" className="text-lg font-semibold tracking-tight text-ink">
            Book appointment
          </h2>
          <p className="mt-0.5 text-sm text-muted">Choose a doctor, a day and a free time.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-9 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-ink"
        >
          <XIcon />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-8 px-6 py-6 md:grid-cols-[300px_1fr]">
          {/* Left: who and when */}
          <div className="flex flex-col gap-6">
            <Section title="Doctor">
              <DoctorPicker doctors={doctors} value={doctorId} onChange={form.pickDoctor} />
            </Section>
            <Section title="Day">
              <Calendar id="booking-calendar" value={date} onChange={form.pickDate} />
            </Section>
          </div>

          {/* Right: time + patient */}
          <div className="flex flex-col gap-6">
            <Section title={date ? formatLongDate(date) : "Available times"}>
              <SlotPicker
                ready={doctorId !== null && date !== null}
                slots={form.slots.data}
                error={form.slots.error ? errorMessage(form.slots.error) : null}
                value={slot}
                onChange={form.pickSlot}
                onRetry={form.slots.refetch}
              />
            </Section>

            <AnimatePresence initial={false}>
              {showPatient && (
                <motion.div
                  key="patient"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.22 }}
                >
                  <Section title="Patient">
                    <PatientFields
                      details={details}
                      errors={form.errors}
                      onChange={form.updateDetails}
                      onPhoneBlur={form.checkPhone}
                    />
                  </Section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <footer className="flex flex-col gap-3 border-t border-line bg-canvas/60 px-6 py-4">
        <AnimatePresence>
          {form.submitError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <ErrorAlert message={form.submitError} />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center justify-between gap-4">
          <p className="min-w-0 truncate text-sm text-muted">
            {doctor && date && slot ? (
              <>
                <span className="font-medium text-ink">{doctor.name}</span> · {formatLongDate(date)} · {slot} ·{" "}
                {details.duration} min
              </>
            ) : (
              "Nothing selected yet"
            )}
          </p>
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={form.submitting} disabled={!slot}>
              {form.submitting ? "Booking…" : "Confirm booking"}
            </Button>
          </div>
        </div>
      </footer>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-medium tracking-wide text-muted uppercase">{title}</h3>
      {children}
    </section>
  );
}
