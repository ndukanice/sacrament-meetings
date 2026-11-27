"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import {
  addMeeting,
  deleteMeeting as deleteMeetingFromDb,
  updateMeeting as updateMeetingInDb,
  type MeetingInput,
} from "./meetings-db";
import type { MeetingType, SpeakerItem } from "./types";

// ---------- Validation ----------

const MEETING_TYPES: MeetingType[] = ["regular", "testimony", "stake", "general", "special"];

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required.`).max(255, `${label} must be 255 characters or fewer.`);

const hymnNumber = (label: string) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, `Enter the ${label.toLowerCase()} number.`)
    .transform(Number)
    .refine((n) => n >= 1 && n <= 1500, `${label} number must be between 1 and 1500.`);

// One rule per form field. Every value arrives from the form as a string.
const MeetingFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose the meeting date."),
  meetingType: z
    .string()
    .refine((value) => MEETING_TYPES.includes(value as MeetingType), "Choose a meeting type."),
  presiding: requiredText("Presiding"),
  conducting: requiredText("Conducting"),
  openingHymnNumber: hymnNumber("Opening hymn"),
  openingHymnTitle: requiredText("Opening hymn title"),
  openingPrayer: requiredText("Opening prayer"),
  sacramentHymnNumber: hymnNumber("Sacrament hymn"),
  sacramentHymnTitle: requiredText("Sacrament hymn title"),
  closingHymnNumber: hymnNumber("Closing hymn"),
  closingHymnTitle: requiredText("Closing hymn title"),
  closingPrayer: requiredText("Closing prayer"),
  stakeBusiness: z.boolean(),
  // "One per line" text boxes, checked line by line below.
  announcements: z.string(),
  wardBusiness: z.string(),
  speakers: z.string().refine(
    (text) => toLines(text).every((line) => parseSpeakerLine(line) !== null),
    'Write each line as "Name | Topic" for a speaker or "Music: Performer | Piece" for a musical number.',
  ),
});

type MeetingFormFields = z.input<typeof MeetingFormSchema>;
type FieldName = keyof MeetingFormFields;

// What the form receives back after each submit (via useActionState).
export type MeetingFormState = {
  message: string | null;
  errors: Partial<Record<FieldName, string[]>>;
  // The values just submitted, so a failed submit doesn't wipe the form.
  values?: Partial<Record<FieldName, string>>;
};

function toLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

// "Sister Clark | Gratitude"           → speaker
// "Music: Ward Choir | I Need Thee"    → musical number (piece is optional)
function parseSpeakerLine(line: string): SpeakerItem | null {
  const isMusic = /^music:/i.test(line);
  const [name = "", topic = ""] = line
    .replace(/^music:/i, "")
    .split("|")
    .map((part) => part.trim());

  if (!name || name.length > 255 || topic.length > 255) return null;
  return { name, topic, type: isMusic ? "musical-number" : "speaker" };
}

function readForm(formData: FormData): MeetingFormFields {
  const text = (name: FieldName) => String(formData.get(name) ?? "");
  return {
    date: text("date"),
    meetingType: text("meetingType"),
    presiding: text("presiding"),
    conducting: text("conducting"),
    openingHymnNumber: text("openingHymnNumber"),
    openingHymnTitle: text("openingHymnTitle"),
    openingPrayer: text("openingPrayer"),
    sacramentHymnNumber: text("sacramentHymnNumber"),
    sacramentHymnTitle: text("sacramentHymnTitle"),
    closingHymnNumber: text("closingHymnNumber"),
    closingHymnTitle: text("closingHymnTitle"),
    closingPrayer: text("closingPrayer"),
    stakeBusiness: formData.get("stakeBusiness") === "on", // checkbox
    announcements: text("announcements"),
    wardBusiness: text("wardBusiness"),
    speakers: text("speakers"),
  };
}

// Validates the form. Returns either the database-ready meeting or the state to show.
function validate(
  formData: FormData,
): { ok: true; meeting: MeetingInput } | { ok: false; state: MeetingFormState } {
  const raw = readForm(formData);
  const result = MeetingFormSchema.safeParse(raw);

  if (!result.success) {
    // Group Zod's issues by field: { presiding: ["Presiding is required."], ... }
    const errors: MeetingFormState["errors"] = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as FieldName;
      (errors[field] ??= []).push(issue.message);
    }
    return {
      ok: false,
      state: {
        message: "Please fix the highlighted fields.",
        errors,
        values: { ...raw, stakeBusiness: raw.stakeBusiness ? "on" : "" },
      },
    };
  }

  const f = result.data;
  return {
    ok: true,
    meeting: {
      date: f.date,
      meetingType: f.meetingType as MeetingType,
      presiding: f.presiding,
      conducting: f.conducting,
      announcements: toLines(f.announcements),
      openingHymn: { number: f.openingHymnNumber, title: f.openingHymnTitle },
      openingPrayer: f.openingPrayer,
      wardBusiness: toLines(f.wardBusiness).map((description) => ({ description })),
      stakeBusiness: f.stakeBusiness,
      sacramentHymn: { number: f.sacramentHymnNumber, title: f.sacramentHymnTitle },
      speakers: toLines(f.speakers).map((line) => parseSpeakerLine(line) as SpeakerItem),
      closingHymn: { number: f.closingHymnNumber, title: f.closingHymnTitle },
      closingPrayer: f.closingPrayer,
    },
  };
}

// Postgres error 23505 = unique_violation (the meetings.date column is UNIQUE).
function isDuplicateDate(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

function duplicateDateState(formData: FormData): MeetingFormState {
  const raw = readForm(formData);
  return {
    message: "Please fix the highlighted fields.",
    errors: { date: ["A meeting already exists on this date."] },
    values: { ...raw, stakeBusiness: raw.stakeBusiness ? "on" : "" },
  };
}

// ---------- Server Actions ----------

// Never trust the client: pages hide these buttons from signed-out visitors,
// but anyone can still send a request straight to a Server Action, so each
// action checks for a signed-in bishopric member before touching the database.
async function requireSignedIn(): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/login");
}

export async function createMeeting(
  prevState: MeetingFormState,
  formData: FormData,
): Promise<MeetingFormState> {
  await requireSignedIn();
  const checked = validate(formData);
  if (!checked.ok) return checked.state;

  try {
    await addMeeting(checked.meeting);
  } catch (error) {
    if (isDuplicateDate(error)) return duplicateDateState(formData);
    console.error("createMeeting failed:", error);
    throw new Error("We couldn't save the meeting. Please try again.");
  }

  // Outside try/catch: redirect() works by throwing a special signal.
  revalidatePath("/meetings");
  redirect("/meetings");
}

export async function updateMeeting(
  id: number,
  prevState: MeetingFormState,
  formData: FormData,
): Promise<MeetingFormState> {
  await requireSignedIn();
  const checked = validate(formData);
  if (!checked.ok) return checked.state;

  let updated;
  try {
    updated = await updateMeetingInDb(id, checked.meeting);
  } catch (error) {
    if (isDuplicateDate(error)) return duplicateDateState(formData);
    console.error(`updateMeeting(${id}) failed:`, error);
    throw new Error("We couldn't update the meeting. Please try again.");
  }

  if (!updated) {
    return { message: "This meeting no longer exists.", errors: {} };
  }

  revalidatePath("/meetings");
  revalidatePath(`/meetings/${id}`);
  redirect(`/meetings/${id}`);
}

export async function deleteMeeting(id: number): Promise<void> {
  await requireSignedIn();
  try {
    await deleteMeetingFromDb(id);
  } catch (error) {
    console.error(`deleteMeeting(${id}) failed:`, error);
    throw new Error("We couldn't delete the meeting. Please try again.");
  }

  revalidatePath("/meetings");
  redirect("/meetings");
}
