import { Router } from "express";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError, asyncHandler } from "../middleware/errorHandler.js";
import type { StudioDocument, WishlistDocument } from "../models/seedData.js";

const router = Router();

const toggleSchema = z.object({
  studioId: z.string().trim().min(1, "studioId is required."),
});

/**
 * GET /api/wishlist
 * Protected route: returns saved studio IDs and full studio documents for the logged-in user.
 */
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const wishlists = await getCollection<WishlistDocument>("wishlists");
    const savedItems = await wishlists
      .find({ userEmail: req.user!.email })
      .sort({ createdAt: -1 })
      .toArray();

    const studioIds = savedItems.map((w) => w.studioId);
    const validIds = studioIds
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

    const studiosCol = await getCollection<StudioDocument>("studios");
    const studios =
      validIds.length > 0
        ? await studiosCol.find({ _id: { $in: validIds } as never }).toArray()
        : [];

    res.json({
      success: true,
      studioIds,
      studios,
    });
  })
);

/**
 * POST /api/wishlist/toggle
 * Protected route: adds or removes a studio from the user's MongoDB wishlist.
 */
router.post(
  "/toggle",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { studioId } = toggleSchema.parse(req.body);
    if (!ObjectId.isValid(studioId)) {
      throw new HttpError(400, "Invalid studio ID.");
    }

    const wishlists = await getCollection<WishlistDocument>("wishlists");
    const userEmail = req.user!.email;

    const existing = await wishlists.findOne({ userEmail, studioId });
    if (existing) {
      await wishlists.deleteOne({ _id: existing._id });
      res.json({
        success: true,
        saved: false,
        studioId,
        message: "Removed from your saved studios.",
      });
      return;
    }

    await wishlists.insertOne({
      userEmail,
      studioId,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      saved: true,
      studioId,
      message: "Saved to your wishlist!",
    });
  })
);

export default router;

