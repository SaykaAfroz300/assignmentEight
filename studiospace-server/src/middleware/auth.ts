import type { CookieOptions, Request, RequestHandler, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "./errorHandler.js";

export const JWT_COOKIE = "studiospace_jwt";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
};

type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  image?: string | null;
  iat: number;
  exp: number;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function cookieOptions(maxAgeMs?: number): CookieOptions {
  return {
    httpOnly: true, // JavaScript can never read this cookie (XSS-safe)
    secure: env.isProd, // HTTPS only in production
    sameSite: "lax", // served via the Next.js /server-api proxy, so it is first-party
    path: "/",
    ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
  };
}

/** Signs a JWT for the user and stores it in an HTTPOnly cookie. */
export function issueJwtCookie(res: Response, user: AuthUser) {
  const token = jwt.sign(
    { email: user.email, name: user.name, image: user.image ?? null },
    env.jwtSecret,
    { subject: user.id, expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] }
  );
  const { iat, exp } = jwt.decode(token) as JwtPayload;
  res.cookie(JWT_COOKIE, token, cookieOptions((exp - iat) * 1000));
}

export function clearJwtCookie(res: Response) {
  res.clearCookie(JWT_COOKIE, cookieOptions());
}

function readUser(req: Request): AuthUser | null {
  const token = req.cookies?.[JWT_COOKIE];
  if (!token) return null;
  try {
    const p = jwt.verify(token, env.jwtSecret) as JwtPayload;
    return { id: p.sub, email: p.email, name: p.name, image: p.image };
  } catch {
    return null;
  }
}

/** Challenge 1: rejects any request without a valid HTTPOnly JWT cookie with 401 Unauthorized. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const user = readUser(req);
  if (!user) throw new HttpError(401, "Unauthorized: please log in to continue.");
  req.user = user;
  next();
};

/** Attaches req.user when a valid cookie is present, but never blocks the request. */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const user = readUser(req);
  if (user) req.user = user;
  next();
};
