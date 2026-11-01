"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Heart,
  Loader2,
  MapPin,
  Maximize2,
  MessageSquarePlus,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import BookingModal from "./BookingModal";
import BrandLoader from "@/components/ui/BrandLoader";
import EmptyState from "@/components/ui/EmptyState";
import { Avatar } from "@/components/layout/UserMenu";
import { api } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useWishlist } from "@/hooks/useWishlist";
import {
  formatHourLabel,
  type BookedSlot,
  type Review,
  type Studio,
} from "@/lib/types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&q=85";

export default function StudioDetailsClient({ studioId }: { studioId: string }) {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { isSaved, toggleWishlist } = useWishlist();

  const [studio, setStudio] = useState<Studio | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [bookingOpen, setBookingOpen] = useState<boolean>(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewProjectType, setReviewProjectType] = useState<string>("Commercial Shoot");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  const loadStudio = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{
        studio: Studio;
        reviews: Review[];
        bookedSlots: BookedSlot[];
      }>(`/studios/${studioId}`);
      setStudio(res.studio);
      setReviews(res.reviews ?? []);
      setBookedSlots(res.bookedSlots ?? []);
    } catch {
      setStudio(null);
    } finally {
      setLoading(false);
    }
  }, [studioId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load studio details and reviews on mount
    void loadStudio();
  }, [loadStudio]);

  if (loading) {
    return <BrandLoader fullScreen label="Loading studio specifications…" />;
  }

  if (!studio) {
    return (
      <section className="section">
        <div className="container-page">
          <EmptyState
            icon={Sparkles}
            eyebrow="Studio Not Found"
            title="This creative space isn't available"
            description="The studio listing may have been removed by the host or the link is invalid."
            actionLabel="Explore All Studios"
            actionHref="/studios"
          />
        </div>
      </section>
    );
  }

  const gallery =
    studio.gallery && studio.gallery.length > 0
      ? studio.gallery
      : [studio.imageUrl || FALLBACK_IMAGE];

  const saved = isSaved(studio._id);
  const isOwner =
    user && user.email.toLowerCase() === studio.ownerEmail.toLowerCase();

  function handleBookNowClick() {
    if (!user) {
      toast.info("Please log in to book this studio workspace.");
      router.push(`/login?redirect=${encodeURIComponent(`/studios/${studio!._id}`)}`);
      return;
    }
    setBookingOpen(true);
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.info("Please log in to leave a studio review.");
      router.push(`/login?redirect=${encodeURIComponent(`/studios/${studio!._id}`)}`);
      return;
    }
    if (reviewComment.trim().length < 8) {
      toast.error("Please write at least 8 characters for your review.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api<{
        review: Review;
        rating: number;
        reviewCount: number;
        message: string;
      }>(`/studios/${studio!._id}/reviews`, {
        method: "POST",
        body: {
          rating: reviewRating,
          comment: reviewComment.trim(),
          projectType: reviewProjectType,
        },
      });
      setReviews((prev) => [res.review, ...prev]);
      setStudio((prev) =>
        prev
          ? { ...prev, rating: res.rating, reviewCount: res.reviewCount }
          : prev
      );
      setReviewComment("");
      toast.success(res.message || "Review posted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit review.");
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <section className="bg-spotlight py-10 sm:py-14">
      <div className="container-page">
        {/* Top Breadcrumb + Owner Edit / Wishlist Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/studios"
            className="inline-flex items-center gap-2 text-sm font-semibold text-base-content/75 transition hover:text-primary"
          >
            <ArrowLeft size={16} />
            Back to Explore Studios
          </Link>

          <div className="flex items-center gap-3">
            {isOwner && (
              <Link
                href={`/studios/edit/${studio._id}`}
                className="btn-outline-brand btn-sm"
              >
                <Edit3 size={15} />
                Edit Listing
              </Link>
            )}
            <button
              type="button"
              onClick={() => void toggleWishlist(studio._id)}
              className={`btn-outline-brand btn-sm ${
                saved ? "!border-rose-400/60 !bg-rose-500/15 !text-rose-400" : ""
              }`}
            >
              <Heart size={15} className={saved ? "fill-current" : ""} />
              {saved ? "Saved in Wishlist" : "Save to Wishlist"}
            </button>
          </div>
        </div>

        {/* Studio Header */}
        <div className="mb-8 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[image:var(--brand-gradient)] px-3.5 py-1 text-xs font-bold text-[#1c1203]">
              {studio.category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-base-content/15 bg-base-200 px-3 py-1 text-xs font-semibold">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {Number(studio.rating || 5).toFixed(2)} ({studio.reviewCount ?? reviews.length}{" "}
              reviews)
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-base-content/70">
              <MapPin size={15} className="text-primary" />
              {studio.location}
            </span>
          </div>

          <h1 className="section-title">{studio.title}</h1>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left 8 Columns: Gallery Carousel, Specifications, Overview, Amenities, Host, Reviews */}
          <div className="space-y-8 lg:col-span-8">
            {/* Gallery Carousel */}
            <div className="card-surface overflow-hidden p-3.5">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-base-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gallery[activePhotoIdx] || FALLBACK_IMAGE}
                  alt={`${studio.title} view ${activePhotoIdx + 1}`}
                  className="h-full w-full object-cover"
                />

                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIdx((i) => (i - 1 + gallery.length) % gallery.length)
                      }
                      aria-label="Previous photo"
                      className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:border-primary hover:text-primary"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePhotoIdx((i) => (i + 1) % gallery.length)}
                      aria-label="Next photo"
                      className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:border-primary hover:text-primary"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
                  {gallery.map((url, idx) => (
                    <button
                      key={url + idx}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative h-16 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                        idx === activePhotoIdx
                          ? "border-primary opacity-100"
                          : "border-transparent opacity-60 hover:opacity-90"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Key Workspace Specifications Strip */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="card-surface p-4">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-base-content/55">
                  <Users size={14} className="text-primary" /> Max Crew
                </span>
                <p className="mt-1 font-display text-xl font-bold">
                  Up to {studio.maxCapacity}
                </p>
              </div>
              <div className="card-surface p-4">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-base-content/55">
                  <Maximize2 size={14} className="text-primary" /> Floor Area
                </span>
                <p className="mt-1 font-display text-xl font-bold">
                  {(studio.areaSqFt ?? 1200).toLocaleString()} sq ft
                </p>
              </div>
              <div className="card-surface p-4">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-base-content/55">
                  <Clock size={14} className="text-primary" /> Shoot Hours
                </span>
                <p className="mt-1 font-display text-lg font-bold">
                  {formatHourLabel(studio.openingHour ?? 7)} –{" "}
                  {formatHourLabel(studio.closingHour ?? 22)}
                </p>
              </div>
              <div className="card-surface p-4">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-base-content/55">
                  <ShieldCheck size={14} className="text-primary" /> Deposit
                </span>
                <p className="mt-1 font-display text-xl font-bold">
                  ${studio.securityDeposit}
                </p>
              </div>
            </div>

            {/* Detailed Overview */}
            <div className="card-surface space-y-4 p-7">
              <h2 className="font-display text-2xl font-bold text-base-content">
                Workspace Overview & Production Specs
              </h2>
              <p className="whitespace-pre-line text-base leading-relaxed text-base-content/75">
                {studio.overview}
              </p>
            </div>

            {/* Amenities List */}
            <div className="card-surface space-y-5 p-7">
              <h2 className="font-display text-2xl font-bold text-base-content">
                Included Studio Amenities & Gear
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {(studio.amenities ?? []).map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-center gap-2.5 rounded-xl border border-base-content/10 bg-base-content/5 px-4 py-3 text-sm font-medium"
                  >
                    <CheckCircle2 size={17} className="shrink-0 text-primary" />
                    <span>{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Host Details Card */}
            <div className="card-surface flex flex-col justify-between gap-5 p-7 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <Avatar
                  user={{ name: studio.ownerName, image: studio.ownerAvatar }}
                  size={60}
                />
                <div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
                    <BadgeCheck size={14} /> Verified Studio Host
                  </span>
                  <h3 className="font-display text-xl font-bold text-base-content">
                    Hosted by {studio.ownerName}
                  </h3>
                  <p className="text-xs text-base-content/60">{studio.ownerEmail}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-base-content/10 bg-base-content/5 px-4 py-3 text-xs text-base-content/70">
                <span className="block font-semibold text-base-content">
                  Instant Slot Confirmation Ready
                </span>
                <span>100% response rate · On-site load-in briefing</span>
              </div>
            </div>

            {/* Creator Reviews & Add Review Form */}
            <div className="card-surface space-y-6 p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold text-base-content">
                    Creator Reviews ({reviews.length})
                  </h2>
                  <p className="text-sm text-base-content/65">
                    Feedback from directors, photographers, and engineers who shot here.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-4 py-1.5 font-display text-lg font-bold text-primary">
                  <Star size={18} className="fill-current" />
                  {Number(studio.rating || 5).toFixed(2)}
                </span>
              </div>

              {reviews.length === 0 ? (
                <p className="rounded-2xl border border-base-content/10 bg-base-content/5 p-5 text-sm text-base-content/65">
                  No reviews yet — be the first creator to share feedback on this studio!
                </p>
              ) : (
                <ul className="space-y-4">
                  {reviews.map((rev) => (
                    <li
                      key={rev._id}
                      className="rounded-2xl border border-base-content/10 bg-base-content/5 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Avatar
                            user={{ name: rev.userName, image: rev.userAvatar }}
                            size={38}
                          />
                          <div>
                            <p className="font-semibold text-base-content">{rev.userName}</p>
                            <p className="text-xs text-base-content/55">
                              {rev.projectType} ·{" "}
                              {new Date(rev.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-400">
                          <Star size={13} className="fill-current" />
                          {rev.rating}.0
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-base-content/75">
                        {rev.comment}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {/* Post a Review Form */}
              <form
                onSubmit={handleReviewSubmit}
                className="space-y-4 border-t border-base-content/10 pt-6"
              >
                <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                  <MessageSquarePlus size={18} className="text-primary" />
                  Leave a Studio Review
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="review-rating" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/70">
                      Rating
                    </label>
                    <select
                      id="review-rating"
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="field bg-base-200"
                    >
                      <option value={5}>★★★★★ (5/5 — Exceptional)</option>
                      <option value={4}>★★★★☆ (4/5 — Great)</option>
                      <option value={3}>★★★☆☆ (3/5 — Solid)</option>
                      <option value={2}>★★☆☆☆ (2/5 — Below Average)</option>
                      <option value={1}>★☆☆☆☆ (1/5 — Poor)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="review-project" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/70">
                      Production Type
                    </label>
                    <input
                      id="review-project"
                      type="text"
                      value={reviewProjectType}
                      onChange={(e) => setReviewProjectType(e.target.value)}
                      placeholder="Fashion Editorial, Podcast…"
                      className="field"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="review-comment" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/70">
                    Your Experience on Set
                  </label>
                  <textarea
                    id="review-comment"
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share how the lighting grid, acoustics, or load-in worked for your crew…"
                    className="field"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-outline-brand btn-sm"
                >
                  {submittingReview && <Loader2 size={15} className="animate-spin" />}
                  {submittingReview ? "Posting…" : "Post Review"}
                </button>
              </form>
            </div>
          </div>

          {/* Right 4 Columns: Sticky Booking Card & Live Availability */}
          <div className="lg:col-span-4">
            <div className="card-surface glow-border sticky top-24 space-y-6 p-7">
              <div className="flex items-baseline justify-between border-b border-base-content/10 pb-5">
                <div>
                  <span className="font-display text-3xl font-extrabold text-base-content">
                    ${studio.hourlyRate}
                  </span>
                  <span className="text-sm font-medium text-base-content/60"> / hour</span>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                  ● Instant Booking
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-base-content/75">
                  <span>Minimum booking window</span>
                  <span className="font-semibold text-base-content">1 hour</span>
                </div>
                <div className="flex justify-between text-base-content/75">
                  <span>Refundable gear/security deposit</span>
                  <span className="font-semibold text-base-content">
                    ${studio.securityDeposit}
                  </span>
                </div>
                <div className="flex justify-between text-base-content/75">
                  <span>Max crew & talent capacity</span>
                  <span className="font-semibold text-base-content">
                    {studio.maxCapacity} people
                  </span>
                </div>
                <div className="flex justify-between text-base-content/75">
                  <span>Double-booking protection</span>
                  <span className="font-semibold text-emerald-400">Active</span>
                </div>
              </div>

              <button
                type="button"
                id="book-workspace-now"
                onClick={handleBookNowClick}
                className="btn-brand w-full"
              >
                <CalendarCheck2 size={18} />
                Book Workspace Now
              </button>

              {/* Upcoming Reserved Slots Preview */}
              <div className="space-y-2.5 border-t border-base-content/10 pt-5">
                <span className="block text-xs font-bold uppercase tracking-wider text-base-content/65">
                  Upcoming Reserved Slots
                </span>
                {bookedSlots.length === 0 ? (
                  <p className="text-xs text-base-content/60">
                    No conflicting reservations on the upcoming call sheet. All operating hours
                    open!
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {bookedSlots.slice(0, 4).map((slot) => (
                      <li
                        key={slot._id}
                        className="flex items-center justify-between rounded-xl border border-base-content/10 bg-base-content/5 px-3 py-2 text-xs"
                      >
                        <span className="font-medium">
                          {slot.date} · {formatHourLabel(slot.startHour)} –{" "}
                          {formatHourLabel(slot.endHour)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            slot.status === "Confirmed"
                              ? "bg-error/15 text-error"
                              : "bg-warning/15 text-warning"
                          }`}
                        >
                          {slot.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        open={bookingOpen}
        studio={studio}
        bookedSlots={bookedSlots}
        onClose={() => setBookingOpen(false)}
        onSuccess={() => void loadStudio()}
      />
    </section>
  );
}
