import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Next.js 16 renamed middleware.ts to proxy.ts; it works the same way.
// Runs before matching pages render and applies the `authorized` callback
// in auth.config.ts, so signed-out visitors are sent to /login.
export default NextAuth(authConfig).auth;

export const config = {
  // Skip API routes, Next.js internals, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:png|svg|jpg|jpeg|ico)$).*)"],
};
