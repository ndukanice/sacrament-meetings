"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { MeetingFormState } from "@/lib/actions";
import type { SacramentMeeting } from "@/lib/types";

type FieldName = keyof NonNullable<MeetingFormState["values"]>;

type MeetingFormProps = {
  // A Server Action: createMeeting, or updateMeeting.bind(null, id).
  action: (prevState: MeetingFormState, formData: FormData) => Promise<MeetingFormState>;
  meeting?: SacramentMeeting; // present when editing
  submitLabel: string;
  cancelHref: string;
};

const initialState: MeetingFormState = { message: null, errors: {} };

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 aria-invalid:border-red-700";

// Turns a saved meeting into the text the form fields show.
function meetingToValues(meeting?: SacramentMeeting): Partial<Record<FieldName, string>> {
  if (!meeting) return {};
  return {
    date: meeting.date,
    meetingType: meeting.meetingType,
    presiding: meeting.presiding,
    conducting: meeting.conducting,
    announcements: (meeting.announcements ?? []).join("\n"),
    openingHymnNumber: String(meeting.openingHymn.number),
    openingHymnTitle: meeting.openingHymn.title,
    openingPrayer: meeting.openingPrayer,
    wardBusiness: meeting.wardBusiness.map((item) => item.description).join("\n"),
    stakeBusiness: meeting.stakeBusiness ? "on" : "",
    sacramentHymnNumber: String(meeting.sacramentHymn.number),
    sacramentHymnTitle: meeting.sacramentHymn.title,
    speakers: meeting.speakers
      .map((s) => {
        const prefix = s.type === "musical-number" ? "Music: " : "";
        return s.topic ? `${prefix}${s.name} | ${s.topic}` : `${prefix}${s.name}`;
      })
      .join("\n"),
    closingHymnNumber: String(meeting.closingHymn.number),
    closingHymnTitle: meeting.closingHymn.title,
    closingPrayer: meeting.closingPrayer,
  };
}

export function MeetingForm({ action, meeting, submitLabel, cancelHref }: MeetingFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  // After a failed submit, show what the user typed; otherwise the saved meeting.
  const values = state.values ?? meetingToValues(meeting);

  // Shared props that connect an input to its label and error message.
  const field = (name: FieldName) => ({
    id: name,
    name,
    defaultValue: values[name] ?? "",
    "aria-invalid": state.errors[name] ? true : undefined,
    "aria-describedby": `${name}-error`,
    className: inputClasses,
  });

  return (
    // The key remounts the fields after a failed submit so they show the returned values.
    <form key={JSON.stringify(state.values ?? {})} action={formAction} noValidate className="space-y-8">
      <Fieldset legend="Meeting details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date" name="date" errors={state.errors.date}>
            <input type="date" {...field("date")} />
          </Field>
          <Field label="Meeting type" name="meetingType" errors={state.errors.meetingType}>
            <select {...field("meetingType")}>
              <option value="">Choose a type…</option>
              <option value="regular">Regular</option>
              <option value="testimony">Testimony</option>
              <option value="stake">Stake (non-sacrament)</option>
              <option value="general">General (non-sacrament)</option>
              <option value="special">Special</option>
            </select>
          </Field>
          <Field label="Presiding" name="presiding" errors={state.errors.presiding}>
            <input type="text" {...field("presiding")} />
          </Field>
          <Field label="Conducting" name="conducting" errors={state.errors.conducting}>
            <input type="text" {...field("conducting")} />
          </Field>
        </div>
        <Field label="Announcements" name="announcements" hint="One per line." errors={state.errors.announcements}>
          <textarea rows={3} {...field("announcements")} />
        </Field>
      </Fieldset>

      <Fieldset legend="Opening">
        <HymnFields prefix="opening" label="Opening hymn" state={state} field={field} />
        <Field label="Opening prayer" name="openingPrayer" errors={state.errors.openingPrayer}>
          <input type="text" {...field("openingPrayer")} />
        </Field>
      </Fieldset>

      <Fieldset legend="Business">
        <Field label="Ward business" name="wardBusiness" hint="One item per line." errors={state.errors.wardBusiness}>
          <textarea rows={3} {...field("wardBusiness")} />
        </Field>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="stakeBusiness"
            name="stakeBusiness"
            defaultChecked={values.stakeBusiness === "on"}
            className="h-5 w-5 rounded border-slate-300"
          />
          <label htmlFor="stakeBusiness" className="font-medium text-slate-900">
            Stake business will be conducted
          </label>
        </div>
      </Fieldset>

      <Fieldset legend="Sacrament">
        <HymnFields prefix="sacrament" label="Sacrament hymn" state={state} field={field} />
      </Fieldset>

      <Fieldset legend="Speakers and musical numbers">
        <Field
          label="Program, in order"
          name="speakers"
          hint={'One per line: "Sister Clark | Gratitude" for a speaker, or "Music: Ward Choir | I Need Thee" for a musical number.'}
          errors={state.errors.speakers}
        >
          <textarea rows={5} {...field("speakers")} />
        </Field>
      </Fieldset>

      <Fieldset legend="Closing">
        <HymnFields prefix="closing" label="Closing hymn" state={state} field={field} />
        <Field label="Closing prayer" name="closingPrayer" errors={state.errors.closingPrayer}>
          <input type="text" {...field("closingPrayer")} />
        </Field>
      </Fieldset>

      {/* Form-level message, announced by screen readers when it changes. */}
      <div aria-live="polite" role="status">
        {state.message && (
          <p className="rounded-lg bg-red-50 px-4 py-3 font-medium text-red-700">{state.message}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
        <Link href={cancelHref} className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <legend className="px-2 text-lg font-semibold text-slate-900">{legend}</legend>
      {children}
    </fieldset>
  );
}

// A label, the input (children), an optional hint, and an always-present
// error container (aria-live) that the input points to with aria-describedby.
function Field({
  label,
  name,
  hint,
  errors,
  children,
}: {
  label: string;
  name: FieldName;
  hint?: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block font-medium text-slate-900">
        {label}
      </label>
      {hint && <p className="mb-1 text-sm text-slate-600">{hint}</p>}
      {children}
      <div id={`${name}-error`} aria-live="polite" aria-atomic="true">
        {errors?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-700">
            {error}
          </p>
        ))}
      </div>
    </div>
  );
}

function HymnFields({
  prefix,
  label,
  state,
  field,
}: {
  prefix: "opening" | "sacrament" | "closing";
  label: string;
  state: MeetingFormState;
  field: (name: FieldName) => object;
}) {
  const numberName = `${prefix}HymnNumber` as FieldName;
  const titleName = `${prefix}HymnTitle` as FieldName;
  return (
    <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
      <Field label={`${label} number`} name={numberName} errors={state.errors[numberName]}>
        <input type="text" inputMode="numeric" {...field(numberName)} />
      </Field>
      <Field label={`${label} title`} name={titleName} errors={state.errors[titleName]}>
        <input type="text" {...field(titleName)} />
      </Field>
    </div>
  );
}
