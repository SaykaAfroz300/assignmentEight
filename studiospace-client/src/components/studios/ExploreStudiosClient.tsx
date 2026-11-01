"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import StudioCard from "./StudioCard";
import StudioCardSkeleton from "@/components/ui/StudioCardSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import { AMENITIES, CATEGORIES } from "@/lib/constants";
import { api } from "@/lib/api";
import type { Studio } from "@/lib/types";

export default function ExploreStudiosClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("category") || "All";
  const initialQuery = searchParams.get("q") || "";

  const [category, setCategory] = useState<string>(initialCategory);
  const [search, setSearch] = useState<string>(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialQuery);
  const [sort, setSort] = useState<string>("featured");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minCapacity, setMinCapacity] = useState<string>("");
  const [selectedAmenity, setSelectedAmenity] = useState<string>("");

  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync category if user clicks a category link in Footer/Home while on /studios
  useEffect(() => {
    const paramCat = searchParams.get("category") || "All";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync state when URL query param changes
    setCategory(paramCat);
  }, [searchParams]);

  // Debounce text search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 260);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- show skeleton loader while fetching filtered studios
    setLoading(true);

    const params = new URLSearchParams();
    if (category && category !== "All") params.set("category", category);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (sort) params.set("sort", sort);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minCapacity) params.set("minCapacity", minCapacity);
    if (selectedAmenity) params.set("amenity", selectedAmenity);

    api<{ studios: Studio[] }>(`/studios?${params.toString()}`)
      .then((res) => {
        if (active) setStudios(res.studios ?? []);
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
  }, [category, debouncedSearch, sort, maxPrice, minCapacity, selectedAmenity]);

  function selectCategory(nextCat: string) {
    setCategory(nextCat);
    const params = new URLSearchParams(searchParams.toString());
    if (nextCat === "All") params.delete("category");
    else params.set("category", nextCat);
    const qs = params.toString();
    router.replace(qs ? `/studios?${qs}` : "/studios", { scroll: false });
  }

  function resetFilters() {
    setCategory("All");
    setSearch("");
    setDebouncedSearch("");
    setSort("featured");
    setMaxPrice("");
    setMinCapacity("");
    setSelectedAmenity("");
    router.replace("/studios", { scroll: false });
  }

  const hasActiveFilters =
    category !== "All" ||
    Boolean(debouncedSearch) ||
    Boolean(maxPrice) ||
    Boolean(minCapacity) ||
    Boolean(selectedAmenity);

  return (
    <section className="bg-spotlight min-h-[82dvh] py-12 sm:py-16">
      <div className="container-page">
        {/* Page Header */}
        <div className="mb-10 space-y-3">
          <span className="section-eyebrow">Explore Studios</span>
          <h1 className="section-title">
            Discover <span className="text-gradient">Production-Ready</span> Creative Spaces
          </h1>
          <p className="section-subtitle">
            Compare hourly rates, lighting & acoustic specs, crew capacities, and real-time slot
            availability across verified studios.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div
          role="tablist"
          aria-label="Filter by studio category"
          className="mb-6 flex flex-wrap items-center gap-2.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={category === "All"}
            onClick={() => selectCategory("All")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              category === "All"
                ? "bg-[image:var(--brand-gradient)] text-[#1c1203] shadow-md"
                : "border border-base-content/15 bg-base-200/80 text-base-content/75 hover:border-primary"
            }`}
          >
            All Workspaces
          </button>

          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectCategory(cat.value)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-[image:var(--brand-gradient)] text-[#1c1203] shadow-md"
                    : "border border-base-content/15 bg-base-200/80 text-base-content/75 hover:border-primary"
                }`}
              >
                <Icon size={15} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search & Advanced Filter Bar */}
        <div className="glass mb-10 rounded-3xl p-5">
          <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-12">
            {/* Search Input */}
            <div className="relative lg:col-span-4">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/45"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by studio name, city, cyc wall, SM7B…"
                aria-label="Search studios"
                className="field !pl-11"
              />
            </div>

            {/* Max Hourly Rate */}
            <div className="lg:col-span-2">
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                aria-label="Maximum hourly rate"
                className="field bg-base-200"
              >
                <option value="">Any Hourly Rate</option>
                <option value="80">Up to $80 / hr</option>
                <option value="120">Up to $120 / hr</option>
                <option value="180">Up to $180 / hr</option>
                <option value="250">Up to $250 / hr</option>
              </select>
            </div>

            {/* Min Crew Capacity */}
            <div className="lg:col-span-2">
              <select
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
                aria-label="Minimum crew capacity"
                className="field bg-base-200"
              >
                <option value="">Any Crew Size</option>
                <option value="6">6+ Crew</option>
                <option value="12">12+ Crew</option>
                <option value="20">20+ Crew</option>
                <option value="30">30+ Crew</option>
              </select>
            </div>

            {/* Included Amenity */}
            <div className="lg:col-span-2">
              <select
                value={selectedAmenity}
                onChange={(e) => setSelectedAmenity(e.target.value)}
                aria-label="Filter by amenity"
                className="field bg-base-200"
              >
                <option value="">Any Amenity</option>
                {AMENITIES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="lg:col-span-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort studios"
                className="field bg-base-200"
              >
                <option value="featured">Top Rated First</option>
                <option value="newest">Newest Listed</option>
                <option value="price-asc">Rate: Low to High</option>
                <option value="price-desc">Rate: High to Low</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-base-content/10 pt-3.5 text-xs text-base-content/65">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <SlidersHorizontal size={14} className="text-primary" />
              {loading
                ? "Scanning available studio spaces…"
                : `Showing ${studios.length} available workspace${studios.length === 1 ? "" : "s"}`}
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
              >
                <RotateCcw size={13} />
                Reset all filters
              </button>
            )}
          </div>
        </div>

        {/* Studio Grid / Loading / Empty State */}
        {loading ? (
          <StudioCardSkeleton count={6} />
        ) : studios.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            eyebrow="No Matching Studios"
            title="No creative spaces match your current filters"
            description="Try clearing your search query or adjusting the category, hourly rate, or crew capacity filters."
            actionLabel="Reset All Filters"
            onAction={resetFilters}
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
