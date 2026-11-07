export type AppointmentStatus = "booked" | "completed" | "cancelled";

export const DURATIONS = [15, 30, 45, 60] as const;
export type Duration = (typeof DURATIONS)[number];

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

export interface Appointment {
  id: number;
  /** Doctor id (same as the POST input). */
  doctor: number;
  doctor_detail: Doctor;
  patient_name: string;
  patient_phone: string;
  /** Local date, YYYY-MM-DD. */
  date: string;
  /** HH:MM */
  start_time: string;
  /** HH:MM */
  end_time: string;
  duration_minutes: number;
  reason: string;
  status: AppointmentStatus;
  created_at: string;
}

export interface AppointmentFilters {
  doctor: string;
  date: string;
  status: AppointmentStatus | "";
  search: string;
}

export const EMPTY_FILTERS: AppointmentFilters = {
  doctor: "",
  date: "",
  status: "",
  search: "",
};

export interface NewAppointment {
  doctor: number;
  patient_name: string;
  patient_phone: string;
  date: string;
  start_time: string;
  duration_minutes: Duration;
  reason?: string;
}

/** Page sizes the list offers (the API caps page_size at 50). */
export const PAGE_SIZES = [10, 20, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

/** Envelope of every paginated list endpoint. */
export interface Paginated<T> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
}

export type SlotStatus = "free" | "booked" | "past";

export interface DaySlotAppointment {
  id: number;
  patient_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: AppointmentStatus;
}

export interface DaySlot {
  /** HH:MM */
  start: string;
  /** HH:MM */
  end: string;
  status: SlotStatus;
  /** Set for booked slots; a 60-minute visit appears on two consecutive slots. */
  appointment: DaySlotAppointment | null;
}

/** One doctor's 30-minute grid for one day (`/appointments/doctor-day/`). */
export interface DoctorDay {
  doctor: Doctor;
  date: string;
  /** False on Sundays; `slots` is then empty. */
  is_open: boolean;
  summary: Record<SlotStatus, number>;
  slots: DaySlot[];
}

export interface AvailableSlots {
  doctor: Doctor;
  date: string;
  slots: string[];
}

/** Shape of every 4xx body returned by the API. */
export interface ApiErrorBody {
  detail: string;
  errors?: Record<string, string[]>;
}
