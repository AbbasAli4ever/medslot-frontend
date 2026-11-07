/** Where the staff token lives (localStorage), plus a signal for "the server rejected it". */

const TOKEN_KEY = "medslot.token";
export const UNAUTHORIZED_EVENT = "medslot:unauthorized";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* private mode: the session simply won't survive a reload */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
