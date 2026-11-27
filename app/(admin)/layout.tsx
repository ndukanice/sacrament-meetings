import Link from "next/link";

// Leader-facing pages. proxy.ts sends signed-out visitors to /login first.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p>
          <span className="font-semibold">Leader tools</span> — only signed-in bishopric members can see this page.
        </p>
        <Link href="/meetings" className="font-medium underline underline-offset-2 hover:text-amber-700">
          Back to meetings
        </Link>
      </div>
      {children}
    </main>
  );
}
