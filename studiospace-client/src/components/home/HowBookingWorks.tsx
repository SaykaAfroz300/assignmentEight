import Link from "next/link";
import { CalendarClock, Camera, Search, Sparkles } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Discover Spaces",
    description:
      "Filter vetted photography lofts, acoustic stages, podcast lounges, and music rooms by hourly rate, crew capacity, and included gear.",
    icon: Search,
  },
  {
    step: "02",
    title: "Select Shoot Hours",
    description:
      "Inspect real-time slot availability on your shoot date and pick exact load-in to load-out hours with transparent itemized pricing.",
    icon: CalendarClock,
  },
  {
    step: "03",
    title: "Book Instantly",
    description:
      "Lock in your reservation with automatic double-booking protection, escrow security deposit handling, and instant PDF invoice receipts.",
    icon: Sparkles,
  },
  {
    step: "04",
    title: "Create & Produce",
    description:
      "Arrive on set with pre-verified access instructions, high-output lighting and audio backline ready so your crew can roll cameras immediately.",
    icon: Camera,
  },
];

/** Extra Home Section 1: 4-step booking workflow. */
export default function HowBookingWorks() {
  return (
    <section aria-labelledby="workflow-heading" className="section">
      <div className="container-page">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="section-eyebrow">Seamless Production Workflow</span>
          <h2 id="workflow-heading" className="section-title mt-3">
            How <span className="text-gradient">StudioSpace</span> Works
          </h2>
          <p className="section-subtitle mx-auto mt-3">
            From location scouting to wrap, reserve production-ready creative spaces in four clear steps.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ step, title, description, icon: Icon }) => (
            <div key={step} className="card-surface relative flex h-full flex-col justify-between p-7">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid size-13 place-items-center rounded-2xl bg-[image:var(--brand-gradient)] text-[#1c1203] shadow-lg">
                    <Icon size={24} strokeWidth={2.1} />
                  </span>
                  <span className="font-display text-3xl font-extrabold text-base-content/20">
                    {step}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-base-content">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-base-content/65">{description}</p>
              </div>

              <div className="mt-6 h-1 w-14 rounded-full bg-[image:var(--brand-gradient)] opacity-75" />
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/how-it-works" className="btn-outline-brand">
            Read Full Production & Hosting Guide
          </Link>
        </div>
      </div>
    </section>
  );
}
