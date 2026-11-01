import { Router } from "express";
import { ObjectId, type Filter } from "mongodb";
import { z } from "zod";
import { getCollection } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError, asyncHandler } from "../middleware/errorHandler.js";
import type { BookingDocument, ReviewDocument, StudioDocument, WishlistDocument } from "../models/seedData.js";

const router = Router();

const ALLOWED_CATEGORIES = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Art Workshop",
] as const;

const studioPayloadSchema = z.object({
  title: z.string().trim().min(4, "Studio title must be at least 4 characters long.").max(120),
  category: z.enum(ALLOWED_CATEGORIES, {
    message: "Please select a valid studio category.",
  }),
  hourlyRate: z.coerce.number().min(10, "Hourly rate must be at least $10/hr.").max(10000),
  securityDeposit: z.coerce.number().min(0, "Security deposit cannot be negative.").max(50000),
  maxCapacity: z.coerce.number().int().min(1, "Max capacity must be at least 1 person.").max(500),
  location: z.string().trim().min(3, "Location / address is required.").max(160),
  imageUrl: z.string().trim().url("Please provide a valid studio image URL (https://...)."),
  gallery: z.array(z.string().trim().url()).optional(),
  amenities: z.array(z.string().trim().min(1)).min(1, "Select at least one studio amenity."),
  overview: z.string().trim().min(20, "Detailed overview must be at least 20 characters.").max(4000),
  areaSqFt: z.coerce.number().int().min(80).max(100000).optional().default(1200),
  openingHour: z.coerce.number().int().min(0).max(23).optional().default(8),
  closingHour: z.coerce.number().int().min(1).max(24).optional().default(22),
});

const reviewPayloadSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(8, "Review comment must be at least 8 characters.").max(800),
  projectType: z.string().trim().min(2).max(60).optional().default("Creative Production"),
});

function parseObjectId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw new HttpError(400, "Invalid studio ID format.");
  }
  return new ObjectId(id);
}

/**
 * GET /api/studios/featured
 * Home requirement: Fetch dynamically from MongoDB, displaying 6 top-rated or newest studio spaces using .limit(6).
 */
router.get(
  "/featured",
  asyncHandler(async (_req, res) => {
    const studios = await getCollection<StudioDocument>("studios");
    const items = await studios
      .find({})
      .sort({ rating: -1, createdAt: -1 })
      .limit(6)
      .toArray();
    res.json({ success: true, studios: items });
  })
);

/**
 * GET /api/studios/mine
 * Private route helper: returns all studio listings owned by the authenticated host.
 */
router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const studios = await getCollection<StudioDocument>("studios");
    const items = await studios
      .find({ ownerEmail: req.user!.email })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, studios: items });
  })
);

/**
 * GET /api/studios
 * Lists studios with optional category, search query, price range, capacity, amenity, and sort.
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const studios = await getCollection<StudioDocument>("studios");
    const {
      category,
      q,
      search,
      minPrice,
      maxPrice,
      minCapacity,
      amenity,
      ownerEmail,
      sort = "featured",
      limit,
    } = req.query as Record<string, string | undefined>;

    const filter: Filter<StudioDocument> = {};

    if (category && category !== "All") {
      filter.category = category as StudioDocument["category"];
    }
    if (ownerEmail) {
      filter.ownerEmail = ownerEmail;
    }
    if (amenity) {
      filter.amenities = amenity;
    }

    const queryText = (q ?? search ?? "").trim();
    if (queryText) {
      const safe = queryText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safe, "i");
      filter.$or = [
        { title: regex },
        { location: regex },
        { overview: regex },
        { category: regex },
        { amenities: regex },
      ] as Filter<StudioDocument>["$or"];
    }

    let cursor = studios.find(filter);

    if (sort === "newest") {
      cursor = cursor.sort({ createdAt: -1 });
    } else if (sort === "price-asc") {
      cursor = cursor.sort({ hourlyRate: 1 });
    } else if (sort === "price-desc") {
      cursor = cursor.sort({ hourlyRate: -1 });
    } else {
      cursor = cursor.sort({ rating: -1, createdAt: -1 });
    }

    if (limit && Number(limit) > 0) {
      cursor = cursor.limit(Math.min(Number(limit), 50));
    }

    let items = await cursor.toArray();

    // Apply numeric range filters cleanly across both MongoDB and numeric strings
    if (minPrice !== undefined && minPrice !== "") {
      const min = Number(minPrice);
      if (!Number.isNaN(min)) items = items.filter((s) => s.hourlyRate >= min);
    }
    if (maxPrice !== undefined && maxPrice !== "") {
      const max = Number(maxPrice);
      if (!Number.isNaN(max)) items = items.filter((s) => s.hourlyRate <= max);
    }
    if (minCapacity !== undefined && minCapacity !== "") {
      const cap = Number(minCapacity);
      if (!Number.isNaN(cap)) items = items.filter((s) => s.maxCapacity >= cap);
    }

    res.json({ success: true, count: items.length, studios: items });
  })
);

/**
 * GET /api/studios/:id
 * Returns full studio specifications, reviews, and upcoming booked slots.
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const _id = parseObjectId(String(req.params.id));
    const studios = await getCollection<StudioDocument>("studios");
    const studio = await studios.findOne({ _id });
    if (!studio) {
      throw new HttpError(404, "Studio workspace not found.");
    }

    const reviewsCol = await getCollection<ReviewDocument>("reviews");
    const bookingsCol = await getCollection<BookingDocument>("bookings");

    const [reviews, activeBookings] = await Promise.all([
      reviewsCol.find({ studioId: String(_id) }).sort({ createdAt: -1 }).toArray(),
      bookingsCol
        .find({ studioId: String(_id), status: { $in: ["Confirmed", "Pending"] } })
        .sort({ date: 1, startHour: 1 })
        .toArray(),
    ]);

    const bookedSlots = activeBookings.map((b) => ({
      _id: String(b._id),
      date: b.date,
      startHour: b.startHour,
      endHour: b.endHour,
      status: b.status,
    }));

    res.json({
      success: true,
      studio,
      reviews,
      bookedSlots,
    });
  })
);

/**
 * POST /api/studios
 * Challenge 1: Protected by HTTPOnly JWT cookie (requireAuth).
 * Saves new studio listing in MongoDB `studios` collection.
 */
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = studioPayloadSchema.parse(req.body);
    const now = new Date().toISOString();

    const gallery = Array.from(new Set([body.imageUrl, ...(body.gallery ?? [])])).slice(0, 6);

    const doc: StudioDocument = {
      title: body.title,
      category: body.category,
      hourlyRate: body.hourlyRate,
      securityDeposit: body.securityDeposit,
      maxCapacity: body.maxCapacity,
      location: body.location,
      imageUrl: body.imageUrl,
      gallery,
      amenities: body.amenities,
      overview: body.overview,
      areaSqFt: body.areaSqFt,
      openingHour: body.openingHour,
      closingHour: body.closingHour > body.openingHour ? body.closingHour : 22,
      rating: 5.0,
      reviewCount: 1,
      ownerEmail: req.user!.email,
      ownerName: req.user!.name,
      ownerAvatar: req.user!.image ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const studios = await getCollection<StudioDocument>("studios");
    const result = await studios.insertOne(doc);

    res.status(201).json({
      success: true,
      message: "Studio listed on StudioSpace!",
      studio: { ...doc, _id: result.insertedId },
    });
  })
);

/**
 * PUT / PATCH /api/studios/:id
 * Challenge 1: Protected by HTTPOnly JWT cookie (requireAuth).
 * Updates an existing studio listing owned by the authenticated host.
 */
const updateStudioHandler = asyncHandler(async (req, res) => {
  const _id = parseObjectId(String(req.params.id));
  const studios = await getCollection<StudioDocument>("studios");
  const existing = await studios.findOne({ _id });

  if (!existing) {
    throw new HttpError(404, "Studio workspace not found.");
  }
  if (existing.ownerEmail.toLowerCase() !== req.user!.email.toLowerCase()) {
    throw new HttpError(403, "Forbidden: you can only update your own studio listings.");
  }

  const body = studioPayloadSchema.parse(req.body);
  const gallery = Array.from(new Set([body.imageUrl, ...(body.gallery ?? [])])).slice(0, 6);

  const updates: Partial<StudioDocument> = {
    title: body.title,
    category: body.category,
    hourlyRate: body.hourlyRate,
    securityDeposit: body.securityDeposit,
    maxCapacity: body.maxCapacity,
    location: body.location,
    imageUrl: body.imageUrl,
    gallery,
    amenities: body.amenities,
    overview: body.overview,
    areaSqFt: body.areaSqFt,
    openingHour: body.openingHour,
    closingHour: body.closingHour > body.openingHour ? body.closingHour : 22,
    updatedAt: new Date().toISOString(),
  };

  await studios.updateOne({ _id }, { $set: updates });
  const updated = await studios.findOne({ _id });

  res.json({
    success: true,
    message: "Studio listing updated!",
    studio: updated,
  });
});

router.put("/:id", requireAuth, updateStudioHandler);
router.patch("/:id", requireAuth, updateStudioHandler);

/**
 * DELETE /api/studios/:id
 * Challenge 1: Protected by HTTPOnly JWT cookie (requireAuth).
 * Deletes a studio owned by the authenticated host from MongoDB.
 */
router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const _id = parseObjectId(String(req.params.id));
    const studios = await getCollection<StudioDocument>("studios");
    const existing = await studios.findOne({ _id });

    if (!existing) {
      throw new HttpError(404, "Studio workspace not found.");
    }
    if (existing.ownerEmail.toLowerCase() !== req.user!.email.toLowerCase()) {
      throw new HttpError(403, "Forbidden: you can only delete your own studio listings.");
    }

    await studios.deleteOne({ _id });
    const wishlists = await getCollection<WishlistDocument>("wishlists");
    await wishlists.deleteMany({ studioId: String(_id) });

    res.json({
      success: true,
      message: "Studio removed from your listings.",
    });
  })
);

/**
 * POST /api/studios/:id/reviews
 * Protected route: adds a creator review and updates the studio's average rating.
 */
router.post(
  "/:id/reviews",
  requireAuth,
  asyncHandler(async (req, res) => {
    const _id = parseObjectId(String(req.params.id));
    const studios = await getCollection<StudioDocument>("studios");
    const studio = await studios.findOne({ _id });
    if (!studio) {
      throw new HttpError(404, "Studio workspace not found.");
    }

    const body = reviewPayloadSchema.parse(req.body);
    const reviewsCol = await getCollection<ReviewDocument>("reviews");

    const review: ReviewDocument = {
      studioId: String(_id),
      userName: req.user!.name,
      userEmail: req.user!.email,
      userAvatar: req.user!.image ?? null,
      rating: body.rating,
      comment: body.comment,
      projectType: body.projectType,
      createdAt: new Date().toISOString(),
    };

    const inserted = await reviewsCol.insertOne(review);

    const allReviews = await reviewsCol.find({ studioId: String(_id) }).toArray();
    const avgRating =
      allReviews.length > 0
        ? Number((allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(2))
        : body.rating;

    await studios.updateOne(
      { _id },
      { $set: { rating: avgRating, reviewCount: allReviews.length } }
    );

    res.status(201).json({
      success: true,
      message: "Thanks for reviewing this studio!",
      review: { ...review, _id: inserted.insertedId },
      rating: avgRating,
      reviewCount: allReviews.length,
    });
  })
);

export default router;

