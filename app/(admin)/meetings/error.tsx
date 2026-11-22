"use client";

import { MeetingsError } from "@/components/MeetingsError";

// Catches unexpected errors in /meetings/new and /meetings/[id]/edit,
// including the user-friendly errors thrown by the Server Actions.
export default function MeetingsErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <MeetingsError error={error} reset={reset} />;
}
