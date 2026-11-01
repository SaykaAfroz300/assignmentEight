/**
 * Password rules required by the assignment. Shared by the register form (instant feedback)
 * and by the BetterAuth server hook (so a crafted request can't bypass the UI).
 */
export const PASSWORD_RULES = [
  { id: "length", label: "At least 6 characters", test: (v: string) => v.length >= 6 },
  { id: "upper", label: "One uppercase letter (A-Z)", test: (v: string) => /[A-Z]/.test(v) },
  { id: "lower", label: "One lowercase letter (a-z)", test: (v: string) => /[a-z]/.test(v) },
] as const;

/** Returns an error message, or null when the password satisfies every rule. */
export function validatePassword(password: string): string | null {
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (password.length < 6) return "Password must be at least 6 characters long.";
  return null;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function isValidHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
