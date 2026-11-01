"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import StudioCard from "@/components/studios/StudioCard";
import StudioCardSkeleton from "@/components/ui/StudioCardSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import type { Studio } from "@/lib/types";

/**
 * Dynamic Featured Studios Section:
 * Fetches 6 top-rated or newest studio spaces dynamically from MongoDB (/api/studios/featured using .limit(6)).
 */
export default function FeaturedStudios() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api<{ studios: Studio[] }>("/studios/featured")
      .then((res) => {
        if (active) setStudios((res.studios ?? []).slice(0, 6));
      })
      .catch(() => {
        if (active) setStudios([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section aria-labelledby="featured-heading" className="section">
      <div className="container-page">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <span className="section-eyebrow">Curated Production Spaces</span>
            <h2 id="featured-heading" className="section-title">
              Featured <span className="text-gradient">Studio Spaces</span>
            </h2>
            <p className="section-subtitle">
              Top-rated photography cyc stages, acoustic film sets, podcast lounges, and recording
              rooms vetted for instant hourly booking.
            </p>
          </div>

          <Link href="/studios" className="btn-outline-brand self-start md:self-auto">
            Explore All Studios
            <ArrowRight size={17} />
          </Link>
        </div>

        {loading ? (
          <StudioCardSkeleton count={6} />
        ) : studios.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            eyebrow="No Studios Listed Yet"
            title="Be the first host to list a creative studio"
            description="Add your photography loft, soundstage, or podcast room to showcase it to creators."
            actionLabel="Add New Studio"
            actionHref="/add-studio"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {studios.map((studio) => (
              <StudioCard key={studio._id} studio={studio} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
