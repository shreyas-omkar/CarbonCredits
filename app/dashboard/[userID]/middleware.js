import { NextResponse } from 'next/server';

// This middleware runs on all routes inside /dashboard/[userID]
export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Extract userID from pathname, assuming /dashboard/:userID or deeper routes
  const pathParts = pathname.split('/');
  const userID = pathParts[2]; // after "", "dashboard", userID

  // Check if userID param is missing
  if (!userID) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Check for token cookie
  const token = req.cookies.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Optionally: verify token here (e.g., JWT verification)

  return NextResponse.next();
}

// Configure matcher so middleware only runs on dashboard userID routes
export const config = {
  matcher: ['/dashboard/:userID/:path*', '/dashboard/:userID'],
};
