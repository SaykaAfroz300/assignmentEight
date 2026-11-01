import { createAuthClient } from "better-auth/react";

/** Browser-side BetterAuth client. Same-origin, so no baseURL is needed. */
export const authClient = createAuthClient();
