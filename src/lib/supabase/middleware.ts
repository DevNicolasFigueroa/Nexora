/**
 * Session middleware helper (T-3.2).
 *
 * Responsibilities:
 * 1. Refresh the Supabase auth session on every navigation (the `setAll`
 *    callback mirrors refreshed cookies onto both the request and the response).
 * 2. Redirect unauthenticated visitors away from protected routes to `/login`.
 * 3. Redirect users whose email is still unconfirmed to `/verify-email`.
 * 4. Restrict `/settings/organization` to administrators only.
 *
 * Run from `src/middleware.ts` (Edge runtime): keep the logic here pure enough
 * to be imported there without leaking Node-only APIs.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient, User } from '@supabase/supabase-js';

/** Routes that never require an authenticated session. */
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/auth/callback',
] as const;

/** Route prefixes that are public only when opening an invitation link. */
const PUBLIC_PREFIXES = ['/invite/'] as const;

/** Administrator-only route prefixes (T-3.2 governance barrier). */
const ADMIN_ONLY_PREFIXES = ['/settings/organization'] as const;

/** Routes where an unconfirmed user is allowed to stay. */
const UNCONFIRMED_ALLOWED_PATHS = ['/verify-email', '/auth/callback'] as const;

function isPublicPath(pathname: string): boolean {
  if ((PUBLIC_PATHS as readonly string[]).includes(pathname)) return true;
  return (PUBLIC_PREFIXES as readonly string[]).some((prefix) =>
    pathname.startsWith(prefix),
  );
}

function isProtectedPath(pathname: string): boolean {
  return !isPublicPath(pathname);
}

function isAdminOnlyPath(pathname: string): boolean {
  return (ADMIN_ONLY_PREFIXES as readonly string[]).some((prefix) =>
    pathname.startsWith(prefix),
  );
}

function redirectTo(request: NextRequest, destination: string): NextResponse {
  return NextResponse.redirect(new URL(destination, request.url));
}

/**
 * Refreshes the session and enforces the route guards.
 * Returns the response that must be forwarded to the rest of the middleware
 * chain (it carries any refreshed auth cookies).
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    // Fail closed in production-like environments: without Supabase config the
    // session cannot be verified, so protected routes redirect to /login.
    return isProtectedPath(request.nextUrl.pathname)
      ? redirectTo(request, '/login')
      : response;
  }

  const supabase: SupabaseClient = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() validates the token against the Supabase Auth server (safer than
  // decoding the JWT locally, which does not detect revoked sessions).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. No session: only protected routes are redirected to /login.
  if (!user) {
    if (isProtectedPath(pathname)) {
      return redirectTo(request, '/login');
    }
    return response;
  }

  // 2. Unconfirmed email: confine the user to the verification flow.
  if (isEmailConfirmationPending(user)) {
    const allowed = (UNCONFIRMED_ALLOWED_PATHS as readonly string[]).includes(pathname);
    if (!allowed) {
      return redirectTo(request, '/verify-email');
    }
    return response;
  }

  // 3. Administrator-only routes: verify the caller's role.
  if (isAdminOnlyPath(pathname)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return redirectTo(request, '/dashboard');
    }
  }

  return response;
}

/**
 * A user's email confirmation is pending when Supabase has no confirmation
 * timestamp (covers both `null` and `undefined`). Google OAuth accounts
 * arrive already confirmed. NOTE: assumes the project has "Confirm email"
 * enabled (required by EARS-03) — validated against real flows in phase 6.
 */
function isEmailConfirmationPending(user: User): boolean {
  return !user.email_confirmed_at && !user.confirmed_at;
}
