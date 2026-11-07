import clsx from "clsx";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

const controlBase =
  "w-full rounded-xl border bg-white px-3.5 text-base md:text-sm text-ink placeholder:text-zinc-400 transition-colors outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

function controlClass(invalid: boolean | undefined, extra?: string) {
  return clsx(
    controlBase,
    invalid ? "border-red-300 focus:border-red-400 focus:ring-red-500/10" : "border-line hover:border-zinc-300",
    extra,
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Label + control + inline error/hint. */
export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-zinc-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
      className={controlClass(invalid, clsx("h-11 md:h-10", className))}
      {...props}
    />
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={controlClass(invalid, clsx("min-h-20 resize-none py-2.5", className))}
      {...props}
    />
  );
}
