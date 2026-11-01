import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

/** Friendly empty state with primary CTA button for zero-result searches, empty bookings, or empty listings. */
export default function EmptyState({
  icon: Icon,
  eyebrow = "Nothing Here Yet",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="glass glow-border mx-auto flex max-w-xl flex-col items-center rounded-3xl px-6 py-14 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-[image:var(--brand-gradient-soft)] text-primary ring-1 ring-primary/30">
        <Icon size={30} strokeWidth={1.9} />
      </span>
      <span className="mt-5 text-xs font-bold uppercase tracking-widest text-primary">
        {eyebrow}
      </span>
      <h3 className="mt-2 font-display text-2xl font-bold text-base-content">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-base-content/65">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-brand mt-6">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button type="button" onClick={onAction} className="btn-brand mt-6">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

