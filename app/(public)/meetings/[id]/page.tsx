import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteMeetingButton } from "@/components/DeleteMeetingButton";
import { MeetingDetail } from "@/components/MeetingDetail";
import { PrintButton } from "@/components/PrintButton";
import { auth } from "@/auth";
import { getBaseUrl } from "@/lib/base-url";
import { getMeetingById } from "@/lib/meetings-db";
import { ogImage } from "@/lib/metadata";
import type { SacramentMeeting } from "@/lib/types";

export const dynamic = "force-dynamic";

type MeetingDetailPageProps = {
  params: Promise<{ id: string }>;
};

const longDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(
    new Date(`${date}T00:00:00`),
  );

// Each meeting gets its own title and description, e.g.
// "Sacrament Meeting – March 1, 2026 · Sacrament Meetings".
export async function generateMetadata({ params }: MeetingDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const meetingId = Number(id);
  const meeting = Number.isInteger(meetingId) && meetingId > 0 ? await getMeetingById(meetingId) : null;

  if (!meeting) {
    return {
      title: "Meeting Not Found",
      description: "The requested sacrament meeting program could not be found.",
    };
  }

  const speakers = meeting.speakers
    .filter((item) => item.type === "speaker")
    .map((item) => item.name);
  const title = `Sacrament Meeting – ${longDate(meeting.date)}`;
  const description =
    `Program for the ${meeting.meetingType} sacrament meeting on ${longDate(meeting.date)}, ` +
    `presided by ${meeting.presiding} and conducted by ${meeting.conducting}` +
    (speakers.length > 0 ? `. Speakers: ${speakers.join(", ")}.` : ".");

  return {
    title,
    description,
    openGraph: { title, description, type: "article", images: [ogImage] },
  };
}

export default async function MeetingDetailPage({ params }: MeetingDetailPageProps) {
  const { id } = await params;
  const meetingId = Number(id);

  if (Number.isNaN(meetingId)) {
    notFound();
  }

  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/meetings/${meetingId}`, { cache: "no-store" });

  // 400/404 → the "not found" page; anything else (e.g. 500) → error.tsx
  if (response.status === 400 || response.status === 404) {
    notFound();
  }
  if (!response.ok) {
    throw new Error(`Failed to load meeting ${meetingId} (status ${response.status})`);
  }

  const meeting: SacramentMeeting = await response.json();
  const session = await auth();
  const canManage = !!session?.user;
  const label = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${meeting.date}T00:00:00`),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap justify-end gap-3 print:hidden">
        {canManage && (
          <>
            <Link
              href={`/meetings/${meeting.id}/edit`}
              className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Edit
            </Link>
            <DeleteMeetingButton id={meeting.id} label={label} />
          </>
        )}
        <PrintButton />
      </div>
      <MeetingDetail meeting={meeting} />
    </div>
  );
}
