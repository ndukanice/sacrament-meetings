import Link from "next/link";
import { DeleteMeetingButton } from "@/components/DeleteMeetingButton";
import type { SacramentMeeting } from "@/lib/types";

type MeetingCardProps = {
  meeting: SacramentMeeting;
  // Show Edit/Delete only to signed-in bishopric members.
  canManage?: boolean;
};

export function MeetingCard({ meeting, canManage = false }: MeetingCardProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${meeting.date}T00:00:00`));

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <Link href={`/meetings/${meeting.id}`} className="block flex-1 rounded-t-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
            {meeting.meetingType}
          </p>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
            {meeting.stakeBusiness ? "Stake business" : "Ward meeting"}
          </span>
        </div>
        <h2 className="mt-3 text-xl font-bold text-slate-900">{formattedDate}</h2>
        <p className="mt-2 text-slate-600">Presiding: {meeting.presiding}</p>
        <p className="mt-1 text-slate-600">Conducting: {meeting.conducting}</p>
        <p className="mt-4 text-sm font-medium text-indigo-700">View program →</p>
      </Link>

      {/* Leader actions — kept outside the link, since a form can't sit inside a link. */}
      {canManage && (
        <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-3">
          <Link
            href={`/meetings/${meeting.id}/edit`}
            aria-label={`Edit meeting on ${formattedDate}`}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Edit
          </Link>
          <DeleteMeetingButton id={meeting.id} label={formattedDate} />
        </div>
      )}
    </article>
  );
}
