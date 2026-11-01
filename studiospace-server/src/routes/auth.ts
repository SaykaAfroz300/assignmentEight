import { Router } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { HttpError, asyncHandler } from "../middleware/errorHandler.js";
import { clearJwtCookie, issueJwtCookie, requireAuth } from "../middleware/auth.js";

const router = Router();

// BetterAuth (running in Next.js) names its cookie with an optional "__Secure-" prefix on HTTPS.
const SESSION_COOKIE_NAMES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

function readSessionToken(cookies: Record<string, string> | undefined): string | null {
  for (const name of SESSION_COOKIE_NAMES) {
    const raw = cookies?.[name];
    if (raw) {
      return decodeURIComponent(raw).split(".")[0] || null;
    }
  }
  return null;
}

const toObjectId = (v: unknown) => (typeof v === "string" && ObjectId.isValid(v) ? new ObjectId(v) : v);

/**
 * POST /api/auth/token
 * Exchanges a valid BetterAuth session for a JWT stored in an HTTPOnly cookie.
 */
router.post(
  "/token",
  asyncHandler(async (req, res) => {
    const token = readSessionToken(req.cookies);
    if (!token) throw new HttpError(401, "No active session. Please log in.");

    const db = await connectDB();
    const session = await db.collection("session").findOne({ token });

    if (session && new Date(session.expiresAt as string).getTime() >= Date.now()) {
      const user = await db.collection("user").findOne({ _id: toObjectId(session.userId) as never });
      if (user) {
        const authUser = {
          id: String(user._id),
          email: String(user.email),
          name: String(user.name),
          image: (user.image as string | null | undefined) ?? null,
        };
        issueJwtCookie(res, authUser);
        res.json({ success: true, user: authUser });
        return;
      }
    }

    // Local dev fallback when MONGODB_URI is empty (Next.js and Express run in separate memory spaces)
    const bodyUser = req.body?.user as
      | { id?: string; email?: string; name?: string; image?: string | null }
      | undefined;
    if (!env.isProd && bodyUser?.id && bodyUser?.email && bodyUser?.name) {
      const authUser = {
        id: String(bodyUser.id),
        email: String(bodyUser.email),
        name: String(bodyUser.name),
        image: bodyUser.image ?? null,
      };
      issueJwtCookie(res, authUser);
      res.json({ success: true, user: authUser });
      return;
    }

    throw new HttpError(401, "Your session has expired. Please log in again.");
  })
);

/** GET /api/auth/me - returns the user decoded from the JWT cookie (401 when missing/invalid). */
router.get("/me", requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

/** POST /api/auth/logout - clears the JWT cookie. */
router.post("/logout", (_req, res) => {
  clearJwtCookie(res);
  res.json({ success: true, message: "Logged out." });
});

export default router;
