import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileDown, Lock, ShieldCheck } from "lucide-react";
import HowBookingWorks from "@/components/home/HowBookingWorks";
import HostGuarantee from "@/components/home/HostGuarantee";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how creators discover, inspect availability, and book production studios on StudioSpace, and how hosts list their rooms.",
};

const FAQ = [
  {
    q: "How does StudioSpace prevent double-booking collisions?",
    a: "Before saving or confirming any reservation, our server checks MongoDB for existing Confirmed bookings on the same studio and shoot date using interval overlap queries (startHour < requestedEndHour AND endHour > requestedStartHour). Any overlapping slot is automatically rejected.",
  },
  {
    q: "Can I cancel a studio booking if my shoot date moves?",
    a: "Yes! Every new reservation begins in Pending status and can be cancelled with one click from your My Bookings page with zero penalty.",
  },
  {
    q: "How do I get an itemized invoice for my production accounting?",
    a: "As soon as a reservation is Confirmed, a 'PDF Invoice' button appears on your My Bookings card. Click it to download an itemized PDF receipt with studio rental, platform insurance fee, and deposit details.",
  },
  {
    q: "How do studio hosts list and manage their workspaces?",
    a: "Log in, open 'Add New Studio', upload your studio photos via ImgBB or Postimages, set your hourly rate, security deposit, crew capacity, and included gear checkboxes, and publish directly to MongoDB.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-spotlight py-14 sm:py-20">
        <div className="container-page text-center">
          <span className="section-eyebrow">Creator & Host Playbook</span>
          <h1 className="section-title mx-auto mt-3 max-w-3xl">
            From Location Scout to Wrap in <span className="text-gradient">Minutes.</span>
          </h1>
          <p className="section-subtitle mx-auto mt-4">
            StudioSpace connects directors, photographers, podcasters, and musicians with vetted
            production rooms featuring transparent hourly rates and real-time slot management.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3.5">
            <Link href="/studios" className="btn-brand">
              Explore Studios <ArrowRight size={17} />
            </Link>
            <Link href="/add-studio" className="btn-outline-brand">
              Host Your Space
            </Link>
          </div>

          <div className="mt-12 grid gap-5 text-left sm:grid-cols-3">
            <div className="card-surface p-6">
              <ShieldCheck size={24} className="text-primary" />
              <h2 className="mt-3 font-display text-lg font-bold">
                Zero Double-Booking Collisions
              </h2>
              <p className="mt-1.5 text-sm text-base-content/65">
                Real-time MongoDB interval checks guarantee your crew never shares a stage with an
                overlapping shoot.
              </p>
            </div>
            <div className="card-surface p-6">
              <Lock size={24} className="text-primary" />
              <h2 className="mt-3 font-display text-lg font-bold">
                HTTPOnly JWT Security
              </h2>
              <p className="mt-1.5 text-sm text-base-content/65">
                Every studio listing, edit, deletion, and booking mutation is authenticated via
                XSS-safe HTTPOnly JWT cookies.
              </p>
            </div>
            <div className="card-surface p-6">
              <FileDown size={24} className="text-primary" />
              <h2 className="mt-3 font-display text-lg font-bold">
                Instant PDF Production Invoices
              </h2>
              <p className="mt-1.5 text-sm text-base-content/65">
                Download official PDF receipts for confirmed bookings ready for client billing and
                studio check-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HowBookingWorks />
      <HostGuarantee />

      <section className="section">
        <div className="container-page max-w-4xl">
          <div className="mb-10 text-center">
            <span className="section-eyebrow">Frequently Asked Questions</span>
            <h2 className="section-title mt-2">
              Production & Hosting <span className="text-gradient">FAQ</span>
            </h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="card-surface p-6">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                  <CheckCircle2 size={18} className="shrink-0 text-primary" />
                  {item.q}
                </h3>
                <p className="mt-2 pl-6 text-sm leading-relaxed text-base-content/70">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

