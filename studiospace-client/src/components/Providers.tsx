"use client";

import { Toaster } from "sonner";
import AuthSync from "@/components/auth/AuthSync";
import { ThemeProvider, useTheme } from "@/components/theme/ThemeProvider";
import { WishlistProvider } from "@/hooks/useWishlist";

/** Sonner toaster that follows the active StudioSpace theme. */
function ThemedToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster
      theme={isDark ? "dark" : "light"}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: { fontFamily: "var(--font-inter), sans-serif", borderRadius: "1rem" },
      }}
    />
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthSync />
      <WishlistProvider>
        {children}
        <ThemedToaster />
      </WishlistProvider>
    </ThemeProvider>
  );
}
