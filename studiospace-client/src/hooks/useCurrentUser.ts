"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

/**
 * Single auth facade used across the UI. Wraps BetterAuth's session so components never
 * depend on the auth library directly.
 */
export function useCurrentUser() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  const rawUser = data?.user;
  const user: SessionUser | null = useMemo(
    () =>
      rawUser
        ? {
            id: rawUser.id,
            name: rawUser.name,
            email: rawUser.email,
            image: rawUser.image,
          }
        : null,
    [rawUser?.id, rawUser?.name, rawUser?.email, rawUser?.image]
  );

  const logout = useCallback(async () => {
    try {
      // Clear the Express JWT cookie first, then end the BetterAuth session.
      await fetch("/server-api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
      await authClient.signOut();
      toast.success("You've been logged out. See you on set soon!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("We couldn't log you out. Please try again.");
    }
  }, [router]);

  return { user, isPending, logout, sessionId: data?.session?.id ?? null };
}
