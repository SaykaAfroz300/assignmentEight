"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Studio } from "@/lib/types";

interface WishlistContextValue {
  savedIds: Set<string>;
  savedStudios: Studio[];
  loading: boolean;
  isSaved: (studioId: string) => boolean;
  toggleWishlist: (studioId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentUser();
  const userEmail = user?.email ?? null;
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savedStudios, setSavedStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!userEmail) {
      setSavedIds(new Set());
      setSavedStudios([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api<{ studioIds: string[]; studios: Studio[] }>("/wishlist");
      setSavedIds(new Set(res.studioIds));
      setSavedStudios(res.studios ?? []);
    } catch {
      // Quietly ignore when session token is still exchanging
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch of user wishlist when userEmail changes
    void refreshWishlist();
  }, [refreshWishlist]);

  const isSaved = useCallback((studioId: string) => savedIds.has(studioId), [savedIds]);

  const toggleWishlist = useCallback(
    async (studioId: string) => {
      if (!userEmail) {
        toast.info("Please log in to save studios to your wishlist.");
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      const wasSaved = savedIds.has(studioId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(studioId);
        else next.add(studioId);
        return next;
      });

      try {
        const res = await api<{ saved: boolean; message: string }>("/wishlist/toggle", {
          method: "POST",
          body: { studioId },
        });
        toast.success(res.message);
        void refreshWishlist();
      } catch (err) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(studioId);
          else next.delete(studioId);
          return next;
        });
        toast.error(err instanceof Error ? err.message : "Could not update wishlist.");
      }
    },
    [userEmail, savedIds, router, refreshWishlist]
  );

  const value = useMemo(
    () => ({ savedIds, savedStudios, loading, isSaved, toggleWishlist, refreshWishlist }),
    [savedIds, savedStudios, loading, isSaved, toggleWishlist, refreshWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within <WishlistProvider>");
  return ctx;
}
