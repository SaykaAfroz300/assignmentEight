import type { Metadata } from "next";
import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";
import BrandLoader from "@/components/ui/BrandLoader";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join StudioSpace to book creative studios by the hour or list your own space.",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<BrandLoader fullScreen />}>
      <RegisterForm />
    </Suspense>
  );
}
