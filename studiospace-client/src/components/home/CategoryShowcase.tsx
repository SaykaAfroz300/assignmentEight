import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

/**
 * Browse by Studio Categories:
 * Interactive category cards (Photo Studios, Sound Stages, Podcast Rooms, Music Suites, Art Workshops).
 * Clicking any category redirects to /studios with that specific category pre-selected.
 */
export default function CategoryShowcase() {
  return (
    <section aria-labelledby="categories-heading" className="section bg-base-200/50">
      <div className="container-page">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <span className="section-eyebrow">Browse By Discipline</span>
            <h2 id="categories-heading" className="section-title">
              Find the Right Room for <span className="text-gradient">Every Medium</span>
            </h2>
            <p className="section-subtitle">
              Select a studio category to filter workspaces tailored to your shoot, recording session,
              or fabrication build.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.value}
                href={`/studios?category=${encodeURIComponent(cat.value)}`}
                className="card-surface group relative flex h-full flex-col justify-between overflow-hidden p-6"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${cat.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  aria-hidden="true"
                />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="grid size-13 place-items-center rounded-2xl bg-[image:var(--brand-gradient-soft)] text-primary ring-1 ring-primary/25 transition-transform duration-300 group-hover:scale-110">
                    <Icon size={25} strokeWidth={2} />
                  </span>
                  <span className="grid size-9 place-items-center rounded-full border border-base-content/15 text-base-content/60 transition group-hover:border-primary group-hover:bg-primary group-hover:text-[#1c1203]">
                    <ArrowUpRight size={16} />
                  </span>
                </div>

                <div className="relative z-10 mt-8 space-y-2">
                  <h3 className="font-display text-xl font-bold text-base-content group-hover:text-primary">
                    {cat.label}
                  </h3>
                  <p className="text-sm leading-relaxed text-base-content/65">{cat.blurb}</p>
                </div>

                <span className="relative z-10 mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  Explore {cat.label}
                  <ArrowUpRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
