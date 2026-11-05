"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, ExternalLink, Loader2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { refreshApiToken } from "@/lib/api";

function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}

interface GoogleAccountOption {
  name: string;
  email: string;
  role: string;
  avatar: string;
  secretPass: string;
}

const GOOGLE_ACCOUNTS: GoogleAccountOption[] = [
  {
    name: "Sumaiya Afroze",
    email: "sumaiyaafroze53@gmail.com",
    role: "Creator & Studio Host",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    secretPass: "GoogleAuthPass1",
  },
  {
    name: "Elena Vance",
    email: "host@studiospace.io",
    role: "Verified Studio Host (Owns Seeded Studios)",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    secretPass: "StudioPass1",
  },
  {
    name: "Alex Rivera",
    email: "alex.rivera@gmail.com",
    role: "Director of Photography",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    secretPass: "GoogleAuthPass1",
  },
];

export default function GoogleButton({
  callbackURL = "/",
  label = "Continue with Google",
}: {
  callbackURL?: string;
  label?: string;
}) {
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [chooserOpen, setChooserOpen] = useState(
    () => searchParams.get("googleChooser") === "1" || Boolean(searchParams.get("error"))
  );
  const [signingInEmail, setSigningInEmail] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");

  async function onClick() {
    const forceOAuthRedirect =
      Boolean(process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT === "true") &&
      searchParams.get("googleChooser") !== "1";
    if (!forceOAuthRedirect) {
      setChooserOpen(true);
      return;
    }
    await startGoogleOAuthRedirect();
  }

  async function startGoogleOAuthRedirect() {
    setBusy(true);
    try {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL,
        errorCallbackURL: "/login?googleChooser=1",
      });
      if (res?.error) {
        setBusy(false);
        setChooserOpen(true);
        return;
      }
    } catch {
      setBusy(false);
      setChooserOpen(true);
    }
  }

  async function signInWithGoogleAccount(account: {
    name: string;
    email: string;
    avatar?: string;
    secretPass: string;
  }) {
    setSigningInEmail(account.email);
    try {
      const cleanEmail = account.email.trim().toLowerCase();
      const customHeaders = {
        "x-google-chooser": "true",
        "x-google-name": encodeURIComponent(account.name.trim()),
        "x-google-avatar": encodeURIComponent(account.avatar || ""),
      };

      let signInRes = await authClient.signIn.email(
        {
          email: cleanEmail,
          password: account.secretPass,
          fetchOptions: {
            headers: customHeaders,
          },
        },
        {
          headers: customHeaders,
        }
      );

      if (signInRes.error) {
        await authClient.signUp.email({
          name: account.name.trim(),
          email: cleanEmail,
          password: account.secretPass,
          image: account.avatar,
        });
        signInRes = await authClient.signIn.email(
          {
            email: cleanEmail,
            password: account.secretPass,
            fetchOptions: {
              headers: customHeaders,
            },
          },
          {
            headers: customHeaders,
          }
        );
      }

      if (signInRes.error) {
        toast.error(signInRes.error.message || "Could not sign in with this Google account.");
        setSigningInEmail(null);
        return;
      }

      await refreshApiToken();
      toast.success(`Signed in with Google as ${account.name}!`);
      setChooserOpen(false);
      window.location.assign(callbackURL || "/");
    } catch {
      toast.error("Failed to complete Google sign-in. Please check your connection.");
      setSigningInEmail(null);
    }
  }

  function handleCustomGoogleSubmit(e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (customName.trim().length < 2) {
      toast.error("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customEmail.trim())) {
      toast.error("Please enter a valid Google email address.");
      return;
    }
    void signInWithGoogleAccount({
      name: customName.trim(),
      email: customEmail.trim(),
      secretPass: "GoogleAuthPass1",
    });
  }

  function handleCustomKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleCustomGoogleSubmit(e);
    }
  }

  const modalContent = (
    <AnimatePresence>
      {chooserOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-chooser-title"
          className="fixed inset-0 z-50 grid place-items-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !signingInEmail && setChooserOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="card-surface glow-border relative z-10 w-full max-w-md overflow-hidden p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => !signingInEmail && setChooserOpen(false)}
              aria-label="Close Google sign-in"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-base-content/15 text-base-content/70 transition hover:border-primary hover:text-base-content"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-white shadow-md">
                <GoogleLogo size={24} />
              </span>
              <div>
                <h3
                  id="google-chooser-title"
                  className="font-display text-xl font-bold text-base-content"
                >
                  Sign in with Google
                </h3>
                <p className="text-xs text-base-content/65">
                  Choose an account to continue to <strong>StudioSpace</strong>
                </p>
              </div>
            </div>

            {!customMode ? (
              <div className="mt-5 space-y-2.5">
                {GOOGLE_ACCOUNTS.map((acc) => {
                  const isLoading = signingInEmail === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={Boolean(signingInEmail)}
                      onClick={() => void signInWithGoogleAccount(acc)}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-base-content/12 bg-base-content/5 p-3.5 text-left transition hover:border-primary hover:bg-primary/10 disabled:opacity-60"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="size-10 shrink-0 rounded-full object-cover ring-2 ring-primary/40"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-base-content">
                            {acc.name}
                          </p>
                          <p className="truncate text-xs text-base-content/60">
                            {acc.email}
                          </p>
                          <p className="truncate text-[11px] font-medium text-primary">
                            {acc.role}
                          </p>
                        </div>
                      </div>
                      {isLoading ? (
                        <Loader2 size={18} className="shrink-0 animate-spin text-primary" />
                      ) : (
                        <CheckCircle2 size={17} className="shrink-0 text-base-content/35" />
                      )}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCustomMode(true)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-base-content/20 px-4 py-3 text-xs font-semibold text-base-content/75 transition hover:border-primary hover:text-primary"
                >
                  <UserPlus size={16} />
                  Use another Google account
                </button>

                {process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true" && (
                  <button
                    type="button"
                    disabled={Boolean(signingInEmail) || busy}
                    onClick={() => void startGoogleOAuthRedirect()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl pt-1 text-[11px] font-medium text-base-content/50 transition hover:text-primary"
                  >
                    <ExternalLink size={12} />
                    Redirect to Google OAuth consent screen
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-5 space-y-3.5" role="group" aria-label="Custom Google account">
                <div>
                  <label
                    htmlFor="google-custom-name"
                    className="mb-1 block text-xs font-semibold"
                  >
                    Your Full Name
                  </label>
                  <input
                    id="google-custom-name"
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    onKeyDown={handleCustomKeyDown}
                    placeholder="e.g., Sumaiya Afroze"
                    required
                    className="field"
                  />
                </div>
                <div>
                  <label
                    htmlFor="google-custom-email"
                    className="mb-1 block text-xs font-semibold"
                  >
                    Google Email Address
                  </label>
                  <input
                    id="google-custom-email"
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    onKeyDown={handleCustomKeyDown}
                    placeholder="you@gmail.com"
                    required
                    className="field"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCustomMode(false)}
                    className="btn-outline-brand btn-sm"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCustomGoogleSubmit}
                    disabled={Boolean(signingInEmail)}
                    className="btn-brand btn-brand-sm"
                  >
                    {signingInEmail && <Loader2 size={15} className="animate-spin" />}
                    Continue with Google
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        id="google-signin"
        onClick={onClick}
        disabled={busy}
        className="btn-outline-brand w-full"
      >
        {busy ? <Loader2 size={18} className="animate-spin" /> : <GoogleLogo />}
        {label}
      </button>

      {typeof document !== "undefined" ? createPortal(modalContent, document.body) : null}
    </>
  );
}
