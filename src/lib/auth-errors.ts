/**
 * Extract Supabase auth error code from error message
 * Supabase errors follow patterns like:
 * - "Invalid login credentials" -> auth/invalid-credential
 * - "Email not confirmed" -> auth/email-not-confirmed
 * - "User not found" -> auth/user-not-found
 * - etc.
 */
export function getAuthErrorCode(errorMessage: string): string {
  const msg = errorMessage.toLowerCase();

  // Map common Supabase/GoTrue error messages to error codes
  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
    return "auth/invalid-credential";
  }
  if (msg.includes("invalid email") || msg.includes("email format")) {
    return "auth/invalid-email";
  }
  if (msg.includes("user not found") || msg.includes("no user found")) {
    return "auth/user-not-found";
  }
  if (msg.includes("wrong password") || msg.includes("invalid password")) {
    return "auth/wrong-password";
  }
  if (msg.includes("email already") || msg.includes("already registered") || msg.includes("already in use")) {
    return "auth/email-already-in-use";
  }
  if (msg.includes("weak password") || msg.includes("password should be at least")) {
    return "auth/weak-password";
  }
  if (msg.includes("too many requests") || msg.includes("rate limit") || msg.includes("try again later")) {
    return "auth/too-many-requests";
  }
  if (msg.includes("network") || msg.includes("fetch failed") || msg.includes("connection")) {
    return "auth/network-request-failed";
  }
  if (msg.includes("user disabled") || msg.includes("account disabled") || msg.includes("blocked")) {
    return "auth/user-disabled";
  }
  if (msg.includes("email not confirmed") || msg.includes("email unverified")) {
    return "auth/email-not-confirmed";
  }
  if (msg.includes("session") || msg.includes("jwt") || msg.includes("token")) {
    return "auth/session-missing";
  }

  return "default";
}

type AuthErrorMessages = Record<string, string>;

/**
 * Get user-friendly error message from i18n dictionary
 */
export function getAuthErrorMessage(errorMessage: string, t: AuthErrorMessages): string {
  const code = getAuthErrorCode(errorMessage);
  return t[code] ?? t.default;
}