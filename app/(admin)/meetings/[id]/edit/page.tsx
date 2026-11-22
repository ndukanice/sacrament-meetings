import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MeetingForm } from "@/components/MeetingForm";
import { updateMeeting } from "@/lib/actions";
import { getMeetingById } from "@/lib/meetings-db";

export const metadata: Metadata = {
  title: "Edit Meeting | Sacrament Meetings",
};

type EditMeetingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMeetingPage({ params }: EditMeetingPageProps) {
  const { id } = await params;
  const meetingId = Number(id);

  // Not a valid id, or no meeting with that id → show not-found.tsx
  if (!/^\d+$/.test(id) || meetingId > 2147483647) notFound();
  const meeting = await getMeetingById(meetingId);
  if (!meeting) notFound();

  // bind() pre-fills the first argument (the id), so the form only supplies the rest.
  const updateMeetingWithId = updateMeeting.bind(null, meeting.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Meeting</h1>
        <p className="mt-2 text-slate-600">Update the program for {meeting.date}.</p>
      </div>
      <MeetingForm
        action={updateMeetingWithId}
        meeting={meeting}
        submitLabel="Save changes"
        cancelHref={`/meetings/${meeting.id}`}
      />
    </div>
  );
}
