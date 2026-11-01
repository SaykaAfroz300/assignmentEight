import Link from "next/link";
import { BadgeCheck, Headset, LockKeyhole, ShieldCheck } from "lucide-react";

const GUARANTEES = [
  {
    title: "$1M Studio Liability Protection",
    description:
      "Every confirmed booking includes comprehensive property and general production liability coverage for both hosts and visiting crews.",
    icon: ShieldCheck,
    stat: "$1,000,000 Coverage",
  },
  {
    title: "Verified Host & Creator Profiles",
    description:
      "All studio owners and booking producers pass identity verification, acoustic/lighting spec checks, and community review standards.",
    icon: BadgeCheck,
    stat: "100% Vetted Rooms",
  },
  {
    title: "Equipment & Gear Deposit Safety",
    description:
      "Transparent security deposits protect high-value strobes, cinema lenses, vintage mics, and mixing consoles without surprise fees.",
    icon: LockKeyhole,
    stat: "Escrow Protected",
  },
  {
    title: "24/7 On-Call Production Support",
    description:
      "Early call time or late-night mix session? Our production desk assists with slot extensions, check-in codes, and backup stages.",
    icon: Headset,
    stat: "< 5 Min Response",
  },
];

/** Extra Home Section 2: Host Guarantee & Creator Support. */
export default function HostGuarantee() {
  return (
    <section aria-labelledby="guarantee-heading" className="section bg-base-200/50">
      <div className="container-page">
        <div className="glass glow-border overflow-hidden rounded-[2rem] p-8 sm:p-12 lg:p-14">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-5">
              <span className="section-eyebrow">Host Guarantee & Creator Support</span>
              <h2 id="guarantee-heading" className="section-title">
                Built on Trust, <span className="text-gradient">Backed on Set.</span>
              </h2>
              <p className="section-subtitle">
                Whether you&apos;re booking a 40-person commercial stage or hosting your boutique
                recording suite, StudioSpace protects every hour on the call sheet.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/add-studio" className="btn-brand">
                  List Your Studio Space
                </Link>
                <Link href="/about" className="btn-outline-brand">
                  Learn About Our Standards
                </Link>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
              {GUARANTEES.map(({ title, description, icon: Icon, stat }) => (
                <div key={title} className="card-surface flex h-full flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary">
                        <Icon size={22} />
                      </span>
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                        {stat}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-base-content">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-base-content/65">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
