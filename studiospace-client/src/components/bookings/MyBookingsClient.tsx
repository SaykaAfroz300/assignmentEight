"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileDown,
  Loader2,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmModal";
import EmptyState from "@/components/ui/EmptyState";
import StudioCardSkeleton from "@/components/ui/StudioCardSkeleton";
import { api } from "@/lib/api";
import { downloadBookingInvoicePdf } from "@/lib/invoicePdf";
import {
  formatHourLabel,
  type Booking,
  type BookingStatus,
} from "@/lib/types";

const STATUS_BADGE_STYLES: Record<BookingStatus, string> = {
  Pending: "border-warning/40 bg-warning/15 text-warning",
  Confirmed: "border-emerald-400/40 bg-emerald-500/15 text-emerald-400",
  Completed: "border-sky-400/40 bg-sky-500/15 text-sky-400",
  Cancelled: "border-error/40 bg-error/15 text-error",
};

export default function MyBookingsClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ bookings: Booking[] }>("/bookings");
      setBookings(res.bookings ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch user bookings on mount
    void fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = useMemo(() => {
    if (statusFilter === "All") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await api<{ booking: Booking; message: string }>(
        `/bookings/${cancelTarget._id}/cancel`,
        { method: "PATCH" }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === cancelTarget._id ? res.booking : b))
      );
      toast.success(res.message || "Booking cancelled.");
      setCancelTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel booking.");
    } finally {
      setCancelling(false);
    }
  }

  async function handleStatusTransition(booking: Booking, nextStatus: BookingStatus) {
    setUpdatingId(booking._id);
    try {
      const res = await api<{ booking: Booking; message: string }>(
        `/bookings/${booking._id}/status`,
        {
          method: "PATCH",
          body: { status: nextStatus },
        }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === booking._id ? res.booking : b))
      );
      toast.success(res.message || `Booking marked as ${nextStatus}!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update booking status.");
    } finally {
      setUpdatingId(null);
    }
  }

  function handleDownloadInvoice(booking: Booking) {
    downloadBookingInvoicePdf(booking);
    toast.success(`Invoice ${booking.invoiceNumber}.pdf downloaded!`);
  }

  return (
    <section className="bg-spotlight min-h-[82dvh] py-12 sm:py-16">
      <div className="container-page">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="space-y-2">
            <span className="section-eyebrow">Production Schedule & Invoices</span>
            <h1 className="section-title">
              My <span className="text-gradient">Studio Bookings</span>
            </h1>
            <p className="section-subtitle">
              Track your reserved shoot hours, confirm pending slots, cancel pending holds, or
              download official PDF booking invoices.
            </p>
          </div>

          <Link href="/studios" className="btn-brand self-start md:self-auto">
            <Compass size={17} />
            Book Another Studio
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {(["All", "Pending", "Confirmed", "Completed", "Cancelled"] as const).map(
            (st) => {
              const count =
                st === "All"
                  ? bookings.length
                  : bookings.filter((b) => b.status === st).length;
              const active = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                    active
                      ? "bg-[image:var(--brand-gradient)] text-[#1c1203] shadow-md"
                      : "border border-base-content/15 bg-base-200 text-base-content/75 hover:border-primary"
                  }`}
                >
                  <span>{st}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      active ? "bg-black/20 text-[#1c1203]" : "bg-base-content/10"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {loading ? (
          <StudioCardSkeleton count={3} />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            eyebrow="No Studio Reservations"
            title={
              statusFilter === "All"
                ? "You haven't booked any creative studios yet"
                : `No ${statusFilter.toLowerCase()} bookings found`
            }
            description="Explore vetted photography cyc lofts, soundstages, podcast rooms, and music suites to book your next shoot."
            actionLabel="Explore Available Studios"
            actionHref="/studios"
          />
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((booking) => {
              const isBusy = updatingId === booking._id;
              return (
                <article
                  key={booking._id}
                  className="card-surface overflow-hidden p-5 sm:p-6"
                >
                  <div className="grid items-center gap-6 lg:grid-cols-12">
                    {/* Studio Image & Core Info */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:col-span-6">
                      <Link
                        href={`/studios/${booking.studioId}`}
                        className="relative h-36 w-full shrink-0 overflow-hidden rounded-2xl bg-base-300 sm:h-28 sm:w-44"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={booking.studioImage}
                          alt={booking.studioTitle}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </Link>

                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-0.5 text-xs font-bold ${
                              STATUS_BADGE_STYLES[booking.status]
                            }`}
                          >
                            ● {booking.status}
                          </span>
                          <span className="rounded-full border border-base-content/10 bg-base-content/5 px-2.5 py-0.5 text-[11px] font-medium text-base-content/70">
                            {booking.studioCategory}
                          </span>
                          <span className="font-mono text-xs text-base-content/55">
                            #{booking.invoiceNumber}
                          </span>
                        </div>

                        <h2 className="font-display text-xl font-bold text-base-content">
                          <Link
                            href={`/studios/${booking.studioId}`}
                            className="hover:text-primary"
                          >
                            {booking.studioTitle}
                          </Link>
                        </h2>

                        <p className="flex items-center gap-1.5 text-xs text-base-content/65">
                          <MapPin size={13} className="text-primary" />
                          <span>{booking.studioLocation}</span>
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-medium text-base-content/75">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar size={13} className="text-primary" />
                            {booking.date}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={13} className="text-primary" />
                            {formatHourLabel(booking.startHour)} –{" "}
                            {formatHourLabel(booking.endHour)} ({booking.hours} hr
                            {booking.hours > 1 ? "s" : ""})
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users size={13} className="text-primary" />
                            {booking.guestCount} crew
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="grid grid-cols-3 gap-3 rounded-2xl border border-base-content/10 bg-base-content/5 p-3.5 text-xs lg:col-span-3">
                      <div>
                        <span className="block text-base-content/55">Studio Rate</span>
                        <span className="font-semibold text-base-content">
                          ${booking.subtotal}
                        </span>
                      </div>
                      <div>
                        <span className="block text-base-content/55">Deposit</span>
                        <span className="font-semibold text-base-content">
                          ${booking.securityDeposit}
                        </span>
                      </div>
                      <div>
                        <span className="block text-base-content/55">Total</span>
                        <span className="font-display text-base font-extrabold text-primary">
                          ${booking.totalAmount}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-2.5 lg:col-span-3">
                      {booking.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              void handleStatusTransition(booking, "Confirmed")
                            }
                            className="btn-brand btn-brand-sm"
                          >
                            {isBusy ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={15} />
                            )}
                            Confirm Slot
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setCancelTarget(booking)}
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-error/35 bg-error/10 px-4 text-xs font-semibold text-error transition hover:bg-error hover:text-error-content"
                          >
                            <Ban size={14} />
                            Cancel Booking
                          </button>
                        </>
                      )}

                      {(booking.status === "Confirmed" ||
                        booking.status === "Completed") && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDownloadInvoice(booking)}
                            className="btn-brand btn-brand-sm"
                          >
                            <FileDown size={15} />
                            PDF Invoice
                          </button>
                          {booking.status === "Confirmed" && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                void handleStatusTransition(booking, "Completed")
                              }
                              className="btn-outline-brand btn-sm"
                            >
                              Mark Completed
                            </button>
                          )}
                        </>
                      )}

                      {booking.status === "Cancelled" && (
                        <Link
                          href={`/studios/${booking.studioId}`}
                          className="btn-outline-brand btn-sm"
                        >
                          Rebook Studio
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(cancelTarget)}
        title="Cancel Pending Reservation?"
        description={
          cancelTarget
            ? `Are you sure you want to cancel your pending reservation at "${cancelTarget.studioTitle}" on ${cancelTarget.date} (${formatHourLabel(
                cancelTarget.startHour
              )} – ${formatHourLabel(cancelTarget.endHour)})?`
            : ""
        }
        confirmLabel="Yes, Cancel Booking"
        cancelLabel="Keep Reservation"
        danger
        busy={cancelling}
        onConfirm={() => void handleConfirmCancel()}
        onClose={() => setCancelTarget(null)}
      />
    </section>
  );
}
