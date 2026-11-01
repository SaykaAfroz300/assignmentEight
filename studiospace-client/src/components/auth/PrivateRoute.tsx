"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import BrandLoader from "@/components/ui/BrandLoader";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/**
 * Client-side guard for private pages. While the session is still being resolved (page reload)
 * we show the branded loader - we never redirect a logged-in user to /login just because the
 * session hasn't arrived yet.
 */
export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, user, router, pathname]);

  if (isPending || !user) {
    return <BrandLoader fullScreen label={isPending ? "Checking your pass…" : "Redirecting to login…"} />;
  }
  return <>{children}</>;
}
