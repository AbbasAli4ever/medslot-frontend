"use client";

import { motion } from "motion/react";
import type { AppointmentStatus } from "@/lib/types";

const STYLES: Record<AppointmentStatus, { label: string; bg: string; fg: string }> = {
  booked: { label: "Booked", bg: "#eff6ff", fg: "#1d4ed8" },
  completed: { label: "Completed", bg: "#ecfdf5", fg: "#047857" },
  cancelled: { label: "Cancelled", bg: "#f4f4f5", fg: "#71717a" },
};

/** Plain tinted pill. Colours animate when the status changes in place. */
export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const style = STYLES[status];
  return (
    <motion.span
      initial={false}
      animate={{ backgroundColor: style.bg, color: style.fg }}
      transition={{ duration: 0.35 }}
      className="inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium"
    >
      {style.label}
    </motion.span>
  );
}
