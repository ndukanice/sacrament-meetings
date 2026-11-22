"use client";

import { useFormStatus } from "react-dom";
import { deleteMeeting } from "@/lib/actions";

// A tiny form that calls the deleteMeeting Server Action for one meeting.
export function DeleteMeetingButton({ id, label }: { id: number; label: string }) {
  const deleteThisMeeting = deleteMeeting.bind(null, id);

  return (
    <form
      action={deleteThisMeeting}
      onSubmit={(event) => {
        // Deleting can't be undone, so ask first.
        if (!window.confirm(`Delete the meeting on ${label}? This can't be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <SubmitButton label={label} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus(); // true while the delete is running
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={`Delete meeting on ${label}`}
      className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
