"use client";

import type { PatientDetails, PatientErrors } from "@/hooks/useBookingForm";
import { DURATIONS, type Duration } from "@/lib/types";
import { Field, Input, Textarea } from "./ui/Field";
import { Select } from "./ui/Select";

interface PatientFieldsProps {
  details: PatientDetails;
  errors: PatientErrors;
  onChange: (patch: Partial<PatientDetails>) => void;
  onPhoneBlur: () => void;
}

/** Name, phone, duration and reason. One column on phones, two from `sm`. */
export function PatientFields({ details, errors, onChange, onPhoneBlur }: PatientFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name" htmlFor="patient_name" error={errors.patient_name}>
        <Input
          id="patient_name"
          autoComplete="name"
          placeholder="e.g. Ayesha Khan"
          value={details.name}
          invalid={!!errors.patient_name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </Field>
      <Field label="Phone" htmlFor="patient_phone" error={errors.patient_phone} hint="Digits only, 10 to 13 characters.">
        <Input
          id="patient_phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="03001234567"
          maxLength={13}
          value={details.phone}
          invalid={!!errors.patient_phone}
          onChange={(e) => onChange({ phone: e.target.value.trim() })}
          onBlur={onPhoneBlur}
        />
      </Field>
      <Field label="Duration" htmlFor="duration" error={errors.duration_minutes}>
        <Select
          id="duration"
          value={details.duration}
          onChange={(e) => onChange({ duration: Number(e.target.value) as Duration })}
        >
          {DURATIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} minutes
            </option>
          ))}
        </Select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Reason (optional)" htmlFor="reason" error={errors.reason}>
          <Textarea
            id="reason"
            placeholder="Anything the doctor should know"
            value={details.reason}
            invalid={!!errors.reason}
            onChange={(e) => onChange({ reason: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}
