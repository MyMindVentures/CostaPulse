"use client";

import { useMemo, useState, useTransition } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  availabilityCtaTypes,
  availabilityEntryTypes,
  availabilityStatuses
} from "@/lib/view-models/team-member-availability";
import {
  bulkBlockTeamMemberDateRangeAction,
  deleteTeamMemberAvailabilityAction,
  saveTeamMemberAvailabilityAction,
  setTeamMemberAvailabilityVisibilityAction
} from "@/server/availability/actions";
import type { AdminCalendarItem } from "@/server/admin/schemas";
import type {
  AdminAvailabilityReferenceData,
  AdminAvailabilityRow
} from "@/server/repositories/admin-availability";

type Props = {
  entries: AdminAvailabilityRow[];
  reference: AdminAvailabilityReferenceData;
  overlays: AdminCalendarItem[];
};

function optional(formData: FormData, name: string): string | null {
  return String(formData.get(name) ?? "").trim() || null;
}

function toIso(value: FormDataEntryValue | null): string {
  const date = new Date(String(value ?? ""));
  return date.toISOString();
}

function localInput(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 16);
}

export function TeamMemberAvailabilityManager({
  entries,
  reference,
  overlays
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const editing = entries.find((entry) => entry.id === editingId) ?? null;
  const initialTeamMemberId =
    editing?.team_member_id ?? reference.teamMembers[0]?.id ?? "";
  const initialEntryType = editing?.entry_type ?? "manual_availability";
  const initialExperienceId = editing?.experience_id ?? "";
  const [experienceId, setExperienceId] = useState(initialExperienceId);
  const variants = useMemo(
    () =>
      reference.variants.filter(
        (variant) => variant.experienceId === experienceId
      ),
    [experienceId, reference.variants]
  );

  function submit(formData: FormData) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await saveTeamMemberAvailabilityAction({
        id: editing?.id ?? null,
        team_member_id: String(formData.get("team_member_id") ?? ""),
        professional_service_id: optional(formData, "professional_service_id"),
        experience_id: optional(formData, "experience_id"),
        experience_variant_id: optional(formData, "experience_variant_id"),
        availability_slot_id: null,
        entry_type: String(
          formData.get("entry_type") ?? "manual_availability"
        ) as (typeof availabilityEntryTypes)[number],
        status: String(
          formData.get("status") ?? "available"
        ) as (typeof availabilityStatuses)[number],
        starts_at: toIso(formData.get("starts_at")),
        ends_at: toIso(formData.get("ends_at")),
        timezone: String(formData.get("timezone") ?? ""),
        is_all_day: formData.get("is_all_day") === "on",
        public_title: optional(formData, "public_title"),
        public_summary: optional(formData, "public_summary"),
        public_location_label: optional(formData, "public_location_label"),
        location_id: optional(formData, "location_id"),
        geographic_scope: optional(formData, "geographic_scope"),
        travel_available: formData.get("travel_available") === "on",
        capacity_total: optional(formData, "capacity_total")
          ? Number(formData.get("capacity_total"))
          : null,
        capacity_reserved: Number(formData.get("capacity_reserved") ?? 0),
        visibility: String(formData.get("visibility") ?? "public") as
          | "public"
          | "authenticated"
          | "private",
        cta_type: (optional(formData, "cta_type") ??
          "none") as (typeof availabilityCtaTypes)[number],
        cta_path: optional(formData, "cta_path"),
        internal_notes: optional(formData, "internal_notes"),
        metadata: {}
      });
      if (result.ok) {
        setMessage(editing ? "Availability updated" : "Availability created");
        setEditingId(null);
      } else {
        setError(result.message);
      }
    });
  }

  function remove(id: string) {
    if (!window.confirm("Delete this availability entry?")) return;
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await deleteTeamMemberAvailabilityAction(id);
      if (result.ok) setMessage("Availability deleted");
      else setError(result.message);
    });
  }

  function bulkBlock(formData: FormData) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await bulkBlockTeamMemberDateRangeAction({
        team_member_id: String(formData.get("team_member_id") ?? ""),
        start_date: String(formData.get("start_date") ?? ""),
        end_date: String(formData.get("end_date") ?? ""),
        timezone: String(formData.get("timezone") ?? "Europe/Madrid"),
        public_title: String(formData.get("public_title") ?? ""),
        internal_notes: optional(formData, "internal_notes"),
        visibility: String(formData.get("visibility") ?? "private") as
          | "public"
          | "authenticated"
          | "private"
      });
      if (result.ok) setMessage("Date range blocked");
      else setError(result.message);
    });
  }

  function toggleVisibility(entry: AdminAvailabilityRow) {
    startTransition(async () => {
      const result = await setTeamMemberAvailabilityVisibilityAction(
        entry.id,
        entry.visibility === "public" ? "private" : "public"
      );
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <div className="grid gap-6">
      <form
        key={editing?.id ?? "new"}
        action={submit}
        className="border-border bg-card grid gap-4 rounded-[var(--radius)] border p-5 md:grid-cols-2 xl:grid-cols-3"
      >
        <div className="md:col-span-2 xl:col-span-3">
          <h2 className="text-ink text-xl font-semibold">
            {editing ? "Edit availability" : "Create availability"}
          </h2>
          <p className="text-muted mt-1 text-sm">
            Public copy and internal notes are stored separately.
          </p>
        </div>
        <SelectField
          name="team_member_id"
          label="Team member"
          defaultValue={initialTeamMemberId}
          options={reference.teamMembers.map((item) => ({
            value: item.id,
            label: item.name
          }))}
        />
        <SelectField
          name="entry_type"
          label="Entry type"
          defaultValue={initialEntryType}
          options={availabilityEntryTypes.map((value) => ({
            value,
            label: value
          }))}
        />
        <SelectField
          name="status"
          label="Status"
          defaultValue={editing?.status ?? "available"}
          options={availabilityStatuses.map((value) => ({
            value,
            label: value
          }))}
        />
        <SelectField
          name="professional_service_id"
          label="Professional service"
          defaultValue={editing?.professional_service_id ?? ""}
          optional
          options={reference.professionalServices.map((item) => ({
            value: item.id,
            label: item.title
          }))}
        />
        <SelectField
          name="experience_id"
          label="Experience"
          defaultValue={initialExperienceId}
          onChange={(event) => setExperienceId(event.target.value)}
          optional
          options={reference.experiences.map((item) => ({
            value: item.id,
            label: item.title
          }))}
        />
        <SelectField
          name="experience_variant_id"
          label="Experience variant"
          defaultValue={editing?.experience_variant_id ?? ""}
          optional
          options={variants.map((item) => ({
            value: item.id,
            label: item.name
          }))}
        />
        <Field
          name="starts_at"
          label="Starts"
          type="datetime-local"
          defaultValue={localInput(editing?.starts_at)}
          required
        />
        <Field
          name="ends_at"
          label="Ends"
          type="datetime-local"
          defaultValue={localInput(editing?.ends_at)}
          required
        />
        <Field
          name="timezone"
          label="Timezone"
          defaultValue={editing?.timezone ?? "Europe/Madrid"}
          required
        />
        <Field
          name="public_title"
          label="Public title"
          defaultValue={editing?.public_title ?? ""}
        />
        <Field
          name="public_location_label"
          label="Public location"
          defaultValue={editing?.public_location_label ?? ""}
        />
        <Field
          name="geographic_scope"
          label="Geographic scope"
          defaultValue={editing?.geographic_scope ?? ""}
        />
        <SelectField
          name="location_id"
          label="Location record"
          defaultValue=""
          optional
          options={reference.locations.map((item) => ({
            value: item.id,
            label: item.name
          }))}
        />
        <Field
          name="capacity_total"
          label="Capacity total"
          type="number"
          defaultValue={editing?.capacity_total?.toString() ?? ""}
        />
        <Field
          name="capacity_reserved"
          label="Capacity reserved"
          type="number"
          defaultValue={editing?.capacity_reserved.toString() ?? "0"}
          required
        />
        <SelectField
          name="visibility"
          label="Visibility"
          defaultValue={editing?.visibility ?? "public"}
          options={["public", "authenticated", "private"].map((value) => ({
            value,
            label: value
          }))}
        />
        <SelectField
          name="cta_type"
          label="CTA type"
          defaultValue={editing?.cta_type ?? "none"}
          options={availabilityCtaTypes.map((value) => ({
            value,
            label: value
          }))}
        />
        <Field
          name="cta_path"
          label="CTA path"
          defaultValue={editing?.cta_path ?? ""}
        />
        <label className="grid gap-1 md:col-span-2 xl:col-span-3">
          <Label htmlFor="availability-public-summary">Public summary</Label>
          <Textarea
            id="availability-public-summary"
            name="public_summary"
            defaultValue={editing?.public_summary ?? ""}
          />
        </label>
        <label className="grid gap-1 md:col-span-2 xl:col-span-3">
          <Label htmlFor="availability-internal-notes">Internal notes</Label>
          <Textarea
            id="availability-internal-notes"
            name="internal_notes"
            defaultValue={editing?.internal_notes ?? ""}
          />
        </label>
        <div className="flex flex-wrap gap-5 md:col-span-2 xl:col-span-3">
          <Checkbox
            name="is_all_day"
            label="All day"
            defaultChecked={editing?.is_all_day}
          />
          <Checkbox
            name="travel_available"
            label="Travel available"
            defaultChecked={editing?.travel_available}
          />
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-3">
          <Button type="submit" disabled={pending}>
            {editing ? "Update entry" : "Create entry"}
          </Button>
          {editing ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingId(null)}
            >
              Cancel edit
            </Button>
          ) : null}
        </div>
      </form>

      <form
        action={bulkBlock}
        className="border-border bg-card grid gap-4 rounded-[var(--radius)] border p-5 md:grid-cols-2 xl:grid-cols-4"
      >
        <div className="md:col-span-2 xl:col-span-4">
          <h2 className="text-ink text-xl font-semibold">Bulk block dates</h2>
          <p className="text-muted mt-1 text-sm">
            Create one all-day block per date. The server rejects overlapping
            entries before writing the range.
          </p>
        </div>
        <SelectField
          name="team_member_id"
          label="Team member"
          defaultValue={reference.teamMembers[0]?.id ?? ""}
          options={reference.teamMembers.map((item) => ({
            value: item.id,
            label: item.name
          }))}
        />
        <Field name="start_date" label="First date" type="date" required />
        <Field name="end_date" label="Last date" type="date" required />
        <Field
          name="timezone"
          label="Timezone"
          defaultValue="Europe/Madrid"
          required
        />
        <Field name="public_title" label="Public title" required />
        <SelectField
          name="visibility"
          label="Visibility"
          defaultValue="private"
          options={["public", "authenticated", "private"].map((value) => ({
            value,
            label: value
          }))}
        />
        <label className="grid gap-1 md:col-span-2">
          <Label htmlFor="availability-bulk-internal-notes">
            Internal notes
          </Label>
          <Textarea
            id="availability-bulk-internal-notes"
            name="internal_notes"
          />
        </label>
        <div className="md:col-span-2 xl:col-span-4">
          <Button type="submit" disabled={pending}>
            Block date range
          </Button>
        </div>
      </form>

      {message ? (
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="border-border bg-card rounded-[var(--radius)] border p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-ink font-semibold">
                  {entry.public_title ?? entry.entry_type}
                </h2>
                <p className="text-muted mt-1 text-sm">
                  {new Date(entry.starts_at).toLocaleString()} –{" "}
                  {new Date(entry.ends_at).toLocaleString()}
                </p>
                <p className="text-muted mt-1 text-sm">
                  {entry.status} · {entry.visibility}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(entry.id);
                    setExperienceId(entry.experience_id ?? "");
                  }}
                  disabled={pending}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toggleVisibility(entry)}
                  disabled={pending}
                >
                  {entry.visibility === "public" ? "Unpublish" : "Publish"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => remove(entry.id)}
                  disabled={pending}
                >
                  Delete
                </Button>
              </div>
            </div>
          </article>
        ))}
        {entries.length === 0 ? (
          <p className="border-border bg-card text-muted rounded-[var(--radius)] border p-6 text-center">
            No team availability entries in this range.
          </p>
        ) : null}
      </div>

      <section className="grid gap-3">
        <div>
          <h2 className="text-ink text-xl font-semibold">
            Experience booking and assignment overlays
          </h2>
          <p className="text-muted mt-1 text-sm">
            Server-derived experience slots, reserved capacity, and assigned
            team members remain read-only here.
          </p>
        </div>
        {overlays.map((overlay) => (
          <article
            key={overlay.availability_slot_id}
            className="border-border bg-card rounded-[var(--radius)] border p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-ink font-semibold">
                  {overlay.experience_title ?? "Experience"}
                </h3>
                <p className="text-muted mt-1 text-sm">
                  {new Date(overlay.starts_at).toLocaleString()} –{" "}
                  {new Date(overlay.ends_at).toLocaleString()}
                </p>
                <p className="text-muted mt-1 text-sm">
                  {overlay.capacity_reserved} reserved ·{" "}
                  {overlay.capacity_available} available ·{" "}
                  {overlay.assigned_team?.length ?? 0} assigned
                </p>
              </div>
              <span className="text-ink text-sm font-semibold">
                {overlay.status}
              </span>
            </div>
          </article>
        ))}
        {overlays.length === 0 ? (
          <p className="border-border bg-card text-muted rounded-[var(--radius)] border p-6 text-center">
            No experience overlays in this range.
          </p>
        ) : null}
      </section>
    </div>
  );
}

function Field({
  name,
  label,
  ...props
}: React.ComponentProps<typeof Input> & { name: string; label: string }) {
  const id = `availability-${name}`;
  return (
    <label className="grid gap-1">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} className="min-h-11" {...props} />
    </label>
  );
}

function SelectField({
  name,
  label,
  options,
  optional,
  defaultValue,
  onChange
}: {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  optional?: boolean;
  defaultValue: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}) {
  const id = `availability-${name}`;
  return (
    <label className="grid gap-1">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        onChange={onChange}
        className="border-input bg-card min-h-11 rounded-md border px-3"
      >
        {optional ? <option value="">None</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex min-h-11 items-center gap-2">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-5"
      />
      {label}
    </label>
  );
}
