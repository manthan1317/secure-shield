import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;

  // Define protected routes
  const isProtectedRoute = path.startsWith("/dashboard");

  // Define public routes
  const isPublicRoute = path === "/login" || path === "/register";

  // Check if user is authenticated - look for auth information in cookies
  // This assumes you're storing authentication in cookies
  const authCookie = request.cookies.get("auth")?.value;
  const isAuthenticated = !!authCookie;

  // If the route is protected and the user is not authenticated, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Add a redirect parameter to return after login
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // If the user is authenticated and trying to access login/register, redirect to dashboard
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Otherwise, continue with the request
  return NextResponse.next();
}

// Define which paths this middleware should run for
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
