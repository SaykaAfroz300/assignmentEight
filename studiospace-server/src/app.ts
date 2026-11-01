import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRouter from "./routes/auth.js";
import studiosRouter from "./routes/studios.js";
import bookingsRouter from "./routes/bookings.js";
import wishlistRouter from "./routes/wishlist.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        // Allow same-origin / server-to-server calls (no Origin header) and whitelisted clients.
        if (!origin || env.clientOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true, // required so the browser sends the HTTPOnly JWT cookie
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  if (!env.isProd) app.use(morgan("dev"));
  app.use("/api", rateLimit({ windowMs: 60_000, limit: env.isProd ? 300 : 2000, standardHeaders: true, legacyHeaders: false }));

  // Lazily connect so serverless cold starts (Vercel) work as well as a long-lived server.
  app.use(async (_req, _res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      next(err);
    }
  });

  app.get("/", (_req, res) => {
    res.json({ name: "StudioSpace API", status: "ok", docs: "/api/health" });
  });

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, service: "studiospace-api", time: new Date().toISOString() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/studios", studiosRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/wishlist", wishlistRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
