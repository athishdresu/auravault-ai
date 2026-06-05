import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes require the user to be logged in
const isProtectedRoute = createRouteMatcher([
  '/',           // Protect the main dashboard
  '/api(.*)'     // Protect all local API routes
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); // Kick them out to the login screen if they aren't authenticated
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};