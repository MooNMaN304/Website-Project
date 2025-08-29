import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the user is accessing the checkout page
  if (request.nextUrl.pathname.startsWith('/checkout')) {
    // Check for auth token in cookies
    const authToken = request.cookies.get('authToken')?.value;

    if (!authToken) {
      // Redirect to login page if no auth token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/checkout/:path*',
    // Add other protected routes here
  ],
};
