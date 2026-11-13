/**
 * Next.js middleware entry point.
 * Delegates to the Supabase session middleware: session refresh, route
 * protection (/login), unconfirmed-email confinement (/verify-email) and the
 * administrator-only barrier for /settings/organization.
 */

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Run on all routes except static assets and Next internals.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|css|js|map|woff|woff2)$).*)',
  ],
};
