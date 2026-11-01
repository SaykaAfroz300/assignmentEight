import type { Metadata } from "next";
import Link from "next/link";
import { Aperture, Award, Compass, Globe2, Users } from "lucide-react";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description: SITE.mission,
};

const STATS = [
  { label: "Verified Production Studios", value: "240+" },
  { label: "Creative Hours Booked", value: "18,500+" },
  { label: "Average Studio Rating", value: "4.93 ★" },
  { label: "Liability Protection Per Shoot", value: "$1M" },
];

export default function AboutPage() {
  return (
    <section className="bg-spotlight py-14 sm:py-20">
      <div className="container-page space-y-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-eyebrow">About StudioSpace</span>
          <h1 className="section-title mt-3">
            Unlocking the World&apos;s Best{" "}
            <span className="text-gradient">Creative Rooms.</span>
          </h1>
          <p className="section-subtitle mx-auto mt-4">{SITE.mission}</p>
        </div>

        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="card-surface p-7 text-center">
              <p className="font-display text-3xl font-extrabold text-primary sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-base-content/65">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-5">
            <span className="section-eyebrow">Why We Built StudioSpace</span>
            <h2 className="section-title">
              Built by Creators Who Were Tired of Opaque Day Rates.
            </h2>
            <p className="text-base leading-relaxed text-base-content/75">
              Independent filmmakers, photographers, podcasters, and musicians shouldn&apos;t have
              to trade emails for three days just to learn whether a cyclorama wall or vocal booth
              is free on Thursday afternoon.
            </p>
            <p className="text-base leading-relaxed text-base-content/75">
              StudioSpace brings real-time slot inspection, verified acoustic and lighting
              inventories, transparent hourly pricing, and automatic double-booking prevention to a
              single peer-to-peer marketplace.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/studios" className="btn-brand">
                <Compass size={17} />
                Browse Studios
              </Link>
              <Link href="/add-studio" className="btn-outline-brand">
                Become a Studio Host
              </Link>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="card-surface p-6">
              <Aperture size={26} className="text-primary" />
              <h3 className="mt-4 font-display text-lg font-bold">True-to-Spec Spaces</h3>
              <p className="mt-2 text-sm text-base-content/65">
                Every listing documents exact floor area, crew capacity, strobes, microphones, and
                load-in access.
              </p>
            </div>
            <div className="card-surface p-6">
              <Users size={26} className="text-primary" />
              <h3 className="mt-4 font-display text-lg font-bold">Creator-First Community</h3>
              <p className="mt-2 text-sm text-base-content/65">
                Direct peer-to-peer bookings keep hourly rates fair for indie crews while rewarding
                local studio owners.
              </p>
            </div>
            <div className="card-surface p-6">
              <Award size={26} className="text-primary" />
              <h3 className="mt-4 font-display text-lg font-bold">Insured Productions</h3>
              <p className="mt-2 text-sm text-base-content/65">
                Every confirmed reservation includes $1M property coverage and clear refundable
                deposit terms.
              </p>
            </div>
            <div className="card-surface p-6">
              <Globe2 size={26} className="text-primary" />
              <h3 className="mt-4 font-display text-lg font-bold">Multi-Discipline Network</h3>
              <p className="mt-2 text-sm text-base-content/65">
                From SoHo photo lofts and LA soundstages to Austin podcast rooms and Nashville
                Dolby Atmos suites.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
