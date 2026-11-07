import type { DaySlot, DaySlotAppointment } from "@/lib/types";

/** One block on the timeline: a single free/past slot, or a visit spanning one or more slots. */
export type TimelineItem =
  | { kind: "free"; key: string; row: number; span: 1; start: string; end: string }
  | { kind: "past"; key: string; row: number; span: 1; start: string; end: string }
  | {
      kind: "appointment";
      key: string;
      row: number;
      span: number;
      start: string;
      end: string;
      appointment: DaySlotAppointment;
      /** Every slot it covers is already in the past. */
      past: boolean;
    };

/**
 * Turn the API's 30-minute slots into timeline blocks, merging consecutive
 * slots that reference the same appointment (a 60-minute visit fills two).
 * `row` is the 1-based grid row of the block's first slot.
 */
export function buildTimeline(slots: DaySlot[]): TimelineItem[] {
  const items: TimelineItem[] = [];
  slots.forEach((slot, index) => {
    const row = index + 1;
    const appointment = slot.appointment;
    const previous = items[items.length - 1];

    if (appointment) {
      if (previous?.kind === "appointment" && previous.appointment.id === appointment.id) {
        previous.span += 1;
        previous.end = slot.end;
        previous.past = previous.past && slot.status === "past";
        return;
      }
      items.push({
        kind: "appointment",
        key: `appt-${appointment.id}`,
        row,
        span: 1,
        start: slot.start,
        end: slot.end,
        appointment,
        past: slot.status === "past",
      });
      return;
    }

    const base = { row, span: 1 as const, start: slot.start, end: slot.end };
    items.push(
      slot.status === "free"
        ? { kind: "free", key: `free-${slot.start}`, ...base }
        : { kind: "past", key: `past-${slot.start}`, ...base },
    );
  });
  return items;
}
