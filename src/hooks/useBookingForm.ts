"use client";

import { useState } from "react";
import { createAppointment, errorMessage, fieldErrors } from "@/lib/api";
import { addMinutesToTime } from "@/lib/date";
import type { Appointment, Duration } from "@/lib/types";
import { useAvailableSlots } from "./useClinicData";

export interface PatientDetails {
  name: string;
  phone: string;
  duration: Duration;
  reason: string;
}

export type PatientErrors = Partial<
  Record<"patient_name" | "patient_phone" | "duration_minutes" | "reason", string>
>;

/** Optional starting point, e.g. a free slot picked on the doctor's day timeline. */
export interface BookingInitial {
  doctorId: number;
  date: string;
  slot: string;
}

const EMPTY_DETAILS: PatientDetails = { name: "", phone: "", duration: 30, reason: "" };

export function validatePhone(phone: string): string | undefined {
  if (!/^\d+$/.test(phone)) return "Use digits only, no spaces or symbols.";
  if (phone.length < 10 || phone.length > 13) return "Phone must be 10 to 13 digits.";
  return undefined;
}

export function validatePatient({ name, phone }: PatientDetails): PatientErrors {
  const errors: PatientErrors = {};
  if (!name.trim()) errors.patient_name = "Enter the patient's name.";
  const phoneError = validatePhone(phone);
  if (phoneError) errors.patient_phone = phoneError;
  return errors;
}

/**
 * All booking state and logic, shared by the desktop drawer and the phone
 * step-by-step flow: selection, patient details, validation and submit.
 */
export function useBookingForm(onBooked: (appointment: Appointment) => void, initial?: BookingInitial) {
  const [doctorId, setDoctorId] = useState<number | null>(initial?.doctorId ?? null);
  const [date, setDate] = useState<string | null>(initial?.date ?? null);
  const [slot, setSlot] = useState<string | null>(initial?.slot ?? null);
  const [details, setDetails] = useState<PatientDetails>(EMPTY_DETAILS);
  const [errors, setErrors] = useState<PatientErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const slots = useAvailableSlots(doctorId, date);

  function pickDoctor(id: number) {
    setDoctorId(id);
    setSlot(null);
    setSubmitError(null);
  }

  function pickDate(value: string) {
    setDate(value);
    setSlot(null);
    setSubmitError(null);
  }

  function pickSlot(value: string) {
    setSlot(value);
    setSubmitError(null);
  }

  function updateDetails(patch: Partial<PatientDetails>) {
    setDetails((prev) => ({ ...prev, ...patch }));
  }

  /** Re-check the phone on blur so the inline error updates as the user fixes it. */
  function checkPhone() {
    if (details.phone) setErrors((prev) => ({ ...prev, patient_phone: validatePhone(details.phone) }));
  }

  /** Validate patient details; returns true when they're good to submit. */
  function validate(): boolean {
    const clientErrors = validatePatient(details);
    setErrors(clientErrors);
    return Object.keys(clientErrors).length === 0;
  }

  /** Returns true on success. On failure the form stays filled and free times refresh. */
  async function submit(): Promise<boolean> {
    if (doctorId === null || date === null || slot === null || !validate()) return false;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createAppointment({
        doctor: doctorId,
        patient_name: details.name.trim(),
        patient_phone: details.phone,
        date,
        start_time: slot,
        duration_minutes: details.duration,
        reason: details.reason.trim() || undefined,
      });
      onBooked(created);
      return true;
    } catch (err) {
      const fields = fieldErrors(err);
      setSubmitError(errorMessage(err));
      setErrors(fields);
      // A clinic-rule error (e.g. the slot was just taken) means the time is
      // no longer valid: drop it so the user picks a fresh one.
      if (Object.keys(fields).length === 0) setSlot(null);
      slots.refetch();
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    doctorId,
    date,
    slot,
    endTime: slot ? addMinutesToTime(slot, details.duration) : null,
    details,
    errors,
    submitError,
    submitting,
    slots,
    pickDoctor,
    pickDate,
    pickSlot,
    updateDetails,
    checkPhone,
    validate,
    submit,
  };
}

export type BookingForm = ReturnType<typeof useBookingForm>;
