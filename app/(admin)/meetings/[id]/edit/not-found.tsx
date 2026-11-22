import Link from "next/link";

export default function MeetingNotFound() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">Meeting not found</h1>
      <p className="mt-3 text-slate-600">
        We couldn&apos;t find that meeting. It may have been deleted, or the link may be wrong.
      </p>
      <Link
        href="/meetings"
        className="mt-6 inline-block rounded-full bg-slate-900 px-5 py-2 font-semibold text-white hover:bg-slate-700"
      >
        Back to meetings
      </Link>
    </section>
  );
}
