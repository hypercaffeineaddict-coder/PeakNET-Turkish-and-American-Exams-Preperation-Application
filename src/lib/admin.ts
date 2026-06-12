/**
 * Admin / Creator configuration
 * 
 * The ADMIN_EMAILS list provides a fallback check when the database
 * `is_creator` / `is_admin` columns haven't been set yet.
 */
export const ADMIN_EMAILS = [
  "hypercaffeineaddict@gmail.com",
] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return (ADMIN_EMAILS as readonly string[]).includes(email.toLowerCase());
}
