"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Compass,
  Heart,
  ListChecks,
  PlusCircle,
} from "lucide-react";
import StudioCard from "@/components/studios/StudioCard";
import { Avatar } from "@/components/layout/UserMenu";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useWishlist } from "@/hooks/useWishlist";
import { api } from "@/lib/api";
import type { Booking, Studio } from "@/lib/types";

const ACTIONS = [
  {
    href: "/add-studio",
    title: "Add New Studio",
    text: "List a photography loft, soundstage, or podcast room and start earning.",
    icon: PlusCircle,
  },
  {
    href: "/my-listings",
    title: "My Studio Listings",
    text: "Update hourly rates, amenities, or manage your listed spaces.",
    icon: ListChecks,
  },
  {
    href: "/my-bookings",
    title: "My Bookings",
    text: "Track reservation statuses, cancel pending holds, or download PDF invoices.",
    icon: CalendarCheck,
  },
];

export default function DashboardOverview() {
  const { user } = useCurrentUser();
  const { savedStudios } = useWishlist();
  const [myStudios, setMyStudios] = useState<Studio[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);

  const userEmail = user?.email ?? null;

  useEffect(() => {
    if (!userEmail) return;
    api<{ studios: Studio[] }>("/studios/mine")
      .then((r) => setMyStudios(r.studios ?? []))
      .catch(() => {});
    api<{ bookings: Booking[] }>("/bookings")
      .then((r) => setMyBookings(r.bookings ?? []))
      .catch(() => {});
  }, [userEmail]);

  if (!user) return null;

  const confirmedCount = myBookings.filter((b) => b.status === "Confirmed").length;

  return (
    <section className="bg-spotlight py-12 sm:py-16">
      <div className="container-page space-y-12">
        {/* Profile Hero Banner */}
        <div className="glass glow-border flex flex-col items-center justify-between gap-6 rounded-3xl p-8 text-center sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <Avatar user={user} size={88} />
            <div className="min-w-0">
              <span className="section-eyebrow">Creator & Host Dashboard</span>
              <h1 className="section-title mt-2">
                Welcome back,{" "}
                <span className="text-gradient">{user.name.split(" ")[0]}</span>
              </h1>
              <p className="mt-1 truncate text-sm text-base-content/65">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/studios" className="btn-outline-brand btn-sm">
              <Compass size={16} />
              Explore Studios
            </Link>
            <Link href="/add-studio" className="btn-brand btn-brand-sm">
              <PlusCircle size={16} />
              Add New Studio
            </Link>
          </div>
        </div>

        {/* Live Telemetry Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="card-surface p-6">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-base-content/55">
              <ListChecks size={15} className="text-primary" /> My Studio Listings
            </span>
            <p className="mt-2 font-display text-3xl font-extrabold text-base-content">
              {myStudios.length}
            </p>
          </div>
          <div className="card-surface p-6">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-base-content/55">
              <CalendarCheck size={15} className="text-primary" /> Total Bookings
            </span>
            <p className="mt-2 font-display text-3xl font-extrabold text-base-content">
              {myBookings.length}
            </p>
          </div>
          <div className="card-surface p-6">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-base-content/55">
              <CheckCircle2 size={15} className="text-emerald-400" /> Confirmed Shoots
            </span>
            <p className="mt-2 font-display text-3xl font-extrabold text-emerald-400">
              {confirmedCount}
            </p>
          </div>
          <div className="card-surface p-6">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-base-content/55">
              <Heart size={15} className="text-rose-400" /> Saved Wishlist
            </span>
            <p className="mt-2 font-display text-3xl font-extrabold text-rose-400">
              {savedStudios.length}
            </p>
          </div>
        </div>

        {/* Quick Action Cards */}
        <ul className="grid gap-5 md:grid-cols-3">
          {ACTIONS.map(({ href, title, text, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="card-surface flex h-full flex-col justify-between gap-4 p-6"
              >
                <div className="space-y-4">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                    <Icon size={24} />
                  </span>
                  <div>
                    <span className="block font-display text-xl font-bold">{title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-base-content/65">
                      {text}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  Open {title} <ArrowRight size={14} />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Saved Studios Wishlist Section */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="section-eyebrow">Saved Studios Wishlist</span>
              <h2 className="mt-1 font-display text-2xl font-bold">
                Your Favorite Creative Workspaces ({savedStudios.length})
              </h2>
            </div>
            <Link href="/studios" className="btn-outline-brand btn-sm">
              Browse More Studios
            </Link>
          </div>

          {savedStudios.length === 0 ? (
            <div className="card-surface p-8 text-center">
              <p className="text-sm text-base-content/65">
                Tap the heart icon on any studio card to save your favorite workspaces for
                upcoming productions.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {savedStudios.map((studio) => (
                <StudioCard key={studio._id} studio={studio} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
