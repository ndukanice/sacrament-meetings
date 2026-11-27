"use client";

import { useActionState } from "react";
import { authenticate } from "@/lib/auth-actions";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <form action={formAction} className="space-y-5" aria-describedby={errorMessage ? "login-error" : undefined}>
      {/* Where to go after signing in, e.g. the page that sent you here. */}
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-900">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={errorMessage ? true : undefined}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-slate-900">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
          aria-invalid={errorMessage ? true : undefined}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-70"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>

      {/* aria-live announces the error to screen readers when it appears. */}
      <p id="login-error" aria-live="polite" className="min-h-6 text-sm font-medium text-red-700">
        {errorMessage}
      </p>
    </form>
  );
}
