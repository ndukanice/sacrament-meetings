import Link from "next/link";
import { MeetingCard } from "@/components/MeetingCard";
import { MeetingSearch } from "@/components/MeetingSearch";
import { Pagination } from "@/components/Pagination";
import { getMeetings, getMeetingsTotalPages } from "@/lib/meetings-db";

export const dynamic = "force-dynamic";

type MeetingsPageProps = {
  searchParams?: Promise<{ query?: string; page?: string }>;
};

export default async function MeetingsPage(props: MeetingsPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query ?? "";
  const currentPage = Math.max(1, Number(searchParams?.page) || 1);

  const [meetings, totalPages] = await Promise.all([
    getMeetings(query, currentPage),
    getMeetingsTotalPages(query),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Meeting Archive</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">All Sacrament Meetings</h1>
        </div>
        <Link
          href="/meetings/new"
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          + New meeting
        </Link>
      </div>

      <MeetingSearch />

      {meetings.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600" role="status">
          {query ? `No meetings match “${query}”.` : "No meetings on this page."}
        </p>
      )}

      <Pagination totalPages={totalPages} />
    </div>
  );
}
