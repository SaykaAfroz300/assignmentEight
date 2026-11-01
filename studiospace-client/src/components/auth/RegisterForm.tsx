"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ImageIcon, Loader2, Mail, User, UserPlus } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "./AuthShell";
import GoogleButton from "./GoogleButton";
import PasswordChecklist from "./PasswordChecklist";
import PasswordInput from "./PasswordInput";
import { authClient } from "@/lib/auth-client";
import { isValidEmail, isValidHttpUrl, validatePassword } from "@/lib/validation";

type Errors = Partial<Record<"name" | "email" | "photo" | "password", string>>;

export default function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect");

  const [form, setForm] = useState({ name: "", email: "", photo: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (form.photo.trim() && !isValidHttpUrl(form.photo.trim())) next.photo = "Enter a valid image link starting with http(s)://";
    const pwError = validatePassword(form.password);
    if (pwError) next.password = pwError;
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error(Object.values(next)[0] as string);
      return;
    }

    setBusy(true);
    const { error } = await authClient.signUp.email({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      image: form.photo.trim() || undefined,
    });
    setBusy(false);

    if (error) {
      const message = error.message || "We couldn't create your account. Please try again.";
      setFormError(message);
      toast.error(message);
      return;
    }

    toast.success("Account created! Please log in to continue.");
    router.push(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login");
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join StudioSpace to book studios or host your own space."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5" aria-label="Registration form">
        {formError && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-error/40 bg-error/10 p-3.5 text-sm text-error">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {formError}
          </div>
        )}

        <div>
          <label htmlFor="register-name" className="mb-2 block text-sm font-semibold">
            Full name
          </label>
          <div className="relative">
            <User size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/45" />
            <input id="register-name" autoComplete="name" value={form.name} onChange={set("name")} placeholder="Alex Rivera" aria-invalid={Boolean(errors.name)} className={`field !pl-11 ${errors.name ? "!border-error" : ""}`} />
          </div>
          {errors.name && <p role="alert" className="mt-2 text-sm text-error">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="register-email" className="mb-2 block text-sm font-semibold">
            Email
          </label>
          <div className="relative">
            <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/45" />
            <input id="register-email" type="email" autoComplete="email" value={form.email} onChange={set("email")} placeholder="you@creative.com" aria-invalid={Boolean(errors.email)} className={`field !pl-11 ${errors.email ? "!border-error" : ""}`} />
          </div>
          {errors.email && <p role="alert" className="mt-2 text-sm text-error">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="register-photo" className="mb-2 block text-sm font-semibold">
            Photo URL <span className="font-normal text-base-content/50">(optional)</span>
          </label>
          <div className="relative">
            <ImageIcon size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/45" />
            <input id="register-photo" type="url" value={form.photo} onChange={set("photo")} placeholder="https://i.ibb.co/your-photo.jpg" aria-invalid={Boolean(errors.photo)} className={`field !pl-11 ${errors.photo ? "!border-error" : ""}`} />
          </div>
          {errors.photo && <p role="alert" className="mt-2 text-sm text-error">{errors.photo}</p>}
        </div>

        <PasswordInput
          id="register-password"
          label="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          placeholder="Create a password"
          error={errors.password}
          hint={<PasswordChecklist password={form.password} />}
        />

        <button type="submit" id="register-submit" disabled={busy} className="btn-brand w-full">
          {busy ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
          {busy ? "Creating account…" : "Register"}
        </button>

        <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-base-content/45">
          <span className="h-px flex-1 bg-base-content/12" />
          or
          <span className="h-px flex-1 bg-base-content/12" />
        </div>

        <GoogleButton callbackURL={redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/"} label="Sign up with Google" />
      </form>
    </AuthShell>
  );
}
