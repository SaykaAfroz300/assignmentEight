"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Heart, MapPin, Star, Users } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import type { Studio } from "@/lib/types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80";

/**
 * Equal-height, equal-width studio card used across Home Featured Studios, Explore Studios, and Saved Wishlist.
 * Displays studio image, category badge, title, hourly rate ($XX / hr), rating badge, location, wishlist heart, and View Details button.
 */
export default function StudioCard({ studio }: { studio: Studio }) {
  const { isSaved, toggleWishlist } = useWishlist();
  const [imgSrc, setImgSrc] = useState(studio.imageUrl || FALLBACK_IMAGE);
  const saved = isSaved(studio._id);

  return (
    <article className="card-surface group flex h-full flex-col overflow-hidden p-3.5">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-base-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={studio.title}
          loading="lazy"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {/* Category Badge */}
        <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-base-content">
          {studio.category}
        </span>

        {/* Wishlist Heart Button (Optional Requirement) */}
        <button
          type="button"
          onClick={() => void toggleWishlist(studio._id)}
          aria-label={saved ? "Remove from saved studios" : "Save studio to wishlist"}
          title={saved ? "Saved in Wishlist" : "Save to Wishlist"}
          className={` absolute right-3 top-3 grid size-9 place-items-center rounded-full border backdrop-blur-md transition ${
            saved
              ? "border-rose-400/60 bg-rose-500 text-white shadow-lg"
              : "border-white/20 bg-black/45 text-white hover:border-primary hover:text-primary"
          }`}
        >
          <Heart size={16} className={saved ? "fill-current" : ""} />
        </button>

        {/* Rating Badge + Crew Capacity */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-semibold text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-md">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            {Number(studio.rating || 5).toFixed(2)}
            <span className="text-white/70">({studio.reviewCount ?? 1})</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-md">
            <Users size={13} /> Up to {studio.maxCapacity}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-2.5 pt-4">
        <div className="space-y-2">
          <h3 className="line-clamp-1 font-display text-lg font-bold text-base-content transition-colors group-hover:text-primary">
            <Link href={`/studios/${studio._id}`}>{studio.title}</Link>
          </h3>

          <p className="flex items-center gap-1.5 text-xs font-medium text-base-content/65">
            <MapPin size={14} className="shrink-0 text-primary" />
            <span className=" truncate">{studio.location}</span>
          </p>

          <p className="line-clamp-2 text-sm leading-relaxed text-base-content/65">
            {studio.overview}
          </p>
        </div>

        <div className="space-y-3 border-t border-base-content/10 pt-3.5">
          <div className="flex flex-wrap gap-1.5">
            {(studio.amenities ?? []).slice(0, 3).map((item) => (
              <span
                key={item}
                className="rounded-full border border-base-content/10 bg-base-content/5 px-2.5 py-0.5 text-[11px] font-medium text-base-content/70"
              >
                {item}
              </span>
            ))}
            {(studio.amenities?.length ?? 0) > 3 && (
              <span className="rounded-full border border-base-content/10 bg-base-content/5 px-2 py-0.5 text-[11px] font-medium text-base-content/55">
                +{studio.amenities.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div>
              <span className="font-display text-xl font-extrabold text-base-content">
                ${studio.hourlyRate}
              </span>
              <span className="text-xs font-medium text-base-content/60"> / hr</span>
            </div>

            <Link href={`/studios/${studio._id}`} className="btn-brand btn-brand-sm">
              View Details
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

