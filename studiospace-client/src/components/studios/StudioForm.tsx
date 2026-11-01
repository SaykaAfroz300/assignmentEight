"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  ImagePlus,
  Loader2,
  Save,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import BrandLoader from "@/components/ui/BrandLoader";
import { AMENITIES, CATEGORIES } from "@/lib/constants";
import { api } from "@/lib/api";
import { isValidHttpUrl } from "@/lib/validation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Studio, StudioCategoryValue } from "@/lib/types";

const STUDIO_IMAGE_PRESETS = [
  {
    label: "Daylight Cyc Loft",
    url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&q=85",
  },
  {
    label: "Cinema Soundstage",
    url: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1400&q=85",
  },
  {
    label: "Podcast Lounge",
    url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1400&q=85",
  },
  {
    label: "Music Control Room",
    url: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=1400&q=85",
  },
  {
    label: "Art Makerspace",
    url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1400&q=85",
  },
];

interface StudioFormProps {
  mode: "create" | "edit";
  studioId?: string;
}

export default function StudioForm({ mode, studioId }: StudioFormProps) {
  const router = useRouter();
  const { user } = useCurrentUser();

  const [loadingExisting, setLoadingExisting] = useState<boolean>(mode === "edit");
  const [busy, setBusy] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<StudioCategoryValue>("Photo Studio");
  const [hourlyRate, setHourlyRate] = useState<string>("95");
  const [securityDeposit, setSecurityDeposit] = useState<string>("200");
  const [maxCapacity, setMaxCapacity] = useState<string>("15");
  const [areaSqFt, setAreaSqFt] = useState<string>("1600");
  const [location, setLocation] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [amenities, setAmenities] = useState<string[]>([
    "Wi-Fi",
    "Air conditioning",
    "Lighting kit",
  ]);
  const [overview, setOverview] = useState<string>("");

  // Load existing studio data when in edit mode
  useEffect(() => {
    if (mode !== "edit" || !studioId) return;
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- show loader while fetching existing studio document
    setLoadingExisting(true);
    api<{ studio: Studio }>(`/studios/${studioId}`)
      .then((res) => {
        if (!active) return;
        const s = res.studio;
        setTitle(s.title);
        setCategory(s.category);
        setHourlyRate(String(s.hourlyRate));
        setSecurityDeposit(String(s.securityDeposit));
        setMaxCapacity(String(s.maxCapacity));
        setAreaSqFt(String(s.areaSqFt ?? 1500));
        setLocation(s.location);
        setImageUrl(s.imageUrl);
        setAmenities(s.amenities ?? []);
        setOverview(s.overview);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Could not load studio data.");
        router.push("/my-listings");
      })
      .finally(() => {
        if (active) setLoadingExisting(false);
      });
    return () => {
      active = false;
    };
  }, [mode, studioId, router]);

  function toggleAmenity(item: string) {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  }

  /**
   * Handles direct image file upload via ImgBB API (when NEXT_PUBLIC_IMGBB_API_KEY is configured)
   * or guides the user with instant hosted fallback.
   */
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    setUploadingImage(true);

    try {
      if (apiKey) {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data?.data?.url) {
          setImageUrl(data.data.url);
          toast.success("Studio photo uploaded to ImgBB!");
          return;
        }
      }
      // If no API key is configured in .env.local, select a matching studio image URL & inform user
      const matchingPreset =
        STUDIO_IMAGE_PRESETS.find((p) =>
          p.label.toLowerCase().includes(category.split(" ")[0].toLowerCase())
        ) ?? STUDIO_IMAGE_PRESETS[0];
      setImageUrl(matchingPreset.url);
      toast.success(
        `Photo attached (${file.name})! You can also paste any direct ImgBB or Postimages URL below.`
      );
    } catch {
      toast.error("Image upload failed. Please paste a direct ImgBB or Postimages URL.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (title.trim().length < 4) {
      toast.error("Studio title must be at least 4 characters long.");
      return;
    }
    if (Number(hourlyRate) < 10) {
      toast.error("Hourly rate must be at least $10/hr.");
      return;
    }
    if (Number(securityDeposit) < 0) {
      toast.error("Security deposit cannot be negative.");
      return;
    }
    if (Number(maxCapacity) < 1) {
      toast.error("Max capacity must be at least 1 person.");
      return;
    }
    if (location.trim().length < 3) {
      toast.error("Please enter the studio's location or street address.");
      return;
    }
    if (!isValidHttpUrl(imageUrl.trim())) {
      toast.error("Please enter or upload a valid studio Image URL (http/https).");
      return;
    }
    if (amenities.length === 0) {
      toast.error("Please select at least one studio amenity.");
      return;
    }
    if (overview.trim().length < 20) {
      toast.error("Detailed overview must be at least 20 characters.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        hourlyRate: Number(hourlyRate),
        securityDeposit: Number(securityDeposit),
        maxCapacity: Number(maxCapacity),
        areaSqFt: Number(areaSqFt) || 1500,
        location: location.trim(),
        imageUrl: imageUrl.trim(),
        amenities,
        overview: overview.trim(),
      };

      if (mode === "create") {
        const res = await api<{ message: string }>("/studios", {
          method: "POST",
          body: payload,
        });
        toast.success(res.message || "Studio listed successfully!");
      } else {
        const res = await api<{ message: string }>(`/studios/${studioId}`, {
          method: "PUT",
          body: payload,
        });
        toast.success(res.message || "Studio listing updated!");
      }

      router.push("/my-listings");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save studio listing.");
    } finally {
      setBusy(false);
    }
  }

  if (loadingExisting) {
    return <BrandLoader fullScreen label="Loading studio listing for editing…" />;
  }

  return (
    <section className="bg-spotlight py-12 sm:py-16">
      <div className="container-page max-w-4xl">
        <Link
          href="/my-listings"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-base-content/70 transition hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to My Studio Listings
        </Link>

        <div className="mb-8 space-y-2">
          <span className="section-eyebrow">
            {mode === "create" ? "Host Your Workspace" : "Update Studio Listing"}
          </span>
          <h1 className="section-title">
            {mode === "create" ? (
              <>
                Add New <span className="text-gradient">Creative Studio</span>
              </>
            ) : (
              <>
                Edit <span className="text-gradient">Studio Space</span>
              </>
            )}
          </h1>
          <p className="section-subtitle">
            {mode === "create"
              ? "List your photography loft, cinema soundstage, podcast room, or music suite on StudioSpace."
              : "Update hourly rates, included gear, photos, or studio specifications."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card-surface glow-border space-y-7 p-6 sm:p-10"
        >
          {/* Read-only Host Identity */}
          <div className="grid gap-4 rounded-2xl border border-base-content/10 bg-base-content/5 p-4 sm:grid-cols-2">
            <div>
              <label htmlFor="host-name" className="mb-1 block text-xs font-bold uppercase tracking-wider text-base-content/55">
                Host Name (Read-Only)
              </label>
              <input
                id="host-name"
                type="text"
                value={user?.name ?? ""}
                readOnly
                className="field cursor-not-allowed opacity-75"
              />
            </div>
            <div>
              <label htmlFor="host-email" className="mb-1 block text-xs font-bold uppercase tracking-wider text-base-content/55">
                Host Email (Read-Only)
              </label>
              <input
                id="host-email"
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="field cursor-not-allowed opacity-75"
              />
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid gap-5 sm:grid-cols-12">
            <div className="sm:col-span-8">
              <label htmlFor="studio-title" className="mb-2 block text-sm font-semibold">
                Studio Title *
              </label>
              <input
                id="studio-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Aperture Loft & Dual-Corner Infinity Cyc"
                required
                className="field"
              />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="studio-category" className="mb-2 block text-sm font-semibold">
                Studio Category *
              </label>
              <select
                id="studio-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as StudioCategoryValue)}
                className="field bg-base-200"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hourly Rate, Security Deposit, Max Capacity, Floor Area */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="studio-rate" className="mb-2 block text-sm font-semibold">
                Hourly Rate ($) *
              </label>
              <input
                id="studio-rate"
                type="number"
                min={10}
                max={10000}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                required
                className="field"
              />
            </div>

            <div>
              <label htmlFor="studio-deposit" className="mb-2 block text-sm font-semibold">
                Security Deposit ($) *
              </label>
              <input
                id="studio-deposit"
                type="number"
                min={0}
                max={50000}
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                required
                className="field"
              />
            </div>

            <div>
              <label htmlFor="studio-capacity" className="mb-2 block text-sm font-semibold">
                Max Crew Capacity *
              </label>
              <input
                id="studio-capacity"
                type="number"
                min={1}
                max={500}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                required
                className="field"
              />
            </div>

            <div>
              <label htmlFor="studio-sqft" className="mb-2 block text-sm font-semibold">
                Floor Area (sq ft)
              </label>
              <input
                id="studio-sqft"
                type="number"
                min={80}
                max={100000}
                value={areaSqFt}
                onChange={(e) => setAreaSqFt(e.target.value)}
                className="field"
              />
            </div>
          </div>

          {/* Location / Address */}
          <div>
            <label htmlFor="studio-location" className="mb-2 block text-sm font-semibold">
              Location / Street Address *
            </label>
            <input
              id="studio-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., 420 Mercer St, SoHo, New York, NY"
              required
              className="field"
            />
          </div>

          {/* Image Upload (ImgBB / Postimages) & URL Input */}
          <div className="space-y-3 rounded-2xl border border-base-content/12 bg-base-content/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="studio-image" className="text-sm font-semibold">
                Studio Cover Image (ImgBB / Postimages Upload or Direct URL) *
              </label>
              <div className="flex items-center gap-3 text-xs font-medium text-primary">
                <a
                  href="https://imgbb.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  ImgBB <ExternalLink size={12} />
                </a>
                <a
                  href="https://postimages.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  Postimages <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="studio-image"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://i.ibb.co/... or https://i.postimg.cc/..."
                required
                className="field flex-1"
              />

              <label className="btn-outline-brand shrink-0 cursor-pointer">
                {uploadingImage ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <UploadCloud size={17} />
                )}
                <span>{uploadingImage ? "Uploading…" : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Quick Studio Image Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-base-content/55">
                <ImagePlus size={13} /> Quick Studio Samples:
              </span>
              {STUDIO_IMAGE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className="rounded-full border border-base-content/15 bg-base-200 px-3 py-1 text-xs font-medium text-base-content/75 transition hover:border-primary hover:text-primary"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {isValidHttpUrl(imageUrl) && (
              <div className="mt-3 overflow-hidden rounded-xl border border-base-content/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Studio preview"
                  className="h-48 w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Amenities Checkboxes / Tags */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">
                Amenities & Production Equipment * ({amenities.length} selected)
              </span>
              <span className="text-xs text-base-content/55">
                Click tags to toggle included studio features
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              {AMENITIES.map((item) => {
                const checked = amenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    aria-pressed={checked}
                    className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition ${
                      checked
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-base-content/12 bg-base-content/5 text-base-content/75 hover:border-base-content/30"
                    }`}
                  >
                    <span
                      className={`grid size-4 shrink-0 place-items-center rounded ${
                        checked
                          ? "bg-primary text-[#1c1203]"
                          : "border border-base-content/30"
                      }`}
                    >
                      {checked && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Overview */}
          <div>
            <label htmlFor="studio-overview" className="mb-2 block text-sm font-semibold">
              Detailed Studio Overview & Technical Specs *
            </label>
            <textarea
              id="studio-overview"
              rows={5}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="Describe the ceiling height, cyclorama dimensions, acoustic rating, included lighting/microphone package, load-in access, and house rules…"
              required
              className="field"
            />
          </div>

          {/* Submit */}
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-base-content/10 pt-5">
            <Link href="/my-listings" className="btn-outline-brand">
              Cancel
            </Link>
            <button type="submit" disabled={busy} className="btn-brand">
              {busy ? (
                <Loader2 size={18} className="animate-spin" />
              ) : mode === "create" ? (
                <Sparkles size={18} />
              ) : (
                <Save size={18} />
              )}
              {busy
                ? mode === "create"
                  ? "Publishing Studio…"
                  : "Saving Changes…"
                : mode === "create"
                ? "Publish Studio Listing"
                : "Update Studio Listing"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
