import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import BrandLoader from "@/components/ui/BrandLoader";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to StudioSpace to manage your studio bookings and listings.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<BrandLoader fullScreen />}>
      <LoginForm />
    </Suspense>
  );
}
