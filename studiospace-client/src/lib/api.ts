/**
 * Thin fetch wrapper for the Express API.
 * - Calls go to /server-api/* (proxied by Next), so the HTTPOnly JWT cookie is sent automatically.
 * - On a 401 it silently re-exchanges the BetterAuth session for a fresh JWT cookie and retries once.
 */
export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

const BASE = "/server-api";

export async function refreshApiToken(): Promise<boolean> {
  try {
    let sessionUser: unknown = undefined;
    try {
      const sessionRes = await fetch("/api/auth/get-session", { credentials: "include" });
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        sessionUser = sessionData?.user;
      }
    } catch {
      // Ignore
    }

    const res = await fetch(`${BASE}/auth/token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: sessionUser }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown; retried?: boolean };

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, retried, headers, ...rest } = options;
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: "include",
      ...rest,
      headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Can't reach the StudioSpace server. Check your connection and try again.");
  }

  if (res.status === 401 && !retried && !path.startsWith("/auth/")) {
    if (await refreshApiToken()) return api<T>(path, { ...options, retried: true });
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? "Something went wrong. Please try again.", data?.details);
  }
  return data as T;
}
