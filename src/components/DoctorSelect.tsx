"use client";

import type { Doctor } from "@/lib/types";
import { DoctorAvatar } from "./DoctorPicker";
import { UserIcon } from "./icons";
import { Dropdown, type DropdownOption } from "./ui/Dropdown";

interface DoctorSelectProps {
  id: string;
  doctors: Doctor[];
  /** Doctor id as a string, or "" for "All doctors" (only with `allowAll`). */
  value: string;
  onChange: (value: string) => void;
  /** Adds an "All doctors" row at the top (filters). */
  allowAll?: boolean;
  variant?: "pill" | "chip";
  label?: string;
  align?: "start" | "end";
}

/** Doctor dropdown with portraits: name and specialty per row, the selected portrait on the trigger. */
export function DoctorSelect({
  id,
  doctors,
  value,
  onChange,
  allowAll = false,
  variant = "pill",
  label = "Doctor",
  align,
}: DoctorSelectProps) {
  const small = variant === "chip" ? "size-7!" : "size-6!";
  const options: DropdownOption<string>[] = doctors.map((doctor) => ({
    value: String(doctor.id),
    label: doctor.name,
    description: doctor.specialty,
    icon: <DoctorAvatar name={doctor.name} className="size-8!" />,
    triggerIcon: <DoctorAvatar name={doctor.name} className={`${small} -ml-1.5 ring-0!`} />,
  }));

  if (allowAll) {
    options.unshift({
      value: "",
      label: "All doctors",
      description: "Every doctor's appointments",
      icon: (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-500" aria-hidden="true">
          <UserIcon />
        </span>
      ),
    });
  }

  return (
    <Dropdown
      id={id}
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      variant={variant}
      active={allowAll && value !== ""}
      align={align}
    />
  );
}
