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
