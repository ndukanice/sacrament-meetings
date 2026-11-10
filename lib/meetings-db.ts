import { neon } from "@neondatabase/serverless";
import type { SacramentMeeting } from "./types";

const sql = neon(process.env.DATABASE_URL!);

export const ITEMS_PER_PAGE = 5;

// Every query selects the same columns, renamed from snake_case (database)
// to camelCase (the SacramentMeeting interface).
const MEETING_COLUMNS = sql.unsafe(`
  id,
  to_char(date, 'YYYY-MM-DD') AS "date",
  meeting_type                AS "meetingType",
  presiding,
  conducting,
  announcements,
  opening_hymn                AS "openingHymn",
  opening_prayer              AS "openingPrayer",
  ward_business               AS "wardBusiness",
  stake_business              AS "stakeBusiness",
  sacrament_hymn              AS "sacramentHymn",
  speakers,
  closing_hymn                AS "closingHymn",
  closing_prayer              AS "closingPrayer"
`);

// Search by speaker, presiding, conducting, or meeting type, five meetings per page.
export async function getMeetings(query: string = "", currentPage: number = 1): Promise<SacramentMeeting[]> {
  const searchTerm = `%${query}%`;
  const offset = (Math.max(1, currentPage) - 1) * ITEMS_PER_PAGE;

  const rows = await sql`
    SELECT ${MEETING_COLUMNS}
    FROM meetings
    WHERE
      presiding         ILIKE ${searchTerm}
      OR conducting     ILIKE ${searchTerm}
      OR meeting_type   ILIKE ${searchTerm}
      OR speakers::text ILIKE ${searchTerm}
    ORDER BY date DESC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
  `;

  return rows as SacramentMeeting[];
}

export async function getMeetingsTotalPages(query: string = ""): Promise<number> {
  const searchTerm = `%${query}%`;

  const rows = await sql`
    SELECT COUNT(*) AS count
    FROM meetings
    WHERE
      presiding         ILIKE ${searchTerm}
      OR conducting     ILIKE ${searchTerm}
      OR meeting_type   ILIKE ${searchTerm}
      OR speakers::text ILIKE ${searchTerm}
  `;

  return Math.ceil(Number(rows[0].count) / ITEMS_PER_PAGE);
}

// Used by GET /api/meetings: every meeting, or only those on ?date=YYYY-MM-DD.
export async function getAllMeetings(date?: string | null): Promise<SacramentMeeting[]> {
  const rows = date
    ? await sql`SELECT ${MEETING_COLUMNS} FROM meetings WHERE date = ${date}::date ORDER BY date DESC`
    : await sql`SELECT ${MEETING_COLUMNS} FROM meetings ORDER BY date DESC`;

  return rows as SacramentMeeting[];
}

export async function getMeetingById(id: number): Promise<SacramentMeeting | null> {
  const rows = await sql`SELECT ${MEETING_COLUMNS} FROM meetings WHERE id = ${id}`;

  return (rows[0] as SacramentMeeting | undefined) ?? null;
}

// Format a date as YYYY-MM-DD using local time (toISOString would shift it to UTC).
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Returns the meeting for the most recent Sunday (today if it is Sunday).
// If that Sunday has no entry, falls back to the latest meeting before it.
export async function getCurrentSundayMeeting(today: Date = new Date()): Promise<SacramentMeeting | null> {
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());

  const rows = await sql`
    SELECT ${MEETING_COLUMNS}
    FROM meetings
    WHERE date <= ${toDateString(sunday)}::date
    ORDER BY date DESC
    LIMIT 1
  `;

  return (rows[0] as SacramentMeeting | undefined) ?? null;
}

// Mutation stubs — will be wired to the database in Week 04 when forms are built.
export async function addMeeting(data: Omit<SacramentMeeting, "id">): Promise<SacramentMeeting> {
  void data;
  throw new Error("addMeeting: database implementation coming in Week 04");
}

export async function updateMeeting(id: number, updates: Partial<SacramentMeeting>): Promise<SacramentMeeting | null> {
  void id;
  void updates;
  throw new Error("updateMeeting: database implementation coming in Week 04");
}

export async function deleteMeeting(id: number): Promise<boolean> {
  void id;
  throw new Error("deleteMeeting: database implementation coming in Week 04");
}
