import type { NextAuthConfig } from "next-auth";

// Pages only bishopric members may open: creating and editing meetings.
// Public pages (the meeting list, meeting details, printing) stay open.
export function isProtectedPath(pathname: string): boolean {
  return /^\/meetings\/(new|[^/]+\/edit)\/?$/.test(pathname);
}

// Settings that are safe to run in proxy.ts on every request.
// No database or bcrypt here: those live in auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login", // our own login page instead of the Auth.js default
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // Returning false sends the visitor to /login?callbackUrl=<this page>.
      if (isProtectedPath(nextUrl.pathname)) return isLoggedIn;

      // Already signed in? Skip the login page.
      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/meetings", nextUrl));
      }

      return true;
    },
  },
  providers: [], // added in auth.ts
} satisfies NextAuthConfig;
