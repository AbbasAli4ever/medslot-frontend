"use client";

import clsx from "clsx";
import Image from "next/image";
import type { Doctor } from "@/lib/types";
import { CheckIcon } from "./icons";
import { Skeleton } from "./ui/Skeleton";

interface DoctorPickerProps {
  doctors: Doctor[] | undefined;
  value: number | null;
  onChange: (id: number) => void;
}

export function DoctorPicker({ doctors, value, onChange }: DoctorPickerProps) {
  if (!doctors) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[58px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label="Doctor" className="flex flex-col gap-2">
      {doctors.map((doctor) => {
        const selected = doctor.id === value;
        return (
          <button
            key={doctor.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(doctor.id)}
            className={clsx(
              "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600",
              selected
                ? "border-emerald-500 bg-emerald-50/60 ring-4 ring-emerald-500/10"
                : "border-line hover:border-zinc-300 hover:bg-zinc-50",
            )}
          >
            <DoctorAvatar name={doctor.name} tone={selected ? "solid" : "muted"} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-ink">{doctor.name}</span>
              <span className="block text-xs text-muted">{doctor.specialty}</span>
            </span>
            {selected && <CheckIcon className="text-emerald-600" />}
          </button>
        );
      })}
    </div>
  );
}

/** Generated portraits for the three fixed doctors (public/illustrations). */
const PORTRAITS: Record<string, string> = {
  ali: "/illustrations/doctor-ali.png",
  sara: "/illustrations/doctor-sara.png",
  usman: "/illustrations/doctor-usman.png",
};

/** Round doctor portrait; falls back to an initial badge ("Dr. Sara" -> "S") for unknown names. */
export function DoctorAvatar({
  name,
  tone = "muted",
  className,
}: {
  name: string;
  tone?: "solid" | "soft" | "muted";
  className?: string;
}) {
  const firstName = name.replace(/^Dr\.?\s*/i, "");
  const portrait = PORTRAITS[firstName.toLowerCase()];

  if (portrait) {
    return (
      <span
        aria-hidden="true"
        className={clsx(
          "relative size-9 shrink-0 overflow-hidden rounded-full bg-emerald-100 ring-2 transition-shadow",
          tone === "solid" ? "ring-emerald-500" : "ring-white",
          className,
        )}
      >
        <Image src={portrait} alt="" fill sizes="48px" className="object-cover" />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={clsx(
        "grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold",
        tone === "solid" && "bg-emerald-600 text-white",
        tone === "soft" && "bg-emerald-50 text-emerald-700",
        tone === "muted" && "bg-zinc-100 text-zinc-600",
        className,
      )}
    >
      {firstName.charAt(0).toUpperCase()}
    </span>
  );
}
