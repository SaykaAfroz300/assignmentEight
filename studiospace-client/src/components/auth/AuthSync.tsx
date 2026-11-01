"use client";

import { useEffect, useRef } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { refreshApiToken } from "@/lib/api";

/**
 * Challenge 1 glue: whenever a BetterAuth session is active (email login, Google redirect,
 * or just a page reload) exchange it for a fresh HTTPOnly JWT cookie issued by Express.
 * Renders nothing.
 */
export default function AuthSync() {
  const { sessionId } = useCurrentUser();
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId || syncedFor.current === sessionId) return;
    syncedFor.current = sessionId;
    void refreshApiToken();
  }, [sessionId]);

  return null;
}
