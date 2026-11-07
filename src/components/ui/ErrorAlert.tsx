import type { ReactNode } from "react";
import { AlertIcon } from "../icons";

/** Inline red alert for API errors, with optional follow-up actions. */
export function ErrorAlert({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
    >
      <AlertIcon className="mt-0.5 shrink-0" />
      <div className="flex flex-1 flex-col items-start gap-1">
        <p>{message}</p>
        {children}
      </div>
    </div>
  );
}
