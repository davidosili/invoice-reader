/**
 * Sanitizes backend, network, and authentication errors into customer-friendly, enterprise-grade messages.
 * Prevents exposing internal database, Supabase, or PostgreSQL implementation details to end customers.
 */
export function sanitizeAuthError(err: unknown, fallbackMessage = 'Authentication failed. Please verify your credentials and try again.'): string {
  if (!err) return fallbackMessage;

  const rawMessage = typeof err === 'string'
    ? err
    : (err as any)?.message || (err as any)?.error_description || String(err);

  const lower = rawMessage.toLowerCase();

  // Invalid login credentials
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'The email address or password you entered is incorrect. Please verify your details and try again.';
  }

  // Email unconfirmed
  if (lower.includes('email not confirmed')) {
    return 'Please check your email inbox and confirm your address before signing in.';
  }

  // User already exists
  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }

  // Password requirements
  if (lower.includes('password should be at least') || lower.includes('weak password')) {
    return 'Password must be at least 6 characters.';
  }

  // Rate limits
  if (
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('over_email_send_rate_limit')
  ) {
    return 'Too many sign-in attempts. For security reasons, please wait a few minutes before trying again.';
  }

  // Network or service unreachable
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network error')
  ) {
    return 'Unable to connect to MyLedgerLens services. Please check your internet connection or try again shortly.';
  }

  // Database, RLS, or internal infrastructure error (hide internal terms like PGRST, PostgreSQL, RLS)
  if (
    lower.includes('pgrst') ||
    lower.includes('postgres') ||
    lower.includes('row-level security') ||
    lower.includes('relation') ||
    lower.includes('schema') ||
    lower.includes('jwt') ||
    lower.includes('claim') ||
    lower.includes('supabase')
  ) {
    return 'Our authentication service encountered a temporary error. Please try again shortly or contact support@myledgerlens.com.';
  }

  return rawMessage;
}
