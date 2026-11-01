import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { authDb } from "./mongodb";
import { validatePassword } from "./validation";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const googleConfigured = Boolean(googleClientId && googleClientSecret);

const resolvedBaseUrl = (
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
)
  .trim()
  .replace(/\/$/, "");

/** Server-side BetterAuth instance (MongoDB adapter, email+password, Google). */
export const auth = betterAuth({
  appName: "StudioSpace",
  baseURL: resolvedBaseUrl,
  secret: (
    process.env.BETTER_AUTH_SECRET || "studiospace-better-auth-secret-32chars-minimum-key"
  ).trim(),
  database: mongodbAdapter(authDb),
  trustedOrigins: [
    resolvedBaseUrl,
    "http://localhost:3000",
    "https://*.vercel.app",
  ],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: false, // assignment: after registering the user is sent to the Login page
    requireEmailVerification: false, // assignment: no email verification
  },

  socialProviders: googleConfigured
    ? {
        google: {
          clientId: googleClientId as string,
          clientSecret: googleClientSecret as string,
          prompt: "select_account",
        },
      }
    : {},

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  hooks: {
    // Enforce the uppercase / lowercase / length rules on the server too.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;
      const password = (ctx.body as { password?: string } | undefined)?.password ?? "";
      const message = validatePassword(password);
      if (message) throw new APIError("BAD_REQUEST", { message });
    }),
  },

  plugins: [nextCookies()], // must be last: lets server actions set the session cookie
});
