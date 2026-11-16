import { type NextRequest } from "next/server";

import { refreshSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await refreshSession(request);
}

export const config = {
  matcher: [
    /*
     * Applies to every route except:
     * - _next/static, _next/image (Next.js internal assets)
     * - favicon.ico and static image files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
