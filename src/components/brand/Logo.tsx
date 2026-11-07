import clsx from "clsx";

export const APP_NAME = "Medslot";

/**
 * Medslot mark: a calendar page whose binding rings sit above a medical cross,
 * on a teal rounded square. Drawn on a 32px grid so it stays crisp at 16px.
 */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${APP_NAME} logo`}
    >
      <defs>
        <linearGradient id="medslot-mark-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#medslot-mark-bg)" />
      {/* calendar page */}
      <rect x="7" y="9" width="18" height="16" rx="4" fill="#fff" />
      {/* binding rings */}
      <rect x="11" y="6" width="2.5" height="6" rx="1.25" fill="#d1fae5" />
      <rect x="18.5" y="6" width="2.5" height="6" rx="1.25" fill="#d1fae5" />
      {/* cross */}
      <path d="M16 13.5v8M12 17.5h8" stroke="#059669" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      <span className="text-[19px] font-semibold tracking-[-0.02em] text-ink">{APP_NAME}</span>
    </span>
  );
}
