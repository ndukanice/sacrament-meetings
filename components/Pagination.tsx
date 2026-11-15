"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const linkClasses =
  "rounded-full border border-slate-300 bg-white px-4 py-2 font-medium text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900";

export function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  // Keep the current search query when moving between pages.
  function createPageURL(page: number): string {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4 text-sm print:hidden">
      {currentPage > 1 ? (
        <Link href={createPageURL(currentPage - 1)} className={linkClasses} rel="prev">
          ← Previous
        </Link>
      ) : (
        <span className="px-4 py-2 text-slate-600" aria-hidden="true">
          ← Previous
        </span>
      )}

      <span className="font-semibold text-slate-700" aria-current="page">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link href={createPageURL(currentPage + 1)} className={linkClasses} rel="next">
          Next →
        </Link>
      ) : (
        <span className="px-4 py-2 text-slate-600" aria-hidden="true">
          Next →
        </span>
      )}
    </nav>
  );
}
