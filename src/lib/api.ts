import type {
  Appointment,
  AppointmentFilters,
  AvailableSlots,
  ApiErrorBody,
  Doctor,
  NewAppointment,
} from "./types";
import { clearToken, getToken, UNAUTHORIZED_EVENT } from "./session";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers });
  if (res.status === 401 && token) {
    // Expired or invalid session: drop it and let the app send the user to /login.
    clearToken();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}

/* ---------------------------------------------------------------- endpoints */

export function getDoctors(signal?: AbortSignal) {
  return apiFetch<Doctor[]>("/doctors/", { signal });
}

export function listAppointments(filters: AppointmentFilters, signal?: AbortSignal) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    const trimmed = value.trim();
    if (trimmed) params.set(key, trimmed);
  }
  const query = params.toString();
  return apiFetch<Appointment[]>(`/appointments/${query ? `?${query}` : ""}`, { signal });
}

export function createAppointment(input: NewAppointment) {
  return apiFetch<Appointment>("/appointments/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateStatus(id: number, status: "cancelled" | "completed") {
  return apiFetch<Appointment>(`/appointments/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getAvailableSlots(doctorId: number, date: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ doctor: String(doctorId), date });
  return apiFetch<AvailableSlots>(`/appointments/available-slots/?${params}`, { signal });
}

/* ------------------------------------------------------------------- errors */

function isErrorBody(body: unknown): body is ApiErrorBody {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as { detail?: unknown }).detail === "string"
  );
}

/** A message that is always safe to show the user. Prefers the API's `detail`. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (isErrorBody(err.body)) return err.body.detail;
    if (err.status >= 500) return "The server had a problem. Please try again.";
    return `Request failed (${err.status}).`;
  }
  if (err instanceof TypeError) {
    return "Can't reach the clinic server. Check that the backend is running.";
  }
  return "Something went wrong. Please try again.";
}

/** Per-field messages from a validation error, e.g. `{ patient_phone: "..." }`. */
export function fieldErrors(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError) || !isErrorBody(err.body) || !err.body.errors) return {};
  const result: Record<string, string> = {};
  for (const [field, messages] of Object.entries(err.body.errors)) {
    if (Array.isArray(messages) && messages.length > 0) result[field] = String(messages[0]);
  }
  return result;
}
