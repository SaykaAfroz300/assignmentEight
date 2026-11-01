import Link from "next/link";
import { Aperture } from "lucide-react";
import { SITE } from "@/lib/constants";

/** Same logo style/size is used in the navbar, footer and auth pages. */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label={`${SITE.name} home`} className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid size-10 place-items-center rounded-xl bg-[image:var(--brand-gradient)] text-[#1c1203] shadow-[0_8px_24px_-8px_#ff6b4a]">
        <Aperture size={22} strokeWidth={2.2} className="transition-transform duration-700 group-hover:rotate-180" />
      </span>
      <span className="font-display text-[1.35rem] font-bold tracking-tight text-base-content">
        Studio<span className="text-gradient">Space</span>
      </span>
    </Link>
  );
}
