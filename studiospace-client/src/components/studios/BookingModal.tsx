"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatHourLabel, type BookedSlot, type Studio } from "@/lib/types";

interface BookingModalProps {
  open: boolean;
  studio: Studio;
  bookedSlots: BookedSlot[];
  onClose: () => void;
  onSuccess?: () => void;
}

const PROJECT_TYPES = [
  "Fashion / Editorial Photo Shoot",
  "Commercial Video / Film Production",
  "Podcast / Video Interview",
  "Music Recording / Mixing Session",
  "Brand Campaign / Product Shoot",
  "Art / Fabrication Workshop",
];

function getTomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function BookingModal({
  open,
  studio,
  bookedSlots,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const router = useRouter();
  const openHour = studio.openingHour ?? 7;
  const closeHour = studio.closingHour ?? 22;

  const [date, setDate] = useState<string>(getTomorrowIso);
  const [startHour, setStartHour] = useState<number>(Math.max(openHour, 10));
  const [endHour, setEndHour] = useState<number>(Math.min(closeHour, 14));
  const [projectType, setProjectType] = useState<string>(PROJECT_TYPES[0]);
  const [guestCount, setGuestCount] = useState<number>(Math.min(4, studio.maxCapacity));
  const [notes, setNotes] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clear previous submission error when modal opens
    setErrorMsg(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  const slotsOnSelectedDate = useMemo(
    () => bookedSlots.filter((s) => s.date === date),
    [bookedSlots, date]
  );

  // Instant client-side preview of any Confirmed overlap on the selected date
  const overlappingConfirmedSlot = useMemo(
    () =>
      slotsOnSelectedDate.find(
        (s) =>
          s.status === "Confirmed" &&
          startHour < s.endHour &&
          endHour > s.startHour
      ),
    [slotsOnSelectedDate, startHour, endHour]
  );

  const hours = Math.max(0, endHour - startHour);
  const subtotal = hours * studio.hourlyRate;
  const serviceFee = Math.round(subtotal * 0.08);
  const totalAmount = subtotal + serviceFee + studio.securityDeposit;

  const startOptions = useMemo(() => {
    const list: number[] = [];
    for (let h = openHour; h < closeHour; h++) list.push(h);
    return list;
  }, [openHour, closeHour]);

  const endOptions = useMemo(() => {
    const list: number[] = [];
    for (let h = startHour + 1; h <= closeHour; h++) list.push(h);
    return list;
  }, [startHour, closeHour]);

  function handleStartChange(nextStart: number) {
    setStartHour(nextStart);
    if (endHour <= nextStart) {
      setEndHour(Math.min(closeHour, nextStart + 2));
    }
    setErrorMsg(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (endHour <= startHour) {
      const msg = "End hour must be after start hour.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (guestCount < 1 || guestCount > studio.maxCapacity) {
      const msg = `Crew size must be between 1 and ${studio.maxCapacity} people.`;
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setBusy(true);
    try {
      const res = await api<{ message: string }>("/bookings", {
        method: "POST",
        body: {
          studioId: studio._id,
          date,
          startHour,
          endHour,
          projectType,
          guestCount,
          notes,
        },
      });
      toast.success(res.message || "Studio reserved with status Pending!");
      onSuccess?.();
      onClose();
      router.push("/my-bookings");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not complete booking. Please try another slot.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !busy && onClose()}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22 }}
            className="card-surface glow-border relative z-10 my-8 w-full max-w-xl p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close booking modal"
              className="absolute right-5 top-5 grid size-9 place-items-center rounded-full border border-base-content/15 text-base-content/70 transition hover:border-primary hover:text-base-content"
            >
              <X size={17} />
            </button>

            <span className="section-eyebrow">Instant Studio Reservation</span>
            <h2
              id="booking-modal-title"
              className="mt-1 pr-8 font-display text-2xl font-bold text-base-content"
            >
              {studio.title}
            </h2>
            <p className="mt-1 text-xs font-medium text-base-content/60">
              ${studio.hourlyRate} / hr · Refundable deposit ${studio.securityDeposit} · Max{" "}
              {studio.maxCapacity} crew
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {errorMsg && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-error/40 bg-error/10 p-4 text-sm text-error"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {overlappingConfirmedSlot && !errorMsg && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-3.5 text-xs font-medium text-warning"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>
                    Heads up: {formatHourLabel(overlappingConfirmedSlot.startHour)} –{" "}
                    {formatHourLabel(overlappingConfirmedSlot.endHour)} on {date} is already{" "}
                    <strong>Confirmed</strong>. Double-booking prevention will block overlapping hours.
                  </span>
                </div>
              )}

              {/* Date & Crew Count */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="booking-date" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-base-content/75">
                    <Calendar size={14} className="text-primary" />
                    Shoot Date
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setErrorMsg(null);
                    }}
                    required
                    className="field"
                  />
                </div>

                <div>
                  <label htmlFor="booking-guests" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-base-content/75">
                    <Users size={14} className="text-primary" />
                    Crew / Cast Size (Max {studio.maxCapacity})
                  </label>
                  <input
                    id="booking-guests"
                    type="number"
                    min={1}
                    max={studio.maxCapacity}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    required
                    className="field"
                  />
                </div>
              </div>

              {/* Start & End Hours */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="booking-start" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-base-content/75">
                    <Clock size={14} className="text-primary" />
                    Load-In (Start Hour)
                  </label>
                  <select
                    id="booking-start"
                    value={startHour}
                    onChange={(e) => handleStartChange(Number(e.target.value))}
                    className="field bg-base-200"
                  >
                    {startOptions.map((h) => (
                      <option key={h} value={h}>
                        {formatHourLabel(h)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="booking-end" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-base-content/75">
                    <Clock size={14} className="text-primary" />
                    Wrap (End Hour)
                  </label>
                  <select
                    id="booking-end"
                    value={endHour}
                    onChange={(e) => {
                      setEndHour(Number(e.target.value));
                      setErrorMsg(null);
                    }}
                    className="field bg-base-200"
                  >
                    {endOptions.map((h) => (
                      <option key={h} value={h}>
                        {formatHourLabel(h)} ({h - startHour} hr{h - startHour > 1 ? "s" : ""})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Availability Inspector for Selected Date */}
              <div className="rounded-2xl border border-base-content/10 bg-base-content/5 p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Schedule Status for {date}</span>
                  <span className="text-primary">
                    Operating {formatHourLabel(openHour)} – {formatHourLabel(closeHour)}
                  </span>
                </div>
                {slotsOnSelectedDate.length === 0 ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
                    <CheckCircle2 size={14} />
                    All hours currently open on this date.
                  </p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {slotsOnSelectedDate.map((s) => (
                      <span
                        key={s._id}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          s.status === "Confirmed"
                            ? "border border-error/40 bg-error/15 text-error"
                            : "border border-warning/40 bg-warning/15 text-warning"
                        }`}
                      >
                        {formatHourLabel(s.startHour)} – {formatHourLabel(s.endHour)} ({s.status})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Project Type & Notes */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="booking-project" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/75">
                    Production Type
                  </label>
                  <select
                    id="booking-project"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="field bg-base-200"
                  >
                    {PROJECT_TYPES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="booking-notes" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/75">
                    Load-in / Gear Notes (Optional)
                  </label>
                  <input
                    id="booking-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Need cyc freshly painted, 3-phase power…"
                    className="field"
                  />
                </div>
              </div>

              {/* Transparent Price Breakdown */}
              <div className="rounded-2xl border border-base-content/12 bg-base-300/50 p-4 space-y-2 text-sm">
                <div className="flex justify-between text-base-content/75">
                  <span>
                    ${studio.hourlyRate} × {hours} shoot hour{hours > 1 ? "s" : ""}
                  </span>
                  <span className="font-semibold text-base-content">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base-content/75">
                  <span>Platform production & insurance fee (8%)</span>
                  <span className="font-semibold text-base-content">${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base-content/75">
                  <span>Refundable security deposit</span>
                  <span className="font-semibold text-base-content">
                    ${studio.securityDeposit.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-base-content/10 pt-2.5 font-display text-base font-bold text-base-content">
                  <span>Total Reservation Hold</span>
                  <span className="text-xl text-primary">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs text-base-content/60">
                  <ShieldCheck size={15} className="text-emerald-400" />
                  Saved with status &ldquo;Pending&rdquo; · Free cancellation while pending
                </span>

                <button type="submit" disabled={busy || hours < 1} className="btn-brand">
                  {busy && <Loader2 size={17} className="animate-spin" />}
                  {busy ? "Reserving…" : "Confirm Reservation"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
