"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMe, type StaffUser } from "@/lib/auth";
import { clearToken, getToken, UNAUTHORIZED_EVENT } from "@/lib/session";

/**
 * Gate for staff-only pages: no token → /login; otherwise confirm it with /auth/me/.
 * Any later 401 from the API (expired token) also sends the user back to /login.
 */
export function useSession() {
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    const controller = new AbortController();
    fetchMe(controller.signal)
      .then(setUser)
      .catch((err: unknown) => {
        if ((err as Error).name !== "AbortError") router.replace("/login");
      });

    const onUnauthorized = () => router.replace("/login");
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      controller.abort();
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, [router]);

  const logout = useCallback(() => {
    clearToken();
    router.replace("/login");
  }, [router]);

  return { user, logout };
}
