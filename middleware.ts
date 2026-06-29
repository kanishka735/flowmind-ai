import { NextResponse } from 'next/server'

/**
 * Firebase uses client-side authentication (IndexedDB / localStorage).
 * It does NOT set server-readable cookies, so middleware cannot check auth state.
 *
 * Route protection is handled client-side inside:
 *   app/(dashboard)/layout.tsx  →  redirects to /login when user is null
 *   app/(auth)/login/page.tsx   →  redirects to /dashboard when user exists
 *
 * This middleware is intentionally a pass-through.
 */
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
