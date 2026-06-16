// Tiny, dependency-free validation helpers. Rules mirror the backend so the
// client can fail fast with specific, human messages before a round-trip.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns an error message, or null when the value is valid. */
export type Validator = (value: string) => string | null;

export function validateEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Email is required';
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address';
  return null;
}

export function validateLoginPassword(value: string): string | null {
  if (!value) return 'Password is required';
  return null;
}

export function validateRegisterPassword(value: string): string | null {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export function validateName(value: string): string | null {
  if (value.trim().length > 80) return 'Name must be 80 characters or fewer';
  return null;
}

export function validateBio(value: string): string | null {
  if (value.trim().length > 280) return 'Bio must be 280 characters or fewer';
  return null;
}

export function validateLocation(value: string): string | null {
  if (value.trim().length > 120) return 'Location must be 120 characters or fewer';
  return null;
}

export function validateAvatarUrl(value: string): string | null {
  const v = value.trim();
  if (!v) return null; // optional
  if (v.length > 2048) return 'URL must be 2048 characters or fewer';
  if (!/^https?:\/\/.+/i.test(v)) return 'Enter a valid http(s) URL';
  try {
    const parsed = new URL(v);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'Enter a valid http(s) URL';
    }
  } catch {
    return 'Enter a valid http(s) URL';
  }
  return null;
}

/**
 * Run a map of field validators and collect the failing messages. Returns
 * `{ valid, errors }` where `errors` only contains keys that failed.
 */
export function runValidators<K extends string>(
  validators: Record<K, () => string | null>,
): { valid: boolean; errors: Partial<Record<K, string>> } {
  const errors: Partial<Record<K, string>> = {};
  let valid = true;
  (Object.keys(validators) as K[]).forEach((key) => {
    const message = validators[key]();
    if (message) {
      errors[key] = message;
      valid = false;
    }
  });
  return { valid, errors };
}
