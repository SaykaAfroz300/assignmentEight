"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    // Simulated request - wiring to a real mailing list is an easy later upgrade.
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    setEmail("");
    toast.success("You're on the list! Fresh studio drops are on the way.");
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm items-center gap-2 rounded-full border border-base-content/15 bg-base-content/5 p-1.5 pl-5 focus-within:border-primary">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@creative.com"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-base-content/40"
      />
      <button type="submit" id="newsletter-submit" aria-label="Subscribe" disabled={busy} className="btn-brand size-10 !min-h-0 !p-0">
        {busy ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
      </button>
    </form>
  );
}
