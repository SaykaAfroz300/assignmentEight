import { Router } from "express";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError, asyncHandler } from "../middleware/errorHandler.js";
import type { BookingDocument, StudioDocument } from "../models/seedData.js";

const router = Router();

const createBookingSchema = z
  .object({
    studioId: z.string().trim().min(1, "Studio ID is required."),
    date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid shoot date (YYYY-MM-DD)."),
    startHour: z.coerce.number().int().min(0).max(23),
    endHour: z.coerce.number().int().min(1).max(24),
    projectType: z.string().trim().min(2).max(80).default("Commercial Production"),
    guestCount: z.coerce.number().int().min(1).max(500).default(4),
    notes: z.string().trim().max(1000).optional().default(""),
  })
  .refine((d) => d.endHour > d.startHour, {
    message: "End time must be after start time (minimum 1 hour booking).",
    path: ["endHour"],
  });

const statusUpdateSchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Completed", "Cancelled"]),
});

function formatHour(hour: number): string {
  const h = hour % 24;
  const suffix = h >= 12 ? "PM" : "AM";
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve}:00 ${suffix}`;
}

/**
 * GET /api/bookings/studio/:studioId
 * Public helper: returns booked slots (Confirmed & Pending) for a studio to power live availability inspection.
 */
router.get(
  "/studio/:studioId",
  asyncHandler(async (req, res) => {
    const { studioId } = req.params;
    const { date } = req.query as { date?: string };
    const bookings = await getCollection<BookingDocument>("bookings");

    const filter: Record<string, unknown> = {
      studioId: String(studioId),
      status: { $in: ["Confirmed", "Pending"] },
    };
    if (date) filter.date = date;

    const items = await bookings
      .find(filter)
      .sort({ date: 1, startHour: 1 })
      .toArray();

    res.json({
      success: true,
      slots: items.map((b) => ({
        _id: String(b._id),
        date: b.date,
        startHour: b.startHour,
        endHour: b.endHour,
        status: b.status,
      })),
    });
  })
);

/**
 * GET /api/bookings
 * Challenge 1: Protected by HTTPOnly JWT cookie (requireAuth).
 * Returns reservations for the logged-in user (or host bookings when ?role=host).
 */
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const bookings = await getCollection<BookingDocument>("bookings");
    const role = String(req.query.role ?? "renter");

    const filter =
      role === "host"
        ? { hostEmail: req.user!.email }
        : { userEmail: req.user!.email };

    const items = await bookings.find(filter).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, bookings: items });
  })
);

/**
 * POST /api/bookings
 * Challenge 1: Protected by HTTPOnly JWT cookie (requireAuth).
 * Challenge 2: Verifies time overlap against existing "Confirmed" bookings in MongoDB before saving.
 * Saves reservation in `bookings` collection with status "Pending".
 */
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = createBookingSchema.parse(req.body);

    if (!ObjectId.isValid(body.studioId)) {
      throw new HttpError(400, "Invalid studio ID.");
    }

    const studios = await getCollection<StudioDocument>("studios");
    const studio = await studios.findOne({ _id: new ObjectId(body.studioId) });
    if (!studio) {
      throw new HttpError(404, "Studio workspace not found.");
    }

    if (body.guestCount > studio.maxCapacity) {
      throw new HttpError(
        400,
        `Crew size (${body.guestCount}) exceeds this studio's maximum capacity of ${studio.maxCapacity} people.`
      );
    }

    const bookings = await getCollection<BookingDocument>("bookings");

    // Challenge 2: MongoDB interval overlap check against existing "Confirmed" bookings
    // Two intervals [startA, endA) and [startB, endB) overlap iff startA < endB AND endA > startB
    const overlappingConfirmed = await bookings.findOne({
      studioId: String(studio._id),
      date: body.date,
      status: "Confirmed",
      startHour: { $lt: body.endHour },
      endHour: { $gt: body.startHour },
    });

    if (overlappingConfirmed) {
      throw new HttpError(
        409,
        `Double-booking prevented: ${studio.title} is already Confirmed on ${body.date} from ${formatHour(
          overlappingConfirmed.startHour
        )} to ${formatHour(overlappingConfirmed.endHour)}. Please choose non-overlapping hours.`
      );
    }

    const hours = body.endHour - body.startHour;
    const subtotal = Number((hours * studio.hourlyRate).toFixed(2));
    const serviceFee = Math.round(subtotal * 0.08);
    const totalAmount = Number((subtotal + serviceFee + studio.securityDeposit).toFixed(2));
    const now = new Date().toISOString();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceNumber = `SS-${body.date.replace(/-/g, "")}-${randomSuffix}`;

    const doc: BookingDocument = {
      invoiceNumber,
      studioId: String(studio._id),
      studioTitle: studio.title,
      studioCategory: studio.category,
      studioImage: studio.imageUrl,
      studioLocation: studio.location,
      hourlyRate: studio.hourlyRate,
      securityDeposit: studio.securityDeposit,
      hostName: studio.ownerName,
      hostEmail: studio.ownerEmail,
      userId: req.user!.id,
      userEmail: req.user!.email,
      userName: req.user!.name,
      date: body.date,
      startHour: body.startHour,
      endHour: body.endHour,
      hours,
      projectType: body.projectType,
      guestCount: body.guestCount,
      notes: body.notes,
      subtotal,
      serviceFee,
      totalAmount,
      status: "Pending",
      createdAt: now,
      updatedAt: now,
    };

    const inserted = await bookings.insertOne(doc);

    res.status(201).json({
      success: true,
      message: "Studio reservation submitted with status Pending!",
      booking: { ...doc, _id: inserted.insertedId },
    });
  })
);

/**
 * PATCH /api/bookings/:id/cancel
 * Cancels a Pending reservation owned by the user (or studio host).
 */
router.patch(
  "/:id/cancel",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    if (!ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid booking ID.");
    }
    const _id = new ObjectId(id);
    const bookings = await getCollection<BookingDocument>("bookings");
    const existing = await bookings.findOne({ _id });

    if (!existing) {
      throw new HttpError(404, "Booking not found.");
    }

    const email = req.user!.email.toLowerCase();
    if (
      existing.userEmail.toLowerCase() !== email &&
      existing.hostEmail.toLowerCase() !== email
    ) {
      throw new HttpError(403, "Forbidden: you cannot modify this booking.");
    }

    if (existing.status !== "Pending") {
      throw new HttpError(400, `Only Pending bookings can be cancelled (current status: ${existing.status}).`);
    }

    const updatedAt = new Date().toISOString();
    await bookings.updateOne({ _id }, { $set: { status: "Cancelled", updatedAt } });
    const updated = await bookings.findOne({ _id });

    res.json({
      success: true,
      message: "Booking has been cancelled.",
      booking: updated,
    });
  })
);

/**
 * PATCH /api/bookings/:id/status
 * Updates booking status (e.g., Pending -> Confirmed or Completed), verifying Challenge 2 overlap on Confirm.
 */
router.patch(
  "/:id/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    if (!ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid booking ID.");
    }
    const _id = new ObjectId(id);
    const { status } = statusUpdateSchema.parse(req.body);

    const bookings = await getCollection<BookingDocument>("bookings");
    const existing = await bookings.findOne({ _id });
    if (!existing) {
      throw new HttpError(404, "Booking not found.");
    }

    const email = req.user!.email.toLowerCase();
    if (
      existing.userEmail.toLowerCase() !== email &&
      existing.hostEmail.toLowerCase() !== email
    ) {
      throw new HttpError(403, "Forbidden: you cannot update this booking.");
    }

    if (status === "Confirmed") {
      const conflict = await bookings.findOne({
        _id: { $ne: _id } as never,
        studioId: existing.studioId,
        date: existing.date,
        status: "Confirmed",
        startHour: { $lt: existing.endHour },
        endHour: { $gt: existing.startHour },
      });

      if (conflict && String(conflict._id) !== String(_id)) {
        throw new HttpError(
          409,
          `Cannot confirm: overlaps with an existing Confirmed booking (${formatHour(
            conflict.startHour
          )} – ${formatHour(conflict.endHour)}) on ${existing.date}.`
        );
      }
    }

    const updatedAt = new Date().toISOString();
    await bookings.updateOne({ _id }, { $set: { status, updatedAt } });
    const updated = await bookings.findOne({ _id });

    res.json({
      success: true,
      message: `Booking status updated to ${status}.`,
      booking: updated,
    });
  })
);

export default router;

