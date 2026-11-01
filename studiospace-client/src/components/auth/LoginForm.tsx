"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, KeyRound, Loader2, LogIn, Mail } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "./AuthShell";
import GoogleButton from "./GoogleButton";
import PasswordInput from "./PasswordInput";
import { authClient } from "@/lib/auth-client";
import { refreshApiToken } from "@/lib/api";
import { isValidEmail } from "@/lib/validation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const DEMO_EXAMINER = {
  name: "Elena Vance",
  email: "host@studiospace.io",
  password: "StudioPass1",
  image:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
};

/** Only allow same-site relative redirects (prevents open-redirect abuse). */
function safeRedirect(target: string | null) {
  return target && target.startsWith("/") && !target.startsWith("//") ? target : "/";
}

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = safeRedirect(params.get("redirect"));
  const { user, isPending } = useCurrentUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already signed in (e.g. returned from Google or opened /login manually) -> go where they wanted.
  useEffect(() => {
    if (!isPending && user && !busy) router.replace(redirectTo);
  }, [isPending, user, busy, router, redirectTo]);

  function fillDemoCredentials() {
    setEmail(DEMO_EXAMINER.email);
    setPassword(DEMO_EXAMINER.password);
    setErrors({});
    setFormError(null);
    toast.info("Examiner test credentials filled! Click Login to continue.");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const next: typeof errors = {};
    if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    const trimmedEmail = email.trim().toLowerCase();
    let { error } = await authClient.signIn.email({ email: trimmedEmail, password });

    // Auto-provision the examiner test account on first login against a fresh database
    if (
      error &&
      trimmedEmail === DEMO_EXAMINER.email &&
      password === DEMO_EXAMINER.password
    ) {
      await authClient.signUp.email({
        name: DEMO_EXAMINER.name,
        email: DEMO_EXAMINER.email,
        password: DEMO_EXAMINER.password,
        image: DEMO_EXAMINER.image,
      });
      const retry = await authClient.signIn.email({
        email: DEMO_EXAMINER.email,
        password: DEMO_EXAMINER.password,
      });
      error = retry.error;
    }

    if (error) {
      const message = error.message || "Invalid email or password.";
      setFormError(message);
      toast.error(message);
      setBusy(false);
      return;
    }
    await refreshApiToken(); // get the Express HTTPOnly JWT before the first protected request
    toast.success("Welcome back! You're logged in.");
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your bookings and studio listings."
      footer={
        <>
          New to StudioSpace?{" "}
          <Link
            href={`/register${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5" aria-label="Login form">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-error/40 bg-error/10 p-3.5 text-sm text-error"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {formError}
          </div>
        )}

        {/* Quick-fill Examiner Credentials Banner */}
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-2.5 text-xs">
          <span className="font-medium text-base-content/80">
            Examiner Account: <strong className="text-primary">host@studiospace.io</strong>
          </span>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 font-bold text-[#1c1203] transition hover:brightness-110"
          >
            <KeyRound size={12} />
            Auto-Fill
          </button>
        </div>

        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-semibold">
            Email
          </label>
          <div className="relative">
            <Mail
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/45"
            />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@creative.com"
              aria-invalid={Boolean(errors.email)}
              className={`field !pl-11 ${errors.email ? "!border-error" : ""}`}
            />
          </div>
          {errors.email && (
            <p role="alert" className="mt-2 text-sm text-error">
              {errors.email}
            </p>
          )}
        </div>

        <PasswordInput
          id="login-password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          error={errors.password}
        />

        <div className="flex justify-end">
          <button
            type="button"
            id="forgot-password"
            onClick={() =>
              toast.info(
                "Password reset is disabled for assignment evaluation. Use the Examiner Auto-Fill button above or register a new account."
              )
            }
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" id="login-submit" disabled={busy} className="btn-brand w-full">
          {busy ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
          {busy ? "Logging in…" : "Login"}
        </button>

        <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-base-content/45">
          <span className="h-px flex-1 bg-base-content/12" />
          or
          <span className="h-px flex-1 bg-base-content/12" />
        </div>

        <GoogleButton callbackURL={redirectTo} />
      </form>
    </AuthShell>
  );
}
