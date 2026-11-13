/**
 * Google OAuth callback route (T-3.3).
 * Exchanges the authorization code for a session and redirects to the
 * dashboard. Exchanges must happen in a route handler (server) because the
 * verifier is stored in cookies.
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // Back to the login screen with a signal the UI renders as a friendly
  // Spanish message (see /login error handling).
  return NextResponse.redirect(new URL('/login?error=oauth', origin));
}
