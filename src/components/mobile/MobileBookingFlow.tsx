"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { errorMessage } from "@/lib/api";
import { firstBookableDay, formatLongDate, formatShortDate, parseISODate, toISODate } from "@/lib/date";
import type { Appointment, Doctor } from "@/lib/types";
import { useBookingForm, type BookingForm } from "@/hooks/useBookingForm";
import { DoctorAvatar, DoctorPicker } from "../DoctorPicker";
import { CalendarIcon, ChevronLeftIcon, InfoIcon, NoteIcon, UserIcon, XIcon } from "../icons";
import { PatientFields } from "../PatientFields";
import { Button } from "../ui/Button";
import { ErrorAlert } from "../ui/ErrorAlert";
import { DayStrip } from "./DayStrip";
import { SlotList } from "./SlotList";

export interface BookingProps {
  onClose: () => void;
  doctors: Doctor[] | undefined;
  onBooked: (appointment: Appointment) => void;
}

const STEPS = ["doctor", "time", "details", "confirm"] as const;
type Step = (typeof STEPS)[number];

/** iOS-style push: new step slides in from the side we're heading to. */
const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-30%", opacity: dir > 0 ? 1 : 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-30%" : "100%", opacity: dir > 0 ? 0 : 1 }),
};

/** Phone booking: doctor → time → details → confirm, one screen at a time. */
export function MobileBookingFlow({ onClose, doctors, onBooked }: BookingProps) {
  const form = useBookingForm(onBooked);
  const [[step, direction], setStep] = useState<[Step, number]>(["doctor", 1]);
  const index = STEPS.indexOf(step);
  const doctor = doctors?.find((d) => d.id === form.doctorId);

  function goTo(next: Step) {
    setStep([next, Math.sign(STEPS.indexOf(next) - index) || 1]);
  }

  function back() {
    if (index === 0) onClose();
    else goTo(STEPS[index - 1]);
  }

  const header: Record<Step, { title: string; subtitle: string }> = {
    doctor: { title: "Choose a doctor", subtitle: "Step 1 of 4" },
    time: {
      title: form.date ? parseISODate(form.date).toLocaleDateString("en-GB", { month: "long" }) : "Choose a time",
      subtitle: `${doctor?.name ?? "Doctor"} · ${form.details.duration} min`,
    },
    details: {
      title: "Your details",
      subtitle: form.date && form.slot ? `${formatShortDate(form.date)} · ${form.slot}` : "Step 3 of 4",
    },
    confirm: { title: "Your appointment", subtitle: "Review and confirm" },
  };

  return (
    <div className="flex h-full flex-col pt-[env(safe-area-inset-top)]">
      <TopBar
        title={header[step].title}
        subtitle={header[step].subtitle}
        isFirst={index === 0}
        progress={(index + 1) / STEPS.length}
        onBack={back}
      />

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 420, damping: 42 }}
            className="absolute inset-0 flex flex-col bg-white"
          >
            {step === "doctor" && (
              <StepBody>
                <DoctorPicker
                  doctors={doctors}
                  value={form.doctorId}
                  onChange={(id) => {
                    form.pickDoctor(id);
                    if (!form.date) form.pickDate(toISODate(firstBookableDay()));
                    goTo("time");
                  }}
                />
              </StepBody>
            )}

            {step === "time" && (
              <>
                <div className="border-b border-line py-3">
                  <DayStrip value={form.date} onChange={form.pickDate} />
                </div>
                <StepBody>
                  <SlotList
                    slots={form.slots.data}
                    error={form.slots.error ? errorMessage(form.slots.error) : null}
                    value={form.slot}
                    onChange={(slot) => {
                      form.pickSlot(slot);
                      goTo("details");
                    }}
                    onRetry={form.slots.refetch}
                  />
                </StepBody>
              </>
            )}

            {step === "details" && (
              <>
                <StepBody>
                  <PatientFields
                    details={form.details}
                    errors={form.errors}
                    onChange={form.updateDetails}
                    onPhoneBlur={form.checkPhone}
                  />
                </StepBody>
                <BottomBar>
                  <Button variant="primary" size="lg" className="w-full" onClick={() => form.validate() && goTo("confirm")}>
                    Continue
                  </Button>
                </BottomBar>
              </>
            )}

            {step === "confirm" && (
              <ConfirmStep
                form={form}
                doctor={doctor}
                onPickTime={() => goTo("time")}
                onEditDetails={() => goTo("details")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- the steps */

interface ConfirmStepProps {
  form: BookingForm;
  doctor: Doctor | undefined;
  onPickTime: () => void;
  onEditDetails: () => void;
}

function ConfirmStep({ form, doctor, onPickTime, onEditDetails }: ConfirmStepProps) {
  const { date, slot, endTime, details, submitError } = form;

  return (
    <>
      <StepBody>
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="relative mx-auto mb-4 size-28 overflow-hidden rounded-3xl"
        >
          <Image src="/illustrations/booking-success.png" alt="" fill sizes="112px" className="object-cover" />
        </motion.div>
        <ul className="flex flex-col divide-y divide-line">
          {doctor && (
            <SummaryRow icon={<DoctorAvatar name={doctor.name} tone="soft" />} title={doctor.name} detail={doctor.specialty} />
          )}
          <SummaryRow
            icon={<IconBubble><CalendarIcon width={18} height={18} /></IconBubble>}
            title={date ? formatLongDate(date) : "—"}
            detail={slot && endTime ? `from ${slot} to ${endTime} · ${details.duration} min` : "Time no longer available"}
          />
          <SummaryRow
            icon={<IconBubble><UserIcon width={18} height={18} /></IconBubble>}
            title={details.name}
            detail={details.phone}
          />
          {details.reason.trim() && (
            <SummaryRow
              icon={<IconBubble><NoteIcon width={18} height={18} /></IconBubble>}
              title="Reason"
              detail={details.reason.trim()}
            />
          )}
        </ul>
      </StepBody>

      <BottomBar>
        <AnimatePresence initial={false}>
          {submitError ? (
            <motion.div key="error" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ErrorAlert message={submitError}>
                {slot === null ? (
                  <button type="button" onClick={onPickTime} className="min-h-11 font-semibold underline underline-offset-4">
                    Pick another time
                  </button>
                ) : (
                  <button type="button" onClick={onEditDetails} className="min-h-11 font-semibold underline underline-offset-4">
                    Edit details
                  </button>
                )}
              </ErrorAlert>
            </motion.div>
          ) : (
            <motion.div
              key="note"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5 rounded-xl bg-canvas px-3.5 py-3 text-sm text-zinc-600"
            >
              <InfoIcon className="mt-0.5 shrink-0 text-zinc-400" />
              <p>You can cancel or mark this visit completed later from the appointments list.</p>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          loading={form.submitting}
          disabled={slot === null}
          onClick={() => void form.submit()}
        >
          {form.submitting ? "Booking…" : "Confirm booking"}
        </Button>
      </BottomBar>
    </>
  );
}

/* ---------------------------------------------------------------- chrome */

function TopBar({
  title,
  subtitle,
  isFirst,
  progress,
  onBack,
}: {
  title: string;
  subtitle: string;
  isFirst: boolean;
  progress: number;
  onBack: () => void;
}) {
  return (
    <header className="relative border-b border-line">
      <div className="grid h-16 grid-cols-[56px_1fr_56px] items-center">
        <button
          type="button"
          onClick={onBack}
          aria-label={isFirst ? "Close" : "Back"}
          className="ml-2 grid size-11 place-items-center rounded-full border border-line text-ink active:bg-zinc-100"
        >
          {isFirst ? <XIcon /> : <ChevronLeftIcon />}
        </button>
        <div className="min-w-0 text-center">
          <h2 id="booking-title" className="truncate text-[16px] font-semibold text-ink">
            {title}
          </h2>
          <p className="truncate text-xs text-muted">{subtitle}</p>
        </div>
      </div>
      <motion.div
        className="absolute bottom-[-1px] left-0 h-0.5 origin-left bg-emerald-600"
        initial={false}
        animate={{ width: `${progress * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 40 }}
      />
    </header>
  );
}

function StepBody({ children }: { children: ReactNode }) {
  return <div className="flex-1 overflow-y-auto px-4 py-5">{children}</div>;
}

function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-line bg-white px-4 pt-3 pb-[max(env(safe-area-inset-bottom),16px)]">
      {children}
    </div>
  );
}

function SummaryRow({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <li className="flex items-center gap-3.5 py-3.5">
      {icon}
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-ink">{title}</p>
        <p className="text-sm break-words text-muted">{detail}</p>
      </div>
    </li>
  );
}

function IconBubble({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-600" aria-hidden="true">
      {children}
    </span>
  );
}
