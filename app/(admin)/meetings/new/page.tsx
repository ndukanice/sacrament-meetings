import type { Metadata } from "next";
import { MeetingForm } from "@/components/MeetingForm";
import { createMeeting } from "@/lib/actions";

export const metadata: Metadata = {
  title: "Create Meeting",
  description: "Add a new sacrament meeting program: hymns, prayers, speakers, and ward business.",
};

export default function NewMeetingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create Meeting</h1>
        <p className="mt-2 text-slate-600">Add a new sacrament meeting program. All fields except the lists are required.</p>
      </div>
      <MeetingForm action={createMeeting} submitLabel="Create meeting" cancelHref="/meetings" />
    </div>
  );
}
