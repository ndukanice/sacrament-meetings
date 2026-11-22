"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";

// Shared UI for the meetings error.tsx files (public and admin route groups).
export function MeetingsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error); // visible in the browser console for debugging
  }, [error]);

  function tryAgain() {
    // refresh() re-fetches the server data; reset() re-renders the page segment.
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <section role="alert" className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-3 text-slate-600">
        We couldn&apos;t complete that request. Please try again, or go back to the meetings list.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={tryAgain}
          className="rounded-full bg-slate-900 px-5 py-2 font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          Try again
        </button>
        <Link href="/meetings" className="rounded-full border border-slate-300 px-5 py-2 font-semibold text-slate-900 hover:bg-slate-100">
          Back to meetings
        </Link>
      </div>
    </section>
  );
}
