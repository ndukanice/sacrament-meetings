import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Bishopric Sign In",
  description: "Sign in to create, edit, and delete sacrament meeting programs for the Isolo Ward.",
  robots: { index: false }, // no reason for search engines to list a login page
};

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

// Auth.js adds ?callbackUrl=... when it sends someone here from a protected
// page; keep only the path so we return them to it after signing in.
function toPath(callbackUrl: string | undefined): string {
  if (!callbackUrl) return "/meetings";
  try {
    const url = new URL(callbackUrl, "http://localhost");
    return `${url.pathname}${url.search}`;
  } catch {
    return "/meetings";
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="mx-auto flex max-w-md flex-col px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-600">Bishopric</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-2 mb-6 text-slate-600">
          Sign in to create and edit sacrament meeting programs. Members can view and print programs without
          signing in.
        </p>
        <LoginForm redirectTo={toPath(callbackUrl)} />
      </div>
    </main>
  );
}
