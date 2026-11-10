import { getAllMeetings } from "@/lib/meetings-db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Date must use the format YYYY-MM-DD." }, { status: 400 });
  }

  try {
    const meetings = await getAllMeetings(date);
    return Response.json(meetings);
  } catch (error) {
    console.error("GET /api/meetings failed:", error);
    return Response.json({ error: "Unable to load meetings." }, { status: 500 });
  }
}
