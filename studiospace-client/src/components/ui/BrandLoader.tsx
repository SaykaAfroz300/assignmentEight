import { Aperture } from "lucide-react";

/** Branded full-section loader: spinning aperture inside a pulsing spotlight ring. */
export default function BrandLoader({ label = "Setting up the lights…", fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`grid place-items-center ${fullScreen ? "min-h-[70dvh]" : "min-h-[40dvh]"}`}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <span className="absolute inset-0 animate-pulse-ring rounded-full" aria-hidden="true" />
          <span className="grid size-16 place-items-center rounded-full bg-[image:var(--brand-gradient)] text-[#1c1203]">
            <Aperture size={32} className="animate-spin-slow" strokeWidth={2.2} />
          </span>
        </div>
        <p className="text-sm font-medium tracking-wide text-base-content/60">{label}</p>
      </div>
    </div>
  );
}
