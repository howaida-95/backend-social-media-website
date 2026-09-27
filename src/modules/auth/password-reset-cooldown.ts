/**
 * Per-email cooldown for forgot-password requests.
 * In-memory is fine for a single Node process; use Redis for multi-instance deploys.
 * Keyed by normalized email so unknown addresses still get rate-limited
 * (avoids email enumeration via cooldown differences).
 */

// A user must wait 60 seconds before requesting another password-reset email.
export const PASSWORD_RESET_COOLDOWN_SECONDS = 60;

const lastRequestAtByEmail = new Map<string, number>();

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const getPasswordResetRetryAfter = (email: string): number => {
  const key = normalizeEmail(email);
  const lastRequestAt = lastRequestAtByEmail.get(key);

  if (!lastRequestAt) {
    return 0;
  }

  const elapsedMs = Date.now() - lastRequestAt;
  const remainingMs = PASSWORD_RESET_COOLDOWN_SECONDS * 1000 - elapsedMs;

  if (remainingMs <= 0) {
    return 0;
  }

  return Math.ceil(remainingMs / 1000);
};

export const markPasswordResetRequested = (email: string): void => {
  lastRequestAtByEmail.set(normalizeEmail(email), Date.now());
};
