import { apiFetch } from "./api";
import { setToken } from "./session";

/** Staff login against the backend's signed, stateless tokens. */

export interface StaffUser {
  email: string;
  name: string;
}

interface LoginResponse {
  token: string;
  user: StaffUser;
}

export const DEMO_CREDENTIALS = { email: "staff@medslot.app", password: "medslot123" };

export async function login(email: string, password: string): Promise<StaffUser> {
  const res = await apiFetch<LoginResponse>("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(res.token);
  return res.user;
}

/** Resolves the current staff user, or throws ApiError(401) when the token is missing or expired. */
export function fetchMe(signal?: AbortSignal) {
  return apiFetch<StaffUser>("/auth/me/", { signal });
}
