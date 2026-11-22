"use client";

import { MeetingsError } from "@/components/MeetingsError";

// Catches unexpected errors in /meetings, /meetings/[id] and /meetings/current.
export default function MeetingsErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <MeetingsError error={error} reset={reset} />;
}
