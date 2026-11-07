/**
 * Entry animation for appointment rows (table rows and phone list rows):
 * fade/slide in with a small stagger, and a soft emerald pulse for a new booking.
 */
export function rowMotion(index: number, highlighted: boolean) {
  return {
    layout: "position" as const,
    initial: { opacity: 0, y: 6 },
    animate: {
      opacity: 1,
      y: 0,
      backgroundColor: highlighted
        ? ["rgba(16,185,129,0.16)", "rgba(16,185,129,0.16)", "rgba(16,185,129,0)"]
        : "rgba(16,185,129,0)",
    },
    exit: { opacity: 0, transition: { duration: 0.15 } },
    transition: {
      delay: Math.min(index, 10) * 0.03,
      duration: 0.25,
      backgroundColor: { duration: highlighted ? 2.4 : 0, times: [0, 0.4, 1] },
    },
  };
}
