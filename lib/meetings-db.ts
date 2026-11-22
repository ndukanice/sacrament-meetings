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

// Everything in a meeting except the id, which the database assigns.
export type MeetingInput = Omit<SacramentMeeting, "id">;

// Inserts a new meeting and returns it with its new id.
// Nested objects/arrays are stored as JSONB, so they are sent as JSON text.
export async function addMeeting(data: MeetingInput): Promise<SacramentMeeting> {
  const rows = await sql`
    INSERT INTO meetings (
      date, meeting_type, presiding, conducting, announcements,
      opening_hymn, opening_prayer, ward_business, stake_business,
      sacrament_hymn, speakers, closing_hymn, closing_prayer
    ) VALUES (
      ${data.date}::date, ${data.meetingType}, ${data.presiding}, ${data.conducting},
      ${data.announcements ?? []}::text[],
      ${JSON.stringify(data.openingHymn)}::jsonb, ${data.openingPrayer},
      ${JSON.stringify(data.wardBusiness)}::jsonb, ${data.stakeBusiness},
      ${JSON.stringify(data.sacramentHymn)}::jsonb, ${JSON.stringify(data.speakers)}::jsonb,
      ${JSON.stringify(data.closingHymn)}::jsonb, ${data.closingPrayer}
    )
    RETURNING ${MEETING_COLUMNS}
  `;

  return rows[0] as SacramentMeeting;
}

// Replaces every field of an existing meeting. Returns null if the id doesn't exist.
export async function updateMeeting(id: number, data: MeetingInput): Promise<SacramentMeeting | null> {
  const rows = await sql`
    UPDATE meetings SET
      date           = ${data.date}::date,
      meeting_type   = ${data.meetingType},
      presiding      = ${data.presiding},
      conducting     = ${data.conducting},
      announcements  = ${data.announcements ?? []}::text[],
      opening_hymn   = ${JSON.stringify(data.openingHymn)}::jsonb,
      opening_prayer = ${data.openingPrayer},
      ward_business  = ${JSON.stringify(data.wardBusiness)}::jsonb,
      stake_business = ${data.stakeBusiness},
      sacrament_hymn = ${JSON.stringify(data.sacramentHymn)}::jsonb,
      speakers       = ${JSON.stringify(data.speakers)}::jsonb,
      closing_hymn   = ${JSON.stringify(data.closingHymn)}::jsonb,
      closing_prayer = ${data.closingPrayer}
    WHERE id = ${id}
    RETURNING ${MEETING_COLUMNS}
  `;

  return (rows[0] as SacramentMeeting | undefined) ?? null;
}

// Permanently removes a meeting. Returns false if there was no meeting with that id.
export async function deleteMeeting(id: number): Promise<boolean> {
  const rows = await sql`DELETE FROM meetings WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
