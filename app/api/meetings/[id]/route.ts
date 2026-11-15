import { getMeetingById } from "@/lib/meetings-db";

// Largest value a Postgres SERIAL (integer) id can hold.
const MAX_ID = 2147483647;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const meetingId = Number(id);

  if (!/^\d+$/.test(id) || meetingId < 1 || meetingId > MAX_ID) {
    return Response.json({ error: "Meeting id must be a positive whole number." }, { status: 400 });
  }

  try {
    const meeting = await getMeetingById(meetingId);

    if (!meeting) {
      return Response.json({ error: "Meeting not found." }, { status: 404 });
    }

    return Response.json(meeting);
  } catch (error) {
    console.error(`GET /api/meetings/${id} failed:`, error);
    return Response.json({ error: "Unable to load meeting." }, { status: 500 });
  }
}
